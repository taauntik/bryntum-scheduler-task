"use strict";

StartTest(t => {
  t.beforeEach(() => {
    scheduler && !scheduler.isDestroyed && scheduler.destroy();
  });
  let scheduler, tickSize;
  document.body.style.width = '500px';

  async function getScheduler(config) {
    scheduler = await t.getSchedulerAsync(Object.assign({
      startDate: new Date(2009, 1, 1),
      endDate: new Date(2009, 1, 11)
    }, config));
    tickSize = scheduler.timeAxisViewModel.tickSize;
  }

  t.it('should calculate the data from the X position correctly', async t => {
    await getScheduler();
    t.is(scheduler.getDateFromCoordinate(0, null, true), new Date(2009, 1, 1), 'Should find start date at point 0');
    t.is(scheduler.getDateFromCoordinate(tickSize, null, true), new Date(2009, 1, 2), 'Should find start date +1d at 1 whole tick');
    await scheduler.scrollHorizontallyTo(tickSize, false);
    t.is(scheduler.getDateFromCoordinate(document.querySelector('.b-grid-subgrid-normal').scrollLeft, 'round', true), new Date(2009, 1, 2), 'Should find start date +1d at the left edge of 2nd time column');
  });
  t.it('should get correct date from a mouse event', async t => {
    await getScheduler({
      columns: []
    });
    let reportedMouseoverDate, calculatedMouseoverDate;
    scheduler.on('scheduleMousemove', function ({
      date,
      event
    }) {
      reportedMouseoverDate = date;
      calculatedMouseoverDate = scheduler.getDateFromXY([event.offsetX, event.offsetY], null, true);
    });
    t.chain({
      moveMouseTo: scheduler.timeAxisSubGridElement,
      offset: [0, 50]
    }, // Mouseover pixel 0 should report the start date
    {
      waitFor: () => reportedMouseoverDate - scheduler.timeAxis.startDate === 0 && calculatedMouseoverDate - scheduler.timeAxis.startDate === 0
    });
  });
  t.it('should get correct date from a mouse event when page is scrolled', async t => {
    scheduler = await t.getScheduler({
      width: 1200,
      startDate: new Date(2021, 2, 7, 8),
      endDate: new Date(2021, 2, 7, 18),
      viewPreset: 'hourAndDay',
      columns: [{
        text: 'Staff',
        field: 'name',
        width: 200
      }],
      resources: [{
        name: 'R1'
      }],
      events: []
    }); // Scroll right edge of too-wide Scheduler into view so that we can test the
    // mousedown date behaviour on its extreme right when the page is scrolled.

    document.scrollingElement.scrollLeft = 1000; // Check that its last pixel at 1200 is exactly its end date

    t.is(scheduler.getDateFromXY([1200, 60], null, false), new Date(2021, 2, 7, 18));
  });
});