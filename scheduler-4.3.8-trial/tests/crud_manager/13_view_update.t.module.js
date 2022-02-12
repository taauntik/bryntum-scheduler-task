import { Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler?.destroy?.();
    });

    // https://github.com/bryntum/support/issues/385
    t.it('Should cleanup extra event elements correctly after resource is saved', async t => {
        t.mockUrl('load', {
            responseText : JSON.stringify({
                success   : true,
                type      : 'load',
                events    : { rows : [] },
                resources : {
                    rows : [{ id : 1, name : 'Default' }]
                }
            })
        });

        scheduler = new Scheduler({
            appendTo              : document.body,
            width                 : 500,
            height                : 300,
            startDate             : new Date(2020, 2, 1),
            endDate               : new Date(2020, 2, 8),
            enableEventAnimations : false,
            columns               : [{ text : 'Name', field : 'name', width : 150 }],
            crudManager           : {
                transport : {
                    load : { url : 'load' },
                    sync : { url : 'sync' }
                },
                autoLoad : false,
                autoSync : false
            }
        });

        await scheduler.crudManager.load();

        const
            [newResource] = scheduler.resourceStore.add({ name : 'New resource' }),
            [event1, event2]    = scheduler.eventStore.add([
                {
                    name       : 'Event 1',
                    resourceId : 1,
                    startDate  : '2020-03-01',
                    endDate    : '2020-03-03'
                },
                {
                    name       : 'Event 2',
                    resourceId : newResource.id,
                    startDate  : '2020-03-01',
                    endDate    : '2020-03-03'
                }
            ]);

        t.mockUrl('sync', {
            responseText : JSON.stringify({
                success : true,
                type    : 'sync',
                events  : {
                    rows : [
                        { $PhantomId : event1.id, id : 1 },
                        { $PhantomId : event2.id, id : 2, resourceId : 2 }
                    ]
                },
                resources : {
                    rows : [{ $PhantomId : newResource.id, id : 2 }]
                }
            })
        });

        // Wait for first render to avoid stepping into rendering logic during debug
        await t.waitForSelector('.b-sch-event-wrap[data-resource-id="1"]');

        await scheduler.crudManager.sync();

        await t.waitForSelector('.b-sch-event-wrap[data-event-id="1"]');
        await t.waitForSelector('.b-sch-event-wrap[data-event-id="2"]');

        t.selectorCountIs('.b-sch-event', 2, 'No ghost event elements');

        t.is(scheduler.getElementFromEventRecord(event1), document.querySelector('[data-event-id="1"] .b-sch-event'), 'Event 1 element is resolved correctly');
        t.is(scheduler.getElementFromEventRecord(event2), document.querySelector('[data-event-id="2"] .b-sch-event'), 'Event 2 element is resolved correctly');
    });

    // https://github.com/bryntum/support/issues/2577
    t.it('Should update event element dataset with IDs returned from server: horizontal mode', async t => {
        t.mockUrl('load', {
            responseText : JSON.stringify({
                success     : true,
                type        : 'load',
                events      : { rows : [] },
                assignments : { rows : [] },
                resources   : {
                    rows : [{ id : 1, name : 'Default' }]
                }
            })
        });

        scheduler = new Scheduler({
            appendTo              : document.body,
            width                 : 500,
            height                : 300,
            startDate             : new Date(2020, 2, 1),
            endDate               : new Date(2020, 2, 8),
            enableEventAnimations : false,
            columns               : [{ text : 'Name', field : 'name', width : 150 }],
            crudManager           : {
                transport : {
                    load : { url : 'load' },
                    sync : { url : 'sync' }
                },
                autoLoad : false,
                autoSync : false
            }
        });

        await scheduler.crudManager.load();

        const
            [eventRecord] = scheduler.eventStore.add([{
                name       : 'Foo',
                resourceId : 1,
                startDate  : '2020-03-01',
                endDate    : '2020-03-03'
            }]),
            assignmentId  = eventRecord.assignments[0].id,
            eventId       = eventRecord.id;

        t.mockUrl('sync', {
            responseText : JSON.stringify({
                success : true,
                type    : 'sync',
                events  : {
                    rows : [{ $PhantomId : eventId, id : 10 }]
                },
                assignments : {
                    rows : [{ $PhantomId : assignmentId, id : 20 }]
                }
            })
        });

        // Wait for first render to avoid stepping into rendering logic during debug
        await t.waitForSelector(`.b-sch-event-wrap[data-resource-id="1"][data-event-id="${eventId}"][data-assignment-id="${assignmentId}"]`);

        await scheduler.crudManager.sync();

        t.is(scheduler.resourceStore.last.id, 1);
        t.is(scheduler.eventStore.last.id, 10);
        t.is(scheduler.assignmentStore.last.id, 20);

        await t.waitForSelector('.b-sch-event-wrap[data-resource-id="1"][data-event-id="10"][data-assignment-id="20"]');
    });

    t.it('Should update event element dataset with IDs returned from server: vertical mode', async t => {
        t.mockUrl('load', {
            responseText : JSON.stringify({
                success     : true,
                type        : 'load',
                events      : { rows : [] },
                assignments : { rows : [] },
                resources   : {
                    rows : [{ id : 1, name : 'Default' }]
                }
            })
        });

        scheduler = new Scheduler({
            mode                  : 'vertical',
            appendTo              : document.body,
            width                 : 500,
            height                : 300,
            startDate             : new Date(2020, 2, 1),
            endDate               : new Date(2020, 2, 8),
            enableEventAnimations : false,
            crudManager           : {
                transport : {
                    load : { url : 'load' },
                    sync : { url : 'sync' }
                },
                autoLoad : false,
                autoSync : false
            }
        });

        await scheduler.crudManager.load();

        const
            [eventRecord] = scheduler.eventStore.add([{
                name       : 'Foo',
                resourceId : 1,
                startDate  : '2020-03-01',
                endDate    : '2020-03-03'
            }]),
            assignmentId  = eventRecord.assignments[0].id,
            eventId       = eventRecord.id;

        t.mockUrl('sync', {
            responseText : JSON.stringify({
                success : true,
                type    : 'sync',
                events  : {
                    rows : [{ $PhantomId : eventId, id : 10 }]
                },
                assignments : {
                    rows : [{ $PhantomId : assignmentId, id : 20 }]
                }
            })
        });

        // Wait for first render to avoid stepping into rendering logic during debug
        await t.waitForSelector(`.b-sch-event-wrap[data-resource-id="1"][data-event-id="${eventId}"][data-assignment-id="${assignmentId}"]`);

        await scheduler.crudManager.sync();

        t.is(scheduler.resourceStore.last.id, 1);
        t.is(scheduler.eventStore.last.id, 10);
        t.is(scheduler.assignmentStore.last.id, 20);

        await t.waitForSelector('.b-sch-event-wrap[data-resource-id="1"][data-event-id="10"][data-assignment-id="20"]');
    });
});
