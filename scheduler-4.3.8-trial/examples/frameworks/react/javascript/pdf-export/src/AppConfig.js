/**
 * Application configuration
 */
const schedulerConfig = {
    eventStyle : null,
    eventColor : null,
    rowHeight  : 50,
    barMargin  : 8,

    startDate : new Date(2017, 11, 1),
    endDate   : new Date(2017, 11, 3),

    columns: [
        {
            text  : 'Production line',
            width : 150,
            field : 'name'
        }
    ],
    stripeFeature       : true,
    dependenciesFeature : true,
    timeRangesFeature   : true,
    eventDragFeature    : {
        constrainDragToResource : true
    },
    pdfExportFeature: {
        exportServer : 'http://localhost:8080',
        // Development config
        translateURLsToAbsolute : 'http://localhost:3000',
        clientURL               : 'http://localhost:3000',
        // For production replace with this one. See README.md for explanation
        // translateURLsToAbsolute : 'http://localhost:8080/resources/', // Trailing slash is important

        keepPathName : false
    },
    crudManager: {
        autoLoad  : true,
        transport : {
            load: {
                url : 'data/data.json'
            }
        },
        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    },

    viewPreset: {
        base           : 'hourAndDay',
        tickWidth      : 25,
        columnLinesFor : 0,
        headers        : [
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
    }
};

export { schedulerConfig };
