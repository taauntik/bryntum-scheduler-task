import { Scheduler, RecurringTimeSpan, TimeSpan, RecurringTimeSpansMixin, Store, DateHelper } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';


//region Data

// Define a new Model extending TimeSpan class
// with RecurringTimeSpan mixin which adds recurrence support
class MyTimeRange extends RecurringTimeSpan(TimeSpan) {}

// Define a new store extending the Store class
// with RecurringTimeSpansMixin mixin to add recurrence support to the store.
// This store will contain time ranges.
class MyTimeRangeStore extends RecurringTimeSpansMixin(Store) {
    static get defaultConfig() {
        return {
            // use our new MyTimeRange model
            modelClass : MyTimeRange,
            storeId    : 'timeRanges'
        };
    }
}

// instantiate store for time ranges using our new classes
const myTimeRangeStore = new MyTimeRangeStore();

//endregion

const scheduler = new Scheduler({
    appendTo          : 'container',
    eventStyle        : 'colored',
    resourceImagePath : '../_shared/images/users/',

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
                url : 'data/data.json'
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
    },

    tbar : [
        {
            type    : 'button',
            ref     : 'addCoffeeButton',
            icon    : 'b-fa-coffee',
            text    : 'More coffee',
            tooltip : 'Click to add morning coffee to Thursdays too',
            onAction({ source : button }) {
                const coffee = scheduler.features.timeRanges.store.getById(1);

                coffee.recurrenceRule = 'FREQ=WEEKLY;BYDAY=MO,TH;';

                button.disable();
            }
        },
        '->',
        {
            type  : 'buttongroup',
            items : [
                {
                    type    : 'button',
                    icon    : 'b-fa-angle-left',
                    tooltip : 'View previous day',
                    onAction() {
                        scheduler.shiftPrevious();
                    }
                },
                {
                    type    : 'button',
                    ref     : 'todayButton',
                    text    : 'Today',
                    tooltip : 'View today, to see the current time line',
                    onAction() {
                        const today = DateHelper.clearTime(new Date());
                        today.setHours(5);
                        scheduler.setTimeSpan(today, DateHelper.add(today, 18, 'hour'));
                    }
                },
                {
                    type    : 'button',
                    icon    : 'b-fa-angle-right',
                    tooltip : 'View next day',
                    onAction() {
                        scheduler.shiftNext();
                    }
                }
            ]
        },
        {
            type    : 'button',
            text    : 'Start',
            tooltip : 'Return to initial view',
            onAction() {
                scheduler.setTimeSpan(new Date(2019, 1, 7, 8), new Date(2019, 1, 29, 18));
            }
        }
    ]
});
