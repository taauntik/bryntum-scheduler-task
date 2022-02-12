import { DateHelper, PresetStore, EventModel, Scheduler, PresetManager } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';



//region Presets & Widgets

PresetManager.registerPreset('dayNightShift', {
    name              : 'Day/night shift (custom)',
    tickWidth         : 35,
    rowHeight         : 32,
    displayDateFormat : 'HH:mm',
    shiftIncrement    : 1,
    shiftUnit         : 'day',
    timeResolution    : {
        unit      : 'minute',
        increment : 15
    },
    defaultSpan     : 24,
    mainHeaderLevel : 1,
    headers         : [
        {
            unit       : 'day',
            increment  : 1,
            dateFormat : 'MMMM Do YYYY'
        },
        {
            unit      : 'hour',
            increment : 12,
            renderer(startDate, endDate, headerConfig, cellIdx) {
                if (startDate.getHours() === 0) {
                    // Setting a custom CSS on the header cell element
                    headerConfig.headerCellCls = 'b-fa b-fa-moon';

                    return DateHelper.format(startDate, 'MMM DD') + ' Night Shift';
                }
                else {
                    // Setting a custom CSS on the header cell element
                    headerConfig.headerCellCls = 'b-fa b-fa-sun';

                    return DateHelper.format(startDate, 'MMM DD') + ' Day Shift';
                }
            }
        },
        {
            unit       : 'hour',
            increment  : 1,
            dateFormat : 'H'
        }
    ]
});

PresetManager.registerPreset('weekNumberAndYear', {
    name              : 'Year/week number',
    tickWidth         : 35,
    rowHeight         : 32,
    displayDateFormat : '{w.}W YYYY',
    shiftIncrement    : 1,
    shiftUnit         : 'year',
    timeResolution    : {
        unit      : 'd',
        increment : 1
    },
    defaultSpan     : 24,
    mainHeaderLevel : 1,
    headers         : [
        {
            unit       : 'y',
            increment  : 1,
            dateFormat : 'YYYY'
        },
        {
            unit       : 'w',
            increment  : 1,
            dateFormat : 'WW'
        }
    ]
});

const
    requiredPresetIds = {
        secondAndMinute   : 1,
        minuteAndHour     : 1,
        hourAndDay        : 1,
        dayNightShift     : 1,
        weekAndDay        : 1,
        weekAndMonth      : 1,
        weekAndDayLetter  : 1,
        weekDateAndMonth  : 1,
        weekNumberAndYear : 1,
        monthAndYear      : 1,
        year              : 1,
        manyYears         : 1
    },
    // Create a presets store with just the ones we want.
    // The set of available Presets is what provides the zoom levels.
    presets     = PresetManager.records.filter(p => requiredPresetIds[p.id]),
    presetStore = new PresetStore({
        data : presets,

        // We'd like the order to go from seconds to years, rather than the default order
        zoomOrder : -1
    });

//endregion

//region Data

const
    resources = [
        { id : 1, name : 'Arcady', role : 'Core developer', eventColor : 'purple' },
        { id : 2, name : 'Dave', role : 'Tech Sales', eventColor : 'indigo' },
        { id : 3, name : 'Henrik', role : 'Sales', eventColor : 'blue' },
        { id : 4, name : 'Linda', role : 'Core developer', eventColor : 'cyan' },
        { id : 5, name : 'Maxim', role : 'Developer & UX', eventColor : 'green' },
        { id : 6, name : 'Mike', role : 'CEO', eventColor : 'lime' },
        { id : 7, name : 'Lee', role : 'CTO', eventColor : 'orange' }
    ],
    events    = [
        {
            id          : 1,
            resourceId  : 1,
            percentDone : 60,
            startDate   : new Date(2017, 0, 1, 10),
            endDate     : new Date(2017, 0, 1, 12)
        },
        {
            id          : 2,
            resourceId  : 2,
            percentDone : 20,
            startDate   : new Date(2017, 0, 1, 12),
            endDate     : new Date(2017, 0, 1, 17)
        },
        {
            id          : 3,
            resourceId  : 3,
            percentDone : 80,
            startDate   : new Date(2017, 0, 1, 14),
            endDate     : new Date(2017, 0, 1, 16)
        },
        {
            id          : 4,
            resourceId  : 4,
            percentDone : 90,
            startDate   : new Date(2017, 0, 1, 8),
            endDate     : new Date(2017, 0, 1, 11)
        },
        {
            id          : 5,
            resourceId  : 5,
            percentDone : 40,
            startDate   : new Date(2017, 0, 1, 15),
            endDate     : new Date(2017, 0, 1, 17)
        },
        {
            id          : 6,
            resourceId  : 6,
            percentDone : 70,
            startDate   : new Date(2017, 0, 1, 16),
            endDate     : new Date(2017, 0, 1, 18)
        }
    ];

//endregion

class EventModelWithPercent extends EventModel {
    static get fields() {
        return [
            { name : 'percentDone', type : 'number', defaultValue : 0 }
        ];
    }
}

const scheduler = new Scheduler({
    appendTo          : 'container',
    resourceImagePath : '../_shared/images/users/',

    features : {
        stripe : true,
        sort   : 'name'
    },

    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            width : '10em'
        }
    ],

    resources  : resources,
    eventStore : {
        modelClass : EventModelWithPercent,
        data       : events
    },

    startDate : new Date(2017, 0, 1),
    endDate   : new Date(2017, 0, 2),

    // Use our custom list of just the ones we plucked out of the PresetManager
    presets,

    viewPreset : 'dayNightShift',

    eventRenderer : ({ eventRecord, renderData }) => {
        const value = eventRecord.percentDone || 0;
        // Add a child to the event element (b-sch-event)
        renderData.children.push({
            className : 'value',
            style     : {
                width : `${value}%`
            },
            html : value
        });
    },

    listeners : {
        presetChange({ from, to }) {
            const { presetCombo, zoomInButton, zoomOutButton } = scheduler.widgetMap;

            presetCombo.value = to;

            // To disable buttons based on zoom levels use this code:
            // zoomOutButton.disabled = level <= 0;
            // zoomInButton.disabled = level >= this.presets.length - 1;

            // To disable buttons based on presets in combo use this code:
            const index = presetCombo.store.indexOf(presetCombo.record);
            zoomOutButton.disabled = index === 0;
            zoomInButton.disabled = index === presetCombo.store.count - 1;
        }
    },

    tbar : [
        {
            type         : 'combo',
            width        : 200,
            ref          : 'presetCombo',
            placeholder  : 'Preset',
            editable     : false,
            store        : presetStore,
            valueField   : 'id',
            displayField : 'name',
            value        : 'dayNightShift',
            picker       : {
                maxHeight : 500
            },
            onChange({ source : combo }) {
                scheduler.zoomToLevel(combo.selected);
            }
        },
        {
            type : 'button',
            ref  : 'zoomInButton',
            icon : 'b-icon-search-plus',
            text : 'Zoom in',
            onClick() {
                scheduler.zoomIn();
            }
        },
        {
            type : 'button',
            ref  : 'zoomOutButton',
            icon : 'b-icon-search-minus',
            text : 'Zoom out',
            onClick() {
                scheduler.zoomOut();
            }
        }
    ]
});
