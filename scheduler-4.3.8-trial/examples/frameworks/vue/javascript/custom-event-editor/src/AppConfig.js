/**
 * Configuration for the scheduler
 */
const schedulerConfig = {
    startDate         : new Date(2017, 0, 1, 6),
    endDate           : new Date(2017, 0, 1, 20),
    viewPreset        : 'hourAndDay',
    rowHeight         : 50,
    barMargin         : 5,
    multiEventSelect  : true,
    resourceImagePath : 'users/',

    dependenciesFeature   : true,
    dependencyEditFeature : {
        showLagField : false
    },

    columns: [
        {
            type  : 'resourceInfo',
            text  : 'Name',
            field : 'name',
            width : 130
        }
    ],
    resources: [
        { id: 'r1', name: 'Mike' },
        { id: 'r2', name: 'Linda' },
        { id: 'r3', name: 'Arnold' },
        { id: 'r4', name: 'Angelo' },
        { id: 'r5', name: 'Celia' },
        { id: 'r6', name: 'Kate' },
        { id: 'r7', name: 'Linda' },
        { id: 'r8', name: 'Mark' },
        { id: 'r9', name: 'Rob' },
        { id: 'r10', name: 'Maxim' }
    ],
    events: [
        {
            id         : 1,
            resourceId : 'r1',
            startDate  : new Date(2017, 0, 1, 10),
            endDate    : new Date(2017, 0, 1, 12),
            name       : 'Meeting #1',
            iconCls    : 'b-fa b-fa-mouse-pointer'
        },
        {
            id         : 2,
            resourceId : 'r2',
            startDate  : new Date(2017, 0, 1, 12),
            endDate    : new Date(2017, 0, 1, 14, 30),
            name       : 'Appointment #1',
            iconCls    : 'b-fa b-fa-arrows-alt'
        },
        {
            id         : 3,
            resourceId : 'r3',
            startDate  : new Date(2017, 0, 1, 14),
            endDate    : new Date(2017, 0, 1, 16),
            name       : 'Meeting #2',
            eventColor : 'purple',
            iconCls    : 'b-fa b-fa-mouse-pointer'
        },
        {
            id         : 4,
            resourceId : 'r4',
            startDate  : new Date(2017, 0, 1, 8),
            endDate    : new Date(2017, 0, 1, 11),
            name       : 'Breakfast with customer',
            iconCls    : 'b-fa b-fa-mouse-pointer'
        },
        {
            id         : 5,
            resourceId : 'r5',
            startDate  : new Date(2017, 0, 1, 14),
            endDate    : new Date(2017, 0, 1, 17),
            name       : 'Very important meeting #11',
            iconCls    : 'b-fa b-fa-arrows-alt-h'
        },
        {
            id         : 6,
            resourceId : 'r6',
            startDate  : new Date(2017, 0, 1, 16),
            endDate    : new Date(2017, 0, 1, 19),
            name       : 'Important meeting',
            iconCls    : 'b-fa b-fa-exclamation-triangle',
            eventColor : 'red'
        },
        {
            id         : 7,
            resourceId : 'r6',
            startDate  : new Date(2017, 0, 1, 6),
            endDate    : new Date(2017, 0, 1, 8),
            name       : 'Sports event',
            iconCls    : 'b-fa b-fa-basketball-ball'
        },
        {
            id         : 8,
            resourceId : 'r7',
            startDate  : new Date(2017, 0, 1, 9),
            endDate    : new Date(2017, 0, 1, 11, 30),
            name       : "Dad's birthday!",
            iconCls    : 'b-fa b-fa-birthday-cake',
            style      : 'background-color : teal; font-size: 18px'
        }
    ]
};

export { schedulerConfig };
