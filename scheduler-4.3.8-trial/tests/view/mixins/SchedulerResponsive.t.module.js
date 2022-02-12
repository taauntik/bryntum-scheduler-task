StartTest(t => {
    let scheduler;

    t.it('Should apply configs from responsiveLevels', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate : new Date(2011, 0, 3),
            endDate   : new Date(2011, 0, 20),

            responsiveLevels : {
                small : {
                    levelWidth : 400,
                    barMargin  : 0
                },
                normal : {
                    levelWidth : '*',
                    barMargin  : 10
                }
            }
        });

        t.is(scheduler.barMargin, 10, 'Initial barMargin correct');

        t.chain(
            // FF, give ResizeObserver time to settle down...
            { waitFor : 100 },

            {
                waitForEvent : [window, 'resize'],
                trigger      : () => {
                    t.setWindowSize(300, 768);
                }
            },

            // FF, give ResizeObserver time to settle down...
            { waitFor : 100 },

            { waitFor : () => scheduler.responsiveLevel === 'small' },

            next => {
                t.is(scheduler.barMargin, 0, 'Correct barMargin after shrink');
                next();
            },

            {
                waitForEvent : [window, 'resize'],
                trigger      : () => {
                    t.setWindowSize(500, 768);
                }
            },

            // FF, give ResizeObserver time to settle down...
            { waitFor : 100 },

            { waitFor : () => scheduler.responsiveLevel === 'normal' },

            () => {
                t.is(scheduler.barMargin, 10, 'Correct barMargin after grow');
            }
        );
    });
});
