"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    Scheduler.destroy(scheduler);
  }); // https://github.com/bryntum/support/issues/2329

  t.it('CrudManager should reload data fast', async t => {
    const // 2000 records take ~5sec to reload
    total = 100,
          resources = [],
          events = [];

    for (let i = 1; i <= total; i++) {
      resources.push({
        id: i,
        name: `Resource ${i}`
      });
      events.push({
        id: i,
        resourceId: i,
        name: `Event ${i}`,
        startDate: '2021-02-02',
        endDate: '2021-02-05'
      });
    }

    const response = {
      success: true,
      resources: {
        rows: resources
      },
      events: {
        rows: events
      }
    };
    scheduler = new Scheduler({
      appendTo: document.body,
      width: 500,
      height: 300,
      startDate: new Date(2021, 0, 31),
      endDate: new Date(2021, 1, 7),
      enableEventAnimations: false,
      columns: [{
        text: 'Name',
        field: 'name',
        width: 150
      }],
      crudManager: {
        autoLoad: false,
        autoSync: false
      }
    });
    const spy = t.spyOn(scheduler.assignmentStore.storage, 'rebuildIndices').and.callThrough();
    console.time('Loading time');
    scheduler.crudManager.loadCrudManagerData(response);
    console.timeEnd('Loading time');
    t.expect(spy).toHaveBeenCalled('<4');
    spy.reset();
    console.time('Reloading time');
    scheduler.crudManager.loadCrudManagerData(response);
    console.timeEnd('Reloading time');
    t.expect(spy).toHaveBeenCalled('<4');
  });
});