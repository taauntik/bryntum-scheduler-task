"use strict";

// IdConsistencyManager not used but test is still valid for stores
StartTest(t => {
  function createDataLayerWithoutAssignments() {
    return new ProjectModel({
      resourceStore: new ResourceStore({
        data: [{
          id: 1,
          name: 'Resource 1'
        }, {
          id: 2,
          name: 'Resource 2'
        }]
      }),
      eventStore: new EventStore({
        data: [{
          name: 'Event 1',
          resourceId: 1
        }, {
          name: 'Event 2',
          resourceId: 2
        }]
      })
    });
  }

  function createDataLayerWithAssignments() {
    const project = new ProjectModel({
      assignmentStore: new AssignmentStore(),
      resourceStore: new ResourceStore({
        data: [{
          name: 'Resource 1'
        }, {
          name: 'Resource 2'
        }]
      }),
      eventStore: new EventStore({
        data: [{
          name: 'Event 1'
        }, {
          name: 'Event 2'
        }]
      })
    });
    project.eventStore.getAt(0).assign(project.resourceStore.getAt(0));
    project.eventStore.getAt(1).assign(project.resourceStore.getAt(1));
    return project;
  }

  t.describe('Id consistency manager should update model records referential fields with updated record ids', t => {
    t.it('Should update event resource ids on an event store if it works without assignment store and resource ids are changed', t => {
      const {
        eventStore,
        resourceStore
      } = createDataLayerWithoutAssignments(),
            [event1, event2] = eventStore,
            [resource1, resource2] = resourceStore;
      t.is(event1.resourceId, resource1.id, 'Event1 is assigned to Resource1');
      t.is(event2.resourceId, resource2.id, 'Event2 is assigned to Resource2');
      resource1.id = 1;
      resource2.id = 2;
      t.is(event1.resourceId, resource1.id, 'Event1 is still assigned to Resource1');
      t.is(event2.resourceId, resource2.id, 'Event2 is still assigned to Resource2');
    });
    t.it('Should update assignment event ids on an assignment store if event ids are changed and should update resource ids on assignment store if resource ids are changed', async t => {
      const {
        eventStore,
        resourceStore,
        assignmentStore
      } = createDataLayerWithAssignments(),
            [event1, event2] = eventStore,
            [resource1, resource2] = resourceStore,
            [assignment1, assignment2] = assignmentStore;
      t.ok(assignment1.eventId === event1.id && assignment1.resourceId === resource1.id, 'Event1 is assigned to Resource1');
      t.ok(assignment2.eventId === event2.id && assignment2.resourceId === resource2.id, 'Event2 is assigned to Resource2');
      event1.id = 1;
      event2.id = 2;
      await t.waitForProjectReady(eventStore);
      t.ok(assignment1.eventId === event1.id && assignment1.resourceId === resource1.id, 'Event1 is still assigned to Resource1 after Event1 id has been changed');
      t.ok(assignment2.eventId === event2.id && assignment2.resourceId === resource2.id, 'Event2 is still assigned to Resource2 after Event2 id has been changed');
      resource1.id = 1;
      resource2.id = 2;
      t.ok(assignment1.eventId === event1.id && assignment1.resourceId === resource1.id, 'Event1 is still assigned to Resource1 after Resource1 id has been changed');
      t.ok(assignment2.eventId === event2.id && assignment2.resourceId === resource2.id, 'Event2 is still assigned to Resource2 after Resource2 id has been changed');
    });
  });
});