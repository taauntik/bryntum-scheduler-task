import { DateHelper, DomHelper, Rectangle, Override, DataGenerator, RandomGenerator, Scheduler, PresetManager, PaperFormat, RowsRange, ScheduleRange, CSSHelper } from '../../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler, paperHeight;

    const exporterType = 'multipagevertical';

    Object.assign(window, {
        DateHelper,
        DomHelper,
        Override,
        DataGenerator,
        RandomGenerator,
        Scheduler,
        PresetManager,
        PaperFormat,
        Rectangle
    });

    t.overrideAjaxHelper();

    CSSHelper.insertRule('.b-horizontaltimeaxis .b-sch-header-row { flex:1; }');

    window.DEBUG = true;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    function getTotalPages(vertical, horizontal) {
        // Content should scale horizontally by 1 / horizontalPages, apply same scale to vertical pages
        return Math.ceil(vertical / horizontal);
    }

    t.it('Should export scheduler to multiple pages', async t => {
        const
            verticalPages = 4,
            horizontalPages = 2,
            totalPages = getTotalPages(verticalPages, horizontalPages);

        ({ scheduler, paperHeight } = await t.createSchedulerForExport({
            startDate   : new Date(2019, 10, 4),
            endDate     : new Date(2019, 11, 9),
            rowsPerPage : 20,
            verticalPages,
            horizontalPages
        }));

        const html = await t.getExportHtml(scheduler, {
            exporterType,
            scheduleRange : ScheduleRange.completeview
        });

        t.is(html.length, totalPages, `${totalPages} pages are exported`);

        const indices = new Set();

        for (let i = 0; i < html.length; i++) {
            const { document : doc, iframe } = await t.setIframeAsync({
                height : paperHeight,
                html   : html[i].html
            });

            t.subTest(`Checking page: ${i}`, t => {
                t.ok(t.assertRowsExportedWithoutGaps(doc, i !== 0, i !== html.length - 1, false), 'Rows exported without gaps');

                if (i % verticalPages === 0) {
                    t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');
                }

                const
                    exportedRows = Array.from(doc.querySelectorAll('.b-timeline-subgrid .b-grid-row')),
                    exportedRowsIds = new Set();

                exportedRows.forEach(el => {
                    const id = parseInt(el.dataset.id);

                    exportedRowsIds.add(id);

                    indices.add(id);
                });

                const
                    { startDate, endDate } = t.getDateRangeFromExportedPage(doc),
                    events = scheduler.eventStore.query(record => {
                        return DateHelper.intersectSpans(record.startDate, record.endDate, startDate, endDate) &&
                            exportedRowsIds.has(record.resourceId);
                    });

                t.ok(t.assertExportedEventsList(doc, events), 'All required events found');

                iframe.remove();
            });
        }

        t.is(indices.size, scheduler.resourceStore.count, 'All rows are exported');
    });

    t.it('Should export specific range of dates', async t => {
        const
            horizontalPages = 2,
            verticalPages   = 2,
            // expected to export only 2 pages with given range
            totalPages      = 2,
            rangeStart      = new Date(2019, 10, 11),
            rangeEnd        = new Date(2019, 10, 25);

        ({ scheduler, paperHeight } = await t.createSchedulerForExport({
            horizontalPages,
            verticalPages,
            rowsPerPage : 20,
            startDate   : new Date(2019, 10, 4),
            endDate     : new Date(2019, 11, 9)
        }));

        t.chain(
            async() => {
                const html = await t.getExportHtml(scheduler, {
                    exporterType,
                    scheduleRange : ScheduleRange.daterange,
                    rangeStart    : rangeStart,
                    rangeEnd      : rangeEnd
                });

                t.is(html.length, totalPages, `${totalPages} page exported`);

                for (let i = 0; i < html.length; i++) {
                    const { document : doc, iframe } = await t.setIframeAsync({
                        height : paperHeight,
                        html   : html[i].html
                    });

                    t.subTest(`Checking page: ${i}`, t => {
                        t.ok(t.assertHeaderPosition(doc), 'Header is exported ok');
                        t.ok(t.assertFooterPosition(doc), 'Footer is exported ok');

                        t.ok(t.assertRowsExportedWithoutGaps(doc, i !== 0, i !== html.length - 1, false), 'Rows exported without gaps');

                        if (i === 0) {
                            t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');
                        }

                        const
                            { startDate, endDate }  = t.getDateRangeFromExportedPage(doc),
                            tickCount               = 7 * 2,
                            tickWidth               = scheduler.tickSize,
                            lockedGridWidth         = scheduler.subGrids.locked.scrollable.scrollWidth,
                            normalGridWidth         = tickCount * tickWidth,
                            splitterWidth           = scheduler.resolveSplitter('locked').offsetWidth,
                            schedulerEl             = doc.querySelector('.b-scheduler'),
                            normalGridEl            = doc.querySelector('.b-grid-subgrid-normal'),
                            normalGridBox           = Rectangle.from(normalGridEl),
                            normalHeaderEl          = doc.querySelector('.b-grid-headers-normal'),
                            { firstTick, lastTick } = t.getFirstLastVisibleTicks(doc);

                        t.is(schedulerEl.offsetWidth, lockedGridWidth + normalGridWidth + splitterWidth, 'Scheduler width is ok');
                        t.isApproxPx(normalGridEl.offsetWidth, normalGridWidth, 'Normal grid width is ok');
                        t.isApproxPx(normalHeaderEl.offsetWidth, normalGridWidth, 'Normal header width is ok');

                        t.is(firstTick.dataset.tickIndex, '0', 'First visible tick index is ok');
                        t.is(lastTick.dataset.tickIndex, '13', 'Last visible tick index is ok');

                        // find first event which is fit completely into the exported range
                        const event = scheduler.eventStore.find(r => {
                            return DateHelper.intersectSpans(startDate, endDate, r.startDate, r.endDate) &&
                                !r.isMilestone &&
                                doc.querySelector(`[data-id="${r.resourceId}"]`);
                        });

                        if (event) {
                            const
                                exportedEventEl    = doc.querySelector(`[data-event-id="${event.id}"]`),
                                exportedEventBox   = exportedEventEl.getBoundingClientRect(),
                                scale              = exportedEventBox.width / exportedEventEl.offsetWidth,
                                eventStartCoord    = DateHelper.getDurationInUnit(rangeStart, event.startDate, 'd') * tickWidth * scale,
                                expectedStartCoord = normalGridBox.left + eventStartCoord;

                            t.is(Math.round(exportedEventBox.left), Math.round(expectedStartCoord - (event.isMilestone ? exportedEventBox.height : 0) / 2), 'Event is positioned properly horizontally');
                        }

                        iframe.remove();
                    });
                }
            }
        );
    });

    t.it('Should export dependencies to multiple pages', async t => {
        const
            verticalPages = 4,
            horizontalPages = 2,
            totalPages = getTotalPages(verticalPages, horizontalPages);

        ({ scheduler, paperHeight } = await t.createSchedulerForExport({
            config : {
                enableEventAnimations : false,
                useInitialAnimation   : false
            },
            verticalPages,
            horizontalPages,
            rowsPerPage    : 20,
            featuresConfig : {
                dependencies : true
            }
        }));

        t.chain(
            next => {
                scheduler.dependencyStore.filter(r => !(r.toOutside || r.fromOutside));
                scheduler.on({
                    dependenciesDrawn : next,
                    once              : true
                });
            },
            async() => {
                async function assertExport(repeatHeader = false) {
                    const html = await t.getExportHtml(scheduler, {
                        exporterType,
                        repeatHeader,
                        scheduleRange : ScheduleRange.completeview
                    });

                    const indices = new Set();

                    t.is(html.length, totalPages, `${totalPages} pages are exported`);

                    for (let i = 0; i < html.length; i++) {
                        const { document : doc, iframe } = await t.setIframeAsync({
                            height : paperHeight,
                            html   : html[i].html
                        });

                        t.subTest(`Checking page: ${i}`, t => {
                            const
                                exportedRows = Array.from(doc.querySelectorAll('.b-timeline-subgrid .b-grid-row')),
                                exportedRowsIds = new Set();

                            exportedRows.forEach(el => {
                                const id = parseInt(el.dataset.id);

                                exportedRowsIds.add(id);

                                indices.add(id);
                            });

                            const
                                { startDate, endDate } = t.getDateRangeFromExportedPage(doc),
                                events = scheduler.eventStore.query(record => {
                                    return DateHelper.intersectSpans(record.startDate, record.endDate, startDate, endDate) &&
                                        exportedRowsIds.has(record.resourceId);
                                }),
                                dependencies = scheduler.dependencyStore.query(r => {
                                    return events.includes(r.sourceEvent) || events.includes(r.targetEvent);
                                });

                            t.ok(events.length, 'Some events found');
                            t.ok(dependencies.length, 'Some dependencies found');

                            if (repeatHeader) {
                                t.ok(t.assertGridHeader(doc), 'Grid header is repeated ok');
                            }
                            t.ok(t.assertExportedEventDependenciesList(doc, dependencies), 'Dependencies exported correctly');

                            iframe.remove();
                        });
                    }

                    t.is(indices.size, scheduler.resourceStore.count, 'All rows are exported');
                }

                await assertExport(false);

                // In headless mode these two exports run too fast and fail when all `it`s are running. Nothing happens
                // between these calls however, at least no `trigger` is happening for whole second, which means view
                // doesn't do any drawing/animating etc.
                // This line makes test stable in headless mode
                await new Promise(resolve => requestAnimationFrame(resolve));

                await assertExport(true);
            }
        );
    });

    t.it('Should export visible rows', async t => {
        const
            verticalPages = 2,
            horizontalPages = 2,
            totalPages = 1;

        ({ scheduler, paperHeight } = await t.createSchedulerForExport({
            startDate   : new Date(2019, 10, 4),
            endDate     : new Date(2019, 11, 9),
            rowsPerPage : 20,
            height      : 900,
            width       : 650,
            verticalPages,
            horizontalPages
        }));

        async function assertExport(repeatHeader) {
            t.diag(`Exporting ${repeatHeader ? '' : 'not'} repeating header`);

            const html = await t.getExportHtml(scheduler, {
                exporterType,
                repeatHeader,
                rowsRange     : RowsRange.visible,
                scheduleRange : ScheduleRange.currentview
            });

            t.is(html.length, totalPages, `${totalPages} pages are exported`);

            const indices = new Set();

            for (let i = 0; i < html.length; i++) {
                const { document : doc, iframe } = await t.setIframeAsync({
                    height : paperHeight,
                    html   : html[i].html
                });

                t.subTest(`Checking page: ${i}`, t => {
                    t.ok(t.assertRowsExportedWithoutGaps(doc, false, false, true), 'Rows exported without gaps');

                    t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');

                    const
                        exportedRows    = Array.from(doc.querySelectorAll('.b-timeline-subgrid .b-grid-row')),
                        exportedRowsIds = new Set();

                    exportedRows.forEach(el => {
                        const id = parseInt(el.dataset.id);

                        exportedRowsIds.add(id);

                        indices.add(id);
                    });

                    const
                        { startDate, endDate } = t.getDateRangeFromExportedPage(doc),
                        events                 = scheduler.eventStore.query(record => {
                            return DateHelper.intersectSpans(record.startDate, record.endDate, startDate, endDate) &&
                                exportedRowsIds.has(record.resourceId);
                        });

                    t.ok(t.assertExportedEventsList(doc, events), 'All required events found');

                    t.assertGridHeightAlignedWithLastRow(doc);

                    iframe.remove();
                });
            }

            t.is(indices.size, Math.round(scheduler.bodyHeight / scheduler.rowHeight), 'Visible rows are exported');
        }

        await assertExport(false);

        await assertExport(true);
    });

    t.it('Should export large view', async t => {
        ({ scheduler } = await t.createSchedulerForExport({
            rowsPerPage     : 20,
            verticalPages   : 12,
            horizontalPages : 2,
            config          : {
                barMargin : 0
            }
        }));

        const html = await t.getExportHtml(scheduler, {
            exporterType : 'multipagevertical'
        });

        t.is(html.length, 6, '6 pages exported');

        const indices = new Set();

        for (let i = 0; i < html.length; i++) {
            const { document : doc, iframe } = await t.setIframeAsync({
                height : paperHeight,
                html   : html[i].html
            });

            t.subTest(`Checking page: ${i}`, t => {
                t.ok(t.assertRowsExportedWithoutGaps(doc, false, false, false), 'Rows exported without gaps');

                t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');

                const
                    exportedRows    = Array.from(doc.querySelectorAll('.b-timeline-subgrid .b-grid-row')),
                    exportedRowsIds = new Set();

                exportedRows.forEach(el => {
                    const id = parseInt(el.dataset.id);

                    exportedRowsIds.add(id);

                    indices.add(id);
                });

                const
                    { startDate, endDate } = t.getDateRangeFromExportedPage(doc),
                    events                 = scheduler.eventStore.query(record => {
                        return DateHelper.intersectSpans(record.startDate, record.endDate, startDate, endDate) &&
                            exportedRowsIds.has(record.resourceId);
                    });

                t.ok(t.assertExportedEventsList(doc, events), 'All required events found');

                t.assertGridHeightAlignedWithLastRow(doc);

                iframe.remove();
            });
        }

        t.is(indices.size, scheduler.resourceStore.count, 'All rows are exported');
    });

    t.it('Should export large view with variable row heights', async t => {
        ({ scheduler } = await t.createSchedulerForExport({
            rowsPerPage     : 20,
            horizontalPages : 1,
            verticalPages   : 1,
            startDate       : new Date(2020, 6, 12),
            endDate         : new Date(2020, 6, 26),
            config          : {
                barMargin   : 0,
                crudManager : {
                    autoLoad  : true,
                    transport : {
                        load : {
                            url : 'features/export/MultiPageVertical_data.json'
                        }
                    }
                }
            }
        }));

        await scheduler.crudManager.await('load');

        async function assertExport(repeatHeader) {
            await new Promise(resolve => {
                t.subTest(`Exporting scheduler (repeatHeader: ${repeatHeader})`, async t => {
                    const html = await t.getExportHtml(scheduler, {
                        exporterType : 'multipagevertical',
                        repeatHeader
                    });

                    const indices = new Set();

                    for (let i = 0; i < html.length; i++) {
                        const { document : doc, iframe } = await t.setIframeAsync({
                            height : paperHeight,
                            html   : html[i].html
                        });

                        t.subTest(`Checking page: ${i}`, t => {
                            t.ok(t.assertRowsExportedWithoutGaps(doc, false, false, false), 'Rows exported without gaps');

                            t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');

                            const exportedRows = Array.from(doc.querySelectorAll('.b-timeline-subgrid .b-grid-row'));

                            exportedRows.forEach(el => {
                                const id = parseInt(el.dataset.id);

                                indices.add(id);
                            });

                            iframe.remove();
                        });
                    }

                    t.is(indices.size, scheduler.resourceStore.count, 'All rows are exported');

                    resolve();
                });
            });
        }

        await assertExport(false);

        await assertExport(true);
    });
});
