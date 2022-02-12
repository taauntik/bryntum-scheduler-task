"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    var _scheduler;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });
  t.it('Scheduler configured with assignment store must show events assigned to a resource', async t => {
    const delay = 1000;
    t.mockUrl('events/read', {
      delay,
      responseText: JSON.stringify({
        success: true,
        data: [{
          id: 1,
          startDate: '2020-04-20',
          endDate: '2020-04-22',
          resourceId: 1
        }, {
          id: 2,
          startDate: '2020-04-21',
          endDate: '2020-04-23',
          resourceId: 2
        }]
      })
    });
    t.mockUrl('events/update', {
      delay,
      responseText: JSON.stringify({
        success: true,
        data: [{
          id: 1
        }, {
          id: 2
        }]
      })
    });
    t.mockUrl('resources/read', {
      delay,
      responseText: JSON.stringify({
        success: true,
        data: [{
          id: 1,
          name: 'Albert'
        }, {
          id: 2,
          name: 'Bruce'
        }]
      })
    });
    scheduler = new Scheduler({
      appendTo: document.body,
      width: 600,
      height: 400,
      columns: [{
        text: 'Name',
        field: 'name',
        width: 150
      }],
      startDate: '2020-04-20',
      endDate: '2020-04-25',
      project: {
        // The test expects "commit" event triggered by eventStore after data loading
        // it happens only if we disable silenceInitialCommit
        silenceInitialCommit: false
      },
      eventStore: {
        autoLoad: true,
        autoCommit: true,
        readUrl: 'events/read',
        updateUrl: 'events/update'
      },
      resourceStore: {
        autoLoad: true,
        autoCommit: true,
        readUrl: 'resources/read'
      }
    });
    await scheduler.eventStore.await('load');
    await t.waitForProjectReady(scheduler);
    await scheduler.eventStore.await('commit');
    t.selectorCountIs('.b-sch-committing', 0, 'Committing cls is cleaned up after initial load');
    t.mockUrl('events/update', {
      delay,
      responseText: JSON.stringify({
        success: true,
        data: [{
          id: 2
        }]
      })
    });
    scheduler.eventStore.last.name = 'Foo';
    await Promise.all([scheduler.eventStore.await('commit'), t.waitForProjectReady(scheduler)]);
    t.selectorCountIs('.b-sch-committing', 0, 'Committing cls is cleaned up after updating event name');
    t.mockUrl('events/update', {
      delay,
      responseText: JSON.stringify({
        success: true,
        data: [{
          id: 1
        }]
      })
    });
    scheduler.eventStore.first.duration = 4;
    await Promise.all([scheduler.eventStore.await('commit'), t.waitForProjectReady(scheduler)]);
    t.selectorCountIs('.b-sch-committing', 0, 'Committing cls is cleaned up after updating event duration');
  });
});