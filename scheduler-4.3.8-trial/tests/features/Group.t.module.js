import { Scheduler, EventStore, ResourceStore } from '../../build/scheduler.module.js?456730';
StartTest(t => {
    Object.assign(window, {
        Scheduler,
        EventStore,
        ResourceStore
    });

    let scheduler;

    t.beforeEach(t => {
        scheduler && scheduler.destroy();

        scheduler = t.getScheduler({
            viewPreset : 'hourAndDay',
            height     : 300,
            features   : {
                group  : 'job',
                stripe : true
            },

            startDate         : new Date(2017, 0, 1),
            endDate           : new Date(2017, 0, 1, 8),
            resourceImagePath : '../examples/_shared/images/users/',

            columns : [
                {
                    type      : 'resourceInfo',
                    text      : 'Name',
                    field     : 'name',
                    width     : 200,
                    summaries : [{ sum : 'count', label : 'Persons' }]
                }
            ],

            resources : [
                { id : 1, name : 'Steve', job : 'Carpenter' },
                { id : 2, name : 'Linda', job : 'Carpenter' },
                { id : 3, name : 'Arnold', job : 'Painter' }
            ],

            events : [
                {
                    id         : 1,
                    name       : 'Work',
                    resourceId : 1,
                    startDate  : new Date(2017, 0, 1, 1),
                    endDate    : new Date(2017, 0, 1, 2)
                }
            ]
        });
    });

    t.it('Should update first row properly after collapse/expand group', t => {
        t.chain(
            { waitForRowsVisible : scheduler },
            { click : '.b-grid-cell:textEquals(Carpenter (2))' },
            { waitForSelectorNotFound : '.b-resource-info dt:textEquals(Steve)' },
            { click : '.b-grid-cell:textEquals(Carpenter (2))' },
            { waitForSelector : '.b-resource-info dt:textEquals(Steve)' }
        );
    });
});
