"use strict";

StartTest(t => {
  // Here we test revertChanges() method of CrudManager class
  const initTestData = () => {
    const resourceStore = t.getResourceTreeStore(),
          eventStore = t.getEventStore();
    const someStore1 = new Store({
      storeId: 'someStore1',
      //fields  : ['id', 'ff1', 'ff2'],
      data: [{
        id: 11,
        ff1: '11',
        ff2: '111'
      }, {
        id: 12,
        ff1: '22',
        ff2: '222'
      }, {
        id: 13,
        ff1: '33',
        ff2: '333'
      }]
    });
    const someStore2 = new Store({
      storeId: 'someStore2',
      //fields  : ['id', 'f1', 'f2'],
      tree: true,
      data: [{
        expanded: true,
        children: [{
          id: 1,
          f1: '11',
          f2: '111'
        }, {
          id: 2,
          f1: '22',
          f2: '222'
        }, {
          id: 3,
          f1: '33',
          f2: '333'
        }, {
          id: 4,
          f1: '44',
          f2: '444'
        }]
      }]
    });
    const crud = new CrudManager({
      resourceStore: resourceStore,
      eventStore: eventStore,
      stores: [someStore1, someStore2],
      revision: 1
    }); // init stores changes

    const res = resourceStore.first.appendChild({});
    resourceStore.getById('r7').name = 'foo';
    resourceStore.getById('r8').remove();
    eventStore.add({
      resourceId: res.id,
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 5)
    });
    eventStore.getById(1).name = 'bar';
    eventStore.remove(eventStore.getById(5));
    someStore1.remove(someStore1.getById(11));
    someStore1.getById(12).set('ff1', '-22');
    someStore1.add({
      ff1: 'new',
      ff2: 'new'
    });
    someStore2.getById(4).remove();
    someStore2.getById(3).set('f1', '-33');
    someStore2.getById(3).appendChild({
      f1: '55',
      f2: '555'
    });
    return crud;
  };

  t.it('revertChanges() cleans up all dirty records', t => {
    const crud = initTestData(),
          someStore1 = crud.getStore('someStore1'),
          someStore2 = crud.getStore('someStore2'),
          resourceStore = crud.resourceStore,
          eventStore = crud.eventStore;
    crud.revertChanges();
    t.notOk(resourceStore.modified.count, 'resourceStore: has no dirty added/updated records');
    t.notOk(resourceStore.removed.count, 'resourceStore: has no dirty removed records');
    t.notOk(eventStore.modified.count, 'eventStore: has no dirty added/updated records');
    t.notOk(eventStore.removed.count, 'eventStore: has no dirty removed records');
    t.notOk(someStore1.modified.count, 'someStore1: has no dirty added/updated records');
    t.notOk(someStore1.removed.count, 'someStore1: has no dirty removed records');
    t.notOk(someStore2.modified.count, 'someStore2: has no dirty added/updated records');
    t.notOk(someStore2.removed.count, 'someStore2: has no dirty removed records');
    t.is(someStore2.allCount, 5, 'someStore2: proper number of records');
  });
});