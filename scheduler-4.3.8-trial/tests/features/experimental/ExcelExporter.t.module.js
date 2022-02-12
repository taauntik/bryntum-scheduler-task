
/*global zipcelx:true*/
/*eslint no-undef: "error"*/
/*eslint no-unused-vars: ["error", { "vars": "local" }]*/

StartTest(t => {
    t.expectGlobals('zipcelx');

    let scheduler;

    t.beforeEach(() => scheduler && scheduler.destroy());

    async function setup(cfg = {}) {
        scheduler = await t.getSchedulerAsync(Object.assign({
            columns : [{
                text  : 'Name',
                field : 'name'
            }, {
                text  : 'Country',
                field : 'country'
            }],
            features : {
                group         : 'name',
                excelExporter : true
            },
            resources : [
                { id : 1, name : 'Johan', country : 'Sweden' },
                { id : 2, name : 'Mats', country : 'Sweden' },
                { id : 3, name : 'Arcady', country : 'Russia' }
            ],
            startDate : new Date(2017, 1, 7),
            endDate   : new Date(2017, 1, 9),
            events    : [
                {
                    resourceId   : 1,
                    name         : 'Prepare campaign',
                    startDate    : '2017-02-07 12:00',
                    duration     : 3,
                    durationUnit : 'h'
                },
                {
                    resourceId   : 'nonexisting',
                    name         : 'Foo',
                    startDate    : '2017-02-07 12:00',
                    duration     : 3,
                    durationUnit : 'h'
                }
            ]
        }, cfg));
    }

    t.it('Exporting a grouped Grid should work', async t => {
        window.zipcelx = function(obj) {
            // 1 for each row, + 1 group header for each row, + column header row
            t.is(obj.sheet.data.length, 9);
            t.is(obj.sheet.data[1][0].value, 'Arcady (1)');
            t.is(obj.sheet.data[1][1].value, '');

            t.is(obj.sheet.data[7][2].value, 'No resource assigned');
            t.is(obj.sheet.data[8][2].value, 'Foo');
        };

        await setup();

        scheduler.features.excelExporter.export();
    });

    t.it('Exporting a Grid with group summaries should work', async t => {
        window.zipcelx = function(obj) {
            // 1 for each row, + 1 group header for each row, + column header row
            t.is(obj.sheet.data.length, 9);
            t.is(obj.sheet.data[1][0].value, 'Arcady (1)');
            t.is(obj.sheet.data[1][1].value, '');

            t.is(obj.sheet.data[7][2].value, 'No resource assigned');
            t.is(obj.sheet.data[8][2].value, 'Foo');
        };

        await setup({
            features : {
                group         : 'name',
                excelExporter : true,
                groupSummary  : {
                    summaries : [
                        {
                            label    : 'Count',
                            renderer : ({ events }) => events.length
                        }
                    ]
                }
            }
        });

        scheduler.features.excelExporter.export();
    });

    t.it('Exporting a grouped Grid with collapsed row should work', async t => {
        window.zipcelx = function(obj) {
            // 1 for each row, + 1 group header for each row, + column header row
            t.is(obj.sheet.data.length, 8);
            t.is(obj.sheet.data[3][0].value, 'Johan (1)');
            t.is(obj.sheet.data[3][1].value, '');

            t.is(obj.sheet.data[4][0].value, 'Mats (1)');
            t.is(obj.sheet.data[4][1].value, '');

            t.is(obj.sheet.data[6][2].value, 'No resource assigned');
            t.is(obj.sheet.data[7][2].value, 'Foo');
        };

        await setup();

        // collapse row with event
        scheduler.features.group.toggleCollapse(scheduler.store.getAt(2));

        scheduler.features.excelExporter.export();
    });

    t.it('Should not export not assigned events', async t => {
        window.zipcelx = function(obj) {
            // 1 for each row, + 1 group header for each row, + column header row
            t.is(obj.sheet.data.length, 7);
            t.is(obj.sheet.data[5][0].value, 'Mats (1)');
            t.is(obj.sheet.data[5][1].value, '');
        };

        await setup({
            features : {
                group         : 'name',
                excelExporter : {
                    exporterConfig : {
                        includeUnassigned : false
                    }
                }
            }
        });

        scheduler.features.excelExporter.export();
    });

    t.it('Exporting a grouped Scheduler with renderer function returning content should work', async t => {
        window.zipcelx = function(obj) {
            // 1 for each row, + 1 group header for each row, + column header row
            t.is(obj.sheet.data.length, 9);
            t.is(obj.sheet.data[1][0].value, 'foo Arcady (1)');
            t.is(obj.sheet.data[1][1].value, '');
        };

        await setup({
            columns : [{
                text          : 'Name',
                field         : 'name',
                groupRenderer : ({ groupRowFor, record }) => {
                    return `foo ${groupRowFor} (${record.meta.childCount})`;
                }
            }, {
                text  : 'Country',
                field : 'country'
            }]
        });

        scheduler.features.excelExporter.export();
    });

    t.it('Exporting a grouped Grid with renderer function changing cell element should work', async t => {
        window.zipcelx = function(obj) {
            // 1 for each row, + 1 group header for each row, + column header row
            t.is(obj.sheet.data.length, 9);
            t.is(obj.sheet.data[1][0].value, 'foo Arcady (1)');
            t.is(obj.sheet.data[1][1].value, '');
        };

        await setup({
            columns : [{
                text          : 'Name',
                field         : 'name',
                groupRenderer : ({ cellElement, groupRowFor, record }) => {
                    cellElement.innerHTML = `foo ${groupRowFor} (${record.meta.childCount})`;
                }
            }, {
                text  : 'Country',
                field : 'country'
            }]
        });

        scheduler.features.excelExporter.export();
    });

    // https://github.com/bryntum/support/issues/1763
    t.it('Should export the columns correctly according with configs defined on call export function', async t => {
        window.zipcelx = function(obj) {
            // 1 for each row, + 1 group header for each row, + column header row
            t.is(obj.filename, 'Custom export', 'Custom filename is correct');
            t.is(obj.sheet.cols.length, 4, 'Total columns to export is correct');
            t.is(obj.sheet.data[1][2].value, '07/02/2017 12:00', 'dateFormat config was applied');
            t.is(obj.sheet.cols[0].value, 'Resource Custom', 'Resource column custom text applied');
            t.is(obj.sheet.cols[1].value, 'Task Custom', 'Event column custom text applied');
        };

        await setup({
            features : {
                group         : false,
                excelExporter : true
            }
        });

        scheduler.features.excelExporter.export({
            filename       : 'Custom export',
            dateFormat     : 'DD/MM/YYYY HH:mm',
            exporterConfig : {
                columns      : [{ text : 'Resource Custom', field : 'name' }],
                eventColumns : [
                    { text : 'Task Custom', field : 'name' },
                    { text : 'Starts', field : 'startDate' },
                    { text : 'Ends', field : 'endDate' }
                ]
            }
        });
    });
});
