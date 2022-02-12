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

    t.it('Found by monkeys', t => {
        t.chain(
            {'click' : [826, 220]},
            {'type' : ",)rqkv[DELETE]uSo\\'O&j/"},
            {'rightclick' : [954, 178]}
        );
    });
});
