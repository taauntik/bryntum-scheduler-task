"use strict";

StartTest(t => {
  let scheduler;
  const startDate = new Date(2019, 0, 6);

  async function createScheduler(count = 50, params = {}) {
    scheduler = new Scheduler(Object.assign({
      appendTo: document.body,
      features: {
        resourceTimeRanges: true
      },
      viewPreset: 'dayAndWeek',
      startDate,
      rowHeight: 60,
      barMargin: 10,
      endDate: new Date(2019, 0, 27),
      columns: [{
        text: 'Name',
        field: 'name',
        width: 100
      }],
      resources: ArrayHelper.populate(count, i => ({
        name: 'Resource ' + (i + 1),
        id: i + 1
      })),
      // Throw some events in there also to make sure the combination works
      events: ArrayHelper.populate(count, i => ({
        id: i + 1,
        name: 'Event ' + (i + 1),
        resourceId: i + 1,
        startDate: DateHelper.add(startDate, i % 12 + 1, 'days'),
        duration: 2,
        durationUnit: 'days'
      })),
      resourceTimeRanges: [{
        id: 1,
        resourceId: 1,
        startDate: startDate,
        duration: 4,
        durationUnit: 'days',
        name: 'Range 1',
        cls: 'custom'
      }, {
        id: 2,
        resourceId: 1,
        startDate: DateHelper.add(startDate, 5, 'days'),
        duration: 2,
        durationUnit: 'days',
        name: 'Range 2',
        style: 'color: red'
      }, {
        id: 3,
        resourceId: 1,
        startDate: DateHelper.add(startDate, 17, 'days'),
        duration: 4,
        durationUnit: 'days',
        name: 'Range 3'
      }, {
        id: 4,
        resourceId: 50,
        startDate: startDate,
        duration: 3,
        durationUnit: 'days',
        name: 'Range 4'
      }],
      enableEventAnimations: false,
      useInitialAnimation: false
    }, params));
    await t.waitForProjectReady();
  }

  const rangeSelector = '.b-sch-resourcetimerange:not(.b-sch-released)';

  function checkBounds(t, element, expected, tolerance = 1) {
    //const bounds = element.getBoundingClientRect();
    const bounds = Rectangle.from(element, scheduler.timeAxisSubGridElement);
    let pass = true;

    if (Math.abs(bounds.left - expected.left) > tolerance) {
      t.fail(`Expected left ${expected.left} +-${tolerance}, got ${bounds.left} for ${element.id}`);
      pass = false;
    }

    if (Math.abs(bounds.top - expected.top) > tolerance) {
      t.fail(`Expected top ${expected.top} +-${tolerance}, got ${bounds.top} for ${element.id}`);
      pass = false;
    }

    if (Math.abs(bounds.width - expected.width) > tolerance) {
      t.fail(`Expected width ${expected.width} +-${tolerance}, got ${bounds.width} for ${element.id}`);
      pass = false;
    }

    if (Math.abs(bounds.height - expected.height) > tolerance) {
      t.fail(`Expected height ${expected.height} +-${tolerance}, got ${bounds.height} for ${element.id}`);
      pass = false;
    }

    if (pass) {
      t.pass('Bounds match for ' + element.id);
    }
  }

  t.beforeEach(t => {
    var _scheduler;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });
  t.it('Should render ranges correctly initially', async t => {
    await createScheduler();
    scheduler.currentOrientation.verticalBufferSize = 200;
    const rangeElements = t.query(rangeSelector);
    t.is(rangeElements.length, 2, '2 ranges rendered initially');
    checkBounds(t, rangeElements[0], {
      left: 0,
      top: 0,
      width: 400,
      height: 60
    });
    checkBounds(t, rangeElements[1], {
      left: 500,
      top: 0,
      width: 200,
      height: 60
    }); // Also make sure events are still rendered correctly

    const eventElements = t.query('.b-sch-event:not(.b-sch-released)');
    t.is(eventElements.length, 12, '12 events rendered initially');
    checkBounds(t, eventElements[0], {
      left: 100,
      top: 10,
      width: 200,
      height: 40
    });
    checkBounds(t, eventElements[11], {
      left: 300,
      top: 864,
      width: 200,
      height: 40
    });
    t.elementIsTopElement(eventElements[0], true, 'Event displayed in front of range');
    t.ok(rangeElements[0].classList.contains('custom'), 'Custom CSS applied');
    t.is(rangeElements[1].style.color, 'red', 'Custom style applied');
    t.hasStyle(rangeElements[0].firstElementChild, 'font-size', '12px', 'Correct font-size');
  });
  t.it('Should render ranges correctly when scrolled into view', async t => {
    await createScheduler();
    const yScroller = scheduler.scrollable,
          xScroller = scheduler.timeAxisSubGrid.scrollable;
    t.chain( // Scroll all the way to the right
    {
      waitForEvent: [xScroller, 'scrollend'],
      trigger: () => xScroller.scrollTo(2000, null, true)
    }, next => {
      const rangeElements = t.query('.b-sch-resourcetimerange:not(.b-sch-released)');
      t.is(rangeElements.length, 1, '1 ranges rendered after scroll to top right');
      checkBounds(t, rangeElements[0], {
        left: 1700,
        top: 0,
        width: 400,
        height: 60
      });
      next();
    }, // Scroll all the way to the bottom
    {
      waitForEvent: [yScroller, 'scrollend'],
      trigger: () => yScroller.scrollTo(null, yScroller.maxY, {
        animate: true,
        force: true
      })
    }, next => {
      const rangeElements = t.query('.b-sch-resourcetimerange:not(.b-sch-released)');
      t.is(rangeElements.length, 0, 'No ranges rendered after scroll to bottom right');
      next();
    }, // Scroll all the way to the left
    {
      waitForEvent: [xScroller, 'scrollend'],
      trigger: () => xScroller.scrollTo(0, null, true)
    }, () => {
      const rangeElements = t.query('.b-sch-resourcetimerange:not(.b-sch-released)');
      t.is(rangeElements.length, 1, '1 ranges rendered after scroll to bottom left');
      checkBounds(t, rangeElements[0], {
        left: 0,
        top: 2989,
        width: 300,
        height: 60
      });
    });
  });
  t.it('Remove should update UI', async t => {
    await createScheduler();
    scheduler.resourceTimeRangeStore.first.remove();
    t.chain({
      waitFor: () => t.query(rangeSelector).length === 1,
      desc: 'Waiting for range element to fade away'
    }, next => {
      const rangeElements = t.query(rangeSelector);
      t.is(rangeElements.length, 1, 'Single range rendered after remove');
      checkBounds(t, rangeElements[0], {
        left: 500,
        top: 0,
        width: 200,
        height: 60
      });
      next();
    }, // Make sure it does not reappear on scroll
    {
      waitForEvent: [scheduler, 'scroll'],
      trigger: () => scheduler.scrollTop = 20
    }, () => t.selectorCountIs(rangeSelector, 1, 'Single range rendered after scroll'));
  });
  t.it('Remove all should update UI', async t => {
    await createScheduler();
    scheduler.resourceTimeRangeStore.removeAll();
    t.chain({
      waitFor: () => t.query(rangeSelector).length === 0,
      desc: 'Waiting for range elements to fade away'
    }, async () => t.selectorNotExists(rangeSelector, 'No range elements after removeAll'), // Make sure it does not reappear on scroll
    {
      waitForEvent: [scheduler, 'scroll'],
      trigger: () => scheduler.scrollTop = 20
    }, () => t.selectorNotExists(rangeSelector, 'No range elements after scroll'));
  });
  t.it('Add should update UI', async t => {
    await createScheduler();
    scheduler.resourceTimeRangeStore.add({
      id: 5,
      resourceId: 2,
      startDate,
      duration: 1,
      durationUnit: 'd'
    });
    const rangeElements = t.query(rangeSelector);
    t.is(rangeElements.length, 3, '3 range elements found');
    checkBounds(t, rangeElements[2], {
      left: 0,
      top: 61,
      width: 100,
      height: 60
    });
  });
  t.it('Add multiple should update UI', async t => {
    await createScheduler();
    scheduler.resourceTimeRangeStore.add([{
      id: 5,
      resourceId: 2,
      startDate,
      duration: 1,
      durationUnit: 'd',
      name: 'New 1'
    }, {
      id: 6,
      resourceId: 4,
      startDate,
      duration: 1,
      durationUnit: 'd',
      name: 'New 2'
    }]);
    const rangeElements = t.query(rangeSelector);
    t.is(rangeElements.length, 4, '4 range elements found');
    checkBounds(t, rangeElements[2], {
      left: 0,
      top: 61,
      width: 100,
      height: 60
    });
    checkBounds(t, rangeElements[3], {
      left: 0,
      top: 183,
      width: 100,
      height: 60
    });
  });
  t.it('Data manipulation should update UI', async t => {
    await createScheduler();
    const el = document.querySelector(rangeSelector);
    scheduler.resourceTimeRangeStore.first.startDate = DateHelper.add(startDate, 1, 'day');
    checkBounds(t, el, {
      left: 100,
      top: 0,
      width: 400,
      height: 60
    });
    scheduler.resourceTimeRangeStore.first.duration = 10;
    checkBounds(t, el, {
      left: 100,
      top: 0,
      width: 1000,
      height: 60
    });
    scheduler.resourceTimeRangeStore.first.resourceId = 10;
    checkBounds(t, el, {
      left: 100,
      top: 549,
      width: 1000,
      height: 60
    });
  }); // https://github.com/bryntum/support/issues/3515

  t.it('Setting empty dataset should update UI', async t => {
    await createScheduler();
    scheduler.resourceTimeRangeStore.data = [];
    t.selectorNotExists('.b-sch-resourcetimerange', 'No ranges shown');
    t.selectorExists('.b-sch-event', 'Events shown');
  }); // https://github.com/bryntum/support/issues/3515

  t.it('Setting non empty dataset should correctly update UI, invisible range', async t => {
    await createScheduler();
    scheduler.resourceTimeRangeStore.data = [{}];
    t.selectorNotExists('.b-sch-resourcetimerange', 'No ranges shown');
    t.selectorExists('.b-sch-event', 'Events shown');
  }); // https://github.com/bryntum/support/issues/3515

  t.it('Setting non empty dataset should correctly update UI, visible range', async t => {
    await createScheduler();
    scheduler.resourceTimeRangeStore.data = [{
      id: 1,
      resourceId: 1,
      startDate: startDate,
      duration: 3,
      durationUnit: 'days',
      name: 'New range'
    }];
    t.selectorExists('.b-sch-resourcetimerange:contains(New range)', 'No ranges shown');
    t.selectorExists('.b-sch-event', 'Events shown');
  }); // https://app.assembla.com/spaces/bryntum/tickets/7319

  t.it('Released ranges should be hidden', async t => {
    await createScheduler();
    const firstRange = document.querySelector('.b-sch-resourcetimerange');
    t.elementIsVisible(firstRange, 'Initially visible'); // Simulate releasing the first range.

    firstRange.classList.add('b-released');
    t.elementIsNotVisible(firstRange, 'Hidden when released');
  }); // https://app.assembla.com/spaces/bryntum/tickets/7441-crash-when-updating-resourcetimerange-of-non-existing-resource/details#

  t.it('Should not crash if updating resource time range of nonexisting resource', async t => {
    await createScheduler();
    scheduler.resourceStore.removeAll();
    await t.waitForProjectReady();
    scheduler.resourceTimeRangeStore.first.startDate = new Date(2018, 11, 1);
    t.selectorNotExists('.b-sch-resourcetimerange', 'No ranges rendered');
  });
  t.xit('Should remove timeranges of removed resource', async t => {
    await createScheduler();
    t.is(scheduler.resourceTimeRangeStore.count, 4);
    scheduler.resourceStore.remove(1);
    t.is(scheduler.resourceTimeRangeStore.query(tr => {
      return tr.resourceId === 1;
    }).length, 0, 'Time ranges of deleted resource were removed');
    t.is(scheduler.resourceTimeRangeStore.count, 1);
  }); // https://app.assembla.com/spaces/bryntum/tickets/8005/details

  t.it('Should produce correct height when using eventLayout "none"', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      features: {
        resourceTimeRanges: true
      },
      eventLayout: 'none',
      startDate,
      rowHeight: 60,
      endDate: new Date(2019, 0, 27),
      columns: [{
        text: 'Name',
        field: 'name',
        width: 100
      }],
      resources: [{
        id: 1,
        name: 'Resource 1'
      }],
      resourceTimeRanges: [{
        id: 1,
        resourceId: 1,
        startDate,
        duration: 4,
        durationUnit: 'd',
        name: 'Range 1'
      }],
      enableEventAnimations: false
    });
    await t.waitForProjectReady();
    scheduler.resourceTimeRangeStore.add([{
      id: 5,
      resourceId: 2,
      startDate,
      duration: 1,
      durationUnit: 'd'
    }]);
    const rangeElements = t.query(rangeSelector);
    t.is(rangeElements.length, 1, '1 range element found');
    t.is(rangeElements[0].offsetHeight, 60);
  });
  t.it('Should draw resource time ranges after events are filtered', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      features: {
        resourceTimeRanges: true
      },
      viewPreset: 'dayAndWeek',
      rowHeight: 58,
      startDate,
      endDate: new Date(2019, 0, 27),
      columns: [{
        text: 'Name',
        field: 'name',
        width: 100
      }],
      resources: ArrayHelper.populate(20, i => ({
        name: 'Resource ' + (i + 1),
        id: i + 1
      })),
      events: ArrayHelper.populate(20, i => ({
        id: i + 1,
        name: 'Event ' + (i + 1),
        resourceId: i + 1,
        startDate: DateHelper.add(startDate, i % 12 + 1, 'days'),
        duration: 2,
        durationUnit: 'days'
      })),
      resourceTimeRanges: ArrayHelper.populate(20, i => ({
        id: i + 1,
        resourceId: i + 1,
        name: `Range ${i + 1}`,
        startDate,
        duration: 1 + Math.round(Math.random() * 10),
        durationUnit: 'days'
      })),
      enableEventAnimations: false,
      useInitialAnimation: false
    });
    await t.waitForProjectReady();
    let timeRangesCount;
    t.chain({
      waitForSelector: '.b-sch-resourcetimerange'
    }, async () => {
      timeRangesCount = t.query('.b-sch-resourcetimerange').length;
      t.is(timeRangesCount, 15, 'Resource time range for every resource within buffer');
    }, // without this timeout view is visually correct when it shouldn't be. test catches problem, but visually
    // view is correct, so this waitFor is mostly for human
    {
      waitFor: 100
    }, async () => {
      t.diag('Filter all events');
      scheduler.eventStore.filter(r => /Event 2$/.test(r.name));
      t.is(t.query('.b-sch-resourcetimerange:not(.b-sch-released)').length, timeRangesCount, 'All time ranges are rendered');
    });
  });
  t.it('Should not disappear when zooming with all events filtered out', async t => {
    await createScheduler(1);
    scheduler.eventStore.filter(() => false);
    t.ok(scheduler.hasVisibleEvents, 'ResourceTimeRanges considered visible events');
    await t.waitForEventOnTrigger(scheduler, 'presetChange', () => scheduler.zoomIn());
    await t.waitForEventOnTrigger(scheduler, 'presetChange', () => scheduler.zoomIn());
    await t.waitForSelectorCount('.b-sch-resourcetimerange:not(.b-sch-released)', 2);
    t.pass('Resource time ranges drawn after filter + zoom');
    scheduler.resourceTimeRangeStore.filter(() => false);
    t.notOk(scheduler.hasVisibleEvents, 'Nothing considered visible after filtering ranges out');
  });
  t.it('Should support disabling', async t => {
    await createScheduler(1);
    scheduler.features.resourceTimeRanges.disabled = true;
    t.selectorNotExists('.b-sch-resourcetimerange:not(.b-sch-released)', 'None');
    scheduler.features.resourceTimeRanges.disabled = false;
    t.selectorExists('.b-sch-resourcetimerange:not(.b-sch-released)', 'Found');
  }); // https://github.com/bryntum/support/issues/369

  t.it('Should preserve names on scrolling', t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      width: '600px',
      mode: 'vertical',
      startDate: new Date(2019, 0, 1, 0),
      endDate: new Date(2019, 0, 1, 6),
      viewPreset: 'hourAndDay',
      features: {
        resourceTimeRanges: true
      },
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }, {
        id: 'r3',
        name: 'Lisa'
      }, {
        id: 'r4',
        name: 'Madison'
      }, {
        id: 'r5',
        name: 'Mark'
      }, {
        id: 'r6',
        name: 'Kate'
      }, {
        id: 'r7',
        name: 'Dan'
      }, {
        id: 'r8',
        name: 'Henrik'
      }, {
        id: 'r9',
        name: 'Rob'
      }, {
        id: 'r10',
        name: 'Gloria'
      }],
      resourceTimeRanges: [{
        id: 1,
        resourceId: 'r1',
        startDate: '2019-01-01T00:00',
        endDate: '2019-01-01T01:00',
        name: 'One',
        timeRangeColor: 'green'
      }, {
        id: 2,
        resourceId: 'r2',
        startDate: '2019-01-01T00:00',
        endDate: '2019-01-01T01:00',
        name: 'Two',
        timeRangeColor: 'red'
      }, {
        id: 3,
        resourceId: 'r3',
        startDate: '2019-01-01T00:00',
        endDate: '2019-01-01T01:00',
        name: 'Three',
        timeRangeColor: 'blue'
      }]
    });
    let scrollTimer;
    const scrollable = scheduler.subGrids.normal.scrollable,
          checkTimeRanges = scheduler.resourceTimeRangeStore.records.map(timeRange => {
      return {
        waitForSelector: `.b-sch-resourcetimerange[data-resource-id="${timeRange.resourceId}"]:contains(${timeRange.name})`,
        desc: `Correct timerange name ${timeRange.name}`
      };
    });
    t.chain(checkTimeRanges, async () => {
      scrollTimer = setInterval(() => scrollable.x += 100, 50);
    }, {
      waitFor: () => scrollable.x >= 500
    }, async () => {
      clearInterval(scrollTimer);
      scrollTimer = setInterval(() => scrollable.x -= 100, 50);
    }, {
      waitFor: () => scrollable.x === 0
    }, async () => {
      clearInterval(scrollTimer);
    }, checkTimeRanges);
  });
  t.it('Should support resourceTimeRangeStore provided on the Scheduler', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      features: {
        resourceTimeRanges: true
      },
      startDate: new Date(2019, 0, 6),
      endDate: new Date(2019, 0, 27),
      resources: [{
        id: 1,
        name: 'Resource 1'
      }],
      resourceTimeRangeStore: new ResourceTimeRangeStore({
        data: [{
          id: 1,
          resourceId: 1,
          startDate: new Date(2019, 0, 6),
          duration: 4,
          durationUnit: 'd',
          name: 'Range 1'
        }]
      }),
      enableEventAnimations: false
    });
    await t.waitForProjectReady();
    t.selectorCountIs(rangeSelector, 1, '1 range element found');
  }); // https://github.com/bryntum/support/issues/2163

  t.it('Should support iconCls on resource time range', async t => {
    await createScheduler(1, {
      resourceTimeRanges: [{
        id: 1,
        resourceId: 1,
        startDate: startDate,
        duration: 4,
        iconCls: 'b-fa b-fa-plus',
        name: 'Range 1'
      }]
    });
    t.selectorExists('.b-fa-plus', 'Plus icon applied');
  }); // https://github.com/bryntum/support/issues/3231

  t.it('Should fire renderEvent event for time range', async t => {
    createScheduler(2, {
      resourceTimeRanges: [{
        id: 1,
        resourceId: 1,
        startDate,
        duration: 4,
        iconCls: 'b-fa b-fa-plus',
        name: 'Range 1'
      }, {
        id: 2,
        resourceId: 2,
        startDate,
        duration: 5,
        iconCls: 'b-fa b-fa-plus',
        name: 'Range 2'
      }]
    });
    t.willFireNTimes(scheduler, 'renderEvent', 4);
    await scheduler.project.commitAsync();
  }); // https://github.com/bryntum/support/issues/3297

  t.it('Should show time range label "sticky" when range starts before view start date', async t => {
    await createScheduler(1, {
      resourceTimeRanges: [{
        id: 1,
        resourceId: 1,
        startDate: new Date(2019, 0, 5),
        duration: 30,
        iconCls: 'b-fa b-fa-plus',
        name: 'Range 1'
      }]
    });
    t.isApprox(t.rect('.b-sch-resourcetimerange .b-sch-event-content').left, t.rect(scheduler.timeAxisSubGridElement).left, 'Sticky applied');
  }); // https://github.com/bryntum/support/issues/2521

  t.it('Should be able to set resourceTimeRangeStore at runtime', async t => {
    const ranges1 = [{
      id: 1,
      resourceId: 1,
      startDate: startDate,
      duration: 4,
      durationUnit: 'days',
      name: 'Range 1',
      cls: 'custom'
    }, {
      id: 2,
      resourceId: 1,
      startDate: DateHelper.add(startDate, 5, 'days'),
      duration: 2,
      durationUnit: 'days',
      name: 'Range 2'
    }, {
      id: 3,
      resourceId: 1,
      startDate: DateHelper.add(startDate, 17, 'days'),
      duration: 4,
      durationUnit: 'days',
      name: 'Range 3'
    }],
          ranges2 = [{
      id: 1,
      resourceId: 1,
      startDate: DateHelper.add(startDate, 1, 'days'),
      duration: 2,
      durationUnit: 'days',
      name: 'Range 2-1',
      cls: 'range-2-1'
    }, {
      id: 2,
      resourceId: 1,
      startDate: DateHelper.add(startDate, 4, 'days'),
      duration: 2,
      durationUnit: 'days',
      name: 'Range 2-2',
      cls: 'range-2-2'
    }, {
      id: 3,
      resourceId: 1,
      startDate: DateHelper.add(startDate, 7, 'days'),
      duration: 4,
      durationUnit: 'days',
      name: 'Range 2-3',
      cls: 'range-2-3'
    }];
    await createScheduler(5); // Initial rendering

    await t.waitForSelector('.b-sch-resourcetimerange.custom'); // Set instance of store

    scheduler.resourceTimeRangeStore = new ResourceTimeRangeStore({
      data: ranges2
    });
    await t.waitForSelectorNotFound('.b-sch-resourcetimerange.custom');
    t.selectorExists('.b-sch-resourcetimerange.range-2-1');
    t.selectorExists('.b-sch-resourcetimerange.range-2-2');
    t.selectorExists('.b-sch-resourcetimerange.range-2-3'); // Set config object

    scheduler.resourceTimeRangeStore = {
      data: ranges1
    };
    await t.waitForSelectorNotFound('.b-sch-resourcetimerange.range-2-1');
    t.selectorNotExists('.b-sch-resourcetimerange.range-2-2');
    t.selectorNotExists('.b-sch-resourcetimerange.range-2-3');
    t.selectorExists('.b-sch-resourcetimerange.custom');
  }); // https://github.com/bryntum/support/issues/3391

  t.it('tabIndex should be configurable', async t => {
    await createScheduler();
    t.selectorExists('.b-sch-resourcetimerange[tabIndex="0"]', 'tabIndex 0 by default');
    scheduler.features.resourceTimeRanges.tabIndex = null;
    t.selectorNotExists('.b-sch-resourcetimerange[tabIndex]', 'No tabIndex assigned');
    scheduler.features.resourceTimeRanges.tabIndex = -1;
    t.selectorExists('.b-sch-resourcetimerange[tabIndex="-1"]', 'tabIndex changed to -1');
  }); // https://github.com/bryntum/support/issues/3449

  t.it('Should not disappear on scroll with many stacked events', async t => {
    await createScheduler(50, {
      rowHeight: 200
    });
    const {
      eventStore
    } = scheduler;

    for (let i = 0; i < 10; i++) {
      eventStore.getAt(i).resourceId = 1;
      eventStore.getAt(i).startDate = eventStore.first.startDate;
    } // Safari needs time do redraw before we scroll


    await t.waitForAnimationFrame();
    scheduler.scrollTop = 400; // Not waiting for selector, since that could catch the initial range and we want to make sure it is there
    // after redraw after scroll

    await t.waitForAnimationFrame();
    t.selectorExists('.b-sch-resourcetimerange', 'ResourceTimeRange found');
  }); // https://github.com/bryntum/support/issues/3477

  t.it('Should not find artifacts from event when reusing element', async t => {
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2019, 0, 1, 6),
      endDate: new Date(2019, 0, 3, 20),
      viewPreset: 'hourAndDay',
      features: {
        resourceTimeRanges: true
      },
      events: [{
        id: 4,
        resourceId: 1,
        startDate: new Date(2019, 0, 1, 8, 30),
        endDate: new Date(2019, 0, 1, 9, 40),
        name: 'Scrum 2',
        iconCls: 'b-fa b-fa-bullhorn'
      }],
      resources: [{
        id: 1,
        name: 'Lisa'
      }],
      resourceTimeRanges: [{
        id: 5,
        resourceId: 1,
        startDate: '2019-01-02T12:00',
        endDate: '2019-01-02T14:00',
        name: 'Lunch'
      }, {
        id: 6,
        resourceId: 1,
        startDate: '2019-01-02T16:00',
        endDate: '2019-01-02T20:00',
        name: 'Lunch asdad'
      }]
    });
    await scheduler.scrollToDate(new Date(2019, 0, 2, 20));
    t.selectorNotExists('.b-sch-resourcetimerange:contains(Scrum 2)');
  }); // https://github.com/bryntum/support/issues/3539

  t.it('Should render events when window height increases', async t => {
    t.setWindowSize(1024, 300);
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2019, 0, 1, 6),
      endDate: new Date(2019, 0, 1, 20),
      viewPreset: 'hourAndDay',
      rowHeight: 90,
      features: {
        resourceTimeRanges: true
      },
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }, {
        id: 'r3',
        name: 'Lisa'
      }, {
        id: 'r4',
        name: 'Madison'
      }, {
        id: 'r5',
        name: 'Mark'
      }, {
        id: 'r6',
        name: 'Kate'
      }],
      events: [{
        id: 7,
        resourceId: 'r6',
        startDate: new Date(2019, 0, 1, 12, 30),
        duration: 1,
        name: 'Important meeting'
      }],
      resourceTimeRanges: [{
        id: 2,
        resourceId: 'r6',
        startDate: '2019-01-01T11:00',
        duration: 1,
        name: 'Lunch'
      }]
    });
    t.setWindowSize(1024, 768);
    await t.waitForAnimationFrame();
    t.waitForSelector('.b-sch-event');
    t.pass('Event rendered');
    t.waitForSelector('.b-sch-resourcetimerange');
    t.pass('ResourceTimeRange rendered');
  });
  t.it('Should not crash with repurposed elements and custom html eventRenderer', async t => {
    const count = 40;
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2021, 0, 1),
      endDate: new Date(2021, 0, 20),
      viewPreset: 'dayAndWeek',
      rowHeight: 60,
      barMargin: 10,
      features: {
        resourceTimeRanges: true
      },
      resources: ArrayHelper.populate(count, i => ({
        id: i,
        name: i
      })),
      events: ArrayHelper.populate(count / 2, i => ({
        id: i,
        name: i,
        resourceId: i * 2,
        startDate: '2021-01-01T11:00',
        duration: 1
      })),
      resourceTimeRanges: ArrayHelper.populate(count, i => ({
        id: i,
        name: i,
        resourceId: i,
        startDate: '2021-01-01T18:00',
        duration: 1
      })),

      eventRenderer() {
        return {
          children: ['A']
        };
      }

    });

    while (scheduler.scrollTop < scheduler.scrollable.maxY) {
      scheduler.scrollTop += 200;
      await t.waitForAnimationFrame();
    }

    while (scheduler.scrollTop > 0) {
      scheduler.scrollTop -= 200;
      await t.waitForAnimationFrame();
    }
  }); // https://github.com/bryntum/support/issues/3603

  t.it('Should not show html from custom eventRenderer in vertical scheduler', async t => {
    scheduler = await t.getSchedulerAsync({
      mode: 'vertical',
      startDate: new Date(2021, 9, 21, 6),
      endDate: new Date(2021, 9, 21, 20),
      viewPreset: 'hourAndDay',
      features: {
        resourceTimeRanges: true
      },
      resources: ArrayHelper.populate(10, i => ({
        id: i,
        name: `Resource ${i}`
      })),
      events: [{
        id: 1,
        resourceId: 9,
        startDate: '2021-10-21T09',
        endDate: '2021-10-21T10'
      }],
      resourceTimeRanges: [{
        id: 2,
        resourceId: 0,
        startDate: '2021-10-21T10',
        endDate: '2021-10-21T12',
        name: 'Range'
      }],
      eventRenderer: () => ` <div>Hello</div>`
    });
    await scheduler.scrollEventIntoView(scheduler.eventStore.first);
    scheduler.scrollLeft = 0;
    await t.waitForAnimationFrame();
    t.waitForSelector('.b-sch-resourcetimerange:textEquals(Range)');
    t.pass('Range displayed correctly');
  });
});