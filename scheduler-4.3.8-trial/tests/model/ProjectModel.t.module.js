import { AssignmentStore, EventStore, ResourceStore, DependencyStore, ResourceTimeRangeStore, ProjectModel, Scheduler, CrudManager, EventModel, ResourceModel, AssignmentModel, RecurringTimeSpansMixin, Store } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    //region Data

    const
        eventsData = [
            { id : 1, name : 'Event 1', startDate : new Date(2020, 0, 17), duration : 2, durationUnit : 'd' },
            { id : 2, name : 'Event 2', startDate : new Date(2020, 0, 18), duration : 2, durationUnit : 'd' },
            { id : 3, name : 'Event 3', startDate : new Date(2020, 0, 19), endDate : new Date(2020, 0, 22) }
        ],
        singleEventsData = [
            { id : 1, resourceId : 1, name : 'Event 1', startDate : new Date(2020, 0, 17), duration : 2, durationUnit : 'd' },
            { id : 2, resourceId : 2, name : 'Event 2', startDate : new Date(2020, 0, 18), duration : 2, durationUnit : 'd' },
            { id : 3, resourceId : 2, name : 'Event 3', startDate : new Date(2020, 0, 19), duration : 3, durationUnit : 'd' }
        ],
        resourcesData = [
            { id : 1, name : 'Resource 1' },
            { id : 2, name : 'Resource 2' }
        ],
        assignmentsData = [
            { id : 1, eventId : 1, resourceId : 1 },
            { id : 2, eventId : 1, resourceId : 2 },
            { id : 3, eventId : 2, resourceId : 2 }
        ],
        resourceTimeRangesData = [
            { id : 1, resourceId : 1, name : 'Resource range 1', startDate : new Date(2020, 0, 17), duration : 2, durationUnit : 'd' }
        ],
        timeRangesData = [
            { id : 1, name : 'Range 1', startDate : new Date(2020, 0, 17), duration : 2, durationUnit : 'd' }
        ],
        newEventsData = [
            { id : 4, name : 'New event 4', startDate : new Date(2020, 0, 17), duration : 2, durationUnit : 'd' }
        ],
        newAssignmentsData =  [
            { id : 1, eventId : 4, resourceId : 1 }
        ];

    //endregion

    //region Setup

    let scheduler, scheduler2, project;

    t.beforeEach(t => {
        Scheduler.destroy(scheduler, scheduler2, project);

        scheduler = scheduler2 = project = null;
    });

    function assertScheduler(t, assertContent = true) {
        const { project, eventStore, assignmentStore, resourceStore } = scheduler;

        t.diag('Data layer');
        t.ok(project instanceof ProjectModel, 'Scheduler has project');

        t.ok(assignmentStore instanceof AssignmentStore, 'Scheduler has AssignmentStore');
        t.ok(eventStore instanceof EventStore, 'Scheduler has EventStore');
        t.ok(resourceStore instanceof ResourceStore, 'Scheduler has ResourceStore');

        t.is(assignmentStore, project.assignmentStore, 'AssignmentStore supplied by project');
        t.is(eventStore, project.eventStore, 'EventStore supplied by project');
        t.is(resourceStore, project.resourceStore, 'ResourceStore supplied by project');

        if (assertContent) {
            t.is(assignmentStore.count, 3, 'Assignments loaded');
            t.is(eventStore.count, 3, 'Events loaded');
            t.is(resourceStore.count, 2, 'Resources loaded');

            t.is(eventStore.first.endDate, new Date(2020, 0, 19), 'Engine calculated endDate');
            t.is(eventStore.first.data.endDate, new Date(2020, 0, 19), 'endDate written back to record');
            t.is(eventStore.last.duration, 3, 'Engine calculated duration');
            t.is(eventStore.last.data.duration, 3, 'duration written back to record');

            t.diag('Rendering');
            t.selectorCountIs(scheduler.unreleasedEventSelector, 3, 'Events rendered');
        }
    }

    function createScheduler(config = {}) {
        return new Scheduler(Object.assign({
            appendTo              : document.body,
            useInitialAnimation   : false,
            enableEventAnimations : false,
            startDate             : new Date(2020, 0, 17)
        }, config));
    }

    async function setupScheduler(t, config = {}, assert = true) {
        scheduler = createScheduler(config);

        // await initial propagation here when it is used
        if (Object.keys(config).length) {
            await t.waitForProjectReady(scheduler);
        }

        if (assert) {
            assertScheduler(t, Object.keys(config).length);
        }
    }

    //endregion

    t.it('Empty scheduler should have a project + stores', async t => {
        await setupScheduler(t);
    });

    t.it('Scheduler should accept stores', t => {
        t.it('Multi assignment', t => {
            t.it('With store configs', async t => {
                await setupScheduler(t, {
                    eventStore : {
                        data : eventsData
                    },
                    resourceStore : {
                        data : resourcesData
                    },
                    assignmentStore : {
                        data : assignmentsData
                    }
                });
            });

            t.it('With store instances', async t => {
                await setupScheduler(t, {
                    eventStore : new EventStore({
                        data : eventsData
                    }),
                    resourceStore : new ResourceStore({
                        data : resourcesData
                    }),
                    assignmentStore : new AssignmentStore({
                        data : assignmentsData
                    })
                });
            });

            t.it('With inline data', async t => {
                await setupScheduler(t, {
                    events      : eventsData,
                    resources   : resourcesData,
                    assignments : assignmentsData
                });
            });

            t.it('With remote data', async t => {
                t.mockUrl('events.json', {
                    responseText : JSON.stringify(eventsData)
                });

                t.mockUrl('resources.json', {
                    responseText : JSON.stringify(resourcesData)
                });

                t.mockUrl('assignments.json', {
                    responseText : JSON.stringify(assignmentsData)
                });

                await setupScheduler(t, {
                    eventStore : {
                        readUrl : 'events.json'
                    },
                    resourceStore : {
                        readUrl : 'resources.json'
                    },
                    assignmentStore : {
                        readUrl : 'assignments.json'
                    }
                }, false);

                scheduler.eventStore.load();
                scheduler.resourceStore.load();
                scheduler.assignmentStore.load();

                await t.waitForSelector(scheduler.unreleasedEventSelector);

                assertScheduler(t);
            });
        });

        t.it('Single assignment', t => {
            t.it('With store configs', async t => {
                await setupScheduler(t, {
                    eventStore : {
                        data : singleEventsData
                    },
                    resourceStore : {
                        data : resourcesData
                    }
                });
            });

            t.it('With store instances', async t => {
                await setupScheduler(t, {
                    eventStore : new EventStore({
                        data : singleEventsData
                    }),
                    resourceStore : new ResourceStore({
                        data : resourcesData
                    })
                });
            });

            t.it('With inline data', async t => {
                await setupScheduler(t, {
                    events    : singleEventsData,
                    resources : resourcesData
                });
            });

            t.it('With remote data', async t => {
                t.mockUrl('events.json', {
                    responseText : JSON.stringify(singleEventsData)
                });

                t.mockUrl('resources.json', {
                    responseText : JSON.stringify(resourcesData)
                });

                await setupScheduler(t, {
                    eventStore : {
                        readUrl : 'events.json'
                    },
                    resourceStore : {
                        readUrl : 'resources.json'
                    }
                }, false);

                scheduler.eventStore.load();
                scheduler.resourceStore.load();

                t.chain(
                    { waitForSelector : scheduler.unreleasedEventSelector },

                    async() => {
                        assertScheduler(t);
                    }
                );
            });
        });
    });

    t.it('Scheduler should accept project config', t => {
        t.it('Multi assignment', t => {
            t.it('With store configs', async t => {
                await setupScheduler(t, {
                    project : {
                        eventStore : {
                            data : eventsData
                        },
                        resourceStore : {
                            data : resourcesData
                        },
                        assignmentStore : {
                            data : assignmentsData
                        }
                    }
                });
            });

            t.it('With store instances', async t => {
                await setupScheduler(t, {
                    project : {
                        eventStore : new EventStore({
                            data : eventsData
                        }),
                        resourceStore : new ResourceStore({
                            data : resourcesData
                        }),
                        assignmentStore : new AssignmentStore({
                            data : assignmentsData
                        })
                    }
                });
            });

            t.it('With inline data', async t => {
                await setupScheduler(t, {
                    project : {
                        eventsData,
                        resourcesData,
                        assignmentsData
                    }
                });
            });
        });

        t.it('Single assignment', t => {
            t.it('With store configs', async t => {
                await setupScheduler(t, {
                    project : {
                        eventStore : {
                            data : singleEventsData
                        },
                        resourceStore : {
                            data : resourcesData
                        }
                    }
                });
            });

            t.it('With store instances', async t => {
                await setupScheduler(t, {
                    project : {
                        eventStore : new EventStore({
                            data : singleEventsData
                        }),
                        resourceStore : new ResourceStore({
                            data : resourcesData
                        })
                    }
                });
            });

            t.it('With inline data', async t => {
                await setupScheduler(t, {
                    project : {
                        eventsData : singleEventsData,
                        resourcesData
                    }
                });
            });
        });
    });

    t.it('Scheduler should accept project instance', t => {
        t.it('Multi assignment', t => {
            t.it('With store configs', async t => {
                await setupScheduler(t, {
                    project : new ProjectModel({
                        eventStore : {
                            data : eventsData
                        },
                        resourceStore : {
                            data : resourcesData
                        },
                        assignmentStore : {
                            data : assignmentsData
                        }
                    })
                });
            });

            t.it('With store instances', async t => {
                await setupScheduler(t, {
                    project : new ProjectModel({
                        eventStore : new EventStore({
                            data : eventsData
                        }),
                        resourceStore : new ResourceStore({
                            data : resourcesData
                        }),
                        assignmentStore : new AssignmentStore({
                            data : assignmentsData
                        })
                    })
                });
            });

            t.it('With inline data', async t => {
                await setupScheduler(t, {
                    project : new ProjectModel({
                        eventsData,
                        resourcesData,
                        assignmentsData
                    })
                });
            });
        });

        t.it('Single assignment', t => {
            t.it('With store configs', async t => {
                await setupScheduler(t, {
                    project : new ProjectModel({
                        eventStore : {
                            data : singleEventsData
                        },
                        resourceStore : {
                            data : resourcesData
                        }
                    })
                });
            });

            t.it('With store instances', async t => {
                await setupScheduler(t, {
                    project : new ProjectModel({
                        eventStore : new EventStore({
                            data : singleEventsData
                        }),
                        resourceStore : new ResourceStore({
                            data : resourcesData
                        })
                    })
                });
            });

            t.it('With inline data', async t => {
                await setupScheduler(t, {
                    project : new ProjectModel({
                        eventsData : singleEventsData,
                        resourcesData
                    })
                });
            });
        });
    });

    t.it('Should be able to replace project', async t => {
        await setupScheduler(t, {
            project : {
                eventsData,
                resourcesData,
                assignmentsData
            }
        }, false);

        scheduler.project = new ProjectModel({
            eventsData    : newEventsData,
            resourcesData : [
                { id : 1, name : 'New resource 1' }
            ],
            assignmentsData : newAssignmentsData
        });

        await t.waitForProjectReady(scheduler);

        assertScheduler(t, false);

        t.is(scheduler.assignmentStore.count, 1, 'Assignments loaded');
        t.is(scheduler.eventStore.count, 1, 'Events loaded');
        t.is(scheduler.resourceStore.count, 1, 'Resources loaded');

        t.diag('Rendering');
        t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Event rendered');
    });

    t.it('Should be able to replace project stores', t => {
        t.it('Directly on project', async t => {
            await setupScheduler(t, {
                project : {
                    eventsData,
                    resourcesData,
                    assignmentsData
                }
            }, false);

            scheduler.project.setEventStore(new EventStore({
                data : newEventsData
            }));

            await t.waitForProjectReady(scheduler);

            t.selectorNotExists(scheduler.unreleasedEventSelector, 'No events rendered');

            scheduler.project.setAssignmentStore(new AssignmentStore({
                data : newAssignmentsData
            }));

            await t.waitForProjectReady(scheduler);

            t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Event rendered');

            scheduler.project.setResourceStore(new ResourceStore({
                data : [{ id : 1 }]
            }));

            await t.waitForProjectReady(scheduler);

            t.selectorCountIs('.b-grid-row', 1, 'Single resource rendered');
            t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Event still rendered');
        });

        t.it('Relayed from scheduler', async t => {
            await setupScheduler(t, {
                events      : eventsData,
                resources   : resourcesData,
                assignments : assignmentsData
            }, false);

            scheduler.eventStore = new EventStore({
                data : newEventsData
            });

            t.chain(
                { waitForSelectorNotFound : scheduler.unreleasedEventSelector, desc : 'No events rendered' },

                async() => scheduler.assignmentStore = new AssignmentStore({
                    data : newAssignmentsData
                }),

                {
                    waitFor : () => document.querySelectorAll(scheduler.unreleasedEventSelector).length === 1,
                    desc    : 'Single event rendered'
                },

                async() => scheduler.resourceStore = new ResourceStore({
                    data : [{ id : 1 }]
                }),

                {
                    waitFor : () => document.querySelectorAll('.b-grid-row').length === 1,
                    desc    : 'Single resource rendered'
                },

                async() => t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Event still rendered')
            );
        });
    });

    t.it('Schedulers should be able to share project', t => {
        t.it('Multi assignment', async t => {
            const project = new ProjectModel({
                eventsData,
                resourcesData,
                assignmentsData
            });

            await setupScheduler(t, {
                height : '50%',
                project
            }, false);

            scheduler2 = new Scheduler({
                appendTo  : document.body,
                height    : '50%',
                startDate : new Date(2020, 0, 17),
                project
            });

            t.selectorCountIs(`#${scheduler.id} ${scheduler.unreleasedEventSelector}`, 3, 'Scheduler 1 events rendered');
            t.selectorCountIs(`#${scheduler2.id} ${scheduler.unreleasedEventSelector}`, 3, 'Scheduler 2 events rendered');
        });

        t.it('Single assignment', async t => {
            const project = new ProjectModel({
                eventsData : singleEventsData,
                resourcesData
            });

            await setupScheduler(t, {
                height : '50%',
                project
            }, false);

            scheduler2 = new Scheduler({
                appendTo  : document.body,
                height    : '50%',
                startDate : new Date(2020, 0, 17),
                project
            });

            t.selectorCountIs(`#${scheduler.id} ${scheduler.unreleasedEventSelector}`, 3, 'Scheduler 1 events rendered');
            t.selectorCountIs(`#${scheduler2.id} ${scheduler.unreleasedEventSelector}`, 3, 'Scheduler 2 events rendered');
        });

    });

    t.it('Schedulers should be able to share (all) stores', t => {
        t.it('Multi assignment', async t => {
            await setupScheduler(t, {
                height      : '50%',
                events      : eventsData,
                resources   : resourcesData,
                assignments : assignmentsData
            }, false);

            scheduler2 = createScheduler({
                height          : '50%',
                eventStore      : scheduler.eventStore,
                resourceStore   : scheduler.resourceStore,
                assignmentStore : scheduler.assignmentStore
            });

            t.is(scheduler.project, scheduler2.project, 'Project shared');

            t.selectorCountIs(`#${scheduler.id} ${scheduler.unreleasedEventSelector}`, 3, 'Scheduler 1 events rendered');
            t.selectorCountIs(`#${scheduler2.id} ${scheduler.unreleasedEventSelector}`, 3, 'Scheduler 2 events rendered');
        });

        t.it('Single assignment', async t => {
            await setupScheduler(t, {
                height    : '50%',
                events    : singleEventsData,
                resources : resourcesData
            }, false);

            scheduler2 = createScheduler({
                height        : '50%',
                eventStore    : scheduler.eventStore,
                resourceStore : scheduler.resourceStore
            });

            t.is(scheduler.project, scheduler2.project, 'Project shared');

            t.selectorCountIs(`#${scheduler.id} ${scheduler.unreleasedEventSelector}`, 3, 'Scheduler 1 events rendered');
            t.selectorCountIs(`#${scheduler2.id} ${scheduler.unreleasedEventSelector}`, 3, 'Scheduler 2 events rendered');
        });
    });

    t.it('Should be able to use CrudManager', t => {
        async function assertCrudManager(t) {
            const { crudManager } = scheduler;

            await crudManager.await('load');

            t.is(crudManager.eventStore, scheduler.eventStore, 'EventStores match ');
            t.is(crudManager.resourceStore, scheduler.resourceStore, 'ResourceStores match ');
            t.is(crudManager.assignmentStore, scheduler.assignmentStore, 'AssignmentStores match ');
        }

        t.it('Multi assignment', t => {
            t.mockUrl('multi.json', {
                delay        : 10,
                responseText : JSON.stringify({
                    success   : true,
                    resources : {
                        rows : resourcesData
                    },
                    events : {
                        rows : eventsData
                    },
                    assignments : {
                        rows : assignmentsData
                    }
                })
            });

            t.it('CrudManager config, autoLoad', async t => {
                await setupScheduler(t, {
                    crudManager : {
                        autoLoad  : true,
                        transport : {
                            load : {
                                url : 'multi.json'
                            }
                        }
                    }
                }, false);

                await assertCrudManager(t);

                t.chain(
                    { waitForSelector : scheduler.unreleasedEventSelector },

                    () => {
                        assertScheduler(t);
                    }
                );
            });

            t.it('CrudManager instance, autoLoad', async t => {
                await setupScheduler(t, {
                    crudManager : new CrudManager({
                        autoLoad  : true,
                        transport : {
                            load : {
                                url : 'multi.json'
                            }
                        }
                    })
                }, false);

                await assertCrudManager(t);

                t.chain(
                    { waitForSelector : scheduler.unreleasedEventSelector },

                    () => {
                        assertScheduler(t);
                    }
                );
            });

            t.it('CrudManager config, no autoLoad', async t => {
                await setupScheduler(t, {
                    crudManager : {
                        autoLoad  : false,
                        transport : {
                            load : {
                                url : 'multi.json'
                            }
                        }
                    }
                }, false);

                scheduler.crudManager.load();

                await assertCrudManager(t);

                t.chain(
                    { waitForSelector : scheduler.unreleasedEventSelector },

                    () => {
                        assertScheduler(t);
                    }
                );
            });

            t.it('CrudManager instance, no autoLoad', async t => {
                await setupScheduler(t, {
                    crudManager : new CrudManager({
                        autoLoad  : false,
                        transport : {
                            load : {
                                url : 'multi.json'
                            }
                        }
                    })
                }, false);

                scheduler.crudManager.load();

                await assertCrudManager(t);

                t.chain(
                    { waitForSelector : scheduler.unreleasedEventSelector },

                    () => {
                        assertScheduler(t);
                    }
                );
            });

            t.it('CrudManager config, with store configs', async t => {
                await setupScheduler(t, {
                    crudManager : {
                        autoLoad  : true,
                        transport : {
                            load : {
                                url : 'multi.json'
                            }
                        },

                        eventStore : {
                            fields : ['extraE']
                        },

                        resourceStore : {
                            fields : ['extraR']
                        },

                        assignmentStore : {
                            fields : ['extraA']
                        }
                    }
                }, false);

                await assertCrudManager(t);

                t.chain(
                    { waitForSelector : scheduler.unreleasedEventSelector },

                    () => {
                        assertScheduler(t);

                        t.ok(scheduler.eventStore.first.getFieldDefinition('extraE'), 'EventStore config applied');
                        t.ok(scheduler.resourceStore.first.getFieldDefinition('extraR'), 'ResourceStore config applied');
                        t.ok(scheduler.assignmentStore.first.getFieldDefinition('extraA'), 'AssignmentStore config applied');
                    }
                );
            });

            t.it('CrudManager instance, already loaded', async t => {
                const crudManager = new CrudManager({
                    autoLoad  : true,
                    transport : {
                        load : {
                            url : 'multi.json'
                        }
                    }
                });

                await crudManager.await('load');

                await setupScheduler(t, {
                    crudManager
                }, true);
            });
        });

        t.it('Single assignment', t => {
            t.mockUrl('single.json', {
                responseText : JSON.stringify({
                    success   : true,
                    resources : {
                        rows : resourcesData
                    },
                    events : {
                        rows : singleEventsData
                    }
                })
            });

            t.it('CrudManager config', async t => {
                await setupScheduler(t, {
                    crudManager : {
                        autoLoad  : true,
                        transport : {
                            load : {
                                url : 'single.json'
                            }
                        }
                    }
                }, false);

                await assertCrudManager(t);

                t.chain(
                    { waitForSelector : scheduler.unreleasedEventSelector },

                    () => {
                        assertScheduler(t);
                    }
                );
            });

            t.it('CrudManager instance', async t => {
                await setupScheduler(t, {
                    crudManager : new CrudManager({
                        autoLoad  : true,
                        transport : {
                            load : {
                                url : 'single.json'
                            }
                        }
                    })
                }, false);

                await assertCrudManager(t);

                t.chain(
                    { waitForSelector : scheduler.unreleasedEventSelector },

                    () => {
                        assertScheduler(t);
                    }
                );
            });
        });
    });

    t.it('Should be able to retrieve and consume JSON', async t => {
        const dependenciesData = [
            { id : 1, from : 1, to : 2 }
        ];

        const project = new ProjectModel({
            eventsData,
            assignmentsData,
            resourcesData,
            dependenciesData,
            resourceTimeRangesData,
            timeRangesData
        });

        await project.commitAsync();

        const json = project.json;

        await project.loadInlineData({
            eventsData             : [],
            assignmentsData        : [],
            resourcesData          : [],
            dependenciesData       : [],
            resourceTimeRangesData : [],
            timeRangesData         : []
        });

        t.is(project.eventStore.count, 0, 'Events gone');
        t.is(project.assignmentStore.count, 0, 'Assignments gone');
        t.is(project.resourceStore.count, 0, 'Resources gone');
        t.is(project.dependencyStore.count, 0, 'Dependencies gone');
        t.is(project.resourceTimeRangeStore.count, 0, 'ResourceTimeRanges gone');
        t.is(project.timeRangeStore.count, 0, 'TimeRanges gone');

        project.json = json;

        await project.commitAsync();

        t.is(project.eventStore.count, eventsData.length, 'Correct event count');
        t.is(project.assignmentStore.count, assignmentsData.length, 'Correct assignment count');
        t.is(project.resourceStore.count, resourcesData.length, 'Correct resource count');
        t.is(project.dependencyStore.count, dependenciesData.length, 'Correct dependency count');
        t.is(project.resourceTimeRangeStore.count, resourceTimeRangesData.length, 'Correct resourceTimeRange count');
        t.is(project.timeRangeStore.count, timeRangesData.length, 'Correct timeRange count');
    });

    t.it('Should consume JSON from config', async t => {
        const project = new ProjectModel({
            json : `{
                "eventsData" : [
                    { "id" : 1, "name" : "Event 1" }
                ],
                "resourcesData" : [
                    { "id" : 1, "name" : "Resource 1" }
                ],
                "assignmentsData" : [
                    { "id" : 1, "event" : 1, "resource" : 1 }
                ],
                "resourceTimeRangesData" : [
                    { "id" : 1, "name" : "One", "resourceId" : 1 }
                ],
                "timeRangesData" : [
                    { "id" : 1, "name" : "Uno" }
                ]
            }`
        });

        await project.commitAsync();

        t.is(project.eventStore.count, 1, 'Correct event count');
        t.is(project.resourceStore.count, 1, 'Correct resource count');
        t.is(project.assignmentStore.count, 1, 'Correct assignment count');
        t.is(project.resourceTimeRangeStore.count, 1, 'Correct resourceTimeRange count');
        t.is(project.timeRangeStore.count, 1, 'Correct timeRange count');
        t.is(project.eventStore.first.resource, project.resourceStore.first, 'Data linked up');
    });

    t.it('Should use correct EventStore class', t => {
        class MyEventStore extends EventStore {}

        t.it('Configured on project', t => {
            const project = new ProjectModel({
                eventStoreClass : MyEventStore
            });

            t.ok(project.eventStore instanceof MyEventStore, 'Correct storeClass used');
        });

        t.it('Configured on project as eventStore', t => {
            const project = new ProjectModel({
                eventStore : {
                    storeClass : MyEventStore
                }
            });

            t.ok(project.eventStore instanceof MyEventStore, 'Correct storeClass used');
        });

        t.it('Subclassed project', t => {
            class MyProject extends ProjectModel {
                static get defaultConfig() {
                    return {
                        eventStoreClass : MyEventStore
                    };
                }
            }

            const project = new MyProject();

            t.ok(project.eventStore instanceof MyEventStore, 'Correct storeClass used');
        });
    });

    t.it('Should use correct EventModel class', t => {
        class MyEvent extends EventModel {}

        t.it('Configured on project', t => {
            const project = new ProjectModel({
                eventModelClass : MyEvent
            });

            t.is(Object.getPrototypeOf(project.eventStore.modelClass), MyEvent, 'Correct modelClass');
        });

        t.it('Configured on projects storeClass', t => {
            class MyEventStore extends EventStore {
                static get defaultConfig() {
                    return {
                        modelClass : MyEvent
                    };
                }
            }

            const project = new ProjectModel({
                eventStoreClass : MyEventStore
            });

            t.is(Object.getPrototypeOf(project.eventStore.modelClass), MyEvent, 'Correct modelClass');
        });

        t.it('Configured on projects eventStore config', t => {
            const project = new ProjectModel({
                eventStore : {
                    modelClass : MyEvent
                }
            });

            t.is(Object.getPrototypeOf(project.eventStore.modelClass), MyEvent, 'Correct modelClass');
        });
    });

    t.it('Should use correct ResourceModel class', t => {
        class MyResource extends ResourceModel {}

        t.it('Configured on project', t => {
            const project = new ProjectModel({
                resourceModelClass : MyResource
            });

            t.is(Object.getPrototypeOf(project.resourceStore.modelClass), MyResource, 'Correct modelClass');
        });

        t.it('Configured on projects storeClass', t => {
            class MyResourceStore extends ResourceStore {
                static get defaultConfig() {
                    return {
                        modelClass : MyResource
                    };
                }
            }

            const project = new ProjectModel({
                resourceStoreClass : MyResourceStore
            });

            t.is(Object.getPrototypeOf(project.resourceStore.modelClass), MyResource, 'Correct modelClass');
        });

        t.it('Configured on projects resourceStore config', t => {
            const project = new ProjectModel({
                resourceStore : {
                    modelClass : MyResource
                }
            });

            t.is(Object.getPrototypeOf(project.resourceStore.modelClass), MyResource, 'Correct modelClass');
        });
    });

    t.it('Should use correct AssignmentModel class', t => {
        class MyAssignment extends AssignmentModel {}

        t.it('Configured on project', t => {
            const project = new ProjectModel({
                assignmentModelClass : MyAssignment
            });

            t.is(Object.getPrototypeOf(project.assignmentStore.modelClass), MyAssignment, 'Correct modelClass');
        });

        t.it('Configured on projects storeClass', t => {
            class MyAssignmentStore extends AssignmentStore {
                static get defaultConfig() {
                    return {
                        modelClass : MyAssignment
                    };
                }
            }

            const project = new ProjectModel({
                assignmentStoreClass : MyAssignmentStore
            });

            t.is(Object.getPrototypeOf(project.assignmentStore.modelClass), MyAssignment, 'Correct modelClass');
        });

        t.it('Configured on projects assignmentStore config', t => {
            const project = new ProjectModel({
                assignmentStore : {
                    modelClass : MyAssignment
                }
            });

            t.is(Object.getPrototypeOf(project.assignmentStore.modelClass), MyAssignment, 'Correct modelClass');
        });
    });

    t.it('Should be able to get/set inlineData on project', t => {
        scheduler = createScheduler();

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
            ],
            resourceTimeRangesData,
            timeRangesData
        };

        // Populate the stores
        scheduler.project.inlineData = testData;

        // Get data back
        const inlineData = scheduler.project.inlineData;

        // Check data
        t.isDeeply(inlineData.eventsData.map(event => ({ id : event.id, name : event.name })), testData.eventsData, 'Events OK');
        t.isDeeply(inlineData.resourcesData, testData.resourcesData, 'Resources OK');
        t.isDeeply(inlineData.assignmentsData.map(assignment => ({ id : assignment.id, eventId : assignment.eventId, event : assignment.eventId, resourceId : assignment.resourceId, resource : assignment.resourceId })), testData.assignmentsData, 'Assignments OK');
        t.isDeeply(inlineData.dependenciesData.map(dependency => ({ id : dependency.id, from : dependency.from, fromEvent : dependency.from, to : dependency.to, toEvent : dependency.to })), testData.dependenciesData, 'Dependencies OK');
        t.is(inlineData.resourceTimeRangesData.length, resourceTimeRangesData.length, 'Correct resourceTimeRange count');
        t.is(inlineData.timeRangesData.length, timeRangesData.length, 'Correct timeRange count');
    });

    // https://github.com/bryntum/support/issues/2644
    t.it('Should support configuring `timeRangeStore` on Scheduler', async t => {
        class MyTimeRangeStore extends RecurringTimeSpansMixin(Store) {}

        await setupScheduler(t, {
            timeRangeStore : new MyTimeRangeStore()
        }, false);

        t.isInstanceOf(scheduler.timeRangeStore, MyTimeRangeStore, 'Scheduler#timeRangeStore property correct');
        t.isInstanceOf(scheduler.project.timeRangeStore, MyTimeRangeStore, 'Project#timeRangeStore property correct');
    });

    t.it('Should not trigger batchedUpdate during calculations', async t => {
        const project = new ProjectModel({
            eventsData : [
                { id : 1, name : 'Derp', startDate : '2020-05-20', endDate : '2020-05-21' }
            ]
        });

        t.wontFire(project.eventStore, 'batchedUpdate');

        await project.commitAsync();

        project.eventStore.first.duration = 100;

        await project.commitAsync();
    });

    // https://github.com/bryntum/support/issues/3281
    t.it('Should relay store changes', async t => {
        let changeData = {};

        project = new ProjectModel({
            eventsData,
            resourcesData,
            assignmentsData,
            dependenciesData : [
                { id : 1, from : 1, to : 2 }
            ],
            timeRangesData : [
                { id : 1, name : 'Range' }
            ],
            resourceTimeRangesData : [
                { id : 1, name : 'Resource range', resourceId : 1 }
            ]
        });

        project.on({
            change({ store, action }) {
                changeData = { store, action };
            }
        });

        await project.commitAsync();

        //
        // EVENTSTORE
        //

        project.eventStore.first.name = 'Changed';

        await project.commitAsync();

        t.isDeeply(changeData, { store : project.eventStore, action : 'update' }, 'Correct args for EventStore update');

        project.eventStore.add({ id : 100, name : 'Event 100' });

        await project.commitAsync();

        t.isDeeply(changeData, { store : project.eventStore, action : 'add' }, 'Correct args for EventStore add');

        //
        // RESOURCESTORE
        //

        project.resourceStore.first.name = 'Changed';

        await project.commitAsync();

        t.isDeeply(changeData, { store : project.resourceStore, action : 'update' }, 'Correct args for ResourceStore update');

        //
        // ASSIGNMENTSTORE
        //

        project.assignmentStore.last.resourceId = 1;

        await project.commitAsync();

        t.isDeeply(changeData, { store : project.assignmentStore, action : 'update' }, 'Correct args for AssignmentStore update');

        //
        // DEPENDENCYSTORE
        //

        project.dependencyStore.first.from = 100;

        await project.commitAsync();

        t.isDeeply(changeData, { store : project.dependencyStore, action : 'update' }, 'Correct args for DependencyStore update');

        //
        // TIMERANGESTORE
        //

        project.timeRangeStore.first.name = 'Changed';

        await project.commitAsync();

        t.isDeeply(changeData, { store : project.timeRangeStore, action : 'update' }, 'Correct args for TimeRangeStore update');

        //
        // RESOURCETIMERANGESTORE
        //

        project.resourceTimeRangeStore.first.name = 'Changed';

        await project.commitAsync();

        t.isDeeply(changeData, { store : project.resourceTimeRangeStore, action : 'update' }, 'Correct args for ResourceTimeRangeStore update');
    });

    // https://github.com/bryntum/support/issues/3281
    t.it('Should not relay replaced stores changes', async t => {
        project = new ProjectModel({
            eventsData,
            resourcesData,
            assignmentsData,
            dependenciesData : [
                { id : 1, from : 1, to : 2 }
            ],
            timeRangesData : [
                { id : 1, name : 'Range' }
            ],
            resourceTimeRangesData : [
                { id : 1, name : 'Resource range', resourceId : 1 }
            ]
        });

        await project.commitAsync();

        const {
            eventStore : oldEventStore,
            resourceStore : oldResourceSore,
            assignmentStore : oldAssignmentStore,
            dependencyStore : oldDependencyStore,
            timeRangeStore : oldTimeRangeStore,
            resourceTimeRangeStore : oldResourceTimeRangeStore
        } = project;

        project.eventStore = new EventStore();
        project.resourceStore = new ResourceStore();
        project.assignmentStore = new AssignmentStore();
        project.dependencyStore = new DependencyStore();
        project.timeRangeStore = new Store();
        project.resourceTimeRangeStore = new ResourceTimeRangeStore();

        t.firesOk(project, { change : 6 });

        project.eventStore.add({ });
        project.resourceStore.add({ });
        project.assignmentStore.add({ });
        project.dependencyStore.add({ });
        project.timeRangeStore.add({ });
        project.resourceTimeRangeStore.add({ });

        await project.commitAsync();

        t.wontFire(project, 'change');

        oldEventStore.add({});
        oldResourceSore.add({});
        oldAssignmentStore.add({});
        oldDependencyStore.add({});
        oldTimeRangeStore.add({});
        oldResourceTimeRangeStore.add({});
    });

    // https://github.com/bryntum/support/issues/3281
    t.it('Scheduler should relay projects change event', async t => {
        let changeData = {};

        scheduler = await t.getSchedulerAsync({
            events      : eventsData,
            resources   : resourcesData,
            assignments : assignmentsData,

            listeners : {
                dataChange({ store, action }) {
                    changeData = { store, action };
                }
            }
        });

        project = scheduler.project;

        scheduler.eventStore.first.name = 'Changed';

        await project.commitAsync();

        t.isDeeply(changeData, { store : project.eventStore, action : 'update' }, 'Correct args for eventStore update');

        scheduler.resourceStore.first.name = 'Changed';

        await project.commitAsync();

        t.isDeeply(changeData, { store : project.resourceStore, action : 'update' }, 'Correct args for resourceStore update');

        scheduler.assignmentStore.last.resourceId = 1;

        await project.commitAsync();

        t.isDeeply(changeData, { store : project.assignmentStore, action : 'update' }, 'Correct args for assignmentStore update');
    });
});
