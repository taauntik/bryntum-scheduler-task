"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    scheduler && scheduler.destroy();
    scheduler = null;
  });
  t.it('Should allow user copy, cut and paste using context menu', t => {
    scheduler = t.getScheduler({
      features: {
        eventMenu: true,
        scheduleContext: true,
        cellMenu: true
      }
    });
    t.chain({
      diag: 'Cut'
    }, {
      contextmenu: '[data-event-id=5]'
    }, {
      click: '.b-menuitem[data-ref="cutEvent"]'
    }, {
      waitForSelector: '[data-event-id=5] .b-cut-item',
      desc: 'Event Assignment 5 style was changed to "cut" when using context menu'
    }, {
      contextmenu: '[data-id="r4"]',
      offset: [150, '50%']
    }, {
      click: '.b-menuitem[data-ref="pasteEvent"]'
    }, {
      waitForProjectReady: scheduler
    }, next => {
      const recPasted = scheduler.eventStore.getById(5);
      t.is(recPasted.resourceId, 'r4', 'Event Assignment 5 was pasted to resource Karen');
      t.is(recPasted.startDate, new Date(2011, 0, 3, 10), 'Event Assignment 5 was pasted to correct startDate');
      t.is(recPasted.endDate, new Date(2011, 0, 5, 10), 'Event Assignment 5 was pasted to correct endDate');
      next();
    }, {
      diag: 'Copy'
    }, {
      contextmenu: '[data-event-id=2]'
    }, {
      click: '.b-menuitem[data-ref="copyEvent"]'
    }, {
      contextmenu: '[data-id="r4"]',
      offset: [450, '50%']
    }, {
      waitForSelector: '.b-schedule-selected-tick',
      desc: 'The cell where the event will be pasted was highlighed when clicked'
    }, {
      click: '.b-menuitem[data-ref="pasteEvent"]'
    }, {
      waitForProjectReady: scheduler
    }, () => {
      const recPasted = scheduler.eventStore.last;
      t.is(recPasted.name, 'Assignment 2 - 2', 'Event Assignment 2 was copied with a new name');
      t.is(recPasted.resourceId, 'r4', 'Event Assignment 2 - copy was pasted to resource Karen');
      t.is(recPasted.startDate, new Date(2011, 0, 6, 10), 'Event Assignment 2 - copy was pasted to correct startDate');
      t.is(recPasted.endDate, new Date(2011, 0, 8, 10), 'Event Assignment 2 - copy was pasted to correct endDate');
    });
  });
  t.it('Should allow user copy, cut and paste using CTRL+C/CTRL+X and CTRL+V', t => {
    scheduler = t.getScheduler({
      features: {
        scheduleContext: true
      },
      multiEventSelect: true
    });
    t.chain({
      diag: 'Single cut'
    }, {
      click: '[data-event-id=1]'
    }, {
      type: '[X]',
      options: {
        ctrlKey: true
      }
    }, {
      waitForSelector: '[data-event-id=1] .b-cut-item',
      desc: 'Event Assignment 1 style was changed to "cut" when using CTRL+X'
    }, {
      click: '[data-id="r6"]',
      offset: [350, '50%']
    }, next => {
      const rect = t.rect('.b-schedule-selected-tick');
      t.ok(rect.left + 45 == t.currentPosition[0] && rect.top + 23 == t.currentPosition[1], 'The cell where the event will be pasted was highlighed when clicked');
      next();
    }, {
      type: '[V]',
      options: {
        ctrlKey: true
      }
    }, {
      waitForProjectReady: scheduler
    }, next => {
      const recPasted = scheduler.eventStore.getById(1);
      t.is(recPasted.resourceId, 'r6', 'Event Assignment 1 was pasted to resource Peter');
      t.is(recPasted.startDate, new Date(2011, 0, 5, 10), 'Event Assignment 1 was pasted to correct startDate');
      t.is(recPasted.endDate, new Date(2011, 0, 7, 10), 'Event Assignment 1 was pasted to correct endDate');
      next();
    }, {
      diag: 'Multiple cut'
    }, {
      click: '[data-event-id=3]',
      options: {
        ctrlKey: true
      }
    }, {
      click: '[data-event-id=4]',
      options: {
        ctrlKey: true
      }
    }, {
      type: '[X]',
      options: {
        ctrlKey: true
      }
    }, {
      waitForSelector: '[data-event-id=3] .b-cut-item',
      desc: 'Event Assignment 3 style was changed to "cut" when using CTRL+X'
    }, {
      waitForSelector: '[data-event-id=4] .b-cut-item',
      desc: 'Event Assignment 4 style was changed to "cut" when using CTRL+X'
    }, {
      click: '[data-id="r1"]',
      offset: [250, '50%']
    }, next => {
      const rect = t.rect('.b-schedule-selected-tick');
      t.ok(rect.left + 45 == t.currentPosition[0] && rect.top + 23 == t.currentPosition[1], 'The cell where the event will be pasted was highlighed when clicked');
      next();
    }, {
      type: '[V]',
      options: {
        ctrlKey: true
      }
    }, {
      waitForProjectReady: scheduler
    }, next => {
      const {
        eventStore
      } = scheduler,
            rec3Pasted = eventStore.getById(3),
            rec4Pasted = eventStore.getById(4);
      t.is(rec3Pasted.resourceId, 'r1', 'Event Assignment 3 was pasted to resource Mike');
      t.is(rec3Pasted.startDate, new Date(2011, 0, 4, 10), 'Event Assignment 3 was pasted to correct startDate');
      t.is(rec3Pasted.endDate, new Date(2011, 0, 6, 10), 'Event Assignment 3 was pasted to correct endDate');
      t.is(rec4Pasted.resourceId, 'r1', 'Event Assignment 4 was pasted to resource Mike');
      t.is(rec4Pasted.startDate, new Date(2011, 0, 4, 10), 'Event Assignment 1 was pasted to correct startDate');
      t.is(rec4Pasted.endDate, new Date(2011, 0, 6, 10), 'Event Assignment 1 was pasted to correct endDate');
      next();
    }, {
      diag: 'Single copy'
    }, {
      click: '.b-sch-event-wrap[data-event-id="2"]'
    }, {
      type: '[C]',
      options: {
        ctrlKey: true
      }
    }, {
      click: '.b-grid-row[data-id="r5"]',
      offset: [250, '50%']
    }, next => {
      const rect = t.rect('.b-schedule-selected-tick');
      t.ok(rect.left + 45 == t.currentPosition[0] && rect.top + 23 == t.currentPosition[1], 'The cell where the event will be pasted was highlighed when clicked');
      next();
    }, {
      type: '[V]',
      options: {
        ctrlKey: true
      }
    }, {
      waitForProjectReady: scheduler
    }, next => {
      const recPasted = scheduler.eventStore.last;
      t.is(recPasted.name, 'Assignment 2 - 2', 'Event Assignment 2 was copied with a new name');
      t.is(recPasted.resourceId, 'r5', 'Event Assignment 2 - copy was pasted to resource Doug');
      t.is(recPasted.startDate, new Date(2011, 0, 4, 10), 'Event Assignment 2 - copy was pasted to correct startDate');
      t.is(recPasted.endDate, new Date(2011, 0, 6, 10), 'Event Assignment 2 - copy was pasted to correct endDate');
      next();
    }, {
      diag: 'Multiple copy'
    }, {
      click: '[data-event-id=2]',
      options: {
        ctrlKey: true
      }
    }, {
      click: '[data-event-id=5]',
      options: {
        ctrlKey: true
      }
    }, {
      type: '[C]',
      options: {
        ctrlKey: true
      }
    }, {
      click: '[data-id="r3"]',
      offset: [550, '50%']
    }, next => {
      const rect = t.rect('.b-schedule-selected-tick');
      t.ok(rect.left + 45 == t.currentPosition[0] && rect.top + 23 == t.currentPosition[1], 'The cell where the event will be pasted was highlighed when clicked');
      next();
    }, {
      type: '[V]',
      options: {
        ctrlKey: true
      }
    }, {
      waitForProjectReady: scheduler
    }, () => {
      const {
        eventStore
      } = scheduler,
            rec2Pasted = eventStore.getAt(eventStore.count - 2),
            rec5Pasted = eventStore.last;
      t.is(rec2Pasted.name, 'Assignment 2 - 3', 'Event Assignment 2 was copied with a new name');
      t.is(rec2Pasted.resourceId, 'r3', 'Event Assignment 2 - copy was pasted to resource Don');
      t.is(rec2Pasted.startDate, new Date(2011, 0, 7, 10), 'Event Assignment 2 - copy was pasted to correct startDate');
      t.is(rec2Pasted.endDate, new Date(2011, 0, 9, 10), 'Event Assignment 2 - copy was pasted to correct endDate');
      t.is(rec5Pasted.name, 'Assignment 5 - 2', 'Event Assignment 5 was copied with a new name');
      t.is(rec5Pasted.resourceId, 'r3', 'Event Assignment 5 - copy was pasted to resource Don');
      t.is(rec5Pasted.startDate, new Date(2011, 0, 7, 10), 'Event Assignment 5 - copy was pasted to correct startDate');
      t.is(rec5Pasted.endDate, new Date(2011, 0, 9, 10), 'Event Assignment 5 - copy was pasted to correct endDate');
    });
  }); // https://github.com/bryntum/support/issues/2481

  t.it('Should respect multi assignment mode when pasting record', async t => {
    scheduler = t.getScheduler({
      assignments: [{
        resourceId: 'r1',
        eventId: 1
      }, {
        resourceId: 'r2',
        eventId: 1
      }],
      events: [{
        id: 1,
        name: 'Foo',
        startDate: new Date(2011, 0, 6),
        duration: 24,
        durationUnit: 'h'
      }]
    });
    scheduler.features.eventCopyPaste.copyEvents([scheduler.eventStore.first]);
    scheduler.features.eventCopyPaste.pasteEvents(new Date(2011, 0, 8), scheduler.resourceStore.first);
    await t.waitForSelector('.b-sch-event-wrap:contains(Foo - 2)');
    t.notOk(scheduler.eventStore.usesSingleAssignment, 'Not using single assignment');
    t.is(scheduler.eventStore.count, 2, '3 events');
    t.is(scheduler.eventStore.last.startDate, new Date(2011, 0, 8), 'Correct start date');
    t.is(scheduler.eventStore.last.endDate, new Date(2011, 0, 9), 'Correct end date');
    t.is(scheduler.eventStore.last.isAssignedTo(scheduler.resourceStore.first), true, 'Correct resource assignment');
    t.selectorCountIs('.b-sch-event-wrap', 3, '3 rendered assignments');
  }); // https://github.com/bryntum/support/issues/3303

  t.it('Should trigger beforeCopy event', async t => {
    let count = 0;
    scheduler = t.getScheduler({
      assignments: [{
        resourceId: 'r1',
        eventId: 1
      }, {
        resourceId: 'r2',
        eventId: 2
      }],
      events: [{
        id: 1,
        name: 'Foo',
        startDate: new Date(2011, 0, 6),
        duration: 24,
        durationUnit: 'h'
      }, {
        id: 2,
        name: 'Bar',
        startDate: new Date(2011, 0, 6),
        duration: 24,
        durationUnit: 'h'
      }],
      listeners: {
        beforeCopy: ({
          records,
          isCut
        }) => {
          t.is(records.length, 2, '2 events copied');
          t.is(isCut, false, 'not a cut operation');
          count++;
          return false;
        }
      }
    });
    scheduler.features.eventCopyPaste.copyEvents(scheduler.eventStore.records);
    t.is(count, 1, '1 event fired');
    t.is(scheduler.features.eventCopyPaste.clipboardRecords.length, 0, 'No records in clipboard');
  }); // https://github.com/bryntum/support/issues/3303

  t.it('Should trigger beforePaste event which is preventable', async t => {
    let count = 0;
    scheduler = t.getScheduler({
      assignments: [{
        resourceId: 'r1',
        eventId: 1
      }, {
        resourceId: 'r2',
        eventId: 2
      }],
      events: [{
        id: 1,
        name: 'Foo',
        startDate: new Date(2011, 0, 6),
        duration: 24,
        durationUnit: 'h'
      }, {
        id: 2,
        name: 'Bar',
        startDate: new Date(2011, 0, 6),
        duration: 24,
        durationUnit: 'h'
      }],
      listeners: {
        beforePaste: ({
          records,
          isCut
        }) => {
          t.is(records.length, 2, '2 events copied');
          t.is(isCut, true, 'Is a cut operation');
          count++;
          return false;
        }
      }
    });
    t.wontFire(scheduler.eventStore, 'add');
    scheduler.features.eventCopyPaste.copyEvents(scheduler.eventStore.records, true);
    scheduler.features.eventCopyPaste.pasteEvents(new Date(2011, 0, 8), scheduler.resourceStore.first);
    t.is(scheduler.features.eventCopyPaste.clipboardRecords.length, 2, '2 records still in clipboard');
    t.is(count, 1, '1 event fired');
  }); // https://github.com/bryntum/support/issues/3830

  t.it('Should trigger beforePaste event with correct params when pasting using CTRL-V', async t => {
    let count = 0;
    scheduler = t.getScheduler({
      features: {
        // TODO: RowCopyPaste feature is disabled until this issue is not fixed
        // https://github.com/bryntum/support/issues/3865
        rowCopyPaste: false
      },
      assignments: [{
        resourceId: 'r1',
        eventId: 1
      }, {
        resourceId: 'r2',
        eventId: 2
      }],
      events: [{
        id: 1,
        name: 'Foo',
        startDate: new Date(2011, 0, 6),
        duration: 24,
        durationUnit: 'h'
      }],
      listeners: {
        beforePaste: ({
          records,
          resourceRecord,
          isCut
        }) => {
          t.is(resourceRecord, scheduler.resourceStore.first, 'Correct resourceRecord');
          t.is(records.length, 1, '1 event copied');
          t.is(isCut, false, 'Is a copy paste operation');
          count++;
        }
      }
    });
    t.firesOnce(scheduler.eventStore, 'add');
    await t.click('.b-sch-event');
    await t.type({
      text: 'C',
      options: {
        ctrlKey: true
      }
    });
    await t.type({
      text: 'V',
      options: {
        ctrlKey: true
      }
    });
    t.is(count, 1, '1 event fired');
    t.is(scheduler.eventStore.last.resource.id, 'r1', 'Correct resource assigned');
    t.is(scheduler.eventStore.count, 2, '2 events');
    await t.waitFor(() => t.query('.b-sch-event-wrap').length === 2);
    t.selectorCountIs('.b-sch-event-wrap', 2, '2 rendered events');
  });
});