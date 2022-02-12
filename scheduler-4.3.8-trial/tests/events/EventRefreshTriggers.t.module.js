import { Rectangle } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler, eventStore, resourceStore;

    // async beforeEach doesn't work in umd
    t.beforeEach(async(t, next) => {
        scheduler && scheduler.destroy();

        scheduler = await t.getSchedulerAsync({
            resourceStore         : t.getResourceStore2({}, 5),
            enableEventAnimations : false
        });

        ({ eventStore, resourceStore } = scheduler);

        eventStore.first.name = eventStore.first.cls = 'foo';
        eventStore.getAt(1).name = eventStore.getAt(1).cls = 'bar';

        next();
    });

    t.it('Should repaint correctly and release event divs if resource store is cleared', async t => {
        t.isntCalled('renderer', scheduler.currentOrientation, 'Resource store clear does not lay out any events');

        resourceStore.removeAll();

        await t.waitForProjectReady(scheduler);

        t.selectorNotExists(scheduler.eventSelector, 'No event elements found');
        t.selectorNotExists('.b-sch-released', 'No released event elements found');
    });

    t.it('Should repaint correctly if resource store is filtered', async t => {
        const eventTopBefore = Rectangle.from(document.body.querySelector('.b-sch-event.bar')).y;

        t.isCalledNTimes('layoutResourceEvents', scheduler.currentOrientation, 0, 'Resource store filter lays out each event once');
        t.isCalledNTimes('renderer', scheduler.currentOrientation, eventStore.count - 1, 'Resource store filter renders each resource once');

        // filter out first row, should repaint all below it (=== all in this case)
        resourceStore.filter((r) => r.name !== 'Resource 1');

        await t.waitForProjectReady(scheduler);

        t.waitFor(() => {
            const eventTopAfterAdd = Rectangle.from(document.body.querySelector('.b-sch-event.bar')).y;

            // Second event will have moved upwards
            return eventTopAfterAdd < eventTopBefore;
        });
    });

    t.it('Should repaint when adding a new resource', async t => {
        const eventTopBefore = Rectangle.from(document.body.querySelector('.b-sch-event.foo')).y;

        await t.waitForProjectReady(scheduler);

        eventStore.add({
            name       : 'New Event',
            resourceId : 'newResource',
            startDate  : scheduler.timeAxis.startDate,
            endDate    : new Date(scheduler.timeAxis.startDate.valueOf() + 1000 * 60 * 60 * 24),
            cls        : 'new-event'
        });

        // #1 - Add
        t.isCalledNTimes('layoutResourceEvents', scheduler.currentOrientation, 1, 'Resource add only layouts the new resource');
        // #1-6 - ResourceStore add
        // #7   - Project refresh
        t.isCalledNTimes('renderer', scheduler.currentOrientation, 7, 'Resource add reused layout of other resources');

        resourceStore.insert(0, { id : 'newResource', name : 'New' });
        t.chain(
            { waitForProjectReady : scheduler },

            {
                // Wait for the old first event to be pushed downwards because there is a new resource above
                waitFor : () => {
                    const eventTopAfterAdd = Rectangle.from(document.body.querySelector('.b-sch-event.foo')).y;

                    return eventTopAfterAdd > eventTopBefore;
                }
            },

            {
                // Wait for the event assigned to the new resource must be at the same Y position that the old first event was at
                waitFor : () => {
                    const newEventRect = Rectangle.from(document.body.querySelector('.b-sch-event.new-event'));

                    return newEventRect.y === eventTopBefore;
                }
            }
        );
    });

    t.it('Should repaint when removing a resource', async t => {
        const eventTopBefore = document.body.querySelector('[data-event-id="2"]').getBoundingClientRect().top;

        // The resourceModel.unassignAll() causes a layout as well as the following remove.
        t.isCalledNTimes('layoutResourceEvents', scheduler.currentOrientation, 0, 'No event layout needed');
        t.isCalledNTimes('renderer', scheduler.currentOrientation, eventStore.count - 1, 'Resources rendered');

        resourceStore.remove(resourceStore.first);

        t.waitFor(() => {
            const eventTopAfterRemove = document.body.querySelector('[data-event-id="2"]').getBoundingClientRect().top;

            return eventTopAfterRemove < eventTopBefore;
        });
    });

    t.it('Should repaint when adding a new event', async t => {
        const eventTopBefore = Rectangle.from(document.body.querySelector('.b-sch-event.foo')).y;

        resourceStore.insert(0, { id : 'newResource', name : 'New' });

        // Resource insertion and beforeEach event changes should not affect the layout count below, wait for them to
        // be finalized
        await t.waitForProjectReady(scheduler);

        t.isCalledNTimes('layoutResourceEvents', scheduler.currentOrientation, 1, 'Only the new events resource is laid out');

        eventStore.add({
            name       : 'New Event',
            resourceId : 'newResource',
            startDate  : scheduler.timeAxis.startDate,
            endDate    : new Date(scheduler.timeAxis.startDate.valueOf() + 1000 * 60 * 60 * 24),
            cls        : 'new-event'
        });

        await t.waitForProjectReady(scheduler);

        t.chain(
            {
                // Wait for the old first event to be pushed downwards because there is a new resource above
                waitFor : () => {
                    const eventTopAfterAdd = Rectangle.from(document.body.querySelector('.b-sch-event.foo')).y;

                    return eventTopAfterAdd > eventTopBefore;
                }
            },

            {
                // Wait for the event assigned to the new resource must be at the same Y position that the old first event was at
                waitFor : () => {
                    const newEventRect = Rectangle.from(document.body.querySelector('.b-sch-event.new-event'));

                    return newEventRect.y === eventTopBefore;
                }
            }
        );
    });

    t.it('Should repaint and not crash when updating an event from nonexisting resourceId to valid one', async t => {
        scheduler.events = [{
            name       : 'New Event',
            resourceId : 'blargh',
            startDate  : scheduler.timeAxis.startDate,
            duration   : 1
        }];

        t.chain(
            { waitForProjectReady : scheduler },

            { waitForSelectorNotFound : scheduler.unreleasedEventSelector },

            async() => {
                eventStore.first.resourceId = resourceStore.first.id;
                await scheduler.project.commitAsync();
            },

            { waitForProjectReady : scheduler },

            { waitForSelector : scheduler.unreleasedEventSelector }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/6814
    t.it('Should move element when changing startDate within timeaxis but out of view', t => {
        scheduler.endDate = new Date(2011, 0, 20);

        //eventStore.first.setStartDate(new Date(2011, 0, 15), true);
        eventStore.first.startDate = new Date(2011, 0, 15);

        t.chain(
            { waitForElementNotVisible : '[data-event-id="1"]' },

            () => {
                t.pass('Element no longer visible');
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7074
    t.it('Should remove all event elements when removing resource', async t => {
        eventStore.getAt(1).resourceId = 'r1';
        eventStore.getAt(2).resourceId = 'r1';

        await t.waitForProjectReady(scheduler);

        resourceStore.first.remove();

        await t.waitForProjectReady(scheduler);

        t.selectorNotExists('[data-event-id="1"]:not(.b-released)', 'First event gone');
        t.selectorNotExists('[data-event-id="2"]:not(.b-released)', 'Second event gone');
        t.selectorNotExists('[data-event-id="3"]:not(.b-released)', 'Third event gone');
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7072
    t.it('Should refresh UI after removing all events', t => {
        eventStore.removeAll();

        t.chain(
            { waitForSelectorNotFound : scheduler.unreleasedEventSelector, desc : 'All event elements removed' }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7224
    t.it('Should update elements when eventStore is filtered', async t => {
        eventStore.filter('name', 'bar');

        t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Single event element found after filtering');

        eventStore.clearFilters();

        t.selectorCountIs(scheduler.unreleasedEventSelector, 5, 'All event elements found after clearing filters');
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7224
    t.it('Should work with reapplyFilterOnAdd: false', async t => {
        eventStore.reapplyFilterOnAdd = false;

        eventStore.filter('name', 'bar');

        eventStore.add({ name : 'extra', resourceId : 'r1', startDate : '2011-01-07', duration : 2 });

        await t.waitForProjectReady(scheduler);

        t.selectorCountIs(scheduler.unreleasedEventSelector, 2, 'Two event elements found after add');
    });

    // https://app.assembla.com/spaces/bryntum/tickets/7224
    t.it('Should work with reapplyFilterOnAdd: true', async t => {
        eventStore.reapplyFilterOnAdd = true;

        eventStore.filter('name', 'bar');

        eventStore.add({ name : 'extra', resourceId : 'r1', startDate : '2011-01-07', duration : 2 });

        await t.waitForProjectReady(scheduler);

        t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Single event element found after add');
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8487
    t.it('Should reuse same element when changing id', async t => {
        const element = document.querySelector(scheduler.eventSelector + '[data-event-id="1"]');

        eventStore.getAt(1).resourceId = 'r1';
        eventStore.first.id = 'BrandNewId';

        await t.waitForProjectReady(scheduler);

        t.is(element.dataset.eventId, 'BrandNewId', 'Elements data-event-id updated');
        t.is(scheduler.getElementFromEventRecord(eventStore.first).parentElement, element, 'Same element used for the record');
        t.selectorCountIs(scheduler.eventSelector, 5, 'Correct total amount of event elements');
        t.selectorCountIs(scheduler.unreleasedEventSelector, 5, 'Correct amount of displayed event elements');
    });

    // https://github.com/bryntum/support/issues/602
    t.it('Should redraw events on resource changes', async t => {
        t.it('Changing field that has no impact', t => {
            // No element changes
            t.firesOk(scheduler, {
                renderEvent  : 0,
                releaseEvent : 0
            });

            // Should get laid out
            t.isCalledNTimes('clearResources', scheduler.currentOrientation, 1, 'Cleared once');
            t.isCalledNTimes('clearAll', scheduler.currentOrientation, 0, 'Did not clear all');
            t.isCalledNTimes('layoutResourceEvents', scheduler.currentOrientation, 1, 'Only affected resource refreshed');

            resourceStore.first.name = 'Dude';
        });

        t.it('Changing field that has impact', t => {
            // Element should get updated
            t.firesOk(scheduler, {
                renderEvent  : 1,
                releaseEvent : 0
            });

            // Should get laid out
            t.isCalledNTimes('clearResources', scheduler.currentOrientation, 1, 'Cleared once');
            t.isCalledNTimes('clearAll', scheduler.currentOrientation, 0, 'Did not clear all');
            t.isCalledNTimes('layoutResourceEvents', scheduler.currentOrientation, 1, 'Only affected resource refreshed');

            resourceStore.first.eventColor = 'blue';
            t.selectorExists('[data-event-id="1"].b-sch-color-blue', 'Change applied to DOM');
        });
    });

    t.it('Adding events should increase row height', async t => {
        const
            heightBefore = scheduler.getRow(0).height,
            countBefore  = document.querySelectorAll(scheduler.unreleasedEventSelector).length;

        // Add will rerender all events below
        t.willFireNTimes(scheduler, 'renderEvent', 6);

        scheduler.eventStore.add([
            scheduler.eventStore.first.copy(),
            scheduler.eventStore.first.copy()
        ]);

        await t.waitForProjectReady();

        const countAfter = document.querySelectorAll(scheduler.unreleasedEventSelector).length;
        t.isGreater(scheduler.getRow(0).height, heightBefore, 'Height of row has increased');
        t.is(countAfter, countBefore + 2, 'Elements added');
    });

    // https://github.com/bryntum/support/issues/3938
    t.it('Should revert + repaint events after calling revertChanges', async t => {
        await t.waitForProjectReady();

        const
            eventRecord       = scheduler.eventStore.getById(5),
            originalEventRect = t.rect('[data-event-id="5"]');

        t.selectorExists('[data-event-id="5"]:contains(Assignment 5)');

        eventRecord.name       = 'Foot massage';
        eventRecord.resourceId = 'r1';
        eventRecord.shift(0.5);

        await t.waitFor(() => t.rect('[data-event-id="5"]').top - t.rect('.b-grid-row[data-index=0]').top < 50);

        t.selectorExists('[data-event-id="5"]:contains(Foot massage)');

        scheduler.eventStore.revertChanges();

        await t.waitFor(() => t.rect('[data-event-id="5"]').top === originalEventRect.top);

        const revertedEventRect = t.rect('[data-event-id="5"]');

        t.is(revertedEventRect.left, originalEventRect.left, 'left OK');
        t.is(revertedEventRect.top, originalEventRect.top, 'top OK');
        t.is(eventRecord.resourceId, 'r5', 'Resource id reverted');
        t.selectorExists('[data-event-id="5"]:contains(Assignment 5)');
    });
});
