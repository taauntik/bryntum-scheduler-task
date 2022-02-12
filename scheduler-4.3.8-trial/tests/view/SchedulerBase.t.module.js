import { SchedulerBase } from '../../build/scheduler.module.js?456730';

StartTest(t => {

    let schedulerBase;

    t.beforeEach(t => {
        schedulerBase && !schedulerBase.isDestroyed && schedulerBase.destroy();
    });

    t.it('Sanity', async t => {
        schedulerBase = new SchedulerBase({
            appendTo  : document.body,
            width     : 800,
            height    : 600,
            startDate : new Date(2019, 8, 18),
            endDate   : new Date(2019, 8, 25),
            columns   : [
                { field : 'name', text : 'Name' }
            ],
            resources : [
                { id : 1, name : 'The one and only' }
            ],
            events : [
                { id : 1, resourceId : 1, name : 'Task', startDate : new Date(2019, 8, 18), duration : 2, durationUnit : 'd' }
            ]
        });

        await t.waitForProjectReady();

        t.selectorExists('.b-grid-header:textEquals(Name)', 'Header rendered');
        t.selectorExists('.b-sch-header-timeaxis-cell:textEquals(S)', 'Time axis header rendered');
        t.selectorExists('.b-grid-cell:textEquals(The one and only)', 'Cell rendered');
        t.selectorExists('.b-sch-event:textEquals(Task)', 'Event rendered');
        t.isDeeply(Object.keys(schedulerBase.features), ['regionResize'], 'Only regionResize included by default');
    });

    t.it('Should call renderRows exactly once', async t => {
        let callCount = 0;

        schedulerBase = new SchedulerBase({
            appendTo  : document.body,
            width     : 800,
            height    : 600,
            startDate : new Date(2019, 8, 18),
            endDate   : new Date(2019, 8, 25),
            columns   : [
                { field : 'name', text : 'Name' }
            ],
            resources : [
                { id : 1, name : 'The one and only' }
            ],
            events : [
                { id : 1, resourceId : 1, name : 'Task', startDate : new Date(2019, 8, 18), duration : 2, durationUnit : 'd' }
            ],

            listeners : {
                renderRows() {
                    callCount++;
                }
            }
        });

        await t.waitForProjectReady();

        t.is(callCount, 1, '1 renderRows call');
    });
});
