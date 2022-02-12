import { Dependencies, Scheduler, Rectangle } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    window.Dependencies = Dependencies;

    t.beforeEach(() => {
        scheduler?.destroy?.();
    });

    t.it('Should layout items correctly when using Pack', async t => {
        scheduler = new Scheduler({
            appendTo    : document.body,
            rowHeight   : 100,
            eventLayout : 'pack',

            viewPreset : 'dayAndWeek',
            startDate  : new Date(2018, 0, 1),
            endDate    : new Date(2018, 1, 15),
            barMargin  : 1,
            resources  : [
                { id : 1, name : 'First' }
            ],

            events : [
                // Events arranged in different 'overlap clusters'
                { cls : 'a', name : 'a', resourceId : 1, startDate : '2018-01-01', endDate : '2018-01-03' },
                { cls : 'b', name : 'b', resourceId : 1, startDate : '2018-01-01', endDate : '2018-01-03' },
                { cls : 'c', name : 'c', resourceId : 1, startDate : '2018-01-01', endDate : '2018-01-03' },
                { cls : 'd', name : 'd', resourceId : 1, startDate : '2018-01-01', endDate : '2018-01-03' },

                { cls : 'e', name : 'e', resourceId : 1, startDate : '2018-01-04', endDate : '2018-01-07' },
                { cls : 'f', name : 'f', resourceId : 1, startDate : '2018-01-04', endDate : '2018-01-05' },
                { cls : 'g', name : 'g', resourceId : 1, startDate : '2018-01-06', endDate : '2018-01-07' },

                { cls : 'h', name : 'h', resourceId : 1, startDate : '2018-01-08', endDate : '2018-01-09' },

                { cls : 'i', name : 'i', resourceId : 1, startDate : '2018-01-10', endDate : '2018-01-11' },
                { cls : 'j', name : 'j', resourceId : 1, startDate : '2018-01-10', endDate : '2018-01-12' },
                { cls : 'k', name : 'k', resourceId : 1, startDate : '2018-01-11', endDate : '2018-01-14' },
                { cls : 'l', name : 'l', resourceId : 1, startDate : '2018-01-13', endDate : '2018-01-15' },
                { cls : 'm', name : 'm', resourceId : 1, startDate : '2018-01-13', endDate : '2018-01-14' }
            ]
        });

        await t.waitForProjectReady();

        scheduler.timeAxisViewModel.tickSize = 20;

        function getTopPosition(name) {
            const cellTop = document.body.querySelector('.b-grid-cell').getBoundingClientRect().top;

            return document.body.querySelector('.' + name).getBoundingClientRect().top - cellTop;
        }

        t.subTest('4 event cluster', t => {
            t.is(getTopPosition('a'), 1, 'a');
            t.isApprox(getTopPosition('b'), 1 * scheduler.rowHeight / 4, 1, 'b');
            t.isApprox(getTopPosition('c'), 2 * scheduler.rowHeight / 4, 1, 'c');
            t.isApprox(getTopPosition('d'), 3 * scheduler.rowHeight / 4, 1, 'd');

            t.isApprox(document.body.querySelector('.a').offsetHeight, scheduler.rowHeight / 4, 2, 'a');
            t.isApprox(document.body.querySelector('.b').offsetHeight, scheduler.rowHeight / 4, 2, 'b');
            t.isApprox(document.body.querySelector('.c').offsetHeight, scheduler.rowHeight / 4, 2, 'c');
            t.isApprox(document.body.querySelector('.d').offsetHeight, scheduler.rowHeight / 4, 2, 'd');
        });

        t.subTest('3 event cluster', t => {
            t.is(getTopPosition('e'), 1, 'e');
            t.isApprox(getTopPosition('f'), scheduler.rowHeight / 2, 1, 'f');
            t.isApprox(getTopPosition('g'), scheduler.rowHeight / 2, 1, 'g');

            t.isApprox(document.body.querySelector('.e').offsetHeight, scheduler.rowHeight / 2, 2, 'e');
            t.isApprox(document.body.querySelector('.f').offsetHeight, scheduler.rowHeight / 2, 2, 'f');
            t.isApprox(document.body.querySelector('.g').offsetHeight, scheduler.rowHeight / 2, 2, 'g');
        });

        t.subTest('Single event cluster', t => {
            t.is(getTopPosition('h'), 1, 'h');

            t.isApprox(document.body.querySelector('.h').offsetHeight, scheduler.rowHeight / 1, 2, 'h');
        });

        t.subTest('5 event cluster', t => {
            t.is(getTopPosition('j'), 1, 'j');
            t.isApprox(getTopPosition('i'), scheduler.rowHeight / 2, 1, 'j');
            t.isApprox(getTopPosition('k'), scheduler.rowHeight / 2, 1, 'k');
            t.is(getTopPosition('l'), 1, 'l');
            t.isApprox(getTopPosition('m'), scheduler.rowHeight / 4, 1, 'm');

            t.isApprox(document.body.querySelector('.i').offsetHeight, scheduler.rowHeight / 2, 2, 'i');
            t.isApprox(document.body.querySelector('.j').offsetHeight, scheduler.rowHeight / 2, 2, 'j');
            t.isApprox(document.body.querySelector('.k').offsetHeight, scheduler.rowHeight / 2, 2, 'k');
            t.isApprox(document.body.querySelector('.l').offsetHeight, scheduler.rowHeight / 4, 2, 'l');
            t.isApprox(document.body.querySelector('.m').offsetHeight, scheduler.rowHeight / 4, 2, 'm');
        });
    });

    t.it('layout upon scheduler viewport resize', t => {
        t.it('Resizing Scheduler height with events', async t => {
            scheduler = await t.getSchedulerAsync({
                resourceStore : t.getResourceStore2({}, 100),
                height        : 200
            }, 100);

            scheduler.resourceStore.forEach(resource => {
                const e = resource.getEvents()[0];

                e.startDate = scheduler.timeAxis.startDate;
                e.endDate = new Date(scheduler.timeAxis.startDate.valueOf() + 1000 * 60 * 60 * 24);
            });

            await t.waitForProjectReady();

            let startEventCount;

            t.chain(
                // Dependencies drawn on frame, so wait for that to complete
                { waitForAnimationFrame : null },

                next => {
                    startEventCount = document.querySelectorAll('.b-sch-event').length;

                    scheduler.height = 760;
                    next();
                },

                {
                    // Test completes when the newly visible events show
                    waitFor : () => {
                        return document.querySelectorAll('.b-sch-event').length > startEventCount;
                    }
                }
            );
        });

        // TODO
        t.it('Resizing Scheduler height with events and dependencies', async t => {
            scheduler = await t.getSchedulerAsync({
                dependencyStore : true,
                resourceStore   : t.getResourceStore2({}, 100),
                height          : 200
            }, 100);

            scheduler.resourceStore.forEach(resource => {
                const e = resource.getEvents()[0];

                e.startDate = scheduler.timeAxis.startDate;
                e.endDate = new Date(scheduler.timeAxis.startDate.valueOf() + 1000 * 60 * 60 * 24);
            });

            await t.waitForProjectReady();

            let startDepCount, startEventCount;

            t.chain(
                { waitForSelector : '.b-sch-dependency' },

                next => {
                    startDepCount = document.querySelectorAll('.b-sch-dependency').length;
                    startEventCount = document.querySelectorAll('.b-sch-event').length;

                    scheduler.height = 760;
                    next();
                },

                {
                    waitFor : () => {
                        return document.querySelectorAll('.b-sch-dependency').length > startDepCount &&
                               document.querySelectorAll('.b-sch-event').length > startEventCount;
                    }
                }
            );
        });
    });

    t.it('should rerender events once on sort', async t => {
        scheduler = new Scheduler({
            appendTo    : document.body,
            rowHeight   : 100,
            eventLayout : 'pack',

            viewPreset : 'dayAndWeek',
            startDate  : new Date(2018, 0, 1),
            endDate    : new Date(2018, 1, 15),
            barMargin  : 1,

            columns : [{
                text   : 'Name',
                field  : 'name',
                width  : 200,
                locked : true
            }],

            resources : [
                { id : 1, name : 'First' },
                { id : 2, name : 'Second' },
                { id : 3, name : 'Third' },
                { id : 4, name : 'Fourth' }
            ],

            events : [
                { cls : 'a', name : 'a', resourceId : 4, startDate : '2018-01-01', endDate : '2018-01-03' },
                { cls : 'b', name : 'b', resourceId : 4, startDate : '2018-01-01', endDate : '2018-01-03' },
                { cls : 'c', name : 'c', resourceId : 4, startDate : '2018-01-01', endDate : '2018-01-03' },
                { cls : 'd', name : 'd', resourceId : 4, startDate : '2018-01-01', endDate : '2018-01-03' }
            ]
        });

        await t.waitForProjectReady();

        t.isCalledNTimes('layoutResourceEvents', scheduler.currentOrientation, 0, 'No need to relayout events on sort');
        t.isCalledNTimes('renderEvent', scheduler.currentOrientation, scheduler.eventStore.count, 'Each event rendered');
        scheduler.store.sort('name');
    });

    t.it('Number of rendered events should remain stable during scrolling', async t => {
        scheduler = await t.getSchedulerAsync({
            resourceStore : t.getResourceStore2({}, 200),
            rowHeight     : 50 // To fit 3 rows into the vertical scroll buffer
        }, 200);

        const { startDate } = scheduler.timeAxis;

        scheduler.currentOrientation.verticalBufferSize = 500;

        scheduler.eventStore.beginBatch();
        scheduler.resourceStore.forEach(resource => {
            const e = resource.getEvents()[0];

            e.startDate = startDate;
            e.endDate = new Date(startDate.valueOf() + 1000 * 60 * 60 * 24);

            // Add some events on this resource
            scheduler.eventStore.add([{
                resourceId : resource.id,
                startDate  : new Date(startDate.valueOf() + 1000 * 60 * 60 * 24 * 2),
                endDate    : new Date(startDate.valueOf() + 1000 * 60 * 60 * 24 * 3)
            }, {
                resourceId : resource.id,
                startDate  : new Date(startDate.valueOf() + 1000 * 60 * 60 * 24 * 4),
                endDate    : new Date(startDate.valueOf() + 1000 * 60 * 60 * 24 * 5)
            }]);
        });
        scheduler.eventStore.endBatch();

        await t.waitForProjectReady();

        let startEventCount;

        // Scroll down enough to fill the vertical render buffer, if we do not the event count wont match as we scroll
        // further down
        scheduler.scrollTop = 200;

        t.chain(
            // Wait for events to have been drawn after scroll
            { waitForAnimationFrame : null },

            next => {
                startEventCount = t.query('.b-sch-event').length;
                t.diag('Rendered events: ' + document.querySelectorAll('.b-sch-event').length);
                next();
            },

            async() => {
                await scheduler.scrollRowIntoView(`r${200 - scheduler.leadingBufferSize}`);
                // Event count must be stable
                t.is(t.query(scheduler.unreleasedEventSelector).length, startEventCount, 'Rendered event count is stable');
            }
        );
    });

    t.it('Should render events that end outside of view correctly with week based preset', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate  : new Date(2011, 0, 1),
            endDate    : new Date(2011, 2, 1),
            viewPreset : {
                tickWidth         : 25,
                displayDateFormat : 'L',
                timeResolution    : {
                    unit      : 'week',
                    increment : 1
                },
                headers : [
                    {
                        unit       : 'week',
                        dateFormat : 'W'
                    }
                ]
            },
            events : [
                { resourceId : 'r1', startDate : new Date(2011, 0, 10), endDate : new Date(2011, 11, 28) }
            ]
        }, 1);

        const bounds = t.rect('.b-sch-event');
        t.ok(bounds.left > 0, 'Event starts in view');
    });

    // TODO: Restore loop add and investigate rendering

    t.it('Should recalculate scroll height when stacking changes the height of a resource row', async t => {
        scheduler = await t.getSchedulerAsync({
            height : 400
        });

        t.chain(
            // Starts with no overflow
            next => {
                t.ok(scheduler.scrollable.scrollHeight === scheduler.scrollable.clientHeight);
                next();
            },

            // Make a whole load of overlapping duplicates
            async() => {
                const
                    events = scheduler.eventStore.getRange(),
                    toAdd = [];

                events.forEach(event => {
                    const newEvent = event.copy();

                    newEvent.name = newEvent.name + ' copy';
                    toAdd.push(newEvent);
                });

                scheduler.eventStore.add(toAdd);

                await t.waitForProjectReady();
            },

            // Now must have overflow
            () => {
                t.ok(scheduler.scrollable.scrollHeight > scheduler.scrollable.clientHeight);
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8746
    t.it('Should recalculate scroll height and move subsequent rows downwards when stacking changes the height of a single resource row', async t => {
        scheduler = await t.getSchedulerAsync({
            height        : 400,
            resourceStore : t.getResourceStore2(null, 100)
        }, 100);

        const event40 = scheduler.eventStore.getAt(39);

        t.chain(
            // Starts with no overflow
            () => scheduler.scrollEventIntoView(event40, {
                block : 'start'
            }),

            { waitFor : () => scheduler.rowManager.getRowFor(event40.resource) },

            // Make row 40 taller due to event overlap
            async() => {
                const
                    { rowManager } = scheduler,
                    row40 = rowManager.getRowFor(event40.resource),
                    oldRow40Height = row40.height,
                    newEvent = event40.copy(),
                    followingRowTops = [];

                for (let i = 0, index = row40.dataIndex + 1, row = rowManager.getRow(index); row; row = rowManager.getRow(++index), i++) {
                    followingRowTops[i] = row.top;
                }

                newEvent.name = newEvent.name + ' copy';
                scheduler.eventStore.add(newEvent);

                await t.waitForProjectReady();

                const heightIncrement = row40.height - oldRow40Height;

                // Check all following rows have been bumped down just right
                for (let i = 0, index = row40.dataIndex + 1, row = rowManager.getRow(index); row; row = rowManager.getRow(++index), i++) {
                    t.is(row.top, followingRowTops[i] + heightIncrement);
                }

                // Now must have overflow
                t.ok(scheduler.scrollable.scrollHeight > scheduler.scrollable.clientHeight);
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8093
    t.it('Should not redraw other rows when using `eventLayout: none`', async t => {
        scheduler = await t.getSchedulerAsync({
            eventLayout : 'none'
        });

        await t.firesOk({
            observable : scheduler.rowManager,
            events     : {
                renderRow : 2 // first r1, then r1 && r2
            },
            async during() {
                scheduler.eventStore.first.startDate = new Date(2011, 0, 3);
                scheduler.eventStore.getById(2).resourceId = 'r1';

                await t.waitForProjectReady();
            }
        });
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8642
    t.it('Should apply custom event sorter', async t => {
        function sorter(a, b) {
            return a.name > b.name ? -1 : 1;
        }

        function assertEvent(id, top) {
            const box = Rectangle.from(document.querySelector(`[data-event-id="${id}"]`), scheduler.timeAxisSubGridElement);

            t.is(box.top, top, 'Correct top for event ' + id);
        }

        scheduler = await t.getSchedulerAsync({
            events : [
                { id : 1, resourceId : 'r1', startDate : new Date(2011, 0, 4), duration : 2, name : 'A' },
                { id : 2, resourceId : 'r1', startDate : new Date(2011, 0, 4), duration : 2, name : 'B' }
            ],
            horizontalEventSorterFn : sorter,
            barMargin               : 0
        });

        t.diag('Custom sorter applied initially');

        assertEvent(1, 45);
        assertEvent(2, 0);

        t.diag('Custom sorter removed');

        scheduler.horizontalEventSorterFn = null;

        t.chain(
            { waitForSelectorNotFound : '.b-animating' },

            next => {
                assertEvent(1, 0);
                assertEvent(2, 45);

                t.diag('Custom sorter reapplied');

                scheduler.horizontalEventSorterFn = sorter;

                next();
            },

            { waitForSelectorNotFound : '.b-animating' },

            () => {
                assertEvent(1, 45);
                assertEvent(2, 0);
            }
        );
    });

    t.it('Should accept object as a config (horizontal)', async t => {
        scheduler = await t.getSchedulerAsync({
            eventLayout : {
                type : 'stack'
            }
        });

        scheduler.eventStore.getById(2).resourceId = 'r1';

        await scheduler.await('transitionend', false);

        t.isApprox(t.rect('[data-id="r1"] .b-sch-timeaxis-cell').height, scheduler.rowHeight * 2, 15, 'Row height is extended');

        t.is(scheduler.eventLayout, 'stack', 'Layout type is ok');

        scheduler.eventLayout = { type : 'pack' };

        await scheduler.await('transitionend', false);

        t.isApprox(t.rect('[data-id="r1"] .b-sch-timeaxis-cell').height, scheduler.rowHeight, 1, 'Row height is extended');

        t.is(scheduler.eventLayout, 'pack', 'Layout type is ok');
    });

    t.it('Should accept object as a config (vertical)', async t => {
        scheduler = await t.getVerticalSchedulerAsync({
            eventLayout : {
                type : 'none'
            }
        });

        t.isApprox(t.rect('[data-event-id="1"]').width, scheduler.resourceColumnWidth, 5, 'Event 1 width is ok');
        t.isApprox(t.rect('[data-event-id="2"]').width, scheduler.resourceColumnWidth, 5, 'Event 2 width is ok');

        t.is(scheduler.eventLayout, 'none', 'Layout type is ok');

        scheduler.eventLayout = { type : 'pack' };

        t.isApprox(t.rect('[data-event-id="1"]').width, scheduler.resourceColumnWidth / 2, 5, 'Event 1 width is ok');
        t.isApprox(t.rect('[data-event-id="2"]').width, scheduler.resourceColumnWidth / 2, 5, 'Event 2 width is ok');

        t.is(scheduler.eventLayout, 'pack', 'Layout type is ok');
    });
});
