import { Rectangle, Panel, ArrayHelper, DateHelper, CSSHelper, EventStore, ResourceStore } from '../../build/scheduler.module.js?456730';

StartTest({ defaultTimeout : 90000 }, t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    async function getScheduler(config) {
        const scheduler = t.getScheduler(Object.assign({
            features : {
                eventDrag : true
            }
        }, config));

        await t.waitForProjectReady();

        return scheduler;
    }

    t.it('dragging outside the rendered block', async t => {
        t.waitForScrolling = false;

        const
            resources = ArrayHelper.populate(200, i => ({
                id   : `r${i + 1}`,
                name : `Resource ${i + 1}`
            })),
            events    = ArrayHelper.populate(116, i => ({
                id         : i + 2,
                resourceId : `r${i + 2}`,
                name       : `Event ${i + 2}`,
                startDate  : new Date(2011, 0, 4),
                endDate    : new Date(2011, 0, 6)
            }));

        events.unshift({
            id         : 1,
            resourceId : 'r1',
            name       : 'Drag Event',
            startDate  : new Date(2011, 0, 4),
            endDate    : new Date(2011, 0, 6)
        });

        scheduler = t.getScheduler({
            features : {
                eventDrag : {
                    showTooltip : false
                },
                eventTooltip    : false,
                scheduleTooltip : false
            },
            resources,
            events
        });

        await t.waitForProjectReady();

        const
            event              = scheduler.eventStore.first,
            layout             = scheduler.currentOrientation,
            dragEl             = scheduler.getElementFromEventRecord(event).parentNode,
            schedulerRectangle = Rectangle.from(scheduler.element),
            startPoint         = Rectangle.from(dragEl).center;

        let newLocation, droppedOnResource, dragElMutationObserver;

        t.chain(
            { mouseDown : dragEl },

            next => {
                // Ensure that during the drag, the dragEl does not get mutated
                dragElMutationObserver = new MutationObserver(() => {
                    dragElMutationObserver.disconnect();
                    t.fail('Dragged element got mutated during drag');
                });
                dragElMutationObserver.observe(dragEl, {
                    characterData : true,
                    childList     : true
                });

                next();
            },

            // This will kick off scrolling
            { moveMouseTo : document.body, offset : [startPoint.x, schedulerRectangle.bottom - 20] },

            { waitFor : () => scheduler.rowManager.topIndex >= 100, timeout : 40000, desc : 'Scrolling' },

            { moveMouseTo : document.body, offset : [startPoint.x, schedulerRectangle.bottom - 100] },

            next => {
                droppedOnResource = scheduler.resolveResourceRecord(t.elementFromPoint.apply(t, t.currentPosition));

                const
                    row          = scheduler.rowManager.getRowFor(droppedOnResource),
                    rowRectangle = Rectangle.from(row._elements.normal),
                    newLayout    = layout.getTimeSpanRenderData(event, droppedOnResource);

                newLocation = new Rectangle(rowRectangle.x + newLayout.left, rowRectangle.y + newLayout.top, newLayout.width, newLayout.height);

                t.ok(dragEl.retainElement, 'Dragged element is retained');

                // Disconnect observer. We expect content to change now
                dragElMutationObserver.disconnect();

                // Edge and IE11 require some help to drop event to correct position. Moving mouse to the vertical center
                // of the target resource
                t.moveMouseTo([t.currentPosition[0], rowRectangle.y + rowRectangle.height / 2], next);
            },

            { mouseUp : null },

            // Wait for the drag element to settle into the calculated new position
            { waitFor : () => t.sameRect(Rectangle.from(dragEl), newLocation) },

            () => {
                // The drag/dropped element is reused as the event's render el
                t.is(scheduler.getElementFromEventRecord(event).parentNode, dragEl);

                t.notOk(dragEl.retainElement, 'Dragged element is no longer retained');

            }
        );
    });

    t.it('dragging outside the rendered block with ESC to abort', async t => {
        t.waitForScrolling = false;

        const
            resources = ArrayHelper.populate(200, i => ({ id : `r${i + 1}`, name : `Resource ${i + 1}` })),
            events    = [
                {
                    id         : 1,
                    resourceId : 'r1',
                    name       : 'Drag Event',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                },
                ...ArrayHelper.populate(116, i => ({
                    id         : i + 2,
                    resourceId : `r${i + 2}`,
                    name       : `Event ${i + 2}`,
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                }))
            ];

        scheduler = await t.getSchedulerAsync({
            features : {
                eventDrag : {
                    showTooltip : false
                },
                eventTooltip    : false,
                scheduleTooltip : false
            },
            resources,
            events
        });

        const
            event              = scheduler.eventStore.first,
            dragEl             = scheduler.getElementFromEventRecord(event).parentNode,
            schedulerRectangle = Rectangle.from(scheduler.element),
            startPoint         = Rectangle.from(dragEl).center;

        let eventEls, eventElRects, endingEventEls, endingEventElRects, dragElMutationObserver;

        t.chain(
            { mouseDown : dragEl },

            next => {
                // Ensure that during the drag, the dragEl does not get mutated
                dragElMutationObserver = new MutationObserver(() => {
                    dragElMutationObserver.disconnect();
                    t.fail('Dragged element got mutated during drag');
                });
                dragElMutationObserver.observe(dragEl, {
                    characterData : true,
                    childList     : true
                });

                next();
            },

            // This will kick off scrolling
            { moveMouseTo : document.body, offset : [startPoint.x, schedulerRectangle.bottom - 20] },

            { waitFor : () => scheduler.rowManager.topIndex >= 100, timeout : 60000 },

            { moveCursorBy : [0, -80] },

            next => {
                // The scheduler's rendered block should not change
                eventEls     = scheduler.eventStore.reduce((result, event) => {
                    const el = scheduler.getElementFromEventRecord(event);
                    if (el) {
                        result.push(el);
                    }
                    return result;
                }, []);
                eventElRects = eventEls.map(e => Rectangle.from(e));

                t.ok(dragEl.retainElement, 'Dragged element retained');

                // Disconnect observer. We expect content to change now
                dragElMutationObserver.disconnect();

                next();
            },

            { type : '[ESC]' },

            {
                waitFor : () => {
                    endingEventEls = scheduler.eventStore.reduce((result, event) => {
                        const el = scheduler.getElementFromEventRecord(event);
                        if (el) {
                            result.push(el);
                        }
                        return result;
                    }, []);
                    return endingEventEls.length === eventEls.length;
                }
            },

            () => {
                endingEventElRects = endingEventEls.map(e => Rectangle.from(e));

                // Same number of elements, and all in the same place.
                // TODO: Ask nige about this
                //                t.is(scheduler.timeAxisSubGridElement.querySelectorAll(scheduler.unreleasedEventSelector).length, eventEls.length);
                t.is(endingEventEls.length, eventEls.length);

                // Not the first one; that's the dragEl which will be in a different place by now
                for (let i = 1; i < eventEls.length; i++) {
                    t.ok(endingEventElRects[i].equals(eventElRects[i]), `Event ${i} correct`);
                }
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7120/details
    t.it('Should work with resources and events that has - in their id', async t => {
        scheduler = await getScheduler({
            resources : [
                { id : 'r-1', name : 'Resource-1' }
            ],
            events : [
                {
                    id         : 'e-1',
                    resourceId : 'r-1',
                    startDate  : new Date(2011, 0, 6),
                    endDate    : new Date(2011, 0, 7)
                }
            ]
        });

        t.chain(
            { drag : '[data-event-id="e-1"]', by : [-100, 0] },

            () => {
                t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 5), 'Drag worked');
            }
        );
    });

    t.it('Event should not disappear when dragging right', async t => {
        scheduler = await getScheduler({
            resources : [
                { id : 1, name : '1' }
            ],
            events : [
                {
                    id         : 1,
                    resourceId : 1,
                    startDate  : new Date(2018, 11, 6),
                    endDate    : new Date(2018, 11, 7)
                }
            ],
            startDate : new Date(2018, 11, 6),
            endDate   : new Date(2018, 11, 30)
        });

        t.chain(
            { drag : scheduler.eventSelector, to : '.b-scheduler', toOffset : ['100%-25', 70], dragOnly : true },

            { waitFor : () => scheduler.scrollLeft > 500 },

            next => {
                t.elementIsVisible(scheduler.eventSelector, 'Still visible');
                next();
            },

            { mouseUp : null }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7307
    t.it('Event should not disappear when dragging right with assignment', async t => {
        scheduler = await getScheduler({
            resources : [
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
            endDate   : new Date(2018, 11, 30)
        });

        t.chain(
            { drag : scheduler.eventSelector, by : [850, 0], dragOnly : true },

            { waitFor : () => scheduler.scrollLeft > 500 },

            next => {
                t.elementIsVisible(scheduler.eventSelector, 'Still visible');
                next();
            },

            { mouseUp : null }
        );
    });

    t.it('should not crash when clicking escape after mousedown which aborts drag', async t => {
        scheduler = await getScheduler({
            resources : [
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
            endDate   : new Date(2018, 11, 30)
        });

        t.chain(
            { mousedown : scheduler.eventSelector },
            { type : '[ESCAPE]' },
            { waitFor : 1000, desc : 'Make sure the async restore of drag proxy does not crash if drag did not start' }
        );
    });

    t.it('Should fire eventDragAbort if user aborts with Escape key', t => {
        scheduler = t.getScheduler();

        t.firesOnce(scheduler, 'eventDragAbort', 1);

        scheduler.on('eventDragAbort', ({ eventRecords, context }) => {
            t.is(eventRecords.length, 1);
            t.isInstanceOf(eventRecords[0], scheduler.eventStore.modelClass);
            t.ok(context);
        });

        t.chain(
            { drag : '.b-sch-event', by : [20, 0], dragOnly : true },

            { type : '[ESCAPE]' }
        );
    });

    t.it('Should be able to configure DragHelper using dragHelperConfig', async t => {
        scheduler = await getScheduler({
            features : {
                eventDrag : {
                    dragHelperConfig : {
                        lockX : true
                    }
                }
            },
            events : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 6),
                    endDate    : new Date(2011, 0, 7)
                }
            ]
        });

        const eventX = document.querySelector('.b-sch-event').getBoundingClientRect().left;

        t.chain(
            { drag : '.b-sch-event', by : [200, 200], dragOnly : true },

            () => {
                const proxyX = document.querySelector('.b-sch-event').getBoundingClientRect().left;

                t.is(proxyX, eventX, 'Constrain worked');
            }
        );
    });

    t.it('Drag and drop with constrainDragToTimeSlot', async t => {
        scheduler = await getScheduler({
            startDate : new Date(2011, 0, 3),
            events    : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 6),
                    endDate    : new Date(2011, 0, 7)
                }
            ],
            features : {
                eventDrag : {
                    constrainDragToTimeSlot : true
                }
            }
        });

        const
            { tickSize }           = scheduler,
            draggedEvent           = scheduler.eventStore.first,
            { startDate, endDate } = draggedEvent;

        t.willFireNTimes(scheduler.eventStore, 'change', 1);

        t.chain(
            next => {
                t._region = document.querySelector(scheduler.eventSelector).getBoundingClientRect();

                next();
            },

            { drag : scheduler.eventSelector, by : [-tickSize, 0], dragOnly : true },

            next => {
                const region = document.querySelector('.b-dragging').getBoundingClientRect();
                t.isApprox(region.left, t._region.left, 1, 'Task constrained left properly');

                next();
            },

            { action : 'mouseUp' },

            next => {
                // Must not have moved
                t.is(draggedEvent.startDate, startDate);
                t.is(draggedEvent.endDate, endDate);
                next();
            },

            { drag : scheduler.eventSelector, by : [tickSize, 0], dragOnly : true },

            next => {
                const region = document.querySelector('.b-dragging').getBoundingClientRect();
                t.isApprox(region.right, t._region.right, 1, 'Task constrained right properly');
                next();
            },

            { action : 'mouseUp' },

            next => {
                // Must not have moved
                t.is(draggedEvent.startDate, startDate);
                t.is(draggedEvent.endDate, endDate);

                next();
            },

            // This drag should move the event down
            { drag : scheduler.eventSelector, by : [0, scheduler.rowHeight] },

            () => {
                t.is(draggedEvent.startDate, startDate);
                t.is(draggedEvent.endDate, endDate);
                t.is(draggedEvent.resourceId, 'r2');
            }
        );
    });

    // https://github.com/bryntum/support/issues/630
    t.it('Should snap event to full tick after drag drop with fillTicks', async t => {
        scheduler = await getScheduler({
            startDate : new Date(2011, 0, 3),
            events    : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 6, 10),
                    endDate    : new Date(2011, 0, 6, 14)
                }
            ],
            viewPreset : 'dayAndWeek',
            rowHeight  : 60,
            barMargin  : 5,
            fillTicks  : true
        });

        await t.waitForSelector('.b-sch-event');

        const origRect = t.rect('.b-sch-event');

        await t.dragBy({
            source : '.b-sch-event',
            delta  : [15, 15]
        });

        await t.waitForSelectorNotFound('.b-dragging-event');
        await t.waitFor(() => t.rect('.b-sch-event').left === origRect.left);

        t.is(t.rect('.b-sch-event').left, origRect.left, 'Event left in correct position');
        t.is(t.rect('.b-sch-event').top, origRect.top, 'Event top in correct position');

        await t.dragBy({
            source : '.b-sch-event',
            delta  : [15, 15]
        });

        await t.waitForSelectorNotFound('.b-dragging-event');
        await t.waitFor(() => t.rect('.b-sch-event').left === origRect.left);

        t.is(t.rect('.b-sch-event').left, origRect.left, 'Event left in correct position');
        t.is(t.rect('.b-sch-event').top, origRect.top, 'Event top in correct position');
    });

    t.it('Should transition aborted drag on filtered timeaxis', async t => {
        scheduler = await getScheduler({
            timeAxis : {
                filters : tick => tick.startDate.getDay() !== 1
            },
            subGridConfigs : {
                locked : {
                    width : 200
                }
            }
        });

        let transitioned = false;

        scheduler.timeAxisSubGridElement.addEventListener('transitionstart', event => {
            if (event.propertyName === 'transform') {
                transitioned = true;
            }
        });

        await t.dragBy({
            source : scheduler.unreleasedEventSelector,
            delta  : [-250, 0]
        });

        await t.waitFor(() => transitioned);

        t.is(scheduler.eventStore.first.startDate, scheduler.startDate, 'Event drag is cancelled');
    });

    // https://github.com/bryntum/support/issues/1286
    t.it('Should be possible to drag narrow event', async t => {
        scheduler = await getScheduler({
            startDate  : new Date(2017, 0, 1, 6),
            endDate    : new Date(2017, 0, 1, 20),
            viewPreset : 'hourAndDay',
            events     : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    resizable  : false,
                    startDate  : new Date(2017, 0, 1, 10),
                    duration   : 0.006
                }
            ]
        });

        t.firesOnce(scheduler, 'aftereventdrop');

        t.chain(
            { drag : scheduler.unreleasedEventSelector, by : [scheduler.tickSize, 0] },

            () => {
                t.is(scheduler.eventStore.first.startDate, new Date(2017, 0, 1, 11), 'Event moved');
            }
        );
    });

    t.it('Should not animate dragged elements as a side effect of external changes to data being animated', async t => {
        // Make a long transition so we can determine that it removes slowly
        CSSHelper.insertRule('#animation-state-test-scheduler .b-sch-event-wrap { transition-duration: 5s !important; }');

        scheduler = await getScheduler({
            id                 : 'animation-state-test-scheduler',
            transitionDuration : 5000,
            startDate          : new Date(2017, 0, 1, 10),
            events             : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2017, 0, 1, 10),
                    duration   : 1
                },
                {
                    id         : 2,
                    resourceId : 'r2',
                    startDate  : new Date(2017, 0, 1, 10),
                    duration   : 1
                }
            ]
        });

        t.chain(
            { drag : scheduler.unreleasedEventSelector, by : [100, 0], dragOnly : true },

            async() => {
                t.firesOnce(scheduler.timeAxisSubGridElement, 'transitionstart');
                // Fake an external change, which should be animated
                scheduler.eventStore.last.duration = 4;
            },

            { moveCursorBy : [100, 0] },
            { moveCursorBy : [100, 0] },
            { moveCursorBy : [100, 0] },
            { moveCursorBy : [100, 0] },
            { moveCursorBy : [100, 0] }
        );
    });

    t.it('Should animate dragged elements drop is finalized', async t => {
        scheduler = await getScheduler({
            rowHeight : 60,
            startDate : new Date(2017, 0, 1, 10),
            events    : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2017, 0, 1, 10),
                    duration   : 1
                }
            ]
        });

        t.chain(
            { drag : scheduler.unreleasedEventSelector, by : [0, 40], dragOnly : true },

            { mouseUp : null },
            { waitForEvent : [scheduler.timeAxisSubGridElement, 'transitionend'] }
        );
    });

    // https://github.com/bryntum/support/issues/2381
    t.it('Should be possible to drag event in left edge when it only allows resizing its end date', async t => {
        scheduler = await getScheduler({
            startDate : new Date(2017, 0, 1, 10),
            events    : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2017, 0, 1, 10),
                    duration   : 1,
                    resizable  : 'end'
                }
            ]
        });

        t.wontFire(scheduler, 'eventresizestart');
        t.firesOnce(scheduler, 'aftereventdrop');

        t.chain(
            { drag : scheduler.unreleasedEventSelector, by : [0, 40], offset : [2, '50%'] }
        );
    });

    // https://github.com/bryntum/support/issues/893
    t.it('Event proxy is updated correctly on page scroll', async t => {
        scheduler = await t.getSchedulerAsync({
            resourceStore : new ResourceStore({
                data : (() => {
                    const result = [];

                    for (let i = 1; i <= 100; i++) {
                        result.push({
                            id   : i,
                            name : `Resource ${i}`
                        });
                    }

                    return result;
                })()
            }),
            eventStore : new EventStore({
                data : [
                    { id : 1, resourceId : 10, name : 'Event', startDate : '2011-01-05', endDate : '2011-01-09' }
                ]
            })
        });

        t.chain(
            { waitForSelector : '.b-sch-event' },
            async() => {
                scheduler.scrollable.y = 100;
                await scheduler.scrollable.await('scrollEnd');
            },
            { drag : '.b-sch-event', by : [100, 0], dragOnly : true },
            async() => {
                const box = t.rect('.b-sch-event-wrap');

                await scheduler.scrollVerticallyTo(135);

                const newBox = t.rect('.b-sch-event-wrap');

                t.isApproxPx(newBox.top, box.top, 'Drag proxy is updated');
            },
            { mouseUp : null }
        );
    });

    // https://github.com/bryntum/support/issues/2528
    t.it('Should support snap with noncontinuous timeaxis', async t => {
        scheduler = await t.getSchedulerAsync({
            eventStore : new EventStore({
                data : [
                    {
                        id         : 1,
                        resourceId : 'r1',
                        name       : 'Event',
                        startDate  : '2011-01-05T09:00:00',
                        endDate    : '2011-01-05T11:00:00'
                    }
                ]
            }),
            startDate      : new Date(2011, 0, 5),
            endDate        : new Date(2011, 0, 6),
            snap           : true,
            viewPreset     : 'hourAndDay',
            timeResolution : 15,
            tickSize       : 100,
            columns        : [
                { text : 'Name', field : 'name' }
            ],

            timeAxis : {
                continuous    : false,
                generateTicks : function generateTicks(start, end, unit, increment) {
                    const ticks = [];

                    while (start < end) {
                        if (unit !== 'hour' || start.getHours() >= 8 && start.getHours() <= 22) {
                            ticks.push({
                                id        : ticks.length + 1,
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
            { drag : '.b-sch-event', by : [30, 0], dragOnly : true },
            () => {
                t.contentLike('.b-sch-tooltip-startdate .b-sch-clock-text', '9:15', 'Snapped to 9:15');
            }
        );
    });

    // https://github.com/bryntum/support/issues/2530
    t.it('Should snap event start to next tick if dropped at a filtered out start position', async t => {
        scheduler = await t.getSchedulerAsync({
            eventStore : new EventStore({
                data : [
                    {
                        id         : 1,
                        resourceId : 'r1',
                        name       : 'Event',
                        startDate  : '2011-01-05T21:00:00',
                        endDate    : '2011-01-05T22:00:00'
                    }
                ]
            }),
            startDate : new Date(2011, 0, 5),
            endDate   : new Date(2011, 0, 8),
            columns   : [
                { text : 'Name', field : 'name' }
            ],

            viewPreset : {
                displayDateFormat : 'H:mm',
                tickWidth         : 25,
                shiftIncrement    : 1,
                shiftUnit         : 'WEEK',
                timeResolution    : {
                    unit      : 'MINUTE',
                    increment : 60
                },
                headers : [
                    {
                        unit       : 'DAY',
                        align      : 'center',
                        dateFormat : 'ddd L'
                    },
                    {
                        unit       : 'HOUR',
                        align      : 'center',
                        dateFormat : 'H'
                    }
                ]
            },
            timeAxis : {
                continuous : false,

                generateTicks(start, end, unit, increment) {
                    const ticks = [];

                    while (start < end) {

                        if (unit !== 'hour' || start.getHours() >= 8 && start.getHours() <= 21) {
                            ticks.push({
                                id        : ticks.length + 1,
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
            { drag : scheduler.unreleasedEventSelector, by : [15, 0] },
            () => {
                t.selectorExists(scheduler.unreleasedEventSelector, 'Event still rendered');
                t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 6, 8), 'Event snapped to next tick start');
            }
        );
    });

    t.it('should work crossing TimeAxis window boundaries', async t => {
        let timeAxisChangeCount = 0;

        scheduler = await getScheduler({
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
        const event = scheduler.eventStore.first;

        // So that the drag snaps to a day boundary making test reliable
        scheduler.timeAxis.resolutionUnit = 'day';

        await t.mouseDown(scheduler.eventSelector);

        await t.moveMouseTo(scheduler.timeAxisSubGridElement, null, null, [scheduler.timeAxisSubGridElement.offsetWidth - 10, 25]);

        await t.waitFor(() => timeAxisChangeCount === 2);

        await t.mouseUp();

        t.isGreaterOrEqual(event.startDate, new Date(2019, 0, 21), 'Dragged into future time axis frame');
    });

    t.it('Should be possible to use custom tooltipTemplate', async t => {
        scheduler = await t.getScheduler({
            features : {
                eventDrag : {
                    // Custom tooltip for when an event is dragged
                    tooltipTemplate : ({ eventRecord, startDate : newStartDate, endDate : newEndDate }) => {
                        t.is(eventRecord, scheduler.eventStore.first, 'eventRecord date ok');
                        t.isGreaterOrEqual(newStartDate, startDate, 'Start date ok');
                        t.isGreaterOrEqual(newEndDate, endDate, 'End date ok');
                        return 'foo';
                    }
                }
            }
        });

        const { startDate, endDate } = scheduler.eventStore.first;

        t.chain(
            { drag : scheduler.unreleasedEventSelector, by : [100, 0], dragOnly : true },
            () => {
                t.selectorExists('.b-tooltip:contains(foo)', 'Custom tooltip used');
            }
        );
    });

    // https://github.com/bryntum/support/issues/2882
    t.it('Should snap all dragged events when dragging multiple', async t => {
        scheduler = await t.getScheduler({
            multiEventSelect : true,
            snap             : true,
            timeResolution   : {
                increment : 1,
                unit      : 'day'
            },
            events : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    name       : 'source',
                    startDate  : '2011-01-05',
                    endDate    : '2011-01-07'
                }, {
                    id         : 2,
                    resourceId : 'r2',
                    name       : 'extra',
                    startDate  : '2011-01-05',
                    endDate    : '2011-01-07'
                }
            ]
        });

        scheduler.selectedEvents = scheduler.eventStore.records;

        await t.dragBy(scheduler.unreleasedEventSelector, [40, 0], null, null, null, true);

        t.is(t.rect('.b-sch-event:contains(source)').left, t.rect('.b-sch-event:contains(extra)').left, 'Events aligned before snap');

        await t.moveCursorBy([40, 0]);

        t.is(t.rect('.b-sch-event:contains(source)').left, t.rect('.b-sch-event:contains(extra)').left, 'Events aligned after snap');

        await t.moveCursorBy([40, 0]);

        t.is(t.rect('.b-sch-event:contains(source)').left, t.rect('.b-sch-event:contains(extra)').left, 'Events aligned after moving past first snap point');

        await t.mouseUp();
    });

    t.it('Should snap to correct date when moving cursor to point 0 on timeaxis', async t => {
        scheduler = await t.getScheduler({
            viewPreset       : 'hourAndDay',
            rowHeight        : 50,
            barMargin        : 5,
            multiEventSelect : true,
            snap             : true,
            startDate        : new Date(2011, 0, 5, 8),
            endDate          : new Date(2011, 0, 5, 18),
            columns          : [
                { text : 'Name', field : 'name', width : 130 }
            ],
            events : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    name       : 'source',
                    startDate  : '2011-01-05T08:00:00',
                    endDate    : '2011-01-05T12:00:00'
                }
            ]
        });

        t.firesOnce(scheduler.eventStore, 'update');

        await t.dragBy(scheduler.unreleasedEventSelector, [-scheduler.tickSize, 0]);

        t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 5, 7), 'startDate updated');
    });

    // https://github.com/bryntum/support/issues/2919
    t.it('Should handle events being removed after mousedown before starting drag', async t => {
        scheduler = await t.getSchedulerAsync({
            multiEventSelect : true,
            eventStore       : new EventStore({
                data : [
                    {
                        id         : 1,
                        resourceId : 'r1',
                        name       : 'Event',
                        startDate  : '2011-01-05T21:00:00',
                        endDate    : '2011-01-05T22:00:00'
                    },
                    {
                        id         : 2,
                        resourceId : 'r1',
                        name       : 'Event',
                        startDate  : '2011-01-05T21:00:00',
                        endDate    : '2011-01-05T22:00:00'
                    }
                ]
            }),
            startDate : new Date(2011, 0, 5),
            endDate   : new Date(2011, 0, 8),
            columns   : [
                { text : 'Name', field : 'name' }
            ]
        });

        scheduler.selectedEvents = scheduler.eventStore.records;

        t.wontFire(scheduler, 'beforeEventDrag');

        await t.mouseDown('.b-sch-event');

        scheduler.eventStore.removeAll();

        await t.moveCursorBy([100, 0]);
    });

    // https://github.com/bryntum/support/issues/2928
    t.it('Should handle all events being removed after dragging to invalid drop position', async t => {
        scheduler = await t.getSchedulerAsync({
            multiEventSelect : true,
            eventStore       : new EventStore({
                data : [
                    {
                        id         : 1,
                        resourceId : 'r1',
                        name       : 'Event 1',
                        startDate  : '2011-01-05T19:00:00',
                        endDate    : '2011-01-07T22:00:00'
                    },
                    {
                        id         : 2,
                        resourceId : 'r2',
                        name       : 'Event 2',
                        startDate  : '2011-01-05T14:00:00',
                        endDate    : '2011-01-06T22:00:00'
                    },
                    {
                        id         : 3,
                        resourceId : 'r2',
                        name       : 'Event',
                        startDate  : '2011-01-05T21:00:00',
                        endDate    : '2011-01-05T22:00:00'
                    },
                    {
                        id         : 4,
                        resourceId : 'r3',
                        name       : 'foo',
                        startDate  : '2011-01-05T21:00:00',
                        endDate    : '2011-01-05T22:00:00'
                    }
                ]
            }),
            startDate : new Date(2011, 0, 5),
            endDate   : new Date(2011, 0, 8),
            columns   : [
                { text : 'Name', field : 'name' }
            ]
        });

        t.firesOnce(scheduler, 'eventDragAbort');

        scheduler.selectedEvents = scheduler.eventStore.records.slice(0, 2);

        await t.dragTo('.b-sch-event:contains(Event 1)', '.b-grid-row', null, null, null, true, ['100%-30', '50%']);

        scheduler.eventStore.data = [];

        await t.waitForSelectorNotFound(scheduler.unreleasedEventSelector + ':contains(foo)');

        await t.mouseUp();

        await t.waitForSelectorNotFound(scheduler.unreleasedEventSelector);
    });

    // https://github.com/bryntum/support/issues/2928
    t.it('Should handle some events being removed after dragging to invalid drop position', async t => {
        scheduler = await t.getSchedulerAsync({
            multiEventSelect : true,
            eventStore       : new EventStore({
                data : [
                    {
                        id         : 1,
                        resourceId : 'r1',
                        name       : 'Event 1',
                        startDate  : '2011-01-05T19:00:00',
                        endDate    : '2011-01-07T22:00:00'
                    },
                    {
                        id         : 2,
                        resourceId : 'r2',
                        name       : 'Event 2',
                        startDate  : '2011-01-05T14:00:00',
                        endDate    : '2011-01-06T22:00:00'
                    },
                    {
                        id         : 3,
                        resourceId : 'r2',
                        name       : 'Event',
                        startDate  : '2011-01-05T21:00:00',
                        endDate    : '2011-01-06T22:00:00'
                    },
                    {
                        id         : 4,
                        resourceId : 'r3',
                        name       : 'foo',
                        startDate  : '2011-01-05T21:00:00',
                        endDate    : '2011-01-06T22:00:00'
                    }
                ]
            }),
            startDate : new Date(2011, 0, 5),
            endDate   : new Date(2011, 0, 8),
            columns   : [
                { text : 'Name', field : 'name' }
            ]
        });

        t.firesOnce(scheduler, 'eventDragAbort');

        scheduler.selectedEvents = scheduler.eventStore.records.slice(0, 2);

        await t.dragTo('.b-sch-event:contains(Event 1)', '.b-grid-row', null, null, null, true, ['100%-30', '50%']);

        scheduler.eventStore.getById(2).remove();

        await t.mouseUp();

        await t.waitForSelectorNotFound(scheduler.unreleasedEventSelector + ':contains(Event 2)');

        // This should not crash
        await t.dragBy('.b-sch-event:contains(Event 1)', [100, 0]);
    });

    // https://github.com/bryntum/support/issues/3509
    t.it('Should show tooltip anchored to dragged element if it goes out of view then back in', async t => {
        document.body.innerHTML = '<div id="container" style="display:flex"></div>';
        scheduler = await t.getSchedulerAsync({
            appendTo         : 'container',
            height           : 500,
            multiEventSelect : true,
            eventStore       : new EventStore({
                data : [
                    {
                        id         : 1,
                        resourceId : 'r1',
                        name       : 'Event 1',
                        startDate  : '2011-01-05T19:00:00',
                        endDate    : '2011-01-07T22:00:00'
                    },
                    {
                        id         : 2,
                        resourceId : 'r2',
                        name       : 'Event 2',
                        startDate  : '2011-01-05T14:00:00',
                        endDate    : '2011-01-06T22:00:00'
                    },
                    {
                        id         : 4,
                        resourceId : 'r6',
                        name       : 'foo',
                        startDate  : '2011-01-05T21:00:00',
                        endDate    : '2011-01-06T22:00:00'
                    }
                ]
            }),
            startDate : new Date(2011, 0, 5),
            endDate   : new Date(2011, 0, 8)
        });

        new Panel({
            id       : 'panel',
            appendTo : 'container',
            html     : 'foo',
            height   : 500,
            width    : 400
        });

        // Basic drag
        await t.dragBy('.b-sch-event:contains(foo)', [50, 0]);

        // Drag out / in (have to drag in two steps for safari to behave as expected)
        await t.dragBy({
            source   : '.b-sch-event:contains(foo)',
            delta    : [50, 0],
            dragOnly : true
        });

        await t.moveMouseTo({
            target : '#panel',
            offset : ['100%-30', '50%']
        });

        await t.moveCursorTo('.b-sch-event:contains(Event 1)');
        await t.waitForSelector('.b-tooltip');

        t.isApprox(t.rect('.b-tooltip').top, t.rect('.b-sch-event:contains(Event 1)').bottom, 20, 'Aligned close to bottom of Event 1');

        await t.mouseUp();
    });

    // https://github.com/bryntum/support/issues/3523
    t.it('Should not select multiple events if multiEventSelect is false', async t => {
        scheduler = await t.getSchedulerAsync({
            multiEventSelect : false,
            eventStore       : new EventStore({
                data : [
                    {
                        id         : 1,
                        resourceId : 'r1',
                        name       : 'Event 1',
                        startDate  : '2011-01-05T19:00:00',
                        endDate    : '2011-01-07T22:00:00'
                    },
                    {
                        id         : 2,
                        resourceId : 'r2',
                        name       : 'Event 2',
                        startDate  : '2011-01-05T14:00:00',
                        endDate    : '2011-01-06T22:00:00'
                    }
                ]
            }),
            startDate : new Date(2011, 0, 5),
            endDate   : new Date(2011, 0, 8),
            columns   : [
                { text : 'Name', field : 'name' }
            ]
        });

        await t.dragBy({
            source  : '.b-sch-event:contains(Event 1)',
            delta   : [10, 20],
            options : {
                ctrlKey : true
            }
        });

        await t.dragBy({
            source  : '.b-sch-event:contains(Event 2)',
            delta   : [10, 20],
            options : {
                ctrlKey : true
            }
        });

        t.is(scheduler.selectedEvents.length, 1, '1 event selected');
        t.is(scheduler.selectedEvents[0].name, 'Event 2', 'Last dragged event selected');
    });

    // https://github.com/bryntum/support/issues/3479
    t.it('Should navigate to next event correctly after removing assignments one by one', async t => {
        scheduler = await t.getSchedulerAsync({
            listeners : {
                beforeEventDropFinalize : async(event) => {
                    event.context.async = true;

                    await scheduler.project.commitAsync();

                    event.context.finalize(true);

                    await scheduler.project.commitAsync();

                    const [event1, event2] = scheduler.eventStore.getRange(0, 2);

                    event1.remove();
                    event2.remove();
                }
            }
        });

        // Drag 1st event before 2nd
        await t.dragBy({
            source   : '[data-event-id="1"]',
            delta    : [-40, 40],
            dragOnly : true
        });

        await t.keyPress(null, '[CTRL]');

        await t.mouseUp(null);

        t.is(scheduler.activeAssignment.event.id, 3, '3rd event is active');

        // Drag 1st event after 2nd
        await t.dragBy({
            source   : '[data-event-id="3"]',
            delta    : [200, 60],
            dragOnly : true
        });

        await t.keyPress(null, '[CTRL]');

        await t.mouseUp(null);

        t.is(scheduler.activeAssignment.event.id, 5, 'Last event is active');
    });

    t.it('Should navigate to next event correctly after removing assignments in bulk', async t => {
        scheduler = await t.getSchedulerAsync({
            events : [
                {
                    id         : 1,
                    resourceId : 'r2',
                    startDate  : '2011-01-03',
                    endDate    : '2011-01-04'
                },
                {
                    id         : 2,
                    resourceId : 'r2',
                    startDate  : '2011-01-05',
                    endDate    : '2011-01-06'
                },
                {
                    id         : 3,
                    resourceId : 'r2',
                    startDate  : '2011-01-07',
                    endDate    : '2011-01-08'
                }
            ],
            listeners : {
                beforeEventDropFinalize : async(event) => {
                    event.context.async = true;

                    await scheduler.project.commitAsync();

                    event.context.finalize(true);

                    await scheduler.project.commitAsync();

                    scheduler.eventStore.remove([2, 3]);
                }
            }
        });

        // Drag 1st event before 2nd
        await t.dragBy({
            source   : '[data-event-id="2"]',
            delta    : [0, 40],
            dragOnly : true
        });

        await t.keyPress(null, '[CTRL]');

        await t.mouseUp(null);

        t.is(scheduler.activeAssignment.event.id, 1, '1st event is active');
    });

    // https://github.com/bryntum/support/issues/3635
    t.it('Should not crash when dependencies feature exists and dragging an event and constrainDragToTimeline is set', async t => {
        scheduler = t.getScheduler({
            startDate : new Date(2018, 0, 1, 10),
            endDate   : new Date(2018, 0, 1, 18),

            viewPreset : 'hourAndDay',

            // Columns parameters.
            columns : [
                { text : 'Name', field : 'name' }
            ],
            features :
                {
                    dependencies : true,
                    eventDrag    : {
                        constrainDragToTimeline : false
                    }
                },
            resources : [
                { id : 1, name : 'Resource 1' }
            ],
            events : [
                {
                    id           : 1,
                    resourceId   : 1,
                    name         : 'First Task',
                    startDate    : new Date(2018, 0, 1, 10),
                    duration     : 2,
                    durationUnit : 'h'
                },
                {
                    id           : 2,
                    resourceId   : 1,
                    name         : 'First Task',
                    startDate    : new Date(2018, 0, 1, 15),
                    duration     : 2,
                    durationUnit : 'h'
                }
            ],
            dependencies : [
                { id : 1, fromEvent : 1, toEvent : 2 }
            ]
        });

        t.firesOnce(scheduler.eventStore, 'update');

        await t.dragBy({
            source : scheduler.unreleasedEventSelector,
            delta  : [100, 0]
        });
    });

    // https://github.com/bryntum/support/issues/3974
    t.it('Should not crash when dependencies feature exists and dragging an event and constrainDragToTimeline is set', async t => {
        scheduler = t.getScheduler({
            startDate : new Date(2018, 0, 1, 10),
            endDate   : new Date(2018, 0, 1, 18),
            resources : [
                { id : 1, name : 'Resource 1' }
            ],
            events : [
                {
                    id           : 1,
                    resourceId   : 1,
                    name         : 'First Task',
                    startDate    : new Date(2018, 0, 1, 10),
                    duration     : 2,
                    durationUnit : 'h'
                }
            ],

            eventRenderer : ({ eventRecord, renderData }) => {
                renderData.children.push({
                    className : 'value',
                    style     : {
                        width : '20%'
                    },
                    html : 20
                });
            }
        });

        t.firesOnce(scheduler.eventStore, 'update');

        await t.dragBy({
            source : scheduler.unreleasedEventSelector,
            delta  : [100, 0]
        });
    });
});
