import { Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    async function createScheduler(t) {
        scheduler = new Scheduler({
            width    : 400,
            height   : 300,
            features : {
                pan             : true,
                eventDragCreate : false
            },
            columns : [
                { field : 'name', width : 150 }
            ],
            resources : [
                { id : 1, name : 'Steve', job : 'Carpenter' },
                { id : 2, name : 'John', job : 'Contractor' },
                {},
                {},
                {},
                {}
            ],
            events : [
                {
                    id         : 1,
                    name       : 'Work',
                    resourceId : 1,
                    startDate  : new Date(2017, 0, 1),
                    endDate    : new Date(2017, 0, 5)
                }
            ],
            startDate : new Date(2017, 0, 1),
            endDate   : new Date(2017, 1, 16),
            appendTo  : document.body
        });

        await t.waitForProjectReady(scheduler);
    }

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    t.it('Dragging event should not pan', t => {
        createScheduler(t);

        t.wontFire(scheduler.subGrids.normal.scrollable, 'scroll');

        t.chain(
            { drag : '.b-sch-event', fromOffset : [50, 20], by : [-10, 0] }
        );
    });

    t.it('Dragging on an event should pan if drag feature is not enabled', t => {
        createScheduler(t);

        t.firesAtLeastNTimes(scheduler.subGrids.normal.scrollable, 'scroll', 1);

        scheduler.features.eventDrag.disabled = true;

        t.chain(
            { drag : '.b-sch-event', by : [-10, 0] }
        );
    });

    t.it('Dragging on a cell should pan', t => {
        createScheduler(t);

        scheduler.events = [];

        t.firesAtLeastNTimes(scheduler.subGrids.normal.scrollable, 'scroll', 1);

        t.chain(
            { drag : '.b-sch-timeaxis-cell', fromOffset : [50, 20], by : [-10, -10] },

            () => {
                t.is(scheduler.subGrids.normal.scrollable.x, 10, 'scrolled horizontally to 10');
                t.is(scheduler.scrollable.y, 10, 'scrolled vertically to 10');
            }
        );
    });

    t.it('Should support disabling', t => {
        createScheduler(t);

        scheduler.events = [];

        scheduler.features.pan.disabled = true;

        t.selectorNotExists('.b-pan', 'Feature CSS class removed');

        t.chain(
            { drag : '.b-sch-timeaxis-cell', fromOffset : [50, 20], by : [-10, -10] },

            next => {
                t.is(scheduler.subGrids.normal.scrollable.x, 0, 'Not scrolled horizontally');
                t.is(scheduler.scrollable.y, 0, 'Not scrolled vertically');

                scheduler.features.pan.disabled = false;

                next();
            },

            { drag : '.b-sch-timeaxis-cell', fromOffset : [50, 20], by : [-10, -10] },

            () => {
                t.is(scheduler.subGrids.normal.scrollable.x, 10, 'scrolled horizontally to 10');
                t.is(scheduler.scrollable.y, 10, 'scrolled vertically to 10');
            }
        );
    });

    t.it('Should be able to coexist with other features using same mouse input', t => {
        scheduler = new Scheduler({
            appendTo : document.body,
            width    : 400,
            height   : 300,
            features : {
                pan             : true,
                eventDragCreate : true,
                eventDragSelect : true
            }
        });

        t.pass('Scheduler created ok');
    });

    t.it('Should not add feature CSS class if it is disabled', t => {
        scheduler = new Scheduler({
            appendTo : document.body,
            features : {
                pan             : {
                    disabled : true
                },
                eventDragCreate : true,
                eventDragSelect : true
            }
        });

        t.hasNotCls(scheduler.element, 'b-pan', 'Feature CSS class removed');

        scheduler.features.pan.disabled = false;

        t.hasCls(scheduler.element, 'b-pan', 'Feature CSS class added');
    });
});
