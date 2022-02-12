import { Scheduler } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

//region Data

const
    resources = [
        { id : 'r1', name : 'Mike' },
        { id : 'r2', name : 'Linda' },
        { id : 'r3', name : 'Don' },
        { id : 'r4', name : 'Karen' },
        { id : 'r5', name : 'Doug' },
        { id : 'r6', name : 'Peter' },
        { id : 'r7', name : 'Sam' },
        { id : 'r8', name : 'Melissa' },
        { id : 'r9', name : 'John' },
        { id : 'r10', name : 'Ellen' }
    ],
    events = [
        {
            resourceId : 'r1',
            startDate  : new Date(2017, 0, 1, 10),
            endDate    : new Date(2017, 0, 1, 12),
            name       : 'Click me',
            iconCls    : 'b-fa b-fa-mouse-pointer'
        },
        {
            resourceId : 'r2',
            startDate  : new Date(2017, 0, 1, 12),
            endDate    : new Date(2017, 0, 1, 13, 30),
            name       : 'Drag me',
            iconCls    : 'b-fa b-fa-arrows-alt'
        },
        {
            resourceId : 'r3',
            startDate  : new Date(2017, 0, 1, 14),
            endDate    : new Date(2017, 0, 1, 16),
            name       : 'Double click me',
            eventColor : 'purple',
            iconCls    : 'b-fa b-fa-mouse-pointer'
        },
        {
            resourceId : 'r4',
            startDate  : new Date(2017, 0, 1, 8),
            endDate    : new Date(2017, 0, 1, 11),
            name       : 'Right click me',
            iconCls    : 'b-fa b-fa-mouse-pointer'
        },
        {
            resourceId : 'r5',
            startDate  : new Date(2017, 0, 1, 15),
            endDate    : new Date(2017, 0, 1, 17),
            name       : 'Resize me',
            iconCls    : 'b-fa b-fa-arrows-alt-h'
        },
        {
            resourceId : 'r6',
            startDate  : new Date(2017, 0, 1, 16),
            endDate    : new Date(2017, 0, 1, 19),
            name       : 'Important meeting',
            iconCls    : 'b-fa b-fa-exclamation-triangle',
            eventColor : 'red'
        },
        {
            resourceId : 'r6',
            startDate  : new Date(2017, 0, 1, 6),
            endDate    : new Date(2017, 0, 1, 8),
            name       : 'Sports event',
            iconCls    : 'b-fa b-fa-basketball-ball'
        },
        {
            resourceId : 'r7',
            startDate  : new Date(2017, 0, 1, 9),
            endDate    : new Date(2017, 0, 1, 11, 30),
            name       : 'Dad\'s birthday!',
            iconCls    : 'b-fa b-fa-birthday-cake',
            style      : 'background-color : teal; font-size: 18px'
        }
    ];

//endregion

const scheduler = new Scheduler({
    appendTo         : 'container',
    resources,
    events,
    startDate        : new Date(2017, 0, 1, 6),
    endDate          : new Date(2017, 0, 1, 20),
    viewPreset       : 'hourAndDay',
    multiEventSelect : true,

    features : {
        eventDragSelect : true,
        eventDragCreate : false
    },

    columns : [
        { text : 'Name', field : 'name', width : 130 }
    ],

    listeners : {
        eventSelectionChange() {
            const count = scheduler.selectedEvents.length;

            scheduler.widgetMap.countLabel.html = `${count} event${count === 1 ? '' : 's'} selected`;
        }
    },

    tbar : [
        {
            type  : 'checkbox',
            label : 'Unified drag',
            onChange({ checked }) {
                scheduler.features.eventDrag.unifiedDrag = checked;
            }
        },
        '->',
        {
            type : 'widget',
            ref  : 'countLabel',
            html : '0 events selected'
        }
    ]
});
