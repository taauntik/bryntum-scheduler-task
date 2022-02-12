"use strict";

StartTest(t => {
  t.setWindowSize(1024, 768);
  t.beforeEach((t, next) => {
    t.waitForSelector('.example', next);
  });
  t.it('Check tooltips for examples available online', t => {
    t.chain({
      scrollIntoView: '#b-example-frameworks-ionic-ionic-4'
    }, {
      waitForSelector: '#b-example-frameworks-ionic-ionic-4 i.b-fa-info',
      desc: 'Correct info icon used'
    }, {
      moveCursorTo: '#b-example-frameworks-ionic-ionic-4 .tooltip'
    }, {
      waitForSelector: '.b-tooltip-content',
      desc: 'Tooltip shown'
    }, {
      waitForSelectorNotFound: '.b-tooltip-content:contains(This demo needs to be built before it can be viewed)',
      desc: 'Tooltip has not build text'
    }, {
      moveCursorTo: 'label.title',
      desc: 'Hiding tooltip to avoid aborting requests'
    }, {
      waitForSelectorNotFound: '.b-tooltip',
      desc: 'Tooltip hidden'
    });
  });
  t.it('Check tooltips for examples not available online', t => {
    t.chain({
      scrollIntoView: '#b-example-frameworks-webpack'
    }, {
      waitForSelector: '#b-example-frameworks-webpack i.b-fa-cog',
      desc: 'Correct info icon used'
    }, {
      moveCursorTo: '#b-example-frameworks-webpack .tooltip'
    }, {
      waitForSelector: '.b-tooltip-content:contains(This demo is not viewable online, but included when you download the trial)',
      desc: 'Tooltip has correct text'
    }, {
      moveCursorTo: 'label.title',
      desc: 'Hiding tooltip to avoid aborting requests'
    }, {
      waitForSelectorNotFound: '.b-tooltip',
      desc: 'Tooltip hidden'
    });
  });
});