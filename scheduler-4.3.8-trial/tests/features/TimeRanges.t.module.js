import { Scheduler, TimeSpan, DateHelper, Store, RecurringTimeSpansMixin, RecurringTimeSpan } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler,
        rangeStore;

    const createScheduler = async t => {
        scheduler = await t.getSchedulerAsync({
            startDate  : new Date(2018, 1, 7, 7),
            endDate    : new Date(2018, 1, 8),
            viewPreset : 'hourAndDay',
            height     : 300,
            features   : {
                timeRanges : {
                    enableResizing      : true,
                    showCurrentTimeLine : true,
                    showHeaderElements  : true,
                    store               : {
                        modelClass : TimeSpan,
                        data       : [
                            {
                                id        : 'lunch',
                                name      : 'Lunch o´ clock',
                                startDate : new Date(2018, 1, 7, 11),
                                endDate   : new Date(2018, 1, 7, 12),
                                cls       : 'custom'
                            },
                            {
                                id        : 'line',
                                name      : 'Important time',
                                startDate : new Date(2018, 1, 7, 13, 30),
                                style     : 'color: red'
                            }
                        ]
                    }
                }
            }
        });

        rangeStore = scheduler.features.timeRanges.store;
    };

    t.beforeEach(() => scheduler?.destroy?.());

    t.it('Rendering sanity checks', async t => {
        await createScheduler(t);
        t.selectorExists('.b-sch-timeaxiscolumn-levels-2', 'Always outputting the correct number of header levels on header container element');

        t.chain(
            { waitForSelector : '.b-grid-headers .b-sch-timerange.b-sch-range', desc : 'Should find range element in header' },
            { waitForSelector : '.b-sch-timerange.b-sch-range:contains(Lunch)', desc : 'Should find range element in body' },
            { waitForSelector : '.b-grid-headers .b-sch-timerange.b-sch-range', desc : 'Should find line element in header' },
            { waitForSelector : '.b-grid-subgrid-normal .b-sch-timerange.b-sch-line', desc : 'Should find line element in body' },
            () => {
                t.selectorExists('.b-sch-range.custom', 'Custom CSS applied');
                t.is(document.querySelector('.b-sch-foreground-canvas .b-sch-line').style.color, 'red', 'Custom style applied');
            }
        );
    });

    t.it('Should render current timeline', async t => {
        await createScheduler(t);
        t.selectorExists('.b-sch-timeaxiscolumn-levels-2', 'Always outputting the correct number of header levels on header container element');

        scheduler.setTimeSpan(new Date());

        t.selectorExists('.b-grid-headers .b-sch-timerange.b-sch-current-time', 'Should find current timeline in header');
        t.selectorExists('.b-grid-subgrid-normal .b-sch-timerange.b-sch-current-time', 'Should find current timeline in body');

        scheduler.timeAxis.setTimeSpan(new Date(2016, 1, 1), new Date(2016, 1, 2));

        t.selectorNotExists('.b-grid-headers .b-sch-timerange.b-sch-current-time', 'Should NOT find current timeline in header');
        t.selectorNotExists('.b-grid-subgrid-normal .b-sch-timerange.b-sch-current-time', 'Should NOT find current timeline in body');

        scheduler.setTimeSpan(new Date());

        t.selectorExists('.b-grid-headers .b-sch-timerange.b-sch-current-time', 'Should find current timeline in header');
        t.selectorExists('.b-grid-subgrid-normal .b-sch-timerange.b-sch-current-time', 'Should find current timeline in body');

        scheduler.features.timeRanges.showCurrentTimeLine = false;

        t.selectorNotExists('.b-grid-headers .b-sch-timerange.b-sch-current-time', 'Should not find current timeline in header');
        t.selectorNotExists('.b-grid-subgrid-normal .b-sch-timerange.b-sch-current-time', 'Should not find current timeline in body');

        scheduler.features.timeRanges.showCurrentTimeLine = true;

        t.selectorExists('.b-grid-headers .b-sch-timerange.b-sch-current-time', 'Should find current timeline in header');
        t.selectorExists('.b-grid-subgrid-normal .b-sch-timerange.b-sch-current-time', 'Should find current timeline in body');
    });

    t.it('Should be able to resize range elements in the header', async t => {
        await createScheduler(t);

        t.isApprox(document.querySelector('.b-grid-subgrid .b-sch-range').offsetHeight, document.querySelector('.b-grid-subgrid').offsetHeight, 'range has height');
        t.is(document.querySelector('.b-grid-subgrid .b-sch-range').offsetWidth, scheduler.timeAxisViewModel.tickSize, 'range sized ok');

        t.is(document.querySelector('.b-grid-headers .b-sch-range').offsetWidth, scheduler.timeAxisViewModel.tickSize, 'range sized ok');

        t.chain(
            { drag : '.b-sch-range', fromOffset : [2, '50%'], by : [20, 0], dragOnly : true },
            { waitForSelector : '.b-tooltip:contains(Lunch)' },
            { waitForSelector : '.b-tooltip .b-sch-clock' },
            { type : '[ESCAPE]' },

            { drag : '.b-sch-range', fromOffset : [2, '50%'], by : [-scheduler.timeAxisViewModel.tickSize, 0] },

            (next) => {
                t.expect(rangeStore.getById('lunch').startDate).toEqual(new Date(2018, 1, 7, 10));
                t.expect(rangeStore.getById('lunch').endDate).toEqual(new Date(2018, 1, 7, 12));

                next();
            },

            { drag : '.b-sch-range', fromOffset : ['100%-2', '50%'], by : [scheduler.timeAxisViewModel.tickSize, 0] },

            (next) => {
                t.expect(rangeStore.getById('lunch').startDate).toEqual(new Date(2018, 1, 7, 10));
                t.expect(rangeStore.getById('lunch').endDate).toEqual(new Date(2018, 1, 7, 13));
            }
        );
    });

    t.it('Should be able to resize range elements in the header', async t => {
        await createScheduler(t);

        t.isApprox(document.querySelector('.b-grid-subgrid .b-sch-range').offsetHeight, document.querySelector('.b-grid-subgrid').offsetHeight, 'range has height');

        t.chain(
            { drag : '.b-sch-range', fromOffset : [2, '50%'], by : [20, 0], dragOnly : true },
            { type : '[ESCAPE]' },

            () => {
                t.is(document.querySelector('.b-grid-subgrid .b-sch-range').offsetWidth, scheduler.timeAxisViewModel.tickSize, 'range sized ok after aborted resize');
                t.is(document.querySelector('.b-grid-headers .b-sch-range').offsetWidth, scheduler.timeAxisViewModel.tickSize, 'range sized ok after aborted resize');
            }
        );
    });

    t.it('Should be able to drag range elements in the header', async t => {
        await createScheduler(t);

        t.selectorExists('.b-sch-timeaxiscolumn-levels-2', 'Always outputting the correct number of header levels on header container element');

        t.chain(
            { drag : '.b-sch-range', by : [50, 0], dragOnly : true },
            { waitForSelector : '.b-tooltip:contains(Lunch)' },
            { waitForSelector : '.b-tooltip .b-sch-clock' },
            { type : '[ESCAPE]' },

            (next) => {
                t.is(document.querySelector('.b-grid-subgrid .b-sch-range').offsetWidth, scheduler.timeAxisViewModel.tickSize, 'range sized ok after aborted resize');
                t.is(document.querySelector('.b-grid-headers .b-sch-range').offsetWidth, scheduler.timeAxisViewModel.tickSize, 'range sized ok after aborted resize');

                next();
            },

            // Should be valid if dragging below header
            { drag : '.b-sch-range', by : [-scheduler.timeAxisViewModel.tickSize, 100], dragOnly : true },

            next => {
                t.selectorExists('.b-scheduler.b-dragging-timerange', 'Scheduler styled for drag');
                next();
            },

            { mouseUp : null },

            () => {
                t.selectorNotExists('.b-scheduler.b-dragging-timerange', 'Scheduler no longer styled for drag');
                t.expect(rangeStore.getById('lunch').startDate).toEqual(new Date(2018, 1, 7, 10));
                t.expect(rangeStore.getById('lunch').endDate).toEqual(new Date(2018, 1, 7, 11));
            }
        );
    });

    t.it('Dragging should be constrained to within the time axis', async t => {
        await createScheduler(t);

        const
            lunch         = rangeStore.getById('lunch'),
            lunchDuration = lunch.durationMS;

        t.selectorExists('.b-sch-timeaxiscolumn-levels-2', 'Always outputting the correct number of header levels on header container element');

        await t.dragBy('.b-sch-range', [-4.4 * scheduler.timeAxisViewModel.tickSize, 0]);

        // It's been successfully constrained to within the time axis and is the same duration
        t.expect(lunch.startDate).toEqual(scheduler.timeAxis.startDate);
        t.expect(lunch.durationMS).toEqual(lunchDuration);
    });

    t.it('Should be able to drag drop line element in the header', async t => {
        await createScheduler(t);

        t.selectorExists('.b-sch-timeaxiscolumn-levels-2', 'Always outputting the correct number of header levels on header container element');

        t.chain(
            { drag : '.b-sch-line', by : [-scheduler.timeAxisViewModel.tickSize, 0] },

            next => {
                t.expect(rangeStore.getById('line').startDate).toEqual(new Date(2018, 1, 7, 12, 30));
                t.notOk(rangeStore.getById('line').endDate);

                next();
            },

            { drag : '.b-sch-line', by : [scheduler.timeAxisViewModel.tickSize, 0] },

            () => {
                t.expect(rangeStore.getById('line').startDate).toEqual(new Date(2018, 1, 7, 13, 30));
                t.notOk(rangeStore.getById('line').endDate);
            }
        );
    });

    t.it('Should treat resizing to 0 width as invalid', async t => {
        await createScheduler(t);

        t.wontFire(rangeStore, 'change');
        t.selectorExists('.b-sch-timeaxiscolumn-levels-2', 'Always outputting the correct number of header levels on header container element');

        t.chain(
            { drag : '.b-sch-range', fromOffset : [2, '50%'], by : [200, 0] },
            { drag : '.b-sch-range', fromOffset : ['100%-2', '50%'], by : [-200, 0] }
        );
    });

    t.it('Should treat dragging straight down as invalid', async t => {
        await createScheduler(t);

        t.wontFire(rangeStore, 'change');
        t.selectorExists('.b-sch-timeaxiscolumn-levels-2', 'Always outputting the correct number of header levels on header container element');

        t.chain(
            { drag : '.b-sch-range', fromOffset : ['100%-2', '50%'], by : [0, 50] },

            (next) => {
                const box = document.querySelector('.b-grid-headers .b-sch-range').getBoundingClientRect();

                t.is(document.querySelector('.b-grid-headers .b-sch-range').offsetWidth, scheduler.timeAxisViewModel.tickSize, 'range still sized ok');
                t.is(box.right - box.left, scheduler.timeAxisViewModel.tickSize, 'range still sized ok');
            }
        );
    });

    t.it('readOnly should prevent resizing', async t => {
        await createScheduler(t);

        scheduler.readOnly = true;
        t.selectorExists('.b-sch-timeaxiscolumn-levels-2', 'Always outputting the correct number of header levels on header container element');

        t.wontFire(rangeStore, 'change');

        t.chain(
            { waitForSelector : '.b-sch-range', fromOffset : [2, '50%'] }
        );
    });

    t.it('configuring timeRanges with a timeRanges block', async t => {
        // This should render and throw no error.
        // https://app.assembla.com/spaces/bryntum/tickets/6756
        scheduler = new Scheduler({
            appendTo : document.body,
            columns  : [{
                text  : 'Staff',
                field : 'name',
                width : 150
            }],
            crudManager : {
                transport : {
                    load : {
                        url : 'about:blank'
                    }
                }
            },
            startDate  : new Date(2017, 1, 7, 8),
            endDate    : new Date(2017, 1, 7, 18),
            viewPreset : 'hourAndDay',
            height     : 300,
            features   : {
                timeRanges : {
                    enableResizing     : true,
                    showHeaderElements : true,
                    timeRanges         : [
                        {
                            name      : 'Lunch o´ clock',
                            startDate : '2017-02-07 11:00',
                            endDate   : '2017-02-07 12:00'
                        }
                    ]
                }
            }
        });

        await t.waitForProjectReady();

        t.selectorExists('.b-sch-timeaxiscolumn-levels-2', 'Always outputting the correct number of header levels on header container element');
    });

    //https://app.assembla.com/spaces/bryntum/tickets/6932/details
    t.it('Should be able to coexist with NonWorkingTime', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate  : new Date(2018, 1, 4),
            endDate    : new Date(2018, 1, 17),
            viewPreset : 'weekAndDayLetter',
            height     : 300,
            features   : {
                timeRanges     : true,
                nonWorkingTime : true
            },
            timeRanges : [
                {
                    id        : 'lunch',
                    name      : 'Long lunch',
                    startDate : '2018-02-07 3:00',
                    endDate   : '2018-02-07 22:00'
                },
                {
                    id        : 'line',
                    name      : 'Important time',
                    startDate : '2018-02-09 13:30'
                }
            ]
        });

        // TODO uncomment when this is fixed https://app.assembla.com/spaces/bryntum/tickets/8413-horizontaltimeaxis-should-not-completely-overwrite-contents-of-column-el/details#
        // t.selectorExists('.b-grid-headers .b-sch-timeaxiscolumn .b-sch-timerange', 'Timeranges rendered into time axis column element');
        t.selectorExists('.b-grid-headers .b-sch-timerange', 'Timeranges rendered into subGrid header element');
        t.selectorCountIs('.b-grid-headers .b-sch-timerange', 5, '2 timeranges rendered in header');
        t.selectorCountIs('.b-grid-subgrid-normal .b-sch-timerange', 5, '3+2 timeranges found');
        t.selectorCountIs('.b-grid-headers .b-sch-nonworkingtime', 3, 'Three nonworkingtimes found in header');
        t.selectorCountIs('.b-grid-subgrid-normal .b-sch-nonworkingtime', 3, 'Three nonworkingtimes found in body');
    });

    t.it('Should use correct time format for current timeline', async t => {
        scheduler = t.getScheduler({
            startDate  : new Date(),
            endDate    : DateHelper.add(new Date(), 1, 'week'),
            viewPreset : 'weekAndDayLetter',
            height     : 300,
            features   : {
                timeRanges : {
                    showCurrentTimeLine : true,
                    showHeaderElements  : true,
                    currentDateFormat   : 'YYYY A'
                }
            },
            events     : [],
            timeRanges : []
        });

        const amPM = new Date().getHours() < 12 ? 'AM' : 'PM';

        t.chain(
            {
                waitForSelector : `.b-grid-headers .b-sch-timerange.b-sch-current-time:textEquals(${new Date().getFullYear()} ${amPM})`,
                desc            : 'Should find current timeline in header'
            },
            async() => {
                t.livesOk(() => {
                    scheduler.features.timeRanges.updateCurrentTimeLine();
                });
            }
        );
    });

    t.it('Should not crash when updating nonrendered timerange', async t => {
        scheduler = t.getScheduler({
            appendTo   : document.body,
            startDate  : new Date(2018, 1, 4),
            endDate    : new Date(2018, 1, 17),
            viewPreset : 'weekAndDayLetter',
            height     : 300,
            features   : {
                timeRanges : true
            },
            timeRanges : [
                {
                    id        : 'lunch',
                    startDate : '2028-02-07',
                    endDate   : '2028-02-08'
                },
                {
                    startDate : '2008-02-07',
                    endDate   : '2008-02-08'
                }
            ]
        });

        scheduler.features.timeRanges.store.first.shift(1);
        scheduler.features.timeRanges.store.last.shift(1);
    });

    t.it('Should not crash when updating timerange to no longer be rendered', async t => {
        scheduler = t.getScheduler({
            appendTo   : document.body,
            startDate  : new Date(2018, 1, 4),
            endDate    : new Date(2018, 1, 17),
            viewPreset : 'weekAndDayLetter',
            height     : 300,
            features   : {
                timeRanges : true
            },
            timeRanges : [
                {
                    id        : 'lunch',
                    startDate : '2018-02-07',
                    endDate   : '2018-02-08'
                }
            ]
        });

        t.selectorExists('.b-grid-subgrid-normal .b-sch-timerange', 'Should find range');

        scheduler.features.timeRanges.store.first.shift(100, 'y');

        t.chain(
            { waitForSelectorNotFound : '.b-grid-subgrid-normal .b-sch-timerange', desc : 'Should NOT find updated range' }
        );
    });

    t.it('Should not crash if timeRange lacks start or end date', async t => {
        scheduler = t.getScheduler({
            appendTo  : document.body,
            startDate : new Date(2018, 1, 4),
            endDate   : new Date(2018, 1, 17),
            features  : {
                timeRanges : true
            },
            timeRanges : [
                {
                    id : 'lunch'
                }
            ]
        });

        t.selectorNotExists('.b-grid-headers .b-sch-timerange', 'Should NOT find time range in header');
        t.selectorNotExists('.b-grid-subgrid-normal .b-sch-timerange', 'Should NOT find time range in body');
    });

    t.it('Should render a line if timeRange start === end date', async t => {
        scheduler = t.getScheduler({
            appendTo  : document.body,
            startDate : new Date(2018, 1, 4),
            endDate   : new Date(2018, 1, 17),
            features  : {
                timeRanges : {
                    showHeaderElements : true
                }
            },
            timeRanges : [
                {
                    name      : 'foo',
                    startDate : new Date(2018, 1, 5),
                    endDate   : new Date(2018, 1, 5)
                }
            ]
        });

        t.selectorExists('.b-grid-headers .b-sch-timerange.b-sch-line', 'Should find time range in header');
        t.selectorExists('.b-grid-subgrid-normal .b-sch-timerange.b-sch-line', 'Should find time range in body');
    });

    t.it('Should show current timeline header element at render time', async t => {
        scheduler = t.getScheduler({
            appendTo  : document.body,
            startDate : DateHelper.add(new Date(), -1, 'week'),
            endDate   : DateHelper.add(new Date(), 1, 'week'),
            features  : {
                timeRanges : {
                    showCurrentTimeLine : true,
                    showHeaderElements  : true
                }
            },
            timeRanges : [
                {
                    name      : 'foo',
                    startDate : new Date(2018, 1, 5),
                    endDate   : new Date(2018, 1, 5)
                }
            ]
        });

        t.selectorExists('.b-grid-headers .b-sch-current-time label:not(:empty)', 'Should find current time line in header');
    });

    t.it('Should expose timeRanges property on CRUD manager', async t => {
        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : '2019-02-07',
            endDate    : '2019-02-08',
            viewPreset : 'hourAndDay',
            features   : {
                timeRanges : {
                    showCurrentTimeLine : true,
                    showHeaderElements  : true
                }
            },
            columns : [
                { field : 'name', text : 'Name', width : 200 }
            ],
            crudManager : {
                autoLoad  : true,
                transport : {
                    load : {
                        url : '../examples/timeranges/data/data.json'
                    }
                }
            }
        });

        t.chain(
            { waitForSelector : '.b-sch-event' },
            next => {
                t.is(scheduler.crudManager.timeRangeStore, scheduler.features.timeRanges.store, 'Time ranges store is exposed');
            }
        );
    });

    t.it('Should expose timeRanges property on Scheduler', async t => {
        scheduler = new Scheduler({
            appendTo  : document.body,
            startDate : '2019-02-07',
            endDate   : '2019-02-08',
            features  : {
                timeRanges : {
                    showCurrentTimeLine : true,
                    showHeaderElements  : true
                }
            },
            columns : [
                { field : 'name', text : 'Name', width : 200 }
            ]
        });

        t.ok(scheduler.timeRanges, 'Time ranges array exposed');

        scheduler.timeRanges = [
            {
                name      : 'foo',
                startDate : new Date(2019, 1, 7),
                duration  : 1
            }
        ];

        t.selectorExists('.b-grid-headers .b-sch-range label:textEquals(foo)', 'timeRanges setter works');
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8762-time-range-elements-are-sized-incorrectly-when-zooming-out/details#
    t.it('Should size elements correctly', async t => {
        scheduler = t.getScheduler({
            startDate  : new Date(2018, 0, 4),
            endDate    : new Date(2018, 2, 17),
            viewPreset : 'weekAndDayLetter',
            height     : 300,
            width      : 500,
            features   : {
                timeRanges : true
            },
            timeRanges : [
                {
                    cls       : 'range',
                    startDate : '2018-02-07',
                    endDate   : '2018-02-08'
                }
            ],
            events : [
                {
                    cls        : 'event',
                    resourceId : 'r1',
                    startDate  : '2018-02-07',
                    endDate    : '2018-02-08'
                }
            ]
        });

        await t.waitForProjectReady();

        scheduler.timeAxisViewModel.tickSize = 5;

        t.is(document.querySelector('.b-grid-headers .range').offsetWidth, document.querySelector(scheduler.unreleasedEventSelector).offsetWidth, 'Header range element sized same as event');
        t.is(document.querySelector('.b-grid-subgrid .range').offsetWidth, document.querySelector(scheduler.unreleasedEventSelector).offsetWidth, 'Body range element sized same as event');
    });

    t.it('Should refresh elements when `include` property changes on Scheduler timeaxis', async t => {
        scheduler = t.getScheduler({
            startDate  : new Date(2018, 6, 8),
            endDate    : new Date(2018, 6, 15),
            viewPreset : 'weekAndDayLetter',
            height     : 300,
            width      : 500,
            features   : {
                timeRanges : true
            },
            timeRanges : [
                {
                    cls       : 'range',
                    startDate : '2018-07-14',
                    endDate   : '2018-07-15'
                }
            ],
            workingTime : {
                fromDay  : 1,
                toDay    : 6,
                fromHour : 8,
                toHour   : 17
            },
            events : [
            ]
        });

        await t.waitForProjectReady();

        t.selectorNotExists('.range', 'Time range not rendered');

        scheduler.workingTime = null;

        t.selectorExists('.range', 'Time range rendered');
    });

    // VERTICAL MODE
    t.it('VERTICAL: Should be able to drag range elements in the header', async t => {
        scheduler = t.getScheduler({
            startDate  : new Date(2018, 1, 7, 7),
            endDate    : new Date(2018, 1, 8),
            viewPreset : 'hourAndDay',
            mode       : 'vertical',
            features   : {
                timeRanges : {
                    enableResizing      : true,
                    showCurrentTimeLine : true,
                    showHeaderElements  : true,
                    store               : {
                        modelClass : TimeSpan,
                        data       : [
                            {
                                id        : 'lunch',
                                name      : 'Lunch o´ clock',
                                startDate : '2018-02-07 11:00',
                                endDate   : '2018-02-07 12:00',
                                cls       : 'custom'
                            }
                        ]
                    }
                }
            }
        });

        await t.waitForProjectReady();

        rangeStore = scheduler.features.timeRanges.store;

        t.chain(
            { drag : '.b-sch-range', by : [0, scheduler.timeAxisViewModel.tickSize] },

            () => {
                t.expect(rangeStore.getById('lunch').startDate).toEqual(new Date(2018, 1, 7, 12));
                t.expect(rangeStore.getById('lunch').endDate).toEqual(new Date(2018, 1, 7, 13));
            }
        );
    });
    // EOF VERTICAL MODE

    t.it('Labels and lines should be synchronized after scroll', async t => {
        await createScheduler(t);

        t.chain(
            { waitForSelector : '.b-sch-timerange' },
            async() => {
                await scheduler.scrollTo(100);

                const
                    rangeHeaderEl = document.querySelector('.b-grid-header-container .b-sch-range'),
                    rangeEl       = document.querySelector('.b-sch-foreground-canvas .b-sch-range'),
                    lineHeaderEl  = document.querySelector('.b-grid-header-container .b-sch-line'),
                    lineEl        = document.querySelector('.b-sch-foreground-canvas .b-sch-line');

                t.is(rangeHeaderEl.getBoundingClientRect().left, rangeEl.getBoundingClientRect().left,
                    'Range header and element are synced');
                t.is(lineHeaderEl.getBoundingClientRect().left, lineEl.getBoundingClientRect().left,
                    'Line header and element are synced');
            }
        );
    });

    t.it('Should reuse time range element', async t => {
        await createScheduler(t);

        const
            range   = scheduler.features.timeRanges.store.getById('lunch'),
            element = document.querySelector('[data-id="lunch"]'),
            width   = element.offsetWidth;

        range.id = 'foo';

        t.is(scheduler.features.timeRanges.getElementsByRecord(range).headerElement, element, 'Element is reused');
        t.selectorCountIs('.b-grid-headers .b-timerange-TimeRanges', 2, 'Two time ranges element in DOM');

        range.endDate = new Date(2018, 1, 7, 13);

        t.waitFor(
            () => element.offsetWidth === width * 2,
            () => {
                t.is(scheduler.features.timeRanges.getElementsByRecord(range).headerElement, element, 'Element is reused');
                t.selectorCountIs('.b-grid-headers .b-timerange-TimeRanges', 2, 'Two time ranges element in DOM');
            }
        );
    });

    t.it('Should support disabling', async t => {
        await createScheduler(t);

        scheduler.features.timeRanges.disabled = true;

        t.selectorNotExists('.b-sch-timerange');

        scheduler.features.timeRanges.disabled = false;

        t.selectorExists('.b-sch-timerange');
    });

    t.it('Should work with hideHeaders set to `true`', async t => {
        scheduler = t.getScheduler({
            startDate   : new Date(2018, 1, 7, 7),
            endDate     : new Date(2018, 1, 8),
            viewPreset  : 'hourAndDay',
            height      : 300,
            hideHeaders : true,
            features    : {
                timeRanges : {
                    enableResizing      : true,
                    showCurrentTimeLine : true,
                    showHeaderElements  : true,
                    store               : {
                        modelClass : TimeSpan,
                        data       : [
                            {
                                id        : 'lunch',
                                name      : 'Lunch o´ clock',
                                startDate : '2018-02-07 11:00',
                                endDate   : '2018-02-07 12:00',
                                cls       : 'custom'
                            }
                        ]
                    }
                }
            }
        });

        await t.waitForProjectReady();

        t.selectorNotExists('.b-grid-headers .b-sch-timerange');
    });

    t.it('Should refresh elements when store is batched', async t => {
        await createScheduler(t);

        scheduler.timeRanges = [];

        const store = scheduler.features.timeRanges.store;

        store.beginBatch();
        store.add({
            cls       : 'range',
            startDate : scheduler.startDate,
            endDate   : scheduler.endDate
        });
        store.endBatch();

        t.selectorExists('.range', 'Time range rendered');
    });

    // https://github.com/bryntum/support/issues/1398
    t.it('Should not throw exception when update current timeline if scheduler is hidden', async t => {
        scheduler = await t.getSchedulerAsync({
            eventStore : {
                data : [
                    {
                        id         : 'e1',
                        resourceId : 'r1',
                        startDate  : new Date(),
                        endDate    : new Date()
                    }
                ]
            },
            resourceStore : {
                data : [
                    {
                        id   : 'r1',
                        name : 'Mike'
                    }
                ]
            },
            features : {
                timeRanges : {
                    enableResizing      : true,
                    showCurrentTimeLine : true,
                    showHeaderElements  : true
                }
            },
            startDate : new Date(), // replace with current date to timeline be current
            endDate   : new Date(), // replace with current date to timeline be current
            hidden    : true // simulate it hidden in a tab or a hidden card
        });

        // call to check if will be exception
        scheduler.features.timeRanges.updateCurrentTimeLine();

        // if not exception on call above, show scheduler again to then check if timeline will be visible
        scheduler.hidden = false;

        t.chain(
            { waitForElementVisible : '[data-event-id="e1"]' },
            { waitForSelector : '.b-sch-timerange.b-sch-current-time', desc : 'Scheduler with current timeline is visible' }
        );
    });

    t.it('Should not render label elements unless a name or icon is set', async t => {
        scheduler = t.getScheduler({
            startDate  : new Date(2018, 1, 7, 7),
            endDate    : new Date(2018, 1, 8),
            viewPreset : 'hourAndDay',
            features   : {
                timeRanges : {
                    showCurrentTimeLine : true,
                    showHeaderElements  : false,
                    store               : {
                        modelClass : TimeSpan,
                        data       : [
                            {
                                id        : 1,
                                startDate : '2018-02-07 11:00',
                                endDate   : '2018-02-07 12:00'
                            }
                        ]
                    }
                }
            }
        });

        t.selectorNotExists('.b-sch-range label', 'No range label rendered');
    });

    t.it('Should handle scheduler headers hidden', async t => {
        scheduler = t.getScheduler({
            hideHeaders : true,
            startDate   : new Date(),
            endDate     : new Date(),
            features    : {
                timeRanges : {
                    currentTimeLineUpdateInterval : 10,
                    showCurrentTimeLine           : true
                }
            }
        });

        const date = scheduler.features.timeRanges.currentTimeLine.startDate;

        t.selectorExists('.b-grid-subgrid-normal .b-sch-timerange.b-sch-current-time', 'Should find current timeline in body');

        t.waitFor(() => scheduler.features.timeRanges.currentTimeLine.startDate - date > 50);
    });

    t.it('Should work when scheduler is partnered with another scheduler, using its timeAxisViewModel', async t => {
        await createScheduler(t);

        const scheduler2 = t.getScheduler({
            id       : 'scheduler2',
            height   : 300,
            features : {
                timeRanges : {
                    showCurrentTimeLine : true
                }
            }
        });

        scheduler.startDate = new Date();
        scheduler2.partner  = scheduler;

        await t.waitForSelector('.b-grid-header .b-sch-timerange[data-id=currentTime]');
        t.selectorCountIs('.b-grid-header .b-sch-timerange[data-id=currentTime]', 2);

        scheduler2.destroy();
    });

    // https://github.com/bryntum/support/issues/3194
    t.it('Should show tooltip when hovering a time range header element', async t => {
        let callCount = 0;

        scheduler = await t.getSchedulerAsync({
            startDate  : new Date(2018, 1, 7, 7),
            endDate    : new Date(2018, 1, 8),
            viewPreset : 'hourAndDay',
            height     : 300,
            features   : {
                timeRanges : {
                    enableResizing      : true,
                    showCurrentTimeLine : true,
                    showHeaderElements  : true,
                    tooltipTemplate({ timeRange }) {
                        callCount++;
                        return timeRange.name;
                    },
                    store : {
                        modelClass : TimeSpan,
                        data       : [
                            {
                                id        : 'lunch',
                                name      : 'Lunch',
                                startDate : '2018-02-07 11:00',
                                endDate   : '2018-02-07 12:00',
                                cls       : 'custom'
                            }
                        ]
                    }
                }
            }
        });

        await t.moveCursorTo('.b-grid-header .b-sch-timerange');
        await t.waitForSelector('.b-tooltip:contains(Lunch)');
        t.is(callCount, 1, '1 call to tooltipTemplate');
    });

    t.it('Should not retain store when changing project', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                timeRanges : true
            },

            project : {
                timeRangesData : [
                    {
                        id        : 'afk',
                        name      : 'Afk',
                        startDate : '2011-01-07',
                        endDate   : '2011-01-08',
                        cls       : 'custom1'
                    }
                ]
            }
        });

        t.selectorExists('.custom1', 'Time range found');

        scheduler.project = {
            timeRangesData : [
                {
                    id        : 'afk2',
                    name      : 'Afk2',
                    startDate : '2011-01-09',
                    endDate   : '2011-01-10',
                    cls       : 'custom2'
                }
            ]
        };

        await scheduler.project.commitAsync();

        t.selectorNotExists('.custom1', 'Old time range not found');
        t.selectorExists('.custom2', 'New rime range found');

    });

    // https://github.com/bryntum/support/issues/2521
    t.it('Should be able to set timeRangeStore at runtime', async t => {
        const
            ranges1 = [
                { id : 1, name : 'Range 1-1', startDate : '2021-08-25 08:30', endDate : '2021-08-25 11:30', cls : 'time-range-1-1' },
                { id : 2, name : 'Range 1-2', startDate : '2021-08-25 12:30', endDate : '2021-08-25 15:30', cls : 'time-range-1-2' }
            ],
            ranges2 = [
                { id : 1, name : 'Range 2-1', startDate : '2021-08-25 06:30', endDate : '2021-08-25 10:30', cls : 'time-range-2-1' },
                { id : 3, name : 'Range 2-3', startDate : '2021-08-25 14:30', endDate : '2021-08-25 18:30', cls : 'time-range-2-3' }
            ];

        scheduler = await t.getSchedulerAsync({
            startDate  : new Date(2021, 7, 25, 8),
            endDate    : new Date(2021, 7, 25, 22),
            timeRanges : ranges1,
            features   : {
                timeRanges : true
            }
        });

        // Check initial time ranges
        await t.waitForSelector('.b-sch-range.time-range-1-1');
        t.selectorExists('.b-sch-range.time-range-1-2');

        // New store instance
        scheduler.timeRangeStore = new Store({
            modelClass : TimeSpan,
            data       : ranges2
        });

        await t.waitForSelectorNotFound('.b-sch-range.time-range-1-1');
        t.selectorNotExists('.b-sch-range.time-range-1-2');
        t.selectorExists('.b-sch-range.time-range-2-1');
        t.selectorExists('.b-sch-range.time-range-2-3');

        // New store config object
        scheduler.timeRangeStore = {
            modelClass : TimeSpan,
            data       : ranges1
        };

        await t.waitForSelectorNotFound('.b-sch-range.time-range-2-1');
        t.selectorNotExists('.b-sch-range.time-range-2-3');
        t.selectorExists('.b-sch-range.time-range-1-1');
        t.selectorExists('.b-sch-range.time-range-1-2');

    });

    // https://github.com/bryntum/support/issues/3370
    t.it('Should not lag when zooming out with recurring timeRanges', async t => {

        // Snoozing test until we have a better solution for checking performance
        if (new Date() < new Date(2022, 6, 1)) {
            return;
        }

        const timeRanges = [];
        for (let j = 1; j < 10; j++) {
            for (let i = 10; i < 15; i++) {
                timeRanges.push({
                    id             : 2 + 50 + '' + i + (j * 10),
                    name           : 'Morning coffee' + j,
                    recurrenceRule : 'FREQ=WEEKLY;BYDAY=MO;',
                    startDate      : `2019-01-01T11:${i}`
                });
            }
        }

        class MyTimeRange extends RecurringTimeSpan(TimeSpan) {}
        class MyTimeRangeStore extends RecurringTimeSpansMixin(Store) {
            static get defaultConfig() {
                return {
                    // use our new MyTimeRange model
                    modelClass : MyTimeRange,
                    storeId    : 'timeRanges',
                    data       : timeRanges
                };
            }
        }

        // instantiate store for time ranges using our new classes
        const myTimeRangeStore = new MyTimeRangeStore();

        let now = performance.now();

        scheduler = await t.getSchedulerAsync({
            startDate : new Date(2019, 1, 7, 8),
            endDate   : new Date(2019, 1, 29, 18),
            features  : {
                timeRanges : {
                    showCurrentTimeLine : true,
                    showHeaderElements  : false
                }
            },

            columns : [
                { text : 'Staff', field : 'name', width : '10em' }
            ],

            project : {
                // use our store for time ranges (crudManager will load it automatically among other project stores)
                timeRangeStore : myTimeRangeStore
            },

            viewPreset : {
                tickWidth : 50,
                base      : 'dayAndWeek'
            }
        });

        const createTime = performance.now() - now;

        now = performance.now();

        scheduler.zoomOut();

        const zoomedOutTime = performance.now() - now;

        t.isApprox(createTime, zoomedOutTime, createTime, 'time after zoom out should be approx same as on first scheduler init');

        const beginTime = performance.now();

        scheduler.zoomOut();

        const zoomedOutTime2 = performance.now() - beginTime;

        t.isApprox(zoomedOutTime, zoomedOutTime2, zoomedOutTime, 'time after second zoom out should be approx same as on first zoom out');

        const beginTime1 = performance.now();

        scheduler.zoomOut();

        const zoomedOutTime3 = performance.now() - beginTime1;

        t.isApprox(zoomedOutTime2, zoomedOutTime3, zoomedOutTime2 * 2, 'time after fired zoom out should be approx 2x same as on second zoom out');
    });
});
