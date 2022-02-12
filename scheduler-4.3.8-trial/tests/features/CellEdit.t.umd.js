"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    var _scheduler$destroy;

    return scheduler === null || scheduler === void 0 ? void 0 : (_scheduler$destroy = scheduler.destroy) === null || _scheduler$destroy === void 0 ? void 0 : _scheduler$destroy.call(scheduler);
  });
  t.it('Should align editor correctly when previous edit changed row height', async t => {
    await t.getSchedulerAsync({
      columns: [{
        field: 'rowHeight',
        text: 'Height'
      }]
    });
    await t.doubleClick('.b-grid-cell');
    await t.type(null, '100[ENTER]');
    await t.waitForAnimations();
    await t.waitForSelector('.b-cell-editor');
    t.isApproxPx(t.rect('.b-cell-editor').top, t.rect('.b-grid-row[data-index="1"]').top, 'Editor positioned correctly');
  });
});