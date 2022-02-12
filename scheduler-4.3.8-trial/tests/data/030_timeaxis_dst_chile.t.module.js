import { TimeAxis, DateHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    t.diag('Current timezone: ' + new Date().getTimezoneOffset());

    if (DateHelper.isDST(new Date(2012, 9, 15, 0)) || !DateHelper.isDST(new Date(2012, 9, 14, 0))) {
        t.diag("Skipping the test because it's supposed to run in Chile timezone");
        return;
    }

    let ta = new TimeAxis();

    ta.reconfigure({
        unit                : 'day',
        increment           : 1,
        resolutionUnit      : 'hour',
        resolutionIncrement : 1,
        weekStartDay        : 1,
        mainUnit            : 'day',
        shiftUnit           : 'day',
        shiftIncrement      : 1,
        defaultSpan         : 1,

        start : new Date(2012, 9, 14),
        end   : new Date(2012, 9, 15)
    });

    t.pass('Could generate DST crossing timeaxis');
    t.is(ta.getTicks().length, 2, 'Should generate 2 ticks');
});
