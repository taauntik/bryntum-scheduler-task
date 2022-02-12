import { Scheduler, ArrayHelper, Rectangle } from '../../build/scheduler.module.js?456730';

StartTest(t => {

    let scheduler;

    t.beforeEach(t => scheduler && !scheduler.isDestroyed && scheduler.destroy());

    async function setupScheduler(t, config = {}) {
        scheduler = new Scheduler(Object.assign({
            appendTo : document.body,

            startDate : new Date(2019, 2, 10),
            endDate   : new Date(2019, 2, 17),

            features : {
                dependencies : true
            },

            resources : ArrayHelper.populate(10, i => ({ id : 'r' + (i + 1), name : 'Resource ' + (i + 1) })),

            events : [
                { id : 'e1', startDate : new Date(2019, 2, 10), duration : 2, name : 'Single' },
                { id : 'e2', startDate : new Date(2019, 2, 14), duration : 2, name : 'Multi A' },
                { id : 'e3', startDate : new Date(2019, 2, 10), duration : 1, name : 'Multi B' }
            ],

            assignments : [
                { id : 'a1', eventId : 'e1', resourceId : 'r2' }, // Single
                { id : 'a2', eventId : 'e2', resourceId : 'r2' }, // Multi A
                { id : 'a3', eventId : 'e2', resourceId : 'r5' }, // Multi A
                { id : 'a4', eventId : 'e2', resourceId : 'r6' }, // Multi A
                { id : 'a5', eventId : 'e3', resourceId : 'r4' }, // Multi B
                { id : 'a6', eventId : 'e3', resourceId : 'r5' }  // Multi B
            ],

            useInitialAnimation   : false,
            enableEventAnimations : false
        }, config));

        await t.waitForProjectReady(scheduler.project);

        if (scheduler.dependencies.length) {
            await t.waitForDependencies();
        }
    }

    async function assertDepEndToStart(t, from, to, flip = false) {
        const depSelector = `[fromId="${from}"][toId="${to}"]`;
        await t.waitForSelector(depSelector);

        const
            depLine     = t.getSVGBox(document.querySelector(depSelector)),
            fromElement = document.querySelector(`[data-assignment-id="${flip ? to : from}"]`).getBoundingClientRect(),
            toElement   = document.querySelector(`[data-assignment-id="${flip ? from : to}"]`).getBoundingClientRect();

        t.diag(`From ${from} to ${to}`);

        t.isApprox(depLine.left, fromElement.right, 'Line from right edge of source event');
        t.isApprox(depLine.right, toElement.left, 'Line to left edge of target event');

        const
            maxTop = Math.max(fromElement.top, toElement.top),
            minTop = Math.min(fromElement.top, toElement.top);

        // Dependency line has an arrow which is 6px high, also there's a gap on top. Setting threshold to 3px + extra 2px
        // It looks centered
        t.isApprox(depLine.top, minTop + fromElement.height / 2, 5, 'Top');
        t.isApprox(depLine.bottom, maxTop + fromElement.height / 2, 5, 'Bottom');
    }

    async function assertDepNotFound(t, from, to) {
        await t.selectorNotExists(`[fromId="${from}"][toId="${to}"]`);
    }

    async function assertAllDeps(t) {
        await assertDepEndToStart(t, 'a1', 'a2');
        await assertDepEndToStart(t, 'a1', 'a3');
        await assertDepEndToStart(t, 'a1', 'a4');
        await assertDepEndToStart(t, 'a5', 'a2');
        await assertDepEndToStart(t, 'a5', 'a3');
        await assertDepEndToStart(t, 'a5', 'a4');
        await assertDepEndToStart(t, 'a6', 'a2');
        await assertDepEndToStart(t, 'a6', 'a3');
        await assertDepEndToStart(t, 'a6', 'a4');
    }

    t.it('Basic drawing', t => {
        t.it('Should draw correctly for single to multi', async t => {
            await setupScheduler(t, {
                dependencies : [
                    { id : 'd1', from : 'e1', to : 'e2' }
                ]
            });

            await assertDepEndToStart(t, 'a1', 'a2');
            await assertDepEndToStart(t, 'a1', 'a3');
            await assertDepEndToStart(t, 'a1', 'a4');
        });

        t.it('Should draw correctly for multi to single', async t => {
            await setupScheduler(t, {
                dependencies : [
                    { id : 'd1', from : 'e2', to : 'e1', fromSide : 'left', toSide : 'right' }
                ]
            });

            await assertDepEndToStart(t, 'a2', 'a1', true);
            await assertDepEndToStart(t, 'a3', 'a1', true);
            await assertDepEndToStart(t, 'a4', 'a1', true);
        });

        t.it('Should draw correctly for multi to multi', async t => {
            await setupScheduler(t, {
                dependencies : [
                    { id : 'd1', from : 'e3', to : 'e2' }
                ]
            });

            await assertDepEndToStart(t, 'a5', 'a2');
            await assertDepEndToStart(t, 'a5', 'a3');
            await assertDepEndToStart(t, 'a5', 'a4');
            await assertDepEndToStart(t, 'a6', 'a2');
            await assertDepEndToStart(t, 'a6', 'a3');
            await assertDepEndToStart(t, 'a6', 'a4');
        });
    });

    t.it('Event CRUD', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e3', to : 'e2' }
            ],
            enableEventAnimations : false
        });

        t.chain(
            next => {
                t.waitForEvent(scheduler, 'dependenciesdrawn', next);
                // Update
                scheduler.eventStore.getById('e2').startDate = new Date(2019, 2, 15);

                scheduler.project.commitAsync();
            },
            async() => {
                await assertAllDeps(t);

                // Remove
                scheduler.eventStore.getById('e3').remove();

                await scheduler.project.commitAsync();

                await assertDepEndToStart(t, 'a1', 'a2');
                await assertDepEndToStart(t, 'a1', 'a3');
                await assertDepEndToStart(t, 'a1', 'a4');
                await assertDepNotFound(t, 'a5', 'a2');
                await assertDepNotFound(t, 'a5', 'a3');
                await assertDepNotFound(t, 'a5', 'a4');
                await assertDepNotFound(t, 'a6', 'a2');
                await assertDepNotFound(t, 'a6', 'a3');
                await assertDepNotFound(t, 'a6', 'a4');

                // Add not covered since it needs an assignment, tested under Assignment CRUD
            }
        );
    });

    t.it('Event filtering', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e3', to : 'e2' }
            ]
        });

        scheduler.eventStore.filterBy(event => event.id !== 'e1');

        t.chain(
            { waitForAnimationFrame : null },

            async() => {
                await assertDepNotFound(t, 'a1', 'a2');
                await assertDepNotFound(t, 'a1', 'a3');
                await assertDepNotFound(t, 'a1', 'a4');
                await assertDepEndToStart(t, 'a5', 'a2');
                await assertDepEndToStart(t, 'a5', 'a3');
                await assertDepEndToStart(t, 'a5', 'a4');
                await assertDepEndToStart(t, 'a6', 'a2');
                await assertDepEndToStart(t, 'a6', 'a3');
                await assertDepEndToStart(t, 'a6', 'a4');

                scheduler.eventStore.clearFilters();
            },

            { waitForAnimationFrame : null },

            async() => assertAllDeps(t)
        );
    });

    t.it('Resource CRUD', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e3', to : 'e2' }
            ]
        });

        t.chain(
            // Add
            {
                waitForEvent : [scheduler, 'dependenciesDrawn'],
                trigger      : () => scheduler.resourceStore.insert(3, { id : 'r20' })
            },

            async() => assertAllDeps(t),

            // Remove empty resource in the middle
            {
                waitForEvent : [scheduler, 'dependenciesDrawn'],
                trigger      : () => scheduler.resourceStore.remove('r3')
            },

            async() => assertAllDeps(t),

            // Remove resource with events
            {
                waitForEvent : [scheduler, 'dependenciesDrawn'],
                trigger      : () => {
                    scheduler.resourceStore.remove('r2');
                }
            },

            // Some weird timing thing going on, ends up correct
            { waitForAnimationFrame : null },

            async() => {
                await assertDepNotFound(t, 'a1', 'a2');
                await assertDepNotFound(t, 'a1', 'a3');
                await assertDepNotFound(t, 'a1', 'a4');
                await assertDepNotFound(t, 'a5', 'a2');
                await assertDepEndToStart(t, 'a5', 'a3');
                await assertDepEndToStart(t, 'a5', 'a4');
                await assertDepNotFound(t, 'a6', 'a2');
                await assertDepEndToStart(t, 'a6', 'a3');
                await assertDepEndToStart(t, 'a6', 'a4');
            }
        );
    });

    t.it('Resource filtering', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e3', to : 'e2' }
            ]
        });

        scheduler.resourceStore.filterBy(resource => resource.id !== 'r2');

        t.chain(
            { waitForAnimationFrame : null },

            async() => {
                await assertDepNotFound(t, 'a1', 'a2');
                await assertDepNotFound(t, 'a1', 'a3');
                await assertDepNotFound(t, 'a1', 'a4');
                await assertDepNotFound(t, 'a5', 'a2');
                await assertDepEndToStart(t, 'a5', 'a3');
                await assertDepEndToStart(t, 'a5', 'a4');
                await assertDepNotFound(t, 'a6', 'a2');
                await assertDepEndToStart(t, 'a6', 'a3');
                await assertDepEndToStart(t, 'a6', 'a4');

                scheduler.resourceStore.clearFilters();
            },

            { waitForAnimationFrame : null },

            async() => await assertAllDeps(t)
        );
    });

    t.it('Assignment CRUD', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e3', to : 'e2' }
            ]
        });

        t.chain(
            next => {
                t.waitForEvent(scheduler, 'dependenciesdrawn', next);
                // Add
                scheduler.assignmentStore.add({ id : 'a7', resourceId : 'r1', eventId : 'e2' });
            },

            async() => {
                await assertAllDeps(t);
                await assertDepEndToStart(t, 'a1', 'a7');

                // Remove
                scheduler.assignmentStore.remove('a2');
            },

            { waitForProjectReady : scheduler },

            async() => {
                await assertDepNotFound(t, 'a1', 'a2');
                await assertDepEndToStart(t, 'a1', 'a3');
                await assertDepEndToStart(t, 'a1', 'a4');
                await assertDepNotFound(t, 'a5', 'a2');
                await assertDepEndToStart(t, 'a5', 'a3');
                await assertDepEndToStart(t, 'a5', 'a4');
                await assertDepNotFound(t, 'a6', 'a2');
                await assertDepEndToStart(t, 'a6', 'a3');
                await assertDepEndToStart(t, 'a6', 'a4');
            },

            next => {
                t.waitForEvent(scheduler, 'dependenciesdrawn', next);
                // Update
                scheduler.assignmentStore.getById('a3').resourceId = 'r10';
                // TODO: The line above does not invalidate the graph, making the code below fail
            },

            { waitForProjectReady : scheduler },

            async() => {
                await assertDepEndToStart(t, 'a1', 'a3');
                await assertDepEndToStart(t, 'a5', 'a3');
                await assertDepEndToStart(t, 'a6', 'a3');
            }
        );
    });

    t.it('Assignment filtering', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e3', to : 'e2' }
            ]
        });

        scheduler.assignmentStore.filterBy(assignment => assignment.resourceId !== 'r2');

        t.chain(
            { waitForAnimationFrame : null },

            async() => {
                await assertDepNotFound(t, 'a1', 'a2');
                await assertDepNotFound(t, 'a1', 'a3');
                await assertDepNotFound(t, 'a1', 'a4');
                await assertDepNotFound(t, 'a5', 'a2');
                await assertDepEndToStart(t, 'a5', 'a3');
                await assertDepEndToStart(t, 'a5', 'a4');
                await assertDepNotFound(t, 'a6', 'a2');
                await assertDepEndToStart(t, 'a6', 'a3');
                await assertDepEndToStart(t, 'a6', 'a4');

                scheduler.assignmentStore.clearFilters();
            },

            { waitForAnimationFrame : null },

            async() => await assertAllDeps(t)
        );
    });

    t.it('Dependency CRUD', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' }
            ]
        });

        t.chain(
            // Add
            {
                waitForEvent : [scheduler, 'dependenciesDrawn'],
                trigger      : () => scheduler.dependencyStore.add({ id : 'd2', from : 'e3', to : 'e2' })
            },

            async() => await assertAllDeps(t),

            // Remove
            {
                waitForEvent : [scheduler, 'dependenciesDrawn'],
                trigger      : () => scheduler.dependencyStore.first.remove()
            },

            async() => {
                await assertDepNotFound(t, 'a1', 'a2');
                await assertDepNotFound(t, 'a1', 'a3');
                await assertDepNotFound(t, 'a1', 'a4');
            },

            // Update
            {
                waitForEvent : [scheduler, 'dependenciesDrawn'],
                trigger      : () => scheduler.dependencyStore.first.from = 'e1'
            },

            { waitForSelector : '.b-sch-dependency' },

            async() => {
                await assertDepEndToStart(t, 'a1', 'a2');
                await assertDepEndToStart(t, 'a1', 'a3');
                await assertDepEndToStart(t, 'a1', 'a4');
                await assertDepNotFound(t, 'a5', 'a2');
                await assertDepNotFound(t, 'a5', 'a3');
                await assertDepNotFound(t, 'a5', 'a4');
                await assertDepNotFound(t, 'a6', 'a2');
                await assertDepNotFound(t, 'a6', 'a3');
                await assertDepNotFound(t, 'a6', 'a4');

                // // Remove all
                scheduler.dependencyStore.removeAll();
            },

            { waitForSelectorNotFound : '.b-sch-dependency' },

            async() => {
                await assertDepNotFound(t, 'a1', 'a2');
                await assertDepNotFound(t, 'a1', 'a3');
                await assertDepNotFound(t, 'a1', 'a4');
                await assertDepNotFound(t, 'a5', 'a2');
                await assertDepNotFound(t, 'a5', 'a3');
                await assertDepNotFound(t, 'a5', 'a4');
                await assertDepNotFound(t, 'a6', 'a2');
                await assertDepNotFound(t, 'a6', 'a3');
                await assertDepNotFound(t, 'a6', 'a4');
            }
        );
    });

    t.it('Dependency filtering', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' },
                { id : 'd2', from : 'e3', to : 'e2' }
            ]
        });

        scheduler.dependencyStore.filterBy(dependency => dependency.id !== 'd2');

        t.chain(
            { waitForAnimationFrame : null },

            async() => {
                await assertDepEndToStart(t, 'a1', 'a2');
                await assertDepEndToStart(t, 'a1', 'a3');
                await assertDepEndToStart(t, 'a1', 'a4');
                await assertDepNotFound(t, 'a5', 'a2');
                await assertDepNotFound(t, 'a5', 'a3');
                await assertDepNotFound(t, 'a5', 'a4');
                await assertDepNotFound(t, 'a6', 'a2');
                await assertDepNotFound(t, 'a6', 'a3');
                await assertDepNotFound(t, 'a6', 'a4');

                scheduler.dependencyStore.clearFilters();
            },

            { waitForAnimationFrame : null },

            async() => await assertAllDeps(t)
        );
    });

    t.it('Event drag', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' }
            ]
        });

        t.chain(
            { drag : '[data-assignment-id="a3"]', by : [-146, -60] },

            async() => {
                await assertDepEndToStart(t, 'a1', 'a2');
                await assertDepEndToStart(t, 'a1', 'a3');
                await assertDepEndToStart(t, 'a1', 'a4');
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7980
    t.it('Abort should not throw error', async t => {
        await setupScheduler(t);

        t.chain(
            { moveMouseTo : '.b-sch-event' },

            // Mousedown and mouseup with no drag aborts the dep create operation.
            { click : '.b-sch-event .b-sch-terminal-bottom' },

            () => {
                t.pass('No error thrown');
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8272
    t.it('Vertical re-sort should not leave orphaned lines', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' }
            ]
        });

        const event = scheduler.eventStore.getById('e3');
        //
        // // Want it to sort first on overlap
        event.name = 'A';
        event.duration = 2;

        // Put it below multi assigned event
        // [Multi A]
        //     [A      ]
        event.startDate = new Date(2019, 2, 15);
        scheduler.assignmentStore.getById('a6').resourceId = 'r6';

        t.chain(
            { waitForProjectReady : scheduler },

            // Let view refresh before moving again
            { waitForAnimationFrame : null },

            next => {
                // Move it to same start, triggering vertical re-sort
                // [Multi A]          -->  [A      ]
                // <---[A      ]           [Multi A]
                event.startDate = new Date(2019, 2, 14);

                next();
            },

            { waitForProjectReady : scheduler },

            // Let view refresh before evaluating
            { waitForAnimationFrame : null },

            () => {
                // Should line up with bottom event
                const
                    depBox       = Rectangle.from(document.querySelector('[depId=d1][toId=a4]'), scheduler.timeAxisSubGridElement),
                    eventBox     = Rectangle.from(document.querySelector('[data-assignment-id=a4]'), scheduler.timeAxisSubGridElement),
                    markerHeight = Number(t.query('marker')[0].getAttribute('markerHeight'));

                t.isApprox(depBox.bottom - (markerHeight / 2), eventBox.top + eventBox.height / 2, 7, 'Aligned correctly');

                // const depBox = Rectangle.from(document.querySelector('[depId=d1][toId=a4]'), scheduler.timeAxisSubGridElement);
                // const eventBox = Rectangle.from(document.querySelector('[data-assignment-id=a4]'), scheduler.timeAxisSubGridElement);
                //
                // t.isApprox(depBox.bottom, eventBox.top + eventBox.height / 2, 5, 'Aligned correctly');
            }
        );
    });

    // https://github.com/bryntum/support/issues/1384
    t.it('Should draw dependencies for new assignment', async t => {
        await setupScheduler(t, {
            dependencies : [
                { id : 'd1', from : 'e1', to : 'e2' }
            ]
        });

        await scheduler.editEvent(scheduler.eventStore.getById('e2'));

        t.chain(
            { type : 'r[ENTER][ESC][ENTER]', target : 'input[name=resource]' },

            { waitFor : () => t.query(`polyline[toId=${scheduler.assignmentStore.last.id}]`), desc : 'New line drawn' }
        );

    });
});
