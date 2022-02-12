import { TimeAxis } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let timeAxis;

    t.beforeEach(() => timeAxis && timeAxis.destroy());

    t.it('Should not crash on shiftNext()', t => {
        timeAxis = new TimeAxis();

        timeAxis.reconfigure({
            unit      : 'day',
            shiftUnit : 'day',
            startDate : new Date(2019, 2, 17),
            endDate   : new Date(2019, 2, 24)
        });

        timeAxis.filter(tick => tick.startDate.getDay() !== 0 && tick.startDate.getDay() !== 6);

        for (let i = 0; i < 5; i++) {
            timeAxis.shiftNext();

            t.is(timeAxis.count, 5, 'Correct tick count #' + (i + 1));
        }

        for (let i = 5; i < 10; i++) {
            timeAxis.shiftPrevious();

            t.is(timeAxis.count, 5, 'Correct tick count #' + (i + 1));
        }
    });
});
