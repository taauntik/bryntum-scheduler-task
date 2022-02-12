import { TimeAxis, TimeAxisViewModel, PresetManager, DateHelper } from '../../../build/scheduler.module.js?456730';

StartTest(t => {
    t.it('getDateFromPosition with excluded days', t => {
        const viewPreset = 'weekAndMonth';

        const timeAxis = new TimeAxis({
            startDate    : new Date(2019, 1, 3),
            endDate      : new Date(2019, 1, 17),
            viewPreset,
            weekStartDay : 0
        });

        const model = new TimeAxisViewModel({
            timeAxis,
            viewPreset
        });

        t.it('Exclude Sun & sat', t => {
            model.update(700); // Dividable by both 7 and 5

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 3), 'Correct date at 0');      // Su
            t.is(model.getDateFromPosition(50), new Date(2019, 1, 4), 'Correct date at 50');    // Mo
            t.is(model.getDateFromPosition(100), new Date(2019, 1, 5), 'Correct date at 100');  // Tu
            t.is(model.getDateFromPosition(150), new Date(2019, 1, 6), 'Correct date at 150');  // We
            t.is(model.getDateFromPosition(200), new Date(2019, 1, 7), 'Correct date at 200');  // Th
            t.is(model.getDateFromPosition(250), new Date(2019, 1, 8), 'Correct date at 250');  // Fr
            t.is(model.getDateFromPosition(300), new Date(2019, 1, 9), 'Correct date at 300');  // Sa
            t.is(model.getDateFromPosition(350), new Date(2019, 1, 10), 'Correct date at 350'); // Su

            t.is(model.getDateFromPosition(700), new Date(2019, 1, 17), 'Correct date at 700'); // Su

            timeAxis.include = {
                day : { from : 1, to : 6 }
            };

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 4), 'Correct scaled date at 0');
            t.is(model.getDateFromPosition(70), new Date(2019, 1, 5), 'Correct scaled date at 70');
            t.is(model.getDateFromPosition(140), new Date(2019, 1, 6), 'Correct scaled date at 140');
            t.is(model.getDateFromPosition(210), new Date(2019, 1, 7), 'Correct scaled date at 210');
            t.is(model.getDateFromPosition(280), new Date(2019, 1, 8), 'Correct scaled date at 280');

            t.is(model.getDateFromPosition(315), new Date(2019, 1, 8, 12), 'Correct scaled date at 315');

            // TODO: Decide if part of first "tick" or second
            t.is(model.getDateFromPosition(350), new Date(2019, 1, 11), 'Correct scaled date at 350');

            t.is(model.getDateFromPosition(420), new Date(2019, 1, 12), 'Correct scaled date at 420');
            t.is(model.getDateFromPosition(455), new Date(2019, 1, 12, 12), 'Correct scaled date at 455');
            t.is(model.getDateFromPosition(490), new Date(2019, 1, 13), 'Correct scaled date at 490');
            t.is(model.getDateFromPosition(560), new Date(2019, 1, 14), 'Correct scaled date at 560');
            t.is(model.getDateFromPosition(630), new Date(2019, 1, 15), 'Correct scaled date at 630');

            // Related to TODO above
            //t.is(model.getDateFromPosition(700), new Date(2019, 1, 16), 'Correct scaled date at 700');
        });

        t.it('Exclude sun', t => {
            timeAxis.include = null;

            model.update(840); // 6 & 7

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 3), 'Correct date at 0');
            t.is(model.getDateFromPosition(60), new Date(2019, 1, 4), 'Correct date at 60');
            t.is(model.getDateFromPosition(420), new Date(2019, 1, 10), 'Correct date at 420');

            timeAxis.include = {
                day : { from : 1, to : 7 }
            };

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 4), 'Correct scaled date at 0');
            t.is(model.getDateFromPosition(70), new Date(2019, 1, 5), 'Correct scaled date at 70');

            t.is(model.getDateFromPosition(420), new Date(2019, 1, 11), 'Correct scaled date at 420');
            t.is(model.getDateFromPosition(490), new Date(2019, 1, 12), 'Correct scaled date at 490');
        });

        t.it('Exclude sun, mon, sat', t => {
            timeAxis.include = null;

            model.update(560); // 4 & 7

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 3), 'Correct date at 0');
            t.is(model.getDateFromPosition(40), new Date(2019, 1, 4), 'Correct date at 40');
            t.is(model.getDateFromPosition(280), new Date(2019, 1, 10), 'Correct date at 280');

            timeAxis.include = {
                day : { from : 2, to : 6 }
            };

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 5), 'Correct scaled date at 0');
            t.is(model.getDateFromPosition(70), new Date(2019, 1, 6), 'Correct scaled date at 70');
            t.is(model.getDateFromPosition(280), new Date(2019, 1, 12), 'Correct scaled date at 280');
            t.is(model.getDateFromPosition(350), new Date(2019, 1, 13), 'Correct scaled date at 320');
        });

        t.it('Exclude thu, fri, sat', t => {
            timeAxis.include = null;

            model.update(560); // 4 & 7

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 3), 'Correct date at 0');
            t.is(model.getDateFromPosition(40), new Date(2019, 1, 4), 'Correct date at 40');
            t.is(model.getDateFromPosition(280), new Date(2019, 1, 10), 'Correct date at 280');

            timeAxis.include = {
                day : { from : 0, to : 4 }
            };

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 3), 'Correct date at 0');
            t.is(model.getDateFromPosition(70), new Date(2019, 1, 4), 'Correct date at 70');

            t.is(model.getDateFromPosition(280), new Date(2019, 1, 10), 'Correct scaled date at 280');
            t.is(model.getDateFromPosition(350), new Date(2019, 1, 11), 'Correct scaled date at 350');
        });
    });

    t.it('getDateFromPosition with excluded hours', t => {
        const viewPreset = 'weekAndMonth';

        const timeAxis = new TimeAxis({
            startDate    : new Date(2019, 1, 3),
            endDate      : new Date(2019, 1, 10),
            viewPreset,
            weekStartDay : 0
        });

        const model = new TimeAxisViewModel({
            timeAxis,
            viewPreset
        });

        t.it('8 -> 17', t => {
            model.update(350); // Dividable by both 7 and 5

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 3), 'Correct date at 0');      // Su
            t.is(model.getDateFromPosition(50), new Date(2019, 1, 4), 'Correct date at 50');    // Mo
            t.is(model.getDateFromPosition(100), new Date(2019, 1, 5), 'Correct date at 100');  // Tu
            t.is(model.getDateFromPosition(150), new Date(2019, 1, 6), 'Correct date at 150');  // We
            t.is(model.getDateFromPosition(200), new Date(2019, 1, 7), 'Correct date at 200');  // Th
            t.is(model.getDateFromPosition(250), new Date(2019, 1, 8), 'Correct date at 250');  // Fr
            t.is(model.getDateFromPosition(300), new Date(2019, 1, 9), 'Correct date at 300');  // Sa
            t.is(model.getDateFromPosition(350), new Date(2019, 1, 10), 'Correct date at 350'); // Su

            timeAxis.include = {
                hour : { from : 8, to : 17 }
            };

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 3, 8), 'Correct scaled date at 0');
            t.is(model.getDateFromPosition(50), new Date(2019, 1, 4, 8), 'Correct scaled date at 50');
            t.is(model.getDateFromPosition(75), new Date(2019, 1, 4, 12), 'Correct scaled date at 75');
            t.is(model.getDateFromPosition(100), new Date(2019, 1, 5, 8), 'Correct scaled date at 100');
        });

        t.it('10 -> 16', t => {
            model.update(350); // Dividable by both 7 and 5

            timeAxis.include = {
                hour : { from : 10, to : 16 }
            };

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 3, 10), 'Correct scaled date at 0');
            t.is(model.getDateFromPosition(50), new Date(2019, 1, 4, 10), 'Correct scaled date at 50');
            t.is(model.getDateFromPosition(75), new Date(2019, 1, 4, 12, 30), 'Correct scaled date at 75');
            t.is(model.getDateFromPosition(100), new Date(2019, 1, 5, 10), 'Correct scaled date at 100');
        });
    });

    t.it('getDateFromPosition with excluded days and hours', t => {
        const viewPreset = 'weekAndMonth';

        const timeAxis = new TimeAxis({
            startDate    : new Date(2019, 1, 3),
            endDate      : new Date(2019, 1, 10),
            viewPreset,
            weekStartDay : 0
        });

        const model = new TimeAxisViewModel({
            timeAxis,
            viewPreset
        });

        t.it('Mo -> Fr, 8 -> 17', t => {
            model.update(350);

            timeAxis.include = {
                day  : { from : 1, to : 6 },
                hour : { from : 8, to : 17 }
            };

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 4, 8), 'Correct scaled date at 0');
            t.is(model.getDateFromPosition(35), new Date(2019, 1, 4, 12), 'Correct scaled date at 35');
            t.is(model.getDateFromPosition(70), new Date(2019, 1, 5, 8), 'Correct scaled date at 50');
        });

        t.it('Mo -> Th, 9 -> 17', t => {
            model.update(400);

            timeAxis.include = {
                day  : { from : 1, to : 5 },
                hour : { from : 9, to : 17 }
            };

            t.is(model.getDateFromPosition(0), new Date(2019, 1, 4, 9), 'Correct scaled date at 0');
            t.is(model.getDateFromPosition(50), new Date(2019, 1, 4, 12, 30), 'Correct scaled date at 35');
            t.is(model.getDateFromPosition(100), new Date(2019, 1, 5, 9), 'Correct scaled date at 100');
            t.is(model.getDateFromPosition(150), new Date(2019, 1, 5, 12, 30), 'Correct scaled date at 75');
            t.is(model.getDateFromPosition(200), new Date(2019, 1, 6, 9), 'Correct scaled date at 200');
        });
    });

    t.it('Should respect increment value on middle header row using same unit as bottom row', t => {
        PresetManager.registerPreset('dayNightShift', {
            tickWidth         : 35,
            rowHeight         : 32,
            displayDateFormat : 'HH:mm',
            shiftIncrement    : 1,
            shiftUnit         : 'day',
            timeResolution    : {
                unit      : 'minute',
                increment : 15
            },
            defaultSpan : 24,
            headers     : [
                {
                    unit      : 'hour',
                    increment : 12
                },
                {
                    unit       : 'hour',
                    increment  : 1,
                    dateFormat : 'H'
                }
            ]
        });

        const viewPreset = 'dayNightShift';

        const timeAxis = new TimeAxis({
            startDate    : new Date(2019, 1, 3),
            endDate      : new Date(2019, 1, 4),
            viewPreset,
            weekStartDay : 0
        });

        const model = new TimeAxisViewModel({
            timeAxis,
            viewPreset
        });

        let count = 0;

        model.forEachInterval(0, (startDate, endDate, index) => {
            count++;

            if (index === 0) {
                t.is(startDate, new Date(2019, 1, 3));
                t.is(endDate, new Date(2019, 1, 3, 12));
            }
            else {
                t.is(startDate, new Date(2019, 1, 3, 12));
                t.is(endDate, new Date(2019, 1, 4));
            }
        });

        t.is(count, 2, '2 middle row ticks');
    });

    t.it('getDateFromPosition with long month bases axis', t => {
        const viewPreset = {
            timeResolution : {
                unit      : 'month',
                increment : 1
            },
            tickWidth : 100,
            headers   : [
                {
                    unit       : 'month',
                    dateFormat : 'MMM YYYY'
                }
            ]
        };

        const timeAxis = new TimeAxis({
            startDate    : new Date(2012, 0, 1),
            endDate      : new Date(2020, 0, 1),
            viewPreset,
            weekStartDay : 0
        });

        const model = new TimeAxisViewModel({
            timeAxis,
            viewPreset
        });

        timeAxis.forEach((tick, i) => {
            // 99 = 2012-01-01, 199 = 2012-02-01 and so on
            const
                x = 99 + i * 100,
                got = model.getDateFromPosition(x, 'floor'),
                expected = DateHelper.add(new Date(2012, 0, 1), i, 'months');

            t.is(got, expected, 'Correct date for ' + x);
        });
    });

    t.it('Should correctly create time axis when we render a single day from month (month and year)', t => {
        const viewPreset = 'monthAndYear';

        const timeAxis = new TimeAxis({
            startDate    : new Date(2021, 7, 31),
            endDate      : new Date(2021, 9, 2),
            autoAdjust   : false,
            viewPreset,
            weekStartDay : 0
        });

        const model = new TimeAxisViewModel({
            timeAxis,
            viewPreset
        });

        const { tickSize } = model;

        t.it('Start on long month, end on long month', t => {
            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 30,
                1,
                'First tick width is approximately 1/30 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 30,
                1,
                'Last tick width is approximately 1/30 of full tick size'
            );

            timeAxis.setTimeSpan(new Date(2021, 7, 30), new Date(2021, 9, 3));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 30 * 2,
                1,
                'First tick width is approximately 2/30 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 30 * 2,
                1,
                'Last tick width is approximately 2/30 of full tick size'
            );
        });

        t.it('Start on long month, end on regular', t => {
            timeAxis.setTimeSpan(new Date(2021, 7, 31), new Date(2021, 10, 2));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 30,
                1,
                'First tick width is approximately 1/30 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 30,
                1,
                'Last tick width is approximately 1/30 of full tick size'
            );

            timeAxis.setTimeSpan(new Date(2021, 7, 30), new Date(2021, 10, 3));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 30 * 2,
                1,
                'First tick width is approximately 2/30 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 30 * 2,
                1,
                'Last tick width is approximately 2/30 of full tick size'
            );
        });

        t.it('Start on regular month, end on long', t => {
            timeAxis.setTimeSpan(new Date(2021, 8, 30), new Date(2021, 11, 2));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 30,
                1,
                'First tick width is approximately 1/30 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 30,
                1,
                'Last tick width is approximately 1/30 of full tick size'
            );

            timeAxis.setTimeSpan(new Date(2021, 8, 29), new Date(2021, 11, 3));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 30 * 2,
                1,
                'First tick width is approximately 2/30 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 30 * 2,
                1,
                'Last tick width is approximately 2/30 of full tick size'
            );
        });

        t.it('Start on short month, end on short month', t => {
            timeAxis.setTimeSpan(new Date(2021, 8, 30), new Date(2021, 10, 2));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 30,
                1,
                'First tick width is approximately 1/30 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 30,
                1,
                'Last tick width is approximately 1/30 of full tick size'
            );

            timeAxis.setTimeSpan(new Date(2021, 8, 29), new Date(2021, 10, 3));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 30 * 2,
                1,
                'First tick width is approximately 2/30 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 30 * 2,
                1,
                'Last tick width is approximately 2/30 of full tick size'
            );
        });
    });

    t.it('Should correctly create time axis when we render a single day from leap year (day and year)', t => {
        PresetManager.registerPreset('dayAndYear', {
            name              : 'Years',
            tickWidth         : 365 * 3,
            displayDateFormat : 'll',
            shiftUnit         : 'year',
            shiftIncrement    : 1,
            defaultSpan       : 1,
            timeResolution    : {
                unit      : 'day',
                increment : 1
            },
            headers : [
                {
                    unit       : 'year',
                    dateFormat : 'YYYY'
                }
            ]
        });

        const viewPreset = 'dayAndYear';

        const timeAxis = new TimeAxis({
            // leap year
            startDate    : new Date(2020, 11, 31),
            endDate      : new Date(2024, 0, 2),
            autoAdjust   : false,
            viewPreset,
            weekStartDay : 0
        });

        const model = new TimeAxisViewModel({
            timeAxis,
            viewPreset
        });

        const { tickSize } = model;

        t.it('Start/end on leap year', t => {
            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 365,
                1,
                'First tick width is approximately 1/365 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 365,
                1,
                'Last tick width is approximately 1/365 of full tick size'
            );

            timeAxis.setTimeSpan(new Date(2020, 11, 30), new Date(2024, 0, 3));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 365 * 2,
                1,
                'First tick width is approximately 2/365 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 365 * 2,
                1,
                'Last tick width is approximately 2/365 of full tick size'
            );
        });

        t.it('Start on leap year, end on regular', t => {
            timeAxis.setTimeSpan(new Date(2020, 11, 31), new Date(2022, 0, 2));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 365,
                1,
                'First tick width is approximately 1/365 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 365,
                1,
                'Last tick width is approximately 1/365 of full tick size'
            );

            timeAxis.setTimeSpan(new Date(2020, 11, 30), new Date(2022, 0, 3));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 365 * 2,
                1,
                'First tick width is approximately 2/365 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 365 * 2,
                1,
                'Last tick width is approximately 2/365 of full tick size'
            );
        });

        t.it('Start on regular year, end on leap', t => {
            timeAxis.setTimeSpan(new Date(2021, 11, 31), new Date(2024, 0, 2));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 365,
                1,
                'First tick width is approximately 1/365 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 365,
                1,
                'Last tick width is approximately 1/365 of full tick size'
            );

            timeAxis.setTimeSpan(new Date(2021, 11, 30), new Date(2024, 0, 3));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 365 * 2,
                1,
                'First tick width is approximately 2/365 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 365 * 2,
                1,
                'Last tick width is approximately 2/365 of full tick size'
            );
        });

        t.it('Start/end on non-leap year', t => {
            timeAxis.setTimeSpan(new Date(2021, 11, 31), new Date(2023, 0, 2));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 365,
                1,
                'First tick width is approximately 1/365 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 365,
                1,
                'Last tick width is approximately 1/365 of full tick size'
            );

            timeAxis.setTimeSpan(new Date(2021, 11, 30), new Date(2023, 0, 3));

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate),
                tickSize / 365 * 2,
                1,
                'First tick width is approximately 2/365 of full tick size'
            );

            t.isApprox(
                model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate),
                tickSize / 365 * 2,
                1,
                'Last tick width is approximately 2/365 of full tick size'
            );
        });
    });
});
