"use strict";

StartTest(t => {
  let scheduler; // async beforeEach doesn't work in umd

  t.beforeEach(async (t, next) => {
    scheduler && scheduler.destroy();
    scheduler = await t.getVerticalSchedulerAsync();
    next();
  });

  function assertEventElement(t, eventId, top = null, left, width, height, msg = `for event ${eventId}`) {
    const selector = `[data-event-id="${eventId}"]:not(.b-released)`;

    if (top === null) {
      t.selectorNotExists(selector, 'Element not found');
    } else {
      const element = document.querySelector(selector);
      t.ok(element, `Element found ${msg}`);
      const box = Rectangle.from(element, scheduler.timeAxisSubGridElement);
      t.is(box.top, top, 'Correct top');
      t.is(box.left, left, 'Correct left');
      t.is(box.width, width, 'Correct width');
      t.is(box.height, height, 'Correct height');
      t.contentLike(element, `Event ${eventId}`, 'Correct text');
    }
  }

  t.it('Should display resize handles on hover', t => {
    function assertHandles(el, msg) {
      t.diag(msg); // detect pseudo elements used for resize handles

      const startHandle = window.getComputedStyle(el, ':before');
      t.is(startHandle.height, '4px', 'startHandle.height correct');
      t.is(startHandle.borderTopWidth, '1px', 'startHandle.borderTopWidth correct');
      t.is(startHandle.borderBottomWidth, '1px', 'startHandle.borderBottomWidth correct');
      const endHandle = window.getComputedStyle(el, ':after');
      t.is(endHandle.height, '4px', 'endHandle.height correct');
      t.is(endHandle.borderTopWidth, '1px', 'endHandle.borderTopWidth correct');
      t.is(endHandle.borderBottomWidth, '1px', 'endHandle.borderBottomWidth correct');
    }

    const el = document.querySelector('.b-sch-event');
    t.chain({
      moveMouseTo: el
    }, next => {
      assertHandles(el, 'Hovering event');
      next();
    }, {
      moveMouseTo: '.b-sch-event',
      offset: ['50%', 3]
    }, next => {
      assertHandles(el, 'Hovering handle');
      next();
    }, {
      drag: '.b-sch-event',
      offset: ['50%', 3],
      by: [0, -20],
      dragOnly: true
    }, next => {
      assertHandles(el, 'Dragging handle');
      next();
    }, {
      moveMouseBy: [100, -10]
    }, next => {
      assertHandles(el, 'Dragging handle outside of event');
      next();
    }, {
      mouseUp: null
    });
  });
  t.it('Basic resize', t => {
    t.chain({
      drag: '[data-event-id="1"]',
      offset: ['50%', '100%-3'],
      by: [0, 100],
      desc: 'Dragging bottom edge down'
    }, next => {
      assertEventElement(t, 1, 100, 0, 75, 200);
      t.is(scheduler.eventStore.first.startDate, new Date(2019, 4, 28), 'Start date not updated');
      t.is(scheduler.eventStore.first.endDate, new Date(2019, 5, 1), 'End date updated correctly');
      next();
    }, {
      moveMouseBy: [0, 20]
    }, // It misses the handle otherwise
    {
      drag: '[data-event-id="1"]',
      offset: ['50%', '100%-3'],
      by: [0, -150],
      desc: 'Dragging bottom edge up'
    }, next => {
      assertEventElement(t, 1, 100, 0, 150, 50);
      assertEventElement(t, 2, 150, 0, 150, 200);
      t.is(scheduler.eventStore.first.startDate, new Date(2019, 4, 28), 'Start date not updated');
      t.is(scheduler.eventStore.first.endDate, new Date(2019, 4, 29), 'End date updated correctly');
      next();
    }, {
      drag: '[data-event-id="2"]',
      offset: [10, 3],
      by: [0, -50],
      desc: 'Dragging top edge up'
    }, () => {
      assertEventElement(t, 1, 100, 75, 75, 50);
      assertEventElement(t, 2, 100, 0, 75, 250);
      t.is(scheduler.eventStore.getById(2).startDate, new Date(2019, 4, 28), 'Start date not updated');
      t.is(scheduler.eventStore.getById(2).endDate, new Date(2019, 5, 2), 'End date updated correctly');
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/8946

  t.it('Should not start drag operation', async t => {
    scheduler.viewPreset = 'hourAndDay';
    scheduler.barMargin = 50;
    scheduler.events = [{
      startDate: scheduler.startDate,
      duration: 1,
      durationUnit: 'h',
      resourceId: 'r2',
      name: '<div><br>bar<br>foo<br>bar</div>'
    }];
    t.firesOnce(scheduler, 'eventresizestart');
    t.wontFire(scheduler, 'eventdragstart');
    await scheduler.scrollToTop();
    t.chain({
      drag: '.b-sch-event',
      offset: ['50%', '100%-3'],
      by: [0, 50],
      desc: 'Dragging bottom edge down'
    });
  });
});