"use strict";

StartTest(t => {
  PresetManager.registerPreset('dayNightShift', {
    tickWidth: 35,
    rowHeight: 32,
    displayDateFormat: 'H:mm',
    shiftIncrement: 1,
    shiftUnit: 'day',
    timeResolution: {
      unit: 'minute',
      increment: 15
    },
    defaultSpan: 24,
    headers: [{
      unit: 'day',
      increment: 1,
      dateFormat: 'DD MMM YYYY'
    }, {
      unit: 'hour',
      increment: 12,
      renderer: function (startDate, endDate, headerConfig) {
        // Setting align on the header config object
        headerConfig.align = 'center';

        if (startDate.getHours() === 0) {
          // Setting a custom CSS on the header cell element
          headerConfig.headerCls = 'nightShift';
          return DateHelper.format(startDate, 'MMM DD') + ' Night Shift';
        } else {
          // Setting a custom CSS on the header cell element
          headerConfig.headerCls = 'dayShift';
          return DateHelper.format(startDate, 'MMM DD') + ' Day Shift';
        }
      }
    }, {
      unit: 'hour',
      increment: 1,
      dateFormat: 'H'
    }]
  }); // a scheduler with 3 level headers

  let scheduler = t.getScheduler({
    viewPreset: 'dayNightShift',
    appendTo: document.body
  });
  let normalHeaderEl = document.querySelector('.b-grid-headers-normal'),
      lockedHeaderEl = document.querySelector('.b-grid-headers-locked'),
      initialHeight = normalHeaderEl.offsetHeight;
  t.is(normalHeaderEl.offsetHeight, lockedHeaderEl.offsetHeight, 'Both headers have the same height'); // irrelevant, they are in the same div in vanilla
  //t.is(scheduler.normalGrid.body.getStyle('top'), scheduler.lockedGrid.body.getStyle('top'), 'Both grid body elements are aligned "top"');

  t.isApprox(document.querySelector('.b-grid-body-container').offsetTop, lockedHeaderEl.offsetHeight, 'The body starts after header, not in the middle of it'); // reducing the number of levels to 2 - the height of headers should decrease
  // also the content should move a little bit top

  scheduler.timeAxisColumn.viewPreset = 'dayAndWeek';
  t.is(document.querySelector('.b-grid-headers-normal').offsetTop, document.querySelector('.b-grid-headers-locked').offsetTop, 'Both headers have the same height after preset switch'); // TODO: PORT ? should header height autoadjust? currently scheduler determines header height

  t.todo('Not the current behaviour, worth considering', t => {
    t.isLess(document.querySelector('.b-grid-headers-normal').offsetHeight, initialHeight, 'Height should decrease, as header becomes 2 level instead of 3');
  });
  t.isApprox(document.querySelector('.b-grid-body-container').getBoundingClientRect().top, document.querySelector('.b-grid-headers-normal').getBoundingClientRect().height, 'The body starts after header, not in the middle of it');
});