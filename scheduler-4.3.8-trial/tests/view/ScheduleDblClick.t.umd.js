"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => scheduler && scheduler.destroy());
  t.it('Should create event and show event editor', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventEdit: true
      },
      viewPreset: 'hourAndDay',
      startDate: new Date(2018, 2, 1, 8),
      endDate: new Date(2018, 2, 1, 19)
    });
    t.chain({
      dblClick: '.b-timeline-subgrid .b-grid-cell',
      offset: ['50%+1', '50%']
    }, {
      waitForSelector: '.b-sch-dirty-new',
      desc: 'Event element created'
    }, {
      waitForSelector: '.b-eventeditor',
      desc: 'Editor shown'
    }, {
      waitForSelectorNotFound: '.b-sch-event-tooltip',
      desc: 'event tooltip not triggered'
    }, () => {
      t.selectorNotExists('.b-sch-event-tooltip', 'event tooltip not triggered');
      const record = scheduler.features.eventEdit.eventRecord;
      t.is(record.startDate, new Date(2018, 2, 1, 13, 30), 'Start date is correct');
      t.is(record.endDate, new Date(2018, 2, 1, 14, 30), 'End date is correct');
    });
  });
  t.it('Should create event but should not show event editor if no editors specified', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventEdit: false
      },
      viewPreset: 'hourAndDay',
      startDate: new Date(2018, 2, 1, 8),
      endDate: new Date(2018, 2, 1, 19)
    });
    t.chain({
      dblClick: '.b-timeline-subgrid .b-grid-cell'
    }, {
      waitForSelector: '.b-sch-event',
      desc: 'Event created'
    }, {
      waitForSelectorNotFound: '.b-eventeditor',
      desc: 'Editor not shown'
    });
  });
  t.it('Should not create event and show event editor if scheduler in read only mode', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventEdit: true
      },
      readOnly: true,
      viewPreset: 'hourAndDay',
      startDate: new Date(2018, 2, 1, 8),
      endDate: new Date(2018, 2, 1, 19)
    });
    t.chain({
      dblClick: '.b-timeline-subgrid .b-grid-cell'
    }, {
      waitForSelectorNotFound: '.b-sch-dirty-new',
      desc: 'New event element not created'
    }, {
      waitForSelectorNotFound: '.b-eventeditor',
      desc: 'Editor not shown'
    });
  });
  t.it('Should not create event and show event editor if this option is turned off', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventEdit: true
      },
      readOnly: false,
      createEventOnDblClick: false,
      viewPreset: 'hourAndDay',
      startDate: new Date(2018, 2, 1, 8),
      endDate: new Date(2018, 2, 1, 19)
    });
    t.chain({
      dblClick: '.b-timeline-subgrid .b-grid-cell'
    }, {
      waitForSelectorNotFound: '.b-sch-dirty-new',
      desc: 'Event element not created'
    }, {
      waitForSelectorNotFound: '.b-eventeditor',
      desc: 'Editor not shown'
    });
  }); // https://github.com/bryntum/support/issues/3234

  t.it('Should support setting new event duration/durationUnit based on EventModel', async t => {
    class MyEvent extends EventModel {
      static get fields() {
        return [{
          name: 'duration',
          defaultValue: 4
        }, {
          name: 'durationUnit',
          defaultValue: 'h'
        }];
      }

    }

    scheduler = await t.getSchedulerAsync({
      eventStore: {
        modelClass: MyEvent
      },
      viewPreset: 'hourAndDay',
      startDate: new Date(2018, 2, 1, 8),
      endDate: new Date(2018, 2, 1, 19),
      createEventOnDblClick: {
        useEventModelDefaults: true
      }
    });
    t.chain({
      dblClick: '.b-timeline-subgrid .b-grid-cell',
      offset: ['50%+1', '50%']
    }, {
      waitForSelector: '.b-sch-dirty-new',
      desc: 'Event element created'
    }, () => {
      const record = scheduler.eventStore.first;
      t.is(record.isCreating, false, 'No editor, so isCreating reports false');
      t.is(record.startDate, new Date(2018, 2, 1, 13, 30), 'Start date is correct');
      t.is(record.endDate, new Date(2018, 2, 1, 17, 30), 'End date is correct');
      t.is(record.duration, 4, 'duration is correct');
      t.is(record.durationUnit, 'h', 'durationUnit is correct');
    });
  }); // https://github.com/bryntum/support/issues/3287

  t.it('Should be able to configure single assignment (as opposed to infer from data)', async t => {
    scheduler = await t.getScheduler({
      eventStore: {
        singleAssignment: true
      },
      resources: [{
        id: 1,
        name: 'R1'
      }],
      events: []
    });
    await t.doubleClick('.b-sch-timeaxis-cell');
    t.is(scheduler.eventStore.usesSingleAssignment, true, 'usesSingleAssignment set');
    t.is(scheduler.eventStore.first.data.resourceId, 1, 'resourceId set');
  });
});