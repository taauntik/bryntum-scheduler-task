import { Rectangle } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    const scheduler = bryntum.query('scheduler');

    t.it('sanity', t => {
        t.chain(
            { waitForSelector : '.b-sch-foreground-canvas' },

            () => t.checkGridSanity(scheduler)
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7620
    t.it('Events should have correct position after collapse', async t => {

        await t.waitForProjectReady(scheduler);

        scheduler.features.groupSummary.collapseToHeader = false;

        t.chain(
            { waitForSelector : '.b-sch-event' },

            () => scheduler.scrollable.scrollTo(0, scheduler.scrollable.maxY - 100),

            { waitForAnimationFrame : null },

            { click : '.b-group-title:contains("Sales (1)")' },

            {
                waitFor : () => {
                    const box = Rectangle.from(document.querySelector('[data-event-id=e3]'), scheduler.bodyContainer);
                    return Math.abs(box.top - 1016) < 15;
                },
                desc : 'Event element at correct location'
            },

            () => t.selectorExists('.b-resource-info:contains(Brett Hornbach)', 'Cell contents cleared correctly when using GroupSummary + ResourceInfo column combo, see Row#renderCell for comments')
        );
    });
});
