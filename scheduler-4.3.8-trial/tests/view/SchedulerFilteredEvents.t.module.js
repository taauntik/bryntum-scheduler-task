import { ResourceStore, AssignmentStore } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler && !scheduler.isDestroyed && scheduler.destroy();
        document.body.innerHTML = '';
    });

    // Ported from 2101_view_filter.t.js
    t.it('View should not render filtered events', async t => {
        scheduler = await t.getSchedulerAsync();

        scheduler.eventStore.filter({ filterBy : () => false });
        t.is(scheduler.eventStore.count, 0, 'All events are filtered from store');
        t.selectorNotExists(scheduler.unreleasedEventSelector, 'Rendered events are filtered');

        scheduler.eventStore.clearFilters();

        t.selectorExists(scheduler.unreleasedEventSelector, 'Events are no longer filtered');
    });

    // Ported from 2101_view_filter.t.js
    t.it('View should not render filtered events (multiassignment)', async t => {
        const resourceStore = new ResourceStore({
            data : [{ id : 'r1', name : 'Albert' }]
        });

        scheduler     = await t.getSchedulerAsync({
            resourceStore,
            assignmentStore : new AssignmentStore({
                data : [{ eventId : 1, resourceId : 'r1' }]
            }),
            eventStore : t.getEventStore({
                data : [{ id : 1, startDate : new Date(2011, 0, 4), endDate : new Date(2011, 0, 5) }]
            })
        });

        scheduler.assignmentStore.filter({ filterBy : ()  => false });

        t.selectorNotExists(scheduler.unreleasedEventSelector, 'Rendered events are filtered');

        scheduler.assignmentStore.clearFilters();

        t.selectorExists(scheduler.unreleasedEventSelector, 'Events are no longer filtered');
    });

    // Ported from 2101_view_filter.t.js
    t.it('Filter out events while editing', async t => {
        const scheduler = await t.getSchedulerAsync({

            eventStore : t.getEventStore({

                reapplyFilterOnUpdate : true,

                data : (() => {
                    const events = [];
                    for (let i = 1; i <= 6; i++) {
                        events.push({
                            id         : i,
                            resourceId : 'r2',
                            cls        : 'green',
                            name       : 'Assignment ' + i,
                            startDate  : new Date(2011, 0, 3 + i),
                            endDate    : new Date(2011, 0, 5 + i)
                        });
                    }

                    return events;
                })()

            })
        });

        scheduler.eventStore.filter({ filterBy : event => !event.cls.isEqual('red') });

        const
            resourceStore = scheduler.resourceStore,
            resource = resourceStore.getById('r2'),
            events = resource.events.slice();

        t.is(events.length, 6, 'Event has 6 items');

        events.forEach(event => {
            event.cls = 'red';
        });

        t.selectorNotExists(scheduler.unreleasedEventSelector, 'Rendered events are filtered');

        scheduler.destroy();
    });

    t.it('View should derender an event moved to a filtered out resource', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate : new Date(2011, 0, 3),
            endDate   : new Date(2011, 0, 5),
            resources : [
                {
                    id   : 1,
                    name : 'Mike'
                },
                {
                    id   : 2,
                    name : 'Dan'
                }
            ],

            events : [
                {
                    id         : 1,
                    resourceId : 1,
                    startDate  : new Date(2011, 0, 3),
                    duration   : 1
                }
            ]
        });

        const dan = scheduler.resourceStore.getAt(1);

        scheduler.resourceStore.filter({ filterBy : resource => resource.name === 'Mike' });

        scheduler.eventStore.first.assign(dan);

        t.chain(
            { waitForSelectorNotFound : scheduler.unreleasedEventSelector }
        );
    });
});
