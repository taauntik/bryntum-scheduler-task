import { ProjectModel, CrudManager, ResourceStore, EventStore } from '../../build/scheduler.module.js?456730';

StartTest(t => {

    // Asserts initial commit handling by the project (https://github.com/bryntum/support/issues/1346)

    t.it('CrudManager loading', async t => {

        t.mockUrl('cm-load', {
            delay        : 1,
            responseText : JSON.stringify({
                success : true,
                events  : {
                    rows : [
                        {
                            id           : 'e1',
                            name         : 'Buldoze 1',
                            startDate    : new Date(2019, 0, 1),
                            duration     : 10,
                            durationUnit : 'd'
                        }
                    ]
                },
                resources : {
                    rows : []
                }
            })
        });

        t.mockUrl('cm-sync', {
            delay        : 1,
            responseText : '{ "success" : true }'
        });

        t.it('silenceInitialCommit=true (default) silently accepts the data changes caused by propagation', async t => {

            const
                async       = t.beginAsync(),
                project     = new ProjectModel(),
                crudManager = new CrudManager({
                    project,
                    transport : {
                        load : {
                            url : 'cm-load'
                        },
                        sync : {
                            url : 'cm-sync'
                        }
                    },
                    autoLoad  : true,
                    autoSync  : true,
                    listeners : {
                        load : () => {
                            t.endAsync(async);
                            t.notOk(crudManager.crudStoreHasChanges(), 'no changes after loading');
                        }
                    }
                });

            t.notOk(crudManager.crudStoreHasChanges(), 'no changes before loading');
            t.wontFire(crudManager, 'sync', 'no sync happened');
            await t.waitFor(100);
        });

        t.it('silenceInitialCommit=false should trigger autoSync and leave the data dirty', async t => {

            const
                async       = t.beginAsync(),
                project     = new ProjectModel({
                    silenceInitialCommit : false
                }),
                crudManager = new CrudManager({
                    project,
                    transport : {
                        load : {
                            url : 'cm-load'
                        },
                        sync : {
                            url : 'cm-sync'
                        }
                    },
                    autoLoad  : true,
                    autoSync  : true,
                    listeners : {
                        load : () => t.ok(crudManager.crudStoreHasChanges(), 'there are changes after loading & propagating'),
                        sync : () => {
                            t.endAsync(async);
                            t.pass('sync is triggered');
                        }
                    }
                });

            t.notOk(crudManager.crudStoreHasChanges(), 'no changes before loading');
        });

    });

    t.it('Individual stores loading', t => {

        t.mockUrl('resources-read', {
            delay        : 1,
            responseText : JSON.stringify([
                { id : 1, name : 'Volvo V90' },
                { id : 2, name : 'Volvo XC60' },
                { id : 3, name : 'BMW M3' },
                { id : 4, name : 'BMW X5' },
                { id : 5, name : 'Peugeot 308' }
            ])
        });

        t.mockUrl('events-read', {
            delay        : 1,
            responseText : JSON.stringify([
                { id : 1, resourceId : 1, name : 'Serve engine',   startDate : '2018-05-21 08:00', duration : 2 },
                { id : 2, resourceId : 1, name : 'Paint job',      startDate : '2018-05-21 12:00', duration : 2 },
                { id : 3, resourceId : 2, name : 'Tune',           startDate : '2018-05-21 07:00', duration : 1 },
                { id : 4, resourceId : 2, name : 'Diagnostics',    startDate : '2018-05-21 09:00', duration : 2 },
                { id : 5, resourceId : 3, name : 'Replace engine', startDate : '2018-05-21 07:00', duration : 6 },
                { id : 6, resourceId : 4, name : 'New windshield', startDate : '2018-05-21 08:00', duration : 2 },
                { id : 7, resourceId : 4, name : 'Replace airbag', startDate : '2018-05-21 09:00', duration : 3 },
                { id : 8, resourceId : 4, name : 'Wash',           startDate : '2018-05-21 14:00', duration : 2 },
                { id : 9, resourceId : 5, name : 'Repair cooler',  startDate : '2018-05-21 10:00', duration : 7 }
            ])
        });

        t.mockUrl('events-update', {
            delay        : 1,
            responseText : JSON.stringify({
                success : true,
                data    : [
                    { id : 1 },
                    { id : 2 },
                    { id : 3 },
                    { id : 4 },
                    { id : 5 },
                    { id : 6 },
                    { id : 7 },
                    { id : 8 },
                    { id : 9 }
                ]
            })
        });

        t.it('silenceInitialCommit=true (default) silently accepts the data changes caused by propagation', async t => {

            const
                projectAsync   = t.beginAsync(),
                resourcesAsync = t.beginAsync(),
                eventsAsync    = t.beginAsync(),
                resourceStore  = new ResourceStore({
                    createUrl  : 'resources-create',
                    readUrl    : 'resources-read',
                    updateUrl  : 'resources-update',
                    deleteUrl  : 'resources-delete',
                    autoLoad   : true,
                    autoCommit : true,
                    listeners  : {
                        load : () => {
                            t.endAsync(resourcesAsync);
                        }
                    }
                }),
                eventStore = new EventStore({
                    createUrl  : 'events-create',
                    readUrl    : 'events-read',
                    updateUrl  : 'events-update',
                    deleteUrl  : 'events-delete',
                    autoLoad   : true,
                    autoCommit : true,
                    listeners  : {
                        load : () => {
                            t.endAsync(eventsAsync);
                        }
                    }
                }),
                project = new ProjectModel({
                    resourceStore,
                    eventStore
                });

            t.notOk(resourceStore.changes, 'no resource changes before loading');
            t.notOk(eventStore.changes, 'no event changes before loading');
            t.wontFire(resourceStore, 'update', 'no resourceStore update happened');
            t.wontFire(resourceStore, 'commit', 'no resourceStore commit happened');
            t.wontFire(eventStore, 'update', 'no eventStore update happened');
            t.wontFire(eventStore, 'commit', 'no eventStore commit happened');
            t.willFireNTimes(project, 'dataReady', 1, 'one propagation happens');

            await t.waitFor(100);

            // project is in consistent state
            t.waitForProjectReady(project, () => t.endAsync(projectAsync));

            t.notOk(resourceStore.changes, 'no resource changes after loading');
            t.notOk(eventStore.changes, 'no event changes after loading');
        });

        t.it('silenceInitialCommit=false triggers store events on data changes caused by propagation', async t => {

            const
                projectAsync   = t.beginAsync(),
                resourcesAsync = t.beginAsync(),
                eventsAsync    = t.beginAsync(),
                resourceStore  = new ResourceStore({
                    createUrl  : 'resources-create',
                    readUrl    : 'resources-read',
                    updateUrl  : 'resources-update',
                    deleteUrl  : 'resources-delete',
                    autoLoad   : true,
                    autoCommit : true,
                    listeners  : {
                        load : () => {
                            t.endAsync(resourcesAsync);
                        }
                    }
                }),
                eventStore = new EventStore({
                    createUrl  : 'events-create',
                    readUrl    : 'events-read',
                    updateUrl  : 'events-update',
                    deleteUrl  : 'events-delete',
                    autoLoad   : true,
                    autoCommit : true,
                    listeners  : {
                        load : () => {
                            t.endAsync(eventsAsync);
                        }
                    }
                }),
                project = new ProjectModel({
                    resourceStore,
                    eventStore,
                    silenceInitialCommit : false
                });

            t.notOk(resourceStore.changes, 'no resource changes before loading');
            t.notOk(eventStore.changes, 'no event changes before loading');
            t.wontFire(resourceStore, 'update', 'no resourceStore update happened');
            t.wontFire(resourceStore, 'commit', 'no resourceStore commit happened');
            t.willFireNTimes(eventStore, 'update', 9, 'eventStore update happens for each event');
            t.willFireNTimes(eventStore, 'commit', 1, 'eventStore commit happened');
            t.willFireNTimes(project, 'dataReady', 1, 'one propagation happens');

            await t.waitFor(100);

            // project is in consistent state
            t.waitForProjectReady(project, () => t.endAsync(projectAsync));

            t.notOk(resourceStore.changes, 'no resource changes after loading');
            t.notOk(eventStore.changes, 'no event changes after loading');
        });

        t.it('silenceInitialCommit=true (default) silently accepts the data changes caused by propagation', async t => {

            const
                projectAsync   = t.beginAsync(),
                resourceStore  = new ResourceStore({
                    createUrl : 'resources-create',
                    readUrl   : 'resources-read',
                    updateUrl : 'resources-update',
                    deleteUrl : 'events-delete',
                    data      : [
                        { id : 1, name : 'Volvo V90' },
                        { id : 2, name : 'Volvo XC60' },
                        { id : 3, name : 'BMW M3' },
                        { id : 4, name : 'BMW X5' },
                        { id : 5, name : 'Peugeot 308' }
                    ],
                    autoCommit : true
                }),
                eventStore = new EventStore({
                    createUrl : 'resources-create',
                    readUrl   : 'events-read',
                    updateUrl : 'events-update',
                    deleteUrl : 'events-delete',
                    data      : [
                        { id : 1, resourceId : 1, name : 'Serve engine',   startDate : '2018-05-21 08:00', duration : 2 },
                        { id : 2, resourceId : 1, name : 'Paint job',      startDate : '2018-05-21 12:00', duration : 2 },
                        { id : 3, resourceId : 2, name : 'Tune',           startDate : '2018-05-21 07:00', duration : 1 },
                        { id : 4, resourceId : 2, name : 'Diagnostics',    startDate : '2018-05-21 09:00', duration : 2 },
                        { id : 5, resourceId : 3, name : 'Replace engine', startDate : '2018-05-21 07:00', duration : 6 },
                        { id : 6, resourceId : 4, name : 'New windshield', startDate : '2018-05-21 08:00', duration : 2 },
                        { id : 7, resourceId : 4, name : 'Replace airbag', startDate : '2018-05-21 09:00', duration : 3 },
                        { id : 8, resourceId : 4, name : 'Wash',           startDate : '2018-05-21 14:00', duration : 2 },
                        { id : 9, resourceId : 5, name : 'Repair cooler',  startDate : '2018-05-21 10:00', duration : 7 }
                    ],
                    autoCommit : true
                }),
                project = new ProjectModel({
                    resourceStore,
                    eventStore
                });

            t.notOk(resourceStore.changes, 'no resource changes before loading');
            t.notOk(eventStore.changes, 'no event changes before loading');
            t.wontFire(resourceStore, 'update', 'no resourceStore update happened');
            t.wontFire(resourceStore, 'commit', 'no resourceStore commit happened');
            t.wontFire(eventStore, 'update', 'no eventStore update happened');
            t.wontFire(eventStore, 'commit', 'no eventStore commit happened');
            t.willFireNTimes(project, 'dataReady', 1, 'one propagation happens');

            await t.waitFor(100);

            t.waitForProjectReady(project, () => t.endAsync(projectAsync));

            t.notOk(resourceStore.changes, 'no resource changes after loading');
            t.notOk(eventStore.changes, 'no event changes after loading');
        });

        t.it('silenceInitialCommit=false triggers store events on data changes caused by propagation', async t => {

            const
                projectAsync   = t.beginAsync(),
                resourceStore  = new ResourceStore({
                    createUrl : 'resources-create',
                    readUrl   : 'resources-read',
                    updateUrl : 'resources-update',
                    deleteUrl : 'events-delete',
                    data      : [
                        { id : 1, name : 'Volvo V90' },
                        { id : 2, name : 'Volvo XC60' },
                        { id : 3, name : 'BMW M3' },
                        { id : 4, name : 'BMW X5' },
                        { id : 5, name : 'Peugeot 308' }
                    ],
                    autoCommit : true
                }),
                eventStore = new EventStore({
                    createUrl : 'resources-create',
                    readUrl   : 'events-read',
                    updateUrl : 'events-update',
                    deleteUrl : 'events-delete',
                    data      : [
                        { id : 1, resourceId : 1, name : 'Serve engine',   startDate : '2018-05-21 08:00', duration : 2 },
                        { id : 2, resourceId : 1, name : 'Paint job',      startDate : '2018-05-21 12:00', duration : 2 },
                        { id : 3, resourceId : 2, name : 'Tune',           startDate : '2018-05-21 07:00', duration : 1 },
                        { id : 4, resourceId : 2, name : 'Diagnostics',    startDate : '2018-05-21 09:00', duration : 2 },
                        { id : 5, resourceId : 3, name : 'Replace engine', startDate : '2018-05-21 07:00', duration : 6 },
                        { id : 6, resourceId : 4, name : 'New windshield', startDate : '2018-05-21 08:00', duration : 2 },
                        { id : 7, resourceId : 4, name : 'Replace airbag', startDate : '2018-05-21 09:00', duration : 3 },
                        { id : 8, resourceId : 4, name : 'Wash',           startDate : '2018-05-21 14:00', duration : 2 },
                        { id : 9, resourceId : 5, name : 'Repair cooler',  startDate : '2018-05-21 10:00', duration : 7 }
                    ],
                    autoCommit : true
                }),
                project = new ProjectModel({
                    resourceStore,
                    eventStore,
                    silenceInitialCommit : false
                });

            t.notOk(resourceStore.changes, 'no resource changes before loading');
            t.notOk(eventStore.changes, 'no event changes before loading');
            t.wontFire(resourceStore, 'update', 'no resourceStore update happened');
            t.wontFire(resourceStore, 'commit', 'no resourceStore commit happened');
            t.willFireNTimes(eventStore, 'update', 9, 'eventStore update happens for each event');
            t.willFireNTimes(eventStore, 'commit', 1, 'eventStore commit happened');
            t.willFireNTimes(project, 'dataReady', 1, 'one propagation happens');

            await t.waitFor(100);

            t.waitForProjectReady(project, () => t.endAsync(projectAsync));

            t.notOk(resourceStore.changes, 'no resource changes after loading');
            t.notOk(eventStore.changes, 'no event changes after loading');
        });

    });

});
