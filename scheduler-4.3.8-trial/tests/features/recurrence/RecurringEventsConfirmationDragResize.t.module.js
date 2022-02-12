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
        const result = await t.getSchedulerAsync(Object.assign({
            startDate             : new Date(2018, 5, 11),
            endDate               : new Date(2018, 5, 25),
            renderTo              : document.body,
            enableRecurringEvents : true,
            features              : {
                eventTooltip : false
            },
            resourceStore,
            eventStore
        }, config));

        ({ recurrenceConfirmationPopup } = result);

        return result;
    }

    t.it('Confirmation shows up on recurring event or its occurrence resize', async t => {

        scheduler = await getScheduler();

        t.diag('Initial state of data');
        t.is(eventStore.count, 3, 'store has correct number of records');
        t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
        t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
        t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

        t.chain(
            { moveCursorTo : '.sch-event2' },

            { drag : '.sch-event2', offset : ['100%-3', '50%'], by : [100, 0] },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            async() => {
                const buttons = getConfirmationButtons();

                t.is(buttons.length, 2, '2 visible buttons found');
                t.is(buttons[0].text, 'Yes', '"Yes" button found');
                t.is(buttons[1].text, 'Cancel', '"Cancel" button found');
            },

            { moveMouseTo : 'button:contains(Cancel)' },

            { click : 'button:contains(Cancel)', desc : 'Clicked "Cancel"' },

            { waitForSelectorNotFound : '.b-sch-recurrenceconfirmation:not(.b-hidden)' },

            async() => {
                t.diag('Make sure data is intact');
                t.isDeeply(eventStore.modified.values, [], 'store has correct number of records');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
            },

            { moveCursorTo : '.b-occurrence' },

            { drag : '.b-occurrence', offset : ['100%-3', '50%'], by : [100, 0] },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            async() => {
                const buttons = getConfirmationButtons();

                t.is(buttons.length, 3, '3 visible buttons found');
                t.is(buttons[0].text, 'All Future Events', '"All Future Events" button found');
                t.is(buttons[1].text, 'Only This Event', '"Only This Event" button found');
                t.is(buttons[2].text, 'Cancel', '"Cancel" button found');
            },

            { click : 'button:contains(Cancel)', desc : 'Clicked "Cancel"' },

            { waitForSelectorNotFound : '.b-sch-recurrenceconfirmation:not(.b-hidden)' },

            async() => {
                t.diag('Make sure data is intact');
                t.isDeeply(eventStore.modified.values, [], 'store has correct number of records');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
            },

            { moveCursorTo : '.sch-event1', desc : 'Moved cursor over the event #1 (not recurring one)' },

            { drag : '.sch-event1', offset : ['100%-3', '50%'], by : [100, 0] },

            {
                waitFor : 1000,
                desc    : 'Waited for some long enough timeout to make sure that confirmation never appear'
            },

            () => {
                t.selectorNotExists('.b-sch-recurrenceconfirmation:not(.b-hidden)', 'Confirmation has not showed up');

                t.isDeeply([...eventStore.modified], [event1], 'proper modified bag');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
            }
        );
    });

    t.it('"Yes" button click causes occurrences regeneration', async t => {

        scheduler = await getScheduler();

        t.diag('Initial state of data');
        t.isDeeply(eventStore.modified.values, [], 'no modified records');
        t.is(eventStore.count, 3, 'store has correct number of records');
        t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
        t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
        t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

        t.chain(
            { moveCursorTo : '.sch-event2' },

            { drag : '.sch-event2', offset : ['100%-3', '50%'], by : [100, 0] },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            { click : 'button:contains(Yes)' },

            {
                waitFor : () => eventStore.modified.count === 1 && eventStore.modified.values[0] === event2,
                desc    : 'event 2 was modified'
            },

            () => {
                t.isDeeply([...eventStore.modified], [event2], 'event 2 was resized and its occurrence was rebuilt in turn');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
            }
        );
    });

    t.it('"All Future Events" button click causes further occurrences regeneration', async t => {

        scheduler = await getScheduler();

        t.diag('Initial state of data');
        t.isDeeply(eventStore.modified.values, [], 'no modified records');
        t.is(eventStore.count, 3, 'store has correct number of records');
        t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
        t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
        t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

        const
            occurrence   = event3.occurrences[2],
            occurrenceEl = scheduler.getElementFromEventRecord(occurrence);

        t.chain(
            { moveCursorTo : () => occurrenceEl },

            {
                drag   : () => occurrenceEl,
                offset : ['100%-3', '50%'],
                by     : [-50, 0]
            },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            { click : 'button:contains(All Future Events)' },

            {
                waitFor : () => !occurrence.isOccurrence,
                desc    : '"occurrence" is no longer an occurrence'
            },

            () => {
                t.notOk(occurrence.isOccurrence, '"occurrence" is no longer an occurrence');
                t.ok(occurrence.isRecurring, '"occurrence" is a new independent recurring event');

                t.isDeeply([...eventStore.added], [occurrence], 'proper added bag');
                t.isDeeply([...eventStore.modified], [event3], 'proper modified bag');

                t.is(eventStore.count, 4, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 2, 'event 3 has 2 occurrences');
                t.ok(event3.endDate < occurrence.startDate, 'event 3 recurrence stops before the "occurrence" starts');
                t.ok(event3.occurrences[1].endDate < occurrence.startDate, 'The last occurrence of "event 3" stops before the "occurrence" starts');
                t.is(occurrence.occurrences.length, 2, '"occurrence" has 2 occurrences');
            }
        );
    });

    t.it('"Only This Event" button click works properly', t => {

        let occurrenceEl, occurrence;

        t.chain(
            // to avoid scrolling while resizing events
            { setWindowSize : [1600, 500] },

            async() => {
                scheduler = await getScheduler({
                    width : 1500
                });
            },

            next => {
                t.diag('Initial state of data');
                t.isDeeply(eventStore.modified.values, [], 'no modified records');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

                occurrence   = event3.occurrences[2];
                occurrenceEl = scheduler.getElementsFromEventRecord(occurrence)[0];
                next();
            },

            { moveCursorTo : () => occurrenceEl },

            {
                drag   : () => occurrenceEl,
                offset : ['100%-3', '50%'],
                by     : [100, 0]
            },

            { waitForSelector : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation showed up' },

            { click : 'button:contains(Only This Event)' },

            { waitForSelectorNotFound : '.b-sch-recurrenceconfirmation:not(.b-hidden)', desc : 'Confirmation hidden' },

            () => {
                t.notOk(occurrence.isOccurrence, '"occurrence" is no longer an occurrence');
                t.notOk(occurrence.isRecurring, '"occurrence" is not a recurring event');
                t.is(occurrence.endDate, new Date(2018, 5, 22), '"occurrence" end date is correct');

                t.isDeeply(eventStore.modified.values, [event3], 'proper modified bag');
                t.isDeeply(eventStore.added.values, [occurrence], 'proper added bag');

                t.is(eventStore.count, 4, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.ok(event3.hasException(occurrence.startDate), 'event 3 has "occurrence" start date in the exception dates list');

                const occurrencesDates = event3.occurrences.map(occurrence => {
                    return { start : occurrence.startDate, end : occurrence.endDate };
                });

                t.isDeeply(occurrencesDates, [
                    { start : new Date(2018, 5, 16), end : new Date(2018, 5, 17) },
                    { start : new Date(2018, 5, 18), end : new Date(2018, 5, 19) },
                    { start : new Date(2018, 5, 22), end : new Date(2018, 5, 23) },
                    { start : new Date(2018, 5, 24), end : new Date(2018, 5, 25) }
                ], 'event 3 occurrences dates are correct');
            }
        );
    });

});
