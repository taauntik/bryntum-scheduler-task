StartTest(t => {

    const scheduler = bryntum.query('scheduler');

    t.it('Should support dragging right splitter', t => {
        t.firesAtLeastNTimes(scheduler.timeAxisSubGrid, 'resize', 1);

        t.chain(
            { drag : '.b-grid-splitter[data-region=normal]', by : [-100, 0] }
        );
    });
});
