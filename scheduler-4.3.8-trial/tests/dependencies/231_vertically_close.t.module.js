import { AssignmentStore, DependencyStore, EventStore, ResourceStore, PresetManager, Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    Object.assign(window, {
        AssignmentStore,
        Scheduler,
        EventStore,
        ResourceStore,
        DependencyStore,
        PresetManager
    });

    let scheduler;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();

        scheduler = t.getScheduler({
            id           : 'sched',
            appendTo     : document.body,
            dependencies : [{
                from     : 1,
                to       : 2,
                fromSide : 'bottom',
                toSide   : 'top'
            }],
            resourceStore : t.getResourceStore2({}, 10)
        }, 2);
    });

    // #3370 RectangularPathFinder fails to find path for nearby events
    t.it('Path finder should be able to find path for a bottom to top dependency between two vertically close placed events ', function(t) {
        t.chain(
            { waitForSelector : '.b-sch-dependency' },
            function(next) {
                t.selectorExists('.b-sch-dependency', 'Bottom to top dependency should be rendered');
                next();
            }
        );
    });
});
