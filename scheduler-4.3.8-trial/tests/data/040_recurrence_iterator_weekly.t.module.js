import { WeeklyRecurrenceIterator, ProjectModel, EventStore, ResourceStore, DateHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {

    // https://github.com/bryntum/support/issues/3593
    t.it('Weekly iterator handles weeks starting on not Sunday properly', async t => {

        Object.defineProperty(DateHelper, 'weekStartDay', {
            get() {
                return 1;
            }
        });

        const eventStore = new EventStore({
            data : [
                // Weekly in 2 weeks on Sun, Sat and Thu
                {
                    id             : 5,
                    resourceId     : 'r1',
                    startDate      : '2021-10-06 13:30:55',
                    endDate        : '2021-10-07 12:12:13',
                    recurrenceRule : 'FREQ=WEEKLY;INTERVAL=2;BYDAY=SU,SA,TH'
                }
            ]
        });

        const project = new ProjectModel({
            eventStore,
            resourceStore : new ResourceStore({ data : [{ id : 'r1' }] })
        });

        await project.commitAsync();

        const
            { recurrence } = eventStore.getById(5),
            dates          = [],
            indexes        = [];

        WeeklyRecurrenceIterator.forEachDate({
            startOnly : true,
            recurrence,
            startDate : new Date(2021, 9, 6),
            endDate   : new Date(2021, 9, 25),
            fn        : (date, index) => {
                dates.push(date);
                indexes.push(index);
            }
        });

        t.isDeeply(dates, [
            new Date(2021, 9, 7, 13, 30, 55),
            new Date(2021, 9, 9, 13, 30, 55),
            new Date(2021, 9, 10, 13, 30, 55),
            new Date(2021, 9, 21, 13, 30, 55),
            new Date(2021, 9, 23, 13, 30, 55),
            new Date(2021, 9, 24, 13, 30, 55)
        ], 'proper dates iterated');

        t.isDeeply(indexes, [1, 2, 3, 4, 5, 6], 'proper indexes iterated');
    });

});
