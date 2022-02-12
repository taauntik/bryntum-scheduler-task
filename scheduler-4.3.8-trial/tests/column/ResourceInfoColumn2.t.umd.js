"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    var _scheduler, _scheduler$destroy;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : (_scheduler$destroy = _scheduler.destroy) === null || _scheduler$destroy === void 0 ? void 0 : _scheduler$destroy.call(_scheduler);
  });
  t.it(`Should pass for copying resource row and ignore 404 with test's "failOnResourceLoadError" config`, async t => {
    scheduler = await t.getSchedulerAsync({
      defaultResourceImageName: 'none.png',
      resources: [{
        name: 'Gloria'
      }],
      resourceImagePath: '../examples/_shared/images/users/',
      columns: [{
        type: 'resourceInfo',
        text: 'Staff'
      }]
    }, 1);
    await t.waitForSelector('img[src*="gloria.jpg"]');
    await t.click('.b-resource-info'); // Perform Copy/Paste for the resource row

    await t.type(null, 'cv', null, null, {
      ctrlKey: true
    });
  });
});