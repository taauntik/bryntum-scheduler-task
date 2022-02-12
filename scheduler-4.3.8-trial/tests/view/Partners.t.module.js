import { Scheduler, TimeAxisViewModel, TimeAxis, DomHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    const
        resources     = [
            { id : 1, name : 'Arcady' }
        ],
        timeAxisSpy   = t.spyOn(TimeAxis.prototype, 'construct').callThrough(),
        timeAxisVMSpy = t.spyOn(TimeAxisViewModel.prototype, 'construct').callThrough();

    let firstScheduler, secondScheduler, thirdScheduler;

    async function setup() {
        firstScheduler = await t.getSchedulerAsync({
            id       : 'top-scheduler',
            appendTo : document.body,
            height   : 200,

            columns : [{
                text  : 'Staff',
                width : '10em',
                field : 'name'
            }],

            resources : resources,

            startDate  : new Date(2018, 0, 1, 6),
            endDate    : new Date(2018, 0, 1, 20),
            viewPreset : 'minuteAndHour',
            style      : 'margin-bottom:20px'
        });

        secondScheduler = new Scheduler({
            id          : 'bottom-scheduler',
            appendTo    : document.body,
            height      : 200,
            partner     : firstScheduler,
            hideHeaders : true,

            columns : [{
                text  : 'Staff',
                width : '10em',
                field : 'name'
            }],

            resourceStore : firstScheduler.resourceStore
        });

        // Wait for resize listeners which happen on layout
        await t.waitForAnimationFrame();
    }

    t.beforeEach(() => {
        timeAxisSpy?.reset();
        timeAxisVMSpy?.reset();
        firstScheduler && !firstScheduler.isDestroyed && firstScheduler.destroy();
        secondScheduler && !secondScheduler.isDestroyed && secondScheduler.destroy();
        thirdScheduler && !thirdScheduler.isDestroyed && thirdScheduler.destroy();
    });

    // https://github.com/bryntum/support/issues/3199
    t.it('Should properly update timeAxisViewModel when adding partner at runtime, in vertical mode', async t => {
        const config = {
            appendTo    : document.body,
            height      : 300,
            mode        : 'vertical',
            resources,
            visibleDate : {
                date  : new Date(2018, 0, 1, 15),
                block : 'start'
            },
            startDate  : new Date(2018, 0, 1, 6),
            endDate    : new Date(2018, 0, 1, 20),
            viewPreset : 'minuteAndHour',
            style      : 'margin-bottom:1em',
            events     : [
                {
                    id         : 1,
                    resourceId : 1,
                    startDate  : new Date(2018, 0, 1, 15),
                    endDate    : new Date(2018, 0, 1, 16),
                    name       : 'foo'
                }
            ]
        };

        firstScheduler = new Scheduler(Object.assign({
            id : 'firstScheduler'
        }, config));

        secondScheduler = new Scheduler(Object.assign({
            id : 'secondScheduler'
        }, config));

        await t.waitForSelector('#secondScheduler .b-sch-event');

        secondScheduler.partner = firstScheduler;

        await t.waitForSelector('#secondScheduler .b-sch-event');

        firstScheduler.zoomOut();

        await t.waitForElementVisible('#firstScheduler .b-sch-event');
        await t.waitForElementVisible('#secondScheduler .b-sch-event');
        t.elementIsVisible('#firstScheduler .b-sch-event', 'event visible in first scheduler');
        t.elementIsVisible('#secondScheduler .b-sch-event', 'event visible in second scheduler');
        await t.waitFor(() => secondScheduler.verticalTimeAxisColumn.view.element.offsetHeight === firstScheduler.verticalTimeAxisColumn.view.element.offsetHeight);

        t.is(secondScheduler.verticalTimeAxisColumn.width, firstScheduler.verticalTimeAxisColumn.width, 'Time axis column width is ok');
        t.is(secondScheduler.verticalTimeAxisColumn.view.element.offsetHeight, firstScheduler.verticalTimeAxisColumn.view.element.offsetHeight, 'Time axis view element height is ok');
    });

    t.it('Scroll should be synced', async t => {
        await setup();

        t.chain(
            async() => {
                firstScheduler.subGrids.normal.scrollable.x = 100;

                await secondScheduler.subGrids.normal.scrollable.await('scrollEnd', { checkLog : false });
            },

            {
                waitFor : () => t.samePx(secondScheduler.subGrids.normal.scrollable.x, 100),
                desc    : 'Bottom partner scroll is ok'
            },

            async() => {
                secondScheduler.subGrids.normal.scrollable.x = 50;

                await firstScheduler.subGrids.normal.header.scrollable.await('scrollEnd', { checkLog : false });
            },

            {
                waitFor : () => t.samePx(firstScheduler.subGrids.normal.scrollable.x, 50),
                desc    : 'Top partner scroll is ok'
            },

            async() => {
                // Should be able to destroy a partner with no errors
                secondScheduler.destroy();

                firstScheduler.subGrids.normal.scrollable.x = 100;

                // Wait for the scroll event to fire. Nothing should happen
                // if the link has been broken property upon destruction
                await firstScheduler.subGrids.normal.scrollable.await('scroll', { checkLog : false });
            }
        );
    });

    t.it('Width + collapsed state should be synced', async t => {
        await setup();

        t.chain(
            next => {
                // All these events must occur before we can proceed to the next phase of the test
                t.waitForGridEvents([
                    [firstScheduler.subGrids.locked, 'resize'],
                    [firstScheduler.subGrids.normal, 'resize'],
                    [secondScheduler.subGrids.locked, 'resize'],
                    [secondScheduler.subGrids.normal, 'resize']
                ], next);

                firstScheduler.subGrids.locked.width += 20;
            },

            next => {
                t.is(secondScheduler.subGrids.locked.width, firstScheduler.subGrids.locked.width, 'Width sync #1');

                // All these events must occur before we can proceed to the next phase of the test
                t.waitForGridEvents([
                    [firstScheduler.subGrids.locked, 'resize'],
                    [firstScheduler.subGrids.normal, 'resize'],
                    [secondScheduler.subGrids.locked, 'resize'],
                    [secondScheduler.subGrids.normal, 'resize']
                ], next);

                secondScheduler.subGrids.locked.width += 20;
            },

            next => {
                t.is(secondScheduler.subGrids.locked.width, firstScheduler.subGrids.locked.width, 'Width sync #2');

                // All these events must occur before we can proceed to the next phase of the test
                t.waitForGridEvents([
                    [firstScheduler.subGrids.locked, 'resize'],
                    [firstScheduler.subGrids.normal, 'resize'],
                    [secondScheduler.subGrids.locked, 'resize'],
                    [secondScheduler.subGrids.normal, 'resize']
                ], next);

                secondScheduler.subGrids.locked.collapse();
            },

            // Check that collapse has happened in both grids.
            // Then check that we can destroy a partner with no errors
            () => {
                t.is(secondScheduler.subGrids.locked.collapsed, firstScheduler.subGrids.locked.collapsed, 'Collapse sync');

                t.ok(firstScheduler.subGrids.locked.collapsed, 'Top scheduler has collapsed the locked part');
                t.ok(secondScheduler.subGrids.locked.collapsed, 'Bottom scheduler has collapsed the locked part in synchrony');

                // Should be able to destroy a partner with no errors
                secondScheduler.destroy();
            }
        );
    });

    t.it('Should support changing partnerships at runtime', async t => {
        await setup();

        t.ok(firstScheduler.isPartneredWith(secondScheduler), 'Partnered');
        t.ok(secondScheduler.isPartneredWith(firstScheduler), 'Partnered');

        firstScheduler.removePartner(secondScheduler);

        t.notOk(firstScheduler.isPartneredWith(secondScheduler), 'Not Partnered');
        t.notOk(secondScheduler.isPartneredWith(firstScheduler), 'Not Partnered');

        firstScheduler.subGrids.normal.scrollable.x += 100;

        // wait some small amount to ensure no scrolling happens
        await t.waitFor(100);

        t.is(secondScheduler.subGrids.normal.scrollable.x, 0, 'Bottom scroll not affected');

        firstScheduler.addPartner(secondScheduler);

        await t.waitFor(() => secondScheduler.subGrids.normal.scrollable.x === 100);

        t.ok(firstScheduler.isPartneredWith(secondScheduler), 'Partnered');
        t.ok(secondScheduler.isPartneredWith(firstScheduler), 'Partnered');

        t.pass('Re-partnered, scroll is synced');

        firstScheduler.removePartner(secondScheduler);

        // Now let's pair second to another scheduler
        thirdScheduler = new Scheduler({
            id          : 'thirdScheduler',
            appendTo    : document.body,
            height      : 200,
            hideHeaders : true,

            columns : [{
                text  : 'Staff',
                width : '10em',
                field : 'name'
            }],

            resources : [
                {
                    name : 'Bengt'
                }
            ]
        });

        thirdScheduler.addPartner(secondScheduler);

        t.notOk(firstScheduler.isPartneredWith(secondScheduler), '1st not partnered with 2nd');
        t.ok(thirdScheduler.isPartneredWith(secondScheduler), '3rd partnered with 2nd');

        secondScheduler.subGrids.normal.scrollable.x = 200;
        await t.waitFor(() => thirdScheduler.subGrids.normal.scrollable.x === 200);

        t.is(firstScheduler.subGrids.normal.scrollable.x, 100, 'First scheduler did not react');
    });

    t.it('Should sync all state after zoom', async t => {
        await setup();

        function assertViewPresets() {
            // Delete reference to scheduler from event to avoid traversing every property of scheduler
            delete firstScheduler.viewPreset.options.event.source;
            delete secondScheduler.viewPreset.options.event.source;

            t.is(firstScheduler.viewPreset, secondScheduler.viewPreset);
            t.is(firstScheduler.startDate, secondScheduler.startDate);
            t.is(firstScheduler.endDate, secondScheduler.endDate);
            // not using t.is here, because in IE11 it will start traversing every property and eventually result in error
            t.ok(firstScheduler.timeAxisViewModel === secondScheduler.timeAxisViewModel);
        }

        assertViewPresets();
        t.is(firstScheduler.subGrids.normal.scrollable.x, secondScheduler.subGrids.normal.scrollable.x);

        t.chain(
            async() => {
                firstScheduler.zoomOut();
                assertViewPresets();
            },

            { waitFor : () => firstScheduler.subGrids.normal.scrollable.x = secondScheduler.subGrids.normal.scrollable.x },

            async() => {
                secondScheduler.zoomIn();
                assertViewPresets();
            },

            { waitFor : () => firstScheduler.subGrids.normal.scrollable.x = secondScheduler.subGrids.normal.scrollable.x },

            () => {
                t.expect(timeAxisSpy).toHaveBeenCalled(1);
                t.expect(timeAxisVMSpy).toHaveBeenCalled(1);
            }
        );
    });

    t.it('Should properly update timeAxisViewModel when adding partner at runtime', async t => {
        const config = {
            appendTo : document.body,
            height   : 200,

            columns : [{
                text  : 'Staff',
                width : '10em',
                field : 'name'
            }],

            resources,

            startDate  : new Date(2018, 0, 1, 6),
            endDate    : new Date(2018, 0, 1, 20),
            viewPreset : 'minuteAndHour',
            style      : 'margin-bottom:20px'
        };

        firstScheduler = new Scheduler(Object.assign({
            id : 'firstScheduler'
        }, config));

        secondScheduler = new Scheduler(Object.assign({
            id : 'secondScheduler'
        }, config));

        secondScheduler.partner = firstScheduler;

        await t.click('#secondScheduler .b-sch-header-timeaxis-cell');

        firstScheduler.zoomOut();

        t.is(secondScheduler.timeAxisColumn.width, firstScheduler.timeAxisColumn.width, 'Time axis column width is ok');
    });

    // https://github.com/bryntum/support/issues/2696
    t.it('Should sync subGrid states when adding partner at runtime', async t => {
        const config = {
            appendTo : document.body,
            height   : 200,

            resources,

            startDate  : new Date(2018, 0, 1, 6),
            endDate    : new Date(2018, 0, 1, 20),
            viewPreset : 'minuteAndHour',
            style      : 'margin-bottom:20px'
        };

        firstScheduler = Scheduler.new({
            id      : 'firstScheduler',
            columns : [{
                text  : 'Staff',
                width : '10em',
                field : 'name'
            }],
            subGridConfigs : {
                locked : 300
            }
        }, config);

        secondScheduler = Scheduler.new({
            id      : 'secondScheduler',
            columns : [
                {
                    field : 'id'
                },
                {
                    text  : 'Staff',
                    width : '12em',
                    field : 'name'
                }
            ],
            subGridConfigs : {
                locked : 200
            }
        }, config);

        secondScheduler.partner = firstScheduler;

        t.is(firstScheduler.subGrids.locked.width, secondScheduler.subGrids.locked.width, 'Widths synced');
    });

    // https://github.com/bryntum/support/issues/3662
    t.it('Should sync subGrid collapsed states after a subgrid is collapsed', async t => {
        const config = {
            appendTo   : document.body,
            height     : 200,
            resources,
            startDate  : new Date(2018, 0, 1, 6),
            endDate    : new Date(2018, 0, 1, 20),
            viewPreset : 'minuteAndHour',
            style      : 'margin-bottom:20px'
        };

        firstScheduler = Scheduler.new({
            id      : 'firstScheduler',
            columns : [{
                text  : 'Staff',
                width : '10em',
                field : 'name'
            }],
            subGridConfigs : {
                locked : 300
            }
        }, config);

        secondScheduler = Scheduler.new({
            id      : 'secondScheduler',
            partner : firstScheduler,
            columns : [
                {
                    field : 'id'
                },
                {
                    text  : 'Staff',
                    width : '12em',
                    field : 'name'
                }
            ]
        }, config);

        firstScheduler.subGrids.normal.collapse();
        t.is(secondScheduler.subGrids.normal.collapsed, true, 'Partner normal subGrid was collapsed too');

        firstScheduler.subGrids.normal.expand();
        t.is(secondScheduler.subGrids.normal.collapsed, false, 'Partner normal subGrid was expanded too');

        await t.waitFor(() => firstScheduler.subGrids.locked.width === secondScheduler.subGrids.locked.width);
        t.is(firstScheduler.subGrids.locked.width, secondScheduler.subGrids.locked.width, 'Widths in sync');
    });

    if (DomHelper.scrollBarWidth) {
        // https://github.com/bryntum/support/issues/3495
        t.it('Should keep scrollbars in sync', async t => {
            const config = {
                appendTo   : document.body,
                height     : 200,
                startDate  : new Date(2018, 0, 1, 6),
                endDate    : new Date(2018, 0, 1, 13),
                viewPreset : 'minuteAndHour'
            };

            firstScheduler = Scheduler.new({
                resources : [{
                    id   : 1,
                    name : 'Arcady'
                }, {
                    id   : 2,
                    name : 'Nigel'
                }],
                id      : 'firstScheduler',
                columns : [{
                    text  : 'Staff',
                    width : '10em',
                    field : 'name'
                }],
                subGridConfigs : {
                    locked : 300
                }
            }, config);

            secondScheduler = Scheduler.new({
                resources : [{
                    id   : 1,
                    name : 'Arcady'
                }, {
                    id   : 2,
                    name : 'Nigel'
                }, {
                    id   : 3,
                    name : 'Max'
                }],
                id      : 'secondScheduler',
                partner : firstScheduler,
                columns : [{
                    text  : 'Staff',
                    width : '12em',
                    field : 'name'
                }]
            }, config);

            // Each must know about the other
            t.is(firstScheduler.partners[0], secondScheduler);
            t.is(secondScheduler.partners[0], firstScheduler);

            const
                firstHeaderEl         = firstScheduler.timeAxisSubGrid.header.element,
                firstTimeAxisElement  = firstScheduler.timeAxisSubGridElement,
                secondHeaderEl        = secondScheduler.timeAxisSubGrid.header.element,
                secondTimeAxisElement = secondScheduler.timeAxisSubGridElement;

            const overflowingWidth = secondTimeAxisElement.offsetWidth;

            // All time axes are the same width
            t.is(firstHeaderEl.offsetWidth, secondTimeAxisElement.offsetWidth);
            t.is(secondHeaderEl.offsetWidth, firstTimeAxisElement.offsetWidth);
            t.is(firstTimeAxisElement.offsetWidth, secondTimeAxisElement.offsetWidth);

            // Change second one to not overflowing
            secondScheduler.resourceStore.remove(secondScheduler.resourceStore.last);

            // Wait for processing to have made adjustments
            await t.waitFor(() => {
                return (
                    firstTimeAxisElement.offsetWidth > overflowingWidth &&
                    firstHeaderEl.offsetWidth > overflowingWidth
                );
            });

            // Now there's no overflow, width has increased
            t.isGreater(firstTimeAxisElement.offsetWidth, overflowingWidth);
            t.isGreater(firstHeaderEl.offsetWidth, overflowingWidth);

            // All time axes are the same width
            t.is(firstHeaderEl.offsetWidth, secondTimeAxisElement.offsetWidth);
            t.is(secondHeaderEl.offsetWidth, firstTimeAxisElement.offsetWidth);
            t.is(firstTimeAxisElement.offsetWidth, secondTimeAxisElement.offsetWidth);

            // Make second one overflow again
            secondScheduler.height -= 75;

            // Wait for processing to have made adjustments
            await t.waitFor(() => {
                return (
                    firstTimeAxisElement.offsetWidth === overflowingWidth &&
                    firstHeaderEl.offsetWidth === overflowingWidth &&
                    secondTimeAxisElement.offsetWidth === overflowingWidth &&
                    secondHeaderEl.offsetWidth === overflowingWidth
                );
            });

            // All time axes are the same width
            t.is(firstHeaderEl.offsetWidth, secondTimeAxisElement.offsetWidth);
            t.is(secondHeaderEl.offsetWidth, firstTimeAxisElement.offsetWidth);
            t.is(firstTimeAxisElement.offsetWidth, secondTimeAxisElement.offsetWidth);
        });
    }
});
