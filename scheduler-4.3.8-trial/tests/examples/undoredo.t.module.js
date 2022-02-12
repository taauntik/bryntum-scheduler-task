StartTest(t => {
    const combo = bryntum.fromElement(document.querySelector('[data-ref=transactionsCombo]'));
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

    t.it('Should be able to reschedule an event whose dependent event is unrendered due to tree collapsing', t => {
        t.chain(
            { drag : '.b-sch-event:contains(Krasnodar)', by : [100, 50] },

            { waitForSelector : '[data-ref=undoBtn][data-badge="1"]' },
            { waitForSelector : '[data-ref=redoBtn][data-badge=""]' },

            (next) => {
                t.is(combo.inputValue, '1 undo actions / 0 redo actions');

                next();
            },

            { click : '[data-ref=undoBtn][data-badge="1"]' },

            { waitForSelector : '[data-ref=redoBtn][data-badge="1"]' },
            { waitForSelector : '[data-ref=undoBtn][data-badge=""]' },

            next => {
                t.is(combo.inputValue, '0 undo actions / 1 redo actions');
                next();
            },

            { click : '[data-ref=redoBtn][data-badge="1"]' },

            { waitForSelector : '[data-ref=redoBtn][data-badge=""]' },
            { waitForSelector : '[data-ref=undoBtn][data-badge="1"]' }
        );
    });
});
