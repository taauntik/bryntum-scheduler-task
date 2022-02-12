import { BrowserHelper, AssignmentStore, Scheduler, ObjectHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(function() {
        scheduler && !scheduler.isDestroyed && scheduler.destroy();
    });

    // Going to replace store handling with Project anyway
    t.xit('Scheduler should not leave listeners on stores', t => {
        const
            assignmentStore = new AssignmentStore(),
            eventStore      = t.getEventStore({ assignmentStore }, 2),
            resourceStore   = t.getResourceStore2(null, 2),
            dependencyStore = t.getDependencyStore(null, 2);

        t.snapShotListeners(assignmentStore, 'assignments');
        t.snapShotListeners(eventStore, 'events');
        t.snapShotListeners(resourceStore, 'resources');
        t.snapShotListeners(dependencyStore, 'dependencies');

        scheduler = t.getScheduler({
            appendTo      : document.body,
            destroyStores : false,
            assignmentStore,
            eventStore,
            resourceStore,
            dependencyStore,
            features      : {
                dependencies : true,
                eventMenu    : true,
                eventEdit    : true,
                eventFilter  : true,
                groupSummary : {
                    summaries : [
                        {
                            label : 'Full time',

                            renderer : ({ events }) => {
                                // Only count events for resources that are "Full time"
                                return events.filter(event => event.resource.type === 'Full time').length;
                            }
                        }
                    ]
                },
                timeAxisHeaderMenu : true,
                labels             : true,
                nonWorkingTime     : true,
                summary            : {
                    renderer : ({ events }) => events.length || ''
                },
                timeRanges : true
            }
        });

        scheduler.destroy();

        // When scheduler is configured with stores it links them together. It is not clear what to do with such links
        // after scheduler is destroyed. When stores are used in another scheduler, those links will be changed anyway
        // So we are ignoring listeners with stores as a scope
        t.verifyListeners(assignmentStore, 'assignments', [dependencyStore, resourceStore, eventStore]);
        t.verifyListeners(eventStore, 'events', [dependencyStore, resourceStore, assignmentStore]);
        t.verifyListeners(resourceStore, 'resources', [dependencyStore, eventStore, assignmentStore]);
        t.verifyListeners(dependencyStore, 'dependencies', [eventStore, resourceStore, assignmentStore]);
    });

    t.it('TOUCH: Vertical scheduler loaded using CrudManager should start with no error on touch devices', async t => {
        scheduler = await t.getSchedulerAsync({
            mode        : 'vertical',
            crudManager : {
                autoLoad  : true,
                transport : {
                    load : {
                        url : 'view/orientation/vertical-sanity-crud-test.json'
                    }
                }
            },
            startDate  : new Date(2019, 0, 1, 6),
            endDate    : new Date(2019, 0, 1, 18),
            viewPreset : 'hourAndDay',
            barMargin  : 5,
            eventStyle : 'colored',
            tickSize   : 80,
            events     : null,
            resources  : null
        });

        t.pass('Scheduler has started with no errors');
    });

    t.it('Initial scheduler config is intact', async t => {
        const initialConfig = {
            appendTo    : document.body,
            startDate   : new Date(2025, 11, 1, 8),
            endDate     : new Date(2025, 11, 1, 18),
            flex        : 1,
            crudManager : {
                autoLoad  : true,
                transport : {
                    load : {
                        url : 'view/orientation/vertical-sanity-crud-test.json'
                    }
                }
            },
            columns : [
                { field : 'name', text : 'Name', width : 200 }
            ]
        };

        scheduler = new Scheduler(ObjectHelper.clone(initialConfig));

        await t.waitForProjectReady(scheduler);

        delete scheduler.initialConfig.subGridConfigs;

        t.isDeeply(scheduler.initialConfig, initialConfig, 'initialConfig is ok');
    });

    t.it('Should be able to adopt element', async t => {
        scheduler = new Scheduler({
            adopt     : document.body,
            startDate : new Date(),
            columns   : [
                { field : 'name', text : 'Name' }
            ],
            resources : [
                { id : 1, name : 'R1' }
            ],
            events : [
                { id : 1, resourceId : 1, startDate : new Date(), duration : 2 }
            ]
        });

        await t.waitForProjectReady();

        t.selectorExists('.b-grid-row', 'Row rendered');
        t.selectorExists('.b-sch-event', 'Event rendered');
    });
});
