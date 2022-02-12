import { DependencyModel } from '../../build/scheduler.module.js?456730';

StartTest(t => {

    t.it('highlight/unhighlight works correctly', t => {
        const dependency = new DependencyModel({
            fromId : 1,
            toId   : 2
        });

        t.notOk(dependency.highlighted);

        dependency.unhighlight('heh');

        t.notOk(dependency.highlighted);

        dependency.highlight('foo');

        t.is(dependency.highlighted, 'foo');

        dependency.highlight('foo');

        t.is(dependency.highlighted, 'foo');

        dependency.highlight('bar');

        t.is(dependency.highlighted, 'foo bar');

        dependency.highlight('bar');

        t.is(dependency.highlighted, 'foo bar');

        dependency.unhighlight('foo');

        t.is(dependency.highlighted, 'bar');

        dependency.unhighlight('foo');

        t.is(dependency.highlighted, 'bar');

        dependency.unhighlight('bar');

        t.is(dependency.highlighted, '');
    });

    // https://github.com/bryntum/support/issues/3720
    t.it('Should support using dataSource', async t => {
        const scheduler = t.getScheduler({
            startDate : new Date(2017, 0, 1, 6),
            endDate   : new Date(2017, 0, 1, 20),

            features : {
                dependencies : true
            },
            columns : [
                { text : 'Name', field : 'name' }
            ],
            dependencyStore : {
                fields : [
                    { name : 'from', dataSource : 'FROM' },
                    { name : 'to', dataSource : 'TO' }
                ],
                data : [
                    { id : 1, FROM : 1, TO : 2 }
                ]
            },
            resources : [
                { id : 1, name : 'Celia', city : 'Barcelona' }
            ],
            events : [
                {
                    id         : 1,
                    resourceId : 1,
                    startDate  : new Date(2017, 0, 1, 6),
                    endDate    : new Date(2017, 0, 1, 7)
                },
                {
                    id         : 2,
                    resourceId : 1,
                    startDate  : new Date(2017, 0, 1, 8),
                    endDate    : new Date(2017, 0, 1, 10)
                }
            ]
        });

        await t.waitForSelector('.b-sch-dependency');

        t.is(scheduler.dependencyStore.first.fromEvent, scheduler.eventStore.first);
        t.is(scheduler.dependencyStore.first.toEvent, scheduler.eventStore.last);
    });
});
