import { Model, Store, AbstractCrudManager } from '../../build/scheduler.module.js?456730';

StartTest(function(t) {
    // Here we test getChangeSetPackage method of AbstractManager class

    class TestModel extends Model {
        static get fields() {
            return [
                'id', 'f1', { name : 'f2', type : 'date', format : 'YYYYMMDD' }, 'f3', { name : 'f4', critical : true }
            ];
        }

        constructor(config) {
            super(...arguments);
            if (config.f3) {
                this.f3Store = config.f3;
                config.f3    = null;
            }
        }

        get(field) {
            if (field === 'f3') return this.f3Store;
            return super.get(field);
        }
    }

    const
        resourceStore = t.getResourceStore(),
        someStore     = new Store({
            modelClass : TestModel,
            data       : [
                { id : 1, f1 : '11', f2 : new Date(2020, 7, 11), f4 : 'foo' },
                { id : 2, f1 : '22', f2 : new Date(2020, 7, 12) },
                { id : 3, f1 : '33', f2 : new Date(2020, 7, 13) },
                { id : 4, f1 : '44', f2 : new Date(2020, 7, 14) }
            ]
        }),
        someSubStore  = new Store({
            fields : ['id', 'ff1', 'ff2'],
            data   : [
                { id : 1, ff1 : '11', ff2 : '111' },
                { id : 2, ff1 : '22', ff2 : '222' },
                { id : 3, ff1 : '33', ff2 : '333' },
                { id : 4, ff1 : '44', ff2 : '444' }
            ]
        });

    const crud = new AbstractCrudManager({
        stores : [
            { store : resourceStore, storeId : 'resources' },
            { store : someStore, storeId : 'something', stores : [{ storeId : 'f3' }] }
        ],
        revision : 1
    });

    t.it('Change set package for not modified data is null', t => {
        const pack = crud.getChangeSetPackage();

        t.notOk(pack, 'No changes yet');
    });

    t.it('Supports setting of a record back to its original values', t => {
        t.willFireNTimes(crud, 'haschanges', 1);
        t.willFireNTimes(crud, 'nochanges', 1);

        const
            r1      = resourceStore.first,
            oldName = r1.name;

        r1.name = 'Some Name';

        t.ok(crud.hasChanges(), 'hasChanges() is true');

        r1.name = oldName;

        t.notOk(crud.hasChanges(), 'hasChanges() is false');
    });

    t.it('Change set package for modified data', t => {
        // TODO: should be 13 if we take sub-stores into account, need to implement this in the future
        t.willFireNTimes(crud, 'haschanges', 10);

        resourceStore.getById('r1').name = 'Some Name';
        resourceStore.getById('r3').name = 'Some Other Name';

        resourceStore.remove(resourceStore.getById('r2'));
        resourceStore.remove(resourceStore.getById('r4'));

        const newResource = resourceStore.add({ name : 'New Resource' })[0];

        someStore.getById(1).f1 = '-11';
        someStore.getById(2).f2 = '-222';

        someStore.remove(someStore.getById(3));
        someStore.remove(someStore.getById(4));

        // add record having embedded store
        const newRec = someStore.add({ f1 : '55', f2 : new Date(2020, 7, 15), f3 : someSubStore })[0];

        // add record to the embedded store
        const newSubRec             = someSubStore.add({ ff1 : 'xx', ff2 : 'xxx' })[0];
        // edit record in the embedded store
        someSubStore.getById(1).ff1 = '!11';
        // remove record from the embedded store
        someSubStore.remove(someSubStore.getById(4));

        const pack = crud.getChangeSetPackage();

        t.is(pack.type, 'sync', 'Correct package type');
        t.ok(pack.requestId, 'Has some request Id');
        t.ok(pack.revision, 'Has some revision');

        t.isDeeply(pack.resources.added, [{
            name       : 'New Resource',
            $PhantomId : newResource.id
        }], 'Correct list of added records');

        t.isDeeply(pack.resources.updated, [{ id : 'r1', name : 'Some Name' }, {
            id   : 'r3',
            name : 'Some Other Name'
        }], 'Correct list of updated records');

        t.isDeeply(pack.resources.removed, [{ id : 'r2' }, { id : 'r4' }], 'Correct list of removed records');

        t.isDeeply(pack.something.added, [{
            f1         : '55',
            f2         : '20200815',
            // TODO: uncomment when "critical" fields are supported
            // f4           : undefined,
            $PhantomId : newRec.id,
            // embedded store changes
            f3         : {
                $store  : true,
                added   : [{ ff1 : 'xx', ff2 : 'xxx', $PhantomId : newSubRec.id }],
                updated : [{ id : 1, ff1 : '!11' }],
                removed : [{ id : 4 }]
            }
        }], 'Correct list of added records (including embedded store changes)');

        // t.isDeeply(pack.something.updated, [{ id : 1, f1 : '-11', f4 : 'foo' }, {
        //     id : 2,
        //     f2 : '-222',
        //     f4 : undefined
        // }], 'Correct list of updated records');
        // t.isDeeply(pack.something.removed, [{ id : 3 }, { id : 4 }], 'Correct list of removed records');
    });
});
