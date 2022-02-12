import { Scheduler } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

const scheduler = new Scheduler({
    appendTo : 'container',

    resources : [
        { id : 1, name : 'Milestones galore' }
    ],
    events : [
        { id : 1, resourceId : 1, startDate : '2018-03-19', duration : 2, name : 'Event 1' },
        {
            id             : 2,
            resourceId     : 1,
            startDate      : '2018-03-19',
            duration       : 0,
            name           : 'Milestone with long text',
            // milestoneWidth is used if you specify `milestoneLayoutMode: 'data'`
            milestoneWidth : 200,
            eventColor     : 'blue'
        },
        { id : 3, resourceId : 1, startDate : '2018-03-20', duration : 2, name : 'Event 3' },
        {
            id             : 4,
            resourceId     : 1,
            startDate      : '2018-03-20',
            duration       : 0,
            name           : 'Milestone',
            milestoneWidth : 80,
            eventColor     : 'blue'
        },
        {
            id             : 5,
            resourceId     : 1,
            startDate      : '2018-03-20',
            duration       : 0,
            name           : 'MS',
            milestoneWidth : 0,
            eventColor     : 'blue'
        }
    ],

    startDate : '2018-03-19',
    endDate   : '2018-03-25',

    columns : [
        { text : 'Name', field : 'name', width : 130 }
    ],

    // Available modes are :
    // 'default'  - no layout
    // 'data'     - from milestoneWidth
    // 'estimate' - length * char width
    // 'measure'  _ precise but slowest
    milestoneLayoutMode : 'measure',

    // Width per char in px when using 'estimate'
    milestoneCharWidth : 10,

    // How to aligned milestones in relation to their (start)date
    milestoneAlign : 'center',

    tbar : [
        {
            type        : 'combo',
            ref         : 'preset',
            placeholder : 'Mode',
            editable    : false,
            inputWidth  : '13.5em',
            label       : 'Layout mode',
            items       : [
                ['default', 'Default (not part of layout)'],
                ['estimate', 'Estimate (using text length)'],
                ['data', 'Data (width from data)'],
                ['measure', 'Measure (slowest)']
            ],
            value : 'measure',
            onAction({ value }) {
                scheduler.milestoneLayoutMode = value;
            }
        },
        {
            type        : 'buttonGroup',
            toggleGroup : true,
            items       : [
                {
                    id      : 'start',
                    ref     : 'alignStart',
                    icon    : 'b-fa-align-left',
                    tooltip : 'Align "start" (left)'
                },
                {
                    id      : 'center',
                    ref     : 'alignCenter',
                    icon    : 'b-fa-align-center',
                    pressed : true,
                    tooltip : 'Align "center"'
                },
                {
                    id      : 'end',
                    ref     : 'alignEnd',
                    icon    : 'b-fa-align-right',
                    style   : 'margin-right: 1em',
                    tooltip : 'Align "end" (right)'
                }
            ],
            onAction({ source : button }) {
                scheduler.milestoneAlign = button.id;
            }
        }
    ]
});
