StartTest(t => {
    let scheduler;

    t.beforeEach(t => {
        scheduler && scheduler.destroy();

        scheduler = t.getScheduler({
            features : {
                eventDrag : {
                    showTooltip : false
                }
            }
        });
    });

    t.it('Should not change a record after trying to drag it outside of the chart', async t => {
        t.wontFire(scheduler.eventStore, 'update');

        await t.waitForProjectReady(scheduler);

        const
            element   = document.querySelector('[data-event-id="1"]'),
            startRect = element.getBoundingClientRect();
        t.chain(
            { drag : element, to : [5, 5] },
            { waitFor : () => t.sameRect(element.getBoundingClientRect(), startRect), desc : 'Event returned to initial position' }
        );
    });

    t.it('Event shouldn\'t disappear after drag aborted with ESC (Bug #62)', t => {
        t.chain(
            { waitForEventsToRender : null },
            { drag : '[data-event-id="1"]', by : [200, 0], dragOnly : true },
            { type : '[ESC]' },
            { waitFor : 500 },
            async() => {
                scheduler.refresh();
            },
            { waitForElementVisible : '[data-event-id="1"]' }
        );
    });

});
