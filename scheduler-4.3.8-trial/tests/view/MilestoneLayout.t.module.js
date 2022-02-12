import { Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler, first, second, third, firstElement, secondElement, thirdElement;

    t.beforeEach(function() {
        scheduler && scheduler.destroy && scheduler.destroy();
    });

    async function createScheduler(config = {}) {
        scheduler = new Scheduler(Object.assign({

            appendTo : document.body,

            startDate : '2018-03-19',
            endDate   : '2018-03-25',

            resources : [
                { id : 1, name : 'Demo' }
            ],

            events : [
                { id : 1, resourceId : 1, startDate : '2018-03-19', duration : 2, name : 'Event 1' },
                {
                    id             : 2,
                    resourceId     : 1,
                    startDate      : '2018-03-19',
                    duration       : 0,
                    name           : 'Milestone with long text',
                    milestoneWidth : 200
                },
                { id : 3, resourceId : 1, startDate : '2018-03-20', duration : 2, name : 'Event 3' },
                {
                    id             : 4,
                    resourceId     : 1,
                    startDate      : '2018-03-20',
                    duration       : 0,
                    name           : 'Milestone',
                    milestoneWidth : 80
                },
                { id : 5, resourceId : 1, startDate : '2018-03-20', duration : 0, name : 'MS', milestoneWidth : 0 }
            ],

            columns : [
                { text : 'Name', field : 'name', width : 130 }
            ],

            // Available modes are :
            // 'default'  - no layout
            // 'data'     - from milestoneWidth
            // 'estimate' - length * char width
            // 'measure'  _ precise but slowest
            milestoneLayoutMode : 'measure',

            // Width per char in px when using 'estimate'
            milestoneCharWidth : 10,

            // Milestone alignment, start, center or end
            milestoneAlign : 'center',

            enableEventAnimations : false
        }, config));

        await t.waitForProjectReady();

        first  = scheduler.eventStore.getById(2);
        second = scheduler.eventStore.getById(4);
        third  = scheduler.eventStore.getById(5);

        firstElement  = first && scheduler.getElementsFromEventRecord(first)[0].parentNode;
        secondElement = second && scheduler.getElementsFromEventRecord(second)[0].parentNode;
        thirdElement  = third && scheduler.getElementsFromEventRecord(third)[0].parentNode;
    }

    t.it('milestoneLayoutMode "data" should use width from records', async t => {
        await createScheduler({
            milestoneLayoutMode : 'data'
        });

        t.chain(
            { waitForSelector : '.b-sch-event' },

            next => {
                t.isApprox(firstElement.offsetWidth, 200, 'Correct width for "Milestone with long text"');
                t.isApprox(secondElement.offsetWidth, 80, 'Correct width for "Milestone"');
                t.isApprox(thirdElement.offsetWidth, 40, 'Positive width for "MS"');

                t.diag('Changing record width');

                first.milestoneWidth = 300;

                next();
            },

            // Need to wait since record updates are animated
            { waitFor : () => Math.abs(firstElement.offsetWidth - 300) < 5, desc : 'Milestone width changed' }
        );
    });

    t.it('milestoneLayoutMode "estimate" should use width based on length', async t => {
        await createScheduler({
            milestoneLayoutMode : 'estimate'
        });

        t.chain(
            { waitForSelector : '.b-sch-event' },

            () => {
                let factor = scheduler.milestoneCharWidth;
                t.isApprox(firstElement.offsetWidth, factor * first.name.length, 'Correct width for "Milestone with long text"');
                t.isApprox(secondElement.offsetWidth, factor * second.name.length, 'Correct width for "Milestone"');
                t.isGreater(thirdElement.offsetWidth, 0, 'Positive width for "MS"');

                t.diag('Changing char width');

                factor = scheduler.milestoneCharWidth = 20;

                t.isApprox(firstElement.offsetWidth, factor * first.name.length, 'Correct width for "Milestone with long text"');
                t.isApprox(secondElement.offsetWidth, factor * second.name.length, 'Correct width for "Milestone"');
                t.isGreater(thirdElement.offsetWidth, 0, 'Positive width for "MS"');
            }
        );
    });

    t.it('milestoneLayoutMode "measure" should yield correct widths based on event name', async t => {
        await createScheduler({
            milestoneLayoutMode : 'measure'
        });

        t.chain(
            { waitForSelector : '.b-sch-event' },

            next => {
                t.isApprox(firstElement.offsetWidth, 186, 'Correct width for "Milestone with long text"');
                t.isApprox(secondElement.offsetWidth, 100, 'Correct width for "Milestone"');
                t.isApprox(thirdElement.offsetWidth, 61, 'Correct width for "MS"');

                t.diag('Changing text');

                first.name = 'Changed';

                next();
            },

            // Need to wait since record updates are animated
            { waitFor : () => Math.abs(firstElement.offsetWidth - 98) < 5, desc : 'Milestone width changed' }
        );
    });

    t.it('milestone position should be affected by align', async t => {
        await createScheduler({
            milestoneAlign      : 'start',
            milestoneLayoutMode : 'data'
        });

        t.chain(
            { waitForSelector : '.b-sch-event' },

            () => {
                t.diag('milestoneAlign: "start"');
                // Width should not be affected
                t.isApprox(firstElement.offsetWidth, 200, 'Correct width for "Milestone with long text"');
                t.isApprox(secondElement.offsetWidth, 80, 'Correct width for "Milestone"');
                t.isGreater(thirdElement.offsetWidth, 0, 'Positive width for "MS"');

                t.isApprox(firstElement.getBoundingClientRect().left, 262, 'First at correct position');
                t.isApprox(secondElement.getBoundingClientRect().left, 389, 'Second at correct position');
                t.isApprox(thirdElement.getBoundingClientRect().left, 389, 'Third at correct position');

                t.diag('milestoneAlign: "end"');
                scheduler.milestoneAlign = 'end';

                // Width should not be affected
                t.isApprox(firstElement.offsetWidth, 200, 'Correct width for "Milestone with long text"');
                t.isApprox(secondElement.offsetWidth, 80, 'Correct width for "Milestone"');
                t.isGreater(thirdElement.offsetWidth, 0, 'Positive width for "MS"');

                t.isApprox(firstElement.getBoundingClientRect().right, 262, 'First at correct position');
                t.isApprox(secondElement.getBoundingClientRect().right, 389, 'Second at correct position');
                t.isApprox(thirdElement.getBoundingClientRect().right, 389, 'Third at correct position');

                t.diag('milestoneAlign: "center"');
                scheduler.milestoneAlign = 'center';

                // Width should not be affected
                t.isApprox(firstElement.offsetWidth, 200, 'Correct width for "Milestone with long text"');
                t.isApprox(secondElement.offsetWidth, 80, 'Correct width for "Milestone"');
                t.isGreater(thirdElement.offsetWidth, 0, 'Positive width for "MS"');

                t.isApprox(firstElement.getBoundingClientRect().left, 162, 'First at correct position');
                t.isApprox(secondElement.getBoundingClientRect().left, 349, 'Second at correct position');
                t.isApprox(thirdElement.getBoundingClientRect().left, 369, 'Third at correct position');
            }
        );
    });

    t.it('EventDrag should take milestoneLayout into account', async t => {
        await createScheduler({
            milestoneAlign      : 'center',
            milestoneLayoutMode : 'data'
        });

        const eventRecord = scheduler.eventStore.getById(2);

        t.chain(
            { waitForSelector : '.b-sch-event' },

            { drag : '[data-event-id="2"]', by : [scheduler.timeAxisViewModel.tickSize, 0] },

            next => {
                t.is(eventRecord.startDate, new Date(2018, 2, 20), 'Correct startDate after drag');

                scheduler.milestoneAlign = 'end';

                next();
            },

            { drag : '[data-event-id="2"]', by : [scheduler.timeAxisViewModel.tickSize, 0] },

            next => {
                t.is(eventRecord.startDate, new Date(2018, 2, 21), 'Correct startDate after drag');

                scheduler.milestoneAlign = 'start';

                next();
            },

            { drag : '[data-event-id="2"]', by : [scheduler.timeAxisViewModel.tickSize, 0] },

            () => {
                t.is(eventRecord.startDate, new Date(2018, 2, 22), 'Correct startDate after drag');

                scheduler.milestoneAlign = 'start';
            }
        );
    });

    t.it('Should render text inside when milestoneTextPosition is `inside`', async t => {
        await createScheduler({
            milestoneTextPosition : 'inside',
            rowHeight             : 200,
            tickSize              : 200,
            columns               : [],
            events                : [
                { id : 1, resourceId : 1, startDate : '2018-03-19', duration : 0, name : '!' }
            ]
        });

        const el = t.query('.b-sch-event-wrap:not(.b-measure) .b-sch-event:contains(!)')[0];

        t.isApprox(el.getBoundingClientRect().left, 200, 'Text inside milestone');
    });
});
