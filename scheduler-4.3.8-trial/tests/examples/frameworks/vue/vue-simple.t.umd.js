"use strict";

/**
 * Custom simple test
 */
StartTest(t => {
  t.it('Rendering', t => {
    t.chain( // basic rendering
    {
      waitForSelector: '.b-timelinebase'
    }, {
      waitForSelector: '.b-checkbox'
    });
  });
  t.it('Features', t => {
    t.chain( // stripe feature
    {
      waitForSelectorNotFound: '.b-even'
    }, {
      click: '.b-checkbox :contains(Stripe)'
    }, {
      waitForSelector: '.b-even'
    }, // columnLines feature
    {
      waitForSelector: '.b-columnlines'
    }, {
      click: '.b-checkbox :contains(Column Lines)'
    }, {
      waitForSelectorNotFound: '.b-columnlines'
    });
  });
});