import Scheduler from '../../../lib/Scheduler/view/Scheduler.js';

export default class SchedulerCustomTimeAxis3 extends Scheduler {
    // Factoryable type name
    static get type() {
        return 'schedulercustomtimeaxis3';
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
                        unit          : 'year',
                        // Simplified scenario, assuming view will always just show one US fiscal year
                        cellGenerator : (viewStart, viewEnd) => [{
                            start  : viewStart,
                            end    : viewEnd,
                            header : `Fiscal Year ${viewStart.getFullYear() + 1}`
                        }]
                    },
                    {
                        unit : 'quarter',
                        renderer(start, end) {
                            const
                                quarter       = Math.floor(start.getMonth() / 3) + 1,
                                fiscalQuarter = quarter === 4 ? 1 : (quarter + 1);

                            return `FQ${fiscalQuarter} ${start.getFullYear() + (fiscalQuarter === 1 ? 1 : 0)}`;
                        }
                    },
                    {
                        unit       : 'month',
                        dateFormat : 'MMM Y'
                    }
                ]
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
                    startDate  : '2021-02-11',
                    endDate    : '2021-02-28',
                    name       : 'Some task',
                    eventColor : 'blue'
                },
                {
                    id         : 2,
                    resourceId : 'r2',
                    startDate  : '2021-08-13',
                    endDate    : '2021-09-23',
                    name       : 'Other task',
                    eventColor : 'lime'
                },
                {
                    id         : 3,
                    resourceId : 'r3',
                    startDate  : '2021-02-24',
                    endDate    : '2021-06-24',
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
};

// Register this widget type with its Factory
SchedulerCustomTimeAxis3.initClass();
