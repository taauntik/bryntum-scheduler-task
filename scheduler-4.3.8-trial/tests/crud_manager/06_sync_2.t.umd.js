"use strict";

StartTest(t => {
  t.it('Should sync all stores, prioritized and regular', async t => {
    t.mockUrl('sync-prioritized', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: {
          rows: [{
            id: 1,
            name: 'event'
          }],
          removed: [{
            id: 10
          }]
        },
        regular: {
          rows: [{
            id: 1,
            name: 'regular'
          }]
        },
        featured: {
          rows: [{
            id: 1,
            name: 'featured'
          }]
        }
      })
    });
    const regularStore = new Store({
      storeId: 'regular',
      fields: ['name']
    }),
          featuredStore = new Store({
      storeId: 'featured',
      fields: ['name']
    }),
          eventStore = t.getEventStore([], 0),
          crud = new CrudManager({
      // NOTE: Needed for event records to find the store, usually supplied by Scheduler
      project: new ProjectModel({
        eventStore
      }),
      transport: {
        sync: {
          url: 'sync-prioritized'
        }
      },

      warn() {}

    });
    await t.waitForProjectReady(crud);
    crud.addPrioritizedStore(featuredStore);
    crud.addCrudStore(regularStore); // make change in the event to fill change set package

    let [event] = eventStore.add({
      id: 10,
      name: 'bar'
    });
    event.name = 'foo';
    await crud.sync();
    t.is(eventStore.count, 1, '1 event received');
    t.is(regularStore.count, 1, '1 record received');
    t.is(featuredStore.count, 1, '1 record received');
    t.is(eventStore.getById(1).name, 'event', 'Event record is ok');
    t.is(regularStore.getById(1).name, 'regular', 'Record is ok');
    t.is(featuredStore.getById(1).name, 'featured', 'Record is ok'); // remove featured store, response should not be applied to it

    crud.removeCrudStore(featuredStore); // make change in the event to fill change set package

    event = eventStore.getById(1);
    event.name = '';
    t.mockUrl('sync-prioritized', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: {
          rows: [{
            id: 1,
            name: 'event 1'
          }]
        },
        regular: {
          rows: [{
            id: 1,
            name: 'regular 1'
          }]
        },
        featured: {
          rows: [{
            id: 1,
            name: 'featured 1'
          }, {
            id: 2,
            name: 'featured 2'
          }]
        }
      })
    });
    await crud.sync();
    t.is(eventStore.count, 1, '1 event received');
    t.is(regularStore.count, 1, '1 record received');
    t.is(featuredStore.count, 1, '1 record received');
    t.is(eventStore.getById(1).name, 'event 1', 'Event record is ok');
    t.is(regularStore.getById(1).name, 'regular 1', 'Record is ok'); // response shouldn't be applied to featured store

    t.is(featuredStore.getById(1).name, 'featured', 'Record is ok');
  });
  t.it('Should sync with id field mapped', async t => {
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        events: {
          rows: []
        },
        resources: {
          rows: [{
            Id: 1,
            name: 'Albert'
          }, {
            Id: 2,
            name: 'Brian'
          }, {
            Id: 3,
            name: 'Charles'
          }]
        }
      })
    });
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        resources: {
          rows: [{
            Id: 1,
            name: 'event'
          }],
          removed: [{
            Id: 2
          }, {
            Id: 3
          }]
        }
      })
    });
    const crudManager = new CrudManager({
      resourceStore: {
        fields: [{
          name: 'id',
          dataSource: 'Id'
        }]
      },
      transport: {
        load: {
          url: 'load'
        },
        sync: {
          url: 'sync'
        }
      },
      autoLoad: false,
      autoSync: false
    });
    await crudManager.load();
    crudManager.resourceStore.remove(2);
    await crudManager.sync();
    t.is(crudManager.resourceStore.count, 1, 'Single resource record found');
    t.is(crudManager.resourceStore.first.id, 1, 'Resource record is correct');
  });
  t.it('Sync request fields are mapped according to the dataSource', async t => {
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        events: {
          rows: []
        },
        resources: {
          rows: [{
            Id: 1,
            Foo: {
              Bar: 'Albert'
            },
            Age: 30
          }, {
            Id: 2,
            Foo: {
              Bar: 'Brian'
            }
          }]
        }
      })
    });
    const expectedName = 'Test',
          project = new ProjectModel({
      resourceStore: {
        fields: [{
          name: 'id',
          dataSource: 'Id'
        }, {
          name: 'name',
          dataSource: 'Foo.Bar'
        }, {
          name: 'age',
          dataSource: 'Age'
        }]
      }
    }),
          crudManager = new CrudManager({
      project,
      transport: {
        load: {
          url: 'load'
        },
        sync: {
          url: 'sync'
        }
      },
      autoLoad: false,
      autoSync: false
    });
    const resourceStore = crudManager.resourceStore;
    crudManager.on({
      beforesync({
        pack
      }) {
        t.isDeeply(pack.resources, {
          added: [{
            $PhantomId: resourceStore.last.id,
            Foo: {
              Bar: expectedName
            }
          }],
          updated: [{
            Id: 1,
            Foo: {
              Bar: expectedName
            }
          }],
          removed: [{
            Id: 2
          }]
        }, 'Sync request data is ok');
      }

    });
    await crudManager.load();
    const resource = resourceStore.first;
    t.is(resource.id, 1, 'Resource id is ok');
    t.is(resource.name, 'Albert', 'Resource name is ok');
    resource.name = expectedName;
    resourceStore.add({
      name: expectedName
    });
    resourceStore.remove(2);
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        resources: {
          rows: [{
            $PhantomId: resourceStore.last.id,
            Id: 3
          }, {
            Id: 1,
            Age: 40
          }]
        }
      })
    });
    await crudManager.sync();
    t.is(resource.id, 1, 'Resource id field is updated during sync');
    t.is(resource.age, 40, 'Resource Age field is updated during sync');
  }); // https://github.com/bryntum/support/issues/322

  t.it('Fields with complex mapping should be updated properly', async t => {
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        events: {
          rows: []
        },
        resources: {
          rows: [{
            Id: 1,
            Foo: {
              Bar: 'Albert'
            }
          }, {
            Id: 2,
            Foo: {
              Bar: 'Brian'
            }
          }]
        }
      })
    });
    const project = new ProjectModel({
      resourceStore: {
        fields: [{
          name: 'id',
          dataSource: 'Id'
        }, {
          name: 'name',
          dataSource: 'Foo.Bar'
        }]
      }
    }),
          crudManager = new CrudManager({
      project,
      transport: {
        load: {
          url: 'load'
        },
        sync: {
          url: 'sync'
        }
      },
      autoLoad: false,
      autoSync: false
    });
    const resourceStore = crudManager.resourceStore;
    await crudManager.load();
    const [newResource] = resourceStore.add({
      name: 'New resource'
    });
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        resources: {
          rows: [{
            $PhantomId: newResource.id,
            Id: 11
          }, {
            Id: 1,
            Foo: {
              Bar: 'Chris'
            }
          }]
        }
      })
    });
    await crudManager.sync();
    const resource = resourceStore.getById(1);
    t.is(resource.name, 'Chris', 'Complex resource field is updated during sync');
  });
  t.it('Should properly unbind listeners on removing crud stores', async t => {
    const project = new ProjectModel({
      eventStore: t.getEventStore([], 0),
      resourceStore: t.getResourceStore([], 0),
      assignmentStore: t.getAssignmentStore([], 0)
    }),
          crud = new CrudManager({
      project,
      transport: {
        sync: {
          url: 'sync'
        }
      },
      autoSync: true,

      warn() {}

    });
    const {
      resourceStore,
      eventStore
    } = project;
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        events: {
          rows: [{
            id: 122,
            $PhantomId: 22,
            eventDisplayName: 'First event name'
          }]
        }
      })
    });
    eventStore.add({
      id: 22,
      name: 'test 1'
    });
    await t.waitForEvent(crud, 'sync');
    t.pass('Sync has been called after eventStore update');
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        resources: {
          rows: [{
            id: 121,
            $PhantomId: 21
          }]
        }
      })
    });
    resourceStore.add({
      id: 21,
      name: 'test 1 resource'
    });
    await t.waitForEvent(crud, 'sync');
    t.pass('Sync has been called after resourceStore update');
    crud.removeCrudStore(resourceStore);
    t.pass('resourceStore has been removed');
    t.willFireNTimes(crud, 'sync', 3);
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        events: {
          rows: [{
            id: 110,
            $PhantomId: 10
          }]
        }
      })
    });
    eventStore.add({
      id: 10,
      name: 'bar'
    });
    await t.waitForEvent(crud, 'sync');
    t.pass('Sync has been called on eventStore update after remove resourceStore');
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        resources: {
          rows: [{
            id: 110,
            $PhantomId: 10
          }, {
            id: 111,
            $PhantomId: 11
          }]
        }
      })
    });
    resourceStore.add({
      id: 10,
      name: 'bar'
    });
    crud.addCrudStore(resourceStore);
    resourceStore.add({
      id: 11,
      name: 'foo'
    });
    await t.waitForEvent(crud, 'sync');
    t.pass('Sync has been called on resourceStore update after re-add resourceStore');
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        events: {
          rows: [{
            id: 124,
            $PhantomId: 24
          }]
        }
      })
    });
    eventStore.add({
      id: 24,
      name: 'bar event'
    });
    await t.waitForEvent(crud, 'sync');
    t.pass('Sync has been called on eventStore update after re-add resourceStore');
  });
  t.it('Should always include any fields marked as alwaysWrite', async t => {
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        events: {
          rows: []
        },
        resources: {
          rows: [{
            id: 1,
            name: 'foo',
            important: 123
          }, {
            id: 2,
            name: 'bar',
            important: 234
          }]
        }
      })
    });
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        resources: {
          rows: [{
            id: 1,
            name: 'foot massage'
          }]
        }
      })
    });
    const crudManager = new CrudManager({
      resourceStore: {
        fields: [{
          name: 'id'
        }, {
          name: 'name'
        }, {
          name: 'important',
          alwaysWrite: true
        }]
      },
      transport: {
        load: {
          url: 'load'
        },
        sync: {
          url: 'sync'
        }
      },
      autoLoad: false,
      autoSync: false
    });
    const resourceStore = crudManager.resourceStore;
    await crudManager.load();
    resourceStore.first.name = 'foot massage';
    const spy = t.spyOn(crudManager, 'sendRequest');
    await crudManager.sync();
    const callArgs = spy.callsLog[0].args[0];
    t.is(JSON.parse(callArgs.data).resources.updated[0].important, 123, 'Included the important alwaysWrite field');
  });
});