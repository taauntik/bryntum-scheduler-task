import { Base, Override, DomSync, Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    //region Make sure there is no non-released nodes in the released map
    // Should be under StartTest to avoid "ReferenceError: Override is not defined" in UMD tests
    class DomSyncOverride {
        static get target() {
            return {
                class   : DomSync,
                product : 'scheduler'
            };
        }

        static syncChildrenCleanup(targetElement, ...args) {
            this._overridden.syncChildrenCleanup.apply(this, [targetElement, ...args]);

            const entries = Object.entries(targetElement.releasedIdMap);

            for (const [key, targetNode] of entries) {
                if (!targetNode.isReleased) {
                    console.log(targetNode);
                    throw new Error(`Node ${key} with tickIndex ${targetNode.dataset.tickIndex}`);
                }
            }
        }
    }

    Override.apply(DomSyncOverride);
    //endregion

    let scheduler, scheduler2;

    t.beforeEach(() => {
        Base.destroy(scheduler, scheduler2);
    });

    //https://github.com/bryntum/support/issues/2338
    t.it('Time axis should render header elements correct when change width and scroll with animation', async t => {
        scheduler = t.getScheduler({
            appendTo   : document.body,
            width      : 1000,
            height     : 300,
            startDate  : new Date(2018, 0, 1, 6),
            endDate    : new Date(2018, 0, 1, 20),
            viewPreset : 'minuteAndHour'
        });

        await t.waitForElementTop('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=0]');

        // Change width
        scheduler.width = 400;

        // Reproducible only when animation is enabled
        await scheduler.scrollHorizontallyTo(1000, true);
        await scheduler.scrollHorizontallyTo(0, true);

        // Check presence of first cells in timeaxis header
        await t.waitForElementTop('.b-sch-header-row-0 .b-sch-header-timeaxis-cell[data-tick-index=0] span:contains(Mon 01/01, 6AM)');
        await t.waitForElementTop('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=0] span:contains(00)');
        await t.waitForElementTop('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=1] span:contains(30)');
    });

    // https://github.com/bryntum/support/issues/2523
    t.it('Time axis should render header elements correct when grids are partnered', async t => {
        scheduler = t.getScheduler({
            cls        : 'scheduler1',
            width      : 1000,
            height     : 300,
            startDate  : new Date(2018, 0, 1, 6),
            endDate    : new Date(2018, 0, 1, 20),
            viewPreset : 'minuteAndHour'
        });

        scheduler2 = new Scheduler({
            cls      : 'scheduler2',
            width    : 1000,
            height   : 300,
            appendTo : document.body,
            columns  : [
                { text : 'Name', sortable : true, width : 100, field : 'name', locked : true }
            ],
            partner       : scheduler,
            resourceStore : scheduler.resourceStore,
            eventStore    : scheduler.eventStore
        });

        await t.waitForElementTop('.scheduler1 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=0]');
        await t.waitForElementTop('.scheduler2 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=0]');

        // Reproducible only when animation is enabled
        await scheduler.scrollHorizontallyTo(1000, true);

        // Check presence of last cells in timeaxis header of the first scheduler
        await t.waitForElementTop('.scheduler1 .b-sch-header-row-0 .b-sch-header-timeaxis-cell[data-tick-index=13] span:contains(Mon 01/01, 7PM)');
        await t.waitForElementTop('.scheduler1 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=26] span:contains(00)');
        await t.waitForElementTop('.scheduler1 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=27] span:contains(30)');

        // Check presence of last cells in timeaxis header of the second scheduler
        await t.waitForElementTop('.scheduler2 .b-sch-header-row-0 .b-sch-header-timeaxis-cell[data-tick-index=13] span:contains(Mon 01/01, 7PM)');
        await t.waitForElementTop('.scheduler2 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=26] span:contains(00)');
        await t.waitForElementTop('.scheduler2 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=27] span:contains(30)');
    });

    t.it('Time axis should render header elements correct when grids are partnered dynamically', async t => {
        scheduler = t.getScheduler({
            cls        : 'scheduler1',
            width      : 1000,
            height     : 300,
            startDate  : new Date(2018, 0, 1, 6),
            endDate    : new Date(2018, 0, 1, 20),
            viewPreset : 'minuteAndHour'
        });

        scheduler2 = new Scheduler({
            appendTo   : document.body,
            cls        : 'scheduler2',
            width      : 1000,
            height     : 300,
            startDate  : new Date(2018, 0, 1, 6),
            endDate    : new Date(2018, 0, 1, 20),
            viewPreset : 'minuteAndHour',
            columns    : [
                { text : 'Name', sortable : true, width : 100, field : 'name', locked : true }
            ],
            resourceStore : scheduler.resourceStore,
            eventStore    : scheduler.eventStore
        });

        scheduler2.partner = scheduler;

        await t.waitForElementTop('.scheduler1 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=0]');
        await t.waitForElementTop('.scheduler2 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=0]');

        // Reproducible only when animation is enabled
        await scheduler.scrollHorizontallyTo(1000, true);

        // Check presence of last cells in timeaxis header of the first scheduler
        await t.waitForElementTop('.scheduler1 .b-sch-header-row-0 .b-sch-header-timeaxis-cell[data-tick-index=13] span:contains(Mon 01/01, 7PM)');
        await t.waitForElementTop('.scheduler1 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=26] span:contains(00)');
        await t.waitForElementTop('.scheduler1 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=27] span:contains(30)');

        // Check presence of last cells in timeaxis header of the second scheduler
        await t.waitForElementTop('.scheduler2 .b-sch-header-row-0 .b-sch-header-timeaxis-cell[data-tick-index=13] span:contains(Mon 01/01, 7PM)');
        await t.waitForElementTop('.scheduler2 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=26] span:contains(00)');
        await t.waitForElementTop('.scheduler2 .b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index=27] span:contains(30)');
    });
});
