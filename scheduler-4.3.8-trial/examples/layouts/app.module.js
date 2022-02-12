import { Scheduler, StringHelper } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';


// Simple custom sorter that sorts late start before early start
function customSorter(a, b) {
    return b.startDate.getTime() - a.startDate.getTime();
}

const scheduler = new Scheduler({
    appendTo          : 'container',
    resourceImagePath : '../_shared/images/users/',
    eventStyle        : 'colored',

    features : {
        cellEdit : {
            // Start cell editing on click
            triggerEvent : 'cellclick'
        }
    },

    listeners : {
        // Auto-show picker on cell editing
        startCellEdit({ editorContext }) {
            editorContext.editor.inputField.showPicker?.();
        }
    },

    columns : [
        { type : 'resourceInfo', text : 'Staff' },
        {
            text   : 'Layout',
            field  : 'eventLayout',
            // Config for the editor.inputField
            editor : {
                type        : 'combo',
                editable    : false,
                placeholder : 'Inherit',
                items       : [
                    ['', 'Inherit'],
                    ['stack', 'Stack'],
                    ['pack', 'Pack'],
                    ['none', 'Overlap']
                ]
            },
            renderer : ({ value, column }) => {
                return {
                    class    : 'layoutCellContent',
                    children : [
                        {
                            tag  : 'span',
                            html : column.editor.store.getById(value)?.text ?? 'Inherit'
                        },
                        {
                            tag   : 'i',
                            class : 'b-fa b-fa-pen'
                        }
                    ]
                };
            }
        }
    ],

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

    barMargin   : 1,
    rowHeight   : 50,
    eventLayout : 'stack',
    startDate   : new Date(2017, 1, 7, 8),
    endDate     : new Date(2017, 1, 7, 18),
    viewPreset  : 'hourAndDay',

    eventRenderer({ eventRecord, resourceRecord, renderData }) {
        // Color by resource
        renderData.eventColor = resourceRecord.firstStore.indexOf(resourceRecord) % 2 === 0 ? 'green' : 'orange';
        // Icon by type
        renderData.iconCls = eventRecord.eventType === 'Meeting' ? 'b-fa b-fa-calendar' : 'b-fa b-fa-calendar-alt';

        // Encode name to protect against xss
        return StringHelper.encodeHtml(eventRecord.name);
    },

    tbar : [
        {
            type        : 'buttonGroup',
            toggleGroup : true,
            defaults    : {
                width : '8em'
            },
            items : [
                {
                    id      : 'stack',
                    type    : 'button',
                    ref     : 'stackButton',
                    text    : 'Stack',
                    pressed : true
                },
                {
                    id   : 'pack',
                    type : 'button',
                    ref  : 'packButton',
                    text : 'Pack'
                },
                {
                    id   : 'none',
                    type : 'button',
                    ref  : 'noneButton',
                    text : 'Overlap'
                }
            ],
            onAction({ source : button }) {
                scheduler.eventLayout = button.id;
            }
        },
        {
            type        : 'button',
            ref         : 'customButton',
            text        : 'Custom sorter',
            toggleable  : true,
            icon        : 'b-fa-square',
            pressedIcon : 'b-fa-check-square',
            tooltip     : 'Click to use a custom event sorting function',
            onToggle    : ({ pressed }) => {
                scheduler.horizontalEventSorterFn = pressed ? customSorter : null;
            }
        }
    ]
});
