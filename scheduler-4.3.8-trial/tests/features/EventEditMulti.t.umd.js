"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    scheduler && !scheduler.isDestroyed && scheduler.destroy();
  });

  async function getMultiScheduler(config = {}) {
    scheduler = new Scheduler(Object.assign({
      appendTo: document.body,
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }, {
        id: 'r3',
        name: 'Jenny'
      }],
      events: [{
        id: 1,
        name: 'test event',
        startDate: new Date(2017, 0, 1, 10),
        endDate: new Date(2017, 0, 1, 12)
      }],
      assignments: config.assignmentStore ? undefined : [{
        id: 1,
        resourceId: 'r1',
        eventId: 1
      }, {
        id: 2,
        resourceId: 'r2',
        eventId: 1
      }],
      features: {
        eventTooltip: false,
        eventEdit: true
      },
      startDate: new Date(2017, 0, 1, 6),
      endDate: new Date(2017, 0, 1, 20),
      viewPreset: 'hourAndDay',
      enableEventAnimations: false
    }, config));
    await t.waitForProjectReady();
  }

  t.it('Editing a multi assigned event should update all instances', async t => {
    await getMultiScheduler();
    const initialLeft = document.querySelector('.b-sch-event').getBoundingClientRect().left;
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      type: 'Fun[ENTER]',
      target: 'input:focus'
    }, next => {
      t.selectorCountIs('.b-sch-event:contains(Fun)', 2, 'All elements text updated');
      next();
    }, {
      dblclick: '.b-sch-event'
    }, {
      click: '.b-timefield'
    }, {
      type: '09[ENTER]',
      clearExisting: true
    }, () => {
      DomHelper.forEachSelector(document, '.b-sch-event', (el, i) => {
        t.isLess(el.getBoundingClientRect().left, initialLeft, `Element ${i} moved to the left`);
      });
    });
  });
  t.it('Deleting a multi assigned event should remove all instances', async t => {
    await getMultiScheduler();
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'button:textEquals(Delete)'
    }, {
      waitForSelectorNotFound: scheduler.unreleasedEventSelector,
      desc: 'All elements gone'
    });
  });
  t.it('Should support multiple resources w/ assignment store', async t => {
    await getMultiScheduler({
      startDate: new Date(2017, 0, 1),
      endDate: new Date(2017, 0, 3),
      features: {
        eventTooltip: false,
        eventEdit: true
      },
      resources: [{
        id: 1,
        name: 'Celia',
        city: 'Barcelona'
      }, {
        id: 2,
        name: 'Lee',
        city: 'London'
      }, {
        id: 3,
        name: 'Henrik',
        city: 'London'
      }],
      events: [{
        id: 1,
        startDate: new Date(2017, 0, 1, 10),
        endDate: new Date(2017, 0, 1, 12),
        name: 'Multi assigned',
        iconCls: 'b-fa b-fa-users'
      }],
      assignments: [{
        resourceId: 1,
        eventId: 1
      }, {
        resourceId: 2,
        eventId: 1
      }]
    }, false);
    const event = scheduler.eventStore.first,
          {
      eventEdit
    } = scheduler.features;
    eventEdit.editEvent(event, scheduler.resourceStore.first);
    t.chain({
      waitFor: () => bryntum.query('resourcecombo')
    }, // Assign to one resource
    next => {
      const resourceCombo = bryntum.query('resourcecombo');
      t.isDeeplyUnordered(resourceCombo.value, [1, 2], 'Resource combo has correct initial value');
      resourceCombo.value = [1];
      eventEdit.save();
      t.isDeeply(event.resources, [scheduler.resourceStore.first], 'Correct resources assigned');
      next();
    }, {
      waitForSelector: '.b-released'
    }, // Assign to two resources
    next => {
      const resourceCombo = bryntum.query('resourcecombo');
      resourceCombo.value = [1, 2];
      eventEdit.save();
      t.is(event.resources.length, 2, 'Two resources now');
      t.ok(event.resources.includes(scheduler.resourceStore.getAt(0)), 'First resource assigned');
      t.ok(event.resources.includes(scheduler.resourceStore.getAt(1)), 'Second resource assigned');
      next();
    }, {
      waitForSelectorNotFound: '.b-released'
    }, next => {
      t.selectorCountIs(scheduler.unreleasedEventSelector, 2);
      next();
    }, {
      click: 'button:contains(Delete)'
    }, {
      waitForSelectorNotFound: scheduler.unreleasedEventSelector
    });
  });
  t.it('Should select correct resource in event editor resource combo when creating new event using assignment store', async t => {
    await getMultiScheduler({
      startDate: new Date(2017, 0, 1),
      endDate: new Date(2017, 0, 3),
      features: {
        eventTooltip: false,
        eventEdit: true
      },
      resources: [{
        id: 1,
        name: 'Celia',
        city: 'Barcelona'
      }, {
        id: 2,
        name: 'Lee',
        city: 'London'
      }, {
        id: 3,
        name: 'Henrik',
        city: 'London'
      }],
      events: [],
      assignments: [{
        resourceId: 1,
        eventId: 1
      }, {
        resourceId: 2,
        eventId: 1
      }]
    }, false);
    t.chain({
      dblClick: '.b-sch-timeaxis-cell',
      offset: [1, 1]
    }, {
      type: 'foo',
      target: 'input:focus'
    }, next => {
      const resourceCombo = bryntum.query('resourcecombo');
      t.isDeeply(resourceCombo.value, [1], 'Resource combo has correct initial value');
      next();
    }, {
      click: 'button:contains(Save)'
    }, {
      waitForSelector: '.b-sch-event:contains(foo)'
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/7444

  t.it('Should be able to delete a new multi assigned event from the editor', async t => {
    await getMultiScheduler({
      events: [],
      assignments: []
    });
    t.chain({
      dblClick: [50, 90]
    }, {
      waitFor: () => scheduler.features.eventEdit.editor.containsFocus
    }, {
      type: 'New test event'
    }, {
      click: '.b-icon-picker'
    }, {
      click: ':textEquals(Linda)'
    }, {
      click: ':textEquals(Save)'
    }, {
      dblClick: [50, 90]
    }, {
      click: ':textEquals(Delete)'
    }, () => {
      t.is(scheduler.eventStore.count, 0, 'EventStore is empty');
      t.is(scheduler.assignmentStore.count, 0, 'AssignmentStore is empty');
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/6862

  t.it('Should anchor to correct element with multi assignment', async t => {
    await getMultiScheduler();
    const eventEdit = scheduler.features.eventEdit;
    let element;
    t.chain({
      dblClick: '[data-event-id="1"]'
    }, (next, el) => {
      element = el = el.firstChild;
      t.is(eventEdit.editor.anchoredTo, el, 'Anchored to correct element');
      next();
    }, {
      type: '[ESC]'
    }, {
      waitForSelectorNotFound: '.b-eventeditor'
    }, {
      type: '[ENTER]'
    }, next => {
      t.is(eventEdit.editor.anchoredTo, element, 'Anchored to correct element');
      next();
    }, {
      type: '[ESC]'
    }, {
      waitForSelectorNotFound: '.b-eventeditor'
    }, {
      rightClick: '[data-event-id="1"]'
    }, {
      click: ':textEquals(Edit event)'
    }, () => {
      t.is(eventEdit.editor.anchoredTo, element, 'Anchored to correct element');
    });
  }); // https://github.com/bryntum/support/issues/210

  t.it('Removing one existing resource assignment of a multi assigned event should trigger one assignment store change event', async t => {
    await getMultiScheduler();
    t.firesOnce(scheduler.assignmentStore, 'change');
    await scheduler.assignmentStore.commit();
    t.chain({
      waitFor: () => document.querySelectorAll('.b-sch-event-wrap:not(.b-sch-released)').length === 2
    }, {
      dblclick: '.b-sch-event'
    }, next => {
      const resourceCombo = bryntum.query('resourcecombo');
      resourceCombo.value = ['r1'];
      next();
    }, {
      click: 'button:contains(Save)'
    }, {
      waitFor: () => document.querySelectorAll('.b-sch-event-wrap:not(.b-sch-released)').length === 1
    }, () => {
      t.is(scheduler.assignmentStore.added.count, 0, 'No assignment added after removing one existing');
      t.is(scheduler.assignmentStore.removed.count, 1, 'One old assignment removed');
      t.is(scheduler.assignmentStore.modified.count, 0, 'No modified');
    });
  });
  t.it('Adding 1 new assignment should trigger one assignment store change events', async t => {
    await getMultiScheduler(); // Add + commitAsync

    t.firesOk(scheduler.assignmentStore, {
      change: 2
    });
    scheduler.assignmentStore.commit();
    t.chain({
      waitFor: () => document.querySelectorAll('.b-sch-event-wrap').length === 2
    }, {
      dblclick: '.b-sch-event'
    }, next => {
      const resourceCombo = bryntum.query('resourcecombo');
      resourceCombo.value = ['r1', 'r2', 'r3'];
      next();
    }, {
      click: 'button:contains(Save)'
    }, {
      waitFor: () => document.querySelectorAll('.b-sch-event-wrap').length === 3
    }, () => {
      t.is(scheduler.assignmentStore.added.count, 1, 'No assignment added after removing one existing');
      t.is(scheduler.assignmentStore.removed.count, 0, 'No assignment removed');
      t.is(scheduler.assignmentStore.modified.count, 0, 'no modified');
    });
  });
  t.it('Removing one existing resource assignment of a multi assigned event + adding 1 new should trigger 2 assignment store change events', async t => {
    let commitCalls = 0;
    t.mockUrl('read', {
      delay: 200,
      responseText: JSON.stringify([{
        id: 1,
        resourceId: 'r1',
        eventId: 1
      }, {
        id: 2,
        resourceId: 'r2',
        eventId: 1
      }])
    });
    await getMultiScheduler({
      assignmentStore: new AssignmentStore({
        autoCommit: true,
        readUrl: 'read'
      })
    });
    const {
      assignmentStore
    } = scheduler; // there is inline data and first project commit which clears changes is triggered from there.
    // we are loading data from external source here, need to commit manually

    await assignmentStore.load();
    await t.waitForProjectReady(scheduler);
    await assignmentStore.acceptChanges();
    assignmentStore.on({
      // prevent actual requests
      beforecommit() {
        commitCalls++;
        return false;
      }

    });
    t.chain({
      waitFor: () => document.querySelectorAll('.b-sch-event-wrap').length === 2
    }, {
      dblclick: '.b-sch-event'
    }, async () => {
      commitCalls = 0;
      const resourceCombo = bryntum.query('resourcecombo');
      resourceCombo.value = ['r1', 'r3']; // Add + remove + engine commit

      t.willFireNTimes(assignmentStore, 'change', 3);
    }, {
      click: 'button:contains(Save)'
    }, () => {
      t.is(assignmentStore.added.count, 1, 'Single assignment added');
      t.is(assignmentStore.removed.count, 1, 'Single assignment removed');
      t.is(assignmentStore.modified.count, 0, 'No assignment modified');
      t.is(commitCalls, 1, 'Assignment store just made one commit');
    });
  }); // https://github.com/bryntum/support/issues/233

  t.it('Editing dates of a multi assigned event should NOT cause change to assignment store', async t => {
    await getMultiScheduler();
    const assignmentStore = scheduler.assignmentStore;
    t.wontFire(assignmentStore, 'change');
    assignmentStore.commit();
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      dblclick: '.b-timefield .b-icon-angle-right'
    }, {
      type: '[ENTER]'
    }, () => {
      t.is(assignmentStore.added.count, 0, 'no added');
      t.is(assignmentStore.removed.count, 0, 'no removed');
      t.is(assignmentStore.modified.count, 0, 'no modified');
    });
  });
});