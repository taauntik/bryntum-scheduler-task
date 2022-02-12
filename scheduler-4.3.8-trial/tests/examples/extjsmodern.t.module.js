StartTest(t => {
    t.it('Should remove newly created event on cancel', t => {
        t.chain(
            { waitForSelector : '.b-sch-event' },

            { doubleClick : '[data-id=r6] .b-sch-timeaxis-cell', offset : [50, 20] },

            { waitFor : () => t.query('input[name=resourceId]')[0].value === 'Peter' },

            next => {
                t.pass('Correct resource in editor');
                t.elementIsNotVisible('.x-button:textEquals(Delete)', 'Delete button not shown');
                next();
            },

            { click : '.x-button:textEquals(Cancel)' },

            () => {
                t.selectorNotExists('.b-sch-event-wrap:textEquals(New event)', 'Event removed');
            }
        );
    });

    t.it('Should not remove existing edited event on cancel', t => {
        t.chain(
            { doubleClick : '.b-sch-event-wrap:textEquals(Task 2)' },

            { waitFor : () => t.query('input[name=resourceId]')[0].value === 'Linda' },

            async() => {
                t.pass('Correct resource in editor');
                t.elementIsVisible('.x-button:textEquals(Delete)', 'Delete button shown');
            },

            { click : '.x-button:textEquals(Cancel)' },

            () => {
                t.selectorExists('.b-sch-event-wrap:textEquals(Task 2)', 'Event not removed');
            }
        );
    });
});
