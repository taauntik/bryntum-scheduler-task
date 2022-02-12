"use strict";

StartTest(t => {
  t.diag('Here we test sync() method of AbstractCrudManager class');
  let sent, received, someStore1, someStore2, crud, added1, added2, response; // dummy transport implementation
  // just waits for 50ms and then calls the successful callback

  const TestTransport = Base => class extends Base {
    sendRequest(config) {
      const r = response[sent],
            me = this;
      sent++;
      window.setTimeout(() => {
        // The callbacks receive the Fetch API's Response object
        // So we fab one up with a fail code and blank response text here.
        if (this.testRequestMethod === 'failure') {
          config.failure.call(config.thisObj, {
            ok: false,
            redirected: false,
            status: 500,
            statusText: 'Internal Server Error',

            text() {
              return new Promise(resolve => {
                resolve('');
              });
            },

            json() {
              return new Promise(resolve => {
                resolve({});
              });
            }

          }, null, {
            type: config.type,
            id: config.id
          });
        } else {
          config.success.call(config.thisObj || this, {
            ok: false,
            redirected: false,
            status: 200,
            statusText: 'OK',

            text() {
              return new Promise(resolve => {
                resolve(JSON.stringify(r));
              });
            },

            json() {
              return new Promise(resolve => {
                resolve(r);
              });
            }

          }, null, {
            type: config.type,
            id: config.id
          }).then(() => {
            if (r !== null && r !== void 0 && r.success) {
              me.test.is(me.revision, r.revision, 'revision applied');
            }

            received++;
          });
        }
      }, 50);
    }

  };

  class TestCrudManager1 extends JsonEncoder(TestTransport(AbstractCrudManager)) {
    warn() {}

  }

  let initialResponse;

  const initTestData = t => {
    // reset requests number
    sent = 0;
    received = 0;
    response = [];
    someStore1 = new Store({
      storeId: 'someStore1',
      fields: ['id', 'ff1', 'ff2'],
      data: [{
        id: 11,
        ff1: '11',
        ff2: '111'
      }, {
        id: 12,
        ff1: '22',
        ff2: '222'
      }, {
        id: 13,
        ff1: '33',
        ff2: '333'
      }]
    });
    someStore2 = new Store({
      tree: true,
      storeId: 'someStore2',
      fields: ['id', 'f1', 'f2'],
      data: [{
        expanded: true,
        children: [{
          id: 1,
          f1: '11',
          f2: '111'
        }, {
          id: 2,
          f1: '22',
          f2: '222'
        }, {
          id: 3,
          f1: '33',
          f2: '333'
        }, {
          id: 4,
          f1: '44',
          f2: '444'
        }]
      }]
    });
    crud = new TestCrudManager1({
      test: t,
      stores: [someStore1, someStore2],
      revision: 1
    }); // init stores changes
    // someStore1

    someStore1.remove(someStore1.getById(11));
    someStore1.getById(12).set('ff1', '-22');
    added1 = someStore1.add({
      ff1: 'new',
      ff2: 'new'
    }); // someStore2

    someStore2.first.removeChild(someStore2.getById(4));
    someStore2.getById(3).set('f1', '-33');
    added2 = someStore2.getById(3).appendChild({
      f1: '55',
      f2: '555'
    }); // server response for this set of changes

    response.push(initialResponse = {
      revision: 2,
      success: true,
      someStore1: {
        rows: [{
          $PhantomId: added1[0].id,
          id: 14
        }, {
          id: 12,
          ff2: '-222'
        }],
        removed: [{
          id: 11
        }]
      },
      someStore2: {
        rows: [{
          $PhantomId: added2.id,
          id: 5
        }, {
          id: 3,
          f2: '-333'
        }],
        removed: [{
          id: 4
        }]
      }
    });
  };

  t.it('Delays the sending of sync packet while previous is not responded', async t => {
    initTestData(t); // we expect one syncdelayed since one of sync() calls are delayed

    t.willFireNTimes(crud, 'syncdelayed', 1); // successful sync() calls have to return following events

    t.willFireNTimes(crud, 'beforesync', 2);
    t.willFireNTimes(crud, 'beforesyncapply', 2);
    t.willFireNTimes(crud, 'sync', 2); // call sync for the 1st time

    const promise1 = crud.sync();
    t.is(crud.activeSyncPromise, promise1, 'First sync promise is active');
    const async = t.beginAsync();
    promise1.then(result => {
      t.isDeeply(result, {
        response: initialResponse,
        request: t.any(Object),
        rawResponse: t.any(Object),
        responseText: JSON.stringify(initialResponse)
      });
      t.endAsync(async);
      t.is(crud.activeSyncPromise, promise2, 'First sync promise is resolved and second promise started');
    }); // add one more record

    const a = someStore1.add({
      ff1: 'another new',
      ff2: 'another new'
    }); // server response for this change

    response.push({
      success: true,
      revision: 3,
      someStore1: {
        rows: [{
          $PhantomId: a[0].id,
          id: 15
        }]
      }
    }); // now we call sync again but the 1st call is not responded yet
    // so crud manager will delay 2nd sync call and re-call it
    // after 1st packet get responded

    const promise2 = crud.sync();
    t.is(crud.activeSyncPromise, promise2, 'Queued second sync promise');
    t.is(sent, 1, 'Sent only 1st sync packet');
    await t.waitFor(() => someStore1.modified.count === 0 && someStore2.modified.count === 0 && sent === 2 && received === 2);
    t.it('Applies response to someStore1', t => {
      t.notOk(someStore1.modified.count, 'has no dirty updated records');
      t.notOk(someStore1.removed.count, 'has no dirty removed records');
      t.is(someStore1.getById(14).get('ff1'), 'new', 'added record has correct ff1 field value');
      t.is(someStore1.getById(14).get('ff2'), 'new', 'added record has correct ff2 field value');
      t.is(someStore1.getById(12).get('ff2'), '-222', 'updated record has correct ff2 field value');
      const newRec = someStore1.getById(15);
      t.ok(newRec, 'Another added record found');
      t.is(newRec.get('ff1'), 'another new', 'another added record has correct ff1 field value');
      t.is(newRec.get('ff2'), 'another new', 'another added record has correct ff2 field value');
    });
    t.it('Applies response to someStore2', t => {
      t.notOk(someStore2.modified.count, 'has no dirty updated records');
      t.notOk(someStore2.removed.count, 'has no dirty removed records');
      t.is(someStore2.getById(5).get('f1'), '55', 'added record has correct f1 field value');
      t.is(someStore2.getById(5).get('f2'), '555', 'added record has correct f2 field value');
      t.is(someStore2.getById(3).get('f2'), '-333', 'updated record has correct f2 field value');
    });
  });
  t.it('Fires syncfail on AJAX errors', t => {
    const resourceStore = t.getResourceStore({}, 5);
    const crud = new CrudManager({
      resourceStore: resourceStore,
      eventStore: t.getEventStore({}, 5),
      transport: {
        sync: {
          url: 'foo'
        }
      },

      warn() {},

      listeners: {
        requestFail(event) {
          t.it('requestFail event params', t => {
            t.is(event.requestType, 'sync');
            t.is(event.response, null);
            t.ok(event.responseText);
            t.ok(event.responseOptions);
          });
        },

        syncFail(event) {
          t.it('loadFail event params', t => {
            t.is(event.response, null);
            t.ok(event.responseText);
            t.ok(event.responseOptions);
            t.ok('options' in event);
          });
        }

      }
    });
    t.willFireNTimes(crud, 'syncfail', 1);
    resourceStore.add({
      name: 'bar'
    });
    const async = t.beginAsync();
    crud.sync().then(() => t.endAsync(async), () => t.endAsync(async));
  });
  t.it('Fires syncfail event if response is empty', function (t) {
    initTestData(t);
    t.willFireNTimes(crud, 'syncfail', 1);
    response.length = 0;
    const async = t.beginAsync();
    crud.sync().then(() => {}, () => {
      t.endAsync(async);
      t.pass('Promise rejected successfully');
    });
  });
  t.it('Fires syncfail event if response.success is empty', function (t) {
    initTestData(t);
    crud.skipSuccessProperty = false;
    t.willFireNTimes(crud, 'syncfail', 1);
    delete response[0].success;
    const async = t.beginAsync();
    crud.sync().then(() => {}, () => {
      t.endAsync(async);
      t.pass('Promise rejected successfully');
    });
  });
  t.it('Promises work ok', t => {
    initTestData(t);
    t.chain(next => {
      crud.on({
        beforeSync: () => false,
        once: true
      });
      crud.sync().then(({
        cancelled
      }) => {
        t.pass('Sync request cancelled ok');
        t.ok(cancelled, 'Reason is ok');
        next();
      });
    }, next => {
      someStore1.add({
        ff1: 'another new',
        ff2: 'another new'
      });
      crud.testRequestMethod = 'failure';
      crud.sync().then(() => {}, ({
        cancelled
      }) => {
        t.pass('Request was not successful ok');
        t.notOk(cancelled, 'Reason is ok');
        next();
      });
    }, next => {
      delete crud.testRequestMethod;
      sent = 0;
      crud.sync().then(() => {
        t.pass('Request was successful');
        next();
      }, () => {
        t.fail('Request should be successful');
      });
    }, // This step is required to make previous step stable without begin/endAsync
    next => {});
  });
  t.it('Should not try to sync invalid record', t => {
    class Resource extends ResourceModel {
      get isValid() {
        return Boolean(this.name);
      }

    }

    const resourceStore = t.getResourceStore({
      modelClass: Resource
    }, 5);
    const crud = new CrudManager({
      autoSync: true,
      resourceStore,
      eventStore: t.getEventStore({}, 5),
      transport: {
        sync: {
          url: 'foo'
        }
      },

      warn() {}

    });
    t.wontFire(crud, 'beforesync');
    const newResource = new Resource();
    resourceStore.add(newResource);
    const async = t.beginAsync();
    crud.sync().then(() => t.endAsync(async), () => t.endAsync(async));
  });
  t.it('sync should work with fields with a dataSource', async t => {
    class MyEventRec extends EventModel {
      static get fields() {
        return [{
          name: 'name',
          type: 'string',
          dataSource: 'eventDisplayName'
        }];
      }

    }

    t.mockUrl('test-sync-with-dataSource', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: {
          rows: [{
            id: 1,
            eventDisplayName: 'First event name after sync'
          }]
        }
      })
    });
    const crud = new CrudManager({
      project: new ProjectModel({
        eventStore: t.getEventStore({
          modelClass: MyEventRec,
          data: [{
            id: 1,
            eventDisplayName: 'First event start name'
          }]
        }, 5)
      }),
      transport: {
        sync: {
          url: 'test-sync-with-dataSource'
        }
      },

      warn() {}

    });
    await t.waitForProjectReady(crud);
    t.is(crud.eventStore.first.name, 'First event start name'); // This will be attempted to be synced, but the server will override, returning its own new name

    crud.eventStore.first.name = 'Attempt to set the name';
    await crud.sync();
    t.is(crud.eventStore.first.name, 'First event name after sync');
  });
  t.it('Should support suspendAutoSync/resumeAutoSync', async t => {
    const crud = new CrudManager({
      autoSyncTimeout: 0,
      project: new ProjectModel({
        eventStore: t.getEventStore({
          data: [{
            id: 1,
            eventDisplayName: 'First event start name'
          }]
        })
      }),
      transport: {
        sync: {
          url: 'short-sync'
        }
      },
      autoSync: true
    });
    t.mockUrl('short-sync', {
      responseText: '{}'
    });
    const spy = t.spyOn(crud, 'sync'); // make event store dirty to guarantee sync() is called

    crud.eventStore.first.name = 'qqq';
    crud.suspendAutoSync();
    crud.suspendAutoSync();
    t.expect(crud.autoSyncSuspendCounter).toBe(2);
    t.expect(spy.calls.count()).toBe(0);
    crud.resumeAutoSync();
    t.expect(spy.calls.count()).toBe(0);
    t.expect(crud.autoSyncSuspendCounter).toBe(1); // this should trigger a schedule of sync() which is delayed by 0ms

    crud.resumeAutoSync();
    await t.waitFor(() => spy.calls.count() === 1);
  });
  t.it('Should not call sync if resumeAutoSync is called with false', async t => {
    const crud = new CrudManager({
      autoSyncTimeout: 0,
      project: new ProjectModel({
        eventStore: t.getEventStore({
          data: [{
            id: 1,
            eventDisplayName: 'First event start name'
          }]
        })
      }),
      autoSync: true
    });
    const spy = t.spyOn(crud, 'sync');
    crud.suspendAutoSync();
    t.expect(crud.autoSyncSuspendCounter).toBe(1);
    t.expect(spy.calls.count()).toBe(0);
    crud.resumeAutoSync(false); // wait a bit to allow setTimeout 0 to expire

    await t.waitFor(50);
    t.expect(spy.calls.count()).toBe(0);
  });
});