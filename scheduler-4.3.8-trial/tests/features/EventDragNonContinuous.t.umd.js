"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
  });

  async function getScheduler(config) {
    const scheduler = await t.getSchedulerAsync(Object.assign({
      enableEventAnimations: false,
      features: {
        eventDrag: true
      }
    }, config));
    return scheduler;
  }

  t.it('Should work with custom non-continuous timeaxis', async t => {
    scheduler = await getScheduler({
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 10),
        endDate: new Date(2011, 0, 11)
      }, {
        id: 2,
        resourceId: 'r2',
        startDate: new Date(2011, 0, 5),
        endDate: new Date(2011, 0, 7)
      }],
      timeAxis: {
        continuous: false,

        generateTicks(start, end, unit, increment) {
          const ticks = [];

          while (start < end) {
            if ([1, 2, 3].includes(start.getDay())) {
              ticks.push({
                startDate: start,
                endDate: DateHelper.add(start, increment, unit)
              });
            }

            start = DateHelper.add(start, increment, unit);
          }

          return ticks;
        }

      }
    });
    t.isApprox(t.rect('[data-event-id="2"]').width, scheduler.tickSize, 0.5, 'Only displaying part of event initially');
    t.chain( // Drag bottom event to reveal more of it
    {
      drag: '[data-event-id="2"]',
      by: [-scheduler.tickSize, 0]
    }, next => {
      t.isApprox(t.rect('[data-event-id="2"]').width, scheduler.tickSize * 2, 0.5, 'More revealed after drop');
      t.is(scheduler.eventStore.last.startDate, new Date(2011, 0, 4), 'startDate correct');
      t.is(scheduler.eventStore.last.endDate, new Date(2011, 0, 6), 'endDate correct');
      next();
    }, // Entire event is now visible, drag it some more to make sure it stays so
    {
      drag: '[data-event-id="2"]',
      by: [-scheduler.tickSize, 0]
    }, next => {
      t.isApprox(t.rect('[data-event-id="2"]').width, scheduler.tickSize * 2, 0.5, 'Same width after drop');
      t.is(scheduler.eventStore.last.startDate, new Date(2011, 0, 3), 'startDate correct');
      t.is(scheduler.eventStore.last.endDate, new Date(2011, 0, 5), 'endDate correct');
      next();
    }, // Should clip when moved to overlap "hidden" ticks
    {
      drag: '[data-event-id="1"]',
      by: [-scheduler.tickSize / 2, 0]
    }, () => {
      t.isApprox(document.querySelector('[data-event-id="1"]').offsetWidth, Math.floor(scheduler.tickSize / 2), 'Clipped after drop');
      t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 5, 12), 'startDate correct');
      t.is(scheduler.eventStore.first.endDate, new Date(2011, 0, 6, 12), 'endDate correct');
    });
  });
  t.it('Should not disappear when dropped at edge between non-continuous ticks', async t => {
    scheduler = await getScheduler({
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2019, 0, 16, 16),
        endDate: new Date(2019, 0, 16, 18)
      }],
      viewPreset: 'hourAndDay',
      startDate: new Date(2019, 0, 15),
      endDate: new Date(2019, 0, 17),
      timeAxis: {
        continuous: false,

        generateTicks(start, end, unit, increment) {
          const ticks = [];

          while (start < end) {
            if (start.getHours() > 15 && start.getHours() < 22) {
              ticks.push({
                startDate: start,
                endDate: DateHelper.add(start, increment, unit)
              });
            }

            start = DateHelper.add(start, increment, unit);
          }

          return ticks;
        }

      }
    });
    t.chain({
      drag: '.b-sch-event',
      by: [-5, 0]
    }, () => {
      t.selectorExists('.b-sch-event:not(.b-sch-released)', 'Events element still there');
    });
  }); // https://github.com/bryntum/support/issues/779

  t.it('Should be no exceptions when dragging an event starting & ending outside timeaxis', async t => {
    const startDate = new Date(2011, 0, 2),
          endDate = new Date(2011, 0, 12);
    scheduler = await getScheduler({
      resources: [{
        id: 'r1',
        name: 'Foo'
      }],
      workingTime: {
        fromHour: 8,
        toHour: 17
      },
      events: [{
        id: 1,
        resourceId: 'r1',
        name: 'foo',
        startDate: startDate,
        endDate: endDate
      }],
      startDate: new Date(2011, 0, 2),
      endDate: new Date(2011, 0, 7),
      tickSize: 100
    });
    t.chain({
      drag: '.b-sch-event',
      by: [-100, 0]
    }, () => {
      t.pass('No crash');
    });
  });
});