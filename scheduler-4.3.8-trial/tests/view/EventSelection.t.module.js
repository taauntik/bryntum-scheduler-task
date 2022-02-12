
StartTest(t => {
    const
        events   = [],
        eventEls = [];

    let scheduler,
        eventStore,
        assignments,
        selectionChangeSpy,
        assignmentSelectionChangeSpy;

    async function createScheduler(config = {}) {
        selectionChangeSpy = t.createSpy('Selection change spy');
        assignmentSelectionChangeSpy = t.createSpy('Selection change spy');

        scheduler = await t.getSchedulerAsync(Object.assign({
            selectionChangeHandler           : selectionChangeSpy,
            assignmentSelectionChangeHandler : assignmentSelectionChangeSpy
        }, config));

        eventStore = scheduler.eventStore;
        for (let i = 0; i < eventStore.count; i++) {
            events[i] = eventStore.getAt(i);
            eventEls[i] = scheduler.getElementFromEventRecord(events[i]);
        }

        assignments = scheduler.assignmentStore.getRange();
    }

    function checkEventsCount(t, count) {
        t.isCalledNTimes('selectionChangeHandler', scheduler, count, `eventSelectionChange called ${count} times`);
        t.isCalledNTimes('assignmentSelectionChangeHandler', scheduler, count, `assignmentSelectionChange called ${count} times`);
        scheduler.on({
            eventSelectionChange      : scheduler.selectionChangeHandler,
            assignmentSelectionChange : scheduler.assignmentSelectionChangeHandler,
            thisObj                   : scheduler
        });
    }

    function checkUISelection(t, selectedIndexes) {
        for (let i = 0; i < events.length; i++) {
            if (eventStore.includes(events[i])) {
                const
                    selected = selectedIndexes.includes(i),
                    hasClass = eventEls[i].classList.contains(scheduler.eventSelectedCls);
                if (hasClass !== selected) {
                    t.fail(`Event "${events[i].name}" should be ${selected ? 'selected' : 'deselected'}`);
                }
            }
        }
    }

    t.beforeEach(() => scheduler && scheduler.destroy());

    t.it('Selecting', async t => {
        await createScheduler();
        checkEventsCount(t, 6);

        // Start with no selections
        checkUISelection(t, []);

        await t.click(eventEls[0]);

        t.isDeeply(selectionChangeSpy.calls.argsFor(0), [{
            type       : 'eventselectionchange',
            action     : 'select',
            deselected : [],
            selected   : [events[0]],
            selection  : [events[0]],
            source     : scheduler
        }], 'Event: selection change to [0]');

        t.isDeeply(assignmentSelectionChangeSpy.calls.argsFor(0), [{
            type       : 'assignmentselectionchange',
            action     : 'select',
            deselected : [],
            selected   : [assignments[0]],
            selection  : [assignments[0]],
            source     : scheduler
        }], 'Assignment: selection change to [0]');

        checkUISelection(t, [0]);

        // Clicking outside an event deselects All
        await t.click(scheduler.timeAxisSubGridElement);

        t.isDeeply(selectionChangeSpy.calls.argsFor(1), [{
            type       : 'eventselectionchange',
            action     : 'clear',
            deselected : [events[0]],
            selected   : [],
            selection  : [],
            source     : scheduler
        }], 'Event: Deselect all');

        t.isDeeply(assignmentSelectionChangeSpy.calls.argsFor(1), [{
            type       : 'assignmentselectionchange',
            action     : 'clear',
            deselected : [assignments[0]],
            selected   : [],
            selection  : [],
            source     : scheduler
        }], 'Assignment: Deselect all');

        // Should be none selected
        checkUISelection(t, []);

        await t.click(eventEls[0]);

        t.isDeeply(selectionChangeSpy.calls.argsFor(2), [{
            type       : 'eventselectionchange',
            action     : 'select',
            deselected : [],
            selected   : [events[0]],
            selection  : [events[0]],
            source     : scheduler
        }], 'Event: Selection change to [0]');

        t.isDeeply(assignmentSelectionChangeSpy.calls.argsFor(2), [{
            type       : 'assignmentselectionchange',
            action     : 'select',
            deselected : [],
            selected   : [assignments[0]],
            selection  : [assignments[0]],
            source     : scheduler
        }], 'Assignment: Selection change to [0]');

        checkUISelection(t, [0]);

        await t.click(eventEls[2], null, null, {
            ctrlKey : true
        });

        t.isDeeply(selectionChangeSpy.calls.argsFor(3), [{
            type       : 'eventselectionchange',
            action     : 'update',
            deselected : [events[0]],
            selected   : [events[2]],
            selection  : [events[2]],
            source     : scheduler
        }], 'Event: Select 2 and deselects 0 because we are multiEventSelect: false by default');

        t.isDeeply(assignmentSelectionChangeSpy.calls.argsFor(3), [{
            type       : 'assignmentselectionchange',
            action     : 'update',
            deselected : [assignments[0]],
            selected   : [assignments[2]],
            selection  : [assignments[2]],
            source     : scheduler
        }], 'Assignment: Select 2 and deselects 0 because we are multiEventSelect: false by default');

        checkUISelection(t, [2]);

        scheduler.multiEventSelect = true;

        await t.click(eventEls[0], null, null, {
            ctrlKey : true
        });

        t.isDeeply(selectionChangeSpy.calls.argsFor(4), [{
            type       : 'eventselectionchange',
            action     : 'select',
            deselected : [],
            selected   : [events[0]],
            selection  : [events[2], events[0]],
            source     : scheduler
        }], 'Event: Then we select 0 which adds it');

        t.isDeeply(assignmentSelectionChangeSpy.calls.argsFor(4), [{
            type       : 'assignmentselectionchange',
            action     : 'select',
            deselected : [],
            selected   : [assignments[0]],
            selection  : [assignments[2], assignments[0]],
            source     : scheduler
        }], 'Assignment: Then we select 0 which adds it');

        checkUISelection(t, [0, 2]);

        await t.click(eventEls[2], null, null, {
            ctrlKey : true
        });

        t.isDeeply(selectionChangeSpy.calls.argsFor(5), [{
            type       : 'eventselectionchange',
            action     : 'deselect',
            deselected : [events[2]],
            selected   : [],
            selection  : [events[0]],
            source     : scheduler
        }], 'Event: Then we deselect 2 with CTRL which will remove 2 from the selection');

        t.isDeeply(assignmentSelectionChangeSpy.calls.argsFor(5), [{
            type       : 'assignmentselectionchange',
            action     : 'deselect',
            deselected : [assignments[2]],
            selected   : [],
            selection  : [assignments[0]],
            source     : scheduler
        }], 'Assignment: Then we deselect 2 with CTRL which will remove 2 from the selection');

        checkUISelection(t, [0]);
    });

    t.it('Selecting using keyboard', async t => {
        await createScheduler({
            multiEventSelect : true
        });
        checkEventsCount(t, 4);

        // Start with no selections
        checkUISelection(t, []);

        // Click to select [0]
        await t.click(eventEls[0].parentNode);

        t.isDeeply(selectionChangeSpy.calls.argsFor(0), [{
            type       : 'eventselectionchange',
            action     : 'select',
            deselected : [],
            selected   : [events[0]],
            selection  : [events[0]],
            source     : scheduler
        }], 'Selection change to [0]');

        checkUISelection(t, [0]);

        // Navigate to [1] maintaining existing selection
        await t.keyPress(eventEls[0].parentNode, '[RIGHT]', {
            ctrlKey : true
        });

        t.chain(
            {
                waitFor : () => document.activeElement === eventEls[1].parentNode
            },

            async() => {
                t.isDeeply(selectionChangeSpy.calls.argsFor(1), [{
                    type       : 'eventselectionchange',
                    action     : 'select',
                    deselected : [],
                    selected   : [events[1]],
                    selection  : [events[0], events[1]],
                    source     : scheduler
                }], 'Selection change to [0] and [1]');

                // UI rendition is correct
                checkUISelection(t, [0, 1]);
                // Navigate to [2] discarding existing selection
                await t.keyPress(eventEls[1].parentNode, '[RIGHT]');
            },

            {
                waitFor : () => document.activeElement === eventEls[2].parentNode
            },

            () => {
                t.isDeeply(selectionChangeSpy.calls.argsFor(2), [{
                    type       : 'eventselectionchange',
                    action     : 'clear',
                    deselected : [events[0], events[1]],
                    selected   : [],
                    selection  : [],
                    source     : scheduler
                }], 'deselect 0 and 1');

                t.isDeeply(selectionChangeSpy.calls.argsFor(3), [{
                    type       : 'eventselectionchange',
                    action     : 'select',
                    deselected : [],
                    selected   : [events[2]],
                    selection  : [events[2]],
                    source     : scheduler
                }], 'Select 2');

                checkUISelection(t, [2]);
            }
        );
    });

    t.it('Attempting to select immediately after a delete should not throw', async t => {
        await createScheduler();
        checkEventsCount(t, 3);

        t.chain(
            { moveMouseTo : eventEls[0] },

            { click : null },

            { type : '[DELETE]' },

            { waitForSelector : ['.b-released'] },

            { click : null }
        );
    });

    t.it('Config triggerSelectionChangeOnRemove should affect triggering', async t => {
        await createScheduler();
        checkEventsCount(t, 3);

        let count = 0;

        scheduler.on('eventSelectionChange', ({ deselected }) => {
            if (deselected && deselected.length) {
                count++;
            }
        });

        // Remove should not trigger
        scheduler.triggerSelectionChangeOnRemove = false;

        scheduler.selectEvent(scheduler.eventStore.first);

        checkUISelection(t, [0]);

        scheduler.eventStore.first.remove();

        await t.waitForProjectReady();

        checkUISelection(t, []);

        t.is(count, 0, 'Not triggered when "false"');

        // Remove should not trigger

        scheduler.triggerSelectionChangeOnRemove = true;

        scheduler.selectEvent(scheduler.eventStore.first);

        checkUISelection(t, [1]);

        scheduler.eventStore.first.remove();

        await t.waitForProjectReady();

        checkUISelection(t, []);

        t.is(count, 1, 'Triggered when "true"');
    });

    t.it('Setting a new dataset should clear selected records that are no longer part of the eventStore', async t => {
        await createScheduler();
        checkEventsCount(t, 2);

        const event = scheduler.eventStore.first;
        scheduler.triggerSelectionChangeOnRemove = true;
        scheduler.selectEvent(event);

        t.ok(scheduler.isEventSelected(event), 'First event selected');

        scheduler.events = [];

        await t.waitForProjectReady();

        t.notOk(scheduler.isEventSelected(event), 'event not selected after dataset changed');
    });

    t.it('Should clear selection if maintainSelectionOnDatasetChange is false', async t => {
        await createScheduler();
        checkEventsCount(t, 1);

        scheduler.events = [
            {
                id         : 1,
                resourceId : 'r1',
                startDate  : new Date(2017, 0, 1, 10),
                endDate    : new Date(2017, 0, 1, 12)
            }
        ];

        scheduler.maintainSelectionOnDatasetChange = false;

        scheduler.selectEvent(scheduler.eventStore.first);

        scheduler.events = [
            {
                id         : 1,
                resourceId : 'r1',
                startDate  : new Date(2017, 0, 1, 10),
                endDate    : new Date(2017, 0, 1, 12)
            }
        ];

        t.is(scheduler.selectedEvents.length, 0, 'No events selected');
    });

    t.it('Should not clear selection if maintainSelectionOnDatasetChange is true', async t => {
        await createScheduler();
        checkEventsCount(t, 1);

        scheduler.events = [
            {
                id         : 1,
                resourceId : 'r1',
                startDate  : new Date(2011, 0, 4),
                endDate    : new Date(2011, 0, 5)
            }
        ];

        await t.waitForProjectReady();

        scheduler.maintainSelectionOnDatasetChange = true;

        scheduler.selectEvent(scheduler.eventStore.first);

        t.is(scheduler.selectedEvents.length, 1, '1 event selected');

        scheduler.events = [
            {
                id         : 1,
                resourceId : 'r1',
                startDate  : new Date(2011, 0, 5),
                endDate    : new Date(2011, 0, 6)
            }
        ];

        await t.waitForProjectReady();

        t.ok(scheduler.isEventSelected(scheduler.eventStore.first), 'Event still selected after new dataset was loaded');
    });

    t.it('Setting selection programmatically', async t => {
        await createScheduler();
        checkEventsCount(t, 10);

        // Start with no selections
        checkUISelection(t, []);

        // Set multiple selected events
        scheduler.selectedEvents = [events[0], events[1], events[2]];
        checkUISelection(t, [0, 1, 2]);

        // Set single selected event
        scheduler.selectedEvents = [events[1]];
        checkUISelection(t, [1]);

        // Set empty selected events
        scheduler.selectedEvents = [];
        checkUISelection(t, []);

        // Set null selected events
        scheduler.selectedEvents = null;
        checkUISelection(t, []);

        // Set undefiled selected events
        scheduler.selectedEvents = null;
        checkUISelection(t, []);

        // Select single event and preserve selection
        scheduler.selectEvent(events[1], true);
        scheduler.selectEvent(events[2], true);
        checkUISelection(t, [1, 2]);

        // Select already selected event and don't preserve selection should do nothing
        scheduler.selectEvent(events[1], false);
        checkUISelection(t, [1, 2]);

        // Select single event and don't preserve selection
        scheduler.selectEvent(events[3], false);
        checkUISelection(t, [3]);

        // Deselect single event and preserve selection
        scheduler.selectedEvents = [events[1], events[2], events[3]];
        scheduler.deselectEvent(events[3]);
        checkUISelection(t, [1, 2]);

        // Deselect deselected event and don't preserve selection should do nothing
        scheduler.deselectEvent(events[3]);
        checkUISelection(t, [1, 2]);

        // Select multiple events
        scheduler.selectEvents([events[1], events[2], events[3]]);
        checkUISelection(t, [1, 2, 3]);

        scheduler.deselectEvents([events[1], events[2]]);
        checkUISelection(t, [3]);
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8398
    t.it('Clicking a resize handle should select the event', async t => {
        await createScheduler();
        checkEventsCount(t, 1);

        t.chain(
            { click : '.b-sch-event', offset : ['100%-3', '50%'] },

            () => {
                checkUISelection(t, [0]);
            }
        );
    });

    t.it('Should clear selection classes on released elements', async t => {
        await createScheduler({
            startDate : new Date(2011, 0, 2),
            endDate   : new Date(2011, 2, 1),
            width     : 800,
            events    : [
                {
                    id         : 'e2-1',
                    startDate  : '2011-01-03',
                    endDate    : '2011-01-05',
                    resourceId : 'r2'
                },
                {
                    id         : 'e3-1',
                    startDate  : '2011-01-03',
                    endDate    : '2011-01-05',
                    resourceId : 'r3'
                },
                {
                    id         : 'e2-2',
                    startDate  : '2011-01-17',
                    endDate    : '2011-01-19',
                    resourceId : 'r2'
                },
                {
                    id         : 'e3-2',
                    startDate  : '2011-01-17',
                    endDate    : '2011-01-19',
                    resourceId : 'r3'
                },
                {
                    id         : 'e4-1',
                    startDate  : '2011-01-17',
                    endDate    : '2011-01-19',
                    resourceId : 'r4'
                },
                {
                    id         : 'e5-1',
                    startDate  : '2011-01-17',
                    endDate    : '2011-01-19',
                    resourceId : 'r5'
                }
            ]
        });

        t.chain(
            { click : '[data-event-id="e2-1"]' },

            async() => {
                await scheduler.scrollToDate(new Date(2011, 0, 16), { block : 'start' });

                await t.waitForSelectorNotFound(`${scheduler.unreleasedEventSelector} .b-sch-event-selected`);

                t.is(scheduler.selectedEvents[0].id, 'e2-1', 'event 2-1 is selected');
            },

            { click : '[data-event-id="e5-1"]' },

            async() => {
                await scheduler.scrollToDate(new Date(2011, 0, 2), { block : 'start' });

                await t.waitForSelectorNotFound(`${scheduler.unreleasedEventSelector} .b-sch-event-selected`);

                t.is(scheduler.selectedEvents[0].id, 'e5-1', 'event 5-1 is selected');
            }
        );
    });

    t.it('Should select event outside of the view', async t => {
        await createScheduler({
            startDate : new Date(2011, 0, 2),
            endDate   : new Date(2011, 2, 1),
            width     : 800,
            events    : [
                {
                    id         : 'e4-1',
                    startDate  : '2011-01-17',
                    endDate    : '2011-01-19',
                    resourceId : 'r4'
                }
            ]
        });

        scheduler.selectEvent(scheduler.eventStore.first);

        await scheduler.scrollToDate(new Date(2011, 0, 16), { block : 'start' });

        await t.waitForSelector('.b-sch-event-selected');

        t.pass('Event outside of the view is selected');
    });

    // https://bryntum.com/forum/viewtopic.php?p=76925#p76925
    t.it('Should not duplicate records when multi selection is enabled and dataset is replaced', t => {
        const events = [{
            id         : 1,
            resourceId : 'r1',
            startDate  : new Date(2011, 0, 5),
            endDate    : new Date(2011, 0, 6)
        }];

        scheduler = t.getScheduler({
            multiEventSelect                 : true,
            maintainSelectionOnDatasetChange : true,
            events
        });

        t.chain(
            { click : '.b-sch-event' },
            async() => {
                // replace with the same dataset
                scheduler.events = events;
            },
            { drag : '.b-sch-event', by : [0, scheduler.rowHeight] },
            { drag : '.b-sch-event', by : [0, scheduler.rowHeight] },
            () => {
                t.selectorCountIs('.b-sch-event', 1, 'One element on the screen');
                t.is(scheduler.eventStore.count, 1, 'One record in the store');
            }
        );
    });

    // https://github.com/bryntum/support/issues/1742
    t.it('Should highlight assignments correctly in multi-assignment mode', async t => {
        await createScheduler({
            multiEventSelect : true,
            features         : {
                eventTooltip    : false,
                scheduleTooltip : false
            },
            events : [{
                id        : 1,
                name      : 'The task',
                startDate : new Date(2011, 0, 5),
                endDate   : new Date(2011, 0, 6)
            }],
            assignments : [
                {
                    resourceId : 'r1',
                    eventId    : 1
                },
                {
                    resourceId : 'r2',
                    eventId    : 1
                },
                {
                    resourceId : 'r3',
                    eventId    : 1
                }
            ]
        });

        await t.click('[data-resource-id="r1"]');
        t.selectorExists('[data-resource-id="r1"] .b-sch-event-selected');
        t.selectorExists('[data-resource-id="r2"] .b-sch-event-assign-selected');
        t.selectorExists('[data-resource-id="r3"] .b-sch-event-assign-selected');

        await t.click('[data-resource-id="r2"]');
        t.selectorExists('[data-resource-id="r2"] .b-sch-event-selected');
        t.selectorExists('[data-resource-id="r1"] .b-sch-event-assign-selected');
        t.selectorExists('[data-resource-id="r3"] .b-sch-event-assign-selected');
    });

    t.it('Should delete all selected events when pressing Delete key', async t => {
        await createScheduler({
            multiEventSelect : true
        });

        await t.click('.b-sch-event:contains(Assignment 1)', null, null, {
            ctrlKey : true
        });

        await t.click('.b-sch-event:contains(Assignment 2)', null, null, {
            ctrlKey : true
        });

        t.firesOnce(scheduler.assignmentStore, 'remove');

        scheduler.eventStore.on({
            remove : ({ records }) => {
                t.is(records.length, 2, '2 records removed');
            }
        });
        await t.type(null, '[DELETE]');

        await t.waitForSelectorNotFound(`${scheduler.unreleasedEventSelector}:contains(Assignment 1)`);
        await t.waitForSelectorNotFound(`${scheduler.unreleasedEventSelector}:contains(Assignment 2)`);
    });

    t.it('Should delete all selected events when drag selecting then pressing Delete key', async t => {
        let fired = false;
        await createScheduler({
            features : {
                eventDragSelect : true,
                eventDragCreate : false
            }
        });

        await t.dragTo('.b-sch-timeaxis-cell', [600, 300], null, null, null, false, [10, 10]);

        t.firesOnce(scheduler.assignmentStore, 'remove');

        scheduler.assignmentStore.on({
            remove : ({ records }) => {
                t.is(records.length, 4, '4 records removed');
                fired = true;
            }
        });

        await t.waitForSelector('.b-sch-event-wrap.b-active:contains(Assignment 4)');
        await t.type(null, '[DELETE]');

        await t.waitFor(() => fired);
    });

    t.it('Should deselect all events when replacing project', async t => {
        await createScheduler();

        scheduler.selectEvents(scheduler.eventStore.records);

        scheduler.project = {
            eventsData : [
                { id : 1, startDate : '2011-01-04', endDate : '2011-01-06', resourceId : 'r1' }
            ],

            resourcesData : [
                { id : 'r1', name : 'Resource 1' }
            ]
        };

        t.is(scheduler.selectedEvents.length, 0, 'No events selected after replacing project');
    });

    // https://github.com/bryntum/support/issues/2797
    t.it('Should handle event being deleted while being highlighted', async t => {
        await createScheduler({
            highlightSuccessors   : true,
            highlightPredecessors : true
        });

        scheduler.selectedEvents = [scheduler.eventStore.first];
        scheduler.eventStore.remove(scheduler.selectedEvents);
    });

    // https://github.com/bryntum/support/issues/31
    t.it('Should clear cell focus when selecting an event', async t => {
        await createScheduler();

        await t.click('.b-grid-cell');
        await t.click('.b-sch-event');

        t.is(scheduler.focusedCell, null, 'No cell focused after clicking event');
        t.is(scheduler.selectedRecords.length, 1, 'Still 1 row selected after clicking event');
    });

    t.it('Should not scroll to last focused cell after dataset reload', async t => {
        document.body.setAttribute('tabIndex', -1);

        const data = {
            success   : true,
            resources : {
                rows : [
                    { id : 1, name : 'John' },
                    { id : 2, name : 'Abby' },
                    { id : 3, name : 'Dibby' },
                    { id : 4, name : 'Gooby' },
                    { id : 5, name : 'Maaybe' },
                    { id : 6, name : 'Daby' }
                ]
            },
            events : {
                rows : [
                    { id : 1, resourceId : 1, name : 'event', startDate : '2011-01-05', duration : 1 }
                ]
            }
        };

        scheduler = window.scheduler = await t.getScheduler({
            height      : 200,
            width       : 800,
            crudManager : {}
        });

        scheduler.crudManager.loadCrudManagerData(data);

        await t.click('.b-grid-cell:contains(Daby)');
        await t.click('.b-sch-event');

        t.is(scheduler.focusedCell, null, 'No cell focused after clicking event');
        t.is(scheduler.selectedRecords.length, 1, 'Still 1 row selected after clicking event');

        scheduler.scrollable.y = 0;
        scheduler.crudManager.loadCrudManagerData(data);

        document.body.focus();

        scheduler.focus();

        t.is(scheduler.scrollable.y, 0, 'Scroll still at top, not modified due to Scheduler receiving focus');
    });

    // https://github.com/bryntum/support/issues/3647
    t.it('Should be possible to block selection using isEventSelectable method', async t => {
        await createScheduler({
            startDate : new Date(2011, 0, 2),
            endDate   : new Date(2011, 1, 1),
            width     : 800,
            events    : [
                {
                    id         : 1,
                    cls        : 'one',
                    startDate  : '2011-01-2',
                    endDate    : '2011-01-3',
                    resourceId : 'r4',
                    name       : 'One'
                },
                {
                    id         : 2,
                    name       : 'Two',
                    startDate  : '2011-01-3',
                    endDate    : '2011-01-4',
                    resourceId : 'r4'
                }
            ],
            isEventSelectable(event) {
                return event.id === 2;
            }
        });

        scheduler.selectEvents(scheduler.eventStore.records);

        t.isDeeply(scheduler.selectedEvents, [scheduler.eventStore.getById(2)], 'Record 1 not selected');

        scheduler.deselectEvent(scheduler.eventStore.getById(2));

        t.is(scheduler.selectedEvents.length, 0, 'Selection cleared');

        await t.click('.b-sch-event.one');

        t.is(scheduler.selectedEvents.length, 0, 'Record 1 not selected when clicking');
    });

});
