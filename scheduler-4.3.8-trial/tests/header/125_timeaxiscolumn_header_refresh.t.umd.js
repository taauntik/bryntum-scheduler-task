"use strict";

StartTest(t => {
  let bool = false;
  PresetManager.registerPreset('foo', {
    tickWidth: 35,
    rowHeight: 32,
    displayDateFormat: 'HH:mm',
    shiftIncrement: 1,
    shiftUnit: 'day',
    timeResolution: {
      unit: 'day',
      increment: 1
    },
    defaultSpan: 24,
    headers: [{
      unit: 'day',
      renderer: () => {
        return bool ? '<span class="sch-after">after</span>' : '<span class="sch-before">before</span>';
      }
    }, {
      unit: 'day',
      increment: 1,
      dateFormat: 'YYYY-MM-DD'
    }]
  });
  let scheduler = t.getScheduler({
    viewPreset: 'foo',
    appendTo: document.body,
    startDate: new Date(2010, 1, 2),
    endDate: new Date(2010, 1, 3)
  });
  t.selectorExists('.sch-before', 'should find "before" before redraw');
  t.wontFire(scheduler, 'refresh');
  bool = true;
  scheduler.timeAxisColumn.refreshHeader();
  t.selectorNotExists('.sch-before', 'should not find "before" after redraw');
  t.selectorExists('.sch-after', 'should find "after" after redraw');
});