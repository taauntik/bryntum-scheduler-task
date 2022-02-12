import { Scheduler, Override, PresetManager, Base, * as Bundle } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler,
        instances,
        count;

    t.beforeEach(() => {
        scheduler?.destroy?.();
        instances = new Set();
        count     = 0;
    });

    class Over {
        static get target() {
            return {
                class : Base
            };
        }

        construct() {
            this.__count = count++;
            const result = this._overridden.construct.call(this, ...arguments);

            instances.add(this);
            return result;
        }
    }

    Override.apply(Over);

    // https://github.com/bryntum/support/issues/2575
    t.it('Should destroy all stores / project when destroying Scheduler when destroyStores is set', async t => {
        scheduler = new Scheduler({
            appendTo      : document.body,
            resources     : [{}],
            columns       : [{}],
            destroyStores : true,
            features      : {
                timeRanges         : true,
                resourceTimeRanges : true
            }
        });

        const
            { timeAxis, timeAxisViewModel } = scheduler,
            unjoinedStores                  = timeAxis.first.unjoinedStores,
            timeRangeStore                  = scheduler.features.timeRanges.store,
            project                         = scheduler.project,
            {
                eventStore,
                resourceStore,
                dependencyStore,
                assignmentStore,
                calendarManagerStore
            }                               = project,
            resourceTimeRangeStore          = scheduler.features.resourceTimeRanges.store;

        t.is(scheduler.project.resourceTimeRangeStore, resourceTimeRangeStore, 'resourceTimeRangeStore is as expected');

        scheduler.destroy();

        t.is(scheduler.isDestroyed, true, 'Destroyed');
        t.is(timeAxis.isDestroyed, true, 'timeAxis Destroyed');
        t.is(timeAxisViewModel.isDestroyed, true, 'timeAxisViewModel Destroyed');
        t.is(project.isDestroyed, true, 'project Destroyed');
        t.is(unjoinedStores.length, 0, 'Records not added to unjoinedStores when the store is being destroyed');
        t.is(eventStore.isDestroyed, true, 'eventStore Destroyed');
        t.is(resourceStore.isDestroyed, true, 'resourceStore Destroyed');
        t.is(dependencyStore.isDestroyed, true, 'dependencyStore Destroyed');
        t.is(assignmentStore.isDestroyed, true, 'assignmentStore Destroyed');
        t.is(calendarManagerStore.isDestroyed, true, 'calendarManagerStore Destroyed');
        t.is(timeRangeStore.isDestroyed, true, 'timeRanges.store Destroyed');
        t.is(resourceTimeRangeStore.isDestroyed, true, 'resourceTimeRanges.store Destroyed');
    });

    t.it('Should not find arrays / objects having member count growing with amount of operations performed', async t => {
        scheduler = new Scheduler({
            appendTo  : document.body,
            startDate : new Date(2020, 1, 1),
            endDate   : new Date(2020, 2, 1),
            columns   : [{
                field : 'name'
            }],
            project  : {},
            features : {
                dependencies       : true,
                timeRanges         : true,
                resourceTimeRanges : true
            }
        });

        scheduler.resourceStore.id = Math.PI;
        scheduler.eventStore.id = Math.PI;
        scheduler.dependencyStore.id = Math.PI;
        scheduler.assignmentStore.id = Math.PI;
        scheduler.project.id = Math.PI;

        for (let i = 1; i < 110; i++) {
            scheduler.shiftNext();
            scheduler.shiftPrevious();
            scheduler.project = {
                listeners : {
                    load    : () => {},
                    thisObj : scheduler
                },
                calendarManagerStore : {
                    data : [
                        {
                            id : i
                        }
                    ],
                    listeners : {
                        load : () => {}
                    }
                },
                assignmentStore : {
                    data : [{
                        id         : i,
                        eventId    : i,
                        resourceId : i
                    },
                    {
                        id         : i + 1,
                        eventId    : i + 1,
                        resourceId : i
                    }]
                },
                resourceStore : {
                    data : [{
                        id   : i,
                        name : 'foo'
                    }]
                },
                eventStore : {
                    data : [{
                        id        : i,
                        startDate : new Date(2020, 1, 1),
                        duration  : i
                    },
                    {
                        id        : i + 1,
                        startDate : new Date(2020, 1, 11),
                        duration  : i + 1
                    }]
                },
                dependencyStore : {
                    data : [{
                        id   : i,
                        from : i,
                        to   : i + 1
                    }]
                }
            };

            Object.assign(scheduler, {
                timeRanges : {
                    data : [{
                        id        : i,
                        startDate : new Date(2020, 1, 1),
                        endDate   : new Date(2020, 1, 2)
                    }]
                },
                resourceTimeRanges : {
                    data : [{
                        id         : i,
                        resourceId : i,
                        startDate  : new Date(2020, 1, 1),
                        endDate    : new Date(2020, 1, 2)
                    }]
                }
                // timeRangeStore : {
                //     data : [{
                //         id        : i,
                //         startDate : new Date(2020, 1, 1),
                //         endDate   : new Date(2020, 1, 2)
                //     }]
                // },
                // resourceTimeRangeStore : {
                //     data : [{
                //         id         : i,
                //         resourceId : i,
                //         startDate  : new Date(2020, 1, 1),
                //         endDate    : new Date(2020, 1, 2)
                //     }]
                // }
            });

            scheduler.resourceStore.first.name = String(i);
        }

        const maxFails = 10;
        let count      = 0;

        // Look for arrays or objects with members growing in size
        for (const bryntumInstance of instances) {
            for (const name in bryntumInstance) {
                const
                    value   = bryntumInstance[name],
                    skip    = {
                        configDone : 1
                    },
                    entries = value && !(name in skip) && (Array.isArray(value) ? value : (typeof value === 'object' && !value.$$name && Object.keys(value)));

                if (entries?.length > 100) {
                    t.fail(bryntumInstance.$$name + ' ' + name + ': ' + entries.length);
                    count++;
                }
            }

            if (count >= maxFails) {
                break;
            }
        }

        if (!t.isFailed()) {
            t.pass('No leaks detected');
        }
    });

    t.it('Should not find references to old replaced project / store instances', async t => {
        scheduler = new Scheduler({
            appendTo  : document.body,
            startDate : new Date(2020, 1, 1),
            endDate   : new Date(2020, 2, 1),
            columns   : [{
                field : 'name',
                type  : 'tree'
            }],
            project : {
                stm : {
                    autoRecord : true
                }
            },
            features : {
                pdfExport          : true,
                dependencies       : true,
                dependencyEdit     : true,
                eventFilter        : true,
                timeRanges         : true,
                resourceTimeRanges : true,
                filterBar          : true,
                tree               : true,
                summary            : {
                    renderer : () => ''
                },
                rowReorder     : true,
                quickFind      : true,
                search         : true,
                stripe         : true,
                labels         : true,
                nonWorkingTime : true,
                pan            : true,
                headerZoom     : true
            }
        });

        scheduler.resourceStore.add({ id : Math.PI, name : 'before' });
        scheduler.assignmentStore.add([
            {
                id         : Math.PI,
                eventId    : Math.PI,
                resourceId : Math.PI
            },
            {
                id         : 1,
                eventId    : 2,
                resourceId : Math.PI
            }
        ]);
        scheduler.eventStore.add([{
            id        : Math.PI,
            startDate : new Date(2020, 1, 1),
            duration  : 1
        },
        {
            id        : 2,
            startDate : new Date(2020, 1, 11),
            duration  : 2
        }]);
        scheduler.dependencyStore.add({ id : Math.PI, from : Math.PI, to : 2 });

        scheduler.resourceStore.id   = Math.PI;
        scheduler.eventStore.id      = Math.PI;
        scheduler.dependencyStore.id = Math.PI;
        scheduler.assignmentStore.id = Math.PI;
        scheduler.project.id         = Math.PI;

        // Some interaction
        scheduler.selectedRecord = scheduler.resourceStore.first;
        scheduler.selectedEvents = scheduler.eventStore.records;
        await t.moveCursorTo('.b-sch-event');
        await t.waitForSelector('.b-sch-event-tooltip');

        await t.dragBy({
            source : '.b-sch-event',
            delta  : [100, 0],
            offset : ['100%-5', '50%']
        });
        await t.doubleClick('.b-sch-event');

        await t.dragBy({
            source : '.b-sch-timeaxis-cell',
            delta  : [100, 0],
            offset : [5, 10]
        });
        await t.click('.b-popup-close');

        // Replace project, no references to initial project should remain
        scheduler.project = {
            listeners : {
                thisObj : scheduler
            },
            calendarManagerStore : {
                data : [
                    {
                        id : 1
                    }
                ]
            },
            assignmentStore : {
                data : [{
                    id         : 1,
                    eventId    : 1,
                    resourceId : 1
                },
                {
                    id         : 2,
                    eventId    : 2,
                    resourceId : 1
                }]
            },
            resourceStore : {
                data : [{
                    id   : 1,
                    name : 'foo'
                }]
            },
            eventStore : {
                data : [
                    {
                        id        : 1,
                        startDate : new Date(2020, 1, 1),
                        duration  : 1
                    },
                    {
                        id        : 2,
                        startDate : new Date(2020, 1, 11),
                        duration  : 2
                    }
                ]
            },
            dependencyStore : {
                data : [{
                    id   : 1,
                    from : 1,
                    to   : 2
                }]
            }
        };

        Object.assign(scheduler, {
            timeRanges : {
                data : [{
                    id        : 1,
                    startDate : new Date(2020, 1, 1),
                    endDate   : new Date(2020, 1, 2)
                }]
            },
            resourceTimeRanges : {
                data : [{
                    id         : 1,
                    resourceId : 1,
                    startDate  : new Date(2020, 1, 1),
                    endDate    : new Date(2020, 1, 2)
                }]
            }
        });

        let drawCount = 0;
        scheduler.features.dependencies.draw();

        // Force a few dependency redraws to have it flush its old state me.oldDrawnDependencies and me.drawnDependencies
        scheduler.on('dependenciesDrawn', () => {
            drawCount++;
            if (drawCount === 1) {
                scheduler.features.dependencies.draw();
            }
        });

        await t.waitFor(() => drawCount >= 2);

        // Look for references to old project / stores in Scheduler
        t.findValue(scheduler, Math.PI, 'Scheduler');

        // Look for references to old project / stores in all class symbols
        for (const cls in Bundle) {
            t.findValue(Bundle[cls], Math.PI, cls.$$name);
        }

        if (!t.isFailed()) {
            t.pass('No leaks detected');
        }
    });

    t.it('Should not retain references to old records after reloading store / crudManager', async t => {
        t.mockUrl('read', {
            responseText : JSON.stringify({
                success     : true,
                assignments : {
                    rows : [
                        {
                            id         : Math.PI,
                            eventId    : Math.PI,
                            resourceId : Math.PI
                        },
                        {
                            id         : 2,
                            eventId    : 2,
                            resourceId : Math.PI
                        }
                    ]
                },
                resources : {
                    rows : [{
                        id   : Math.PI,
                        name : 'foo'
                    }]
                },
                events : {
                    rows : [
                        {
                            id        : Math.PI,
                            startDate : new Date(2020, 1, 1),
                            duration  : Math.PI
                        },
                        {
                            id        : 2,
                            startDate : new Date(2020, 1, 1),
                            duration  : 2
                        }
                    ]
                },
                dependencies : {
                    rows : [{
                        id   : Math.PI,
                        from : Math.PI,
                        to   : 2
                    }]
                }
            })
        });

        scheduler = new Scheduler({
            appendTo  : document.body,
            startDate : new Date(2020, 1, 1),
            endDate   : new Date(2020, 2, 1),
            columns   : [{
                field : 'name',
                type  : 'tree'
            }],
            crudManager : {
                transport : {
                    load : {
                        url : 'read'
                    }
                }
            }
        });

        // Reload project, no references to initial project should remain
        await scheduler.crudManager.load();

        scheduler.selectedRecord = scheduler.resourceStore.first;
        scheduler.selectedEvents = scheduler.eventStore.records;
        await t.moveCursorTo('.b-sch-event');
        await t.waitForSelector('.b-sch-event-tooltip');
        await t.click('.b-grid-cell');

        t.mockUrl('read', {
            responseText : JSON.stringify({
                success     : true,
                assignments : {
                    rows : [
                    ]
                },
                resources : {
                    rows : []
                },
                events : {
                    rows : []
                },
                dependencies : {
                    rows : []
                }
            })
        });

        await scheduler.crudManager.load();

        // Look for references to old project / stores in Scheduler
        t.findValue(scheduler, Math.PI, 'Scheduler');

        // Look for references to old project / stores in all class symbols
        for (const cls in Bundle) {
            t.findValue(Bundle[cls], Math.PI, cls.$$name);
        }

        if (!t.isFailed()) {
            t.pass('No leaks detected');
        }
    });

    t.it('Should destroy class instances created by Scheduler (THIS t.it SHOULD RUN LAST)', async t => {
        scheduler = new Scheduler({
            appendTo : document.body,
            project  : {
                calendarManagerStore : {
                    data : [
                        {}
                    ]
                },
                assignmentStore : {
                    data : [{}]
                },
                resourceStore : {
                    data : [{}]
                },
                eventStore : {
                    data : [{}]
                },
                dependencyStore : {
                    data : [{}]
                }
            },
            columns       : [{}],
            destroyStores : true,
            features      : {
                timeRanges         : true,
                resourceTimeRanges : true
            }
        });

        await scheduler.project.commitAsync();

        // destroy shared tooltip
        Scheduler.tooltip.destroy();
        scheduler.destroy();
        PresetManager.destroy();

        instances.forEach(instance => {
            if (!instance.isDestroyed && !instance.isModel && instance.doDestroy !== Base.prototype.doDestroy && instance.$$name !== 'Ripple') {
                // console.log(instance.__count, instance.$$name);
                t.fail(instance.$$name + ' not destroyed');
            }
        });

        if (!t.isFailed()) {
            t.pass('No leaks detected');
        }
    });
});
