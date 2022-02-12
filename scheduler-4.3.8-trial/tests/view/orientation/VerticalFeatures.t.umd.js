"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

StartTest(t => {
  let scheduler;

  async function getScheduler(config) {
    return scheduler = await t.getVerticalSchedulerAsync(_objectSpread({
      features: {
        eventMenu: true,
        eventDragCreate: false,
        // Disabled to be able to use EventDragSelect
        eventDragSelect: true,
        resourceTimeRanges: true,
        timeRanges: true
      }
    }, config));
  }

  t.beforeEach(() => {
    var _scheduler;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });

  function assertEventElement(t, event, top = null, left, width, height, msg = '') {
    const selector = `[data-event-id="${event.id}"]:not(.b-released)`;

    if (top === null) {
      t.selectorNotExists(selector, 'Element not found ' + msg);
    } else {
      const element = document.querySelector(selector);
      t.ok(element, 'Element found ' + msg);
      const box = Rectangle.from(element, scheduler.timeAxisSubGridElement);
      t.is(box.top, top, 'Correct top');
      t.is(box.left, left, 'Correct left');
      t.is(box.width, width, 'Correct width');
      t.is(box.height, height, 'Correct height');
    }
  } // Dependencies not supported by vertical
  // DependencyEdit not supported by vertical


  t.it('EventMenu sanity', async t => {
    scheduler = await getScheduler();
    t.chain({
      rightClick: '[data-event-id="1"]'
    }, {
      waitForSelector: ':contains(Edit event)'
    });
  }); // EventDrag tested in VerticalEventDrag.t.js
  // EventDragCreate tested in VerticalEventDragCreate.t.js

  t.it('EventDragSelect sanity', async t => {
    scheduler = await getScheduler();
    t.chain({
      moveMouseTo: [400, 50]
    }, {
      drag: '.b-sch-timeaxis-cell',
      offset: [50, 50],
      by: [150, 300]
    }, () => {
      t.isDeeply(scheduler.selectedEvents, scheduler.eventStore.getRange(0, 3), 'Correct selection');
      t.selectorExists('[data-event-id="1"] .b-sch-event-selected', 'Element 1 has selection cls');
      t.selectorExists('[data-event-id="2"] .b-sch-event-selected', 'Element 1 has selection cls');
      t.selectorExists('[data-event-id="3"] .b-sch-event-selected', 'Element 1 has selection cls');
    });
  });
  t.it('EventEdit sanity', async t => {
    scheduler = await getScheduler();
    t.chain({
      dblClick: '[data-event-id="1"]'
    }, {
      click: '[data-ref="nameField"]'
    }, {
      type: 'Hello',
      clearExisting: true
    }, {
      click: 'button:contains(Save)'
    }, () => {
      t.selectorExists('[data-event-id="1"]:textEquals(Hello)', 'Text updated');
    });
  });
  t.it('EventFilter sanity', async t => {
    scheduler = await getScheduler();
    t.chain({
      rightClick: '.b-resourceheader-cell'
    }, {
      moveMouseTo: '.b-menuitem:contains(Filter)'
    }, {
      click: '.b-eventfilter input'
    }, {
      type: 'Event 1[ENTER]',
      clearExisting: true
    }, () => {
      t.selectorCountIs('.b-sch-event-wrap', 1, 'Single event element visible');
    });
  }); // EventResize is tested in VerticalEventResize.t.js

  t.it('EventTooltip sanity', async t => {
    scheduler = await getScheduler();
    t.chain({
      moveMouseTo: '.b-sch-event'
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    });
  });
  t.it('TimeAxisHeaderMenu sanity', async t => {
    scheduler = await getScheduler();
    t.chain({
      rightClick: '.b-resourceheader-cell'
    }, {
      waitForSelector: ':contains(Zoom)'
    });
  }); // TODO: NonWorkingTime

  t.it('Pan sanity', async t => {
    scheduler = t.getVerticalScheduler({
      features: {
        eventDragCreate: false,
        pan: true
      }
    });
    t.chain({
      drag: '.b-sch-timeaxis-cell',
      offset: [400, 400],
      by: [-200, -150]
    }, () => {
      t.isApproxPx(scheduler.scrollLeft, 200, 'Correct scrollLeft');
      t.isApproxPx(scheduler.scrollTop, 150, 'Correct scrollTop');
    });
  });
  t.it('ResourceTimeRanges sanity', async t => {
    scheduler = await getScheduler();
    const element = document.querySelector('.b-sch-resourcetimerange'),
          box = Rectangle.from(element, scheduler.timeAxisSubGridElement);
    t.is(box.left, 300, 'Correct left');
    t.is(box.top, 100, 'Correct top');
    t.is(box.width, 150, 'Correct width');
    t.is(box.height, 500, 'Correct height');
  });
  t.it('ScheduleMenu sanity', async t => {
    scheduler = await getScheduler();
    t.chain({
      rightClick: '.b-sch-timeaxis-cell',
      offset: [200, 60]
    }, {
      click: '.b-menuitem:contains(Add event)'
    }, {
      waitFor: () => scheduler.features.eventEdit.editor.containsFocus
    }, {
      type: 'New test event'
    }, {
      click: 'button:contains(Save)'
    }, () => {
      assertEventElement(t, scheduler.eventStore.last, 50, 150, 150, 50);
    });
  });
  t.it('ScheduleTooltip sanity', async t => {
    scheduler = await getScheduler();
    t.chain({
      moveMouseTo: [300, 100]
    }, {
      waitForSelector: '.b-sch-scheduletip'
    }, () => {
      t.selectorExists('.b-sch-clock-text:textEquals(May 27, 2019)', 'Correct text in tip');
    });
  });
  t.it('SimpleEventEdit sanity', async t => {
    scheduler = await getScheduler();
    scheduler && scheduler.destroy();
    scheduler = t.getVerticalScheduler({
      features: {
        eventEdit: false,
        simpleEventEdit: true
      }
    });
    t.chain({
      dblClick: '[data-event-id="1"]'
    }, {
      type: 'Hello[ENTER]',
      clearExisting: true
    }, () => {
      t.selectorExists('[data-event-id="1"]:textEquals(Hello)', 'Text updated');
    });
  });
  t.it('TimeRanges sanity', async t => {
    scheduler = await getScheduler();
    const [headerRange, bodyRange] = Array.from(document.querySelectorAll('.b-sch-range')).map(el => Rectangle.from(el, scheduler.timeAxisSubGridElement));
    const [headerLine, bodyLine] = Array.from(document.querySelectorAll('.b-sch-line')).map(el => Rectangle.from(el, scheduler.timeAxisSubGridElement));
    t.is(headerRange.top, 150, 'Range header y correct');
    t.is(bodyRange.top, 150, 'Range body y correct');
    t.is(headerRange.height, 200, 'Range header height correct');
    t.is(bodyRange.height, 200, 'Range body height correct');
    t.is(bodyRange.width, 1350, 'Range body width correct');
    t.is(headerLine.top, 550, 'Line header y correct');
    t.is(bodyLine.top, 550, 'Line body y correct'); // Not checking header, since it has a label

    t.is(bodyLine.height, 2, 'Line body height correct');
    t.is(bodyLine.width, 1350, 'Line body width correct');
  });
  t.it('Should show both vertical and horizontal column lines', async t => {
    scheduler = await getScheduler(); // Safari seems to draw the lines with different timing than other browsers

    await t.waitForAnimationFrame();
    t.selectorCountIs('.b-column-line-major', 2);
    t.selectorCountIs('.b-column-line', 20);
    t.selectorCountIs('.b-resource-column-line', 8); // 0 - 7

    const expectedInitialOffsets = [149, 299, 449, 599, 749, 899, 1049, 1199],
          initialOffsets = t.query('.b-resource-column-line').map(line => DomHelper.getTranslateX(line));
    t.isDeeply(initialOffsets, expectedInitialOffsets, 'Correct positions initially');
    await scheduler.scrollResourceIntoView(scheduler.resourceStore.last, {
      animate: false
    });
    await t.waitForAnimationFrame(); // Safari seems to draw the lines with different timing than other browsers

    await t.waitForAnimationFrame(); // 1 - 8

    const expectedOffsets = [1349, 299, 449, 599, 749, 899, 1049, 1199],
          offsets = t.query('.b-resource-column-line').map(line => DomHelper.getTranslateX(line));
    t.isDeeply(offsets, expectedOffsets, 'Correct positions after scroll');
  });
  t.it('Should support undo / redo after resource change in vertical mode with string ids', async t => {
    scheduler = await t.getSchedulerAsync({
      mode: 'vertical',
      barMargin: 0,
      tbar: [{
        type: 'undoredo'
      }],
      project: {
        stm: {
          autoRecord: true
        }
      },
      resources: [{
        id: 'r1',
        name: 'foo'
      }, {
        id: 'r2',
        name: 'bar'
      }, {}, {}, {}, {}],
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 4),
        duration: 1,
        name: 'foo'
      }]
    });
    const stm = scheduler.project.stm,
          origLeft = t.rect('.b-sch-event').left;
    stm.enable();
    await t.dragBy('.b-sch-event:contains(foo)', [100, 0]);
    await t.waitForAnimations();
    const newLeft = t.rect('.b-sch-event').left;
    stm.undo();
    await t.waitFor(() => t.rect('.b-sch-event').left === origLeft);
    t.is(t.rect('.b-sch-event').left, origLeft, 'Undone paint ok');
    t.is(scheduler.eventStore.first.resourceId, 'r1', 'Undone ok');
    await t.waitFor(() => stm.isReady);
    stm.redo();
    await t.waitFor(() => t.rect('.b-sch-event').left === newLeft);
    t.is(scheduler.eventStore.first.resourceId, 'r2', 'Redone ok');
    t.is(t.rect('.b-sch-event').left, newLeft, 'Redone paint ok');
  });
  t.it('Should support undo / redo after resource change in vertical mode with number ids', async t => {
    scheduler = await t.getSchedulerAsync({
      mode: 'vertical',
      barMargin: 0,
      width: 400,
      tbar: [{
        type: 'undoredo'
      }],
      project: {
        stm: {
          autoRecord: true
        }
      },
      resources: [{
        id: 1,
        name: 'foo'
      }, {
        id: 2,
        name: 'bar'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        startDate: new Date(2011, 0, 4),
        duration: 1,
        name: 'foo'
      }]
    });
    const stm = scheduler.project.stm,
          origLeft = t.rect('.b-sch-event').left;
    stm.enable();
    await t.dragBy('.b-sch-event:contains(foo)', [100, 0]);
    await t.waitForAnimations();
    stm.undo();
    await t.waitFor(() => t.rect('.b-sch-event').left === origLeft);
    t.is(t.rect('.b-sch-event').left, origLeft, 'Undone paint ok');
    t.is(scheduler.eventStore.first.resourceId, 1, 'Undone ok');
    await t.waitFor(() => stm.isReady);
    stm.redo();
    await t.waitFor(() => t.rect('.b-sch-event').left === 255);
    t.is(scheduler.eventStore.first.resourceId, 2, 'Redone ok');
    t.is(t.rect('.b-sch-event').left, 255, 'Redone paint ok');
  });
  t.it('Should support undo / redo after date change in vertical mode with number ids', async t => {
    scheduler = await t.getSchedulerAsync({
      mode: 'vertical',
      barMargin: 0,
      width: 400,
      tbar: [{
        type: 'undoredo',
        icon: 'b-fa-undo'
      }],
      project: {
        stm: {
          autoRecord: true
        }
      },
      resources: [{
        id: 1,
        name: 'foo'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        startDate: new Date(2011, 0, 3),
        duration: 1,
        name: 'foo'
      }]
    });
    const stm = scheduler.project.stm,
          origTop = t.rect('.b-sch-event').top;
    stm.enable();
    await t.dragBy('.b-sch-event:contains(foo)', [0, scheduler.tickSize]);
    await t.waitForSelectorNotFound('.b-dragging');
    await t.waitForAnimations();
    stm.undo();
    await t.waitFor(() => t.rect('.b-sch-event').top === origTop);
    t.is(t.rect('.b-sch-event').top, origTop, 'Undone paint ok');
    t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 3), 'Undone ok');
    await t.waitFor(() => stm.isReady);
    stm.redo();
    await t.waitFor(() => {
      const eventEl = document.querySelector('.b-sch-event'),
            parentEl = eventEl.closest('.b-sch-foreground-canvas');
      return Math.abs(Rectangle.from(eventEl, parentEl).y - scheduler.tickSize) < 2;
    });
    t.is(scheduler.eventStore.first.startDate, new Date(2011, 0, 4), 'Redone ok');
  }); // https://github.com/bryntum/support/issues/3262

  t.it('Should allow shrinking time axis width below initial width using splitter', async t => {
    scheduler = await getScheduler({
      subGridConfigs: {
        locked: {
          width: 115
        }
      }
    });
    const initialWidth = t.rect('.b-verticaltimeaxiscolumn').width;
    await t.dragBy({
      source: '.b-grid-splitter[data-region=locked]',
      delta: [-100, 0]
    });
    t.hasApproxWidth('.b-verticaltimeaxiscolumn', initialWidth - 100, 'Time axis has expected width after resize');
  });
});