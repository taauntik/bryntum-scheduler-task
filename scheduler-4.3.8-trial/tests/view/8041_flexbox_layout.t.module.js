StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8041
    t.it('Scheduler should be stretched inside flexbox container', async t => {

        document.body.innerHTML = `
            <div style="height: 300px; width: 400px; background: tomato; display: flex; flex-flow: row nowrap; align-items: stretch;">
                <div style="background: purple; flex: 1;"></div>
                <div id="sch" style="flex: 1; display: flex; flex-flow: column nowrap; align-items: stretch; overflow-x: hidden"></div>
            </div>`;

        scheduler = await t.getSchedulerAsync({
            appendTo  : 'sch',
            startDate : new Date(2019, 3, 14),
            endDate   : new Date(2019, 3, 21)
        });

        t.is(scheduler.element.getBoundingClientRect().width, 200, 'Scheduler is stretched correctly');
    });
});
