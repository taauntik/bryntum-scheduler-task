"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

StartTest(t => {
  let scheduler;
  t.beforeEach(t => scheduler && scheduler.destroy());

  async function doScrollAndAssert(t, scheduler, i) {
    const {
      scrollable,
      rowHeight
    } = scheduler,
          bufferSize = scheduler.currentOrientation.verticalBufferSize;
    await scrollable.scrollTo(0, i);
    await t.waitForAnimationFrame(); // On my machine it has not yet drawn events at the new location
    // Events are laid out without any gaps which makes it easy to convert scroll position to expected event index

    const totalSize = Math.floor(( // Take no more than buffer size pixels from the top
    Math.min(scrollable.y, bufferSize) + // add visible area height
    scrollable.clientHeight + // Take no more than buffer size pixels from the bottom
    Math.min(scrollable.scrollHeight - scrollable.y - scrollable.clientHeight, bufferSize)) / rowHeight),
          elements = t.query(scheduler.unreleasedEventSelector),
          boxes = elements.map(el => {
      const {
        top,
        bottom
      } = el.getBoundingClientRect();
      return {
        id: el.dataset.eventId,
        resourceId: el.dataset.resourceId,
        top,
        bottom
      };
    }).sort((a, b) => a.top - b.top);
    let pass = true;
    boxes.reduce((prev, current) => {
      if (prev) {
        // If events are assigned to different resources their top position would differ by 1 additional px
        // for row boundary
        const delta = prev.resourceId === current.resourceId ? 1 : 2;

        if (Math.abs(current.top - prev.bottom) > delta) {
          pass = false;
          t.is(current.top, prev.bottom, `Element ${current.id} is aligned to the bottom of ${prev.id}`);
        }
      }

      return current;
    });

    if (pass) {
      t.pass(`Events are rendered correctly for current scroll ${i}`);
    }

    t.isApprox(elements.length, totalSize, 2, 'Rendered enough events');
  }

  async function scrollVerticallyAndAssertEvents(t, scheduler, up = false) {
    const {
      scrollable
    } = scheduler,
          bufferSize = scheduler.currentOrientation.verticalBufferSize,
          {
      maxY
    } = scrollable; // Scroll by random delta within range (0; bufferSize * 3)

    if (!up) {
      for (let i = 0; i < maxY; i = i + Math.round(Math.random() * bufferSize * 3)) {
        await doScrollAndAssert(t, scheduler, i);
      }
    } else {
      for (let i = maxY; i > 0; i = i - Math.round(Math.random() * bufferSize * 3)) {
        await doScrollAndAssert(t, scheduler, i);
      }
    }
  }

  t.it('Removing a resource should translate other events to correct positions', async t => {
    scheduler = await t.getSchedulerAsync();
    const targetY = DomHelper.getTranslateY(document.querySelector('.event2')),
          // will be moved up here
    targetX = DomHelper.getTranslateX(document.querySelector('.event3')); // should still have this x

    scheduler.resourceStore.getAt(1).remove();
    t.chain({
      waitFor: () => DomHelper.getTranslateY(document.querySelector('.event3')) === targetY,
      desc: 'Event moved to correct y'
    }, () => {
      t.is(DomHelper.getTranslateX(document.querySelector('.event3')), targetX, 'Also at correct x');
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/7421

  t.it('Adding an event should not use another events element', async t => {
    scheduler = await t.getSchedulerAsync({
      events: [{
        id: 'e1',
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        duration: 1
      }]
    });
    const firstEventElement = document.querySelector(scheduler.eventSelector);
    scheduler.eventStore.add({
      id: 'e2',
      resourceId: 'r1',
      startDate: new Date(2011, 0, 4),
      duration: 1
    });
    await t.waitForProjectReady();
    t.is(firstEventElement.dataset.eventId, 'e1', 'Element still used for same event');
  }); // https://app.assembla.com/spaces/bryntum/tickets/7263

  t.it('Assigning an unassigned event should not use another events element', async t => {
    scheduler = await t.getSchedulerAsync({
      events: [{
        id: 'e1',
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        duration: 1
      }]
    });
    const firstEventElement = document.querySelector(scheduler.eventSelector);
    const [e2] = scheduler.eventStore.add({
      id: 'e2',
      startDate: new Date(2011, 0, 4),
      duration: 1
    });
    e2.resourceId = 'r1';
    await t.waitForProjectReady();
    t.is(firstEventElement.dataset.eventId, 'e1', 'Element still used for same event');
  }); // https://app.assembla.com/spaces/bryntum/tickets/8365

  t.it('Style should be cleared on element reusage', async t => {
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2011, 0, 1),
      endDate: new Date(2011, 1, 31),
      events: [{
        id: 'e1',
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        duration: 1,
        style: 'background-color : red'
      }, {
        id: 'e2',
        resourceId: 'r1',
        startDate: new Date(2011, 1, 20),
        duration: 1
      }]
    });
    t.chain({
      waitForSelector: scheduler.unreleasedEventSelector
    }, () => {
      const async = t.beginAsync(); // Cannot jump there directly, does not reproduce the bug

      function scroll() {
        scheduler.subGrids.normal.scrollable.x += 400;

        if (scheduler.subGrids.normal.scrollable.x < 4800) {
          requestAnimationFrame(scroll);
        } else {
          t.notOk(document.querySelector('.b-sch-event').style.backgroundColor, 'Style not set');
          t.endAsync(async);
        }
      }

      requestAnimationFrame(scroll);
    });
  });
  t.it('Should derender horizontally early when not using labels or milestones', async t => {
    scheduler = await t.getSchedulerAsync({
      width: 400
    });
    scheduler.scrollLeft = 330;
    await t.waitForAnimationFrame();
    t.selectorNotExists('$event=1', 'Event derendered early');
  }); // https://github.com/bryntum/support/issues/1873

  t.it('Should not derender horizontally too eagerly when using labels', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        labels: {
          right: 'name'
        }
      },
      width: 400
    });
    scheduler.scrollLeft = 330;
    await t.waitForAnimationFrame();
    t.selectorExists('$event=1 .b-sch-label-right', 'Label still rendered when event is scrolled out of view');
    scheduler.scrollLeft = 480;
    await t.waitForAnimationFrame();
    t.selectorNotExists('$event=1 .b-sch-label-right', 'Now it is properly gone');
  }); // https://github.com/bryntum/support/issues/1873

  t.it('Should not derender horizontally too eagerly when using milestones', async t => {
    scheduler = await t.getSchedulerAsync({
      width: 400
    });
    scheduler.eventStore.first.duration = 0;
    await scheduler.project.commitAsync();
    scheduler.scrollLeft = 110;
    await t.waitForAnimationFrame();
    t.selectorExists('$event=1', 'Milestone still rendered');
    scheduler.scrollLeft = 260;
    await t.waitForAnimationFrame();
    t.selectorNotExists('$event=1', 'Now it is properly gone');
  });
  t.it('Should refresh UI correctly when setting empty array as assignments', async t => {
    scheduler = t.getScheduler({
      startDate: new Date(2017, 0, 1),
      endDate: new Date(2017, 0, 2),
      resources: [{
        id: 'r1',
        name: 'Celia',
        city: 'Barcelona'
      }, {
        id: 'r2',
        name: 'Lee',
        city: 'London'
      }],
      events: [{
        id: 1,
        startDate: new Date(2017, 0, 1, 10),
        endDate: new Date(2017, 0, 1, 12),
        name: 'Multi assigned',
        iconCls: 'b-fa b-fa-users'
      }],
      assignments: [{
        id: 1,
        resourceId: 'r1',
        eventId: 1
      }, {
        id: 2,
        resourceId: 'r2',
        eventId: 1
      }]
    });
    await t.waitForSelector(scheduler.unreleasedEventSelector);
    scheduler.assignments = [];
    await t.waitForSelectorNotFound(scheduler.unreleasedEventSelector);
    t.pass('Events derendered');
  });
  t.it('Should enable stickyHeader by default', async t => {
    scheduler = t.getScheduler({
      startDate: new Date(2021, 0, 1),
      endDate: new Date(2021, 2, 1)
    });
    await t.waitForSelector('.b-sch-header-text.b-sticky-header');
    await scheduler.scrollToDate(new Date(2021, 0, 8), {
      block: 'start'
    });
    const textNode = t.query('.b-sch-header-text.b-sticky-header')[0];
    t.is(window.getComputedStyle(textNode).position, 'sticky', 'Sticky header enabled');
    t.elementIsTopElement('.b-sch-header-text.b-sticky-header:contains(w.01 Jan 2021)', 'Header cell is sticky');
  });
  t.it('Should support disabling stickyHeader', async t => {
    scheduler = t.getScheduler({
      startDate: new Date(2021, 0, 1),
      endDate: new Date(2021, 2, 1),
      stickyHeaders: false
    });
    await t.waitForSelector('.b-sch-header-text');
    await scheduler.scrollToDate(new Date(2021, 0, 8), {
      block: 'start'
    });
    t.selectorNotExists('.b-sticky-header');
    const textNode = t.query('.b-sch-header-text')[0];
    t.is(window.getComputedStyle(textNode).position, 'static', 'Sticky header disabled');
    t.elementIsNotTopElement('.b-sch-header-text:contains(w.01 Jan 2021)', 'Header cell is not sticky');
  });
  t.it('Should return visible resources', async t => {
    scheduler = await t.getSchedulerAsync({
      minHeight: null
    });
    t.isDeeply(scheduler.visibleResources, {
      first: scheduler.resourceStore.first,
      last: scheduler.resourceStore.last
    }, 'All resources visible');
    scheduler.height = 80;
    await t.waitFor(() => scheduler.visibleResources.first === scheduler.visibleResources.last);
    t.isDeeply(scheduler.visibleResources, {
      first: scheduler.resourceStore.first,
      last: scheduler.resourceStore.first
    }, 'First resource visible only');
    scheduler.scrollTop = 500;
    await t.waitFor(() => scheduler.visibleResources.first === scheduler.resourceStore.last);
    t.isDeeply(scheduler.visibleResources, {
      first: scheduler.resourceStore.last,
      last: scheduler.resourceStore.last
    }, 'Last resource visible only');
  });
  t.it('Should not render events for rows far out of view', async t => {
    scheduler = await t.getSchedulerAsync({
      events: ArrayHelper.populate(100, i => ({
        id: i + 1,
        resourceId: i % 20 + 1,
        name: `Event ${i + 1}`,
        startDate: '2021-05-03',
        duration: 48
      })),
      resources: ArrayHelper.populate(20, i => ({
        id: i + 1,
        name: `Resource ${i + 1}`
      })),
      startDate: '2021-05-03'
    });
    const event = scheduler.unreleasedEventSelector;
    t.selectorNotExists(`${event}[data-resource-id="6"]`, 'No events rendered for resource 6');
    await scheduler.scrollRowIntoView(6);
    await t.waitForAnimationFrame();
    t.selectorExists(`${event}[data-resource-id="6"]`, 'Events rendered for resource 6 after scroll');
    t.selectorExists(`${event}[data-resource-id="7"]`, 'Events rendered for resource 7');
    t.selectorNotExists(`${event}[data-resource-id="8"]`, 'No events rendered for resource 8');
    t.selectorNotExists(`${event}[data-resource-id="1"]`, 'No events rendered for resource 1');
  });
  t.it('Should not render far out of view events for single row', async t => {
    const events = [],
          rowHeight = 50,
          bufferSize = rowHeight * 5;

    for (let i = 1; i <= 100; i++) {
      events.push({
        id: i,
        resourceId: 'r1',
        name: `Event ${i}`,
        startDate: '2011-01-05',
        endDate: '2011-01-07'
      });
    }

    scheduler = await t.getSchedulerAsync({
      events,
      resources: [{
        id: 'r1',
        name: 'Resource'
      }],
      barMargin: 0,
      rowHeight: 50,
      height: 544,

      horizontalEventSorterFn() {
        return 0;
      },

      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 9),
      features: {
        stickyEvents: true
      }
    });
    const {
      scrollable
    } = scheduler;
    await t.waitForSelector(scheduler.unreleasedEventSelector);
    scheduler.currentOrientation.verticalBufferSize = bufferSize;
    const bodyHeight = scrollable.element.offsetHeight;
    t.is(t.query(scheduler.unreleasedEventSelector).length, Math.ceil((bodyHeight + bufferSize) / rowHeight), 'Events far out of view are not rendered');
    await scrollable.scrollTo(0, bufferSize * 2);
    await scrollable.await('scrollEnd', false);
    t.is(t.query(scheduler.unreleasedEventSelector).length, Math.ceil((bodyHeight + bufferSize * 2) / rowHeight), 'Events are updated after scroll');
    await scrollVerticallyAndAssertEvents(t, scheduler);
  });
  t.it('Should not render far out of view events for multiple resource rows', async t => {
    const events = [],
          resources = [],
          rowHeight = 50,
          bufferSize = rowHeight * 5;

    for (let i = 0; i < 1000; i++) {
      events.push({
        id: i + 1,
        resourceId: Math.floor(i / 100) + 1,
        name: `Event ${i + 1}`,
        startDate: '2011-01-05',
        endDate: '2011-01-07'
      });

      if (i % 100 === 0) {
        resources.push({
          id: i / 100 + 1,
          name: `Resource ${i / 100 + 1}`
        });
      }
    }

    scheduler = await t.getSchedulerAsync({
      events,
      resources,
      barMargin: 0,
      rowHeight: 50,
      height: 544,

      horizontalEventSorterFn() {
        return 0;
      },

      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 9)
    });
    await t.waitForSelector(scheduler.unreleasedEventSelector);
    scheduler.currentOrientation.verticalBufferSize = bufferSize;
    await scrollVerticallyAndAssertEvents(t, scheduler);
    await scrollVerticallyAndAssertEvents(t, scheduler, true);
  });
  t.it('Should render events properly when shifting time axis and row height changes (stripe on)', async t => {
    const events = [{
      id: 1,
      resourceId: 'r10',
      startDate: '2011-01-03T10:00',
      endDate: '2011-01-03T14:00'
    }, {
      id: 2,
      resourceId: 'r10',
      startDate: '2011-01-04T10:00',
      endDate: '2011-01-04T14:00'
    }, {
      id: 3,
      resourceId: 'r10',
      startDate: '2011-01-04T10:00',
      endDate: '2011-01-04T14:00'
    }, {
      id: 4,
      resourceId: 'r15',
      startDate: '2011-01-04T10:00',
      endDate: '2011-01-04T14:00'
    }];
    scheduler = await t.getSchedulerAsync({
      events,
      resourceStore: t.getResourceStore2(null, 15),
      height: 544,
      // 10 rows
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 4),
      viewPreset: 'hourAndDay',
      rowHeight: 50,
      barMargin: 0,
      features: {
        stripe: true
      }
    });
    await scheduler.scrollRowIntoView('r15');
    await t.waitForSelector(scheduler.unreleasedEventSelector);
    t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Correct amount of events rendered');
    scheduler.shiftNext();
    await t.waitFor({
      method() {
        return t.query(scheduler.unreleasedEventSelector).length === 3;
      },

      description: 'Correct amount of events rendered',
      timeout: 2000
    });
  });
  t.it('Should render events properly when shifting time axis and row height changes (stripe off)', async t => {
    const events = [{
      id: 1,
      resourceId: 'r10',
      startDate: '2011-01-03T10:00',
      endDate: '2011-01-03T14:00'
    }, {
      id: 2,
      resourceId: 'r10',
      startDate: '2011-01-04T10:00',
      endDate: '2011-01-04T14:00'
    }, {
      id: 3,
      resourceId: 'r10',
      startDate: '2011-01-04T10:00',
      endDate: '2011-01-04T14:00'
    }, {
      id: 4,
      resourceId: 'r15',
      startDate: '2011-01-04T10:00',
      endDate: '2011-01-04T14:00'
    }];
    scheduler = await t.getSchedulerAsync({
      events,
      resourceStore: t.getResourceStore2(null, 15),
      height: 544,
      // 10 rows
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 4),
      viewPreset: 'hourAndDay',
      rowHeight: 50,
      barMargin: 0,
      features: {
        stripe: false
      }
    });
    await scheduler.scrollRowIntoView('r15');
    await t.waitForSelector(scheduler.unreleasedEventSelector);
    t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Correct amount of events rendered');
    scheduler.shiftNext();
    await t.waitFor({
      method() {
        return t.query(scheduler.unreleasedEventSelector).length === 3;
      },

      description: 'Correct amount of events rendered',
      timeout: 2000
    });
  });
  t.it('Should support EventModel subclassing with cls returning string', async t => {
    const events = [{
      id: 1,
      resourceId: 'r1',
      startDate: '2021-01-03T10:00',
      endDate: '2021-01-03T10:30'
    }, {
      id: 2,
      resourceId: 'r2',
      startDate: '2021-01-03T11:00',
      endDate: '2021-01-03T11:30'
    }, {
      id: 3,
      resourceId: 'r3',
      startDate: '2021-01-03T12:00',
      endDate: '2021-01-03T12:30'
    }],
          resources = [{
      id: 'r1',
      name: 'Resource 1'
    }, {
      id: 'r2',
      name: 'Resource 2'
    }, {
      id: 'r3',
      name: 'Resource 3'
    }],
          dependencies = [{
      fromEvent: 1,
      toEvent: 2
    }, {
      fromEvent: 2,
      toEvent: 3
    }];

    class MyEventModel extends EventModel {
      get cls() {
        return MyEventModel.clsName;
      }

    }

    _defineProperty(MyEventModel, "clsName", 'some-css-class');

    scheduler = await t.getSchedulerAsync({
      eventStore: {
        data: events,
        modelClass: MyEventModel
      },
      resources,
      dependencies,
      features: {
        dependencies: true
      },
      startDate: new Date(2021, 0, 3, 10),
      endDate: new Date(2021, 0, 3, 14),
      viewPreset: 'hourAndDay',
      rowHeight: 50,
      barMargin: 0
    });
    await t.waitForSelector('.some-css-class.b-sch-event');
    t.pass('Css applied correctly with String');
    await t.moveMouseTo('.some-css-class.b-sch-event');
    await t.moveMouseTo([200, 200]);
    t.pass('Hovering dependencies work');
    MyEventModel.clsName = new DomClassList('new-css-class');
    scheduler.refresh();
    await t.waitForSelector('.new-css-class.b-sch-event');
    t.pass('New css applied correctly with DomClassList');
    MyEventModel.clsName = ['another-css-class', 'yet-another-css-class'];
    scheduler.refresh();
    await t.waitForSelector('.another-css-class.yet-another-css-class.b-sch-event');
    t.pass('Another css applied correctly with String[]');
    MyEventModel.clsName = null;
    scheduler.refresh();
    await t.waitForSelectorNotFound('.another-css-class.yet-another-css-class.b-sch-event');
    t.pass('Null css applied correctly');
  });
});