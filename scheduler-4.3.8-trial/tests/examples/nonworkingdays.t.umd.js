"use strict";

StartTest(t => {
  const scheduler = bryntum.query('scheduler'),
        getNonWorkingDaysValues = () => scheduler.widgetMap.nonWorkingDays.items.filter(button => button.pressed).map(button => button.index);

  t.it('Sanity', async t => {
    await t.checkGridSanity(scheduler);
    await t.waitForSelector('.b-sch-nonworkingtime');
  });
  t.it('Weekend buttons should be localized and selection updated on locale change', async t => {
    await t.waitForSelector('.b-buttongroup[data-ref="nonWorkingDays"] .b-button[data-item-index="0"]:contains(Sun)');
    t.isDeeply(getNonWorkingDaysValues(), [0, 6], 'Buttons pressed correctly');
    await t.click('.b-buttongroup[data-ref="nonWorkingDays"] .b-button[data-item-index="1"]');
    t.isDeeply(getNonWorkingDaysValues(), [0, 1, 6], 'Buttons pressed correctly');
    t.diag('Select Russian locale');
    await t.click('[data-ref=infoButton]');
    await t.click('[data-ref=localeCombo]');
    await t.click('.b-list-item:contains(Русский)');
    const dayName = BrowserHelper.isSafari ? 'Вс' : 'вс';
    await t.waitForSelector(`.b-buttongroup[data-ref="nonWorkingDays"] .b-button[data-item-index="0"]:contains(${dayName})`);
    t.isDeeply(getNonWorkingDaysValues(), [0, 6], 'Buttons pressed correctly');
    await t.click('.b-buttongroup[data-ref="nonWorkingDays"] .b-button[data-item-index="2"]');
    t.isDeeply(getNonWorkingDaysValues(), [0, 2, 6], 'Buttons pressed correctly');
    t.diag('Select English locale');
    await t.click('[data-ref=infoButton]');
    await t.click('[data-ref=localeCombo]');
    await t.click('.b-list-item:contains(English)');
    await t.waitForSelector('.b-buttongroup[data-ref="nonWorkingDays"] .b-button[data-item-index="0"]:contains(Sun)');
    t.isDeeply(getNonWorkingDaysValues(), [0, 1, 6], 'Buttons pressed correctly');
    t.diag('Select Russian locale');
    await t.click('[data-ref=infoButton]');
    await t.click('[data-ref=localeCombo]');
    await t.click('.b-list-item:contains(Русский)');
    await t.waitForSelector(`.b-buttongroup[data-ref="nonWorkingDays"] .b-button[data-item-index="0"]:contains(${dayName})`);
    t.isDeeply(getNonWorkingDaysValues(), [0, 2, 6], 'Buttons pressed correctly');
  });
});