import { EventModel, ResourceModel, Scheduler } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
    });

    t.it('Should be possible to dragcreate events', t => {
        scheduler = t.getScheduler({
            features : {
                eventDragCreate : true,
                eventEdit       : false,
                eventTooltip    : false
            },
            onEventCreated : ev => ev.name = 'foo'
        });

        const fired = {
            beforedragcreate : 0,
            dragcreatestart  : 0,
            dragcreateend    : 0,
            afterdragcreate  : 0,
            beforeeventadd   : 0
        };

        scheduler.on({
            beforedragcreate({ source, resourceRecord, date, event }) {
                t.ok(source instanceof Scheduler &&
                    resourceRecord instanceof ResourceModel &&
                    date instanceof Date &&
                    event instanceof Event, 'Correct event signature of `beforedragcreate`');

                fired.beforedragcreate++;
            },
            dragcreatestart({ source, proxyElement }) {
                t.ok(source instanceof Scheduler &&
                    proxyElement.classList.contains('b-sch-dirty-new'),
                'Correct event signature of `dragcreatestart`');

                fired.dragcreatestart++;
            },
            dragcreateend({ source, eventRecord, resourceRecord, event, proxyElement }) {
                t.ok(source instanceof Scheduler &&
                    eventRecord instanceof EventModel &&
                    resourceRecord instanceof ResourceModel &&
                    event instanceof Event &&
                    proxyElement.classList.contains('b-sch-dirty-new'),
                'Correct event signature of `dragcreateend`');

                fired.dragcreateend++;
            },
            afterdragcreate({ source, proxyElement }) {
                t.ok(source instanceof Scheduler &&
                    proxyElement.classList.contains('b-sch-dirty-new'),
                'Correct event signature of `afterdragcreate`');

                fired.afterdragcreate++;
            },
            beforeeventadd({ source, eventRecord, resourceRecords }) {
                t.ok(source instanceof Scheduler &&
                    eventRecord instanceof EventModel &&
                    resourceRecords instanceof Array,
                'Correct event signature of `beforeeventadd`');

                fired.beforeeventadd++;
            }
        });

        const eventStore = scheduler.eventStore,
            falseFn    = () => false;

        eventStore.removeAll();

        t.chain(
            { drag : '.b-sch-timeaxis-cell', by : [100, 0] },

            next => {
                for (const o in fired) {
                    t.ok(fired[o] === 1, `'${o}' event fired`);
                }

                t.ok(eventStore.count === 1, 'New event added to store');

                t.ok(eventStore.first.startDate instanceof Date, 'StartDate is a valid Date');
                t.ok(eventStore.first.endDate instanceof Date, 'EndDate is a valid Date');

                t.isLess(eventStore.first.startDate, eventStore.first.endDate, 'EndDate is greater than start date');

                t.is(eventStore.first.name, 'foo', 'onEventCreated successfully modified the new record');

                t.selectorExists('.b-sch-event-wrap .b-sch-event .b-sch-event-content', 'Correct DOM structure for new event');

                scheduler.on('beforedragcreate', falseFn);

                for (const p in fired) {
                    fired[p] = 0;
                }

                next();
            },

            // TODO: should be -100 but EventDragCreate doesn't support that yet
            { drag : '[data-index=1] .b-sch-timeaxis-cell', by : [100, 0] },

            next => {
                // Make sure no events were fired, e.g. operation didn't start
                t.isDeeply(fired, {
                    beforedragcreate : 1,
                    dragcreatestart  : 0,
                    dragcreateend    : 0,
                    afterdragcreate  : 0,
                    beforeeventadd   : 0
                }, 'Only `beforedragcreate` was fired which did not result in any event created');

                t.is(eventStore.count, 1, 'No new event added to store');

                scheduler.un('beforedragcreate', falseFn);

                // Try again and make sure that firing 'beforeeventadd' event behaves as expected
                scheduler.on('beforeeventadd', falseFn);

                next();
            },

            { drag : '[data-index=1] .b-sch-timeaxis-cell', by : [-100, 0] }
        );
    });

    t.it('Clock in tooltip is updated on create', async t => {
        scheduler = t.getScheduler({
            eventStore : t.getEventStore(null, 0),
            startDate  : new Date(2018, 3, 27),
            endDate    : new Date(2018, 3, 28),
            viewPreset : 'hourAndDay'
        });

        await t.waitForProjectReady(scheduler);

        const step = scheduler.timeAxisViewModel.tickSize;

        function assertClock(t, hour, minute, side) {
            const
                hourIndicator = t.query(`.b-sch-tip-valid .b-sch-tooltip-${side}date .b-sch-hour-indicator`)[0],
                minuteIndicator = t.query(`.b-sch-tip-valid .b-sch-tooltip-${side}date .b-sch-minute-indicator`)[0];
            t.is(hourIndicator.style.transform, `rotate(${hour * 30}deg)`, 'Hour indicator is ok');
            t.is(minuteIndicator.style.transform, `rotate(${minute * 6}deg)`, 'Minute indicator is ok');
        }

        t.chain(
            { waitForSelector : '.b-sch-header-timeaxis-cell' },
            { drag : '.b-sch-timeaxis-cell', fromOffset : [step, 10], by : [step, 0], dragOnly : true },
            { waitForSelector : '.b-sch-tip-valid' },
            next => {
                assertClock(t, 1, 0, 'start');
                assertClock(t, 2, 0, 'end');
                next();
            },
            { moveMouseBy : [40, 0] },
            next => {
                assertClock(t, 1, 0, 'start');
                assertClock(t, 2, 30, 'end');
                next();
            },
            { moveMouseBy : [step - 40, 0] },
            next => {
                assertClock(t, 1, 0, 'start');
                assertClock(t, 3, 0, 'end');
                next();
            },
            { mouseUp : null }
        );
    });
});
