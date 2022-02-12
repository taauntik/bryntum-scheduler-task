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

    // Monkey-found bug
    t.it('Should run this monkey-test sequence with no errors', t => {
        t.chain(
            { action : 'drag', target : [274, 329], to : [987, 346] },
            { doubleclick : [835, 159] },
            { doubleclick : [694, 603] }
        );
    });
});
