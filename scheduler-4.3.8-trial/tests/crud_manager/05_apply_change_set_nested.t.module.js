import { Store, AbstractCrudManager, Model } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    // Here we test applySyncResponse method of Sch.crud.AbstractManager class
    // in case when we have embedded stores

    class TestModel extends Model {
        //f3Store : null,

        static get fields() {
            return ['id', 'f1', 'f2', 'f3'];
        }

        constructor(config) {
            super(...arguments);

            if (this.data.f3) {
                this.f3Store = this.data.f3;
            }
        }

        get(field) {
            if (field == 'f3') return this.f3Store;

            return super.get(...arguments);
        }

        set(field, value) {
            if (field == 'f3') {
                this.f3Store = value;
                return;
            }

            return super.set(...arguments);
        }
    }

    let someStore1, subStore1, subStore2, someStore2, crud, added1, added2, subAdded1, subAdded2, response;

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

        // this is a sub-store that will be assigned to one of someStore2 records
        subStore1 = new Store({
            tree   : true,
            fields : ['id', 'a', 'b'],
            data   : [{
                expanded : true,
                children : [
                    { id : 1, a : 'z', b : 'zzz' },
                    { id : 2, a : 'x', b : 'xxx' }
                ]
            }]
        });

        // this is a sub-store that will be assigned to one of someStore2 records
        subStore2 = new Store({
            fields : ['id', 'c', 'd', 'e'],
            data   : [
                { id : 5, c : 'c', d : 'd', e : 'e' },
                { id : 6, c : 'cc', d : 'dd', e : 'ee' },
                { id : 7, c : 'ccc', d : 'ddd', e : 'eee' }
            ]
        });

        someStore2 = new Store({
            tree       : true,
            modelClass : TestModel,
            storeId    : 'someStore2',
            data       : [{
                expanded : true,
                children : [
                    { id : 1, f1 : '11', f2 : '111' },
                    { id : 2, f1 : '22', f2 : '222' },
                    { id : 3, f1 : '33', f2 : '333', f3 : subStore1 },
                    { id : 4, f1 : '44', f2 : '444' }
                ]
            }]
        });

        crud = new AbstractCrudManager({
            stores : [
                someStore1,
                {
                    store  : someStore2,
                    // describe that someStore2 might have a sub-store assigned to the 'f3' field of a record
                    stores : [{ storeId : 'f3' }]
                }
            ]
        });

        // init stores changes
        // someStore1
        someStore1.getById(11).remove();
        someStore1.getById(12).ff1 = '-22';
        added1 = someStore1.add({ ff1 : 'new', ff2 : 'new' });

        // someStore2
        someStore2.getById(4).remove();
        someStore2.getById(3).f1 = '-33';
        added2 = someStore2.getById(3).appendChild({ f1 : '55', f2 : '555', f3 : subStore2 });

        // edit sub-store of someStore2 record #3
        subAdded1 = subStore1.getById(2).appendChild({ a : 'a', b : 'aaa' });
        subStore1.getById(2).a = '!xx';
        subStore1.getById(1).remove();

        // edit sub-store of added2 record
        subStore2.test = 'a';
        subAdded2 = subStore2.add({ c : 'cccc', d : 'dddd', e : 'eeee' });
        subStore2.getById(6).c = '!cc';
        subStore2.getById(5).remove();

        // server response
        response = {
            someStore1 : {
                rows : [
                    { $PhantomId : added1[0].id, id : 14 },
                    { id : 12, ff2 : '-222' }
                ],
                removed : [{ id : 11 }]
            },
            someStore2 : {
                rows : [
                    {
                        $PhantomId : added2.id,
                        id         : 5,
                        // sub-store changes response
                        f3         : {
                            rows : [
                                { $PhantomId : subAdded2[0].id, id : 8 },
                                { id : 6, d : '!dd' }
                            ],
                            removed : [{ id : 5 }]
                        }
                    },
                    {
                        id : 3,
                        f2 : '-333',
                        // sub-store changes response
                        f3 : {
                            rows : [
                                { $PhantomId : subAdded1.id, id : 22 },
                                { id : 2, b : '!xxx' }
                            ],
                            removed : [{ id : 1 }]
                        }
                    }
                ],
                removed : [{ id : 4 }]
            }
        };
    };

    t.it('Applies changes to data', t => {
        initTestData();

        crud.applySyncResponse(response);

        t.it('someStore1 has correct state after changes applied', t => {
            t.notOk(someStore1.modified.count, 'has no dirty updated records');
            t.notOk(someStore1.removed.count, 'has no dirty removed records');

            t.is(someStore1.getById(14).get('ff1'), 'new', 'added record has correct ff1 field value');
            t.is(someStore1.getById(14).get('ff2'), 'new', 'added record has correct ff2 field value');

            t.is(someStore1.getById(12).get('ff2'), '-222', 'updated record has correct ff2 field value');
        });

        t.it('someStore2 has correct state after changes applied', t => {
            t.notOk(someStore2.modified.count, 'has no dirty updated records');
            t.notOk(someStore2.removed.count, 'has no dirty removed records');

            t.is(someStore2.getById(5).get('f1'), '55', 'added record has correct `f1` field value');
            t.is(someStore2.getById(5).get('f2'), '555', 'added record has correct `f2` field value');

            t.it('subStore2 has correct state after changes applied', t => {
                t.notOk(subStore2.modified.count, 'has no dirty updated records');
                t.notOk(subStore2.removed.count, 'has no dirty removed records');

                t.is(subStore2.getById(8).get('c'), 'cccc', 'added record has correct `c` value');
                t.is(subStore2.getById(8).get('d'), 'dddd', 'added record has correct `d` value');
                t.is(subStore2.getById(8).get('e'), 'eeee', 'added record has correct `e` value');

                t.is(subStore2.getById(6).get('c'), '!cc', 'updated record has correct `c` field value');
                t.is(subStore2.getById(6).get('d'), '!dd', 'updated record has correct `d` field value');
                t.notOk(subStore2.getById(5), 'removed record no longer exists');
            });

            t.is(someStore2.getById(3).get('f2'), '-333', 'updated record has correct f2 field value');

            t.it('subStore1 has correct state after changes applied', t => {
                t.notOk(subStore1.modified.count, 'has no dirty updated records');
                t.notOk(subStore1.removed.count, 'has no dirty removed records');

                t.is(subStore1.getById(22).get('a'), 'a', 'added record has correct `a` value');
                t.is(subStore1.getById(22).get('b'), 'aaa', 'added record has correct `aaa` value');

                t.is(subStore1.getById(2).get('a'), '!xx', 'updated record has correct `a` value');
                t.is(subStore1.getById(2).get('b'), '!xxx', 'updated record has correct `b` value');

                t.notOk(subStore1.getById(1), 'removed record no longer exists');
            });
        });
    });

    t.it('Applies changes to data and keeps other dirty records untouched', t => {
        initTestData();

        // add some more changed data
        someStore1.add({ ff1 : 'another new', ff2 : 'another new' });
        someStore1.remove(someStore1.getById(13));
        // to someStore2 as well
        someStore2.getById(1).remove();
        someStore2.getById(2).set('f1', '-22');
        someStore2.getById(3).appendChild({ f1 : 'new node', f2 : 'new node' });

        // but apply only response for the data modified in initTestData call
        crud.applySyncResponse(response);

        t.it('someStore1 has correct state after changes applied', t => {
            t.is(someStore1.added.count, 1, 'has one added record');
            t.is(someStore1.removed.count, 1, 'has one removed record');

            t.ok(someStore1.added.values[0].hasGeneratedId, 'has one phantom record');
            t.is(someStore1.added.values[0].get('ff1'), 'another new', 'new record has correct ff1 value');
            t.is(someStore1.removed.values[0].data.id, 13, 'has correct removed record');
        });

        t.it('someStore2 has correct state after changes applied', t => {
            t.is(someStore2.added.count, 1, 'has 1 added record');
            t.is(someStore2.modified.count, 1, 'has 1 updated record');
            t.is(someStore2.removed.count, 1, 'has 1 removed record');

            t.is(someStore2.added.values[0].get('f1'), 'new node', 'new record has correct f1 value');
            t.is(someStore2.added.values[0].get('f2'), 'new node', 'new record has correct f2 value');
            t.is(someStore2.modified.values[0].get('f1'), '-22', 'updated record has correct f1 value');
            t.is(someStore2.removed.values[0].data.id, 1, 'has correct removed record');
        });
    });
});
