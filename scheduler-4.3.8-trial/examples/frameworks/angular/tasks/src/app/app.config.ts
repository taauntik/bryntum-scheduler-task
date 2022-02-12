/**
 * Application config file
 */

// Bryntum umd lite bundle comes without polyfills to support Angular's zone.js
import { EventModel, ResourceModel, ResourceModelConfig, SchedulerConfig } from '@bryntum/scheduler/scheduler.lite.umd.js';
ResourceModel.childrenField = 'clients';

type EmployeeResourceModelConfig = ResourceModelConfig & {
    color: string
}

export class EmployeeResourceModel extends ResourceModel {
    color: string;

    constructor(config?: Partial<EmployeeResourceModelConfig>) {
        super(config);
    }
}

export const colors = [
    'Cyan',
    'Blue',
    'Green',
    'Light-green',
    'Lime',
    'Orange',
    'Purple',
    'Red',
    'Teal'
];

export const schedulerConfig: Partial<SchedulerConfig> = {
    startDate  : new Date(2018, 4, 7),
    endDate    : new Date(2018, 4, 26),
    barMargin  : 7,
    rowHeight  : 45,
    eventColor : null,
    eventStyle : null,

    viewPreset : {
        base              : 'weekAndDay',
        displayDateFormat : 'll'
    },

    // Disable cell editing, this demo has its own custom row editor

    features : {
        cellEdit : {
            disabled : true
        },

        // Drag only within clients/employees, snap to days
        eventDrag : {
            constrainDragToResource : true,
            showExactDropPosition   : true
        },

        // Event editor with two custom fields, location for clients and color for employees
        eventEdit : {
            typeField : 'type',
            items     : {
                locationField : {
                    type    : 'text',
                    name    : 'location',
                    label   : 'Location',
                    weight  : 100,
                    dataset : { eventType : 'client' }
                },
                colorCombo : {
                    type        : 'combo',
                    name        : 'color',
                    label       : 'Color',
                    items       : colors.map(color => [color.toLowerCase(), color]),
                    listItemTpl : (data: { value: string; text: string }): string => `<div class="color-item ${data.value}"></div>${data.text}`,
                    weight      : 100,
                    dataset     : { eventType : 'employee' }
                }
            }
        },

        // Resize snapping to days
        eventResize : {
            showExactResizePosition : true
        },

        // Shade weekends
        nonWorkingTime : true,

        // Uses a tree where parent nodes are employees and child nodes are clients
        tree : true
    },

    columns : [
        {
            type                   : 'tree',
            text                   : 'Employees',
            field                  : 'name',
            width                  : '15em',
            // Hide default tree icons
            expandedFolderIconCls  : null,
            collapsedFolderIconCls : null,
            leafIconCls            : null,
            htmlEncode             : false,
            // Custom renderer display employee info or client color + name
            renderer(
                { record, value, size }:
                { record: ResourceModel & { [key: string]: any }; value: String; size: { height: Number; color: String } }
            ): String {
                // Parent rows are employees
                if (record.isParent) {
                    // Make employee row higher
                    size.height = 60;
                    // Employee template
                    return `
                        <div class="info">
                            <div class="name">${value}</div>
                            <div class="title">${record.title}</div>
                        </div>
                        <div class="add"><i class="b-fa b-fa-plus"></i></div>
                        <img class="profile-img" src="assets/users/${record.name.toLowerCase()}.jpg" />
                    `;
                }
                // Other rows are clients
                else {
                    // Client template
                    return `<div class="client-color ${record.color}"></div>${value}`;
                }
            }
        }
    ],

    // CrudManager loads all data from a single source
    crudManager : {
        autoLoad : true,

        transport : {
            load : {
                url : 'assets/data/data.json'
            }
        },

        resourceStore : {
            modelClass : EmployeeResourceModel,
            fields     : ['color', 'title'],
            tree       : true
        },

        eventStore : {
            fields : ['color', 'location']
        },

        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    // Custom event renderer that applies colors and display events location
    eventRenderer(
        { renderData, resourceRecord, eventRecord }:
        { renderData: { [key: string]: any }; resourceRecord: ResourceModel & { [key: string]: any }; eventRecord: EventModel & { [key: string]: any } }
    ): String {
        if (resourceRecord.isParent) {
            renderData.wrapperCls.add('employee');
        }

        if (eventRecord.color) {
            renderData.wrapperCls.add(eventRecord.color);
        }
        else if (resourceRecord.color) {
            renderData.wrapperCls.add(resourceRecord.color);
        }

        return eventRecord.name + (eventRecord.location ? `<span>, ${eventRecord.location}</span>` : '');
    }
};
