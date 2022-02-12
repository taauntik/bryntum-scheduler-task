StartTest(t => {
    let scheduler;

    function createScheduler(config) {
        scheduler = t.getVerticalScheduler(config);
    }

    t.beforeEach((t, next) => {
        scheduler && scheduler.destroy();

        createScheduler();

        // wait till scheduler gets rendered before launching a sub-test
        t.waitFor(() => scheduler.rendered, next);
    });

    t.it('scrollToDate', async t => {
        await scheduler.scrollToDate(new Date(2019, 5, 16));

        t.is(scheduler.scrollLeft, 0, 'Not scrolled horizontally');
        t.isApprox(scheduler.scrollTop, 377, 'Scrolled vertically');

        await scheduler.scrollToDate(new Date(2019, 4, 28));

        t.is(scheduler.scrollLeft, 0, 'Not scrolled horizontally');
        t.isApprox(scheduler.scrollTop, 100, 'Scrolled vertically');
    });

    t.it('Vertical scroll should not change when view is focused', t => {
        t.chain(
            () => {
                scheduler.scrollable.y = scheduler.scrollable.maxY;

                return scheduler.scrollable.await('scrollEnd');
            },
            async() => t.wontFire(scheduler.scrollable, 'scrollStart'),
            { click : '.b-last' },
            { waitForSelectorNotFound : '.b-scrolling' },
            () => {
                t.isApprox(scheduler.scrollable.y, scheduler.scrollable.maxY, 1, 'Top scroll position is correct');
            }
        );
    });

    // https://github.com/bryntum/support/issues/1416
    t.it('Should be no errors when set timespan out of rendered bounds', async (t) => {
        const date = new Date(2019, 10, 10);

        scheduler.zoomLevel = 17;

        let commonStartDate = new Date(date.getFullYear(), date.getMonth(), 1, 0),
            commonEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 24);

        scheduler.setTimeSpan(commonStartDate, commonEndDate);
        scheduler.scrollable.y = scheduler.scrollable.maxY;

        await scheduler.scrollable.await('scrollEnd');

        commonStartDate = new Date(date.getFullYear(), date.getMonth(), 12, 0);
        commonEndDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 24);

        scheduler.setTimeSpan(commonStartDate, commonEndDate);
    });
});
