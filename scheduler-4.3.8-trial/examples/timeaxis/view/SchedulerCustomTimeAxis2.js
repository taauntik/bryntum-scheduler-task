import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import Scheduler from '../../../lib/Scheduler/view/Scheduler.js';

export default class SchedulerCustomTimeAxis2 extends Scheduler {
    // Factoryable type name
    static get type() {
        return 'schedulercustomtimeaxis2';
    }

    static get defaultConfig() {
        return {
            eventStyle : 'colored',

            features : {
                sort        : 'name',
                stripe      : true,
                headerMenu  : false,
                eventResize : {
                    showExactResizePosition : true
                }
            },
            zoomOnMouseWheel          : false,
            zoomOnTimeAxisDoubleClick : false,

            // Custom preset to display work hours below day
            viewPreset : {
                displayDateFormat : 'H:mm',
                shiftIncrement    : 1,
                shiftUnit         : 'WEEK',
                timeResolution    : {
                    unit      : 'MINUTE',
                    increment : 10
                },
                headers : [
                    {
                        unit       : 'DAY',
                        dateFormat : 'ddd D MMM'
                    },
                    {
                        unit : 'DAY',
                        renderer(start, end, cfg) {
                            cfg.headerCellCls = 'sch-hdr-startend';
                            return `<span>${DateHelper.format(start, 'H')}</span><span>${DateHelper.format(end, 'H')}</span>`;
                        }
                    }
                ]
            },

            rowHeight : 60,

            // Custom time axis
            timeAxis : {
                continuous : false,
                generateTicks(start, end, unit, increment) {
                    // Use our own custom time intervals for day time-axis
                    if (unit === 'day') {
                        const ticks = [];
                        let intervalEnd;

                        while (start < end) {
                            if (start.getDay() === 5) {
                                // Fridays are lazy days, working 10am - 4pm
                                start.setHours(10);
                                intervalEnd = DateHelper.add(start, 6, 'h');
                            }
                            else {
                                start.setHours(8);
                                intervalEnd = DateHelper.add(start, 8, 'h');
                            }

                            ticks.push({
                                id        : ticks.length + 1,
                                startDate : start,
                                endDate   : intervalEnd
                            });
                            start = DateHelper.add(start, 1, 'd');
                        }
                        return ticks;
                    }
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
                    eventColor : 'blue'
                },
                {
                    id         : 2,
                    resourceId : 'r2',
                    startDate  : '2019-02-13 08:00',
                    endDate    : '2019-02-13 14:00',
                    name       : 'Other task',
                    eventColor : 'lime'
                },
                {
                    id         : 3,
                    resourceId : 'r10',
                    startDate  : '2019-02-14 08:00',
                    endDate    : '2019-02-14 14:00',
                    name       : 'Important task',
                    eventColor : 'red'
                }
            ],

            // Setup static columns
            columns : [
                { text : 'Name', width : 100, field : 'name' }
            ]
        };
    }

    eventRenderer({ eventRecord }) {
        return DateHelper.format(eventRecord.startDate, 'H:mm') + ' - ' + DateHelper.format(eventRecord.endDate, 'H:mm');
    }

    // Constrain events horizontally within their current day
    getDateConstraints(resourceRecord, eventRecord) {
        if (eventRecord) {
            const { timeAxis } = this;

            let minDate, maxDate;

            // DragCreate supplies a date instead of an event record
            if (eventRecord instanceof Date) {
                const date = eventRecord,
                    tick = timeAxis.getAt(Math.floor(timeAxis.getTickFromDate(date)));

                minDate = tick.startDate;
                maxDate = tick.endDate;
            }
            // EventResize & EventDrag
            else {
                const
                    constrainedStartDate = DateHelper.max(eventRecord.startDate, timeAxis.startDate),
                    constrainedEndDate   = DateHelper.min(eventRecord.endDate, timeAxis.endDate);

                let endDateTick = timeAxis.getTickFromDate(constrainedEndDate);

                // If event ends at tick end, use prev tick end as constraining date
                if (endDateTick === Math.floor(endDateTick)) {
                    endDateTick--;
                }

                const
                    minTickRecord = timeAxis.getAt(Math.floor(timeAxis.getTickFromDate(constrainedStartDate))),
                    maxTickRecord = timeAxis.getAt(Math.floor(endDateTick));

                minDate = minTickRecord.startDate;
                maxDate = constrainedEndDate - timeAxis.endDate === 0 ? constrainedEndDate : maxTickRecord.endDate;
            }

            return {
                start : minDate,
                end   : maxDate
            };
        }
    }
}

// Register this widget type with its Factory
SchedulerCustomTimeAxis2.initClass();
