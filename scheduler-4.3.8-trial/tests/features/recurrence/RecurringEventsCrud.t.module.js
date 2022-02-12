import { EventStore, ResourceStore, CrudManager, Scheduler, Base } from '../../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler1, scheduler2;

    t.mockUrl('crud-manager', {
        delay        : 40,
        responseText : JSON.stringify({
            success   : true,
            resources : {
                rows : [
                    { id : 'a' }
                ]
            },
            events : {
                rows : [
                    {
                        id             : 1,
                        resourceId     : 'a',
                        startDate      : '2018-02-01',
                        endDate        : '2018-03-01',
                        recurrenceRule : 'FREQ=MONTHLY;INTERVAL=2'
                    }
                ]
            }
        })
    });

    t.mockUrl('event-store', {
        delay        : 10,
        responseText : JSON.stringify([
            {
                id             : 1,
                resourceId     : 1,
                startDate      : '2018-02-01',
                endDate        : '2018-03-01',
                recurrenceRule : 'FREQ=MONTHLY;INTERVAL=2'
            }
        ])
    });

    t.mockUrl('event-500', {
        delay  : 10,
        status : 500
    });

    t.beforeEach(() => Base.destroy(scheduler1, scheduler2));

    async function getScheduler(config) {
        const result = await t.getSchedulerAsync(Object.assign({
            enableRecurringEvents : true,
            features              : {
                eventTooltip : false
            },
            height    : 400,
            startDate : new Date(2018, 0, 1),
            endDate   : new Date(2019, 0, 1)
        }, config));

        return result;
    }

    t.it('Loading fails', async t => {

        const resourceStore = new ResourceStore({
            data : [
                { id : 1 }
            ]
        });

        const eventStore = new EventStore({
            readUrl : 'event-500'
        });

        scheduler1 = await getScheduler({
            resourceStore,
            eventStore
        });

        const async = t.beginAsync();

        eventStore.load().catch(() => {
            t.pass('promise rejection happened');
            t.endAsync(async);
        });
    });

    t.it('Recurring event occurrences are generated on event store load', async t => {

        const resourceStore = new ResourceStore({
            data : [
                { id : 1 }
            ]
        });

        const eventStore = new EventStore({
            readUrl : 'event-store'
        });

        scheduler1 = await getScheduler({
            resourceStore,
            eventStore,
            destroyStores : false
        });

        scheduler2 = await getScheduler({
            resourceStore,
            eventStore
        });

        await eventStore.load();

        await t.waitForProjectReady();

        t.is(eventStore.getById(1).occurrences.length, 5, 'event 1 has proper number of occurrences');
    });

    t.it('Recurring event occurrences are generated properly if event store is loaded before panels creation', t => {
        let eventStore;

        const resourceStore = new ResourceStore({
            data : [
                { id : 1 }
            ]
        });

        t.chain(
            next => {
                eventStore = new EventStore({
                    autoLoad  : true,
                    readUrl   : 'event-store',
                    listeners : {
                        load : next
                    }
                });
            },

            async() => {
                scheduler1 = await getScheduler({
                    resourceStore,
                    eventStore,
                    destroyStores : false
                });

                scheduler2 = await getScheduler({
                    resourceStore,
                    eventStore
                });

                t.is(eventStore.getById(1).occurrences.length, 5, 'event 1 has proper number of occurrences');
            }
        );
    });

    // TODO: uncomment (xit -> it) this when fixing https://github.com/bryntum/bryntum-suite/issues/1158
    // Error is thrown "Duplicate listener added: CrudManager#onCrudStoreChange"
    t.it('Recurring event occurrences are generated properly on CrudManager load', async t => {
        const crudManager = new CrudManager({
            eventStore    : new EventStore(),
            resourceStore : new ResourceStore(),
            transport     : {
                load : {
                    url : 'crud-manager'
                }
            }
        });

        scheduler1 = new Scheduler({
            viewPreset            : 'dayAndWeek',
            rowHeight             : 45,
            enableRecurringEvents : true,
            features              : {
                eventTooltip : false
            },
            columns : [
                { text : 'Name', sortable : true, field : 'name', locked : true }
            ],
            useInitialAnimation : false,
            height              : 400,
            startDate           : new Date(2018, 0, 1),
            endDate             : new Date(2019, 0, 1),
            appendTo            : document.body,
            destroyStores       : false,
            crudManager
        });

        await crudManager.load();

        scheduler2 = new Scheduler({
            viewPreset            : 'dayAndWeek',
            rowHeight             : 45,
            enableRecurringEvents : true,
            features              : {
                eventTooltip : false
            },
            columns : [
                { text : 'Name', sortable : true, field : 'name', locked : true }
            ],
            useInitialAnimation : false,
            height              : 400,
            startDate           : new Date(2018, 0, 1),
            endDate             : new Date(2019, 0, 1),
            appendTo            : document.body,
            destroyStores       : false,
            crudManager
        });

        await t.waitForProjectReady();

        t.is(crudManager.eventStore.getById(1).occurrences.length, 5, 'event 1 has proper number of occurrences');

        // added after bug report here: https://github.com/bryntum/support/issues/1431
        await crudManager.load();

        t.is(crudManager.eventStore.getById(1).occurrences.length, 5, 'event 1 has proper number of occurrences after 1 reload');

        await crudManager.load();

        t.is(crudManager.eventStore.getById(1).occurrences.length, 5, 'event 1 has proper number of occurrences after 2 reloads');
    });

    // TODO: uncomment (xit -> it) this when fixing https://github.com/bryntum/bryntum-suite/issues/1158
    // Error is thrown "Duplicate listener added: CrudManager#onCrudStoreChange"
    t.it('Recurring event occurrences are generated properly if CrudManager is loaded before panels creation', async t => {

        const crudManager = new CrudManager({
            eventStore    : new EventStore(),
            resourceStore : new ResourceStore(),
            transport     : {
                load : {
                    url : 'crud-manager'
                }
            }
        });

        await crudManager.load();

        scheduler1 = new Scheduler({
            viewPreset            : 'dayAndWeek',
            rowHeight             : 45,
            enableRecurringEvents : true,
            features              : {
                eventTooltip : false
            },
            columns : [
                { text : 'Name', sortable : true, field : 'name', locked : true }
            ],
            useInitialAnimation : false,
            height              : 400,
            startDate           : new Date(2018, 0, 1),
            endDate             : new Date(2019, 0, 1),
            appendTo            : document.body,
            destroyStores       : false,
            crudManager
        });

        scheduler2 = new Scheduler({
            viewPreset            : 'dayAndWeek',
            rowHeight             : 45,
            enableRecurringEvents : true,
            features              : {
                eventTooltip : false
            },
            columns : [
                { text : 'Name', sortable : true, field : 'name', locked : true }
            ],
            useInitialAnimation : false,
            height              : 400,
            startDate           : new Date(2018, 0, 1),
            endDate             : new Date(2019, 0, 1),
            appendTo            : document.body,
            destroyStores       : false,
            crudManager
        });

        await t.waitForProjectReady();

        t.is(crudManager.eventStore.getById(1).occurrences.length, 5, 'event 1 has proper number of occurrences');
    });

});
