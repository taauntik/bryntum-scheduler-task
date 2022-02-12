import { Scheduler, AssignmentStore } from '../../build/scheduler.module.js?456730';
import shared from '../_shared/shared.module.js?456730';

const assignmentStore = new AssignmentStore({
    id : 'assignments'
});

const scheduler = new Scheduler({
    appendTo : 'container',

    startDate         : new Date(2019, 0, 1, 6),
    endDate           : new Date(2019, 0, 1, 20),
    viewPreset        : 'hourAndDay',
    eventStyle        : 'border',
    resourceImagePath : '../_shared/images/users/',

    columns : [
        { type : 'resourceInfo', text : 'Name', field : 'name', width : 130 },
        { text : 'City', field : 'city', width : 90 }
    ],

    features : {
        stripe       : true,
        dependencies : true
    },

    assignmentStore,

    crudManager : {

        assignmentStore,

        transport : {
            load : {
                url : 'data/data.json'
            }
        },

        autoLoad : true,

        // This config enables response validation and dumping of found errors to the browser console.
        // It's meant to be used as a development stage helper only so please set it to false for production systems.
        validateResponse : true
    }
});
