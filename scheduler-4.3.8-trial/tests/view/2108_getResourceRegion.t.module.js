import { Rectangle } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(t => {
        scheduler && scheduler.destroy();

        document.body.innerHTML = '';
        document.body.style.width = '800px';
    });

    t.it('HORIZONTAL getResourceRegion', t => {
        scheduler = t.getScheduler({
            viewPreset : 'dayAndWeek',
            startDate  : new Date(2010, 0, 1),
            endDate    : new Date(2010, 0, 7),
            appendTo   : document.body
        });

        const column = scheduler.timeAxisColumn,
            region = scheduler.getResourceRegion(scheduler.resourceStore.first);

        t.is(region.x, 0, 'getResourceRegion horizontal: region left ok');
        t.is(region.right, column.width, 'getResourceRegion horizontal: region right ok');
        t.isApprox(region.y, 0, 1, 'getResourceRegion horizontal: region top ok');
        t.isApprox(region.bottom, scheduler.rowHeight, 1, 'getResourceRegion horizontal: region bottom ok');
    });

    // TODO: PORT porting vertical later
    t.xit('VERTICAL getResourceRegion', t => {
        scheduler = t.getScheduler({
            viewPreset : 'dayAndWeek',
            mode       : 'vertical',
            startDate  : new Date(2010, 0, 1),
            endDate    : new Date(2010, 0, 7),
            appendTo   : document.body
        });

        let view = scheduler.getSchedulingView();

        t.chain(
            { waitFor : 'rowsVisible', args : scheduler },

            function(next) {
                let region = view.getResourceRegion(scheduler.resourceStore.first());
                t.is(region.x, 1, 'getResourceRegion vertical: region left ok');
                t.is(region.right, view.headerCt.getGridColumns()[0].getWidth() - 1, 'getResourceRegion vertical: region right ok');
                t.is(region.y, 0, 'getResourceRegion vertical: region top ok');
                t.isApprox(region.bottom, view.el.down('.x-grid-item-container').getHeight(), 1, 'getResourceRegion vertical: region bottom ok');
            }
        );
    });

    t.it('HORIZONTAL getScheduleRegion', t => {
        scheduler = t.getScheduler({
            viewPreset : 'dayAndWeek',
            startDate  : new Date(2010, 0, 1),
            endDate    : new Date(2010, 0, 7),
            appendTo   : document.body
        });

        const region      = scheduler.getScheduleRegion(null, null, false),
            tableRegion = Rectangle.from(scheduler.timeAxisSubGridElement).moveTo(null, 0);

        tableRegion.width = scheduler.timeAxisSubGridElement.scrollWidth;

        t.is(region.left, tableRegion.x, 'getScheduleRegion horizontal: left ok');
        t.is(region.right, tableRegion.right, 'getScheduleRegion horizontal: right ok');
        t.is(region.top, tableRegion.y + scheduler.barMargin, 'getScheduleRegion horizontal: top ok');
        t.is(region.bottom, tableRegion.bottom - scheduler.barMargin, 'getScheduleRegion horizontal: bottom ok');
    });

    // TODO: PORT porting vertical later
    t.xit('VERTICAL getScheduleRegion', t => {
        scheduler = t.getScheduler({
            viewPreset : 'dayAndWeek',
            mode       : 'vertical',
            startDate  : new Date(2010, 0, 1),
            endDate    : new Date(2010, 0, 7),
            appendTo   : document.body
        });

        let view = scheduler.getSchedulingView();

        t.chain(
            { waitFor : 'rowsVisible', args : scheduler },

            function(next) {
                let region = view.getScheduleRegion();
                let tableRegion = view.el.down('.x-grid-item-container').getRegion();
                t.is(region.top, tableRegion.top, 'getScheduleRegion vertical: top ok');
                t.isApprox(region.bottom, tableRegion.bottom, 1, 'getScheduleRegion vertical: bottom ok');
                t.is(region.left, tableRegion.left + view.barMargin, 'getScheduleRegion vertical: left ok');
                t.is(region.right, tableRegion.right - view.barMargin, 'getScheduleRegion vertical: right ok');
            }
        );
    });
});
