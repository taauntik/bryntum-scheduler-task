"use strict";

StartTest(t => {
  const dstDates = t.getDSTDates(2018); // This test requires DST dates to be present!

  if (!dstDates.length) return;
  t.it('roundDate', t => {
    let dstDate, d, i; // Test each DST change

    for (d = 0; d < dstDates.length; d++) {
      dstDate = dstDates[d]; // SECONDS

      for (i = 1; i <= 60; i++) {
        // skip some of them, so the result could be the same
        if (24 * 60 * 60 % i) continue;

        (function (dstDate, i) {
          t.it('DST: ' + dstDate.toLocaleDateString() + '; Unit: SECONDS; Resolution: ' + i + ';', function (t) {
            t.isDate(dstDate);
            const startTA = DateHelper.clearTime(DateHelper.add(dstDate, -1, 'week')),
                  endTA = DateHelper.clearTime(DateHelper.add(dstDate, 1, 'week')),
                  expectDate = DateHelper.clone(endTA),
                  rawDate = new Date(expectDate.getFullYear(), expectDate.getMonth(), expectDate.getDate(), 0, 0, 0, 200);
            const ta = new TimeAxis({
              unit: 'minute',
              increment: 30,
              resolutionUnit: 'second',
              resolutionIncrement: i,
              mainUnit: 'minute',
              shiftUnit: 'hour',
              shiftIncrement: 6,
              defaultSpan: 1,
              startDate: startTA,
              endDate: endTA
            });
            const result = ta.roundDate(rawDate);
            t.isDateEqual(result, expectDate);
          });
        })(dstDate, i);
      } // MINUTES


      for (i = 1; i <= 60; i++) {
        // skip some of them, so the result could be the same
        if (24 * 60 % i) continue;

        (function (dstDate, i) {
          t.it('DST: ' + dstDate.toLocaleDateString() + '; Unit: MINUTES; Resolution: ' + i + ';', function (t) {
            t.isDate(dstDate);
            const startTA = DateHelper.clearTime(DateHelper.add(dstDate, -1, 'week')),
                  endTA = DateHelper.clearTime(DateHelper.add(dstDate, 1, 'week')),
                  expectDate = DateHelper.clone(endTA),
                  rawDate = new Date(expectDate.getFullYear(), expectDate.getMonth(), expectDate.getDate(), 0, 0, 20);
            const ta = new TimeAxis({
              unit: 'minute',
              increment: 30,
              resolutionUnit: 'minute',
              resolutionIncrement: i,
              mainUnit: 'minute',
              shiftUnit: 'hour',
              shiftIncrement: 6,
              defaultSpan: 1,
              startDate: startTA,
              endDate: endTA
            });
            const result = ta.roundDate(rawDate);
            t.isDateEqual(result, expectDate);
          });
        })(dstDate, i);
      } // HOURS


      for (i = 1; i <= 24; i++) {
        // skip some of them, so the result could be the same (leave 1,2,3,4,6,8,12,24)
        if (24 % i) continue;

        (function (dstDate, i) {
          t.it('DST: ' + dstDate.toLocaleDateString() + '; Unit: HOURS; Resolution: ' + i + ';', function (t) {
            t.isDate(dstDate);
            const startTA = DateHelper.clearTime(DateHelper.add(dstDate, -1, 'week')),
                  endTA = DateHelper.clearTime(DateHelper.add(dstDate, 1, 'week')),
                  expectDate = DateHelper.clone(endTA),
                  rawDate = new Date(expectDate.getFullYear(), expectDate.getMonth(), expectDate.getDate(), 0, 20);
            const ta = new TimeAxis({
              unit: 'day',
              increment: 2,
              resolutionUnit: 'hour',
              resolutionIncrement: i,
              mainUnit: 'day',
              shiftUnit: 'hour',
              shiftIncrement: 6,
              defaultSpan: 1,
              startDate: startTA,
              endDate: endTA
            });
            const result = ta.roundDate(rawDate);
            t.isDateEqual(result, expectDate);
          });
        })(dstDate, i);
      } // DAYS


      (function (dstDate) {
        t.it('DST: ' + dstDate.toLocaleDateString() + '; Unit: DAYS; Resolution: 1;', function (t) {
          t.isDate(dstDate);
          const startTA = DateHelper.clearTime(DateHelper.add(dstDate, -1, 'week')),
                endTA = DateHelper.clearTime(DateHelper.add(dstDate, 1, 'week')),
                expectDate = DateHelper.clone(endTA),
                rawDate = new Date(expectDate.getFullYear(), expectDate.getMonth(), expectDate.getDate(), 2);
          const ta = new TimeAxis({
            unit: 'month',
            increment: 1,
            resolutionUnit: 'day',
            resolutionIncrement: 1,
            mainUnit: 'day',
            shiftUnit: 'hour',
            shiftIncrement: 6,
            defaultSpan: 1,
            startDate: startTA,
            endDate: endTA
          });
          const result = ta.roundDate(rawDate);
          t.isDateEqual(result, expectDate);
        });
      })(dstDate);
    }
  });
});