"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    var _scheduler, _scheduler$destroy;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : (_scheduler$destroy = _scheduler.destroy) === null || _scheduler$destroy === void 0 ? void 0 : _scheduler$destroy.call(_scheduler);
  });

  async function createScheduler(config = {}) {
    scheduler = await t.getSchedulerAsync(Object.assign({
      features: {
        dependencies: true
      },
      startDate: new Date(2020, 7, 1),
      endDate: new Date(2020, 9, 1),
      tickSize: 50,
      events: [{
        id: 1,
        startDate: '2020-08-02',
        duration: 2,
        resourceId: 1,
        name: '1 - T0L0'
      }, {
        id: 2,
        startDate: '2020-08-03',
        duration: 4,
        resourceId: 2,
        name: '2 - T0L0'
      }, {
        id: 3,
        startDate: '2020-08-07',
        duration: 3,
        resourceId: 1,
        name: '3 - T0L0'
      }, {
        id: 4,
        startDate: '2020-08-02',
        duration: 2,
        resourceId: 26,
        name: '4 - T1L0'
      }, {
        id: 5,
        startDate: '2020-08-26',
        duration: 2,
        resourceId: 1,
        name: '5 - T0L1'
      }, {
        id: 6,
        startDate: '2020-09-21',
        duration: 2,
        resourceId: 1,
        name: '6 - T0L2'
      }, {
        id: 7,
        startDate: '2020-08-02',
        duration: 2,
        resourceId: 51,
        name: '7 - T2L0'
      }, {
        id: 8,
        startDate: '2020-08-26',
        duration: 2,
        resourceId: 26,
        name: '8 - T1L1'
      }, {
        id: 9,
        startDate: '2020-09-21',
        duration: 2,
        resourceId: 51,
        name: '9 - T2L2'
      }],
      dependencies: [// T0L0 - T0L0
      {
        id: 1,
        fromEvent: 1,
        toEvent: 2
      }, {
        id: 2,
        fromEvent: 2,
        toEvent: 3
      }, // T0L0 - T1L0
      {
        id: 3,
        fromEvent: 1,
        toEvent: 4
      }, // T0L0 - T0L1
      {
        id: 4,
        fromEvent: 1,
        toEvent: 5
      }, // T0L0 - T0L1 - T0L2
      {
        id: 5,
        fromEvent: 1,
        toEvent: 6
      }, // T0L0 - T1L0 - T2L0
      {
        id: 6,
        fromEvent: 1,
        toEvent: 7
      }, // T0L0 - T0L1 - T1L0 - T1L1
      {
        id: 7,
        fromEvent: 1,
        toEvent: 8
      }, // T0L0 - T1L0 - T0L1 - T1L1 - T1L2 - T2L0 - T2L1 - T2L2
      {
        id: 8,
        fromEvent: 1,
        toEvent: 9
      }, // T0L1 - T0L2
      {
        id: 9,
        fromEvent: 5,
        toEvent: 6
      }],
      resources: ArrayHelper.populate(100, i => ({
        id: i + 1,
        name: `Resource ${i + 1}`
      }))
    }, config));
    await t.waitForDependencies();
  }

  function assertCache(t, top, left, ...deps) {
    const cache = scheduler.features.dependencies.dependencyGridCache,
          depsInCache = cache[left][top].map(entry => entry.dependency);
    t.isDeeplyUnordered(depsInCache, deps, `T${top}L${left}`);
  }

  t.it('Verify initial scenario', async t => {
    await createScheduler();
    const [dep1, dep2, dep3, dep4, dep5, dep6, dep7, dep8, dep9] = scheduler.dependencyStore; // T0L0

    assertCache(t, 0, 0, dep1, dep2, dep3, dep4, dep5, dep6, dep7, dep8); // T1L0

    assertCache(t, 1, 0, dep3, dep6, dep7, dep8); // T2L0

    assertCache(t, 2, 0, dep6, dep8); // T0L1

    assertCache(t, 0, 1, dep4, dep5, dep7, dep8, dep9); // T0L2

    assertCache(t, 0, 2, dep5, dep8, dep9); // T1L1

    assertCache(t, 1, 1, dep7, dep8); // T1L2

    assertCache(t, 1, 2, dep8); // T2L1

    assertCache(t, 2, 1, dep8); // T2L2

    assertCache(t, 2, 2, dep8);
  });
});