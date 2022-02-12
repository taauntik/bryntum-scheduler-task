"use strict";

StartTest(t => {
  let resourceCombo;
  t.beforeEach(t => {
    var _resourceCombo;

    (_resourceCombo = resourceCombo) === null || _resourceCombo === void 0 ? void 0 : _resourceCombo.destroy();
  });
  t.it('Should render list items\'s colours correctly', async t => {
    resourceCombo = new ResourceCombo({
      showEventColor: true,
      displayField: 'name',
      store: new ResourceStore({
        data: [{
          name: 'No-colour resource'
        }, {
          name: 'Red resource',
          eventColor: '#f00'
        }, {
          name: 'Blue resource',
          eventColor: 'blue'
        }]
      }),
      clearable: true,
      appendTo: document.body
    });
    resourceCombo.showPicker();
    const {
      resourceIcon,
      picker
    } = resourceCombo;
    t.is(DomHelper.getStyleValue(resourceIcon, 'display'), 'none', 'resourceIcon initially hidden');
    t.is(DomHelper.getStyleValue(picker.getItem(0).firstChild, 'display'), 'none', 'First item has no icon');
    t.is(DomHelper.getStyleValue(picker.getItem(1).firstChild, 'color'), 'rgb(255, 0, 0)', 'Second item is red');
    t.notOk(picker.getItem(2).firstChild.style.color, 'Inline colour cleared when colour set by class name');
    t.hasCls(picker.getItem(2).firstChild, 'b-sch-foreground-blue', 'Third item is blue');
    t.chain({
      click: '.b-list-item[data-index="1"]'
    }, next => {
      t.is(DomHelper.getStyleValue(resourceIcon, 'color'), 'rgb(255, 0, 0)', 'resourceIcon is red for red item');
      resourceCombo.showPicker();
      next();
    }, {
      click: '.b-list-item[data-index="2"]'
    }, next => {
      t.notOk(resourceIcon.style.color, 'Inline colour cleared when colour set by class name');
      t.hasCls(resourceIcon, 'b-sch-foreground-blue', 'resourceIcon is blue for blue item');
      resourceCombo.showPicker();
      next();
    }, {
      click: '.b-list-item[data-index="0"]'
    }, next => {
      t.is(DomHelper.getStyleValue(resourceIcon, 'display'), 'none', 'resourceIcon hidden for no-color item');
      resourceCombo.showPicker();
      next();
    }, {
      click: '.b-list-item[data-index="2"]'
    }, next => {
      t.hasCls(resourceIcon, 'b-sch-foreground-blue', 'resourceIcon is blue for blue item');
      resourceCombo.showPicker();
      next();
    }, {
      click: () => resourceCombo.triggers.clear.element
    }, () => {
      t.is(DomHelper.getStyleValue(resourceIcon, 'display'), 'none', 'resourceIcon hidden when field cleared');
    });
  });
  t.it('Should not be affected by XSS injection with single selection', async t => {
    resourceCombo = new ResourceCombo({
      showEventColor: true,
      items: ['First', 'Second'],
      appendTo: document.body
    });
    t.injectXSS(resourceCombo);
    resourceCombo.showPicker();
    await t.click('.b-list-item[data-index="0"]');
    t.pass('Ok');
  });
  t.it('Should not be affected by XSS injection with multiple selection', async t => {
    resourceCombo = new ResourceCombo({
      showEventColor: true,
      multiSelect: true,
      items: ['First', 'Second'],
      appendTo: document.body
    });
    t.injectXSS(resourceCombo);
    resourceCombo.showPicker();
    await t.click('.b-list-item[data-index="1"]');
    await t.click('.b-list-item[data-index="0"]');
    t.pass('Ok');
  });
});