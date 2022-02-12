import Scheduler from '../../../lib/Scheduler/view/Scheduler.js';
import '../../../lib/Grid/column/TemplateColumn.js';
import '../../../lib/Grid/feature/Stripe.js';
import '../../../lib/Grid/feature/Sort.js';
import '../../../lib/Scheduler/feature/TimeRanges.js';
import '../../../lib/Scheduler/feature/EventDrag.js';
import '../../../lib/Scheduler/feature/EventDragCreate.js';
import '../../../lib/Scheduler/feature/EventResize.js';
import '../../../lib/Scheduler/column/ResourceInfoColumn.js';
import DateHelper from '../../../lib/Core/helper/DateHelper.js';
import StringHelper from '../../../lib/Core/helper/StringHelper.js';

export default class Schedule extends Scheduler {
    /**
     * Original class name getter. See Widget.$name docs for the details.
     * @return {string}
     */
    static get $name() {
        return 'Schedule';
    }

    // Factoryable type name
    static get type() {
        return 'schedule';
    }

    static get defaultConfig() {
        return {
            features : {
                eventMenu : {
                    items : [
                        // custom item with inline handler
                        {
                            text   : 'Remove all equipment',
                            icon   : 'b-fa b-fa-times',
                            weight : 200,
                            onItem : ({ eventRecord }) => eventRecord.equipment = []
                        }
                    ]
                },
                eventEdit : {
                    // Add an extra combo box to the editor to select equipment
                    items : {
                        equipment : {
                            type         : 'combo',
                            weight       : 900, // At end
                            editable     : false,
                            multiSelect  : true,
                            valueField   : 'id',
                            displayField : 'name',
                            ref          : 'equipment',
                            name         : 'equipment',
                            label        : 'Equipment',
                            // Will be populated with items on first show
                            items        : []
                        }
                    }
                }
            },

            rowHeight         : 100,
            barMargin         : 4,
            eventColor        : 'indigo',
            resourceImagePath : '../_shared/images/users/',

            columns : [
                {
                    type           : 'resourceInfo',
                    text           : 'Name',
                    width          : 200,
                    showEventCount : false,
                    showRole       : true
                }
            ],

            // The crud manager will load all its data (resource + events) in one ajax request
            crudManager : {
                autoLoad  : true,
                transport : {
                    load : {
                        url : 'data/data.json'
                    }
                }
            },

            // Custom view preset with header configuration
            viewPreset : {
                base            : 'hourAndDay',
                columnLinesFor  : 0,
                mainHeaderLevel : 1,
                headers         : [
                    {
                        unit       : 'd',
                        align      : 'center',
                        dateFormat : 'ddd DD MMM'
                    },
                    {
                        unit       : 'h',
                        align      : 'center',
                        dateFormat : 'HH'
                    }
                ]
            },

            // Render some extra elements for the assignment equipment items
            eventBodyTemplate : data => `
                <div class="b-sch-event-header">${data.date} - ${StringHelper.encodeHtml(data.name)}</div>
                <ul class="b-sch-event-footer">
                    ${data.equipment.map(item => `<li title="${StringHelper.encodeHtml(item.name)}" class="${
                        item.iconCls}"></li>`).join('')}
                </ul>
            `,

            eventRenderer({ eventRecord }) {
                return {
                    date      : DateHelper.format(eventRecord.startDate, 'LT'),
                    name      : eventRecord.name || '',
                    equipment : eventRecord.equipment.map((itemId) => this.equipmentStore.getById(itemId) || {})
                };
            }
        };
    }

    construct(config) {
        const me = this;

        super.construct(config);

        me.on({
            eventEditBeforeSetRecord : me.onBeforeRecordLoaded,
            thisObj                  : me,
            once                     : true
        });

        me.equipmentStore.on('load', me.onEquipmentStoreLoad, me);
    }

    // Populate the equipment combo first time editor is shown
    onBeforeRecordLoaded({ source : editor  }) {
        const equipmentCombo = editor.widgetMap.equipment;

        if (!equipmentCombo.items.length) {
            equipmentCombo.items = this.equipmentStore.getRange();
        }
    }

    onEquipmentStoreLoad() {
        // Setup the data for the equipment combo inside the event editor
        // Since the event bars contain icons for equipment, we need to refresh rows once equipment store is available
        this.refreshRows();
    }
};

// Register this widget type with its Factory
Schedule.initClass();
