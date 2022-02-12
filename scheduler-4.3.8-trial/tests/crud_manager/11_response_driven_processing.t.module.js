import { AbstractCrudManager, Store, JsonEncoder } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let crudManager, response, assertionsFn, async;

    const TestTransport = Base => class extends (Base || class {}) {
        sendRequest(config) {
            window.setTimeout(() => {
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
                    assertionsFn && assertionsFn();
                });
            }, 50);
        }
    };

    class TestCrudManager extends TestTransport(JsonEncoder(AbstractCrudManager)) {}

    t.beforeEach(() => {
        crudManager && crudManager.destroy();

        crudManager = new TestCrudManager({
            trackResponseType : true
        });
    });

    t.it('CrudManager handles "sync" response on "load" request for a flat store', t => {
        async = t.beginAsync();

        const store1 = new Store({
            fields  : ['id', 'text1'],
            storeId : 'store1',
            data    : [
                { id : 1, text1 : 'foo' },
                { id : 2, text1 : 'bar' }
            ]
        });

        crudManager.addStore(store1);

        response = {
            type    : 'sync',
            success : true,
            store1  : {
                rows : [
                    { id : 1, text1 : 'new text1' },
                    { id : 3, text1 : 'new row' }
                ],
                removed : [
                    { id : 2 }
                ]
            }
        };

        t.wontFire(store1, 'load');

        assertionsFn = () => {
            t.endAsync(async);
            t.isDeeplyUnordered(store1.records, [store1.getById(1), store1.getById(3)], 'store1 has proper set of records');
            t.notOk(store1.changes, 'store1 has no changes');
        };

        crudManager.load();
    });

    t.it('CrudManager handles "sync" response on "load" request for a tree store', t => {
        async = t.beginAsync();

        const store1 = new Store({
            fields  : ['id', 'text1'],
            storeId : 'store1',
            tree    : true,
            data    : [
                { id : 1, text1 : 'node-1', leaf : true },
                {
                    id       : 2,
                    text1    : 'node-2',
                    expanded : true,
                    children : [
                        { id : 21, text1 : 'node-21', leaf : true },
                        { id : 22, text1 : 'node-22', leaf : true }
                    ]
                },
                { id : 3, text1 : 'node-3' }
            ]
        });

        crudManager.addStore(store1);

        response = {
            type    : 'sync',
            success : true,
            store1  : {
                rows : [
                    { id : 4, text1 : 'node-4' },
                    { id : 23, text1 : 'node-23', parentId : 2 },
                    { id : 2, parentId : 1 },
                    {
                        id       : 5,
                        text1    : 'node-5',
                        expanded : true,
                        children : [
                            { id : 51, text1 : 'node-51', leaf : true },
                            { id : 52, text1 : 'node-52', leaf : true }
                        ]
                    }
                ],
                removed : [
                    { id : 21 }
                ]
            }
        };

        t.wontFire(store1, 'load');

        assertionsFn = () => {
            t.endAsync(async);

            t.notOk(store1.changes, 'store1 has no changes');

            t.isDeeplyUnordered(store1.allRecords, [
                store1.getById(1),
                store1.getById(2),
                store1.getById(22),
                store1.getById(23),
                store1.getById(3),
                store1.getById(4),
                store1.getById(5),
                store1.getById(51),
                store1.getById(52)
            ], 'store1 has proper set of records');

            t.isDeeplyUnordered(store1.rootNode.children, [
                store1.getById(1),
                store1.getById(3),
                store1.getById(4),
                store1.getById(5)
            ], 'root has proper set of children');

            t.isDeeplyUnordered(store1.getById(1).children, [store1.getById(2)], 'node-1 has proper set of children');
            t.notOk(store1.getById(3).children, 'node-3 has proper set of children');
            t.notOk(store1.getById(4).children, 'node-4 has proper set of children');
            t.isDeeplyUnordered(store1.getById(5).children, [store1.getById(51), store1.getById(52)], 'node-5 has proper set of children');
            t.isDeeplyUnordered(store1.getById(2).children, [store1.getById(22), store1.getById(23)], 'node-2 has proper set of children');
        };

        crudManager.load();
    });
});
