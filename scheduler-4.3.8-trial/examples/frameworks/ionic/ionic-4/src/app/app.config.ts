/**
 * Application config file
 */

import { Scheduler, StringHelper } from '@bryntum/scheduler/scheduler.lite.umd.js';
import AppEventModel from './lib/AppEventModel';

export const schedulerConfig = {
    rowHeight         : 60,
    selectedEvent     : '',
    timeRangesFeature : true,
    startDate         : new Date(2018, 1, 7, 8),
    endDate           : new Date(2018, 1, 7, 22),
    eventColor        : 'green',
    eventStyle        : 'border',
    resourceImagePath : 'assets/users/',

    columns : [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            field : 'name'
        },
        {
            text   : 'Type',
            field  : 'role',
            width  : 130,
            editor : {
                type        : 'combo',
                items       : ['Sales', 'Developer', 'Marketing', 'Product manager'],
                editable    : false,
                pickerWidth : 140
            }
        }
    ],

    viewPreset : 'hourAndDay',

    eventStore : {
        modelClass : AppEventModel
    },

    eventEditFeature : {
        // Add extra widgets to the event editor
        items : {
            descriptionField : {
                type   : 'text',
                name   : 'desc',
                label  : 'Description',
                weight : 100
            },
            eventTypeField : {
                type   : 'combo',
                name   : 'eventType',
                label  : 'Type',
                // Provided items start at 100, and go up in 100s, so insert after first one
                weight : 110,
                items  : ['Appointment', 'Internal', 'Meeting', 'Important']
            },
            eventColorField : {
                type        : 'combo',
                label       : 'Color',
                name        : 'eventColor',
                editable    : false,
                clearable   : true,
                weight      : 120,
                listItemTpl : item => `<div class="color-box b-sch-${StringHelper.encodeHtml(item.value)}"></div><div>${StringHelper.encodeHtml(item.text)}</div>`,
                items       : Scheduler.eventColors.map(color => [color, StringHelper.capitalize(color)])
            }
        }
    },

    eventRenderer : ({ eventRecord }) => {
        return `
            <div class="info">
                <div class="name">${eventRecord.name}</div>
                <div class="desc">${eventRecord.desc}</div>
            </div>
        `;
    },

    crudManager : {
        autoLoad  : true,
        transport : {
            load : {
                url : 'assets/data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    }
};
