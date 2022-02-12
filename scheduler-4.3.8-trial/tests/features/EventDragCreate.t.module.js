import { EventStore, ResourceStore, ResourceModel, Scheduler, BrowserHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let counter = 0,
        scheduler;

    t.beforeEach(() => scheduler?.destroy());
    t.afterEach(async() => {
        await t.mouseUp();
        if (scheduler && !scheduler.isDestroyed && !scheduler.project.isDestroyed) {
            await t.waitForProjectReady(scheduler.project);
        }
    });

    const createFn = ({ resourceRecord, startDate, endDate }, event) => {
        //limiting number of assertions
        if (counter < 2) {
            t.ok(resourceRecord instanceof ResourceModel &&
                startDate instanceof Date &&
                endDate instanceof Date &&
                (event ? event instanceof Event : true), 'Correct function arguments');
        }
        counter++;

        if (endDate > new Date(2011, 0, 10)) return false;
    };

    t.it('Should not create an event if validatorFn returns false', async t => {
        scheduler = await t.getSchedulerAsync({
            aaa           : 'aaa',
            startDate     : new Date(2011, 0, 3),
            endDate       : new Date(2011, 3, 3),
            viewPreset    : 'weekAndMonth',
            resourceStore : new ResourceStore({
                data : [
                    // Put some empty rows first to make sure tooltip fits above for alignment checks
                    {},
                    {},
                    {
                        id   : 1,
                        name : 'Foo'
                    }
                ]
            }),
            eventStore : new EventStore(),
            features   : {
                eventDragCreate : {
                    validatorFn : () => false
                }
            }
        });

        //t.ok(scheduler.enableDragCreation === true, 'Should see enableDragCreation configured correctly on the view');
        t.ok(scheduler.features.eventDragCreate, 'EventDragCreate is there');

        t.firesOnce(scheduler.eventStore, 'add');
        t.firesOnce(scheduler.eventStore, 'remove');
        t.wontFire(scheduler, 'scheduleclick');
        scheduler.contentElement.addEventListener('transitionstart', ({ target, propertyName }) => {
            if (target.matches('.b-sch-event-wrap') && propertyName === 'width') {
                t.fail('No event width animations should be started');
            }
        });

        await t.dragBy({
            source : '.b-sch-timeaxis-cell',
            offset : [20, '50%'],
            delta  : [50, 0]
        });
    });

    t.it('Should hide creator proxy after cancelled operation', async t => {
        scheduler = await t.getSchedulerAsync({
            eventStore : new EventStore(),
            features   : {
                eventEdit       : false,
                eventDragCreate : true
            }
        });

        const generateListener = doFinalize =>
            ({ context }) => {
                context.async = true;
                setTimeout(() => {
                    context.finalize(doFinalize);
                }, 100);
            };

        // do first drag passing false to finalize call
        scheduler.on('beforedragcreatefinalize', { fn : generateListener(false), once : true });

        t.willFireNTimes(scheduler, 'afterdragcreate', 2);

        t.chain(
            { drag : '.b-sch-timeaxis-cell', offset : [20, '100%+20'], by : [100, 0], dragOnly : true },

            { waitForEvent : [scheduler, 'afterdragcreate'], trigger : { mouseUp : null } },

            { waitForSelectorNotFound : '.b-sch-event-wrap:not(.b-released)' },

            async() => {
                // do second drag passing true to finalize call
                scheduler.on('beforedragcreatefinalize', { fn : generateListener(true), once : true });
                t.selectorNotExists('.b-sch-event-wrap:not(.b-released)', 'Event not created');
            },

            // The drag operation should cause only one width transition - that's at the mouseup.
            // The width changing during the drag must not be animated.
            next => {
                let transitionCount = 0;

                scheduler.contentElement.addEventListener('transitionstart', ({ target, propertyName }) => {
                    if (target.matches('.b-sch-event-wrap') && propertyName === 'width') {
                        if (++transitionCount > 1) {
                            t.fail('Only one event width animations should be started');
                        }
                    }
                });
                next();
            },

            { drag : '.b-sch-timeaxis-cell', offset : [20, 75], by : [100, 0], dragOnly : true },

            { waitForEvent : [scheduler, 'afterdragcreate'], trigger : { mouseUp : null } },

            { waitForProjectReady : scheduler },

            () => {
                t.selectorExists('.b-sch-event-wrap:not(.b-released)', 'Event created');
                scheduler.destroy();
            }
        );
    });

    t.it('Should create an event if createValidator returns true', async t => {
        // For realism, we need all mouse events that are part of a drag path to fire.
        // Turbo mode only fires events at the start end end of the path, and to exercise
        // drag/drop code, we need it to fire the complete sequence.
        t.simulator.setSpeed('speedRun');

        scheduler = await t.getSchedulerAsync({
            startDate : new Date(2011, 0, 3),
            endDate   : new Date(2011, 3, 3),
            features  : {
                eventEdit       : false,
                eventDragCreate : {
                    validatorFn : createFn
                }
            },
            viewPreset    : 'dayAndWeek',
            resourceStore : new ResourceStore({
                data : [
                    // Put some empty rows first to make sure tooltip fits above for alignment checks
                    {},
                    {},
                    {
                        id   : 1,
                        name : 'Foo'
                    }
                ]
            }),
            eventStore : new EventStore()
        });

        t.willFireNTimes(scheduler.eventStore, 'add', 2);
        t.wontFire(scheduler, 'scheduleclick');

        const { eventDragCreate } = scheduler.features;

        t.chain(
            { waitFor : 100 },

            { drag : '.b-sch-timeaxis-cell', fromOffset : [101, 2], by : [99, 0], dragOnly : true },

            next => {
                const
                    tipBox   = eventDragCreate.tip.element.getBoundingClientRect(),
                    eventBox = eventDragCreate.dragging.context.element.getBoundingClientRect();

                t.isApprox(tipBox.right, eventBox.right, 15, 'Tip x should be aligned with proxy');
                t.isApprox(tipBox.top, eventBox.bottom, 10, 'Tip y should be aligned with proxy');
                next();
            },

            { action : 'mouseUp' },

            next => {
                scheduler.eventStore.removeAll();
                next();
            },

            { drag : '.b-sch-timeaxis-cell', fromOffset : [101, 2], by : [99, 0], dragOnly : true },

            next => {
                const
                    tipBox   = eventDragCreate.tip.element.getBoundingClientRect(),
                    eventBox = eventDragCreate.dragging.context.element.getBoundingClientRect();

                t.isApproxPx(tipBox.right, eventBox.right, 15, 'Tip x should be aligned with proxy');
                t.isApproxPx(tipBox.top, eventBox.bottom, 10, 'Tip y should be aligned with proxy');

                next();
            },

            { action : 'mouseUp' },

            () => {
                t.is(scheduler.eventStore.count, 1, '1 new event added');
                const event = scheduler.eventStore.first;

                t.is(event.startDate, new Date(2011, 0, 4), 'StartDate read ok');
                t.is(event.endDate, new Date(2011, 0, 5), 'EndDate read ok');

                t.simulator.setSpeed('turboMode');
            }
        );
    });

    t.it('Should trigger scroll when creating event close to timeaxis edges', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate     : new Date(2011, 0, 2),
            endDate       : new Date(2011, 3, 3),
            viewPreset    : 'weekAndMonth',
            resourceStore : new ResourceStore({
                data : [
                    // Put some empty rows first to make sure tooltip fits above for alignment checks
                    {},
                    {},
                    {
                        id   : 1,
                        name : 'Foo'
                    }
                ]
            }),
            eventStore : new EventStore(),
            features   : {
                eventEdit       : false,
                eventDragCreate : true
            }
        });

        //        t.firesAtLeastNTimes(viewEl, 'scroll', 1);
        t.is(scheduler.scrollLeft, 0, 'Scroll 0 initially');

        t.chain(
            {
                drag       : '.b-sch-timeaxis-cell',
                fromOffset : [300, 2],
                to         : '.b-scheduler',
                toOffset   : ['100%-25', '50%'],
                dragOnly   : true
            },

            {
                waitFor : () => scheduler.scrollLeft >= 200,
                desc    : 'Scrolling'
            },

            { waitFor : 100 },

            next => {
                t.isGreater(scheduler.features.eventDragCreate.dragging.context.element.offsetWidth, 100, 'Proxy gained width');
                t.ok(scheduler.features.eventDragCreate.dragging, 'Still in dragging mode after scroll happened');
                next();
            },

            { moveMouseBy : [[-30, 0]] },

            { action : 'mouseUp' },

            () => {
                const newEvent = scheduler.eventStore.first;

                t.isGreaterOrEqual(scheduler.scrollLeft, 100, 'Scrolled right');

                t.is(newEvent.startDate, new Date(2011, 0, 23));
            }
        );
    });

    t.it('Created event element should not move after scroll (horizontal)', async t => {
        scheduler = await t.getSchedulerAsync({
            resourceStore : t.getResourceStore2({}, 30),
            features      : {
                eventEdit       : false,
                eventDragCreate : true
            }
        });

        let rect, el;

        t.chain(
            { drag : '.b-sch-timeaxis-cell', fromOffset : [20, 20], by : [30, 0], dragOnly : true },
            next => {
                el = scheduler.features.eventDragCreate.dragging.context.element;
                rect = el.getBoundingClientRect();
                t.isLess(scheduler.bodyContainer.scrollTop, rect.top, 'DragCreator proxy is visible');
                scheduler.bodyContainer.scrollTop = 40;
                next();
            },
            next => {
                const newRect = el.getBoundingClientRect();
                t.is(Math.round(newRect.top + 40), Math.round(rect.top), 'DragCreator proxy is not visible');
                next();
            },
            { action : 'mouseUp' }
        );
    });

    t.it('Hovertip should be disabled during dragcreate', async t => {
        scheduler = t.getScheduler();

        t.chain(
            {
                drag     : '.b-sch-timeaxis-cell',
                offset   : [5, 19],
                by       : [40, 0],
                dragOnly : true
            },

            { waitForSelectorNotFound : '.b-sch-scheduletip', desc : 'Hover tip is hidden' },

            { mouseUp : null }
        );
    });

    t.it('Should create new event if overlaps are disabled', async t => {
        scheduler = await t.getSchedulerAsync({
            allowOverlap : false,
            resources    : [
                { id : 1, name : 'Albert' },
                { id : 2, name : 'Ben' }
            ],
            events : [
                { resourceId : 2, startDate : '2011-01-04', endDate : '2011-01-05' }
            ]
        });

        t.chain(
            { waitForSelector : '.b-sch-event' },
            { drag : '.b-sch-timeaxis-cell', offset : [12, 12], by : [100, 0] },
            () => {
                t.is(scheduler.eventStore.count, 2, '');
            }
        );
    });

    t.it('should add events when time axis is smaller than one day', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventTooltip : true
            },

            events : []
        });

        const oldCount = scheduler.eventStore.count;

        t.chain(
            {
                drag   : '.b-timeline-subgrid .b-grid-row[data-index="2"] > .b-sch-timeaxis-cell',
                offset : [202, 12],
                by     : [46, 0]
            },

            { type : 'Test' },

            { click : 'button:contains(Save)' },

            () => {
                t.is(scheduler.eventStore.count, oldCount + 1, 'Event has been added');
            }
        );
    });

    t.it('Should not allow dragcreate if readOnly', async t => {
        scheduler = await t.getSchedulerAsync({
            events   : [],
            readOnly : true,
            features : {
                eventEdit       : false,
                eventDragCreate : true
            }
        });

        t.wontFire(scheduler, 'beforedragcreate');
        t.wontFire(scheduler, 'dragcreatestart');

        t.chain(
            { drag : '.b-sch-timeaxis-cell', offset : ['10%', 10], by : [50, 0] },
            () => {
                t.selectorNotExists('.b-sch-event', 'Event not created on drag');
            }
        );
    });

    t.it('Should work with AssignmentStore', async t => {
        scheduler = new Scheduler({
            appendTo  : document.body,
            resources : [
                { id : 'r1', name : 'Mike' },
                { id : 'r2', name : 'Linda' }
            ],
            events : [
                { id : 1, startDate : new Date(2017, 0, 1, 10), endDate : new Date(2017, 0, 1, 12) }
            ],
            assignments : [
                { resourceId : 'r1', eventId : 1 },
                { resourceId : 'r2', eventId : 1 }
            ],
            startDate             : new Date(2017, 0, 1, 6),
            endDate               : new Date(2017, 0, 1, 20),
            viewPreset            : 'hourAndDay',
            enableEventAnimations : false,
            features              : {
                eventEdit       : false,
                eventTooltip    : false,
                scheduleTooltip : false,
                eventDragCreate : {
                    showTooltip : false
                }
            }
        });

        t.chain(
            { drag : '.b-sch-timeaxis-cell', offset : ['10%', 10], by : [50, 0] },

            () => {
                t.selectorCountIs('.b-sch-event:not(.b-sch-released)', 3, 'Correct number of event elements');
                t.is(scheduler.assignmentStore.count, 3, 'Correct assignment count');
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/6786
    t.it('Should be able to drag create across a milestone', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'hourAndDay',
            rowHeight  : 60,
            barMargin  : 15,
            resources  : [{ id : 1, name : 'Albert' }],
            events     : [{ resourceId : 1, startDate : new Date(2017, 11, 1, 10), duration : 0 }],
            startDate  : new Date(2017, 11, 1, 9),
            endDate    : new Date(2017, 11, 3, 9),
            features   : {
                eventTooltip    : false,
                scheduleTooltip : false,
                eventDragCreate : {
                    showTooltip : false
                }
            }
        });

        await t.waitForProjectReady();

        t.ok(scheduler.eventStore.first.isMilestone, 'Event is milestone');

        t.chain([
            { waitForSelector : '.b-sch-event' },
            { moveMouseTo : '.b-milestone', offset : [-15, 15] },
            { mousedown : null },
            { moveMouseBy : [10, -10] },
            { mouseup : null }
        ]);
    });

    // Test tooltip alignment when the document is scrolled.
    if (document.scrollingElement) {
        t.it('Tooltip should align correctly', async t => {
            scheduler = await t.getSchedulerAsync({
                viewPreset : 'hourAndDay',
                startDate  : new Date(2018, 3, 27),
                endDate    : new Date(2018, 3, 28)
            });
            // Visually the look should be the same, but the document is scrolled.
            document.scrollingElement.style.paddingTop = '1000px';
            document.scrollingElement.scrollTop = 1000;

            t.chain(
                { drag : '.b-sch-timeaxis-cell', offset : ['10%', 10], by : [50, 0], dragOnly : true },
                { waitForSelector : '.b-sch-tip-valid' },
                next => {
                    const
                        proxy = scheduler.features.eventDragCreate.dragging.context.element,
                        tip = scheduler.features.eventDragCreate.tip;

                    t.isApprox(tip.element.getBoundingClientRect().top, proxy.getBoundingClientRect().bottom + tip.anchorSize[1], 'Resize tip is aligned just below the dragcreate proxy');
                    next();
                },
                { mouseUp : null }
            );
        });
    }

    t.it('Should show message and block creation if validator returns object with `valid` false', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventDragCreate : {
                    validatorFn({ resourceRecord }, event) {
                        return {
                            valid   : false,
                            message : 'msg'
                        };
                    }
                }
            },
            events : []
        });

        t.firesOnce(scheduler.eventStore, 'addPrecommit');
        t.firesOnce(scheduler.eventStore, 'removePrecommit');

        t.chain(
            // IE11 and Edge cannot drag 0 offset in automation mode
            { drag : '.b-sch-timeaxis-cell', offset : [100, BrowserHelper.isIE11 || BrowserHelper.isEdge || BrowserHelper.isFirefox ? 5 : 0], by : [50, 0], dragOnly : true },

            { waitForSelector : '.b-tooltip .b-sch-tip-message:textEquals(msg)' },

            { mouseUp : null }
        );
    });

    t.it('Should not show message if validator returns object with `valid` true', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventEdit : false,
                eventDrag : {
                    validatorFn({ resourceRecord, eventRecord, start, end }, event) {
                        return {
                            valid : true
                        };
                    }
                }
            },
            events : []
        });

        t.firesOnce(scheduler.eventStore, 'add');

        t.chain(
            // IE11 and Edge cannot drag 0 offset in automation mode
            { drag : '.b-sch-timeaxis-cell', offset : [100, BrowserHelper.isIE11 || BrowserHelper.isEdge || BrowserHelper.isFirefox ? 5 : 0], by : [50, 0], dragOnly : true },

            { waitForSelector : '.b-tooltip .b-sch-tip-message:empty' },

            { mouseUp : null }
        );
    });

    t.it('Should consider undefined return value as valid action', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventEdit : false,
                eventDrag : {
                    validatorFn({ resourceRecord, eventRecord, start, end }, event) {
                    }
                }
            },
            events : []
        });

        t.firesOnce(scheduler.eventStore, 'add');

        t.chain(
            // IE11 and Edge cannot drag 0 offset in automation mode
            { drag : '.b-sch-timeaxis-cell', offset : [100, BrowserHelper.isIE11 || BrowserHelper.isEdge || BrowserHelper.isFirefox ? 5 : 0], by : [50, 0] }
        );
    });

    t.it('should not reset scroll position when finishing edit of newly created event', async t => {
        scheduler = await t.getSchedulerAsync({
            height        : 200,
            resourceStore : t.getResourceStore2({}, 30),
            features      : {
                eventEdit : true
            }
        });

        const oldCount = scheduler.eventStore.count;

        scheduler.scrollable.y = scheduler.scrollable.maxY;

        t.chain(
            {
                drag     : '.b-timeline-subgrid .b-grid-row[data-index="29"] > .b-sch-timeaxis-cell',
                offset   : [202, 12],
                by       : [46, 0],
                dragOnly : true
            },

            next => {
                t.wontFire(scheduler, 'scroll');
                next();
            },

            { mouseUp : null },

            { type : 'Test' },

            { click : 'button:contains(Save)' },

            () => {
                t.is(scheduler.eventStore.count, oldCount + 1, 'Event has been added');
                t.is(scheduler.eventStore.last.name, 'Test');
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7224/details
    t.it('Event should be visible if not reapplying filters', async t => {
        // Covers the edge case where eventStore is filtered and a drag created event gets filtered out directly

        scheduler = await t.getSchedulerAsync({
            resourceStore : t.getResourceStore2({}, 3),
            features      : {
                eventEdit : true
            }
        });

        let newEvent;

        scheduler.eventStore.reapplyFilterOnAdd = false;
        scheduler.eventStore.filter('name', 'Assignment 1');

        t.chain(
            {
                drag   : '.b-sch-timeaxis-cell',
                offset : [50, 10],
                by     : [100, 0]
            },

            { waitFor : () => scheduler.features.eventEdit.editor.containsFocus },

            next => {
                newEvent = scheduler.features.eventEdit.eventRecord;
                t.notOk(scheduler.eventStore.added.includes(newEvent));
                next();
            },

            { type : 'New test event' },

            { click : ':textEquals(Save)' },

            () => {
                t.ok(scheduler.eventStore.added.includes(newEvent));
                t.selectorCountIs(scheduler.eventSelector + ':not(.b-sch-released) .b-sch-event', 2, 'Correct event element count');
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7224/details
    t.it('Drag proxy should be removed if event is filtered out', async t => {
        // Covers the edge case where eventStore is filtered and a drag created event gets filtered out directly

        scheduler = await t.getSchedulerAsync({
            resourceStore : t.getResourceStore2({}, 3),
            features      : {
                eventEdit : true
            }
        });

        scheduler.eventStore.reapplyFilterOnAdd = true;
        scheduler.eventStore.filter('name', 'Assignment 1');

        t.chain(
            {
                drag   : '.b-sch-timeaxis-cell',
                offset : [50, 10],
                by     : [100, 0]
            },

            { waitFor : () => scheduler.features.eventEdit.editor.containsFocus },
            { type : 'New test event' },

            { click : ':textEquals(Save)' }
        );
    });

    t.it('Should fire scheduleclick, beforeeventadd and call onEventCreated after drag create operation', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate     : new Date(2011, 0, 1),
            endDate       : new Date(2011, 0, 2),
            resourceStore : new ResourceStore({
                data : [
                    {
                        id   : 1,
                        name : 'Foo'
                    },
                    {}
                ]
            }),
            eventStore : new EventStore()
        });

        t.firesOnce(scheduler, 'scheduleclick');
        t.isCalledOnce('onEventCreated', scheduler, 'onEventCreated hook is called once');
        t.firesOnce(scheduler, 'beforeeventadd', 'beforeeventadd is fired once');

        t.chain(
            { drag : '.b-sch-timeaxis-cell', fromOffset : [20, 20], by : [50, 0] },
            { click : '.b-sch-timeaxis-cell' }
        );
    });

    t.it('Should respect Scheduler#getDateConstraints', async t => {
        let called = false;

        scheduler = await t.getSchedulerAsync({
            resources : [
                { id : 'r1', name : 'Resource 1' }
            ],

            events : [],

            features : {
                eventEdit : false
            },

            getDateConstraints(resourceRecord, newEventRecord) {
                t.ok(resourceRecord instanceof scheduler.resourceStore.modelClass, 'resourceRecord arg has correct type');
                t.ok(newEventRecord instanceof scheduler.eventStore.modelClass, 'eventRecord arg has correct type');
                called = true;
                return {
                    start : new Date(2011, 0, 4),
                    end   : new Date(2011, 0, 5)
                };
            }
        });

        t.chain(
            { drag : '.b-sch-timeaxis-cell', offset : [100, '50%'], by : [200, 0] },

            () => {
                t.ok(called, 'getDateConstraints() was called');
                t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 4), 'Correct startDate');
                t.is(scheduler.eventStore.first.endDate, new Date(2011, 0, 5), 'Correctly constrained endDate');
            }
        );
    });

    t.it('Should abort on ESC key', async t => {
        scheduler = await t.getSchedulerAsync({
            resourceStore : new ResourceStore({
                data : [
                    {
                        id : 1
                    }
                ]
            }),
            eventStore : new EventStore()
        });

        t.chain(
            { drag : '.b-sch-timeaxis-cell', fromOffset : [20, 20], by : [50, 0], dragOnly : true },

            { type : '[ESCAPE]' },

            () => {
                t.is(scheduler.eventStore.count, 0);
                t.notOk(scheduler.features.eventDragCreate.dragging, 'not dragging');
            }
        );
    });

    t.it('Should support disabling', async t => {
        scheduler = t.getScheduler();

        scheduler.features.eventDragCreate.disabled = true;

        t.chain(
            { drag : '.b-sch-timeaxis-cell', fromOffset : [20, 20], by : [50, 0], dragOnly : true },

            { mouseUp : null },

            next => {
                scheduler.features.eventDragCreate.disabled = false;

                next();
            },

            { drag : '.b-sch-timeaxis-cell', fromOffset : [20, 20], by : [50, 0], dragOnly : true },

            { mouseUp : null }
        );
    });

    t.it('Should handle external updates happening while editor is open', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventEdit : true
            }
        });

        t.chain(
            { drag : '.b-sch-timeaxis-cell', fromOffset : [20, 20], by : [50, 0] },

            async() => {
                scheduler.resourceStore.insert(0, {});
                t.selectorExists('.b-eventeditor', 'Editor still visible');
            },

            { type : '[ESCAPE]' },

            { waitForSelectorNotFound : '.b-eventeditor' }
        );
    });

    t.it('Should not scroll vertical when drag creating event', async t => {
        scheduler = await t.getSchedulerAsync({
            height : 300,
            events : []
        });

        await t.dragBy({
            source   : '.b-grid-subgrid-normal .b-grid-row[data-id="r3"]',
            offset   : [50, '50%'],
            delta    : [100, 0],
            dragOnly : true
        });

        await t.moveMouseTo({
            target : scheduler.scrollable.element,
            offset : ['60%', '100%']
        });

        await t.waitFor(1000);

        t.is(scheduler.scrollable.y, 0, 'Scheduler is not scrolled vertically');
    });

    t.it('Click on just-created element should cancel create', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate     : new Date(2011, 0, 1),
            endDate       : new Date(2011, 0, 2),
            resourceStore : new ResourceStore({
                data : [
                    {
                        id   : 1,
                        name : 'Foo'
                    },
                    {}
                ]
            }),
            eventStore : new EventStore(),
            features   : {
                eventEdit : true
            }
        });

        await t.dragBy({
            source : '.b-grid-subgrid-normal .b-grid-row[data-id="1"]',
            offset : [50, '50%'],
            delta  : [100, 0]
        });

        await t.waitFor(() => scheduler.features.eventEdit.editor?.containsFocus);

        await t.click(scheduler.getEventElement(scheduler.eventStore.first));
    });

    // https://github.com/bryntum/support/issues/3185
    t.it('Should be possible to distinguish an event being created from other events', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate     : new Date(2011, 0, 1),
            endDate       : new Date(2011, 0, 2),
            viewPreset    : 'hourAndDay',
            resourceStore : new ResourceStore({
                data : [
                    {
                        id   : 1,
                        name : 'Foo'
                    }
                ]
            }),
            eventStore : new EventStore(),
            features   : {
                eventEdit : true
            }
        });

        await t.dragBy({
            source   : '.b-grid-subgrid-normal .b-grid-row[data-id="1"]',
            offset   : [50, '50%'],
            delta    : [100, 0],
            dragOnly : true
        });

        t.is(scheduler.eventStore.first.isCreating, true, 'isCreating returns true');
        t.selectorExists('.b-iscreating', 'b-iscreating added');

        await t.mouseUp();
        await t.type(null, 'foo[ENTER]');
        await t.waitFor(() => !scheduler.eventStore.first.isCreating);

        t.selectorNotExists('.b-creating', 'b-iscreating not seen');
        t.is(scheduler.eventStore.first.isCreating, false, 'isCreating returns false');
    });

    // https://github.com/bryntum/support/issues/3200
    t.it('Should be possible to disable the tooltip shown while creating', async t => {
        scheduler = await t.getSchedulerAsync({
            resourceStore : new ResourceStore({
                data : [
                    {
                        id   : 1,
                        name : 'Foo'
                    }
                ]
            }),
            eventStore : new EventStore(),
            features   : {
                eventDragCreate : {
                    showTooltip : false
                }
            }
        });

        await t.dragBy({
            source   : '.b-grid-subgrid-normal .b-grid-row[data-id="1"]',
            offset   : [50, '50%'],
            delta    : [100, 0],
            dragOnly : true
        });

        t.selectorNotExists('.b-tooltip', 'No tooltip shown');
    });

    t.it('Should work when the first pixel of drag results in a zero duration milestone snapped to the right edge of the time axis', async t => {
        scheduler = await t.getScheduler({
            width      : 1200,
            startDate  : new Date(2021, 2, 7, 8),
            endDate    : new Date(2021, 2, 7, 18),
            viewPreset : 'hourAndDay',

            columns : [
                { text : 'Staff', field : 'name', width : 200 }
            ],

            resources : [{
                name : 'R1'
            }],
            events : []
        });

        // Scroll right edge of too-wide Scheduler into view so that we can test the
        // mousedown date behaviour on its extreme right when the page is scrolled.
        document.scrollingElement.scrollLeft = 1000;

        // The mousedown date should work, and not yield null due to the page scroll
        // and the event should render and not throw an error.
        await t.dragBy({
            source : '.b-sch-timeaxis-cell',
            offset : ['100%-5', '50%'],
            delta  : [-30, 0]
        });

        await t.waitForAnimations();

        const newEvent = scheduler.eventStore.first;

        t.is(newEvent.startDate, new Date(2021, 2, 7, 17, 30));
        t.is(newEvent.endDate, new Date(2021, 2, 7, 18));
    });

    t.it('Should be able to drag create on nonworking time range (Scheduler only, Scheduler Pro prevents this)', async t => {
        scheduler = await t.getScheduler({
            width      : 1200,
            // A Sunday, non working time
            startDate  : new Date(2021, 7, 29, 8),
            endDate    : new Date(2021, 7, 29, 18),
            viewPreset : 'hourAndDay',

            columns : [
                { text : 'Staff', field : 'name', width : 200 }
            ],

            features : {
                nonWorkingTime : true
            },
            resources : [{
                name : 'R1'
            }],
            events : []
        });

        await t.firesOnce(scheduler, 'beforeDragCreate');

        await t.dragBy({
            source : '.b-sch-timeaxis-cell',
            delta  : [-30, 0]
        });
    });

    // https://github.com/bryntum/support/issues/3759
    t.it('TOUCH: Should not start drag create on a quick touch drag gesture', async t => {
        scheduler = await t.getScheduler({
            startDate  : new Date(2021, 7, 29, 8),
            endDate    : new Date(2021, 7, 29, 10),
            viewPreset : 'hourAndDay',

            columns : [
                { text : 'Staff', field : 'name', width : 200 }
            ],

            resources : [{
                name : 'R1'
            }],
            events : []
        });

        await t.wontFire(scheduler, 'beforeDragCreate');
        await t.wontFire(scheduler, 'dragCreateStart');

        await t.touchDragBy('.b-sch-timeaxis-cell', [100, 0], null, null, null, null, [10, '50%']);
    });

    // https://github.com/bryntum/support/issues/3759
    t.it('TOUCH: Should start drag create after a long press + drag gesture', async t => {
        scheduler = await t.getScheduler({
            startDate  : new Date(2021, 7, 29, 8),
            endDate    : new Date(2021, 7, 29, 10),
            viewPreset : 'hourAndDay',

            columns : [
                { text : 'Staff', field : 'name', width : 200 }
            ],

            resources : [{
                name : 'R1'
            }],
            events : []
        });

        await t.firesOnce(scheduler, 'beforeDragCreate');
        await t.firesOnce(scheduler, 'dragCreateStart');

        await t.delayedTouchDragBy('.b-sch-timeaxis-cell', [100, 0]);
    });
});
