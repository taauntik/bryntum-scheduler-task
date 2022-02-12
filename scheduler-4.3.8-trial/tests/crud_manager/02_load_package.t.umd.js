"use strict";

StartTest(t => {
  // Here we test getLoadPackage method of Sch.crud.AbstractManager class
  //t.expectGlobal('TestCrudManager1');
  const resourceStore = t.getResourceStore(),
        eventStore = t.getEventStore();
  const crud = new AbstractCrudManager({
    stores: [{
      store: resourceStore,
      storeId: 'resources'
    }, {
      store: eventStore,
      storeId: 'events'
    }]
  });
  t.it('Generates load package correctly', t => {
    const pack = crud.getLoadPackage();
    t.is(pack.type, 'load', 'Correct package type');
    t.ok(pack.requestId, 'Has some request Id');
    t.is(pack.stores.length, 2, 'Correct size of stores list');
    t.is(pack.stores[0], 'resources', '0th storeId is correct'); //t.is(pack.stores[0].storeId, 'resources', '0th storeId is correct');
    //t.is(pack.stores[0].page, 1, '0th page is correct');
    //t.is(pack.stores[0].pageSize, 25, '0th pageSize is correct');

    t.is(pack.stores[1], 'events', '0th storeId is correct'); //t.is(pack.stores[1].storeId, 'events', '0th storeId is correct');
    //t.is(pack.stores[1].page, 1, '0th page is correct');
    //t.is(pack.stores[1].pageSize, 25, '0th pageSize is correct');
  });
  t.it('Generates load package with custom request options', t => {
    const pack = crud.getLoadPackage({
      requestOptions: {
        reset: true
      },
      resources: {
        options: true
      }
    });
    t.is(pack.type, 'load', 'Correct package type');
    t.ok(pack.requestId, 'Has some request Id');
    t.is(pack.stores.length, 2, 'Correct size of stores list');
    t.isDeeply(pack.stores[0], {
      storeId: 'resources',
      page: 1,
      options: true
    }, 'Correct resource options');
    t.isDeeply(pack.requestOptions, {
      reset: true
    }, 'Correct common request options');
  });
});