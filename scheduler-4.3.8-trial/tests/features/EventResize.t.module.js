import { DomHelper, Tooltip, EventModel, ResourceModel } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler && scheduler.destroy());

    async function getScheduler(t, config = {}) {
        const scheduler = t.getScheduler(config);

        await t.waitForProjectReady();

        return scheduler;
    }

    t.it('Should display resize handles on hover', async t => {
        scheduler = await getScheduler(t);

        t.chain(
            { moveMouseTo : '.b-sch-event' },

            (next, el) => {
                // detect pseudo elements used for resize handles
                const startHandle = window.getComputedStyle(el, ':before');
                t.is(startHandle.width, '4px', 'startHandle.width correct');
                t.is(startHandle.borderLeftWidth, '1px', 'startHandle.borderLeftWidth correct');
                t.is(startHandle.borderRightWidth, '1px', 'startHandle.borderRightWidth correct');

                const endHandle = window.getComputedStyle(el, ':after');
                t.is(endHandle.width, '4px', 'endHandle.width correct');
                t.is(endHandle.borderLeftWidth, '1px', 'endHandle.borderLeftWidth correct');
                t.is(endHandle.borderRightWidth, '1px', 'endHandle.borderRightWidth correct');
            }
        );
    });

    t.it('Should resize', async t => {
        let counter = 0;

        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    validatorFn({ resourceRecord, eventRecord, startDate, endDate }, event) {
                        if ((counter % 10) === 0) {
                            t.ok(resourceRecord instanceof ResourceModel &&
                                eventRecord instanceof EventModel &&
                                startDate instanceof Date &&
                                endDate instanceof Date &&
                                (event ? event instanceof Event : true), 'Correct function arguments');
                        }
                        counter++;

                        return endDate < new Date(2011, 0, 8);
                    }
                }
            },
            events : [
                {
                    id         : 1,
                    name       : 'Event',
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                }
            ]

        });

        const evt = scheduler.eventStore.first;
        t.wontFire(scheduler, 'eventclick');

        t.chain(
            { moveCursorTo : '.b-sch-event' },

            next => {
                let transitionCount = 0;

                // The two drag operations should cause only two width transitions - that's at the mouseup.
                // The width changing during the drag must not be animated.
                scheduler.contentElement.addEventListener('transitionstart', ({ target, propertyName }) => {
                    if (target.matches('.b-sch-event-wrap') && propertyName === 'width') {
                        if (++transitionCount > 2) {
                            t.fail('Only two event width animations should be started');
                        }
                    }
                });
                next();
            },

            { drag : '.b-sch-event', offset : ['100%-3', 5], by : [53, 0], dragOnly : true },

            next => {
                t.ok(evt.meta.isResizing, 'isResizing flag set correctly');
                next();
            },

            { moveCursorBy : [45, 0] },
            { mouseUp : null },

            next => {
                t.isGreaterOrEqual(evt.endDate, new Date(2011, 0, 7), 'Existing event resized correctly');
                t.notOk(evt.meta.isResizing, 'isResizing flag cleared correctly');
                next();
            },

            // Over-drag, then the validator will veto
            { drag : '.b-sch-event', offset : ['100%-3', 5], by : [110, 0] },

            () => {
                t.isLess(evt.endDate, new Date(2011, 0, 8), 'Existing event not resized.');
            }
        );
    });

    t.it('Should fire eventresizeend once when operation is invalid', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    validatorFn : () => false
                }
            },
            events : [
                {
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                }
            ]
        });

        t.firesOnce(scheduler, 'eventresizeend');

        t.chain(
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : ['100%-3', 5], by : [100, 0] }
        );
    });

    t.it('Should resize with showExactResizePosition w/o snapRelativeToEventStartDate', async t => {
        scheduler = await getScheduler(t, {
            startDate  : new Date(2011, 0, 3),
            viewPreset : 'hourAndDay',
            events     : [
                {
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 3, 4, 13, 18),
                    endDate    : new Date(2011, 0, 3, 6)
                }
            ],
            features : {
                eventResize : {
                    showExactResizePosition : true
                }
            }
        });

        const tickSize = scheduler.timeAxisViewModel.tickSize,
            record    = scheduler.eventStore.first;

        t.chain(
            // resizing start
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : [5, 5], by : [-0.2 * tickSize, 0] },

            next => {
                t.is(record.startDate, new Date(2011, 0, 3, 4), 'Event wasn\'t resized');
                next();
            },
            { moveCursorTo : '.b-sch-event', offset : ['100%+10', 0] },

            { drag : '.b-sch-event', offset : [5, 5], by : [-0.5 * tickSize, 0] },
            next => {
                t.is(record.startDate, new Date(2011, 0, 3, 3, 30), 'Event resized');
                next();
            },
            { moveCursorTo : '.b-sch-event', offset : ['100%+10', 0] },

            { drag : '.b-sch-event', offset : [5, 5], by : [-0.2 * tickSize, 0] },

            next => {
                t.is(record.startDate, new Date(2011, 0, 3, 3, 30), 'Event wasn\'t resized');
                next();
            },

            // resizing end
            { moveCursorTo : '.b-sch-event', offset : ['100%+10', 0] },

            { drag : '.b-sch-event', offset : ['100%-5', 5], by : [0.2 * tickSize, 0] },

            next => {
                t.is(record.endDate, new Date(2011, 0, 3, 6), 'Event wasn\'t resized');
                next();
            },

            { moveCursorTo : '.b-sch-event', offset : ['100%+10', 0] },

            { drag : '.b-sch-event', offset : ['100%-5', 5], by : [0.5 * tickSize, 0] },

            next => {
                t.is(record.endDate, new Date(2011, 0, 3, 6, 30), 'Event resized');
                next();
            },

            { moveCursorTo : '.b-sch-event', offset : ['100%+10', 0] },

            { drag : '.b-sch-event', offset : ['100%-5', 5], by : [0.2 * tickSize, 0] },

            next => {
                t.is(record.endDate, new Date(2011, 0, 3, 6, 30), 'Event wasn\'t resized');
                next();
            }
        );
    });

    t.it('Should resize with showExactResizePosition w/ snapRelativeToEventStartDate', async t => {
        scheduler = await getScheduler(t, {
            startDate  : new Date(2011, 0, 3),
            viewPreset : 'hourAndDay',
            events     : [
                {
                    id         : 1,
                    name       : 'Event',
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 3, 4, 13, 18),
                    endDate    : new Date(2011, 0, 3, 6, 16, 23)
                }
            ],
            snapRelativeToEventStartDate : true,
            features                     : {
                eventResize : { showExactResizePosition : true }
            }
        });

        const tickSize = scheduler.timeAxisViewModel.tickSize,
            record    = scheduler.eventStore.first;

        t.chain(
            { moveCursorTo : '.b-sch-event' },
            // resizing start
            { drag : '.b-sch-event', offset : [5, 5], by : [-0.2 * tickSize, 0] },
            next => {
                t.is(record.startDate, new Date(2011, 0, 3, 4, 13, 18), 'Event wasn\'t resized');
                next();
            },
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : [5, 5], by : [-0.5 * tickSize, 0] },
            next => {
                t.is(record.startDate, new Date(2011, 0, 3, 3, 43, 18), 'Event resized');
                next();
            },
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : [5, 5], by : [-0.2 * tickSize, 0] },
            next => {
                t.is(record.startDate, new Date(2011, 0, 3, 3, 43, 18), 'Event wasn\'t resized');
                next();
            },

            // resizing end
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : ['100%-5', 5], by : [0.2 * tickSize, 0] },
            next => {
                t.is(record.endDate, new Date(2011, 0, 3, 6, 16, 23), 'Event wasn\'t resized');
                next();
            },
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : ['100%-5', 5], by : [0.5 * tickSize, 0] },
            next => {
                t.is(record.endDate, new Date(2011, 0, 3, 6, 46, 23), 'Event resized');
                next();
            },
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : ['100%-5', 5], by : [0.2 * tickSize, 0] },
            () => {
                t.is(record.endDate, new Date(2011, 0, 3, 6, 46, 23), 'Event wasn\'t resized');
            }
        );
    });

    t.it('Resizing event should not move vertically (horizontal scheduler)', async t => {
        scheduler = await getScheduler(t, {
            startDate     : new Date(2011, 0, 3),
            viewPreset    : 'hourAndDay',
            resourceStore : t.getResourceStore2({}, 30),
            events        : [
                {
                    id         : 1,
                    name       : 'Event1',
                    cls        : 'b-sch-event1',
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 3, 4, 13, 18),
                    endDate    : new Date(2011, 0, 3, 6, 16, 23)
                },
                {
                    id         : 2,
                    name       : 'Event2',
                    cls        : 'b-sch-event2',
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 3, 5, 13, 18),
                    endDate    : new Date(2011, 0, 3, 7, 16, 23)
                }
            ],
            features : {
                eventResize : true
            }
        });

        let el, y, relativeY;

        t.chain(
            // resizing start
            next => {
                el        = document.querySelector('.b-sch-event1');
                relativeY = DomHelper.getTranslateY(el) - DomHelper.getTranslateY(el.parentElement);
                next();
            },
            { moveMouseTo : '.b-sch-event1' },
            { drag : '.b-sch-event1', offset : ['100%-5', 5], by : [20, 0], dragOnly : true },
            next => {
                t.selectorExists('.b-resizing-event', 'Resizing CSS class added');

                el = document.querySelector('.b-sch-event1');
                y  = DomHelper.getTranslateY(el);
                scheduler.bodyContainer.scrollTop = 100;
                next();
            },

            next => {
                t.is(DomHelper.getTranslateY(el) - DomHelper.getTranslateY(el.parentElement), relativeY, 'Cell-relative position hasn\'t changed');
                t.is(DomHelper.getTranslateY(el), y, 'First event scheduler position hasn\'t changed');
                next();
            },
            { action : 'mouseUp' },
            next => {
                scheduler.bodyContainer.scrollTop = 10;
                next();
            },
            // drag second
            { moveCursorTo : '.b-sch-event2' },
            next => {
                el        = document.querySelector('.b-sch-event2');
                relativeY = DomHelper.getTranslateY(el) - DomHelper.getTranslateY(el.parentElement);
                next();
            },
            { moveMouseTo : '.b-sch-event1' },
            { moveMouseTo : '.b-sch-event2' },
            { drag : '.b-sch-event2', offset : ['100%-5', 5], by : [20, 0], dragOnly : true },

            next => {
                el = document.querySelector('.b-sch-event2');
                y  = DomHelper.getTranslateY(el);
                scheduler.bodyContainer.scrollTop = 100;
                next();
            },
            next => {
                t.is(DomHelper.getTranslateY(el) - DomHelper.getTranslateY(el.parentElement), relativeY, 'Cell-relative position hasn\'t changed');
                t.is(DomHelper.getTranslateY(el), y, 'Second event\' position hasn\'t changed');
                next();
            },
            { action : 'mouseUp' }
        );
    });

    t.it('DOM element of target being resized should be above any other event DOM elements', async t => {
        scheduler = await getScheduler(t, {
            startDate  : new Date(2011, 0, 3),
            viewPreset : 'hourAndDay',
            features   : {
                eventResize : {
                    showTooltip : false
                }
            },
            events : [
                {
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 3, 4),
                    endDate    : new Date(2011, 0, 3, 4, 50),
                    cls        : 'foo'
                },
                {
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 3, 5),
                    endDate    : new Date(2011, 0, 3, 5, 50),
                    cls        : 'bar'
                }
            ]
        });

        // for edge, siesta does not like fractional heights
        scheduler.headerContainer.style.height = '60px';

        t.willFireNTimes(scheduler, 'beforeeventresize', 2);
        t.willFireNTimes(scheduler, 'eventresizestart', 2);
        t.firesAtLeastNTimes(scheduler, 'eventpartialresize', 1);
        t.willFireNTimes(scheduler, 'eventresizeend', 2);

        t.chain(
            { moveCursorTo : '.foo' },

            { drag : '.foo', offset : ['100%-5', 10], by : [50, 0], dragOnly : true },

            next => {
                const
                    resizeElZIndex = window.getComputedStyle(document.querySelector(scheduler.eventSelector + '.b-sch-event-wrap-resizing'))['z-index'],
                    otherElZIndex = window.getComputedStyle(document.querySelector(scheduler.eventSelector + ':not(.b-sch-event-wrap-resizing)'))['z-index'];

                t.isGreater(Number(resizeElZIndex), Number(otherElZIndex), 'Active resize target should be above any event in the z-index stack', true);
                next();
            },

            { moveCursorBy : [-50, 0] },
            { mouseUp : null },

            { moveCursorTo : '.bar' },
            { drag : '.bar', offset : [5, '50%'], by : [-50, 0], dragOnly : true },

            next => {
                const
                    resizeElZIndex = window.getComputedStyle(document.querySelector(scheduler.eventSelector + '.b-sch-event-wrap-resizing'))['z-index'],
                    otherElZIndex  = window.getComputedStyle(document.querySelector(scheduler.eventSelector + ':not(.b-sch-event-wrap-resizing)'))['z-index'];

                t.isGreater(Number(resizeElZIndex), Number(otherElZIndex), 'Active resize target should be above any event in the z-index stack', true);
                next();
            },

            { mouseUp : null },

            { waitForSelector : '.bar', desc : 'bar element rendered' },
            { waitForSelector : '.foo', desc : 'foo element rendered' }
        );
    });

    // https://github.com/bryntum/support/issues/3356
    t.it('Should honor `showTooltip`', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    showTooltip : false
                }
            },
            events : [
                {
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 3),
                    endDate    : new Date(2011, 0, 4)
                }
            ]
        });

        await t.moveCursorTo('.b-sch-event');
        await t.dragBy({
            source   : '.b-sch-event',
            offset   : ['100%-5', 10],
            delta    : [50, 0],
            dragOnly : true
        });

        t.selectorNotExists('.b-tooltip');
        await t.mouseUp();
    });

    t.it('Clock in tooltip is updated on resize', async t => {
        scheduler = await getScheduler(t, {
            viewPreset : 'hourAndDay',
            startDate  : new Date(2018, 3, 27),
            endDate    : new Date(2018, 3, 30),
            eventStore : t.getEventStore({
                data : [
                    {
                        startDate  : '2018-04-27T00:00',
                        endDate    : '2018-04-27T01:00',
                        id         : 1,
                        resourceId : 'r1'
                    }
                ]
            })
        });

        function assertClock(t, hour, minute, side) {
            const
                hourIndicator = document.querySelector(`.b-sch-tip-valid .b-sch-tooltip-${side}date .b-sch-hour-indicator`),
                minuteIndicator = document.querySelector(`.b-sch-tip-valid .b-sch-tooltip-${side}date .b-sch-minute-indicator`);
            t.is(hourIndicator.style.transform, `rotate(${hour * 30}deg)`, 'Hour indicator is ok');
            t.is(minuteIndicator.style.transform, `rotate(${minute * 6}deg)`, 'Minute indicator is ok');
        }

        const step = scheduler.timeAxisViewModel.tickSize / 2;

        t.chain(
            { drag : '.b-sch-event', fromOffset : ['100%-5', '50%'], by : [[step, 0]], dragOnly : true },
            { waitForSelector : '.b-sch-tip-valid' },
            (next, el) => {
                assertClock(t, 1, 30, 'end');
                next();
            },
            { moveMouseBy : [step, 0] },
            { waitFor : 100 },
            next => {
                assertClock(t, 2, 0, 'end');
                next();
            },
            { moveMouseBy : [step, 0] },
            next => {
                assertClock(t, 2, 30, 'end');
                next();
            },
            { mouseUp : null },
            { drag : '.b-sch-event', fromOffset : [5, '50%'], by : [[step, 0]], dragOnly : true },
            { waitForSelector : '.b-sch-tip-valid' },
            (next, el) => {
                assertClock(t, 0, 30, 'start');
                next();
            },
            { moveMouseBy : [step, 0] },
            next => {
                assertClock(t, 1, 0, 'start');
                next();
            },
            { moveMouseBy : [step, 0] },
            next => {
                assertClock(t, 1, 30, 'start');
                next();
            },
            { mouseUp : null }
        );
    });

    t.it('Should not allow resizing if readOnly', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : true
            },
            readOnly : true
        });

        const width = document.querySelector('.b-sch-event').offsetWidth;

        t.wontFire(scheduler, 'beforeeventresize');
        t.wontFire(scheduler, 'eventresizestart');

        t.chain(
            { drag : '.b-sch-event', offset : ['100%', 10], by : [-30, 0] },
            () => {
                t.is(document.querySelector('.b-sch-event').offsetWidth, width, 'Event not resized');
            }
        );
    });

    // Test tooltip alignment when the document is scrolled.
    // https://app.assembla.com/spaces/bryntum/tickets/6740
    if (document.scrollingElement) {
        t.it('Tooltip should align correctly', async t => {
            scheduler = await getScheduler(t, {
                viewPreset : 'hourAndDay',
                startDate  : new Date(2018, 3, 27),
                endDate    : new Date(2018, 3, 30),
                eventStore : t.getEventStore({
                    data : [
                        {
                            startDate  : '2018-04-27',
                            endDate    : '2018-04-27 01:00',
                            id         : 1,
                            resourceId : 'r1'
                        }
                    ]
                })
            });

            // Visually the look should be the same, but the document is scrolled.
            document.scrollingElement.style.paddingTop = '1000px';
            document.scrollingElement.scrollTop = 1000;

            const
                step = scheduler.timeAxisViewModel.tickSize / 2,
                eventEl = scheduler.getElementsFromEventRecord(scheduler.eventStore.getAt(0))[0];

            t.chain(
                { drag : '.b-sch-event', fromOffset : ['100%-5', '50%'], by : [[step, 0]], dragOnly : true },
                { waitForSelector : '.b-sch-tip-valid' },
                next => {
                    const tip = scheduler.features.eventResize.tip;

                    t.isApprox(tip.element.getBoundingClientRect().top, eventEl.getBoundingClientRect().bottom + tip.anchorSize[1], 'Resize tip is aligned just below the event');
                    next();
                },
                { mouseUp : null },
                () => {
                    document.scrollingElement.style.paddingTop = '0px';
                    document.scrollingElement.scrollTop = 0;
                }
            );
        });
    }

    t.it('Should show message and block drop if validator returns object with `valid` false', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    validatorFn({ resourceRecord, eventRecord, start, end }, event) {
                        return {
                            valid   : false,
                            message : 'msg'
                        };
                    }
                }
            },
            events : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                }
            ]
        });

        t.wontFire(scheduler.eventStore, 'change');

        t.chain(
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : ['100%-3', 5], by : [100, 0], dragOnly : true },

            { waitForSelector : '.b-tooltip .b-sch-tip-message:textEquals(msg)' },

            { mouseUp : null }
        );
    });

    t.it('Should not show message if validator returns object with `valid` true', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    validatorFn({ resourceRecord, eventRecord, start, end }, event) {
                        return {
                            valid : true
                        };
                    }
                }
            },
            events : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                }
            ]
        });

        t.firesOnce(scheduler.eventStore, 'change');

        t.chain(
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : ['100%-3', 5], by : [100, 0], dragOnly : true },

            { waitForSelector : '.b-tooltip .b-sch-tip-message:empty' },

            { mouseUp : null }
        );
    });

    t.it('Should consider undefined return value as valid action', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    validatorFn({ resourceRecord, eventRecord, start, end }, event) {
                    }
                }
            },
            events : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                }
            ]
        });

        t.firesOnce(scheduler.eventStore, 'change');

        t.chain(
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : ['100%-3', 5], by : [100, 0] }
        );
    });

    t.it('Should show same end date, as in calendar icon', async t => {
        scheduler = await getScheduler(t, {
            viewPreset : 'weekAndDayLetter',
            events     : [
                {
                    id         : 1,
                    name       : 'Event',
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                }
            ]

        });

        t.chain(
            { moveCursorTo : '.b-sch-event' },

            { drag : '.b-sch-event', offset : ['100%-3', 5], by : [90, 0], dragOnly : true },

            { waitForSelector : '.b-sch-clock-day.b-sch-tooltip-enddate .b-sch-clock-text:textEquals(Jan 7, 2011)' },
            { waitForSelector : '.b-sch-clock-day.b-sch-tooltip-enddate .b-sch-clock:contains(7)' },

            { mouseUp : null }
        );
    });

    t.it('Should respect Scheduler#getDateConstraints', async t => {
        let called = false;

        scheduler = await getScheduler(t, {
            resources : [
                { id : 'r1', name : 'Resource 1' }
            ],

            getDateConstraints(resourceRecord, eventRecord) {
                t.ok(resourceRecord instanceof scheduler.resourceStore.modelClass, 'resourceRecord arg has correct type');
                t.ok(eventRecord instanceof scheduler.eventStore.modelClass, 'eventRecord arg has correct type');
                called = true;
                return {
                    start : new Date(2011, 0, 4),
                    end   : new Date(2011, 0, 6)
                };
            }
        });

        t.chain(
            { drag : '.b-sch-event', offset : ['100%-3', 10], by : [200, 0] },

            () => {
                t.ok(called, 'getDateConstraints() was called');
                t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 4), 'Correct startDate');
                t.is(scheduler.eventStore.first.endDate, new Date(2011, 0, 6), 'Correct endDate');
            }
        );
    });

    t.it('Should respect Scheduler#getDateConstraints & showExactResizePosition', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    showExactResizePosition : true
                }
            },

            resources : [
                { id : 'r1', name : 'Resource 1' }
            ],

            getDateConstraints : () =>  ({
                start : new Date(2011, 0, 4),
                end   : new Date(2011, 0, 6)
            })
        });

        t.chain(
            { drag : '.b-sch-event', offset : ['100%-3', 10], by : [200, 0], dragOnly : true },

            next => {
                t.isApprox(document.querySelector('.b-sch-event:not(.b-sch-released)').offsetWidth, 200, 'Width limited by constraint');
                next();
            },

            { mouseUp : null },

            () => {
                t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 4), 'Correct startDate');
                t.is(scheduler.eventStore.first.endDate, new Date(2011, 0, 6), 'Correct endDate');
            }
        );

    });

    t.it('Should add/remove b-sch-terminals-visible class to/from event inner', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    showExactResizePosition : true
                },
                dependencies : true
            },

            resources : [
                { id : 'r1', name : 'Resource 1' }
            ],

            getDateConstraints : () =>  ({
                start : new Date(2011, 0, 4),
                end   : new Date(2011, 0, 6)
            })
        });

        const
            eventInner = scheduler.getElementFromEventRecord(scheduler.eventStore.first),
            eventWrap = eventInner.parentNode;

        t.chain(
            { moveMouseTo : eventInner, offset : [4, 10] },

            next => {
                t.ok(!eventWrap.classList.contains('b-sch-terminals-visible'));
                t.ok(eventInner.classList.contains('b-sch-terminals-visible'));
                next();
            },

            { drag : eventInner, offset : [4, 10], by : [2, 0] },

            next => {
                t.ok(!eventWrap.classList.contains('b-sch-terminals-visible'));
                t.ok(eventInner.classList.contains('b-sch-terminals-visible'));
                next();
            },

            { mouseUp : null }
        );
    });

    t.it('Mouseout through a dep terminal should correctly remove resizing class', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    showExactResizePosition : true
                },
                dependencies : true
            },

            resources : [
                { id : 'r1', name : 'Resource 1' }
            ],

            getDateConstraints : () =>  ({
                start : new Date(2011, 0, 4),
                end   : new Date(2011, 0, 6)
            })
        });

        const
            eventInner = scheduler.getElementFromEventRecord(scheduler.eventStore.first),
            eventWrap = eventInner.parentNode;

        t.chain(
            { moveMouseTo : eventInner, offset : [4, '50%'] },

            // Inner and outer get their correct classes
            next => {
                t.ok(eventWrap.classList.contains('b-over-resize-handle'));
                t.ok(eventInner.classList.contains('b-resize-handle'));
                next();
            },

            // Exit through the dep terminal
            { moveMouseBy : [-20, 0] },

            // Inner and outer get the resizing classes removed
            () => {
                t.notOk(eventWrap.classList.contains('b-over-resize-handle'));
                t.notOk(eventInner.classList.contains('b-resize-handle'));
            }
        );
    });

    t.it('Should abort on ESC key', async t => {
        scheduler = await getScheduler(t, {
            events : [
                {
                    id         : 1,
                    name       : 'Event',
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                }
            ]
        });
        const evt = scheduler.eventStore.first;

        t.firesOnce(scheduler, 'eventResizeEnd');

        t.chain(
            { moveCursorTo : '.b-sch-event' },
            { drag : '.b-sch-event', offset : ['100%-3', 5], by : [100, 0], dragOnly : true },

            next => {
                t.ok(evt.meta.isResizing, 'isResizing flag set correctly');
                next();
            },

            { type : '[ESCAPE]' },

            () => {
                t.selectorNotExists('.b-resizing-event', 'not resizing anymore');
                t.notOk(evt.meta.isResizing, 'isResizing flag cleared correctly');
            }
        );
    });

    t.it('Should respect `allowOverlap` setting on Scheduler', async t => {
        scheduler = await getScheduler(t, {
            allowOverlap : false,
            events       : [
                {
                    id         : 1,
                    name       : 'Event',
                    resourceId : 'r1',
                    cls        : 'one',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                },
                {
                    id         : 2,
                    name       : 'Event 2',
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 7),
                    endDate    : new Date(2011, 0, 8)
                }
            ]
        });

        t.wontFire(scheduler.eventStore, 'update');

        const originalWidth = document.querySelector('.one').offsetWidth;

        t.chain(
            { moveCursorTo : '.b-sch-event' },
            { drag : '.b-sch-event', offset : ['100%-3', 5], by : [200, 0] },
            { waitFor : () => document.querySelector('.one').offsetWidth === originalWidth }
        );
    });

    t.it('Should have completed context on a non-resize', async t => {
        scheduler = await getScheduler(t, {
            events : [
                {
                    id         : 1,
                    name       : 'Event',
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 4),
                    endDate    : new Date(2011, 0, 6)
                }
            ]
        });

        t.wontFire(scheduler, 'eventResizeEnd');

        t.chain(
            { moveCursorTo : '.b-sch-event' },

            // Resize by less than the starting threshold. Which is zero by default
            // so drag by zero pixels.
            // resizeEnd should still be able to read off the record we dragged.
            { drag : '.b-sch-event', offset : [10, '50%'], by : [0, 0] },

            () => {
                t.selectorNotExists('.b-resizing-event', 'not resizing anymore');
            }
        );
    });

    t.it('Should support disabling', async t => {
        scheduler = await getScheduler(t);

        scheduler.features.eventResize.disabled = true;

        t.chain(
            { drag : '.b-sch-event', offset : [3, 10], by : [50, 0], dragOnly : true },

            next => {
                t.selectorNotExists('.b-sch-event-resizing', 'Not resizing');

                scheduler.features.eventResize.disabled = false;

                next();
            },

            { mouseUp : null },

            { drag : '.b-sch-event', offset : [3, 10], by : [50, 0], dragOnly : true },

            next => {
                t.selectorExists('.b-sch-event-resizing', 'Resizing');

                next();
            },

            { mouseUp : null }
        );
    });

    // https://github.com/bryntum/support/issues/1198
    t.it('Resizing left handle outside schedule area to the left should not stretch event width', async t => {
        scheduler = await getScheduler(t, {
            startDate : new Date(2011, 0, 4)
        });

        let eventLength;

        t.chain(
            { waitForSelector : '.b-sch-event-wrap[data-event-id="1"]' },

            async() => {
                eventLength = t.rect('.b-sch-event-wrap[data-event-id="1"]').width;
            },

            { drag : '.b-sch-event-wrap[data-event-id="1"]', offset : [5, 10], by : [-200, 0], dragOnly : true },

            async() => {
                t.is(t.rect('.b-sch-event-wrap-resizing').width, eventLength, 'Proxy element should not be increased since there is no place to drag left');
            },

            { mouseUp : null }
        );
    });

    // https://github.com/bryntum/support/issues/2082
    t.it('Should accept a tip config object', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    tip : {
                        cls : 'foo'
                    }
                }
            }
        });

        t.chain(
            { drag : '.b-sch-event', fromOffset : ['100%-5', '50%'], by : [50, 0], dragOnly : true },

            () => {
                t.selectorExists('.b-tooltip.foo', 'Tip was configured properly');
            }
        );
    });

    t.it('Should accept a tip instance', async t => {
        scheduler = await getScheduler(t, {
            features : {
                eventResize : {
                    tip : new Tooltip({
                        html : 'foo'
                    })
                }
            }
        });

        t.chain(
            { drag : '.b-sch-event', fromOffset : ['100%-5', '50%'], by : [50, 0], dragOnly : true },

            () => {
                t.selectorExists('.b-tooltip:contains(foo)', 'Tip was configured properly');
            }
        );
    });

    t.it('Should handle event being removed while resizing', async t => {
        scheduler = await getScheduler(t);

        t.firesOnce(scheduler.eventStore, 'update');

        t.chain(
            { drag : scheduler.unreleasedEventSelector,  fromOffset : ['100%-5', '50%'], by : [50, 0], dragOnly : true },

            async() => {
                scheduler.eventStore.first.remove();
            },

            { mouseUp : null },

            { waitForSelectorNotFound : `${scheduler.unreleasedEventSelector}:contains(Assignment 1)` },

            { drag : scheduler.unreleasedEventSelector, fromOffset : ['100%-5', '50%'], by : [50, 0] }
        );
    });

    // https://github.com/bryntum/support/issues/2497
    t.it('Should never derender an event while resizing', async t => {
        scheduler = await getScheduler(t, {
            startDate : new Date(2011, 0, 3),
            endDate   : new Date(2011, 0, 30)
        });
        const
            event = scheduler.eventStore.first,
            eventEl = scheduler.getEventElement(event),
            targetScrollDate = new Date(2011, 0, 22);

        await t.dragBy({
            source   : eventEl,
            delta    : [600, 0],
            dragOnly : true,
            offset   : ['100%-5', '50%']
        });

        await t.waitFor(() => scheduler.visibleDateRange.endDate >= targetScrollDate);

        // Must not have been derendered
        t.elementIsVisible(eventEl);

        await t.mouseUp();
    });

    t.it('Should support using tooltipTemplate', async t => {
        scheduler = await t.getScheduler({
            appendTo : document.body,
            features : {
                eventResize : {
                    tooltipTemplate : ({ record, startDate, endDate }) => {
                        const eventRecord = scheduler.eventStore.first;

                        t.is(record, eventRecord, 'record date ok');
                        t.is(startDate, eventRecord.startDate, 'Start date ok');
                        t.isGreaterOrEqual(endDate, eventRecord.endDate, 'End date ok');
                        return eventRecord.name;
                    }
                }
            }
        });

        t.chain(
            { moveCursorTo : '[data-event-id=1]' },

            { drag : '[data-event-id=1]', offset : ['100%-1', '50%'], by : [100, 0], dragOnly : true },

            () => t.selectorExists('.b-tooltip:contains(Assignment 1)')
        );
    });
});
