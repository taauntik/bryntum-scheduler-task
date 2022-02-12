const { Scheduler, TrialButton }  = bryntum.scheduler;

new Scheduler({
    appendTo   : 'container',
    autoHeight : true,
    rowHeight  : 50,

    columns : [
        { text : 'Name', field : 'name', width : 150 }
    ],

    startDate  : '2017-01-01T06:00',
    endDate    : '2017-01-01T19:00',
    viewPreset : 'hourAndDay',

    resources : [
        { id : 1, name : 'Machine 1', eventColor : 'green' },
        { id : 2, name : 'Machine 2', eventColor : 'blue' },
        { id : 3, name : 'Machine 3', eventColor : 'orange' }
    ],

    events : [
        { id : 1, resourceId : 1, name : 'Batch 1', startDate : '2017-01-01T07:00', endDate : '2017-01-01T08:00' },
        { id : 2, resourceId : 1, name : 'Batch 2', startDate : '2017-01-01T08:30', endDate : '2017-01-01T09:30' },
        { id : 3, resourceId : 1, name : 'Batch 3', startDate : '2017-01-01T10:00', endDate : '2017-01-01T11:00' },
        { id : 4, resourceId : 1, name : 'Batch 4', startDate : '2017-01-01T11:30', endDate : '2017-01-01T12:30' },
        { id : 5, resourceId : 1, name : 'Batch 5', startDate : '2017-01-01T13:00', endDate : '2017-01-01T14:00' },
        { id : 6, resourceId : 1, name : 'Batch 6', startDate : '2017-01-01T14:30', endDate : '2017-01-01T15:30' },
        { id : 7, resourceId : 1, name : 'Batch 7', startDate : '2017-01-01T16:00', endDate : '2017-01-01T17:00' },
        { id : 8, resourceId : 1, name : 'Batch 8', startDate : '2017-01-01T17:30', endDate : '2017-01-01T18:30' },
        { id : 9, resourceId : 2, name : 'Batch 1', startDate : '2017-01-01T08:30', endDate : '2017-01-01T10:30' },
        { id : 10, resourceId : 2, name : 'Batch 3', startDate : '2017-01-01T11:30', endDate : '2017-01-01T13:30' },
        { id : 11, resourceId : 2, name : 'Batch 5', startDate : '2017-01-01T14:30', endDate : '2017-01-01T16:30' },
        { id : 12, resourceId : 3, name : 'Batch 2', startDate : '2017-01-01T10:00', endDate : '2017-01-01T12:00' },
        { id : 13, resourceId : 3, name : 'Batch 4', startDate : '2017-01-01T13:00', endDate : '2017-01-01T15:00' },
        { id : 14, resourceId : 3, name : 'Batch 6', startDate : '2017-01-01T16:00', endDate : '2017-01-01T18:00' }
    ]
});


new TrialButton({
    appendTo  : 'download-trial',
    cls       : 'b-green b-raised',
    productId : 'scheduler'
});

