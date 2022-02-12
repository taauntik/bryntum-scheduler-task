import { Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    async function getScheduler(config = {}) {
        scheduler && scheduler.destroy();

        scheduler = new Scheduler(Object.assign({
            appendTo : document.body,

            subGridConfigs : {
                left : {
                    width : 160
                },
                right : {
                    width : 240
                }
            },

            startDate : new Date(2019, 1, 17),
            endDate   : new Date(2019, 1, 24),

            resources : [
                { id : 'r1', name : 'Resource 1', value : 100 }
            ],

            events : [
                { id : 'e1', resourceId : 'r1', startDate : new Date(2019, 1, 17), duration : 1 }
            ],

            columns : [
                { field : 'name', text : 'Name', width : 160, region : 'left' },
                { field : 'value', text : 'Value', width : 240, region : 'right' }
            ]
        }, config));

        await t.waitForProjectReady();
    }

    t.it('Sanity', async t => {
        await getScheduler();

        t.chain(
            // Scheduler resizes with delay
            { waitFor : () => scheduler.foregroundCanvas.offsetWidth < 800 },

            () => {
                t.selectorCountIs('.b-sch-event', 1, 'Single event rendered');

                t.is(document.querySelector('.b-sch-event').getBoundingClientRect().left, 165, 'Correct event left pos');
                t.is(document.querySelector('.b-sch-header-row-1').offsetWidth, 614, 'Correct header width');
                t.is(scheduler.foregroundCanvas.offsetWidth, 614, 'Correct foregroundCanvas width');
            }
        );
    });

    // https://github.com/bryntum/support/issues/1880
    t.it('Should support dragging right splitter', async t => {
        await getScheduler();

        t.chain(
            { drag : '.b-grid-splitter[data-region=normal]', by : [40, 0] },

            () => t.is(scheduler.subGrids.right.element.offsetWidth, 200, 'Width updated')
        );
    });
});
