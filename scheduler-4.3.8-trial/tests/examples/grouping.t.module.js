StartTest(t => {
    let scheduler;

    t.it('sanity', t => {
        t.chain(
            { waitForSelector : '.b-sch-foreground-canvas' },

            (next, el) => {
                scheduler = bryntum.fromElement(el[0], 'scheduler');
                next();
            },

            () => t.checkGridSanity(scheduler)
        );
    });

    t.it('Found by monkeys, crashed on group collapse in IE11', t => {
        t.chain(
            { click : '.b-grid-cell.b-group-title' }
        );
    });
});
