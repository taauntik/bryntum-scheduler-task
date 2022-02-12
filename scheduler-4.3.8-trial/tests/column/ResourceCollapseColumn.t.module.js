
StartTest(t => {
    let scheduler;

    t.beforeEach(() => scheduler?.destroy?.());

    // https://github.com/bryntum/support/issues/2979
    t.it('Should flip none and stack layout of a resource', async t => {
        scheduler = t.getScheduler({
            columns : [
                {  type : 'resourceCollapse' }
            ]
        });

        const resource = scheduler.resourceStore.first;

        await t.click('.b-resourcecollapse-cell i');
        t.is(resource.eventLayout, 'none', 'Flipped layout to none');

        await t.click('.b-resourcecollapse-cell i');
        t.is(resource.eventLayout, 'stack', 'Flipped layout to stack');
    });
});
