import { AssignmentStore, ResourceStore, EventStore, ProjectModel, Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler && scheduler.destroy());

    const
        monday  = new Date(2018, 4, 7),
        tuesday = new Date(2018, 4, 8);

    function getDataSample() {
        return new ProjectModel({
            eventStore : new EventStore({
                data : [{
                    id : 1, name : 'Event 1', startDate : monday, endDate : tuesday
                }, {
                    id : 2, name : 'Event 2', startDate : monday, endDate : tuesday
                }]
            }),

            resourceStore : new ResourceStore({
                data : [{
                    id : 1, name : 'Resource 1'
                }, {
                    id : 2, name : 'Resource 2'
                }]
            }),

            assignmentStore : new AssignmentStore({
                data : [{
                    id : 1, eventId : 1, resourceId : 1
                }, {
                    id : 2, eventId : 1, resourceId : 2
                }, {
                    id : 3, eventId : 2, resourceId : 2
                }]
            })
        });
    }

    async function createScheduler(config) {
        const data = getDataSample();

        scheduler = new Scheduler(Object.assign({
            appendTo : document.body,

            id : 'test',

            features : {
                eventTooltip : false
            },

            columns : [{
                text : 'name', field : 'name'
            }],

            viewPreset : 'dayAndWeek',
            startDate  : new Date(monday.getTime() - 3 * 24 * 60 * 60 * 1000),
            endDate    : new Date(tuesday.getTime() + 4 * 24 * 60 * 60 * 1000),

            eventStore      : data.eventStore,
            resourceStore   : data.resourceStore,
            assignmentStore : data.assignmentStore
        }, config));

        await t.waitForProjectReady();
    }

    async function createScheduler2(config) {
        // Need to clear the mouse out of the way so that tooltips don't interfere with tests
        t.moveMouseTo(document.body, null, null, [0, 0], false);

        const { eventStore, resourceStore, assignmentStore } = getDataSample();

        scheduler = new Scheduler(Object.assign({
            appendTo  : document.body,
            height    : 600,
            width     : 800,
            startDate : monday,
            eventStore,
            resourceStore,
            assignmentStore
        }, config));

        await t.waitForProjectReady();
    }

    async function createMultiScheduler() {
        scheduler = new Scheduler({
            appendTo  : document.body,
            resources : [
                { id : 'r1', name : 'Mike' },
                { id : 'r2', name : 'Linda' },
                { id : 'r3', name : 'Jenny' }
            ],
            eventStore : {
                removeUnassignedEvent : false,
                data                  : [
                    { id : 1, startDate : new Date(2017, 0, 1, 10), endDate : new Date(2017, 0, 1, 12) }
                ]
            },
            assignments : [
                { id : 1, resourceId : 'r1', eventId : 1 },
                { id : 2, resourceId : 'r2', eventId : 1 }
            ],
            startDate             : new Date(2017, 0, 1, 6),
            endDate               : new Date(2017, 0, 1, 20),
            viewPreset            : 'hourAndDay',
            enableEventAnimations : false,
            useInitialAnimation   : false
        });

        await t.waitForProjectReady();
    }

    t.it('Scheduler configured with assignment store must show events assigned to a resource', async t => {
        await createScheduler();

        t.chain(
            { waitForSelector : scheduler.eventSelector },
            () => {
                t.selectorCountIs(scheduler.eventSelector, null, 3, '3 events are rendered');
            }
        );
    });

    t.it('Changing startDate of multi assigned event should update all instances', async t => {
        await createMultiScheduler();

        const initialLeft = document.querySelector('[data-event-id="1"]').getBoundingClientRect().left;

        scheduler.eventStore.first.startDate = new Date(2017, 0, 1, 12);

        await t.waitForProjectReady();

        const [first, second] = Array.from(document.querySelectorAll('[data-event-id="1"]'));

        t.isGreater(first.getBoundingClientRect().left, initialLeft, 'First instance moved to the right');
        t.is(first.getBoundingClientRect().left, second.getBoundingClientRect().left, 'Second instance moved to same location');
    });

    t.it('Reassigning a multi assigned event should update element', async t => {
        await createMultiScheduler();

        const initialTop  = document.querySelector('[data-event-id="1"]').getBoundingClientRect().top;

        // Reassign to new resource
        scheduler.assignmentStore.first.resourceId = 'r3';
        await t.waitForProjectReady();

        let newTop = document.querySelector(`[data-assignment-id="1"]`).getBoundingClientRect().top;
        t.isApprox(newTop, initialTop + scheduler.rowHeight * 2, 'First instance moved to the bottom');

        // Assign back again
        scheduler.assignmentStore.first.resourceId = 'r1';
        await t.waitForProjectReady();

        newTop = document.querySelector(`[data-assignment-id="1"]`).getBoundingClientRect().top;
        t.is(newTop, initialTop, 'First instance moved to the top again');

        t.is(document.querySelectorAll(scheduler.unreleasedEventSelector).length, 2, 'Two events displayed');
    });

    t.it('Removing a multi assigned event should remove all elements', async t => {
        await createMultiScheduler();

        scheduler.eventStore.first.remove();
        await t.waitForProjectReady();

        t.selectorCountIs(scheduler.unreleasedEventSelector, 0, 'No event element found');
    });

    t.it('AssignmentStore CRUD operations should update events', async t => {
        await createMultiScheduler();

        const { assignmentStore } = scheduler;

        t.selectorCountIs(scheduler.unreleasedEventSelector, 2, 'Two events initially');

        assignmentStore.first.remove();
        await t.waitForProjectReady();

        t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Single event remain after remove()');

        assignmentStore.add({ eventId : 1, resourceId : 'r3' });
        await t.waitForProjectReady();

        t.selectorCountIs(scheduler.unreleasedEventSelector, 2, 'Two events after add()');

        assignmentStore.removeAll();
        await t.waitForProjectReady();

        t.selectorCountIs(scheduler.unreleasedEventSelector, 0, 'No events after removeAll()');

        assignmentStore.data = [{ eventId : 1, resourceId : 'r1' },  { eventId : 1, resourceId : 'r2' }, { eventId : 1, resourceId : 'r3' }];
        await t.waitForProjectReady();

        t.selectorCountIs(scheduler.unreleasedEventSelector, 3, 'Three events after assigning to data');

        assignmentStore.filter(r => r.resourceId === 'r1');

        t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'One event after applying filter');
    });

    // https://app.assembla.com/spaces/bryntum/tickets/6862/details
    t.it('Deleting events should work', async t => {
        await createScheduler();

        // Need to click since bug was in EventNavigation & EventSelection
        t.chain(
            // Single instance of Event 2

            { click : ':textEquals(Event 2)' },

            { type : '[DELETE]' },

            { waitForSelectorNotFound : scheduler.unreleasedEventSelector + ':textEquals(Event 2)' },

            // Two instances of Event 1

            { click : '[data-assignment-id="2"]' },

            { type : '[DELETE]' },

            { waitForSelectorNotFound : '[data-assignment-id="2"]:not(.b-released)' },

            { click : '[data-assignment-id="1"]' },

            { type : '[DELETE]' },

            { waitForSelectorNotFound : '[data-assignment-id="1"]:not(.b-released)' },

            () => {
                t.pass('Could remove all events');
            }
        );
    });

    t.it('Config `removeUnassignedEvent` should affect if events get removed or not', async t => {
        await createScheduler();

        scheduler.eventStore.removeUnassignedEvent = true;

        scheduler.assignmentStore.last.remove();

        t.is(scheduler.eventStore.count, 1, 'Event removed with last assignment and `removeUnassignedEvent : true`');

        scheduler.assignmentStore.last.remove();

        t.is(scheduler.eventStore.count, 1, 'Event not removed with assignment and `removeUnassignedEvent : true`');

        scheduler.eventStore.removeUnassignedEvent = false;

        t.is(scheduler.eventStore.count, 1, 'Event not removed with last assignment and `removeUnassignedEvent : false`');
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7344-setting-a-new-dataset-crashes-when-using-assignmentstore
    t.it('Should be able to consume a new dataset', async t => {
        await createScheduler();

        scheduler.eventStore.data = [{ id : 1, startDate : '2018-05-07', duration : 2 }];
        scheduler.resourceStore.data = [{ id : 1 }];
        scheduler.assignmentStore.data = [{ eventId : 1, resourceId : 1 }];

        await t.waitForProjectReady();

        t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Single rendered event');
        t.selectorCountIs('.b-sch-released', 0, 'No released events');
    });

    t.it('Delete event with no current active event', async t => {
        await createScheduler2();

        const { eventStore } = scheduler;
        t.is(scheduler.eventStore.count, 2);

        // Must successfully delete event and not throw error.
        // https://app.assembla.com/spaces/bryntum/tickets/7235
        scheduler.removeEvents([eventStore.first]);

        await t.waitForProjectReady();

        t.is(scheduler.eventStore.count, 1);
    });

    t.it('Delete event with keyboard (multi-assign scheduler)', async t => {
        await createScheduler2();

        const { eventStore, assignmentStore } = scheduler;
        const feature = scheduler.features.eventEdit;

        // Focus should stay within the Scheduler by moving to the next closest event.
        t.chain(
            async() => t.is(assignmentStore.count, 3, 'Correct initial assignment count'),

            // Focus the first event assignment
            { click : '[data-event-id="1"]' },

            // Pressing delete should delete it
            { type : '[DELETE]' },

            { waitFor : () => assignmentStore.count === 2 && document.activeElement === scheduler.getElementFromEventRecord(eventStore.first).parentNode },

            next => {
                t.rightClick(scheduler.getElementFromEventRecord(eventStore.first).parentNode).then(next);
            },

            // Wait for context menu
            { waitFor : () => scheduler.features.eventMenu.menu && scheduler.features.eventMenu.menu.containsFocus },

            // Invoke the "Edit Event" option
            { type : '[DOWN]' },
            { type : '[ENTER]' },

            { waitFor : feature.editor && feature.nameField.containsFocus },

            next => {
                feature.deleteButton.element.focus();
                next();
            },

            { waitFor : () => document.activeElement === feature.deleteButton.element },

            // Activate the delete button without using the mouse
            next => {
                feature.deleteButton.element.click();
                next();
            },

            // The remaining event should be focused
            { waitFor : () => assignmentStore.count === 1 && document.activeElement === scheduler.getElementFromAssignmentRecord(assignmentStore.first).parentNode }
        );
    });

    t.it('Delete event with keyboard then mouse (multi-assign scheduler)', async t => {
        await createScheduler2({
            features : {
                eventTooltip : false
            }
        });

        const { eventStore, assignmentStore } = scheduler;

        // Focus should stay within the Scheduler by moving to the next closest event.
        const feature = scheduler.features.eventEdit;

        t.chain(
            async() => t.is(assignmentStore.count, 3, 'Correct initial assignment count'),

            // Focus the first event assignment
            { click : '[data-event-id="1"]' },

            // Pressing delete should delete it
            { type : '[DELETE]' },

            { waitFor : () => assignmentStore.count === 2 && document.activeElement === scheduler.getElementFromEventRecord(eventStore.first).parentNode },

            // dblclick to show the event editor
            next => {
                t.doubleClick(scheduler.getElementFromEventRecord(eventStore.first).parentNode);
                next();
            },

            { waitFor : () => feature.editor && feature.deleteButton.isVisible },

            // Click the delete button
            next => {
                t.click(feature.deleteButton.element);
                next();
            },

            // Only one event remains
            { waitFor : () => assignmentStore.count === 1 },

            // And because they used the mouse, we had to push focus out to
            // the Scheduler.
            () => {
                t.is(document.activeElement, scheduler.focusElement);
            }
        );
    });

    // https://github.com/bryntum/support/issues/3181
    t.it('Should refresh horizontal view after a batch operation', async t => {
        await createScheduler();

        scheduler.assignmentStore.beginBatch();
        scheduler.assignmentStore.first.remove();
        scheduler.assignmentStore.endBatch();

        await t.waitForProjectReady();

        t.selectorCountIs('.b-sch-event-wrap', 2);
    });

    // https://github.com/bryntum/support/issues/3181
    t.it('Should refresh vertical view after a batch operation', async t => {
        await createScheduler({
            mode : 'vertical'
        });

        scheduler.assignmentStore.beginBatch();
        scheduler.assignmentStore.first.remove();
        scheduler.assignmentStore.endBatch();

        await t.waitForProjectReady();

        t.selectorCountIs('.b-sch-event-wrap', 2);
    });
});
