"use strict";

StartTest(t => {
  // Checks that CRUD manager supports stores defined on prototype level
  t.it('Abstract CrudManager supports "stores" from prototype', t => {
    //t.expectGlobal('TestCrudManager1');
    class TestCrudManager1 extends AbstractCrudManager {
      static get defaultConfig() {
        return {
          stores: ['resources', 'events']
        };
      }

    }

    const resourceStore = t.getResourceStore(),
          eventStore = t.getEventStore(),
          crud = new TestCrudManager1();
    t.is(crud.stores.length, 2, 'proper number of stores');
    t.is(crud.getStore('resources'), resourceStore, 'resourceStore found');
    t.is(crud.getStore('events'), eventStore, 'eventStore found');
    t.is(crud.stores[0].store, resourceStore, 'resourceStore is 0th');
    t.is(crud.stores[1].store, eventStore, 'eventStore is 1st');
  });
  t.it('CrudManager supports "stores" from prototype', t => {
    //t.expectGlobal('TestCrudManager2');
    const project = new ProjectModel({
      resourceStore: t.getResourceStore(),
      eventStore: t.getEventStore(),
      dependencyStore: t.getDependencyStore()
    }),
          {
      resourceStore,
      eventStore,
      dependencyStore
    } = project,
          fooStore = new Store({
      storeId: 'foo'
    }),
          barStore = new Store({
      storeId: 'bar'
    });

    class TestCrudManager2 extends CrudManager {
      static get defaultConfig() {
        return {
          dependencyStore,
          resourceStore: 'resources',
          eventStore: 'events',
          stores: ['foo', 'bar']
        };
      }

    }

    const crud = new TestCrudManager2();
    t.is(crud.stores.length, 6, 'proper number of stores'); // 5 above + 1 assignment store

    t.is(crud.resourceStore, resourceStore, 'resourceStore found');
    t.is(crud.eventStore, eventStore, 'eventStore found');
    t.is(crud.dependencyStore, dependencyStore, 'dependencyStore found');
    t.is(crud.getStore('resources'), resourceStore, 'resourceStore found by its identifier');
    t.is(crud.getStore('events'), eventStore, 'eventStore found by its identifier');
    t.is(crud.getStore('foo'), fooStore, 'fooStore found by its identifier');
    t.is(crud.getStore('bar'), barStore, 'barStore found by its identifier');
    t.is(crud.stores[0].store, fooStore, 'fooStore is 0th');
    t.is(crud.stores[1].store, barStore, 'barStore is 1st');
    t.is(crud.stores[2].store, eventStore, 'eventStore is 2nd');
    t.is(crud.stores[3].store, resourceStore, 'resourceStore is 3rd');
  });
});