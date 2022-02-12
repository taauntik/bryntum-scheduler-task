"use strict";

StartTest(t => {
  t.it('Should support ceilDate', function (t) {
    let ta = new TimeAxis({
      continuous: false
    });
    ta.reconfigure({
      weekStartDay: 1,
      unit: 'day',
      mainUnit: 'day',
      resolutionUnit: 'hour',
      resolutionIncrement: 1,
      startDate: new Date(2012, 2, 1),
      endDate: new Date(2012, 2, 5)
    }); // Ceil in main unit (day), Days +1

    t.is(ta.ceilDate(new Date(2012, 2, 1, 1, 1), false), new Date(2012, 2, 2), '1 minute => ceil to next day'); // Ceil in resolution unit (hour), Hours +1

    t.is(ta.ceilDate(new Date(2012, 2, 1, 1, 1), true), new Date(2012, 2, 1, 2), '1 minute => ceil to next hour');
    ta.reconfigure({
      weekStartDay: 1,
      unit: 'week',
      mainUnit: 'week',
      resolutionUnit: 'day',
      resolutionIncrement: 1,
      startDate: new Date(2013, 6, 1),
      endDate: new Date(2013, 6, 30)
    }); // Ceil in main unit (week), go to next week

    t.is(ta.ceilDate(new Date(2013, 6, 23, 1, 1), false), new Date(2013, 6, 29), '+1 day => ceil to full week'); // Ceil in main unit (week), go to next week

    t.is(ta.ceilDate(new Date(2013, 6, 22, 1), false), new Date(2013, 6, 29), '+1 hour => ceil to full week'); // Ceil in resolution unit (DAY), day +1

    t.is(ta.ceilDate(new Date(2013, 6, 22, 1, 1), true), new Date(2013, 6, 23), '+1 minute => ceil to next day');
    ta.reconfigure({
      weekStartDay: 1,
      unit: 'month',
      mainUnit: 'month',
      resolutionUnit: 'day',
      resolutionIncrement: 1,
      startDate: new Date(2013, 6, 1),
      endDate: new Date(2013, 8, 1)
    }); // Ceil in main unit (month), go to next month

    t.is(ta.ceilDate(new Date(2013, 6, 2), false), new Date(2013, 7, 1), '+1 day => ceil to next month'); // Ceil in resolution unit (DAY), day +1

    t.is(ta.ceilDate(new Date(2013, 6, 1, 1), true), new Date(2013, 6, 2), '+1 minute => ceil to next day');
    ta.reconfigure({
      weekStartDay: 1,
      unit: 'quarter',
      mainUnit: 'quarter',
      resolutionUnit: 'day',
      resolutionIncrement: 1,
      startDate: new Date(2013, 6, 1),
      endDate: new Date(2013, 8, 1)
    }); // Ceil in main unit (month), go to next month

    t.is(ta.ceilDate(new Date(2013, 6, 1), false), new Date(2013, 6, 1), 'Even quarter, no effect');
    t.is(ta.ceilDate(new Date(2013, 7, 1), false), new Date(2013, 9, 1), '+1 month => ceil to next quarter'); // Ceil in resolution unit (DAY), day +1

    t.is(ta.ceilDate(new Date(2013, 6, 1, 1), true), new Date(2013, 6, 2), '+1 minute => ceil to next day');
    ta.reconfigure({
      weekStartDay: 1,
      unit: 'year',
      mainUnit: 'year',
      resolutionUnit: 'month',
      resolutionIncrement: 1,
      startDate: new Date(2013, 6, 1),
      endDate: new Date(2013, 8, 1)
    }); // Ceil in main unit (month), go to next month

    t.is(ta.ceilDate(new Date(2013, 0, 1), false), new Date(2013, 0, 1), 'Day 1 of year, no effect');
    t.is(ta.ceilDate(new Date(2013, 1, 1), false), new Date(2014, 0, 1), 'Feb 1 of year => ceil to next year');
    t.is(ta.ceilDate(new Date(2013, 0, 5), false), new Date(2014, 0, 1), '+5 days => ceil to next year'); // Ceil in resolution unit (DAY), day +1

    t.is(ta.ceilDate(new Date(2013, 0, 2), true), new Date(2013, 1, 1), '+1 day => ceil to next month');
    t.it('Takes time into account', function (t) {
      t.is(ta.ceilDate(new Date(2013, 0, 1, 1), false, 'year'), new Date(2014, 0, 1), '+1 year => ceil to next year');
      t.is(ta.ceilDate(new Date(2013, 0, 1, 1), false, 'quarter'), new Date(2013, 3, 1), '+1 quarter => ceil to next quarter');
    });
  });
});