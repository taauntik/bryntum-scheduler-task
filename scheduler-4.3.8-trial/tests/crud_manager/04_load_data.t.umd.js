"use strict";

StartTest(t => {
  // Here we test loadData method of AbstractManager class
  t.it('Loads stores by batch in a proper order', t => {
    class TestModel extends Model {
      //f3Store : null,
      static get fields() {
        // Tricking f3 to take another code path to be able to override it for the test
        return ['id', 'f1', 'f2', {
          name: 'f3',
          complexMapping: true
        }];
      }

      constructor() {
        super(...arguments);

        if (this.data.f3) {
          this.f3Store = this.data.f3;
        }
      }

      complexGet(field, dataSource) {
        if (field === 'f3') {
          if (!this.f3Store) {
            this.f3Store = new Store({
              fields: ['id', 'a', 'b']
            });
          }

          return this.f3Store;
        }

        return super.flatGet(field, dataSource);
      }

      set(field, value) {
        if (field === 'f3') {
          this.f3Store = value;
          return;
        }

        return super.set(field, value);
      }

    }

    let loaded = 0;
    const someStore1 = new Store({
      fields: ['id', 'ff1', 'ff2']
    }),
          someStore2 = new Store({
      modelClass: TestModel
    });
    const crud = new AbstractCrudManager({
      stores: [{
        store: someStore1,
        storeId: 'someStore1'
      }, {
        store: someStore2,
        storeId: 'someStore2',
        stores: 'f3'
      }]
    });
    someStore1.on('dataset', {
      fn: () => {
        t.is(loaded++, 0, 'someStore1 loaded first');
      },
      once: true
    });
    someStore2.on('dataset', {
      fn: () => {
        t.is(loaded, 1, 'someStore2 loaded second');
      },
      once: true
    });
    crud.loadData({
      someStore1: {
        rows: [{
          id: 11,
          ff1: '11',
          ff2: '111'
        }, {
          id: 12,
          ff1: '22',
          ff2: '222'
        }]
      },
      someStore2: {
        rows: [{
          id: 1,
          f1: '11',
          f2: '111'
        }, {
          id: 2,
          f1: '22',
          f2: '222',
          f3: {
            rows: [{
              id: 21,
              a: 'a',
              b: 'b'
            }, {
              id: 22,
              a: 'aa',
              b: 'bb'
            }]
          }
        }, {
          id: 3,
          f1: '33',
          f2: '333'
        }, {
          id: 4,
          f1: '44',
          f2: '444'
        }]
      }
    });
    t.is(someStore1.count, 2, 'someStore1 loaded');
    t.is(someStore2.count, 4, 'someStore2 loaded');
    t.is(someStore2.getById(2).f3.count, 2, 'someStore2 sub-store loaded');
    t.isDeeply(someStore2.getById(2).f3.getById(21).data, {
      id: 21,
      a: 'a',
      b: 'b',
      parentIndex: 0
    }, 'someStore2 sub-store has correct record #21');
    t.isDeeply(someStore2.getById(2).get('f3').getById(22).data, {
      id: 22,
      a: 'aa',
      b: 'bb',
      parentIndex: 1
    }, 'someStore2 sub-store has correct record #22');
  });
  t.it('Supports empty dataset loading', t => {
    const store1 = new Store({
      storeId: 'store1',
      tree: true,
      data: [{
        id: 1,
        leaf: true
      }, {
        id: 2,
        leaf: true
      }, {
        id: 3,
        leaf: true
      }]
    });
    const store2 = new Store({
      storeId: 'store2',
      data: [{
        id: 1
      }, {
        id: 2
      }]
    });
    const crud = new AbstractCrudManager({
      stores: [{
        store: store1
      }, {
        store: store2
      }]
    });
    crud.loadData({
      store1: {
        rows: []
      },
      store2: {
        rows: []
      }
    });
    t.is(store1.count, 0, 'store1 loaded');
    t.is(store2.count, 0, 'store2 loaded');
  });
  /* eslint-disable */
  // TODO: PORT clearOnLoad?

  t.xit('Supports records append for a tree store when its clearOnLoad is false', t => {
    const store1 = new Ext.data.TreeStore({
      fields: ['id'],
      clearOnLoad: false,
      storeId: 'store1',
      proxy: 'memory',
      root: {
        expanded: true,
        children: [{
          id: 1,
          leaf: true
        }, {
          id: 2,
          leaf: true
        }, {
          id: 3,
          leaf: true
        }]
      }
    });
    const crud = new TestCrudManager1({
      stores: 'store1'
    });
    crud.loadData({
      store1: {
        rows: [{
          id: 4
        }]
      }
    });
    t.isDeeplyUnordered(store1.getRange(), [store1.getNodeById(1), store1.getNodeById(2), store1.getNodeById(3), store1.getNodeById(4)], 'store1 has proper set of records');
  }); // TODO: PORT tree stuff

  t.xit('Supports records append when append is provided from the server side', t => {
    const store1 = new Store({
      tree: true,
      fields: ['id'],
      clearOnLoad: false,
      storeId: 'store1',
      data: [{
        id: 1,
        leaf: true
      }, {
        id: 2,
        leaf: true
      }, {
        id: 3,
        leaf: true
      }]
    });
    const store2 = new Store({
      fields: ['id'],
      storeId: 'store2',
      data: [{
        id: 1
      }, {
        id: 2
      }]
    });
    const crud = new AbstractCrudManager({
      stores: ['store1', 'store2']
    });
    crud.loadData({
      store1: {
        rows: [{
          id: 4
        }]
      },
      store2: {
        append: true,
        rows: [{
          id: 3
        }]
      }
    });
    t.isDeeplyUnordered(store1.allRecords, [store1.getById(1), store1.getById(2), store1.getById(3), store1.getById(4)], 'store1 has proper set of records');
    t.isDeeplyUnordered(store2.allRecords, [store2.getById(1), store2.getById(2), store2.getById(3)], 'store2 has proper set of records');
  });
  /* eslint-enable */
});