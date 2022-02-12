"use strict";

StartTest(t => {
  let scheduler, scheduler2;

  async function initSchedulers(t, cfg1, cfg2) {
    scheduler = await t.getSchedulerAsync(Object.assign({
      id: 'first',
      height: 200,
      width: 500,
      features: {
        eventDrag: {
          constrainDragToTimeline: false
        }
      },
      events: [{
        id: 1,
        resourceId: 'r1',
        name: 'foo',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      }],

      eventRenderer({
        eventRecord,
        renderData
      }) {
        renderData.eventColor = 'yellow';
        return eventRecord.name;
      }

    }, cfg1));
    scheduler2 = await t.getSchedulerAsync(Object.assign({
      id: 'second',
      height: 200,
      width: 500,
      events: [{
        id: 2,
        resourceId: 1,
        name: 'bar',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      }],
      features: {
        eventDrag: {
          constrainDragToTimeline: false,
          showTooltip: false
        }
      },
      resources: [{
        id: 1,
        name: 'Foo'
      }, {
        id: 2,
        name: 'Bar'
      }, {
        id: 3,
        name: 'Baz'
      }, {
        id: 4,
        name: 'Ketchup'
      }]
    }, cfg2));
  }

  t.beforeEach(t => {
    scheduler && scheduler.destroy();
    scheduler2 && scheduler2.destroy();
    scheduler = scheduler2 = null;
  });
  t.it('Should work to drag drop inside same scheduler without constrainDragToTimeline', async t => {
    await initSchedulers(t); // date change + resourceId change fires separately now
    //t.firesOk(scheduler.eventStore, { update : 2 });

    t.firesOnce(scheduler.eventStore, 'update');
    t.chain({
      drag: '#first .b-sch-event',
      to: '#first .b-grid-row[data-index="1"] .b-sch-timeaxis-cell',
      toOffset: [100, '50%']
    }, () => {
      t.is(scheduler.eventStore.first.resourceId, 'r2');
    });
  });
  t.it('Should only affect own events when drag is inside scheduler when partnered', async t => {
    await initSchedulers(t);
    scheduler2.partner = scheduler;
    t.isNot(scheduler.eventStore, scheduler2.eventStore, 'Not sharing event store');
    t.firesOnce(scheduler.eventStore, 'update');
    t.wontFire(scheduler2.eventStore, 'update');
    t.chain({
      drag: '#first .b-sch-event',
      by: [50, 0]
    });
  });
  t.it('Should trigger scroll manager of currently hovered scheduler', async t => {
    await initSchedulers(t);
    const horizontal1 = scheduler.subGrids.normal.scrollable,
          vertical1 = scheduler.scrollable,
          horizontal2 = scheduler2.subGrids.normal.scrollable,
          vertical2 = scheduler2.scrollable;
    t.chain({
      drag: '.b-sch-event',
      to: '#second',
      dragOnly: true,
      toOffset: [`100%-25`, '100%-20']
    }, {
      waitFor: () => Math.abs(horizontal2.x - horizontal2.maxX) <= 1 && Math.abs(vertical2.y - vertical2.maxY) <= 1
    }, {
      moveCursorTo: '#second .b-grid-headers-normal',
      offset: [5, '100%+5']
    }, {
      waitFor: () => horizontal2.x === 0 && vertical2.y === 0
    }, {
      moveCursorTo: '#first .b-grid-headers-normal',
      offset: [5, '100%+5']
    }, {
      waitFor: () => horizontal1.x === 0 && vertical1.y === 0
    }, {
      moveCursorTo: '#first',
      offset: ['100%-20', '100%-20']
    }, {
      waitFor: () => Math.abs(horizontal1.x - horizontal1.maxX) <= 1 && Math.abs(vertical1.y - vertical1.maxY) <= 1
    }, {
      mouseUp: null
    });
  });
  t.it('Should trigger scroll manager of source scheduler', async t => {
    await initSchedulers(t);
    t.chain({
      drag: '.b-sch-event',
      to: '#first',
      dragOnly: true,
      toOffset: ['100%-20', '100%-20']
    }, {
      waitFor: () => Math.abs(scheduler.subGrids.normal.scrollable.x - scheduler.subGrids.normal.scrollable.maxX) <= 1 && Math.abs(scheduler.scrollable.y - scheduler.scrollable.maxY) <= 1
    }, {
      moveCursorTo: '#first .b-grid-headers-normal',
      offset: [5, '100%+5']
    }, {
      waitFor: () => scheduler.subGrids.normal.scrollable.x === 0 && scheduler.scrollable.y === 0
    }, {
      mouseUp: null
    });
  });
  t.it('Should still behave normal for drag drop inside 1 scheduler', async t => {
    await initSchedulers(t);
    t.firesOnce(scheduler.eventStore, 'update');
    t.wontFire(scheduler.eventStore, 'remove');
    t.wontFire(scheduler.eventStore, 'add');
    t.chain({
      drag: '#first .b-sch-event',
      by: [100, 10]
    });
  });
  t.it('Should just result in an update action if target event store is the same after drag drop', async t => {
    await initSchedulers(t);
    scheduler2.eventStore.removeAll();
    scheduler2.resourceStore.removeAll();
    scheduler2.resourceStore.add([{
      id: 1,
      name: 'Foo'
    }, {
      id: 2,
      name: 'Bar'
    }]); // Record is removed from scheduler

    t.firesOnce(scheduler.eventStore, 'remove');
    t.wontFire(scheduler.eventStore, 'add'); // And added to scheduler2

    t.wontFire(scheduler2.eventStore, 'remove');
    t.firesOnce(scheduler2.eventStore, 'add');
    t.chain({
      drag: '#first .b-sch-event',
      to: '#second .b-sch-timeaxis-cell',
      toOffset: [105, 25]
    }, () => {
      t.selectorExists('#second .b-sch-event:not(.b-sch-released)');
    });
  });
  t.it('Should remove dragged event from source store and add to new event store if target event store is not the same', async t => {
    await initSchedulers(t);
    t.firesOnce(scheduler.eventStore, 'remove');
    t.firesOnce(scheduler.eventStore, 'update'); // From setting resourceId to null when removing the assignment

    t.firesOnce(scheduler2.eventStore, 'add');
    t.chain({
      drag: '#first .b-sch-event',
      to: '#second .b-sch-event',
      dragOnly: true
    }, {
      waitForSelectorNotFound: '#first.b-dragging-event'
    }, {
      waitForSelector: '#second.b-dragging-event'
    }, {
      mouseUp: null
    }, {
      waitForSelectorNotFound: '#first ' + scheduler.unreleasedEventSelector,
      desc: 'Top empty'
    }, {
      waitForSelectorNotFound: '.b-dragging-event'
    }, // Wait until there are two live events in scheduler 2
    {
      waitFor: () => scheduler2.element.querySelectorAll('#second ' + scheduler.unreleasedEventSelector).length === 2
    }, next => {
      t.is(scheduler.eventStore.count, 0, 'Event removed');
      t.is(scheduler2.eventStore.count, 2, 'Event added');
      t.is(scheduler2.eventStore.last.resourceId, 1, 'New resource assigned');
      t.is(scheduler2.eventStore.last.name, 'foo', 'Name intact');
      t.is(scheduler2.eventStore.last.startDate, scheduler2.eventStore.first.startDate, 'Same start date'); // t.is(scheduler2.eventStore.last.isPhantom, true, 'Newly added event should be phantom if target event store is different');

      t.selectorCountIs('#second ' + scheduler.unreleasedEventSelector, 2);
      t.wontFire(scheduler2.scrollable, 'scroll');
      next();
    }, {
      moveCursorTo: '#second .b-grid-headers-normal',
      offset: [5, '100%+5']
    });
  });
  t.it('Should support drag to a new scheduler and back', async t => {
    await initSchedulers(t);
    t.chain({
      drag: `#first ${scheduler.eventSelector}`,
      to: '#second',
      dragOnly: true,
      toOffset: ['100%-25', '100%-25']
    }, {
      waitFor: () => Math.abs(scheduler2.subGrids.normal.scrollable.x - scheduler2.subGrids.normal.scrollable.maxX) <= 1 && Math.abs(scheduler2.scrollable.y - scheduler2.scrollable.maxY) <= 1
    }, {
      moveMouseBy: [-20, -20]
    }, {
      mouseUp: null
    }, {
      waitForSelectorNotFound: `#first ${scheduler.unreleasedEventSelector} .b-sch-event`
    }, {
      drag: `#second ${scheduler.unreleasedEventSelector} .b-sch-event`,
      to: '#first',
      dragOnly: true,
      toOffset: ['100%-25', '100%-25']
    }, {
      waitFor: () => Math.abs(scheduler.subGrids.normal.scrollable.x - scheduler.subGrids.normal.scrollable.maxX) <= 1 && Math.abs(scheduler.scrollable.y - scheduler.scrollable.maxY) <= 1
    }, {
      mouseUp: null
    }, {
      waitForSelectorNotFound: `#second ${scheduler.unreleasedEventSelector} .b-sch-event`
    }, next => {
      t.is(scheduler.eventStore.count, 1, '1 in first scheduler');
      t.is(scheduler2.eventStore.count, 1, '1 in second scheduler');
      next();
    }, {
      drag: `#first ${scheduler.unreleasedEventSelector}`,
      to: '#second .b-grid-headers-normal',
      dragOnly: true,
      toOffset: [5, '100%+5']
    }, {
      waitFor: () => scheduler2.subGrids.normal.scrollable.x === 0 && scheduler2.scrollable.y === 0
    }, {
      mouseUp: null
    }, {
      waitForSelectorNotFound: `#first ${scheduler.unreleasedEventSelector} .b-sch-event`
    });
  });
  t.it('Should distribute events to resources on multi drag between schedulers', async t => {
    await initSchedulers(t, {
      multiEventSelect: true,
      events: [{
        id: 1,
        resourceId: 'r1',
        name: 'foo',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      }, {
        id: 3,
        resourceId: 'r2',
        name: 'test',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 5)
      }]
    }, {
      multiEventSelect: true
    });
    t.chain({
      click: '.b-sch-event-content:textEquals(test)'
    }, {
      drag: '.b-sch-event-content:textEquals(foo)',
      options: {
        ctrlKey: true
      },
      to: '#second .b-sch-event'
    }, {
      waitForSelectorNotFound: '#first .b-sch-event:contains(test)'
    }, {
      waitForSelectorNotFound: '#first .b-sch-event:contains(foo)'
    }, {
      waitForSelector: '#second .b-sch-event:contains(test)'
    }, {
      waitForSelector: '#second .b-sch-event:contains(foo)'
    }, () => {
      t.is(scheduler2.resourceStore.getAt(0).events.length, 2, 'Top resource has 2 events after drop');
      t.is(scheduler2.resourceStore.getAt(1).events.length, 1, 'Second resource has 1 event after drop');
    });
  });
  t.it('Should activate scroll manager when dragging twice in same scheduler with cloneTarget', async t => {
    await initSchedulers(t);
    t.firesOk(scheduler.eventStore, {
      update: 2
    });
    t.chain({
      drag: '#first .b-sch-event',
      by: [100, 0]
    }, {
      drag: '#first .b-sch-event',
      to: '#first',
      dragOnly: true,
      toOffset: ['100%-20', '50%']
    }, {
      waitFor: () => scheduler.subGrids.normal.scrollable.x === scheduler.subGrids.normal.scrollable.maxX
    }, {
      mouseUp: null
    });
  });
  t.it('Should treat header of other scheduler as invalid drop position', async t => {
    await initSchedulers(t);
    t.wontFire(scheduler.eventStore, 'update');
    t.wontFire(scheduler2.eventStore, 'update');
    t.wontFire(scheduler.eventStore, 'change');
    t.wontFire(scheduler2.eventStore, 'change');
    t.chain({
      waitForEvent: [document, 'transitionend'],
      trigger: {
        drag: '#first .b-sch-event',
        to: '#second .b-sch-header-timeaxis-cell'
      }
    }, {
      waitForSelector: '#first .b-sch-event:not(.b-released):textEquals(foo)'
    });
  });
  t.it('Should call validity checker on currently hovered Grid', async t => {
    await initSchedulers(t);
    scheduler2.allowOverlap = false;
    t.wontFire(scheduler.eventStore, 'update');
    t.wontFire(scheduler2.eventStore, 'update');
    t.wontFire(scheduler.eventStore, 'change');
    t.wontFire(scheduler2.eventStore, 'change');
    t.chain({
      drag: '#first .b-sch-event',
      to: '#second .b-sch-event'
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/9234

  t.it('Should not make event disappear when drag and dropping another event from the same row', async t => {
    await initSchedulers(t, {
      enableEventAnimations: false,
      useInitialAnimation: false
    }, {
      enableEventAnimations: false,
      useInitialAnimation: false,
      events: [{
        id: 2,
        resourceId: 1,
        name: 'bar',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      }, {
        id: 3,
        resourceId: 1,
        name: 'test',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 5)
      }]
    });
    t.chain( // drop on non valid area on the first grid
    {
      drag: '#second .b-sch-event:contains(test)',
      to: '#first .b-sch-header-timeaxis-cell'
    }, {
      waitForSelector: '#second .b-sch-event:contains(test)'
    }, // drop on valid area on the first grid
    {
      drag: '#second .b-sch-event:contains(bar)',
      to: '#first .b-sch-event'
    }, {
      waitForSelector: '#first .b-sch-event:contains(bar)'
    }, {
      waitForSelector: '#second .b-sch-event:contains(test)'
    });
  }); // https://github.com/bryntum/support/issues/207

  t.it('Should constrain dragging to the union of all partnered Schedulers', async t => {
    await initSchedulers(t, {
      enableEventAnimations: false,
      useInitialAnimation: false
    }, {
      enableEventAnimations: false,
      useInitialAnimation: false,
      events: [{
        id: 2,
        resourceId: 1,
        name: 'bar',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      }, {
        id: 3,
        resourceId: 1,
        name: 'test',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 5)
      }]
    });
    t.chain( // Drag event downwards to the bottom of the second scheduler
    {
      drag: () => '[data-event-id="1"]',
      to: () => scheduler2.bodyContainer,
      toOffset: ['50%', '100%-10'],
      dragOnly: true
    }, // Wait for it to reach its scroll limit and stop scrolling
    {
      waitFor: () => !scheduler2.timeAxisSubGrid.scrolling
    }, {
      mouseup: null
    }, () => {
      // It should have reached the last row, and dropped there. The bug was that the Y constraining was not
      // allowing this. Cannot hoist record, it now always make a copy when dropping on another scheduler
      t.is(scheduler2.eventStore.last.resource, scheduler2.resourceStore.last, 'Drag/drop succeeded');
    });
  });
  t.it('Should trigger just 1 commit if using autoCommit', async t => {
    await initSchedulers(t);
    scheduler.eventStore.autoCommit = true;
    t.firesOnce(scheduler.eventStore, 'commit');
    t.chain({
      drag: '#second .b-sch-event',
      to: '#first .b-sch-timeaxis-cell',
      toOffset: [100, '50%']
    });
  });
  t.it('Should stop scrolling when moving over a new Scheduler', async t => {
    await initSchedulers(t, {
      enableEventAnimations: false,
      useInitialAnimation: false,
      resources: [{
        id: 1
      }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
    }, {
      enableEventAnimations: false,
      useInitialAnimation: false,
      events: [{
        id: 2,
        resourceId: 1,
        name: 'bar',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      }, {
        id: 3,
        resourceId: 1,
        name: 'test',
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 5)
      }]
    });
    scheduler.scrollManager.scrollSpeed = 100;
    t.waitForScrolling = false;
    t.chain( // Drag event downwards to the bottom of the second scheduler
    {
      drag: () => '[data-event-id="2"]',
      to: () => scheduler.bodyContainer,
      toOffset: ['50%', '100%-10'],
      dragOnly: true
    }, {
      waitFor: () => scheduler.scrolling
    }, async () => t.ok(scheduler.scrollManager.monitoring.has(scheduler.subGrids.normal.element), 'Active scrolling'), // Wait for top scheduler to start scrolling
    {
      moveCursorTo: scheduler2.bodyContainer,
      offset: ['50%', 10]
    }, async () => t.notOk(scheduler.scrollManager.monitoring.has(scheduler.subGrids.normal.element), 'No active scrolling'), {
      waitFor: () => !scheduler.scrolling,
      desc: 'Stopped scrolling after hovering new scheduler'
    }, {
      mouseup: null
    });
  }); // https://github.com/bryntum/support/issues/3683

  t.it('Should be possible to set constrainDragToTimeline in beforeEventDragListener', async t => {
    await initSchedulers(t, {
      features: {
        eventDrag: {
          constrainDragToTimeline: false,
          constrainDragToResource: true
        }
      },
      listeners: {
        beforeEventDrag(event) {
          event.source.features.eventDrag.constrainDragToTimeline = true;
          event.source.features.eventDrag.constrainDragToResource = false;
        }

      }
    });
    t.firesOnce(scheduler.eventStore, 'update');
    t.wontFire(scheduler2.eventStore, 'change');
    await t.dragBy({
      source: '#first .b-sch-event',
      delta: [0, 2 * scheduler.rowHeight],
      dragOnly: true
    });
    await t.waitFor(() => scheduler.scrollable.y === scheduler.scrollable.maxY);
    t.isApprox(t.rect('.b-sch-event-wrap.b-dragging').bottom, t.rect('#first [data-id="r6"]').bottom - scheduler.resourceMargin, 10, 'Proxy aligned ok');
    t.is(scheduler.features.eventDrag.drag.cloneTarget, false, 'Not cloning for local drag');
    t.notOk(scheduler.features.eventDrag.drag.dragWithin, null, 'Not setting body as boundary for drag for local drag');
    await t.mouseUp();
    await t.waitFor(() => scheduler.eventStore.first.resourceId === 'r6');
  });
});