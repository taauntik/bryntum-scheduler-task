"use strict";

StartTest(t => {
  let resourceStore, eventStore, scheduler, event1, event2, event3;

  async function getScheduler(config) {
    const result = await t.getSchedulerAsync(Object.assign({
      resourceStore,
      eventStore,
      eventStyle: 'border',
      enableRecurringEvents: true,
      features: {
        eventTooltip: false,
        eventEdit: true // is enabled by default already, but in case we change our minds...

      },
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 25)
    }, config));
    return result;
  }

  t.beforeEach(async (t, next) => {
    Base.destroy(scheduler);
    resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Foo',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        cls: 'sch-event1'
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'Bar',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1',
        cls: 'sch-event2'
      }, {
        id: 3,
        resourceId: 'r1',
        name: 'Baz',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2',
        cls: 'sch-event3'
      }]
    });
    [event1, event2, event3] = eventStore;
    t.is(eventStore.added.count, 0, 'No records added');
    t.is(eventStore.modified.count, 0, 'No records modified');
    t.is(eventStore.removed.count, 0, 'No records removed');
    t.diag('Initial state of data');
    t.is(eventStore.count, 3, 'store has correct number of records');
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.notOk(event2.occurrences.length, 'event 2 has no occurrence');
    t.notOk(event3.occurrences.length, 'event 3 has no occurrences');
    scheduler = await getScheduler();
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
    t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences'); // Needed to make async beforeEach work in umd tests

    next();
  });
  t.it('Confirmation shows up on recurring event editing in event editor', t => {
    t.chain({
      diag: 'Assert recurring event editing'
    }, {
      doubleclick: '.sch-event2'
    }, {
      click: '.b-recurrencelegendbutton'
    }, {
      click: ':textEquals(Fri)'
    }, {
      click: '.b-recurrenceeditor .b-green'
    }, async () => {
      t.diag('Assert data is intact until we click "Save"...');
      t.is(eventStore.count, 3, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
      t.selectorCountIs('.b-sch-event-wrap', 6);
    }, {
      click: ':textEquals(Save)'
    }, {
      click: ':textEquals(Yes)'
    }, // A new occurrence will be added
    {
      waitFor: () => t.query(scheduler.eventSelector).length === 7
    }, () => {
      t.is(eventStore.count, 3, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 3, 'event 2 has one more occurrence');
      t.is(event3.occurrences.length, 5, 'event 3 has proper number of occurrences');
    });
  }); // https://github.com/bryntum/support/issues/3

  t.it('Custom dialog shows up when selecting Custom in the recurrence combo', t => {
    t.chain({
      diag: 'Assert recurring event editing'
    }, {
      doubleclick: '.sch-event1'
    }, {
      click: '.b-recurrencecombo .b-icon-picker'
    }, {
      waitForSelector: '.b-list .b-list-item:contains(Daily)'
    }, {
      click: '.b-list-item:contains(Custom)'
    }, () => {
      scheduler.destroy();
      t.selectorNotExists('.b-widget', 'No leaked widgets');
    });
  }); // https://github.com/bryntum/support/issues/163

  t.it('Should not show recurrence UI by default', async t => {
    scheduler && scheduler.destroy();
    scheduler = await t.getSchedulerAsync({
      features: {
        eventTooltip: false,
        eventEdit: true // is enabled by default already, but in case we change our minds...

      }
    });
    t.chain({
      doubleclick: '.b-sch-event'
    }, {
      waitForSelector: '.b-eventeditor'
    }, () => t.elementIsNotVisible('[data-ref=recurrenceCombo]'));
  });
  t.it('Should not show recurrence UI if enableRecurringEvents is false', t => {
    scheduler && scheduler.destroy();
    scheduler = t.getScheduler({
      enableRecurringEvents: false,
      features: {
        eventTooltip: false,
        eventEdit: true // is enabled by default already, but in case we change our minds...

      }
    });
    t.chain({
      doubleclick: '.b-sch-event'
    }, {
      waitForSelector: '.b-eventeditor'
    }, () => t.elementIsNotVisible('[data-ref=recurrenceCombo]'));
  }); // https://github.com/bryntum/support/issues/146

  t.it('Should render occurrences for newly created recurring event', t => {
    scheduler.events = [];
    t.chain({
      doubleclick: '.b-sch-timeaxis-cell',
      offset: [5, 5]
    }, {
      click: '.b-recurrencecombo .b-icon-picker'
    }, {
      click: '.b-list .b-list-item:contains(Daily)'
    }, {
      click: '.b-button:textEquals(Save)'
    }, {
      waitForSelector: '.b-recurring'
    }, {
      waitForSelector: '.b-occurrence'
    });
  }); // https://github.com/bryntum/bryntum-suite/issues/2155

  t.it('Custom dialog shows up correctly when editing newly created event', t => {
    scheduler.events = [];
    t.chain({
      doubleclick: '.b-sch-timeaxis-cell',
      offset: [5, 5]
    }, {
      click: '.b-recurrencecombo .b-icon-picker'
    }, {
      click: '.b-list .b-list-item:contains(Custom)'
    }, {
      waitFor: () => {
        var _scheduler$features$e;

        return (_scheduler$features$e = scheduler.features.eventEdit.recurrenceEditor) === null || _scheduler$features$e === void 0 ? void 0 : _scheduler$features$e.containsFocus;
      }
    }, next => {
      const {
        eventEdit
      } = scheduler.features,
            {
        recurrenceEditor
      } = eventEdit,
            {
        x,
        y
      } = recurrenceEditor; // Find correct center

      recurrenceEditor.alignTo({
        target: window,
        align: 'c-c'
      }); // Must have been centered by our default settings.

      t.isApprox(recurrenceEditor.x, x, 1);
      t.isApprox(recurrenceEditor.y, y, 1); // The frequency has been loaded correctly

      t.is(recurrenceEditor.widgetMap.frequencyField.value, eventEdit.eventRecord.recurrenceModel.fieldMap.frequency.defaultValue);
    });
  });
  t.it('Should support multi resource assignment for recurring events', t => {
    var _scheduler;

    (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
    scheduler = t.getScheduler({
      enableRecurringEvents: true,
      features: {
        eventTooltip: false,
        eventEdit: true // is enabled by default already, but in case we change our minds...

      },
      startDate: '2018-06-13',
      events: [{
        id: 1,
        name: 'Foo',
        startDate: '2018-06-14',
        endDate: '2018-06-15'
      }, {
        id: 2,
        name: 'Bar',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2',
        cls: 'sch-event2'
      }],
      resources: [{
        id: 'r1',
        name: 'Resource 1'
      }, {
        id: 'r2',
        name: 'Resource 2'
      }],
      assignments: [{
        id: 1,
        eventId: 1,
        resourceId: 'r1'
      }, {
        id: 2,
        eventId: 2,
        resourceId: 'r1'
      }]
    });
    t.chain({
      doubleclick: '.sch-event2'
    }, {
      waitForSelector: '.b-eventeditor'
    }, next => {
      scheduler.features.eventEdit.editor.widgetMap.resourceField.value = ['r1', 'r2'];
      next();
    }, {
      click: ':textEquals(Save)'
    }, {
      click: ':textEquals(Yes)'
    }, {
      waitForSelectorNotFound: '.b-eventeditor'
    }, () => t.isDeeplyUnordered(scheduler.eventStore.getById(2).resources, [...scheduler.resourceStore], 'Event has been successfully updated.'));
  }); // https://github.com/bryntum/support/issues/3456

  t.it('Should support toggling stop condition from date to count', async t => {
    scheduler.events = [];
    await t.doubleClick('.b-sch-timeaxis-cell', null, null, null, [5, 5]);
    await t.type('[name="name"]', 'qwe');
    await t.click('.b-recurrencecombo');
    await t.click('.b-list-item:contains(Daily)');
    t.pass('Picked Daily frequency');
    await t.click('.b-button:contains(Daily)');
    await t.click('.b-recurrencestopconditioncombo');
    await t.click('.b-list-item:contains(On date)');
    t.pass('Picked "On date" stop condition');
    await t.type('.b-recurrenceeditor-body-wrap input[name=endDate]', '06/17/2018[TAB]');
    t.pass('Entered stop date');
    await t.click('.b-recurrenceeditor-body-wrap .b-button:contains(Save)');
    t.pass('Clicked recurrence Save button');
    await t.click('.b-button:contains(Save)');
    t.pass('Clicked event Save button');
    await t.waitForSelectorCount('.b-sch-event-wrap .b-recurring', 1);
    t.pass('proper number of recurring events found');
    await t.waitForSelectorCount('.b-sch-event-wrap .b-occurrence', 5);
    t.pass('proper number of occurrences found');
    await t.doubleClick('.b-recurring');
    await t.click('.b-button:contains(Daily)');
    await t.click('.b-recurrencestopconditioncombo');
    await t.click('.b-list-item:contains(After)');
    t.pass('Picked "After" stop condition');
    await t.type('.b-recurrenceeditor-body-wrap input[name=count]', '3[TAB]');
    t.pass('Entered stop date');
    await t.click('.b-recurrenceeditor-body-wrap .b-button:contains(Save)');
    t.pass('Clicked recurrence Save button');
    await t.click('.b-button:contains(Daily)');
    t.pass('Clicked recurrence edit button again');
    await t.waitFor(() => t.query('.b-recurrencestopconditioncombo input')[0].value === 'After');
    t.pass('proper stop condition in UI found');
    await t.waitFor(() => t.query('.b-recurrenceeditor-body-wrap input[name=count]')[0].value === '3');
    t.pass('proper stop count in UI found');
    await t.click('.b-recurrenceeditor-body-wrap .b-button:contains(Save)');
    t.pass('Clicked recurrence Save button');
    await t.click('.b-button:contains(Save)');
    t.pass('Clicked event Save button');
    await t.click('.b-button:contains(Yes)');
    await t.waitForSelectorCount('.b-sch-event-wrap .b-recurring', 1);
    t.pass('proper number of recurring events found');
    await t.waitForSelectorCount('.b-sch-event-wrap .b-occurrence', 2);
    t.pass('proper number of occurrences found');
  });
});