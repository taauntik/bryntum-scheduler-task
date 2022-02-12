StartTest(t => {

    // https://github.com/bryntum/support/issues/3702
    t.it('Should support using dataSource', async t => {

        const scheduler = t.getScheduler({
            startDate : new Date(2017, 0, 1, 6),
            endDate   : new Date(2017, 0, 1, 20),

            columns : [
                { text : 'Name', field : 'name' }
            ],
            assignmentStore : {
                idField : 'ID',
                fields  : [
                    { name : 'eventId', dataSource : 'EventID' },
                    { name : 'resourceId', dataSource : 'ResourceID' }
                ],
                data : [
                    { ID : 1, ResourceID : 'r1', EventID : 1 }
                ]
            },
            resources : [
                { id : 'r1', name : 'Celia', city : 'Barcelona' }
            ],
            events : [
                {
                    id        : 1,
                    startDate : new Date(2017, 0, 1, 10),
                    endDate   : new Date(2017, 0, 1, 12)
                }
            ]
        });

        t.is(scheduler.assignmentStore.first.resource, scheduler.resourceStore.first);
        t.is(scheduler.assignmentStore.first.event, scheduler.eventStore.first);

        await t.waitForSelector('.b-sch-event');
    });

});
