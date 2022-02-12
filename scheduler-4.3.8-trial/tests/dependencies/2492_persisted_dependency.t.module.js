import { Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler?.destroy();
    });

    t.it('Persisted dependency is removed from cache', async t => {
        t.mockUrl('load', {
            responseText : JSON.stringify({
                success   : true,
                resources : {
                    rows : [
                        { id : 1, name : 'Albert' }
                    ]
                },
                events : {
                    rows : [
                        { id : 1, resourceId : 1, name : 'Event 1', startDate : '2021-03-09', endDate : '2021-03-10' },
                        { id : 2, resourceId : 1, name : 'Event 2', startDate : '2021-03-09', endDate : '2021-03-10' },
                        { id : 3, resourceId : 1, name : 'Event 2', startDate : '2021-03-09', endDate : '2021-03-10' }
                    ]
                },
                dependencies : {
                    rows : [
                        { id : 1, from : 1, to : 2 }
                    ]
                }
            })
        });

        scheduler = new Scheduler({
            appendTo    : document.body,
            width       : 600,
            height      : 400,
            startDate   : new Date(2021, 2, 8),
            endDate     : new Date(2021, 2, 12),
            crudManager : {
                autoLoad  : true,
                transport : {
                    load : {
                        url : 'load'
                    },
                    sync : {
                        url : 'sync'
                    }
                }
            },
            features : {
                dependencies : true
            }
        });

        await t.waitForSelector('.b-sch-dependency');

        const [dependency] = scheduler.dependencyStore.add({
            from : 2,
            to   : 3
        });

        const phantomId = dependency.id;

        await t.waitForSelector(`.b-sch-dependency[depId="${phantomId}"]`);

        t.mockUrl('sync', {
            responseText : JSON.stringify({
                success      : true,
                dependencies : {
                    rows : [
                        { $PhantomId : phantomId, id : 100 }
                    ]
                }
            })
        });

        await scheduler.crudManager.sync();

        await t.waitForSelector('.b-sch-dependency[depId="100"]');

        scheduler.dependencyStore.remove(dependency);

        await t.waitFor(() => !document.querySelector('.b-sch-dependency[depId="100"]'));

        t.selectorCountIs('.b-sch-dependency[depId="100"]', 0, 'No dependency line matching new dep real id');
        t.selectorCountIs(`.b-sch-dependency[depId="${phantomId}"]`, 0, 'No dependency line matching new dep phantom id');
    });
});
