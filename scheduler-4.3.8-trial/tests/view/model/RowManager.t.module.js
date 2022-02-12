import { Scheduler, ArrayHelper, DateHelper, RandomGenerator } from '../../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler, rowManager, eventStore;

    async function createScheduler(config = {}) {
        scheduler = new Scheduler(Object.assign({
            appendTo  : document.body,
            startDate : new Date(2020, 3, 12),
            endDate   : new Date(2020, 3, 19),
            resources : ArrayHelper.populate(50, i => ({ id : i + 1 })),
            events    : ArrayHelper.populate(100, i => ({
                id         : i + 1,
                resourceId : Math.floor(i / 2) + 1,
                startDate  : new Date(2020, 3, 15),
                duration   : 2,
                eventColor : 'blue'
            })),
            enableEventAnimations : false,
            useInitialAnimation   : false,
            rowHeight             : 60
        }, config));

        ({ rowManager, eventStore } = scheduler);

        await t.waitForProjectReady(scheduler);
    }

    t.beforeEach(t => scheduler && scheduler.destroy());

    t.it('Should update height map on EventStore CRUD', t => {
        t.beforeEach((t, next) => createScheduler().then(next));

        t.it('Add', async t => {
            t.is(rowManager.totalHeight, 5550, 'Total height initially correct');
            t.is(scheduler.verticalScroller.offsetHeight, 5550, 'Scroller height initially correct');
            eventStore.add({ resourceId : 2, startDate : new Date(2020, 3, 15), duration : 1 });

            await t.waitForProjectReady(scheduler);

            t.is(rowManager.averageRowHeight, 111, 'Average row height updated');
            t.is(rowManager.heightMap.get(2), 160, 'Height map updated');
            t.is(rowManager.totalHeight, 5600, 'Total height updated');
            t.is(scheduler.verticalScroller.offsetHeight, 5600, 'Scroller height updated');
        });

        t.it('Insert', async t => {
            eventStore.insert(0, { resourceId : 2, startDate : new Date(2020, 3, 15), duration : 1 });

            await t.waitForProjectReady(scheduler);

            t.is(rowManager.averageRowHeight, 111, 'Average row height updated');
            t.is(rowManager.heightMap.get(2), 160, 'Height map updated');
            t.is(rowManager.totalHeight, 5600, 'Total height updated');
            t.is(scheduler.verticalScroller.offsetHeight, 5600, 'Scroller height updated');
        });

        t.it('Update', async t => {
            eventStore.first.startDate = new Date(2020, 3, 18);

            await t.waitForProjectReady(scheduler);

            t.is(rowManager.averageRowHeight, 109, 'Average row height updated');
            t.is(rowManager.heightMap.get(1), 60, 'Height map updated');
            t.is(rowManager.totalHeight, 5500, 'Total height updated');
            t.is(scheduler.verticalScroller.offsetHeight, 5500, 'Scroller height updated');

            eventStore.getById(3).resourceId = 5;

            await t.waitForProjectReady(scheduler);

            t.is(rowManager.averageRowHeight, 109, 'Average row height not affected');
            t.is(rowManager.heightMap.get(2), 60, 'Height map for source');
            t.is(rowManager.heightMap.get(5), 160, 'And target');
            t.is(rowManager.totalHeight, 5500, 'Total height not affected');
            t.is(scheduler.verticalScroller.offsetHeight, 5500, 'Scroller height not affected');
        });

        t.it('Remove', async t => {
            eventStore.first.remove();

            await t.waitForProjectReady(scheduler);

            t.is(rowManager.averageRowHeight, 109, 'Average row height updated');
            t.is(rowManager.heightMap.get(1), 60, 'Height map updated');
            t.is(rowManager.totalHeight, 5500, 'Total height updated');
            t.is(scheduler.verticalScroller.offsetHeight, 5500, 'Scroller height updated');
        });

        t.it('Remove all', async t => {
            eventStore.removeAll();

            await t.waitForProjectReady(scheduler);

            t.isApprox(rowManager.averageRowHeight, 60, 1, 'Average row height updated');
            t.is(rowManager.heightMap.get(1), 60, 'Height map updated');
            t.is(rowManager.totalHeight, 3050, 'Total height updated');
        });

        t.it('Dataset', async t => {
            eventStore.data = [
                { resourceId : 2, startDate : new Date(2020, 3, 15), duration : 1 },
                { resourceId : 2, startDate : new Date(2020, 3, 15), duration : 1 }
            ];

            await t.waitForProjectReady(scheduler);

            t.isApprox(rowManager.averageRowHeight, 61, 1, 'Average row height updated');
            t.is(rowManager.heightMap.get(1), 60, 'Height map updated #1');
            t.is(rowManager.heightMap.get(2), 110, 'Height map updated #2');
            t.is(rowManager.totalHeight, 3100, 'Total height updated');
            t.is(scheduler.verticalScroller.offsetHeight, 3100, 'Scroller height updated');
        });

        t.it('Filter', t => {
            eventStore.filter(e => e.resourceId < 3);

            t.is(rowManager.averageRowHeight, 62, 'Average row height updated');
            t.is(rowManager.heightMap.get(1), 110, 'Height map updated #1');
            t.is(rowManager.heightMap.get(2), 110, 'Height map updated #2');
            t.is(rowManager.heightMap.get(3), 60, 'Height map updated #3');
            t.is(rowManager.totalHeight, 3150, 'Total height updated');
            t.is(scheduler.verticalScroller.offsetHeight, 3150, 'Scroller height updated');

            eventStore.clearFilters();

            t.isApprox(rowManager.averageRowHeight, 110, 1, 'Average row height updated');
            t.is(rowManager.heightMap.get(1), 110, 'Height map updated #1');
            t.is(rowManager.heightMap.get(2), 110, 'Height map updated #2');
            t.is(rowManager.heightMap.get(3), 110, 'Height map updated #3');
            t.is(rowManager.totalHeight, 5550, 'Total height updated');
            t.is(scheduler.verticalScroller.offsetHeight, 5550, 'Scroller height updated');
        });
    });

    // For a simple case when there are few non-overlapping events per resource row estimation should be exact from
    // the start. If estimation is wrong multipage export will likely fail too
    t.it('Should estimate scroll height properly on load', async t => {
        const
            rnd = new RandomGenerator(),
            startDate = new Date('2020-04-20'),
            week2     = new Date('2020-04-27'),
            endDate = new Date('2020-05-02'),
            // Generate random date pairs for weeks, minimum duration 1, no overlaps
            getStart = i => DateHelper.add(i % 2 === 0 ? startDate : week2, rnd.nextRandom(3), 'd'),
            getEnd = i => DateHelper.min(DateHelper.add(i % 2 === 0 ? week2 : endDate, -rnd.nextRandom(3), 'd'), i % 2 === 0 ? week2 : endDate);

        await createScheduler({
            startDate,
            endDate,
            rowHeight  : 100,
            viewPreset : 'weekAndDayLetter',
            events     : ArrayHelper.populate(100, i => ({
                id         : i + 1,
                resourceId : Math.floor(i / 2) + 1,
                startDate  : getStart(i),
                endDate    : getEnd(i),
                eventColor : rnd.fromArray(['blue', 'green'])
            }))
        });

        const
            initialScrollHeight = scheduler.scrollable.scrollHeight,
            initialTotalHeight  = scheduler.rowManager.totalHeight;

        scheduler.scrollable.scrollTo(null, scheduler.scrollable.maxY);

        // Wait for scroll end to give scheduler time to react to scroll and estimate heights
        await scheduler.scrollable.await('scrollEnd');

        t.is(scheduler.scrollable.scrollHeight, initialScrollHeight, 'Scroll height was correctly calculated on start');
        t.is(scheduler.rowManager.totalHeight, initialTotalHeight, 'Total height was correctly calculated on start');
    });
});
