import Scheduler from '../../../lib/Scheduler/view/Scheduler.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';

export default class SchedulerFilterableTimeAxis extends Scheduler {
    // Factoryable type name
    static get type() {
        return 'schedulerfilterabletimeaxis';
    }

    static get configurable() {
        return {
            tbar : [
                {
                    type        : 'buttonGroup',
                    color       : 'b-orange',
                    toggleGroup : true,
                    items       : [
                        {
                            type    : 'button',
                            text    : 'No filter',
                            onClick : 'up.onClearFilterClick',
                            pressed : true
                        },

                        {
                            type    : 'button',
                            text    : 'Only weekdays',
                            onClick : 'up.onWeekdaysClick'
                        },
                        {
                            type    : 'button',
                            text    : 'Only weekends',
                            onClick : 'up.onWeekendsClick'
                        },
                        {
                            type    : 'button',
                            text    : 'Only days with booked events',
                            onClick : 'up.onBookedClick'
                        }
                    ]
                }
            ],

            zoomOnTimeAxisDoubleClick : false,

            features : {
                sort : 'name'
            },

            forceFit : true,

            columns : [
                { text : 'Name', width : 100, field : 'name' }
            ]
        };
    }

    construct(config) {
        const me = this;

        // Custom preset to display number of events per day in header
        Object.assign(config, {
            resources : [
                { id : 'r1', name : 'Mike' },
                { id : 'r2', name : 'Linda' },
                { id : 'r3', name : 'Don' },
                { id : 'r4', name : 'Karen' },
                { id : 'r5', name : 'Doug' },
                { id : 'r6', name : 'Peter' },
                { id : 'r7', name : 'Fred' },
                { id : 'r8', name : 'Lisa' },
                { id : 'r9', name : 'Annie' },
                { id : 'r10', name : 'Dan' }
            ],

            events : [
                {
                    id         : 1,
                    resourceId : 'r9',
                    startDate  : '2019-02-16 12:00',
                    endDate    : '2019-02-16 16:00',
                    name       : 'Some task',
                    eventColor : 'pink'
                },
                {
                    id         : 2,
                    resourceId : 'r2',
                    startDate  : '2019-02-10 08:00',
                    endDate    : '2019-02-10 14:00',
                    name       : 'Other task',
                    eventColor : 'gray'
                },
                {
                    id         : 3,
                    resourceId : 'r10',
                    startDate  : '2019-02-15 08:00',
                    endDate    : '2019-02-15 14:00',
                    name       : 'Important task',
                    eventColor : 'orange'
                }
            ],
            viewPreset : {
                tickWidth         : 20,
                displayDateFormat : 'L',
                shiftUnit         : 'WEEK',
                shiftIncrement    : 1,
                defaultSpan       : 10,
                timeResolution    : {
                    unit      : 'HOUR',
                    increment : 6
                },
                headers : [
                    {
                        unit       : 'WEEK',
                        dateFormat : 'ddd D MMM YYYY'
                    },
                    {
                        unit       : 'DAY',
                        align      : 'center',
                        dateFormat : 'd1'
                    },
                    {
                        unit  : 'DAY',
                        align : 'center',
                        renderer(start, end, config, index) {
                            return me.eventStore.getEvents({
                                startDate : start,
                                endDate   : end
                            }).length;
                        }
                    }
                ]
            }
        });

        super.construct(config);

        // Refresh headers on changes to the eventStore, to show the amount of tasks per day
        me.eventStore.on('change', () => {
            me.timeAxisColumn.refreshHeader();
        });
    }

    eventRenderer({ eventRecord }) {
        return DateHelper.format(eventRecord.startDate, 'L');
    }

    //region eventlisteners
    onClearFilterClick() {
        this.timeAxis.clearFilters();
    }

    onWeekdaysClick() {
        this.timeAxis.filterBy(tick => tick.startDate.getDay() !== 6 && tick.startDate.getDay() !== 0);
    }

    onWeekendsClick() {
        this.timeAxis.filterBy(tick => tick.startDate.getDay() === 6 || tick.startDate.getDay() === 0);
    }

    onBookedClick() {
        this.timeAxis.filterBy(tick => {
            return this.eventStore.query(eventRecord => {
                return DateHelper.intersectSpans(
                    eventRecord.startDate,
                    eventRecord.endDate,
                    tick.startDate,
                    tick.endDate
                );
            }).length > 0;
        });
    }

    //endregion
}

// Register this widget type with its Factory
SchedulerFilterableTimeAxis.initClass();
