"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && !scheduler.isDestroyed && scheduler.destroy();
  }); // Scheduler's timeResolution config applied incorrectly (https://github.com/bryntum/support/issues/564)

  t.it('Should accept timeResolution config as Object', t => {
    scheduler = new Scheduler({
      viewPreset: 'dayAndWeek',
      timeResolution: {
        unit: 'minute',
        increment: 10
      }
    });
    t.is(scheduler.timeResolution.unit, 'minute', 'Correct timeResolution unit');
    t.is(scheduler.timeResolution.increment, 10, 'Correct timeResolution increment');
  }); // Scheduler's timeResolution config applied incorrectly (https://github.com/bryntum/support/issues/564)

  t.it('Should accept timeResolution config as Number', t => {
    scheduler = new Scheduler({
      viewPreset: 'dayAndWeek',
      timeResolution: 15
    });
    t.is(scheduler.timeResolution.unit, 'hour', 'Correct timeResolution unit');
    t.is(scheduler.timeResolution.increment, 15, 'Correct timeResolution increment');
  }); // https://github.com/bryntum/support/issues/1552

  t.it('Should map date when positioned on fractional x', async t => {
    scheduler = await t.getSchedulerAsync();
    scheduler.element.style.left = '0.1px';
    const timelineStart = scheduler.timeAxisSubGridElement.getBoundingClientRect().left;
    t.is(scheduler.getDateFromXY([timelineStart, 100], 'floor', false), new Date(2011, 0, 3));
  });
});