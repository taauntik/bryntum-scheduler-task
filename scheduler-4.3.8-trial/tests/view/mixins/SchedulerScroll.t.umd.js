"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    var _scheduler, _scheduler$destroy;

    (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : (_scheduler$destroy = _scheduler.destroy) === null || _scheduler$destroy === void 0 ? void 0 : _scheduler$destroy.call(_scheduler);
    t.setWindowSize(1024, 768);
  });

  const assertHeaders = (t, threshold = 0) => {
    const headerWrapper = t.query('.b-grid-headers-normal')[0],
          header = t.query('.b-grid-headers-normal .b-grid-header')[0],
          // Assume header might be a bit less than available space due to rounding to have integer width of all ticks
    headerWidthIsCorrect = header.offsetWidth >= headerWrapper.offsetWidth - threshold;
    t.ok(headerWidthIsCorrect, 'Header takes all available width');
  };

  t.it('Should be able to scroll during paint without height', async t => {
    // Ignore grid height warning
    t.spyOn(console, 'warn').and.callFake(() => {});
    scheduler = await t.getSchedulerAsync({
      height: 0,
      listeners: {
        paint({
          source: scheduler
        }) {
          scheduler.scrollToDate(new Date(2020, 9, 7));
        }

      }
    });
    await t.waitForSelector('.b-sch-header-timeaxis-cell:textEquals(We 07)');
    t.pass('Scrolled without crashing');
  }); // https://github.com/bryntum/support/issues/2414

  t.it('Time axis header should take all available space on window resize', async t => {
    t.setWindowSize(300, 500);
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2018, 0, 1, 6),
      endDate: new Date(2018, 0, 1, 12),
      viewPreset: 'hourAndDay'
    });
    t.chain({
      waitForSelector: '.b-grid-headers-normal .b-grid-header'
    }, {
      waitFor: () => scheduler.timeAxisViewModel.availableSpace > 290,
      trigger: () => t.setWindowSize(400, 500)
    }, async () => {
      assertHeaders(t, 6); // Threshold is number of ticks
    }, {
      waitFor: () => scheduler.timeAxisViewModel.availableSpace > 390,
      trigger: () => t.setWindowSize(500, 500)
    }, async () => {
      assertHeaders(t, 6);
    }, {
      waitFor: () => scheduler.timeAxisViewModel.availableSpace > 490,
      trigger: () => t.setWindowSize(600, 500)
    }, async () => {
      assertHeaders(t, 6);
    }, {
      waitFor: () => scheduler.timeAxisViewModel.availableSpace > 590,
      trigger: () => t.setWindowSize(700, 500)
    }, async () => {
      assertHeaders(t, 6);
    });
  }); //region Scroll flickering

  t.it('Time axis header should not update available space in infinite loop', async t => {
    t.setWindowSize(600, 330);
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2018, 0, 1, 6),
      endDate: new Date(2018, 0, 1, 12),
      viewPreset: 'hourAndDay'
    });
    await t.waitForAnimationFrame();
    const spy = t.spyOn(scheduler.currentOrientation, 'onViewportResize').and.callThrough();
    t.chain({
      waitForSelector: '.b-grid-headers-normal .b-grid-header'
    }, async () => {
      spy.reset();
    }, // Need to give it some time to make sure the timeline does not flickering
    {
      waitFor: 2000
    }, async () => {
      assertHeaders(t, 15); // Threshold is scroll bar width

      t.expect(spy).toHaveBeenCalled('<3');
    });
  });
  t.it('Time axis header should not update available space in infinite loop when decrease available space', async t => {
    t.setWindowSize(1472, 326);
    scheduler = await t.getSchedulerAsync({
      columns: [{
        text: 'Name',
        sortable: true,
        width: 130,
        field: 'name',
        locked: true
      }],
      startDate: new Date(2018, 0, 1, 6),
      endDate: new Date(2018, 0, 1, 20),
      viewPreset: 'hourAndDay'
    });
    await t.waitForAnimationFrame();
    const spy = t.spyOn(scheduler.currentOrientation, 'onViewportResize').and.callThrough();
    t.chain({
      waitForSelector: '.b-grid-headers-normal .b-grid-header'
    }, {
      drag: '.b-grid-splitter .b-grid-splitter-main',
      by: [9, 0],
      fromOffset: ['50%', 10]
    }, {
      drag: '.b-grid-splitter .b-grid-splitter-main',
      by: [1, 0],
      fromOffset: ['50%', 10]
    }, async () => {
      spy.reset();
    }, // Need to give it some time to make sure the timeline does not flickering
    {
      waitFor: 2000
    }, async () => {
      assertHeaders(t, DomHelper.scrollBarWidth); // Threshold is scroll bar width

      t.expect(spy).toHaveBeenCalled('<3');
    });
  }); //endregion Scroll flickering

  t.it('EventStore should fire loadDateRange events', async t => {
    const loadDateRangeEvents = [];
    let tavmUpdateCount = 0;
    scheduler = await t.getScheduler({
      viewPreset: 'hourAndDay',
      visibleDate: {
        date: new Date(2020, 0, 1, 12),
        block: 'center'
      },
      infiniteScroll: true,
      listeners: {
        timeAxisViewModelUpdate: () => tavmUpdateCount++
      },
      eventStore: {
        listeners: {
          loadDateRange(e) {
            loadDateRangeEvents.push(e);
          }

        }
      }
    }); // https://github.com/bryntum/support/issues/3715

    t.wontFire(scheduler, 'timelineviewportresize'); // Wait for extraneous events to fire.
    // loadDateRange and timeAxisViewModelUpdate should only fire once during
    // construction, and layout width and calculation of date initial range.

    await t.waitFor(200); // Only one TimeAxisViewModel update event during setup.

    t.is(tavmUpdateCount, 1); // The initial range centered on 2020-01-01T12:00

    t.is(loadDateRangeEvents.length, 1);
    t.isDeeply(loadDateRangeEvents[0].old, {});
    t.isDeeply(loadDateRangeEvents[0].new, {
      startDate: new Date(2019, 11, 29, 11),
      endDate: new Date(2020, 0, 4, 13)
    });
    await scheduler.timeAxisSubGrid.scrollable.scrollBy(4000); // Scroll beyond the right edge

    await t.waitFor(() => loadDateRangeEvents.length === 2); // We must wait for the bug to manifest. The styles are changed on a timer.
    // If we do not wait, the test runs to the end without registering that a
    // timelineviewportresize event fires.
    // https://github.com/bryntum/support/issues/3715

    await t.waitFor(200); // Only one more TimeAxisViewModel update event in response to the scroll.

    t.is(tavmUpdateCount, 2);
    t.isDeeply(loadDateRangeEvents[1].old, loadDateRangeEvents[0].new);
    t.isDeeply(loadDateRangeEvents[1].new, {
      startDate: new Date(2019, 11, 31, 21),
      endDate: new Date(2020, 0, 7)
    }); // Scroll back beyond the left edge

    await scheduler.timeAxisSubGrid.scrollable.scrollBy(4000);
    await t.waitFor(() => loadDateRangeEvents.length === 3);
    t.isDeeply(loadDateRangeEvents[2].old, loadDateRangeEvents[1].new);
    t.isDeeply(loadDateRangeEvents[2].new, {
      startDate: new Date(2020, 0, 3, 6),
      endDate: new Date(2020, 0, 9, 9)
    });
  });
  t.it('infiniteScroll should scroll back to center after snapping to right edge', async t => {
    const loadDateRangeEvents = [];
    scheduler = await t.getScheduler({
      viewPreset: 'hourAndDay',
      visibleDate: {
        date: new Date(2020, 0, 1, 12),
        block: 'center'
      },
      infiniteScroll: true
    });
    const {
      timeAxisSubGrid,
      timelineScroller
    } = scheduler,
          {
      element
    } = timeAxisSubGrid;
    scheduler.eventStore.on({
      loadDateRange(e) {
        loadDateRangeEvents.push(e);
      }

    }); // Scroll to the right edge

    await timelineScroller.scrollTo(timelineScroller.maxPosition);
    await t.waitFor(() => loadDateRangeEvents.length === 1);
    const centerPosition = element.scrollLeft; // Scroll to the right edge

    await timelineScroller.scrollTo(timelineScroller.maxPosition);
    await t.waitFor(() => loadDateRangeEvents.length === 2);
    t.is(element.scrollLeft, centerPosition); // Scroll to the right edge

    await timelineScroller.scrollTo(timelineScroller.maxPosition);
    await t.waitFor(() => loadDateRangeEvents.length === 3);
    t.is(element.scrollLeft, centerPosition);
  }); // https://github.com/bryntum/support/issues/2365

  t.it('Should maintain number of ticks in the time axis when scrolling to a date', async t => {
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2017, 0, 1, 8),
      endDate: new Date(2017, 0, 1, 16),
      viewPreset: 'hourAndDay'
    });
    const ticksBefore = scheduler.timeAxis.count;
    scheduler.scrollToDate(new Date(2021, 3, 17, 17, 20));
    t.is(scheduler.timeAxis.count, ticksBefore, 'Same size time axis after scrolling');
  }); // https://github.com/bryntum/support/issues/2901

  DomHelper.scrollBarWidth > 0 && t.it('Should maintain focused event when clicking native scrollbar', async t => {
    scheduler = t.getScheduler({
      height: 200
    }, 1);
    await t.click('.b-sch-event');
    t.is(document.activeElement, t.query('.b-sch-event-wrap')[0], 'event bar is focused'); // Click the scroll bar

    await t.click('.b-grid-body-container.b-vertical-overflow', null, null, null, ['100%-2', 10]);
    t.is(document.activeElement, t.query('.b-sch-event-wrap')[0], 'event bar is still focused');
  }); // https://github.com/bryntum/support/issues/2991

  t.it('Events should not disappear on viewport with few rows and low height', async t => {
    scheduler = await t.getSchedulerAsync({
      height: 200,
      events: ArrayHelper.populate(14, i => ({
        id: i + 1,
        name: `Event ${i + 1}`,
        startDate: '2011-01-03',
        endDate: '2011-01-06',
        resourceId: i + 1
      })),
      resources: ArrayHelper.populate(14, i => ({
        id: i + 1,
        name: `Resource ${i + 1}`
      }))
    }); // Scroll into view

    for (let i = 0; i < 2; i++) {
      scheduler.scrollTop += 150;
      await t.waitForAnimationFrame();
    } // Out of view


    scheduler.scrollTop -= 300;
    await t.waitForAnimationFrame(); // And back into view for the bug to manifest (rerendering an event released because of the vertical buffer)

    scheduler.scrollTop = 300;
    await t.waitForAnimationFrame();
    t.selectorExists(`${scheduler.unreleasedEventSelector}[data-event-id="9"]`, 'Event #9 rendered');
    t.selectorExists(`${scheduler.unreleasedEventSelector}[data-event-id="10"]`, 'Event #10 rendered');
  }); // https://github.com/bryntum/support/issues/3568

  t.it('Should have correct visibleDateRange in horizontalScroll listeners', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      columns: [{
        text: 'Name',
        field: 'name'
      }],
      visibleDate: new Date(2021, 9, 15),
      startDate: new Date(2000, 0, 1),
      endDate: new Date(2030, 11, 31),
      viewPreset: 'weekAndMonth'
    });
    await t.waitForEvent(scheduler, 'horizontalScroll');
    t.firesOk(scheduler, {
      // Should ideally be two, (one per subgrid) but for time axis subgrid one is from scroll and one from
      // scrollEnd. Dont want to upset that
      horizontalscroll: 3
    });
    scheduler.on('horizontalScroll', ({
      subGrid
    }) => {
      if (subGrid === scheduler.timeAxisSubGrid) {
        const visibleDateRange = scheduler.visibleDateRange;
        t.is(visibleDateRange.startDate.getFullYear(), 2021, 'Year consistent');
        t.is(visibleDateRange.startDate.getMonth(), 8, 'Month consistent');
        t.is(visibleDateRange.startDate.getDate(), 15, 'Date consistent');
      }
    });
    scheduler.viewPreset = 'dayAndWeek';
    await t.waitFor(() => !scheduler.scrollingToCenter);
  });
});