import { Store, AbstractCrudManager, CrudManager, JsonEncoder, ResourceModel, VersionHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    // Here we test load() method of AbstractCrudManager class

    let sent = 0;

    // dummy transport implementation
    // just waits for 50ms and then calls the successful callback
    const
        response      = [],
        TestTransport = Base => class extends (Base || class {}) {
            sendRequest(config) {
                const r = response[sent];

                sent++;

                window.setTimeout(() => config[this.testRequestMethod || 'success'].call(config.thisObj || this, {
                    ok         : false,
                    redirected : false,
                    status     : 200,
                    statusText : 'OK',
                    text() {
                        return new Promise((resolve) => {
                            resolve(JSON.stringify(r));
                        });
                    },
                    json() {
                        return new Promise((resolve) => {
                            resolve(r);
                        });
                    }
                }, null, config), 50);
            }
        };

    class TestCrudManager1 extends TestTransport(JsonEncoder(AbstractCrudManager)) {}

    let someStore1, someStore2, crud;

    function initTestData() {
        someStore1 = new Store({
            storeId : 'someStore1',
            fields  : ['id', 'ff1', 'ff2']
        });

        someStore2 = new Store({
            tree    : true,
            storeId : 'someStore2',
            fields  : ['id', 'f1', 'f2']
        });

        crud = new TestCrudManager1({
            stores : [someStore1, someStore2]
        });

        // server response for this set of changes
        response.push({
            success    : true,
            revision   : 99,
            someStore1 : {
                rows : [
                    { id : 11, ff1 : '11', ff2 : '111' },
                    { id : 12, ff1 : '22', ff2 : '222' },
                    { id : 13, ff1 : '33', ff2 : '333' }
                ]
            },
            someStore2 : {
                rows : [
                    {
                        id       : 0,
                        f1       : 'root',
                        f2       : 'root',
                        children : [
                            { id : 1, f1 : '11', f2 : '111', leaf : true },
                            { id : 2, f1 : '22', f2 : '222', leaf : true },
                            { id : 3, f1 : '33', f2 : '333', leaf : true },
                            { id : 4, f1 : '44', f2 : '444', leaf : true },
                            {
                                id       : 5,
                                f1       : '55',
                                f2       : '555',
                                children : [
                                    { id : 6, f1 : '66', f2 : '666', leaf : true },
                                    { id : 7, f1 : '77', f2 : '777', leaf : true }
                                ]
                            }
                        ]
                    }
                ]
            }
        });
    }

    t.it('Loads data', t => {
        initTestData();

        t.is(crud.isLoading, false, 'not loading now');
        t.willFireNTimes(crud, 'beforeload', 1);
        t.willFireNTimes(crud, 'beforeloadapply', 1);
        t.willFireNTimes(crud, 'load', 1);
        t.willFireNTimes(crud, 'nochanges', 1);

        t.willFireNTimes(someStore1, 'loadstart', 1);
        t.willFireNTimes(someStore1, 'afterrequest', 1);

        t.beginAsync();

        const promise = crud.load();

        t.is(crud.isLoading, true, 'loading when operation is started');

        promise.then(() => {
            t.is(crud.isLoading, false, 'not loading when operation is finished');
            t.endAsync();

            t.is(crud.revision, 99, 'revision applied');

            t.it('Applies response to someStore1', t => {
                t.notOk(someStore1.modified.count, 'has no dirty updated records');
                t.notOk(someStore1.removed.count, 'has no dirty removed records');

                t.is(someStore1.getById(11).get('ff1'), '11', '#11: correct ff1 field value');
                t.is(someStore1.getById(11).get('ff2'), '111', '#11: correct ff2 field value');

                t.is(someStore1.getById(12).get('ff1'), '22', '#12: correct ff1 field value');
                t.is(someStore1.getById(12).get('ff2'), '222', '#12: correct ff2 field value');

                t.is(someStore1.getById(13).get('ff1'), '33', '#13: correct ff1 field value');
                t.is(someStore1.getById(13).get('ff2'), '333', '#13: correct ff2 field value');
            });

            t.it('Applies response to someStore2', t => {
                t.notOk(someStore2.modified.count, 'has no dirty updated records');
                t.notOk(someStore2.removed.count, 'has no dirty removed records');

                t.is(someStore2.getById(1).get('f1'), '11', 'correct f1 field value');
                t.is(someStore2.getById(1).get('f2'), '111', 'correct f2 field value');

                t.is(someStore2.getById(2).get('f1'), '22', 'correct f1 field value');
                t.is(someStore2.getById(2).get('f2'), '222', 'correct f2 field value');

                t.is(someStore2.getById(3).get('f1'), '33', 'correct f1 field value');
                t.is(someStore2.getById(3).get('f2'), '333', 'correct f2 field value');

                t.is(someStore2.getById(4).get('f1'), '44', 'correct f1 field value');
                t.is(someStore2.getById(4).get('f2'), '444', 'correct f2 field value');

                t.is(someStore2.getById(5).get('f1'), '55', 'correct f1 field value');
                t.is(someStore2.getById(5).get('f2'), '555', 'correct f2 field value');

                t.is(someStore2.getById(6).get('f1'), '66', 'correct f1 field value');
                t.is(someStore2.getById(6).get('f2'), '666', 'correct f2 field value');

                t.is(someStore2.getById(7).get('f1'), '77', 'correct f1 field value');
                t.is(someStore2.getById(7).get('f2'), '777', 'correct f2 field value');
            });
        });

        t.is(sent, 1, 'Load packet sent');
    });

    t.it('Fires loadfail on AJAX errors', t => {
        const crud = new CrudManager({
            resourceStore : t.getResourceStore({}, 5),
            eventStore    : t.getEventStore({}, 5),
            transport     : {
                load : {
                    url : 'foo'
                }
            },
            warn() {},

            listeners : {
                requestFail(event) {
                    t.it('requestFail event params', t => {
                        t.is(event.requestType, 'load');
                        t.is(event.response, null);
                        t.ok(event.responseText);
                        t.ok(event.responseOptions);
                    });
                },

                loadFail(event) {
                    t.it('loadFail event params', t => {
                        t.is(event.response, null);
                        t.ok(event.responseText);
                        t.ok(event.responseOptions);
                        t.ok('options' in event);
                    });
                }
            }
        });

        t.willFireNTimes(crud, 'loadfail', 1);

        const async = t.beginAsync();

        t.is(crud.isLoading, false, 'not loading now');

        crud.on('loadstart', () => {
            t.is(crud.isLoading, true, 'isLoading inside loadstart listener');
        });

        const promise = crud.load();

        t.is(crud.isLoading, true, 'loading now');

        promise.then(
            () => t.endAsync(async),
            () => {
                t.endAsync(async);
                t.is(crud.isLoading, false, 'not loading now');
            }
        );
    });

    t.it('Promises do work', t => {
        initTestData();

        crud.on({
            beforeload : () => false,
            once       : true
        });

        t.chain(
            next => {
                crud.load().then(() => {}, ({ cancelled }) => {
                    t.ok(cancelled, 'Request was cancelled');
                    next();
                });
            },
            next => {
                crud.testRequestMethod = 'failure';

                crud.load().then(() => {}, response => {
                    t.notOk(response.cancelled, 'Request was not sent');
                    next();
                });
            },
            next => {
                delete crud.testRequestMethod;
                sent = 0;

                crud.load().then(({ response }) => {
                    t.is(response.success, true, 'Response successful');
                    next();
                }, () => {
                    t.fail('Response should be successful');
                });
            },
            // This step is required to make previous step stable without begin/endAsync
            next => {}
        );
    });

    t.it('Should cancel load request', async t => {
        const cm = new CrudManager({
            validateResponse : false,
            transport        : {
                load : {
                    url : 'foo'
                }
            }
        });

        t.firesOk({
            observable : cm,
            events     : {
                beforeLoad : 2,
                load       : 1
            }
        });

        // unhandled rejection handle is disabled in this test, but we need it in this particular test
        const handler = event => {
            t.fail(`Unhandled promise rejection: ${event.reason}`);
        };

        window.addEventListener('unhandledrejection', handler);

        let cancelled = false;

        // Call first load to scheduler request, do not wait for it to end
        cm.load().catch(reason => {
            if (reason.cancelled) {
                cancelled = true;
            }
        });

        t.mockUrl('foo', {
            responseText : JSON.stringify({
                success : true
            })
        });

        // Call load once again, first request should get cancelled
        await cm.load();

        t.ok(cancelled, 'First load was cancelled');

        window.removeEventListener('unhandledrejection', handler);
    });

    t.it('Should handle server responding garbage / 500 error', async t => {

        const async = t.beginAsync();

        class AutoLoadCrudManager extends CrudManager {
            // We don't use Siesta means to track the event to let CrudManager output to console
            onLoadFail() {
                t.endAsync(async);
                t.pass('loadFail is triggered');
            }
        }

        t.failOnPromiseRejection = false;

        const consoleWarn = t.spyOn(t.global.console, 'warn').and.callThrough();

        const cm = new AutoLoadCrudManager({
            autoLoad  : true,
            transport : {
                load : {
                    url : 'missingUrl'
                },
                sync : {
                    url : 'missingUrl'
                }
            }
        });

        await t.waitFor(() => !cm.isCrudManagerLoading);

        // Only run in debug env
        if (VersionHelper.isDebug) {
            t.expect(consoleWarn).toHaveBeenCalledWith(
                t.anyStringLike('CrudManager error while auto-loading the data (please setup "loadFail" or "requestFail" event listeners to handle such cases)'),
                t.any()
            );
        }
    });

    t.it('Should handle server responding 200 but malformed JSON', async t => {
        const async = t.beginAsync();

        const consoleWarn  = t.spyOn(t.global.console, 'warn').and.callThrough();

        t.spyOn(t.global.console, 'error').and.stub();

        class AutoLoadCrudManager extends CrudManager {
            // We don't use Siesta means to track the event to let CrudManager output to console
            onLoadFail() {
                t.endAsync(async);
                t.pass('loadFail is triggered');
            }
        }

        const cm = new AutoLoadCrudManager({
            autoLoad  : true,
            transport : {
                load : {
                    url : 'crud_manager/mockresponses/badjson.json'
                },
                sync : {
                    url : 'crud_manager/mockresponses/badjson.json'
                }
            }
        });

        await t.waitFor(() => !cm.isCrudManagerLoading);

        // Only run in debug env
        if (VersionHelper.isDebug) {
            t.expect(consoleWarn).toHaveBeenCalledWith(
                t.anyStringLike('CrudManager error while auto-loading the data (please setup "loadFail" or "requestFail" event listeners to handle such cases)'),
                t.any()
            );
        }
    });

    // NOTE: This will not work now without a project connecting the stores. TODO: Remove?
    t.xit('Should update dependent stores', t => {
        const crud = new CrudManager({
            autoLoad  : true,
            transport : {
                load : {
                    url : 'crud_manager/mockresponses/resourcetree.json'
                }
            }
        });

        const async = t.beginAsync();

        crud.on({
            load() {
                crud.eventStore.forEach(record => {
                    t.isInstanceof(record.resource, ResourceModel, 'Resource reference is ok');
                });

                t.endAsync(async);
            }
        });
    });

    t.it('Triggering new load while loading is ongoing should not lead to exception in console', async t => {

        const crud = new CrudManager({
            transport : {
                load : {
                    url : 'crud_manager/mockresponses/resourcetree.json'
                }
            }
        });

        crud.load().catch(({ cancelled }) => {
            // TODO the code never steps in here
            t.ok(cancelled);
        });

        await crud.load();
    });

    t.it('Should support having query params in the URL', async t => {
        const crud = new CrudManager({
            transport : {
                load : {
                    url : 'params?foo=bar'
                }
            }
        });

        const spy = t.spyOn(window, 'fetch').callFake(() => new Promise(() => {}));
        crud.load();

        const url = spy.callsLog[0].args[0];

        t.ok(url.startsWith('params?foo=bar&data='), 'Params appended to URL with &');
    });

    t.it('Should handle stores being destroyed during load', async t => {
        initTestData();

        const promise = crud.load();

        someStore2.destroy();

        await promise;

        t.is(someStore1.getById(11).get('ff1'), '11', 'Other store loaded correctly');
    });

    t.it('Should support calling load with a string argument used as the URL', async t => {
        t.mockUrl('foo', {
            responseText : JSON.stringify({
                success : true
            })
        });

        t.mockUrl('bar', {
            responseText : JSON.stringify({
                success : true
            })
        });

        crud = new CrudManager({
            transport : {
                load : {
                    url : 'foo'
                }
            }
        });

        crud.on({
            beforeSend : ({ requestConfig }) => t.is(requestConfig.url, 'foo'),
            once       : true
        });

        crud.load();

        crud.on({
            beforeSend : ({ requestConfig }) => t.is(requestConfig.url, 'bar'),
            once       : true
        });

        crud.load('bar');
    });
});
