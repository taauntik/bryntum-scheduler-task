import { DateHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    const scheduler = bryntum.query('scheduler');

    t.it('sanity', t => {
        t.chain(
            { waitForSelector : '.b-sch-foreground-canvas' },

            () => t.checkGridSanity(scheduler)
        );
    });

    t.it('should work ok when doing many mass updates', t => {
        t.firesAtLeastNTimes(scheduler.eventStore, 'change', 5);

        t.chain(
            // click mass update 6 times
            { click : 'button:contains(update)' },
            { click : 'button:contains(update)' },
            { click : 'button:contains(update)' },
            { click : 'button:contains(update)' },
            { click : 'button:contains(update)' },
            { click : 'button:contains(update)' },

            next => {
                const eventElements = Array.from(document.querySelectorAll('.b-sch-event:not(.b-sch-released)'));
                eventElements.forEach(element => {
                    t.ok(scheduler.resolveResourceRecord(element), 'Event element matched to resource record');
                });
                next();
            },

            // click mass update 2 times more, should not crash
            { click : 'button:contains(update)' },
            { click : 'button:contains(update)' }
        );
    });

    t.it('should reschedule meetings when clicking button', t => {
        t.chain(
            // click mass update 6 times
            { click : 'button:contains(After)' },

            () => {
                scheduler.eventStore.query((task) => task.eventType === 'Meeting').forEach((task) => {
                    t.isGreaterOrEqual(task.startDate, scheduler.timeRanges[0].endDate);
                });
            }
        );
    });

    t.it('should limit meetings to 1 hr when clicking button', t => {
        t.chain(
            { click : 'button:contains(Max 1hr)' },

            { waitForProjectReady : scheduler },

            () => {
                scheduler.eventStore.query(task => task.eventType === 'Meeting').forEach(task => {
                    t.isLessOrEqual(task.duration, 1);
                    t.is(DateHelper.normalizeUnit(task.durationUnit), 'hour');
                });
            }
        );
    });
});
