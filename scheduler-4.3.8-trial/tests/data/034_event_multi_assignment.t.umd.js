"use strict";

StartTest(t => {
  const monday = new Date(2015, 2, 16),
        sunday = new Date(2015, 2, 22);

  function getProject() {
    return new ProjectModel({
      eventStore: new EventStore({
        removeUnassignedEvent: false,
        data: [{
          id: 1,
          name: 'Event 1',
          startDate: monday,
          endDate: sunday
        }, {
          id: 2,
          name: 'Event 2',
          startDate: monday,
          endDate: sunday
        }]
      }),
      resourceStore: new ResourceStore({
        data: [{
          id: 1,
          name: 'Resource 1'
        }, {
          id: 2,
          name: 'Resource 2'
        }]
      }),
      assignmentStore: new AssignmentStore({
        data: [{
          id: 1,
          eventId: 1,
          resourceId: 1
        }, {
          id: 2,
          eventId: 1,
          resourceId: 2
        }, {
          id: 3,
          eventId: 2,
          resourceId: 2
        }]
      })
    });
  }

  function idify(recordset) {
    return recordset.map(r => r.id);
  }

  t.describe('Scheduler data model must support events assignment to multiple resources', t => {
    t.it('Should properly report resources an event assigned to', t => {
      const {
        eventStore,
        resourceStore
      } = getProject(),
            [e1, e2] = eventStore,
            [r1, r2] = resourceStore;
      t.isDeeplyUnordered(e1.resources, [r1, r2], 'Event 1 is correctly assigned to multiple resources');
      t.isDeeplyUnordered(e2.resources, [r2], 'Event 2 is correctly assigned to single resource');
      t.ok(e1.isAssignedTo(r1), 'Event 1 correctly reports it\'s assignment to Resource 1');
      t.ok(e1.isAssignedTo(2), 'Event 1 correctly reports it\'s assignment to Resource 1');
      t.ok(eventStore.isEventAssignedToResource(2, 2), 'EventStore correctly reports Event 2 to be assiged to Resource 2');
    });
    t.it('Should properly report events a resource assigned to', t => {
      const {
        eventStore,
        resourceStore
      } = getProject();
      let resource1events, resource2events;
      t.diag('Via resource store');
      resource1events = idify(resourceStore.getById(1).getEvents());
      resource2events = idify(resourceStore.getById(2).getEvents());
      t.isDeeplyUnordered(resource1events, [1], 'Resource 1 is correctly assigned to single event');
      t.isDeeplyUnordered(resource2events, [1, 2], 'Resource 2 is correctly assigned to multiple events');
      t.diag('Via event store');
      resource1events = idify(eventStore.getEventsForResource(1));
      resource2events = idify(eventStore.getEventsForResource(2));
      t.isDeeplyUnordered(resource1events, [1], 'Resource 1 is correctly assigned to single event');
      t.isDeeplyUnordered(resource2events, [1, 2], 'Resource 2 is correctly assigned to multiple events');
    });
    t.it('Should support \'runtime\' event assignment/unassignment', t => {
      const {
        eventStore,
        resourceStore
      } = getProject(),
            e2 = eventStore.getById(2),
            [r1, r2] = resourceStore;
      e2.unassign(r2);
      t.isDeeplyUnordered(idify(r2.getEvents()), [1], 'Event 2 was correctly unassigned from Resource 2');
      e2.assign(r1);
      t.isDeeplyUnordered(idify(r1.getEvents()), [1, 2], 'Event 2 was correctly assigned to Resource 1');
    });
    t.it('Should properly split a multi-resource event', async t => {
      const project = getProject(),
            {
        eventStore,
        assignmentStore
      } = project,
            [event1] = eventStore; // Need to await to have calculated values on split

      await project.commitAsync();
      const eventStoreCountBeforeSplit = eventStore.count;
      const assignmentStoreCountBeforeSplit = assignmentStore.count;
      const clone = await event1.split();
      const event1Resources = idify(eventStore.getById(1).resources);
      const cloneResources = idify(clone.resources);
      t.isDeeplyUnordered(event1Resources, cloneResources, 'Split section was correctly assigned to multiple resources');
      t.is(assignmentStore.count, assignmentStoreCountBeforeSplit + 2, 'Split operation generated 2 new assignments');
      t.is(eventStore.count, eventStoreCountBeforeSplit + 1, 'Split operation generated 1 new event');
    });
  });
});