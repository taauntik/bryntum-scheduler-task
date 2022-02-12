"use strict";

StartTest(t => {
  const checkSync = async (t, data) => {
    const resources = [{
      id: 'r1',
      name: 'Mike'
    }],
          events = [{
      id: 1,
      resourceId: 'r1',
      startDate: new Date(2017, 0, 1, 10),
      endDate: new Date(2017, 0, 1, 12),
      name: 'Click me',
      iconCls: 'b-fa b-fa-mouse-pointer'
    }];
    const scheduler = await t.getSchedulerAsync({
      resources,
      eventStore: {
        syncDataOnLoad: true
      },
      startDate: new Date(2017, 0, 1, 6),
      endDate: new Date(2017, 0, 1, 20),
      viewPreset: 'hourAndDay',
      columns: [{
        text: 'Name',
        field: 'name',
        width: 130
      }]
    });
    scheduler.eventStore.data = events;
    await t.waitForSelector('.b-sch-event');
  }; // https://github.com/bryntum/support/issues/3099


  t.it('Should render event with empty array data', async t => {
    await checkSync(t, []);
  }); // https://github.com/bryntum/support/issues/3099

  t.it('Should render event with undefined data', async t => {
    await checkSync(t);
  });
});