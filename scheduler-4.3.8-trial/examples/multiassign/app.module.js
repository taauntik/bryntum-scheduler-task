import { Scheduler } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

//region Data

const
    resources   = [
        { id : 'r1', name : 'Celia', city : 'Barcelona' },
        { id : 'r2', name : 'Lee', city : 'London' },
        { id : 'r3', name : 'Macy', city : 'New York' },
        { id : 'r4', name : 'Madison', city : 'Barcelona' },
        { id : 'r5', name : 'Rob', city : 'Rome' },
        { id : 'r6', name : 'Dave', city : 'Barcelona' },
        { id : 'r7', name : 'Dan', city : 'London' },
        { id : 'r8', name : 'George', city : 'New York' },
        { id : 'r9', name : 'Gloria', city : 'Rome' },
        { id : 'r10', name : 'Henrik', city : 'London' }
    ],
    events      = [
        {
            id        : 1,
            startDate : new Date(2017, 0, 1, 10),
            endDate   : new Date(2017, 0, 1, 12),
            name      : 'Multi assigned',
            iconCls   : 'b-fa b-fa-users'
        },
        {
            id         : 2,
            startDate  : new Date(2017, 0, 1, 13),
            endDate    : new Date(2017, 0, 1, 15),
            name       : 'Single assigned',
            iconCls    : 'b-fa b-fa-user',
            eventColor : 'indigo'
        },
        {
            id         : 3,
            startDate  : new Date(2017, 0, 1, 8),
            endDate    : new Date(2017, 0, 1, 11),
            name       : 'Single assigned',
            iconCls    : 'b-fa b-fa-user',
            eventColor : 'cyan'
        },
        {
            id         : 4,
            startDate  : new Date(2017, 0, 1, 10),
            endDate    : new Date(2017, 0, 1, 13),
            name       : 'Single assigned',
            iconCls    : 'b-fa b-fa-user',
            eventColor : 'blue'
        },
        {
            id         : 5,
            startDate  : new Date(2017, 0, 1, 13),
            endDate    : new Date(2017, 0, 1, 15),
            name       : 'Single assigned',
            iconCls    : 'b-fa b-fa-user',
            eventColor : 'violet'
        }
    ],
    assignments = [
        { id : 1, resourceId : 'r1', eventId : 1 },
        { id : 2, resourceId : 'r2', eventId : 1 },
        { id : 3, resourceId : 'r8', eventId : 1 },
        { id : 4, resourceId : 'r3', eventId : 2 },
        { id : 5, resourceId : 'r4', eventId : 3 },
        { id : 6, resourceId : 'r5', eventId : 4 },
        { id : 7, resourceId : 'r6', eventId : 5 }
    ];

//endregion

const scheduler = new Scheduler({
    appendTo : 'container',

    startDate         : new Date(2017, 0, 1, 6),
    endDate           : new Date(2017, 0, 1, 20),
    viewPreset        : 'hourAndDay',
    eventStyle        : 'border',
    resourceImagePath : '../_shared/images/users/',

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 },
        { text : 'City', field : 'city', width : 90 }
    ],

    resources,
    events,
    assignments
});
