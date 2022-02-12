import { DateHelper, ObjectHelper, DayTime, Model, EventStore, ResourceStore, AssignmentStore, EventModel, ProjectModel } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let project;

    t.beforeEach(t => {
        project?.destroy();
        project = null;
    });

    t.it('Basic instantiation', t => {
        let store = new EventStore({
            data : [{}]
        });

        t.isInstanceOf(store.first, EventModel, 'Store should be configured with EventModel');

        class Event2 extends EventModel {
        }

        store = new EventStore({
            modelClass : Event2,
            data       : [{}]
        });

        t.isInstanceOf(store.first, EventModel, 'Should be ok to subclass EventModel');

        t.throwsOk(() => {
            new EventStore({
                modelClass : class Event3 extends Model {
                }
            });
        }, 'The model for the EventStore must subclass EventModel');
    });

    t.it('isInterDay determination', t => {
        const store = new EventStore({
            data : [{
                id        : 1,                      // interDay: midnight to midnight
                startDate : '2020-01-01',
                endDate   : '2020-01-02'
            }, {
                id        : 2,
                startDate : '2020-01-01T23:59:59',  // Only 2 seconds, but spans midnight: interDay
                endDate   : '2020-01-02T00:00:01'
            }, {
                id        : 3,
                startDate : '2020-01-01',           // interDay by one second
                endDate   : '2020-01-02T00:00:01'
            }, {
                id        : 4,
                startDate : '2020-01-01T00:00:01',  // Not interday, ends at midnight
                endDate   : '2020-01-02T00:00:00'
            }, {
                id        : 5,
                startDate : '2020-01-01T20:00:00',  // Not interday, ends at midnight
                endDate   : '2020-01-02T00:00:00'
            }]
        });

        t.ok(store.records[0].isInterDay, 'midnight to midnight event is interDay');
        t.ok(store.records[1].isInterDay, 'Two second event is interDay');
        t.ok(store.records[2].isInterDay, 'interDay by one second event is interDay');
        t.notOk(store.records[3].isInterDay, 'Event which starts at 00:00:01 is not interDay');
        t.notOk(store.records[4].isInterDay, 'Event which starts at 20:00:00 is not interDay');
    });

    t.it('Does not generate events after the recurrence rule\'s COUNT has been reached', async t => {
        const resourceStore = new ResourceStore({
            data : [{ id : 'r1' }]
        });

        const eventStore = new EventStore({
            data : [
                {
                    id             : 1,
                    resourceId     : 'r1',
                    name           : 'Only twice!',
                    startDate      : '2020-01-01',
                    endDate        : '2020-01-03',
                    recurrenceRule : 'FREQ=WEEKLY;BYDAY=MO;COUNT=2'
                }
            ]
        });

        project = new ProjectModel({
            eventStore,
            resourceStore
        });

        await project.commitAsync();

        const recurringEvent = eventStore.first;

        // It should occur on its own startDate, the 6th
        let events = eventStore.getEvents({
            startDate : new Date(2020, 0, 6),
            endDate   : new Date(2020, 0, 7)
        });
        t.is(events.length, 1);
        t.is(events[0], recurringEvent, 'event occurs on its startDate');

        // And the date it extends into, the 7th
        events = eventStore.getEvents({
            startDate : new Date(2020, 0, 7),
            endDate   : new Date(2020, 0, 8)
        });
        t.is(events.length, 1);
        t.is(events[0], recurringEvent, 'event occurs on its startDate');

        // There should be an occurrence on the 13th
        events = eventStore.getEvents({
            startDate : new Date(2020, 0, 13),
            endDate   : new Date(2020, 0, 14)
        });
        t.is(events.length, 1);
        t.is(events[0], recurringEvent.occurrences[0], 'event recurs the following week');

        // And the 14th
        events = eventStore.getEvents({
            startDate : new Date(2020, 0, 14),
            endDate   : new Date(2020, 0, 15)
        });
        t.is(events.length, 1);
        t.is(events[0], recurringEvent.occurrences[0], 'event recurs the following week');

        events = eventStore.getEvents({
            startDate : new Date(2020, 0, 20),
            endDate   : new Date(2020, 0, 21)
        });

        // That should have corrected the event
        t.is(recurringEvent.startDate, new Date(2020, 0, 6), 'Event start has been adjusted to align with its rule');
        t.is(recurringEvent.endDate, new Date(2020, 0, 8), 'Event end has been adjusted to align with its rule');

        // We're past the last occurrence which was on the 13th
        // So no occurrences
        t.is(events.length, 0, 'No occurrences after the second week');

        events = eventStore.getEvents({
            startDate : new Date(2020, 0, 21),
            endDate   : new Date(2020, 0, 22)
        });

        // We're past the last occurrence which was on the 13th
        // So no occurrences
        t.is(events.length, 0, 'No occurrences after the second week');

        events = eventStore.getEvents({
            startDate : new Date(2020, 0, 27),
            endDate   : new Date(2020, 0, 28)
        });

        // We're past the last occurrence which was on the 13th
        // So no occurrences
        t.is(events.length, 0, 'No occurrences after the second week');

        events = eventStore.getEvents({
            startDate : new Date(2020, 0, 28),
            endDate   : new Date(2020, 0, 29)
        });

        // We're past the last occurrence which was on the 13th
        // So no occurrences
        t.is(events.length, 0, 'No occurrences after the second week');
    });

    t.it('EventStore data assignment', async t => {
        const data = [
            { id : 1, resourceId : 'c2', name : 'Derp', startDate : '2020-05-20', endDate : '2020-05-21' }
        ];

        const store = new EventStore({
            data : ObjectHelper.clone(data)
        });

        const rs = new ResourceStore();

        project = new ProjectModel({
            eventStore    : store,
            resourceStore : rs
        });

        await project.commitAsync();

        const events1 = store.getEvents({
            startDate : new Date(2020, 4, 19),
            endDate   : new Date(2020, 4, 22)
        });

        t.is(events1.length, 1, 'Correct number of events');

        store.data = data;

        const events2 = store.getEvents({
            startDate : new Date(2020, 4, 19),
            endDate   : new Date(2020, 4, 22)
        });

        t.is(events2.length, 1, 'Correct number of events');
    });

    t.it('getEvents + getTotalTimeSpan', async t => {
        const store = new EventStore({
            data : [
                { id : 1, resourceId : 'c2', name : 'Linda', startDate : '2010-12-09', endDate : '2010-12-13' }
            ]
        });

        const rs = new ResourceStore();

        project = new ProjectModel({
            eventStore    : store,
            resourceStore : rs
        });

        await project.commitAsync();

        t.is(store.resourceStore, rs, 'Should find resourceStore set on the eventStore');

        t.is(store.getEvents({
            startDate : new Date(2010, 11, 9),
            endDate   : new Date(2010, 11, 13)
        }).length, 1, 'getEventsInTimeSpan');

        t.is(store.getEvents({
            startDate    : new Date(2010, 11, 9),
            endDate      : new Date(2010, 11, 10),
            allowPartial : false
        }).length, 0, 'getEventsInTimeSpan partial miss');

        t.is(store.getEvents({
            startDate    : new Date(2010, 11, 9),
            endDate      : new Date(2010, 11, 13),
            allowPartial : false
        }).length, 1, 'getEventsInTimeSpan get 1');

        t.isDeeplyStrict(store.getTotalTimeSpan(), {
            startDate : new Date(2010, 11, 9),
            endDate   : new Date(2010, 11, 13)
        }, 'getTotalTimeSpan');

        store.add(new EventModel({
            startDate : new Date(2009, 1, 1)
        }));

        await project.commitAsync();

        t.isDeeplyStrict(store.getTotalTimeSpan(), {
            startDate : new Date(2009, 1, 1),
            endDate   : new Date(2010, 11, 13)
        }, 'getTotalTimeSpan 2');

        store.remove(store.first);
    });

    t.it('getTotalTimeSpan partial data', t => {
        const store = new EventStore({
            data : [
                { startDate : '2010-12-09' }
            ]
        });

        t.isDeeplyStrict(store.getTotalTimeSpan(), {
            startDate : new Date(2010, 11, 9),
            endDate   : new Date(2010, 11, 9)
        }, 'Missing end date');

        store.first.set({
            startDate : null,
            endDate   : new Date(2009, 1, 1)
        });

        t.isDeeplyStrict(store.getTotalTimeSpan(), {
            startDate : null,
            endDate   : new Date(2009, 1, 1)
        }, 'Missing start date');
    });

    t.it('getEvents startOnly', async t => {
        const
            resourceStore = new ResourceStore({
                data : [
                    { id : 1 }
                ]
            }),
            eventStore    = new EventStore({
                data : [
                    {
                        id         : 1,
                        resourceId : 1,
                        name       : 'Intersecting',
                        startDate  : '2010-12-21',
                        endDate    : '2011-01-21'
                    }, {
                        id         : 2,
                        resourceId : 1,
                        name       : 'Starting',
                        startDate  : '2011-01-02',
                        endDate    : '2011-01-02'
                    }, {
                        id             : 3,
                        resourceId     : 1,
                        name           : '2nd Occurrence is 01 to 03 Jan 2011',
                        startDate      : '2010-12-25',
                        endDate        : '2010-12-28',
                        recurrenceRule : 'FREQ=WEEKLY'
                    }
                ]
            }),
            intersecting  = eventStore.getById(1),
            starting      = eventStore.getById(2),
            recurring     = eventStore.getById(3);

        project = new ProjectModel({
            eventStore,
            // With engine, matching resources are required
            resourceStore
        });

        await t.waitForProjectReady(project);

        const r0 = eventStore.getEvents({
            startDate : new Date(2011, 0, 1),
            startOnly : false
        });
        t.isDeeply(r0, [recurring.occurrences[0], intersecting], 'allowPartial is the defalt when startOnly is not set');

        // This must not include the occurrence of the recurring event that intersects this date
        const r1 = eventStore.getEvents({
            startDate : new Date(2011, 0, 2),
            startOnly : true
        });
        t.isDeeply(r1, [starting], 'startOnly overrides the default of allowPartial');
    });

    t.it('getByInternalId + append', t => {
        const store = new EventStore({
            data : [
                { resourceId : 'c2', name : 'Linda', startDate : '2010-12-09', endDate : '2010-12-13' }
            ]
        });

        t.is(store.getById(store.first.id), store.first, 'getById with dirty id');

        store.append({ id : 2 });

        t.ok(store.getById(2), 'Found record after "append"');
    });

    t.it('Should properly report list of events assigned to resource', async t => {
        function idify(arr) {
            return arr.map(item => item.id);
        }

        const
            eventStore    = new EventStore({
                data : [
                    { id : 1, resourceId : 1, startDate : new Date(), duration : 1 }
                ]
            }),

            resourceStore = new ResourceStore({
                data : [
                    { id : 1 },
                    { id : 2 },
                    { id : 3 }
                ]
            });

        project = new ProjectModel({
            eventStore,
            // With engine, matching resources are required
            resourceStore
        });

        await t.waitForProjectReady(project);

        t.isDeeply(idify(eventStore.getEventsForResource(1)), [1]);

        eventStore.add([
            { id : 2, resourceId : 1, startDate : new Date(), duration : 1 },
            { id : 3, resourceId : 1, startDate : new Date(), duration : 1 },
            { id : 4, resourceId : 2, startDate : new Date(), duration : 1 }
        ]);

        await t.waitForProjectReady(project);

        t.isDeeplyUnordered(idify(eventStore.getEventsForResource(1)), [1, 2, 3]);
        t.isDeeplyUnordered(idify(eventStore.getEventsForResource(2)), [4]);

        eventStore.remove(eventStore.first);

        await t.waitForProjectReady(project);

        t.isDeeplyUnordered(idify(eventStore.getEventsForResource(1)), [2, 3]);
        t.isDeeplyUnordered(idify(eventStore.getEventsForResource(2)), [4]);

        eventStore.remove(eventStore.last);

        await t.waitForProjectReady(project);

        t.isDeeplyUnordered(idify(eventStore.getEventsForResource(1)), [2, 3]);
        t.isDeeplyUnordered(idify(eventStore.getEventsForResource(2)), []);

        const event = eventStore.add({ resourceId : 3, id : 5 })[0];

        await t.waitForProjectReady(project);

        t.isDeeplyUnordered(idify(eventStore.getEventsForResource(3)), [5]);

        event.resourceId = 1;

        await t.waitForProjectReady(project);

        t.isDeeplyUnordered(idify(eventStore.getEventsForResource(1)), [2, 3, 5]);

        eventStore.removeAll();

        await t.waitForProjectReady(project);

        t.isDeeplyUnordered(idify(eventStore.getEventsForResource(1)), []);

        eventStore.data = [
            { resourceId : 1, id : 1 }
        ];

        await t.waitForProjectReady(project);

        t.isDeeplyUnordered(idify(eventStore.getEventsForResource(1)), [1]);
    });

    t.it('Should add split record to store and assign to same resource', async t => {
        project = new ProjectModel({
            eventsData : [
                { resourceId : 1, id : 1, startDate : new Date(2020, 0, 23), duration : 2 }
            ],
            resourcesData : [
                { id : 1 }
            ]
        });

        const { eventStore } = project;

        await project.commitAsync();

        await eventStore.first.split();

        t.is(eventStore.count, 2, 'Both parts in EventStore');
        t.is(eventStore.last.resourceId, eventStore.first.resourceId, 'Parts have matching resourceIds');
        t.is(project.assignmentStore.count, 2, '2 assignments found');
        t.ok(eventStore.last.isPhantom, 'New part flagged as phantom');
    });

    t.it('Should be able to split a multiassigned event', async t => {
        project = new ProjectModel({
            eventsData : [
                { id : 1, startDate : new Date(2020, 0, 23), duration : 2 }
            ],
            resourcesData : [
                { id : 1 },
                { id : 2 }
            ],
            assignmentsData : [
                { id : 1, eventId : 1, resourceId : 1 },
                { id : 2, eventId : 1, resourceId : 2 }
            ]
        });

        const { eventStore } = project;

        await project.commitAsync();

        await eventStore.first.split();

        const [original, clone] = project.eventStore;

        t.is(eventStore.count, 2, 'Both parts in EventStore');
        t.is(project.assignmentStore.count, 4, '4 assignments found');
        t.isDeeplyUnordered(original.resources, project.resourceStore.records, 'Original has correct resources');
        t.isDeeplyUnordered(clone.resources, project.resourceStore.records, 'Clone has correct resources');
        t.ok(eventStore.last.isPhantom, 'New part flagged as phantom');
    });

    t.it('isDateRangeAvailable should work', async t => {
        project = new ProjectModel({
            resourceStore : new ResourceStore({
                data : [
                    { id : 'r1', name : 'Mike' },
                    { id : 'r2', name : 'Linda' }
                ]
            }),

            eventStore : new EventStore({
                data : [
                    { id : 'e10', resourceId : 'r1', name : 'Foo', startDate : '2011-01-04', endDate : '2011-01-06' },
                    { id : 'e11', resourceId : 'r2', name : 'Bar', startDate : '2011-01-05', endDate : '2011-01-07' },
                    { id : 'e12', resourceId : 'r1', name : 'XYZ', startDate : '2011-01-08', endDate : '2011-01-09' },

                    // Should handle missing dates
                    {},
                    { resourceId : 'r1' },
                    { resourceId : 'r1', startDate : new Date() },
                    { startDate : new Date() },
                    { endDate : new Date() }
                ]
            })
        });

        const
            {
                eventStore,
                resourceStore
            }             = project,
            firstEvent    = eventStore.first,
            lastEvent     = eventStore.getById('e12'),
            firstResource = resourceStore.first,
            lastResource  = resourceStore.last;

        await project.commitAsync();

        t.ok(eventStore.isDateRangeAvailable(firstEvent.startDate, firstEvent.endDate, firstEvent, firstResource), 'First resource is available during the first event timespan (with event excluded)');
        t.notOk(eventStore.isDateRangeAvailable(firstEvent.startDate, firstEvent.endDate, null, firstResource), 'First resource is not available during the first event timespan');
        t.notOk(eventStore.isDateRangeAvailable(firstEvent.startDate, firstEvent.endDate, firstEvent, lastResource), 'Last resource is not available during the first event timespan (with event excluded)');
        t.notOk(eventStore.isDateRangeAvailable(firstEvent.startDate, firstEvent.endDate, null, lastResource), 'Last resource is not available during the first event timespan');
        t.ok(eventStore.isDateRangeAvailable(lastEvent.startDate, lastEvent.endDate, firstEvent, lastResource), 'Last resource is available during the last event timespan (with exception to the first event timespan)');
        t.ok(eventStore.isDateRangeAvailable(lastEvent.startDate, lastEvent.endDate, null, lastResource), 'Last resource is available during the last event timespan');
    });

    t.it('isDateRangeAvailable with assignments should work', async t => {
        project = new ProjectModel({
            resourceStore : new ResourceStore({
                data : [
                    { id : 'r1', name : 'Mike' },
                    { id : 'r2', name : 'Linda' }
                ]
            }),

            eventStore : new EventStore({
                data : [
                    { id : 'e10', name : 'Foo', startDate : '2011-01-04', endDate : '2011-01-06' },
                    { id : 'e11', name : 'Bar', startDate : '2011-01-05', endDate : '2011-01-07' },
                    { id : 'e12', name : 'XYZ', startDate : '2011-01-08', endDate : '2011-01-09' }
                ]
            }),

            assignmentStore : new AssignmentStore({
                data : [
                    { id : 'a1', resourceId : 'r1', eventId : 'e10' },
                    { id : 'a2', resourceId : 'r2', eventId : 'e11' },
                    { id : 'a3', resourceId : 'r1', eventId : 'e12' }
                ]
            })
        });

        const
            {
                eventStore,
                resourceStore,
                assignmentStore
            }               = project,
            firstEvent      = eventStore.first,
            lastEvent       = eventStore.last,
            firstAssignment = assignmentStore.first,
            firstResource   = resourceStore.first,
            lastResource    = resourceStore.last;

        await project.commitAsync();

        t.ok(eventStore.isDateRangeAvailable(firstEvent.startDate, firstEvent.endDate, firstAssignment, firstResource), 'First resource is available during the first event timespan (with assignment excluded)');
        t.notOk(eventStore.isDateRangeAvailable(firstEvent.startDate, firstEvent.endDate, firstAssignment, lastResource), 'Last resource is not available during the first event timespan (with assignment excluded)');
        t.ok(eventStore.isDateRangeAvailable(lastEvent.startDate, lastEvent.endDate, firstAssignment, lastResource), 'Last resource is available during the last event timespan (with assignment excluded)');

        t.notOk(eventStore.isDateRangeAvailable(firstEvent.startDate, firstEvent.endDate, null, firstResource), 'First resource is not available during the first event timespan');
        t.notOk(eventStore.isDateRangeAvailable(firstEvent.startDate, firstEvent.endDate, null, lastResource), 'Last resource is not available during the first event timespan');
        t.ok(eventStore.isDateRangeAvailable(lastEvent.startDate, lastEvent.endDate, null, lastResource), 'Last resource is available during the last event timespan');
    });

    t.it('isDateRangeAvailable with multi-assignments should work', async t => {
        project = new ProjectModel({
            resourceStore : new ResourceStore({
                data : [
                    { id : 'r1', name : 'Mike' },
                    { id : 'r2', name : 'Linda' },
                    { id : 'r3', name : 'John' }
                ]
            }),

            eventStore : new EventStore({
                data : [
                    { id : 'e10', name : 'Foo', startDate : '2011-01-04', endDate : '2011-01-06' },
                    { id : 'e11', name : 'Bar', startDate : '2011-01-05', endDate : '2011-01-07' },
                    { id : 'e12', name : 'XYZ', startDate : '2011-01-08', endDate : '2011-01-09' }
                ]
            }),

            assignmentStore : new AssignmentStore({
                data : [
                    { id : 'a11', resourceId : 'r1', eventId : 'e10' },
                    { id : 'a12', resourceId : 'r3', eventId : 'e10' },
                    { id : 'a2', resourceId : 'r2', eventId : 'e11' },
                    { id : 'a3', resourceId : 'r1', eventId : 'e12' }
                ]
            })
        });

        const
            {
                eventStore,
                assignmentStore
            }           = project,
            assignment1 = assignmentStore.getById('a11'), // For example when you drag an event element which belongs to the first resource
            assignment2 = assignmentStore.getById('a12'), // For example when you drag an event element which belongs to the last resource
            resource    = project.resourceStore.getById('r2'), // For example when you drag an event element to the second resource row
            firstEvent  = eventStore.first,
            lastEvent   = eventStore.last;

        await project.commitAsync();

        t.notOk(eventStore.isDateRangeAvailable(firstEvent.startDate, firstEvent.endDate, assignment1, resource), 'Second resource is not available during the first event timespan (with assignment excluded)');
        t.ok(eventStore.isDateRangeAvailable(lastEvent.startDate, lastEvent.endDate, assignment1, resource), 'Second resource is available during the last event timespan (with assignment excluded)');
        t.ok(eventStore.isDateRangeAvailable(new Date(2011, 0, 10), new Date(2011, 0, 12), assignment1, resource), 'Second resource is available during custom timespan (with assignment excluded)');

        t.notOk(eventStore.isDateRangeAvailable(firstEvent.startDate, firstEvent.endDate, assignment2, resource), 'Second resource is not available during the first event timespan (with another assignment excluded)');
        t.notOk(eventStore.isDateRangeAvailable(lastEvent.startDate, lastEvent.endDate, assignment2, resource), 'Second resource is not available during the last event timespan (with another assignment excluded)');
        t.ok(eventStore.isDateRangeAvailable(new Date(2011, 0, 10), new Date(2011, 0, 12), assignment2, resource), 'Second resource is available during custom timespan (with another assignment excluded)');
    });

    t.it('Should not crash with syncDataOnLoad', async t => {
        const eventStore = new EventStore({
            syncDataOnLoad : true,
            data           : [
                { id : 1, startDate : '2020-08-21', endDate : '2020-08-22' },
                { id : 2, startDate : '2020-08-21', endDate : '2020-08-23' }
            ]
        });

        project = new ProjectModel({
            eventStore
        });

        await project.commitAsync();

        eventStore.data = [
            { id : 1, startDate : '2020-08-21', endDate : '2020-08-23' },
            { id : 2, startDate : '2020-08-21', endDate : '2020-08-23' }
        ];

        await project.commitAsync();

        t.is(eventStore.first.endDate, new Date(2020, 7, 23), 'Event\'s endDate updated');
        t.is(eventStore.first.duration, 2, 'Duration too');
    });

    t.it('Data should be ready after addAsync()', async t => {
        const eventStore = new EventStore();

        project = new ProjectModel({ eventStore });

        await eventStore.addAsync({ startDate : '2020-09-11', duration : 3 });

        t.is(eventStore.first.endDate, new Date(2020, 8, 14), 'Calculations performed');
    });

    t.it('Data should be ready after loadDataAsync()', async t => {
        const eventStore = new EventStore();

        project = new ProjectModel({ eventStore });

        await eventStore.loadDataAsync([{ startDate : '2020-09-11', duration : 3 }]);

        t.is(eventStore.first.endDate, new Date(2020, 8, 14), 'Calculations performed');
    });

    t.it('Should trigger events when data is ready', t => {
        t.it('Add', async t => {
            const eventStore = new EventStore({
                listeners : {
                    addPreCommit({ records }) {
                        t.is(records[0].endDate, undefined, 'Not normalized in addPreCommit');
                    },
                    add({ records }) {
                        t.is(records[0].endDate, new Date(2020, 8, 10), 'Normalized in add');
                    },
                    changePreCommit({ records, action }) {
                        if (action === 'add') {
                            t.is(records[0].endDate, undefined, 'Not normalized in changePreCommit');
                        }
                    },
                    change({ records, action }) {
                        if (action === 'add') {
                            t.is(records[0].endDate, new Date(2020, 8, 10), 'Normalized in change');
                        }
                    }
                }
            });

            t.firesOk(eventStore, {
                addPreCommit    : 1,
                add             : 1,
                changePreCommit : 2, // update caused by normalization + add
                change          : 2  // dito
            });

            project = new ProjectModel({
                eventStore
            });

            await project.commitAsync();

            eventStore.add({ id : 1, startDate : '2020-09-08', duration : 2 });

            await project.commitAsync();
        });

        t.it('Dataset', async t => {
            const eventStore = new EventStore({
                listeners : {
                    refreshPreCommit({ records, action }) {
                        if (action === 'dataset') {
                            t.notOk(records[0].endDate, 'Not normalized in refreshPreCommit');
                        }
                    },
                    refresh({ records, action }) {
                        if (action === 'dataset') {
                            t.is(records[0].endDate, new Date(2020, 8, 10), 'Normalized in refresh');
                        }
                    },
                    changePreCommit({ records, action }) {
                        if (action === 'dataset') {
                            t.notOk(records[0].endDate, 'Not normalized in changePreCommit');
                        }
                    },
                    change({ records, action }) {
                        if (action === 'dataset') {
                            t.is(records[0].endDate, new Date(2020, 8, 10), 'Normalized in change');
                        }
                    }
                }
            });

            t.firesOk(eventStore, {
                refreshPreCommit : 1,
                refresh          : 1,
                changePreCommit  : 2, // update caused by normalization + add
                change           : 2  // dito
            });

            project = new ProjectModel({
                silenceInitialCommit : false,
                eventStore
            });

            await project.commitAsync();

            eventStore.data = [{ id : 1, startDate : '2020-09-08', duration : 2 }];

            await project.commitAsync();
        });

        t.it('Remove', async t => {
            const eventStore = new EventStore({
                data : [
                    { id : 1, startDate : '2020-09-08', duration : 2 }
                ]
            });

            project = new ProjectModel({
                eventStore
            });

            await project.commitAsync();

            t.firesOk(eventStore, {
                removePreCommit : 1,
                remove          : 1,
                changePreCommit : 1,
                change          : 1
            });

            eventStore.first.remove();

            await project.commitAsync();
        });

        t.it('Update should come after add', async t => {
            const triggeredEvents = [];

            const eventStore = new EventStore({
                listeners : {
                    catchAll({ type, action }) {
                        const result = { type };
                        if (action) {
                            result.action = action;
                        }
                        triggeredEvents.push(result);
                    }
                }
            });

            project = new ProjectModel({
                eventStore
            });

            await project.commitAsync();

            eventStore.add({ id : 1, startDate : '2020-09-08', duration : 2 });

            await project.commitAsync();

            t.isDeeply(triggeredEvents, [
                { type : 'beforeadd' },
                { type : 'addprecommit' },
                { type : 'changeprecommit', action : 'add' },
                { type : 'beforeupdate' },
                { type : 'updateprecommit' },
                { type : 'changeprecommit', action : 'update' },
                { type : 'add' },
                { type : 'change', action : 'add' },
                { type : 'update' },
                { type : 'change', action : 'update' }
            ]);
        });
    });

    // https://github.com/bryntum/support/issues/1576
    t.it('Should be able to assign using `set()', async t => {
        const eventStore = new EventStore({
            data : [
                { id : 1 }
            ]
        });

        const resourceStore = new ResourceStore({
            data : [
                { id : 1 },
                { id : 2 }
            ]
        });

        project = new ProjectModel({
            eventStore,
            resourceStore
        });

        const [event] = eventStore;

        await project.commitAsync();

        event.set({ resourceId : 1 });

        await project.commitAsync();

        t.is(event.resource, resourceStore.first, 'Assigned correctly after set()');
        t.is(event.data.resourceId, 1, 'Data updated correctly');

        event.resourceId = 2;

        await project.commitAsync();

        t.is(event.resource, resourceStore.last, 'Assigned correctly after resourceId=');
        t.is(event.data.resourceId, 2, 'Data updated correctly');

        event.beginBatch();
        event.resourceId = 1;
        event.endBatch();

        await project.commitAsync();

        t.is(event.resource, resourceStore.first, 'Assigned correctly after batch');
        t.is(event.data.resourceId, 1, 'Data updated correctly');
    });

    t.it('reapplyFilterOnAdd : false should work with getEvents API', async t => {
        const eventStore = new EventStore({
            syncDataOnLoad : true,
            data           : [
                { id : 1, name : 'Event 1', category : 'A', startDate : '2020-08-21', endDate : '2020-08-22' },
                { id : 2, name : 'Event 2', category : 'B', startDate : '2020-08-22', endDate : '2020-08-23' }
            ]
        });

        project = new ProjectModel({
            eventStore
        });
        const
            event1 = eventStore.getById(1),
            event2 = eventStore.getById(2);

        await project.commitAsync();

        let records = eventStore.getEvents({
            startDate : new Date(2020, 7, 21),
            endDate   : new Date(2020, 7, 25)
        });

        // All records available
        t.is(records.length, 2);
        t.ok(records.includes(event1));
        t.ok(records.includes(event2));

        eventStore.filter({
            property : 'category',
            value    : 'B',
            operator : '='
        });

        records = eventStore.getEvents({
            startDate : new Date(2020, 7, 21),
            endDate   : new Date(2020, 7, 25)
        });

        // Only category B records available
        t.is(records.length, 1);
        t.notOk(records.includes(event1));
        t.ok(records.includes(event2));

        // Create an event which would be filtered out if reapplyFilterOnAdd was true
        const event3 = eventStore.createRecord({ id : 3, name : 'Event 3', category : 'A', startDate : '2020-08-23', endDate : '2020-08-24' });

        await eventStore.addAsync(event3);

        records = eventStore.getEvents({
            startDate : new Date(2020, 7, 21),
            endDate   : new Date(2020, 7, 25)
        });

        // Event 3 is there because reapplyFilterOnAdd is false
        t.is(records.length, 2);
        t.notOk(records.includes(event1));
        t.ok(records.includes(event2));
        t.ok(records.includes(event3));

        // Programmatically reapply same filter set
        eventStore.filter();

        records = eventStore.getEvents({
            startDate : new Date(2020, 7, 21),
            endDate   : new Date(2020, 7, 25)
        });

        // Event 3 is not there now because we have reapplied the filters
        t.is(records.length, 1);
        t.notOk(records.includes(event1));
        t.ok(records.includes(event2));
        t.notOk(records.includes(event3));
    });

    t.it('reapplyFilterOnAdd : true should work with getEvents API', async t => {
        const eventStore = new EventStore({
            syncDataOnLoad     : true,
            reapplyFilterOnAdd : true,
            data               : [
                { id : 1, name : 'Event 1', category : 'A', startDate : '2020-08-21', endDate : '2020-08-22' },
                { id : 2, name : 'Event 2', category : 'B', startDate : '2020-08-22', endDate : '2020-08-23' }
            ]
        });

        project = new ProjectModel({
            eventStore
        });
        const
            event1 = eventStore.getById(1),
            event2 = eventStore.getById(2);

        await project.commitAsync();

        let records = eventStore.getEvents({
            startDate : new Date(2020, 7, 21),
            endDate   : new Date(2020, 7, 25)
        });

        // All records available
        t.is(records.length, 2);
        t.ok(records.includes(event1));
        t.ok(records.includes(event2));

        eventStore.filter({
            property : 'category',
            value    : 'B',
            operator : '='
        });

        records = eventStore.getEvents({
            startDate : new Date(2020, 7, 21),
            endDate   : new Date(2020, 7, 25)
        });

        // Only category B records available
        t.is(records.length, 1);
        t.notOk(records.includes(event1));
        t.ok(records.includes(event2));

        // Create an event which would be filtered out if reapplyFilterOnAdd was true
        const event3 = eventStore.createRecord({ id : 3, name : 'Event 3', category : 'A', startDate : '2020-08-23', endDate : '2020-08-24' });

        await eventStore.addAsync(event3);

        records = eventStore.getEvents({
            startDate : new Date(2020, 7, 21),
            endDate   : new Date(2020, 7, 25)
        });

        // Event 3 is not there because reapplyFilterOnAdd is true
        t.is(records.length, 1);
        t.notOk(records.includes(event1));
        t.ok(records.includes(event2));
        t.notOk(records.includes(event3));
    });

    // https://github.com/bryntum/support/issues/2418
    t.it('Should respect silent flag for add() method', async t => {
        const eventStore = new EventStore();

        project = new ProjectModel({
            eventStore
        });

        t.wontFire(eventStore, 'change');
        t.wontFire(eventStore, 'add');

        eventStore.add({}, true);

        await project.commitAsync();
    });

    t.describe('dayTime indexing', t => {
        let eventStore;

        t.beforeEach(() => {
            eventStore = new EventStore({
                data : [
                    { id : 1, name : 'Zip', startDate : '2021-05-04 15:00:00', endDate : '2021-05-04 19:00:00' },
                    { id : 2, name : 'Foo', startDate : '2021-05-04 20:00:00', endDate : '2021-05-05 02:00:00' },
                    { id : 3, name : 'Bar', startDate : '2021-05-05 01:00:00', endDate : '2021-05-05 03:00:00' },
                    { id : 4, name : 'Derp', startDate : '2021-05-05 17:00:00', endDate : '2021-05-06 01:00:00' },
                    { id : 5, name : 'Woot', startDate : '2021-05-06 07:00:00', endDate : '2021-05-06 10:00:00' },
                    { id : 6, name : 'Woot', startDate : '2021-05-06 15:00:00', endDate : '2021-05-06 17:00:00' }
                ]
            });
        });

        t.it('should handle the day shift', t => {
            const events02 = eventStore.getEvents({
                startDate : DateHelper.parse('2021-05-02'),
                endDate   : DateHelper.parse('2021-05-03')
            });
            const events03 = eventStore.getEvents({
                startDate : DateHelper.parse('2021-05-03'),
                endDate   : DateHelper.parse('2021-05-04')
            });
            const events04 = eventStore.getEvents({
                startDate : DateHelper.parse('2021-05-04'),
                endDate   : DateHelper.parse('2021-05-05')
            });
            const events05 = eventStore.getEvents({
                startDate : DateHelper.parse('2021-05-05'),
                endDate   : DateHelper.parse('2021-05-06')
            });
            const events06 = eventStore.getEvents({
                startDate : DateHelper.parse('2021-05-06'),
                endDate   : DateHelper.parse('2021-05-07')
            });
            const events07 = eventStore.getEvents({
                startDate : DateHelper.parse('2021-05-07'),
                endDate   : DateHelper.parse('2021-05-08')
            });

            t.isDeeply(events02.map(e => e.id), [], 'Correct events for the 2nd');
            t.isDeeply(events03.map(e => e.id), [], 'Correct events for the 3rd');
            t.isDeeply(events04.map(e => e.id), [1, 2], 'Correct events for the 4th');
            t.isDeeply(events05.map(e => e.id), [2, 3, 4], 'Correct events for the 5th');
            t.isDeeply(events06.map(e => e.id), [4, 5, 6], 'Correct events for the 6th');
            t.isDeeply(events07.map(e => e.id), [], 'Correct events for the 7th');
        });

        t.it('should reject an invalid shift', t => {
            const dayTime = new DayTime({
                startShift : 16
            });

            // SHOULD FAIL w/o THIS: eventStore.indices.use(dayTime);

            t.throwsOk(() => {
                eventStore.getEvents({
                    dayTime,
                    startDate : DateHelper.parse('2021-05-02 16:00:00'),
                    endDate   : DateHelper.parse('2021-05-03 16:00:00')
                });
            }, 'No day index registered for @16:00 on events', 'Throws for invalid dayTime');
        });

        t.it('should handle the night shift', t => {
            const dayTime = new DayTime({
                startShift : 16
            });

            eventStore.registerDayIndex(dayTime);

            const events02 = eventStore.getEvents({
                dayTime,
                startDate : DateHelper.parse('2021-05-02 16:00:00'),
                endDate   : DateHelper.parse('2021-05-03 16:00:00')
            });
            const events03 = eventStore.getEvents({
                dayTime,
                startDate : DateHelper.parse('2021-05-03 16:00:00'),
                endDate   : DateHelper.parse('2021-05-04 16:00:00')
            });
            const events04 = eventStore.getEvents({
                dayTime,
                startDate : DateHelper.parse('2021-05-04 16:00:00'),
                endDate   : DateHelper.parse('2021-05-05 16:00:00')
            });
            const events05 = eventStore.getEvents({
                dayTime,
                startDate : DateHelper.parse('2021-05-05 16:00:00'),
                endDate   : DateHelper.parse('2021-05-06 16:00:00')
            });
            const events06 = eventStore.getEvents({
                dayTime,
                startDate : DateHelper.parse('2021-05-06 16:00:00'),
                endDate   : DateHelper.parse('2021-05-07 16:00:00')
            });
            const events07 = eventStore.getEvents({
                dayTime,
                startDate : DateHelper.parse('2021-05-07 16:00:00'),
                endDate   : DateHelper.parse('2021-05-08 16:00:00')
            });

            t.isDeeply(events02.map(e => e.id), [], 'Correct events for the 2nd');
            t.isDeeply(events03.map(e => e.id), [1], 'Correct events for the 3rd');
            t.isDeeply(events04.map(e => e.id), [1, 2, 3], 'Correct events for the 4th');
            t.isDeeply(events05.map(e => e.id), [4, 5, 6], 'Correct events for the 5th');
            t.isDeeply(events06.map(e => e.id), [6], 'Correct events for the 6th');
            t.isDeeply(events07.map(e => e.id), [], 'Correct events for the 7th');
        });
    });

    // https://github.com/bryntum/support/issues/3298
    t.it('ResourceId in event should not be undefined for missing resources', async t => {
        t.diag('Create project with one event');

        const project = new ProjectModel({
            eventsData : [
                { id : 1, resourceId : 1 }
            ]
        });
        await project.commitAsync();
        const event1 = project.eventStore.getById(1);
        t.is(event1.resourceId, 1, 'ResourceId is 1 for first event');
        t.is(event1.resource, undefined, 'Resource is undefined for first event');

        t.diag('Add second event');
        project.eventStore.add({ id : 2, resourceId : 2 });
        await project.commitAsync();
        const event2 = project.eventStore.getById(2);

        t.is(event1.resourceId, 1, 'ResourceId is 1 for first event');
        t.is(event1.resource, undefined, 'Resource is undefined for first event');

        t.is(event2.resourceId, 2, 'ResourceId is 2 for first event');
        t.is(event2.resource, undefined, 'Resource is undefined for second event');

        t.diag('Add two resources');
        project.resourceStore.add(
            { id : 1 },
            { id : 2 }
        );
        await project.commitAsync();

        t.is(event1.resourceId, 1, 'ResourceId is 1 for first event');
        t.is(event1.resource, project.resourceStore.getById(1), 'Resource is set for first event');

        t.is(event2.resourceId, 2, 'ResourceId is 2 for first event');
        t.is(event2.resource, project.resourceStore.getById(2), 'ResourceId is set for second event');
    });

    t.it('getEvents using dateMap : true', async t => {
        const
            resourceStore = new ResourceStore({
                data : [
                    { id : 1 }
                ]
            }),
            eventStore    = new EventStore({
                data : [
                    {
                        id         : 1,
                        resourceId : 1,
                        name       : 'Event 1',
                        startDate  : '2010-12-21T09:00',
                        endDate    : '2010-12-21T10:00'
                    }, {
                        id         : 2,
                        resourceId : 1,
                        name       : 'Event 2',
                        startDate  : '2010-12-21T10:00',
                        endDate    : '2010-12-21T11:00'
                    }, {
                        id         : 3,
                        resourceId : 1,
                        name       : 'Event 3',
                        startDate  : '2010-12-22T09:00',
                        endDate    : '2010-12-22T10:00'
                    }
                ]
            });

        project = new ProjectModel({
            eventStore,
            // With engine, matching resources are required
            resourceStore
        });

        await t.waitForProjectReady(project);

        let eventMap = eventStore.getEvents({
            startDate : new Date(2010, 11, 1),
            endDate   : new Date(2011, 0, 1),
            dateMap   : true
        });
        t.is(eventMap.size, 2);

        // Date range collected correctly
        t.isDeeply(eventMap.get('2010-12-21').map(e => e.id), [1, 2]);
        t.isDeeply(eventMap.get('2010-12-22').map(e => e.id), [3]);

        // Filter out evenbts 1 and 2
        eventStore.filter(e => e.id !== 1 && e.id !== 2);
        eventMap = eventStore.getEvents({
            startDate : new Date(2010, 11, 1),
            endDate   : new Date(2011, 0, 1),
            dateMap   : true
        });

        // Filtering should have eliminated the entry for 2010-12-21
        t.is(eventMap.size, 1);
        t.isDeeply(eventMap.get('2010-12-22').map(e => e.id), [3]);

        // Unfilter
        eventStore.clearFilters();
        eventMap = eventStore.getEvents({
            startDate : new Date(2010, 11, 1),
            endDate   : new Date(2011, 0, 1),
            dateMap   : true
        });
        t.is(eventMap.size, 2);

        // Clearing the filter returns all dates
        t.isDeeply(eventMap.get('2010-12-21').map(e => e.id), [1, 2]);
        t.isDeeply(eventMap.get('2010-12-22').map(e => e.id), [3]);

        // Deleting events one and two should mean no cell returned for that date
        eventStore.remove(1);
        eventStore.remove(2);
        eventMap = eventStore.getEvents({
            startDate : new Date(2010, 11, 1),
            endDate   : new Date(2011, 0, 1),
            dateMap   : true
        });

        // Deleting should have eliminated the entry for 2010-12-21
        t.is(eventMap.size, 1);
        t.isDeeply(eventMap.get('2010-12-22').map(e => e.id), [3]);
    });
});
