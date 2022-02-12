StartTest(t => {
    const scheduler = bryntum.query('scheduler');

    t.it('sanity', t => {
        t.chain(
            { waitForSelector : '.b-sch-range' },

            async() => {
                t.is(document.querySelectorAll('.b-sch-range').length, 4, 'Recurring time ranges are rendered (span)');
                t.is(document.querySelectorAll('.b-sch-line').length, 3, 'Recurring time ranges are rendered (line)');

                const
                    [first, second] = scheduler.features.timeRanges.store.getRange(),
                    { timeRanges }  = scheduler;

                t.ok(timeRanges.includes(first), 'Line occurrence is among time ranges');
                t.ok(timeRanges.includes(second), 'Range occurrence is among time ranges');

                t.is(first.occurrences.length, 2, '2 occurrences of line');
                t.is(second.occurrences.length, 3, '3 occurrences of range');

                t.ok(first.occurrences.every(o => timeRanges.includes(o)), 'All lines are in time ranges');
                t.ok(second.occurrences.every(o => timeRanges.includes(o)), 'All ranges are in time ranges');
            }
        );
    });
});
