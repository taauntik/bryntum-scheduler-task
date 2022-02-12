"use strict";

StartTest(t => {
  const scheduler = bryntum.query('scheduler');
  t.it('sanity', t => {
    t.chain({
      waitForSelector: '.b-sch-foreground-canvas'
    }, () => t.checkGridSanity(scheduler));
  }); // https://app.assembla.com/spaces/bryntum/tickets/6848

  t.it('Should create events with no errors', t => {
    t.chain({
      dblclick: '.b-grid-subgrid-normal .b-grid-cell'
    }, {
      click: '.b-eventeditor .b-combo:nth-of-type(1) .b-icon'
    }, {
      click: '.b-list-item[data-id=plain]'
    }, {
      click: '.b-eventeditor .b-combo:nth-of-type(2) .b-icon'
    }, {
      click: '.b-list-item[data-id=red]'
    }, {
      click: '.b-button:contains(Save)'
    });
  });
  t.browser.chrome && t.it('Picking a custom color', async t => {
    await t.click('[data-ref="colorCombo"]');
    await t.click('.b-sch-custom');
    await t.waitForSelector('[data-ref="customColor"].b-contains-focus');
    await t.type(null, '#333[TAB]');
    await t.waitFor(() => {
      const style = t.global.getComputedStyle(scheduler.getElementFromEventRecord(scheduler.eventStore.first));
      return style.color === 'rgb(51, 51, 51)';
    });
  });
});