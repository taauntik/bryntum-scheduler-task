/**
 * Application config file
 */

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

    eventEditFeature : {
        // Add extra widgets to the event editor
        items : {
            descriptionField : {
                type   : 'text',
                name   : 'desc',
                label  : 'Description',
                weight : 100
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
