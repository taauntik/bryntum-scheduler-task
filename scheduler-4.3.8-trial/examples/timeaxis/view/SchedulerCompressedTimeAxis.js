import Scheduler from '../../../lib/Scheduler/view/Scheduler.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';

const
    DH            = DateHelper,
    sleepingEmoji = '\u{1F634}',
    eatingEmoji   = '\u{1F96A}',
    startTime     = 7,
    lunchTime     = 11,
    endTime       = 16,
    // 11:00 - 12:00 lunch time
    isLunch       = date => date.getHours() === lunchTime,
    // 7:00 - 11:00 && 12:00 - 16:00 working time
    isWorkingTime = date => !isLunch(date) && date.getHours() >= startTime && date.getHours() < endTime;

export default class SchedulerCompressedTimeAxis extends Scheduler {
    // Factoryable type name
    static get type() {
        return 'schedulercompressedtimeaxis';
    }

    static get defaultConfig() {
        return {
            eventStyle : 'colored',

            features : {
                sort        : 'name',
                stripe      : true,
                eventResize : {
                    showExactResizePosition : true
                }
            },

            zoomOnTimeAxisDoubleClick : false,
            zoomOnMouseWheel          : false,

            viewPreset : {
                displayDateFormat : 'H:mm',
                tickWidth         : 40,
                shiftIncrement    : 1,
                shiftUnit         : 'DAY',
                timeResolution    : {
                    unit      : 'MINUTE',
                    increment : 30
                },
                headers : [
                    {
                        unit       : 'DAY',
                        align      : 'center',
                        dateFormat : 'ddd L'
                    },
                    {
                        unit      : 'MINUTE',
                        align     : 'center',
                        increment : 30,
                        renderer  : date => isWorkingTime(date) ? DH.format(date, 'H:mm') : (isLunch(date) ? eatingEmoji : sleepingEmoji)
                    }
                ]
            },

            timeAxis : {
                continuous : false,
                generateTicks(start, end, unit, increment) {
                    // Use our own custom time intervals for minute time-axis
                    if (unit === 'minute') {
                        const
                            // add early morning
                            ticks = [{
                                startDate : start,
                                endDate   : DH.add(start, startTime, 'hours')
                            }];

                        // generate the 1st half of the day
                        for (let date = ticks[0].endDate; date.getHours() < lunchTime;) {
                            const tickEnd = DH.add(date, 30, 'minute');

                            ticks.push({
                                startDate : date,
                                endDate   : tickEnd
                            });

                            date = tickEnd;
                        }

                        // add lunch
                        const lunchStart = ticks[ticks.length - 1].endDate;

                        ticks.push({
                            startDate : lunchStart,
                            endDate   : DH.add(lunchStart, 1, 'hour')
                        });

                        // generate the 2nd half of the day
                        for (let date = ticks[ticks.length - 1].endDate; date.getHours() < endTime;) {
                            const tickEnd = DH.add(date, 30, 'minute');

                            ticks.push({
                                startDate : date,
                                endDate   : tickEnd
                            });

                            date = tickEnd;
                        }

                        // add the rest of the day
                        ticks.push({
                            startDate : ticks[ticks.length - 1].endDate,
                            endDate   : end
                        });

                        return ticks;
                    }
                }
            },

            rowHeight : 60,

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
                    startDate  : '2020-02-20 06:30',
                    endDate    : '2020-02-20 08:30',
                    name       : 'Morning task',
                    eventColor : 'blue'
                },
                {
                    id         : 2,
                    resourceId : 'r2',
                    startDate  : '2020-02-20 10:00',
                    endDate    : '2020-02-20 13:00',
                    name       : 'No lunch task',
                    eventColor : 'lime'
                },
                {
                    id         : 3,
                    resourceId : 'r3',
                    startDate  : '2020-02-20 17:00',
                    endDate    : '2020-02-20 20:00',
                    name       : 'Night task',
                    eventColor : 'red'
                },
                {
                    id         : 4,
                    resourceId : 'r5',
                    startDate  : '2020-02-20 11:30',
                    endDate    : '2020-02-20 20:00',
                    name       : 'After lunch overtime',
                    eventColor : 'orange'
                }
            ],

            // Setup static columns
            columns : [
                { text : 'Name', width : 100, field : 'name' }
            ]
        };
    }
};

// Register this widget type with its Factory
SchedulerCompressedTimeAxis.initClass();
