/**
 * Test of react-state demo
 */
StartTest(t => {

    const scheduler = bryntum.query('scheduler');
    const combo = bryntum.query('combo');

    t.it('Rendering and selecting datasets', async t => {

        await t.waitForSelector('.b-timelinebase');
        await t.waitForSelector('.b-combo');

        await t.is(combo.store.count, 6, 'Combo store has 6 records');

        // check dataset 1
        await t.click('.demo-toolbar .b-combo');
        await t.click('.b-list-item[data-index=1]');
        await t.waitForSelector('.b-sch-event-content:contains(dataset 1)');

        // check dataset 2 (empty)
        await t.click('.demo-toolbar .b-combo');
        await t.click('.b-list-item[data-index=2]');
        await t.is(scheduler.eventStore.count, 0, 'Event store has no records');

        // check dataset 3
        await t.click('.demo-toolbar .b-combo');
        await t.click('.b-list-item[data-index=3]');
        await t.waitForSelector('.b-sch-event-content:contains(dataset 3)');

        // check dataset 4
        await t.click('.demo-toolbar .b-combo');
        await t.click('.b-list-item[data-index=4]');
        await t.waitForSelector('.b-sch-event-content:contains(dataset 4)');

        // check dataset 5
        await t.click('.demo-toolbar .b-combo');
        await t.click('.b-list-item[data-index=5]');
        await t.waitForSelector('.b-sch-event-content:contains(dataset 5)');

        // check dataset 0
        await t.click('.demo-toolbar .b-combo');
        await t.click('.b-list-item[data-index=0]');
        await t.waitForSelector('.b-sch-event-content:contains(dataset 0)');
    });

});
