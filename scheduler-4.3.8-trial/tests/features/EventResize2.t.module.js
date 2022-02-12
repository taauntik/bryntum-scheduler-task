import { Scheduler, DateHelper, DomHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    async function getScheduler(t, config = {}, nbrEvents) {
        const scheduler = t.getScheduler(config, nbrEvents);

        await t.waitForProjectReady();

        return scheduler;
    }

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    t.it('Should not be possible to resize event if resize is in progress', async t => {
        scheduler = await getScheduler(t, {
            startDate  : new Date(2018, 4, 3),
            endDate    : new Date(2018, 4, 5),
            viewPreset : 'hourAndDay',
            events     : [
                {
                    startDate  : new Date(2018, 4, 3, 5),
                    endDate    : new Date(2018, 4, 3, 8),
                    id         : 1,
                    cls        : 'event-1',
                    resourceId : 'r2'
                },
                {
                    startDate  : new Date(2018, 4, 3, 5),
                    endDate    : new Date(2018, 4, 3, 8),
                    id         : 2,
                    cls        : 'event-2',
                    resourceId : 'r3'
                }
            ]
        });
        const eventStore = scheduler.eventStore;

        let resizeContext;

        scheduler.on('beforeeventresizefinalize', ({ context }) => {
            context.async = true;

            resizeContext = context;
        });

        const eventWidth = document.querySelector('.event-1').offsetWidth,
            event2Box = document.querySelector('.event-2').getBoundingClientRect();

        t.chain(
            { drag : '.event-1', offset : ['100%-5', '50%'], by : [100, 0] },
            { drag : [event2Box.right - 5, (event2Box.top + event2Box.bottom) / 2], offset : ['100%-5', '50%'], by : [100, 0] },
            { drag : [event2Box.right - 5, (event2Box.top + event2Box.bottom) / 2], offset : ['100%-5', '50%'], by : [100, 0] },
            {
                waitForEvent : [scheduler, 'eventResizeEnd'],
                trigger      : () => {
                    // Finish the first tried resize
                    resizeContext.finalize(true);

                    t.isGreater(eventStore.getAt(0).endDate, new Date(2018, 4, 3, 9), 'First event resized');
                    t.isGreater(document.querySelector('.event-1').offsetWidth, eventWidth, 'Event is visually bigger');
                    t.is(eventStore.getAt(1).endDate, new Date(2018, 4, 3, 8), 'Second event is not');
                    t.is(document.querySelector('.event-2').offsetWidth, eventWidth, 'Event is visually same');
                }
            }
        );
    });

    t.it('Should be possible to resize when using AssignmentStore', t => {
        scheduler = new Scheduler({
            appendTo  : document.body,
            resources : [
                { id : 'r1', name : 'Mike' },
                { id : 'r2', name : 'Linda' }
            ],
            events : [
                {
                    id        : 1,
                    startDate : new Date(2017, 0, 1, 10),
                    endDate   : new Date(2017, 0, 1, 12)
                }
            ],
            assignments : [
                { resourceId : 'r1', eventId : 1 },
                { resourceId : 'r2', eventId : 1 }
            ],
            startDate             : new Date(2017, 0, 1, 6),
            endDate               : new Date(2017, 0, 1, 20),
            viewPreset            : 'hourAndDay',
            enableEventAnimations : false
        });

        t.chain(
            { waitForProjectReady : scheduler },

            { drag : '[data-event-id="1"]', offset : ['100%-5', 10], by : [65, 0] },

            () => {
                t.is(scheduler.eventStore.first.endDate, new Date(2017, 0, 1, 13), 'endDate updated');

                const [first, second] = Array.from(document.querySelectorAll('[data-event-id="1"]'));

                t.is(first.getBoundingClientRect().width, second.getBoundingClientRect().width, 'Both instances resized');
            }
        );
    });

    t.it('Resize should work with empty dependency store', t => {
        scheduler = new Scheduler({
            appendTo : document.body,
            features : {
                dependencies : true,
                eventTooltip : false
            },
            resources : [
                { id : 'r1', name : 'Mike' },
                { id : 'r2', name : 'Linda' }
            ],
            events : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2017, 0, 1, 10),
                    endDate    : new Date(2017, 0, 1, 12)
                },
                {
                    id         : 2,
                    resourceId : 'r2',
                    startDate  : new Date(2017, 0, 1, 10),
                    endDate    : new Date(2017, 0, 1, 12)
                }
            ],
            startDate             : new Date(2017, 0, 1, 6),
            endDate               : new Date(2017, 0, 1, 20),
            viewPreset            : 'hourAndDay',
            enableEventAnimations : false
        });

        t.firesOnce(scheduler, 'eventresizeend');

        t.chain(
            { waitForProjectReady : scheduler },

            { drag : '.b-sch-event', fromOffset : ['100%-5', '50%'], by : [50, 0] }
        );
    });

    t.it('Resize should not leave extra elements', async t => {
        scheduler = new Scheduler({
            appendTo : document.body,
            features : {
                dependencies : true,
                eventTooltip : false
            },
            resources : [
                { id : 'r1', name : 'Mike' },
                { id : 'r2', name : 'Linda' }
            ],
            events : [
                {
                    id         : 1,
                    cls        : 'event1',
                    resourceId : 'r1',
                    startDate  : new Date(2017, 0, 1, 10),
                    endDate    : new Date(2017, 0, 1, 12)
                },
                {
                    id         : 2,
                    cls        : 'event2',
                    resourceId : 'r2',
                    startDate  : new Date(2017, 0, 1, 10),
                    endDate    : new Date(2017, 0, 1, 12)
                }
            ],
            dependencies : [
                { from : 1, to : 2 }
            ],
            startDate             : new Date(2017, 0, 1, 6),
            endDate               : new Date(2017, 0, 1, 20),
            viewPreset            : 'hourAndDay',
            enableEventAnimations : false
        });

        t.firesOk({
            observable : scheduler,
            events     : {
                eventresizeend : 3
            }
        });

        scheduler.on('eventresizeend', ({ eventRecord }) => {
            scheduler.events[0].setEndDate(eventRecord.endDate, false);
        });

        t.chain(
            { drag : '.event2', fromOffset : ['100%-5', '50%'], by : [scheduler.tickSize, 0] },
            next => {
                t.isLessOrEqual(document.querySelectorAll('.event2 .b-sch-terminal').length, 4, 'No extra terminals found');
                next();
            },
            { drag : '.event2', fromOffset : ['100%-5', '50%'], by : [scheduler.tickSize, 0] },
            next => {
                t.isLessOrEqual(document.querySelectorAll('.event2 .b-sch-terminal').length, 4, 'No extra terminals found');
                next();
            },
            { drag : '.event2', fromOffset : ['100%-5', '50%'], by : [-scheduler.tickSize, 0], dragOnly : true },
            { moveMouseBy : [0, 50] },
            { moveMouseBy : [-scheduler.tickSize, -50] },
            next => {
                t.isLessOrEqual(document.querySelectorAll('.event2 .b-sch-terminal').length, 4, 'No extra terminals found');
                next();
            },
            { mouseUp : null },
            next => {
                t.isLessOrEqual(document.querySelectorAll('.event2 .b-sch-terminal').length, 4, 'No extra terminals found');
                next();
            }
        );
    });

    t.it('Should finalize refresh UI if operation is cancelled asynchronously ', async t => {
        scheduler = await getScheduler(t, {
            startDate  : new Date(2018, 4, 3),
            endDate    : new Date(2018, 4, 5),
            viewPreset : 'hourAndDay',
            events     : [
                {
                    startDate  : new Date(2018, 4, 3, 5),
                    endDate    : new Date(2018, 4, 3, 8),
                    id         : 1,
                    cls        : 'event-1',
                    resourceId : 'r2'
                }
            ]
        });

        scheduler.on('beforeeventresizefinalize', ({ context }) => {
            context.async = true;

            setTimeout(() => context.finalize(false), 100);
        });

        const eventWidth = document.querySelector('.event-1').offsetWidth;

        t.chain(
            { drag : '.event-1', offset : ['100%-5', '50%'], by : [200, 0] },

            { waitFor : () => document.querySelector('.event-1').offsetWidth === eventWidth },

            () => {
                t.is(document.querySelector('.event-1').offsetWidth, eventWidth, 'Event is visually same');
            }
        );
    });

    t.it('Should work with custom non-continuous timeaxis', async t => {
        scheduler = await getScheduler(t, {
            events : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                }
            ],

            timeAxis : {
                continuous : false,

                generateTicks(start, end, unit, increment) {
                    const ticks = [];

                    while (start < end) {

                        if ([1, 2, 3].includes(start.getDay())) {
                            ticks.push({
                                startDate : start,
                                endDate   : DateHelper.add(start, increment, unit)
                            });
                        }

                        start = DateHelper.add(start, increment, unit);
                    }
                    return ticks;
                }
            }
        });

        t.chain(
            { drag : '.b-sch-event', offset : ['100%-3', '50%'], by : [scheduler.tickSize, 0] },

            () => {
                t.isApprox(document.querySelector(scheduler.unreleasedEventSelector).offsetWidth, scheduler.tickSize * 3, 'Correct width after resize');
                t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 4), 'startDate still them same');
                t.is(scheduler.eventStore.first.endDate, new Date(2011, 0, 11), 'endDate correct');
            }
        );
    });

    t.it('ScrollManager should not scroll vertically while resizing', async t => {
        scheduler = await getScheduler(t, {
            startDate     : new Date(2017, 0, 1, 4),
            height        : 210,
            viewPreset    : 'hourAndDay',
            resourceStore : t.getResourceStore2({}, 100),
            events        : [
                {
                    resourceId : 'r3',
                    id         : 1,
                    startDate  : new Date(2017, 0, 1, 6),
                    endDate    : new Date(2017, 0, 1, 8)
                }
            ],
            features : {
                eventDrag : {
                    constrainDragToResource : true
                }
            }
        });

        t.wontFire(scheduler.scrollable, 'scroll');

        t.chain(
            { moveCursorTo : '.b-sch-event' },
            { drag : '.b-sch-event', fromOffset : ['100%-2', '50%'], by : [200, 0] }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8898
    t.it('Should be possible to resize semi-small events', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventTooltip : false
            }
        });

        scheduler.zoomToLevel('weekAndDayLetter');

        scheduler.tickSize = 5;

        t.chain(
            { drag : '[data-event-id="1"]', offset : [1, 5], by : [-10, 0] },

            { waitForProjectReady : scheduler },

            next => {
                t.is(document.querySelector('[data-event-id="1"]').offsetWidth, 20, 'Resized left');
                next();
            },

            { drag : '[data-event-id="2"]', offset : ['100%-1', 5], by : [10, 0] },

            { waitForProjectReady : scheduler },

            next => {
                t.is(document.querySelector('[data-event-id="2"]').offsetWidth, 20, 'Resized right');
                next();
            },

            { drag : '[data-event-id="3"]', offset : ['50%', 5], by : [10, 0] },

            { waitForProjectReady : scheduler },

            () => {
                t.is(document.querySelector('[data-event-id="3"]').offsetWidth, 10, 'Not resized');
                t.isApprox(t.rect('[data-event-id="3"]').left, 424, 0.5, 'Moved');
            }
        );
    });

    // https://github.com/bryntum/support/issues/1546
    t.it('Should not be possible to resize very small events, drag drop is prioritized in this case', async t => {
        scheduler = await getScheduler(t, {
            events : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 4),
                    duration   : 0.05
                }
            ]
        }, 1);

        await t.waitForAnimations();
        const el = t.query(scheduler.unreleasedEventSelector)[0];

        t.wontFire(scheduler, 'beforeEventResize');
        t.wontFire(scheduler, 'beforeDragCreate');
        t.is(el.offsetWidth, 5, 'Small event, 5px wide');

        // Start drag at every x coordinate in the 5px wide event
        await t.dragBy('.b-sch-event', [20, 0], null, null, null, false, [0, 10]);
        await t.dragBy('.b-sch-event', [20, 0], null, null, null, false, [1, 10]);
        await t.dragBy('.b-sch-event', [20, 0], null, null, null, false, [2, 10]);
        await t.dragBy('.b-sch-event', [20, 0], null, null, null, false, [3, 10]);
        await t.dragBy('.b-sch-event', [20, 0], null, null, null, false, [4, 10]);
    });

    // https://github.com/bryntum/support/issues/410
    t.it('Event element should stay visible when drag resized to 0 duration in horizontal mode', async t => {
        scheduler = t.getScheduler({
            features : {
                eventResize : {
                    showExactResizePosition : true
                }
            }
        }, 1);

        await t.waitForProjectReady();

        await t.dragBy('.b-sch-event', [-250, 0], null, null, null, true, ['100%-2', '50%']);

        t.ok(document.querySelector('.b-sch-event-wrap').offsetWidth, 'Event container is visible');
        t.ok(document.querySelector('.b-sch-event').offsetWidth, 'Event is visible');
    });

    t.it('Event element should stay visible when drag resized to 0 duration in vertical mode', async t => {
        scheduler = t.getScheduler({
            mode     : 'vertical',
            features : {
                eventResize : {
                    showExactResizePosition : true
                }
            }
        }, 1);

        await t.waitForProjectReady();

        await t.dragBy('.b-sch-event', [0, -250], null, null, null, true, ['50%', '100%-2']);

        t.isGreater(document.querySelector('.b-sch-event-wrap').offsetHeight, 0, 'Event container is visible');
        t.isGreater(document.querySelector('.b-sch-event').offsetHeight, 0, 'Event is visible');
    });

    t.it('should work crossing TimeAxis window boundaries', async t => {
        let timeAxisChangeCount = 0;

        scheduler = await getScheduler(t, {
            infiniteScroll : true,
            resources      : [
                { id : 1, name : '1' }
            ],
            events : [
                {
                    id        : 1,
                    startDate : new Date(2018, 11, 6),
                    endDate   : new Date(2018, 11, 7)
                }
            ],
            assignments : [
                { eventId : 1, resourceId : 1 }
            ],
            startDate : new Date(2018, 11, 6),
            endDate   : new Date(2018, 11, 30),
            listeners : {
                timeaxischange() {
                    timeAxisChangeCount++;
                }
            }
        });
        const
            event = scheduler.eventStore.first,
            jan27th = new Date(2019, 0, 27);

        // So that the drag snaps to a day boundary making test reliable
        scheduler.timeAxis.resolutionUnit = 'day';

        await t.mouseDown(scheduler.eventSelector, null, ['100%-2', '50%']);

        await t.moveMouseTo(scheduler.timeAxisSubGridElement, null, null, [scheduler.timeAxisSubGridElement.offsetWidth - 20, 25]);

        // Wait until we have resized past the Jan 27 start point.
        // Upon mouseup, it should snap to jan 27th
        await t.waitFor({
            method  : () => timeAxisChangeCount === 2 && scheduler.getDateFromCoordinate(scheduler.timeAxisSubGridElement.offsetWidth + scheduler.timelineScroller.x - 20, null, true) > jan27th,
            timeout : 60000
        });

        await t.mouseUp();

        await t.waitFor(() => !scheduler.features.eventResize.context);

        // Get the wrapper.
        const eventEl = scheduler.getElementFromEventRecord(event, event.resource, true);

        // 6th Dec 2019 is at X=900 now that we have shifted once (since the initial shift).
        t.isApproxPx(DomHelper.getTranslateX(eventEl), 900, 'Event element\'s start point correct');

        t.is(eventEl.offsetWidth, 5200, 'Event element\'s length correct');

        t.selectorCountIs(`${scheduler.eventSelector}:not(.b-released)`, 1, 'Event element is present');

        // Event endpoint dragged end into future time axis frame
        t.is(event.endDate, new Date(2019, 0, 27));
    });

    // https://github.com/bryntum/support/issues/2945
    t.it('Should allow resizing to zero duration if allowResizeToZero is set', async t => {
        scheduler = t.getScheduler({
            features : {
                eventResize : {
                    allowResizeToZero : true
                }
            }
        }, 1);

        await t.waitForProjectReady();
        await t.dragBy('.b-sch-event', [-250, 0], null, null, null, false, ['100%-2', '50%']);

        t.is(scheduler.eventStore.first.duration, 0, '0 duration in data');
        t.selectorExists('.b-milestone-wrap', 'Event is zero duration === milestone');
    });

    t.it('Should not fail on clicking resize handle after drag create', async t => {
        scheduler = t.getScheduler({
            features : {
                eventEdit : true
            }
        }, 4);

        await t.dragBy('[data-region="normal"] .b-grid-row', [10, 0],  null, null, null, false, [10, '50%']);
        await t.click('[data-event-id="4"]', null, null, null, [5, '50%']);
    });

    // https://github.com/bryntum/support/issues/2887
    t.it('Should accept changes happening to events while they are being resized', async t => {
        scheduler = t.getScheduler({}, 1);

        await t.dragBy({
            source   : '.b-sch-event',
            delta    : [150, 0],
            dragOnly : true,
            offset   : ['100%-2', '50%']
        });

        scheduler.eventStore.first.name = 'foo';
        await t.mouseUp();

        t.selectorExists('.b-sch-event:contains(foo)');
    });

    t.it('Should not apply fillTick rounding while an event is being resized', async t => {
        scheduler = t.getScheduler({}, 1);

        scheduler.fillTicks = true;

        await t.dragBy({
            source   : '.b-sch-event',
            delta    : [150, 0],
            dragOnly : true,
            offset   : ['100%-2', '50%']
        });

        const endDate = scheduler.eventStore.first.meta.batchChanges.endDate;
        await t.mouseUp();

        t.isNot(endDate, scheduler.eventStore.first.endDate, 'endDate during resize was not rounded because of fillTicks');
    });

    t.it('Should use correct weekStartDay during drag resize', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate    : '2011-01-03',
            endDate      : '2011-01-24',
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
            events : [
                { id : 1, resourceId : 'r1', startDate : '2011-01-10', endDate : '2011-01-17' },
                { id : 2, resourceId : 'r2', startDate : '2011-01-10', endDate : '2011-01-17' },
                { id : 3, resourceId : 'r3', startDate : '2011-01-11', endDate : '2011-01-15' },
                { id : 4, resourceId : 'r4', startDate : '2011-01-11', endDate : '2011-01-15' },
                { id : 5, resourceId : 'r5', startDate : '2011-01-11', endDate : '2011-01-15' },
                { id : 6, resourceId : 'r6', startDate : '2011-01-11', endDate : '2011-01-15' }
            ],
            features : {
                eventEdit : true
            }
        });

        const { tickSize } = scheduler;

        await t.dragBy({
            source : '[data-event-id="1"] .b-sch-event',
            offset : [5, 0],
            delta  : [-tickSize * 0.8, 10]
        });

        await t.dragBy({
            source : '[data-event-id="2"] .b-sch-event',
            offset : ['100%-5', 0],
            delta  : [tickSize * 0.8, 10]
        });

        await t.dragBy({
            source : '[data-event-id="3"] .b-sch-event',
            offset : [5, 0],
            delta  : [-tickSize / 7, 10]
        });

        await t.dragBy({
            source : '[data-event-id="4"] .b-sch-event',
            offset : [5, 0],
            delta  : [-tickSize / 2, 10]
        });

        await t.dragBy({
            source : '[data-event-id="5"] .b-sch-event',
            offset : ['100%-5', 0],
            delta  : [tickSize / 7, 10]
        });

        await t.dragBy({
            source : '[data-event-id="6"] .b-sch-event',
            offset : ['100%-5', 0],
            delta  : [tickSize / 2, 10]
        });

        const [event1, event2, event3, event4, event5, event6] = scheduler.eventStore.getRange();

        t.is(event1.startDate, new Date(2011, 0, 3), 'event 1 start is ok');
        t.is(event2.endDate, new Date(2011, 0, 24), 'event 2 end is ok');
        t.is(event3.startDate, new Date(2011, 0, 10), 'event 3 start is ok');
        t.is(event4.startDate, new Date(2011, 0, 10), 'event 4 start is ok');
        t.is(event5.endDate, new Date(2011, 0, 17), 'event 5 end is ok');
        t.is(event6.endDate, new Date(2011, 0, 17), 'event 6 end is ok');
    });
});
