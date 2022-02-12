StartTest(t => {
    t.diag('Bug with scrollToDate after setTimeSpan');

    const scheduler = t.getScheduler({
        viewPreset   : 'weekAndDay',
        weekStartDay : 1,
        startDate    : new Date(2011, 0, 1),
        endDate      : new Date(2011, 0, 20)
    });

    let expectedHeaderX;

    t.chain(
        { waitForProjectReady : scheduler },

        async() => {
            const targetDate = new Date(2011, 0, 14);
            scheduler.setTimeSpan(new Date(2011, 0, 2), new Date(2011, 0, 11));

            // Calculate the scroll position to bring the whole tick into view.
            const datePos   = scheduler.getCoordinateFromDate(targetDate, true);
            expectedHeaderX = datePos - scheduler.timeAxisSubGridElement.offsetWidth + scheduler.timeAxisViewModel.tickSize;

            await scheduler.scrollToDate(targetDate);
        },

        // Wait for UI to catch up
        {
            waitFor : () => {
                const
                    headerX = scheduler.timeAxisSubGrid.header.scrollable.x,
                    scrollX = scheduler.timeAxisSubGrid.scrollable.x;

                return headerX === expectedHeaderX &&
                       headerX === scrollX;
            }
        }
    );
});
