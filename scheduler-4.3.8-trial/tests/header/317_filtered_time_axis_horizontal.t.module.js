StartTest(t => {
    const scheduler = t.getScheduler({
        appendTo     : document.body,
        weekStartDay : 1,
        viewPreset   : 'dayAndWeek',
        startDate    : new Date(2012, 5, 4),
        endDate      : new Date(2012, 5, 11)
    });

    t.is(document.querySelectorAll('.b-sch-header-timeaxis-cell').length, 8, '7 day cells found, + 1 week top row cell');

    scheduler.timeAxis.filterBy(tick =>
        tick.startDate.getDay() === 6 || tick.startDate.getDay() === 0
    );
    t.is(document.querySelectorAll('.b-sch-header-timeaxis-cell').length, 3, '2 day cells found after filtering out weekdays, + 1 week top cell');

    t.is(document.querySelectorAll('.b-sch-dayheadercell-6').length, 1, '1 Saturday cell found');
    t.is(document.querySelectorAll('.b-sch-dayheadercell-0').length, 1, '1 Sunday cell found');
});
