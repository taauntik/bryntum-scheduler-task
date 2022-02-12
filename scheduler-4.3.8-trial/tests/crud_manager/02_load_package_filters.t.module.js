import { AbstractCrudManager } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    // Here we test that remote filters are included into load package #2222

    //TODO: PORT remote filtering (and sort etc)
    t.xit('Generates load package correctly', t => {
        const resourceStore = t.getResourceStore({
            remoteFilter : true
        });

        resourceStore.addFilter({ property : 'foo', value : 1 });

        const eventStore = t.getEventStore({
            filterParam  : 'eventsFilter',
            remoteFilter : true
        });

        eventStore.addFilter({ property : 'bar', value : 2 });

        const eventStore2 = t.getEventStore({
            storeId : 'events2'
        });

        const crud = new AbstractCrudManager({
            stores : [
                { store : resourceStore, storeId : 'resources', filterParam : 'resourcesFilter' },
                { store : eventStore, storeId : 'events' },
                eventStore2
            ]
        });

        const pack = crud.getLoadPackage();

        t.is(pack.type, 'load', 'Correct package type');
        t.ok(pack.requestId, 'Has some request Id');
        t.is(pack.stores.length, 3, 'Correct size of stores list');

        t.isDeeply(pack.stores[0], {
            storeId         : 'resources',
            page            : 1,
            pageSize        : 25,
            resourcesFilter : [{ property : 'foo', value : 1 }]
        }, 'proper resourceStore relevant package part');

        t.isDeeply(pack.stores[1], {
            storeId      : 'events',
            page         : 1,
            pageSize     : 25,
            eventsFilter : [{ property : 'bar', value : 2 }]
        }, 'proper eventStore relevant package part');

        t.isDeeply(pack.stores[2], {
            storeId  : 'events2',
            page     : 1,
            pageSize : 25
        }, 'proper eventStore2 relevant package part');
    });
});
