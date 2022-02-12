import { Scheduler } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

//region Data

const
    resources = [
        { id : 'r1', name : 'Arcady', role : 'Core developer' },
        { id : 'r2', name : 'Dave', role : 'Tech Sales' },
        { id : 'r3', name : 'Henrik', role : 'Sales' },
        { id : 'r4', name : 'Linda', role : 'Core developer' },
        { id : 'r5', name : 'Celia', role : 'Developer & UX' },
        { id : 'r6', name : 'Lisa', role : 'CEO' },
        { id : 'r7', name : 'Angelo', role : 'CTO' }
    ],
    events    = [
        {
            id         : 1,
            resourceId : 'r1',
            name       : 'Coding session',
            startDate  : new Date(2017, 0, 1, 10),
            endDate    : new Date(2017, 0, 1, 12),
            eventColor : 'orange',
            iconCls    : 'b-fa b-fa-code'
        },
        {
            id         : 2,
            resourceId : 'r2',
            name       : 'Conference call',
            startDate  : new Date(2017, 0, 1, 12),
            endDate    : new Date(2017, 0, 1, 15),
            eventColor : 'lime',
            iconCls    : 'b-fa b-fa-phone'
        },
        {
            id         : 3,
            resourceId : 'r3',
            name       : 'Meeting',
            startDate  : new Date(2017, 0, 1, 14),
            endDate    : new Date(2017, 0, 1, 17),
            eventColor : 'teal',
            iconCls    : 'b-fa b-fa-calendar'
        },
        {
            id         : 4,
            resourceId : 'r4',
            name       : 'Scrum',
            startDate  : new Date(2017, 0, 1, 8),
            endDate    : new Date(2017, 0, 1, 11),
            eventColor : 'blue',
            iconCls    : 'b-fa b-fa-comments'
        },
        {
            id         : 5,
            resourceId : 'r5',
            name       : 'Use cases',
            startDate  : new Date(2017, 0, 1, 15),
            endDate    : new Date(2017, 0, 1, 17),
            eventColor : 'violet',
            iconCls    : 'b-fa b-fa-users'
        },
        {
            id         : 6,
            resourceId : 'r6',
            name       : 'Golf',
            startDate  : new Date(2017, 0, 1, 16),
            endDate    : new Date(2017, 0, 1, 18),
            eventColor : 'pink',
            iconCls    : 'b-fa b-fa-golf-ball'
        }
    ];

//endregion

const scheduler = new Scheduler({
    appendTo          : 'container',
    rowHeight         : 60,
    barMargin         : 10,
    eventStyle        : 'colored',
    resourceImagePath : '../_shared/images/users/',
    features          : {
        // eventResize      : {
        //     showExactResizePosition: snap
        // },
        // eventDrag        : {
        //     showExactDropPosition : snap
        // },
        stripe : true
    },

    columns : [
        {
            type           : 'resourceInfo',
            text           : 'Name',
            showRole       : true,
            showEventCount : false,
            width          : '15em'
        }
    ],

    resources,

    events,

    startDate  : new Date(2017, 0, 1, 8),
    endDate    : new Date(2017, 0, 1, 19),
    viewPreset : 'hourAndDay',
    snap       : true,

    tbar : [
        {
            type    : 'checkbox',
            ref     : 'snap',
            label   : 'Use snapping',
            checked : true,
            onChange({ checked }) {
                scheduler.snap = checked;
            }
        },
        {
            type      : 'slider',
            ref       : 'resolution',
            width     : 130,
            text      : 'Time resolution',
            showValue : true,
            min       : 5,
            max       : 60,
            step      : 5,
            value     : 30,
            onChange({ value }) {
                scheduler.timeResolution = value;
            }
        },
        '->',
        {
            type      : 'slider',
            ref       : 'zoom',
            width     : 130,
            text      : 'Zoom',
            showValue : true,
            min       : 0,
            max       : 25,
            value     : 15,
            onInput({ value }) {
                scheduler.zoomLevel = value;
            }
        }
    ]
});
