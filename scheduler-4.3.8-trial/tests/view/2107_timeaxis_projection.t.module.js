import { PresetManager } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    document.body.style.width = '800px';

    PresetManager.registerPreset('test', {
        rowHeight           : 24,
        resourceColumnWidth : 135,
        tickWidth           : 60,

        displayDateFormat : 'HH:mm',
        shiftIncrement    : 1,
        shiftUnit         : 'week',
        timeResolution    : {
            unit      : 'minute',
            increment : 30
        },
        headers : [
            {
                unit          : 'hour',
                dateFormat    : 'HH:mm',
                headerCellCls : 'foo',
                align         : 'end',
                renderer      : function(start, end, cellData, i, store) {
                    if (i === 0) {
                        cellData.headerCellCls = 'bar';
                        return 'foo';
                    }

                    return cellData.value;
                }
            }
        ]
    });

    let scheduler;

    t.beforeEach((t) => {
        scheduler = t.getScheduler({
            viewPreset : 'test',
            startDate  : new Date(2010, 0, 1),
            endDate    : new Date(2010, 0, 2),
            appendTo   : document.body
        });
    });

    t.it('Should project dates correctly in horizontal mode', t => {
        const timeaxisStartX = 0; //scheduler.timeAxisColumn.element.offsetLeft, // defaulting to local coordinates

        t.is(scheduler.getDateFromXY([timeaxisStartX, -1]), new Date(2010, 0, 1), 'getDateFromXY(0) raw, should give start date of the view');
        t.is(scheduler.getDateFromCoordinate(timeaxisStartX), new Date(2010, 0, 1), 'getDateFromCoordinate(0) raw, should give start date of the view');
        t.isGreater(scheduler.getDateFromCoordinate(timeaxisStartX + 1), new Date(2010, 0, 1), 'getDateFromCoordinate(1) raw, should give > start date of the view');

        t.is(scheduler.getDateFromCoordinate(timeaxisStartX, 'floor'), new Date(2010, 0, 1), 'getDateFromCoordinate(0) should give start date of the view');
        t.is(scheduler.getDateFromCoordinate(timeaxisStartX + 29, 'floor'), new Date(2010, 0, 1), 'getDateFromCoordinate(29) should floor to start of view');

        t.is(scheduler.getDateFromCoordinate(timeaxisStartX + 14, 'round'), new Date(2010, 0, 1), 'getDateFromCoordinate(14) should round down to start date of the view');
        t.is(scheduler.getDateFromCoordinate(timeaxisStartX + 15, 'round'), new Date(2010, 0, 1, 0, 30), 'getDateFromCoordinate(15) should round up to half hour');
        t.is(scheduler.getDateFromCoordinate(timeaxisStartX + 29, 'round'), new Date(2010, 0, 1, 0, 30), 'getDateFromCoordinate(29) should round up to half hour');

    });

    t.it('Should support unit, dateFormat, renderer, headerCellCls config', t => {
        t.is(scheduler.timeAxis.ticks[0].endDate - scheduler.timeAxis.ticks[0].startDate, 3600 * 1000, '1 hour ticks');

        t.selectorExists('.b-sch-header-timeaxis-cell.foo', 'Custom CSS class added');
        t.selectorExists('.b-sch-header-timeaxis-cell:textEquals(foo)', 'Could render custom content');
        t.selectorExists('.b-sch-header-timeaxis-cell.bar:textEquals(foo)', 'Could set custom cell CSS class');

        t.hasCls('.b-sch-header-timeaxis-cell', 'b-align-end', 'CSS class set correctly for alignment');
    });

    // TODO: PORT porting vertical later
    t.xit('VERTICAL', t => {
        scheduler.setMode('vertical');

        var timeaxisStartY = scheduler.el.getTranslateY();

        t.is(scheduler.getDateFromXY([-1, timeaxisStartY]), new Date(2010, 0, 1), 'getDateFromXY(0) raw, should give start date of the view');
        t.is(scheduler.getDateFromY(timeaxisStartY), new Date(2010, 0, 1), 'getDateFromY(0) raw, should give start date of the view');
        t.isGreater(scheduler.getDateFromY(timeaxisStartY + 1), new Date(2010, 0, 1), 'getDateFromY(1) raw, should give > start date of the view');

        t.is(scheduler.getDateFromY(timeaxisStartY, 'floor'), new Date(2010, 0, 1), 'getDateFromY(0) should give start date of the view');
        t.is(scheduler.getDateFromY(timeaxisStartY + 29, 'floor'), new Date(2010, 0, 1), 'getDateFromY(29) should floor to start of view');

        t.is(scheduler.getDateFromY(timeaxisStartY + 14, 'round'), new Date(2010, 0, 1), 'getDateFromY(14) should round down to start date of the view');
        t.is(scheduler.getDateFromY(timeaxisStartY + 15, 'round'), new Date(2010, 0, 1, 0, 30), 'getDateFromY(15) should round up to half hour');
        t.is(scheduler.getDateFromY(timeaxisStartY + 29, 'round'), new Date(2010, 0, 1, 0, 30), 'getDateFromY(29) should round up to half hour');
    });
});
