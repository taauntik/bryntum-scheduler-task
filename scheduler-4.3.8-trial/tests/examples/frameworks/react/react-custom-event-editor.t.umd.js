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
  }, // Test if popup opens and can save name
  {
    dblClick: '.b-sch-event:contains("Meeting #1")'
  }, {
    waitForSelector: '.popup header:textEquals("Meeting #1")'
  }, {
    click: '.popup input[name=name]'
  }, {
    type: ' is important'
  }, {
    click: '.popup button:textEquals("Save")'
  }, {
    waitForSelector: '.b-sch-event:contains("Meeting #1 is important")'
  }, // Test if popup can cancel edits
  {
    dblClick: '.b-sch-event-wrap :contains("Meeting #2")',
    offset: [80, 10]
  }, {
    waitForSelector: '.popup header:textEquals("Meeting #2")'
  }, {
    click: '.popup input[name=name]'
  }, {
    type: ' is important'
  }, {
    click: '.popup button:textEquals("Cancel")'
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
    waitForSelector: '.popup'
  }, {
    waitForSelector: '.b-sch-event:contains("New event")'
  }, {
    click: '.popup button:textEquals("Cancel")'
  }, {
    waitForSelector: '.b-released .b-sch-event:contains("New event")'
  }, // Test if D&D-created event changes the event store so a request will be sent
  {
    drag: '[data-region=normal] .b-grid-row[data-index=1]',
    offset: [100, '50%'],
    by: [200, 0],
    desc: 'Create event by D&D'
  }, {
    dblClick: '.popup input[name=name]'
  }, {
    type: 'This event'
  }, {
    click: '.popup button:textEquals("Save")'
  }, {
    waitForSelector: '.b-sch-event:contains("This event")'
  }, next => {
    t.ok(eventStore.changes, 'Event Store changed');
    next();
  });
});