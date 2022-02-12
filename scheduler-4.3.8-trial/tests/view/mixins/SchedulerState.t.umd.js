"use strict";

StartTest(t => {
  let scheduler;
  t.it('Should be able to restore previously stored state', async t => {
    const startDate = new Date(2011, 0, 3),
          endDate = new Date(2011, 0, 20);
    scheduler = await t.getSchedulerAsync({
      rowHeight: 50,
      barMargin: 5,
      tickWidth: 100,
      enableEventAnimations: false,
      startDate,
      endDate
    });
    const state = scheduler.state;
    t.is(document.querySelector('.b-sch-event').offsetHeight, 40, 'Correct height initially');
    t.is(document.querySelector('.b-sch-header-row-1 .b-sch-header-timeaxis-cell').offsetWidth, 100, 'Correct width initially');
    scheduler.barMargin = 10;
    scheduler.tickSize = 70;
    t.is(document.querySelector('.b-sch-event').offsetHeight, 30, 'Correct height after changes');
    t.is(document.querySelector('.b-sch-header-row-1 .b-sch-header-timeaxis-cell').offsetWidth, 70, 'Correct width after change');
    scheduler.state = state;
    t.is(document.querySelector('.b-sch-event').offsetHeight, 40, 'Correct height after restoring state');
    t.is(document.querySelector('.b-sch-header-row-1 .b-sch-header-timeaxis-cell').offsetWidth, 100, 'Correct width after restore');
    t.is(scheduler.startDate, startDate, 'Start date is restored');
    t.is(scheduler.endDate, endDate, 'End date is restored');
  });
  t.it('Should restore scheduler state if start/end was not provided in config', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      events: [],
      resources: []
    });
    await t.waitForProjectReady();
    scheduler.endDate = DateHelper.add(new Date(), 10, 'd');
    scheduler.resourceStore.data = [{
      id: 1,
      name: 'Albert'
    }];
    scheduler.eventStore.data = [{
      id: 1,
      resourceId: 1,
      startDate: new Date(),
      endDate: DateHelper.add(new Date(), 2, 'd')
    }];
    await t.waitForProjectReady();
    const startDate = scheduler.startDate,
          endDate = scheduler.endDate; // eslint-disable-next-line no-self-assign

    scheduler.state = scheduler.state;
    t.is(scheduler.startDate, startDate, 'Start date is restored');
    t.is(scheduler.endDate, endDate, 'End date is restored');
  });
  t.it('Should restore start/end dates', t => {
    scheduler = t.getScheduler({
      tickWidth: 40,
      viewPreset: 'weekAndDayLetter',
      startDate: null,
      endDate: null
    });
    const {
      startDate,
      endDate
    } = scheduler;
    delete scheduler.config.startDate;
    delete scheduler.config.endDate; // eslint-disable-next-line no-self-assign

    scheduler.state = scheduler.state;
    t.is(scheduler.startDate, startDate, 'Start date is restored');
    t.is(scheduler.endDate, endDate, 'End date is restored');
  });
  t.it('Should change view preset correctly after restoring state', async t => {
    const newStart = new Date(2020, 6, 6),
          newEnd = DateHelper.add(new Date(), 6, 'M'),
          centerDate = new Date(newEnd - (newEnd - newStart) / 2);
    scheduler = t.getScheduler({
      viewPreset: 'hourAndDay',
      // monday
      startDate: newStart,
      width: 450
    }); // eslint-disable-next-line no-self-assign

    scheduler.state = scheduler.state;
    await scheduler.timeAxisSubGrid.header.scrollable.await('scrollEnd', {
      checkLog: false
    });
    scheduler.viewPreset = {
      base: 'weekAndDay',
      options: {
        startDate: newStart,
        endDate: newEnd,
        centerDate
      }
    };
    t.is(scheduler.timeAxisSubGrid.header.scrollable.x, scheduler.timeAxisSubGrid.scrollable.x, 'Header and grid scrollables are synced');
  });
  t.it('Should restore zoom level/tick size correctly', async t => {
    scheduler = t.getScheduler(); // change tick size

    scheduler.tickSize *= 2;
    const {
      state,
      tickSize,
      startDate,
      endDate,
      viewportCenterDate
    } = scheduler;
    scheduler.tickSize += 50; // eslint-disable-next-line no-self-assign

    scheduler.state = state;
    t.is(scheduler.tickSize, tickSize, 'Tick size is ok');
    t.is(scheduler.startDate, startDate, 'Start is ok');
    t.is(scheduler.endDate, endDate, 'End is ok');
    t.is(scheduler.viewportCenterDate, viewportCenterDate, 'Center date is ok');
  });
  t.it('Should be no errors on re-apply state', t => {
    scheduler = t.getScheduler();
    scheduler.applyState(JSON.parse(JSON.stringify(scheduler.getState())));
    t.pass('No error thrown');
  });
});