import { Scheduler, EventStore, ResourceStore, DependencyStore, PresetManager, ScheduleRange } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    Object.assign(window, {
        Scheduler,
        EventStore,
        ResourceStore,
        DependencyStore,
        PresetManager
    });

    t.it('Should validate time range in dialog', async t => {
        scheduler = t.getScheduler({
            startDate : new Date(2020, 6, 19),
            endDate   : new Date(2020, 6, 26),
            features  : {
                pdfExport : {
                    exportServer : '/export'
                }
            }
        });

        await scheduler.features.pdfExport.showExportDialog();

        t.chain(
            { click : '.b-schedulerangecombo' },
            { click : 'div:contains(Date range)' },

            { waitForSelector : '[data-ref="rangeStartField"]' },
            async() => {
                const
                    startDateField = document.querySelector('[data-ref="rangeStartField"] .b-field-inner'),
                    endDateField   = document.querySelector('[data-ref="rangeEndField"] .b-field-inner');

                t.isGreaterOrEqual(startDateField.offsetWidth, 80, 'Start date field has some width');
                t.isGreaterOrEqual(endDateField.offsetWidth, 80, 'End date field has some width');
            },

            { click : '[data-ref="rangeStartField"] .b-icon-calendar', desc : 'Expand first picker' },
            { waitForSelector : '.b-calendar-cell.b-out-of-range:contains(26)', desc : 'Max value is set' },

            { click : '[data-ref="rangeEndField"] .b-icon-calendar', desc : 'Expand second picker' },
            { waitForSelector : '.b-calendar-cell.b-out-of-range:contains(17)', desc : 'Min value is set' },

            { click : '.b-calendar-cell:contains(23)', desc : 'Change end date, this should set new max' },
            { click : '[data-ref="rangeStartField"] .b-icon-calendar' },
            { waitForSelector : '.b-calendar-cell.b-out-of-range:contains(23)', desc : 'Max value is updated' },

            { click : '.b-calendar-cell:contains(21)', desc : 'Change start date, this should set new min' },
            { click : '[data-ref="rangeEndField"] .b-icon-calendar' },
            { waitForSelector : '.b-calendar-cell.b-out-of-range:contains(21)', desc : 'Min value is updated' }
        );
    });

    t.it('Hidden columns should not be selected', async t => {
        scheduler = t.getScheduler({
            sanityCheck : false,
            startDate   : new Date(2020, 6, 19),
            endDate     : new Date(2020, 6, 26),
            features    : {
                pdfExport : {
                    exportServer : '/export'
                }
            },
            columns : [
                { text : 'Vis', flex : 1, id : 1 },
                { text : 'Hidden', flex : 1, id : 2, hidden : true },
                { text : 'Non exportable', flex : 1, id : 3, exportable : false },
                { text : 'Vis', flex : 1, id : 4 }
            ]
        });

        await scheduler.features.pdfExport.showExportDialog();

        const { exportDialog } = scheduler.features.pdfExport;

        t.isDeeply(exportDialog.widgetMap.columnsField.value, [1, 4], 'Visible & exportable columns preselected');

        await t.click('button:contains(Cancel)');

        scheduler.columns.getAt(0).hidden = true;
        scheduler.columns.getAt(1).hidden = false;

        await scheduler.features.pdfExport.showExportDialog();

        t.isDeeply(exportDialog.widgetMap.columnsField.value.sort(), [2, 4], 'Visible & exportable columns preselected');
    });

    t.it('Should allow to configure date range fields', async t => {
        scheduler = await t.getSchedulerAsync({
            columns : [
                { field : 'name', text : 'name', id : 'name' },
                { field : 'color', text : 'color', id : 'color' },
                { field : 'age', text : 'age', id : 'age', hidden : true }
            ],
            features : {
                pdfExport : {
                    exportServer : '/export',
                    exportDialog : {
                        items : {
                            scheduleRangeField : {
                                value : 'daterange'
                            },
                            rangesContainer : {
                                items : {
                                    rangeStartField : {
                                        value : new Date(2021, 6, 26)
                                    },
                                    rangeEndField : {
                                        value : new Date(2021, 6, 28)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        await scheduler.features.pdfExport.showExportDialog();

        const
            { widgetMap } = scheduler.features.pdfExport.exportDialog,
            {
                scheduleRangeField,
                rangesContainer,
                rangeStartField,
                rangeEndField
            }             = widgetMap;

        t.is(scheduleRangeField.value, 'daterange', 'Range field value is ok');
        t.is(rangeStartField.value, new Date(2021, 6, 26), 'Range start field value is ok');
        t.is(rangeEndField.value, new Date(2021, 6, 28), 'Range end field value is ok');

        t.notOk(rangesContainer.hidden, 'Range fields container is visible');
        t.notOk(rangeStartField.hidden, 'Range start field is visible');
        t.notOk(rangeEndField.hidden, 'Range end field is visible');
    });

    t.it('Should trigger `export` event when clicking Export button', async t => {
        scheduler = await t.getSchedulerAsync({
            columns : [
                { field : 'name', text : 'name', id : 'name' },
                { field : 'color', text : 'color', id : 'color' },
                { field : 'age', text : 'age', id : 'age', hidden : true }
            ],
            features : {
                pdfExport : {
                    exportServer : '/export',
                    exportDialog : {
                        autoSelectVisibleColumns : false,
                        items                    : {
                            columnsField : {
                                value : ['name']
                            },
                            scheduleRangeField : {
                                value : 'daterange'
                            },
                            rangesContainer : {
                                items : {
                                    rangeStartField : {
                                        value : new Date(2021, 6, 26)
                                    },
                                    rangeEndField : {
                                        value : new Date(2021, 6, 28)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        await scheduler.features.pdfExport.showExportDialog();

        const
            { exportDialog } = scheduler.features.pdfExport,
            { columnsField } = exportDialog.widgetMap;

        t.isDeeply(columnsField.value, ['name'], 'Only name column is exported');

        t.firesOnce(exportDialog, 'export');
        exportDialog.on('export', ({ values }) => {
            t.isDeeply(values, {
                alignRows     : false,
                columns       : ['name'],
                exporterType  : 'singlepage',
                fileFormat    : 'pdf',
                orientation   : 'portrait',
                paperFormat   : 'A4',
                repeatHeader  : false,
                rowsRange     : 'all',
                scheduleRange : 'daterange',
                rangeStart    : new Date(2021, 6, 26),
                rangeEnd      : new Date(2021, 6, 28)
            });
        });

        await t.click('button:contains(Export)');

        await scheduler.features.pdfExport.await('export');
    });

    t.it('Should not allow to set invalid range to export dialog', async t => {
        scheduler = await t.getSchedulerAsync({
            columns : [
                { field : 'name', text : 'name', id : 'name' },
                { field : 'color', text : 'color', id : 'color' },
                { field : 'age', text : 'age', id : 'age', hidden : true }
            ],
            features : {
                pdfExport : {
                    exportServer : '/export',
                    exportDialog : {
                        items : {
                            scheduleRangeField : {
                                value : 'daterange'
                            },
                            rangesContainer : {
                                items : {
                                    rangeStartField : {
                                        value : new Date(2021, 6, 26)
                                    },
                                    rangeEndField : {
                                        value : new Date(2021, 6, 19)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        await scheduler.features.pdfExport.showExportDialog();

        const
            { exportDialog } = scheduler.features.pdfExport,
            {
                rangeStartField,
                rangeEndField
            }             = exportDialog.widgetMap;

        t.is(rangeStartField.value, new Date(2021, 6, 26), 'Range start value is ok');
        t.is(rangeEndField.value, new Date(2021, 6, 27), 'Range end value is replaced');
    });

    t.it('Should change range fields visibility', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                pdfExport : {
                    exportServer : '/export'
                }
            }
        });

        await scheduler.features.pdfExport.showExportDialog();

        const
            { widgetMap } = scheduler.features.pdfExport.exportDialog,
            {
                scheduleRangeField,
                rangeStartField,
                rangeEndField
            } = widgetMap;

        t.elementIsNotVisible(rangeStartField.element, 'Range start field is not visible');
        t.elementIsNotVisible(rangeEndField.element, 'Range end field is not visible');

        scheduleRangeField.value = ScheduleRange.daterange;

        t.elementIsVisible(rangeStartField.element, 'Range start field is visible');
        t.elementIsVisible(rangeEndField.element, 'Range end field is visible');

        scheduleRangeField.value = ScheduleRange.completeview;

        t.elementIsNotVisible(rangeStartField.element, 'Range start field is not visible');
        t.elementIsNotVisible(rangeEndField.element, 'Range end field is not visible');
    });
});
