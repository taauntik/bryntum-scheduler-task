import { PaperFormat, RowsRange, DateHelper, DomHelper, Override, DataGenerator, RandomGenerator, Rectangle, CSSHelper } from '../../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler, paperHeight, rowHeight;

    Object.assign(window, {
        DateHelper,
        DomHelper,
        Override,
        DataGenerator,
        RandomGenerator,
        PaperFormat,
        Rectangle
    });

    t.overrideAjaxHelper();

    CSSHelper.insertRule('.b-horizontaltimeaxis .b-sch-header-row { flex:1; }');

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    t.it('Should export visible rows', async t => {
        ({ scheduler, paperHeight } = await t.createSchedulerForExport({ height : 300 }));

        async function doExport(rowsRange, exporterType, callback) {
            const html = await t.getExportHtml(scheduler, {
                columns : scheduler.columns.getRange().map(r => r.id),
                exporterType,
                rowsRange
            });

            t.is(html.length, 1, '1 page is exported');

            const { document, iframe } = await t.setIframeAsync({
                height : paperHeight + 50,
                html   : html[0].html
            });

            callback(document);

            iframe.remove();
        }

        const topRecord = scheduler.store.getAt(0);

        function assertContent(doc) {
            const
                rows            = Array.from(doc.querySelectorAll('.b-grid-subgrid-normal .b-grid-row')),
                bodyContainerEl = doc.querySelector('.b-grid-body-container');

            t.is(rows.length, 5, '5 rows exported');

            rows.forEach((el, index) => {
                t.is(el.dataset.id, topRecord.id + index, `Row ${index} is exported ok`);
            });

            t.ok(t.assertHeaderPosition(doc), 'Header is exported ok');
            t.ok(t.assertFooterPosition(doc), 'Footer is exported ok');

            const events = scheduler.eventStore.query(r => scheduler.timeAxis.isTimeSpanInAxis(r) && r.resourceId < 6);

            t.ok(events.length, 'Event list to check not empty');
            t.assertExportedEventsList(doc, events);

            t.is(bodyContainerEl.ownerDocument.defaultView.getComputedStyle(bodyContainerEl).overflowY, 'hidden', 'Scrollbar is hidden');
        }

        t.chain(
            async() => {
                t.diag('Exporting visible rows to single page');

                await doExport(RowsRange.visible, 'singlepage', assertContent);

                t.diag('Exporting visible rows to multiple pages');

                await doExport(RowsRange.visible, 'multipage', assertContent);
            }
        );
    });

    t.it('Should export visible rows (scrolled)', async t => {
        ({ scheduler, paperHeight } = await t.createSchedulerForExport({ height : 300 }));

        async function doExport(rowsRange, exporterType, callback) {
            const html = await t.getExportHtml(scheduler, {
                columns : scheduler.columns.getRange().map(r => r.id),
                exporterType,
                rowsRange
            });

            t.is(html.length, 1, '1 page is exported');

            const { document, iframe } = await t.setIframeAsync({
                height : paperHeight + 50,
                html   : html[0].html
            });

            callback(document);

            iframe.remove();
        }

        const topRecord = scheduler.store.getById(5);

        function assertContent(doc) {
            function matches(el, selector) {
                const matches = doc.querySelectorAll(selector);

                let i = matches.length;

                while (--i >= 0 && matches.item(i) !== el) {}

                return i > -1;
            }

            function closest(el, selector) {
                if (!doc.documentElement.contains(el)) return null;

                do {
                    if (matches(el, selector)) return el;
                    el = el.parentElement || el.parentNode;
                } while (el !== null && el.nodeType === 1);
                return null;
            }

            const
                rows             = Array.from(doc.querySelectorAll('.b-grid-subgrid-locked .b-grid-row')),
                bodyContainerEl  = doc.querySelector('.b-grid-body-container'),
                bodyContainerBox = bodyContainerEl.getBoundingClientRect(),
                gridHeaderEl     = doc.querySelector('.b-grid-header-container'),
                gridHeaderBox    = gridHeaderEl.getBoundingClientRect();

            t.is(rows.length, 5, '5 rows exported');

            rows.forEach((el, index) => {
                t.is(el.dataset.id, topRecord.id + index, `Row ${index} is exported ok`);
            });

            t.is(closest(doc.elementFromPoint(bodyContainerBox.left + 1, gridHeaderBox.bottom + 1), '.b-grid-row'), rows[0], 'First visible row is ok');

            t.ok(t.assertHeaderPosition(doc), 'Header is exported ok');
            t.ok(t.assertFooterPosition(doc), 'Footer is exported ok');

            const events = scheduler.eventStore.query(r => {
                return scheduler.timeAxis.isTimeSpanInAxis(r) && r.resourceId > 4 && r.resourceId < 10;
            });

            t.ok(events.length, 'Event list to check not empty');
            t.assertExportedEventsList(doc, events);

            t.is(bodyContainerEl.ownerDocument.defaultView.getComputedStyle(bodyContainerEl).overflowY, 'hidden', 'Scrollbar is hidden');
        }

        t.chain(
            async() => {
                await scheduler.scrollRowIntoView(topRecord, { block : 'start' });

                t.diag('Exporting visible rows to single page');

                await doExport(RowsRange.visible, 'singlepage', assertContent);

                t.diag('Exporting visible rows to multiple pages');

                await doExport(RowsRange.visible, 'multipage', assertContent);
            }
        );
    });

    t.it('Should align rows', async t => {
        // Exporting grid with content height to 7.5 rows. Which means we will get 15 rows and every page having enough
        // height to fit 7.5. rows. We expect 2 pages with 7 rows and 1 page with 1 row as a result
        const
            verticalPages = 2,
            totalPages    = 3,
            rowsPerPage   = 7.5;

        ({ scheduler, paperHeight, rowHeight } = await t.createSchedulerForExport({
            verticalPages,
            rowsPerPage,
            featuresConfig : {
                dependencies : true
            }
        }));

        t.chain(
            { waitForSelector : '.b-sch-dependency' },
            next => {
                scheduler.dependencyStore.filter(r => !(r.toOutside || r.fromOutside));
                scheduler.on({
                    dependenciesDrawn : next,
                    once              : true
                });
            },
            async() => {
                const html = await t.getExportHtml(scheduler, {
                    columns      : scheduler.columns.getRange().map(r => r.id),
                    alignRows    : true,
                    exporterType : 'multipage'
                });

                t.is(html.length, totalPages, `${totalPages} pages exported`);

                for (let i = 0; i < totalPages; i++) {
                    const { document : doc, iframe } = await t.setIframeAsync({
                        height : paperHeight + 50,
                        html   : html[i].html
                    });

                    const
                        rows = Array.from(doc.querySelectorAll('.b-timeline-subgrid .b-grid-row')),
                        headerBox = doc.querySelector('.b-export-header').getBoundingClientRect(),
                        footerBox = doc.querySelector('.b-export-footer').getBoundingClientRect();

                    if (i === 0) {
                        t.is(rows.length, Math.floor(rowsPerPage) - 1, 'Correct amount of rows on 1st page');
                        t.isApprox(rows[0].getBoundingClientRect().top, headerBox.bottom + rowHeight, 1, 'First row on the page is aligned properly');
                    }
                    else {
                        if (i === 1) {
                            t.is(rows.length, Math.floor(rowsPerPage), 'Correct amount of rows on 2nd page');
                        }
                        else {
                            t.is(rows.length, 1, 'Correct amount of rows on 3rd page');
                        }

                        t.isApprox(rows[0].getBoundingClientRect().top, headerBox.bottom, 1, 'First row on the page is aligned properly');
                    }

                    const lastRowBox = rows[rows.length - 1].getBoundingClientRect();

                    t.isLess(lastRowBox.bottom, footerBox.top, 'Last row is fully visible');

                    const
                        { startDate, endDate } = scheduler,
                        events = scheduler.events.filter(r => {
                            return DateHelper.intersectSpans(startDate, endDate, r.startDate, r.endDate) &&
                                r.resourceId > rowsPerPage * (i % totalPages) - 1 &&
                                r.resourceId < rowsPerPage * (i % totalPages + 1) - 1;
                        }),
                        dependencies = scheduler.dependencies.filter(r => events.includes(r.fromEvent) || events.includes(r.toEvent));

                    t.ok(t.assertExportedEventsList(doc, events), `Events are exported ok on page ${i}`);

                    t.ok(t.assertExportedEventDependenciesList(doc, dependencies), `Dependencies are exported ok on page ${i}`);

                    t.assertGridHeightAlignedWithLastRow(doc);

                    iframe.remove();
                }
            }
        );
    });
});
