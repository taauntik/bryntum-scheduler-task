"use strict";

StartTest(t => {
  let scheduler, fired;

  async function setup(config = {}) {
    scheduler && scheduler.destroy();
    scheduler = t.getScheduler(Object.assign({
      features: {
        eventDrag: {
          showTooltip: false
        },
        eventDragCreate: false
      }
    }, config));
    fired = {
      beforeeventdrag: 0,
      eventdragstart: 0,
      eventdrop: 0,
      aftereventdrop: 0
    };
    scheduler.on({
      beforeeventdrag({
        source,
        eventRecord
      }) {
        if (source instanceof Scheduler && eventRecord instanceof EventModel) {
          fired.beforeeventdrag++;
        }
      },

      eventdragstart({
        source,
        eventRecords
      }) {
        if (source instanceof Scheduler && eventRecords instanceof Array && eventRecords[0] instanceof EventModel) {
          fired.eventdragstart++;
        }
      },

      eventdrop({
        source,
        eventRecords,
        isCopy
      }) {
        if (source instanceof Scheduler && eventRecords instanceof Array && eventRecords[0] instanceof EventModel && // The 'isCopy' argument
        isCopy === false) {
          fired.eventdrop++;
        }
      },

      aftereventdrop({
        source
      }) {
        if (source instanceof Scheduler) {
          fired.aftereventdrop++;
        }
      }

    });
    await t.waitForProjectReady(scheduler);
  }

  function getTestSteps(t) {
    const draggedRecord = scheduler.eventStore.first;
    return [{
      drag: '.event1',
      by: [50, 0]
    }, next => {
      for (const o in fired) {
        t.ok(fired[o] === 1, `'${o}' event fired`);
      }

      t.ok(draggedRecord.startDate > draggedRecord.meta.modified.startDate, 'StartDate changed');
      t.ok(draggedRecord.endDate > draggedRecord.meta.modified.endDate, 'EndDate changed');
      t.diag('Prevent drag using Draggable = false');
      draggedRecord.draggable = false;
      scheduler.eventStore.commit();

      for (const o in fired) {
        fired[o] = 0;
      }

      next();
    }, {
      drag: '.event1',
      by: [50, 0]
    }, next => {
      for (const o in fired) {
        t.ok(fired[o] === 0, `'${o}' event not fired`);
      }

      t.diag('Prevent drag using beforeeventdrag handler');
      draggedRecord.draggable = true;
      scheduler.eventStore.commit();
      scheduler.on('beforeeventdrag', () => {
        return false;
      });
      next();
    }, {
      drag: '.b-sch-event',
      by: [50, 0]
    }, () => {
      delete fired.beforeeventdrag; // Make sure no events were fired, e.g. operation didn't start

      for (const o in fired) {
        t.ok(fired[o] === 0, `'${o}' event not fired since false was returned by beforeeventdrag handler`);
      }

      t.is(scheduler.eventStore.changes, null, 'Task not dirty since task was not moved.');
    }];
  }

  t.it('Plain horizontal scheduler', async t => {
    await setup();
    t.chain(getTestSteps(t));
  });
  t.it('Clock in tooltip is updated on drag', async t => {
    scheduler && scheduler.destroy();
    scheduler = t.getScheduler({
      viewPreset: 'hourAndDay',
      startDate: new Date(2018, 3, 27),
      endDate: new Date(2018, 3, 30),
      eventStore: t.getEventStore({
        data: [{
          startDate: '2018-04-27 02:00',
          endDate: '2018-04-27 03:00',
          id: 1,
          resourceId: 'r2'
        }, {
          startDate: '2018-04-27 04:00',
          endDate: '2018-04-27 04:00',
          id: 2,
          resourceId: 'r4'
        }]
      })
    });

    function assertClock(t, hour, minute, side) {
      const hourIndicator = document.querySelector(`.b-sch-tip-valid .b-sch-tooltip-${side}date .b-sch-hour-indicator`),
            minuteIndicator = document.querySelector(`.b-sch-tip-valid .b-sch-tooltip-${side}date .b-sch-minute-indicator`);
      t.is(hourIndicator.style.transform, `rotate(${hour * 30}deg)`, 'Hour indicator is ok');
      t.is(minuteIndicator.style.transform, `rotate(${minute * 6}deg)`, 'Minute indicator is ok');
    }

    const step = scheduler.timeAxisViewModel.tickSize;
    t.chain({
      drag: '.b-sch-event',
      by: [[step * 2, 0]],
      dragOnly: true
    }, {
      waitForSelector: '.b-sch-tip-valid'
    }, next => {
      assertClock(t, 4, 0, 'start');
      assertClock(t, 5, 0, 'end');
      next();
    }, {
      moveMouseBy: [step / 2, 0]
    }, next => {
      assertClock(t, 4, 30, 'start');
      assertClock(t, 5, 30, 'end');
      next();
    }, {
      mouseUp: null
    }, {
      drag: '.b-milestone',
      by: [[step, 0]],
      dragOnly: true
    }, {
      waitForSelector: '.b-sch-tip-valid'
    }, next => {
      t.selectorNotExists('.b-sch-tip-valid .b-sch-tooltip-enddate', 'Milestone tip is ok');
      assertClock(t, 5, 0, 'start');
      next();
    }, {
      mouseUp: null
    });
  }); // TODO: PORT tree later

  t.xit('Tree scheduler', async t => {
    await setup({
      __tree: true
    });
    t.chain(getTestSteps(t));
  });
});