StartTest(t => {
    let scheduler;

    t.beforeEach(t => {
        scheduler && scheduler.destroy();
        scheduler = null;
    });

    // https://github.com/bryntum/bryntum-suite/issues/120
    t.it('Should not remove event on undoing - single assignment', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventTooltip : false,
                eventEdit    : true // is enabled by default already, but in case we change our minds...
            },
            events                : [],
            enableEventAnimations : false
        });

        const
            eventStore = scheduler.eventStore,
            stm = scheduler.project.getStm();

        scheduler.eventStore.add({
            id         : 1,
            name       : 'test',
            startDate  : new Date(2011, 0, 4),
            endDate    : new Date(2011, 0, 5),
            resourceId : 'r1'
        });

        await t.waitForProjectReady(scheduler);

        stm.enable();
        stm.autoRecord = true;

        t.chain(
            { doubleClick : '.b-sch-event' },

            { doubleClick : 'input[name=name]' },

            { type : 'foo', target : 'input[name=name]', clearExisting : true },

            { click : 'button:contains(Save)' },

            { waitFor : () => stm.canUndo },

            () => {
                const rec = eventStore.first;

                t.is(eventStore.count, 1, 'One record in the store');
                t.is(rec.name, 'foo', 'Name is updated');
                t.ok(rec.isAssignedTo('r1'), 'Assignment is correct');
                t.contentLike('[data-event-id="1"]', 'foo', 'Element is displayed, name is updated');

                t.ok(stm.canUndo, 'STM is prepared for undoing');

                stm.undo();

                t.is(eventStore.count, 1, 'One record in the store after reverting');
                t.is(rec.name, 'test', 'Name is reverted');
                t.ok(rec.isAssignedTo('r1'), 'Assignment is correct after reverting');
                t.contentLike('[data-event-id="1"]', 'test', 'Element is displayed, name is reverted');
            }
        );
    });

    t.it('Should not remove event on undoing - multi assignment', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventTooltip : false,
                eventEdit    : true // is enabled by default already, but in case we change our minds...
            },
            events      : [],
            assignments : [
                { id : 1, resourceId : 'r1', eventId : 1 },
                { id : 2, resourceId : 'r2', eventId : 1 }
            ],
            enableEventAnimations : false
        });

        const stm = scheduler.project.getStm();

        scheduler.eventStore.add({
            id        : 1,
            name      : 'test',
            startDate : new Date(2011, 0, 4),
            endDate   : new Date(2011, 0, 5)
        });

        stm.enable();
        stm.autoRecord = true;

        t.chain(
            { doubleClick : '.b-sch-event' },

            { doubleClick : 'input[name=name]' },

            { type : 'foo', target : 'input[name=name]', clearExisting : true },

            { click : 'button:contains(Save)' },

            { waitFor : () => stm.canUndo },

            () => {
                const
                    store = scheduler.eventStore,
                    rec   = store.first;

                t.is(store.count, 1, 'One record in the store');
                t.is(rec.name, 'foo', 'Name is updated');
                t.is(rec.assignments.length, 2, 'Event is assigned to resources');
                t.ok(rec.isAssignedTo('r1'), 'Assignment 1 is correct');
                t.ok(rec.isAssignedTo('r2'), 'Assignment 2 is correct');
                t.selectorCountIs('.b-sch-event:textEquals(foo)', 2, 'Element is displayed, name is updated');

                t.ok(stm.canUndo, 'STM is prepared for undoing');

                stm.undo();

                t.is(store.count, 1, 'One record in the store after reverting');
                t.is(rec.name, 'test', 'Name is reverted');
                t.is(rec.assignments.length, 2, 'Event is assigned to resources after reverting');
                t.ok(rec.isAssignedTo('r1'), 'Assignment 1 is correct after reverting');
                t.ok(rec.isAssignedTo('r2'), 'Assignment 2 is correct after reverting');
                t.selectorCountIs('.b-sch-event:contains(test)', 2, 'Element is displayed, name is reverted');
            }
        );
    });
});
