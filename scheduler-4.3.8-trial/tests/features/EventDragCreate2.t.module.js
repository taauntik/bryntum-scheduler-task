import { DateHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler?.destroy?.();
    });

    // #8943 - https://app.assembla.com/spaces/bryntum/tickets/8943
    t.it('Should not crash after drag-create', t => {

        let eventDragged = false;

        scheduler = t.getScheduler({
            resources : [
                { id : 'r1', name : 'Resource 1' }
            ],

            events : [],

            features : {
                eventEdit : true
            },

            listeners : {
                eventDrag() {
                    eventDragged = true;
                }
            }
        });

        t.chain(
            { drag : '.b-sch-timeaxis-cell', offset : [100, '50%'], by : [200, 0] },

            { waitForSelector : '.b-eventeditor' },

            { type : '123[ENTER]' },

            { waitForSelectorNotFound : '.b-eventeditor' },

            { drag : scheduler.eventSelector, by : [50, 0] },

            () => {
                t.ok(eventDragged, 'Event dragged w/o issues');
            }
        );
    });

    // #8943 - https://app.assembla.com/spaces/bryntum/tickets/8943
    t.it('Should not crash after drag-create with Scheduler in multi-assignment mode', t => {

        let eventDragged = false;

        scheduler = t.getScheduler({
            resources : [
                { id : 'r1', name : 'Resource 1' }
            ],

            events : [
                { id : 'e1', name : '123', startDate : new Date(2011, 0, 5), endDate : new Date(2011, 0, 6) }
            ],

            assignments : [
                { id : 'a1', eventId : 'e1', resourceId : 'r1' }
            ],

            features : {
                eventEdit    : true,
                eventTooltip : false
            },

            listeners : {
                eventDrag() {
                    eventDragged = true;
                }
            }
        });

        t.chain(
            { drag : '.b-sch-timeaxis-cell', offset : [100, '50%'], by : [200, 0] },

            { waitForSelector : '.b-eventeditor' },

            { type : '123[ENTER]' },

            { waitForSelectorNotFound : '.b-eventeditor' },

            { drag : scheduler.eventSelector + ' .b-sch-dirty-new', by : [50, 0] },

            () => {
                t.ok(eventDragged, 'Event dragged w/o issues');
            }
        );
    });

    // https://github.com/bryntum/support/issues/1376
    t.it('Should not get stuck after minimal drag create', async t => {
        scheduler = await t.getSchedulerAsync({ events : []  });

        t.chain(
            { drag : '.b-sch-timeaxis-cell', offset : [100, '50%'], by : [3, 0] },

            () => {
                t.selectorExists('.b-sch-event-wrap', 'New event created');
            }
        );
    });

    // https://github.com/bryntum/support/issues/2056
    t.it('Should be possible to set resource id in beforeEventAdd handler', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventEdit    : true,
                eventTooltip : false
            },
            events : []
        });

        scheduler.on({
            beforeEventAdd({ eventRecord, resourceRecords }) {
                eventRecord.resourceId = resourceRecords[0].id;
            }
        });

        await t.dragBy('.b-sch-timeaxis-cell', [100, 0], null, null, null, null, [100, '50%']);
        await t.type('.b-textfield input[name="name"]', 'Foo');
        await t.click('button[data-ref="saveButton"]');
        await t.waitForSelector('.b-sch-event:contains(Foo)');
    });

    t.it('Should be possible to change resource field name', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventEdit : {
                    editorConfig : {
                        items : {
                            resourceField : {
                                name : 'resourceId' // 'resource' is used by default
                            }
                        }
                    }
                },
                eventTooltip : false
            },
            events : []
        });

        await t.dragBy('.b-sch-timeaxis-cell', [100, 0], null, null, null, null, [100, '50%']);
        await t.type('.b-textfield input[name="name"]', 'Foo');
        await t.click('button[data-ref="saveButton"]');
        await t.waitForSelector('.b-sch-event:contains(Foo)');
    });

    t.it('Should ignore click on phantom event', async t => {
        scheduler = await t.getSchedulerAsync({
            events   : [],
            features : {
                eventEdit : true
            }
        });

        const livesOk = t.livesOkAsync('Click on temp event does not throw');

        await t.dragBy({
            source : '.b-sch-timeaxis-cell',
            offset : [50, '50%'],
            delta  : [100, 0]
        });

        await t.waitForSelector(scheduler.unreleasedEventSelector);

        await t.click('.b-sch-event');

        await t.waitForSelectorNotFound(scheduler.unreleasedEventSelector);

        livesOk();
    });

    // https://github.com/bryntum/support/issues/3147
    t.it('Should not throw when scheduler is destroyed during finalization', async t => {
        scheduler = await t.getSchedulerAsync({
            events   : [],
            features : {
                eventEdit : true
            },
            listeners : {
                dragCreateEnd({ eventRecord }) {
                    scheduler.destroy();
                }
            }
        });

        await t.dragBy({
            source : '.b-sch-timeaxis-cell',
            offset : [50, '50%'],
            delta  : [100, 0]
        });

        t.is(scheduler.isDestroyed, true, 'Destroyed ok');
    });

    // https://github.com/bryntum/support/issues/3228
    t.it('Should allow locking layout during drag create', async t => {
        scheduler = await t.getSchedulerAsync({
            enableEventAnimations : false,

            features : {
                eventDragCreate : {
                    lockLayout : true
                }
            }
        });

        scheduler.eventStore.first.resourceId = 'r2';

        await t.waitForProjectReady();

        const
            event1Top = t.rect('.event1').top,
            event2Top = t.rect('.event2').top;

        await t.dragBy({
            source   : '[data-id="r2"] .b-sch-timeaxis-cell',
            offset   : [50, 75],
            delta    : [400, 0],
            dragOnly : true
        });

        const dragCreatedElement = t.query('.b-sch-event.b-iscreating')[0];

        t.selectorExists('.b-scheduler.b-dragcreating.b-dragcreate-lock', 'Locking cls applied');
        t.is(t.rect(dragCreatedElement).top, event1Top, 'Correct Y pos, not part of layout');
        t.is(t.rect('.event1').top, event1Top, 'Event 1 did not move');
        t.is(t.rect('.event2').top, event2Top, 'Event 2 did not move');

        await t.mouseUp();

        t.isGreater(t.rect('.event1').top, event1Top, 'Event 1 moved down');
        t.isGreater(t.rect('.event2').top, event2Top, 'Event 2 moved down');

        await t.type('input[name=name]', 'Test[ENTER]');

        t.is(t.rect(dragCreatedElement).top, event1Top, 'Still correct Y pos');
        t.selectorNotExists('.b-scheduler.b-dragcreating.b-dragcreate-lock', 'Locking cls removed');
    });

    // https://github.com/bryntum/support/issues/3180
    t.it('Should flip direction around origin, scenario #1', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'hourAndDay'
        });

        await t.dragBy({
            source   : '.b-sch-timeaxis-cell',
            offset   : [75, '50%'],
            delta    : [25, 0],
            dragOnly : true
        });

        await t.moveMouseBy([-50, 0]);

        t.hasApproxWidth('.b-sch-event', 19, 'Correct width after flip');
        t.isApproxPx(t.rect('.b-sch-event').left, 155, 'Correct x');

        await t.mouseUp();
    });

    // https://github.com/bryntum/support/issues/3180
    t.it('Should flip direction around origin, scenario #2', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'hourAndDay'
        });

        await t.dragBy({
            source   : '.b-sch-timeaxis-cell',
            offset   : [100, '50%'],
            delta    : [25, 0],
            dragOnly : true
        });

        await t.moveMouseBy([-100, 0]);

        t.hasApproxWidth('.b-sch-event', 44, 'Correct width after flip');
        t.isApproxPx(t.rect('.b-sch-event').left, 130, 'Correct x');

        await t.mouseUp();
    });

    // https://github.com/bryntum/support/issues/3150
    t.it('Should abort drag create when result would be a zero duration event', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'hourAndDay'
        });

        const initialCount = scheduler.eventStore.count;

        await t.dragBy({
            source   : '.b-sch-timeaxis-cell',
            offset   : [75, '50%'],
            delta    : [25, 0],
            dragOnly : true
        });

        await t.moveMouseBy([-15, 0]);

        t.selectorExists('.b-sch-dragcreate-tooltip.b-too-narrow', 'Tooltip flagged');
        t.selectorExists('.b-sch-event-wrap.b-sch-dragcreating.b-too-narrow', 'Event flagged');

        await t.moveMouseBy([15, 0]);

        t.selectorNotExists('.b-sch-dragcreate-tooltip.b-too-narrow', 'Tooltip un-flagged');
        t.selectorNotExists('.b-sch-event-wrap.b-sch-dragcreating.b-too-narrow', 'Event un-flagged');

        await t.moveMouseBy([-15, 0]);

        await t.mouseUp();

        t.is(scheduler.eventStore.count, initialCount, 'No event created');
    });

    // https://github.com/bryntum/support/issues/3377
    t.it('Should not fit content during drag create', async t => {
        scheduler = await t.getSchedulerAsync({
            events : []
        });

        await t.dragBy({
            source   : '.b-sch-timeaxis-cell',
            offset   : [75, '50%'],
            delta    : [2, 0],
            dragOnly : true
        });

        t.hasApproxWidth('.b-sch-event-wrap', 2, 'Event is narrow');

        await t.mouseUp();
    });

    t.it('Should snap and extend to mouse when drag create starts, dragging end', async t => {
        scheduler = await t.getSchedulerAsync({
            events     : [],
            viewPreset : 'hourAndDay'
        });

        await t.dragBy({
            source   : '.b-sch-timeaxis-cell',
            offset   : [80, '50%'],
            delta    : [2, 0],
            dragOnly : true
        });

        t.hasApproxWidth('.b-sch-event-wrap', 10, 'Event has expected width');
        t.isApproxPx(t.rect('.b-sch-event-wrap').left, 175, 'Event has expected pos');
    });

    t.it('Should snap and extend to mouse when drag create starts, dragging start', async t => {
        scheduler = await t.getSchedulerAsync({
            events     : [],
            viewPreset : 'hourAndDay'
        });

        await t.dragBy({
            source   : '.b-sch-timeaxis-cell',
            offset   : [60, '50%'],
            delta    : [-2, 0],
            dragOnly : true
        });

        t.hasApproxWidth('.b-sch-event-wrap', 10, 'Event has expected width');
        t.isApproxPx(t.rect('.b-sch-event-wrap').right, 175, 'Event has expected pos');
    });

    t.it('Should use correct weekStartDay during drag create', async t => {
        scheduler = await t.getSchedulerAsync({
            weekStartDay : 1,
            viewPreset   : {
                base           : 'weekAndDay',
                timeResolution : {
                    unit      : 'week',
                    increment : 1
                },
                headers : [
                    {
                        unit          : 'week',
                        headerCellCls : 'week-view-preset-header-1',
                        increment     : 1,
                        renderer      : (start) => {
                            return DateHelper.format(start, 'L');
                        }
                    }
                ]
            },
            events : []
        });

        const { tickSize } = scheduler;

        scheduler.eventStore.on({
            add({ records }) {
                const [newEvent] = records;

                t.is(newEvent.startDate, new Date(2011, 0, 3), 'new event start is ok');
            }
        });

        await t.doubleClick('.b-sch-timeaxis-cell', null, null, null, [tickSize / 2, '50%']);

        t.is(scheduler.eventStore.last.endDate, new Date(2011, 0, 10), 'new event end is ok');

        await t.dragBy({
            source : '[data-id="r2"] .b-sch-timeaxis-cell',
            offset : [5, '50%'],
            delta  : [tickSize, 0]
        });

        t.is(scheduler.eventStore.last.endDate, new Date(2011, 0, 10), 'new event end is ok');
    });

    // https://github.com/bryntum/support/issues/3994
    t.it('Should not trigger rowReorder when doing drag create', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                rowReorder : true
            },
            events : []
        });

        const spy = t.spyOn(scheduler.features.rowReorder, 'onBeforeDragStart');
        t.wontFire(scheduler, 'gridRowBeforeDragStart');

        await t.dragBy({
            source : '[data-id="r2"] .b-sch-timeaxis-cell',
            offset : [5, '50%'],
            delta  : [100, 100]
        });

        t.expect(spy).not.toHaveBeenCalled();
    });
});
