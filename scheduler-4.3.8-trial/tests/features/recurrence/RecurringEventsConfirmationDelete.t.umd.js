"use strict";

StartTest(t => {
  // The test checks that deleting a recurring event w/ "DELETE" key in the scheduler shows recurrence confirmation dialog
  let resourceStore, eventStore, scheduler, confirmationPopup, event1, event2, event3;

  async function getScheduler(config) {
    const result = await t.getSchedulerAsync(Object.assign({
      resourceStore,
      eventStore,
      enableRecurringEvents: true,
      features: {
        eventTooltip: false
      },
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 25)
    }, config));
    return result;
  }

  function getConfirmationButtons() {
    if (!confirmationPopup) {
      confirmationPopup = scheduler.recurrenceConfirmationPopup;
    }

    return confirmationPopup.queryAll(w => w.type === 'button' && w.isVisible);
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
        name: 'Not recurring',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        cls: 'sch-event1'
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'Recurrs Weekly',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1',
        cls: 'sch-event2'
      }, {
        id: 3,
        resourceId: 'r1',
        name: 'Recurrs Daily',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2',
        cls: 'sch-event3'
      }]
    });
    [event1, event2, event3] = eventStore;
    t.diag('Initial state of data');
    t.is(eventStore.count, 3, 'store has correct number of records');
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.notOk(event2.occurrences.length, 'event 2 has no occurrence');
    t.notOk(event3.occurrences.length, 'event 3 has no occurrences');
    scheduler = await getScheduler();
    t.is(eventStore.count, 3, 'store has correct number of records');
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
    t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences'); // Needed to make async beforeEach work in umd tests

    next();
  });
  t.it('Confirmation shows up on recurring event deleting', t => {
    t.chain({
      diag: 'Assert recurring event deleting'
    }, {
      click: '.sch-event2'
    }, {
      type: '[DELETE]'
    }, {
      waitForElementVisible: '.b-sch-recurrenceconfirmation',
      desc: 'Confirmation showed up'
    }, async () => {
      const buttons = getConfirmationButtons();
      t.is(buttons.length, 2, '2 visible buttons found');
      t.is(buttons[0].text, 'Yes', '"Yes" button found');
      t.is(buttons[1].text, 'Cancel', '"Cancel" button found');
    }, {
      click: '.b-sch-recurrenceconfirmation button:contains(Cancel)',
      desc: 'Clicked "Cancel"'
    }, {
      waitFor: () => !t.$('.b-sch-recurrenceconfirmation')[0],
      desc: 'Confirmation closed'
    }, next => {
      t.diag('Make sure data is intact');
      t.isDeeply(eventStore.modified.values, [], 'store has correct number of records');
      t.is(eventStore.count, 3, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
      next();
    }, {
      diag: 'Assert occurrence deleting'
    }, {
      click: '.sch-event3.b-occurrence'
    }, {
      type: '[DELETE]'
    }, {
      waitForElementVisible: '.b-sch-recurrenceconfirmation',
      desc: 'Confirmation showed up'
    }, next => {
      const buttons = getConfirmationButtons();
      t.is(buttons.length, 3, '3 visible buttons found');
      t.is(buttons[0].text, 'Delete All Future Events', '"All Future Events" button found');
      t.is(buttons[1].text, 'Delete Only This Event', '"Only This Event" button found');
      t.is(buttons[2].text, 'Cancel', '"Cancel" button found');
      next();
    }, {
      click: '.b-sch-recurrenceconfirmation button:contains(Cancel)',
      desc: 'Clicked "Cancel"'
    }, {
      waitFor: () => !t.$('.b-sch-recurrenceconfirmation')[0],
      desc: 'Confirmation closed'
    }, next => {
      t.diag('Make sure data is intact');
      t.isDeeply(eventStore.modified.values, [], 'store has correct number of records');
      t.is(eventStore.count, 3, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
      next();
    }, {
      diag: 'Assert non recurring event deleting'
    }, {
      click: '.sch-event1'
    }, {
      type: '[DELETE]'
    }, {
      waitFor: 1000,
      desc: 'Waited for some long enough timeout to make sure that confirmation never appear'
    }, () => {
      // TODO: report to Siesta
      // t.elementIsNotVisible('.b-sch-recurrenceconfirmation', 'Confirmation did not show up');
      t.selectorNotExists('.b-sch-recurrenceconfirmation:not(.b-hidden)', 'Confirmation did not show up');
      t.is(eventStore.indexOf(event1), -1, 'event 1 was removed');
      t.is(eventStore.count, 2, 'store has correct number of records');
      t.notOk(eventStore.getById(1), 'no event 1');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
    });
  });
  t.it('"Yes" button click causes occurrences regeneration', t => {
    const event2Occurrence = event2.occurrences[0];
    t.chain({
      click: '.sch-event2'
    }, {
      type: '[DELETE]'
    }, {
      waitForElementVisible: '.b-sch-recurrenceconfirmation',
      desc: 'Confirmation showed up'
    }, next => {
      t.click('button:contains(Yes)');
      next();
    }, {
      waitFor: () => !t.$('.b-sch-recurrenceconfirmation')[0],
      desc: 'Confirmation closed'
    }, () => {
      t.is(eventStore.indexOf(event2), -1, 'proper set of removed records');
      t.is(eventStore.indexOf(event2Occurrence), -1, 'proper set of removed records');
      t.is(eventStore.count, 2, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
    });
  });
  t.it('"Delete All Future Events" button click causes further occurrences removal', t => {
    const event3Occurrences = event3.occurrences,
          occurrence = event3Occurrences[1],
          {
      startDate
    } = occurrence;
    t.chain({
      click: () => scheduler.getElementFromEventRecord(occurrence)
    }, {
      type: '[DELETE]'
    }, {
      waitForElementVisible: '.b-sch-recurrenceconfirmation',
      desc: 'Confirmation showed up'
    }, next => {
      t.click('button:contains(Delete All Future Events)');
      next();
    }, {
      waitFor: () => !t.$('.b-sch-recurrenceconfirmation')[0],
      desc: 'Confirmation closed'
    }, () => {
      t.isDeeplyUnordered([...eventStore.modified], [event3], 'event3 was updated');
      t.ok(event3.occurrences[0].endDate, 'event3 occurrence was rebuilt');
      t.is(eventStore.count, 3, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.is(event3.occurrences.length, 1, 'event 3 has 3 occurrences');
      t.ok(event3.endDate < startDate, 'event 3 recurrence stops before the "occurrence" started');
    });
  });
  t.it('"Delete Only This Event" button click works properly', t => {
    const event3Occurrences = event3.occurrences,
          occurrence = event3Occurrences[1],
          {
      startDate
    } = occurrence;
    t.chain({
      click: () => scheduler.getElementFromEventRecord(occurrence)
    }, {
      type: '[DELETE]'
    }, {
      waitForElementVisible: '.b-sch-recurrenceconfirmation',
      desc: 'Confirmation showed up'
    }, {
      click: 'button:contains(Delete Only This Event)'
    }, {
      waitForProjectReady: scheduler
    }, {
      waitForSelectorNotFound: '.b-sch-recurrenceconfirmation',
      desc: 'Confirmation closed'
    }, () => {
      t.isDeeply([...eventStore.modified], [event3], 'event3 was updated');
      t.is(eventStore.count, 3, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.ok(event3.hasException(startDate), 'event 3 has "occurrence" start date in the exception dates list');
      const occurrencesDates = event3.occurrences.map(occurrence => {
        return {
          start: occurrence.startDate,
          end: occurrence.endDate
        };
      });
      t.isDeeply(occurrencesDates, [{
        start: new Date(2018, 5, 16),
        end: new Date(2018, 5, 17)
      }, {
        start: new Date(2018, 5, 20),
        end: new Date(2018, 5, 21)
      }, {
        start: new Date(2018, 5, 22),
        end: new Date(2018, 5, 23)
      }, {
        start: new Date(2018, 5, 24),
        end: new Date(2018, 5, 25)
      }], 'event 3 occurrences dates are correct');
    });
  });
  t.it('Should handle deleting a mix of occurrences and real events', async t => {
    scheduler.removeEvents([1, 2].map(id => scheduler.eventStore.getById(id)));
    await t.click('button:contains(Yes)');
    await t.waitForSelectorNotFound('.b-sch-recurrenceconfirmation');
    await t.waitForSelectorNotFound('.b-sch-event1, .b-sch-event2');
  }); // https://github.com/bryntum/support/issues/3508

  t.it('Should update event recurrenceRule when removing its occurrences', async t => {
    const event1Data = {
      id: 1,
      startDate: '2011-01-03 12:00',
      endDate: '2011-01-03 18:00',
      recurrenceRule: 'FREQ=DAILY',
      cls: 'event1',
      resourceId: 'r1'
    };
    t.mockUrl('read-url', {
      responseText: JSON.stringify({
        success: true,
        data: [event1Data]
      })
    });
    t.mockUrl('update-url', (url, params, options) => {
      t.endAsync(async);
      const requestData = JSON.parse(options.body);
      t.isDeeply(requestData, {
        data: [{
          id: 1,
          // TODO: exceptionDates should not be here need to fix this some day
          exceptionDates: [t.anyStringLike('2011-01-05T00:00:00')],
          recurrenceRule: 'FREQ=DAILY;UNTIL=20110105T115900'
        }]
      }, 'request passes proper changes');
      return {
        delay: 10,
        responseText: JSON.stringify({
          success: true,
          data: [Object.assign(event1Data, requestData.data[0])]
        })
      };
    });
    scheduler = await t.getSchedulerAsync({
      features: {
        eventMenu: true
      },
      enableRecurringEvents: true,
      eventStore: {
        readUrl: 'read-url',
        updateUrl: 'update-url',
        autoLoad: true,
        autoCommit: true
      },
      resources: [{
        id: 'r1',
        name: 'foo'
      }]
    });
    let event, occurrenceId;
    await t.waitFor(() => {
      var _event, _event$occurrences$;

      event = scheduler.eventStore.first;
      occurrenceId = (_event = event) === null || _event === void 0 ? void 0 : (_event$occurrences$ = _event.occurrences[1]) === null || _event$occurrences$ === void 0 ? void 0 : _event$occurrences$.id;
      return event && occurrenceId;
    });
    await t.rightClick(`[data-event-id="${occurrenceId}"]`);
    await t.click('.b-menuitem:contains(Delete)');
    const async = t.beginAsync();
    await t.click('button:contains(All Future Events)');
    await t.waitForSelectorNotFound('.b-sch-recurrenceconfirmation');
    t.is(event.recurrenceRule, 'FREQ=DAILY;UNTIL=20110105T115900');
  });
});