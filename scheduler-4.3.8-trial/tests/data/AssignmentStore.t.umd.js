"use strict";

StartTest(t => {
  let project, resourceStore, eventStore, assignmentStore;

  async function createData(removeUnassignedEvent = false) {
    resourceStore = new ResourceStore({
      data: [{
        id: 1,
        name: 'Superman'
      }, {
        id: 2,
        name: 'Batman'
      }]
    });
    assignmentStore = new AssignmentStore({
      data: [{
        id: 1,
        eventId: 1,
        resourceId: 1
      }, {
        id: 2,
        eventId: 2,
        resourceId: 1
      }, {
        id: 3,
        eventId: 2,
        resourceId: 2
      }, {
        id: 4,
        eventId: 3,
        resourceId: 2
      }]
    });
    eventStore = new EventStore({
      data: [{
        id: 1,
        name: 'Fly'
      }, {
        id: 2,
        name: 'Fight'
      }, {
        id: 3,
        name: 'Sneak'
      }],
      removeUnassignedEvent
    });
    project = new ProjectModel({
      assignmentStore,
      eventStore,
      resourceStore
    });
    await t.waitForProjectReady(project);
  }

  t.it('Basic assignment sanity', async t => {
    await createData();
    const [fly, fight, sneak] = eventStore;
    const [superman, batman] = resourceStore;
    const [superFly, superFight, batFight, batSneak] = assignmentStore;
    t.is(superFly.resource, superman, 'Correct resource for first assignment');
    t.is(superFight.resource, superman, 'Correct resource for second assignment');
    t.is(batFight.resource, batman, 'Correct resource for third assignment');
    t.is(batSneak.resource, batman, 'Correct resource for forth assignment');
    t.is(superFly.event, fly, 'Correct event for first assignment');
    t.is(superFight.event, fight, 'Correct event for second assignment');
    t.is(batFight.event, fight, 'Correct event for third assignment');
    t.is(batSneak.event, sneak, 'Correct event for forth assignment');
    t.isDeeplyUnordered(fly.assignments, [superFly], 'Correct assignments for first event');
    t.isDeeplyUnordered(fight.assignments, [superFight, batFight], 'Correct assignments for second event');
    t.isDeeplyUnordered(sneak.assignments, [batSneak], 'Correct assignments for third event');
    t.isDeeplyUnordered(superman.assignments, [superFly, superFight], 'Correct assignments for first resource');
    t.isDeeplyUnordered(batman.assignments, [batFight, batSneak], 'Correct assignments for second resource'); // Not relations, but worth checking

    t.isDeeplyUnordered(superman.events, [fly, fight], 'Correct events for first resource');
    t.isDeeplyUnordered(batman.events, [fight, sneak], 'Correct events for second resource');
    t.isDeeplyUnordered(fly.resources, [superman], 'Correct resources for first event');
    t.isDeeplyUnordered(fight.resources, [superman, batman], 'Correct resources for second event');
    t.isDeeplyUnordered(sneak.resources, [batman], 'Correct resources for third event');
    t.ok(assignmentStore.storage.indices.event, 'Indexed by event');
    t.ok(assignmentStore.storage.indices.resource, 'Indexed by resource'); // Excluded for now, see note AssignmentStoreMixin
    // t.ok(assignmentStore.storage.indices.eventResourceKey, 'Indexed by eventResourceKey');
  });
  t.it('Relation manipulations should work', async t => {
    await createData();
    const [,, sneak] = eventStore.records;
    const [superman, batman] = resourceStore.records;
    const [superFly, superFight, batFight, batSneak] = assignmentStore.records;
    batSneak.resource = superman;
    await t.waitForProjectReady(eventStore);
    t.is(batSneak.resourceId, superman.id, 'Assignments resourceId updated');
    t.isDeeplyUnordered(sneak.assignments, [batSneak], 'Events assignments still correct');
    t.isDeeplyUnordered(superman.assignments, [superFly, superFight, batSneak], 'New resource assignments updated');
    t.isDeeplyUnordered(batman.assignments, [batFight], 'Old resource assignments updated'); // batman going super!

    batman.assignments = [superFly, superFight, batSneak];
    await t.waitForProjectReady(eventStore);
    t.is(superFly.resource, batman, 'First assignment updated');
    t.is(superFight.resource, batman, 'Second assignment updated');
    t.is(batSneak.resource, batman, 'Third assignment updated'); // No more sneaking

    batSneak.resource = null;
    await t.waitForProjectReady(eventStore);
    t.is(batSneak.resource, null, 'Assignments resource is null');
    t.is(batSneak.resourceId, 2, 'Assignments resourceId is 2'); // Invalid flying

    superFly.resource = 'blargh';
    await t.waitForProjectReady(eventStore);
    t.is(superFly.resource, null, 'Assignments resource is null'); // TODO: Is this what we want? What if resource enters store after
    // t.is(superFly.resourceId, null, 'Assignments resourceId is null');
  });
  t.it('assignEventToResource should work', async t => {
    await createData();
    const [superman, batman] = resourceStore.records;
    const [fly] = eventStore.records;
    assignmentStore.removeAll();
    await t.waitForProjectReady(eventStore);
    eventStore.assignEventToResource(fly, superman);
    t.isDeeply(fly.resources, [superman]);
    eventStore.assignEventToResource(fly, batman);
    t.isDeeply(fly.resources, [superman, batman]);
    eventStore.unassignEventFromResource(fly, batman);
    t.isDeeply(fly.resources, [superman]);
    eventStore.assignEventToResource(fly, batman, true);
    t.isDeeply(fly.resources, [batman], 'When passing `true`, old assignments should be removed');
    eventStore.unassignEventFromResource(fly, batman);
    t.isDeeply(fly.resources, []);
  }); // https://app.assembla.com/spaces/bryntum/tickets/8482/details

  t.it('Should update related entities while stores are batched', async t => {
    await createData();
    eventStore.beginBatch();
    const event = eventStore.add({
      name: 'test',
      startDate: new Date(2017, 0, 1, 14),
      duration: 1,
      durationUnit: 'hour'
    })[0];
    eventStore.endBatch();
    eventStore.assignEventToResource(event.id, 'r1');
    t.is(event.assignments.length, 1, 'Assignment present');
  });
  t.it('Removing assignment should not impact "event" relation of other assignments', async t => {
    const eventStore = new EventStore({
      data: [{
        id: 1,
        name: 'Event 1'
      }, {
        id: 2,
        name: 'Event 2'
      }]
    }),
          resourceStore = new ResourceStore({
      data: [{
        id: 1,
        name: 'Resource 1'
      }, {
        id: 2,
        name: 'Resource 2'
      }]
    }),
          assignmentStore = new AssignmentStore({
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
    }),
          project = new ProjectModel({
      eventStore,
      resourceStore,
      assignmentStore
    });
    assignmentStore.first.remove();
    await t.waitForProjectReady(project);
    t.ok(assignmentStore.first.event, 'Event of other assignments still intact');
  });
  t.it('should remove assignments when linked records are removed', t => {
    t.it('should remove assignments when events are removed', async t => {
      await createData();
      const [event1, event2, event3] = eventStore,
            [resource1, resource2] = resourceStore;
      const spy = t.spyOn(eventStore, 'remove');
      event1.remove();
      await t.waitForProjectReady(project);
      t.notOk(assignmentStore.getById(1), 'Assignment removed');
      t.isDeeply(resource1.events, [event2], 'Correct events for resource 1');
      eventStore.remove([event2, event3]);
      await t.waitForProjectReady(project);
      t.is(assignmentStore.count, 0, 'Assignments removed');
      t.isDeeply(resource1.events, [], 'No events for resource 1');
      t.isDeeply(resource2.events, [], 'No events for resource 2'); // No removal loop

      t.expect(spy).toHaveBeenCalled(2);
    });
    t.it('should remove all assignments when all events are removed', async t => {
      await createData();
      const [resource1, resource2] = resourceStore;
      const spy = t.spyOn(eventStore, 'removeAll');
      eventStore.removeAll();
      t.is(assignmentStore.count, 0, 'Assignments removed');
      t.isDeeply(resource1.events, [], 'No events for resource 1');
      t.isDeeply(resource2.events, [], 'No events for resource 2');
      t.expect(spy).toHaveBeenCalled(1);
    });
    t.it('should remove assignments when resource is removed', async t => {
      await createData();
      const [event1, event2, event3] = eventStore,
            [,, a3, a4] = assignmentStore,
            [, resource2] = resourceStore;
      const spy = t.spyOn(resourceStore, 'remove');
      resourceStore.first.remove();
      await t.waitForProjectReady(project);
      t.isDeeply(assignmentStore.records, [a3, a4], 'Assignments removed');
      t.isDeeply(event1.resources, [], 'No resources for event 1');
      t.isDeeply(event2.resources, [resource2], 'Correct resources for event 2');
      t.isDeeply(event3.resources, [resource2], 'Correct resources for event 3');
      t.expect(spy).toHaveBeenCalled(1);
    });
    t.it('should remove assignments when resources are removed', async t => {
      await createData();
      const [event1, event2, event3] = eventStore,
            [resource1, resource2] = resourceStore;
      const resourceSpy = t.spyOn(resourceStore, 'remove'),
            assignmentSpy = t.spyOn(assignmentStore, 'remove');
      resourceStore.remove([resource1, resource2]);
      t.is(assignmentStore.count, 0, 'Assignments removed');
      t.isDeeply(event1.resources, [], 'No resources for event 1');
      t.isDeeply(event2.resources, [], 'No resources for event 2');
      t.isDeeply(event3.resources, [], 'No resources for event 3');
      t.expect(resourceSpy).toHaveBeenCalled(1);
      t.expect(assignmentSpy).toHaveBeenCalled(1);
    });
    t.it('should remove all assignments when all resources are removed', async t => {
      await createData();
      const [event1, event2, event3] = eventStore;
      const resourceSpy = t.spyOn(resourceStore, 'removeAll'),
            assignmentSpy = t.spyOn(assignmentStore, 'removeAll');
      resourceStore.removeAll();
      t.is(assignmentStore.count, 0, 'Assignments removed');
      t.isDeeply(event1.resources, [], 'No resources for event 1');
      t.isDeeply(event2.resources, [], 'No resources for event 2');
      t.isDeeply(event3.resources, [], 'No resources for event 3');
      t.expect(resourceSpy).toHaveBeenCalled(1);
      t.expect(assignmentSpy).toHaveBeenCalled(1);
    });
  });
  t.it('should remove events when assignments are removed', t => {
    t.it('should remove single assigned event when assignment is removed', async t => {
      await createData(true);
      const eventSpy = t.spyOn(eventStore, 'remove'),
            assignmentSpy = t.spyOn(assignmentStore, 'remove');
      assignmentStore.first.remove();
      t.notOk(eventStore.getById(1), 'Event removed with assignment');
      t.expect(eventSpy).toHaveBeenCalled(1);
      t.expect(assignmentSpy).toHaveBeenCalled(1);
    });
    t.it('should remove assigned event when all its assignments are removed', async t => {
      await createData(true);
      const [, a2, a3] = assignmentStore,
            eventSpy = t.spyOn(eventStore, 'remove'),
            assignmentSpy = t.spyOn(assignmentStore, 'remove');
      a2.remove();
      t.ok(eventStore.getById(2), 'Event note removed with first assignment');
      a3.remove();
      t.notOk(eventStore.getById(2), 'Event removed with second assignment');
      t.expect(eventSpy).toHaveBeenCalled(1);
      t.expect(assignmentSpy).toHaveBeenCalled(2);
    });
    t.it('should remove events when all assignments are removed', async t => {
      await createData(true);
      const unassigned = eventStore.add({
        id: 4,
        name: 'Unassigned'
      });
      const eventSpy = t.spyOn(eventStore, 'remove'),
            assignmentSpy = t.spyOn(assignmentStore, 'removeAll');
      assignmentStore.removeAll();
      t.isDeeply(eventStore.records, unassigned, 'Expected events removed with assignments');
      t.expect(eventSpy).toHaveBeenCalled(1);
      t.expect(assignmentSpy).toHaveBeenCalled(1);
    });
    t.it('should remove events when resource is removed', async t => {
      await createData(true);
      const eventSpy = t.spyOn(eventStore, 'remove'),
            assignmentSpy = t.spyOn(assignmentStore, 'remove'),
            resourceSpy = t.spyOn(resourceStore, 'remove');
      resourceStore.first.remove();
      t.notOk(assignmentStore.getById(1), 'Assignment removed');
      t.notOk(eventStore.getById(1), 'Event removed');
      resourceStore.first.remove();
      t.is(assignmentStore.count, 0, 'Assignments removed');
      t.is(eventStore.count, 0, 'Events removed'); // No removal loops

      t.expect(eventSpy).toHaveBeenCalled(2);
      t.expect(assignmentSpy).toHaveBeenCalled(2);
      t.expect(resourceSpy).toHaveBeenCalled(2);
    });
    t.it('should remove all events when all resources are removed', async t => {
      await createData(true);
      const eventSpy = t.spyOn(eventStore, 'remove'),
            assignmentSpy = t.spyOn(assignmentStore, 'removeAll'),
            resourceSpy = t.spyOn(resourceStore, 'remove');
      resourceStore.removeAll();
      t.is(assignmentStore.count, 0, 'Assignments removed');
      t.is(eventStore.count, 0, 'Events removed'); // No removal loops

      t.expect(eventSpy).toHaveBeenCalled(1);
      t.expect(assignmentSpy).toHaveBeenCalled(1);
      t.expect(resourceSpy).toHaveBeenCalled(0);
    });
  });
  t.it('Add assignment then event', async t => {
    const project = new ProjectModel({
      assignmentsData: [{
        id: 1,
        eventId: 1,
        resourceId: 1
      }],
      resourcesData: [{
        id: 1
      }],
      eventsData: [{
        id: 1
      }]
    });
    await project.commitAsync();
    project.assignmentStore.add({
      id: 2,
      eventId: 2,
      resourceId: 1
    });
    project.eventStore.add({
      id: 2
    });
    await project.commitAsync();
    t.is(project.assignmentStore.last.event, project.eventStore.last);
  });
  t.it('Data should be ready after addAsync()', async t => {
    await createData();
    const [assignment] = await assignmentStore.addAsync({
      eventId: 1,
      resourceId: 2
    });
    t.is(assignment.event, eventStore.getById(1), 'Event reference correct');
    t.is(assignment.resource, resourceStore.getById(2), 'Resource reference correct');
  });
  t.it('Data should be ready after loadDataAsync()', async t => {
    await createData();
    await assignmentStore.loadDataAsync([{
      eventId: 1,
      resourceId: 2
    }]);
    t.is(assignmentStore.first.event, eventStore.getById(1), 'Event reference correct');
    t.is(assignmentStore.first.resource, resourceStore.getById(2), 'Resource reference correct');
  }); // https://github.com/bryntum/support/issues/1654

  t.it('Changing resource should update resourceId', async t => {
    await createData();
    const [assignment] = assignmentStore;
    assignment.resource = resourceStore.last;
    await project.commitAsync();
    t.is(assignment.resourceId, 2, 'Correct after change');
    t.isDeeply(assignment.modifications, {
      resourceId: 2,
      id: 1
    }, 'Modified');
  });
  t.it('Changing event should update eventId', async t => {
    await createData();
    const [assignment] = assignmentStore;
    assignment.event = eventStore.last;
    await project.commitAsync();
    t.is(assignment.eventId, 3, 'Correct after change');
    t.isDeeply(assignment.modifications, {
      eventId: 3,
      id: 1
    }, 'Modified');
  }); // https://github.com/bryntum/support/issues/2402

  t.it('Should respect silent flag for add() method', async t => {
    assignmentStore = new AssignmentStore();
    t.wontFire(assignmentStore, 'change');
    t.wontFire(assignmentStore, 'add');
    assignmentStore.add({}, true);
  }); // https://github.com/bryntum/support/issues/2453

  t.it('Should not rebuild AssignmentStore indices multiple times when adding events', async t => {
    await createData();
    await resourceStore.addAsync({
      id: 4
    });
    const spy = t.spyOn(assignmentStore.storage, 'rebuildIndices').and.callThrough();
    const [a1, a2, a3] = assignmentStore.add([{
      eventId: 1,
      resourceId: 4
    }, {
      eventId: 2,
      resourceId: 4
    }, {
      eventId: 3,
      resourceId: 4
    }]);
    t.ok(a1.event.isEventModel, 'A1 event linked pre commit');
    t.ok(a2.event.isEventModel, 'A2 event linked pre commit');
    t.ok(a3.event.isEventModel, 'A3 event linked pre commit');
    t.ok(a1.resource.isResourceModel, 'A1 resource linked pre commit');
    t.ok(a2.resource.isResourceModel, 'A2 resource linked pre commit');
    t.ok(a3.resource.isResourceModel, 'A3 resource linked pre commit');
    await project.commitAsync();
    t.expect(spy).toHaveBeenCalled(2); // From add and commit
  }); // https://github.com/bryntum/support/issues/3298

  t.it('ResourceId and EventId in assignment should not be undefined for missing resources and events', async t => {
    t.diag('Create project with two assignents resource');
    const project = new ProjectModel({
      assignmentsData: [{
        id: 1,
        eventId: 1,
        resourceId: 1
      }]
    });
    await project.commitAsync();
    const assignment = project.assignmentStore.first;
    t.is(assignment.resourceId, 1, 'ResourceId is 1 for the assignment');
    t.is(assignment.resource, undefined, 'Resource is undefined for the assignment');
    t.is(assignment.eventId, 1, 'EventId is 1 for the assignment');
    t.is(assignment.event, undefined, 'Event is undefined for the assignment');
    t.diag('Add event');
    project.eventStore.add({
      id: 1,
      resourceId: 1
    });
    await project.commitAsync();
    const event = project.eventStore.first;
    t.is(assignment.resourceId, 1, 'ResourceId is 1 for the assignment');
    t.is(assignment.resource, undefined, 'Resource is undefined for the assignment');
    t.is(assignment.eventId, 1, 'EventId is 1 for the assignment');
    t.is(assignment.event, event, 'Event is set for the assignment');
    t.is(event.resourceId, 1, 'ResourceId is 1 for the event');
    t.is(event.resource, undefined, 'Resource is undefined for the event');
    t.diag('Add resource');
    project.resourceStore.add({
      id: 1,
      resourceId: 1
    });
    await project.commitAsync();
    const resource = project.resourceStore.first;
    t.is(assignment.resourceId, 1, 'ResourceId is 1 for the assignment');
    t.is(assignment.resource, resource, 'Resource is set for the assignment');
    t.is(assignment.eventId, 1, 'EventId is 1 for the assignment');
    t.is(assignment.event, event, 'Event is set for the assignment');
    t.is(event.resourceId, 1, 'ResourceId is 1 for the event');
    t.is(event.resource, resource, 'Resource is set for the event');
    t.diag('Remove resources');
    project.resourceStore.data = [];
    await project.commitAsync();
    t.is(assignment.resourceId, 1, 'ResourceId is 1 for the assignment');
    t.is(assignment.resource, undefined, 'Resource is undefined for the assignment');
    t.is(assignment.eventId, 1, 'EventId is 1 for the assignment');
    t.is(assignment.event, event, 'Event is set for the assignment');
    t.is(event.resourceId, 1, 'ResourceId is 1 for the event');
    t.is(event.resource, undefined, 'Resource is undefined for the event');
    t.diag('Remove events');
    project.eventStore.data = [];
    await project.commitAsync();
    t.is(project.assignmentStore.allCount, 0, 'When using single assignment, remove all assignments when loading a new set of events');
  });
});