StartTest(t => {
    const gridClass = bryntum.grid.Grid,
        schedulerClass = bryntum.scheduler.Scheduler;

    t.ok(gridClass, 'bryntum.grid.Grid available');
    t.ok(schedulerClass, 'bryntum.scheduler.Scheduler available');

    new gridClass({
        id       : 'grid',
        appendTo : 'grid-container',
        height   : '100%',
        columns  : [
            { field : 'name', text : 'Name' }
        ],
        data : [
            { name : 'Grid row' }
        ]
    });

    new schedulerClass({
        id       : 'scheduler',
        appendTo : 'scheduler-container',
        height   : '100%',
        columns  : [
            { field : 'name', text : 'Name' }
        ],
        data : [
            { name : 'Scheduler resource' }
        ]
    });

    t.chain(
        { waitForSelector : '.b-grid#grid', desc : 'Grid element found' },
        { waitForSelector : '.b-scheduler#scheduler', desc : 'Scheduler element found' },
        { rightClick : '.b-grid-cell:contains(Grid row)', desc : 'grid: trigger element added to float root' },
        { rightClick : '.b-sch-timeaxis-cell', desc : 'scheduler: trigger element added to float root' },

        { waitForSelector : '.b-float-root' },

        () => {
            t.selectorCountIs('.b-float-root', 1, 'Single float root');

            t.notOk('BUNDLE_EXCEPTION' in window, 'No exception from including both');
        }
    );
});
