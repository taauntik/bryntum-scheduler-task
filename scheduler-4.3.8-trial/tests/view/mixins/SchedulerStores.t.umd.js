"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && !scheduler.isDestroyed && scheduler.destroy();
  });
  t.it('Should repaint each affected resource just once after eventStore#commit', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      resources: [{
        id: 1,
        name: 'First'
      }],
      startDate: new Date(2018, 0, 1),
      endDate: new Date(2018, 1, 31),
      events: [{
        id: 1,
        resourceId: 1,
        startDate: '2018-01-01',
        duration: 1
      }, {
        id: 2,
        resourceId: 1,
        startDate: '2018-02-01',
        duration: 1
      }]
    });
    await t.waitForProjectReady(scheduler);
    await scheduler.eventStore.first.shift(1);
    await scheduler.eventStore.last.shift(1);
    t.isCalledOnce('repaintEventsForResource', scheduler, 'Called just once even several resource events were changed');
    scheduler.eventStore.commit();
  });
  t.it('Should always have an AssignmentStore', async t => {
    async function create(config) {
      scheduler = new Scheduler(Object.assign({
        appendTo: document.body,
        useInitialAnimation: false,
        startDate: new Date(2019, 11, 13),
        endDate: new Date(2019, 11, 20)
      }, config));
      await t.waitForProjectReady();
    }

    function assert(t) {
      t.ok(scheduler.assignmentStore, 'Has AssignmentStore');
      t.is(scheduler.assignmentStore.count, 2, 'With correct amount of assignments in it');
      const [firstAssignment, lastAssignment] = scheduler.assignmentStore,
            [firstEvent, lastEvent] = scheduler.eventStore,
            [firstResource, lastResource] = scheduler.resourceStore;
      t.is(firstAssignment.event, firstEvent, 'First assignment has correct event');
      t.is(lastAssignment.event, lastEvent, 'Last assignment has correct event');
      t.is(firstAssignment.resource, firstResource, 'First assignment has correct resource');
      t.is(lastAssignment.resource, firstResource, 'Last assignment has correct resource');
      t.is(firstEvent.resource, firstResource, 'First event has correct resource');
      t.isDeeply(firstEvent.resources, [firstResource], 'First event has correct resources');
      t.is(lastEvent.resource, firstResource, 'Last event has correct resource');
      t.isDeeply(lastEvent.resources, [firstResource], 'Last event has correct resources');
      t.isDeeplyUnordered(firstResource.events, [firstEvent, lastEvent], 'First resource has correct events');
      t.isDeeply(lastResource.events, [], 'Last resource has no events');
      t.is(firstEvent.resourceId, 1, 'Correct resourceId for first event');
      t.is(lastEvent.resourceId, 1, 'Correct resourceId for last event');
      t.selectorCountIs('.b-sch-event', 2, 'And events are rendered');
    }

    t.it('When using inline data with resourceId', async t => {
      await create({
        resources: [{
          id: 1,
          name: 'Batman'
        }, {
          id: 2,
          name: 'Flash'
        }],
        events: [{
          id: 1,
          resourceId: 1,
          startDate: '2019-12-13',
          duration: 4
        }, {
          id: 2,
          resourceId: 1,
          startDate: '2019-12-13',
          duration: 1
        }]
      });
      assert(t);
    });
    t.it('When using inline data with assignments', async t => {
      await create({
        resources: [{
          id: 1,
          name: 'Batman'
        }, {
          id: 2,
          name: 'Flash'
        }],
        events: [{
          id: 1,
          startDate: '2019-12-13',
          duration: 4
        }, {
          id: 2,
          startDate: '2019-12-13',
          duration: 1
        }],
        assignments: [{
          eventId: 1,
          resourceId: 1
        }, {
          eventId: 2,
          resourceId: 1
        }]
      });
      assert(t);
    });
    t.it('When using store configs with resourceId', async t => {
      await create({
        resourceStore: {
          data: [{
            id: 1,
            name: 'Batman'
          }, {
            id: 2,
            name: 'Flash'
          }]
        },
        eventStore: {
          data: [{
            id: 1,
            resourceId: 1,
            startDate: '2019-12-13',
            duration: 4
          }, {
            id: 2,
            resourceId: 1,
            startDate: '2019-12-13',
            duration: 1
          }]
        }
      });
      assert(t);
    });
    t.it('When using store configs with assignments', async t => {
      await create({
        resourceStore: {
          data: [{
            id: 1,
            name: 'Batman'
          }, {
            id: 2,
            name: 'Flash'
          }]
        },
        eventStore: {
          data: [{
            id: 1,
            startDate: '2019-12-13',
            duration: 4
          }, {
            id: 2,
            startDate: '2019-12-13',
            duration: 1
          }]
        },
        assignmentStore: {
          data: [{
            eventId: 1,
            resourceId: 1
          }, {
            eventId: 2,
            resourceId: 1
          }]
        }
      });
      assert(t);
    });
    t.it('When using stores with resourceId', async t => {
      await create({
        resourceStore: new ResourceStore({
          data: [{
            id: 1,
            name: 'Batman'
          }, {
            id: 2,
            name: 'Flash'
          }]
        }),
        eventStore: new EventStore({
          data: [{
            id: 1,
            resourceId: 1,
            startDate: '2019-12-13',
            duration: 4
          }, {
            id: 2,
            resourceId: 1,
            startDate: '2019-12-13',
            duration: 1
          }]
        })
      });
      assert(t);
    });
    t.it('When using stores with assignments', async t => {
      await create({
        resourceStore: new ResourceStore({
          data: [{
            id: 1,
            name: 'Batman'
          }, {
            id: 2,
            name: 'Flash'
          }]
        }),
        eventStore: new EventStore({
          data: [{
            id: 1,
            startDate: '2019-12-13',
            duration: 4
          }, {
            id: 2,
            startDate: '2019-12-13',
            duration: 1
          }]
        }),
        assignmentStore: new AssignmentStore({
          data: [{
            eventId: 1,
            resourceId: 1
          }, {
            eventId: 2,
            resourceId: 1
          }]
        })
      });
      assert(t);
    });
  });
});