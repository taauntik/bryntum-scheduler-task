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

    // https://github.com/bryntum/support/issues/2021
    t.it('Should not throw exception on create task if no resource is available', t => {
        t.chain(
            { waitForSelector : '.b-sch-foreground-canvas' },

            (next) => {
                scheduler.resourceStore.removeAll();
                next();
            },

            { click : '.b-icon-add.b-icon' }
        );
    });
});
