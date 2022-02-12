import { BrowserHelper } from '../../build/scheduler.module.js?456730';

StartTest({ defaultTimeout : 90000 }, t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    t.it('TOUCH: Touch drag should work', async t => {
        scheduler = await t.getSchedulerAsync(null, 1);

        const event = scheduler.eventStore.first;

        t.firesOnce(scheduler.eventStore, 'update');

        await t.delayedTouchDragBy('.b-sch-event:contains(Assignment 1)', [100, 100]);

        await t.waitForSelectorNotFound('.b-dragging');

        await t.waitForProjectReady();

        t.is(event.startDate, new Date(2011, 0, 5), 'Event moved in time');
        t.is(event.resource.name, 'Don', 'Event moved vertically');
    });
});
