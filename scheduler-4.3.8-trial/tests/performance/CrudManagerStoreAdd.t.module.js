StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler?.destroy();
    });

    t.it('crud manager listeners time increases linearly when adding events', async t => {
        scheduler = await t.getSchedulerAsync({
            crudManager : {
                autoLoad : false
            }
        });

        scheduler.resourceStore.add({ id : 1, name : 'Resource' });

        const { project } = scheduler;

        await project.doCommitAsync();

        const events = [];

        for (let i = 1; i <= 1000; i++) {
            events.push({
                id         : i,
                resourceId : 1,
                startDate  : new Date(2021, 6, 13),
                endDate    : new Date(2021, 6, 14)
            });
        }

        await t.firesOk({
            observable : scheduler.crudManager,
            events     : {
                haschanges : '<10',
                nochanges  : '<10'
            },
            during : async() => {
                project.eventStore.add(events);

                await project.commitAsync();
            }
        });
    });
});
