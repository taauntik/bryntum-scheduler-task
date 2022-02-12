StartTest(t => {
    let scheduler;

    t.it('Should support rendering + dragging event in a webcomponent', async t => {

        t.chain(
            { waitForSelector : 'bryntum-scheduler -> .b-sch-foreground-canvas' },

            async () => {
                scheduler = bryntum.query('scheduler');
                t.isInstanceOf(scheduler.element.querySelector('.b-sch-event'), HTMLElement, 'event rendered');

                t.firesOnce(scheduler, 'eventclick');
                t.firesOnce(scheduler.eventStore, 'update');
            },

            { click : 'bryntum-scheduler -> .b-sch-event:contains(Click me)' },
            { drag : 'bryntum-scheduler -> .b-sch-event', by : [100, 100] },

            () => {
                const movedTask     = scheduler.eventStore.changes.modified[0];

                t.is(movedTask.resource.name, 'Sergei', 'Resource updated');
                t.is(movedTask.startDate, new Date(2018, 3, 4), 'Start Date updated');
            }
        );
    });

    t.it('Should support typing', async t => {
        t.firesOnce(scheduler, 'eventdblclick');
        t.firesOnce(scheduler.eventStore, 'update');

        t.chain(
            { doubleClick : 'bryntum-scheduler -> .b-sch-event:contains(Click me)' },
            { type : 'foo[ENTER]', clearExisting : true },
            { waitForSelector : 'bryntum-scheduler -> .b-sch-event:textEquals(foo)' }
        );
    });
});
