import { Scheduler, DateHelper, ResourceTimeRangeModel, RecurringTimeSpan, RecurringTimeSpansMixin, ResourceTimeRangeStore } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

//region Data

const resources          = [
        { id : 'r1', name : 'Mike' },
        { id : 'r2', name : 'Linda' },
        { id : 'r3', name : 'Lisa' },
        { id : 'r4', name : 'Madison' },
        { id : 'r5', name : 'Mark' },
        { id : 'r6', name : 'Kate' },
        { id : 'r7', name : 'Dan' },
        { id : 'r8', name : 'Henrik' },
        { id : 'r9', name : 'Rob' },
        { id : 'r10', name : 'Gloria' }
    ],
    events             = [
        {
            id         : 1,
            resourceId : 'r1',
            startDate  : new Date(2019, 0, 1, 8),
            endDate    : new Date(2019, 0, 1, 11),
            name       : 'Investigation',
            iconCls    : 'b-fa b-fa-search'
        }, {
            id         : 2,
            resourceId : 'r1',
            startDate  : new Date(2019, 0, 1, 13),
            endDate    : new Date(2019, 0, 1, 15),
            name       : 'Brief',
            iconCls    : 'b-fa b-fa-newspaper'
        },
        {
            id         : 3,
            resourceId : 'r2',
            startDate  : new Date(2019, 0, 1, 8),
            endDate    : new Date(2019, 0, 1, 9, 30),
            name       : 'Scrum',
            iconCls    : 'b-fa b-fa-bullhorn'
        },
        {
            id         : 4,
            resourceId : 'r3',
            startDate  : new Date(2019, 0, 1, 8),
            endDate    : new Date(2019, 0, 1, 9, 30),
            name       : 'Scrum',
            iconCls    : 'b-fa b-fa-bullhorn'
        },
        {
            id         : 5,
            resourceId : 'r4',
            startDate  : new Date(2019, 0, 1, 7),
            endDate    : new Date(2019, 0, 1, 11),
            name       : 'Meeting',
            iconCls    : 'b-fa b-fa-calendar'
        },
        {
            id         : 6,
            resourceId : 'r4',
            startDate  : new Date(2019, 0, 1, 15),
            endDate    : new Date(2019, 0, 1, 17),
            name       : 'Meeting',
            iconCls    : 'b-fa b-fa-calendar',
            eventColor : 'blue'
        },
        {
            id         : 7,
            resourceId : 'r6',
            startDate  : new Date(2019, 0, 1, 12, 30),
            endDate    : new Date(2019, 0, 1, 19),
            name       : 'Important meeting',
            iconCls    : 'b-fa b-fa-exclamation-triangle',
            eventColor : 'red'
        },
        {
            id         : 8,
            resourceId : 'r6',
            startDate  : new Date(2019, 0, 1, 9),
            endDate    : new Date(2019, 0, 1, 12),
            name       : 'Generic meeting',
            iconCls    : 'b-fa b-fa-calendar'
        },
        {
            id         : 9,
            resourceId : 'r7',
            startDate  : new Date(2019, 0, 1, 9),
            endDate    : new Date(2019, 0, 1, 11),
            name       : 'Dad\'s birthday',
            iconCls    : 'b-fa b-fa-birthday-cake',
            eventColor : 'green'
        },
        {
            id         : 10,
            resourceId : 'r9',
            startDate  : new Date(2019, 0, 1, 13),
            endDate    : new Date(2019, 0, 1, 20),
            name       : 'Golf tournament',
            iconCls    : 'b-fa b-fa-golf-ball',
            eventColor : 'green'
        }
    ],

    resourceTimeRanges = [
        {
            id             : 1,
            resourceId     : 'r1',
            startDate      : '2019-01-01T11:00',
            endDate        : '2019-01-01T13:00',
            name           : 'Lunch',
            // this time range should repeat every day
            recurrenceRule : 'FREQ=DAILY'
        },
        { id : 2, resourceId : 'r8', startDate : '2019-01-01T11:00', endDate : '2019-01-01T13:00', name : 'Lunch' },
        { id : 3, resourceId : 'r9', startDate : '2019-01-01T11:00', endDate : '2019-01-01T13:00', name : 'Lunch' },
        { id : 4, resourceId : 'r10', startDate : '2019-01-01T11:00', endDate : '2019-01-01T13:00', name : 'Lunch' },
        { id : 5, resourceId : 'r3', startDate : '2019-01-01T12:00', endDate : '2019-01-01T14:00', name : 'Lunch' },
        { id : 6, resourceId : 'r4', startDate : '2019-01-01T12:00', duration : 2, durationUnit : 'h', name : 'Lunch' },
        { id : 7, resourceId : 'r2', startDate : '2019-01-01T10:00', endDate : '2019-01-01T17:00', name : 'AFK (uses timeRangeColor)', timeRangeColor : 'red' },
        { id : 8, resourceId : 'r7', startDate : '2019-01-01T12:00', endDate : '2019-01-01T18:00', name : 'Afternoon off (custom style)', style : 'background: rgba(255,165,0,.3);color : orange' },
        { id : 9, resourceId : 'r5', startDate : '2019-01-01T06:00', endDate : '2019-01-01T20:00', name : 'Parental leave (custom CSS)', cls : 'custom' }
    ];

// We want to use recurring time ranges (see first entry in resourceTimeRanges array above)
// so we make a special model extending standard ResourceTimeRangeModel
// with RecurringTimeSpan which adds recurrence support
class MyResourceTimeRange extends RecurringTimeSpan(ResourceTimeRangeModel) {};

// Define a new store extending standard ResourceTimeRangeStore
// with RecurringTimeSpansMixin mixin to add recurrence support to the store.
// This store will contain time ranges.
class MyResourceTimeRangeStore extends RecurringTimeSpansMixin(ResourceTimeRangeStore) {
    static get defaultConfig() {
        return {
            // use our new MyResourceTimeRange model
            modelClass : MyResourceTimeRange
        };
    }
};

// Instantiate store for resourceTimeRanges using our new classes
const resourceTimeRangeStore = new MyResourceTimeRangeStore({
    data : resourceTimeRanges
});

//endregion

let newRangeCount = 0;

const scheduler = new Scheduler({
    appendTo : 'container',

    startDate         : new Date(2019, 0, 1, 6),
    endDate           : new Date(2019, 0, 1, 20),
    viewPreset        : 'hourAndDay',
    rowHeight         : 90,
    barMargin         : 3,
    resourceMargin    : 25,
    resourceImagePath : '../_shared/images/users/',

    eventStyle : 'plain',
    eventColor : 'blue',

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 }
    ],

    features : {
        resourceTimeRanges : true
    },

    resources,
    events,
    // the store will be used by the "resourceTimeRanges" feature
    resourceTimeRangeStore,

    tbar : [
        {
            type     : 'button',
            icon     : 'b-icon-add',
            text     : 'Add new range',
            onAction : () => {
                if (newRangeCount < 10) {
                    scheduler.resourceTimeRangeStore.add({
                        name           : 'New time range',
                        startDate      : new Date(2019, 0, 1, 6),
                        duration       : 2,
                        durationUnit   : 'h',
                        timeRangeColor : 'green',
                        resourceId     : 'r' + (++newRangeCount)
                    });
                }
            }
        },
        {
            type     : 'button',
            icon     : 'b-fa-clock',
            text     : 'Move lunch',
            onAction : () => {
                scheduler.resourceTimeRangeStore.forEach(range => {
                    if (range.name === 'Lunch') {
                        range.startDate = DateHelper.add(range.startDate, 1, 'hour');
                    }
                });
            }
        }
    ]
});
