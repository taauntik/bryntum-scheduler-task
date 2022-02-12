StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler && scheduler.destroy());

    // --------------------------------------------------
    function checkBoxes(scheduler, t) {
        const
            [event1, event2] = scheduler.eventStore,
            [eventBox1]      = scheduler.getItemBox(event1),
            [eventBox2]      = scheduler.getItemBox(event2);

        t.isGreater(eventBox1.height, 0, 'EventBox1 height should be greater then 0');
        t.isGreater(eventBox1.width, 0, 'EventBox1 width should be greater then 0');

        t.isGreater(eventBox2.height, 0, 'EventBox2 height should be greater then 0');
        t.isGreater(eventBox2.width, 0, 'EventBox2 width should be greater then 0');

        t.isLess(eventBox1.top, eventBox2.top, 'EventBox 1 should be reported being above EventBox 2');
    }

    function withSchedulerHidden(scheduler, exec) {
        scheduler.element.style.display = 'none';
        exec();
        scheduler.element.style.display = 'block';
    }

    // --------------------------------------------------

    t.it(
        "Scheduler view should report meaningfull item box even if it's not displayed, i.e. it should calculate item" +
        'position based on dates, row number an item is, row height etc',
        async t => {
            scheduler = await t.getSchedulerAsync({}, 2);

            t.diag('Unhidden case');
            checkBoxes(scheduler, t);

            withSchedulerHidden(scheduler, () => {
                t.diag('Hidden case');
                checkBoxes(scheduler, t);
            });
        });
});
