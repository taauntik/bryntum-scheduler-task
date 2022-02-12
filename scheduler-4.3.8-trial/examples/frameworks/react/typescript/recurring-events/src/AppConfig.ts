import { SchedulerConfig } from '@bryntum/scheduler/scheduler.umd.js';

const schedulerConfig: Partial<SchedulerConfig> = {
    rowHeight: 70,
    enableRecurringEvents: true,
    resourceImagePath: 'users/',
    // @ts-ignore
    sortFeature: 'name',
    eventTooltipFeature: true,
    labelsFeature: {
        top: {
            field: 'name'
        }
    },
    columns: [{ type: 'resourceInfo', text: 'Name' }],
    crudManager: {
        autoLoad: true,
        transport: {
            load: {
                url: 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    startDate: new Date(2018, 0, 1),
    endDate: new Date(2018, 4, 1),
    viewPreset: 'weekAndDayLetter',
    eventRenderer({ renderData, eventRecord }: { renderData: any; eventRecord: any }) {
        renderData.iconCls = eventRecord.isRecurring
            ? 'b-fa b-fa-star'
            : eventRecord.isOccurrence
            ? 'b-fa b-fa-sync'
            : 'b-fa b-fa-calendar';
        return eventRecord.name;
    }
};

export { schedulerConfig };
