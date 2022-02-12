StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler && scheduler.destroy());

    // https://app.assembla.com/spaces/bryntum/tickets/8403
    t.it('Should not crash when ending outside of timeaxis', t => {
        scheduler = t.getScheduler({
            appendTo    : document.body,
            width       : 800,
            columns     : [],
            viewPreset  : 'weekAndMonth',
            workingTime : {
                fromDay : 1,
                toDay   : 6
            },
            startDate : '2019-05-22',
            endDate   : '2019-05-30',
            features  : {
                eventEdit : false
            }
        });

        t.chain(
            { drag : '.b-grid-cell', offset : ['100%-100', '50%'], by : [100, 0] },

            { waitForSelector : '.b-sch-event', desc : 'Event created' },

            () => {
                t.pass('No crash');
            }
        );
    });
});
