import { Rectangle, ArrayHelper, DateHelper } from '../../build/scheduler.module.js?456730';

StartTest({ defaultTimeout : 90000 }, t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    async function getScheduler(config = {}) {
        return await t.getSchedulerAsync({
            features : {
                eventDrag : true
            },
            ...config
        });
    }

    t.it('Should not deselect events on multi event drag with Ctrl', async t => {
        scheduler = await getScheduler({
            multiEventSelect : true
        });

        const
            [e1, e2, e3] = scheduler.eventStore,
            e1StartDate = e1.startDate.valueOf(),
            e2StartDate = e2.startDate.valueOf(),
            e3StartDate = e3.startDate.valueOf();

        t.chain(
            { click : '[data-event-id=3]' },
            { click : '[data-event-id=2]', options : { ctrlKey : true } },
            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2], 'Correct selection initially');
                next();
            },
            { drag : '[data-event-id=1]', options : { ctrlKey : true }, by : [50, 0], dragOnly : true },
            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2, 1], 'Correct selection');
                next();
            },
            { mouseUp : null },

            { waitForSelectorNotFound : '.b-dragging' },

            () => {
                // All should have been dragged right by same amount
                t.is(e1.startDate.valueOf(), e1StartDate + 43200000);
                t.is(e2.startDate.valueOf(), e2StartDate + 43200000);
                t.is(e3.startDate.valueOf(), e3StartDate + 43200000);
            }
        );
    });

    t.it('Should drag multi events to the same resource if unifiedDrag : true', async t => {
        scheduler = await getScheduler({
            multiEventSelect : true,
            features         : {
                eventDrag : {
                    unifiedDrag : true
                }
            }
        });

        const
            [e1, e2, e3] = scheduler.eventStore,
            targetResource = scheduler.resourceStore.getAt(4),
            targetResourceRow = scheduler.getRowFor(targetResource).elements.normal,
            targetDate = DateHelper.add(scheduler.timeAxis.startDate, 1, 'day');

        t.chain(
            { click : '[data-event-id=3]' },
            { click : '[data-event-id=2]', options : { ctrlKey : true } },
            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2], 'Correct selection initially');
                next();
            },
            { drag : '[data-event-id=1]', options : { ctrlKey : true }, to : targetResourceRow, fromOffset : [15, 5], toOffset : [scheduler.timeAxisViewModel.getSingleUnitInPixels('day') + 15, '50%'], dragOnly : true },
            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2, 1], 'Correct selection');
                next();
            },
            { mouseUp : null },

            { waitForSelectorNotFound : '.b-dragging' },

            () => {
                // All should have been dragged to same resource
                t.is(e1.resource, targetResource);
                t.is(e2.resource, targetResource);
                t.is(e3.resource, targetResource);

                // And all dragged to 1 day in from the timeAxis start
                t.is(e1.startDate, targetDate);
                t.is(e2.startDate, targetDate);
                t.is(e3.startDate, targetDate);
            }
        );
    });

    t.it('Should drag multi events to the same resource if unifiedDrag : true and the resource row of the dragged event has not changed', async t => {
        scheduler = await getScheduler({
            multiEventSelect : true,
            features         : {
                eventDrag : {
                    unifiedDrag : true
                }
            }
        });

        const
            [e1, e2, e3] = scheduler.eventStore,
            e1Rectangle = Rectangle.from(scheduler.getElementFromEventRecord(e1)),
            targetResource = scheduler.resourceStore.getAt(0),
            targetDate = DateHelper.add(scheduler.timeAxis.startDate, 3, 'day'),
            targetX = scheduler.getCoordinateFromDate(targetDate, false);

        t.chain(
            { click : '[data-event-id=3]' },

            { click : '[data-event-id=2]', options : { ctrlKey : true } },

            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2], 'Correct selection initially');
                next();
            },

            {
                drag     : '[data-event-id=1]',
                options  : { ctrlKey : true },
                offset   : [20, e1Rectangle.height / 2],
                by       : [targetX - e1Rectangle.x, 0],
                dragOnly : true
            },

            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2, 1], 'Correct selection');
                next();
            },

            { mouseUp : null },

            { waitForSelectorNotFound : '.b-dragging' },

            () => {
                // All should have been dragged to same resource
                t.is(e1.resource, targetResource);
                t.is(e2.resource, targetResource);
                t.is(e3.resource, targetResource);

                // And all dragged to 1 day in from the timeAxis start
                t.is(e1.startDate, targetDate);
                t.is(e2.startDate, targetDate);
                t.is(e3.startDate, targetDate);
            }
        );
    });

    t.it('Should drag multi events to the same resource if unifiedDrag : true when scrolling down the dataset', async t => {
        t.waitForAnimations = (callback) => callback();

        const
            resources = [],
            events    = [{
                id         : 1,
                resourceId : 'r1',
                name       : 'Drag Event',
                startDate  : new Date(2011, 0, 4),
                endDate    : new Date(2011, 0, 6)
            }];

        for (let i = 1; i < 117; i++) {
            events.push({
                id         : i + 1,
                resourceId : `r${i + 1}`,
                name       : `Event ${i + 1}`,
                startDate  : new Date(2011, 0, 4),
                endDate    : new Date(2011, 0, 6)
            });
        }
        for (let i = 0; i < 200; i++) {
            resources.push({
                id   : `r${i + 1}`,
                name : `Resource ${i + 1}`
            });
        }

        scheduler = await getScheduler({
            multiEventSelect : true,
            features         : {
                eventDrag : {
                    unifiedDrag : true,
                    showTooltip : false
                },
                eventTooltip    : false,
                scheduleTooltip : false
            },
            resources,
            events
        });
        const
            schedulerRectangle = Rectangle.from(scheduler.element),
            [e1, e2, e3] = scheduler.eventStore,
            targetResource = scheduler.resourceStore.getAt(119),
            targetDate = DateHelper.add(scheduler.timeAxis.startDate, 1, 'day');

        t.chain(
            { click : '[data-event-id=3]' },
            { click : '[data-event-id=2]', options : { ctrlKey : true } },
            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2], 'Correct selection initially');
                next();
            },
            { mouseDown : '[data-event-id=1]', options : { ctrlKey : true }, offset : [15, 5] },

            // Begin the drag to create the proxy
            { moveMouseBy : [0, 10] },

            next => {
                t.is(scheduler.features.eventDrag.dragData.eventBarEls.length, 3);
                t.is(scheduler.features.eventDrag.dragData.draggedRecords.length, 3);

                next();
            },

            // This will kick off scrolling
            next => {
                t.moveMouseTo(document.body, next, null, [scheduler.features.eventDrag.drag.startEvent.pageX, schedulerRectangle.bottom - 20]);
            },

            // Drag until we're over the targetResource
            next => {
                const detacher = scheduler.on({
                    eventDrag(context) {
                        if (context.newResource === targetResource) {
                            detacher();
                            t.mouseUp().then(next);
                        }
                    },
                    detachable : true
                });
            },

            () => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2, 1], 'Correct selection');

                // All should have been dragged to same resource
                t.is(e1.resource, targetResource);
                t.is(e2.resource, targetResource);
                t.is(e3.resource, targetResource);

                // And all dragged to 1 day in from the timeAxis start
                t.is(e1.startDate, targetDate);
                t.is(e2.startDate, targetDate);
                t.is(e3.startDate, targetDate);
            }
        );
    });

    t.it('Should drag multi events by same row offset if unifiedDrag is not set', async t => {
        scheduler = await getScheduler({
            multiEventSelect : true
        });

        const
            e1 = scheduler.eventStore.getById(1),
            e2 = scheduler.eventStore.getById(2),
            e3 = scheduler.eventStore.getById(3),
            e1StartDate = e1.startDate.valueOf(),
            e2StartDate = e2.startDate.valueOf(),
            e3StartDate = e3.startDate.valueOf(),
            e1TargetResource = scheduler.resourceStore.getAt(1),
            e2TargetResource = scheduler.resourceStore.getAt(2),
            e3TargetResource = scheduler.resourceStore.getAt(3);

        t.chain(
            { click : '[data-event-id=3]' },
            { click : '[data-event-id=2]', options : { ctrlKey : true } },
            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2], 'Correct selection initially');
                next();
            },
            { drag : '[data-event-id=1]', options : { ctrlKey : true }, by : [0, scheduler.rowHeight], dragOnly : true },
            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2, 1], 'Correct selection');
                next();
            },
            { mouseUp : null },

            { waitForSelectorNotFound : '.b-dragging' },

            () => {
                // All should have been dragged to same offset from their start row
                t.is(e1.resource, e1TargetResource);
                t.is(e2.resource, e2TargetResource);
                t.is(e3.resource, e3TargetResource);

                // And all stay at same time
                t.is(e1.startDate, e1StartDate);
                t.is(e2.startDate, e2StartDate);
                t.is(e3.startDate, e3StartDate);
            }
        );
    });

    t.it('Should drag multi events to the same resource if unifiedDrag is not set when scrolling down the dataset', async t => {
        const
            resources = ArrayHelper.populate(200, i => ({ id : `r${i + 1}`, name : `Resource ${i + 1}` })),
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

        scheduler = await getScheduler({
            multiEventSelect : true,
            features         : {
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
            schedulerRectangle = Rectangle.from(scheduler.element),
            e1 = scheduler.eventStore.getById(1),
            e2 = scheduler.eventStore.getById(2),
            e3 = scheduler.eventStore.getById(3),
            e1StartDate = e1.startDate.valueOf(),
            e2StartDate = e2.startDate.valueOf(),
            e3StartDate = e3.startDate.valueOf(),
            e1TargetResource = scheduler.resourceStore.getAt(119),
            e2TargetResource = scheduler.resourceStore.getAt(120),
            e3TargetResource = scheduler.resourceStore.getAt(121);

        let dragElMutationObserver;

        const eventDrag = scheduler.features.eventDrag;

        t.chain(
            { click : '[data-event-id=3]' },
            { click : '[data-event-id=2]', options : { ctrlKey : true } },
            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2], 'Correct selection initially');
                next();
            },
            { mouseDown : '[data-event-id=1]', options : { ctrlKey : true }, offset : [15, 5] },

            // Begin the drag to create the proxy
            { moveMouseBy : [0, 10] },

            next => {
                t.is(eventDrag.dragData.eventBarEls.length, 3);
                t.is(eventDrag.dragData.draggedRecords.length, 3);

                // Ensure that during the drag, the dragged elements do not get mutated
                eventDrag.dragData.eventBarEls.forEach(dragEl => {
                    dragElMutationObserver = new MutationObserver(() => {
                        dragElMutationObserver.disconnect();
                        t.fail('Dragged element got mutated during drag');
                    });

                    dragElMutationObserver.observe(dragEl, {
                        characterData : true,
                        childList     : true
                    });
                });

                next();
            },

            // This will kick off scrolling
            next => {
                t.moveMouseTo(document.body, next, null, [eventDrag.drag.startEvent.pageX, schedulerRectangle.bottom - 20]);
            },

            // Drag until we're over the targetResource
            next => {
                const detacher = scheduler.on({
                    eventDrag(context) {
                        if (context.newResource === e1TargetResource) {
                            detacher();
                            t.mouseUp().then(next);
                        }
                    }
                });
            },

            () => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2, 1], 'Correct selection');

                // All should have been dragged to same offset from their start row
                t.is(e1.resource, e1TargetResource);
                t.is(e2.resource, e2TargetResource);
                t.is(e3.resource, e3TargetResource);

                // And all stay at same time
                t.is(e1.startDate, e1StartDate);
                t.is(e2.startDate, e2StartDate);
                t.is(e3.startDate, e3StartDate);
            }
        );
    });

    t.it('Should not include events with `draggable` set to false when dragging multiple events', async t => {
        scheduler = await getScheduler({
            multiEventSelect : true
        });

        scheduler.eventStore.forEach((ev) => ev.draggable = false);

        t.wontFire(scheduler.eventStore, 'change');

        t.chain(
            { click : '[data-event-id=3]' },
            { click : '[data-event-id=2]', options : { ctrlKey : true } },

            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2], 'Correct selection initially');
                next();
            },
            { drag : '[data-event-id=1]', options : { ctrlKey : true }, by : [0, scheduler.rowHeight] },

            { waitForSelectorNotFound : '.b-dragging' }
        );
    });

    t.it('Derendering second event vertically, then bringing it back', async t => {
        const
            resources = ArrayHelper.populate(200, i => ({
                id   : `r${i + 1}`,
                name : `Resource ${i + 1}`
            })),
            events    = ArrayHelper.populate(117, i => ({
                id         : i + 1,
                resourceId : `r${i + 1}`,
                name       : `Event ${i + 1}`,
                startDate  : new Date(2011, 0, 4),
                endDate    : new Date(2011, 0, 6)
            }));

        events[0].name = 'Drag event';

        scheduler = await getScheduler({
            features : {
                eventDrag : {
                    showTooltip : false
                },
                eventTooltip    : false,
                scheduleTooltip : false
            },
            multiEventSelect : true,
            resources,
            events
        });

        const
            event1               = scheduler.eventStore.first,
            event2               = scheduler.eventStore.getAt(13),
            renderedCount        = t.query(scheduler.unreleasedEventSelector).length,
            dragEl               = scheduler.getElementFromEventRecord(event1).parentNode,
            event2El             = scheduler.getElementFromEventRecord(event2).parentNode,
            event2Top            = event2El.getBoundingClientRect().top;

        let dragElMutationObserver;

        t.chain(
            { click : event2El },

            { click : dragEl, options : { ctrlKey : true } },

            next => {
                t.is(scheduler.selectedEvents.length, 2, 'Two events selected');

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

            { drag : dragEl, by : [300, 600] },

            { waitForProjectReady : scheduler },

            next => {
                // event2 has been dragged outside of the rendered block
                t.selectorCountIs(scheduler.unreleasedEventSelector, renderedCount - 1, 'Second event no longer rendered');
                next();
            },

            { waitFor : 250 },

            { drag : dragEl, by : [-300, -600], options : { ctrlKey : true } },

            { waitForProjectReady : scheduler },

            () => {
                // event2 has been rendered again
                t.selectorCountIs(scheduler.unreleasedEventSelector, renderedCount, 'Second event rendered again');
                t.isApproxPx(t.rect('[data-event-id="14"]').top, event2Top, 'At correct y');
            }
        );
    });

    t.it('Multi drag, derendering second event horizontally, then bringing it back', async t => {
        scheduler = await getScheduler({
            multiEventSelect : true
        });

        const
            visibleEventSelector = scheduler.unreleasedEventSelector,
            renderedCount = scheduler.bodyContainer.querySelectorAll(visibleEventSelector).length;

        t.chain(
            { click : '[data-event-id=1]' },

            { drag : '[data-event-id=5]', by : [-500, 0], options : { ctrlKey : true } },

            { waitFor : () => scheduler.bodyContainer.querySelectorAll(visibleEventSelector).length === renderedCount - 1 },

            { drag : '[data-event-id=5]', by : [500, 0] },

            { waitFor : () =>  scheduler.bodyContainer.querySelectorAll(visibleEventSelector).length === renderedCount }
        );
    });

    t.it('Should animate events as drag starts when unifiedDrag : true', async t => {
        scheduler = await getScheduler({
            multiEventSelect    : true,
            useInitialAnimation : false,
            features            : {
                eventDrag : {
                    unifiedDrag : true
                }
            }
        });

        let lastTransition = Date.now();

        scheduler.timeAxisSubGridElement.addEventListener('transitionend', () => {
            lastTransition = Date.now();
        });

        // Let initial view stabilize
        await t.waitFor(() =>  Date.now() - lastTransition > 500);

        scheduler.selectedEvents = scheduler.eventStore.getRange();

        t.waitForEvent(scheduler.timeAxisSubGridElement, 'transitionend');

        t.dragBy('[data-event-id=1]', [30, 0], null, null, null, true);
    });

    // https://github.com/bryntum/support/issues/2867
    // https://github.com/bryntum/support/issues/2875
    t.it('Should clean up and remove b-dragging class from all dragged event bars', async t => {
        scheduler = await getScheduler({
            multiEventSelect : true
        });

        scheduler.selectedEvents = scheduler.eventStore.records;

        await t.dragBy('[data-event-id=1]', [100, 100], null, null, null, true);
        await t.type(null, '[ESCAPE]');

        await t.waitForSelectorNotFound('.b-dragging');
        await t.waitForSelectorNotFound('.b-drag-proxy');
        await t.moveCursorBy([-50, -20]);

        await t.mouseUp(null);

        t.isDeeply(scheduler.selectedEvents.length, 5, 'Dragged events still selected');
    });

});
