"use strict";

StartTest(t => {
  // Checks that crud manager respects date field format (https://github.com/bryntum/support/issues/273)
  class TestModel extends Model {
    static get fields() {
      return ['id', {
        name: 'dt',
        type: 'date',
        format: 'YYYYMMDD'
      }];
    }

  }

  let someStore, crud;
  t.beforeEach(() => {
    someStore = new Store({
      modelClass: TestModel
    });
    crud = new AbstractCrudManager({
      stores: [{
        store: someStore,
        storeId: 'foo'
      }]
    });
  });
  t.it('CrudManager uses date field format when reading/saving the data', t => {
    crud.loadCrudManagerData({
      success: true,
      foo: {
        rows: [{
          id: 1,
          dt: '20200814'
        }]
      }
    });
    t.is(someStore.first.dt, new Date(2020, 7, 14), 'date value is loaded properly');
    someStore.first.dt = new Date(2020, 7, 10);
    t.isDeeply(crud.getChangeSetPackage(), {
      type: 'sync',
      requestId: t.any(Number),
      revision: t.any(),
      foo: {
        updated: [{
          id: 1,
          dt: '20200810'
        }]
      }
    }, 'date value is properly serialized for sync');
  });
});