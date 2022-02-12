"use strict";

StartTest(t => {
  let scheduler1, scheduler2;
  t.beforeEach(() => Scheduler.destroy(scheduler1, scheduler2)); // https://github.com/bryntum/bryntum-suite/issues/1158

  t.it('Should be able to share a CrudManager between two Schedulers', async t => {
    t.mockUrl('load', {
      responseText: JSON.stringify({
        success: true,
        type: 'load',
        events: {
          rows: []
        },
        resources: {
          rows: [{
            id: 1,
            name: 'Default'
          }]
        }
      })
    });
    scheduler1 = new Scheduler({
      cls: 'scheduler1',
      appendTo: document.body,
      width: 500,
      height: 300,
      startDate: new Date(2020, 2, 1),
      endDate: new Date(2020, 2, 8),
      enableEventAnimations: false,
      columns: [{
        text: 'Name',
        field: 'name'
      }],
      crudManager: {
        transport: {
          load: {
            url: 'load'
          },
          sync: {
            url: 'sync'
          }
        },
        autoLoad: false,
        autoSync: false
      }
    });
    scheduler2 = new Scheduler({
      cls: 'scheduler2',
      appendTo: document.body,
      width: 500,
      height: 300,
      startDate: new Date(2020, 2, 1),
      endDate: new Date(2020, 2, 8),
      enableEventAnimations: false,
      columns: [{
        text: 'Name',
        field: 'name'
      }],
      crudManager: scheduler1.crudManager
    });
    await scheduler1.crudManager.load();
    const [newResource] = scheduler1.resourceStore.add({
      name: 'New resource'
    }),
          [event1, event2] = scheduler2.eventStore.add([{
      name: 'Event 1',
      resourceId: 1,
      startDate: '2020-03-01',
      endDate: '2020-03-03'
    }, {
      name: 'Event 2',
      resourceId: newResource.id,
      startDate: '2020-03-01',
      endDate: '2020-03-03'
    }]);
    t.mockUrl('sync', {
      responseText: JSON.stringify({
        success: true,
        type: 'sync',
        events: {
          rows: [{
            $PhantomId: event1.id,
            id: 1
          }, {
            $PhantomId: event2.id,
            id: 2,
            resourceId: 2
          }]
        },
        resources: {
          rows: [{
            $PhantomId: newResource.id,
            id: 2
          }]
        }
      })
    });
    t.is(scheduler2.crudManager, scheduler2.crudManager, 'both schedulers use the same crud manager instance');
    t.is(scheduler2.crudManager.project, scheduler2.project, 'scheduler1.project refers to scheduler2.crudManager.project');
    t.is(scheduler1.crudManager.project, scheduler1.project, 'scheduler2.project refers to scheduler2.crudManager.project'); // Wait for first render to avoid stepping into rendering logic during debug

    await t.waitForSelector('[data-resource-id="1"]', '.scheduler1');
    await t.waitForSelector('[data-resource-id="1"]', '.scheduler2');
    await scheduler2.crudManager.sync();
    await t.waitForSelector('[data-event-id="1"]', '.scheduler1');
    await t.waitForSelector('[data-event-id="2"]', '.scheduler1');
    await t.waitForSelector('[data-event-id="1"]', '.scheduler2');
    await t.waitForSelector('[data-event-id="2"]', '.scheduler2');
    t.selectorCountIs('.b-sch-event', 4, 'No ghost event elements');
    t.selectorCountIs('.scheduler1 .b-sch-event', 2, 'No ghost event elements in scheduler1');
    t.selectorCountIs('.scheduler2 .b-sch-event', 2, 'No ghost event elements in scheduler2');
    t.is(scheduler1.getElementFromEventRecord(event1), document.querySelector('.scheduler1 [data-event-id="1"] .b-sch-event'), 'Event 1 element is resolved correctly');
    t.is(scheduler1.getElementFromEventRecord(event2), document.querySelector('.scheduler1 [data-event-id="2"] .b-sch-event'), 'Event 2 element is resolved correctly');
    t.is(scheduler2.getElementFromEventRecord(event1), document.querySelector('.scheduler2 [data-event-id="1"] .b-sch-event'), 'Event 1 element is resolved correctly');
    t.is(scheduler2.getElementFromEventRecord(event2), document.querySelector('.scheduler2 [data-event-id="2"] .b-sch-event'), 'Event 2 element is resolved correctly');
  });
});