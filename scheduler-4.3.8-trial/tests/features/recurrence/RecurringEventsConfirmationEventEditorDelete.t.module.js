import { EventStore, ResourceStore } from '../../../build/scheduler.module.js?456730';

StartTest(t => {

    // The test checks that clicking "Delete" button in event editor shows recurrence confirmation dialog
    // and assert the confirmation buttons

    let resourceStore, eventStore, scheduler, recurrenceConfirmationPopup, event1, event2, event3;

    async function getScheduler(config) {
        const result = await t.getSchedulerAsync(Object.assign({
            resourceStore,
            eventStore,
            enableRecurringEvents : true,
            features              : {
                eventTooltip : false,
                eventEdit    : true // is enabled by default already, but in case we change our minds...
            },
            startDate : new Date(2018, 5, 11),
            endDate   : new Date(2018, 5, 25),
            appendTo  : document.body
        }, config));

        recurrenceConfirmationPopup = result.features.eventEdit.recurrenceConfirmation;

        return result;
    }

    function getRemovedRecords(store = eventStore) {
        return store.removed.values;
    }

    function getConfirmationButtons() {
        return recurrenceConfirmationPopup.queryAll(w => w.type === 'button' && w.isVisible);
    }

    t.beforeEach(async(t, next) => {
        scheduler && !scheduler.isDestroyed && scheduler.destroy();

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

        scheduler = await getScheduler();

        t.diag('Initial state of data');
        t.is(eventStore.count, 3, 'store has correct number of records');
        t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
        t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
        t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

        // Needed to make async beforeEach work in umd tests
        next();
    });

    t.it('Confirmation shows up on recurring event deleting in event editor', t => {

        t.chain(
            { diag : 'Assert recurring event editing' },

            { doubleclick : '.sch-event2' },

            { waitForElementVisible : '.b-eventeditor', desc : 'Event editor showed up' },

            { click : 'button:contains(Delete)', desc : '"Delete" clicked' },

            { waitForElementVisible : '.b-sch-recurrenceconfirmation', desc : 'Confirmation showed up' },

            next => {
                const buttons = getConfirmationButtons();

                t.is(buttons.length, 2, '2 visible buttons found');
                t.is(buttons[0].text, 'Yes', '"Yes" button found');
                t.is(buttons[1].text, 'Cancel', '"Cancel" button found');

                next();
            },

            { click : '.b-sch-recurrenceconfirmation button:contains(Cancel)', desc : 'Clicked "Cancel"' },

            { waitFor : () => !t.$('.b-sch-recurrenceconfirmation')[0], desc : 'Confirmation closed' },

            { click : 'button:contains(Cancel)' },

            { waitFor : () => !t.$('.b-eventeditor')[0], desc : 'Event editor closed' },

            next => {
                t.diag('Make sure data is intact');
                t.isDeeply(eventStore.modified.values, [], 'store has correct number of records');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

                next();
            },

            { diag : 'Assert occurrence editing' },

            { doubleclick : '.sch-event3.b-occurrence' },

            { waitForElementVisible : '.b-eventeditor', desc : 'Event editor showed up' },

            { click : 'button:contains(Delete)', desc : '"Delete" clicked' },

            { waitForElementVisible : '.b-sch-recurrenceconfirmation', desc : 'Confirmation showed up' },

            next => {
                const buttons = getConfirmationButtons();

                t.is(buttons.length, 3, '3 visible buttons found');
                t.is(buttons[0].text, 'Delete All Future Events', '"All Future Events" button found');
                t.is(buttons[1].text, 'Delete Only This Event', '"Only This Event" button found');
                t.is(buttons[2].text, 'Cancel', '"Cancel" button found');

                next();
            },

            { click : '.b-sch-recurrenceconfirmation button:contains(Cancel)', desc : 'Clicked "Cancel"' },

            { waitFor : () => !t.$('.b-sch-recurrenceconfirmation')[0], desc : 'Confirmation closed' },

            { click : 'button:contains(Cancel)' },

            { waitFor : () => !t.$('.b-eventeditor')[0], desc : 'Event editor closed' },

            next => {
                t.diag('Make sure data is intact');
                t.isDeeply(eventStore.modified.values, [], 'store has correct number of records');
                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

                next();
            },

            { diag : 'Assert non recurring event editing' },

            { doubleclick : '.sch-event1' },

            { waitForElementVisible : '.b-eventeditor', desc : 'Event editor showed up' },

            { click : 'button:contains(Delete)', desc : '"Delete" clicked' },

            {
                waitFor : 1000,
                desc    : 'Waited for some long enough timeout to make sure that confirmation never appear'
            },

            () => {
                // TODO: report to Siesta
                // t.elementIsNotVisible('.b-sch-recurrenceconfirmation', 'Confirmation did not show up');
                t.selectorNotExists('.b-sch-recurrenceconfirmation:not(.b-hidden)', 'Confirmation did not show up');

                t.isDeeply(getRemovedRecords(), [event1], 'event 1 was removed');
                t.is(eventStore.count, 2, 'store has correct number of records');
                t.notOk(eventStore.getById(1), 'no event 1');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
            }
        );
    });

    t.it('"Yes" button click causes occurrences regeneration', t => {
        t.chain(
            { doubleclick : '.sch-event2' },

            { waitForElementVisible : '.b-eventeditor', desc : 'Event editor showed up' },

            { click : 'button:contains(Delete)', desc : '"Delete" clicked' },

            { waitForElementVisible : '.b-sch-recurrenceconfirmation', desc : 'Confirmation showed up' },

            next => {
                t.waitForEvent(eventStore, 'remove', next);
                t.click('button:contains(Yes)');
            },

            () => {
                t.isDeeply(eventStore.removed.values, [event2], 'proper removed bag');
                t.is(eventStore.count, 2, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');
            }
        );
    });

    t.it('"Delete All Future Events" button click causes further occurrences removal', t => {

        const
            event3Occurrences = event3.occurrences,
            occurrence        = event3Occurrences[1],
            { startDate }     = occurrence;

        t.chain(
            { doubleclick : () => scheduler.getElementFromEventRecord(occurrence) },

            { waitForElementVisible : '.b-eventeditor', desc : 'Event editor showed up' },

            { click : 'button:contains(Delete)', desc : '"Delete" clicked' },

            { waitForElementVisible : '.b-sch-recurrenceconfirmation', desc : 'Confirmation showed up' },

            { click : 'button:contains(Delete All Future Events)' },

            { waitForSelectorNotFound : '.b-eventeditor', desc : 'Event editor closed' },

            () => {
                t.isDeeply([...eventStore.modified], [event3], 'proper modified bag');

                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.is(event3.occurrences.length, 1, 'event 3 has 3 occurrences');
                t.ok(event3.endDate < startDate, 'event 3 recurrence stops before the "occurrence" started');
            }
        );
    });

    t.it('"Delete Only This Event" button click works properly', t => {

        const
            event3Occurrences = event3.occurrences,
            occurrence        = event3Occurrences[1],
            { startDate }     = occurrence;

        t.chain(
            { doubleclick : () => scheduler.getElementFromEventRecord(occurrence) },

            { waitForElementVisible : '.b-eventeditor', desc : 'Event editor showed up' },

            { click : 'button:contains(Delete)', desc : '"Delete" clicked' },

            { waitForElementVisible : '.b-sch-recurrenceconfirmation', desc : 'Confirmation showed up' },

            { click : 'button:contains(Delete Only This Event)' },

            { waitForSelectorNotFound : '.b-eventeditor', desc : 'Event editor closed' },

            () => {
                t.isDeeplyUnordered([...eventStore.modified], [event3], 'proper modified bag');

                t.is(eventStore.count, 3, 'store has correct number of records');
                t.notOk(event1.occurrences.length, 'event 1 has no occurrences');
                t.is(event2.occurrences.length, 1, 'event 2 has 1 occurrence');
                t.ok(event3.hasException(startDate), 'event 3 has "occurrence" start date in the exception dates list');

                const occurrencesDates = event3.occurrences.map(occurrence => {
                    return { start : occurrence.startDate, end : occurrence.endDate };
                });

                t.isDeeply(occurrencesDates, [
                    { start : new Date(2018, 5, 16), end : new Date(2018, 5, 17) },
                    { start : new Date(2018, 5, 20), end : new Date(2018, 5, 21) },
                    { start : new Date(2018, 5, 22), end : new Date(2018, 5, 23) },
                    { start : new Date(2018, 5, 24), end : new Date(2018, 5, 25) }
                ], 'event 3 occurrences dates are correct');
            }
        );
    });

});
