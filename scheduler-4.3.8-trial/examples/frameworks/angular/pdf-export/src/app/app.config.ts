/**
 * Application config file
 */

export const schedulerConfig = {
    eventStyle          : null,
    eventColor          : null,
    resourceImagePath   : 'assets/users/',
    stripeFeature       : true,
    dependenciesFeature : true,
    timeRangesFeature   : true,
    eventDragFeature    : {
        constrainDragToResource : true
    },
    pdfExportFeature : {
        exportServer : 'http://localhost:8080',

        // Development config
        translateURLsToAbsolute : 'http://localhost:4200',

        // For production replace with this one. See README.md for explanation
        // translateURLsToAbsolute : 'http://localhost:8080/resources/', // Trailing slash is important
        keepPathName : false
    },

    rowHeight : 50,
    barMargin : 8,

    columns : [
        {
            text  : 'Production line',
            width : 150,
            field : 'name'
        }
    ],

    startDate : new Date(2017, 11, 1),
    endDate   : new Date(2017, 11, 3),

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
    },

    viewPreset : {
        base            : 'hourAndDay',
        tickWidth       : 25,
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

    eventRenderer({ eventRecord, resourceRecord, renderData }): string {
        const bgColor = resourceRecord.bg || '';

        renderData.style = `background:${bgColor};border-color:${bgColor};color:${resourceRecord.textColor}`;
        renderData.iconCls.add('b-fa', `b-fa-${resourceRecord.icon}`);

        return eventRecord.name;
    }

};
