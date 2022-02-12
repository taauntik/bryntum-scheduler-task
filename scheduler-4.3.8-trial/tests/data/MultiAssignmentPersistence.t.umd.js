"use strict";

StartTest(t => {
  let project;
  t.beforeEach(() => {
    var _project;

    (_project = project) === null || _project === void 0 ? void 0 : _project.destroy();
  });
  t.it('Should commit new event and assignment', async t => {
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
    project = new ProjectModel({
      eventStore: {
        createUrl: '/3203/create'
      },
      resourceStore: {
        createUrl: '/3203/create'
      },
      assignmentStore: {
        createUrl: '/3203/create'
      }
    });
    await project.commitAsync();
    const {
      eventStore,
      resourceStore,
      assignmentStore
    } = project;
    const [resource] = resourceStore.add({
      name: 'New resource'
    });
    const [event] = eventStore.add({
      name: 'New'
    });
    const [assignment] = eventStore.assignEventToResource(event, resource);
    t.is(eventStore.added.count, 1, 'Event store added bag has single event');
    t.is(eventStore.added.values[0], event, 'Event instance is ok');
    t.is(resourceStore.added.count, 1, 'Resource store added bag has single resource');
    t.is(resourceStore.added.values[0], resource, 'Resource instance is ok'); // When not using crud manager, assignment store added bag doesn't include new assignment which is by design -
    // assignment has phantom ids for event and resource and we just don't allow to save it (see

    t.is(assignmentStore.added.count, 0, 'Added bag has no assignments');
    await project.commitAsync();
    await Promise.all([eventStore.commit(), resourceStore.commit()]);
    t.is(eventStore.added.count, 0, 'Event store added bag is empty');
    t.is(event.id, 100, 'Event id is ok');
    t.is(resourceStore.added.count, 0, 'Resource store added bag is empty');
    t.is(resource.id, 101, 'Resource id is ok');
    t.is(assignmentStore.added.count, 1, 'Assignment store added bag has single assignment');
    t.is(assignmentStore.added.values[0], assignment, 'Assignment instance is ok');
    t.is(assignment.persistableData.eventId, 100, 'Event id updated');
    t.is(assignment.persistableData.resourceId, 101, 'Resource id is correct');
    await assignmentStore.commit();
    t.is(assignmentStore.added.count, 0, 'Assignment store added bag is empty');
    t.is(assignment.id, 102, 'Assignment id is ok');
  });
});