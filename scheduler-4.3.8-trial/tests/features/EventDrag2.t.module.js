import { BrowserHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    // Cannot figure how to get window/body scroll in Edge, although API works even in IE11
    if (BrowserHelper.isEdge) {
        return;
    }

    let scheduler;

    t.beforeEach(() => {
        scheduler && !scheduler.isDestroyed && scheduler.destroy();
    });

    async function getScheduler(config) {
        scheduler = t.getScheduler(Object.assign({
            features : {
                eventDrag : true
            }
        }, config));

        await t.waitForProjectReady(scheduler);
    }

    t.it('ScrollManager should not react if dragging is constrained vertically', async t => {
        await getScheduler({
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
            { drag : scheduler.eventSelector, by : [200, 0] },
            () => {
                t.selectorNotExists('.b-dragging-event');
            }
        );
    });

    t.it('Should clear dragging CSS class after invalid drag', async t => {
        await getScheduler({
            startDate  : new Date(2017, 0, 1, 4),
            height     : 210,
            viewPreset : 'hourAndDay',
            events     : [
                {
                    resourceId : 'r3',
                    id         : 1,
                    startDate  : new Date(2017, 0, 1, 6),
                    endDate    : new Date(2017, 0, 1, 8)
                }
            ]
        });

        t.chain(
            { drag : scheduler.eventSelector, to : [0, 0] },

            () => {
                t.selectorNotExists('.b-dragging-event');
            }
        );
    });

    t.it('Should deselect events on drag without Ctrl', async t => {
        await getScheduler({
            multiEventSelect : true
        });

        t.chain(
            { click : '[data-event-id=3]' },
            { click : '[data-event-id=2]', options : { ctrlKey : true } },
            next => {
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [3, 2], 'Correct selection initially');
                next();
            },
            { drag : '[data-event-id=1]', by : [50, 0] },
            () => {
                // Dragging an unselected event does affect the selection
                t.isDeeply(scheduler.selectedEvents.map(e => e.id), [1], 'Selection is replaced by dragging a non-selected event');
            }
        );
    });

    t.it('Should support disabling', async t => {
        await getScheduler({
            startDate  : new Date(2017, 0, 1, 4),
            height     : 210,
            viewPreset : 'hourAndDay',
            resources  : [{ id : 1 }],
            events     : [
                {
                    resourceId : 1,
                    id         : 1,
                    startDate  : new Date(2017, 0, 1, 6),
                    endDate    : new Date(2017, 0, 1, 8)
                }
            ]
        });

        scheduler.features.eventDrag.disabled = true;

        t.wontFire(scheduler, 'eventdragstart');

        t.chain(
            { drag : scheduler.eventSelector, by : [20, 0] },

            () => {
                t.selectorNotExists('.b-dragging-event');
            }
        );
    });

    // TODO: Expected behaviour is no longer correct, drag does full redraw
    t.xit('Should not draw all dependencies after valid drop where rowHeight is unaffected', async t => {
        await getScheduler({
            features : {
                eventDrag    : true,
                dependencies : true
            },
            events : [
                {
                    id         : 1,
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 6),
                    endDate    : new Date(2011, 0, 7)
                },
                {
                    id         : 2,
                    resourceId : 'r1',
                    startDate  : new Date(2011, 0, 8),
                    endDate    : new Date(2011, 0, 9)
                }
            ],
            dependencies : [
                {
                    from : 1,
                    to   : 2
                }
            ]
        });

        t.chain(
            { drag : scheduler.eventSelector, by : [-100, 0], dragOnly : true },

            next => {
                scheduler.on('dependenciesdrawn', ({ partial }) => {
                    if (!partial) {
                        t.fail('Full refresh done');
                    }
                    else {
                        t.pass('Partial redraw done');
                    }
                });

                next();
            },

            { mouseUp : null },

            // Wait a little to ensure nothing is fired
            { waitFor : 500 }
        );
    });

    t.it('should scroll correctly during drag after a previous drag/drop has caused a row height change', async t => {
        await getScheduler({
            height           : 700,
            width            : 900,
            startDate        : new Date(2018, 1, 7, 8),
            endDate          : new Date(2018, 1, 7, 22),
            viewPreset       : 'hourAndDay',
            rowHeight        : 46,
            barMargin        : 5,
            multiEventSelect : true,
            features         : {
                eventTooltip : false
            },
            events : [
                {
                    id         : 1,
                    resourceId : 'a',
                    name       : 'Meeting #1',
                    desc       : 'Discuss new features',
                    startDate  : '2018-02-07 11:00',
                    endDate    : '2018-02-07 14:00',
                    eventType  : 'Meeting',
                    eventColor : 'blue',
                    iconCls    : 'b-fa b-fa-calendar'
                },
                {
                    id         : 2,
                    resourceId : 'b',
                    name       : 'Meeting #2',
                    desc       : 'Strategy meeting',
                    startDate  : '2018-02-07 12:00',
                    endDate    : '2018-02-07 15:00',
                    eventType  : 'Meeting',
                    eventColor : 'blue',
                    iconCls    : 'b-fa b-fa-calendar'
                },
                {
                    id         : 3,
                    resourceId : 'c',
                    name       : 'Meeting #3',
                    desc       : 'Emerging markets',
                    startDate  : '2018-02-07 13:00',
                    endDate    : '2018-02-07 16:00',
                    eventType  : 'Meeting',
                    eventColor : 'blue',
                    iconCls    : 'b-fa b-fa-calendar'
                },
                {
                    id         : 4,
                    resourceId : 'd',
                    name       : 'Meeting #4',
                    desc       : 'Code review',
                    startDate  : '2018-02-07 09:00',
                    endDate    : '2018-02-07 11:00',
                    eventType  : 'Meeting',
                    eventColor : 'blue',
                    iconCls    : 'b-fa b-fa-calendar'
                },
                {
                    id         : 5,
                    resourceId : 'e',
                    name       : 'Appointment #1',
                    desc       : 'Dental',
                    startDate  : '2018-02-07 10:00',
                    endDate    : '2018-02-07 12:00',
                    eventType  : 'Appointment',
                    iconCls    : 'b-fa b-fa-clock'
                },
                {
                    id         : 6,
                    resourceId : 'f',
                    name       : 'Appointment #2',
                    desc       : 'Golf preparations',
                    startDate  : '2018-02-07 11:00',
                    endDate    : '2018-02-07 13:00',
                    eventType  : 'Appointment',
                    iconCls    : 'b-fa b-fa-golf-ball'
                },
                {
                    id         : 7,
                    resourceId : 'g',
                    name       : 'Appointment #3',
                    desc       : 'Important',
                    startDate  : '2018-02-07 14:00',
                    endDate    : '2018-02-07 17:00',
                    location   : 'Home office',
                    eventColor : 'red',
                    eventType  : 'Appointment',
                    iconCls    : 'b-fa b-fa-exclamation-circle'
                },
                {
                    id         : 8,
                    resourceId : 'h',
                    name       : 'Meeting #5',
                    desc       : 'Planning',
                    startDate  : '2018-02-07 13:00',
                    endDate    : '2018-02-07 15:00',
                    eventType  : 'Meeting',
                    eventColor : 'blue',
                    iconCls    : 'b-fa b-fa-calendar'
                },
                {
                    id         : 9,
                    resourceId : 'i',
                    name       : 'Important activity',
                    desc       : 'Hanging at the bar',
                    startDate  : '2018-02-07 16:00',
                    endDate    : '2018-02-07 19:00',
                    eventType  : 'Appointment',
                    iconCls    : 'b-fa b-fa-beer',
                    eventColor : 'orange'
                },
                {
                    id         : 10,
                    resourceId : 'j',
                    name       : 'Overtime',
                    desc       : 'Deadline approaching',
                    startDate  : '2018-02-07 17:00',
                    endDate    : '2018-02-07 20:00',
                    eventType  : 'Meeting',
                    iconCls    : 'b-fa b-fa-calendar',
                    eventColor : 'blue'
                },
                {
                    id         : 11,
                    resourceId : 'k',
                    name       : 'Scrum',
                    desc       : 'Team A',
                    startDate  : '2018-02-07 9:00',
                    endDate    : '2018-02-07 11:00',
                    eventType  : 'Appointment',
                    iconCls    : 'b-fa b-fa-calendar',
                    eventColor : 'blue'
                }
            ],
            resources : [
                { id : 'a', name : 'Arcady', role : 'Developer' },
                { id : 'b', name : 'Dave', role : 'Sales' },
                { id : 'c', name : 'Henrik', role : 'Sales' },
                { id : 'f', name : 'Celia', role : 'CEO' },
                { id : 'g', name : 'Lee', role : 'CTO' },
                { id : 'd', name : 'Madison', role : 'Developer' },
                { id : 'e', name : 'Maxim', role : 'Developer' },
                { id : 'h', name : 'Amit', role : 'Sales' },
                { id : 'i', name : 'Kate', role : 'Developer' },
                { id : 'j', name : 'Mark', role : 'Developer' },
                { id : 'k', name : 'Emilia', role : 'Developer' },
                { id : 'l', name : 'Lillo', role : 'Developer' },
                { id : 'm', name : 'Pluto', role : 'Sales' },
                { id : 'n', name : 'Topolino', role : 'Sales' },
                { id : 'o', name : 'Paperino', role : 'CEO' },
                { id : 'p', name : 'Nonna Papera', role : 'CTO' },
                { id : 'q', name : 'Donald Duck', role : 'Developer' },
                { id : 'r', name : 'Stecchino', role : 'Developer' },
                { id : 's', name : 'Lalit', role : 'Sales' },
                { id : 't', name : 'Bassotto', role : 'Developer' },
                { id : 'u', name : 'Maradona', role : 'Developer' },
                { id : 'v', name : 'Anne', role : 'Developer' },
                { id : 'w', name : 'John', role : 'Developer' },
                { id : 'x', name : 'Michael', role : 'Developer' },
                { id : 'y', name : 'El', role : 'Developer' },
                { id : 'z', name : 'Mario', role : 'Developer' }
            ]
        });

        const
            { eventStore, scrollable } = scheduler,
            e2 = eventStore.getById(2),
            e3 = eventStore.getById(3),
            check = function() {
                const rows = document.querySelectorAll('.b-grid-subgrid-normal .b-grid-row'),
                    rowsByIndex = {};

                for (let i = 0; i < rows.length; i++) {
                    const index = rows[i].dataset.index;
                    if (rowsByIndex[index]) {
                        clearInterval(checkInterval);
                        t.fail('Duplicate index ' + index);
                    }
                    rowsByIndex[index] = rows[i];
                }

            },
            checkInterval = setInterval(check, 1 / 60);

        t.chain(
            // Height adjustment is buffered
            {
                waitForEvent : [scheduler.rowManager, 'changeTotalHeight'],
                trigger      : {
                    // This should make the scheduler scroll height taller.
                    drag : scheduler.getElementFromEventRecord(e2), by : [0, -75]
                }
            },

            // Drag event 3 to the bottom of the scheduler
            { drag : scheduler.getElementFromEventRecord(e3), by : [0, 465], dragOnly : true },

            // Hold if there until we have scrolled to the bottom of the dataset
            { waitFor : () => t.samePx(scrollable.y, scrollable.maxY) },

            // Drop event 3
            { mouseup : null },

            { waitForAnimationFrame : null },

            next => {
                // It must have allowed us to drop on the bottom resource
                t.is(e3.resource, scheduler.resourceStore.last);
                next();
            },

            // It should scroll back to 0, triggering changeTotalHeight which should be ignored.
            { waitForEvent : [scrollable, 'scrollend'], trigger : () => scrollable.scrollTo(null, 0, { animate : true, force : true }) },

            () => {
                clearInterval(checkInterval);
            }
        );
    });

    t.it('Should correctly display proxy position on scrolled page', async t => {
        async function DoTest(t, constrainDragToTimeline) {
            // In Firefox 74 extra scrolling occurs when you start dragging event on a scrolled body.
            // This is only reproducible in siesta, when body inside the frame is scrollable. Scroll occurs when
            // resize monitor is setup on the body and `b-resize-monitored` class is added to the body element.
            // Solution for the test is to avoid scrolling body and scroll block element instead.
            const scrollable = document.createElement('div');
            scrollable.id = 'foo';
            scrollable.style.height = '600px';
            scrollable.style.overflow = 'auto';

            const container = document.createElement('div');
            container.id = 'bar';
            container.style.marginTop = '400px';
            scrollable.appendChild(container);

            document.body.appendChild(scrollable);

            scheduler = t.getScheduler({
                appendTo : 'bar',
                height   : 500,
                features : {
                    eventDrag : {
                        constrainDragToTimeline
                    }
                },
                enableEventAnimations : false
            });

            await t.waitForProjectReady(scheduler);

            let originalBox;

            t.chain(
                { waitForSelector : '.b-sch-event-wrap' },
                (next, els) => {
                    scrollable.scrollTop = 200;
                    t.waitFor(() => t.samePx(scrollable.scrollTop, 200), () => {
                        originalBox = els[0].getBoundingClientRect();
                        next();
                    });
                },
                { drag : '.b-sch-event', by : [100, 0], dragOnly : true },
                next => {
                    const
                        el = document.querySelector('.b-dragging:not(.b-hidden)') || scheduler.features.eventDrag.drag.context.element,
                        box = el.getBoundingClientRect();

                    t.isApproxPx(box.left, originalBox.left + 100, 1, 'Event drag proxy is positioned correctly');
                    t.isApproxPx(box.top, originalBox.top, 1, 'Event drag proxy is positioned correctly');
                    next();
                },
                { moveMouseTo : '.b-scheduler', offset : [200, -100] },
                { mouseUp : null },
                { waitForSelectorNotFound : '.b-dragging' },
                { waitForElementVisible : '.b-sch-event.event1' },
                {
                    waitFor() {
                        if (constrainDragToTimeline) {
                            return true;
                        }
                        // The drag upwards, outside of the timeline will have done a revert
                        // for the non-constraining case. Wait for the animation to settle
                        // into the correct original position
                        else {
                            const
                                el = document.querySelector('.b-sch-event.event1'),
                                box = el.getBoundingClientRect();

                            return t.samePx(box.left, originalBox.left) && t.samePx(box.top, originalBox.top);
                        }
                    }
                },
                async() => {
                    scrollable.remove();
                }
            );
        }

        t.it('Constrained to timeline', async t => {
            await DoTest(t, true);
        });

        t.it('Not constrained to timeline', async t => {
            await DoTest(t, false);
        });
    });

    t.it('Should not fail on dragging event outside view with working time preset', async t => {
        await getScheduler({
            startDate   : new Date(2011, 0, 6),
            endDate     : new Date(2011, 0, 7),
            workingTime : {
                fromDay : 1,
                toDay   : 6
            },
            events : [
                {
                    resourceId : 'r3',
                    startDate  : new Date(2011, 0, 6),
                    endDate    : new Date(2011, 0, 7)
                }
            ]
        });

        t.chain(
            { drag : scheduler.eventSelector, by : [-50, -50] },
            { drag : scheduler.eventSelector, by : [100, 100] }
        );
    });

    t.it('Should be possible to toggle constrainDragToResource programmatically + before drag is starting', async t => {
        await getScheduler({
            startDate     : new Date(2017, 0, 1, 4),
            height        : 210,
            resourceStore : t.getResourceStore2({}, 3),
            events        : [
                {
                    resourceId : 'r3',
                    id         : 1,
                    startDate  : new Date(2017, 0, 1),
                    endDate    : new Date(2017, 0, 2)
                }
            ],
            features : {
                eventDrag : {
                    constrainDragToResource : true
                }
            }
        });

        scheduler.features.eventDrag.constrainDragToResource = false;

        t.chain(
            { drag : scheduler.eventSelector, by : [100, -50] },
            { waitForSelectorNotFound : '.b-dragging-event' },

            next => {
                t.is(scheduler.eventStore.first.resourceId, 'r2', 'constrainDragToResource was set dynamically, drag vertically worked');

                scheduler.on('beforeEventDrag', () => scheduler.features.eventDrag.constrainDragToResource = true);
                next();
            },

            { drag : scheduler.eventSelector, by : [100, 50] },
            { waitForSelectorNotFound : '.b-dragging-event' },

            () => t.is(scheduler.eventStore.first.resourceId, 'r2', 'constrainDragToResource was set in ´beforeDragStart´, drag vertically was not allowed')
        );
    });

    t.it('Should be possible to freely drag unconstrained event after dragging a constrained event', async t => {
        await getScheduler({
            startDate     : new Date(2017, 0, 1, 4),
            height        : 210,
            resourceStore : t.getResourceStore2({}, 3),
            events        : [
                {
                    resourceId : 'r3',
                    name       : 'constrained',
                    id         : 1,
                    startDate  : new Date(2017, 0, 1),
                    endDate    : new Date(2017, 0, 2)
                },
                {
                    resourceId : 'r3',
                    name       : 'free',
                    id         : 2,
                    startDate  : new Date(2017, 0, 1),
                    endDate    : new Date(2017, 0, 2)
                }
            ],
            features : {
                eventDrag : {
                    constrainDragToTimeSlot : true
                }
            }
        });

        t.chain(
            { drag : scheduler.eventSelector + ':contains(constrained)', by : [100, 0] },
            { waitForSelectorNotFound : '.b-dragging-event' },

            next => {
                t.firesOnce(scheduler.eventStore, 'update');
                scheduler.on('beforeEventDrag', () => {
                    scheduler.features.eventDrag.constrainDragToResource = false;
                    scheduler.features.eventDrag.constrainDragToTimeSlot = false;
                });

                t.is(scheduler.eventStore.first.startDate, new Date(2017, 0, 1), 'constrainDragToTimeSlot enabled');

                next();
            },

            { drag : scheduler.eventSelector + ':contains(free)', by : [200, 0], dragOnly : true },

            async() => t.isGreater(
                t.query(scheduler.eventSelector + ':contains(free)')[0].getBoundingClientRect().left,
                t.query(scheduler.eventSelector + ':contains(constrained)')[0].getBoundingClientRect().left,
                'Free event could move along x-axis'
            ),

            { mouseUp : null },
            { waitForSelectorNotFound : '.b-dragging-event' },

            () => t.isGreater(scheduler.eventStore.last.startDate, new Date(2017, 0, 1), 'constrainDragToTimeSlot disabled')
        );
    });

    t.it('Should never affect start date of dragged event if constrainDragToTimeSlot is true', async t => {
        await getScheduler({
            startDate      : new Date(2017, 0, 1, 4),
            height         : 210,
            resourceStore  : t.getResourceStore2({}, 3),
            viewPreset     : 'hourAndDay',
            snap           : true,
            timeResolution : 15,
            events         : [
                {
                    resourceId : 'r3',
                    name       : 'constrained',
                    id         : 1,
                    startDate  : new Date(2017, 0, 1, 5, 20),
                    endDate    : new Date(2017, 0, 1, 6, 20)
                }
            ],
            features : {
                eventDrag : {
                    constrainDragToTimeSlot : true
                }
            }
        });

        t.firesOnce(scheduler.eventStore, 'update');

        const eventLeft = t.rect('.b-sch-event').left;

        t.chain(
            { drag : scheduler.eventSelector + ':contains(constrained)', by : [30, -100], dragOnly : true },
            async() => {
                t.isApprox(t.rect('.b-sch-event').left, eventLeft, 0.5, 'Drag proxy x position intact');
            },
            { mouseUp : null },
            { waitForSelectorNotFound : '.b-dragging-event' },

            () => {
                t.is(scheduler.eventStore.last.startDate, new Date(2017, 0, 1, 5, 20), 'Start date intact');
            }
        );
    });

    t.it('Should support snap in vertical mode', async t => {
        await getScheduler({
            startDate      : new Date(2017, 0, 1, 4),
            resourceStore  : t.getResourceStore2({}, 3),
            viewPreset     : 'hourAndDay',
            mode           : 'vertical',
            snap           : true,
            timeResolution : 60,
            events         : [
                {
                    resourceId : 'r1',
                    id         : 1,
                    startDate  : new Date(2017, 0, 1, 5),
                    endDate    : new Date(2017, 0, 1, 6)
                }
            ]
        });

        t.firesOnce(scheduler.eventStore, 'update');

        const eventRect = t.rect('.b-sch-event');

        t.chain(
            { drag : scheduler.eventSelector, by : [0, scheduler.tickSize * 0.8], dragOnly : true },
            async() => {
                t.is(t.rect('.b-sch-event').left, eventRect.left, 'Drag proxy x intact');
                t.is(t.rect('.b-sch-event').top, eventRect.top + scheduler.tickSize, 'Drag proxy snapped to timeResolution value');
            },
            { mouseUp : null },
            { waitForSelectorNotFound : '.b-dragging-event' },

            () => {
                t.is(scheduler.eventStore.last.startDate, new Date(2017, 0, 1, 6), 'Start date correct');
                t.is(scheduler.eventStore.last.endDate, new Date(2017, 0, 1, 7), 'End date correct');
            }
        );
    });
});
