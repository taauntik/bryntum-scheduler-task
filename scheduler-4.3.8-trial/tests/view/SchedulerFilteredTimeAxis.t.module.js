import { Scheduler, DateHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    const q = query => document.querySelector(query);

    let scheduler, timeAxis;

    t.beforeEach(t => scheduler && scheduler.destroy());

    // Ported from 2112_filtered_time_axis
    t.it('Basic timeAxis filtering should work', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            startDate  : new Date(2012, 5, 2),
            endDate    : new Date(2012, 5, 11)
        });
        timeAxis = scheduler.timeAxis;

        scheduler.eventStore.add({
            resourceId : scheduler.resourceStore.first.id,
            startDate  : new Date(2012, 5, 5),
            endDate    : new Date(2012, 5, 6),
            cls        : 'b-sch-foo'
        });

        await t.waitForProjectReady();

        t.selectorExists(scheduler.eventSelector + ':not(.b-sch-released) .b-sch-foo', 'Should find event in normal state');

        timeAxis.filterBy(tick => tick.startDate.getDay() === 6 || tick.startDate.getDay() === 0);

        t.selectorNotExists(scheduler.eventSelector + ':not(.b-sch-released) .b-sch-foo', 'Should not find event in filtered state');

        timeAxis.clearFilters();

        t.selectorExists(scheduler.eventSelector + ':not(.b-sch-released) .b-sch-foo', 'Should find event after clearing filter');
    });

    // Ported from 2116_filtered_timeaxis_getdate
    t.it('View should return correct date for coordinate in filtered timeaxis', async t => {
        document.body.style.width = '1000px';

        scheduler = new Scheduler({
            appendTo   : document.body,
            border     : true,
            startDate  : new Date(2011, 1, 14),
            endDate    : new Date(2011, 1, 29),
            viewPreset : 'weekAndDayLetter',
            margin     : '10 0 0 0',
            forceFit   : true,

            columns : [],

            resources : [],
            events    : []
        });

        scheduler.timeAxis.filterBy(tick =>
            tick.startDate.getDay() !== 6 && tick.startDate.getDay() !== 0
        );

        const
            tickSize = scheduler.timeAxisViewModel.tickSize,
            correctDate = new Date(2011, 2, 4);

        // now scheduler has splitter, append 4px to compensate it's width
        t.isDateEqual(scheduler.getDateFromCoordinate(tickSize * 14.1 + 4, 'floor'), correctDate, 'Date in last tick is correct');
        t.isDateEqual(scheduler.getDateFromCoordinate(tickSize * 14.4, 'floor'), correctDate, 'Date in last tick is correct');
        t.isDateEqual(scheduler.getDateFromCoordinate(tickSize * 14.8, 'floor'), correctDate, 'Date in last tick is correct');
    });

    t.it('Should resize headers and events when filtering out ticks', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset            : 'dayAndWeek',
            startDate             : new Date(2011, 0, 3),
            endDate               : new Date(2011, 0, 10),
            enableEventAnimations : false
        });
        timeAxis = scheduler.timeAxis;

        const initialTickSize = scheduler.tickSize;

        t.diag('Filtering out weekends');

        timeAxis.filterBy(tick => tick.startDate.getDay() !== 0 && tick.startDate.getDay() !== 6);

        let { tickSize } = scheduler;

        t.isApprox(tickSize, 184, 'Tick width updated');
        t.is(q('.b-sch-header-row-1 .b-sch-header-timeaxis-cell').offsetWidth, tickSize, 'Header cells resized');
        t.is(q(scheduler.eventSelector).offsetWidth, tickSize * 2, 'Event element resized');
        t.selectorCountIs('.b-sch-header-row-0 .b-sch-header-timeaxis-cell', 1, 'Single top header cell');
        t.is(q('.b-sch-header-row-0 .b-sch-header-timeaxis-cell').offsetWidth, tickSize * 5, 'Top header cell size correct');

        t.diag('Filtering out mondays');

        timeAxis.filterBy(tick => tick.startDate.getDay() !== 1);

        ({ tickSize } = scheduler);

        t.isApprox(tickSize, 153, 'Tick width updated');
        t.isApprox(q('.b-sch-header-row-1 .b-sch-header-timeaxis-cell').getBoundingClientRect().width, tickSize, 0.4, 'Header cells resized');
        t.isApprox(q(scheduler.eventSelector).getBoundingClientRect().width, tickSize * 2, 0.4, 'Event element resized');
        t.selectorCountIs('.b-sch-header-row-0 .b-sch-header-timeaxis-cell', 2, 'Two top header cells');
        t.isApprox(q('.b-sch-header-row-0 .b-sch-header-timeaxis-cell').getBoundingClientRect().width, tickSize * 5, 0.4, 'First top header cell size correct');
        t.isApprox(q('.b-sch-header-row-0 .b-sch-header-timeaxis-cell:last-child').getBoundingClientRect().width, tickSize, 0.4, 'Last top header cell size correct');

        t.diag('Clearing filters');

        timeAxis.clearFilters();

        ({ tickSize } = scheduler);

        t.isApprox(tickSize, initialTickSize, 'Tick width restored');
        t.isApprox(q('.b-sch-header-row-1 .b-sch-header-timeaxis-cell').getBoundingClientRect().width, tickSize, 0.4, 'Header cells resized');
        t.isApprox(q(scheduler.eventSelector).getBoundingClientRect().width, tickSize * 2, 0.4, 'Event element resized');
        t.isApprox(q('.b-sch-header-row-0 .b-sch-header-timeaxis-cell').getBoundingClientRect().width, tickSize * 6, 0.4, 'First top header cell size correct');
        t.isApprox(q('.b-sch-header-row-0 .b-sch-header-timeaxis-cell:last-child').getBoundingClientRect().width, tickSize, 0.4, 'Last top header cell size correct');
    });

    t.it('Should resize when filtering out ticks, scenario 2', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            startDate  : new Date(2011, 0, 3),
            endDate    : new Date(2011, 0, 10)
        });
        timeAxis = scheduler.timeAxis;

        const initialTickSize = scheduler.tickSize;

        timeAxis.filterBy(tick => tick.startDate.getDay() !== 0 && tick.startDate.getDay() !== 6);

        timeAxis.clearFilters();

        const tickSize = scheduler.tickSize;

        t.isApprox(tickSize, initialTickSize, 'Tick width restored');
        t.isApprox(q('.b-sch-header-row-1 .b-sch-header-timeaxis-cell').getBoundingClientRect().width, tickSize, 0.4, 'Header cells resized');
        t.isApprox(q(scheduler.eventSelector).getBoundingClientRect().width, tickSize * 2, 0.4, 'Event element resized');
        t.isApprox(q('.b-sch-header-row-0 .b-sch-header-timeaxis-cell').getBoundingClientRect().width, tickSize * 6, 0.4, 'First top header cell size correct');
        t.isApprox(q('.b-sch-header-row-0 .b-sch-header-timeaxis-cell:last-child').getBoundingClientRect().width, tickSize, 0.4, 'Last top header cell size correct');
    });

    t.it('Should render header levels with same unit correctly with filter', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : {
                timeResolution : {
                    unit      : 'HOUR',
                    increment : 6
                },
                headers : [
                    {
                        unit       : 'DAY',
                        dateFormat : 'DD'
                    },
                    {
                        unit     : 'DAY',
                        renderer : start => DateHelper.format(start, 'dd').substr(0, 1)
                    }
                ]
            },
            startDate : new Date(2011, 0, 3),
            endDate   : new Date(2011, 0, 10)
        });
        timeAxis = scheduler.timeAxis;

        timeAxis.filterBy(tick => tick.startDate.getDay() < 2);

        t.selectorCountIs('.b-sch-header-row-0 .b-sch-header-timeaxis-cell', 2, 'Correct cell count for middle');
        t.selectorCountIs('.b-sch-header-row-1 .b-sch-header-timeaxis-cell', 2, 'Correct cell count for bottom');
    });

    t.it('Should revert filter if no ticks remain', async t => {
        scheduler = await t.getSchedulerAsync();
        timeAxis = scheduler.timeAxis;

        const tickCount = timeAxis.count;

        t.firesOnce(timeAxis, 'invalidFilter');

        timeAxis.filterBy(() => false);

        t.is(timeAxis.count, tickCount, 'All ticks available');
        t.notOk(timeAxis.isFiltered, 'No filter applied');
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7810/details
    t.it('shiftPrevious() should not crash with filtered out days', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            startDate  : new Date(2011, 0, 3),
            endDate    : new Date(2011, 0, 4)
        });
        timeAxis = scheduler.timeAxis;

        timeAxis.filterBy(tick => tick.startDate.getDay() !== 6 && tick.startDate.getDay() !== 0);

        timeAxis.shiftPrevious();

        t.selectorExists('.b-sch-header-timeaxis-cell:contains(31)', 'Header updated');
    });
});
