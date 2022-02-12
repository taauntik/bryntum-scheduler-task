import { Scheduler } from '../../build/scheduler.module.js?456730';

// https://github.com/bryntum/support/issues/2566
// https://github.com/bryntum/support/issues/2720
StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler?.destroy?.());

    //region Change time => CRUD sync
    t.it('Drag event to another time slot and sync changes should apply correct classes to Event element when CRUD manager sync is prevented', async t => {
        t.mockUrl('load', {
            responseText : JSON.stringify({
                success : true,
                type    : 'load',
                events  : {
                    rows : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }]
                },
                resources : {
                    rows : [{ id : 1, name : 'Man' }]
                },
                assignments : {
                    rows : [{ id : 1, resourceId : 1, eventId : 1 }]
                }
            })
        });

        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            crudManager : {
                autoLoad  : true,
                autoSync  : false,
                transport : {
                    load : { url : 'load' },
                    sync : { url : 'sync' }
                },
                listeners : {
                    beforeSync() {
                        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
                        t.selectorNotExists('.b-sch-event.b-sch-committing', 'Element is not marked as committing');
                        return false;
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            }
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.crudManager.sync(); // beforeSync prevents saving
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.crudManager.sync(); // beforeSync prevents saving
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');
    });

    t.it('Drag event to another time slot and sync changes should apply correct classes to Event element when CRUD manager sync fails to save data', async t => {
        t.mockUrl('load', {
            responseText : JSON.stringify({
                success : true,
                type    : 'load',
                events  : {
                    rows : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }]
                },
                resources : {
                    rows : [{ id : 1, name : 'Man' }]
                },
                assignments : {
                    rows : [{ id : 1, resourceId : 1, eventId : 1 }]
                }
            })
        });

        t.mockUrl('sync', {
            delay        : 10,
            responseText : JSON.stringify({
                success : false,
                message : 'Data is not saved',
                type    : 'sync'
            })
        });

        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            crudManager : {
                autoLoad  : true,
                autoSync  : false,
                transport : {
                    load : { url : 'load' },
                    sync : { url : 'sync' }
                },
                listeners : {
                    syncStart() {
                        t.todo('Implement committingCls for Crud Manager #2720', todo => {
                            todo.ok(scheduler.eventStore.first.isCommitting, 'Record is marked as committing');
                            todo.selectorExists('.b-sch-event.b-sch-committing', 'Element is marked as committing');
                        });
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            }
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.crudManager.sync().catch(() => {
            // exception is expected here because we return { success : false }
        });
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.crudManager.sync().catch(() => {
            // exception is expected here because we return { success : false }
        });
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');
    });

    t.it('Drag event to another time slot and sync changes should apply correct classes to Event element when CRUD manager sync succeeds to save data', async t => {
        t.mockUrl('load', {
            responseText : JSON.stringify({
                success : true,
                type    : 'load',
                events  : {
                    rows : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }]
                },
                resources : {
                    rows : [{ id : 1, name : 'Man' }]
                },
                assignments : {
                    rows : [{ id : 1, resourceId : 1, eventId : 1 }]
                }
            })
        });

        t.mockUrl('sync', {
            delay        : 10,
            responseText : JSON.stringify({
                success : true,
                type    : 'sync',
                events  : {
                    rows : [{ id : 1 }]
                }
            })
        });

        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            crudManager : {
                autoLoad  : true,
                autoSync  : false,
                transport : {
                    load : { url : 'load' },
                    sync : { url : 'sync' }
                },
                listeners : {
                    syncStart() {
                        t.todo('Implement committingCls for Crud Manager #2720', todo => {
                            todo.ok(scheduler.eventStore.first.isCommitting, 'Record is marked as committing');
                            todo.selectorExists('.b-sch-event.b-sch-committing', 'Element is marked as committing');
                        });
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            }
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.crudManager.sync();
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelectorNotFound('.b-sch-dirty,.b-sch-committing');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.crudManager.sync();
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelectorNotFound('.b-sch-dirty,.b-sch-committing');
    });
    //endregion

    //region Change resource => CRUD sync
    t.it('Drag event to another resource and sync changes should apply correct classes to Event element when CRUD manager sync is prevented', async t => {
        t.mockUrl('load', {
            responseText : JSON.stringify({
                success : true,
                type    : 'load',
                events  : {
                    rows : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }]
                },
                resources : {
                    rows : [
                        { id : 1, name : 'Foo' },
                        { id : 2, name : 'Bar' },
                        { id : 3, name : 'Baz' }
                    ]
                },
                assignments : {
                    rows : [{ id : 1, resourceId : 1, eventId : 1 }]
                }
            })
        });

        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            crudManager : {
                autoLoad  : true,
                autoSync  : false,
                transport : {
                    load : { url : 'load' },
                    sync : { url : 'sync' }
                },
                listeners : {
                    beforeSync() {
                        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
                        t.selectorNotExists('.b-sch-event.b-sch-committing', 'Element is not marked as committing');
                        return false;
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            }
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.crudManager.sync(); // beforeSync prevents saving
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.crudManager.sync(); // beforeSync prevents saving
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');
    });

    t.it('Drag event to another resource and sync changes should apply correct classes to Event element when CRUD manager sync fails to save data', async t => {
        t.mockUrl('load', {
            responseText : JSON.stringify({
                success : true,
                type    : 'load',
                events  : {
                    rows : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }]
                },
                resources : {
                    rows : [
                        { id : 1, name : 'Foo' },
                        { id : 2, name : 'Bar' },
                        { id : 3, name : 'Baz' }
                    ]
                },
                assignments : {
                    rows : [{ id : 1, resourceId : 1, eventId : 1 }]
                }
            })
        });

        t.mockUrl('sync', {
            delay        : 10,
            responseText : JSON.stringify({
                success : false,
                message : 'Data is not saved',
                type    : 'sync'
            })
        });

        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            crudManager : {
                autoLoad  : true,
                autoSync  : false,
                transport : {
                    load : { url : 'load' },
                    sync : { url : 'sync' }
                },
                listeners : {
                    syncStart() {
                        t.todo('Implement committingCls for Crud Manager #2720', todo => {
                            todo.ok(scheduler.assignmentStore.first.isCommitting, 'Record is marked as committing');
                            todo.selectorExists('.b-sch-event.b-sch-committing', 'Element is marked as committing');
                        });
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            }
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.crudManager.sync().catch(() => {
            // exception is expected here because we return { success : false }
        });
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.crudManager.sync().catch(() => {
            // exception is expected here because we return { success : false }
        });
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');
    });

    t.it('Drag event to another resource and sync changes should apply correct classes to Event element when CRUD manager sync succeeds to save data', async t => {
        t.mockUrl('load', {
            responseText : JSON.stringify({
                success : true,
                type    : 'load',
                events  : {
                    rows : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }]
                },
                resources : {
                    rows : [
                        { id : 1, name : 'Foo' },
                        { id : 2, name : 'Bar' },
                        { id : 3, name : 'Baz' }
                    ]
                },
                assignments : {
                    rows : [{ id : 1, resourceId : 1, eventId : 1 }]
                }
            })
        });

        t.mockUrl('sync', {
            delay        : 10,
            responseText : JSON.stringify({
                success : true,
                type    : 'sync',
                events  : {
                    rows : [{ id : 1 }]
                }
            })
        });

        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            crudManager : {
                autoLoad  : true,
                autoSync  : false,
                transport : {
                    load : { url : 'load' },
                    sync : { url : 'sync' }
                },
                listeners : {
                    syncStart() {
                        t.todo('Implement committingCls for Crud Manager #2720', todo => {
                            todo.ok(scheduler.assignmentStore.first.isCommitting, 'Record is marked as committing');
                            todo.selectorExists('.b-sch-event.b-sch-committing', 'Element is marked as committing');
                        });
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            }
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.crudManager.sync();
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelectorNotFound('.b-sch-dirty,.b-sch-committing');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.crudManager.sync();
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelectorNotFound('.b-sch-dirty,.b-sch-committing');
    });
    //endregion

    //region Change time => Store commit
    t.it('Drag event to another time slot and commit changes should apply correct classes to Event element when store commit is prevented', async t => {
        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            eventStore : {
                updateUrl : 'sync',
                data      : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }],
                listeners : {
                    beforeCommit() {
                        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
                        t.selectorNotExists('.b-sch-event.b-sch-committing', 'Element is not marked as committing');
                        return false;
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            },
            resources   : [{ id : 1, name : 'Man' }],
            assignments : [{ id : 1, resourceId : 1, eventId : 1 }]
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.eventStore.commit(); // beforeCommit prevents committing
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.eventStore.commit(); // beforeCommit prevents committing
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');
    });

    t.it('Drag event to another time slot and commit changes should apply correct classes to Event element when store commit fails to save data', async t => {
        // The Ajax request must succeed, but contain a failure message
        t.mockUrl('sync', {
            responseText : JSON.stringify({ success : false, message : 'Data is not saved' })
        });

        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            eventStore : {
                updateUrl : 'sync',
                data      : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }],
                listeners : {
                    commitStart() {
                        t.ok(scheduler.eventStore.first.isCommitting, 'Record is marked as committing');
                        t.selectorExists('.b-sch-event.b-sch-committing', 'Element is marked as committing');
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            },
            resources   : [{ id : 1, name : 'Man' }],
            assignments : [{ id : 1, resourceId : 1, eventId : 1 }]
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.eventStore.commit().catch(() => {
            // exception is expected here because we return { success : false }
        });
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.eventStore.commit().catch(() => {
            // exception is expected here because we return { success : false }
        });
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');
    });

    t.it('Drag event to another time slot and commit changes should apply correct classes to Event element when store commit succeeds to save data', async t => {
        t.mockUrl('sync', {
            responseText : JSON.stringify({ success : true, data : [{ id : 1 }] })
        });

        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            eventStore : {
                updateUrl : 'sync',
                data      : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }],
                listeners : {
                    commitStart() {
                        t.ok(scheduler.eventStore.first.isCommitting, 'Record is marked as committing');
                        t.selectorExists('.b-sch-event.b-sch-committing', 'Element is marked as committing');
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            },
            resources   : [{ id : 1, name : 'Man' }],
            assignments : [{ id : 1, resourceId : 1, eventId : 1 }]
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.eventStore.commit();
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelectorNotFound('.b-sch-dirty,.b-sch-committing');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [scheduler.tickSize * 2, 0]);
        await scheduler.eventStore.commit();
        t.notOk(scheduler.eventStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelectorNotFound('.b-sch-dirty,.b-sch-committing');
    });
    //endregion

    //region Change resource => Store commit
    t.it('Drag event to another resource and commit changes should apply correct classes to Event element when store commit is prevented', async t => {
        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            events    : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }],
            resources : [
                { id : 1, name : 'Foo' },
                { id : 2, name : 'Bar' },
                { id : 3, name : 'Baz' }
            ],
            assignmentStore : {
                updateUrl : 'sync',
                data      : [{ id : 1, resourceId : 1, eventId : 1 }],
                listeners : {
                    beforeCommit() {
                        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
                        t.selectorNotExists('.b-sch-event.b-sch-committing', 'Element is not marked as committing');
                        return false;
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            }
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.assignmentStore.commit(); // beforeCommit prevents committing
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.assignmentStore.commit(); // beforeCommit prevents committing
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');
    });

    t.it('Drag event to another resource and commit changes should apply correct classes to Event element when store commit fails to save data', async t => {
        t.mockUrl('sync', {
            responseText : JSON.stringify({ success : false, message : 'Data is not saved' })
        });

        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            events    : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }],
            resources : [
                { id : 1, name : 'Foo' },
                { id : 2, name : 'Bar' },
                { id : 3, name : 'Baz' }
            ],
            assignmentStore : {
                updateUrl : 'sync',
                data      : [{ id : 1, resourceId : 1, eventId : 1 }],
                listeners : {
                    commitStart() {
                        t.ok(scheduler.assignmentStore.first.isCommitting, 'Record is marked as committing');
                        t.selectorExists('.b-sch-event.b-sch-committing', 'Element is marked as committing');
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            }
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.assignmentStore.commit().catch(() => {
            // exception is expected here because we return { success : false }
        });
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.assignmentStore.commit().catch(() => {
            // exception is expected here because we return { success : false }
        });
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelector('.b-sch-event.b-sch-dirty');
    });

    t.it('Drag event to another resource and commit changes should apply correct classes to Event element when store commit succeeds to save data', async t => {
        t.mockUrl('sync', {
            responseText : JSON.stringify({ success : true, data : [{ id : 1 }] })
        });

        scheduler = new Scheduler({
            appendTo   : document.body,
            startDate  : new Date(2021, 3, 11),
            endDate    : new Date(2021, 3, 18),
            viewPreset : 'weekAndDay',
            loadMask   : false,
            syncMask   : false,
            columns    : [
                { text : 'Name', field : 'name', width : 100 }
            ],
            events    : [{ id : 1, name : 'Task', startDate : '2021-04-12', duration : 1 }],
            resources : [
                { id : 1, name : 'Foo' },
                { id : 2, name : 'Bar' },
                { id : 3, name : 'Baz' }
            ],
            assignmentStore : {
                updateUrl : 'sync',
                data      : [{ id : 1, resourceId : 1, eventId : 1 }],
                listeners : {
                    commitStart() {
                        t.ok(scheduler.assignmentStore.first.isCommitting, 'Record is marked as committing');
                        t.selectorExists('.b-sch-event.b-sch-committing', 'Element is marked as committing');
                    },
                    // Should run after internal handlers are called
                    prio : -999
                }
            }
        });

        await t.waitForSelector('.b-sch-event');
        t.selectorNotExists('.b-sch-dirty,.b-sch-committing', 'Element is not dirty and not committing');

        t.diag('First drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.assignmentStore.commit();
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelectorNotFound('.b-sch-dirty,.b-sch-committing');

        t.diag('Second drag');
        await t.dragBy('.b-sch-event', [0, scheduler.rowHeight]);
        await scheduler.assignmentStore.commit(); // beforeCommit prevents committing
        t.notOk(scheduler.assignmentStore.first.isCommitting, 'Record is not marked as committing');
        t.selectorNotExists('.b-sch-committing', 'Element is not marked as committing');
        await t.waitForSelectorNotFound('.b-sch-dirty,.b-sch-committing');
    });
    //endregion
});
