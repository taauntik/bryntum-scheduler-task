"use strict";

StartTest(t => {
  const mode = t.project.getScriptDescriptor(t).url.includes('vertical') ? 'vertical' : 'horizontal';
  let scheduler1, scheduler2;
  t.beforeEach(() => Base.destroy(scheduler1, scheduler2));

  function occurrence(event, index) {
    return event.occurrences[index];
  }

  async function getScheduler(config) {
    const scheduler = await t.getSchedulerAsync(Object.assign({
      enableRecurringEvents: true,
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 17),
      height: mode === 'horizontal' ? 300 : 700,
      mode
    }, config));
    return scheduler;
  }

  t.it('Does not generate events after the recurrence rule\'s COUNT has been reached', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Only twice!',
        startDate: '2020-01-06',
        endDate: '2020-01-08',
        recurrenceRule: 'FREQ=WEEKLY;COUNT=2'
      }]
    });
    scheduler1 = await getScheduler({
      resourceStore,
      eventStore,
      startDate: '2020-01-13',
      endDate: '2020-01-31'
    });
    const recurringEvent = eventStore.first; // It should occur on its own startDate, the 6th

    let events = eventStore.getEvents({
      startDate: new Date(2020, 0, 6),
      endDate: new Date(2020, 0, 7)
    });
    t.is(events.length, 1);
    t.is(events[0], recurringEvent, 'event occurs on its startDate'); // And the date it extends into, the 7th

    events = eventStore.getEvents({
      startDate: new Date(2020, 0, 7),
      endDate: new Date(2020, 0, 8)
    });
    t.is(events.length, 1);
    t.is(events[0], recurringEvent, 'event occurs on its startDate'); // There should be an occurrence on the 13th

    events = eventStore.getEvents({
      startDate: new Date(2020, 0, 13),
      endDate: new Date(2020, 0, 14)
    });
    t.is(events.length, 1);
    t.is(events[0], recurringEvent.occurrences[0], 'event recurs the following week'); // And the 14th

    events = eventStore.getEvents({
      startDate: new Date(2020, 0, 14),
      endDate: new Date(2020, 0, 15)
    });
    t.is(events.length, 1);
    t.is(events[0], recurringEvent.occurrences[0], 'event recurs the following week');
    events = eventStore.getEvents({
      startDate: new Date(2020, 0, 20),
      endDate: new Date(2020, 0, 21)
    }); // We're past the last occurrence which was on the 13th
    // So no occurrences

    t.is(events.length, 0, 'No occurrences after the second week');
    events = eventStore.getEvents({
      startDate: new Date(2020, 0, 21),
      endDate: new Date(2020, 0, 22)
    }); // We're past the last occurrence which was on the 13th
    // So no occurrences

    t.is(events.length, 0, 'No occurrences after the second week');
    events = eventStore.getEvents({
      startDate: new Date(2020, 0, 27),
      endDate: new Date(2020, 0, 28)
    }); // We're past the last occurrence which was on the 13th
    // So no occurrences

    t.is(events.length, 0, 'No occurrences after the second week');
    events = eventStore.getEvents({
      startDate: new Date(2020, 0, 28),
      endDate: new Date(2020, 0, 29)
    }); // We're past the last occurrence which was on the 13th
    // So no occurrences

    t.is(events.length, 0, 'No occurrences after the second week');
  });
  t.it('Generates occurrences for recurring events', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Foo',
        startDate: '2018-06-14',
        endDate: '2018-06-15'
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'Bar',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1'
      }, {
        id: 3,
        resourceId: 'r1',
        name: 'Baz',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2'
      }]
    });
    const [event1, event2, event3] = eventStore.records;
    t.isntCalled('add', eventStore, 'occurrences are not added');
    scheduler1 = await getScheduler({
      resourceStore,
      eventStore
    });
    scheduler2 = await getScheduler({
      resourceStore,
      eventStore
    });
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.notOk(event2.occurrences.length, 'event 2 has no occurrences');
    t.is(event3.occurrences.length, 1, 'event 3 has 1 occurrence');
    t.hasCls(scheduler1.getElementsFromEventRecord(event3)[0], 'b-recurring', 'scheduler 1: event 3 element is marked with proper CSS class');
    t.hasCls(scheduler2.getElementsFromEventRecord(event3)[0], 'b-recurring', 'scheduler 2: event 3 element is marked with proper CSS class');
    const occurrence = event3.occurrences[0];
    t.is(occurrence.startDate, new Date(2018, 5, 16), 'occurrence start date is correct');
    t.is(occurrence.endDate, new Date(2018, 5, 17), 'occurrence end date is correct');
    t.is(occurrence.recurringTimeSpan, event3, 'occurrence references to event 3');
    t.hasCls(scheduler1.getElementsFromEventRecord(occurrence)[0], 'b-occurrence', 'scheduler 1: occurrence element is marked with proper CSS class');
    t.hasCls(scheduler2.getElementsFromEventRecord(occurrence)[0], 'b-occurrence', 'scheduler 2: occurrence element is marked with proper CSS class');
  });
  t.it('Doesn\'t generates occurrences if enableRecurringEvents===false', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Foo',
        startDate: '2018-06-14',
        endDate: '2018-06-15'
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'Bar',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1'
      }, {
        id: 3,
        resourceId: 'r1',
        name: 'Baz',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2'
      }]
    });
    const [event1, event2, event3] = eventStore;
    scheduler1 = await getScheduler({
      enableRecurringEvents: false,
      resourceStore,
      eventStore
    });
    scheduler2 = await getScheduler({
      enableRecurringEvents: false,
      resourceStore,
      eventStore
    });
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.notOk(event2.occurrences.length, 'event 2 has no occurrences');
    t.notOk(event3.occurrences.length, 'event 3 has no occurrences');
  });
  t.it('Generates occurrences for recurring multi-assigned events', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }, {
        id: 'r2'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        name: 'Foo',
        startDate: '2018-06-14',
        endDate: '2018-06-15'
      }, {
        id: 2,
        name: 'Bar',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1'
      }, {
        id: 3,
        name: 'Baz',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2'
      }]
    });
    const assignmentStore = new AssignmentStore({
      data: [{
        id: 1,
        eventId: 1,
        resourceId: 'r1'
      }, {
        id: 2,
        eventId: 2,
        resourceId: 'r1'
      }, {
        id: 3,
        eventId: 3,
        resourceId: 'r1'
      }, {
        id: 4,
        eventId: 1,
        resourceId: 'r2'
      }, {
        id: 5,
        eventId: 2,
        resourceId: 'r2'
      }, {
        id: 6,
        eventId: 3,
        resourceId: 'r2'
      }]
    });
    scheduler1 = await getScheduler({
      assignmentStore,
      resourceStore,
      eventStore
    });
    t.selectorCountIs('.b-sch-event:textEquals(Baz)', 4, 'Baz Multi-assigned + recurring');
    t.selectorCountIs('.b-sch-event:textEquals(Bar)', 2, 'Bar Multi-assigned');
    t.selectorCountIs('.b-sch-event:textEquals(Foo)', 2, 'Foo Multi-assigned');
  });
  t.it('Generate occurrences on timespan change', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Foo',
        startDate: '2018-06-14',
        endDate: '2018-06-15'
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'Bar',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1'
      }, {
        id: 3,
        resourceId: 'r1',
        name: 'Baz',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2'
      }]
    });
    const [event1, event2, event3] = eventStore;
    scheduler1 = await getScheduler({
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 18),
      resourceStore,
      eventStore
    });
    scheduler2 = await getScheduler({
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 18),
      resourceStore,
      eventStore
    }); // move to the next week

    scheduler1.shiftNext(7);
    await scheduler1.project.commitAsync();
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
    t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrence');
    t.is(occurrence(event2, 0).startDate, new Date(2018, 5, 21), 'event 2 1st occurrence start date is correct');
    t.is(occurrence(event2, 0).endDate, new Date(2018, 5, 22), 'event 2 1st occurrence end date is correct');
    t.is(occurrence(event2, 0).recurringTimeSpan, event2, 'event 2 1st occurrence references to event 2');
    t.is(occurrence(event3, 0).startDate, new Date(2018, 5, 16), 'event 3 1st occurrence start date is correct');
    t.is(occurrence(event3, 0).endDate, new Date(2018, 5, 17), 'event 3 1st occurrence end date is correct');
    t.is(occurrence(event3, 0).recurringTimeSpan, event3, 'event 3 1st occurrence references to event 3');
    t.is(occurrence(event3, 1).startDate, new Date(2018, 5, 18), 'event 3 2nd occurrence start date is correct');
    t.is(occurrence(event3, 1).endDate, new Date(2018, 5, 19), 'event 3 2nd occurrence end date is correct');
    t.is(occurrence(event3, 1).recurringTimeSpan, event3, 'event 3 2nd occurrence references to event 3');
    t.is(occurrence(event3, 2).startDate, new Date(2018, 5, 20), 'event 3 3rd occurrence start date is correct');
    t.is(occurrence(event3, 2).endDate, new Date(2018, 5, 21), 'event 3 3rd occurrence end date is correct');
    t.is(occurrence(event3, 2).recurringTimeSpan, event3, 'event 3 3rd occurrence references to event 3');
    t.is(occurrence(event3, 3).startDate, new Date(2018, 5, 22), 'event 3 4th occurrence start date is correct');
    t.is(occurrence(event3, 3).endDate, new Date(2018, 5, 23), 'event 3 4th occurrence end date is correct');
    t.is(occurrence(event3, 3).recurringTimeSpan, event3, 'event 3 4th occurrence references to event 3');
    t.is(occurrence(event3, 4).startDate, new Date(2018, 5, 24), 'event 3 5th occurrence start date is correct');
    t.is(occurrence(event3, 4).endDate, new Date(2018, 5, 25), 'event 3 5th occurrence end date is correct');
    t.is(occurrence(event3, 4).recurringTimeSpan, event3, 'event 3 5th occurrence references to event 3');
  });
  t.it('Adds occurrences on event add', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Foo',
        startDate: '2018-06-14',
        endDate: '2018-06-15'
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'Bar',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1'
      }, {
        id: 3,
        resourceId: 'r1',
        name: 'Baz',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2'
      }]
    });
    const [event1, event2, event3] = eventStore;
    t.isCalledOnce('add', eventStore, 'Only 1 event will be added');
    scheduler1 = await getScheduler({
      id: 'scheduler1',
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 18),
      resourceStore,
      eventStore
    });
    scheduler2 = await getScheduler({
      id: 'scheduler2',
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 18),
      resourceStore,
      eventStore
    });
    eventStore.add({
      id: 4,
      resourceId: 'r1',
      name: 'Neo',
      startDate: '2018-06-14 08:00:00',
      endDate: '2018-06-15',
      recurrenceRule: 'FREQ=DAILY;INTERVAL=2'
    });
    await t.waitForProjectReady();
    t.is(eventStore.count, 4, 'store has correct number of records');
    t.selectorCountIs('.b-sch-event-wrap', 12, 'Correct number of event bars');
    const event4 = eventStore.getById(4);
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.notOk(event2.occurrences.length, 'event 2 has no occurrences');
    t.is(event3.occurrences.length, 2, 'event 3 has 2 occurrences');
    t.is(event4.occurrences.length, 1, 'event 4 has 1 occurrence');
    t.is(occurrence(event3, 0).startDate, new Date(2018, 5, 16), 'event 3 1st occurrence start date is correct');
    t.is(occurrence(event3, 0).endDate, new Date(2018, 5, 17), 'event 3 1st occurrence end date is correct');
    t.is(occurrence(event3, 0).recurringTimeSpan, event3, 'event 3 1st occurrence references to event 3');
    t.is(occurrence(event3, 1).startDate, new Date(2018, 5, 18), 'event 3 2nd occurrence start date is correct');
    t.is(occurrence(event3, 1).endDate, new Date(2018, 5, 19), 'event 3 2nd occurrence end date is correct');
    t.is(occurrence(event3, 1).recurringTimeSpan, event3, 'event 3 2nd occurrence references to event 3');
    t.is(occurrence(event4, 0).startDate, new Date(2018, 5, 16, 8), 'event 4 1st occurrence start date is correct');
    t.is(occurrence(event4, 0).endDate, new Date(2018, 5, 17), 'event 4 1st occurrence end date is correct');
    t.is(occurrence(event4, 0).recurringTimeSpan, event4, 'event 4 1st occurrence references to event 4');
  });
  t.it('Removes occurrences on event remove', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Foo',
        startDate: '2018-06-14',
        endDate: '2018-06-15'
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'Bar',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1'
      }, {
        id: 3,
        resourceId: 'r1',
        name: 'Baz',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2'
      }]
    });
    const [event1, event2, event3] = eventStore;
    t.isntCalled('add', eventStore, 'occurrences are not added');
    t.isCalledNTimes('remove', eventStore, 1, '1 event is removed');
    scheduler1 = await getScheduler({
      resourceStore,
      eventStore,
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 25)
    });
    scheduler2 = await getScheduler({
      resourceStore,
      eventStore,
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 25)
    });
    t.is(eventStore.count, 3, 'store has correct number of records');
    t.selectorCountIs('.b-sch-event-wrap', 12, 'Correct number of event bars');
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
    t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrence');
    eventStore.remove(event3);
    await t.waitForProjectReady();
    t.is(eventStore.count, 2, 'store got correct number of records');
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
  });
  t.it('Updates occurrences on event update', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Foo',
        startDate: '2018-06-14',
        endDate: '2018-06-15'
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'Bar',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1'
      }, {
        id: 3,
        resourceId: 'r1',
        name: 'Baz',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2'
      }]
    });
    const [event1, event2, event3] = eventStore;
    t.firesOk({
      observable: eventStore,
      events: {
        add: 0,
        remove: 0,
        // there are 2 update events:
        // 1. setting name
        // 2. first setStartDate which starts async commit
        // No events for changes to occurrences
        update: 2
      }
    });
    scheduler1 = await getScheduler({
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 25),
      resourceStore,
      eventStore
    });
    scheduler2 = await getScheduler({
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 25),
      resourceStore,
      eventStore
    });
    event3.setStartDate(new Date(2018, 5, 14, 13), false);
    event3.name = 'zaB';
    await scheduler1.project.commitAsync();
    t.is(eventStore.count, 3, 'store has correct number of records');
    t.selectorCountIs(scheduler1.unreleasedEventSelector, 10, 'Correct number of event bars');
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
    t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrence');
    t.is(occurrence(event3, 0).startDate, new Date(2018, 5, 16, 13), 'event 3 1st occurrence start date is correct');
    t.is(occurrence(event3, 0).endDate, new Date(2018, 5, 17), 'event 3 1st occurrence end date is correct');
    t.is(occurrence(event3, 0).recurringTimeSpan, event3, 'event 3 1st occurrence references to event 3');
    t.is(occurrence(event3, 0).name, 'zaB', 'event 3 1st occurrence name is correct');
    t.is(occurrence(event3, 1).startDate, new Date(2018, 5, 18, 13), 'event 3 2nd occurrence start date is correct');
    t.is(occurrence(event3, 1).endDate, new Date(2018, 5, 19), 'event 3 2nd occurrence end date is correct');
    t.is(occurrence(event3, 1).recurringTimeSpan, event3, 'event 3 2nd occurrence references to event 3');
    t.is(occurrence(event3, 1).name, 'zaB', 'event 3 2nd occurrence name is correct');
    t.is(occurrence(event3, 2).startDate, new Date(2018, 5, 20, 13), 'event 3 3rd occurrence start date is correct');
    t.is(occurrence(event3, 2).endDate, new Date(2018, 5, 21), 'event 3 3rd occurrence end date is correct');
    t.is(occurrence(event3, 2).recurringTimeSpan, event3, 'event 3 3rd occurrence references to event 3');
    t.is(occurrence(event3, 2).name, 'zaB', 'event 3 3rd occurrence name is correct');
    t.is(occurrence(event3, 3).startDate, new Date(2018, 5, 22, 13), 'event 3 4th occurrence start date is correct');
    t.is(occurrence(event3, 3).endDate, new Date(2018, 5, 23), 'event 3 4th occurrence end date is correct');
    t.is(occurrence(event3, 3).recurringTimeSpan, event3, 'event 3 4th occurrence references to event 3');
    t.is(occurrence(event3, 3).name, 'zaB', 'event 3 4th occurrence name is correct');
    t.is(occurrence(event3, 4).startDate, new Date(2018, 5, 24, 13), 'event 3 5th occurrence start date is correct');
    t.is(occurrence(event3, 4).endDate, new Date(2018, 5, 25), 'event 3 5th occurrence end date is correct');
    t.is(occurrence(event3, 4).recurringTimeSpan, event3, 'event 3 5th occurrence references to event 3');
    t.is(occurrence(event3, 4).name, 'zaB', 'event 3 5th occurrence name is correct');
  });
  t.it('Repeating events a persistable but their occurrences are not', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Foo',
        startDate: '2018-06-14',
        endDate: '2018-06-15'
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'Bar',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1'
      }, {
        id: 3,
        resourceId: 'r1',
        name: 'Baz',
        startDate: '2018-06-14',
        endDate: '2018-06-15',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2'
      }]
    });
    const [event1, event2, event3] = eventStore;
    scheduler1 = await getScheduler({
      resourceStore,
      eventStore,
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 25)
    });
    scheduler2 = await getScheduler({
      resourceStore,
      eventStore,
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 25)
    });
    t.is(eventStore.count, 3, 'store has correct number of records');
    t.selectorCountIs('.b-sch-event-wrap', 12, 'Correct number of event bars');
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
    t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrence');
    t.ok(event1.isPersistable, 'event 1 is persistable');
    t.ok(event2.isPersistable, 'event 2 is persistable');
    t.ok(event3.isPersistable, 'event 3 is persistable');
    t.notOk(event2.occurrences[0].isPersistable, 'event 2 occurrence is not persistable');
    event3.occurrences.forEach((occurrence, index) => t.notOk(occurrence.isPersistable, `event 3 occurrence ${index} is not persistable`));
  });
  t.it('Should be possible to disable ', async t => {
    scheduler1 = await getScheduler({
      enableRecurringEvents: false,
      eventStore: t.getEventStore({
        data: [{
          startDate: '2011-01-04 08:00',
          endDate: '2011-01-04 12:00',
          recurrenceRule: 'FREQ=DAILY'
        }]
      })
    });
    t.is(scheduler1.eventStore.count, 1, 'Only one event is visible');
  }); // https://app.assembla.com/spaces/bryntum/tickets/7431

  t.it('Recurring event occurrences are generated once even if event and timespan are changed in the process of generating', async t => {
    const eventStore = new EventStore();
    scheduler1 = await getScheduler({
      eventStore: eventStore,
      resourceStore: new ResourceStore({
        data: [{
          id: 'r1',
          name: 'Resource 1'
        }]
      }),
      startDate: new Date(2018, 5, 11),
      endDate: new Date(2018, 5, 18)
    });
    const event = eventStore.add({
      id: 1,
      resourceId: 'r1',
      name: 'Foo',
      startDate: '2018-06-14',
      endDate: '2018-06-15',
      recurrenceRule: 'FREQ=DAILY;INTERVAL=2;COUNT=2'
    })[0];
    event.name = 'Bar';
    scheduler1.setTimeSpan(new Date(2018, 5, 12), new Date(2018, 5, 19));
    await t.waitForProjectReady();
    t.is(eventStore.getById(1).occurrences.length, 1, 'Event has proper number of occurrences');
  });
  t.it('Generates occurrences for future occurrences of new recurring event', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Bar',
        startDate: '2018-06-06T09:00:00',
        endDate: '2018-06-06T10:00:00',
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU,TH'
      }]
    });
    const event1 = eventStore.getById(1);
    scheduler1 = await getScheduler({
      resourceStore,
      eventStore,
      startDate: new Date(2018, 5, 1),
      endDate: new Date(2018, 6, 1),
      viewPreset: 'weekAndDayLetter',
      fillTicks: true
    }); // Due to engine rescheduling activity, occurrences will be uncached.
    // refresh the Scheduler's view of occurrences to make them available.

    event1.getOccurrencesForDateRange(scheduler1.timeAxis.startDate, scheduler1.timeAxis.endDate);
    t.is(eventStore.count, 1, 'Only one event in store');
    t.is(event1.occurrences.length, 6, 'event 1 has 6 occurrences');
    const newBase = event1.occurrences[2]; // Promote Tues 19th June's occurrence to be a new base of wednesday and thursday occurrences

    newBase.set('recurrenceRule', 'FREQ=WEEKLY;BYDAY=WE,TH');
    await t.waitForProjectReady();
    t.is(eventStore.count, 2, 'Two events in store');
    t.is(event1.occurrences.length, 2, 'event 1 has 2 occurrences');
    t.is(event1.occurrences[0].startDate, new Date(2018, 5, 12, 9));
    t.is(event1.occurrences[1].startDate, new Date(2018, 5, 14, 9));
    t.is(newBase.occurrences.length, 3, 'New recurring base has 3 occurrences');
    t.is(newBase.occurrences[0].startDate, new Date(2018, 5, 21, 9));
    t.is(newBase.occurrences[1].startDate, new Date(2018, 5, 27, 9));
    t.is(newBase.occurrences[2].startDate, new Date(2018, 5, 28, 9));
  });
  t.it('Generates correct number of occurrences from COUNT on new recurring event', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Bar',
        startDate: '2018-06-06T09:00:00',
        endDate: '2018-06-06T10:00:00',
        recurrenceRule: 'FREQ=DAILY;COUNT=3'
      }]
    });
    const event1 = eventStore.getById(1);
    scheduler1 = await getScheduler({
      resourceStore,
      eventStore,
      startDate: new Date(2018, 5, 1),
      endDate: new Date(2018, 6, 1),
      viewPreset: 'weekAndDayLetter',
      fillTicks: true
    }); // Due to engine rescheduling activity, occurrences will be uncached.
    // refresh the Scheduler's view of occurrences to make them available.

    event1.getOccurrencesForDateRange(scheduler1.timeAxis.startDate, scheduler1.timeAxis.endDate);
    t.is(eventStore.count, 1, 'Only one event in store');
    t.is(event1.occurrences.length, 2, 'event has 2 occurrences');
    t.is(event1.occurrences[0].startDate, new Date(2018, 5, 7, 9));
    t.is(event1.occurrences[1].startDate, new Date(2018, 5, 8, 9));
  });
  t.it('Generates occurrences for events which are promoted to be recurring', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Foo',
        startDate: '2018-06-11',
        endDate: '2018-06-12'
      }]
    });
    const [event1] = eventStore.records;
    t.isntCalled('add', eventStore, 'occurrences are not added');
    scheduler1 = await getScheduler({
      resourceStore,
      eventStore
    });
    t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
    t.hasNotCls(scheduler1.getElementsFromEventRecord(event1)[0], 'b-recurring', 'Event 1 element has not got recurring CSS class');
    event1.recurrenceRule = 'FREQ=DAILY;INTERVAL=2';
    t.ok(eventStore.recurringEvents.has(event1), 'Newly recurring event is in recurringEvents cache');
    t.hasCls(scheduler1.getElementsFromEventRecord(event1)[0], 'b-recurring', 'Event 1 element has got recurring CSS class');
    t.is(event1.occurrences.length, 3, 'event 1 has 3 occurrences');
  });
  t.it('Clears occurrences for events which are demoted from recurring to singular', async t => {
    const resourceStore = new ResourceStore({
      data: [{
        id: 'r1'
      }]
    });
    const eventStore = new EventStore({
      data: [{
        id: 1,
        resourceId: 'r1',
        name: 'Foo',
        startDate: '2018-06-11',
        endDate: '2018-06-12',
        recurrenceRule: 'FREQ=DAILY;INTERVAL=2'
      }]
    });
    const [event1] = eventStore.records;
    t.isntCalled('add', eventStore, 'occurrences are not added');
    scheduler1 = await getScheduler({
      resourceStore,
      eventStore
    });
    t.ok(eventStore.recurringEvents.has(event1), 'Recurring event is in recurringEvents cache');
    t.hasCls(scheduler1.getElementsFromEventRecord(event1)[0], 'b-recurring', 'Event 1 element has got recurring CSS class');
    t.chain({
      waitFor: () => event1.occurrences.length === 3
    }, next => {
      t.is(event1.occurrences.length, 3, 'event 1 has 3 occurrences');
      event1.recurrenceRule = '';
      next();
    }, {
      waitFor: () => event1.occurrences.length === 0
    }, () => {
      t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
      t.notOk(eventStore.recurringEvents.has(event1), 'Newly singular event is not in recurringEvents cache');
      t.hasNotCls(scheduler1.getElementsFromEventRecord(event1)[0], 'b-recurring', 'Event 1 element has not got recurring CSS class');
    });
  }); // https://github.com/bryntum/support/issues/1570

  t.it('Draws recurring events on scroll', async t => {
    scheduler1 = await getScheduler({
      rowHeight: 70,
      minHeight: '20em',
      events: [],
      startDate: new Date(2018, 0, 1),
      endDate: new Date(2018, 4, 1),
      viewPreset: 'weekAndDayLetter'
    }); // Bug happens when data is applied after initial propagate

    scheduler1.resourceStore.data = ArrayHelper.populate(10, i => ({
      id: i + 1
    }));
    scheduler1.eventStore.data = [{
      id: 1,
      name: 'Annual meeting',
      startDate: '2018-01-16',
      endDate: '2018-01-30',
      recurrenceRule: 'FREQ=YEARLY'
    }];
    scheduler1.assignmentStore.data = [{
      eventId: 1,
      resourceId: 4
    }];
    await scheduler1.project.commitAsync();
    scheduler1.scrollTop = 100;
    await t.waitForAnimationFrame();
    t.selectorExists(scheduler1.unreleasedEventSelector, 'Event drawn');
  }); // https://github.com/bryntum/support/issues/3798

  t.it('Should refresh event after resizing + cancelling an occurrence', async t => {
    scheduler1 = await getScheduler({
      rowHeight: 70,
      minHeight: '20em',
      events: [],
      tickSize: 20,
      startDate: new Date(2018, 0, 1),
      endDate: new Date(2018, 4, 1),
      viewPreset: 'weekAndDayLetter'
    });
    scheduler1.resourceStore.data = ArrayHelper.populate(10, i => ({
      id: i + 1
    }));
    scheduler1.eventStore.data = [{
      id: 1,
      name: 'Annual meeting',
      startDate: '2018-01-16',
      endDate: '2018-01-18',
      recurrenceRule: 'FREQ=WEEKLY'
    }];
    scheduler1.assignmentStore.data = [{
      eventId: 1,
      resourceId: 4
    }];
    await t.waitForSelector('.b-sch-event.b-occurrence');
    const originalWidth = t.rect('.b-sch-event.b-occurrence').width;
    await t.dragBy({
      source: '.b-sch-event.b-occurrence',
      offset: ['100%-5', '50%'],
      delta: [100, 0]
    });
    await t.click('button:contains(Cancel)');
    await t.waitFor(() => t.rect('.b-sch-event.b-occurrence').width === originalWidth);
    t.is(t.rect('.b-sch-event.b-occurrence').width, originalWidth, 'Event refreshed');
  });
});