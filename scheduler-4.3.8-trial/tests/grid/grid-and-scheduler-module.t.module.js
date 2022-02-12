/*KEEP*/import { Grid } from '../../../Grid/build/grid.module.js?456730';
/*KEEP*/import { Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    t.ok(Grid, 'Grid available');
    t.ok(Scheduler, 'Scheduler available');

    new Grid({
        appendTo : document.body,
        id       : 'grid',
        width    : 1024,
        height   : 300,
        columns  : [
            { field : 'name', text : 'Name' }
        ],
        data : [
            { name : 'Grid row' }
        ]
    });

    new Scheduler({
        appendTo : document.body,
        id       : 'scheduler',
        height   : 300,
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
