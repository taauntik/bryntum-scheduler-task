import { TimeAxis, DateHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    function getTimeAxis(config, t) {
        const ta = new TimeAxis();

        if (!config.startDate) {
            config.startDate = new Date(2012, 2, 25);
            config.endDate = new Date(2012, 2, 26);
        }

        ta.reconfigure(Object.assign({
            unit                : 'hour',
            increment           : 6,
            resolutionUnit      : 'hour',
            resolutionIncrement : 1,
            weekStartDay        : 1,
            mainUnit            : 'hour',
            shiftUnit           : 'hour',
            shiftIncrement      : 6,
            defaultSpan         : 1
        }, config || {}));

        if (ta.autoAdjust) {
            t.is(ta.visibleTickStart, 0, '`visibleTickStart` should be always 0 for `autoAdjust` case');
            t.is(ta.visibleTickEnd, ta.originalCount, '`visibleTickEnd` should be always a ticks number for `autoAdjust` case');
        }
        else {
            t.isGE(ta.visibleTickStart, 0, '`visibleTickStart` should be always >= 0 for not `autoAdjust` case');
            t.isLess(ta.visibleTickStart, 1, '`visibleTickStart` should be always < 1 for not `autoAdjust` case');

            t.isLE(ta.visibleTickEnd, ta.originalCount, '`visibleTickEnd` should be always <= ticks count for not `autoAdjust` case');
            t.isGreater(ta.visibleTickEnd, ta.originalCount - 1, '`visibleTickEnd` should be always > ticks count - 1 for not `autoAdjust` case');
        }

        return ta;
    }

    t.it('Basics', t => {
        let ta = new TimeAxis();
        t.is(ta.startDate, null, 'Ok to ask for start date on a non configured axis');
        t.is(ta.endDate, null, 'Ok to ask for end date on a non configured axis');

        ta = getTimeAxis({}, t);
        ta.resolution = { unit : 'minute', increment : 11 };
        t.isDeeply(ta.resolution, { unit : 'minute', increment : 11 }, 'resolution set/get');

        t.is(ta.unit, 'hour', 'unit');
        t.is(ta.increment, 6, 'increment');

        t.notOk(ta.dateInAxis(new Date(2008, 1, 1)), 'Earlier date not on axis');
        t.notOk(ta.dateInAxis(new Date(2008, 1, 1)), 'Earlier date not on axis');
        t.ok(ta.dateInAxis(new Date(2012, 2, 25)), 'Start date on axis');
        t.ok(ta.dateInAxis(new Date(2012, 2, 25, 23, 59)), 'Right before end date on axis');
        t.notOk(ta.dateInAxis(new Date(2012, 2, 26)), 'End date not on axis');

        t.ok(ta.timeSpanInAxis(new Date(2012, 2, 25), new Date(2012, 2, 26)), 'Timespan start -> end on axis');
        t.ok(ta.timeSpanInAxis(new Date(2012, 2, 24), new Date(2012, 2, 26)), 'Timespan < start -> end on axis');
        t.ok(ta.timeSpanInAxis(new Date(2012, 2, 25), new Date(2012, 2, 27)), 'Timespan > start -> > end on axis');
        t.notOk(ta.timeSpanInAxis(new Date(2011, 2, 25), new Date(2011, 2, 26)), 'Timespan < start -> < start not on axis');
    });

    t.it('Shifting', t => {
        const ta = getTimeAxis({
            startDate : new Date(2012, 1, 25),
            endDate   : new Date(2012, 1, 26)
        }, t);

        ta.shift(6, 'hours');
        t.is(ta.startDate, new Date(2012, 1, 25, 6));
        t.is(ta.endDate, new Date(2012, 1, 26, 6));

        ta.shiftNext();
        t.is(ta.startDate, new Date(2012, 1, 25, 12));
        t.is(ta.endDate, new Date(2012, 1, 26, 12));

        ta.shiftNext(6);
        t.is(ta.startDate, new Date(2012, 1, 25, 18));
        t.is(ta.endDate, new Date(2012, 1, 26, 18));

        ta.shiftPrevious(12);
        t.is(ta.startDate, new Date(2012, 1, 25, 6));
        t.is(ta.endDate, new Date(2012, 1, 26, 6));

        ta.shiftPrevious();
        t.is(ta.startDate, new Date(2012, 1, 25, 0));
        t.is(ta.endDate, new Date(2012, 1, 26));
    });

    // Testing filtering
    t.it('Filtering', t => {
        const ta = getTimeAxis({}, t);

        ta.filterBy(tick => tick.startDate.getHours() === 0);

        t.is(ta.count, 1, '1 item in time axis after filtering');
        t.is(ta.first.startDate, new Date(2012, 2, 25), 'Correct start of filtered tick');
        t.notOk(ta.isContinuous, 'No longer a continuous time axis');

        ta.clearFilters();

        t.firesOnce(ta, 'invalidFilter');
        ta.filterBy(() => false);
    });

    t.it('Prevent reconfigure', t => {
        const ta = getTimeAxis({}, t);

        t.willFireNTimes(ta, 'reconfigure', 1);

        const fn = () => false;

        ta.on({
            beforereconfigure : fn
        });

        ta.setTimeSpan(new Date(2011, 1, 1), new Date(2011, 5, 5));

        t.is(ta.startDate, new Date(2012, 2, 25), 'Returned false from beforereconfigure handler, preventing actual reconfigure');

        ta.un({
            beforereconfigure : fn
        });

        t.isFiredWithSignature(ta, 'beforereconfigure', ({ source, startDate, endDate }) => source === ta &&
            startDate - new Date(2012, 1, 1) === 0 &&
            endDate - new Date(2012, 1, 5) === 0);

        ta.setTimeSpan(new Date(2012, 1, 1), new Date(2012, 1, 5));
    });

    t.it('roundDate', t => {
        t.it('SECOND', t => {
            const ta = getTimeAxis({
                unit                : 'minute',
                increment           : 30,
                resolutionUnit      : 'second',
                resolutionIncrement : 30,
                mainUnit            : 'minute',
                startDate           : new Date(2012, 1, 1, 1),
                endDate             : new Date(2012, 1, 2)
            }, t);

            t.expect(ta.roundDate(new Date(2012, 1, 1, 1, 1, 59), new Date(2012, 1, 1, 1, 1, 49))).toEqual(new Date(2012, 1, 1, 1, 1, 49));
            t.expect(ta.roundDate(new Date(2012, 1, 1, 1, 2, 20), new Date(2012, 1, 1, 1, 1, 49))).toEqual(new Date(2012, 1, 1, 1, 2, 19));
        });

        t.it('MINUTE', t => {
            const ta = getTimeAxis({
                unit                : 'minute',
                increment           : 30,
                resolutionUnit      : 'minute',
                resolutionIncrement : 10,
                mainUnit            : 'minute',
                startDate           : new Date(2012, 1, 1, 1),
                endDate             : new Date(2012, 1, 2)
            }, t);

            t.expect(ta.roundDate(new Date(2012, 1, 1, 1, 20), new Date(2012, 1, 1, 1, 18))).toEqual(new Date(2012, 1, 1, 1, 18));
            t.expect(ta.roundDate(new Date(2012, 1, 1, 1, 25), new Date(2012, 1, 1, 1, 18))).toEqual(new Date(2012, 1, 1, 1, 28));
        });

        t.it('HOUR', t => {
            const ta = getTimeAxis({
                unit                : 'day',
                increment           : 2,
                resolutionUnit      : 'hour',
                resolutionIncrement : 2,
                mainUnit            : 'day',
                startDate           : new Date(2012, 1, 1, 1),
                endDate             : new Date(2012, 1, 20)
            }, t);

            t.expect(ta.roundDate(new Date(2012, 1, 1, 12), new Date(2012, 1, 1, 10))).toEqual(new Date(2012, 1, 1, 12));
            t.expect(ta.roundDate(new Date(2012, 1, 1, 13), new Date(2012, 1, 1, 10))).toEqual(new Date(2012, 1, 1, 14));
        });

        t.it('DAY', t => {
            const ta = getTimeAxis({
                unit                : 'month',
                increment           : 4,
                resolutionUnit      : 'day',
                resolutionIncrement : 4,
                mainUnit            : 'day',
                startDate           : new Date(2012, 1, 1, 1),
                endDate             : new Date(2012, 11, 20)
            }, t);

            t.expect(ta.roundDate(new Date(2012, 1, 10), new Date(2012, 1, 7))).toEqual(new Date(2012, 1, 11));
            t.expect(ta.roundDate(new Date(2012, 1, 8), new Date(2012, 1, 7))).toEqual(new Date(2012, 1, 7));
        });

        t.it('MONTH', t => {
            const ta = getTimeAxis({
                unit                : 'year',
                increment           : 2,
                resolutionUnit      : 'month',
                resolutionIncrement : 4,
                mainUnit            : 'month',
                startDate           : new Date(2012, 1, 1, 1),
                endDate             : new Date(2012, 11, 20)
            }, t);

            t.expect(ta.roundDate(new Date(2012, 2, 10), new Date(2012, 1, 7))).toEqual(new Date(2012, 1, 7));
            t.expect(ta.roundDate(new Date(2012, 3, 8), new Date(2012, 1, 7))).toEqual(new Date(2012, 5, 7));
        });

        t.it('MONTH2', t => {
            const ta = getTimeAxis({
                unit                : 'year',
                increment           : 1,
                resolutionUnit      : 'month',
                resolutionIncrement : 1,
                mainUnit            : 'month',
                startDate           : new Date(2012, 1, 1, 1),
                endDate             : new Date(2020, 11, 20)
            }, t);

            t.expect(ta.roundDate(new Date(2020, 11, 5), new Date(2012, 1, 1))).toEqual(new Date(2020, 11, 1));
        });

        t.it('YEAR', t => {
            const ta = getTimeAxis({
                unit                : 'year',
                increment           : 4,
                resolutionUnit      : 'year',
                resolutionIncrement : 2,
                mainUnit            : 'year',
                startDate           : new Date(2010, 1, 1, 1),
                endDate             : new Date(2024, 11, 20)
            }, t);

            t.expect(ta.roundDate(new Date(2012, 2), new Date(2011, 5))).toEqual(new Date(2011, 5));
            t.expect(ta.roundDate(new Date(2013, 3), new Date(2011, 5))).toEqual(new Date(2013, 5));
        });
    });

    t.it('floorDate', t => {
        t.it('SECOND', t => {
            const ta = getTimeAxis({
                unit                : 'minute',
                increment           : 30,
                resolutionUnit      : 'minute',
                resolutionIncrement : 30,
                mainUnit            : 'minute',
                startDate           : new Date(2012, 1, 1, 1),
                endDate             : new Date(2012, 1, 2)
            }, t);

            // the actual unit/resolution unit of the time axis does not matter for `relativeToStart = false`
            t.expect(ta.floorDate(new Date(2012, 1, 1, 1, 1, 59), false, 'second', 30)).toEqual(new Date(2012, 1, 1, 1, 1, 30));
            t.expect(ta.floorDate(new Date(2012, 1, 1, 2, 1, 1), false, 'second', 30)).toEqual(new Date(2012, 1, 1, 2, 1, 0));
        });

        t.it('MINUTE', t => {
            const ta = getTimeAxis({
                unit                : 'minute',
                increment           : 30,
                resolutionUnit      : 'minute',
                resolutionIncrement : 30,
                mainUnit            : 'minute',
                startDate           : new Date(2012, 1, 1, 1),
                endDate             : new Date(2012, 1, 2)
            }, t);

            t.expect(ta.floorDate(new Date(2012, 1, 1, 1, 29, 10), false, 'minute')).toEqual(new Date(2012, 1, 1, 1, 0));
            t.expect(ta.floorDate(new Date(2012, 1, 1, 1, 59, 10), false, 'minute')).toEqual(new Date(2012, 1, 1, 1, 30));

            t.expect(ta.floorDate(new Date(2012, 1, 1, 1, 59), true, 'minute')).toEqual(new Date(2012, 1, 1, 1, 30));
            t.expect(ta.floorDate(new Date(2012, 1, 1, 2, 1), true, 'minute')).toEqual(new Date(2012, 1, 1, 2, 0));

            // the actual unit/resolution unit of the time axis does not matter for `relativeToStart = false`
            t.expect(ta.floorDate(new Date(2012, 1, 1, 1, 59), false, 'minute', 30)).toEqual(new Date(2012, 1, 1, 1, 30));
            t.expect(ta.floorDate(new Date(2012, 1, 1, 2, 1), false, 'minute', 30)).toEqual(new Date(2012, 1, 1, 2, 0));
        });

        t.it('HOUR', t => {
            const ta = getTimeAxis({
                unit                : 'hour',
                increment           : 2,
                resolutionUnit      : 'hour',
                resolutionIncrement : 2,
                mainUnit            : 'hour',
                startDate           : new Date(2012, 1, 1),
                endDate             : new Date(2012, 1, 2)
            }, t);

            t.expect(ta.floorDate(new Date(2012, 1, 1, 1), false, 'hour', 1)).toEqual(new Date(2012, 1, 1, 1));
            t.expect(ta.floorDate(new Date(2012, 1, 1, 1), false, 'hour', 2)).toEqual(new Date(2012, 1, 1, 0));
            t.expect(ta.floorDate(new Date(2012, 1, 1, 1, 59), false, 'hour', 1)).toEqual(new Date(2012, 1, 1, 1));
            t.expect(ta.floorDate(new Date(2012, 1, 1, 1, 59), false, 'hour', 2)).toEqual(new Date(2012, 1, 1, 0));
            t.expect(ta.floorDate(new Date(2012, 1, 1, 2, 59), false, 'hour')).toEqual(new Date(2012, 1, 1, 2));
            t.expect(ta.floorDate(new Date(2012, 1, 1, 3, 59), true, 'hour')).toEqual(new Date(2012, 1, 1, 2));
        });

        t.it('DAY', t => {
            const ta = getTimeAxis({
                unit                : 'day',
                increment           : 2,
                resolutionUnit      : 'hour',
                resolutionIncrement : 2,
                mainUnit            : 'day',
                startDate           : new Date(2012, 1, 1),
                endDate             : new Date(2012, 1, 6)
            }, t);

            t.expect(ta.floorDate(new Date(2012, 1, 1, 1, 1, 1), false, 'day')).toEqual(new Date(2012, 1, 1, 0));
            t.expect(ta.floorDate(new Date(2012, 1, 5, 1, 1, 1), false, 'day', 3)).toEqual(new Date(2012, 1, 4, 0));
            t.expect(ta.floorDate(new Date(2012, 1, 4, 1, 1, 1), false, 'day', 3)).toEqual(new Date(2012, 1, 4, 0));
            t.expect(ta.floorDate(new Date(2012, 1, 3, 1, 1, 1), false, 'day', 3)).toEqual(new Date(2012, 1, 1, 0));

            t.expect(ta.floorDate(new Date(2012, 1, 3, 18), true, 'day')).toEqual(new Date(2012, 1, 3));
            t.expect(ta.floorDate(new Date(2012, 1, 4, 18), true, 'day')).toEqual(new Date(2012, 1, 3));
            t.expect(ta.floorDate(new Date(2012, 1, 3, 19), true, 'hour')).toEqual(new Date(2012, 1, 3, 18));
        });

        t.it('WEEK starting Monday', t => {
            const ta = getTimeAxis({
                unit                : 'week',
                weekStartDay        : 1,
                increment           : 1,
                resolutionUnit      : 'day',
                resolutionIncrement : 1,
                mainUnit            : 'week',
                startDate           : new Date(2014, 3, 1)
            }, t);

            t.expect(ta.floorDate(new Date(2014, 3, 1), false)).toEqual(new Date(2014, 2, 31));
            t.expect(ta.floorDate(new Date(2014, 3, 2), false)).toEqual(new Date(2014, 2, 31));
            t.expect(ta.floorDate(new Date(2014, 3, 3), false)).toEqual(new Date(2014, 2, 31));
            t.expect(ta.floorDate(new Date(2014, 3, 4), false)).toEqual(new Date(2014, 2, 31));
            t.expect(ta.floorDate(new Date(2014, 3, 5), false)).toEqual(new Date(2014, 2, 31));
            t.expect(ta.floorDate(new Date(2014, 3, 6), false)).toEqual(new Date(2014, 2, 31));
            t.expect(ta.floorDate(new Date(2014, 3, 7), false)).toEqual(new Date(2014, 3, 7));
        });

        t.it('WEEK starting Tuesday', t => {
            const ta = getTimeAxis({
                unit                : 'week',
                weekStartDay        : 2,
                increment           : 1,
                resolutionUnit      : 'day',
                resolutionIncrement : 1,
                mainUnit            : 'week',
                startDate           : new Date(2014, 3, 1)
            }, t);

            t.expect(ta.floorDate(new Date(2014, 3, 1), false)).toEqual(new Date(2014, 3, 1));
            t.expect(ta.floorDate(new Date(2014, 3, 2), false)).toEqual(new Date(2014, 3, 1));
            t.expect(ta.floorDate(new Date(2014, 3, 3), false)).toEqual(new Date(2014, 3, 1));
            t.expect(ta.floorDate(new Date(2014, 3, 4), false)).toEqual(new Date(2014, 3, 1));
            t.expect(ta.floorDate(new Date(2014, 3, 5), false)).toEqual(new Date(2014, 3, 1));
            t.expect(ta.floorDate(new Date(2014, 3, 6), false)).toEqual(new Date(2014, 3, 1));
            t.expect(ta.floorDate(new Date(2014, 3, 7), false)).toEqual(new Date(2014, 3, 1));
        });

        t.it('WEEK starting Wednesday', t => {
            const ta = getTimeAxis({
                unit                : 'week',
                weekStartDay        : 3,
                increment           : 1,
                resolutionUnit      : 'day',
                resolutionIncrement : 1,
                mainUnit            : 'week',
                startDate           : new Date(2014, 3, 1)
            }, t);

            t.expect(ta.floorDate(new Date(2014, 3, 1), false)).toEqual(new Date(2014, 2, 26));
            t.expect(ta.floorDate(new Date(2014, 3, 2), false)).toEqual(new Date(2014, 3, 2));
            t.expect(ta.floorDate(new Date(2014, 3, 3), false)).toEqual(new Date(2014, 3, 2));
            t.expect(ta.floorDate(new Date(2014, 3, 4), false)).toEqual(new Date(2014, 3, 2));
            t.expect(ta.floorDate(new Date(2014, 3, 5), false)).toEqual(new Date(2014, 3, 2));
            t.expect(ta.floorDate(new Date(2014, 3, 6), false)).toEqual(new Date(2014, 3, 2));
            t.expect(ta.floorDate(new Date(2014, 3, 7), false)).toEqual(new Date(2014, 3, 2));
        });

        t.it('WEEK starting Thursday', t => {
            const ta = getTimeAxis({
                unit                : 'week',
                weekStartDay        : 4,
                increment           : 1,
                resolutionUnit      : 'day',
                resolutionIncrement : 1,
                mainUnit            : 'week',
                startDate           : new Date(2014, 3, 1)
            }, t);

            t.expect(ta.floorDate(new Date(2014, 3, 1), false)).toEqual(new Date(2014, 2, 27));
            t.expect(ta.floorDate(new Date(2014, 3, 2), false)).toEqual(new Date(2014, 2, 27));
            t.expect(ta.floorDate(new Date(2014, 3, 3), false)).toEqual(new Date(2014, 3, 3));
            t.expect(ta.floorDate(new Date(2014, 3, 4), false)).toEqual(new Date(2014, 3, 3));
            t.expect(ta.floorDate(new Date(2014, 3, 5), false)).toEqual(new Date(2014, 3, 3));
            t.expect(ta.floorDate(new Date(2014, 3, 6), false)).toEqual(new Date(2014, 3, 3));
            t.expect(ta.floorDate(new Date(2014, 3, 7), false)).toEqual(new Date(2014, 3, 3));
        });

        t.it('WEEK starting Friday', t => {
            const ta = getTimeAxis({
                unit                : 'week',
                weekStartDay        : 5,
                increment           : 1,
                resolutionUnit      : 'day',
                resolutionIncrement : 1,
                mainUnit            : 'week',
                startDate           : new Date(2014, 3, 1)
            }, t);

            t.expect(ta.floorDate(new Date(2014, 3, 1), false)).toEqual(new Date(2014, 2, 28));
            t.expect(ta.floorDate(new Date(2014, 3, 2), false)).toEqual(new Date(2014, 2, 28));
            t.expect(ta.floorDate(new Date(2014, 3, 3), false)).toEqual(new Date(2014, 2, 28));
            t.expect(ta.floorDate(new Date(2014, 3, 4), false)).toEqual(new Date(2014, 3, 4));
            t.expect(ta.floorDate(new Date(2014, 3, 5), false)).toEqual(new Date(2014, 3, 4));
            t.expect(ta.floorDate(new Date(2014, 3, 6), false)).toEqual(new Date(2014, 3, 4));
            t.expect(ta.floorDate(new Date(2014, 3, 7), false)).toEqual(new Date(2014, 3, 4));
        });

        t.it('WEEK starting Saturday', t => {
            const ta = getTimeAxis({
                unit                : 'week',
                weekStartDay        : 6,
                increment           : 1,
                resolutionUnit      : 'day',
                resolutionIncrement : 1,
                mainUnit            : 'week',
                startDate           : new Date(2014, 3, 1)
            }, t);

            t.expect(ta.floorDate(new Date(2014, 3, 1), false)).toEqual(new Date(2014, 2, 29));
            t.expect(ta.floorDate(new Date(2014, 3, 2), false)).toEqual(new Date(2014, 2, 29));
            t.expect(ta.floorDate(new Date(2014, 3, 3), false)).toEqual(new Date(2014, 2, 29));
            t.expect(ta.floorDate(new Date(2014, 3, 4), false)).toEqual(new Date(2014, 2, 29));
            t.expect(ta.floorDate(new Date(2014, 3, 5), false)).toEqual(new Date(2014, 3, 5));
            t.expect(ta.floorDate(new Date(2014, 3, 6), false)).toEqual(new Date(2014, 3, 5));
            t.expect(ta.floorDate(new Date(2014, 3, 7), false)).toEqual(new Date(2014, 3, 5));
        });

        t.it('WEEK starting Sunday', t => {
            const ta = getTimeAxis({
                unit                : 'week',
                weekStartDay        : 0,
                increment           : 1,
                resolutionUnit      : 'day',
                resolutionIncrement : 1,
                mainUnit            : 'week',
                startDate           : new Date(2014, 3, 1)
            }, t);

            t.expect(ta.floorDate(new Date(2014, 3, 1), false)).toEqual(new Date(2014, 2, 30));
            t.expect(ta.floorDate(new Date(2014, 3, 2), false)).toEqual(new Date(2014, 2, 30));
            t.expect(ta.floorDate(new Date(2014, 3, 3), false)).toEqual(new Date(2014, 2, 30));
            t.expect(ta.floorDate(new Date(2014, 3, 4), false)).toEqual(new Date(2014, 2, 30));
            t.expect(ta.floorDate(new Date(2014, 3, 5), false)).toEqual(new Date(2014, 2, 30));
            t.expect(ta.floorDate(new Date(2014, 3, 6), false)).toEqual(new Date(2014, 3, 6));
            t.expect(ta.floorDate(new Date(2014, 3, 7), false)).toEqual(new Date(2014, 3, 6));
        });

        t.it('YEAR', t => {
            const ta = getTimeAxis({
                unit                : 'year',
                increment           : 5,
                resolutionUnit      : 'hour',
                resolutionIncrement : 2,
                mainUnit            : 'day',
                startDate           : new Date(2012, 1, 1),
                endDate             : new Date(2012, 1, 6)
            }, t);

            t.expect(ta.floorDate(new Date(2012, 1, 1, 1, 1, 1), false, 'year', 5)).toEqual(new Date(2011, 0, 1, 0));
            t.expect(ta.floorDate(new Date(2015, 1, 1, 1, 1, 1), false, 'year', 5)).toEqual(new Date(2011, 0, 1, 0));
            t.expect(ta.floorDate(new Date(2016, 1, 1, 1, 1, 1), false, 'year', 5)).toEqual(new Date(2016, 0, 1, 0));
            t.expect(ta.floorDate(new Date(2020, 1, 1, 1, 1, 1), false, 'year', 5)).toEqual(new Date(2016, 0, 1, 0));
        });
    });

    t.it('Should reconfigure after setTimeSpan called with current span', t => {
        const ta = getTimeAxis({
            unit                : 'hour',
            increment           : 2,
            resolutionUnit      : 'hour',
            resolutionIncrement : 2,
            mainUnit            : 'hour',
            startDate           : new Date(2012, 1, 1),
            endDate             : new Date(2012, 1, 2)
        }, t);

        t.ok(ta.isContinuous, 'Continuous time axis');

        t.it('Should not fire when passed exactly the dates of the timeaxis', t => {
            t.wontFire(ta, 'reconfigure');
            ta.setTimeSpan(ta.startDate, ta.endDate);
        });

        t.it('Should not fire when passed dates that will be floored/ceiled to match those of the timeaxis', t => {
            t.wontFire(ta, 'reconfigure');
            ta.setTimeSpan(ta.startDate, new Date(ta.endDate - 1));
        });
    });

    t.it('getDateFromTick', t => {
        const ta = getTimeAxis({
            unit                : 'hour',
            increment           : 1,
            resolutionUnit      : 'minute',
            resolutionIncrement : 10,
            mainUnit            : 'hour',
            startDate           : new Date(2012, 1, 1),
            endDate             : new Date(2012, 1, 2)
        }, t);

        t.is(ta.getCount(), 24, '24h in a day');

        t.is(ta.getDateFromTick(0), new Date(2012, 1, 1));
        t.is(ta.getDateFromTick(0.5), new Date(2012, 1, 1, 0, 30));

        t.is(ta.getDateFromTick(0.2), new Date(2012, 1, 1, 0, 12));
        t.is(ta.getDateFromTick(0.2, 'round'), new Date(2012, 1, 1, 0, 10));
        t.is(ta.getDateFromTick(0.2, 'floor'), new Date(2012, 1, 1, 0, 10));

        t.is(ta.getDateFromTick(24), new Date(2012, 1, 2));

        t.is(ta.getDateFromTick(25), null);
        t.is(ta.getDateFromTick(-1), null);
    });

    t.it('getTickFromDate', t => {
        const ta = getTimeAxis({
            unit                : 'hour',
            increment           : 1,
            resolutionUnit      : 'minute',
            resolutionIncrement : 10,
            mainUnit            : 'hour',
            startDate           : new Date(2012, 1, 1),
            endDate             : new Date(2012, 1, 2)
        }, t);

        t.is(ta.getTickFromDate(new Date(2012, 1, 1)), 0);
        t.is(ta.getTickFromDate(new Date(2012, 1, 1, 0, 30)), 0.5);

        t.is(ta.getTickFromDate(new Date(2012, 1, 1, 0, 12)), 0.2);
        t.is(ta.getTickFromDate(new Date(2012, 1, 1, 0, 24)), 0.4);
        t.is(ta.getTickFromDate(new Date(2012, 1, 1, 0, 36)), 0.6);

        t.is(ta.getTickFromDate(new Date(2012, 1, 2)), 24);

        t.is(ta.getTickFromDate(new Date(2011, 1, 1)), -1);
        t.is(ta.getTickFromDate(new Date(2013, 1, 1)), -1);
    });

    t.it('getTickFromDate when ticks are not whole (`autoAdjust : false`)', t => {
        const ta = getTimeAxis({
            autoAdjust          : false,
            mainUnit            : 'week',
            unit                : 'week',
            increment           : 1,
            resolutionUnit      : 'day',
            resolutionIncrement : 10,
            startDate           : new Date(2013, 8, 1),
            endDate             : new Date(2014, 2, 1)
        }, t);

        t.is(ta.getTickFromDate(new Date(2013, 8, 0)), -1, 'Point outside of the time axis results in -1');
        t.is(ta.getTickFromDate(new Date(2014, 2, 1, 0, 30)), -1, 'Point outside of the time axis results in -1');

        t.is(ta.getTickFromDate(new Date(2013, 8, 1)), ta.visibleTickStart, 'The tick of the time span start should be equal to `visibleTickStart');

        t.is(ta.getTickFromDate(new Date(2014, 2, 1)), ta.visibleTickEnd, 'The end of the time span start should be equal to `visibleTickEnd');

        t.is(ta.getTickFromDate(new Date(2013, 8, 2)), 1, 'The start of the 2nd (full) tick should be at 1');
        t.is(ta.getDateFromTick(1), new Date(2013, 8, 2), 'The opposite conversion should work');

        t.is(ta.getDateFromTick(ta.visibleTickStart), new Date(2013, 8, 1));
        t.is(ta.getDateFromTick(ta.visibleTickEnd), new Date(2014, 2, 1));
    });

    t.it('Direct and reverse lookups should work correct all along not adjusted time axis', t => {
        const axis = getTimeAxis({
            autoAdjust          : false,
            mainUnit            : 'day',
            unit                : 'hour',
            increment           : 8,
            resolutionUnit      : 'hour',
            resolutionIncrement : 1,
            startDate           : new Date(2013, 8, 1, 7),
            endDate             : new Date(2013, 8, 3, 7)
        }, t);

        let date = new Date(2013, 8, 1, 7),
            tickFromDate;

        for (let i = 1; date < axis.endDate; i++) {
            date = DateHelper.add(date, 1, 'hour');
            tickFromDate = axis.getTickFromDate(date);

            t.is(tickFromDate, 0.125 * i, 'Tick index for date is correct');
            t.is(axis.getDateFromTick(tickFromDate), date, 'Reverse lookup correct');
        }
    });

    t.it('getTickFromDate when ticks are not whole (`autoAdjust : false`) and increment is > 1', t => {
        const ta = getTimeAxis({
            autoAdjust          : false,
            mainUnit            : 'day',
            unit                : 'day',
            increment           : 5,
            resolutionUnit      : 'day',
            resolutionIncrement : 10,
            startDate           : new Date(2014, 0, 1, 12),
            endDate             : new Date(2014, 0, 12)
        }, t);

        t.is(ta.adjustedEnd, new Date(2014, 0, 16), 'Correctly adjusted the end of timeaxis according to increment');

        t.is(ta.getTickFromDate(new Date(2014, 0, 0)), -1, 'Point outside of the time axis results in -1');
        t.is(ta.getTickFromDate(new Date(2014, 0, 12, 0, 30)), -1, 'Point outside of the time axis results in -1');

        t.is(ta.getTickFromDate(new Date(2014, 0, 1, 12)), ta.visibleTickStart, 'The tick of the time span startDate should be equal to `visibleTickStart');
        t.is(ta.getTickFromDate(new Date(2014, 0, 12)), ta.visibleTickEnd, 'The end of the time span startDate should be equal to `visibleTickEnd');

        t.is(ta.getTickFromDate(new Date(2014, 0, 6)), 1, 'The start of the 2nd (full) tick should be at 1');
        t.is(ta.getDateFromTick(1), new Date(2014, 0, 6), 'The opposite conversion should work');

        t.is(ta.getDateFromTick(ta.visibleTickStart), new Date(2014, 0, 1, 12));
        t.is(ta.getDateFromTick(ta.visibleTickEnd), new Date(2014, 0, 12));
    });

    t.it('ticks', t => {
        const ta = getTimeAxis({
            unit                : 'hour',
            increment           : 1,
            resolutionUnit      : 'minute',
            resolutionIncrement : 10,
            mainUnit            : 'hour',
            startDate           : new Date(2012, 1, 1),
            endDate             : new Date(2012, 1, 2)
        }, t);

        const ticks = ta.ticks;

        t.is(ticks.length, 24, 'Correct number of ticks generated');
        t.is(ticks[0].startDate, new Date(2012, 1, 1), 'First tick has correct startDate');
        t.is(ticks[0].endDate, new Date(2012, 1, 1, 1), 'First tick has correct endDate');
    });

    t.it('forEachAuxInterval + autoAdjust : false', t => {
        const ta = getTimeAxis({
            autoAdjust          : false,
            unit                : 'hour',
            increment           : 1,
            resolutionUnit      : 'minute',
            resolutionIncrement : 10,
            mainUnit            : 'hour',
            startDate           : new Date(2012, 1, 1, 15, 15),
            endDate             : new Date(2012, 1, 1, 17, 25)
        }, t);

        const ticks = ta.ticks;

        t.is(ticks[0].startDate, new Date(2012, 1, 1, 15, 15), 'First tick has correct start');
        t.is(ticks[ticks.length - 1].endDate, new Date(2012, 1, 1, 17, 25), 'Last tick has correct end');

        ta.forEachAuxInterval('hour', 1, (start, end, i) => {
            switch (i) {
                case 0 :
                    t.is(start, new Date(2012, 1, 1, 15, 15));
                    t.is(end, new Date(2012, 1, 1, 16));
                    break;
                case 2 :
                    t.is(start, new Date(2012, 1, 1, 17));
                    t.is(end, new Date(2012, 1, 1, 17, 25));
                    break;
            }
        });
    });
});
