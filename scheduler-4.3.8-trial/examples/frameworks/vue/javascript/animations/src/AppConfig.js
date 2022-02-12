/**
 * Configuration for the scheduler
 */
import { Scheduler, StringHelper } from '@bryntum/scheduler';

const schedulerConfig = {
    eventColor: null,
    barMargin: 1,
    rowHeight: 50,
    startDate: new Date(2017, 1, 7, 8),
    endDate: new Date(2017, 1, 7, 18),
    viewPreset: 'hourAndDay',

    useInitialAnimation: 'slide-from-left',

    resourceImagePath: 'users/',

    columns: [
        {
            type: 'resourceInfo',
            text: 'Staff',
            field: 'name',
            width: 150
        },
        {
            text: 'Task color',
            field: 'eventColor',
            width: 90,
            htmlEncode: false,
            renderer: ({ record }) =>
                `<div class="color-box b-sch-${
                    record.eventColor
                }"></div>${StringHelper.capitalize(
                    record.eventColor
                )}`,
            editor: {
                type: 'combo',
                items: Scheduler.eventColors,
                editable: false,
                listItemTpl: item =>
                    `<div class="color-box b-sch-${item.value}"></div><div>${item.value}</div>`
            }
        }
    ],

    timeRangesFeature: true,

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
    }
};
const sliderConfig = {
    min: 0,
    max: 3000,
    value: 600,
    step: 200,
    width: '14em',
    showValue: false,
    showTooltip: true
};

export {
    schedulerConfig,
    sliderConfig
};
