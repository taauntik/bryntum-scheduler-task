import { Store, AbstractCrudManager } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    // Test check that we call setCrudManager (if provided) on a store when registering it in a CrudManager
    // and that we set "crudManager" on the store otherwise

    //t.expectGlobal('TestCrudManager1', 'Store2');

    class Store2 extends Store {
        setCrudManager(cm) {
            this.foo = cm;
        }
    }

    class TestCrudManager1 extends AbstractCrudManager {
        constructor() {
            super({
                stores : [
                    { storeId : 'store1', store : new Store() },
                    { storeId : 'store2', store : new Store2() }
                ]
            });
        }
    }

    t.it('CrudManager call a registered store setCrudManager hook (or decorates it w/ crudManager property)', t => {
        const crud = new TestCrudManager1();

        t.is(crud.getStore('store1').crudManager, crud, 'store1 is decorated');
        t.is(crud.getStore('store2').foo, crud, 'setCrudManager is called on store2');
    });
});
