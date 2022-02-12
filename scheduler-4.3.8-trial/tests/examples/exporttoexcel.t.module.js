/*global zipcelx*/
/*eslint no-undef: "error"*/
StartTest(t => {
    let scheduler;

    t.it('sanity', t => {
        t.chain(
            { waitForSelector : '.b-sch-foreground-canvas' },

            (next, el) => {
                scheduler = bryntum.fromElement(el[0], 'scheduler');
                next();
            },

            () => {
                t.checkGridSanity(scheduler);
                t.ok(scheduler.features.excelExporter, 'ExcelExporter feature is here');
                t.ok(zipcelx, 'Zipcelx library is here (global)');
            }
        );
    });

    t.it('Export to Excel', t => {
        let spy = t.spyOn(scheduler.features.excelExporter, 'zipcelx');

        t.chain(
            { click : '[data-ref=excelExportBtn1]' },
            { click : '[data-ref=excelExportBtn2]' },
            { click : '[data-ref=excelExportBtn3]' },
            () => {
                t.expect(spy).toHaveBeenCalled(3);
            }
        );
    });
});
