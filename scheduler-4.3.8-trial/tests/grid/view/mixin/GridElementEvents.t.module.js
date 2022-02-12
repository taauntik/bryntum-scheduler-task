import { Scheduler, EventStore, ResourceStore, PresetManager } from '../../../../build/scheduler.module.js?456730';

// Had to port this test to get imports right

StartTest(t => {
    Object.assign(window, {
        Scheduler,
        EventStore,
        ResourceStore,
        PresetManager
    });

    let grid;

    t.beforeEach(t => grid && grid.destroy());

    t.it('Should trigger cell events', t => {
        grid = t.getGrid({
            features : {
                cellEdit : false
            }
        });

        t.firesOk({
            observable : grid,
            events     : {
                cellClick       : 3,
                cellDblClick    : 1,
                cellContextMenu : 1,
                cellMouseOver   : '>=1',
                cellMouseOut    : '>=1'
            }
        });

        t.chain(
            { click : '.b-grid-cell' },
            { dblclick : '.b-grid-cell' },
            { contextmenu : '.b-grid-cell' },
            { moveMouseTo : '.b-grid-header' }
        );
    });
});
