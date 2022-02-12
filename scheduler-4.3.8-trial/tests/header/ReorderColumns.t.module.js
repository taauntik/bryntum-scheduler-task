StartTest(t => {
    let scheduler;

    t.beforeEach(t => scheduler && scheduler.destroy());

    t.it('Reordering columns should not destroy timeaxis column content', t => {
        scheduler = t.getScheduler({
            viewPreset   : 'weekAndDay',
            weekStartDay : 1,
            appendTo     : document.body,
            startDate    : new Date(2011, 0, 3),
            endDate      : new Date(2011, 0, 10),
            columns      : [
                { text : 'First' },
                { text : 'Surname' }
            ]
        });

        t.chain(
            {
                drag : '.b-grid-header-text:textEquals(Surname)',
                to   : '.b-grid-header-text:textEquals(First)'
            },

            next => {
                t.selectorExists('.b-sch-header-timeaxis-cell:contains(03 Jan)', 'Timeaxis intact');
            }
        );
    });
});
