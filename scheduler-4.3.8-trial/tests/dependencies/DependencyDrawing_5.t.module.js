
StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler?.destroy();
    });

    t.it('Should not render marker if it does not fit between events (horizontally)', async t => {
        scheduler = await t.getSchedulerAsync({
            events : [
                {
                    id           : 1,
                    name         : 'Event 1',
                    resourceId   : 'r1',
                    startDate    : '2020-03-23 02:00',
                    duration     : 2,
                    durationUnit : 'h'
                },
                {
                    id           : 2,
                    name         : 'Event 2',
                    resourceId   : 'r1',
                    startDate    : '2020-03-23 08:00',
                    duration     : 2,
                    durationUnit : 'h'
                },
                {
                    id           : 3,
                    name         : 'Event 3',
                    resourceId   : 'r2',
                    startDate    : '2020-03-23 02:00',
                    duration     : 2,
                    durationUnit : 'h'
                },
                {
                    id           : 4,
                    name         : 'Event 4',
                    startDate    : '2020-03-23 05:00',
                    resourceId   : 'r2',
                    duration     : 2,
                    durationUnit : 'h'
                },
                {
                    id           : 5,
                    name         : 'Event 5',
                    startDate    : '2020-03-23 09:00',
                    resourceId   : 'r2',
                    duration     : 2,
                    durationUnit : 'h'
                },
                {
                    id           : 6,
                    name         : 'Event 6',
                    startDate    : '2020-03-23 09:00',
                    resourceId   : 'r2',
                    duration     : 2,
                    durationUnit : 'h'
                }
            ],
            dependencies : [
                { id : 1, fromEvent : 1, toEvent : 2 },
                { id : 2, fromEvent : 3, toEvent : 4 },
                { id : 3, fromEvent : 5, toEvent : 6 }
            ],
            features : {
                dependencies : true
            },
            viewPreset : 'hourAndDay',
            startDate  : new Date(2020, 2, 23),
            endDate    : new Date(2020, 2, 24)
        });

        const
            { zoomLevel }  = scheduler,
            targetDeps     = scheduler.dependencyStore.getRange().slice(0, 2),
            dependency3    = scheduler.dependencyStore.getById(3),
            { scrollable } = scheduler.timeAxisSubGrid;

        let scrollStarted = false;

        scrollable.on({
            scrollStart() {
                scrollStarted = true;
            },
            scrollEnd() {
                scrollStarted = false;
            }
        });

        for (let i = 0; i < 5; i++) {
            await t.describe(`Checking zoom level ${zoomLevel - i - 1}`, async t => {
                scheduler.zoomOut();

                if (scrollStarted) {
                    await scrollable.await('scrollEnd', false);
                }

                await scheduler.await('dependenciesDrawn', false);

                targetDeps.forEach(dependency => {
                    const
                        depEl  = document.querySelector(`polyline[depId="${dependency.id}"]`),
                        points = depEl.points,
                        style  = window.getComputedStyle(depEl),
                        box    = t.getSVGBox(depEl);

                    if (box.width < 10) {
                        t.notOk(style.marker.match('arrow'), 'Marker is not defined in "marker" style');
                        t.notOk(style.markerEnd.match('arrow'), 'Marker is not defined in "markerEnd" style');
                        t.notOk(style.markerStart.match('arrow'), 'Marker is not defined in "markerStart" style');
                    }

                    t.is(points.length, 2, 'Line has a single segment');
                    t.assertDependency(scheduler, dependency);
                });

                const
                    depEl = document.querySelector(`polyline[depId="${dependency3.id}"]`),
                    points = depEl.points;

                t.isGreaterOrEqual(
                    points[points.length - 1].x - points[points.length - 2].x,
                    scheduler.features.dependencies.pathFinder.startArrowMargin,
                    'Last line segment is greater than marker size'
                );
            });
        }
    });

    t.it('Should not render marker if it does not fit between events (vertically)', async t => {
        scheduler = await t.getSchedulerAsync({
            events : [
                {
                    id         : 1,
                    name       : 'Event 1',
                    resourceId : 'r1',
                    startDate  : '2020-03-23',
                    duration   : 2
                },
                {
                    id         : 2,
                    name       : 'Event 2',
                    resourceId : 'r2',
                    startDate  : '2020-03-23',
                    duration   : 2
                }
            ],
            dependencies : [
                { id : 1, fromEvent : 1, toEvent : 2, fromSide : 'bottom', toSide : 'top' }
            ],
            features : {
                dependencies : true
            },
            viewPreset : 'weekAndDay',
            startDate  : new Date(2020, 2, 22),
            endDate    : new Date(2020, 2, 29),
            barMargin  : 4
        });

        await t.waitForSelector('.b-sch-dependency');

        const
            dependency = scheduler.dependencyStore.first,
            depEl      = document.querySelector(`polyline[depId="${dependency.id}"]`),
            points     = depEl.points;

        t.is(points.length, 2, 'Line has a single segment');
        t.assertDependency(scheduler, dependency);
    });

    // Inner event element is shorter than wrapper by 1 pixel which is done to visually distinguish event elements
    // packed close in the row. But that also creates a 1px difference between inner event element and wrap element
    t.it('Dependency line should align with inner element', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                dependencies : true
            },
            events : [
                {
                    id         : 1,
                    name       : 'Event 1',
                    resourceId : 'r1',
                    startDate  : '2011-01-04',
                    duration   : 2
                },
                {
                    id         : 2,
                    name       : 'Event 2',
                    resourceId : 'r1',
                    startDate  : '2011-01-07',
                    duration   : 2
                }
            ],
            dependencies : [
                { id : 1, from : 1, to : 2 },
                { id : 2, from : 1, to : 2, fromSide : 'left', toSide : 'bottom' }
            ]
        });

        await t.waitForSelector('.b-sch-dependency');

        const
            [dep1, dep2] = scheduler.dependencyStore.getRange(),
            dep1El       = document.querySelector(`.b-sch-dependency[depId="${dep1.id}"]`),
            dep1Start    = dep1El.points[0],
            dep2El       = document.querySelector(`.b-sch-dependency[depId="${dep2.id}"]`),
            dep2Start    = dep2El.points[0],
            canvasBox    = scheduler.backgroundCanvas.getBoundingClientRect(),
            innerEl      = scheduler.getElementFromEventRecord(scheduler.eventStore.first),
            innerBox     = innerEl.getBoundingClientRect();

        t.isApproxPx(canvasBox.left + parseFloat(dep1Start.x), innerBox.right, 'Dependency 1 line starts from inner element');
        t.isApproxPx(canvasBox.left + parseFloat(dep2Start.x), innerBox.left, 'Dependency 2 line starts from inner element');
    });

    // https://github.com/bryntum/support/issues/3645
    t.it('Should render cached dependencies after zoom in', async t => {
        // Idea of this test case is to render a dependency in the initial view and another one a bit to the right,
        // then scroll to right dependency to force rendering it. Then scroll back and zoom in. Time spans are picked
        // in a specific way that after zooming only first dependency should be redrawn while it is still possible to
        // scroll to the next dependency
        scheduler = await t.getSchedulerAsync({
            enableEventAnimations : false,
            startDate             : '2019-01-06',
            endDate               : '2019-07-10',
            viewPreset            : 'weekAndDayLetter',
            subGridConfigs        : {
                locked : { width : 200 }
            },
            features : {
                dependencies : true
            },
            events : [
                {
                    id         : 1,
                    resourceId : 'r2',
                    name       : 'Event 1',
                    startDate  : '2019-01-13',
                    endDate    : '2019-01-27'
                },
                {
                    id         : 2,
                    resourceId : 'r3',
                    name       : 'Event 2',
                    startDate  : '2019-01-27',
                    endDate    : '2019-02-03'
                },
                {
                    id         : 3,
                    resourceId : 'r2',
                    name       : 'Event 3',
                    startDate  : '2019-03-04',
                    endDate    : '2019-03-06'
                },
                {
                    id         : 4,
                    resourceId : 'r3',
                    name       : 'Event 4',
                    startDate  : '2019-03-06',
                    endDate    : '2019-03-08'
                }
            ],
            dependencies : [
                { id : 1, from : 1, to : 2 },
                { id : 2, from : 3, to : 4 }
            ]
        });

        await t.waitForSelector('.b-sch-dependency');

        // Scroll to the event 3 to trigger dependency rendering
        await scheduler.scrollEventIntoView(scheduler.eventStore.getById(3), { block : 'center' });

        await t.waitForSelector('[depId="2"]');

        // Scroll back to the 0
        await scheduler.scrollHorizontallyTo(0);

        await t.waitForSelector('[depId="1"]');

        await t.waitForEventOnTrigger(scheduler, 'dependenciesdrawn', () => {
            scheduler.zoomIn();
        });

        await t.waitForEvent(scheduler, 'horizontalScroll');

        // Assert first dependency which should be in view because we maintain center date during zoom
        t.assertDependency(scheduler, scheduler.dependencyStore.first);

        // Scroll to the next event, dependency should appear
        await Promise.all([
            scheduler.scrollEventIntoView(scheduler.eventStore.getById(3), { block : 'center' }),
            scheduler.await('dependenciesDrawn', false)
        ]);

        await t.waitForSelector('[depId="2"]');

        t.assertDependency(scheduler, scheduler.dependencyStore.last);
    });
});
