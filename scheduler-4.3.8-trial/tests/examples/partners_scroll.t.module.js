StartTest(t => {
    // Sequence fails with very quick (faster than a human can do) click sequence after a delete.
    t.it('Scroll should be synced', t => {
        const [topScheduler, bottomScheduler] = bryntum.queryAll('scheduler');

        t.checkGridSanity(topScheduler);

        t.chain(
            // Wait for both schedulers to render events
            { waitForSelector : '[data-ref=top-scheduler] .b-sch-event' },
            { waitForSelector : '[data-ref=bottom-scheduler] .b-sch-event' },

            next => {
                topScheduler.subGrids.normal.scrollable.x = 100;
                next();
            },

            { waitFor : () => bottomScheduler.subGrids.normal.scrollable.x === 100 },

            // Allow UI to catch up now that we have shorter waitFors
            { waitForAnimationFrame : null },

            next => {
                bottomScheduler.subGrids.normal.scrollable.x = 50;
                next();
            },

            { waitFor : () => topScheduler.subGrids.normal.scrollable.x === 50 },

            // Allow UI to catch up now that we have shorter waitFors
            { waitForAnimationFrame : null },

            next => {
                // Should be able to destroy a partner with no errors
                bottomScheduler.destroy();

                // Wait for the scroll event to fire. Nothing should happen
                // if the link has been broken property upon destruction
                t.waitForEvent(topScheduler.subGrids.normal.scrollable, 'scroll', next);

                topScheduler.subGrids.normal.scrollable.x = 100;
            },

            () => {
                t.pass('Scrolled correctly');
            }
        );
    });
});
