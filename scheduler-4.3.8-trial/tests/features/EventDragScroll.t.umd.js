"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    var _scheduler;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });

  function isMaxYScroll(element) {
    // element.scrollTop is 0 for safari but visually is correct
    const scrollTop = Math.max(scheduler.bodyContainer.offsetTop, element.scrollTop);
    return element.scrollHeight - scrollTop - element.clientHeight <= 1;
  }

  function isMaxXScroll(element) {
    return element.scrollWidth - element.scrollLeft - element.clientWidth <= 1;
  }

  t.it('Should scroll when dragging event (horizontal first)', async t => {
    scheduler = await t.getSchedulerAsync({
      height: 300,
      width: 300,
      events: [{
        id: 1,
        resourceId: 'r2',
        startDate: '2011-01-03',
        endDate: '2011-01-04'
      }],
      features: {
        eventResize: false
      }
    });
    await t.waitForSelector('.b-sch-event');
    const horizontalScrollable = scheduler.timeAxisSubGrid.scrollable.element,
          verticalScrollable = scheduler.scrollable.element;
    await t.dragTo({
      source: '.b-sch-event',
      sourceOffset: ['100%-1', '100%-1'],
      target: verticalScrollable,
      targetOffset: ['100%-30', '50%'],
      dragOnly: true
    });
    await t.waitFor({
      method: () => isMaxXScroll(horizontalScrollable),
      description: 'Scrolled to the right edge'
    });
    await t.moveMouseTo({
      target: verticalScrollable,
      offset: ['100%-30', '100%']
    });
    await t.waitFor({
      method: () => isMaxYScroll(verticalScrollable, t),
      description: 'Scrolled to the bottom edge'
    });
    const eventBox = t.rect('.b-sch-event'),
          horizontalBox = t.rect(horizontalScrollable);
    t.isApprox(eventBox.right, horizontalBox.right, 50, 'Event right coordinate is ok');
    t.isApprox(eventBox.bottom, horizontalBox.bottom, 50, 'Event bottom coordinate is ok');
    await t.mouseUp();
    t.is(scheduler.eventStore.first.resourceId, 'r6', 'Resource is correct');
    t.isGreater(scheduler.eventStore.first.startDate, new Date(2011, 0, 11), 'Start date is ok');
  });
  t.it('Should scroll when dragging event (vertical first)', async t => {
    scheduler = await t.getSchedulerAsync({
      height: 300,
      width: 300,
      events: [{
        id: 1,
        resourceId: 'r2',
        startDate: '2011-01-03',
        endDate: '2011-01-04'
      }],
      features: {
        eventResize: false
      }
    });
    await t.waitForSelector('.b-sch-event');
    const horizontalScrollable = scheduler.timeAxisSubGrid.scrollable.element,
          verticalScrollable = scheduler.scrollable.element;
    await t.dragTo({
      source: '.b-sch-event',
      sourceOffset: ['100%-1', '100%-1'],
      target: verticalScrollable,
      targetOffset: ['60%', '100%'],
      dragOnly: true
    });
    await t.waitFor({
      method: () => isMaxYScroll(verticalScrollable),
      description: 'Scrolled to the bottom edge'
    });
    await t.moveMouseTo({
      target: verticalScrollable,
      offset: ['100%-30', '100%']
    });
    await t.waitFor({
      method: () => isMaxXScroll(horizontalScrollable),
      description: 'Scrolled to the right edge'
    });
    const eventBox = t.rect('.b-sch-event'),
          horizontalBox = t.rect(horizontalScrollable);
    t.isApprox(eventBox.right, horizontalBox.right, 50, 'Event right coordinate is ok');
    t.isApprox(eventBox.bottom, horizontalBox.bottom, 50, 'Event bottom coordinate is ok');
    await t.mouseUp();
    t.is(scheduler.eventStore.first.resourceId, 'r6', 'Resource is correct');
    t.isGreater(scheduler.eventStore.first.startDate, new Date(2011, 0, 11), 'Start date is ok');
  });
});