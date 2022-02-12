import { Rectangle } from '../../build/scheduler.module.js?456730';
/* eslint-disable */

StartTest(t => {
    let scheduler,
        dependencyFeature,
        drawSpy;

    t.beforeEach(t => scheduler?.destroy?.());

    t.it('Grouped', t => {
        // async beforeEach doesn't work in umd
        t.beforeEach(async(t, next) => {
            scheduler && scheduler.destroy();

            scheduler = t.getScheduler({
                features : {
                    group  : 'name'
                },
                resourceStore   : t.getResourceStore2({}, 2),
                dependencyStore : true
            }, 2);
            dependencyFeature = scheduler.features.dependencies;
            drawSpy = t.spyOn(dependencyFeature, 'draw').callThrough();

            await t.waitForDependencies();

            next();
        });

        t.it('Should repaint fully when a group containing source node is collapsed', t => {
            t.chain(
                {
                    waitForAnimationFrame: ''
                },

                next => {
                    drawSpy.reset();
                    next();
                },

                { click : '.b-group-title:contains(Resource 1)'},

                { waitForSelectorNotFound : '.b-sch-dependency:not(.b-sch-released)' },

                {
                    waitFor : () => drawSpy.calls.count() === 1
                },

                { click : '.b-group-title:contains(Resource 1)'},

                { waitForSelector : '.b-sch-dependency:not(.b-sch-released)' },

                {
                    waitFor : () => drawSpy.calls.count() === 2
                }
            );
        });

        t.it('Should repaint fully when a group containing target node is collapsed', t => {
            t.chain(
                {
                    waitForAnimationFrame: ''
                },

                next => {
                    drawSpy.reset();
                    next();
                },

                { click: '.b-group-title:contains(Resource 2)' },

                { waitForSelectorNotFound: '.b-sch-dependency:not(.b-sch-released)' },

                { waitForAnimationFrame: '' },

                async() => t.expect(drawSpy).toHaveBeenCalled(1),

                { click: '.b-group-title:contains(Resource 2)' },

                { waitForSelector: '.b-sch-dependency:not(.b-sch-released)' },

                () => t.expect(drawSpy).toHaveBeenCalled(2)
            );
        });
    });

    t.it('ResourceStore mutation', t => {
        // async beforeEach doesn't work in umd
        t.beforeEach(async (t, next) => {
            scheduler = t.getScheduler({
                resourceStore   : t.getResourceStore2({}, 10),
                dependencyStore : true
            });

            dependencyFeature = scheduler.features.dependencies;

            await t.waitForDependencies();

            next();
        });

        t.it('Should repaint correctly if event store is filtered', t => {
            t.willFireNTimes(scheduler, 'dependenciesDrawn', 2);

            t.chain(
                { waitForAnimationFrame : '' },

                async() => {
                    // Dependency lines must be there
                    t.selectorExists('.b-sch-dependency:not(.b-sch-released)');

                    // Set to no visible events
                    scheduler.eventStore.filter(() => false);

                    await scheduler.await('dependenciesDrawn', { checkLog : false });
                },

                { waitForSelectorNotFound : '.b-sch-dependency:not(.b-sch-released)' },

                async() => {
                    // Restore all events
                    scheduler.eventStore.filter({
                        replace : true,
                        filters : () => true
                    });

                    await scheduler.await('dependenciesDrawn', { checkLog : false });
                },

                { waitForDependencies : null }
            );
        });

        t.it('Should repaint fully if resource store is filtered', t => {
            t.chain(
                { waitForAnimationFrame : '' },

                async() => {
                    // Dependency lines must be there
                    t.selectorExists('.b-sch-dependency:not(.b-sch-released)');

                    // None have been released yet
                    t.selectorNotExists('.b-sch-dependency.b-sch-released');

                    t.willFireNTimes(scheduler, 'dependenciesDrawn', 3);

                    // Filter out all but first two
                    scheduler.resourceStore.filter(rec => scheduler.resourceStore.indexOf(rec) < 2);

                    await scheduler.await('dependenciesDrawn', { checkLog : false });

                    // Only one dependency lines must be there
                    t.selectorCountIs('.b-sch-dependency:not(.b-sch-released)', 1);

                    // All but the first one have been released
                    //t.selectorExists('.b-sch-dependency.b-sch-released');

                    // No visible resources (rows)
                    scheduler.resourceStore.filter(() => false);

                    await scheduler.await('dependenciesDrawn', { checkLog : false });

                    // With no lines
                    t.selectorNotExists('.b-sch-dependency:not(.b-sch-released)')

                    // Restore all resources (rows)
                    scheduler.resourceStore.filter({
                        replace : true,
                        filters : () => true
                    });

                    await scheduler.await('dependenciesDrawn', { checkLog : false });

                    // With dependency lines
                    t.selectorExists('.b-sch-dependency:not(.b-sch-released)');
                }
            );
        });

        t.it('Should repaint fully if resource store is cleared', t => {
            t.chain(
                { waitForAnimationFrame : '' },

                async() => {
                    // Dependency lines must be there
                    t.selectorExists('.b-sch-dependency:not(.b-sch-released)');

                    // Clear all resources (rows)
                    scheduler.resourceStore.removeAll();

                    await scheduler.project.commitAsync();
                },

                { waitForAnimationFrame : '' },

                () => {
                    // With no lines
                    t.selectorNotExists('.b-sch-dependency:not(.b-sch-released)');
                }
            );
        });

        t.it('Should repaint fully if resource store is sorted', t => {
            t.chain(
                { waitForAnimationFrame : '' },

                async() => {
                    // Dependency lines must be there
                    t.selectorExists('.b-sch-dependency:not(.b-sch-released)');

                    t.willFireNTimes(scheduler, 'dependenciesDrawn', 1);

                    // Sort resources (rows)
                    scheduler.resourceStore.sort('name', false);

                    await scheduler.await('dependenciesDrawn', { checkLog : false });
                }
            );
        });
    });

    t.it('Event drag which caused no data change', t => {
        // async beforeEach doesn't work in umd
        t.beforeEach(async(t, next) => {
            scheduler?.destroy();

            let dependenciesDrawn = 0;

            scheduler = t.getScheduler({
                resourceStore   : t.getResourceStore2({}, 2),
                dependencyStore : true,
                viewPreset : {
                    base           : 'dayAndWeek',
                    timeResolution : {
                        unit : 'day'
                    }
                },
                listeners : {
                    dependenciesDrawn() {
                        dependenciesDrawn++;
                    }
                }
            }, 2);

            dependencyFeature = scheduler.features.dependencies;

            await t.waitFor(() => dependenciesDrawn === 1);

            await t.waitForDependencies();

            next();
        });

        t.it('Should repaint fully if the drag was too small to cause a data change', t => {
            let eventEl,
                eventRect;

            t.firesOnce(scheduler, 'dependenciesDrawn');

            t.chain(
                { waitForSelector : '.b-sch-event' },

                next => {
                    eventEl   = scheduler.currentOrientation.getElementsFromEventRecord(scheduler.eventStore.getAt(1))[0];
                    eventRect = Rectangle.from(eventEl);

                    next();
                },

                next => {
                    // Dependency lines must be there
                    t.selectorExists('.b-sch-dependency:not(.b-sch-released)');

                    next();
                },

                // We drag the event, but by much smaller than its snapping increment
                { drag : '.b-sch-event:contains(Assignment 2)', by : [20, 0] },

                { waitForSelectorNotFound : '.b-aborting' },

                () => {
                    // Must have redrawn dependency
                    // But the event has not moved - it's snapped back into its original position
                    t.isDeeply(Rectangle.from(eventEl), eventRect);
                }
            );
        });

        t.it('Should repaint fully if the resize made the event too small to cause a data change', t => {
            let eventEl,
                eventRect;

            t.firesAtLeastNTimes(scheduler, 'dependenciesDrawn', 1);

            t.chain(
                { waitForSelector : '.b-sch-event' },

                next => {
                    eventEl   = scheduler.currentOrientation.getElementsFromEventRecord(scheduler.eventStore.getAt(1))[0];
                    eventRect = Rectangle.from(eventEl);

                    next();
                },

                // We resize the event, but by much smaller than its snapping increment
                { drag : '.b-sch-event:contains(Assignment 2)', offset : [5, 2], by : [20, 0] },

                { waitFor : () => Rectangle.from(eventEl).width === eventRect.width },

                () => {
                    // But the event has not moved - it's snapped back into its original position
                    t.isDeeply(Rectangle.from(eventEl), eventRect);
                }
            );
        });
    });

    t.it('Zooming', t => {
        // async beforeEach doesn't work in umd
        t.beforeEach(async(t, next) => {
            scheduler         = t.getScheduler({
                resourceStore   : t.getResourceStore2({}, 2),
                dependencyStore : true
            });

            await t.waitForDependencies();

            next();
        });

        t.it('Should repaint lines after zooming', t => {

            t.chain(
                { waitForSelector : '.b-sch-dependency:not(.b-sch-released)' },

                (next) => {
                    t.waitForEvent(scheduler, 'dependenciesDrawn', next);
                    scheduler.zoomOut();
                },

                { waitForSelector : '.b-sch-dependency:not(.b-sch-released)' }
            )
        });
    });

    t.it('Horizontal scrolling in other region should not draw dependencies', async t => {
        let dependenciesDrawn = 0;

        scheduler         = t.getScheduler({
            resourceStore   : t.getResourceStore2({}, 2),
            dependencyStore : true,
            listeners : {
                dependenciesDrawn() {
                    dependenciesDrawn++;
                }
            }
        });

        await t.waitFor(() => dependenciesDrawn === 1);

        await t.waitForDependencies();

        t.firesOnce(scheduler, 'dependenciesDrawn');

        t.chain(
            {
                waitForEvent: [scheduler, 'dependenciesDrawn'],
                trigger: () => scheduler.subGrids.locked.width = 50
            },

            next => {
                scheduler.subGrids.locked.scrollable.x = 50;
                next();
            },

            {
                waitFor: 250,
                desc: 'Waiting to make sure dependencies are not drawn, async operation'
            }
        );
    });

    // https://github.com/bryntum/support/issues/695
    t.it('Should repaint while resizing event / assignment', t => {
        scheduler = t.getScheduler({
            height         : 300,
            resourceStore  : t.getResourceStore2({}, 2),
            dependencyStore: true
        }, 2);

        let lineHTML;

        t.chain(
            { waitForSelector: '.b-sch-dependency' },

            async () => lineHTML = t.query('polyline')[0].outerHTML,

            { moveCursorTo: '.b-sch-event' },
            { drag: '.b-sch-event', offset: ['100%-3', 5], by: [100, 0], dragOnly : true },

            async() => {
                t.isnt(t.query('polyline')[0].outerHTML, lineHTML, 'line repainted');
                lineHTML = t.query('polyline')[0].outerHTML;
            },

            { moveCursorBy: [-20, 0] },

            async() => t.isnt(t.query('polyline')[0].outerHTML, lineHTML, 'line repainted')
        );
    });

    // https://github.com/bryntum/support/issues/3263
    t.it('Dependencies should not reappear when event is removed', async t => {
        scheduler = await t.getSchedulerAsync({
            resourceStore   : t.getResourceStore2({}, 2),
            dependencyStore : true
        }, 2);

        await t.waitForSelector('.b-sch-dependency');

        scheduler.eventStore.first.remove();

        await t.waitFor(300);

        t.selectorNotExists('.b-sch-dependency', 'No dep lines reappeared');
    });
});
