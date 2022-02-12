"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    scheduler && scheduler.destroy();
    document.body.innerHTML = '';
  });

  function assertEventElement(t, eventId, top = null, left, width, height, msg = '') {
    const selector = `[data-event-id="${eventId}"]:not(.b-released)`;

    if (top === null) {
      t.selectorNotExists(selector, 'Element not found');
    } else {
      const element = document.querySelector(selector);
      t.ok(element, `Element found ${msg}`);
      const box = Rectangle.from(element, scheduler.timeAxisSubGridElement);
      t.isApprox(box.top, top, 0.1, 'Correct top');
      t.is(box.left, left, 'Correct left');
      t.is(box.width, width, 'Correct width');
      t.is(box.height, height, 'Correct height');
      t.contentLike(element, `Event ${eventId}`, 'Correct text');
    }
  }

  t.it('Valid drag', async t => {
    scheduler = await t.getVerticalSchedulerAsync();
    t.chain({
      drag: '[data-event-id="1"]',
      by: [150, 0],
      desc: 'Dragging right'
    }, next => {
      assertEventElement(t, 1, 100, 150, 150, 100);
      assertEventElement(t, 2, 150, 0, 150, 200);
      next();
    }, {
      drag: '[data-event-id="1"]',
      by: [0, 200],
      desc: 'Dragging down'
    }, next => {
      assertEventElement(t, 1, 300, 225, 75, 100);
      assertEventElement(t, 3, 300, 150, 75, 200);
      next();
    });
  });
  t.it('Drag triggering scroll', async t => {
    scheduler = await t.getVerticalSchedulerAsync();
    const element = scheduler.getElementFromEventRecord(scheduler.eventStore.first);
    t.chain({
      drag: '[data-event-id="1"]',
      to: '.b-grid-body-container',
      toOffset: [200, '100%-10'],
      desc: 'Dragging far down',
      dragOnly: true
    }, {
      waitFor: () => scheduler.scrollTop > 400
    }, next => {
      t.ok(element.parentElement.retainElement, 'Flagged with retainElement');
      t.ok(element.parentElement.classList.contains('b-dragging'), 'Styled as drag proxy');
      next();
    }, {
      waitFor: () => scheduler.scrollTop > 700
    }, next => {
      t.ok(element.parentElement.retainElement, 'Flagged with retainElement');
      t.ok(element.parentElement.classList.contains('b-dragging'), 'Styled as drag proxy');
      next();
    }, {
      mouseUp: null
    }, () => {
      const element = scheduler.getElementFromEventRecord(scheduler.eventStore.first);
      t.ok(element, 'Element found');
      t.notOk(element.parentElement.retainElement, 'Not flagged with retainElement');
      t.notOk(element.parentElement.classList.contains('b-dragging'), 'Not styled as drag proxy');
    });
  });
  t.it('Multi drag', async t => {
    scheduler = await t.getVerticalSchedulerAsync({
      multiEventSelect: true
    });
    const event1 = scheduler.eventStore.getById(1),
          event2 = scheduler.eventStore.getById(2);
    t.chain(next => {
      t.ok(event1.resource === scheduler.resourceStore.getAt(0));
      t.ok(event2.resource === scheduler.resourceStore.getAt(0));
      next();
    }, {
      click: '[data-event-id="1"]'
    }, {
      click: '[data-event-id="2"]',
      options: {
        ctrlKey: true
      }
    }, next => {
      t.is(scheduler.selectedEvents.length, 2);
      next();
    }, {
      drag: '[data-event-id="2"]',
      by: [200, 0],
      desc: 'Dragging right'
    }, () => {
      assertEventElement(t, 1, 100, 300, 75, 100);
      assertEventElement(t, 2, 150, 375, 75, 200);
      t.ok(event1.resource === scheduler.resourceStore.getAt(2));
      t.ok(event2.resource === scheduler.resourceStore.getAt(2));
    });
  });
  t.it('Should support constrainDragToResource', async t => {
    scheduler = await t.getVerticalSchedulerAsync({
      features: {
        eventDrag: {
          constrainDragToResource: true
        }
      }
    });
    t.wontFire(scheduler.eventStore, 'change');
    t.chain({
      drag: '[data-event-id="2"]',
      by: [150, 0],
      desc: 'Dragging right'
    });
  });
  t.it('Multi drag including events below the rendered block', async t => {
    scheduler = await t.getVerticalSchedulerAsync({
      multiEventSelect: true,
      endDate: new Date(2019, 6, 30)
    });
    const event1 = scheduler.eventStore.getById(1),
          event1001 = scheduler.eventStore.getById(1001);
    t.chain(() => scheduler.scrollEventIntoView(event1001), {
      click: '[data-event-id="1001"]'
    }, () => scheduler.scrollEventIntoView(event1), {
      click: '[data-event-id="1"]',
      options: {
        ctrlKey: true
      }
    }, next => {
      t.is(scheduler.selectedEvents.length, 2);
      next();
    }, // https://github.com/bryntum/support/issues/120 threw on start drag
    {
      drag: '[data-event-id="1"]',
      by: [200, 0],
      desc: 'Dragging right'
    }, next => {
      // Element snap into position under "Resource 2"
      assertEventElement(t, 1, 100, 150, 150, 100); // The one way down outside the tendered block is no longer there

      assertEventElement(t, 1001, null); // Elements are correctly assigned to "Resource 2"

      t.ok(event1.resource === scheduler.resourceStore.getAt(1), 'Event correctly assigned to "Resource 2"');
      t.ok(event1001.resource === scheduler.resourceStore.getAt(1), 'Event correctly assigned to "Resource 2"');
    });
  }); // https://github.com/bryntum/support/issues/1009

  t.it('Should work on scrolled page', async t => {
    document.body.innerHTML = '<div style="height : 1000px"></div><div id="container"></div>';
    scheduler = await t.getVerticalSchedulerAsync({
      appendTo: 'container',
      width: 1024,
      height: 768
    });
    window.scroll(0, 500);
    const [event1, event2] = scheduler.eventStore;
    t.chain({
      drag: '[data-event-id="1"]',
      by: [150, 0]
    }, async () => {
      t.is(event1.resourceId, 'r2', 'Horizontal drag worked');
    }, // Use offset to avoid going into scroll area by mistake
    {
      drag: '[data-event-id="2"]',
      by: [0, -50],
      offset: ['50%', '80%']
    }, () => {
      t.is(event2.startDate, new Date(2019, 4, 28), 'Vertical drag worked');
    });
  });
});