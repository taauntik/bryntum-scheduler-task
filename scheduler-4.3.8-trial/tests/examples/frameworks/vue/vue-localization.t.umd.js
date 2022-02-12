"use strict";

/**
 * Localization demo test
 */
StartTest(t => {
  t.chain({
    waitForSelector: '.b-timelinebase'
  }, // Check language list
  {
    click: '.b-combo input'
  }, {
    waitForSelector: '.b-list',
    desc: 'Language picker opened correctly'
  }, {
    waitForSelector: '.b-list-item:textEquals(English)',
    desc: 'English item present'
  }, {
    waitForSelector: '.b-list-item:textEquals(Swedish)',
    desc: 'Swedish item present'
  }, {
    waitForSelector: '.b-list-item:textEquals(Russian)',
    desc: 'Russian item present'
  }, // English title
  {
    click: '.b-list-item:textEquals(English)'
  }, {
    click: '.b-combo label'
  }, {
    waitForSelector: '.demo-header a:textEquals(Localization Vue Scheduler)',
    desc: 'Header translation is correct'
  }, {
    waitForSelector: '.b-combo label:textEquals(Select Language)',
    desc: 'Combo label translation is correct'
  }, {
    waitForSelector: '[data-index=2] dd:textEquals(2 events)',
    desc: 'Number of events ok'
  }, {
    waitForSelector: '.b-grid-header-text:textEquals(Task color)',
    desc: 'Header translation is correct'
  }, // Swedish title
  {
    click: '.b-combo input'
  }, {
    click: '.b-combo label'
  }, {
    click: '.b-list-item:textEquals(Swedish)'
  }, {
    waitForSelector: '.demo-header a:textEquals(Vue Scheduler lokalisering)',
    desc: 'Header translation is correct'
  }, {
    waitForSelector: '.b-combo label:textEquals(Välj språk)',
    desc: 'Combo label translation is correct'
  }, {
    waitForSelector: '[data-index=2] dd:textEquals(2 händelser)',
    desc: 'Number of events ok'
  }, {
    waitForSelector: '.b-grid-header-text:textEquals(Uppgiftsfärg)',
    desc: 'Header translation is correct'
  }, // Russian title
  {
    click: '.b-combo input'
  }, {
    click: '.b-combo label'
  }, {
    click: '.b-list-item:textEquals(Russian)'
  }, {
    waitForSelector: '.demo-header a:textEquals(Локализация Vue Scheduler)',
    desc: 'Header translation is correct'
  }, {
    waitForSelector: '.b-combo label:textEquals(Выберите язык)',
    desc: 'Combo label translation is correct'
  }, {
    waitForSelector: '[data-index=2] dd:textEquals(2 события)',
    desc: 'Number of events ok'
  }, {
    waitForSelector: '.b-grid-header-text:textEquals(Цвет задачи)',
    desc: 'Header translation is correct'
  }, // Events check
  {
    waitForSelector: '[data-index=1] dd:textEquals(1 событие)',
    desc: 'Number of 1 Russian eventok'
  }, {
    waitForSelector: '[data-index=7] dd:textEquals(0 событий)',
    desc: 'Number of 0 Russian events ok'
  });
}); // eof