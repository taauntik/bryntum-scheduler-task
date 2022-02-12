import { PresetManager, TimeAxisColumn } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler && scheduler.destroy());

    PresetManager.registerPreset('threelevels', {
        tickWidth         : 20,
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
                unit       : 'month',
                increment  : 1,
                dateFormat : 'D MMM YYYY'
            },
            {
                unit       : 'day',
                increment  : 1,
                dateFormat : 'D MMM'
            },
            {
                unit       : 'hour',
                increment  : 1,
                dateFormat : 'HH'
            }
        ]
    });

    t.it('Should refresh timeAxis header contents when filtering time axis', t => {
        scheduler = t.getScheduler({
            viewPreset : 'dayAndWeek',
            startDate  : new Date(2012, 5, 3),
            endDate    : new Date(2012, 5, 11)
        }, 1);

        t.is(document.querySelectorAll('.b-sch-header-row-1 > div:not(.b-released)').length, 8, '7 day cells found');

        scheduler.timeAxis.filterBy(tick =>
            tick.startDate.getDay() === 6 || tick.startDate.getDay() === 0
        );

        t.is(document.querySelectorAll('.b-sch-header-row-1 > div:not(.b-released)').length, 3, '3 weekend day cells found after filter');

        scheduler.timeAxis.clearFilters();

        t.is(document.querySelectorAll('.b-sch-header-row-1 > div:not(.b-released)').length, 8, '8 day cells found after clearing filter');
    });

    t.it('Clicking, Double clicking and right clicking any time header row should fire an event', t => {
        scheduler = t.getScheduler({
            viewPreset                : 'threelevels',
            startDate                 : new Date(2011, 1, 1),
            endDate                   : new Date(2011, 1, 3),
            zoomOnTimeAxisDoubleClick : false
        }, 1);

        t.willFireNTimes(scheduler, 'timeaxisheaderdblclick', 3);
        t.willFireNTimes(scheduler, 'timeaxisheadercontextmenu', 1);

        t.chain(
            next => {
                scheduler.on({
                    timeaxisheaderdblclick({ source, startDate, endDate, event }) {
                        t.ok(source instanceof TimeAxisColumn, 'Bottom row header ok');
                        t.isDateEqual(startDate, new Date(2011, 1, 1, 0), 'Bottom row StartDate ok');
                        t.isDateEqual(endDate, new Date(2011, 1, 1, 1), 'Bottom row EndDate ok');
                    },
                    once : true
                });
                next();
            },
            { dblclick : '.b-sch-header-row-2 .b-sch-header-timeaxis-cell' },
            next => {
                scheduler.on({
                    timeaxisheaderdblclick({ source, startDate, endDate, event }) {
                        t.ok(source instanceof TimeAxisColumn, 'Middle row header ok');
                        t.isDateEqual(startDate, new Date(2011, 1, 1, 0), 'Middle row StartDate ok');
                        t.isDateEqual(endDate, new Date(2011, 1, 2, 0), 'Middle row EndDate ok');
                    },
                    once : true
                });
                next();
            },
            { dblclick : '.b-sch-header-row-1 .b-sch-header-timeaxis-cell' },
            next => {
                scheduler.on({
                    timeaxisheaderdblclick({ source, startDate, endDate, event }) {
                        t.ok(source instanceof TimeAxisColumn, 'Top row header ok');
                        t.isDateEqual(startDate, new Date(2011, 1, 1, 0), 'Top row StartDate ok');
                        t.isDateEqual(endDate, new Date(2011, 1, 3, 0), 'Top row EndDate ok');
                    },
                    once : true
                });
                next();
            },
            { dblclick : '.b-sch-header-row-0 .b-sch-header-timeaxis-cell' },
            next => {
                t.willFireNTimes(scheduler, 'timeaxisheaderclick', 3);
                next();
            },
            { click : '.b-sch-header-row-2 .b-sch-header-timeaxis-cell' },
            { click : '.b-sch-header-row-1 .b-sch-header-timeaxis-cell' },
            { click : '.b-sch-header-row-0 .b-sch-header-timeaxis-cell' },
            { rightclick : '.b-sch-header-row-2 .b-sch-header-timeaxis-cell' }
        );
    });

    t.it('Header events should bubble up and be exposed through the Panel', t => {
        scheduler = t.getScheduler({
            viewPreset : 'threelevels'
        });

        t.willFireNTimes(scheduler, 'timeaxisheaderclick', 3);
        t.willFireNTimes(scheduler, 'timeaxisheadercontextmenu', 1);
        t.willFireNTimes(scheduler, 'timeaxisheaderdblclick', 1);

        t.chain(
            { click : '.b-sch-header-timeaxis-cell', offset : [15, 15] },
            { waitFor : 300 },
            { rightclick : '.b-sch-header-timeaxis-cell', offset : [5, 5] },
            { waitFor : 300 },
            { doubleclick : '.b-sch-header-timeaxis-cell', offset : [5, 5] }
        );
    });

    t.it('Time axis header should not be draggable', t => {
        scheduler = t.getScheduler();

        t.wontFire(scheduler, 'gridheaderdragstart');

        t.chain(
            { drag : '.b-sch-header-timeaxis-cell', by : [50, 10] }
        );
    });

    t.it('Time axis header should not have zeros for AM/PM format', t => {
        scheduler = t.getScheduler({
            viewPreset : 'hourAndDay'
        });

        t.selectorExists('.b-sch-header-timeaxis-cell:textEquals(1 AM)', 'Time axis header does not have zeros for AM/PM format');
    });

    // https://github.com/bryntum/support/issues/2857
    t.it('Should be possible to provide `renderer` for time axis column', t => {
        scheduler = t.getScheduler({
            viewPreset : 'hourAndDay',
            columns    : [
                { text : 'Name', field : 'name', width : 130 },
                {
                    type : 'timeAxis',
                    renderer() {
                        return '<span class="works">foo</span>';
                    }
                }
            ]
        });

        t.waitForSelector('span.works');
    });
});
