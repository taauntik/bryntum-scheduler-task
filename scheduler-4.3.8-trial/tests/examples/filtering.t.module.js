StartTest(t => {
    const scheduler = bryntum.query('scheduler');

    t.it('should filter events', t => {
        t.chain(
            { type : 's', target : '[data-ref=filterByName] input'},

            { waitForElementNotVisible : '.b-sch-event:contains(marketing)'},

            next => {
                t.selectorCountIs(scheduler.unreleasedEventSelector, 4, 'Events filtered out');
                next();
            },

            { type : '[ESC]' },

            { waitForElementVisible : '.b-sch-event:contains(marketing)'},

            () => t.selectorCountIs(scheduler.unreleasedEventSelector, 7, 'Events unfiltered')
        );
    });

    t.it('should highlight events', t => {
        t.chain(
            { click : '[data-ref=highlight] input' },

            { type : 's' },

            { waitForSelector : '.b-match' },

            next => {
                t.selectorCountIs('.b-match', 4, 'Events highlighted');
                next();
            },

            { type : '[ESC]' },

            { waitForSelectorNotFound : '.b-match', desc : 'Events unhighlighted' }
        );
    });
});
