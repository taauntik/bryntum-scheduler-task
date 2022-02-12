"use strict";

StartTest(t => {
  t.it('generateOccurrencesForEvents DAILY', async t => {
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        startDate: '2018-05-16 12:30:55',
        endDate: '2018-05-18 11:12:13',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2;COUNT=3'
      }, {
        id: 2,
        resourceId: 'r1',
        startDate: '2018-05-16 13:30:55',
        endDate: '2018-05-18 12:12:13'
      }]
    });
    const project = new ProjectModel({
      eventStore,
      resourceStore: new ResourceStore({
        data: [{
          id: 'r1'
        }]
      })
    });
    await project.commitAsync();
    const event = eventStore.first;
    t.ok(event.isRecurring, 'event is recurring');
    eventStore.getOccurrencesForTimeSpan(event, event.startDate, new Date(2020, 0, 1));
    t.is(eventStore.count, 2, 'event store has new records');
    t.is(eventStore.getAt(0), event, 'event is still there');
    t.is(event.startDate, new Date(2018, 4, 16, 12, 30, 55), 'event start date is correct');
    t.is(event.endDate, new Date(2018, 4, 18, 11, 12, 13), 'event end date is correct');
    const occurrence1 = event.occurrences[0];
    t.is(occurrence1.recurringTimeSpan, event, 'occurrence #1 refers to its master event');
    t.is(occurrence1.startDate, new Date(2018, 4, 18, 12, 30, 55), 'occurrence #1 start date is correct');
    t.is(occurrence1.endDate, new Date(2018, 4, 20, 11, 12, 13), 'occurrence #1 end date is correct');
    t.ok(occurrence1.isOccurrence, 'occurrence #1 is indicated as occurrence');
    const occurrence2 = event.occurrences[1];
    t.is(occurrence2.recurringTimeSpan, event, 'occurrence #2 refers to its master event');
    t.is(occurrence2.startDate, new Date(2018, 4, 20, 12, 30, 55), 'occurrence #2 start date is correct');
    t.is(occurrence2.endDate, new Date(2018, 4, 22, 11, 12, 13), 'occurrence #2 end date is correct');
    t.ok(occurrence2.isOccurrence, 'occurrence #2 is indicated as occurrence');
  });
  t.it('generateOccurrencesForEvents WEEKLY', async t => {
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        startDate: '2018-05-16 12:30:55',
        endDate: '2018-05-18 11:12:13',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1;COUNT=3;'
      }, {
        id: 2,
        resourceId: 'r1',
        startDate: '2018-05-16 13:30:55',
        endDate: '2018-05-18 12:12:13'
      }]
    });
    const project = new ProjectModel({
      eventStore,
      resourceStore: new ResourceStore({
        data: [{
          id: 'r1'
        }]
      })
    });
    await project.commitAsync();
    const event = eventStore.getById(1);
    t.ok(event.isRecurring, 'event is recurring');
    eventStore.getOccurrencesForTimeSpan(event, event.startDate, new Date(2020, 0, 1));
    t.is(eventStore.count, 2, 'event store has no new records');
    t.is(event.occurrences.length, 2);
    t.is(eventStore.getAt(0), event, 'event is still there');
    t.is(event.startDate, new Date(2018, 4, 16, 12, 30, 55), 'event start date is correct');
    t.is(event.endDate, new Date(2018, 4, 18, 11, 12, 13), 'event end date is correct');
    const occurrence1 = event.occurrences[0];
    t.is(occurrence1.recurringTimeSpan, event, 'occurrence #1 refers to its master event');
    t.is(occurrence1.startDate, new Date(2018, 4, 23, 12, 30, 55), 'occurrence #1 start date is correct');
    t.is(occurrence1.endDate, new Date(2018, 4, 25, 11, 12, 13), 'occurrence #1 end date is correct');
    t.ok(occurrence1.isOccurrence, 'occurrence #1 is indicated as occurrence');
    const occurrence2 = event.occurrences[1];
    t.is(occurrence2.recurringTimeSpan, event, 'occurrence #2 refers to its master event');
    t.is(occurrence2.startDate, new Date(2018, 4, 30, 12, 30, 55), 'occurrence #2 start date is correct');
    t.is(occurrence2.endDate, new Date(2018, 5, 1, 11, 12, 13), 'occurrence #2 end date is correct');
    t.ok(occurrence2.isOccurrence, 'occurrence #2 is indicated as occurrence');
  });
  t.it('generateOccurrencesForEvents MONTHLY', async t => {
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        startDate: '2018-05-16 12:30:55',
        endDate: '2018-05-18 11:12:13',
        recurrenceRule: 'FREQ=MONTHLY;INTERVAL=1;COUNT=3'
      }, {
        id: 2,
        resourceId: 'r1',
        startDate: '2018-05-16 13:30:55',
        endDate: '2018-05-18 12:12:13'
      }]
    });
    const project = new ProjectModel({
      eventStore,
      resourceStore: new ResourceStore({
        data: [{
          id: 'r1'
        }]
      })
    });
    await project.commitAsync();
    const event = eventStore.getById(1);
    t.ok(event.isRecurring, 'event is recurring');
    eventStore.getOccurrencesForTimeSpan(event, event.startDate, new Date(2020, 0, 1));
    t.is(eventStore.count, 2, 'event store has no new records');
    t.is(eventStore.getAt(0), event, 'event is still there');
    t.is(event.startDate, new Date(2018, 4, 16, 12, 30, 55), 'event start date is correct');
    t.is(event.endDate, new Date(2018, 4, 18, 11, 12, 13), 'event end date is correct');
    const occurrence1 = event.occurrences[0];
    t.is(occurrence1.recurringTimeSpan, event, 'occurrence #1 refers to its master event');
    t.is(occurrence1.startDate, new Date(2018, 5, 16, 12, 30, 55), 'occurrence #1 start date is correct');
    t.is(occurrence1.endDate, new Date(2018, 5, 18, 11, 12, 13), 'occurrence #1 end date is correct');
    t.ok(occurrence1.isOccurrence, 'occurrence #1 is indicated as occurrence');
    const occurrence2 = event.occurrences[1];
    t.is(occurrence2.recurringTimeSpan, event, 'occurrence #2 refers to its master event');
    t.is(occurrence2.startDate, new Date(2018, 6, 16, 12, 30, 55), 'occurrence #2 start date is correct');
    t.is(occurrence2.endDate, new Date(2018, 6, 18, 11, 12, 13), 'occurrence #2 end date is correct');
    t.ok(occurrence2.isOccurrence, 'occurrence #2 is indicated as occurrence');
  });
  t.it('generateOccurrencesForEvents YEARLY', async t => {
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        startDate: '2018-05-16 12:30:55',
        endDate: '2018-05-18 11:12:13',
        recurrenceRule: 'FREQ=YEARLY;INTERVAL=1;COUNT=3;'
      }, {
        id: 2,
        resourceId: 'r1',
        startDate: '2018-05-16 13:30:55',
        endDate: '2018-05-18 12:12:13'
      }]
    });
    const project = new ProjectModel({
      eventStore,
      resourceStore: new ResourceStore({
        data: [{
          id: 'r1'
        }]
      })
    });
    await project.commitAsync();
    const event = eventStore.getById(1);
    t.ok(event.isRecurring, 'event is recurring');
    eventStore.getOccurrencesForTimeSpan(event, event.startDate, new Date(2020, 4, 17));
    t.is(eventStore.count, 2, 'event store has no new records');
    t.is(eventStore.getAt(0), event, 'event is still there');
    t.is(event.startDate, new Date(2018, 4, 16, 12, 30, 55), 'event start date is correct');
    t.is(event.endDate, new Date(2018, 4, 18, 11, 12, 13), 'event end date is correct');
    const occurrence1 = event.occurrences[0];
    t.is(occurrence1.recurringTimeSpan, event, 'occurrence #1 refers to its master event');
    t.is(occurrence1.startDate, new Date(2019, 4, 16, 12, 30, 55), 'occurrence #1 start date is correct');
    t.is(occurrence1.endDate, new Date(2019, 4, 18, 11, 12, 13), 'occurrence #1 end date is correct');
    t.ok(occurrence1.isOccurrence, 'occurrence #1 is indicated as occurrence');
    const occurrence2 = event.occurrences[1];
    t.is(occurrence2.recurringTimeSpan, event, 'occurrence #2 refers to its master event');
    t.is(occurrence2.startDate, new Date(2020, 4, 16, 12, 30, 55), 'occurrence #2 start date is correct');
    t.is(occurrence2.endDate, new Date(2020, 4, 18, 11, 12, 13), 'occurrence #2 end date is correct');
    t.ok(occurrence2.isOccurrence, 'occurrence #2 is indicated as occurrence');
  });
  t.it('DAILY Record should stay not modified if fields are the same', t => {
    const event = new EventModel({
      id: 'event1',
      startDate: new Date(2018, 5, 14),
      endDate: new Date(2018, 5, 15),
      name: 'Foo'
    });
    const recurrence = new RecurrenceModel({
      id: 'recurrence1',
      event: event,
      frequency: 'DAILY',
      interval: 5
    });
    t.notOk(recurrence.modified, 'Recurrence record is not modified');
    recurrence.set({
      id: 'recurrence1',
      frequency: 'DAILY',
      interval: 5
    });
    t.notOk(recurrence.modified, 'Still recurrence record is not modified');
  });
  t.it('WEEKLY Record should stay not modified if fields are the same', t => {
    const event = new EventModel({
      id: 'event1',
      startDate: new Date(2018, 5, 14),
      endDate: new Date(2018, 5, 15),
      name: 'Foo'
    });
    const recurrence = new RecurrenceModel({
      id: 'recurrence1',
      event: event,
      frequency: 'WEEKLY',
      interval: 5,
      days: ['MO', 'WE']
    });
    t.notOk(recurrence.modified, 'Recurrence record is not modified');
    recurrence.set({
      id: 'recurrence1',
      frequency: 'WEEKLY',
      interval: 5,
      days: ['MO', 'WE']
    });
    t.notOk(recurrence.modified, 'Still recurrence record is not modified');
  });
  t.it('MONTHLY Record should stay not modified if fields are the same', t => {
    const event = new EventModel({
      id: 'event1',
      startDate: new Date(2018, 5, 14),
      endDate: new Date(2018, 5, 15),
      name: 'Foo'
    });
    const recurrence = new RecurrenceModel({
      id: 'recurrence1',
      event: event,
      frequency: 'MONTHLY',
      interval: 5,
      monthDays: [1, 2, 3]
    });
    t.notOk(recurrence.modified, 'Recurrence record is not modified');
    recurrence.set({
      id: 'recurrence1',
      frequency: 'MONTHLY',
      interval: 5,
      monthDays: [1, 2, 3]
    });
    t.notOk(recurrence.modified, 'Still recurrence record is not modified');
  });
  t.it('YEARLY Record should stay not modified if fields are the same', t => {
    const event = new EventModel({
      id: 'event1',
      startDate: new Date(2018, 5, 14),
      endDate: new Date(2018, 5, 15),
      name: 'Foo'
    });
    const recurrence = new RecurrenceModel({
      id: 'recurrence1',
      event: event,
      frequency: 'YEARLY',
      interval: 5,
      months: [5, 6, 7],
      days: ['TU'],
      positions: [2]
    });
    t.notOk(recurrence.modified, 'Recurrence record is not modified');
    recurrence.set({
      id: 'recurrence1',
      frequency: 'YEARLY',
      interval: 5,
      months: [5, 6, 7],
      days: ['TU'],
      positions: [2]
    });
    t.notOk(recurrence.modified, 'Still recurrence record is not modified');
  }); //region Sanitize

  t.it('MONTHLY Record should not lose days info if the day matches event start date', t => {
    const event = new EventModel({
      id: 'event1',
      startDate: new Date(2018, 5, 14),
      // TH
      endDate: new Date(2018, 5, 15),
      // FR
      name: 'Foo'
    });
    const recurrence = new RecurrenceModel({
      id: 'recurrence1',
      event: event,
      frequency: 'MONTHLY',
      interval: 5,
      days: ['TH'],
      // Day matches event start date
      positions: [2]
    });
    t.notOk(recurrence.modified, 'Recurrence record is not modified');
    recurrence.set({
      id: 'recurrence1',
      frequency: 'MONTHLY',
      interval: 5,
      days: ['TH'],
      // Day matches event start date
      positions: [2]
    });
    t.notOk(recurrence.modified, 'Still recurrence record is not modified');
  });
  t.it('YEARLY Record should not lose days info if the day matches event start date', t => {
    const event = new EventModel({
      id: 'event1',
      startDate: new Date(2018, 5, 14),
      // TH
      endDate: new Date(2018, 5, 15),
      // FR
      name: 'Foo'
    });
    const recurrence = new RecurrenceModel({
      id: 'recurrence1',
      event: event,
      frequency: 'YEARLY',
      interval: 5,
      months: [5, 6, 7],
      days: ['TH'],
      // Day matches event start date
      positions: [2]
    });
    t.notOk(recurrence.modified, 'Recurrence record is not modified');
    recurrence.set({
      id: 'recurrence1',
      frequency: 'YEARLY',
      interval: 5,
      months: [5, 6, 7],
      days: ['TH'],
      // Day matches event start date
      positions: [2]
    });
    t.notOk(recurrence.modified, 'Still recurrence record is not modified');
  }); //endregion Sanitize

  t.it('Overridden startDate and endDate field definitions', async t => {
    class EventClass extends EventModel {
      static get fields() {
        return [{
          name: 'startDate',
          dataSource: 'EventDate',
          type: 'date'
        }, {
          name: 'endDate',
          dataSource: 'EndDate',
          type: 'date'
        }];
      }

    }

    const eventStore = new EventStore({
      modelClass: EventClass,
      data: [{
        id: 1,
        resourceId: 'r1',
        EventDate: '2018-05-16 12:30:55',
        EndDate: '2018-05-18 11:12:13',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2;COUNT=3'
      }]
    });
    const project = new ProjectModel({
      eventStore,
      resourceStore: new ResourceStore({
        data: [{
          id: 'r1'
        }]
      })
    });
    await project.commitAsync();
    const event = eventStore.first;
    t.ok(event.isRecurring, 'event is recurring');
    eventStore.getOccurrencesForTimeSpan(event, event.startDate, new Date(2020, 0, 1));
    t.is(eventStore.count, 1, 'event store has new records');
    t.is(eventStore.getAt(0), event, 'event is still there');
    t.is(event.startDate, new Date(2018, 4, 16, 12, 30, 55), 'event start date is correct');
    t.is(event.endDate, new Date(2018, 4, 18, 11, 12, 13), 'event end date is correct');
    const occurrence1 = event.occurrences[0];
    t.is(occurrence1.recurringTimeSpan, event, 'occurrence #1 refers to its master event');
    t.is(occurrence1.startDate, new Date(2018, 4, 18, 12, 30, 55), 'occurrence #1 start date is correct');
    t.is(occurrence1.endDate, new Date(2018, 4, 20, 11, 12, 13), 'occurrence #1 end date is correct');
    t.ok(occurrence1.isOccurrence, 'occurrence #1 is indicated as occurrence');
    const occurrence2 = event.occurrences[1];
    t.is(occurrence2.recurringTimeSpan, event, 'occurrence #2 refers to its master event');
    t.is(occurrence2.startDate, new Date(2018, 4, 20, 12, 30, 55), 'occurrence #2 start date is correct');
    t.is(occurrence2.endDate, new Date(2018, 4, 22, 11, 12, 13), 'occurrence #2 end date is correct');
    t.ok(occurrence2.isOccurrence, 'occurrence #2 is indicated as occurrence');
  });
  t.it('getEvents date range is mandatory if occurrences are required', async t => {
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        startDate: '2018-05-16 12:30:55',
        endDate: '2018-05-18 11:12:13',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2;COUNT=3'
      }]
    });
    const project = new ProjectModel({
      eventStore,
      resourceStore: new ResourceStore({
        data: [{
          id: 'r1'
        }]
      })
    });
    await project.commitAsync();
    const event = eventStore.first;
    t.ok(event.isRecurring, 'event is recurring');
    t.throwsOk(() => {
      eventStore.getEvents({
        resourceRecord: event.resource
      });
    }, 'getEvents MUST be passed startDate and endDate if recurring occurrences are requested', 'Error correctly thrown if no date range passed');
  });
});