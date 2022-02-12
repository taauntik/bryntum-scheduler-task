import Scheduler from '../../../lib/Scheduler/view/Scheduler.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';

export default class SchedulerCustomTimeAxis extends Scheduler {
    // Factoryable type name
    static get type() {
        return 'schedulercustomtimeaxis';
    }

    static get defaultConfig() {
        return {
            eventStyle : 'colored',

            features : {
                sort        : 'name',
                eventResize : {
                    showExactResizePosition : true
                }
            },

            rowHeight                 : 60,
            zoomOnTimeAxisDoubleClick : false,
            // Custom preset to display work hours (each hour) below days
            viewPreset                : {
                displayDateFormat : 'H:mm',
                tickWidth         : 25,
                shiftIncrement    : 1,
                shiftUnit         : 'WEEK',
                timeResolution    : {
                    unit      : 'MINUTE',
                    increment : 60
                },
                headers           : [
                    {
                        unit       : 'DAY',
                        align      : 'center',
                        dateFormat : 'ddd L'
                    },
                    {
                        unit       : 'HOUR',
                        align      : 'center',
                        dateFormat : 'H'
                    }
                ]
            },

            // Custom time axis
            timeAxis : {
                continuous : false,

                generateTicks(start, end, unit, increment) {
                    const ticks = [];

                    while (start < end) {

                        if (unit !== 'hour' || start.getHours() >= 8 && start.getHours() <= 21) {
                            ticks.push({
                                id        : ticks.length + 1,
                                startDate : start,
                                endDate   : DateHelper.add(start, increment, unit)
                            });
                        }

                        start = DateHelper.add(start, increment, unit);
                    }
                    return ticks;
                }
            },

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
                    startDate  : '2019-02-11 12:00',
                    endDate    : '2019-02-11 16:00',
                    name       : 'Some task',
                    eventColor : 'pink'
                },
                {
                    id         : 2,
                    resourceId : 'r2',
                    startDate  : '2019-02-12 08:00',
                    endDate    : '2019-02-12 14:00',
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

            // Setup static columns
            columns : [
                { text : 'Name', width : 100, field : 'name' }
            ]
        };
    }
}

// Register this widget type with its Factory
SchedulerCustomTimeAxis.initClass();
