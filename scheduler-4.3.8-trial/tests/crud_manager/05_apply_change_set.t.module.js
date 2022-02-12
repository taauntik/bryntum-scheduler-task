import { Store, AbstractCrudManager } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    // Here we test applySyncResponse method of AbstractCrudManager class

    let someStore1, someStore2, crud, added1, response;

    const initTestData = () => {
        someStore1 = new Store({
            storeId : 'someStore1',
            fields  : ['id', 'ff1', 'ff2'],
            data    : [
                { id : 11, ff1 : '11', ff2 : '111' },
                { id : 12, ff1 : '22', ff2 : '222' },
                { id : 13, ff1 : '33', ff2 : '333' },
                { id : 15, ff1 : '55', ff2 : '555' }
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

        crud = new AbstractCrudManager({
            stores : [someStore1, someStore2]
        });

        // init stores changes
        // someStore1
        someStore1.remove(someStore1.getById(11));

        // modify record which has updated fields in the sync response
        someStore1.getById(12).ff1 = '-22';

        // modify record which doesn't have updated fields in the sync response
        someStore1.getById(15).ff1 = '555';

        added1 = someStore1.add({ ff1 : 'new', ff2 : 'new' });
        // TODO: PORT tree stuff
        // someStore2
        // someStore2.getById(4).remove();
        // someStore2.getById(3).f1 = '-33';
        // added2 = someStore2.getById(3).appendChild({ f1 : '55', f2 : '555' });

        // server response
        response = {
            someStore1 : {
                rows : [
                    { $PhantomId : added1[0].id, id : 14 },
                    { id : 12, ff2 : '-222' },
                    { id : 15 }
                ],
                removed : [{ id : 11 }]
            }//,
            // someStore2 : {
            //     rows    : [
            //         { $PhantomId : added2.getId(), id : 5 },
            //         { id : 3, f2 : '-333' }
            //     ],
            //     removed : [{ id : 4 }]
            // }
        };
    };

    t.it('Should apply removed records correctly', t => {
        initTestData();

        // 4 datachanged events: 2 because of "rows" provided + 2 for removals
        // TODO: PORT not sure what we want now
        //t.willFireNTimes(someStore1, 'change', 4, 'change fired proper number of times');

        response.someStore1.removed = [];

        const rows = someStore1.allRecords.slice();

        crud.applySyncResponse(response);

        t.isDeeply(someStore1.allRecords, rows, 'Records not deleted');

        // ##12,13,14 imitate server driven removal
        response.someStore1.removed = [{ id : 11 }, { id : 12 }, { id : 13 }, { id : 14 }, { id : 15 }];
        response.someStore1.rows    = [];

        crud.applySyncResponse(response);

        t.isDeeply(someStore1.removed.values, [], 'Store.removed is empty');
        t.is(someStore1.count, 0, 'Store is empty');
    });

    t.it('Applies changes to data', t => {
        initTestData();

        crud.applySyncResponse(response);

        t.it('someStore1 has correct state after changes applied', t => {
            t.notOk(someStore1.modified.count, 'has no dirty updated records');
            t.notOk(someStore1.removed.count, 'has no dirty removed records');

            t.is(someStore1.getById(14).ff1, 'new', 'added record has correct ff1 field value');
            t.is(someStore1.getById(14).ff2, 'new', 'added record has correct ff2 field value');

            t.is(someStore1.getById(12).ff2, '-222', 'updated record has correct ff2 field value');
        });

        // TODO: PORT tree later
        t.xit('someStore2 has correct state after changes applied', t => {
            t.notOk(someStore2.modified.count, 'has no dirty updated records');
            t.notOk(someStore2.removed.count, 'has no dirty removed records');

            t.is(someStore2.getById(5).f1, '55', 'added record has correct f1 field value');
            t.is(someStore2.getById(5).f2, '555', 'added record has correct f2 field value');

            t.is(someStore2.getById(3).f2, '-333', 'updated record has correct f2 field value');
        });
    });

    t.it('Applies changes to data and keeps other dirty records untouched', t => {
        initTestData();

        // add some more changed data
        someStore1.add({ ff1 : 'another new', ff2 : 'another new' });
        someStore1.remove(someStore1.getById(13));
        // to someStore2 as well
        // someStore2.getRootNode().removeChild(someStore2.getNodeById(1));
        // someStore2.getNodeById(2).set('f1', '-22');
        // someStore2.getNodeById(3).appendChild({ f1 : 'new node', f2 : 'new node' });

        // but apply only response for the data modified in initTestData call
        crud.applySyncResponse(response);

        t.it('someStore1 has correct state after changes applied', t => {
            t.is(someStore1.added.count, 1, 'has one added record');
            t.is(someStore1.removed.count, 1, 'has one removed record');

            t.ok(someStore1.added.values[0].hasGeneratedId, 'has one phantom record');
            t.is(someStore1.added.values[0].ff1, 'another new', 'new record has correct ff1 value');
            t.is(someStore1.removed.values[0].id, 13, 'has correct removed record');
        });

        // TODO: PORT tree later
        t.xit('someStore2 has correct state after changes applied', t => {
            t.is(someStore2.getNewRecords().length, 1, 'has 1 added record');
            t.is(someStore2.getUpdatedRecords().length, 1, 'has 1 updated record');
            t.is(someStore2.getRemovedRecords().length, 1, 'has 1 removed record');

            t.is(someStore2.getNewRecords()[0].get('f1'), 'new node', 'new record has correct f1 value');
            t.is(someStore2.getNewRecords()[0].get('f2'), 'new node', 'new record has correct f2 value');
            t.is(someStore2.getUpdatedRecords()[0].get('f1'), '-22', 'updated record has correct f1 value');
            t.is(someStore2.getRemovedRecords()[0].data.id, 1, 'has correct removed record');
        });
    });

    t.it('Responded phantom records do not get removed by the client', async t => {
        initTestData();

        response = {
            someStore1 : {
                rows : [
                    { $PhantomId : added1[0].id, id : 14 },
                    { id : 12, ff2 : '-222' },
                    { id : 15 },
                    { ff1 : '!!!', ff2 : '!!!!' }
                ],
                removed : [{ id : 11 }]
            }
        };

        const oldAllRecords = someStore1.allRecords.slice().sort((a, b) => a.internalId - b.internalId);

        await crud.applyResponse({
            type : 'sync'
        }, response);

        const newAllRecords = someStore1.allRecords.slice().sort((a, b) => a.internalId - b.internalId);

        t.isDeeply(newAllRecords, oldAllRecords.concat(t.any(someStore1.modelClass)), 'one new record appeared');

        const newRecord = newAllRecords[newAllRecords.length - 1];

        t.ok(newRecord.isPhantom, 'new record is phantom');
        t.is(newRecord.ff1, '!!!', 'new record ff1 value is correct');
        t.is(newRecord.ff2, '!!!!', 'new record ff2 value is correct');
    });
});
