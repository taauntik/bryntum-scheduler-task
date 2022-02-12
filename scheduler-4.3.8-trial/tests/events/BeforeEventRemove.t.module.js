StartTest(t => {

    // https://github.com/bryntum/support/issues/1892
    t.it('Scheduler eventStore should fire beforeRemove event and cancel event removal', async t => {
        const
            scheduler  = t.getScheduler({
                createEventOnDblClick : true,
                features              : {
                    eventEdit : true
                }
            }),
            eventCount = scheduler.eventStore.records.length;
        let beforeRemoveCount = 0;

        scheduler.eventStore.on('beforeRemove', () => {
            beforeRemoveCount++;
            return false;
        });

        await t.waitForEventsToRender();
        await t.rightClick('.b-sch-event');
        await t.click('.b-menuitem:contains(Delete event)');

        t.is(beforeRemoveCount, 1, 'beforeRemove fired once');
        t.is(scheduler.eventStore.records.length, eventCount, 'No events were removed');
    });

});
