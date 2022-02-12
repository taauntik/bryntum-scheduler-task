
StartTest(t => {
    let scheduler, tickSize, event;

    document.body.style.width = '800px';

    async function setup(config = {}) {
        if (scheduler) scheduler.destroy();

        scheduler = await t.getSchedulerAsync(Object.assign({
            viewPreset : 'dayAndWeek',
            startDate  : new Date(2010, 0, 6),
            endDate    : new Date(2010, 2, 1),

            events : [
                {
                    id         : 1,
                    name       : 'Test event',
                    resourceId : 'r1',
                    startDate  : new Date(2010, 0, 11),
                    endDate    : new Date(2010, 0, 14)
                }
            ],

            // TODO: PORT tree later
            resourceStore : /*config.__tree ? t.getResourceTreeStore() :*/ t.getResourceStore(),

            features : {
                eventDrag : { showTooltip : false }
            }
        }, config));

        scheduler.timeAxis.filterBy(tick =>
            tick.startDate.getDay() !== 6 && tick.startDate.getDay() !== 0
        );

        tickSize = scheduler.timeAxisViewModel.tickSize;
        event = scheduler.eventStore.first;
    }

    const getTestSteps = t => [
        () => scheduler.scrollEventIntoView(event),

        {
            drag : '.b-sch-event',
            by   : () => [-tickSize, 0]
        },

        () => {
            t.is(event.startDate, new Date(2010, 0, 8), "Event's start date has been changed according to the proxy element's position");
        }
    ];
    // eof test steps

    t.it('Plain horizontal scheduler', async t => {
        await setup();

        t.chain(getTestSteps(t));
    });

    //TODO: PORT tree later
    t.xit('Tree scheduler', async t => {
        await setup({
            __tree : true
        });

        t.chain(getTestSteps(t));
    });
});
