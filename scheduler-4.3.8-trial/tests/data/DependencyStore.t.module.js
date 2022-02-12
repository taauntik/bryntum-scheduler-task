import { DependencyStore, ProjectModel, Scheduler, ArrayHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {

    let dependencyStore;

    t.beforeEach(() => {
        dependencyStore && dependencyStore.destroy();
        dependencyStore = null;
    });

    t.it('Should have no changes after initial load', t => {
        dependencyStore = new DependencyStore({
            data : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e2', to : 'e3' }
            ]
        });

        t.notOk(dependencyStore.changes, 'No changes');
    });

    t.it('Should be possible to find dependency record based on `from` and `to` ids', t => {
        dependencyStore = new DependencyStore({
            data : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e2', to : 'e3' }
            ]
        });

        const dependency = dependencyStore.getDependencyForSourceAndTargetEvents('e2', 'e3');
        t.is(dependency.id, 'd2', 'Correct dependency found');
    });

    t.it('Should have no changes with data supplied by the scheduler', t => {
        const scheduler = new Scheduler({
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e2', to : 'e3' }
            ],

            resources : ArrayHelper.populate(10, i => ({ id : 'r' + (i + 1), name : 'Resource ' + (i + 1) })),

            events : [
                { id : 'e1', startDate : new Date(2019, 2, 10), duration : 2, name : 'Single' },
                { id : 'e2', startDate : new Date(2019, 2, 14), duration : 2, name : 'Multi A' }
            ]
        });

        t.is(scheduler.dependencyStore.count, 2, 'Dependencies loaded');
        t.notOk(scheduler.dependencyStore.changes, 'No changes');

        scheduler.destroy();
    });

    t.it('Should have no changes with data supplied by Scheduler', t => {
        const scheduler = new Scheduler({
            features : {
                dependencies : true
            },

            resources : ArrayHelper.populate(10, i => ({ id : 'r' + (i + 1), name : 'Resource ' + (i + 1) })),

            events : [
                { id : 'e1', startDate : new Date(2019, 2, 10), duration : 2, name : 'Single' },
                { id : 'e2', startDate : new Date(2019, 2, 14), duration : 2, name : 'Multi A' }
            ],

            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e2', to : 'e3' }
            ]
        });

        t.is(scheduler.dependencyStore.count, 2, 'Dependencies loaded');
        t.notOk(scheduler.dependencyStore.changes, 'No changes');

        scheduler.destroy();
    });

    t.it('Should be possible to pass event instance to from/to fields when create a new dependency', async t => {

        const project = new ProjectModel({
            dependenciesData : [],
            eventsData       : [{
                id        : 1,
                startDate : '2020-05-08',
                endDate   : '2020-05-09'
            }, {
                id        : 2,
                startDate : '2020-05-08',
                endDate   : '2020-05-09'
            }]
        });

        await t.waitForProjectReady();

        const [from, to] = project.eventStore;

        const dependency = project.dependencyStore.add({
            from,
            to
        })[0];

        await t.waitForProjectReady();

        t.is(dependency.from, from, 'Dependency "from" is correct');
        t.is(dependency.to, to, 'Dependency "to" is correct');
    });
});
