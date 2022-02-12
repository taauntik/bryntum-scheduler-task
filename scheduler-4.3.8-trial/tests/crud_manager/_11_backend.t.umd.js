"use strict";

StartTest(t => {
  let resourceStore, eventStore, crud;
  const testConfig = t.harness.getScriptDescriptor(t.url);

  const setup = (fn, testConfig) => {
    resourceStore = t.getResourceStore({
      storeId: 'resources',
      data: []
    });
    eventStore = t.getEventStore({
      storeId: 'events',
      data: [],
      resourceStore: resourceStore
    });
    crud = new CrudManager({
      resourceStore: resourceStore,
      eventStore: eventStore,
      transport: {
        load: Object.assign({
          method: 'GET',
          paramName: 'q'
        }, testConfig.load),
        sync: Object.assign({
          method: 'POST'
        }, testConfig.sync)
      },
      listeners: {
        loadfail: () => {
          t.fail('Loading failed');
        },
        syncfail: () => {
          t.fail('Persisting failed');
        }
      }
    });
    AjaxHelper.get(testConfig.resetUrl).then(fn, () => t.fail('Reset failed')); // Ext.Ajax.request({
    //     url     : testConfig.resetUrl,
    //     success : fn,
    //     failure : () => { t.fail('Reset failed'); }
    // });
  };

  t.it('Should be possible to save some resources and events', t => {
    t.chain(next => {
      setup(next, testConfig);
    }, next => {
      const addedResources = resourceStore.add([{
        name: 'resource1'
      }, {
        name: 'resource2'
      }]);
      eventStore.add([{
        resourceId: addedResources[0].id,
        name: 'event1',
        startDate: new Date(2013, 0, 1),
        endDate: new Date(2013, 0, 15)
      }, {
        resourceId: addedResources[0].id,
        name: 'event2',
        startDate: new Date(2013, 0, 10),
        endDate: new Date(2013, 0, 12)
      }, {
        resourceId: addedResources[0].id,
        name: 'event3',
        startDate: new Date(2013, 0, 11),
        endDate: new Date(2013, 0, 12)
      }]);
      crud.sync().then(next, () => {
        t.fail('Sync failed');
      });
    }, next => {
      const resource1 = resourceStore.find(r => r.name === 'resource1');
      t.ok(resource1.id, 'Resource resource1 has Id filled');
      const events = resource1.getEvents(eventStore);
      t.is(events.length, 3, 'Resource resource1 assigned to 3 events');
      t.ok(events[0].id, 'Event #0 has Id filled');
      t.ok(events[1].id, 'Event #1 has Id filled');
      t.is(events[0].resourceId, resource1.id, 'Event #0 has correct ResourceId');
      t.is(events[1].resourceId, resource1.id, 'Event #0 has correct ResourceId');
      crud.load().then(next, () => {
        t.fail('Load failed');
      });
    }, next => {
      t.is(resourceStore.count, 2, 'Correct number of resources loaded');
      t.is(eventStore.count, 3, 'Correct number of events loaded');
      const resource1 = resourceStore.findRecord('name', 'resource1');
      t.ok(resource1.id, 'Resource resource1 has Id filled');
      const events = resource1.getEvents(eventStore);
      t.is(events.length, 3, 'Resource resource1 assigned to 3 events');
      t.ok(events[0].id, 'Event #0 has Id filled');
      t.ok(events[1].id, 'Event #1 has Id filled');
      t.is(events[0].resourceId, resource1.id, 'Event #0 has correct ResourceId');
      t.is(events[1].resourceId, resource1.id, 'Event #0 has correct ResourceId');
      next();
    }, next => {
      const event1 = eventStore.findRecord('name', 'event1');
      const event2 = eventStore.findRecord('name', 'event2');
      const event3 = eventStore.findRecord('name', 'event3');
      const resource1 = resourceStore.findRecord('name', 'resource1');
      const resource2 = resourceStore.findRecord('name', 'resource2');
      const addedResources = resourceStore.add([{
        name: 'resource3'
      }]);
      event2.assign(addedResources[0]);
      resourceStore.remove(resource2);
      eventStore.remove(event3);
      event1.name = 'EVENT-1';
      resource1.name = 'RESOURCE-1';
      crud.sync().then(next, () => {
        t.fail('Sync failed');
      });
    }, next => {
      t.isDeeply(resourceStore.removed.values, [], 'No removed records');
      t.isDeeply(resourceStore.modified.values, [], 'No modified records');
      t.isDeeply(eventStore.removed.values, [], 'No removed records');
      t.isDeeply(eventStore.modified.values, [], 'No modified records');
      const event1 = eventStore.findRecord('name', 'EVENT-1');
      const event2 = eventStore.findRecord('name', 'event2');
      const event3 = eventStore.findRecord('name', 'event3');
      const resource1 = resourceStore.findRecord('name', 'RESOURCE-1');
      const resource2 = resourceStore.findRecord('name', 'resource2');
      const resource3 = resourceStore.findRecord('name', 'resource3');
      t.ok(event1, 'EVENT-1 found');
      t.ok(resource1, 'RESOURCE-1 found');
      t.notOk(event1.dirty, 'EVENT-1 is not dirty');
      t.notOk(resource1.dirty, 'RESOURCE-1 is not dirty');
      t.notOk(event3, 'event3 not found');
      t.notOk(resource2, 'resource2 not found');
      t.ok(resource3, 'resource3 found');
      t.ok(resource3.id, 'Resource resource3 has Id filled');
      t.isDeeply(resource3.getEvents(eventStore), [event2], 'Event #1 has resource3 assigned');
      t.is(event2.resourceId, resource3.id, 'Event #1 has correct ResourceId');
      crud.load().then(next, () => {
        t.fail('Load failed');
      });
    }, next => {
      t.is(resourceStore.count, 2, 'Correct number of resources loaded');
      t.is(eventStore.count, 2, 'Correct number of events loaded');
      const event1 = eventStore.findRecord('name', 'EVENT-1');
      const event2 = eventStore.findRecord('name', 'event2');
      const resource1 = resourceStore.findRecord('name', 'RESOURCE-1');
      const resource3 = resourceStore.findRecord('name', 'resource3');
      t.isDeeply(resource1.getEvents(eventStore), [event1], 'Event #0 has resource1 assigned');
      t.isDeeply(resource3.getEvents(eventStore), [event2], 'Event #1 has resource3 assigned');
      next();
    });
  });
  t.it('Prevents from persisiting outdated data', t => {
    const resourceStore2 = t.getResourceStore({
      data: []
    });
    const eventStore2 = t.getEventStore({
      data: [],
      resourceStore: resourceStore2
    });
    resourceStore2.eventStore = eventStore2;
    const crud2 = new CrudManager({
      resourceStore: {
        store: resourceStore2,
        storeId: 'resources'
      },
      eventStore: {
        store: eventStore2,
        storeId: 'events'
      },
      transport: {
        load: Object.assign({
          method: 'GET',
          paramName: 'q'
        }, testConfig.load),
        sync: Object.assign({
          method: 'POST'
        }, testConfig.sync)
      },
      listeners: {
        loadfail: () => {
          t.fail('Loading failed');
        }
      }
    });
    t.chain(next => {
      setup(next, testConfig);
    }, next => {
      crud.load().then(next, () => {
        t.fail('Load failed');
      });
    }, next => {
      crud2.load().then(next, () => {
        t.fail('Load failed');
      });
    }, next => {
      resourceStore.add([{
        name: 'resource1'
      }, {
        name: 'resource2'
      }]);
      crud.sync().then(next, () => {
        t.fail('Sync failed');
      });
    }, next => {
      resourceStore2.add([{
        name: 'resource3'
      }, {
        name: 'resource4'
      }]);
      crud2.sync().then(() => {
        t.fail('This sync should be failed');
        next();
      }, () => {
        t.pass('Sync successfuly failed');
        next();
      });
    }, next => {});
  });
});