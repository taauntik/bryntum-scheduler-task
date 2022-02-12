/**
 * Configuration for the scheduler
 */
import { DateHelper } from '@bryntum/scheduler';
import Task from './lib/Task';

const schedulerConfig = {
    rowHeight: 100,
    barMargin: 4,
    eventColor: 'indigo',
    startDate: new Date(2017, 11, 1, 8),
    endDate: new Date(2017, 11, 1, 18),

    resourceImagePath: 'users/',

    columns: [
        {
            type: 'resourceInfo',
            text: 'Name',
            width: 200,
            showEventCount: false,
            showRole: true
        }
    ],

    viewPreset: {
        base: 'hourAndDay',
        tickWidth: 10,
        columnLinesFor: 0,
        headers: [
            {
                unit: 'd',
                align: 'center',
                dateFormat: 'ddd DD MMM'
            },
            {
                unit: 'h',
                align: 'center',
                dateFormat: 'HH'
            }
        ]
    },

    timeRangesFeature: true,
    regionResizeFeature: true,
    eventMenuFeature: {
        items: [
            // custom item with inline handler
            {
                text: 'Remove all equipment',
                icon: 'b-fa b-fa-times',
                weight: 200,
                onItem: ({ eventRecord }) =>
                    (eventRecord.equipment = [])
            }
        ]
    },
    eventEditFeature: {
        // Add an extra combo box to the editor to select equipment
        items: {
            equipmentCombo: {
                type: 'combo',
                editable: false,
                multiSelect: true,
                valueField: 'id',
                displayField: 'name',
                name: 'equipment',
                label: 'Equipment',
                items: [],
                weight: 200
            }
        }
    },

    crudManager: {
        autoLoad: true,
        eventStore: {
            modelClass: Task
        },
        transport: {
            load: {
                url: 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    // Render some extra elements for the assignment equipment items
    eventBodyTemplate: data => `
        <div class = "b-sch-event-header">${data.date} - ${
        data.name
    }</div>
        <ul  class = "b-sch-event-footer">
            ${data.equipment
                .map(
                    item =>
                        `<li title="${item.name}" class="${
                            item.iconCls
                        }"></li>`
                )
                .join('')}
        </ul>
    `,

    // taken from the original example
    eventRenderer({ eventRecord }) {
        return {
            date: DateHelper.format(eventRecord.startDate, 'LT'),
            name: eventRecord.name || '',
            equipment: this.equipmentStore && eventRecord.equipment
                ? eventRecord.equipment.map(itemId => this.equipmentStore.getById(itemId) || {})
                : []
        };
    },

    // taken from the original example
    onEquipmentStoreLoad({ source: store }) {
        // Setup the data for the equipment combo inside the event editor
        const equipmentCombo = this.features.eventEdit
            .getEditor()
            .query(item => item.name === 'equipment');
        equipmentCombo.items = store.getRange();
        this._equipmentStore = store;

        // Since the event bars contain icons for equipment, we need to refresh rows once equipment store is available
        this.refreshRows();
    }
};

const gridConfig = {
    store: {
        modelClass: Task,
        readUrl: 'data/equipment.json',
        sorters: [{ field: 'name', ascending: true }]
    }
};

export { schedulerConfig, gridConfig };
