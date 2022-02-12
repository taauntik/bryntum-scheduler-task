"use strict";

StartTest(t => {
  t.it('Should throw informative error message when viewPreset is invalid', async t => {
    t.throwsOk(() => t.getScheduler({
      viewPreset: 'foo'
    }), `Invalid ViewPreset: foo. Valid strings are manyYears, `);
  });
});