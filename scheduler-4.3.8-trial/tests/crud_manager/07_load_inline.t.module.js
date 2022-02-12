import { CrudManager } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    const testData = {
        resourcesData : [
            { id : 1, name : 'resource 1' },
            { id : 2, name : 'resource 2' },
            { id : 3, name : 'resource 3' },
            { id : 4, name : 'resource 4' },
            { id : 5, name : 'resource 5' }
        ],
        eventsData : [
            { id : 1, name : 'event 1' },
            { id : 2, name : 'event 2' },
            { id : 3, name : 'event 3' },
            { id : 4, name : 'event 4' },
            { id : 5, name : 'event 5' },
            { id : 6, name : 'event 6' },
            { id : 7, name : 'event 7' },
            { id : 8, name : 'event 8' }
        ],
        assignmentsData : [
            { id : 1, eventId : 1, resourceId : 1 },
            { id : 2, eventId : 1, resourceId : 2 },
            { id : 3, eventId : 1, resourceId : 5 },
            { id : 4, eventId : 2, resourceId : 2 },
            { id : 5, eventId : 3, resourceId : 3 },
            { id : 6, eventId : 4, resourceId : 3 },
            { id : 7, eventId : 5, resourceId : 3 },
            { id : 8, eventId : 5, resourceId : 4 },
            { id : 9, eventId : 6, resourceId : 2 },
            { id : 10, eventId : 7, resourceId : 5 },
            { id : 11, eventId : 8, resourceId : 4 }
        ],
        dependenciesData : [
            { id : 1, from : 1, to : 5 },
            { id : 2, from : 2, to : 4 }
        ]
    };

    // Create 'empty' crud manager
    const crudManager = new CrudManager();

    // Populate stores
    crudManager.inlineData = testData;

    // Get data back
    const inlineData = crudManager.inlineData;

    // Check data
    t.isDeeply(inlineData.eventsData.map(event => {
        return { id : event.id, name : event.name };
    }), testData.eventsData, 'Events OK');
    t.isDeeply(inlineData.resourcesData, testData.resourcesData, 'Resources OK');
    t.isDeeply(inlineData.assignmentsData.map(assignment => {
        return { id : assignment.id, eventId : assignment.eventId, event : assignment.eventId, resourceId : assignment.resourceId, resource : assignment.resourceId };
    }), testData.assignmentsData, 'Assignments OK');
    t.isDeeply(inlineData.dependenciesData.map(dependency => {
        return { id : dependency.id, from : dependency.from, fromEvent : dependency.from, to : dependency.to, toEvent : dependency.to };
    }), testData.dependenciesData, 'Dependencies OK');

});
