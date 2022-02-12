import { Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler && scheduler.destroy());

    t.it('Should support dataset replace with syncDataOnLoad', async t => {
        scheduler = new Scheduler({
            appendTo : document.body,
            width    : 600,
            columns  : [
                {
                    field : 'name',
                    width : 150
                }
            ],
            eventStore : {
                syncDataOnLoad : true
            },
            resources : [
                {
                    id         : 1,
                    name       : 'Lee',
                    type       : 'Marketing',
                    eventColor : 'green'
                },
                {
                    id         : 2,
                    name       : 'Lee',
                    type       : 'Marketing',
                    eventColor : 'green'
                }
            ],
            events : [
                {
                    id         : 1,
                    resourceId : 1,
                    name       : 'Appointment',
                    startDate  : '2017-02-07 09:00',
                    endDate    : '2017-02-07 11:00'
                },
                {
                    id         : 2,
                    resourceId : 2,
                    name       : 'Meeting',
                    startDate  : '2017-02-07 09:00',
                    endDate    : '2017-02-07 11:00'
                }
            ],

            startDate  : new Date(2017, 1, 7, 8),
            endDate    : new Date(2017, 1, 7, 18),
            viewPreset : 'hourAndDay'
        });

        await t.waitForProjectReady();

        t.selectorCountIs(scheduler.unreleasedEventSelector, 2, '2 events initially');

        scheduler.eventStore.data = [{
            id         : 1,
            resourceId : 1,
            startDate  : '2017-02-07 10:00',
            endDate    : '2017-02-07 12:00',
            name       : 'Appointment updated'
        }];

        t.waitForSelectorNotFound(scheduler.unreleasedEventSelector + ':contains(Meeting)');
        t.waitForSelector(scheduler.unreleasedEventSelector + ':contains(Appointment updated)');
    });

    t.it('Should handle an event being updated while dragging', async t => {
        scheduler = new Scheduler({
            appendTo : document.body,
            width    : 600,
            columns  : [
                {
                    field : 'name',
                    width : 150
                }
            ],
            eventStore : {
                syncDataOnLoad : true
            },
            resources : [
                {
                    id   : 1,
                    name : 'Lee'
                },
                {
                    id   : 2,
                    name : 'Doug'
                }
            ],
            events : [
                {
                    id         : 1,
                    resourceId : 1,
                    name       : 'Appointment',
                    startDate  : '2017-02-07 09:00',
                    endDate    : '2017-02-07 11:00'
                },
                {
                    id         : 2,
                    resourceId : 2,
                    name       : 'Meeting',
                    startDate  : '2017-02-07 09:00',
                    endDate    : '2017-02-07 11:00'
                }
            ],

            startDate  : new Date(2017, 1, 7, 8),
            endDate    : new Date(2017, 1, 7, 18),
            viewPreset : 'hourAndDay'
        });

        await t.waitForProjectReady();

        await t.dragBy('.b-sch-event', [-70, 0], null, null, null, true);

        // Update name, resource, duration, start date
        scheduler.eventStore.data = [{
            id         : 1,
            resourceId : 2,
            startDate  : '2017-02-07 10:00',
            endDate    : '2017-02-07 13:00',
            name       : 'Appointment updated'
        }];

        await scheduler.project.commitAsync();

        t.waitForSelectorNotFound(scheduler.unreleasedEventSelector + ':contains(Meeting)');

        t.mouseUp(null);

        await t.waitForSelectorNotFound('.b-dragging');
        await scheduler.project.commitAsync();

        t.is(scheduler.eventStore.first.startDate, new Date(2017, 1, 7, 8), 'Start date ok');
        t.is(scheduler.eventStore.first.endDate, new Date(2017, 1, 7, 11), 'End date ok');
        t.is(scheduler.eventStore.first.resource.name, 'Lee', 'Resource ok');
    });

    t.it('Should render correctly after a small **no-op** drag, during which the event is reassigned from outside', async t => {
        scheduler = new Scheduler({
            appendTo  : document.body,
            startDate : new Date(2011, 0, 3),
            endDate   : new Date(2011, 0, 13),
            resources : [
                { id : 'r1' },
                { id : 'r2' },
                { id : 'r3' }
            ],
            eventStore : {
                syncDataOnLoad : true,
                data           : [
                    {
                        id         : 1,
                        name       : 'Assignment 1',
                        startDate  : new Date(2011, 0, 4),
                        endDate    : new Date(2011, 0, 6),
                        cls        : 'event1',
                        resourceId : 'r1'
                    }, {
                        id         : 2,
                        name       : 'Assignment 2',
                        startDate  : new Date(2011, 0, 5),
                        endDate    : new Date(2011, 0, 7),
                        cls        : 'event2',
                        resourceId : 'r2'
                    }, {
                        id         : 3,
                        name       : 'Assignment 3',
                        startDate  : new Date(2011, 0, 6),
                        endDate    : new Date(2011, 0, 8),
                        cls        : 'event3',
                        resourceId : 'r3'
                    }
                ]
            }
        });

        t.chain(
            { drag : '.event1', by : [0, 20], dragOnly : true },

            async() => {
                scheduler.events = [{
                    id         : 1,
                    name       : 'Assignment 1 New',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6),
                    cls        : 'event1',
                    resourceId : 'r2'
                }];

                await scheduler.project.commitAsync();

                t.wontFire(scheduler.eventStore, 'update');
            },

            { mouseUp : null },

            () => scheduler.project.commitAsync(),

            { waitForSelectorNotFound : '.b-dragging' },

            () => {
                t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 4), 'Correct start date');
                t.is(scheduler.eventStore.first.endDate, new Date(2011, 0, 6), 'Correct end date');
                t.is(scheduler.eventStore.first.resource.id, 'r2', 'Since we performed a no-op, resource external resource modification is kept');

                t.selectorCountIs(scheduler.unreleasedEventSelector, 1, '1 event rendered');
            }
        );
    });

    // https://github.com/bryntum/support/issues/1929
    t.it('Should remove event bars from view if event store is cleared during single event drag drop (websocket update etc)', async t => {
        scheduler = new Scheduler({
            appendTo  : document.body,
            startDate : new Date(2011, 0, 3),
            endDate   : new Date(2011, 0, 13),
            rowHeight : 40,
            resources : [
                { id : 'r1' }
            ],
            eventStore : {
                syncDataOnLoad : true,
                data           : [
                    {
                        id         : 1,
                        name       : 'Assignment 1',
                        startDate  : new Date(2011, 0, 4),
                        endDate    : new Date(2011, 0, 6),
                        resourceId : 'r1'
                    },
                    {
                        id         : 2,
                        name       : 'Assignment 2',
                        startDate  : new Date(2011, 0, 4),
                        endDate    : new Date(2011, 0, 6),
                        resourceId : 'r1'
                    }
                ]
            }
        });

        t.chain(
            { drag : '.b-sch-event', by : [100, 0], dragOnly : true },
            async()  => {
                scheduler.events = [];

                await scheduler.project.commitAsync();

                t.wontFire(scheduler.eventStore, 'update');
            },

            { mouseUp : null },

            { waitForSelectorNotFound : '.b-dragging' },
            { waitForSelectorNotFound : scheduler.unreleasedEventSelector },

            () => {
                t.is(scheduler.eventStore.count, 0, 'No events in store');
                t.hasApproxHeight('.b-grid-row', 40, 'Correct row height');
            }
        );
    });

    // https://github.com/bryntum/support/issues/1929
    t.it('Should remove event bar from view if event is removed during drag drop (websocket update etc)', async t => {
        scheduler = new Scheduler({
            appendTo  : document.body,
            startDate : new Date(2011, 0, 3),
            endDate   : new Date(2011, 0, 13),
            rowHeight : 40,
            resources : [
                { id : 'r1' }
            ],
            eventStore : {
                syncDataOnLoad : true,
                data           : [
                    {
                        id         : 1,
                        name       : 'Removed',
                        startDate  : new Date(2011, 0, 4),
                        endDate    : new Date(2011, 0, 6),
                        resourceId : 'r1'
                    },
                    {
                        id         : 2,
                        name       : 'Assignment 2',
                        startDate  : new Date(2011, 0, 4),
                        endDate    : new Date(2011, 0, 6),
                        resourceId : 'r1'
                    }
                ]
            }
        });

        t.firesOnce(scheduler.eventStore, 'update');

        t.chain(
            { drag : '.b-sch-event:contains(Removed)', by : [100, 0], dragOnly : true },
            async() => {
                scheduler.eventStore.first.remove();

                await scheduler.project.commitAsync();
            },

            { mouseUp : null },

            { waitForSelectorNotFound : '.b-dragging' },
            { waitForSelectorNotFound : scheduler.unreleasedEventSelector + ':contains(Removed)' },

            next => {
                t.selectorCountIs(scheduler.unreleasedEventSelector, 1, '1 event remaining');
                t.is(scheduler.eventStore.count, 1, '1 event in store');
                t.hasApproxHeight('.b-grid-row', 40, 'Correct row height');

                next();
            },

            { drag : '.b-sch-event', by : [100, 0] },
            { waitForSelectorNotFound : '.b-dragging' },

            next => {
                t.selectorCountIs(scheduler.unreleasedEventSelector, 1, '1 event');
                t.is(scheduler.eventStore.count, 1, '1 event in store');
                t.hasApproxHeight('.b-grid-row', 40, 'Correct row height');
                t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 5), 'Start date ok');
            }
        );
    });

    // https://github.com/bryntum/support/issues/1929
    t.it('Should remove event bar from view if one of multiple events is removed during drag drop (websocket update etc)', async t => {
        scheduler = new Scheduler({
            appendTo         : document.body,
            startDate        : new Date(2011, 0, 3),
            endDate          : new Date(2011, 0, 13),
            rowHeight        : 40,
            multiEventSelect : true,
            resources        : [
                { id : 'r1' }
            ],
            eventStore : {
                syncDataOnLoad : true,
                data           : [
                    {
                        id         : 1,
                        name       : 'Assignment 1',
                        startDate  : new Date(2011, 0, 4),
                        endDate    : new Date(2011, 0, 6),
                        resourceId : 'r1'
                    },
                    {
                        id         : 2,
                        name       : 'Assignment 2',
                        startDate  : new Date(2011, 0, 4),
                        endDate    : new Date(2011, 0, 6),
                        resourceId : 'r1'
                    }
                ]
            }
        });

        t.willFireNTimes(scheduler.eventStore, 'update', 2);

        scheduler.selectEvents(scheduler.eventStore.getRange());

        t.chain(
            { drag : '.b-sch-event', by : [100, 0], dragOnly : true },
            async() => {
                scheduler.eventStore.first.remove();

                await scheduler.project.commitAsync();
            },

            { mouseUp : null },

            { waitForSelectorNotFound : '.b-dragging' },
            { waitForSelectorNotFound : scheduler.unreleasedEventSelector + ':contains(Removed)' },

            next => {
                t.selectorCountIs(scheduler.unreleasedEventSelector, 1, '1 event remaining');
                t.is(scheduler.eventStore.count, 1, '1 event in store');
                t.hasApproxHeight('.b-grid-row', 40, 'Correct row height');

                next();
            },

            { drag : '.b-sch-event', by : [100, 0] },

            next => {
                t.selectorCountIs(scheduler.unreleasedEventSelector, 1, '1 event remaining');
                t.is(scheduler.eventStore.count, 1, '1 event in store');
                t.hasApproxHeight('.b-grid-row', 40, 'Correct row height');
            }
        );
    });

    // https://github.com/bryntum/support/issues/2774
    t.it('Should remove event bars from view if event store is cleared during multi-event drag drop (websocket update etc)', async t => {
        scheduler = new Scheduler({
            appendTo         : document.body,
            startDate        : new Date(2011, 0, 3),
            endDate          : new Date(2011, 0, 13),
            rowHeight        : 40,
            multiEventSelect : true,
            resources        : [
                { id : 'r1' }
            ],
            eventStore : {
                syncDataOnLoad : true,
                data           : [
                    {
                        id         : 1,
                        name       : 'Event 1',
                        startDate  : new Date(2011, 0, 4),
                        endDate    : new Date(2011, 0, 6),
                        resourceId : 'r1'
                    },
                    {
                        id         : 2,
                        name       : 'Event 2',
                        startDate  : new Date(2011, 0, 4),
                        endDate    : new Date(2011, 0, 6),
                        resourceId : 'r1'
                    }
                ]
            }
        });

        scheduler.selectEvents(scheduler.eventStore.getRange());

        t.chain(
            { drag : '.b-sch-event', by : [100, 0], dragOnly : true },

            async()  => {
                scheduler.events = [];

                await scheduler.project.commitAsync();

                t.wontFire(scheduler.eventStore, 'update');
            },

            { mouseUp : null },

            { waitForSelectorNotFound : '.b-dragging' },
            { waitForSelectorNotFound : scheduler.unreleasedEventSelector },

            () => {
                t.is(scheduler.eventStore.count, 0, 'No events in store');
                t.hasApproxHeight('.b-grid-row', 40, 'Correct row height');
            }
        );
    });
});
