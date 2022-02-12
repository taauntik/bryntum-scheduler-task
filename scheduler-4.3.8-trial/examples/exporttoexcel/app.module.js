import { DateHelper, Scheduler, StringHelper } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

const scheduler = new Scheduler({
    appendTo          : 'container',
    eventStyle        : 'border',
    resourceImagePath : '../_shared/images/users/',

    features : {
        excelExporter : {
            // Choose the date format for date fields
            dateFormat : 'YYYY-MM-DD HH:mm'
        }
    },

    subGridConfigs : {
        locked : { width : 400 }
    },

    columns : [
        {
            type : 'resourceInfo',
            text : 'Staff'
        },
        {
            text   : 'Type',
            field  : 'role',
            flex   : 1,
            editor : {
                type        : 'combo',
                items       : ['Core developer', 'Tech Sales', 'Sales', 'Developer & UX', 'CEO', 'CTO'],
                editable    : false,
                pickerWidth : 140
            }
        }
    ],

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    barMargin  : 2,
    rowHeight  : 50,
    startDate  : new Date(2017, 1, 7, 8),
    endDate    : new Date(2017, 1, 7, 22),
    viewPreset : {
        base      : 'hourAndDay',
        tickWidth : 100
    },

    // Specialized body template with header and footer
    eventBodyTemplate : data => StringHelper.xss`
        <i class="${data.iconCls || ''}"></i>
        <section>
            <div class="b-sch-event-header">${data.headerText}</div>
            <div class="b-sch-event-footer">${data.footerText}</div>
        </section>
    `,

    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        renderData.style = 'background-color:' + resourceRecord.color;

        return {
            headerText : DateHelper.format(eventRecord.startDate, 'LT'),
            footerText : eventRecord.name || '',
            iconCls    : eventRecord.iconCls
        };
    },

    tbar : [
        {
            type : 'widget',
            cls  : 'b-has-label',
            html : '<label>Export</label>'
        },
        {
            type  : 'buttongroup',
            items : [
                {
                    type     : 'button',
                    text     : 'Default settings',
                    ref      : 'excelExportBtn1',
                    icon     : 'b-fa-file-export',
                    onAction : () => scheduler.features.excelExporter.export()
                },
                {
                    type     : 'button',
                    text     : 'Custom column width',
                    ref      : 'excelExportBtn2',
                    icon     : 'b-fa-file-export',
                    onAction : () => scheduler.features.excelExporter.export({
                        filename       : 'Export with column width specified',
                        exporterConfig : {
                            // Choose the Resource fields to include in the exported file
                            columns      : [{ text : 'Staff', field : 'name' }],
                            // Choose the Event fields to include in the exported file
                            eventColumns : [
                                { text : 'Task', field : 'name', width : 200 },
                                { text : 'Starts', field : 'startDate', width : 200 },
                                { text : 'Ends', field : 'endDate', width : 200 }
                            ]
                        }
                    })
                },
                {
                    type     : 'button',
                    text     : 'All event fields',
                    ref      : 'excelExportBtn3',
                    icon     : 'b-fa-file-export',
                    onAction : () => {
                        const fields = [];

                        // The superclass fieldMaps are all prototype chained in, so no hasOwnProperty required
                        for (const fieldName in scheduler.eventStore.modelClass.fieldMap) {
                            if (scheduler.eventStore.modelClass.fieldMap[fieldName].persist !== false) {
                                fields.push(fieldName);
                            }
                        }

                        scheduler.features.excelExporter.export({
                            filename       : 'Export all event fields',
                            exporterConfig : {
                                eventColumns : fields
                            }
                        });
                    }
                }
            ]
        }
    ]
});
