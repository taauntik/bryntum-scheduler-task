import { Scheduler, DateHelper } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

const scheduler = new Scheduler({
    appendTo          : 'container',
    eventStyle        : 'border',
    resourceImagePath : '../_shared/images/users/',

    features : {
        sort   : 'name',
        labels : {
            // Labels take part in event layout using an estimated width based on their text length
            labelLayoutMode : 'estimate',

            // Using renderer
            top : {
                // Label showing id or [Unsynced event] for new events
                renderer : ({ eventRecord }) => eventRecord.hasGeneratedId ? '[Unsynced event]' : `#${eventRecord.id}`
            },

            // Using renderer, just different way of defining it compared to top label
            bottom({ resourceRecord, domConfig }) {
                if (resourceRecord.category === 'Testers') {
                    domConfig.className.custom = true;
                }
                return resourceRecord.category;
            },

            // Using field as label (will first look in event and then in resource)
            left : {
                field  : 'fullDuration',
                editor : {
                    type  : 'durationfield',
                    width : 110
                },
                renderer : ({ eventRecord }) => eventRecord.duration + ' ' +  DateHelper.getLocalizedNameOfUnit(eventRecord.durationUnit, eventRecord.duration !== 1)
            },

            // Using field
            right : {
                field : 'name'
            }
        }
    },

    columns : [
        {
            text   : 'Projects',
            width  : 100,
            field  : 'category',
            hidden : true
        },
        {
            type           : 'resourceInfo',
            text           : 'Staff',
            width          : 170,
            field          : 'name',
            showRole       : 'category',
            showEventCount : false
        },
        {
            text  : 'Employment type',
            width : 120,
            field : 'type'
        }
    ],

    rowHeight : 60,
    barMargin : 0,
    startDate : new Date(2020, 0, 5),
    endDate   : new Date(2020, 0, 12),

    // Customize preset
    viewPreset : {
        base              : 'dayAndWeek',
        displayDateFormat : 'YYYY-MM-DD',
        timeResolution    : {
            unit      : 'hour',
            increment : 6
        }
    },

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

    eventRenderer({ resourceRecord, renderData }) {
        const colors = {
            Consultants : 'orange',
            Research    : 'pink',
            Sales       : 'lime',
            Testers     : 'cyan'
        };

        renderData.eventColor = colors[resourceRecord.category];

        return '';
    },

    tbar : [
        {
            type : 'widget',
            cls  : 'b-has-label',
            html : '<label>Label layout</label>'
        },
        {
            type        : 'buttongroup',
            toggleGroup : true,
            items       : [
                {
                    ref     : 'estimate',
                    text    : 'Estimate',
                    pressed : true,
                    tooltip : 'Part of event layout by estimating size based on content length'
                },
                {
                    ref     : 'measure',
                    text    : 'Measure',
                    tooltip : 'Part of event layout by measuring size (expensive)'
                },
                {
                    ref     : 'default',
                    text    : 'None',
                    tooltip : 'Not part of event layout, might be overlapped'
                }
            ],
            onClick({ source }) {
                // Use `ref` as a value for labelLayoutMode
                scheduler.features.labels.labelLayoutMode = source.ref;
            }
        }
    ]
});
