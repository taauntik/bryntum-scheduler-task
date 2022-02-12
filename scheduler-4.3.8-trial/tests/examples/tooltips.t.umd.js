"use strict";

StartTest(t => {
  const scheduler = bryntum.query('scheduler');
  t.it('Should not be vulnerable by XSS injection for custom drag tooltip', async t => {
    t.injectXSS(scheduler);
    await t.dragBy({
      source: '.b-sch-event',
      delta: [0, 10]
    });
  });
});