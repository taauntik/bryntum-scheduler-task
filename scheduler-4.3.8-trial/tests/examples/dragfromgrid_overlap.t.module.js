StartTest(t => {
    const scheduler = bryntum.query('schedule');

    // Avoid scrolling triggered in test
    scheduler.timeAxisViewModel.forceFit = true;

    t.it('Should respect allowOverlap config', async t => {
        scheduler.allowOverlap = false;

        t.chain(
            { drag : '.b-unplannedgrid .b-grid-row', to : '.b-sch-event', toOffset : ['100%+10', '50%'] },
            async() => {
                t.isApprox(document.querySelector('.b-scheduler .b-grid-row').offsetHeight, scheduler.rowHeight, 5, 'No overlap');

                t.is(scheduler.resources[0].events.length, 2, 'No extra event dropped');

                scheduler.allowOverlap = true;
            }
        );
    });
});
