"use strict";

StartTest(t => {
  // https://app.assembla.com/spaces/bryntum/tickets/7558
  t.it('Should not get duplicate elements after drag create', t => {
    t.chain({
      drag: '.b-sch-timeaxis-cell',
      offset: [20, 20],
      by: [100, 0]
    }, {
      type: 'Test'
    }, {
      click: ':textEquals(Save)'
    }, () => {
      t.selectorCountIs('.b-sch-event:not(.b-sch-released', 12, 'Correct element count');
    });
  });
});