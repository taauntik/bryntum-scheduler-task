"use strict";

StartTest(t => {
  t.it('Id change should update assignment', async t => {
    const project = new ProjectModel({
      assignmentsData: [{
        id: 1,
        eventId: 1,
        resourceId: 'phantomResource'
      }],
      resourcesData: [{
        id: 'phantomResource'
      }],
      eventsData: [{
        id: 1
      }]
    });
    await project.commitAsync(); // Happens for example as the result of a commit to backend

    project.resourceStore.first.id = 1;
    await project.commitAsync();
    t.is(project.assignmentStore.first.resourceId, project.resourceStore.first.id);
  });
  t.it('Sanity checks + phantom record handling', async t => {
    const eventStore = new EventStore({
      data: [{
        id: 1,
        name: 'Linda',
        startDate: '2010-12-09',
        endDate: '2010-12-13'
      }]
    });
    const resourceStore = new ResourceStore({
      createUrl: 'lib/create_resource.json'
    });
    const project = new ProjectModel({
      eventStore,
      resourceStore
    });
    await project.commitAsync();
    const res = new resourceStore.modelClass();
    resourceStore.add(res);
    t.is(eventStore.getEventsForResource(res).length, 0, 'Should not find any events for a new resource');
    const ev = eventStore.first;
    ev.resource = res;
    t.is(ev.resource, res, 'Found phantom resource');
    t.is(res.events[0], ev, 'Found event by resource');
    const phantomResId = ev.resourceId;
    const handle = t.beginAsync();
    resourceStore.on('commitadded', async () => {
      await project.commitAsync();
      t.isnt(ev.resourceId, phantomResId, 'Found phantom resource');
      t.is(ev.resource, res, 'Found real resource'); // Make sure we tolerate sloppy input with mixed types, ResourceId as string '1' and the Id of a Resource as int 1.

      ev.resourceId = 1;
      res.set('id', 1);
      t.is(eventStore.getEventsForResource(res)[0], ev, 'Should be able to use strings and int mixed, == check instead of ===');
      t.endAsync(handle);
    }, null, {
      delay: 1
    });
    resourceStore.commit();
  });
  t.it('ResourceTreeStore init', t => {
    new ResourceStore({
      tree: true,
      modelClass: class Mod2 extends ResourceModel {}
    });
    t.throwsOk(() => {
      new ResourceStore({
        tree: true,
        modelClass: class Mod extends Model {}
      });
    }, 'Model for ResourceStore must subclass ResourceModel');
  });
  t.it('Basic instantiation', t => {
    const store = new ResourceStore({
      data: [{}]
    });
    t.isInstanceOf(store.first, ResourceModel, 'Should use ResourceModel');
    t.throwsOk(() => {
      new ResourceStore({
        modelClass: class Mod4 extends Model {}
      });
    }, 'Model for ResourceStore must subclass ResourceModel');
  });
  t.it('Assignments should be cleared upon removeAll(true)', async t => {
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 1
      }]
    });
    const resourceStore = new ResourceStore({
      data: [{
        id: 1,
        name: 'Linda'
      }]
    });
    const project = new ProjectModel({
      eventStore,
      resourceStore
    });
    await project.commitAsync();
    const resource = resourceStore.first;
    t.is(resource.events.length, 1, 'Event found');
    eventStore.removeAll(true);
    t.is(resource.events.length, 0, 'Event gone');
  });
  t.it('Removing all resources should unassign all events', async t => {
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 1
      }, {
        id: 2,
        resourceId: 1
      }, {
        id: 3,
        resourceId: 2
      }]
    });
    const resourceStore = new ResourceStore({
      data: [{
        id: 1
      }, {
        id: 2
      }]
    });
    const project = new ProjectModel({
      eventStore,
      resourceStore
    });
    await project.commitAsync();
    resourceStore.removeAll();
    t.ok(eventStore.records.every(eventRecord => !eventRecord.resourceId), 'All events unassigned');
  });
  t.it('Data should be ready after addAsync()', async t => {
    const project = new ProjectModel({
      assignmentsData: [{
        id: 1,
        eventId: 1,
        resourceId: 1
      }, {
        id: 2,
        eventId: 2,
        resourceId: 1
      }],
      resourcesData: [],
      eventsData: [{
        id: 1
      }, {
        id: 2
      }]
    });
    const [resource] = await project.resourceStore.addAsync({
      id: 1
    });
    t.isDeeply(resource.events, project.eventStore.records, 'Calculations performed');
  });
  t.it('Data should be ready after loadDataAsync()', async t => {
    const project = new ProjectModel({
      assignmentsData: [{
        id: 1,
        eventId: 1,
        resourceId: 1
      }, {
        id: 2,
        eventId: 2,
        resourceId: 1
      }],
      resourcesData: [],
      eventsData: [{
        id: 1
      }, {
        id: 2
      }]
    });
    await project.resourceStore.loadDataAsync([{
      id: 1
    }]);
    t.isDeeply(project.resourceStore.first.events, project.eventStore.records, 'Calculations performed');
  }); // https://github.com/bryntum/support/issues/2428

  t.it('Resources in tree format should be re-assigned properly after reload', async t => {
    t.mockUrl('load1', {
      responseText: JSON.stringify({
        success: true,
        resources: {
          rows: [{
            id: '1',
            name: 'resource1'
          }, {
            id: '2',
            name: 'resource2',
            children: [{
              id: '53',
              name: 'resource3'
            }, {
              id: '54',
              name: 'resource4'
            }],
            expanded: true
          }]
        },
        events: {
          rows: [{
            id: '420',
            resourceId: '1',
            name: '168.00',
            startDate: '2011-01-04',
            endDate: '2011-01-05'
          }]
        }
      })
    });
    t.mockUrl('load2', {
      responseText: JSON.stringify({
        success: true,
        resources: {
          rows: [{
            id: '1',
            name: 'resource1'
          }, {
            id: '2',
            name: 'resource2',
            children: [{
              id: '53',
              name: 'resource3'
            }, {
              id: '54',
              name: 'resource4'
            }],
            expanded: true
          }]
        },
        events: {
          rows: []
        }
      })
    });
    const scheduler = await t.getSchedulerAsync({
      crudManager: {
        transport: {
          load: {
            url: 'load1'
          }
        }
      }
    });
    await scheduler.crudManager.load();
    let event = scheduler.eventStore.first,
        resource = scheduler.resourceStore.getById(event.resource.id);
    t.is(event.resource, resource, 'The resource in the event and in the resourceStore are same');
    scheduler.crudManager.transport.load.url = 'load2';
    await scheduler.crudManager.load();
    t.is(scheduler.eventStore.records.length, 0, 'No events available after data load');
    scheduler.crudManager.transport.load.url = 'load1';
    await scheduler.crudManager.load();
    t.is(scheduler.eventStore.records.length, 1, 'Event is in the store again after data load');
    event = scheduler.eventStore.records[0];
    resource = scheduler.resourceStore.getById(event.resource.id);
    t.is(event.resource, resource, 'The resource in the event and in the resourceStore are same after data reload');
    t.selectorExists(scheduler.unreleasedEventSelector, 'Event rendered');
  });
  t.it('Resource store should load tree correctly', t => {
    const resourceStore = new ResourceStore({
      tree: true
    });
    resourceStore.rootNode.appendChild([{
      id: 1,
      name: 'Parent 1',
      children: true
    }, {
      id: 2,
      name: 'Parent 2',
      expanded: true,
      children: [{
        id: 3,
        name: 'Child 1'
      }]
    }]);
    t.is(resourceStore.getCount(), 3, 'All 3 nodes loaded');
  }); // https://github.com/bryntum/support/issues/3330

  t.it('Should support syncDataOnLoad with an array of records', t => {
    const resourceStore = new ResourceStore({
      syncDataOnLoad: true,
      sorters: [],
      data: [{
        id: 1,
        name: 'foo'
      }, {
        id: 2,
        name: 'bar'
      }]
    });
    resourceStore.data = resourceStore.records.slice().reverse();
    t.is(resourceStore.count, 2, 'Still 2 records');
  }); // https://github.com/bryntum/support/issues/3383

  t.it('Should not crash when setting undefined fields', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 1,
        name: 'foo'
      }]
    });
    resourceStore.first.set({
      role: 'bar'
    });
    t.is(resourceStore.first.data.role, 'bar', 'Undefined field applied to data');
  });
});