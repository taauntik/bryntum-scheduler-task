StartTest(t => {
    t.setWindowSize([1024, 500]);

    const scheduler = bryntum.query('schedulerbase');

    t.it('Webpack demo sanity test', t => {
        t.chain(
            { waitFor : () => scheduler, desc : 'scheduler is here' },
            { waitForSelector : '.demo-header' },
            { waitForSelector : '.b-sch-event' },
            () => {
                const
                    headerElement = document.querySelector('.demo-header'),
                    headerRect = headerElement.getBoundingClientRect();
                t.isApproxPx(headerRect.top, 0, 'Header has valid top');
                t.is(window.getComputedStyle(headerElement).backgroundColor, 'rgb(38, 103, 200)', 'Header has valid color');
                t.is(scheduler.eventStore.count, 17, 'Event store count is ok');
                t.selectorCountIs('.b-sch-event', 17, 'Event selector count is ok');
            }
        );
    });
});
