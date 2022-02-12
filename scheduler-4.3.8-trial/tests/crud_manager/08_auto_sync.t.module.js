import { Store, AbstractCrudManager, JsonEncoder } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    // Here we test autoSync config of AbstractCrudManager class

    let sent = 0;

    // dummy transport implementation
    // just waits for 50ms and then calls the successful callback
    const TestTransport = Base => class extends (Base || class {}) {
        sendRequest(config) {
            const r = response[sent];

            sent++;

            t.it('Packet contains all changes', t => {
                t.ok(config.data.someStore1.added.length, 'someStore1 added records');
                t.ok(config.data.someStore1.updated.length, 'someStore1 updated records');
                t.ok(config.data.someStore1.removed.length, 'someStore1 removed records');

                t.ok(config.data.someStore2.added.length, 'someStore2 added records');
                t.ok(config.data.someStore2.updated.length, 'someStore2 updated records');
                t.ok(config.data.someStore2.removed.length, 'someStore2 removed records');
            });

            window.setTimeout(() => config.success.call(config.thisObj || this, {
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

    class TestCrudManager1 extends TestTransport(JsonEncoder(AbstractCrudManager)) {
        encode(data) {
            return data;
        }
    }

    let someStore1, someStore2, crud, added1, added2,
        response = [];

    const initTestData = () => {
        someStore1 = new Store({
            storeId : 'someStore1',
            fields  : ['id', 'ff1', 'ff2'],
            data    : [
                { id : 11, ff1 : '11', ff2 : '111' },
                { id : 12, ff1 : '22', ff2 : '222' },
                { id : 13, ff1 : '33', ff2 : '333' }
            ]
        });

        someStore2 = new Store({
            tree    : true,
            storeId : 'someStore2',
            fields  : ['id', 'f1', 'f2'],
            data    : [{
                expanded : true,
                children : [
                    { id : 1, f1 : '11', f2 : '111' },
                    { id : 2, f1 : '22', f2 : '222' },
                    { id : 3, f1 : '33', f2 : '333' },
                    { id : 4, f1 : '44', f2 : '444' }
                ]
            }]
        });

        crud = new TestCrudManager1({
            stores   : [someStore1, someStore2],
            autoSync : true
        });

        // init stores changes
        // someStore1
        someStore1.remove(someStore1.getById(11));
        someStore1.getById(12).set('ff1', '-22');
        added1 = someStore1.add({ ff1 : 'new', ff2 : 'new' });
        // someStore2
        someStore2.first.removeChild(someStore2.getById(4));
        someStore2.getById(3).set('f1', '-33');
        added2 = someStore2.getById(3).appendChild({ f1 : '55', f2 : '555' });

        // server response for this set of changes
        response.push({
            success    : true,
            someStore1 : {
                rows : [
                    { $PhantomId : added1[0].id, id : 14 },
                    { id : 12, ff2 : '-222' }
                ],
                removed : [{ id : 11 }]
            },
            someStore2 : {
                rows : [
                    { $PhantomId : added2.id, id : 5 },
                    { id : 3, f2 : '-333' }
                ],
                removed : [{ id : 4 }]
            }
        });
    };

    t.it('Automatically invokes sync() when autoSync=True', t => {
        initTestData();

        // we do not call sync() since crud manager has to catch stores changes made inside initTestData() call

        t.willFireNTimes(crud, 'beforesync', 1);
        t.willFireNTimes(crud, 'beforesyncapply', 1);
        t.willFireNTimes(crud, 'sync', 1);

        t.waitForEvent(crud, 'sync', () => {
            t.is(sent, 1, 'Sent only one sync packet');

            t.it('Applies response to someStore1', t => {
                t.notOk(someStore1.modified.count, 'has no dirty updated records');
                t.notOk(someStore1.removed.count, 'has no dirty removed records');

                t.is(someStore1.getById(14).get('ff1'), 'new', 'added record has correct ff1 field value');
                t.is(someStore1.getById(14).get('ff2'), 'new', 'added record has correct ff2 field value');

                t.is(someStore1.getById(12).get('ff2'), '-222', 'updated record has correct ff2 field value');
            });

            t.it('Applies response to someStore2', t => {
                t.notOk(someStore2.modified.count, 'has no dirty updated records');
                t.notOk(someStore2.removed.count, 'has no dirty removed records');

                t.is(someStore2.getById(5).get('f1'), '55', 'added record has correct f1 field value');
                t.is(someStore2.getById(5).get('f2'), '555', 'added record has correct f2 field value');

                t.is(someStore2.getById(3).get('f2'), '-333', 'updated record has correct f2 field value');
            });
        });
    });
});
