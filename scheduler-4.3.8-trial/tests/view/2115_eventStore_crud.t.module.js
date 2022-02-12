import { EventStore, EventModel } from '../../build/scheduler.module.js?456730';

StartTest(async t => {
    const eventStore = new EventStore();

    const scheduler = await t.getSchedulerAsync({
        mode                 : 'horizontal',
        eventStore,
        dependencyViewConfig : {
            drawDependencies : false
        }
    });

    const resource = scheduler.resourceStore.first;

    const newEvent = new EventModel({
        startDate  : new Date(scheduler.startDate),
        endDate    : new Date(scheduler.endDate),
        resourceId : resource.id
    });

    const newEvent2 = new EventModel({
        startDate  : new Date(scheduler.startDate),
        endDate    : new Date(scheduler.endDate),
        resourceId : resource.id
    });

    t.selectorNotExists('.b-sch-event', 'No events initially');

    eventStore.add(newEvent);
    eventStore.add(newEvent2);

    await t.waitForProjectReady();

    t.ok(newEvent.hasGeneratedId, 'newEvent is phantom');
    t.ok(newEvent2.hasGeneratedId, 'newEvent2 is phantom');

    t.selectorExists('.b-sch-event', 'Add ok');

    eventStore.revertChanges();

    await t.waitForProjectReady();

    t.is(eventStore.count, 0, 'Store should be empty');

    t.selectorNotExists(scheduler.unreleasedEventSelector, 'Clear ok');

    // TODO: Not working with engine
    // eventStore.add(newEvent);
    //
    // newEvent.cls = 'foo';
    //
    // await t.waitForProjectReady();
    //
    // t.selectorExists('.b-sch-event.foo', 'Update ok');
    //
    // eventStore.remove(newEvent);
    //
    // await t.waitForProjectReady();

});
