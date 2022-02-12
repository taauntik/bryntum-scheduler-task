"use strict";

StartTest(t => {
  t.diag('Current timezone: ' + new Date().getTimezoneOffset());
  let ta, ticks;

  let setup = (config = {}) => {
    ta = new TimeAxis();
    ta.reconfigure(Object.assign({
      unit: 'hour',
      increment: 6,
      resolutionUnit: 'hour',
      resolutionIncrement: 1,
      weekStartDay: 1,
      mainUnit: 'hour',
      shiftUnit: 'hour',
      shiftIncrement: 1,
      defaultSpan: 1,
      startDate: new Date(2012, 2, 25),
      endDate: new Date(2012, 2, 26)
    }, config));
    ticks = ta.ticks;
  };

  t.it('Swedish Timezone tests', t => {
    if (DateHelper.isDST(new Date(2012, 2, 25, 1)) || !DateHelper.isDST(new Date(2012, 2, 25, 2))) {
      t.diag('Skipping the test because its supposed to run in the Swedish timezone');
      return;
    }

    t.it('Day split by 6 hours, crossing DST time moves forward 1 hr', t => {
      setup();
      t.is(ticks.length, 4, '4 ticks in a days split by 6 hours');
      t.is(ticks[0].startDate, new Date(2012, 2, 25, 0), 'Increment 6 tick 0 start');
      t.is(ticks[0].endDate, new Date(2012, 2, 25, 7), 'Increment 6 tick 0 end');
      t.is(ticks[1].startDate, new Date(2012, 2, 25, 7), 'Increment 6 tick 1 start');
      t.is(ticks[1].endDate, new Date(2012, 2, 25, 12), 'Increment 6 tick 1 end');
      t.is(ticks[2].startDate, new Date(2012, 2, 25, 12), 'Increment 6 tick 2 start');
      t.is(ticks[2].endDate, new Date(2012, 2, 25, 18), 'Increment 6 tick 2 end');
      t.is(ticks[3].startDate, new Date(2012, 2, 25, 18), 'Increment 6 tick 3 start');
      t.is(ticks[3].endDate, new Date(2012, 2, 26, 0), 'Increment 6 tick 3 end');
    });
    t.it('Day split by 6 hours, start at 2pm, crossing DST time moves forward 1 hr', t => {
      setup(); // reconfigure will reset the increment to 1 if its not provided in the config

      ta.reconfigure({
        increment: 6,
        startDate: new Date(2012, 2, 24, 14),
        endDate: new Date(2012, 2, 25, 14)
      });
      ticks = ta.ticks;
      t.is(ticks.length, 4, '4 ticks in a days split by 6 hours');
      t.is(ticks[0].startDate, new Date(2012, 2, 24, 14), 'Increment 6 (2pm) tick 0 start');
      t.is(ticks[0].endDate, new Date(2012, 2, 24, 20), 'Increment 6 (2pm) tick 0 end');
      t.is(ticks[1].startDate, new Date(2012, 2, 24, 20), 'Increment 6 (2pm) tick 1 start');
      t.is(ticks[1].endDate, new Date(2012, 2, 25, 3), 'Increment 6 (2pm) tick 1 end');
      t.is(ticks[2].startDate, new Date(2012, 2, 25, 3), 'Increment 6 (2pm) tick 2 start');
      t.is(ticks[2].endDate, new Date(2012, 2, 25, 8), 'Increment 6 (2pm) tick 2 end');
      t.is(ticks[3].startDate, new Date(2012, 2, 25, 8), 'Increment 6 (2pm) tick 3 start');
      t.is(ticks[3].endDate, new Date(2012, 2, 25, 14), 'Increment 6 (2pm) tick 3 end');
    });
    t.it('Day split by 6 hours, crossing DST time moves backward 1 hr', t => {
      setup();
      ta.reconfigure({
        increment: 6,
        startDate: new Date(2012, 9, 28),
        endDate: new Date(2012, 9, 29)
      });
      ticks = ta.ticks;
      t.is(ticks[0].startDate, new Date(2012, 9, 28, 0), 'Increment 6 tick 0 start, backwards');
      t.is(ticks[0].endDate, new Date(2012, 9, 28, 5), 'Increment 6 tick 0 end, backwards');
      t.is(ticks[1].startDate, new Date(2012, 9, 28, 5), 'Increment 6 tick 1 start, backwards');
      t.is(ticks[1].endDate, new Date(2012, 9, 28, 12), 'Increment 6 tick 1 end, backwards');
      t.is(ticks[2].startDate, new Date(2012, 9, 28, 12), 'Increment 6 tick 2 start, backwards');
      t.is(ticks[2].endDate, new Date(2012, 9, 28, 18), 'Increment 6 tick 2 end, backwards');
      t.is(ticks[3].startDate, new Date(2012, 9, 28, 18), 'Increment 6 tick 3 start, backwards');
      t.is(ticks[3].endDate, new Date(2012, 9, 29, 0), 'Increment 6 tick 3 end, backwards');
    });
    t.it('Day split by 5 hours, crossing DST time moves backward 1 hr', t => {
      setup();
      ta.reconfigure({
        startDate: new Date(2012, 9, 28),
        endDate: new Date(2012, 9, 29),
        increment: 5
      });
      ticks = ta.ticks;
      t.is(ticks[0].startDate, new Date(2012, 9, 28, 0), 'Increment 5 tick 0 start, backwards');
      t.is(ticks[0].endDate, new Date(2012, 9, 28, 4), 'Increment 5 tick 0 end, backwards');
      t.is(ticks[1].startDate, new Date(2012, 9, 28, 4), 'Increment 5 tick 1 start, backwards');
      t.is(ticks[1].endDate, new Date(2012, 9, 28, 10), 'Increment 5 tick 1 end, backwards');
      t.is(ticks[2].startDate, new Date(2012, 9, 28, 10), 'Increment 5 tick 2 start, backwards');
      t.is(ticks[2].endDate, new Date(2012, 9, 28, 15), 'Increment 5 tick 2 end, backwards');
      t.is(ticks[3].startDate, new Date(2012, 9, 28, 15), 'Increment 5 tick 3 start, backwards');
      t.is(ticks[3].endDate, new Date(2012, 9, 28, 20), 'Increment 5 tick 3 end, backwards');
    });
    t.it('Day split by 10 hours, start at 23, crossing DST time moves forward 1 hr', t => {
      setup();
      ta.reconfigure({
        increment: 10,
        startDate: new Date(2012, 2, 24, 23),
        endDate: new Date(2012, 2, 26, 5)
      });
      ticks = ta.ticks; // Without DST cross, 23 9 19 5
      // With DST Expected axis: 23 10 19 5

      t.is(ticks[0].startDate, new Date(2012, 2, 24, 23), 'Increment 10 tick 0 start');
      t.is(ticks[0].endDate, new Date(2012, 2, 25, 10), 'Increment 10 tick 0 end');
      t.is(ticks[1].startDate, new Date(2012, 2, 25, 10), 'Increment 10 tick 1 start');
      t.is(ticks[1].endDate, new Date(2012, 2, 25, 19), 'Increment 10 tick 1 end');
      t.is(ticks[2].startDate, new Date(2012, 2, 25, 19), 'Increment 10 tick 2 start');
      t.is(ticks[2].endDate, new Date(2012, 2, 26, 5), 'Increment 10 tick 2 end');
    }); // https://app.assembla.com/spaces/bryntum/tickets/7019

    t.it('Crossing DST', t => {
      setup({
        increment: 1,
        startDate: new Date(2018, 9, 28, 2),
        endDate: new Date(2018, 9, 28, 3)
      });
      t.pass('Did not crash');
    });
  });
  t.it('Brazil timezone issue #1642 (GMT-0200 (BRST))', t => {
    let ta = new TimeAxis();
    ta.reconfigure({
      unit: 'day',
      resolutionUnit: 'day',
      resolutionIncrement: 1,
      mainUnit: 'week',
      weekStartDay: 0,
      startDate: new Date(2014, 9, 20),
      endDate: new Date(2015, 1, 19)
    });
    let firstTick = ta.ticks[0],
        pos = ta.getTickFromDate(new Date(2014, 9, 13));
    t.is(ta.startDate.getDate(), 19, 'Axis should be "floored" to start date on previous Sunday');
    t.is(ta.startDate.getDay(), 0, 'Axis should be start on the provided start day');
    t.is(firstTick.endDate, new Date(2014, 9, 20), 'First tick should end on Monday 00:00');
    t.is(pos, -1);
  });
});