"use strict";

StartTest(t => {
  // Here we test addStore method of Sch.crud.AbstractManager class
  //t.expectGlobal('TestCrudManager1');
  let resourceStore = t.getResourceStore(),
      eventStore = t.getEventStore();

  class TestCrudManager1 extends AbstractCrudManager {}

  let setup = (config = {}) => {
    let crud = new TestCrudManager1(Object.assign({
      stores: config.stores || [resourceStore, eventStore]
    }), config.crud);
    return {
      crud: crud
    };
  };

  t.it('Constructor accepts stores list', t => {
    t.it('instances list', t => {
      let crud = setup().crud;
      t.is(crud.stores.length, 2, 'Stores array has correct number of elements');
      t.is(crud.stores[0].storeId, 'resources', '0th has correct storeId');
      t.ok(crud.stores[0].store === resourceStore, '0th has correct store');
      t.is(crud.stores[1].storeId, 'events', '1st has correct storeId');
      t.ok(crud.stores[1].store === eventStore, '1st has correct store');
      crud.destroy();
    });
    t.it('descriptors list', t => {
      let crud = setup({
        stores: [{
          store: resourceStore,
          storeId: 'resources'
        }, {
          store: eventStore,
          storeId: 'events'
        }]
      }).crud;
      t.is(crud.stores.length, 2, 'Stores array has correct number of elements');
      t.is(crud.stores[0].storeId, 'resources', '0th has correct storeId');
      t.ok(crud.stores[0].store === resourceStore, '0th has correct store');
      t.is(crud.stores[1].storeId, 'events', '1st has correct storeId');
      t.ok(crud.stores[1].store === eventStore, '1st has correct store');
      crud.destroy();
    });
    t.it('storeId list', t => {
      let resourceStore = t.getResourceStore({
        storeId: 'foo'
      }),
          eventStore = t.getEventStore({
        storeId: 'bar'
      }),
          crud = setup({
        stores: ['foo', 'bar']
      }).crud;
      t.is(crud.stores.length, 2, 'Stores array has correct number of elements');
      t.is(crud.stores[0].storeId, resourceStore.storeId, '0th has correct storeId');
      t.ok(crud.stores[0].store === resourceStore, '0th has correct store');
      t.is(crud.stores[1].storeId, eventStore.storeId, '1st has correct storeId');
      t.ok(crud.stores[1].store === eventStore, '1st has correct store');
      crud.destroy();
      resourceStore.destroy();
      eventStore.destroy();
    });
  });
  t.it('addStores appends singular store', t => {
    function assert(t, action) {
      let crud = setup().crud,
          newStore = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth1'
      });
      action(crud, newStore);
      t.is(crud.stores.length, 3, 'Stores array has correct number of elements');
      t.is(crud.stores[2].storeId, 'smth1', '2nd has correct storeId');
      t.ok(crud.stores[2].store === newStore, '2nd has correct store');
      newStore.destroy();
      crud.destroy();
    }

    t.it('instance provided', t => {
      assert(t, (crud, newStore) => {
        crud.addStore(newStore);
      });
    });
    t.it('storeId provided', t => {
      assert(t, crud => {
        crud.addStore('smth1');
      });
    });
  });
  t.it('addStores appends multiple stores', t => {
    function assert(t, action) {
      const crud = setup().crud;
      const newStore1 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth2'
      });
      const newStore2 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth3'
      });
      action(crud, newStore1, newStore2);
      t.is(crud.stores.length, 4, 'Stores array has correct number of elements');
      t.is(crud.stores[2].storeId, 'smth2', '2nd has correct storeId');
      t.ok(crud.stores[2].store === newStore1, '2nd has correct store');
      t.is(crud.stores[3].storeId, 'smth3', '2nd has correct storeId');
      t.ok(crud.stores[3].store === newStore2, '2nd has correct store');
      newStore1.destroy();
      newStore2.destroy();
      crud.destroy();
    }

    t.it('instances provided', t => {
      assert(t, (crud, newStore1, newStore2) => crud.addStore([newStore1, newStore2]));
    });
    t.it('instances provided', t => {
      assert(t, crud => crud.addStore(['smth2', 'smth3']));
    });
  });
  t.it('addStores inserts singular store', t => {
    function assert(t, action) {
      const crud = new TestCrudManager1({
        stores: [resourceStore, eventStore]
      });
      const newStore = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth4'
      });
      action(crud, newStore);
      t.is(crud.stores.length, 3, 'Stores array has correct number of elements');
      t.is(crud.stores[0].storeId, 'smth4', '0th has correct storeId');
      t.ok(crud.stores[0].store === newStore, '0th has correct store');
      newStore.destroy();
      crud.destroy();
    }

    t.it('instance provided', t => {
      assert(t, (crud, newStore) => {
        crud.addStore(newStore, 0);
      });
    });
    t.it('storeId provided', t => {
      assert(t, crud => {
        crud.addStore('smth4', 0);
      });
    });
  });
  t.it('addStores inserts multiple stores', t => {
    function assert(t, action) {
      const crud = setup().crud;
      const newStore1 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth5'
      });
      const newStore2 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth6'
      });
      action(crud, newStore1, newStore2);
      t.is(crud.stores.length, 4, 'Stores array has correct number of elements');
      t.is(crud.stores[0].storeId, 'smth5', '0th has correct storeId');
      t.ok(crud.stores[0].store === newStore1, '0th has correct store');
      t.is(crud.stores[1].storeId, 'smth6', '1st has correct storeId');
      t.ok(crud.stores[1].store === newStore2, '1st has correct store');
      newStore1.destroy();
      newStore2.destroy();
      crud.destroy();
    }

    t.it('instances provided', t => {
      assert(t, (crud, newStore1, newStore2) => {
        crud.addStore([newStore1, newStore2], 0);
      });
    });
    t.it('storeId-s provided', t => {
      assert(t, crud => {
        crud.addStore(['smth5', 'smth6'], 0);
      });
    });
  });
  t.it('addStores inserts singular store -2 elements before specified store', t => {
    function assert(t, action) {
      const newStore1 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth1'
      });
      const newStore2 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth2'
      });
      const newStore3 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth3'
      });
      const newStore4 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth4'
      });
      const newStore5 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth5'
      });
      const newStore6 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth6'
      });
      const crud = setup({
        stores: [resourceStore, eventStore, newStore1, newStore2, newStore3, newStore4, newStore5, newStore6]
      }).crud;
      const newStore7 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth7'
      });
      action(crud, newStore7);
      t.is(crud.stores.length, 9, 'Stores array has correct number of elements');
      t.is(crud.stores[2].storeId, 'smth7', '2nd has correct storeId');
      t.ok(crud.stores[2].store === newStore7, '2nd has correct store');
      [newStore1, newStore2, newStore3, newStore4, newStore5, newStore6, newStore7, crud].forEach(s => s.destroy());
    }

    t.it('instance provided', t => {
      assert(t, (crud, newStore7) => {
        crud.addStore(newStore7, -2, crud.getStore('smth3'));
      });
    });
    t.it('storeId provided', t => {
      assert(t, crud => {
        crud.addStore('smth7', -2, 'smth3');
      });
    });
  });
  t.it('addStores inserts multiple stores -2 elements before specified store', t => {
    function assert(t, action) {
      const newStore1 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth1'
      });
      const newStore2 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth2'
      });
      const newStore3 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth3'
      });
      const newStore4 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth4'
      });
      const newStore5 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth5'
      });
      const newStore6 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth6'
      });
      const newStore7 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth7'
      });
      const crud = setup({
        stores: [resourceStore, eventStore, newStore1, newStore2, newStore3, newStore4, newStore5, newStore6, newStore7]
      }).crud;
      const newStore8 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth8'
      });
      const newStore9 = new Store({
        fields: ['f1', 'f2'],
        storeId: 'smth9'
      });
      action(crud, newStore8, newStore9);
      t.is(crud.stores.length, 11, 'Stores array has correct number of elements');
      t.is(crud.stores[2].storeId, 'smth8', '6th has correct storeId');
      t.ok(crud.stores[2].store === newStore8, '6th has correct store');
      t.is(crud.stores[3].storeId, 'smth9', '7th has correct storeId');
      t.ok(crud.stores[3].store === newStore9, '7th has correct store');
      t.it('removeStore correctly removes stores', t => {
        crud.removeStore('smth8');
        crud.removeStore(newStore9);
        crud.removeStore(crud.getStoreDescriptor('smth3'));
        t.is(crud.stores.length, 8, 'Stores array has correct number of elements');
        t.notOk(crud.getStore('smth3'), 'No smth3 store registered');
        t.notOk(crud.getStore('smth8'), 'No smth8 store registered');
        t.notOk(crud.getStore('smth9'), 'No smth9 store registered');
        [newStore1, newStore2, newStore3, newStore4, newStore5, newStore6, newStore7, newStore8, newStore9, crud].forEach(s => s.destroy());
      });
    }

    t.it('instances provided', t => {
      assert(t, (crud, newStore1, newStore2) => {
        crud.addStore([newStore1, newStore2], -2, 'smth3');
      });
    });
    t.it('addStores inserts multiple stores -2 elements before specified store', t => {
      assert(t, crud => {
        crud.addStore(['smth8', 'smth9'], -2, 'smth3');
      });
    });
  });
  t.it('Constructor accepts sub-stores list', t => {
    const newStore = new Store({
      fields: ['f1', 'f2'],
      storeId: 'smth'
    });
    const subStore = new Store({
      fields: ['ff1', 'ff2']
    });
    const crud = setup({
      stores: [resourceStore, eventStore, {
        store: newStore,
        stores: [{
          storeId: 'f1',
          store: subStore
        }]
      }]
    }).crud;
    t.is(crud.stores.length, 3, 'Stores array has correct number of elements');
    t.is(crud.stores[0].storeId, 'resources', '0th has correct storeId');
    t.ok(crud.stores[0].store === resourceStore, '0th has correct store');
    t.is(crud.stores[1].storeId, 'events', '1st has correct storeId');
    t.ok(crud.stores[1].store === eventStore, '1st has correct store');
    t.is(crud.stores[2].storeId, 'smth', '2nd has correct storeId');
    t.ok(crud.stores[2].store === newStore, '2nd has correct store');
    t.isDeeply(crud.getStoreDescriptor(newStore).stores, [{
      storeId: 'f1',
      store: subStore,
      masterStoreInfo: crud.getStoreDescriptor(newStore)
    }], '2nd has substores list');
  });
  t.it('syncApplySequence config adds stores to alternative sync sequence', t => {
    const crud = new TestCrudManager1({
      stores: [{
        store: resourceStore,
        storeId: 'resources'
      }, {
        store: eventStore,
        storeId: 'events'
      }],
      syncApplySequence: ['events', 'resources']
    });
    t.is(crud.syncApplySequence.length, 2, 'Stores array has correct number of elements');
    t.is(crud.syncApplySequence[0].storeId, 'events', '0th has correct storeId');
    t.is(crud.syncApplySequence[1].storeId, 'resources', '1st has correct storeId');
  });
  t.it('addStoreToApplySequence inserts singular store', t => {
    const crud = new TestCrudManager1({
      stores: [{
        store: resourceStore,
        storeId: 'resources'
      }, {
        store: eventStore,
        storeId: 'events'
      }]
    });
    const newStore = new Store({
      fields: ['f1', 'f2'],
      storeId: 'smth4'
    });
    crud.addStoreToApplySequence(crud.stores);
    crud.addStore(newStore, 0);
    crud.addStoreToApplySequence(newStore, 1);
    t.is(crud.syncApplySequence.length, 3, 'Stores array has correct number of elements');
    t.is(crud.syncApplySequence[0].storeId, 'resources', '0th has correct storeId');
    t.is(crud.syncApplySequence[1].storeId, 'smth4', '1st has correct storeId');
    t.is(crud.syncApplySequence[2].storeId, 'events', '2nd has correct storeId');
    t.it('removeStore removes store from both arrays', t => {
      crud.removeStore('smth4');
      t.is(crud.stores.length, 2, 'Stores array has correct number of elements');
      t.is(crud.stores[0].storeId, 'resources', '0th has correct storeId');
      t.is(crud.stores[1].storeId, 'events', '1st has correct storeId');
      t.is(crud.syncApplySequence.length, 2, 'Stores array has correct number of elements');
      t.is(crud.syncApplySequence[0].storeId, 'resources', '0th has correct storeId');
      t.is(crud.syncApplySequence[1].storeId, 'events', '1st has correct storeId');
    });
  });
  t.it('addStoreToApplySequence inserts singular store (position relative to existing store)', t => {
    const crud = new TestCrudManager1({
      stores: [{
        store: resourceStore,
        storeId: 'resources'
      }, {
        store: eventStore,
        storeId: 'events'
      }]
    });
    const newStore = new Store({
      fields: ['f1', 'f2'],
      storeId: 'smth4'
    });
    crud.addStoreToApplySequence(crud.stores);
    crud.addStore(newStore, 0);
    crud.addStoreToApplySequence(newStore, 1, 'resources');
    t.is(crud.syncApplySequence.length, 3, 'Stores array has correct number of elements');
    t.is(crud.syncApplySequence[0].storeId, 'resources', '0th has correct storeId');
    t.is(crud.syncApplySequence[1].storeId, 'smth4', '1st has correct storeId');
    t.is(crud.syncApplySequence[2].storeId, 'events', '2nd has correct storeId');
    t.it('removeStoreFromApplySequence removes store', t => {
      crud.removeStoreFromApplySequence('smth4');
      t.is(crud.syncApplySequence.length, 2, 'Stores array has correct number of elements');
      t.is(crud.syncApplySequence[0].storeId, 'resources', '0th has correct storeId');
      t.is(crud.syncApplySequence[1].storeId, 'events', '1st has correct storeId');
    });
  });
});