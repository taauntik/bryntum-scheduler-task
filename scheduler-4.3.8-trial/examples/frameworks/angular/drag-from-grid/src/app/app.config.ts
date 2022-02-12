/**
 * Application config file
 */

// Bryntum umd lite bundle comes without polyfills to support Angular's zone.js
import { EventModel } from '@bryntum/scheduler/scheduler.lite.umd.js';

export const schedulerConfig = {
    rowHeight  : 50,
    barMargin  : 4,
    eventColor : 'indigo',
    startDate  : new Date(2025, 11, 1, 8),
    endDate    : new Date(2025, 11, 1, 18),
    columns    : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            width          : 200,
            showEventCount : false,
            showRole       : true
        },
        {
            text     : 'Nbr tasks',
            editor   : false,
            renderer : (data): string => `${data.record.events.length || ''}`,
            align    : 'center',
            sortable : (a, b): number => a.events.length < b.events.length ? -1 : 1,
            width    : 100
        }
    ],
    viewPreset : {
        base           : 'hourAndDay',
        tickWidth      : 20,
        columnLinesFor : 0,
        headers        : [
            {
                unit       : 'd',
                align      : 'center',
                dateFormat : 'ddd DD MMM'
            },
            {
                unit       : 'h',
                align      : 'center',
                dateFormat : 'HH'
            }
        ]
    },

    stripeFeature     : true,
    timeRangesFeature : true,
    resourceImagePath : 'assets/users/',

    eventMenuFeature : {
        items : {
            // custom item with inline handler
            unassign : {
                text   : 'Unassign',
                icon   : 'b-fa b-fa-user-times',
                weight : 200,
                onItem : ({ eventRecord, resourceRecord }): void => eventRecord.unassign(resourceRecord)
            }
        }
    },

    crudManager : {
        autoLoad   : true,
        eventStore : {
            modelClass   : EventModel,
            durationUnit : 'h'
        },
        transport : {
            load : {
                url : 'assets/data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    }
};

export const gridConfig = {

    store : {
        readUrl      : 'assets/data/unplanned.json',
        autoLoad     : true,
        modelClass   : EventModel,
        durationUnit : 'h'
    },

    stripeFeature : true,
    sortFeature   : 'name',

    columns : [{
        text       : 'Unassigned tasks',
        flex       : 1,
        field      : 'name',
        htmlEncode : false,
        renderer   : (data): string => `<i class="${data.record.iconCls}"></i>${data.record.name}`
    }, {
        text     : 'Duration',
        width    : 100,
        align    : 'right',
        editor   : false,
        field    : 'duration',
        renderer : (data): string => `${data.record.duration} ${data.record.durationUnit}`
    }],

    rowHeight : 50

};
