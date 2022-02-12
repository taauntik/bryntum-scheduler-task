"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    scheduler && scheduler.destroy();
  });

  async function createScheduler(config = {}) {
    scheduler = await t.getVerticalSchedulerAsync(config);
  }

  function assertEventElement(t, eventId, x = null, y, width, height, msg = '') {
    const selector = `[data-event-id="${eventId}"]:not(.b-released)`;

    if (x === null) {
      t.selectorNotExists(selector, 'Element not found ' + msg);
    } else {
      const element = document.querySelector(selector);
      t.ok(element, 'Element found ' + msg);
      const box = Rectangle.from(element, scheduler.timeAxisSubGridElement);
      t.isApprox(box.left, x, 'Correct x');
      t.isApprox(box.top, y, 'Correct y');
      t.isApprox(box.width, width, 'Correct width');
      t.isApprox(box.height, height, 'Correct height');
    }
  }

  t.it('secondAndMinute', async t => {
    const tickHeight = 40;
    await createScheduler({
      viewPreset: 'secondAndMinute',
      startDate: new Date(2019, 5, 1, 10),
      endDate: new Date(2019, 5, 1, 10, 10),
      // 6 * 10 = 60 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 5, 1, 10, 1),
        duration: 1,
        durationUnit: 'minute'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 60 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, 6 * tickHeight, 150, 6 * tickHeight);
  });
  t.it('minuteAndHour', async t => {
    const tickHeight = 60;
    await createScheduler({
      viewPreset: 'minuteAndHour',
      startDate: new Date(2019, 5, 1, 10),
      endDate: new Date(2019, 5, 1, 20),
      // 10 * 2 = 20 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 5, 1, 11),
        duration: 1,
        durationUnit: 'hour'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 20 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, 2 * tickHeight, 150, 2 * tickHeight);
  });
  t.it('hourAndDay', async t => {
    const tickHeight = 40;
    await createScheduler({
      viewPreset: 'hourAndDay',
      startDate: new Date(2019, 5, 1),
      endDate: new Date(2019, 5, 4),
      // 3 * 24 = 72 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 5, 1, 11),
        duration: 2,
        durationUnit: 'hour'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 72 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, 11 * tickHeight, 150, 2 * tickHeight);
  });
  t.it('dayAndWeek', async t => {
    const tickHeight = 80;
    await createScheduler({
      viewPreset: 'dayAndWeek',
      startDate: new Date(2019, 5, 2),
      endDate: new Date(2019, 5, 23),
      // 21 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 5, 3),
        duration: 2,
        durationUnit: 'days'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 21 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, tickHeight, 150, 2 * tickHeight);
  });
  t.it('weekAndDay', async t => {
    const tickHeight = 80;
    await createScheduler({
      viewPreset: 'weekAndDay',
      startDate: new Date(2019, 5, 2),
      endDate: new Date(2019, 5, 23),
      // 21 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 5, 3),
        duration: 2,
        durationUnit: 'days'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 21 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, tickHeight, 150, 2 * tickHeight);
  });
  t.it('weekAndMonth', async t => {
    const tickHeight = 105;
    await createScheduler({
      viewPreset: 'weekAndMonth',
      startDate: new Date(2019, 5, 2),
      endDate: new Date(2019, 9, 1),
      // 18 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 5, 9),
        duration: 1,
        durationUnit: 'week'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 18 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, tickHeight, 150, tickHeight);
  });
  t.it('monthAndYear', async t => {
    const tickHeight = 110;
    await createScheduler({
      viewPreset: 'monthAndYear',
      startDate: new Date(2019, 5, 1),
      endDate: new Date(2021, 6, 1),
      // 25 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 6, 1),
        duration: 3,
        durationUnit: 'months'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 25 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, tickHeight, 150, 3 * tickHeight);
  });
  t.it('year', async t => {
    const tickHeight = 100;
    await createScheduler({
      viewPreset: 'year',
      startDate: new Date(2019, 1, 1),
      endDate: new Date(2022, 12, 31),
      // 17 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 6, 1),
        duration: 3,
        durationUnit: 'quarters'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 17 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, 2 * tickHeight, 150, 3 * tickHeight);
  });
  t.it('manyYears', async t => {
    const tickHeight = 50;
    await createScheduler({
      viewPreset: 'manyYears',
      startDate: new Date(2010, 1, 1),
      endDate: new Date(2030, 12, 31),
      // 22 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2010, 6, 1),
        duration: 4,
        durationUnit: 'years'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 22 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, tickHeight / 2, 150, 4 * tickHeight);
  });
  t.it('weekAndDayLetter', async t => {
    const tickHeight = 50;
    await createScheduler({
      viewPreset: 'weekAndDayLetter',
      startDate: new Date(2019, 5, 1),
      endDate: new Date(2019, 6, 30),
      // 70 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 5, 10),
        duration: 5,
        durationUnit: 'd'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 70 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, 15 * tickHeight, 150, 5 * tickHeight);
  });
  t.it('weekDateAndMonth', async t => {
    const tickHeight = 40;
    await createScheduler({
      viewPreset: 'weekDateAndMonth',
      startDate: new Date(2019, 5, 1),
      endDate: new Date(2019, 9, 30),
      // 23 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 5, 16),
        duration: 2,
        durationUnit: 'w'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 23 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, 3 * tickHeight, 150, 2 * tickHeight);
  });
  t.it('weekDateAndMonth', async t => {
    const tickHeight = 40;
    await createScheduler({
      viewPreset: 'weekDateAndMonth',
      startDate: new Date(2019, 5, 1),
      endDate: new Date(2019, 9, 30),
      // 23 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 5, 16),
        duration: 2,
        durationUnit: 'w'
      }]
    });
    t.is(scheduler.timeAxisSubGridElement.offsetHeight, 23 * tickHeight, 'Correct height');
    assertEventElement(t, 1, 0, 3 * tickHeight, 150, 2 * tickHeight);
  });
  t.it('Should zoom on CTRL + mousewheel sanity checks', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'hourAndDay',
      startDate: new Date(2018, 1, 7, 7),
      endDate: new Date(2018, 1, 8),
      mode: 'vertical',
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2018, 1, 7, 12),
        duration: 2,
        durationUnit: 'h'
      }],
      height: 500
    });
    const originalZoomLevel = scheduler.zoomLevel,
          centerDate = scheduler.viewportCenterDate;
    t.willFireNTimes(scheduler.timeAxisViewModel, 'update', 4);
    await t.wheel('.b-timeline-subgrid', function () {
      t.expect(scheduler.zoomLevel).toBe(originalZoomLevel + 1);
      t.isApprox(scheduler.viewportCenterDate, centerDate, 15 * 1000, 'Center date within 15s exactness');
    }, t, {
      deltaY: -1000,
      ctrlKey: true
    });
    await t.wheel('.b-timeline-subgrid', function () {
      t.expect(scheduler.zoomLevel).toBe(originalZoomLevel);
      t.isApprox(scheduler.viewportCenterDate, centerDate, 4 * 60 * 1000, 'Center date within 3 min exactness');
    }, t, {
      deltaY: 1000,
      ctrlKey: true
    });
    await t.wheel('.b-timeline-subgrid', function () {
      t.expect(scheduler.zoomLevel).toBe(originalZoomLevel - 1);
      t.isApprox(scheduler.viewportCenterDate, centerDate, 4 * 60 * 1000, 'Center date within 4 min exactness');
    }, t, {
      deltaY: 1000,
      ctrlKey: true
    });
    await t.wheel('.b-timeline-subgrid', function () {
      t.expect(scheduler.zoomLevel).toBe(originalZoomLevel - 2);
      t.isApprox(scheduler.viewportCenterDate, centerDate, 8 * 60 * 1000, 'Center date within 8 min exactness');
    }, t, {
      deltaY: 1000,
      ctrlKey: true
    });
  });
  t.it('Should support zooming when double clicking time axis in vertical mode', async t => {
    await createScheduler({
      viewPreset: 'weekDateAndMonth',
      startDate: new Date(2019, 5, 1),
      endDate: new Date(2019, 9, 30),
      // 23 ticks
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 5, 16),
        duration: 2,
        durationUnit: 'w'
      }]
    });
    const timeAxisColumn = scheduler.columns.first;
    t.firesOnce(scheduler.timeAxisViewModel, 'update');
    t.willFireNTimes(scheduler, 'timeAxisHeaderClick', 2);
    t.firesOnce(scheduler, 'timeAxisHeaderDblClick');
    t.firesOnce(scheduler, 'timeAxisHeaderContextMenu');
    t.willFireNTimes(timeAxisColumn, 'timeAxisHeaderClick', 2);
    t.firesOnce(timeAxisColumn, 'timeAxisHeaderDblClick');
    t.firesOnce(timeAxisColumn, 'timeAxisHeaderContextMenu');
    await t.doubleClick('.b-sch-header-timeaxis-cell:contains(2019 July)');
    await t.rightClick('.b-sch-header-timeaxis-cell:contains(Jul 2019)');
    const visibleDateRange = scheduler.visibleDateRange;
    t.isApprox(visibleDateRange.startDate, new Date(2019, 6, 1), 3 * 3600 * 1000, 'Visible start date correct');
    t.isApprox(visibleDateRange.endDate, new Date(2019, 7, 1), 2 * 3600 * 1000, 'Visible end date correct');
  });
});