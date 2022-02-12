import { EventStore, ResourceStore, Base } from '../../../build/scheduler.module.js?456730';

StartTest(t => {

    let resourceStore, eventStore, scheduler, recurrenceConfirmationPopup, event1, event2, event3;

    function getConfirmationButtons() {
        return recurrenceConfirmationPopup.queryAll(w => w.type === 'button' && w.isVisible);
    }

    t.beforeEach(() => {
        Base.destroy(scheduler);

        resourceStore = new ResourceStore({
            data : [{ id : 'r1' }]
        });

        eventStore = new EventStore({
            data : [
                { id : 1, resourceId : 'r1', name : 'Foo', startDate : '2018-06-14', endDate : '2018-06-15', cls : 'sch-event1' },
                { id : 2, resourceId : 'r1', name : 'Bar', startDate : '2018-06-14', endDate : '2018-06-15', recurrenceRule : 'FREQ=WEEKLY;INTERVAL=1', cls : 'sch-event2' },
                { id : 3, resourceId : 'r1', name : 'Baz', startDate : '2018-06-14', endDate : '2018-06-15', recurrenceRule : 'FREQ=DAILY;INTERVAL=2', cls : 'sch-event3' }
            ]
        });

        [event1, event2, event3] = eventStore;
    });

    async function getScheduler(config) {
        const scheduler = t.getScheduler(Object.assign({
            startDate             : new Date(2018, 5, 11),
            endDate               : new Date(2018, 5, 25),
            enableRecurringEvents : true,
            features              : {
                eventTooltip : false
            },
            resourceStore,
            eventStore
        }, config));

        ({ recurrenceConfirmationPopup } = scheduler);

        await scheduler.project.commitAsync();

        return scheduler;
    }

    t.it('Confirmation shows up on recurring event or its occurrence drag`n`drop', async t => {

        scheduler = await getScheduler();

        t.chain(
            next => {
                t.diag('Initial state of data');
                t.notOk(eventStore.modified.values.length, 'store has no modified records');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

                next();
            },

            { drag : '.sch-event2', by : [100, 0] },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            next => {
                const buttons = getConfirmationButtons();

                t.is(buttons.length, 2, '2 visible buttons found');
                t.is(buttons[0].text, 'Yes', '"Yes" button found');
                t.is(buttons[1].text, 'Cancel', '"Cancel" button found');

                next();
            },

            { click : 'button:contains(Cancel)', desc : 'Clicked "Cancel"' },

            { waitForSelectorNotFound : '.b-sch-recurrenceconfirmation:not(.b-hidden)' },

            next => {
                t.diag('Make sure data is intact');
                t.notOk(eventStore.modified.values.length, 'store has correct number of records');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

                next();
            },

            { drag : '.sch-event3.b-occurrence', by : [100, 0] },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            next => {
                const buttons = getConfirmationButtons();

                t.is(buttons.length, 3, '3 visible buttons found');
                t.is(buttons[0].text, 'All Future Events', '"All Future Events" button found');
                t.is(buttons[1].text, 'Only This Event', '"Only This Event" button found');
                t.is(buttons[2].text, 'Cancel', '"Cancel" button found');

                next();
            },

            { click : 'button:contains(Cancel)', desc : 'Clicked "Cancel"' },

            { waitForSelectorNotFound : '.b-sch-recurrenceconfirmation:not(.b-hidden)' },

            next => {
                t.diag('Make sure data is intact');
                t.notOk(eventStore.modified.values.length, 'store has correct number of records');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

                next();
            },

            { drag : '.sch-event1', by : [100, 0] },

            {
                waitFor : 1000,
                desc    : 'Waited for some long enough timeout to make sure that confirmation never appear'
            },

            next => {
                t.selectorNotExists('.b-sch-recurrenceconfirmation:not(.b-hidden)', 'Confirmation did not show up');

                t.isDeeply(eventStore.modified.values, [event1], 'event 1 was resized');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
            }
        );
    });

    t.it('"Yes" button click causes occurrences regeneration', async t => {
        scheduler = await getScheduler();

        t.chain(
            next => {
                t.diag('Initial state of data');
                t.notOk(eventStore.modified.values.length, 'no modified records');
                t.notOk(eventStore.added.count, 'no added records');
                t.notOk(eventStore.removed.count, 'no added records');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
                next();
            },

            { drag : '.sch-event2', by : [100, 0] },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            { click : 'button:contains(Yes)' },

            // Wait for event move
            { waitFor : () => !(event2.startDate - new Date(2018, 5, 15)) },

            { waitForProjectReady : scheduler },

            () => {
                t.is(event2.startDate, new Date(2018, 5, 15), 'event 2 moved');
                t.is(event2.occurrences[0].startDate, new Date(2018, 5, 22), 'event 2 occurrence moved');
                t.isDeeplyUnordered(eventStore.modified.values, [event2], 'proper set of modified records');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
            }
        );
    });

    t.it('"All Future Events" button click causes further occurrences regeneration', async t => {
        scheduler = await getScheduler({ width : 1500 });

        t.diag('Initial state of data');
        t.notOk(eventStore.modified.values.length, 'no modified records');
        t.is(eventStore.count, 3, 'store has correct number of records');
        t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
        t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
        t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

        const occurrence = event3.occurrences[1];

        t.chain(
            { drag : `[data-event-id="${occurrence.id}"]`, by : [scheduler.tickSize, 0] },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            { click : 'button:contains(All Future Events)' },

            {
                waitFor : () => !occurrence.isOccurrence,
                desc    : '"occurrence" is no longer an occurrence'
            },

            { waitForProjectReady : scheduler },

            () => {
                t.notOk(occurrence.isOccurrence, '"occurrence" is no longer an occurrence');
                t.ok(occurrence.isRecurring, '"occurrence" is a new independent recurring event');

                t.isDeeply([...eventStore.added], [occurrence], '"ex-occurrence" is in store.added');
                t.isDeeply([...eventStore.modified], [event3], 'event3 is in store.modified');

                t.is(eventStore.count, 4, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 1, 'event 3 has 3 occurrences');
                t.ok(event3.endDate < occurrence.startDate, 'event 3 recurrence stops before the "occurrence" starts');

                t.is(occurrence.occurrences.length, 3, '"occurrence" has 2 occurrences');
                t.is(occurrence.startDate, new Date(2018, 5, 19), '"occurrence" has correct start date');
                t.is(occurrence.occurrences[0].startDate, new Date(2018, 5, 21), '"occurrence" occurrence 0 has correct start date');
                t.is(occurrence.occurrences[1].startDate, new Date(2018, 5, 23), '"occurrence" occurrence 1 has correct start date');
                t.is(occurrence.occurrences[2].startDate, new Date(2018, 5, 25), '"occurrence" occurrence 1 has correct start date');
            }
        );
    });

    t.it('"Only This Event" button click works properly', async t => {
        scheduler = await getScheduler({ width : 1500 });

        t.diag('Initial state of data');
        t.notOk(eventStore.modified.values.length, 'no modified records');
        t.is(eventStore.count, 3, 'store has correct number of records');
        t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
        t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
        t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

        const
            occurrence          = event3.occurrences[1],
            occurrenceStartDate = occurrence.startDate;

        t.chain(
            { drag : `[data-event-id="${occurrence.id}"]`, by : [100, 0] },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            { click : 'button:contains(Only This Event)' },

            {
                waitFor : () => !occurrence.isOccurrence,
                desc    : '"occurrence" is no longer an occurrence'
            },

            { waitForProjectReady : scheduler },

            () => {
                t.notOk(occurrence.isOccurrence, '"occurrence" is no longer an occurrence');
                t.notOk(occurrence.isRecurring, '"occurrence" is not a recurring event');
                t.is(occurrence.startDate, new Date(2018, 5, 19), '"occurrence" start date is correct');

                t.isDeeply([...eventStore.modified], [event3], 'proper "modified" bag');
                t.isDeeply([...eventStore.added], [occurrence], 'proper "added" bag');

                t.is(eventStore.count, 4, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.ok(event3.hasException(occurrenceStartDate), 'event 3 has "occurrence" start date in the exception dates list');

                const occurrencesDates = event3.occurrences.map(occurrence => ({ start : occurrence.startDate, end : occurrence.endDate }));

                t.isDeeply(occurrencesDates, [
                    { start : new Date(2018, 5, 16), end : new Date(2018, 5, 17) },
                    { start : new Date(2018, 5, 20), end : new Date(2018, 5, 21) },
                    { start : new Date(2018, 5, 22), end : new Date(2018, 5, 23) },
                    { start : new Date(2018, 5, 24), end : new Date(2018, 5, 25) }
                ], 'event 3 occurrences dates are correct');
            }
        );
    });

    // https://github.com/bryntum/bryntum-suite/issues/175
    t.it('Close tool in header should behave as Cancel button', async t => {
        scheduler = await getScheduler();

        t.chain(
            { drag : '.sch-event2', by : [100, 0] },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            { click : '.b-popup-close', desc : 'Click [X] in the header' },

            { waitForSelectorNotFound : '.b-sch-recurrenceconfirmation:not(.b-hidden)' },

            () => {
                t.notOk(scheduler.features.eventDrag.drag.context, 'Context should be cleaned up since drag operation is finished');
                t.notOk(eventStore.modified.values.length, 'Records are not modified');
            }
        );
    });

    t.it('Dragging events to span the TimeAxis start to change all events', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate             : new Date(2018, 0, 1),
            endDate               : new Date(2018, 4, 1),
            viewPreset            : 'weekAndDayLetter',
            renderTo              : document.body,
            enableRecurringEvents : true,
            features              : {
                eventTooltip : false
            },
            resources : [{ name : 'Row one', id : 1 }],
            events    : [{
                id             : 1,
                resourceId     : 1,
                name           : '3 days/week, max 5 occurrences ',
                startDate      : '2018-01-01',
                endDate        : '2018-01-14',
                recurrenceRule : 'FREQ=WEEKLY;INTERVAL=3;BYDAY=MO,TU,WE;COUNT=5'
            }]
        });

        const
            { eventStore } = scheduler,
            event1         = eventStore.first;

        t.is(eventStore.count, 1, 'store has correct number of records');

        t.is(event1.occurrences.length, 4, 'event 1 has 4 occurrences');

        t.chain(
            {
                drag : () => '[data-event-id="1"]',

                // Drag it back to the *Sunday the 24th*.
                // This is not on its recurrence timeline BYDAY=MO,TU,WE
                // So it must snap to the 25th
                by : [-scheduler.tickSize * 8, 0]
            },

            { click : '[data-ref="changeMultipleButton"]' },

            { waitForProjectReady : scheduler },

            () => {
                // Start date has been corrected in line with the BYDAY rule
                t.is(event1.startDate, new Date(2017, 11, 25));
                // The 4 occurrences comply with the rule
                t.is(event1.occurrences[0].startDate, new Date(2017, 11, 26));
                t.is(event1.occurrences[1].startDate, new Date(2017, 11, 27));
                t.is(event1.occurrences[2].startDate, new Date(2018, 0, 15));
                t.is(event1.occurrences[3].startDate, new Date(2018, 0, 16));
            }
        );
    });

    t.it('Dragging events to span the TimeAxis start to create exception', async t => {
        scheduler = await t.getSchedulerAsync({
            startDate             : new Date(2018, 0, 1),
            endDate               : new Date(2018, 4, 1),
            viewPreset            : 'weekAndDayLetter',
            enableRecurringEvents : true,
            features              : {
                eventTooltip : false
            },
            resources : [{ name : 'Row one', id : 1 }],
            events    : [{
                id             : 1,
                resourceId     : 1,
                name           : '3 days/week, max 5 occurrences ',
                startDate      : '2018-01-01',
                endDate        : '2018-01-14',
                recurrenceRule : 'FREQ=WEEKLY;INTERVAL=3;BYDAY=MO,TU,WE;COUNT=5'
            }]
        });

        const
            { eventStore } = scheduler,
            event1         = eventStore.first,
            event2         = event1.occurrences[0];

        t.is(eventStore.count, 1, 'store has correct number of records');
        t.is(event1.occurrences.length, 4, 'event 1 has 4 occurrences');

        t.chain(
            {
                drag : () => scheduler.getElementFromEventRecord(event2),

                // Drag it back to the Sunday the 24th.
                by : [-scheduler.tickSize * 9, 0]
            },

            {
                click : '[data-ref="changeSingleButton"]'
            },

            { waitForProjectReady : scheduler },

            () => {
                t.is(eventStore.count, 2, 'store has correct number of records');
                t.is(event1.occurrences.length, 3, 'event 1 has 4 occurrences');

                // Start date correct
                t.is(event2.startDate, new Date(2017, 11, 24));

                t.is(event1.startDate, new Date(2018, 0, 1));

                // The 4 occurrences comply with the rule
                t.is(event1.occurrences[0].startDate, new Date(2018, 0, 3));
                t.is(event1.occurrences[1].startDate, new Date(2018, 0, 22));
                t.is(event1.occurrences[2].startDate, new Date(2018, 0, 23));
            }
        );
    });
});
