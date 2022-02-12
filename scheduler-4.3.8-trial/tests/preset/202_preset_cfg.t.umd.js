"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => scheduler && scheduler.destroy());
  t.describe('headers configured using headers', t => {
    t.it('Pass anonymous preset without name', t => {
      scheduler = t.getScheduler({
        viewPreset: {
          tickWidth: 35,
          rowHeight: 47,
          displayDateFormat: 'HH-mm',
          shiftIncrement: 3,
          shiftUnit: 'dat',
          timeResolution: {
            unit: 'minute',
            increment: 35
          },
          defaultSpan: 24,
          headers: [{
            unit: 'hour',
            increment: 12,
            renderer: (startDate, endDate, headerConfig, cellIdx) => cellIdx
          }]
        },
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 5),
        appendTo: document.body
      });
      t.is(scheduler.timeResolution.increment, 35, 'timeResolution increment');
      t.is(scheduler.displayDateFormat, 'HH-mm', 'displayDateFormat');
    });
    t.it('Pass existing preset and modify config', t => {
      scheduler = t.getScheduler({
        viewPreset: {
          base: 'hourAndDay',
          headers: [{
            unit: 'hour',
            increment: 12,
            renderer: (...params) => params[3]
          }]
        },
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 5),
        appendTo: document.body
      });
      const myPreset = PresetManager.normalizePreset('hourAndDay');
      t.ok(myPreset, 'Could register a new preset');
      [].forEach.call(document.querySelectorAll('.b-sch-header-row-0 .b-sch-header-timeaxis-cell'), (td, index) => {
        t.like(td.innerText, index, 'Content matches cellIndex ' + index);
      });
    });
  });
});