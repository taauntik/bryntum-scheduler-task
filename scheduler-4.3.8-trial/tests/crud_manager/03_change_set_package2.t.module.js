import { Model, Store, AbstractCrudManager, ResourceModel } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    class TestModel extends Model {
        static get fields() {
            return ['id', 'f1', 'f2', 'f3', { name : 'f4', critical : true }, { name : 'f5', persist : false }];
        }
    }

    class MyResource extends ResourceModel {
        static get fields() {
            return ResourceModel.fields.concat(['surname']);
        }
    }

    t.it('Should write all fields', t => {
        const resourceStore = t.getResourceStore({
                modelClass     : MyResource,
                writeAllFields : false,
                data           : [
                    { id : 1, name : 'Albert', surname : 'Einstein' }
                ]
            }),
            someStore     = new Store({
                modelClass : TestModel,
                data       : [
                    { id : 1, f1 : '11', f2 : '111', f4 : 'foo', f5 : 'garbage' }
                ]
            }),
            someStore1    = new Store({
                fields : ['id', 'ff1', 'ff2'],
                data   : [
                    { id : 1, ff1 : '11', ff2 : '111' }
                ]
            });

        const crud = new AbstractCrudManager({
            writeAllFields : true,
            stores         : [
                { store : resourceStore, storeId : 'resources' },
                { store : someStore, storeId : 'something' },
                { store : someStore1, storeId : 'something1', writeAllFields : false }
            ],
            revision : 1
        });

        someStore.first.f1       = '22';
        someStore1.first.ff1     = '22';
        resourceStore.first.name = 'John';

        const pack = crud.getChangeSetPackage();

        t.isDeeply(pack.resources, { updated : [{ id : 1, name : 'John' }] });
        t.isDeeply(pack.something, { updated : [{ id : 1, f1 : '22', f2 : '111', f4 : 'foo' }] });
        t.isDeeply(pack.something1, { updated : [{ id : 1, ff1 : '22' }] });
    });

    t.it('Should write all fields', t => {
        const resourceStore = t.getResourceStore({
                modelClass : MyResource,
                data       : [
                    { id : 1, name : 'Albert', surname : 'Einstein' }
                ]
            }),
            someStore     = new Store({
                modelClass     : TestModel,
                writeAllFields : true,
                data           : [
                    { id : 1, f1 : '11', f2 : '111', f4 : 'foo', f5 : 'garbage' }
                ]
            }),
            someStore1    = new Store({
                fields : ['id', 'ff1', 'ff2'],
                data   : [
                    { id : 1, ff1 : '11', ff2 : '111' }
                ]
            });

        const crud = new AbstractCrudManager({
            stores : [
                { store : resourceStore, storeId : 'resources', writeAllFields : true },
                { store : someStore, storeId : 'something' },
                { store : someStore1, storeId : 'something1' }
            ],
            revision : 1
        });

        someStore.first.f1 = '22';
        someStore1.first.ff1 = '22';
        resourceStore.first.name = 'John';

        const pack = crud.getChangeSetPackage();

        t.isDeeply(pack.resources, { updated : [{ id : 1, name : 'John', surname : 'Einstein' }] });
        t.isDeeply(pack.something, { updated : [{ id : 1, f1 : '22', f2 : '111', f4 : 'foo' }] });
        t.isDeeply(pack.something1, { updated : [{ id : 1, ff1 : '22' }] });
    });

    t.it('Modified non-persistable field should not get record added to changeset package', t => {
        class TestModel extends Model {
            static get fields() {
                return ['f1', { name : 'f2', persist : false }];
            }
        }

        const
            store1 = new Store({
                modelClass     : TestModel,
                writeAllFields : true,
                data           : [
                    { id : 1, f1 : 1, f2 : 1 },
                    { id : 2 }
                ]
            }),
            store2 = new Store({
                modelClass : TestModel,
                data       : [
                    { id : 1, f1 : 1, f2 : 1 },
                    { id : 2 }
                ]
            }),
            crud = new AbstractCrudManager({
                stores : [
                    { store : store1, storeId : 'store1' },
                    { store : store2, storeId : 'store2', writeAllFields : true }
                ],
                revision : 1
            });

        // remove last record to make sure change set is never empty
        store1.last.remove();
        store2.last.remove();

        // change non-persistable field
        store1.first.f2 = store2.first.f2 = 10;

        let pack = crud.getChangeSetPackage();

        t.is(pack.store1.updated, null, 'store 1 ignored non-persistable change');
        t.is(pack.store2.updated, null, 'store 2 ignored non-persistable change');

        store1.first.f1 = store2.first.f1 = 20;

        pack = crud.getChangeSetPackage();

        t.isDeeply(pack.store1.updated, [{ id : 1, f1 : 20 }], 'Non-persistable field is ignored in changeset package');
        t.isDeeply(pack.store2.updated, [{ id : 1, f1 : 20 }], 'Non-persistable field is ignored in changeset package');
    });
});
