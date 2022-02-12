StartTest(t => {
    t.it('Should not crash while routing', t => {
        t.chain(
            { waitForSelector : 'app-scheduler .b-sch-event' },
            { click : 'button:contains(Home)' },
            { waitForSelectorNotFound : 'app-scheduler .b-sch-event' },
            { waitForSelector : 'app-home' },
            { click : 'button:contains(Scheduler)' },
            { waitForSelectorNotFound : 'app-home' },
            { waitForSelector : 'app-scheduler .b-sch-event' }
        );

    });
    t.it('Should show event tooltip 2nd time correctly', t => {
        t.chain(
            { moveMouseTo : '.b-sch-event :contains(Click me)' },
            { waitForSelector : 'tooltip-renderer h3:contains(Click me)' },
            { moveMouseTo : [0, 0] },
            { waitForSelectorNotFound : 'tooltip-renderer h3:contains(Click me)' },
            { moveMouseTo : '.b-sch-event :contains(Click me)' },
            { waitForSelector : 'tooltip-renderer h3:contains(Click me)' }
        );
    });
});
