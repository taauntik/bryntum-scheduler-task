/**
 * Scheduler config file
 */
import { Scheduler, StringHelper } from '@bryntum/scheduler/scheduler.umd';

const schedulerConfig = {
    eventColor : null,
    features   : { timeRanges : true },

    barMargin : 1,
    rowHeight : 50,

    resourceImagePath : 'users/',

    startDate : new Date(2017, 1, 7, 8),
    endDate   : new Date(2017, 1, 7, 18),

    viewPreset          : 'hourAndDay',
    useInitialAnimation : 'slide-from-left',

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

    // Columns in scheduler
    columns : [
        { type : 'resourceInfo', text : 'Staff', field : 'name', width : 150 },
        {
            text       : 'Task color',
            field      : 'eventColor',
            width      : 120,
            htmlEncode : false,
            renderer   : ({ record }) => `<div class="color-box b-sch-${record.eventColor}"></div>${StringHelper.capitalize(record.eventColor)}`,
            editor     : {
                type        : 'combo',
                items       : Scheduler.eventColors,
                editable    : false,
                listItemTpl : item => `<div class="color-box b-sch-${item.value}"></div><div>${item.value}</div>`
            }
        }
    ]

};

export default schedulerConfig;
