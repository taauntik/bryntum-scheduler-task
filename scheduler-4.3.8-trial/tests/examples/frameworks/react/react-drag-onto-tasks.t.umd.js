"use strict";

StartTest(t => {
  t.it('Rendering', async t => {
    await t.waitForSelector('.b-timelinebase');
    await t.waitForSelector('.b-equipmentgrid');
    await t.waitForSelector('.b-sch-event-wrap');
    await t.waitForSelector('.b-equipment');
  });
});