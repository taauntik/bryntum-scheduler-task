import { AssignmentStore, DependencyStore, DependencyModel, EventStore, ResourceStore, PresetManager, Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    const Type = DependencyModel.Type;

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
            id              : 'sched',
            appendTo        : document.body,
            dependencyStore : new DependencyStore(),
            features        : {
                eventTooltip : false
            },
            resourceStore : t.getResourceStore2({
            }, 10)
        }, 10);
    });

    function assertDependencyType(t, from, to, type) {
        t.chain(
            { waitForSelector : '.event1' },

            { moveMouseTo : '.event1' },

            { drag : `.event1 .b-sch-terminal-${from}`, to : '.event2', dragOnly : true },

            { moveMouseTo : `.event2 .b-sch-terminal-${to}` },

            { mouseUp : `.event2 .b-sch-terminal-${to}` },

            () => {
                const dep = scheduler.dependencyStore.first;

                t.is(dep.fromEvent.name, 'Assignment 1');
                t.is(dep.toEvent.name, 'Assignment 2');
                t.is(dep.type, type);
                t.is(dep.fromSide, from);
                t.is(dep.toSide, to);
            }
        );
    }

    t.it('Left-to-left', t => {
        assertDependencyType(t, 'left', 'left', Type.StartToStart);
    });

    t.it('Left-to-right', t => {
        assertDependencyType(t, 'left', 'right', Type.StartToEnd);
    });

    t.it('Left-to-top', t => {
        assertDependencyType(t, 'left', 'top', Type.StartToStart);
    });

    t.it('Right-to-left', t => {
        assertDependencyType(t, 'right', 'left', Type.EndToStart);
    });

    t.it('Right-to-right', t => {
        assertDependencyType(t, 'right', 'right', Type.EndToEnd);
    });

    t.it('Top-to-left', t => {
        assertDependencyType(t, 'top', 'left', Type.EndToStart);
    });

    t.it('Top-to-right', t => {
        assertDependencyType(t, 'top', 'right', Type.EndToEnd);
    });

    t.it('Top-to-top', t => {
        assertDependencyType(t, 'top', 'top', Type.EndToStart);
    });

    t.it('Top-to-bottom', t => {
        assertDependencyType(t, 'top', 'bottom', Type.EndToStart);
    });

    t.it('Bottom-to-left', t => {
        assertDependencyType(t, 'bottom', 'left', Type.EndToStart);
    });

    t.it('Bottom-to-right', t => {
        assertDependencyType(t, 'bottom', 'right', Type.EndToEnd);
    });

    t.it('Bottom-to-top', t => {
        assertDependencyType(t, 'bottom', 'top', Type.EndToStart);
    });

    t.it('Bottom-to-bottom', t => {
        assertDependencyType(t, 'bottom', 'bottom', Type.EndToStart);
    });
});
