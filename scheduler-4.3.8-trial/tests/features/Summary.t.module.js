
StartTest(t => {
    const mode = t.project.getScriptDescriptor(t).url.includes('horizontal') ? 'horizontal' : 'vertical';

    let scheduler;

    async function createSingleSummary(config, wait = true) {
        scheduler = await t.getSchedulerAsync(Object.assign({
            viewPreset : 'hourAndDay',
            height     : 300,
            mode,
            features   : {
                summary : {
                    renderer : ({ events }) => events.length || ''
                }
            },

            startDate : new Date(2017, 0, 1),
            endDate   : new Date(2017, 0, 1, 8),

            columns : [
                {
                    text            : 'Name',
                    field           : 'name',
                    width           : 200,
                    locked          : true,
                    sum             : 'count',
                    summaryRenderer : ({ sum }) => 'Total: ' + sum
                }
            ],

            resources : [
                { id : 1, name : 'Steve', job : 'Carpenter' },
                { id : 2, name : 'John', job : 'Contractor' }
            ],
            events : [
                {
                    id           : 1,
                    name         : 'Work',
                    resourceId   : 1,
                    startDate    : new Date(2017, 0, 1, 1),
                    endDate      : new Date(2017, 0, 1, 2),
                    durationUnit : 'h'
                },
                {
                    id           : 2,
                    name         : 'Play',
                    resourceId   : 2,
                    startDate    : new Date(2017, 0, 1, 1),
                    endDate      : new Date(2017, 0, 1, 2),
                    durationUnit : 'h'
                },
                {
                    id           : 3,
                    name         : 'Plan',
                    resourceId   : 2,
                    startDate    : new Date(2017, 0, 1, 3),
                    endDate      : new Date(2017, 0, 1, 4),
                    durationUnit : 'h'
                }
            ]
        }, config));

        if (wait) {
            await t.waitForSelector(scheduler.unreleasedEventSelector);
            await t.waitForSelector('.b-sch-summarybar .b-timeaxis-tick');
        }
    }

    async function createMultiSummary() {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'hourAndDay',
            height     : 300,
            mode,
            features   : {
                summary : {
                    summaries : [
                        { label : 'Count', renderer : ({ events }) => events.length || '' },
                        { label : 'Steve', renderer : ({ events }) => events.filter(event => event.resource.name === 'Steve').length || '' }
                    ]

                }
            },

            startDate : new Date(2017, 0, 1),
            endDate   : new Date(2017, 0, 1, 8),

            columns : [
                {
                    text            : 'Name',
                    field           : 'name',
                    width           : 200,
                    locked          : true,
                    sum             : 'count',
                    summaryRenderer : ({ sum }) => 'Total: ' + sum
                }
            ],

            resources : [
                { id : 1, name : 'Steve', job : 'Carpenter' },
                { id : 2, name : 'John', job : 'Contractor' }
            ],
            events : [
                {
                    id         : 1,
                    name       : 'Work',
                    resourceId : 1,
                    startDate  : new Date(2017, 0, 1, 1),
                    endDate    : new Date(2017, 0, 1, 2)
                },
                {
                    id         : 2,
                    name       : 'Play',
                    resourceId : 2,
                    startDate  : new Date(2017, 0, 1, 1),
                    endDate    : new Date(2017, 0, 1, 2)
                },
                {
                    id         : 3,
                    name       : 'Plan',
                    resourceId : 2,
                    startDate  : new Date(2017, 0, 1, 3),
                    endDate    : new Date(2017, 0, 1, 4)
                }
            ]
        });

        await t.waitForSelector(scheduler.unreleasedEventSelector);
        await t.waitForSelector('.b-sch-summarybar .b-timeaxis-tick');
    }

    t.beforeEach(t => scheduler?.destroy());

    t.it('Rendering sanity checks', async t => {
        await createSingleSummary();
        const checker = scheduler.isHorizontal ? 'hasSameWidth' : 'hasSameHeight';

        t.elementIsEmpty('.b-sch-summarybar :nth-child(1)', '');
        t.contentLike('.b-sch-summarybar :nth-child(2) .b-timeaxis-summary-value', /^2$/);
        t.elementIsEmpty('.b-sch-summarybar :nth-child(3)', '');
        t.contentLike('.b-sch-summarybar :nth-child(4) .b-timeaxis-summary-value', /^1$/);
        t.elementIsEmpty('.b-sch-summarybar :nth-child(5)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(6)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(7)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(8)', '');

        t[checker]('.b-sch-summarybar', scheduler.isHorizontal ? '.b-grid-header.b-sch-timeaxiscolumn' : '.b-verticaltimeaxiscolumn', 'footer el sized as header el');
        t[checker]('.b-sch-summarybar :nth-child(1)', '.b-sch-header-row-main .b-sch-header-timeaxis-cell:nth-child(1)');
        t[checker]('.b-sch-summarybar :nth-child(2)', '.b-sch-header-row-main .b-sch-header-timeaxis-cell:nth-child(2)');
        t[checker]('.b-sch-summarybar :nth-child(3)', '.b-sch-header-row-main .b-sch-header-timeaxis-cell:nth-child(3)');
        t[checker]('.b-sch-summarybar :nth-child(4)', '.b-sch-header-row-main .b-sch-header-timeaxis-cell:nth-child(4)');
        t[checker]('.b-sch-summarybar :nth-child(5)', '.b-sch-header-row-main .b-sch-header-timeaxis-cell:nth-child(5)');
        t[checker]('.b-sch-summarybar :nth-child(6)', '.b-sch-header-row-main .b-sch-header-timeaxis-cell:nth-child(6)');
        t[checker]('.b-sch-summarybar :nth-child(7)', '.b-sch-header-row-main .b-sch-header-timeaxis-cell:nth-child(7)');
    });

    t.it('Should refresh once after data set', async t => {
        await createSingleSummary();

        const spy = t.spyOn(scheduler.features.summary, 'updateTimelineSummaries');
        scheduler.events = [];

        await t.waitForProjectReady();

        t.expect(spy).toHaveBeenCalled(1);
    });

    t.it('Should refresh once after event remove', async t => {
        await createSingleSummary();

        const spy = t.spyOn(scheduler.features.summary, 'updateTimelineSummaries');
        scheduler.eventStore.remove(scheduler.eventStore.last);

        await t.waitForProjectReady();

        t.expect(spy).toHaveBeenCalled(1);

        t.elementIsEmpty('.b-sch-summarybar :nth-child(1)', '');
        t.contentLike('.b-sch-summarybar :nth-child(2) .b-timeaxis-summary-value', /^2$/);
        t.elementIsEmpty('.b-sch-summarybar :nth-child(3)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(4)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(5)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(6)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(7)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(8)', '');
    });

    t.it('Should not count event that has no resource in view', async t => {
        await createSingleSummary();

        scheduler.eventStore.last.resourceId = null;

        await t.waitForProjectReady();

        t.elementIsEmpty('.b-sch-summarybar :nth-child(1)', '');
        t.contentLike('.b-sch-summarybar :nth-child(2) .b-timeaxis-summary-value', /^2$/);
        t.elementIsEmpty('.b-sch-summarybar :nth-child(3)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(4)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(5)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(6)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(7)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(8)', '');
    });

    t.it('Should not count filtered out event ', async t => {
        await createSingleSummary();
        scheduler.eventStore.filter(ev => ev.name !== 'Plan');

        t.elementIsEmpty('.b-sch-summarybar :nth-child(1)', '');
        t.contentLike('.b-sch-summarybar :nth-child(2) .b-timeaxis-summary-value', /^2$/);
        t.elementIsEmpty('.b-sch-summarybar :nth-child(3)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(4)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(5)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(6)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(7)', '');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(8)', '');
    });

    t.it('Should calculate events that not fit timeAxis bounds', async t => {
        await createSingleSummary();

        scheduler.eventStore.last.endDate = new Date(2017, 0, 1, 18);
        await scheduler.project.commitAsync();

        t.elementIsEmpty('.b-sch-summarybar :nth-child(1)', 'summary is empty');
        t.contentLike('.b-sch-summarybar :nth-child(2) .b-timeaxis-summary-value', /^2$/, 'summary is correct for regular event');
        t.elementIsEmpty('.b-sch-summarybar :nth-child(3)', 'summary is empty in a cell before very long event');
        t.contentLike('.b-sch-summarybar :nth-child(4) .b-timeaxis-summary-value', /^1$/, 'summary is correct for very long event in a tick 1');
        t.contentLike('.b-sch-summarybar :nth-child(5) .b-timeaxis-summary-value', /^1$/, 'summary is correct for very long event in a tick 2');
        t.contentLike('.b-sch-summarybar :nth-child(6) .b-timeaxis-summary-value', /^1$/, 'summary is correct for very long event in a tick 3');
        t.contentLike('.b-sch-summarybar :nth-child(7) .b-timeaxis-summary-value', /^1$/, 'summary is correct for very long event in a tick 4');
        t.contentLike('.b-sch-summarybar :nth-child(8) .b-timeaxis-summary-value', /^1$/, 'summary is correct for very long event in a tick 5');
    });

    t.it('Should redraw ticks when time axis view model is changed', async t => {
        await createSingleSummary();
        t.selectorCountIs('.b-sch-summarybar .b-timeaxis-tick', 8);

        if (scheduler.isHorizontal) {
            t.is(document.querySelector('.b-sch-summarybar .b-timeaxis-tick').offsetWidth,
                document.querySelector('.b-sch-header-row:last-child .b-sch-header-timeaxis-cell').offsetWidth);
        }
        else {
            t.is(document.querySelector('.b-sch-summarybar .b-timeaxis-tick').offsetHeight,
                document.querySelector('.b-sch-header-row-main .b-sch-header-timeaxis-cell').offsetHeight);
        }

        scheduler.setTimeSpan(new Date(2017, 0, 1, 8), new Date(2017, 0, 1, 18));

        t.selectorCountIs('.b-sch-summarybar .b-timeaxis-tick', 10);

        scheduler.setTimeSpan(new Date(2017, 0, 1, 8), new Date(2017, 0, 1, 18));

        scheduler.timeAxisViewModel.setTickSize(200);

        await t.waitForAnimations();

        if (scheduler.isHorizontal) {
            t.is(document.querySelector('.b-sch-summarybar .b-timeaxis-tick').offsetWidth,
                document.querySelector('.b-sch-header-row:last-child .b-sch-header-timeaxis-cell').offsetWidth);
        }
        else {
            t.is(document.querySelector('.b-sch-summarybar .b-timeaxis-tick').offsetHeight,
                document.querySelector('.b-sch-header-row-main .b-sch-header-timeaxis-cell').offsetHeight);
        }
    });

    t.it('Multiple summaries should be supported', async t => {
        await createMultiSummary();

        t.selectorExists('.b-sch-summarybar :nth-child(2) :nth-child(1):textEquals(2)', 'First sum correct');
        t.selectorExists('.b-sch-summarybar :nth-child(2) :nth-child(2):textEquals(1)', 'Second sum correct');
        t.selectorExists('.b-sch-summarybar :nth-child(4) :nth-child(1):textEquals(1)', 'Third sum correct');

        t.chain(
            { moveMouseTo : '.b-sch-summarybar :nth-child(2) :nth-child(1)' },

            { waitForSelector : '.b-timeaxis-summary-tip' },

            () => {
                t.selectorExists('.b-timeaxis-summary-tip label:textEquals(Count)', 'Count label found');
                t.selectorExists('.b-timeaxis-summary-tip .b-timeaxis-summary-value:first-of-type:textEquals(2)', 'Correct sum');
                t.selectorExists('.b-timeaxis-summary-tip label:textEquals(Steve)', 'Steve label found');
                t.selectorExists('.b-timeaxis-summary-tip .b-timeaxis-summary-value:textEquals(1)', 'Correct sum');

                scheduler.destroy();
                t.selectorNotExists('.b-timeaxis-summary-tip', 'Tooltip cleaned up');
            }
        );
    });

    t.it('Should support disabling', async t => {
        await createSingleSummary();

        scheduler.features.summary.disabled = true;

        if (scheduler.isVertical) {
            t.selectorNotExists('.b-sch-summarybar', 'Summaries hidden');
        }
        else {
            t.elementIsNotVisible('.b-sch-summarybar', 'Summaries hidden');
        }

        scheduler.features.summary.disabled = false;

        t.elementIsVisible('.b-sch-summarybar', 'Summaries shown');
    });

    // https://github.com/bryntum/support/issues/70
    t.it('Should align with columns when autoAdjustTimeAxis is set to false', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset         : 'weekAndMonth',
            autoAdjustTimeAxis : false,
            features           : {
                summary : {
                    renderer : ({ events }) => events.length || ''
                }
            }
        });

        const
            middleHeaderCells = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell'),
            summaryCells      = t.query('.b-sch-summarybar .b-timeaxis-tick');

        summaryCells.forEach((element, idx) => {
            t.is(element.offsetWidth, middleHeaderCells[idx].offsetWidth, `Summary column for ${middleHeaderCells[idx].innerText} aligned`);
        });
    });

    t.it('Should refresh once on add', async t => {
        await createSingleSummary();

        const spy = t.spyOn(scheduler.features.summary, 'updateTimelineSummaries').and.callThrough();

        scheduler.eventStore.add([
            {
                id         : 100,
                resourceId : 1,
                startDate  : new Date(2017, 0, 1, 1),
                endDate    : new Date(2017, 0, 1, 2)
            },
            {
                id         : 101,
                resourceId : 1,
                startDate  : new Date(2017, 0, 1, 1),
                endDate    : new Date(2017, 0, 1, 2)
            }
        ]);

        await t.waitForProjectReady();

        t.expect(spy).toHaveBeenCalled(1);
    });

    t.it('Should refresh once on updates', async t => {
        await createSingleSummary();

        const spy = t.spyOn(scheduler.features.summary, 'updateTimelineSummaries').and.callThrough();

        scheduler.eventStore.first.duration = 3;
        scheduler.eventStore.last.duration  = 3;

        await t.waitForProjectReady();

        t.expect(spy).toHaveBeenCalled(1);
    });

    // https://github.com/bryntum/support/issues/2468
    t.it('Should support refreshing summary', async t => {
        let showFoo = true;

        scheduler = await t.getSchedulerAsync({
            viewPreset         : 'weekAndMonth',
            autoAdjustTimeAxis : false,
            mode,
            features           : {
                summary : {
                    renderer : ({ events }) => showFoo ? 'foo' : 'bar'
                }
            },
            data : [{
                id : 1
            }],

            columns : [
                {
                    text : 'Name'
                }
            ]
        });

        await t.waitForSelector('.b-timeaxis-summary-value:contains(foo)');

        showFoo = false;
        scheduler.features.summary.refresh();

        await t.waitForSelector('.b-timeaxis-summary-value:contains(bar)');
    });

    mode === 'vertical' && t.it('Should hide footer in vertical mode', async t => {
        await createSingleSummary();

        t.selectorExists('.b-grid-footer-container.b-hidden', 'Footer hidden in vertical mode');
    });

    // https://github.com/bryntum/support/issues/2631
    mode === 'horizontal' && t.it('Should support summing only selected records', async t => {
        await createSingleSummary({
            features : {
                summary : {
                    selectedOnly : true,
                    renderer     : ({ events }) => events.length || ''
                }
            }
        });

        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(1)', '');
        t.contentLike('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(2) .b-timeaxis-summary-value', /^2$/);
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(3)', '');
        t.contentLike('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(4) .b-timeaxis-summary-value', /^1$/);
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(5)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(6)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(7)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(8)', '');

        await t.click('.b-grid-cell');

        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(1)', '');
        t.contentLike('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(2) .b-timeaxis-summary-value', /^1$/);
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(3)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(4)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(5)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(6)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(7)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(8)', '');

        await scheduler.selectAll();

        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(1)', '');
        t.contentLike('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(2) .b-timeaxis-summary-value', /^2$/);
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(3)', '');
        t.contentLike('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(4) .b-timeaxis-summary-value', /^1$/);
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(5)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(6)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(7)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(8)', '');

        await scheduler.deselectAll();

        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(1)', '');
        t.contentLike('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(2) .b-timeaxis-summary-value', /^2$/);
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(3)', '');
        t.contentLike('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(4) .b-timeaxis-summary-value', /^1$/);
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(5)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(6)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(7)', '');
        t.elementIsEmpty('.b-grid-footer.b-sch-timeaxiscolumn :nth-child(8)', '');
    });

    // https://github.com/bryntum/support/issues/1083
    t.it('Should refresh summary when filtered', async t => {
        await createSingleSummary({
            viewPreset         : 'weekAndMonth',
            autoAdjustTimeAxis : false,
            mode
        });

        scheduler.resourceStore.filter(resource => resource.name === 'Steve');
        if (mode === 'horizontal') {
            await t.waitForSelector('.b-grid-footer[data-column=name] .b-grid-summary-value:contains(Total: 1)');
        }
        await t.waitForSelector('.b-timeaxis-summary-value:contains(1)');

        scheduler.resourceStore.clearFilters();

        if (mode === 'horizontal') {
            await t.waitForSelector('.b-grid-footer[data-column=name] .b-grid-summary-value:contains(Total: 2)');
        }
        await t.waitForSelector('.b-timeaxis-summary-value:contains(3)');
    });

    t.it('Should refresh summary when feature is enabled after starting disabled', async t => {
        await createSingleSummary({
            mode,
            features : {
                summary : {
                    disabled : true,
                    renderer : ({ events }) => events.length
                }
            }
        }, false);

        if (mode === 'vertical') {
            t.selectorNotExists('.b-timeaxis-summary-value');
            t.selectorNotExists('.b-sch-summarybar');
        }
        else {
            t.elementIsNotVisible('.b-sch-summarybar');
        }

        scheduler.features.summary.disabled = false;

        await t.waitForSelector('.b-sch-summarybar .b-timeaxis-summary-value:contains(1)');
    });

    // https://github.com/bryntum/support/issues/3064
    t.it('Should refresh summary after zooming', async t => {
        await createSingleSummary({
            mode,
            features : {
                summary : {
                    renderer : ({ events }) => events.length
                }
            }
        }, false);

        scheduler.features.summary.disabled = false;

        await t.waitForSelector('.b-timeaxis-summary-value:contains(1)');

        scheduler.zoomOut();

        await t.waitForSelector('.b-timeaxis-summary-value:contains(1)');
    });

    // https://github.com/bryntum/support/issues/3125
    t.it('Should correctly filter out events outside of time axis', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate : new Date(2021, 6, 1),
            endDate   : new Date(2021, 6, 4),

            features : {
                summary : {
                    renderer : ({ events }) => events.length || ''
                }
            },

            events : [
                { id : 1, resourceId : 'r2', name : 'Event 1', startDate : '2021-07-02', endDate : '2021-07-03' },
                { id : 2, resourceId : 'r2', name : 'Event 2', startDate : '2021-07-04', endDate : '2021-07-05' },
                { id : 3, resourceId : 'r2', name : 'Event 3', startDate : '2021-06-30', endDate : '2021-07-01' }
            ]
        });

        await t.waitForSelector(scheduler.unreleasedEventSelector);

        t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Single event record rendered');

        t.contentLike('.b-sch-summarybar .b-timeaxis-tick:nth-child(2)', '1', 'Summary is ok');

        scheduler.timeAxis.filter(t => t.startDate < new Date(2021, 6, 2) || new Date(2021, 6, 3) <= t.startDate);

        await t.waitForSelectorNotFound(scheduler.unreleasedEventSelector);

        document.querySelectorAll('.b-sch-summarybar .b-timeaxis-tick').forEach(el => {
            t.is(el.innerHTML, '', 'Summary bar is empty');
        });
    });
});
