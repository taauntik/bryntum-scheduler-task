/**
 * Application configuration
 */
const schedulerConfig = {
    startDate         : new Date(2017, 0, 1, 6),
    endDate           : new Date(2017, 0, 1, 20),
    viewPreset        : 'hourAndDay',
    rowHeight         : 50,
    barMargin         : 5,
    multiEventSelect  : true,
    resourceImagePath : 'users/',

    columns: [
        {
            type  : 'resourceInfo',
            text  : 'Staff',
            field : 'name',
            width : 150
        },
        {
            text                 : 'Button<br /><small>Vue Component</small>',
            width                : '10em',
            align                : 'center',
            field                : 'city',
            editor               : false,
            htmlEncodeHeaderText : false,
            vue                  : true,
            renderer({ record }) {
                // The object needed by the wrapper to render the component
                return {
                    // Required. Name of the component to render.
                    // The component must be registered globally in main.js
                    // https://vuejs.org/v2/guide/components.html#Dynamic-Components
                    is : 'Button',

                    // `Button` gets its text from `record`
                    record

                    // Any other properties we provide for the Vue component, e.g. `value`.
                };
            }
        }
    ],
    resources: [
        { id: 'r1', name: 'Mike', city: 'Stockholm' },
        { id: 'r2', name: 'Linda', city: 'Oslo' },
        { id: 'r3', name: 'Emilia', city: 'Berlin' },
        { id: 'r4', name: 'Dan', city: 'Paris' },
        { id: 'r5', name: 'Gloria', city: 'Prague' },
        { id: 'r6', name: 'Lee', city: 'Amsterdam' },
        { id: 'r7', name: 'Jong', city: 'Moscow' },
        { id: 'r8', name: 'Madison', city: 'Washington' },
        { id: 'r9', name: 'Macy', city: 'Tokyo' },
        { id: 'r10', name: 'Mark', city: 'Rome' }
    ],
    events: [
        {
            id         : 1,
            resourceId : 'r1',
            startDate  : new Date(2017, 0, 1, 10),
            endDate    : new Date(2017, 0, 1, 12),
            name       : 'Click me',
            iconCls    : 'b-fa b-fa-mouse-pointer'
        },
        {
            id         : 2,
            resourceId : 'r2',
            startDate  : new Date(2017, 0, 1, 12),
            endDate    : new Date(2017, 0, 1, 13, 30),
            name       : 'Drag me',
            iconCls    : 'b-fa b-fa-arrows-alt'
        },
        {
            id           : 3,
            resourceId   : 'r3',
            startDate    : new Date(2017, 0, 1, 14),
            duration     : 2,
            durationUnit : 'h',
            name         : 'Double click me',
            eventColor   : 'purple',
            iconCls      : 'b-fa b-fa-mouse-pointer'
        },
        {
            id         : 4,
            resourceId : 'r4',
            startDate  : new Date(2017, 0, 1, 8),
            endDate    : new Date(2017, 0, 1, 11),
            name       : 'Right click me',
            iconCls    : 'b-fa b-fa-mouse-pointer'
        },
        {
            id         : 5,
            resourceId : 'r5',
            startDate  : new Date(2017, 0, 1, 15),
            endDate    : new Date(2017, 0, 1, 17),
            name       : 'Resize me',
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
            // Custom styling from data
            style : 'background-color : teal; font-size: 18px',
            // Prevent default styling
            eventStyle : 'none'
        }
    ]
};

export { schedulerConfig };
