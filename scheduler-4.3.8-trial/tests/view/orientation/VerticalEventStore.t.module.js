import { EventStore, Rectangle } from '../../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler, eventStore;

    async function createScheduler(config) {
        scheduler = await t.getVerticalSchedulerAsync(config);

        eventStore = scheduler.eventStore;
    }

    // async beforeEach doesn't work in umd
    t.beforeEach(async(t, next) => {
        scheduler && scheduler.destroy();

        await createScheduler();

        next();
    });

    function assertEventElement(t, eventId, resourceId, x = null, y, width, height, msg = '') {
        const selector = `[data-resource-id="${resourceId}"][data-event-id="${eventId}"]:not(.b-released)`;

        if (x === null) {
            t.selectorNotExists(selector, 'Element not found');
        }
        else {
            t.selectorExists(selector, 'Element found ' + msg);

            const box = Rectangle.from(document.querySelector(selector), scheduler.timeAxisSubGridElement);

            t.isApproxPx(box.top, y, 'Correct top');
            t.isApproxPx(box.left, x, 'Correct left');
            t.isApproxPx(box.width, width, 'Correct width');
            t.isApproxPx(box.height, height, 'Correct height');
        }
    }

    t.it('CRUD - Add', async t => {
        t.diag('Add in view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 2,
                releaseEvent : 0
            },
            async during() {
                eventStore.add({
                    id         : 100,
                    name       : 'New event 100',
                    startDate  : new Date(2019, 4, 27),
                    duration   : 3,
                    resourceId : 'r4'
                });

                await t.waitForProjectReady();
            }
        });

        t.selectorExists('[data-resource-id="r4"][data-event-id="100"]', 'Element found');

        t.diag('Add outside of view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 0,
                releaseEvent : 0
            },
            async during() {
                eventStore.add({
                    id         : 101,
                    name       : 'New event 101',
                    startDate  : new Date(2019, 5, 30),
                    duration   : 3,
                    resourceId : 'r4'
                });

                await t.waitForProjectReady();
            }
        });

        t.selectorNotExists('[data-resource-id="r4"][data-event-id="101"]', 'Element not found');

        scheduler.scrollable.scrollTo(0, scheduler.scrollable.maxY);

        t.waitForSelector('[data-resource-id="r4"][data-event-id="101"]');

        // TODO: Add multiple
    });

    t.it('CRUD - Remove', async t => {
        t.diag('Remove from view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 1, // Event 2 shares width with Event 1 and will be rerendered
                releaseEvent : 1
            },
            async during() {
                eventStore.remove(1);

                await t.waitForProjectReady();
            }
        });

        t.selectorNotExists('[data-resource-id="r1"][data-event-id="1"]:not(.b-released)');

        t.diag('Remove from outside of view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 0,
                releaseEvent : 0
            },
            async during() {
                eventStore.remove(7);

                await t.waitForProjectReady();
            }
        });

        scheduler.scrollable.scrollTo(0, 1000);

        t.waitForSelector('[data-resource-id="r1"][data-event-id="6"]', () => {
            t.selectorNotExists('[data-resource-id="r1"][data-event-id="7"]', 'Element not found after scroll');
        });
    });

    t.it('CRUD - Remove all', async t => {
        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 0,
                releaseEvent : 5
            },
            async during() {
                eventStore.removeAll();

                await t.waitForProjectReady();
            }
        });

        t.selectorNotExists('.b-sch-event-wrap:not(.b-released)', 'No elements visible');
    });

    t.it('CRUD - Update "internal"', async t => {
        t.diag('Update name in view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 1,
                releaseEvent : 0
            },
            async during() {
                eventStore.first.name = 'New name';
            }
        });

        t.selectorExists('[data-resource-id="r1"][data-event-id="1"]:contains(New name)', 'Updated');

        t.diag('Update name outside of view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 0,
                releaseEvent : 0
            },
            async during() {
                eventStore.getById(7).name = 'New name 2';

                await t.waitForProjectReady();
            }
        });

        t.selectorNotExists('[data-resource-id="r1"][data-event-id="7"]:contains(New name 2)', 'Element not found');

        scheduler.scrollEventIntoView(eventStore.getById(7));
        // Need to wait for scroll event, events are updated by that
        await scheduler.await('scroll');

        t.selectorExists('[data-resource-id="r1"][data-event-id="7"]:contains(New name 2)', 'Element found after scroll');
    });

    t.it('CRUD - Update affecting pos', async t => {
        t.diag('Update pos in view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 2, // Moved event + event that it shared width with
                releaseEvent : 0
            },
            async during() {
                eventStore.first.startDate = new Date(2019, 5, 3);

                await t.waitForProjectReady();
            }
        });

        assertEventElement(t, 1, 'r1', 0, 400, 150, 100);

        t.diag('Update pos out of view -> into view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 1, // Moved event
                releaseEvent : 0
            },
            async during() {
                eventStore.getById(7).startDate = new Date(2019, 4, 27);

                await t.waitForProjectReady();
            }
        });

        assertEventElement(t, 7, 'r1', 0, 50, 150, 100);

        t.diag('Update pos out of view -> out of view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 0,
                releaseEvent : 0
            },
            async during() {
                eventStore.getById(6).startDate = new Date(2019, 5, 23);

                await t.waitForProjectReady();
            }
        });

        assertEventElement(t, 6, 'r1', undefined, null);

        scheduler.scrollEventIntoView(eventStore.getById(6));
        // Need to wait for scroll event, events are updated by that
        await scheduler.await('scroll');

        assertEventElement(t, 6, 'r1', 0, 1400, 150, 100, 'after scroll');

        t.diag('Update pos in view -> out of view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 0,
                releaseEvent : 1
            },
            async during() {
                eventStore.getById(6).startDate = new Date(2019, 4, 28);

                await t.waitForProjectReady();
            }
        });

        assertEventElement(t, 6, 'r1');

        scheduler.scrollToTop();
        t.waitForSelector('[data-resource-id="r1"][data-event-id="6"]:not(.b-released)', () => {
            assertEventElement(t, 6, 'r1', 75, 100, 75, 100, 'after scroll');
        });
    });

    t.it('CRUD - Update affecting resourceId', async t => {
        t.diag('Move in view -> in view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 2,
                releaseEvent : 0
            },
            async during() {
                eventStore.first.resourceId = 'r2';
                await scheduler.project.commitAsync();
            }
        });

        assertEventElement(t, 1, 'r2', 150, 100, 150, 100);

        t.diag('Move in view -> outside of view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 0,
                releaseEvent : 1
            },
            async during() {
                eventStore.first.resourceId = 'r9';
                await scheduler.project.commitAsync();
            }
        });

        assertEventElement(t, 1, 'r9');

        await scheduler.scrollEventIntoView(eventStore.getById(1));

        assertEventElement(t, 1, 'r9', 1200, 100, 150, 100);

        t.diag('Move outside of view -> outside of view');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 0,
                releaseEvent : 0
            },
            async during() {
                eventStore.getById(6).resourceId = 'r2';
                await scheduler.project.commitAsync();
            }
        });

        assertEventElement(t, 6, 'r2');

        await Promise.all([
            scheduler.scrollEventIntoView(eventStore.getById(6)),
            scheduler.scrollable.await('scrollEnd')
        ]);

        assertEventElement(t, 6, 'r2', 150, 1250, 150, 100);

        t.diag('Unassign');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 0,
                releaseEvent : 1
            },
            async during() {
                eventStore.getById(6).resourceId = null;
                await scheduler.project.commitAsync();
            }
        });

        assertEventElement(t, 6, 'r2');
    });

    t.it('CRUD - Replace', async t => {
        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : '<=5', // Event 2 rerenders, Event 1 changes resource, Event 1 moves in time
                releaseEvent : '<=1' // TODO: Should be 0, but feel not worth spending time on
            },
            async during() {
                eventStore.add({
                    id         : 1,
                    resourceId : 'r2',
                    name       : 'Event 1',
                    startDate  : new Date(2019, 4, 29),
                    duration   : 2
                });

                await t.waitForProjectReady();
            }
        });

        assertEventElement(t, 1, 'r1');
        assertEventElement(t, 1, 'r2', 150, 150, 150, 100);
    });

    t.it('CRUD - Changing id', t => {
        scheduler.eventStore.first.id = 5000;

        t.selectorExists('[data-event-id="5000"]', 'New id found in DOM');
        t.selectorNotExists('[data-event-id="1"]', 'Old id gone from DOM');
    });

    t.it('Filtering', async t => {
        t.diag('Applying filter');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 0,
                releaseEvent : 2
            },
            async during() {
                eventStore.filter(r => r.id < 4);
            }
        });

        assertEventElement(t, 1, 'r1', 0, 100, 75, 100, ', not filtered out');
        assertEventElement(t, 5, 'r4');

        t.diag('Removing filters');

        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 2,
                releaseEvent : 0
            },
            async during() {
                eventStore.clearFilters();
            }
        });

        assertEventElement(t, 5, 'r4', 450, 650, 150, 100);
    });

    t.it('Change EventStore', async t => {
        await t.firesOk({
            observable : scheduler,
            events     : {
                renderEvent  : 1,
                releaseEvent : 5 // All assignments are released
            },
            async during() {
                scheduler.eventStore = new EventStore({
                    data : [
                        { id : 999, name : 'Event 1', resourceId : 'r2', startDate : new Date(2019, 4, 28), duration : 2 }
                    ]
                });
                await t.waitForProjectReady();
            }
        });

        t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Single event visible');

        assertEventElement(t, 999, 'r2', 150, 100, 150, 100);
    });

    t.it('Should handle batch changes', async t => {
        eventStore.beginBatch();

        eventStore.first.name = 'Changed';
        eventStore.getById(2).resourceId = 'r2';

        eventStore.endBatch();

        await t.waitForProjectReady();

        assertEventElement(t, 1, 'r1', 0, 100, 150, 100);
        assertEventElement(t, 2, 'r2', 150, 150, 75, 200);

        t.selectorExists('[data-event-id="1"]:textEquals(Changed)', 'Text changed');
    });
});
