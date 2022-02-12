"use strict";

StartTest(t => {
  t.describe('All drag events should be fired and handled correctly', t => {
    let scheduler,
        beforeFinalize = false;
    t.beforeEach(() => {
      var _scheduler;

      (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
    });

    async function setup(config) {
      scheduler = await t.getScheduler(Object.assign({
        features: {
          eventDragCreate: true,
          eventDrag: true,
          eventResize: true,
          eventEdit: false
        }
      }, config));
      beforeFinalize = false;
      return scheduler;
    }

    t.it('Assert dragcreate events (async)', async t => {
      scheduler = await setup({
        listeners: {
          beforedragcreatefinalize({
            context
          }) {
            beforeFinalize = context.async = true;
            context.finalize(true);
          }

        }
      });
      t.firesOnce(scheduler, 'dragcreatestart', 'dragcreatestart is fired');
      t.firesOnce(scheduler, 'beforedragcreate', 'beforedragcreate is fired');
      t.firesOnce(scheduler, 'beforeeventadd', 'beforeeventadd is fired');
      t.firesOnce(scheduler, 'afterdragcreate', 'afterdragcreate is fired');
      t.firesOnce(scheduler, 'dragcreateend', 'dragcreateend is fired');
      t.chain({
        drag: '.b-sch-timeaxis-cell',
        fromOffset: [20, 20],
        by: [100, 0]
      }, () => {
        t.is(beforeFinalize, true, 'beforedragcreatefinalize fired');
        t.notOk(scheduler.scrollManager.isScrolling, 'No active scrollables');
      });
    });
    t.it('Assert dragcreate events (sync)', async t => {
      scheduler = await setup({
        listeners: {
          beforedragcreatefinalize({
            context
          }) {
            beforeFinalize = true;
          }

        }
      });
      t.firesOnce(scheduler, 'dragcreatestart', 'dragcreatestart is fired');
      t.firesOnce(scheduler, 'beforedragcreate', 'beforedragcreate is fired');
      t.firesOnce(scheduler, 'beforeeventadd', 'beforeeventadd is fired');
      t.firesOnce(scheduler, 'afterdragcreate', 'afterdragcreate is fired');
      t.firesOnce(scheduler, 'dragcreateend', 'dragcreateend is fired');
      t.chain({
        drag: '.b-sch-timeaxis-cell',
        fromOffset: [20, 20],
        by: [100, 0]
      }, () => {
        t.is(beforeFinalize, true, 'beforedragcreatefinalize fired');
      });
    });
    t.it('Assert drag events (async)', async t => {
      scheduler = await setup({
        listeners: {
          beforeeventdropfinalize({
            context
          }) {
            beforeFinalize = context.async = true;
            context.finalize(true);
          }

        }
      });
      t.firesOnce(scheduler, 'eventdragstart', 'eventdragstart is fired');
      t.firesOnce(scheduler, 'eventdrop', 'eventdrop is fired');
      t.firesOnce(scheduler, 'beforeeventdrag', 'beforeeventdrag is fired');
      t.firesOnce(scheduler, 'aftereventdrop', 'aftereventdrop is fired');
      t.chain({
        drag: '.b-sch-event',
        by: [100, 0]
      }, () => {
        t.is(beforeFinalize, true, 'beforeeventdropfinalize fired');
      });
    });
    t.it('Assert drag events (sync)', async t => {
      scheduler = await setup({
        listeners: {
          beforeeventdropfinalize({
            context
          }) {
            beforeFinalize = true;
          }

        }
      });
      t.firesOnce(scheduler, 'eventdragstart', 'eventdragstart is fired');
      t.firesOnce(scheduler, 'eventdrop', 'eventdrop is fired');
      t.firesOnce(scheduler, 'beforeeventdrag', 'beforeeventdrag is fired');
      t.firesOnce(scheduler, 'aftereventdrop', 'aftereventdrop is fired');
      t.chain({
        drag: '.b-sch-event',
        by: [100, 0]
      }, () => {
        t.is(beforeFinalize, true, 'beforeeventdropfinalize fired');
      });
    });
    t.it('Proxy element should be removed when drop is cancelled asynchronously', async t => {
      scheduler = await setup({
        listeners: {
          beforeeventdropfinalize({
            context
          }) {
            setTimeout(() => {
              context.finalize(false);
            }, 100);
            context.async = true;
          }

        }
      }); // Get rid of changes from initial calculations

      scheduler.eventStore.commit();
      t.chain({
        waitForEvent: [scheduler, 'aftereventdrop'],
        trigger: {
          drag: '.b-sch-event',
          by: [20, 0]
        }
      }, () => {
        t.notOk(scheduler.eventStore.changes, 'No modified records'); // https://www.assembla.com/spaces/bryntum/tickets/1524#/activity/ticket

        const dragProxyElement = document.querySelector('.b-sch-dragproxy');
        t.notOk(dragProxyElement, 'Drag proxy gone');
      });
    });
    t.it('Assert resize events (async)', async t => {
      scheduler = await setup({
        listeners: {
          beforeeventresizefinalize({
            context
          }) {
            beforeFinalize = context.async = true;
            context.finalize(true);
          }

        }
      });
      t.firesOnce(scheduler, 'beforeeventresize', 'beforeeventresize is fired');
      t.firesOnce(scheduler, 'eventresizestart', 'eventresizestart is fired');
      t.firesOnce(scheduler, 'eventresizeend', 'eventresizeend is fired');
      t.firesAtLeastNTimes(scheduler, 'eventpartialresize', 1, 'eventpartialresize is fired');
      t.chain({
        moveCursorTo: '.b-sch-event'
      }, {
        drag: '.b-sch-event',
        by: [100, 0],
        offset: ['100%-3', 5]
      }, () => {
        t.is(beforeFinalize, true, 'beforeeventresizefinalize fired');
      });
    });
    t.it('Assert resize events (sync)', async t => {
      scheduler = await setup({
        listeners: {
          beforeeventresizefinalize() {
            beforeFinalize = true;
          }

        }
      });
      t.firesOnce(scheduler, 'beforeeventresize', 'beforeeventresize is fired');
      t.firesOnce(scheduler, 'eventresizestart', 'eventresizestart is fired');
      t.firesOnce(scheduler, 'eventresizeend', 'eventresizeend is fired');
      t.firesAtLeastNTimes(scheduler, 'eventpartialresize', 1, 'eventpartialresize is fired');
      t.chain({
        moveCursorTo: '.b-sch-event'
      }, {
        drag: '.b-sch-event',
        by: [100, 0],
        offset: ['100%-3', 5]
      }, () => {
        t.is(beforeFinalize, true, 'beforeeventresizefinalize fired');
      });
    }); // https://github.com/bryntum/support/issues/865

    t.it('afterEventDrop should be fired when event is dropped outside the timeline', async t => {
      scheduler = await setup({
        features: {
          eventDrag: {
            constrainDragToTimeline: false
          }
        }
      });
      t.firesOnce(scheduler, 'afterEventDrop', 'afterEventDrop is fired');
      t.isFiredWithSignature(scheduler, 'afterEventDrop', ({
        valid
      }) => {
        return valid === false;
      }, 'Drop is invalid');
      t.chain({
        drag: '.b-sch-event',
        to: '.b-sch-header-row .b-sch-header-timeaxis-cell'
      });
    }); // https://github.com/bryntum/support/issues/2151

    t.it('Should be possible to determine in what resource row the event drag is about to start', async t => {
      let dragCounter = 1;
      scheduler = await setup({
        multiEventSelect: true,
        listeners: {
          beforeEventDrag({
            resourceRecord,
            eventRecord,
            eventRecords,
            assignmentRecords,
            event
          }) {
            t.ok(event instanceof MouseEvent, 'Before drag: Browser event is present');

            if (dragCounter === 1) {
              t.is(resourceRecord.id, 2, 'Before first drag: resource id is correct');
              t.is(eventRecord.id, 1, 'Before first drag: event id is correct');
              t.is(eventRecords.length, 1, 'Before first drag: number of events is correct');
              t.is(eventRecords[0].id, 1, 'Before first drag: event id in array of events is correct');
              t.is(assignmentRecords.length, 1, 'Before first drag: number of assignments is correct');
              t.is(assignmentRecords[0].id, 2, 'Before first drag: assignment id in array of assignments is correct');
            } else if (dragCounter === 2) {
              t.is(resourceRecord.id, 1, 'Before second drag: resource id is correct');
              t.is(eventRecord.id, 1, 'Before second drag: event id is correct');
              t.is(eventRecords.length, 1, 'Before second drag: number of events is correct');
              t.is(eventRecords[0].id, 1, 'Before second drag: event id in array of events is correct');
              t.is(assignmentRecords.length, 1, 'Before second drag: number of assignments is correct');
              t.is(assignmentRecords[0].id, 1, 'Before second drag: assignment id in array of assignments is correct');
            } else {
              t.is(resourceRecord.id, 2, 'Before third drag: resource id is correct');
              t.is(eventRecord.id, 1, 'Before third drag: event id is correct');
              t.is(eventRecords.length, 1, 'Before third drag: number of events is correct');
              t.is(eventRecords[0].id, 1, 'Before third drag: event id in array of events is correct');
              t.is(assignmentRecords.length, 2, 'Before third drag: number of assignments is correct');
              t.is(assignmentRecords[0].id, 2, 'Before third drag: assignment 2 id is correct');
              t.is(assignmentRecords[1].id, 1, 'Before third drag: assignment 1 id is correct');
            }
          },

          eventDragStart({
            resourceRecord,
            eventRecords,
            assignmentRecords,
            event
          }) {
            t.ok(event instanceof MouseEvent, 'Drag start: Browser event is present');

            if (dragCounter === 1) {
              t.is(resourceRecord.id, 2, 'First drag start: resource id is correct');
              t.is(eventRecords.length, 1, 'First drag start: number of events is correct');
              t.is(eventRecords[0].id, 1, 'First drag start: event id in array of events is correct');
              t.is(assignmentRecords.length, 1, 'First drag start: number of assignments is correct');
              t.is(assignmentRecords[0].id, 2, 'First drag start: assignment id is correct');
            } else if (dragCounter === 2) {
              t.is(resourceRecord.id, 1, 'Second drag start: resource id is correct');
              t.is(eventRecords.length, 1, 'Second drag start: number of events is correct');
              t.is(eventRecords[0].id, 1, 'Second drag start: event id in array of events is correct');
              t.is(assignmentRecords.length, 1, 'Second drag start: number of assignments is correct');
              t.is(assignmentRecords[0].id, 1, 'Second drag start: assignment id is correct');
            } else {
              t.is(resourceRecord.id, 2, 'Third drag start: resource id is correct');
              t.is(eventRecords.length, 1, 'Third drag start: number of events is correct');
              t.is(eventRecords[0].id, 1, 'Third drag start: event id in array of events is correct');
              t.is(assignmentRecords.length, 2, 'Third drag start: number of assignments is correct');
              t.is(assignmentRecords[0].id, 2, 'Third drag start: assignment 2 id is correct');
              t.is(assignmentRecords[1].id, 1, 'Third drag start: assignment 1 id is correct');
            }
          }

        },
        events: [{
          id: 1,
          name: 'Foo',
          startDate: new Date(2011, 0, 4),
          endDate: new Date(2011, 0, 5)
        }],
        resources: [{
          id: 1,
          name: 'Resource 1'
        }, {
          id: 2,
          name: 'Resource 2'
        }],
        assignments: [{
          id: 1,
          resourceId: 1,
          eventId: 1
        }, {
          id: 2,
          resourceId: 2,
          eventId: 1
        }]
      });
      t.diag('First drag');
      await t.dragBy('.b-sch-event-wrap[data-resource-id="2"]', [100, 0]);
      dragCounter++;
      t.diag('Second drag');
      await t.dragBy('.b-sch-event-wrap[data-resource-id="1"]', [100, 0]);
      dragCounter++;
      scheduler.clearEventSelection();
      t.diag('Third drag');
      scheduler.selectEvent(scheduler.eventStore.first);
      await t.dragBy('.b-sch-event-wrap[data-resource-id="2"]', [100, 0]);
    });
    t.it('Should be possible to determine in what resource row the event resize is about to start', async t => {
      let resizeCounter = 1;
      scheduler = await setup({
        multiEventSelect: true,
        listeners: {
          beforeEventResize({
            resourceRecord,
            event
          }) {
            t.ok(event instanceof MouseEvent, 'Before resize: Browser event is present');

            if (resizeCounter === 1) {
              t.is(resourceRecord.id, 2, 'Before first resize: resource id is correct');
            } else if (resizeCounter === 2) {
              t.is(resourceRecord.id, 1, 'Before second resize: resource id is correct');
            } else {
              t.is(resourceRecord.id, 2, 'Before third resize: resource id is correct');
            }
          },

          eventResizeStart({
            resourceRecord,
            event
          }) {
            t.ok(event instanceof MouseEvent, 'Resize start: Browser event is present');

            if (resizeCounter === 1) {
              t.is(resourceRecord.id, 2, 'First resize start: resource id is correct');
            } else if (resizeCounter === 2) {
              t.is(resourceRecord.id, 1, 'Second resize start: resource id is correct');
            } else {
              t.is(resourceRecord.id, 2, 'Third resize start: resource id is correct');
            }
          },

          eventResizeEnd({
            resourceRecord,
            event,
            changed
          }) {
            t.ok(event instanceof MouseEvent, 'Resize end: Browser event is present');

            if (resizeCounter === 1) {
              t.is(resourceRecord.id, 2, 'First resize end: resource id is correct');
              t.ok(changed, 'First resize end: changed OK');
            } else if (resizeCounter === 2) {
              t.is(resourceRecord.id, 1, 'Second resize end: resource id is correct');
              t.ok(changed, 'Second resize end: changed OK');
            } else {
              t.is(resourceRecord.id, 2, 'Third resize end: resource id is correct');
              t.ok(changed, 'Third resize end: changed OK');
            }
          }

        },
        events: [{
          id: 1,
          name: 'Foo',
          startDate: new Date(2011, 0, 4),
          endDate: new Date(2011, 0, 5)
        }],
        resources: [{
          id: 1,
          name: 'Resource 1'
        }, {
          id: 2,
          name: 'Resource 2'
        }],
        assignments: [{
          id: 1,
          resourceId: 1,
          eventId: 1
        }, {
          id: 2,
          resourceId: 2,
          eventId: 1
        }]
      });
      t.diag('First resize');
      await t.moveCursorTo('.b-sch-event-wrap[data-resource-id="2"]');
      await t.dragBy('.b-sch-event-wrap[data-resource-id="2"]', [100, 0], undefined, undefined, undefined, undefined, ['100%-3', 5]);
      resizeCounter++;
      t.diag('Second resize');
      await t.moveCursorTo('.b-sch-event-wrap[data-resource-id="1"]');
      await t.dragBy('.b-sch-event-wrap[data-resource-id="1"]', [100, 0], undefined, undefined, undefined, undefined, ['100%-3', 5]);
      resizeCounter++;
      t.diag('Third resize');
      scheduler.selectEvent(scheduler.eventStore.first);
      await t.moveCursorTo('.b-sch-event-wrap[data-resource-id="2"]');
      await t.dragBy('.b-sch-event-wrap[data-resource-id="2"]', [100, 0], undefined, undefined, undefined, undefined, ['100%-3', 5]);
    });
    t.it('Should stop dragdrop gracefully on 2nd mousedown', async t => {
      scheduler = await t.getSchedulerAsync({
        events: [{
          id: 1,
          resourceId: 'r1',
          startDate: '2011-01-04',
          duration: 1
        }],
        listeners: {
          beforeEventDropFinalize: async ({
            context
          }) => {
            context.async = true;
            await t.waitFor(100);
            context.finalize(true);
          }
        }
      });
      await t.mouseDown('.b-sch-event');
      await t.moveMouseBy([100, 30]);
      await t.mouseDown();
      await t.mouseUp();
      await t.waitFor(() => {
        const el = document.querySelector('[data-event-id="1"]'),
              rowEl = document.querySelector('.b-timeaxissubgrid [data-id="r2"]');
        return Rectangle.from(rowEl).contains(Rectangle.from(el));
      });
    }); // Cannot emulate blurring window in FF

    if (!t.bowser.firefox) {
      t.it('Should stop dragdrop gracefully on window blur', async t => {
        scheduler = await t.getSchedulerAsync({
          events: [{
            id: 1,
            resourceId: 'r1',
            startDate: '2011-01-04',
            duration: 1
          }],
          listeners: {
            beforeEventDropFinalize: async ({
              context
            }) => {
              context.async = true;
              await t.waitFor(100);
              context.finalize(true);
            }
          }
        });
        await t.mouseDown('.b-sch-event');
        await t.moveMouseBy([100, 30]);
        const {
          defaultView
        } = scheduler.element.ownerDocument;
        const promise = new Promise(resolve => defaultView.addEventListener('blur', () => resolve()));
        defaultView.parent.focus();
        await promise;
        await t.waitFor(() => {
          const el = document.querySelector('[data-event-id="1"]'),
                rowEl = document.querySelector('.b-timeaxissubgrid [data-id="r1"]');
          return Rectangle.from(rowEl).contains(Rectangle.from(el));
        });
      });
    }
  });
});