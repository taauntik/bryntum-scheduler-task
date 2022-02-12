import { ArrayHelper, EventModel } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler?.destroy());

    t.it('Should resume refresh when resource store is reduced', async t => {
        scheduler = await t.getSchedulerAsync({
            resourceStore : t.getResourceStore2({}, 100),
            eventStore    : t.getEventStore({}, 100)
        });

        t.chain(
            { waitForSelector : '.b-grid-row' },
            async() => {
                scheduler.suspendRefresh();

                scheduler.endDate = new Date(2011, 0, 9);

                scheduler.project = {
                    eventStore : {
                        useRawData : true,
                        data       : [{
                            id        : 1,
                            startDate : new Date(2011, 0, 5),
                            duration  : 5
                        }]
                    },
                    resourceStore : {
                        useRawData : true,
                        data       : [{ id : 1, name : 'Foo' }]
                    },
                    assignmentStore : {
                        useRawData : true,
                        data       : [{ id : 1, resource : 1, event : 1 }]
                    }
                };

                scheduler.resumeRefresh(true);

                // Test should not throw before dataReady is fired
                await scheduler.project.await('dataReady', false);
            },

            { waitFor : () => document.querySelectorAll('.b-grid-row').length === 2 }
        );
    });

    t.it('Should render event name when name field is defined with dataSource', async t => {
        class CustomEventModel extends EventModel {
            static get fields() {
                return [
                    { name : 'name', dataSource : 'desc' }
                ];
            }
        }

        scheduler = await t.getScheduler({
            startDate  : new Date(2017, 0, 1, 10),
            endDate    : new Date(2017, 0, 1, 12),
            resources  : [{ id : 'r1', name : 'Mike' }],
            eventStore : {
                modelClass : CustomEventModel,
                data       : [
                    {
                        id         : 1,
                        resourceId : 'r1',
                        startDate  : new Date(2017, 0, 1, 10),
                        endDate    : new Date(2017, 0, 1, 12),
                        desc       : 'Other field'
                    }
                ]
            }
        });

        await t.waitForSelector('.b-sch-event:contains(Other field)');
    });

    t.it('Should not flood assignmentStore changes when events are added', async t => {
        scheduler = await t.getScheduler({
            events        : [],
            resourceStore : t.getResourceStore2(null, 100)
        });

        t.firesOnce(scheduler.assignmentStore, 'change');

        const eventStore = t.getEventStore(null, 1000);

        scheduler.eventStore.add(eventStore.toJSON());

        await t.waitForSelector('.b-sch-event:contains(Assignment 1)');
    });

    // https://github.com/bryntum/support/issues/2386
    t.it('Events should not disappear when setting resources twice', async t => {
        const resources = [{
            id   : 'r1',
            name : 'Mike'
        }, {
            id   : 'r2',
            name : 'Linda'
        }, {
            id   : 'r3',
            name : 'Don'
        }, {
            id   : 'r4',
            name : 'Karen'
        }, {
            id   : 'r5',
            name : 'Doug'
        }, {
            id   : 'r6',
            name : 'Peter'
        }];

        scheduler = await t.getSchedulerAsync({
            resources
        });

        scheduler.resources = resources;
        await t.waitForSelector('[data-event-id=1]');
        t.elementIsVisible('[data-event-id=1]', 'Event is visible after set resources first time');

        scheduler.resources = resources;
        await t.waitForSelector('[data-event-id=1]');
        t.elementIsVisible('[data-event-id=1]', 'Event is visible after set resources second time');
    });

    // https://github.com/bryntum/support/issues/2935
    t.it('Should handle resuming refresh after dataset in scrolled Scheduler', async t => {
        scheduler = await t.getSchedulerAsync({
            resources : ArrayHelper.populate(100, i => ({ id : i + 1, name : 'Resource ' + (i + 1) }))
        });

        await scheduler.scrollToBottom();

        await t.waitForAnimationFrame();

        scheduler.suspendRefresh();
        scheduler.resourceStore.data = [{ id : 1, name : 'Resource 1' }];
        await scheduler.resumeRefresh(true);

        t.is(scheduler.rowManager.rows.length, 1, 'RowManager has single row');
        t.is(scheduler.rowManager.topRow.top, 0, 'With correct position');
        t.selectorCountIs('[data-region=locked] .b-grid-row', 1, 'And only a single row in DOM');
    });

    t.it('Should show events when using manual event sizing', async t => {
        scheduler = await t.getSchedulerAsync({
            managedEventSizing : false
        });

        t.selectorCountIs(scheduler.unreleasedEventSelector, 5, 'Events rendered');
    });
});
