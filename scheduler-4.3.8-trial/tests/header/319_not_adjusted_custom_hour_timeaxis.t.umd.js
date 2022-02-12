"use strict";

StartTest(t => {
  t.it('Ticks should have equal width', function (t) {
    PresetManager.registerPreset('myPreset', {
      tickWidth: 20,
      rowHeight: 24,
      // Only used in horizontal orientation
      resourceColumnWidth: 100,
      // Only used in vertical orientation
      displayDateFormat: 'HH:mm',
      shiftUnit: 'day',
      shiftIncrement: 1,
      defaultSpan: 1,
      // By default, show 1 week
      timeResolution: {
        unit: 'hour',
        increment: 8
      },
      mainHeaderLevel: 0,
      headers: [{
        unit: 'day',
        dateFormat: 'DDD MMM YYYY',
        align: 'left'
      }, {
        unit: 'hour',
        increment: 8,
        dateFormat: 'HH'
      }]
    });
    const scheduler = t.getScheduler({
      appendTo: document.body,
      autoAdjustTimeAxis: false,
      startDate: new Date(2010, 0, 10, 7),
      endDate: new Date(2010, 0, 13),
      viewPreset: 'myPreset'
    });
    const tickEl = document.querySelector('.b-sch-header-row-1 .b-sch-header-timeaxis-cell');
    t.isApprox(tickEl.getBoundingClientRect().width, scheduler.timeAxisViewModel.tickSize, 0.1, 'First tick has correct width');
  });
});