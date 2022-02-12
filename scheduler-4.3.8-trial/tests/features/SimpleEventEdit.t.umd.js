"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    var _scheduler, _scheduler$destroy;

    (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : (_scheduler$destroy = _scheduler.destroy) === null || _scheduler$destroy === void 0 ? void 0 : _scheduler$destroy.call(_scheduler);
  });
  t.it('Should show editor on event dblclick', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventEdit: false,
        simpleEventEdit: true
      },
      events: [{
        resourceId: 'r1'
      }]
    });
    scheduler.eventStore.first.startDate = scheduler.startDate;
    scheduler.eventStore.first.duration = 1;
    t.firesOnce(scheduler.features.simpleEventEdit, 'beforestart');
    t.firesOnce(scheduler.features.simpleEventEdit, 'start');
    t.firesOnce(scheduler.features.simpleEventEdit, 'beforecomplete');
    t.firesOnce(scheduler.features.simpleEventEdit, 'complete');
    t.chain({
      dblclick: '.b-sch-event'
    }, // This is a test for a bug which was masked by turbo mode.
    // Focus would bounce out of the editor due to the Navigator mistaking
    // focusing the editor for a TAB out.  Give it a chance to exhibit bad behaviour.
    // Focus should remain in the editor.
    {
      waitFor: 500
    }, {
      waitFor: () => {
        var _scheduler$features$s;

        return (_scheduler$features$s = scheduler.features.simpleEventEdit.editor) === null || _scheduler$features$s === void 0 ? void 0 : _scheduler$features$s.containsFocus;
      }
    }, async () => {
      t.is(t.rect('.b-simpleeventeditor .b-field').height, t.rect('.b-simpleeventeditor').height, 'Input field fills the editor');
    }, {
      type: 'Foo[ENTER]'
    }, () => {
      t.is(scheduler.eventStore.first.name, 'Foo', 'Name set');
    });
  });
  t.it('Should start edit on Enter', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventEdit: false,
        simpleEventEdit: true
      },
      events: [{
        resourceId: 'r1'
      }]
    });
    scheduler.eventStore.first.startDate = scheduler.startDate;
    scheduler.eventStore.first.duration = 1;
    t.willFireNTimes(scheduler.features.simpleEventEdit, 'beforestart', 2);
    t.willFireNTimes(scheduler.features.simpleEventEdit, 'start', 2);
    t.willFireNTimes(scheduler.features.simpleEventEdit, 'beforecomplete', 2);
    t.willFireNTimes(scheduler.features.simpleEventEdit, 'complete', 2);
    t.chain({
      click: '.b-sch-event'
    }, {
      type: '[ENTER]'
    }, // This is a test for a bug which was masked by turbo mode.
    // Focus would bounce out of the editor due to the Navigator mistaking
    // focusing the editor for a TAB out.  Give it a chance to exhibit bad behaviour.
    // Focus should remain in the editor.
    {
      waitFor: 500
    }, {
      waitForSelector: '.b-editor input:focus'
    }, {
      type: 'foo[ENTER]'
    }, next => {
      t.selectorNotExists('.b-sch-dragcreator-proxy');
      t.is(scheduler.eventStore.first.name, 'foo', 'Name set');
      next();
    }, {
      type: '[ENTER]'
    }, {
      waitForSelector: '.b-editor input:focus'
    }, {
      type: 'bar[ENTER]'
    }, () => {
      t.selectorNotExists('.b-sch-dragcreator-proxy');
      t.is(scheduler.eventStore.first.name, 'foobar', 'Name updated');
    });
  });
  t.it('Should edit name on dblclick', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventEdit: false,
        simpleEventEdit: true
      },
      events: []
    });
    t.firesOnce(scheduler.features.simpleEventEdit, 'beforestart');
    t.firesOnce(scheduler.features.simpleEventEdit, 'start');
    t.firesOnce(scheduler.features.simpleEventEdit, 'beforecomplete');
    t.firesOnce(scheduler.features.simpleEventEdit, 'complete');
    t.chain({
      dblclick: '.b-sch-timeaxis-cell'
    }, // This is a test for a bug which was masked by turbo mode.
    // Focus would bounce out of the editor due to the Navigator mistaking
    // focusing the editor for a TAB out.  Give it a chance to exhibit bad behaviour.
    // Focus should remain in the editor.
    {
      waitFor: 500
    }, {
      type: 'Foo[ENTER]'
    }, () => {
      t.selectorNotExists('.b-sch-dragcreator-proxy');
      t.is(scheduler.eventStore.count, 1);
      t.is(scheduler.eventStore.first.name, 'Foo');
    });
  }); // https://github.com/bryntum/support/issues/3327

  t.describe('Should show simple edit when creating new event when both eventEdit + simpleEventEdit features are present', async t => {
    t.it('Creating new event with drag create', async t => {
      scheduler = t.getScheduler({
        features: {
          eventEdit: true,
          simpleEventEdit: true
        },
        eventStore: {
          autoCommit: true,
          createUrl: 'create'
        },
        events: []
      });
      t.firesOnce(scheduler.eventStore, 'beforeCommit');
      scheduler.eventStore.on('beforeCommit', () => false);
      await t.dragBy({
        source: '.b-sch-timeaxis-cell',
        delta: [100, 0]
      });
      t.is(scheduler.eventStore.first.isCreating, true, 'Is creating');
      await t.type(null, 'foo[ENTER]');
      t.is(scheduler.eventStore.first.isCreating, false, 'Not creating');
      t.selectorExists('.b-sch-event:contains(foo)');
    }); // https://github.com/bryntum/support/issues/3342

    t.it('Creating new event with dblClick', async t => {
      scheduler = t.getScheduler({
        features: {
          eventEdit: true,
          simpleEventEdit: true
        },
        eventStore: {
          autoCommit: true,
          createUrl: 'create'
        },
        events: []
      });
      t.firesOnce(scheduler.eventStore, 'beforeCommit');
      scheduler.eventStore.on('beforeCommit', () => false);
      await t.doubleClick('.b-sch-timeaxis-cell');
      t.is(scheduler.eventStore.first.isCreating, true, 'Is creating');
      await t.type(null, 'foo[ENTER]');
      t.is(scheduler.eventStore.first.isCreating, false, 'Not creating');
      t.selectorExists('.b-sch-event:contains(foo)');
      t.doubleClick('.b-sch-event:contains(foo)');
      await t.waitForSelector('.b-eventeditor');
    }); // https://github.com/bryntum/support/issues/3342

    t.it('Creating new event with context menu', async t => {
      scheduler = t.getScheduler({
        features: {
          eventEdit: true,
          simpleEventEdit: true
        },
        eventStore: {
          autoCommit: true,
          createUrl: 'create'
        },
        events: []
      });
      t.firesOnce(scheduler.eventStore, 'beforeCommit');
      scheduler.eventStore.on('beforeCommit', () => false);
      await t.rightClick('.b-sch-timeaxis-cell');
      await t.click('.b-menuitem:contains(Add)');
      t.is(scheduler.eventStore.first.isCreating, true, 'Is creating');
      await t.type(null, 'foo[ENTER]');
      t.is(scheduler.eventStore.first.isCreating, false, 'Not creating');
      t.selectorExists('.b-sch-event:contains(foo)');
    });
  });
  t.it('Should not edit name on dblclick if readOnly', async t => {
    scheduler = await t.getSchedulerAsync({
      readOnly: true,
      features: {
        eventEdit: false,
        simpleEventEdit: true
      },
      events: []
    });
    t.chain({
      dblclick: '.b-sch-timeaxis-cell'
    }, // Nothing should happen so we cannot wait for an event
    {
      waitFor: 300
    }, () => {
      t.selectorNotExists('.b-editor', 'Editor correctly not started');
    });
  });
  t.it('Should edit name on drag create', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventEdit: false,
        simpleEventEdit: true
      },
      events: []
    });
    t.firesOnce(scheduler.features.simpleEventEdit, 'beforestart');
    t.firesOnce(scheduler.features.simpleEventEdit, 'start');
    t.firesOnce(scheduler.features.simpleEventEdit, 'beforecomplete');
    t.firesOnce(scheduler.features.simpleEventEdit, 'complete');
    t.chain({
      drag: '.b-sch-timeaxis-cell',
      by: [100, 0]
    }, {
      waitForSelector: '.b-editor input:focus'
    }, {
      type: 'bar[ENTER]'
    }, () => {
      t.selectorNotExists('.b-sch-dragcreator-proxy');
      t.is(scheduler.eventStore.count, 1);
      t.is(scheduler.eventStore.first.name, 'bar');
    });
  });
  t.it('Should cancel on Escape', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventEdit: false,
        simpleEventEdit: true
      },
      events: []
    });
    t.firesOnce(scheduler.features.simpleEventEdit, 'beforestart');
    t.firesOnce(scheduler.features.simpleEventEdit, 'start');
    t.firesOnce(scheduler.features.simpleEventEdit, 'beforecancel');
    t.firesOnce(scheduler.features.simpleEventEdit, 'cancel');
    t.chain({
      dblclick: '.b-sch-timeaxis-cell'
    }, {
      type: 'Foo[ESCAPE]'
    }, () => {
      t.selectorNotExists('.b-sch-dragcreator-proxy');
    });
  });
  t.it('Should support disabling', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventEdit: false,
        simpleEventEdit: true
      }
    });
    scheduler.features.simpleEventEdit.disabled = true;
    t.chain({
      dblClick: '.b-sch-event'
    }, next => {
      t.selectorNotExists('input', 'Not editing');
      scheduler.features.simpleEventEdit.disabled = false;
      next();
    }, {
      dblClick: '.b-sch-event'
    }, // https://github.com/bryntum/support/issues/292
    {
      type: '[RIGHT]',
      target: 'input:focus'
    }, () => {
      t.selectorExists('input', 'Editing');
    });
  });
  t.it('Event should be removed upon cancel', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'hourAndDay',
      features: {
        eventEdit: false,
        simpleEventEdit: true
      },
      events: []
    });
    t.chain({
      drag: '.b-sch-timeaxis-cell',
      offset: [100, '50%'],
      by: [60, 0]
    }, {
      waitForSelector: '.b-editor input:focus',
      desc: 'Editor is visible'
    }, {
      type: '[ESCAPE]'
    }, {
      waitForSelectorNotFound: '.b-sch-event-wrap:not(.b-released)'
    }, () => {
      t.notOk(scheduler.eventStore.count, 'Event not finally added');
    });
  });
  t.it('Stores should report added records correctly', async t => {
    let assignmentStore, eventStore, resourceStore;

    async function createSchedulerAndEvent(t, config) {
      var _scheduler2;

      (_scheduler2 = scheduler) === null || _scheduler2 === void 0 ? void 0 : _scheduler2.destroy();
      scheduler = new Scheduler(Object.assign({
        appendTo: document.body,
        startDate: new Date(2018, 5, 11),
        endDate: new Date(2018, 5, 25),
        features: {
          eventEdit: false,
          simpleEventEdit: true
        }
      }, config));
      ({
        assignmentStore,
        eventStore,
        resourceStore
      } = scheduler);
      await t.waitForProjectReady(scheduler);
      await t.dragBy({
        source: '.b-sch-timeaxis-cell',
        offset: [100, '50%'],
        delta: [60, 0]
      });
      await t.waitForSelector('.b-editor input:focus');
      await t.type('input:focus', 'Foo[ENTER]');
    }

    function assertRelation(t) {
      const assignment = assignmentStore.first,
            event = eventStore.first,
            resource = resourceStore.first;
      t.is(assignment.eventId, event.id, 'eventId is ok');
      t.is(assignment.resourceId, resource.id, 'resourceId is ok');
      t.is(assignment.event, event, 'Event is ok');
      t.is(assignment.resource, resource, 'Resource is ok');
    }

    t.it('Using crudmanager', async t => {
      var _changes$assignments, _changes$assignments2, _changes$assignments3, _changes$assignments4;

      await createSchedulerAndEvent(t, {
        crudManager: {
          resourceStore: {
            data: [{
              id: 'r1',
              name: 'test'
            }]
          }
        }
      });
      t.is(assignmentStore.added.count, 1, 'Single assignment added');
      t.is(eventStore.added.count, 1, 'Single event added');
      t.is(assignmentStore.added.values[0], assignmentStore.last, 'Assignment instance is ok');
      t.is(eventStore.added.values[0], eventStore.last, 'Event instance is ok');
      const {
        changes
      } = scheduler.crudManager,
            assignment = assignmentStore.last,
            event = eventStore.last;
      t.is((_changes$assignments = changes.assignments) === null || _changes$assignments === void 0 ? void 0 : _changes$assignments.added.length, 1, 'Assignment is in changeset');
      t.is((_changes$assignments2 = changes.assignments) === null || _changes$assignments2 === void 0 ? void 0 : _changes$assignments2.added[0].$PhantomId, assignment.id, 'Assignment id is ok');
      t.is((_changes$assignments3 = changes.assignments) === null || _changes$assignments3 === void 0 ? void 0 : _changes$assignments3.added[0].eventId, event.id, 'Assignment event id is ok');
      t.is((_changes$assignments4 = changes.assignments) === null || _changes$assignments4 === void 0 ? void 0 : _changes$assignments4.added[0].resourceId, 'r1', 'Assignment resource id is ok');
    });
    t.it('No crud, single assignment', async t => {
      await createSchedulerAndEvent(t, {
        resourceStore: {
          data: [{
            id: 'r1',
            name: 'test'
          }]
        },
        eventStore: {
          createUrl: '/3203/newevent'
        }
      });
      t.is(eventStore.added.count, 1, 'Single event added');
      t.is(eventStore.added.values[0], eventStore.last, 'Event instance is ok');
      t.is(assignmentStore.count, 1, 'Assignment record added');
      t.is(assignmentStore.added.count, 0, 'Assignment record is not in the added bag yet');
      t.mockUrl('/3203/newevent', {
        responseText: JSON.stringify({
          success: true,
          data: [{
            id: 100
          }]
        })
      });
      await eventStore.commit();
      t.is(assignmentStore.added.count, 1, 'Single assignment added');
      t.is(assignmentStore.added.values[0], assignmentStore.last, 'Assignment instance is ok');
      assertRelation(t);
    });
    t.it('No crud, multi assignment', async t => {
      let id = 100;
      t.mockUrl('/3203/create', () => {
        return {
          parsedJson: {
            success: true,
            data: [{
              id: id++
            }]
          }
        };
      });
      await createSchedulerAndEvent(t, {
        resourceStore: {
          data: [{
            id: 1,
            name: 'test'
          }]
        },
        assignmentStore: {
          data: [{
            id: 1,
            resourceId: 1,
            eventId: 1
          }],
          createUrl: '/3203/create'
        },
        eventStore: {
          data: [{
            id: 1,
            name: 'Event'
          }],
          createUrl: '/3203/create'
        }
      });
      t.is(eventStore.added.count, 1, 'Single event added');
      t.is(eventStore.added.values[0], eventStore.last, 'Event instance is ok');
      t.is(assignmentStore.count, 2, 'Assignment record added');
      t.is(assignmentStore.added.count, 0, 'Assignment record is not in the added bag yet');
      await eventStore.commit();
      t.is(assignmentStore.added.count, 1, 'Added bag has single assignment');
      t.is(assignmentStore.added.values[0], assignmentStore.last, 'Assignment instance is ok');
      await assignmentStore.commit();
      t.is(assignmentStore.added.count, 0, 'Added bag is empty');
      t.is(assignmentStore.last.id, 101, 'Assignment instance id is updated');
      assertRelation(t);
    });
  });
});