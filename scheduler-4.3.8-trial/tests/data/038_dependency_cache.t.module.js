import { DateHelper, EventStore, DependencyStore } from '../../build/scheduler.module.js?456730';
/* eslint-disable */

StartTest(t => {
    // Plan:
    // -----
    // Create event store
    // Create dependency store
    // Query dependencies for each task
    // Measure cache hit/miss rate, it should be 1.0
    //
    // Modify dependency store - check cache is valid
    //  - add dependency
    //  - remove dependency
    //  - update dependency
    //
    // Modify event store - check cache is valid
    //  - add event
    //  - remove event
    //  - update event
    //  - change event id

    let eventStore, eventStoreData, dependencyStore, dependencyStoreData;

    function idfy(arr) {
        return arr.map(model => model.id).sort();
    }

    function setup() {
        let totalEvents = 100, totalDeps = 200,
            i, sourceIndex, targetIndex;

        eventStore = new EventStore({
        });

        dependencyStore = new DependencyStore({
        });

        eventStore.dependencyStore = dependencyStore;

        eventStoreData = [];

        for (i = 1; i <= totalEvents; ++i) {
            eventStoreData.push({
                id        : i,
                name      : 'Event ' + i,
                startDate : new Date(),
                endDate   : DateHelper.add(new Date(), 86400)
            });
        }

        dependencyStoreData = [];

        // Only half of events will have dependencies, this leads to the case when cache might
        // always miss, due to there were simply no dependencies for event, such case led to total dependency
        // store rescan, which I'm trying to avoid and which is actually the reason I wrote this test.
        //
        // https://app.assembla.com/spaces/bryntum/tickets/3874-check-if-we-can-improve-performance-of-gantt/details
        for (i = 1; i <= totalDeps;) {
            sourceIndex = Math.floor(Math.random() * totalEvents);
            sourceIndex % 2 && sourceIndex--; // making it even
            targetIndex = Math.floor(Math.random() * totalEvents);
            targetIndex % 2 && targetIndex--; // making it even

            if (sourceIndex != targetIndex) {
                i++;
                dependencyStoreData.push({
                    id   : i,
                    from : sourceIndex,
                    to   : targetIndex,
                    type : 2
                });
            }
        }
    }

    function tearDown() {
        eventStore.destroy();
        dependencyStore.destroy();
        eventStoreData = null;
        dependencyStoreData = null;
    }

    t.beforeEach(function(t) {
        setup();
    });

    t.afterEach(function(t) {
        tearDown();
    });

    t.it('Cache should be filled upon store refresh/load', function(t) {
        let stats;

        dependencyStore.data = dependencyStoreData;
        eventStore.data = eventStoreData;

        t.ok(dependencyStore.originalCount > 0, 'Dependencies are loaded');
        t.ok(eventStore.originalCount > 0, 'Events are loaded');

        // Querying dependencies for every event
        eventStore.each(event => dependencyStore.getEventDependencies(event));

        // Cache must have no misses
        stats = CacheUtil.stats['EventDependencyCache'];
        t.isGreater(stats.hit, 0, 'Cache has got hits');
        t.is(stats.miss, 0, 'Cache has no misses');
    });

    t.it('Cache should be updated upon dependency store change', function(t) {
        let eventIds,
            event1, event2, event3,
            eventDeps1, eventDeps2, eventDeps3,
            dependency,
            stats, statsBefore, statsAfter;

        stats = CacheUtil.stats['EventDependencyCache'];

        dependencyStore.data = dependencyStoreData;
        eventStore.data = eventStoreData;

        /*eventIds = eventStore.collect(eventStore.getModel().idProperty, {
            allowNull : false,
            filtered  : false,
            collapsed : true
        });*/
        eventIds = eventStore.getDistinctValues(eventStore.idField);

        event1 = eventStore.getById(eventIds[Math.floor(Math.random() * eventIds.length)]);
        event2 = eventStore.getById(eventIds[Math.floor(Math.random() * eventIds.length)]);
        while (event1 === event2) {
            event2 = eventStore.getById(eventIds[Math.floor(Math.random() * eventIds.length)]);
        }
        event3 = eventStore.getById(eventIds[Math.floor(Math.random() * eventIds.length)]);
        while (event3 === event1 || event3 === event2) {
            event3 = eventStore.getById(eventIds[Math.floor(Math.random() * eventIds.length)]);
        }

        // Add dependency
        t.diag('Adding a new dependency');

        statsBefore = Object.assign({}, stats);

        dependency = dependencyStore.add({
            from : event1.id,
            to   : event2.id
        }).pop();
        t.isObject(dependency, 'New dependency obtained');

        eventDeps1 = dependencyStore.getEventDependencies(event1);
        eventDeps2 = dependencyStore.getEventDependencies(event2);

        t.ok(eventDeps1.includes(dependency), 'The new dependency has been added to source event dependencies');
        t.ok(eventDeps2.includes(dependency), 'The new dependency has been added to target event dependencies');

        statsAfter = Object.assign({}, stats); //Ext.clone(stats);

        t.isGreater(statsAfter.hit, statsBefore.hit, 'Adding the dependency updates the cache accordningly and avoids full scan');
        t.is(statsAfter.miss, statsBefore.miss, 'Adding the dependency updates the cache accordingly and availd full scan');

        // Changing dependency target
        t.diag('Changing the dependency target');

        statsBefore = Object.assign({}, stats);

        dependency.to = event3.id;

        eventDeps1 = dependencyStore.getEventDependencies(event1);
        eventDeps2 = dependencyStore.getEventDependencies(event2);
        eventDeps3 = dependencyStore.getEventDependencies(event3);

        t.ok(eventDeps1.includes(dependency), 'Source event dependencies list left unchanged');
        t.notOk(eventDeps2.includes(dependency), "Previous target event dependencies list doesn't include the dependency");
        t.ok(eventDeps3.includes(dependency), 'New target event dependencies list now includes the dependency');

        statsAfter = Object.assign({}, stats);

        t.isGreater(statsAfter.hit, statsBefore.hit, 'Chaning the dependency target updates the cache accordningly and avoids full scan');
        t.is(statsAfter.miss, statsBefore.miss, 'Changing the dependency target updates the cache accordingly and availd full scan');

        // Changing dependency source
        t.diag('Changing the dependency source');

        statsBefore = Object.assign({}, stats);

        dependency.from = event2.id;

        eventDeps1 = dependencyStore.getEventDependencies(event1);
        eventDeps2 = dependencyStore.getEventDependencies(event2);
        eventDeps3 = dependencyStore.getEventDependencies(event3);

        t.notOk(eventDeps1.includes(dependency), "Previous source event dependencies list doesn't include the dependency");
        t.ok(eventDeps2.includes(dependency), 'New source event dependencies list now includes the dependency');
        t.ok(eventDeps3.includes(dependency), 'Target event dependencies list left unchanged');

        statsAfter = Object.assign({}, stats);

        t.isGreater(statsAfter.hit, statsBefore.hit, 'Chaning the dependency source updates the cache accordningly and avoids full scan');
        t.is(statsAfter.miss, statsBefore.miss, 'Changing the dependency source updates the cache accordingly and availd full scan');

        // Remove dependency
        t.diag('Removing the dependency');

        statsBefore = Object.assign({}, stats);

        dependencyStore.remove(dependency);

        eventDeps2 = dependencyStore.getEventDependencies(event2);
        eventDeps3 = dependencyStore.getEventDependencies(event3);

        t.notOk(eventDeps2.includes(dependency), "Source event dependencies list doesn't include the dependency");
        t.notOk(eventDeps3.includes(dependency), "Target event dependencies list doesn't include the dependency");

        statsAfter = Object.assign({}, stats);

        t.isGreater(statsAfter.hit, statsBefore.hit, 'Removing the dependency updates the cache accordningly and avoids full scan');
        t.is(statsAfter.miss, statsBefore.miss, 'Removing the dependency updates the cache accordingly and availd full scan');

        // Clear dependency store
        t.diag('Clearing dependency store');

        statsBefore = Object.assign({}, stats); ;

        dependencyStore.removeAll();

        eventDeps1 = dependencyStore.getEventDependencies(event1);
        eventDeps2 = dependencyStore.getEventDependencies(event2);
        eventDeps3 = dependencyStore.getEventDependencies(event3);

        t.is(eventDeps1.length, 0, "There's no deps for an event after dependency store clearing");
        t.is(eventDeps2.length, 0, "There's no deps for an event after dependency store clearing");
        t.is(eventDeps3.length, 0, "There's no deps for an event after dependency store clearing");

        statsAfter = Object.assign({}, stats); ;

        t.isGreater(statsAfter.hit, statsBefore.hit, "Requesting dependencies on an empty dependency store doesn't make attempt to do full scan");
        t.is(statsAfter.miss, statsBefore.miss, "Requesting dependencies on an empty dependency store doesn't make attempt to do full scan");
    });

    t.it('Cache should be updated upon event store change', function(t) {
        let event1, event2, eventDeps1, eventDeps2,
            dependency,
            stats, statsBefore, statsAfter;

        stats = CacheUtil.stats['EventDependencyCache'];

        dependencyStore.data = dependencyStoreData;
        eventStore.data = eventStoreData;

        // Adding an event
        t.diag('Adding an event');

        statsBefore = Object.assign({}, stats);

        event1 = eventStore.add({
            id        : 1000000,
            name      : 'Event new 1',
            startDate : new Date(),
            endDate   : DateHelper.add(new Date(), 86400)
        }).pop();
        t.isObject(event1, 'New event obtained');

        event2 = eventStore.add({
            id        : 1000001,
            name      : 'Event new 2',
            startDate : new Date(),
            endDate   : DateHelper.add(new Date(), 86400)
        }).pop();
        t.isObject(event2, 'New event obtained');

        eventDeps1 = dependencyStore.getEventDependencies(event1);
        eventDeps2 = dependencyStore.getEventDependencies(event2);

        statsAfter = Object.assign({}, stats);

        t.is(eventDeps1.length, 0, "There're no dependencies for the new event 1");
        t.is(eventDeps2.length, 0, "There're no dependencies for the new event 2");

        t.isGreater(statsAfter.hit, statsBefore.hit, "Requesting dependencies of the new event doesn't make attempt to do full scan of the dependency store");
        t.is(statsAfter.miss, statsBefore.miss, "Requesting dependencies of the new event doesn't make attempt to do full scan of the dependency store");

        // Changing event id
        t.diag('Changing an event id');

        dependency = dependencyStore.add({
            from : event1.id,
            to   : event2.id
        }).pop();
        t.isObject(dependency, 'New dependency obtained');

        statsBefore = Object.assign({}, stats);

        eventDeps1 = dependencyStore.getEventDependencies(event1);
        eventDeps2 = dependencyStore.getEventDependencies(event2);

        event1.id = 1000003;
        event2.id = 1000004;

        t.is(eventDeps1.length, 1, "There's one dependency for the new event 1");
        t.is(eventDeps2.length, 1, "There's one dependency for the new event 2");
        t.isDeeply(idfy(eventDeps1), idfy(dependencyStore.getEventDependencies(event1)), 'Event1 dependencies remain the same after id change');
        t.isDeeply(idfy(eventDeps2), idfy(dependencyStore.getEventDependencies(event2)), 'Event2 dependencies remain the same after id change');

        statsAfter = Object.assign({}, stats);

        t.isGreater(statsAfter.hit, statsBefore.hit, "Requesting dependencies of the event with id changed doesn't make attempt to do full scan of the dependency store");
        t.is(statsAfter.miss, statsBefore.miss, "Requesting dependencies of the event with id changed doesn't make attempt to do full scan of the dependency store");

        // Removing event
        t.diag('Removing an event');

        statsBefore = Object.assign({}, stats);

        eventStore.remove(event2);

        eventDeps1 = dependencyStore.getEventDependencies(event1);
        eventDeps2 = dependencyStore.getEventDependencies(event2);

        statsAfter = Object.assign({}, stats);

        t.is(eventDeps1.length, 0, "There're no dependencies for the event 1 since it's single dependency target has been removed");
        t.is(eventDeps2.length, 0, "There're no dependencies for the event 2 since it has been removed");
        t.isGreater(statsAfter.hit, statsBefore.hit, "Requesting dependencies of the removed event doesn't make attempt to do full scan of the dependency store");
        t.is(statsAfter.miss, statsBefore.miss, "Requesting dependencies of the removed event doesn't make attempt to do full scan of the dependency store");
    });
});
