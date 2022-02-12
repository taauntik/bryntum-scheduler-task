"use strict";

StartTest(t => {
  t.diag('Double clicking any time header row should fire an event');
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
    scheduler = t.getScheduler({
      viewPreset: 'foo',
      zoomOnTimeAxisDoubleClick: false,
      appendTo: document.body,
      startDate: new Date(2011, 1, 1),
      endDate: new Date(2011, 1, 1, 12)
    });
  });
  PresetManager.registerPreset('foo', {
    tickWidth: 35,
    rowHeight: 32,
    displayDateFormat: 'HH:mm',
    shiftIncrement: 1,
    shiftUnit: 'day',
    timeResolution: {
      unit: 'minute',
      increment: 15
    },
    defaultSpan: 24,
    headers: [{
      unit: 'month',
      increment: 1,
      dateFormat: 'DD MMM YYYY'
    }, {
      unit: 'day',
      increment: 1,
      dateFormat: 'D MMM'
    }, {
      unit: 'hour',
      increment: 2,
      dateFormat: 'HH'
    }]
  });
  t.it('Should size tables correctly', t => {
    let el = scheduler.getHeaderElement(scheduler.timeAxisColumn);
    t.isGE(el.querySelectorAll('.b-sch-header-row').length, 3, '3 header rows found');
    let timeAxisColWidth = el.offsetWidth;
    let row = el.querySelector('.b-sch-header-row');
    t.isGE(row.offsetWidth, timeAxisColWidth, 'Correct width for top table');
    t.isGE(row.nextElementSibling.offsetWidth, timeAxisColWidth, 'Correct width for mid table');
    t.isGE(row.nextElementSibling.nextElementSibling.offsetWidth, timeAxisColWidth, 'Correct width for bottom table');
    let top = el.querySelector('.b-sch-header-row-0');
    t.is(top.querySelector('.b-sch-header-timeaxis-cell').offsetWidth, top.offsetWidth, 'Correct width for top header');
    let middle = el.querySelector('.b-sch-header-row-1');
    t.is(middle.querySelector('.b-sch-header-timeaxis-cell').offsetWidth, middle.offsetWidth, 'Correct width for mid table td');
  });
  t.it('Double clicks', t => {
    t.willFireNTimes(scheduler, 'timeaxisheaderdblclick', 3);
    t.chain(next => {
      scheduler.on({
        timeaxisheaderdblclick({
          source,
          startDate,
          endDate,
          event
        }) {
          t.ok(source instanceof TimeAxisColumn, 'Bottom row header ok');
          t.is(startDate, new Date(2011, 1, 1, 0), 'StartDate ok');
          t.is(endDate, new Date(2011, 1, 1, 2), 'EndDate ok');
          next();
        },

        once: true
      });
      t.doubleClick('.b-sch-header-row-2 .b-sch-header-timeaxis-cell', () => {});
    }, next => {
      scheduler.on({
        timeaxisheaderdblclick({
          source,
          startDate,
          endDate,
          event
        }) {
          t.ok(source instanceof TimeAxisColumn, 'Middle row header ok');
          t.is(startDate, new Date(2011, 1, 1, 0), 'StartDate ok');
          t.is(endDate, new Date(2011, 1, 2), 'EndDate ok');
          next();
        },

        once: true
      });
      t.doubleClick('.b-sch-header-row-1 .b-sch-header-timeaxis-cell', () => {});
    }, next => {
      scheduler.on({
        timeaxisheaderdblclick({
          source,
          startDate,
          endDate,
          event
        }) {
          t.ok(source instanceof TimeAxisColumn, 'Top row header ok');
          t.is(startDate, new Date(2011, 1, 1, 0), 'StartDate ok');
          t.is(endDate, new Date(2011, 1, 2), 'EndDate ok');
          next();
        },

        once: true
      });
      t.doubleClick('.b-sch-header-row-0 .b-sch-header-timeaxis-cell', () => {});
    });
  });
});