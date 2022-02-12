"use strict";

StartTest(t => {
  t.it('Should allow to drag create event', t => {
    t.chain({
      drag: '[data-region=normal] .b-grid-row',
      offset: [50, '50%'],
      by: [100, 0],
      desc: 'Create event dragging from left to right'
    }, {
      type: '[ESC]',
      desc: 'Cancel event creation'
    }, {
      waitForSelectorNotFound: '.b-eventeditor',
      desc: 'Editor closed'
    }, {
      drag: '[data-region=normal] .b-grid-row',
      offset: [150, '50%'],
      by: [-100, 0],
      desc: 'Create event dragging from right to left'
    });
  });
});