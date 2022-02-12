import { TimeSpan } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    t.it('Sanity', t => {
        t.ok(TimeSpan, 'TimeSpan is here');

        t.diag('get dates');

        t.is(new TimeSpan().name, '', 'New timespan should have empty name');

        const timespan1 = new TimeSpan({
            startDate : new Date(2011, 6, 10),
            endDate   : new Date(2011, 6, 12)
        });

        t.isDeeply(timespan1.dates, [
            new Date(2011, 6, 10),
            new Date(2011, 6, 11)
        ], 'Correct dates in timespan');

        const timespan2 = new TimeSpan({
            startDate : new Date(2011, 6, 10, 1),
            endDate   : new Date(2011, 6, 12, 1)
        });

        t.isDeeply(timespan2.dates, [
            new Date(2011, 6, 10),
            new Date(2011, 6, 11),
            new Date(2011, 6, 12)
        ], 'Correct dates in timespan starting not at the days edge');
    });

    t.it('Duration should be calculated if not specified', t => {
        const timeSpan1 = new TimeSpan({
            startDate : new Date(2018, 2, 5),
            endDate   : new Date(2018, 2, 7)
        });

        t.is(timeSpan1.duration, 2, 'duration correct');

        const timeSpan2 = new TimeSpan({
            startDate    : new Date(2018, 2, 5, 10),
            endDate      : new Date(2018, 2, 5, 11),
            durationUnit : 'hour'
        });

        t.is(timeSpan2.duration, 1, 'duration correct with durationUnit');
    });

    t.it('Start date should be calculated if not specified', t => {
        const timeSpan1 = new TimeSpan({
            endDate  : new Date(2018, 2, 15),
            duration : 5
        });

        t.is(timeSpan1.startDate, new Date(2018, 2, 10), 'startDate correct');

        const timeSpan2 = new TimeSpan({
            endDate      : new Date(2018, 2, 5, 10),
            duration     : 0.5,
            durationUnit : 'hour'
        });

        t.is(timeSpan2.startDate, new Date(2018, 2, 5, 9, 30), 'startDate correct with durationUnit');
    });

    t.it('End date should be calculated if not specified', t => {
        const timeSpan1 = new TimeSpan({
            startDate : new Date(2018, 2, 5),
            duration  : 5
        });

        t.is(timeSpan1.endDate, new Date(2018, 2, 10), 'endDate correct');

        const timeSpan2 = new TimeSpan({
            startDate    : new Date(2018, 2, 5, 10),
            duration     : 0.5,
            durationUnit : 'hour'
        });

        t.is(timeSpan2.endDate, new Date(2018, 2, 5, 10, 30), 'endDate correct with durationUnit');
    });

    t.it('Changing dates should optionally update duration', t => {
        const timeSpan = new TimeSpan({
            startDate : new Date(2018, 2, 5),
            endDate   : new Date(2018, 2, 7)
        });

        timeSpan.endDate = new Date(2018, 2, 6);
        t.is(timeSpan.startDate, new Date(2018, 2, 5), 'startDate intact');
        t.is(timeSpan.endDate, new Date(2018, 2, 6), 'endDate set');
        t.is(timeSpan.duration, 1, 'Changing endDate updated duration');

        timeSpan.startDate = new Date(2018, 2, 4);
        t.is(timeSpan.startDate, new Date(2018, 2, 4), 'startDate moved');
        t.is(timeSpan.endDate, new Date(2018, 2, 5), 'endDate updated');
        t.is(timeSpan.duration, 1, 'Calling startDate setter kept duration by default');

        timeSpan.setStartDate(new Date(2018, 2, 3), false);
        t.is(timeSpan.startDate, new Date(2018, 2, 3), 'startDate set');
        t.is(timeSpan.endDate, new Date(2018, 2, 5), 'endDate intact');
        t.is(timeSpan.duration, 2, 'Calling setStartDate with false, should update duration');

        timeSpan.setStartDate(new Date(2018, 2, 4), true);
        t.is(timeSpan.startDate, new Date(2018, 2, 4), 'startDate set');
        t.is(timeSpan.endDate, new Date(2018, 2, 6), 'startDate intact');
        t.is(timeSpan.duration, 2, 'Calling setStartDate with true should keep duration');
    });

    t.it('Changing duration should update endDate', t => {
        const timeSpan1 = new TimeSpan({
            startDate : new Date(2018, 2, 5),
            endDate   : new Date(2018, 2, 7)
        });

        timeSpan1.duration = 5;

        t.is(timeSpan1.endDate, new Date(2018, 2, 10), 'endDate correct');
    });

    t.it('Changing duration with a string representation of the new duration should update endDate', t => {
        const timeSpan1 = new TimeSpan({
            startDate : new Date(2018, 2, 5),
            endDate   : new Date(2018, 2, 7)
        });

        timeSpan1.duration = '5';

        t.is(timeSpan1.endDate, new Date(2018, 2, 10), 'endDate correct');
    });

    t.it('Changing duration and unit should update endDate', t => {
        const timeSpan1 = new TimeSpan({
            startDate    : new Date(2018, 2, 5, 10),
            duration     : 0.5,
            durationUnit : 'hour'
        });

        timeSpan1.setDuration(1, 'day');

        t.is(timeSpan1.endDate, new Date(2018, 2, 6, 10), 'endDate correct');
    });

    t.it('Changing duration and unit should update endDate when new duration is in string representation', t => {
        const timeSpan1 = new TimeSpan({
            startDate    : new Date(2018, 2, 5, 10),
            duration     : 0.5,
            durationUnit : 'hour'
        });

        timeSpan1.setDuration('1', 'day');

        t.is(timeSpan1.endDate, new Date(2018, 2, 6, 10), 'endDate correct');
    });

    t.it('Changing one date should not set the other if it is undefined and has no duration', t => {
        const timeSpan1 = new TimeSpan({
            startDate : new Date(2018, 2, 5)
        });

        timeSpan1.startDate = new Date(2017, 2, 6);

        t.notOk(timeSpan1.duration, 'No duration set');
        t.notOk(timeSpan1.endDate, 'No endDate set');

        const timeSpan2 = new TimeSpan({
            endDate : new Date(2018, 2, 5)
        });

        timeSpan2.endDate = new Date(2017, 2, 6);

        t.notOk(timeSpan2.duration, 'No duration set');
        t.notOk(timeSpan2.startDate, 'No startDate set');
    });

    t.it('Setting start date when having only duration should calculate the end date', t => {
        const timeSpan1 = new TimeSpan({
            duration : 3
        });

        timeSpan1.startDate = new Date(2018, 2, 6);

        t.is(timeSpan1.endDate, new Date(2018, 2, 9), 'endDate calculated');
    });

    t.it('Setting end date when having only duration should calculate the start date', t => {
        const timeSpan1 = new TimeSpan({
            duration : 3
        });

        timeSpan1.endDate = new Date(2018, 2, 9);

        t.is(timeSpan1.startDate, new Date(2018, 2, 6), 'startDate calculated');
    });

    t.it('Setting new start date > end date should not result in negative duration', t => {
        const timeSpan1 = new TimeSpan({
            startDate : new Date(2018, 0, 1),
            duration  : 1
        });

        timeSpan1.startDate = new Date(2018, 1, 1);

        t.is(timeSpan1.startDate, new Date(2018, 1, 1), 'startDate moved');
        t.is(timeSpan1.endDate, new Date(2018, 1, 2), 'endDate calculated');
        t.is(timeSpan1.duration, 1, 'duration intact');
    });

    t.it('Setting new end date < start date should throw', t => {
        const timeSpan1 = new TimeSpan({
            startDate : new Date(2018, 0, 1),
            duration  : 1
        });

        t.throwsOk(() => {
            timeSpan1.endDate = new Date(2017, 0, 1);
        }, 'Negative duration');
    });

    t.it('Setting new start date + end date together should work', t => {
        const timeSpan1 = new TimeSpan({
            startDate : new Date(2018, 0, 1),
            duration  : 1
        });

        timeSpan1.set({
            startDate : new Date(2018, 0, 1),
            endDate   : new Date(2018, 0, 11)
        });

        t.is(timeSpan1.startDate, new Date(2018, 0, 1), 'startDate set');
        t.is(timeSpan1.endDate, new Date(2018, 0, 11), 'endDate set');
        t.is(timeSpan1.duration, 10, 'duration calculated');

        timeSpan1.setStartEndDate(new Date(2018, 0, 3), new Date(2018, 0, 5));

        t.is(timeSpan1.startDate, new Date(2018, 0, 3), 'setStartEndDate: startDate set');
        t.is(timeSpan1.endDate, new Date(2018, 0, 5), 'setStartEndDate: endDate set');
        t.is(timeSpan1.duration, 2, 'setStartEndDate: duration calculated');
    });

    t.it('Setting new start date + duration in an Object set should work', t => {
        const timeSpan = new TimeSpan({
            startDate : new Date(2018, 0, 1),
            duration  : 1
        });

        timeSpan.set({
            startDate    : new Date(2018, 0, 12),
            duration     : 2,
            durationUnit : 'minutes'
        });

        t.is(timeSpan.startDate, new Date(2018, 0, 12), 'startDate set');
        t.is(timeSpan.endDate, new Date(2018, 0, 12, 0, 2), 'endDate calculated');
        t.is(timeSpan.duration, 2, 'duration set');
        t.is(timeSpan.durationUnit, 'minutes', 'durationUnit set');
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7735
    t.it('TimeSpan.normalize should respect custom model fields', t => {
        class MyTimeSpan extends TimeSpan {
            static get fields() {
                return [
                    {
                        name       : 'startDate',
                        dataSource : 'taskstart',
                        type       : 'date',
                        format     : 'YYYY-MM-DDTHH:mm:ssZ'
                    },
                    {
                        name       : 'endDate',
                        dataSource : 'taskfinish',
                        type       : 'date',
                        format     : 'YYYY-MM-DDTHH:mm:ssZ'
                    },
                    {
                        name       : 'duration',
                        dataSource : 'lasting',
                        type       : 'number',
                        allowNull  : true
                    },
                    {
                        name         : 'durationUnit',
                        dataSource   : 'lastingUnit',
                        type         : 'string',
                        defaultValue : 'd'
                    }
                ];
            }
        }

        // normalize is called automatically after model creation

        const spanWithNoDuration = new MyTimeSpan({
            taskstart  : new Date(2019, 2, 8),
            taskfinish : new Date(2019, 2, 9)
        });

        t.is(spanWithNoDuration.data.lasting, 1);
        t.is(spanWithNoDuration.data.lastingUnit, 'd');

        const spanWithNoEndDate = new MyTimeSpan({
            taskstart   : new Date(2019, 2, 8),
            lasting     : 4,
            lastingUnit : 'h'
        });

        spanWithNoEndDate.normalize();

        t.isDateEqual(spanWithNoEndDate.data.taskfinish, new Date(2019, 2, 8, 4));

        const spanWithNoStartDate = new MyTimeSpan({
            taskfinish  : new Date(2019, 2, 9),
            lasting     : 4,
            lastingUnit : 'h'
        });

        spanWithNoStartDate.normalize();

        t.isDateEqual(spanWithNoStartDate.data.taskstart, new Date(2019, 2, 8, 20));
    });
});
