import { PresetManager, RandomGenerator, DateHelper } from '../../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler && scheduler.destroy());

    function getMSPPX() {
        return scheduler.getDateFromCoordinate(1) - scheduler.startDate;
    }

    t.it('Should zoom to preset', t => {
        scheduler = t.getScheduler({
            viewPreset : 'weekAndDay',
            startDate  : new Date(2018, 4, 20),
            endDate    : new Date(2018, 4, 27)
        });

        const centerDate = scheduler.viewportCenterDate;

        function assertZoom(preset) {
            // check if center date is saved
            // TODO: Relaxed by  * 1.1, remove as part of #7882
            t.isApprox(scheduler.viewportCenterDate.getTime(), centerDate.getTime(), getMSPPX() * 1.1, 'Center date is ok');
            t.is(scheduler.timeAxisViewModel.viewPreset.id, preset, 'View preset is correct');
        }

        t.willFireNTimes(scheduler, 'timeAxisChange', 3);

        t.chain(
            { waitForSelector : '.b-sch-timeaxis-cell' },
            () => {
                let preset = 'minuteAndHour';
                scheduler.zoomTo(preset);
                assertZoom(preset);

                preset = 'monthAndYear';
                scheduler.zoomTo(preset);
                assertZoom(preset);

                preset = 'dayAndWeek';
                scheduler.zoomTo(preset);
                assertZoom(preset);
            }
        );
    });

    t.it('Should fire presetChange with correct signature when zoom to a viewpreset', t => {
        scheduler = t.getScheduler({
            viewPreset : 'weekAndDay',
            startDate  : new Date(2018, 4, 20),
            endDate    : new Date(2018, 4, 27)
        });

        t.firesOnce(scheduler, 'presetChange');

        scheduler.on({
            presetChange({ from, to }) {
                t.is(to.id, 'minuteAndHour');
                t.ok(to.equals(PresetManager.getPreset('minuteAndHour')));
            }
        });

        t.chain(
            { waitForRowsVisible : scheduler },

            () => {
                scheduler.zoomTo('minuteAndHour');
            }
        );
    });

    t.it('Should fire presetChange with correct signature when zoom to a timespan', t => {
        scheduler = t.getScheduler({
            viewPreset : 'weekAndDay',
            startDate  : new Date(2018, 4, 20),
            endDate    : new Date(2018, 4, 27)
        });

        t.firesOnce(scheduler, 'presetChange');

        scheduler.on({
            presetChange({ from, to }) {
                t.is(to.id, 'year');
                t.ok(to.equals(PresetManager.getPreset('year')));
            }
        });

        t.chain(
            { waitForRowsVisible : scheduler },

            () => {
                scheduler.zoomToSpan({
                    startDate : new Date(2017, 4, 20),
                    endDate   : new Date(2019, 4, 27)
                });
            }
        );
    });

    t.it('Should fire presetChange with correct signature when zoom to a level', t => {
        scheduler = t.getScheduler({
            viewPreset : 'weekAndDay',
            startDate  : new Date(2018, 4, 20),
            endDate    : new Date(2018, 4, 27)
        });

        t.firesOnce(scheduler, 'presetChange');

        scheduler.on({
            presetChange({ from, to }) {
                t.is(to.id, 'manyYears');
                t.ok(to.equals(PresetManager.getPreset('manyYears')));
            }
        });

        t.chain(
            { waitForRowsVisible : scheduler },

            () => {
                scheduler.zoomToLevel('manyYears');
            }
        );
    });

    t.it('Should zoom to level index', t => {
        scheduler = t.getScheduler({
            viewPreset : 'weekAndDay',
            startDate  : new Date(2018, 4, 20),
            endDate    : new Date(2018, 4, 27)
        });

        t.chain(
            { waitForSelector : '.b-sch-timeaxis-cell' },
            () => {
                t.willFireNTimes(scheduler, 'timeAxisChange', 3);

                scheduler.zoomTo(scheduler.presets.indexOf(scheduler.normalizePreset('manyYears')));
                t.is(scheduler._viewPreset.id, 'manyYears', 'Zoomed to level 0');

                scheduler.zoomTo(scheduler.presets.count - 1);
                t.is(scheduler._viewPreset.id, scheduler.presets.last.id, 'Zoomed to max level');

                scheduler.zoomTo({
                    level      : 0,
                    startDate  : new Date(2000, 0, 1),
                    endDate    : new Date(2010, 0, 1),
                    width      : 300,
                    centerDate : new Date(2004, 0, 1)
                });

                t.is(scheduler._viewPreset.id, 'manyYears', 'Zoomed to level 0');
                t.is(scheduler.startDate, new Date(2000, 0, 1), 'Start is ok');
                t.is(scheduler.endDate, new Date(2010, 0, 1), 'End is ok');
                t.isApprox(scheduler.viewportCenterDate.getTime(), new Date(2004, 0, 1).getTime(), getMSPPX(), 'Center is ok');
            }
        );
    });

    t.it('Should zoom to preset with config', t => {
        scheduler = t.getScheduler({
            viewPreset : 'weekAndDay',
            startDate  : new Date(2018, 4, 20),
            endDate    : new Date(2018, 4, 27)
        });

        function getMSPPX() {
            return scheduler.getDateFromCoordinate(1) - scheduler.startDate;
        }

        function assertZoom(config) {
            const centerDate = config.centerDate || new Date((config.startDate.getTime() + config.endDate.getTime()) / 2);
            t.isApprox(scheduler.viewportCenterDate.getTime(), centerDate.getTime(), getMSPPX(), 'Center date is ok');
            t.is(scheduler.timeAxisViewModel.viewPreset.id, config.preset, 'View preset is correct');

            if (config.width) {
                t.is(scheduler.timeAxisViewModel.tickSize, config.width, 'Tick width is ok');
            }
        }

        t.chain(
            { waitForSelector : '.b-sch-timeaxis-cell' },
            () => {
                t.willFireNTimes(scheduler, 'timeAxisChange', 2);

                const preset = 'minuteAndHour';
                let config = {
                    preset,
                    startDate : new Date(2018, 4, 21),
                    endDate   : new Date(2018, 4, 22)
                };

                scheduler.zoomTo(config);
                assertZoom(config);

                config = {
                    preset,
                    startDate  : new Date(2018, 4, 22),
                    endDate    : new Date(2018, 4, 24),
                    centerDate : new Date(2018, 4, 22, 12),
                    width      : 200
                };

                scheduler.zoomTo(config);
                assertZoom(config);
            }
        );
    });

    t.it('Should zoom to span', t => {
        scheduler = t.getScheduler({
            viewPreset : 'weekAndDay',
            startDate  : new Date(2018, 4, 20),
            endDate    : new Date(2018, 4, 27)
        });

        t.chain(
            { waitForSelector : '.b-sch-timeaxis-cell' },
            () => {
                t.willFireNTimes(scheduler, 'timeAxisChange', 1);

                const hour = 1000 * 60 * 60;

                scheduler.zoomTo({
                    startDate : new Date(2017, 0, 1, 6),
                    endDate   : new Date(2017, 0, 1, 20)
                });

                t.waitFor(
                    () => scheduler.scrollLeft > 0,
                    () => {
                        const visibleStartDate = scheduler.getDateFromCoordinate(scheduler.scrollLeft),
                            visibleEndDate = scheduler.getDateFromCoordinate(scheduler.scrollLeft + scheduler.timeAxisViewModel.availableSpace);

                        t.ok(scheduler._viewPreset.id.startsWith('hourAndDay'), 'View preset is ok');
                        t.isApprox(visibleStartDate.getTime(), new Date(2017, 0, 1, 6), hour, 'Start date is ok');
                        t.isApprox(visibleEndDate.getTime(), new Date(2017, 0, 1, 20), hour, 'End date is ok');
                    }
                );
            }
        );
    });

    t.it('Should zoom to time span of event store contents when calling zoomToFit', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'weekAndDay',
            events     : [
                {
                    startDate  : new Date(2018, 6, 1),
                    endDate    : new Date(2018, 7, 1),
                    resourceId : 'r1'
                }
            ]
        });

        const dayMs = 1000 * 60 * 60 * 24;

        t.chain(
            () => {
                t.firesOnce(scheduler, 'timeAxisChange');

                scheduler.zoomToFit({});

                t.waitFor(
                    () => scheduler.scrollLeft > 0,
                    () => {
                        const visibleStartDate = scheduler.getDateFromCoordinate(scheduler.scrollLeft),
                            visibleEndDate = scheduler.getDateFromCoordinate(scheduler.scrollLeft + scheduler.timeAxisViewModel.availableSpace);

                        t.isApprox(visibleStartDate.getTime(), new Date(2018, 6, 1).getTime(), dayMs, 'Start date is ok');
                        t.isApprox(visibleEndDate.getTime(), new Date(2018, 7, 1).getTime(), dayMs, 'End date is ok');

                        // Should not crash or misbehave when zoomToFit is called with empty eventStore
                        scheduler.events = [];
                        scheduler.zoomToFit();

                        t.isApprox(visibleStartDate.getTime(), new Date(2018, 6, 1).getTime(), dayMs, 'Start date is ok');
                        t.isApprox(visibleEndDate.getTime(), new Date(2018, 7, 1).getTime(), dayMs, 'End date is ok');
                    }
                );
            }
        );
    });

    t.it('Should handle calling zoomToFit if there is just a 0 duration event in the event store', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate  : new Date(2012, 6, 1),
            endDate    : new Date(2012, 7, 1),
            viewPreset : 'weekAndDay',
            events     : [
                {
                    id         : 1,
                    startDate  : new Date(2018, 6, 1),
                    duration   : 0,
                    resourceId : 'r1'
                }
            ]
        });

        t.firesOnce(scheduler, 'timeAxisChange');

        scheduler.zoomToFit();
        await t.waitForSelector(scheduler.unreleasedEventSelector);
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7968
    t.it('zoomToSpan should take centerDate config into account', t => {
        scheduler = t.getScheduler({
            viewPreset : 'weekAndDay',
            startDate  : new Date(2018, 4, 20),
            endDate    : new Date(2018, 4, 27)
        });

        const centerDate = new Date(2017, 0, 1);

        t.chain(
            { waitForSelector : '.b-sch-timeaxis-cell' },
            () => {
                scheduler.zoomToSpan({
                    startDate  : new Date(2017, 0, 1, 6),
                    endDate    : new Date(2017, 0, 1, 20),
                    centerDate : centerDate
                });

                t.waitFor(
                    () => scheduler.scrollLeft > 0,
                    () => {
                        const visibleStartDate = scheduler.getDateFromCoordinate(scheduler.scrollLeft),
                            visibleEndDate   = scheduler.getDateFromCoordinate(scheduler.scrollLeft + scheduler.timeAxisViewModel.availableSpace),
                            visibleCenter    = new Date((visibleStartDate.getTime() + visibleEndDate.getTime()) / 2);

                        t.isApprox(visibleCenter.getTime(), centerDate.getTime(), 1000 * 60 * 60, 'Center date is correct');
                    }
                );
            }
        );
    });

    t.it('Should respect leftMargin / rightMargin configs provided to zoomToFit', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'weekAndDayLetter',
            events     : [
                {
                    startDate  : new Date(2018, 6, 1),
                    endDate    : new Date(2018, 7, 1),
                    resourceId : 'r1'
                }
            ]
        });

        const dayMs = 1000 * 60 * 60 * 24;

        scheduler.zoomToFit();

        t.chain(
            { waitFor : () => scheduler.visibleDateRange.startDate - new Date(2018, 6, 1) < dayMs && scheduler.visibleDateRange.endDate - new Date(2018, 7, 1) < dayMs },

            async() => {
                t.firesOnce(scheduler, 'timeAxisChange');

                await scheduler.eventStore.first.setStartDate(new Date(2018, 6, 23));

                scheduler.zoomToFit({
                    leftMargin  : 60,
                    rightMargin : 60
                });
            },

            () => {
                const
                    startDate = scheduler.getDateFromCoordinate(scheduler.scrollLeft + 60),
                    endDate   = scheduler.getDateFromCoordinate(scheduler.scrollLeft + scheduler.timeAxisViewModel.availableSpace - 60);

                t.isApprox(startDate, new Date(2018, 6, 23).getTime(), dayMs, 'Start date is ok');
                t.isApprox(endDate, new Date(2018, 7, 23).getTime(), dayMs, 'End date is ok');
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8868-crash-when-opening-bigdataset-in-iphone/details#
    t.it('should not crash if calling zoomToFit when there is no space for time axis', async t => {
        scheduler = await t.getSchedulerAsync({
            width  : 50,
            events : [
                {
                    startDate  : new Date(2018, 6, 1),
                    endDate    : new Date(2018, 7, 1),
                    resourceId : 'r1'
                }
            ]
        });

        scheduler.zoomToFit();
    });

    t.it('Should zoom on CTRL + mousewheel sanity checks', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate  : new Date(2018, 1, 7, 7),
            endDate    : new Date(2018, 1, 8),
            viewPreset : 'hourAndDay',
            height     : 300
        });

        const originalZoomLevel = scheduler.zoomLevel;

        t.firesOnce(scheduler.timeAxisViewModel, 'update');

        t.wheel('.b-timeline-subgrid', function() {
            t.expect(scheduler.zoomLevel).toBe(originalZoomLevel - 1);
        }, t, {
            deltaY  : 1000,
            ctrlKey : true
        });
    });

    t.it('Should sync scrollers on zoom', async t => {
        scheduler = t.getScheduler();

        function assertScrollers() {
            const { normal } = scheduler.subGrids;

            t.is(normal.header.scrollable.x, normal.scrollable.x, 'Header scrollable is synced');
            t.is(normal.fakeScroller.x, normal.scrollable.x, 'Fake scrollable is synced');
        }

        scheduler.zoomIn();

        await scheduler.rowManager.await('renderDone');

        assertScrollers();

        // Wait for a timeout to make sure every delayed listener is invoked
        await new Promise(resolve => setTimeout(resolve, 500));

        t.diag('Assert scrollers after delay');

        assertScrollers();
    });

    t.it('Should return zoom level', async t => {
        scheduler = t.getScheduler();

        await t.waitForSelector('.b-sch-event');

        const { zoomLevel } = scheduler;

        const newLevel = scheduler.zoomIn();

        t.is(newLevel, zoomLevel + 1, 'New level is ok');
    });

    t.it('Should keep visible date range during zooming', async t => {
        scheduler = await t.getSchedulerAsync();

        const { visibleDateRange } = scheduler;

        scheduler.zoomIn();

        t.isDeeply(scheduler.visibleDateRange, visibleDateRange, 'Visible date range should remain intact right after zoom');

        await t.waitForEvent(scheduler, 'horizontalScroll');

        t.isGreater(scheduler.visibleDateRange.startDate, visibleDateRange.startDate, 'Start date changed');
        t.isLess(scheduler.visibleDateRange.endDate, visibleDateRange.endDate, 'End date changed');
    });

    // https://github.com/bryntum/support/issues/3763
    t.it('Should only fire one loadDateRange event on viewpreset change', async t => {
        const
            rnd       = new RandomGenerator(),
            // Import should always match class name, otherwise transpiled demos could not import the class
            DH        = DateHelper,
            today     = DH.clearTime(new Date()),
            startDate = DH.add(today, -6, 'month'),
            endDate   = DH.add(startDate, 1, 'year'),
            todayAt12 = DH.set(new Date(today), 'hour', 12);

        function generateEvents() {
            const result  = [];

            // Loop through every day for a year surrounding today.
            for (let eventId = 1, date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
                // Create 10 events at random times for random resources every day
                for (let i = 0; i < 10; i++) {
                    result.push({
                        id           : eventId++,
                        name         : `Event ${eventId}`,
                        resourceId   : `r${i + 1}`,
                        startDate    : new Date(date.getFullYear(), date.getMonth(), date.getDate(), rnd.nextRandom(20)),
                        duration     : rnd.nextRandom(4) + 1,
                        durationUnit : 'hour'
                    });
                }
            }

            return result;
        }

        const
            resources = [
                { id : 'r1', name : 'Mike', eventColor : 'red' },
                { id : 'r2', name : 'Linda', eventColor : 'indigo' },
                { id : 'r3', name : 'Don', eventColor : 'lime' },
                { id : 'r4', name : 'Karen', eventColor : 'orange' },
                { id : 'r5', name : 'Doug', eventColor : 'teal' },
                { id : 'r6', name : 'Peter', eventColor : 'purple' },
                { id : 'r7', name : 'Sam', eventColor : 'yellow' },
                { id : 'r8', name : 'Melissa', eventColor : 'green' },
                { id : 'r9', name : 'John', eventColor : 'amber' },
                { id : 'r10', name : 'Ellen', eventColor : 'blue' }
            ],
            events = generateEvents();

        let loadDateRangeCount = 0;

        scheduler = await t.getScheduler({
            viewPreset     : 'hourAndDay',
            width          : 970,
            infiniteScroll : true,

            resources,
            events,

            // Start with today's date dead centre in the view
            visibleDate : {
                date  : todayAt12,
                block : 'center'
            }
        });
        scheduler.eventStore.on({
            loadDateRange : () => loadDateRangeCount++
        });

        let scrollWidth = scheduler.timelineScroller.scrollWidth;

        scheduler.zoomIn();

        // We need to wait for the bug condition which was more asynchronous loadDateRange events
        // arriving in an async timeframe.
        await t.waitFor(100);

        t.is(loadDateRangeCount, 1);

        // Scroll range may vary a little due to floor/ceil of end points to different tick bounds.
        t.isApprox(scheduler.timelineScroller.scrollWidth, scrollWidth, 100);
        scrollWidth = scheduler.timelineScroller.scrollWidth;

        scheduler.zoomIn();

        // We need to wait for the bug condition which was more asynchronous loadDateRange events
        // arriving in an async timeframe.
        await t.waitFor(100);

        t.is(loadDateRangeCount, 2);

        // Scroll range may vary a little due to floor/ceil of end points to different tick bounds.
        t.isApprox(scheduler.timelineScroller.scrollWidth, scrollWidth, 100);
        scrollWidth = scheduler.timelineScroller.scrollWidth;

        scheduler.zoomIn();

        // We need to wait for the bug condition which was more asynchronous loadDateRange events
        // arriving in an async timeframe.
        await t.waitFor(100);

        t.is(loadDateRangeCount, 3);

        // Scroll range may vary a little due to floor/ceil of end points to different tick bounds.
        t.isApprox(scheduler.timelineScroller.scrollWidth, scrollWidth, 100);
        scrollWidth = scheduler.timelineScroller.scrollWidth;

        scheduler.zoomIn();

        // We need to wait for the bug condition which was more asynchronous loadDateRange events
        // arriving in an async timeframe.
        await t.waitFor(100);

        t.is(loadDateRangeCount, 4);

        // Scroll range may vary a little due to floor/ceil of end points to different tick bounds.
        t.isApprox(scheduler.timelineScroller.scrollWidth, scrollWidth, 100);
        scrollWidth = scheduler.timelineScroller.scrollWidth;

        scheduler.zoomIn();

        // We need to wait for the bug condition which was more asynchronous loadDateRange events
        // arriving in an async timeframe.
        await t.waitFor(100);

        t.is(loadDateRangeCount, 5);

        // Scroll range may vary a little due to floor/ceil of end points to different tick bounds.
        t.isApprox(scheduler.timelineScroller.scrollWidth, scrollWidth, 100);
        scrollWidth = scheduler.timelineScroller.scrollWidth;

        scheduler.zoomOut();

        // We need to wait for the bug condition which was more asynchronous loadDateRange events
        // arriving in an async timeframe.
        await t.waitFor(100);

        t.is(loadDateRangeCount, 6);

        // Scroll range may vary a little due to floor/ceil of end points to different tick bounds.
        t.isApprox(scheduler.timelineScroller.scrollWidth, scrollWidth, 100);
        scrollWidth = scheduler.timelineScroller.scrollWidth;

        scheduler.zoomOut();

        // We need to wait for the bug condition which was more asynchronous loadDateRange events
        // arriving in an async timeframe.
        await t.waitFor(100);

        t.is(loadDateRangeCount, 7);

        // Scroll range may vary a little due to floor/ceil of end points to different tick bounds.
        t.isApprox(scheduler.timelineScroller.scrollWidth, scrollWidth, 100);
        scrollWidth = scheduler.timelineScroller.scrollWidth;

        scheduler.zoomOut();

        // We need to wait for the bug condition which was more asynchronous loadDateRange events
        // arriving in an async timeframe.
        await t.waitFor(100);

        t.is(loadDateRangeCount, 8);

        // Scroll range may vary a little due to floor/ceil of end points to different tick bounds.
        t.isApprox(scheduler.timelineScroller.scrollWidth, scrollWidth, 100);
        scrollWidth = scheduler.timelineScroller.scrollWidth;

        scheduler.zoomOut();

        // We need to wait for the bug condition which was more asynchronous loadDateRange events
        // arriving in an async timeframe.
        await t.waitFor(100);

        t.is(loadDateRangeCount, 9);

        // Scroll range may vary a little due to floor/ceil of end points to different tick bounds.
        t.isApprox(scheduler.timelineScroller.scrollWidth, scrollWidth, 100);
        scrollWidth = scheduler.timelineScroller.scrollWidth;

        scheduler.zoomOut();

        // We need to wait for the bug condition which was more asynchronous loadDateRange events
        // arriving in an async timeframe.
        await t.waitFor(100);

        t.is(loadDateRangeCount, 10);
    });
});
