StartTest(function(t) {
    // eslint-disable-next-line no-unused-vars
    var scheduler = bryntum.query('scheduler');

    t.it('sanity', t => {
        t.chain(
            () => t.checkGridSanity(scheduler)
        );
    });

    // Dragging outside the TimeAxisViewModel's right edge threw an error.
    t.it('Monkey-discovered failure vector', function(t) {
        // This should not throw
        t.chain({ action : 'drag', target : [727, 350], to : [1021, 577] });
    });
});
