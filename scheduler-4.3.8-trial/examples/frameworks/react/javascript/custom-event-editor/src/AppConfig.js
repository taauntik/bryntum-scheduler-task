/**
 * Application configuration
 */
const schedulerConfig = {
    resourceImagePath : 'users/',

    viewPreset  : 'hourAndDay',
    barMargin   : 5,
    startDate   : new Date(2017, 1, 7, 8),
    endDate     : new Date(2017, 1, 7, 18),
    crudManager : {
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

    // Columns in scheduler
    columns: [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            width : 130
        },
        {
            text  : 'Type',
            field : 'role',
            width : 130
        }
    ]
};

export { schedulerConfig };
