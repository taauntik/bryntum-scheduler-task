/**
 * Application config file
 */

export const schedulerConfig = {
    rowHeight : 70,

    enableRecurringEvents : true,
    resourceImagePath     : 'assets/users/',

    features : {
        sort         : 'name',
        eventTooltip : true,
        labels       : {
            top : {
                field : 'name'
            }
        }
    },

    columns : [
        { type : 'resourceInfo', text : 'Name' }
    ],

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

    startDate  : new Date(2018, 0, 1),
    endDate    : new Date(2018, 4, 1),
    viewPreset : 'weekAndDayLetter',
    eventRenderer({ resourceRecord, renderData, eventRecord }): string {
        renderData.iconCls = eventRecord.isRecurring ? 'b-fa b-fa-star' : (eventRecord.isOccurrence ? 'b-fa b-fa-sync' : 'b-fa b-fa-calendar');
        return eventRecord.name;
    }
};
