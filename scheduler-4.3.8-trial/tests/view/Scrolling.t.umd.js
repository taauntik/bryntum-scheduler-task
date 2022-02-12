"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    var _scheduler;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });
  t.it('Should support scrolling event into view without animation', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      width: 600,
      columns: [{
        field: 'name',
        width: 150
      }],
      resources: [{
        id: 7,
        name: 'Lee',
        type: 'Marketing',
        eventColor: 'green'
      }],
      events: [{
        id: 11,
        resourceId: 7,
        name: 'Appointment #7',
        startDate: '2017-02-07 15:00',
        endDate: '2017-02-07 18:00',
        iconCls: 'b-fa b-fa-calendar-alt'
      }],
      startDate: new Date(2017, 1, 7, 8),
      endDate: new Date(2017, 1, 7, 18),
      viewPreset: 'hourAndDay'
    });
    await t.waitForProjectReady();
    t.chain(next => {
      t.waitForScrollChange(scheduler.subGrids.normal.element, 'left', next);
      scheduler.scrollEventIntoView(scheduler.eventStore.first, {
        animate: false
      });
    }, {
      waitForHeaderAndBodyScrollSynced: scheduler
    }, () => {
      document.querySelector('.b-fa-calendar-alt').style.pointerEvents = 'all';
      t.elementIsTopElement('.b-fa-calendar-alt');
      t.isInView('.b-fa-calendar-alt');
    });
  }); // Do not run test on scrollbar-free env

  if (DomHelper.scrollBarWidth !== 0) {
    // Also tested in grid, but scheduler does not call super by design for one handler so test needed here also
    t.it('Should refresh fake scroller when adding first record', async t => {
      scheduler = await t.getSchedulerAsync({
        resources: [],
        events: []
      });
      scheduler.resourceStore.add({
        id: 1
      });
      t.ok(t.isElementVisible(scheduler.virtualScrollers), 'Scroller shown');
    }); // https://app.assembla.com/spaces/bryntum/tickets/7443

    t.it('Should not get stuck in infinite scrollbar toggling', async t => {
      scheduler = await t.getSchedulerAsync({
        // Different height for IE11 since headers are a bit lower there
        height: t.browser.msie ? 333 : 353,
        width: 600,
        tickSize: 35
      }); // "Internal" resize triggered by render is on a timeout to prevent ResizeMonitor loop crash, so a single
      // update is expected.
      // Seems not triggered any longer after HorizontalTimeAxis refactoring

      t.firesOk(scheduler.timeAxisViewModel, {
        update: '<=1'
      });
      t.chain( // Need to give it some time to toggle back and forth (or rather not toggle if fix is working)
      {
        waitFor: 500
      });
    });
  }

  t.it('Should correctly update scroll range when adding resources in succession', async t => {
    scheduler = await t.getSchedulerAsync();

    for (let i = 0; i < 50; i++) {
      scheduler.resourceStore.add({
        name: `r${i + 11}`
      });
    }

    await t.waitForProjectReady();
    await t.waitFor(() => scheduler.scrollable.scrollHeight === scheduler.resourceStore.count * scheduler.rowManager.rowOffsetHeight);
    t.pass('Correct scrollHeight');
  }); // https://app.assembla.com/spaces/bryntum/tickets/7563

  t.it('Should not scroll scheduler without header when clicking row', t => {
    scheduler = t.getScheduler({
      hideHeaders: true,
      sanityCheck: false // Sanity check does not work with hidden headers

    });
    scheduler.scrollLeft = 80;
    t.chain({
      click: '.b-sch-timeaxis-cell'
    }, () => {
      t.is(scheduler.scrollLeft, 80, 'Did not scroll after click');
    });
  });
  t.it('Should use initial animation, not when scrolling', async t => {
    scheduler = t.getScheduler({
      useInitialAnimation: true,
      startDate: new Date(2019, 0, 25),
      endDate: new Date(2019, 0, 31),
      resources: ArrayHelper.populate(100, i => ({
        id: i + 1
      })),
      events: [{
        id: 1,
        resourceId: 1,
        startDate: new Date(2019, 0, 25, 0),
        endDate: new Date(2019, 0, 25, 12)
      }, {
        id: 2,
        resourceId: 80,
        startDate: new Date(2019, 0, 25, 0),
        endDate: new Date(2019, 0, 25, 12)
      }]
    });
    await t.waitFor(() => !scheduler.isFirstRender);
    await scheduler.scrollEventIntoView(scheduler.eventStore.last);
    t.selectorNotExists('.b-initial-fade-in', 'Initial animation no longer applied');
  });
  t.it('should draw events correctly after scrolling into view', async t => {
    scheduler = await t.getSchedulerAsync({
      columns: [{
        text: 'Machines',
        field: 'name',
        width: 130
      }],
      resources: [{
        id: 'r13',
        name: 'Robot 4'
      }, {
        id: 'r15',
        name: 'Robot 6'
      }],
      events: [{
        id: 4,
        resourceId: 'r13',
        startDate: '2019-12-10',
        duration: 5
      }, {
        id: 6,
        resourceId: 'r15',
        startDate: '2019-12-03',
        duration: 12
      }],
      startDate: '2019-11-29',
      endDate: '2019-12-27',
      viewPreset: 'dayAndWeek'
    });
    await scheduler.scrollEventIntoView(scheduler.eventStore.last);
    t.selectorExists('[data-event-id="6"]', 'Target event rendered');
    t.selectorExists('[data-event-id="4"]', 'Other event rendered');
    t.selectorExists('[data-tick-index="11"]', 'Other events start tick rendered');
  });
  t.it('Scrolling a focused event quickly out of view', async t => {
    t.waitForScrolling = false;
    const events = [];

    for (let i = 0; i < 200; i++) {
      const j = i * 2;
      events.push({
        id: j + 1,
        resourceId: `r${i + 1}`,
        name: `Event ${j + 1}`,
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      });
      events.push({
        id: j + 2,
        resourceId: `r${i + 1}`,
        name: `Event ${j + 2}`,
        startDate: new Date(2011, 0, 5),
        endDate: new Date(2011, 0, 7)
      });
    }

    scheduler = await t.getSchedulerAsync({
      features: {
        eventDrag: {
          showTooltip: false
        },
        eventTooltip: false,
        scheduleTooltip: false
      },
      resources: ArrayHelper.populate(200, i => ({
        id: `r${i + 1}`,
        name: `Resource ${i + 1}`
      })),
      events
    }); // TODO: Commented out since events are not there on first render, thus average row height is expected to change

    let averageRowHeight, resizeEventEl, scrollTimer; // Focus exit to the scheduler's encapsulating element upon event derender caused by scroll
    // was erroneously focusing a grid cell causing a spurious scrollIntoView

    t.isCalledNTimes('focusCell', scheduler, 0, 'Scrolling does not cause cell focus'); // https://github.com/bryntum/support/issues/263
    // The issue was that event record change was causing a potential row height change.
    // This attempted to "reset" the RowManager's averageRowHeight by setting it to null.
    // The next incremental adjustment of that then calculates a small value.

    t.chain({
      waitForSelector: scheduler.eventSelector
    }, next => {
      averageRowHeight = scheduler.rowManager.averageRowHeight;
      scrollTimer = setInterval(() => scheduler.scrollable.y += 50, 50);
      next();
    }, {
      waitFor: () => scheduler.getElementFromEventRecord(scheduler.eventStore.getAt(90))
    }, next => {
      clearInterval(scrollTimer);
      next();
    }, {
      waitFor: () => !scheduler.scrolling
    }, next => {
      t.is(scheduler.rowManager.averageRowHeight, averageRowHeight, 'Average row height is unchanged');
      resizeEventEl = scheduler.getElementFromEventRecord(scheduler.eventStore.getAt(70));
      next();
    }, {
      moveCursorTo: () => resizeEventEl
    }, {
      drag: () => resizeEventEl,
      offset: ['100%-3', 5],
      by: [100, 0]
    }, next => {
      scrollTimer = setInterval(() => scheduler.scrollable.y += 50, 100);
      next();
    }, {
      waitFor: () => document.activeElement !== resizeEventEl.parentNode
    }, next => {
      clearInterval(scrollTimer);
      next();
    }, {
      waitFor: () => !scheduler.scrolling
    }, () => {
      t.is(scheduler.rowManager.averageRowHeight, averageRowHeight, 'Average row height is unchanged');
    });
  }); // https://github.com/bryntum/support/issues/331

  t.it('Should not crash when calling scrollEventInto view with schedule subgrid collapsed', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      width: 600,
      columns: [{
        field: 'name',
        width: 150
      }],
      resources: [{
        id: 1,
        name: 'Lee'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        name: 'Appointment #7',
        startDate: '2017-02-07',
        endDate: '2017-02-08'
      }],
      startDate: new Date(2017, 1, 7, 8),
      endDate: new Date(2017, 1, 7, 18)
    });
    await t.waitForProjectReady();
    await scheduler.subGrids.normal.collapse();
    await scheduler.scrollEventIntoView(scheduler.eventStore.first);
    scheduler.startDate = new Date(2019, 1, 7, 8);
    await scheduler.subGrids.normal.expand();
    await scheduler.scrollEventIntoView(scheduler.eventStore.first);
    t.selectorExists(scheduler.unreleasedEventSelector, 'Event scrolled into view');
  });
  t.it('Should scroll resource into view if an event is not scheduled', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      width: 600,
      height: 300,
      columns: [{
        field: 'name',
        width: 150
      }],
      resources: [{
        id: 1
      }, {
        id: 2
      }, {
        id: 3
      }, {
        id: 4
      }, {
        id: 5
      }, {
        id: 6
      }, {
        id: 7
      }, {
        id: 8
      }, {
        id: 9
      }],
      events: [{
        id: 1,
        resourceId: 9,
        name: 'unscheduled'
      }]
    });
    await t.waitForProjectReady();
    await scheduler.scrollEventIntoView(scheduler.eventStore.first);
    t.elementIsTopElement('.b-grid-row[data-index="8"] .b-grid-cell', 'Row scrolled into view');
  });
  t.it('Should respect time axis incremement setting when calling scrollToNow', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      startDate: new Date(2017, 0, 1, 6),
      endDate: new Date(2017, 0, 1, 20),
      viewPreset: 'minuteAndHour'
    });
    await scheduler.scrollToNow({
      block: 'center'
    });
    t.is(scheduler.timeAxis.increment, 30, '30 min increments');
    t.is(scheduler.timeAxis.getAt(0).startDate.getMinutes() % 30, 0, '1st tick minutes correctly snapped');
    t.is(scheduler.timeAxis.getAt(1).startDate.getMinutes() % 30, 0, '2nd tick minutes correctly snapped');
  });
  t.it('Should support specifying a date to scroll to initially', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      viewPreset: 'dayAndWeek',
      width: 1000,
      tickSize: 50,
      resources: [],
      events: [],
      startDate: new Date(2017, 1, 0),
      endDate: new Date(2017, 3, 0),
      visibleDate: new Date(2017, 2, 1)
    });
    await t.waitForElementTop('.b-sch-header-timeaxis-cell:contains(We 01)');
    t.isApprox(scheduler.scrollable.x, 500, 'Scrolled date to right viewport edge');
  });
  t.it('Should support specifying an object defining the initial scroll of the time axis', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      viewPreset: 'dayAndWeek',
      width: 1000,
      tickSize: 50,
      resources: [],
      events: [],
      startDate: new Date(2017, 1, 0),
      endDate: new Date(2017, 5, 0),
      visibleDate: {
        date: new Date(2017, 3, 1),
        block: 'start',
        animate: 100
      }
    });
    await t.waitForScroll();
    await t.waitForElementTop('.b-sch-header-timeaxis-cell:contains(Sa 01)');
    t.isApprox(scheduler.scrollable.x, (28 + 31) * 50, 'Scrolled date to left viewport edge');
  }); // https://github.com/bryntum/support/issues/2200

  t.it('Should support scrolling an event into view when its resource is inside a collapsed parent', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      // TODO, this test fails if run with all other tests before it and startDate/endDate below commented out
      startDate: new Date(2017, 11, 1),
      endDate: new Date(2017, 11, 20),
      features: {
        tree: true
      },
      columns: [{
        type: 'tree',
        field: 'name'
      }],
      resources: [{
        id: 1,
        name: 'Airport',
        expanded: false,
        children: [{
          id: 2,
          name: 'Terminal',
          expanded: false,
          children: [{
            id: 3,
            name: 'Gate',
            leaf: true
          }]
        }]
      }],
      events: [{
        id: 1,
        resourceId: 3,
        name: 'Boarding',
        startDate: '2017-12-02',
        endDate: '2017-12-10'
      }]
    });
    const resourceStore = scheduler.resourceStore;
    scheduler.scrollEventIntoView(scheduler.eventStore.first);
    await t.waitForElementTop('.b-sch-event:contains(Boarding)');
    t.ok(resourceStore.getById(1).isExpanded(resourceStore), 'parent 1 expanded');
    t.ok(resourceStore.getById(2).isExpanded(resourceStore), 'parent 2 expanded');
  }); // https://github.com/bryntum/support/issues/3292

  t.it('Events should not disappear on assigning new resources with same ids', async t => {
    const DH = DateHelper,
          today = DH.clearTime(new Date()),
          start = DH.startOf(today, 'week');
    const resources = [...Array(5).keys()].map(i => {
      return {
        id: `r${i}`,
        name: `Test ${i}`
      };
    }),
          newResources = [...Array(50).keys()].map(i => {
      return {
        id: `r${i}`,
        name: `Test ${i}`
      };
    }),
          events = [...Array(10).keys()].map(i => {
      return {
        id: i,
        resourceId: `r${i}`,
        name: `Event ${i}`,
        startDate: DH.add(start, 2 + i, 'days'),
        duration: 2
      };
    });
    scheduler = new Scheduler({
      appendTo: document.body,
      columns: [{
        text: 'Name',
        field: 'name',
        width: 100
      }],
      events,
      resources,
      startDate: start,
      endDate: DateHelper.add(start, 2, 'weeks'),
      viewPreset: 'weekDateAndMonth'
    }); // Wait for event assigned to original resource

    await t.waitForSelector('.b-sch-event:contains(Event 0)');
    scheduler.resourceStore.data = newResources;
    await t.waitForSelector('.b-sch-event:contains(Event 5)');
    scheduler.scrollable.element.scrollTop = 1; // Let the events to disappear in case of problems

    await t.waitFor(1); // The event must be visible at this point

    await t.waitForElementVisible('.b-sch-event:contains(Event 0)');
  }); // https://github.com/bryntum/support/issues/3837

  t.it('Should position scrollbar above foreground canvas', async t => {
    scheduler = await t.getSchedulerAsync();
    scheduler.virtualScrollers.style.pointerEvents = 'all'; // To be detectable

    t.elementIsTopElement('.b-virtual-scrollers', true, 'Scroller on top');
  });
});