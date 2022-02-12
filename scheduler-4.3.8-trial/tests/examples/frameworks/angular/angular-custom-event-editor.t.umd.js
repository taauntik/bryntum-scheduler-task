"use strict";

/**
 * Custom event editor test
 */
StartTest(t => {
  const scheduler = bryntum.query('scheduler');
  const {
    eventStore
  } = scheduler;
  t.chain( // basic rendering
  {
    waitForSelector: '.b-timelinebase'
  }, // test if popup opens and can save name
  {
    dblClick: '.b-sch-event:contains("Meeting #1")'
  }, {
    waitForSelector: '.mat-dialog-title:contains("Meeting #1")'
  }, {
    click: 'input[data-placeholder="Event name"]'
  }, {
    type: ' is important'
  }, {
    click: 'button:textEquals("Save")'
  }, {
    waitForSelector: '.b-sch-event:contains("Meeting #1 is important")'
  }, // test if popup can cancel edits
  {
    dblClick: '.b-sch-event-wrap :contains("Meeting #2")',
    offset: [10, 10]
  }, {
    waitForSelector: '.mat-dialog-title:contains("Meeting #2")'
  }, {
    click: 'input[data-placeholder="Event name"]'
  }, {
    type: ' is important'
  }, {
    click: 'button:textEquals("Cancel")'
  }, {
    waitForSelectorNotFound: '.b-sch-event:contains("Meeting #2 is important")'
  }, // https://github.com/bryntum/support/issues/3177
  // Commit changes
  next => {
    eventStore.commit();
    next();
  }, // Test if drag-created event is removed on cancel
  {
    drag: '[data-region=normal] .b-grid-row[data-index=1]',
    offset: [100, '50%'],
    by: [200, 0],
    desc: 'Create event by D&D'
  }, {
    waitForSelector: '.mat-dialog-container'
  }, {
    waitForSelector: '.b-sch-event:contains("New event")'
  }, {
    click: '.mat-dialog-container button:textEquals("Cancel")'
  }, {
    waitForSelector: '.b-released .b-sch-event:contains("New event")'
  }, // Test if D&D-created event changes the event store so a request will be sent
  {
    drag: '[data-region=normal] .b-grid-row[data-index=1]',
    offset: [100, '50%'],
    by: [200, 0],
    desc: 'Create event by D&D'
  }, {
    dblClick: 'input[data-placeholder="Event name"]'
  }, {
    type: '[Backspace][Backspace][Backspace][Backspace][Backspace][Backspace][Backspace][Backspace][Backspace]This event'
  }, {
    click: '.mat-dialog-container button:textEquals("Save")'
  }, {
    waitForSelector: '.b-sch-event:contains("This event")'
  }, next => {
    t.ok(eventStore.changes, 'Event Store changed');
    next();
  });
});