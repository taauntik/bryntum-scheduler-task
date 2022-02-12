import { DateHelper, DomHelper, Override, DataGenerator, RandomGenerator, PresetManager, PaperFormat, Rectangle, CSSHelper } from '../../../build/scheduler.module.js?456730';

StartTest(t => {

    let scheduler, paperHeight;

    Object.assign(window, {
        DateHelper,
        DomHelper,
        Override,
        DataGenerator,
        RandomGenerator,
        PresetManager,
        PaperFormat,
        Rectangle
    });

    CSSHelper.insertRule('.b-horizontaltimeaxis .b-sch-header-row { flex:1; }');

    t.overrideAjaxHelper();

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    t.it('Should export scheduler to multiple pages', async t => {
        const
            verticalPages = 2,
            horizontalPages = 2;

        ({ scheduler, paperHeight } = await t.createSchedulerForExport({
            startDate : new Date(2019, 10, 4),
            endDate   : new Date(2019, 11, 9),
            verticalPages,
            horizontalPages
        }));

        t.chain(
            async() => {
                scheduler.resourceStore.group('firstName');

                const html = await t.getExportHtml(scheduler, {
                    columns      : scheduler.columns.visibleColumns.map(c => c.id),
                    exporterType : 'singlepage'
                });

                const { document : doc, iframe } = await t.setIframeAsync({
                    height : paperHeight,
                    html   : html[0].html
                });

                t.ok(t.assertRowsExportedWithoutGaps(doc, false, true), 'Rows exported without gaps');
                t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');

                const events = scheduler.eventStore.query(r => scheduler.timeAxis.isTimeSpanInAxis(r));

                t.ok(t.assertExportedEventsList(doc, events), 'Events are exported correctly');

                t.is(doc.querySelectorAll('.b-grid-row').length, scheduler.resourceStore.count * 2, 'All resources exported');
                t.isExportedTickCount(doc, scheduler.timeAxis.count);
                t.is(doc.querySelectorAll(scheduler.unreleasedEventSelector).length, scheduler.eventStore.count / 2, 'Event count is correct');

                iframe.remove();
            }
        );
    });

    t.it('Should export dependencies not visible on a first page', async t => {
        const
            startDate = new Date(2020, 6, 19),
            resources = DataGenerator.generateData(100);

        scheduler = await t.getSchedulerAsync({
            resources,
            startDate,
            height   : 400,
            width    : 600,
            endDate  : new Date(2020, 6, 26),
            features : {
                dependencies : true,
                pdfExport    : {
                    exportServer : '/export'
                }
            },
            events : [
                { id : 1, resourceId : resources[resources.length - 1].id, startDate : new Date(2020, 6, 20), duration : 2 },
                { id : 2, resourceId : resources[resources.length - 1].id, startDate : new Date(2020, 6, 20), duration : 2 }
            ],
            dependencies : [
                { from : 1, to : 2 }
            ]
        });

        const pages = await t.getExportHtml(scheduler, {
            exporterType : 'multipagevertical'
        });

        const { document, iframe } = await t.setIframeAsync({
            height : 1123,
            html   : pages[pages.length - 1].html
        });

        t.ok(t.assertExportedEventDependenciesList(document, scheduler.dependencies), 'Dependency is exported');

        iframe.remove();
    });

    t.it('Should export column lines', async t => {
        ({ scheduler, paperHeight } = await t.createSchedulerForExport({
            horizontalPages : 2
        }));

        const pages = await t.getExportHtml(scheduler, {
            exporterType : 'multipagevertical'
        });

        const { document, iframe } = await t.setIframeAsync({
            height : paperHeight,
            html   : pages[0].html
        });

        const
            ticks = Array.from(document.querySelectorAll('.b-lowest .b-sch-header-timeaxis-cell')).sort((a, b) => a.offsetLeft - b.offsetLeft),
            lines = Array.from(document.querySelectorAll('.b-column-line, .b-column-line-major')).sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);

        ticks.pop();

        t.is(ticks.length, lines.length, 'Correct amount of lines exported');

        ticks.forEach((tickEl, index) => {
            if (index) {
                const lineEl = lines[index - 1];

                t.isApprox(lineEl.getBoundingClientRect().left, tickEl.getBoundingClientRect().left, 1, `Column line ${index} is aligned to tick el`);
            }
        });

        t.is(document.querySelectorAll('.b-column-line-major').length, 1, 'One major line exported');

        iframe.remove();
    });

    t.it('Should export resource time ranges', async t => {
        ({ scheduler, paperHeight } = await t.createSchedulerForExport({
            horizontalPages : 2,
            verticalPages   : 3,
            featuresConfig  : {
                resourceTimeRanges : true
            }
        }));

        scheduler.resourceTimeRanges = scheduler.resources.map((record, index) => {
            return {
                id         : index + 1,
                resourceId : record.id,
                startDate  : scheduler.timeAxis.getAt(1).startDate,
                endDate    : scheduler.timeAxis.getAt(2).startDate
            };
        });

        const pages = await t.getExportHtml(scheduler, {
            exporterType : 'singlepage'
        });

        const { document, iframe } = await t.setIframeAsync({
            height : paperHeight,
            html   : pages[0].html
        });

        const resourceRanges = Array.from(document.querySelectorAll('.b-sch-resourcetimerange'));

        t.is(resourceRanges.length, scheduler.resourceStore.count, 'All resource zones are exported');

        resourceRanges.forEach(element => {
            const
                resourceId = element.dataset.resourceId,
                rowElement = document.querySelector(`.b-grid-row[data-id="${resourceId}"]`),
                rowBox     = rowElement.getBoundingClientRect(),
                elBox      = element.getBoundingClientRect();

            t.isApprox(elBox.y, rowBox.y, 1, `Resource ${resourceId} zone top position is ok`);
            t.isApprox(elBox.bottom, rowBox.bottom, 1, `Resource ${resourceId} zone bottom position is ok`);
        });

        iframe.remove();
    });
});
