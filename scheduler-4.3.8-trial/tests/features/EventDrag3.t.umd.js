"use strict";

StartTest({
  defaultTimeout: 90000
}, t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
  });

  const getScheduler = config => t.getScheduler(Object.assign({
    features: {
      eventDrag: true
    }
  }, config));

  t.it('Should target resource row if center point of event bar is inside the row', t => {
    scheduler = getScheduler({
      rowHeight: 40,
      barMargin: 0,
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 10)
      }]
    });
    t.chain({
      drag: scheduler.eventSelector,
      by: [0, 30]
    }, () => {
      const evt = scheduler.eventStore.first;
      t.expect(evt.get('resourceId')).toBe('r2');
    });
  });
  t.it('Event tooltip should hide when drag drop starts', t => {
    scheduler = getScheduler({
      features: {
        eventTooltip: true,
        eventDrag: true
      },
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 7)
      }]
    });
    t.chain({
      moveCursorTo: [1, 1]
    }, {
      moveCursorTo: scheduler.eventSelector
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    }, {
      drag: scheduler.eventSelector,
      by: [100, 0],
      dragOnly: true
    }, next => {
      t.selectorNotExists('.b-sch-event-tooltip', 'Event tooltip hidden when drag drop starts');
      next();
    }, {
      mouseUp: null
    });
  });
  t.it('Should move event to same resource as target event if dropped on an event', t => {
    scheduler = getScheduler({
      barMargin: 0,
      features: {
        eventTooltip: false,
        eventDrag: true
      },
      events: [{
        id: 1,
        name: 'one',
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 7)
      }, {
        id: 2,
        name: 'two',
        resourceId: 'r2',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 7)
      }]
    });
    t.chain({
      drag: scheduler.eventSelector + ':contains(two)',
      to: scheduler.eventSelector + ':contains(one)'
    }, () => {
      t.expect(scheduler.eventStore.getById(2).resourceId).toBe('r1');
    });
  });
  t.it('Should not allow dragging if readOnly', async t => {
    scheduler = t.getScheduler({
      readOnly: true,
      features: {
        eventEdit: true
      }
    });
    await t.waitForProjectReady();
    const box = document.querySelector(scheduler.eventSelector).getBoundingClientRect();
    t.wontFire(scheduler, 'beforeeventdrag');
    t.wontFire(scheduler, 'eventdragstart');
    t.chain({
      drag: scheduler.eventSelector,
      by: [-10, 0]
    }, (next, element) => {
      const newBox = element.getBoundingClientRect();
      t.is(newBox.left, box.left, 'Event not moved when dragged');
    });
  });
  t.it('Should be able to drag when using AssignmentStore', t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }],
      events: [{
        id: 1,
        startDate: new Date(2017, 0, 1, 10),
        endDate: new Date(2017, 0, 1, 12)
      }],
      assignments: [{
        resourceId: 'r1',
        eventId: 1
      }, {
        resourceId: 'r2',
        eventId: 1
      }],
      startDate: new Date(2017, 0, 1, 6),
      endDate: new Date(2017, 0, 1, 20),
      viewPreset: 'hourAndDay',
      enableEventAnimations: false
    });
    t.chain({
      drag: '[data-event-id="1"]',
      by: [65, 0]
    }, () => {
      t.is(scheduler.eventStore.first.startDate, new Date(2017, 0, 1, 11), 'startDate updated');
      const [first, second] = Array.from(document.querySelectorAll('[data-event-id="1"]'));
      t.is(first.getBoundingClientRect().left, second.getBoundingClientRect().left, 'Both instances moved');
    });
  });
  t.it('Should be able to abort a drag when using AssignmentStore', t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }],
      events: [{
        id: 1,
        startDate: new Date(2017, 0, 1, 10),
        endDate: new Date(2017, 0, 1, 12)
      }],
      assignments: [{
        resourceId: 'r1',
        eventId: 1
      }, {
        resourceId: 'r2',
        eventId: 1
      }],
      startDate: new Date(2017, 0, 1, 6),
      endDate: new Date(2017, 0, 1, 20),
      viewPreset: 'hourAndDay',
      enableEventAnimations: false
    });
    t.wontFire(scheduler.eventStore, 'update');
    t.wontFire(scheduler.assignmentStore, 'update');
    t.chain({
      drag: '[data-event-id="1"]',
      by: [65, 0],
      dragOnly: true
    }, {
      type: '[ESC]'
    });
  });
  t.it('Should be able to reassign when using AssignmentStore', t => {
    scheduler = new Scheduler({
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
        startDate: new Date(2017, 0, 1, 10),
        endDate: new Date(2017, 0, 1, 12)
      }],
      assignments: [{
        id: 1,
        resourceId: 'r1',
        eventId: 1
      }, {
        id: 2,
        resourceId: 'r2',
        eventId: 1
      }],
      startDate: new Date(2017, 0, 1, 6),
      endDate: new Date(2017, 0, 1, 20),
      viewPreset: 'hourAndDay',
      enableEventAnimations: false,

      eventRenderer({
        eventRecord,
        resourceRecord,
        renderData
      }) {
        renderData.cls.add(resourceRecord.id);
        return eventRecord.id + resourceRecord.id;
      }

    });
    t.chain({
      drag: '[data-event-id="1"]',
      by: [0, 120]
    }, () => {
      t.isDeeply(scheduler.assignmentStore.map(r => r.resourceId), ['r3', 'r2'], 'Assignment updated');
      t.isGreater(document.querySelector('.r3').getBoundingClientRect().top, document.querySelector('.r2').getBoundingClientRect().bottom, 'Moved below');
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/8258

  t.it('Dragging event outside of timeline when using AssignmentStore', t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      columns: [{
        text: 'name',
        field: 'name',
        locked: true
      }],
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }],
      events: [{
        id: 1,
        startDate: new Date(2017, 0, 1, 10),
        endDate: new Date(2017, 0, 1, 12)
      }],
      assignments: [{
        resourceId: 'r1',
        eventId: 1
      }, {
        resourceId: 'r2',
        eventId: 1
      }],
      startDate: new Date(2017, 0, 1, 6),
      endDate: new Date(2017, 0, 1, 20),
      viewPreset: 'hourAndDay',
      enableEventAnimations: false,
      features: {
        eventTooltip: false
      }
    });
    t.wontFire(scheduler.eventStore, 'update');
    t.wontFire(scheduler.assignmentStore, 'update');
    t.chain({
      drag: '[data-event-id="1"]',
      by: [-400, 0],
      dragOnly: true
    }, {
      type: '[ESC]'
    }, () => {
      t.pass('No error thrown');
    });
  });
  t.it('Dragging event to overlay splitter', t => {
    scheduler = t.getScheduler(); // The bug was because the elementFromPoint of the left end of the dragged
    // event was over the expanded, touchable splitter zone, so the resolveResource
    // could not ascertain the resource the event was being dragged over.
    // This class must be added to reproduce that scenario since we do not test on touch devices!

    scheduler.element.classList.add('b-touch');
    t.chain({
      drag: '[data-event-id=1]',
      by: [-99, 0]
    }, {
      drag: '[data-event-id=1]',
      by: [0, scheduler.rowHeight]
    }, // Should have been dragged down to the next resource row.
    () => {
      t.is(scheduler.eventStore.first.resourceId, 'r2', 'Drag to next row has succeeded');
    });
  });
  t.it('Should be able to drag event to before the start of the time axis', t => {
    scheduler = t.getScheduler();
    t.chain({
      drag: '[data-event-id=1]',
      by: [-250, 0]
    }, () => {
      t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 1, 12), 'startDate has changed');
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/6787

  t.it('Invalid drop should make no influence on event changing', t => {
    scheduler = t.getScheduler({
      features: {
        eventEdit: true
      }
    });
    t.isFiredWithSignature(scheduler, 'afterEventDrop', function ({
      valid
    }) {
      return !valid;
    }, 'Drop operation must be invalid for this test');
    t.chain( // Make invalid drop by dragging outside the view
    async () => t.dragTo('[data-event-id=1]', '.b-grid-cell', null, null, null, null, null, [-10, '50%']), // Open editor, change something in the event and save
    {
      dblclick: '[data-event-id=1]'
    }, {
      dblclick: '.b-eventeditor .b-textfield'
    }, {
      type: 'test',
      target: '.b-eventeditor .b-textfield input'
    }, {
      click: '.b-button.b-green'
    }, // Expect changes applied
    {
      waitForSelector: scheduler.eventSelector + ':contains(test)'
    }, // Click outside the event shouldn't lead to the failure
    {
      click: '.b-sch-header-row-main .b-sch-header-timeaxis-cell',
      desc: 'No exceptions expected'
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/5290/details

  t.it('Drop should include browser event', t => {
    let dropped = false;
    scheduler = t.getScheduler({
      listeners: {
        eventDrop({
          context,
          event
        }) {
          t.is(event.target.innerText.trim(), 'Assignment 2', 'Correct target element');
          t.is(context.targetEventRecord.id, 2, 'Correct target event record');
          t.is(context.newResource.id, 'r2', 'Correct target resource record');
          dropped = true;
        }

      }
    });
    t.chain({
      drag: '.event1',
      to: '.event2'
    }, {
      waitFor: () => dropped
    });
  });
  t.it('Should be able to invalidate drag in `beforeEventDropFinalize` listener', t => {
    let dropped = false;
    scheduler = t.getScheduler({
      listeners: {
        beforeEventDropFinalize({
          event,
          context
        }) {
          context.valid = false;
          t.is(event.target.innerText.trim(), 'Assignment 2', 'Correct target element');
          t.is(context.targetEventRecord.id, 2, 'Correct target event record');
          t.is(context.newResource.id, 'r2', 'Correct target resource record');
          dropped = true;
        }

      }
    });
    t.chain({
      drag: '.event1',
      to: '.event2'
    }, {
      waitFor: () => dropped
    });
  });
  t.it('Should show message and block drop if validator returns object with `valid` false', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventDrag: {
          validatorFn() {
            return {
              valid: false,
              message: 'msg'
            };
          }

        }
      },
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      }]
    });
    t.wontFire(scheduler.eventStore, 'change');
    t.chain({
      drag: scheduler.eventSelector,
      by: [100, 0],
      dragOnly: true
    }, {
      waitForSelector: '.b-tooltip .b-sch-tip-message:textEquals(msg)'
    }, {
      mouseUp: null
    });
  });
  t.it('Should not show message if validator returns object with `valid` true', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventDrag: {
          validatorFn({
            resourceRecord,
            eventRecord,
            start,
            end
          }, event) {
            return {
              valid: true
            };
          }

        }
      },
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      }]
    });
    t.firesOnce(scheduler.eventStore, 'change');
    t.chain({
      drag: scheduler.eventSelector,
      by: [100, 0],
      dragOnly: true
    }, {
      waitForSelector: '.b-tooltip .b-sch-tip-message:empty'
    }, {
      mouseUp: null
    });
  });
  t.it('Should consider undefined return value as valid action', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventDrag: {
          validatorFn({
            resourceRecord,
            eventRecord,
            start,
            end
          }, event) {}

        }
      },
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      }]
    });
    t.firesOnce(scheduler.eventStore, 'change');
    t.chain({
      drag: scheduler.eventSelector,
      by: [100, 0]
    });
  });
});