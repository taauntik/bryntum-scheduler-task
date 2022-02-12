"use strict";

StartTest(t => {
  let consoleMessages, consoleSpy, crudManager, scheduler;
  t.beforeEach(() => {
    var _consoleSpy;

    Scheduler.destroy(scheduler);
    (_consoleSpy = consoleSpy) === null || _consoleSpy === void 0 ? void 0 : _consoleSpy.remove();
  });

  function initConsoleSpy(t) {
    consoleMessages = [];
    consoleSpy = t.spyOn(console, 'warn').and.callFake(m => consoleMessages.push(m));
  } // Helper that builds a regexp based on the passed array of lines


  function buildLinesRegExp(lines) {
    return new RegExp(StringHelper.escapeRegExp(lines.join('\n')).replace(/\s+/g, '\\s*').replace(/XXX/g, '\\S+'));
  }

  t.it('Should revert / accept all changes when revertChanges / acceptChanges is called', async t => {
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        assignments: {
          rows: [{
            resourceId: 1,
            eventId: 1
          }]
        },
        events: {
          rows: [{
            id: 1,
            name: 'Task'
          }]
        },
        resources: {
          rows: [{
            id: 1,
            name: 'Man'
          }]
        }
      })
    });
    scheduler = t.getScheduler({
      crudManager: {
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
      }
    });
    const cm = scheduler.crudManager;
    await cm.load();
    cm.resourceStore.add({});
    cm.eventStore.add({});
    cm.assignmentStore.add({});
    t.ok(cm.hasChanges(), 'Changes found');
    cm.revertChanges();
    t.notOk(cm.hasChanges(), 'No changes found');
    cm.resourceStore.first.name = 'foo';
    cm.eventStore.first.name = 'foo';
    cm.assignmentStore.first.eventId = null;
    t.ok(cm.hasChanges(), 'Changes found');
    cm.acceptChanges();
    t.notOk(cm.hasChanges(), 'No changes found');
  }); // https://github.com/bryntum/support/issues/2668

  t.it('Should warn when load response format is incorrect if validateResponse is true', async t => {
    initConsoleSpy(t);
    scheduler = t.getScheduler({
      crudManager: {
        transport: {
          load: {
            url: 'foo'
          }
        },
        validateResponse: true
      }
    });
    crudManager = scheduler.crudManager;
    t.mockUrl('foo', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        assignments: {
          rows: [{
            resourceId: 1,
            eventId: 1
          }]
        },
        myEvents: {
          // <---------- wrong "events" section name
          rows: [{
            id: 1,
            name: 'Event'
          }]
        },
        resources: {
          rows: [{
            id: 1,
            name: 'Man'
          }]
        }
      })
    });
    await crudManager.load();
    t.like(consoleMessages.shift(), buildLinesRegExp(['CrudManager load response error(s):', '- No "events" store section found. It should contain the store data.', 'Please adjust your response to look like this:', '{', '    "events": {', '        "rows": [', '            ...', '        ]', '    }', '}', 'Note: To disable this validation please set the "validateResponse" config to false']), 'Correct warn message shown.');
    t.mockUrl('foo', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        assignments: {
          rows: [{
            resourceId: 1,
            eventId: 1
          }]
        },
        events: {
          data: [{
            // <---------- wrong "rows" section name
            id: 1,
            name: 'Event'
          }]
        },
        resources: {
          rows: [{
            id: 1,
            name: 'Man'
          }]
        }
      })
    });
    await crudManager.load();
    t.like(consoleMessages.shift(), buildLinesRegExp(['CrudManager load response error(s):', '- "events" store section should have a "rows" property with an array of the store records.', 'Please adjust your response to look like this:', '{', '    "events": {', '        "rows": [', '            ...', '        ]', '    }', '}', 'Note: To disable this validation please set the "validateResponse" config to false']), 'Correct warn message shown.');
    t.mockUrl('foo', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        assignments: {
          rows: [{
            resourceId: 1,
            eventId: 1
          }]
        },
        events: {
          rows: [{
            id: 1,
            name: 'Event'
          }]
        },
        myResources: {
          // <---------- wrong "resources" section name
          rows: [{
            id: 1,
            name: 'Man'
          }]
        }
      })
    });
    await crudManager.load();
    t.like(consoleMessages.shift(), buildLinesRegExp(['CrudManager load response error(s):', '- No "resources" store section found. It should contain the store data.', 'Please adjust your response to look like this:', '{', '    "resources": {', '        "rows": [', '            ...', '        ]', '    }', '}', 'Note: To disable this validation please set the "validateResponse" config to false']), 'Correct warn message shown.');
    t.mockUrl('foo', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        assignments: {
          rows: [{
            resourceId: 1,
            eventId: 1
          }]
        },
        events: {
          rows: [{
            id: 1,
            name: 'Event'
          }]
        },
        resources: {
          data: [{
            // <---------- wrong "rows" section name
            id: 1,
            name: 'Man'
          }]
        }
      })
    });
    await crudManager.load();
    t.like(consoleMessages.shift(), buildLinesRegExp(['CrudManager load response error(s):', '- "resources" store section should have a "rows" property with an array of the store records.', 'Please adjust your response to look like this:', '{', '    "resources": {', '        "rows": [', '            ...', '        ]', '    }', '}', 'Note: To disable this validation please set the "validateResponse" config to false']), 'Correct warn message shown.');
  }); // https://github.com/bryntum/support/issues/2668

  t.it('Should warn when sync response format is incorrect', async t => {
    initConsoleSpy(t);
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        assignments: {
          rows: [{
            resourceId: 1,
            eventId: 1
          }]
        },
        events: {
          rows: [{
            id: 1,
            name: 'Event'
          }]
        },
        resources: {
          rows: [{
            id: 1,
            name: 'Man'
          }]
        }
      })
    });
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: [{
          id: 1,
          name: 'Event'
        }]
      })
    });
    scheduler = t.getScheduler({
      crudManager: {
        transport: {
          load: {
            url: 'load'
          },
          sync: {
            url: 'sync'
          }
        },
        validateResponse: true
      }
    });
    crudManager = scheduler.crudManager;
    const {
      eventStore
    } = crudManager;
    await crudManager.load();
    t.diag('Updating an event');
    eventStore.first.name = 'bar';
    await crudManager.sync();
    t.like(consoleMessages.shift(), buildLinesRegExp(['CrudManager sync response error(s):', '- "events" store section should be an Object.', 'Please adjust your response to look like this:', '{', '    "events": {', '        ,,,', '    }', '}', 'Note: To disable this validation please set the "validateResponse" config to false']), 'Correct warn message shown.');
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: {
          data: [{
            id: 1,
            name: 'Event'
          }]
        }
      })
    });
    t.diag('Adding an event');
    eventStore.add({});
    await crudManager.sync();
    t.like(consoleMessages.shift(), buildLinesRegExp(['CrudManager sync response error(s):', '- "events" store "rows" section should mention added record(s) #XXX sent in the request. It should contain the added records identifiers (both phantom and "real" ones assigned by the backend).', 'Please adjust your response to look like this:', '{', '    "events": {', '        "rows": [', '            {', '                "$PhantomId": XXX,', '                "id": ...', '            }', '        ]', '    }', '}', 'Note: To disable this validation please set the "validateResponse" config to false']), 'Correct warn message shown.');
  }); // https://github.com/bryntum/support/issues/2668

  t.it('Should warn when sync response format is incorrect and supportShortSyncResponse is false', async t => {
    initConsoleSpy(t);
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        assignments: {
          rows: [{
            resourceId: 1,
            eventId: 1
          }]
        },
        events: {
          rows: [{
            id: 1,
            name: 'Event'
          }]
        },
        resources: {
          rows: [{
            id: 1,
            name: 'Man'
          }]
        }
      })
    });
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: [{
          id: 1,
          name: 'Event'
        }]
      })
    });
    scheduler = t.getScheduler({
      crudManager: {
        supportShortSyncResponse: false,
        transport: {
          load: {
            url: 'load'
          },
          sync: {
            url: 'sync'
          }
        },
        validateResponse: true
      }
    });
    crudManager = scheduler.crudManager;
    const {
      eventStore
    } = crudManager;
    await crudManager.load();
    eventStore.add({});
    await crudManager.sync();
    t.like(consoleMessages.shift(), buildLinesRegExp(['CrudManager sync response error(s):', '- "events" store "rows" section should mention added record(s) #XXX sent in the request. ' + 'It should contain the added records identifiers (both phantom and "real" ones assigned by the backend).', 'Please adjust your response to look like this:', '{', '    "events": {', '        "rows": [', '            {', '                "$PhantomId": XXX,', '                "id": ...', '            },', '            ...', '        ]', '    }', '}', 'Note: To disable this validation please set the "validateResponse" config to false']), 'Correct warn message shown.');
    crudManager.revertChanges();
    eventStore.first.name = 'bar';
    await crudManager.sync();
    t.like(consoleMessages.shift(), buildLinesRegExp(['CrudManager sync response error(s):', '- "events" store "rows" section should mention updated record(s) #XXX sent in the request. It should contain the updated record identifiers.', 'Please adjust your response to look like this:', '{', '    "events": {', '        "rows": [', '            {', '                "id": XXX', '            },', '            ...', '        ]', '    }', '}', 'Note: Please consider enabling "supportShortSyncResponse" option to allow less detailed sync responses (https://bryntum.com/docs/scheduler/api/Scheduler/crud/AbstractCrudManagerMixin#config-supportShortSyncResponse)', 'Note: To disable this validation please set the "validateResponse" config to false']), 'Correct warn message shown.');
    crudManager.revertChanges();
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: {
          deleted: [{
            id: 1,
            name: 'Event'
          }]
        }
      })
    });
    eventStore.remove(eventStore.first);
    await crudManager.sync();
    t.like(consoleMessages.shift(), buildLinesRegExp(['CrudManager sync response error(s):', '- "events" store "removed" section should mention removed record(s) #XXX sent in the request. It should contain the removed record identifiers.', 'Please adjust your response to look like this:', '{', '    "events": {', '        "removed": [', '            {', '                "id": XXX', '            },', '            ...', '        ]', '    }', '}', 'Note: Please consider enabling "supportShortSyncResponse" option to allow less detailed sync responses (https://bryntum.com/docs/scheduler/api/Scheduler/crud/AbstractCrudManagerMixin#config-supportShortSyncResponse)', 'Note: To disable this validation please set the "validateResponse" config to false']), 'Correct warn message shown.');
  });
  t.it('Should warn on multiple errors when sync response format is incorrect and supportShortSyncResponse is false', async t => {
    initConsoleSpy(t);
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        assignments: {
          rows: [{
            resourceId: 1,
            eventId: 1
          }]
        },
        events: {
          rows: [{
            id: 1,
            name: 'Event1'
          }, {
            id: 2,
            name: 'Event2'
          }]
        },
        resources: {
          rows: [{
            id: 1,
            name: 'Man'
          }]
        }
      })
    });
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: [{
          id: 1,
          name: 'Event'
        }]
      })
    });
    scheduler = t.getScheduler({
      crudManager: {
        supportShortSyncResponse: false,
        transport: {
          load: {
            url: 'load'
          },
          sync: {
            url: 'sync'
          }
        },
        validateResponse: true
      }
    });
    crudManager = scheduler.crudManager;
    const {
      eventStore
    } = crudManager;
    await crudManager.load();
    eventStore.add({});
    eventStore.first.name = 'bar';
    eventStore.remove(eventStore.getById(2));
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: {}
      })
    });
    await crudManager.sync();
    t.like(consoleMessages.shift(), buildLinesRegExp(['CrudManager sync response error(s):', '- "events" store "rows" section should mention added record(s) #XXX sent in the request. It should contain the added records identifiers (both phantom and "real" ones assigned by the backend).', '- "events" store "rows" section should mention updated record(s) #XXX sent in the request. It should contain the updated record identifiers.', '- "events" store "removed" section should mention removed record(s) #XXX sent in the request. It should contain the removed record identifiers.', 'Please adjust your response to look like this:', '{', '    "events": {', '        "removed": [', '            {', '                "id": XXX', '            },', '            ...', '        ],', '        "rows": [', '            {', '                "$PhantomId": XXX,', '                "id": ...', '            },', '            {', '                "id": XXX', '            },', '            ...', '        ]', '    }', '}', 'Note: Please consider enabling "supportShortSyncResponse" option to allow less detailed sync responses ' + '(https://bryntum.com/docs/scheduler/api/Scheduler/crud/AbstractCrudManagerMixin#config-supportShortSyncResponse)', 'Note: To disable this validation please set the "validateResponse" config to false']), 'Correct warn message shown.');
  }); // https://github.com/bryntum/support/issues/2668

  t.it('Should not warn when response format is incorrect if validateResponse is false', async t => {
    initConsoleSpy(t);
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        assignments: {
          rows: [{
            resourceId: 1,
            eventId: 1
          }]
        },
        events: {
          rows: [{
            id: 1,
            name: 'Event'
          }]
        },
        resources: {
          rows: [{
            id: 1,
            name: 'Man'
          }]
        }
      })
    });
    scheduler = t.getScheduler({
      crudManager: {
        validateResponse: false,
        transport: {
          load: {
            url: 'load'
          },
          sync: {
            url: 'sync'
          }
        },
        autoSync: false
      }
    });
    crudManager = scheduler.crudManager;
    await crudManager.load();
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: [{
          id: 1,
          name: 'Event'
        }]
      })
    });
    crudManager.eventStore.add({});
    await crudManager.sync();
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        assignments: {
          rows: [{
            resourceId: 1,
            eventId: 1
          }]
        },
        myEvents: {
          rows: [{
            id: 1,
            name: 'Event'
          }]
        },
        resources: {
          rows: [{
            id: 1,
            name: 'Man'
          }]
        }
      })
    });
    await crudManager.load();
    t.is(consoleMessages.length, 0, 'No console warn messages');
  });
});