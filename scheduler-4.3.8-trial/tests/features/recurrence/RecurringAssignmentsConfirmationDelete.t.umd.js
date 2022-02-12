"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
  });
  t.it('Should remove occurrences when assignmentStore is used', async t => {
    scheduler = await t.getSchedulerAsync({
      enableRecurringEvents: true,
      events: [{
        id: 1,
        startDate: '2011-01-03 12:00',
        endDate: '2011-01-03 18:00',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=1',
        cls: 'event1'
      }],
      assignments: [{
        id: 1,
        resourceId: 'r1',
        eventId: 1
      }]
    });
    const event = scheduler.eventStore.first,
          occurrenceId = event.occurrences[1].id;
    t.chain({
      click: `[data-event-id="${occurrenceId}"]`
    }, {
      type: '[DELETE]'
    }, {
      click: '.b-popup button:contains(Only)'
    }, {
      waitForSelectorNotFound: `${scheduler.unreleasedEventSelector}[data-event-id="${occurrenceId}"]`,
      desc: 'Occurrence removed'
    });
  });
  t.it('Should handle deleting a mix of occurrences and regular assignments', async t => {
    scheduler = await t.getSchedulerAsync({
      enableRecurringEvents: true,
      multiEventSelect: true,
      events: [{
        id: 1,
        startDate: '2011-01-03 12:00',
        endDate: '2011-01-03 18:00',
        cls: 'event1'
      }, {
        id: 2,
        startDate: '2011-01-03 12:00',
        endDate: '2011-01-03 18:00',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=1',
        cls: 'event2'
      }, {
        id: 3,
        startDate: '2011-01-03 12:00',
        endDate: '2011-01-03 18:00',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2',
        cls: 'event3'
      }],
      assignments: [{
        id: 1,
        resourceId: 'r1',
        eventId: 1
      }, {
        id: 2,
        resourceId: 'r2',
        eventId: 2
      }, {
        id: 3,
        resourceId: 'r3',
        eventId: 3
      }]
    });
    await t.click('.event1');
    await t.click('.event2', null, null, {
      ctrlKey: true
    });
    await t.click('.event3', null, null, {
      ctrlKey: true
    });
    scheduler.removeEvents(scheduler.selectedAssignments);
    await t.click('button:contains(Yes)');
    await t.waitForSelectorNotFound('.b-sch-recurrenceconfirmation');
    await t.waitForSelectorNotFound('.b-sch-event1, .b-sch-event2, .b-sch-event3');
  });
});