import { DailyRecurrenceIterator, WeeklyRecurrenceIterator, MonthlyRecurrenceIterator, YearlyRecurrenceIterator, ProjectModel, EventStore, ResourceStore } from '../../build/scheduler.module.js?456730';

StartTest(t => {

    t.it('DailyIterator', async t => {
        const eventStore = new EventStore({
            data : [
                {
                    id             : 1,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 12:30:55',
                    endDate        : '2018-05-18 11:12:13',
                    recurrenceRule : 'FREQ=DAILY;COUNT=4;'
                },
                {
                    id             : 2,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 12:30:55',
                    endDate        : '2018-05-18 11:12:13',
                    recurrenceRule : 'FREQ=DAILY;INTERVAL=10;UNTIL=20180527T111213'
                }
            ]
        });

        const project = new ProjectModel({
            eventStore,
            resourceStore : new ResourceStore({ data : [{ id : 'r1' }] })
        });

        await project.commitAsync();

        const
            recurrence1 = eventStore.getById(1).recurrence,
            recurrence2 = eventStore.getById(2).recurrence;

        t.it('Count', t => {
            const dates = [];

            DailyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence1,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 16, 12, 30, 55), new Date(2018, 4, 17, 12, 30, 55), new Date(2018, 4, 18, 12, 30, 55), new Date(2018, 4, 19, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Start/End dates (startDate is greater than event start)', t => {
            const dates = [];

            DailyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence1,
                startDate  : new Date(2018, 4, 16, 12, 30, 56),
                endDate    : new Date(2018, 4, 17, 12, 30, 55),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 17, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Start/End dates (startDate is less than event start)', t => {
            const dates = [];

            DailyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence1,
                startDate  : new Date(2018, 4, 16, 12, 30, 54),
                endDate    : new Date(2018, 4, 17, 12, 30, 55),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 16, 12, 30, 55), new Date(2018, 4, 17, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Until date', t => {
            const dates = [];

            t.is(recurrence2.endDate, new Date(2018, 4, 27, 11, 12, 13), 'proper recurrence EndDate');

            DailyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence2,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 16, 12, 30, 55), new Date(2018, 4, 26, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Until date + endDate', t => {
            const dates = [];

            DailyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence2,
                endDate    : new Date(2018, 4, 26, 12, 30, 54),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 16, 12, 30, 55)], 'proper dates iterated');
        });

    });

    t.it('WeeklyIterator', async t => {

        const eventStore = new EventStore({
            data : [
                {
                    id             : 1,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 12:30:55',
                    endDate        : '2018-05-18 11:12:13',
                    recurrenceRule : 'FREQ=WEEKLY;INTERVAL=1;COUNT=4;'
                },
                {
                    id             : 2,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 12:30:55',
                    endDate        : '2018-05-18 11:12:13',
                    recurrenceRule : 'FREQ=WEEKLY;INTERVAL=1;'
                },
                {
                    id             : 3,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 13:30:55',
                    endDate        : '2018-05-18 12:12:13',
                    recurrenceRule : 'FREQ=WEEKLY;INTERVAL=1;BYDAY=FR,SA;COUNT=4'
                },
                {
                    id             : 4,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 13:30:55',
                    endDate        : '2018-05-18 12:12:13',
                    recurrenceRule : 'FREQ=WEEKLY;INTERVAL=1;BYDAY=FR,SA'
                },
                // Weekly in 2 weeks on Mon, Tue, Wed, Thu, Fri starting on 11/02/2020
                {
                    id             : 5,
                    resourceId     : 'r1',
                    startDate      : '2020-11-02 13:30:55',
                    endDate        : '2020-11-03 12:12:13',
                    recurrenceRule : 'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TU,WE,TH,FR'
                }
            ]
        });

        const project = new ProjectModel({
            eventStore,
            resourceStore : new ResourceStore({ data : [{ id : 'r1' }] })
        });

        await project.commitAsync();

        const
            recurrence1 = eventStore.getById(1).recurrence,
            recurrence2 = eventStore.getById(2).recurrence,
            recurrence3 = eventStore.getById(3).recurrence,
            recurrence4 = eventStore.getById(4).recurrence,
            recurrence5 = eventStore.getById(5).recurrence;

        t.it('Count', t => {
            const dates = [];

            WeeklyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence1,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 16, 12, 30, 55), new Date(2018, 4, 23, 12, 30, 55), new Date(2018, 4, 30, 12, 30, 55), new Date(2018, 5, 6, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Start/End dates', t => {
            const dates = [];

            WeeklyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence2,
                startDate  : new Date(2018, 4, 23, 12, 30, 55),
                endDate    : new Date(2018, 5, 6, 12, 30, 55),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 23, 12, 30, 55), new Date(2018, 4, 30, 12, 30, 55), new Date(2018, 5, 6, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Days + Count', t => {
            const dates = [];

            WeeklyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence3,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 18, 13, 30, 55), new Date(2018, 4, 19, 13, 30, 55), new Date(2018, 4, 25, 13, 30, 55), new Date(2018, 4, 26, 13, 30, 55)], 'proper dates iterated');
        });

        t.it('Days + Start/End dates', t => {
            const dates = [];

            WeeklyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence4,
                startDate  : new Date(2018, 4, 19, 13, 30, 55),
                endDate    : new Date(2018, 4, 26, 13, 30, 55),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 19, 13, 30, 55), new Date(2018, 4, 25, 13, 30, 55), new Date(2018, 4, 26, 13, 30, 55)], 'proper dates iterated');
        });

        t.it('Iteration startDate is before event start date', t => {
            const dates = [];

            WeeklyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence1,
                startDate  : new Date(2018, 4, 1),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 16, 12, 30, 55), new Date(2018, 4, 23, 12, 30, 55), new Date(2018, 4, 30, 12, 30, 55), new Date(2018, 5, 6, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Continue iteration of Count limited recurrence', t => {
            const dates = [], indexes = [];

            WeeklyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence1,
                startDate  : new Date(2018, 4, 23, 12, 30, 56),
                fn         : (date, index) => {
                    dates.push(date);
                    indexes.push(index);
                }
            });

            t.isDeeply(dates, [new Date(2018, 4, 30, 12, 30, 55), new Date(2018, 5, 6, 12, 30, 55)], 'proper dates iterated');
            t.isDeeply(indexes, [3, 4], 'proper indexes iterated');
        });

        // Weekly in 2 weeks on Mon, Tue, Wed, Thu, Fri starting on 11/02/2020.
        t.it('Weekly in 2 weeks on Mon, Tue, Wed, Thu, Fri starting on 11/02/2020', t => {
            let dates = [], indexes = [];

            WeeklyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence5,
                startDate  : new Date(2020, 10, 2, 13, 30, 55),
                endDate    : new Date(2020, 10, 9, 13, 30, 54),
                fn         : (date, index) => {
                    dates.push(date);
                    indexes.push(index);
                }
            });

            t.isDeeply(dates, [
                new Date(2020, 10, 2, 13, 30, 55),
                new Date(2020, 10, 3, 13, 30, 55),
                new Date(2020, 10, 4, 13, 30, 55),
                new Date(2020, 10, 5, 13, 30, 55),
                new Date(2020, 10, 6, 13, 30, 55)
            ], 'proper dates iterated');

            t.isDeeply(indexes, [1, 2, 3, 4, 5], 'proper indexes iterated');

            dates = [];
            indexes = [];

            WeeklyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence5,
                startDate  : new Date(2020, 10, 9, 13, 30, 55),
                endDate    : new Date(2020, 10, 16, 13, 30, 54),
                fn         : (date, index) => {
                    dates.push(date);
                    indexes.push(index);
                }
            });

            t.isDeeply(dates, [], 'proper dates iterated');

            t.isDeeply(indexes, [], 'proper indexes iterated');

            dates = [];
            indexes = [];

            WeeklyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence5,
                startDate  : new Date(2020, 10, 16, 13, 30, 55),
                endDate    : new Date(2020, 10, 23, 13, 30, 54),
                fn         : (date, index) => {
                    dates.push(date);
                    indexes.push(index);
                }
            });

            t.isDeeply(dates, [
                new Date(2020, 10, 16, 13, 30, 55),
                new Date(2020, 10, 17, 13, 30, 55),
                new Date(2020, 10, 18, 13, 30, 55),
                new Date(2020, 10, 19, 13, 30, 55),
                new Date(2020, 10, 20, 13, 30, 55)
            ], 'proper dates iterated');

            t.isDeeply(indexes, [6, 7, 8, 9, 10], 'proper indexes iterated');
        });

    });

    t.it('MonthlyIterator', async t => {

        const eventStore = new EventStore({
            data : [
                {
                    id             : 1,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 12:30:55',
                    endDate        : '2018-05-18 11:12:13',
                    recurrenceRule : 'FREQ=MONTHLY;INTERVAL=2;COUNT=4;'
                },
                {
                    id             : 2,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 12:30:55',
                    endDate        : '2018-05-18 11:12:13',
                    recurrenceRule : 'FREQ=MONTHLY;INTERVAL=2;'
                },

                {
                    id             : 3,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 13:30:55',
                    endDate        : '2018-05-18 12:12:13',
                    recurrenceRule : 'FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=30,-1;COUNT=4;'
                },
                {
                    id             : 4,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 13:30:55',
                    endDate        : '2018-05-18 12:12:13',
                    recurrenceRule : 'FREQ=MONTHLY;INTERVAL=2;BYMONTHDAY=30,-1;'
                },

                {
                    id             : 5,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 14:30:55',
                    endDate        : '2018-05-18 13:12:13',
                    recurrenceRule : 'FREQ=MONTHLY;INTERVAL=2;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=1,-1;COUNT=4'
                },
                {
                    id             : 6,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 14:30:55',
                    endDate        : '2018-05-18 13:12:13',
                    recurrenceRule : 'FREQ=MONTHLY;INTERVAL=2;BYDAY=SU,SA;BYSETPOS=1,-1'
                },

                {
                    id             : 7,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 15:30:55',
                    endDate        : '2018-05-18 14:12:13',
                    recurrenceRule : 'FREQ=MONTHLY;INTERVAL=2;BYDAY=-1SU,1SA,5MO;COUNT=4'
                },

                {
                    id             : 8,
                    resourceId     : 'r1',
                    startDate      : '2021-09-01 04:00:00',
                    duration       : 1,
                    durationUnit   : 'h',
                    recurrenceRule : 'FREQ=MONTHLY;INTERVAL=1;BYDAY=WE;BYSETPOS=2'
                }
            ]
        });

        const project = new ProjectModel({
            eventStore,
            resourceStore : new ResourceStore({ data : [{ id : 'r1' }] })
        });

        await project.commitAsync();

        const
            recurrence1 = eventStore.getById(1).recurrence,
            recurrence2 = eventStore.getById(2).recurrence,
            recurrence3 = eventStore.getById(3).recurrence,
            recurrence4 = eventStore.getById(4).recurrence,
            recurrence5 = eventStore.getById(5).recurrence,
            recurrence6 = eventStore.getById(6).recurrence,
            recurrence7 = eventStore.getById(7).recurrence,
            recurrence8 = eventStore.getById(8).recurrence;

        t.it('Count', t => {
            const dates = [];

            MonthlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence1,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 16, 12, 30, 55), new Date(2018, 6, 16, 12, 30, 55), new Date(2018, 8, 16, 12, 30, 55), new Date(2018, 10, 16, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Start/End dates', t => {
            const dates = [];

            MonthlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence2,
                startDate  : new Date(2018, 6, 16, 13, 30, 55),
                endDate    : new Date(2018, 10, 16, 12, 30, 54),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 8, 16, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Start/End dates 2', t => {
            const dates = [];

            MonthlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence2,
                startDate  : new Date(2018, 7, 16, 12, 30, 55),
                endDate    : new Date(2018, 10, 16, 12, 30, 54),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 8, 16, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('MonthDays + Count', t => {
            const dates = [];

            MonthlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence3,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 30, 13, 30, 55), new Date(2018, 4, 31, 13, 30, 55), new Date(2018, 6, 30, 13, 30, 55), new Date(2018, 6, 31, 13, 30, 55)], 'proper dates iterated');
        });

        t.it('MonthDays + Start/End dates', t => {
            const dates = [];

            MonthlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence4,
                startDate  : new Date(2018, 6, 30, 10, 30, 55),
                endDate    : new Date(2018, 9, 30, 13, 30, 55),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 6, 30, 13, 30, 55), new Date(2018, 6, 31, 13, 30, 55), new Date(2018, 8, 30, 13, 30, 55)], 'proper dates iterated');
        });

        t.it('Days + Count + Position (first and last working days of month)', t => {
            const dates = [];

            MonthlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence5,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 31, 14, 30, 55), new Date(2018, 6, 2, 14, 30, 55), new Date(2018, 6, 31, 14, 30, 55), new Date(2018, 8, 3, 14, 30, 55)], 'proper dates iterated');
        });

        t.it('Days + Start/End + Position (first and last weekends of month)', t => {
            const dates = [];

            MonthlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence6,
                startDate  : new Date(2018, 4, 23, 14, 30, 55),
                endDate    : new Date(2018, 6, 29, 14, 30, 55),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 27, 14, 30, 55), new Date(2018, 6, 1, 14, 30, 55), new Date(2018, 6, 29, 14, 30, 55)], 'proper dates iterated');
        });

        t.it('Numbered Days + Count', t => {
            const dates = [];

            MonthlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence7,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 27, 15, 30, 55), new Date(2018, 6, 7, 15, 30, 55), new Date(2018, 6, 29, 15, 30, 55), new Date(2018, 6, 30, 15, 30, 55)], 'proper dates iterated');
        });

        t.it('Continue iteration of Count limited recurrence', t => {
            const dates = [], indexes = [];

            MonthlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence1,
                startDate  : new Date(2018, 6, 16, 12, 30, 56),
                fn         : (date, index) => {
                    dates.push(date);
                    indexes.push(index);
                }
            });

            t.isDeeply(dates, [new Date(2018, 8, 16, 12, 30, 55), new Date(2018, 10, 16, 12, 30, 55)], 'proper dates iterated');
            t.isDeeply(indexes, [3, 4], 'proper indexes iterated');
        });

        t.it('Accounts for DST changes on nth weekday of the month', t => {
            // See https://github.com/bryntum/support/issues/3413
            const dates = [];

            MonthlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence8,
                startDate  : new Date(2021, 10, 1),
                endDate    : new Date(2021, 11, 1),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2021, 10, 10, 4)], 'proper dates iterated');
        });
    });

    t.it('YearlyIterator', async t => {

        const eventStore = new EventStore({
            data : [
                {
                    id             : 1,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 12:30:55',
                    endDate        : '2018-05-18 11:12:13',
                    recurrenceRule : 'FREQ=YEARLY;INTERVAL=2;COUNT=4;'
                },
                {
                    id             : 2,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 12:30:55',
                    endDate        : '2018-05-18 11:12:13',
                    recurrenceRule : 'FREQ=YEARLY;INTERVAL=2;'
                },

                {
                    id             : 3,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 13:30:55',
                    endDate        : '2018-05-18 12:12:13',
                    recurrenceRule : 'FREQ=YEARLY;INTERVAL=2;COUNT=4;BYMONTH=2,8;'
                },
                {
                    id             : 4,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 13:30:55',
                    endDate        : '2018-05-18 12:12:13',
                    recurrenceRule : 'FREQ=YEARLY;INTERVAL=2;BYMONTH=1,12;'
                },

                {
                    id             : 5,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 14:30:55',
                    endDate        : '2018-05-18 13:12:13',
                    recurrenceRule : 'FREQ=YEARLY;INTERVAL=2;COUNT=4;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=1,-1'
                },
                {
                    id             : 6,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 14:30:55',
                    endDate        : '2018-05-18 13:12:13',
                    recurrenceRule : 'FREQ=YEARLY;INTERVAL=2;BYDAY=SU,SA;BYSETPOS=1,-1'
                },

                {
                    id             : 7,
                    resourceId     : 'r1',
                    startDate      : '2018-05-16 15:30:55',
                    endDate        : '2018-05-18 14:12:13',
                    recurrenceRule : 'FREQ=YEARLY;INTERVAL=2;BYDAY=-1SU,1SA,5MO;COUNT=4'
                }
            ]
        });

        const project = new ProjectModel({
            eventStore,
            resourceStore : new ResourceStore({ data : [{ id : 'r1' }] })
        });

        await project.commitAsync();

        const
            recurrence1 = eventStore.getById(1).recurrence,
            recurrence2 = eventStore.getById(2).recurrence,
            recurrence3 = eventStore.getById(3).recurrence,
            recurrence4 = eventStore.getById(4).recurrence,
            recurrence5 = eventStore.getById(5).recurrence,
            recurrence6 = eventStore.getById(6).recurrence,
            recurrence7 = eventStore.getById(7).recurrence;

        t.it('Count', t => {
            const dates = [];

            YearlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence1,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 4, 16, 12, 30, 55), new Date(2020, 4, 16, 12, 30, 55), new Date(2022, 4, 16, 12, 30, 55), new Date(2024, 4, 16, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Start/End dates', t => {
            const dates = [];

            YearlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence2,
                startDate  : new Date(2018, 6, 16, 13, 30, 55),
                endDate    : new Date(2020, 4, 16, 12, 30, 55),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2020, 4, 16, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Start/End dates 2', t => {
            const dates = [];

            YearlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence2,
                startDate  : new Date(2019, 6, 16, 12, 30, 55),
                endDate    : new Date(2020, 4, 16, 12, 30, 55),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2020, 4, 16, 12, 30, 55)], 'proper dates iterated');
        });

        t.it('Months + Count', t => {
            const dates = [];

            YearlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence3,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 7, 16, 13, 30, 55), new Date(2020, 1, 16, 13, 30, 55), new Date(2020, 7, 16, 13, 30, 55), new Date(2022, 1, 16, 13, 30, 55)], 'proper dates iterated');
        });

        t.it('Months + Start/End dates', t => {
            const dates = [];

            YearlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence4,
                startDate  : new Date(2018, 7, 16, 13, 30, 56),
                endDate    : new Date(2022, 1, 16, 13, 30, 54),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 11, 16, 13, 30, 55), new Date(2020, 0, 16, 13, 30, 55), new Date(2020, 11, 16, 13, 30, 55), new Date(2022, 0, 16, 13, 30, 55)], 'proper dates iterated');
        });

        t.it('Days + Count + Position (first and last working days of year)', t => {
            const dates = [];

            YearlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence5,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 11, 31, 14, 30, 55), new Date(2020, 0, 1, 14, 30, 55), new Date(2020, 11, 31, 14, 30, 55), new Date(2022, 0, 3, 14, 30, 55)], 'proper dates iterated');
        });

        t.it('Days + Start/End + Position (first and last weekends of month)', t => {
            const dates = [];

            YearlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence6,
                startDate  : new Date(2018, 0, 8, 14, 30, 55),
                endDate    : new Date(2020, 11, 27, 14, 30, 55),
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 11, 30, 14, 30, 55), new Date(2020, 0, 4, 14, 30, 55), new Date(2020, 11, 27, 14, 30, 55)], 'proper dates iterated');
        });

        t.it('Numbered Days + Count (last Sun, first Sat, 5th Mon)', t => {
            const dates = [];

            YearlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence7,
                fn         : date => dates.push(date)
            });

            t.isDeeply(dates, [new Date(2018, 11, 30, 15, 30, 55), new Date(2020, 0, 4, 15, 30, 55), new Date(2020, 1, 3, 15, 30, 55), new Date(2020, 11, 27, 15, 30, 55)], 'proper dates iterated');
        });

        t.it('Continue of "Numbered Days + Count (last Sun, first Sat, 5th Mon)"', t => {
            const dates = [], indexes = [];

            YearlyRecurrenceIterator.forEachDate({
                startOnly  : true,
                recurrence : recurrence7,
                startDate  : new Date(2020, 1, 3, 15, 30, 56),
                fn         : (date, index) => {
                    dates.push(date);
                    indexes.push(index);
                }
            });

            t.isDeeply(dates, [new Date(2020, 11, 27, 15, 30, 55)], 'proper dates iterated');
            t.isDeeply(indexes, [4], 'proper indexes iterated');
        });
    });

});
