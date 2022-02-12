import { Store, AbstractCrudManager, JsonEncoder } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    // Here we test that a CRUD manager appends records to a flat store when "append: true" is passed to load() call

    let crudManager, async, callback, response;

    // dummy transport implementation
    // just waits for 50ms and then calls the successful callback
    let TestTransport = Base => class extends (Base || class {}) {
        sendRequest(config) {
            window.setTimeout(() => {
                t.ok(response, 'Response exists');
                t.ok(config.success, 'Success called');
                config.success.call(config.thisObj || this, {
                    ok         : false,
                    redirected : false,
                    status     : 200,
                    statusText : 'OK',
                    text() {
                        return new Promise((resolve) => {
                            resolve(JSON.stringify(response));
                        });
                    },
                    json() {
                        return new Promise((resolve) => {
                            resolve(response);
                        });
                    }
                }, null, config).then(() => {
                    t.ok(callback, 'Callback called');
                    callback && callback();
                });
            }, 50);
        }
    };

    class TestCrudManager extends TestTransport(JsonEncoder(AbstractCrudManager)) {}

    t.beforeEach(() => {
        crudManager && crudManager.destroy();

        crudManager = new TestCrudManager();
    });

    t.it('Appends records to a flat store when "append: true" options is passed to load() call', t => {
        async = t.beginAsync();

        const store1 = new Store({
            tree    : true,
            fields  : ['id'],
            storeId : 'store1',
            data    : [{
                expanded : true,
                children : [
                    { id : 1, leaf : true },
                    { id : 2, leaf : true },
                    { id : 3, leaf : true }
                ]
            }]
        });

        const store2 = new Store({
            fields  : ['id'],
            storeId : 'store2',
            data    : [
                { id : 1 },
                { id : 2 }
            ]
        });

        crudManager.addStore(['store1', 'store2']);

        response = {
            success : true,
            store1  : { rows : [{ id : 4 }] },
            store2  : { rows : [{ id : 3 }] }
        };

        callback = () => {
            t.endAsync(async);

            t.is(store1.count, 1, 'Store 1 has the correct amount of records');
            t.is(store2.count, 3, 'Store 2 has the correct amount of records');
            t.is(store1.last.get('id'), 4, 'Store 1 last record is correct');
            t.is(store2.last.get('id'), 3, 'Store 2 last record is correct');

            t.isDeeplyUnordered(store1.records, [store1.getById(4)], 'store1 has proper set of records');
            t.isDeeplyUnordered(store2.records, [store2.getById(1), store2.getById(2), store2.getById(3)], 'store2 has proper set of records');
        };

        // It triggers sendRequest function therefore callback will be called
        crudManager.load({
            store2 : { append : true }
        });
    });
});
