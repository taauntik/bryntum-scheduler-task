import { Override } from '../../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    Object.assign(window, {
        Override
    });

    t.beforeEach(() => {
        scheduler?.destroy();
    });

    t.overrideAjaxHelper();

    t.it('Should export with default header height', async t => {
        scheduler = await t.getSchedulerAsync({
            width     : 400,
            height    : 300,
            startDate : new Date(2021, 8, 1),
            endDate   : new Date(2021, 8, 2),
            resources : [
                { id : 1, name : 'Albert' }
            ],
            features : {
                pdfExport : {
                    exportServer : '/export'
                }
            }
        });

        const html = await t.getExportHtml(scheduler, {
            columns      : scheduler.columns.visibleColumns.map(c => c.id),
            exporterType : 'singlepage'
        });

        await new Promise(resolve => {
            t.setIframe({
                height : 700,
                html   : html[0].html,
                onload(doc, frame) {
                    const
                        exportedHeaderRect = doc.querySelector('.b-grid-headers-normal').getBoundingClientRect(),
                        headerRect         = document.querySelector('.b-grid-headers-normal').getBoundingClientRect(),
                        exportedRow        = doc.querySelector('.b-timeaxissubgrid').getBoundingClientRect();

                    t.is(exportedHeaderRect.height, headerRect.height, 'Exported header height is ok');
                    t.isApprox(exportedRow.top, exportedHeaderRect.bottom, 1, 'Row is aligned with header');

                    frame.remove();

                    resolve();
                }
            });
        });
    });
});
