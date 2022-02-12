/**
 * Application configuration
 */
const schedulerConfig = {
    resourceImagePath : 'users/',

    startDate : new Date(2018, 1, 7, 8),
    endDate   : new Date(2018, 1, 7, 22),

    viewPreset : 'hourAndDay',

    timeRangesFeature : {
        narrowThreshold : 10
    },

    columns : [
        {
            type      : 'resourceInfo',
            text      : 'Staff',
            showImage : true,
            width     : 130
        },
        {
            text  : 'Type',
            field : 'role',
            width : 130
        }
    ]
};

export { schedulerConfig };
