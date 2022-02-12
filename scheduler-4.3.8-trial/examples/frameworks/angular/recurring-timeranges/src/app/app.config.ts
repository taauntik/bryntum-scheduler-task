/**
 * Application config file
 */
import { SchedulerConfig } from '@bryntum/scheduler/scheduler.lite.umd.js';

import { MyTimeRangeStore } from './lib/MyTimeRange';

// instantiate store for time ranges using our new classes
const myTimeRangeStore = new MyTimeRangeStore();

export const schedulerConfig: Partial<SchedulerConfig> = {
    eventStyle        : 'colored',
    resourceImagePath : 'assets/users/',

    features : {
        timeRanges : {
            showCurrentTimeLine : true,
            showHeaderElements  : false
        }
    },

    columns : [
        { type : 'resourceInfo', text : 'Staff', field : 'name', width : '10em' }
    ],

    project : {
        // use our store for time ranges (crudManager will load it automatically among other project stores)
        timeRangeStore : myTimeRangeStore
    },

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'assets/data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    barMargin : 5,

    startDate  : new Date(2019, 1, 7, 8),
    endDate    : new Date(2019, 1, 29, 18),
    viewPreset : {
        tickWidth : 50,
        base      : 'dayAndWeek'
    }
};
