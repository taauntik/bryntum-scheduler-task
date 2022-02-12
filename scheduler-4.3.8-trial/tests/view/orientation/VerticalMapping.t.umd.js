"use strict";

StartTest(t => {
  let scheduler; // async beforeEach doesn't work in umd

  t.beforeEach(async (t, next) => {
    scheduler && scheduler.destroy();
    scheduler = await t.getVerticalSchedulerAsync({
      resources: ArrayHelper.populate(1000, i => ({
        id: 'r' + (i + 1),
        name: 'Resource ' + (i + 1)
      })),
      endDate: new Date(2019, 12, 1)
    });
    next();
  });
  t.it('Date mapping', t => {
    const topDate = new Date(2019, 4, 26);
    scheduler.timeAxis.forEach((tick, i) => {
      t.is(scheduler.getDateFromCoordinate(i * 50), DateHelper.add(topDate, i, 'days'));
    });
  });
  t.it('getElementsFromEventRecord for a record that\'s not in the store should not crash', t => {
    const newEvent = new scheduler.eventStore.modelClass({
      startDate: new Date(),
      duration: 1,
      durationUnit: 'd',
      name: ''
    });
    t.isDeeply(scheduler.getElementsFromEventRecord(newEvent), []);
  });
  t.it('Resource mapping', t => {
    function assertEventResource(eventId) {
      t.is(scheduler.resolveResourceRecord(document.querySelector(`[data-event-id="${eventId}"]`)).id, scheduler.eventStore.getById(eventId).resourceId, 'Correct for event ' + eventId);
    }

    assertEventResource(1);
    assertEventResource(2);
    assertEventResource(3);
    assertEventResource(4);
    assertEventResource(5);

    function assertResource(x, index) {
      t.is(scheduler.resolveResourceRecord(document.querySelector('.b-sch-timeaxis-cell'), [x, 0]), scheduler.resourceStore.getAt(index), 'Correct for x ' + x);
    }

    assertResource(0, 0);
    assertResource(150, 1);
    assertResource(999 * 150, 999);
  });
  t.it('should support visibleDateRange in vertical mode', async t => {
    scheduler && scheduler.destroy();
    scheduler = await t.getSchedulerAsync({
      mode: 'vertical',
      startDate: new Date(2010, 1, 1),
      endDate: new Date(2010, 5, 1),
      width: 300
    });
    await t.waitForRowsVisible(scheduler);
    scheduler.height = scheduler.headerHeight + 3 * scheduler.tickSize + DomHelper.scrollBarWidth;
    const halfHourMs = 1000 * 60 * 30;
    t.chain({
      waitFor: () => scheduler.timeAxisSubGrid.height > 0
    }, () => {
      t.is(scheduler.visibleDateRange.startDate, new Date(2010, 1, 1), 'Correct visible start date');
      t.isApprox(scheduler.visibleDateRange.endDate, new Date(2010, 1, 4), halfHourMs, 'Correct visible end date');
    });
  });
  t.it('should support getStartEndDatesFromRectangle in vertical mode', async t => {
    scheduler.viewPreset = 'hourAndDay';
    scheduler.setTimeSpan(new Date(2011, 1, 1), new Date(2011, 1, 2));
    scheduler.resources = [{
      id: 'r1',
      name: 'foo'
    }];
    scheduler.events = [{
      id: 1,
      resourceId: 'r1',
      startDate: new Date(2011, 1, 1, 10),
      endDate: new Date(2011, 1, 1, 11)
    }];
    t.chain({
      waitForProjectReady: scheduler
    }, {
      waitForElementVisible: scheduler.unreleasedEventSelector
    }, {
      waitFor: () => scheduler.timeAxisSubGrid.height > 0
    }, async () => {
      const rect = Rectangle.from(document.querySelector('.b-sch-event:not(.b-released)'), scheduler.foregroundCanvas),
            dates = scheduler.getStartEndDatesFromRectangle(rect);
      t.is(dates.start, new Date(2011, 1, 1, 10), 'Correct start date');
      t.is(dates.end, new Date(2011, 1, 1, 11), 'Correct end date');
    });
  });
});