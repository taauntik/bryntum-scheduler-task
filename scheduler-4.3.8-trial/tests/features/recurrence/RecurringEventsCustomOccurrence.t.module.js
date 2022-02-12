import { EventStore, ResourceStore, Base } from '../../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler1, scheduler2;

    t.beforeEach(() => Base.destroy(scheduler1, scheduler2));

    async function getScheduler(config) {
        return t.getSchedulerAsync(Object.assign({
            height    : 200,
            startDate : new Date(2018, 5, 11),
            endDate   : new Date(2018, 5, 25),

            enableRecurringEvents : true
        }, config));
    }

    t.it('Supports occurrences detaching', async t => {

        const resourceStore = new ResourceStore({
            data : [{ id : 'r1' }]
        });

        const eventStore = new EventStore({
            data : [{
                id         : 1,
                resourceId : 'r1',
                name       : 'Foo',
                startDate  : '2018-06-14',
                endDate    : '2018-06-15'
            }, {
                id             : 2,
                resourceId     : 'r1',
                name           : 'Bar',
                startDate      : '2018-06-14',
                endDate        : '2018-06-15',
                recurrenceRule : 'FREQ=WEEKLY;INTERVAL=1'
            }, {
                id             : 3,
                resourceId     : 'r1',
                name           : 'Baz',
                startDate      : '2018-06-14',
                endDate        : '2018-06-15',
                recurrenceRule : 'FREQ=DAILY;INTERVAL=2'
            }]
        });

        const event3 = eventStore.getById(3);

        t.isCalledNTimes('add', eventStore, 1, 'One exception is added');

        scheduler1 = await getScheduler({
            resourceStore,
            eventStore
        });

        scheduler2 = await getScheduler({
            resourceStore,
            eventStore
        });

        t.is(eventStore.count, 3, 'store has correct number of records');
        t.is(event3.occurrences.length, 5, 'event3 has proper number of occurrences');

        const occurrence2 = event3.occurrences[2];

        t.diag('initial occurrence dates');

        t.is(occurrence2.startDate, new Date(2018, 5, 20), 'occurrence #2 start is correct');
        t.is(occurrence2.endDate, new Date(2018, 5, 21), 'occurrence #2 end is correct');

        t.diag('detach the occurrence2 and change its start & end dates');

        const exceptionDate = occurrence2.startDate;

        occurrence2.beginBatch();
        occurrence2.setStartEndDate(new Date(2018, 5, 21), new Date(2018, 5, 22));
        occurrence2.recurrence = null;
        occurrence2.endBatch();

        t.ok(event3.hasException(exceptionDate), 'Exception date automatically added');

        t.notOk(occurrence2.isModified, 'Changes to occurrences do not mark them as modified');

        t.diag('update master event name to trigger occurrences regenerating');

        event3.name = 'zaB';

        await t.waitForProjectReady();

        t.is(eventStore.count, 4, 'Exception has been added');
        t.is(event3.occurrences.length, 4, 'event 3 has proper number of occurrences');

        t.is(event3.occurrences[0].name, 'zaB', 'event 3 occurrence got new name');

        t.is(occurrence2.name, 'Baz', 'occurrence #2 name is correct');
        t.is(occurrence2.startDate, new Date(2018, 5, 21), 'occurrence #2 start is correct');
        t.is(occurrence2.endDate, new Date(2018, 5, 22), 'occurrence #2 end is correct');

        scheduler1.destroy();
        scheduler2.destroy();
    });

    // TODO: 2 more cases - limited by "Count" & limited by "Until"
    t.it('Supports recurrence splitting', async t => {

        const resourceStore = new ResourceStore({
            data : [{ id : 'r1' }]
        });

        const eventStore = new EventStore({
            data : [
                { id : 1, resourceId : 'r1', name : 'Foo', startDate : '2018-06-14', endDate : '2018-06-15' },
                { id : 2, resourceId : 'r1', name : 'Bar', startDate : '2018-06-14', endDate : '2018-06-15', recurrenceRule : 'FREQ=WEEKLY;INTERVAL=1' },
                { id : 3, resourceId : 'r1', name : 'Baz', startDate : '2018-06-14', endDate : '2018-06-15', recurrenceRule : 'FREQ=DAILY;INTERVAL=2' }
            ]
        });

        const event3 = eventStore.getById(3);

        t.isCalledNTimes('add', eventStore, 1);

        scheduler1 = await getScheduler({
            resourceStore,
            eventStore
        });

        scheduler2 = await getScheduler({
            resourceStore,
            eventStore
        });

        t.is(eventStore.count, 3, 'store has correct number of records');
        t.is(event3.occurrences.length, 5, 'event 3 has 4 occurrences');

        const occurrence2 = event3.occurrences[2];

        t.diag('initial occurrence dates');

        t.is(occurrence2.startDate, new Date(2018, 5, 20), 'occurrence #2 start is correct');
        t.is(occurrence2.endDate, new Date(2018, 5, 21), 'occurrence #2 end is correct');

        t.diag('detach the occurrence2 and change its start & end dates');

        const { recurringEvent } = occurrence2;

        occurrence2.beginBatch();

        const newStartDate = new Date(2018, 5, 15);
        const newEndDate = new Date(occurrence2.endDate - 0 + (newStartDate - occurrence2.startDate));

        occurrence2.name = 'oops';
        // setStartEndDate will not invoke setting values on project when batching is on, instead changes will be
        // postponed until endBatch.
        occurrence2.setStartEndDate(newStartDate, newEndDate);

        occurrence2.endBatch();

        // Occurrence has changes -> promoted to actual event already

        // Need to calculate project before reading event start/end dates, they have been changed
        await t.waitForProjectReady(eventStore);

        // applying the recurrence from old master
        occurrence2.recurrence = recurringEvent.recurrence.copy();

        await t.waitForProjectReady();

        t.is(eventStore.count, 4, 'store has correct number of records');
        t.is(event3.occurrences.length, 2, 'event 3 has 2 attached occurrences');

        t.is(occurrence2.occurrences.length, 2, 'occurrence2 has 2 attached occurrences');

        t.is(event3.occurrences[0].name, 'Baz', 'event 3 occurrence got proper name');
        t.is(occurrence2.occurrences[0].name, 'oops', 'occurrence2 occurrence got proper name');

        t.notOk(occurrence2.dirty, 'occurrence #2 is not dirty');
        t.is(occurrence2.name, 'oops', 'occurrence #2 name is correct');
        t.is(occurrence2.startDate, new Date(2018, 5, 15), 'occurrence #2 start is correct');
        t.is(occurrence2.endDate, new Date(2018, 5, 16), 'occurrence #2 end is correct');
    });

    t.it('Removing of an individual occurrence', async t => {

        const resourceStore = new ResourceStore({
            data : [{ id : 'r1' }]
        });

        const eventStore = new EventStore({
            data : [
                { id : 1, resourceId : 'r1', name : 'Foo', startDate : '2018-06-14', endDate : '2018-06-15' },
                { id : 2, resourceId : 'r1', name : 'Bar', startDate : '2018-06-14', endDate : '2018-06-15', recurrenceRule : 'FREQ=WEEKLY;INTERVAL=1' },
                { id : 3, resourceId : 'r1', name : 'Baz', startDate : '2018-06-14', endDate : '2018-06-15', recurrenceRule : 'FREQ=DAILY;INTERVAL=2' }
            ]
        });

        const event3 = eventStore.getById(3);

        let occurrence2;

        t.isntCalled('add', eventStore, 'Recurrences are not added');

        scheduler1 = await getScheduler({
            resourceStore,
            eventStore
        });

        scheduler2 = await getScheduler({
            resourceStore,
            eventStore
        });

        t.is(eventStore.count, 3, 'store has correct number of records');
        t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

        occurrence2 = event3.occurrences[2];

        event3.addExceptionDate(occurrence2.startDate);
        eventStore.remove(occurrence2);

        await t.waitForProjectReady();

        t.diag('update master event name to trigger occurrences regenerating');

        event3.name = 'zaB';

        await t.waitForProjectReady();

        t.is(eventStore.count, 3, 'store has correct number of records');
        t.is(event3.occurrences.length, 4, 'event 3 has 4 attached occurrences');

        const occurrences = event3.occurrences;

        t.is(occurrences[0].name, 'zaB', 'occurrence #0 got new name');
        t.is(occurrences[0].startDate, new Date(2018, 5, 16), 'occurrence #0 start is correct');
        t.is(occurrences[0].endDate, new Date(2018, 5, 17), 'occurrence #0 end is correct');

        t.is(occurrences[1].name, 'zaB', 'occurrence #1 got new name');
        t.is(occurrences[1].startDate, new Date(2018, 5, 18), 'occurrence #1 start is correct');
        t.is(occurrences[1].endDate, new Date(2018, 5, 19), 'occurrence #1 end is correct');

        t.is(occurrences[2].name, 'zaB', 'occurrence #2 got new name');
        t.is(occurrences[2].startDate, new Date(2018, 5, 22), 'occurrence #2 start is correct');
        t.is(occurrences[2].endDate, new Date(2018, 5, 23), 'occurrence #2 end is correct');

        t.is(occurrences[3].name, 'zaB', 'occurrence #3 got new name');
        t.is(occurrences[3].startDate, new Date(2018, 5, 24), 'occurrence #3 start is correct');
        t.is(occurrences[3].endDate, new Date(2018, 5, 25), 'occurrence #3 end is correct');
    });

    t.it('Removing of further occurrences', async t => {

        const resourceStore = new ResourceStore({
            data : [{ id : 'r1' }]
        });

        const eventStore = new EventStore({
            data : [
                { id : 1, resourceId : 'r1', name : 'Foo', startDate : '2018-06-14', endDate : '2018-06-15' },
                { id : 2, resourceId : 'r1', name : 'Bar', startDate : '2018-06-14', endDate : '2018-06-15', recurrenceRule : 'FREQ=WEEKLY;INTERVAL=1' },
                { id : 3, resourceId : 'r1', name : 'Baz', startDate : '2018-06-14', endDate : '2018-06-15', recurrenceRule : 'FREQ=DAILY;INTERVAL=2' }
            ]
        });

        const event3 = eventStore.getById(3);

        t.isntCalled('add', eventStore, 'Occurrences are not added');

        scheduler1 = await getScheduler({
            resourceStore,
            eventStore
        });

        scheduler2 = await getScheduler({
            resourceStore,
            eventStore
        });

        t.is(eventStore.count, 3, 'store has correct number of records');
        t.is(event3.occurrences.length, 5, 'event 3 has 5 occurrences');

        const occurrence2 = event3.occurrences[2];

        event3.recurrence.endDate = new Date(occurrence2.startDate - 1);

        await t.waitForProjectReady();

        t.is(eventStore.count, 3, 'store has correct number of records');
        t.is(event3.occurrences.length, 2, 'event 3 has 2 attached occurrences');

        const occurrences = event3.occurrences;

        t.is(occurrences[0].name, 'Baz', 'occurrence #0 got new name');
        t.is(occurrences[0].startDate, new Date(2018, 5, 16), 'occurrence #0 start is correct');
        t.is(occurrences[0].endDate, new Date(2018, 5, 17), 'occurrence #0 end is correct');

        t.is(occurrences[1].name, 'Baz', 'occurrence #1 got new name');
        t.is(occurrences[1].startDate, new Date(2018, 5, 18), 'occurrence #1 start is correct');
        t.is(occurrences[1].endDate, new Date(2018, 5, 19), 'occurrence #1 end is correct');
    });

    // https://github.com/bryntum/support/issues/3482
    t.it('Should fire `add` event when promoting occurrence to full event', async t => {
        const
            resourceStore = new ResourceStore({
                data : [{ id : 'r1' }]
            }),

            eventStore    = new EventStore({
                data : [{
                    id             : 1,
                    resourceId     : 'r1',
                    name           : 'Baz',
                    startDate      : '2018-06-14',
                    endDate        : '2018-06-15',
                    recurrenceRule : 'FREQ=DAILY;INTERVAL=2'
                }]
            }),
            event         = eventStore.getById(1);

        t.firesOnce(eventStore, 'beforeadd');
        t.firesOnce(eventStore, 'add');

        scheduler1 = await getScheduler({
            forceFit : true,
            features : {
                eventEdit : true
            },
            resourceStore,
            eventStore
        });

        t.is(event.occurrences.length, 5, 'event has proper number of occurrences');

        const
            occurrence2   = event.occurrences[2],
            exceptionDate = occurrence2.startDate;

        eventStore.on('add', ({ records }) => {
            t.is(records[0].name, 'foo', 'Record data up to date in add listener');
        });

        await scheduler1.editEvent(occurrence2);

        await t.click('[data-ref="nameField"] input');
        await t.type({
            text          : 'foo',
            clearExisting : true
        });

        await t.click('button:contains(Save)');
        await t.click('button:contains(Only This)');

        t.ok(event.hasException(exceptionDate), 'Exception date automatically added');
        await t.waitForProjectReady();
    });
});
