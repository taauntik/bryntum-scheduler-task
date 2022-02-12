"use strict";

StartTest(t => {
  const [springDSTDate, autumnDSTDate] = t.getDSTDates(2021);

  if (!springDSTDate) {
    t.pass('Current timezone does not have DST');
    return;
  }

  const springStartDate = DateHelper.add(springDSTDate, -4, 'h'),
        springEndDate = DateHelper.add(springDSTDate, 12, 'h'),
        autumnStartDate = DateHelper.add(autumnDSTDate, -4, 'h'),
        autumnEndDate = DateHelper.add(autumnDSTDate, 12, 'h');
  let scheduler;
  t.beforeEach(() => {
    var _scheduler;

    (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });
  t.it('Should properly render events which pass through DST', t => {
    async function assertScheduler(t, startDate, endDate, eventStartDate) {
      scheduler = await t.getSchedulerAsync({
        appendTo: document.body,
        startDate: startDate,
        endDate: endDate,
        viewPreset: 'hourAndDay',
        tickSize: 40,
        height: 350,
        resources: [{
          id: 'r1',
          name: 'Albert'
        }],
        events: []
      });

      for (let i = 1; i < 8; i++) {
        scheduler.eventStore.add({
          id: i,
          resourceId: 'r1',
          startDate: eventStartDate,
          endDate: DateHelper.add(eventStartDate, i, 'h'),
          durationUnit: 'h'
        });
      }

      await t.waitForSelector('.b-sch-event');
      scheduler.eventStore.forEach(record => {
        const [eventEl] = scheduler.getElementsFromEventRecord(record, null, true);
        t.isApprox(eventEl.offsetWidth, record.duration * scheduler.tickSize, 1, `Event ${record.id} size is ok`);
      });
    }

    t.it('Should correctly render events passing through DST (spring)', async t => {
      await assertScheduler(t, springStartDate, springEndDate, springDSTDate);
    });
    t.it('Should correctly render events passing through DST (autumn)', async t => {
      await assertScheduler(t, autumnStartDate, autumnEndDate, autumnDSTDate);
    });
  });
  t.it('Time range duration is ok when dragging over DST', async t => {
    const springExactDST = t.getExactDSTDate(springDSTDate),
          autumnExactDST = t.getExactDSTDate(autumnDSTDate);
    scheduler = await t.getSchedulerAsync({
      appendTo: document.body,
      startDate: springStartDate,
      endDate: springEndDate,
      features: {
        timeRanges: {
          enableResizing: true
        }
      },
      viewPreset: {
        base: 'hourAndDay',
        timeResolution: {
          unit: 'h',
          increment: 1
        }
      },
      tickSize: 40,
      height: 100,
      resources: [{
        id: 'r1',
        name: 'Albert'
      }],
      timeRanges: [{
        startDate: DateHelper.add(springExactDST, 1, 'h'),
        endDate: DateHelper.add(springExactDST, 2, 'h'),
        cls: 'spring'
      }, {
        startDate: DateHelper.add(autumnExactDST, 1, 'h'),
        endDate: DateHelper.add(autumnExactDST, 2, 'h'),
        cls: 'autumn'
      }]
    });
    t.chain({
      drag: '.spring',
      by: [-scheduler.tickSize, 0]
    }, async () => {
      t.hasApproxWidth('.spring', scheduler.tickSize, 0.5, 'Time range width is ok');
    }, {
      drag: '.spring',
      by: [scheduler.tickSize, 0]
    }, async () => {
      t.hasApproxWidth('.spring', scheduler.tickSize, 0.5, 'Time range width is ok');
      scheduler.setTimeSpan(autumnStartDate, autumnEndDate);
    }, {
      drag: '.autumn',
      by: [-scheduler.tickSize, 0]
    }, async () => {
      t.hasApproxWidth('.autumn', scheduler.tickSize, 0.5, 'Time range width is ok');
    }, {
      drag: '.autumn',
      by: [scheduler.tickSize, 0]
    }, async () => {
      t.hasApproxWidth('.autumn', scheduler.tickSize, 0.5, 'Time range width is ok');
    });
  });
  t.it('Event duration is ok when dragging over DST', async t => {
    const springExactDST = t.getExactDSTDate(springDSTDate),
          autumnExactDST = t.getExactDSTDate(autumnDSTDate),
          gap = t.bowser.safari ? 2 : 1.1;
    scheduler = await t.getSchedulerAsync({
      appendTo: document.body,
      startDate: springStartDate,
      endDate: springEndDate,
      viewPreset: {
        base: 'hourAndDay',
        timeResolution: {
          unit: 'h',
          increment: 1
        }
      },
      tickSize: 40,
      height: 200,
      resources: [{
        id: 'r1',
        name: 'Albert'
      }],
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: DateHelper.add(springExactDST, -2, 'h'),
        endDate: springExactDST,
        cls: 'event-1'
      }, {
        id: 2,
        resourceId: 'r1',
        startDate: springExactDST,
        endDate: DateHelper.add(springExactDST, 2, 'h'),
        cls: 'event-2'
      }, {
        id: 3,
        resourceId: 'r1',
        startDate: DateHelper.add(autumnExactDST, -2, 'h'),
        endDate: autumnExactDST,
        cls: 'event-3'
      }, {
        id: 4,
        resourceId: 'r1',
        startDate: autumnExactDST,
        endDate: DateHelper.add(autumnExactDST, 2, 'h'),
        cls: 'event-4'
      }]
    });
    const {
      tickSize
    } = scheduler;
    await t.dragBy({
      source: '.event-2',
      delta: [tickSize, 0]
    });
    t.hasApproxWidth('.event-2', tickSize * 2, gap, 'Event 2 width is ok');
    await t.dragBy({
      source: '.event-1',
      delta: [tickSize, 0]
    });
    t.hasApproxWidth('.event-1', tickSize * 2, gap, 'Event 1 width is ok');
    scheduler.setTimeSpan(autumnStartDate, autumnEndDate);
    await t.dragBy({
      source: '.event-4',
      delta: [tickSize, 0]
    });
    t.hasApproxWidth('.event-4', tickSize * 2, gap, 'Event 4 width is ok');
    await t.dragBy({
      source: '.event-3',
      delta: [tickSize, 0]
    });
    t.hasApproxWidth('.event-3', tickSize * 2, gap, 'Event 3 width is ok');
  }); // https://github.com/bryntum/support/issues/2520

  t.it('Events are rendered correctly with uneven ticks caused by DST transition', async t => {
    const startDate = new Date(springStartDate.getFullYear(), springStartDate.getMonth(), springStartDate.getDate() - 1),
          endDate = new Date(springEndDate.getFullYear(), springEndDate.getMonth(), springEndDate.getDate() + 2);
    scheduler = await t.getSchedulerAsync({
      appendTo: document.body,
      startDate,
      endDate,
      viewPreset: {
        base: 'hourAndDay',
        headers: [{
          dateFormat: 'ddd MM/DD',
          unit: 'day',
          increment: 1
        }, {
          dateFormat: 'LST',
          unit: 'hour',
          increment: 6
        }],
        timeResolution: {
          unit: 'h',
          increment: 6
        }
      },
      tickSize: 40,
      height: 200,
      resources: [{
        id: 'r1',
        name: 'Albert'
      }],
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(springStartDate.getFullYear(), springStartDate.getMonth(), springStartDate.getDate()),
        endDate: new Date(springStartDate.getFullYear(), springStartDate.getMonth(), springStartDate.getDate() + 1),
        cls: 'event-1'
      }, {
        id: 2,
        resourceId: 'r1',
        startDate: new Date(springStartDate.getFullYear(), springStartDate.getMonth(), springStartDate.getDate() + 1),
        endDate: new Date(springStartDate.getFullYear(), springStartDate.getMonth(), springStartDate.getDate() + 2),
        cls: 'event-2'
      }, {
        id: 3,
        resourceId: 'r1',
        startDate: new Date(autumnStartDate.getFullYear(), autumnStartDate.getMonth(), autumnStartDate.getDate()),
        endDate: new Date(autumnStartDate.getFullYear(), autumnStartDate.getMonth(), autumnStartDate.getDate() + 1),
        cls: 'event-3'
      }, {
        id: 4,
        resourceId: 'r1',
        startDate: new Date(autumnStartDate.getFullYear(), autumnStartDate.getMonth(), autumnStartDate.getDate() + 1),
        endDate: new Date(autumnStartDate.getFullYear(), autumnStartDate.getMonth(), autumnStartDate.getDate() + 2),
        cls: 'event-4'
      }]
    });
    await t.waitForSelector('.event-1');
    const event1 = scheduler.eventStore.getById(1),
          event2 = scheduler.eventStore.getById(2),
          gap = t.bowser.safari ? 2 : 1;
    [event1, event2].forEach(record => {
      const [el] = scheduler.getElementsFromEventRecord(record),
            box = el.getBoundingClientRect();
      t.isApproxPx(box.left, scheduler.getCoordinateFromDate(record.startDate, {
        local: false
      }), gap, `Event ${record.id} start date is ok`);
      t.isApproxPx(box.right, scheduler.getCoordinateFromDate(record.endDate, {
        local: false
      }), gap, `Event ${record.id} end date is ok`);
    });
    t.subTest('Spring DST', t => {
      scheduler.timeAxis.forEach((tick, i) => {
        t.is(scheduler.getCoordinateFromDate(tick.startDate), i * scheduler.tickSize, `Tick ${i} start date position is ok`);
      });
    });
    scheduler.setTimeSpan(new Date(autumnStartDate.getFullYear(), autumnStartDate.getMonth(), autumnStartDate.getDate() - 1), new Date(autumnEndDate.getFullYear(), autumnEndDate.getMonth(), autumnEndDate.getDate() + 2));
    t.subTest('Autumn DST', t => {
      scheduler.timeAxis.forEach((tick, i) => {
        t.is(scheduler.getCoordinateFromDate(tick.startDate), i * scheduler.tickSize, `Tick ${i} start date position is ok`);
      });
    });
  });
});