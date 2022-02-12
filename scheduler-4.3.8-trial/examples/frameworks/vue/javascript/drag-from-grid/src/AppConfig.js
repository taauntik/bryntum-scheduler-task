/**
 * Configuration for the scheduler
 */
import TaskStore from './lib/TaskStore';
import Task from './lib/Task';

const schedulerConfig = {
    rowHeight: 50,
    barMargin: 4,
    eventColor: 'indigo',
    startDate: new Date(2025, 11, 1, 8),
    endDate: new Date(2025, 11, 1, 18),

    resourceImagePath: 'users/',

    columns: [
        {
            type: 'resourceInfo',
            text: 'Name',
            width: 200,
            showEventCount: false,
            showRole: true
        },
        {
            text: 'Nbr tasks',
            editor: false,
            renderer: data => `${data.record.events.length || ''}`,
            align: 'center',
            sortable: (a, b) =>
                a.events.length < b.events.length ? -1 : 1,
            width: 100
        }
    ],
    viewPreset: {
        base: 'hourAndDay',
        tickWidth: 20,
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

    stripeFeature: true,
    timeRangesFeature: true,
    eventMenuFeature: {
        items: {
            // custom item with inline handler
            unassign: {
                text: 'Unassign',
                icon: 'b-fa b-fa-user-times',
                weight: 200,
                onItem: ({ eventRecord, resourceRecord }) =>
                    eventRecord.unassign(resourceRecord)
            }
        }
    },
    crudManager: {
        autoLoad: true,
        eventStore: {
            storeClass: TaskStore
        },
        transport: {
            load: {
                url: 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    }
};

const gridConfig = {
    ref: 'grid',
    store: {
        modelClass: Task,
        readUrl: 'data/unplanned.json',
        autoLoad: true
    }
};

export { schedulerConfig, gridConfig };
