import { TimeAxis, DateHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    t.it('timeSpanInAxis works ok', function(t) {
        const ta = new TimeAxis({
            continuous : false
        });

        ta.reconfigure({
            unit      : 'day',
            startDate : new Date(2012, 2, 25),
            endDate   : new Date(2012, 2, 26)
        });

        t.ok(ta.timeSpanInAxis(new Date(2012, 2, 25), new Date(2012, 2, 26)), 'Time span matching time axis start end should be "in axis"');
        t.ok(ta.timeSpanInAxis(new Date(2012, 2, 24), new Date(2012, 2, 26)), 'Time span starting before time axis start should be "in axis"');
        t.ok(ta.timeSpanInAxis(new Date(2012, 2, 25), new Date(2012, 2, 27)), 'Time span ending after time axis end should be "in axis"');
        t.ok(ta.timeSpanInAxis(new Date(2012, 2, 24), new Date(2012, 2, 27)), 'Time span starting before and ending after time axis end should be "in axis"');
    });

    t.it('timeSpanInAxis works ok for generated ticks', function(t) {
        const startHour = 8,
            endHour   = 17;

        class TestTimeAxis extends TimeAxis {
            generateTicks(start, end, unit, increment) {
                const ticks = [];
                while (start < end) {
                    if (start.getHours() >= startHour && start.getHours() <= endHour) {
                        ticks.push({
                            startDate : start,
                            endDate   : DateHelper.add(start, 1, 'hour')
                        });
                    }
                    start = DateHelper.add(start, 1, 'hour');
                }
                return ticks;
            }
        }

        let startDate = new Date(2010, 0, 1),
            endDate   = new Date(2010, 0, 3);
        const ta = new TestTimeAxis({
            continuous : false,
            startDate,
            endDate
        });

        while (startDate < endDate) {
            if (startDate.getHours() >= startHour && startDate.getHours() <= endHour) {
                t.ok(ta.dateInAxis(startDate), 'Date in axis: ' + startDate);
            }
            else {
                t.notOk(ta.dateInAxis(startDate), 'Date not in axis:' + startDate);
            }
            startDate = DateHelper.add(startDate, 1, 'hour');
        }
    });
});
