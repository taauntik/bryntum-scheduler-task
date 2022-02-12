"use strict";

StartTest(t => {
  // The test checks that clicking "Save" button in event editor shows recurrence confirmation dialog
  // and assert the confirmation buttons
  let resourceStore, eventStore, scheduler, confirmationPopup, event1, event2, event3;

  async function getScheduler(config) {
    const result = await t.getSchedulerAsync(Object.assign({
      resourceStore,
      eventStore,
      enableRecurringEvents: true,
      features: {
        eventTooltip: false,
        eventEdit: true // is enabled by default already, but in case we change our minds...

      },
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 25),
      appendTo: document.body
    }, config));
    return result;
  }

  function getConfirmationButtons() {
    if (!confirmationPopup) {
      confirmationPopup = scheduler.features.eventEdit.recurrenceConfirmation;
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
  t.it('Confirmation shows up on recurring event editing in event editor', t => {
    t.chain({
      diag: 'Assert recurring event editing'
    }, {
      doubleclick: '.sch-event2'
    }, {
      waitForElementVisible: '.b-eventeditor',
      desc: 'Event editor showed up'
    }, {
      type: '06/15/2018',
      target: 'input[name=startDate]',
      clearExisting: true
    }, {
      click: 'input[name=endDate]'
    }, {
      type: '06/16/2018',
      target: 'input[name=endDate]',
      clearExisting: true
    }, {
      click: 'button:contains(Save)',
      desc: '"Save" clicked'
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
    }, {
      click: 'button:contains(Cancel)'
    }, {
      waitFor: () => !t.$('.b-eventeditor')[0],
      desc: 'Event editor closed'
    }, async () => {
      t.diag('Make sure data is intact');
      t.isDeeply(eventStore.modified.values, [], 'store has correct number of records');
      t.is(eventStore.count, 3, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
    }, {
      diag: 'Assert occurrence editing'
    }, {
      doubleclick: '.sch-event3.b-occurrence'
    }, {
      waitForElementVisible: '.b-eventeditor',
      desc: 'Event editor showed up'
    }, {
      type: '06/15/2018',
      target: 'input[name=startDate]',
      clearExisting: true
    }, {
      click: 'input[name=endDate]'
    }, {
      type: '06/16/2018',
      target: 'input[name=endDate]',
      clearExisting: true
    }, {
      click: 'button:contains(Save)',
      desc: '"Save" clicked'
    }, {
      waitForElementVisible: '.b-sch-recurrenceconfirmation',
      desc: 'Confirmation showed up'
    }, async () => {
      const buttons = getConfirmationButtons();
      t.is(buttons.length, 3, '3 visible buttons found');
      t.is(buttons[0].text, 'All Future Events', '"All Future Events" button found');
      t.is(buttons[1].text, 'Only This Event', '"Only This Event" button found');
      t.is(buttons[2].text, 'Cancel', '"Cancel" button found');
    }, {
      click: '.b-sch-recurrenceconfirmation button:contains(Cancel)',
      desc: 'Clicked "Cancel"'
    }, {
      waitFor: () => !t.$('.b-sch-recurrenceconfirmation')[0],
      desc: 'Confirmation closed'
    }, {
      click: 'button:contains(Cancel)'
    }, {
      waitFor: () => !t.$('.b-eventeditor')[0],
      desc: 'Event editor closed'
    }, async () => {
      t.diag('Make sure data is intact');
      t.isDeeply(eventStore.modified.values, [], 'store has correct number of records');
      t.is(eventStore.count, 3, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
    }, {
      diag: 'Assert non recurring event editing'
    }, {
      doubleclick: '.sch-event1'
    }, {
      waitForElementVisible: '.b-eventeditor',
      desc: 'Event editor showed up'
    }, {
      type: '06/15/2018',
      target: 'input[name=startDate]',
      clearExisting: true
    }, {
      click: 'input[name=endDate]'
    }, {
      type: '06/16/2018',
      target: 'input[name=endDate]',
      clearExisting: true
    }, {
      click: 'button:contains(Save)',
      desc: '"Save" clicked'
    }, {
      waitFor: 1000,
      desc: 'Waited for some long enough timeout to make sure that confirmation didn`t appear'
    }, () => {
      t.selectorNotExists('.b-sch-recurrenceconfirmation:not(.b-hidden)', 'Confirmation did not show up');
      t.isDeeply([...eventStore.modified], [event1], 'event 1 was resized');
      t.is(eventStore.count, 3, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
    });
  });
  t.it('"Yes" button click causes occurrences regeneration', t => {
    t.chain({
      doubleclick: '.sch-event2'
    }, {
      waitForElementVisible: '.b-eventeditor',
      desc: 'Event editor showed up'
    }, {
      type: '06/15/2018',
      target: 'input[name=startDate]',
      clearExisting: true
    }, {
      click: 'input[name=endDate]'
    }, {
      type: '06/16/2018',
      target: 'input[name=endDate]',
      clearExisting: true
    }, {
      click: 'button:contains(Save)',
      desc: '"Save" clicked'
    }, {
      waitForElementVisible: '.b-sch-recurrenceconfirmation',
      desc: 'Confirmation showed up'
    }, {
      click: 'button:contains(Yes)'
    }, {
      waitFor: () => !(event2.startDate - new Date(2018, 5, 15)),
      desc: 'event 2 moved'
    }, () => {
      t.is(event2.startDate, new Date(2018, 5, 15), 'event 2 moved');
      t.is(event2.occurrences[0].startDate, new Date(2018, 5, 22), 'event 2 occurrence moved');
      t.isDeeplyUnordered([...eventStore.modified], [event2], 'proper set of modified records');
      t.is(eventStore.count, 3, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
    });
  });
  t.it('"All Future Events" button click causes further occurrences regeneration', t => {
    const occurrence = event3.occurrences[1];
    t.chain({
      doubleclick: () => scheduler.getElementFromEventRecord(occurrence)
    }, {
      waitForElementVisible: '.b-eventeditor',
      desc: 'Event editor showed up'
    }, {
      type: '06/19/2018',
      target: 'input[name=startDate]',
      clearExisting: true
    }, {
      click: 'input[name=endDate]'
    }, {
      type: '06/20/2018',
      target: 'input[name=endDate]',
      clearExisting: true
    }, {
      click: 'button:contains(Save)',
      desc: '"Save" clicked'
    }, {
      waitForElementVisible: '.b-sch-recurrenceconfirmation',
      desc: 'Confirmation showed up'
    }, {
      click: 'button:contains(All Future Events)'
    }, {
      waitFor: () => !occurrence.isOccurrence,
      desc: '"occurrence" is no longer an occurrence'
    }, () => {
      t.notOk(occurrence.isOccurrence, '"occurrence" is no longer an occurrence');
      t.ok(occurrence.isRecurring, '"occurrence" is a new independent recurring event');
      t.isDeeply([...eventStore.modified], [event3], 'proper modified bag');
      t.isDeeply([...eventStore.added], [occurrence], '"occurrence" is considered as added because it has been turned into master event and has a generated ID');
      t.is(eventStore.count, 4, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.is(event3.occurrences.length, 1, 'event 3 has 3 occurrences');
      t.ok(event3.endDate < occurrence.startDate, 'event 3 recurrence stops before the "occurrence" starts');
      t.is(occurrence.occurrences.length, 3, '"occurrence" has 2 occurrences');
      t.is(occurrence.startDate, new Date(2018, 5, 19), '"occurrence" has correct start date');
      t.is(occurrence.occurrences[0].startDate, new Date(2018, 5, 21), '"occurrence" occurrence 0 has correct start date');
      t.is(occurrence.occurrences[1].startDate, new Date(2018, 5, 23), '"occurrence" occurrence 1 has correct start date');
      t.is(occurrence.occurrences[2].startDate, new Date(2018, 5, 25), '"occurrence" occurrence 1 has correct start date');
    });
  });
  t.it('"Only This Event" button click works properly', t => {
    const occurrence = event3.occurrences[1],
          occurrenceStartDate = occurrence.startDate;
    t.chain({
      doubleclick: () => scheduler.getElementFromEventRecord(occurrence)
    }, {
      waitForElementVisible: '.b-eventeditor',
      desc: 'Event editor showed up'
    }, {
      type: '06/19/2018',
      target: 'input[name=startDate]',
      clearExisting: true
    }, {
      click: 'input[name=endDate]'
    }, {
      type: '06/20/2018',
      target: 'input[name=endDate]',
      clearExisting: true
    }, {
      click: 'button:contains(Save)',
      desc: '"Save" clicked'
    }, {
      waitForElementVisible: '.b-sch-recurrenceconfirmation',
      desc: 'Confirmation showed up'
    }, {
      click: 'button:contains(Only This Event)'
    }, {
      waitFor: () => !occurrence.isOccurrence,
      desc: '"occurrence" is no longer an occurrence'
    }, {
      waitFor: () => event3.occurrences[0].endDate.getTime() === new Date(2018, 5, 17).getTime()
    }, () => {
      t.notOk(occurrence.isOccurrence, '"occurrence" is no longer an occurrence');
      t.notOk(occurrence.isRecurring, '"occurrence" is not a recurring event');
      t.is(occurrence.startDate, new Date(2018, 5, 19), '"occurrence" start date is correct');
      t.isDeeply([...eventStore.modified], [event3], 'proper modified bag');
      t.isDeeply([...eventStore.added], [occurrence], '"occurrence" is considered as added because it has been turned into master event and has a generated ID');
      t.is(eventStore.count, 4, 'store has correct number of records');
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
      t.ok(event3.hasException(occurrenceStartDate), 'event 3 has "occurrence" start date in the exception dates list');
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
});