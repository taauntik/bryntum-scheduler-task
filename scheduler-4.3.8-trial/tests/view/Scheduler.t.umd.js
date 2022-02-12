"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && !scheduler.isDestroyed && scheduler.destroy();
    document.body.innerHTML = '';
  });
  t.it('Animation state should persist until the last requested animated update has finished', async t => {
    // Make a long transition so we can determine that it moves slowly
    CSSHelper.insertRule('#animation-state-test-scheduler .b-sch-event-wrap { transition-duration: 2s !important; }');
    let transitionEndCounter = 0;
    scheduler = new Scheduler({
      appendTo: document.body,
      transitionDuration: 2000,
      enableEventAnimations: true,
      // Needs explicitly configuring because IE11 turns animations off
      id: 'animation-state-test-scheduler',
      resources: [{
        id: 1,
        name: 'First'
      }, {
        id: 2,
        name: 'Second'
      }],
      viewPreset: 'dayAndWeek',
      startDate: new Date(2018, 0, 1),
      endDate: new Date(2018, 2, 31),
      events: [{
        id: 1,
        resourceId: 1,
        startDate: '2018-01-01',
        endDate: '2018-01-03'
      }, {
        id: 2,
        resourceId: 2,
        startDate: '2018-01-02',
        endDate: '2018-01-04'
      }],
      listeners: {
        transitionend() {
          transitionEndCounter++;
        }

      }
    });
    await t.waitForProjectReady();
    const event1 = scheduler.eventStore.first,
          event2 = scheduler.eventStore.getAt(1),
          oneDay = 1000 * 60 * 60 * 24;
    t.chain({
      waitForSelector: '.b-sch-event'
    }, async () => {
      await event1.setStartDate(new Date(event1.startDate.valueOf() + oneDay));
      t.ok(scheduler.isAnimating);
    }, {
      waitFor: 100
    }, async () => {
      await event2.setStartDate(new Date(event2.startDate.valueOf() + oneDay));
      t.ok(scheduler.isAnimating, 'Scheduler is still in animating state');
      t.is(transitionEndCounter, 0, 'Scheduler is still in animating state');
    }, {
      waitFor: 200
    }, async () => {
      event1.setStartDate(new Date(event1.startDate.valueOf() - oneDay));
      t.ok(scheduler.isAnimating, 'Scheduler is still in animating state');
      t.is(transitionEndCounter, 0, 'Scheduler is still in animating state');
    }, {
      waitFor: 200
    }, async () => {
      event2.setStartDate(new Date(event2.startDate.valueOf() - oneDay));
      t.ok(scheduler.isAnimating, 'Scheduler is still in animating state');
      t.is(transitionEndCounter, 0, 'Scheduler is still in animating state');
    }, {
      waitFor: 200
    }, async () => {
      t.ok(scheduler.isAnimating, 'Scheduler is still in animating state');
      t.is(transitionEndCounter, 0, 'Scheduler is still in animating state');
    }, // Give some time for the animation to come to a halt, possibly several times
    // if there's ever a regression...
    {
      waitFor: 3000
    }, () => {
      t.is(transitionEndCounter, 1, 'Only exited animating state once');
    });
  });
  t.it('Horizontal scroll: Virtual event rendering', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      id: 'test',
      resources: [{
        id: 1,
        name: 'First'
      }],
      viewPreset: 'dayAndWeek',
      startDate: new Date(2018, 0, 1),
      endDate: new Date(2018, 2, 31),
      events: [{
        id: 1,
        resourceId: 1,
        startDate: '2018-01-01',
        endDate: '2018-01-03'
      }, {
        id: 2,
        resourceId: 1,
        startDate: '2018-03-01',
        endDate: '2018-03-03'
      }],
      listeners: {
        // Initially visible event
        renderEvent({
          eventRecord,
          element
        }) {
          t.is(eventRecord.id, 1, 'renderEvent eventRecord param correct');
          t.is(element, document.querySelector('[data-event-id="1"]'), 'renderEvent element param correct');
        },

        once: true
      }
    });
    await t.waitForProjectReady();
    t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Only one event displayed initially');
    t.selectorNotExists('[data-event-id="2"]');
    t.firesOnce(scheduler, 'renderevent', 'renderEvent triggered'); // Triggered when second event is scrolled into view
    // Second event when it is scrolled into view

    scheduler.on({
      renderEvent({
        eventRecord,
        element
      }) {
        t.is(eventRecord.id, 2, 'renderEvent eventRecord param correct');
        t.is(element, document.querySelector('[data-event-id="2"]'), 'renderEvent element param correct');
      }

    });
    scheduler.scrollEventIntoView(scheduler.events[1]);
    t.chain({
      waitForSelector: '[data-event-id="2"]'
    }, () => {
      t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Only one event displayed after scroll');
    });
  });
  t.it('Horizontal scroll: Should rerender event body correctly', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      eventRenderer: ({
        eventRecord
      }) => eventRecord.name,
      // disable encodeHtml
      resources: [{
        id: 1,
        name: 'First'
      }, {
        id: 2,
        name: 'Second'
      }],
      viewPreset: 'dayAndWeek',
      startDate: new Date(2018, 0, 1),
      endDate: new Date(2018, 0, 31),
      events: [{
        id: 1,
        resourceId: 1,
        startDate: '2018-01-01T00:00',
        endDate: '2018-01-04T00:00',
        name: '<div>1</div><span>1</span>'
      }, {
        id: 2,
        resourceId: 1,
        startDate: '2018-01-28T00:00',
        endDate: '2018-01-31T00:00',
        name: '2'
      }, {
        id: 3,
        resourceId: 2,
        startDate: '2018-01-01T00:00',
        endDate: '2018-01-04T00:00',
        name: '<div>1</div><span>1</span>'
      }, {
        id: 4,
        resourceId: 2,
        startDate: '2018-01-28T00:00',
        endDate: '2018-01-31T00:00',
        name: '2'
      }]
    });
    await t.waitForProjectReady();
    t.willFireNTimes(scheduler, 'renderevent', 4);
    t.chain({
      waitForSelector: '[data-event-id="1"]:contains(11)'
    }, {
      waitForSelector: '[data-event-id="3"]:contains(11)'
    }, {
      waitForAnimationFrame: null
    }, //() => scheduler.scrollEventIntoView(scheduler.events[1]),
    next => {
      scheduler.scrollEventIntoView(scheduler.events[1]).then(() => next());
    }, {
      waitForSelector: '[data-event-id="2"]:contains(2)'
    }, {
      waitForSelector: '[data-event-id="4"]:contains(2)'
    }, {
      waitForAnimationFrame: null
    }, //() => scheduler.scrollEventIntoView(scheduler.events[0]),
    next => {
      scheduler.scrollEventIntoView(scheduler.events[0]).then(() => next());
    }, {
      waitForSelector: '[data-event-id="1"]:contains(11)'
    }, {
      waitForSelector: '[data-event-id="3"]:contains(11)'
    });
  });
  t.it('Should preserve viewportCentre when zooming', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      id: 'test',
      resources: [{
        id: 1,
        name: 'First'
      }],
      viewPreset: 'dayAndWeek',
      startDate: new Date(2018, 0, 8),
      endDate: new Date(2018, 0, 14),
      events: [{
        id: 1,
        resourceId: 1,
        startDate: '2018-01-11 10:00',
        endDate: '2018-01-11 11:00'
      }, {
        id: 2,
        resourceId: 2,
        startDate: '2018-01-11 12:00',
        endDate: '2018-01-11 13:00'
      }]
    });
    await t.waitForProjectReady();
    await scheduler.scrollEventIntoView(scheduler.eventStore.first);
    const center = scheduler.viewportCenterDate,
          schedulerHeaderHeight = scheduler.timeAxisSubGrid.header.element.offsetHeight;
    scheduler.zoomIn(); // Note that we zoom far out here, because at the very zoomed out scales,
    // estimating the center from the pixel position becomes impossible
    // We test here that the center position is cached and remains identical.
    // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
    scheduler.zoomIn(); // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
    scheduler.zoomOut(); // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
    scheduler.zoomOut(); // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
    scheduler.zoomOut(); // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
    scheduler.zoomOut(); // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
    scheduler.zoomOut(); // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
    scheduler.zoomOut(); // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
    scheduler.zoomOut(); // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
    scheduler.zoomOut(); // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
    scheduler.zoomOut(); // Center and header height must be unchanged.

    t.is(scheduler.viewportCenterDateCached, center);
    t.is(scheduler.timeAxisSubGrid.header.element.offsetHeight, schedulerHeaderHeight);
  });
  t.it('Should render correctly when providing subGridConfigs config', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      subGridConfigs: {
        normal: {}
      },
      columns: [{}],
      viewPreset: 'dayAndWeek',
      startDate: new Date(2018, 0, 8),
      endDate: new Date(2018, 0, 14)
    });
    await t.waitForProjectReady();
    t.elementIsTopElement('.b-sch-header-text.b-sticky-header:last-child');
  });
  t.it('Adding rows to empty scheduler should work', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      height: 500
    }, 6);
    const {
      resourceStore,
      rowManager
    } = scheduler,
          resources = resourceStore.getRange();
    t.is(rowManager.rowCount, resources.length, 'All resources rendered');
    t.is(scheduler.element.querySelectorAll('.b-sch-event:not(.b-released)').length, 6, 'Configured number of events rendered');
    resourceStore.remove(resources);
    await t.waitForProjectReady();
    t.is(rowManager.rowCount, 0, 'No resources rendered');
    t.is(scheduler.element.querySelectorAll(scheduler.unreleasedEventSelector).length, 0, 'No events rendered');
    resourceStore.add(resources);
    await t.waitForProjectReady();
    t.is(rowManager.rowCount, resources.length, 'All resources rendered');
  }); // TODO

  t.xit('Should correctly update events on event mutation when scrolled', async t => {
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 13),
      resourceStore: {
        data: (() => {
          const resources = [];

          for (let i = 1; i <= 200; i++) {
            resources.push({
              id: 'r' + i,
              name: 'r' + i
            });
          }

          return resources;
        })()
      },
      eventStore: {
        data: (() => {
          const events = [];

          for (let i = 1; i <= 200; i++) {
            for (let j = 0; j < 2; j++) {
              events.push({
                id: i * 2 + j,
                cls: 'event' + (i * 2 + j),
                resourceId: 'r' + i,
                name: 'Assignment ' + (i * 2 + j),
                startDate: new Date(2011, 0, 3 + j),
                endDate: new Date(2011, 0, 5 + j)
              });
            }
          }

          return events;
        })()
      }
    }, 1000); // Pick an event which is not in the initially rendered block so that we have to scroll
    // down to bring it into view.

    const event = scheduler.eventStore.getAt(scheduler.rowManager.rowCount * 3 + 1);
    t.chain(() => scheduler.scrollEventIntoView(event), // Wait for the requested event to be rendered.
    {
      waitFor: () => scheduler.getElementFromEventRecord(event)
    }, // Test mutating events om a scrolled state
    async () => {
      const scrollTop = scheduler.scrollable.y,
            renderedEventCount = scheduler.element.querySelectorAll(scheduler.eventSelector).length,
            renderedEventElements = Array.from(scheduler.element.querySelectorAll(scheduler.eventSelector)),
            eventElement = scheduler.getElementFromEventRecord(event).parentNode,
            eventElementIndex = renderedEventElements.indexOf(eventElement),
            renderedEventRectangles = renderedEventElements.map(el => Rectangle.from(el)); // What we are testing is that nothing changes in the rendered event block except the
      // width of this event's element.

      event.duration += 1;
      await t.waitForProjectReady(); // Hardly anything should have changed

      t.is(scheduler.element.querySelectorAll(scheduler.eventSelector).length, renderedEventCount, 'Rendered event count stable');
      t.is(scheduler.scrollable.y, scrollTop, 'Scroll position stable'); // The only change to any Rectangle is that the mutated one should have changed width.

      renderedEventRectangles[eventElementIndex].width = eventElement.offsetWidth; // All rendered event elements should have exactly the same rectangles as before.
      // Apart from the mutated one which we have adjusted above.

      for (let i = 0; i < renderedEventElements.length; i++) {
        t.ok(Rectangle.from(renderedEventElements[i]).equals(renderedEventRectangles[i]), 'Event rectangles are all correct');
      }
    });
  }); // TODO

  t.xit('Should not respond to changes to events which are outside of the rendered area', async t => {
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 13),
      resourceStore: {
        data: (() => {
          const resources = [];

          for (let i = 1; i <= 200; i++) {
            resources.push({
              id: 'r' + i,
              name: 'r' + i
            });
          }

          return resources;
        })()
      },
      eventStore: {
        data: (() => {
          const events = [];

          for (let i = 1; i <= 200; i++) {
            for (let j = 0; j < 2; j++) {
              events.push({
                id: i * 2 + j,
                cls: 'event' + (i * 2 + j),
                resourceId: 'r' + i,
                name: 'Assignment ' + (i * 2 + j),
                startDate: new Date(2011, 0, 3 + j),
                endDate: new Date(2011, 0, 5 + j)
              });
            }
          }

          return events;
        })()
      }
    }, 1000);

    const scroller = scheduler.scrollable,
          firstEvent = scheduler.eventStore.first,
          renderedEventCount = scheduler.element.querySelectorAll('.b-sch-event').length,
          testStarts = [new Date(2011, 0, 4), new Date(2011, 0, 5), new Date(2011, 0, 6), new Date(2011, 0, 7), new Date(2011, 0, 8), new Date(2011, 0, 9)],
          scrollNext = () => {
      // The scroll position should not jump, it should progress as we command it below.
      t.is(scroller.y, lastScrollPos);
      scroller.y += 100; // If scroll moved, we're not at the end, so go again soon.

      if (scroller.y !== lastScrollPos) {
        setTimeout(scrollNext, 100);
      } else {
        clearInterval(mutationTimer);
        t.endAsync(async);
      }

      lastScrollPos = scroller.y; // And the number of rendered events should stay stable

      t.isApprox(scheduler.element.querySelectorAll('.b-sch-event').length, renderedEventCount, 2);
    },
          async = t.beginAsync(30000);

    let iteration = 0,
        lastScrollPos = scroller.y;
    const mutationTimer = setInterval(() => {
      firstEvent.startDate = testStarts[iteration];
      iteration = (iteration + 1) % 6;
    }, 2000); // Kick off a scroll through the scheduler

    scrollNext();
  }); // TODO

  t.xit('Should not respond to event additions and deletions which are outside of the rendered area', async t => {
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 13),
      resourceStore: {
        data: (() => {
          const resources = [];

          for (let i = 1; i <= 200; i++) {
            resources.push({
              id: 'r' + i,
              name: 'r' + i
            });
          }

          return resources;
        })()
      },
      eventStore: {
        data: (() => {
          const events = [];

          for (let i = 1; i <= 200; i++) {
            for (let j = 0; j < 2; j++) {
              events.push({
                id: i * 2 + j,
                cls: 'event' + (i * 2 + j),
                resourceId: 'r' + i,
                name: 'Assignment ' + (i * 2 + j),
                startDate: new Date(2011, 0, 3 + j),
                endDate: new Date(2011, 0, 5 + j)
              });
            }
          }

          return events;
        })()
      }
    }, 1000);

    const scroller = scheduler.scrollable,
          renderedEventCount = scheduler.element.querySelectorAll('.b-sch-event').length,
          scrollNext = () => {
      // The scroll position should not jump, it should progress as we command it below.
      t.is(scroller.y, lastScrollPos);
      scroller.y += 100; // If scroll moved, we're not at the end, so go again soon.

      if (scroller.y !== lastScrollPos) {
        setTimeout(scrollNext, 100);
      } else {
        clearInterval(mutationTimer);
        t.endAsync(async);
      }

      lastScrollPos = scroller.y; // And the number of rendered events should stay stable

      t.isApprox(scheduler.element.querySelectorAll('.b-sch-event').length, renderedEventCount, 2);
    },
          async = t.beginAsync(30000);

    let iteration = 0,
        lastScrollPos = scroller.y;
    const mutationTimer = setInterval(async () => {
      const event = scheduler.eventStore.allRecords[2];
      scheduler.eventStore.remove(event.id);
      const startDate = new Date(2011, 0, 3 + iteration);
      event.startDate = startDate;
      event.endDate = DateHelper.add(startDate, Math.floor(Math.random() * 11), 'day');
      scheduler.eventStore.add(event);
      iteration = (iteration + 1) % 9;
      await scheduler.project.commitAsync();
    }, 1000); // Kick off a scroll through the scheduler

    scrollNext();
  });
  t.it('Should render event correctly if time axis includes a DST transition', async t => {
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2018, 9, 28),
      endDate: new Date(2018, 10, 10),
      viewPreset: 'dayAndWeek',
      resources: [{
        id: 'r1',
        name: 'Machine 1'
      }],
      events: [{
        resourceId: 'r1',
        startDate: new Date(2018, 9, 29),
        duration: 4
      }]
    }, 1); // Event bar should be drawn at 100px, the width of 1 tick
    // https://app.assembla.com/spaces/bryntum/tickets/realtime_list?tickets_report_id=filter:u4270341&ticket=7037

    const eventBarEl = document.querySelector(scheduler.eventSelector),
          eventLeft = eventBarEl.getBoundingClientRect().left - eventBarEl.parentNode.getBoundingClientRect().left;
    t.isApproxPx(eventLeft, scheduler.timeAxisViewModel.tickSize, 'Correct position');
  }); // https://app.assembla.com/spaces/bryntum/tickets/7165

  t.it('Element clearing upon repaint', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      id: 'test',
      resources: [{
        id: 1,
        name: 'First'
      }, {
        id: 2,
        name: 'Second'
      }],
      features: {
        labels: {
          right: {
            field: 'id'
          }
        }
      },
      viewPreset: 'dayAndWeek',
      startDate: new Date(2018, 0, 1),
      endDate: new Date(2018, 2, 31),
      events: [{
        id: 1,
        resourceId: 1,
        startDate: '2018-01-01',
        endDate: '2018-01-02'
      }, {
        id: 2,
        resourceId: 2,
        startDate: '2018-01-01',
        endDate: '2018-01-02'
      }, {
        id: 3,
        resourceId: 2,
        startDate: '2018-01-03',
        endDate: '2018-01-04'
      }]
    });
    await t.waitForProjectReady();
    const eventStore = scheduler.eventStore;
    t.chain(async () => {
      t.is(scheduler.timeAxisSubGridElement.querySelectorAll(':not(.b-released) > .b-sch-label.b-sch-label-right').length, 3, 'There are 3 labels to begin with'); // This event's element will be placed into the cache

      await eventStore.getAt(0).setStartDate(new Date(2020, 11, 31));
      t.is(scheduler.timeAxisSubGridElement.querySelectorAll(':not(.b-released) > .b-sch-label.b-sch-label-right').length, 2, 'There are 2 labels after moving one event outside of TimeAxis'); // All event elements on a row get tossed out when an event is deleted,
      // So the render of the remaining one will get the cached element.
      // The bug is that while this was correctly triggered as a paint, the element
      // is UNCLEARED from last usage, and so the labels feature elements are
      // still in there, but being a paint instead of repaint, label elements are added.

      eventStore.remove(eventStore.getAt(1));
      await scheduler.project.commitAsync();
    }, // After rerendering that row which will recycle the element of the
    // event that got moved outside of the TimeAxis, and after hiding the outgoing
    // event element, there should only be one visible label element left.
    {
      waitFor: () => scheduler.timeAxisSubGridElement.querySelectorAll(':not(.b-released) > .b-sch-label.b-sch-label-right').length === 1,
      desc: 'Only 1 label exists now that there is only 1 event in view'
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/7410

  t.it('Setting new start date should shift the range', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      viewPreset: 'dayAndWeek',
      startDate: new Date(2019, 0, 6),
      endDate: new Date(2019, 0, 11)
    });
    await t.waitForProjectReady();
    t.isDateEqual(scheduler.startDate, new Date(2019, 0, 6), 'Initial start date is correct');
    t.isDateEqual(scheduler.endDate, new Date(2019, 0, 11), 'Initial end date is correct');
    scheduler.startDate = new Date(2019, 0, 13);
    t.isDateEqual(scheduler.startDate, new Date(2019, 0, 13), 'Start date is correct');
    t.isDateEqual(scheduler.endDate, new Date(2019, 0, 18), 'End date is correct');
    scheduler.startDate = new Date(2019, 0, 6);
    t.isDateEqual(scheduler.startDate, new Date(2019, 0, 6), 'Start date is correct');
    t.isDateEqual(scheduler.endDate, new Date(2019, 0, 11), 'End date is correct');
  });
  t.it('Setting new start date > end date with keepDuration false should throw an exception', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      viewPreset: 'dayAndWeek',
      startDate: new Date(2019, 0, 6),
      endDate: new Date(2019, 0, 11)
    });
    await t.waitForProjectReady();
    t.throwsOk(() => {
      scheduler.setStartDate(new Date(2019, 0, 13), false);
    }, /Invalid start\/end dates\. Start date must less than end date\. Start date: .*\. End date: .*\./);
  });
  t.it('Setting new start date < end date with keepDuration false should modify the range', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      viewPreset: 'dayAndWeek',
      startDate: new Date(2019, 0, 6),
      endDate: new Date(2019, 0, 11)
    });
    await t.waitForProjectReady();
    scheduler.setStartDate(new Date(2019, 0, 8), false);
    t.isDateEqual(scheduler.startDate, new Date(2019, 0, 8), 'Start date is correct');
    t.isDateEqual(scheduler.endDate, new Date(2019, 0, 11), 'End date is correct');
    scheduler.setStartDate(new Date(2019, 0, 6), false);
    t.isDateEqual(scheduler.startDate, new Date(2019, 0, 6), 'Start date is correct');
    t.isDateEqual(scheduler.endDate, new Date(2019, 0, 11), 'End date is correct');
  });
  t.it('Setting new end date with keepDuration true should shift the range', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      viewPreset: 'dayAndWeek',
      startDate: new Date(2019, 0, 13),
      endDate: new Date(2019, 0, 18)
    });
    await t.waitForProjectReady();
    t.isDateEqual(scheduler.startDate, new Date(2019, 0, 13), 'Initial start date is correct');
    t.isDateEqual(scheduler.endDate, new Date(2019, 0, 18), 'Initial end date is correct');
    scheduler.setEndDate(new Date(2019, 0, 11), true);
    t.isDateEqual(scheduler.startDate, new Date(2019, 0, 6), 'Start date is correct');
    t.isDateEqual(scheduler.endDate, new Date(2019, 0, 11), 'End date is correct');
    scheduler.setEndDate(new Date(2019, 0, 18), true);
    t.isDateEqual(scheduler.startDate, new Date(2019, 0, 13), 'Start date is correct');
    t.isDateEqual(scheduler.endDate, new Date(2019, 0, 18), 'End date is correct');
  });
  t.it('Setting new end date < start date should throw an exception', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      viewPreset: 'dayAndWeek',
      startDate: new Date(2019, 0, 13),
      endDate: new Date(2019, 0, 18)
    });
    await t.waitForProjectReady();
    t.throwsOk(() => {
      scheduler.endDate = new Date(2019, 0, 11);
    }, /Invalid start\/end dates\. Start date must less than end date\. Start date: .*\. End date: .*\./);
  });
  t.it('Setting new end date > start date should should modify the range', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      viewPreset: 'dayAndWeek',
      startDate: new Date(2019, 0, 6),
      endDate: new Date(2019, 0, 11)
    });
    await t.waitForProjectReady();
    scheduler.setEndDate(new Date(2019, 0, 8), false);
    t.isDateEqual(scheduler.startDate, new Date(2019, 0, 6), 'Start date is correct');
    t.isDateEqual(scheduler.endDate, new Date(2019, 0, 8), 'End date is correct');
    scheduler.setEndDate(new Date(2019, 0, 11), false);
    t.isDateEqual(scheduler.startDate, new Date(2019, 0, 6), 'Start date is correct');
    t.isDateEqual(scheduler.endDate, new Date(2019, 0, 11), 'End date is correct');
  }); // https://app.assembla.com/spaces/bryntum/tickets/7502

  t.it('Appending to scheduler container should trigger timelineviewportresize', async t => {
    document.body.innerHTML = '<div id="container" style="display: flex; flex-direction: row; height: 400px; width: 100%"></div>';
    scheduler = new Scheduler({
      appendTo: 'container',
      viewPreset: 'dayAndWeek',
      startDate: new Date(2019, 0, 14),
      endDate: new Date(2019, 0, 21),
      flex: 1 // Needed for IE11

    });
    await t.waitForProjectReady(); // Acquiring a scrollbar will change the viewport size

    t.willFireNTimes(scheduler, 'timelineviewportresize', 1);
    t.chain({
      waitForEvent: [scheduler, 'timelineviewportresize'],
      trigger: () => {
        DomHelper.createElement({
          parent: document.getElementById('container'),
          tag: 'div',
          style: 'width: 200px; background: red'
        });
      }
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/7599

  t.it('Should position correctly for monthAndYear', async t => {
    scheduler = await t.getSchedulerAsync({
      width: 1200,
      viewPreset: 'monthAndYear',
      columns: [],
      startDate: new Date(2019, 0, 1),
      endDate: new Date(2019, 2, 31),
      //events
      events: [{
        id: 'lastJan',
        resourceId: 'r1',
        name: 'Last Jan',
        startDate: new Date(2019, 0, 31),
        duration: 24,
        durationUnit: 'h'
      }, {
        id: 'firstFeb',
        resourceId: 'r1',
        name: 'First Feb',
        startDate: new Date(2019, 1, 1),
        duration: 24,
        durationUnit: 'h'
      }, {
        id: 'lastFeb',
        resourceId: 'r1',
        name: 'Last Feb',
        startDate: new Date(2019, 1, 28),
        duration: 24,
        durationUnit: 'h'
      }]
    });
    t.isApprox(t.rect('[data-event-id="lastJan"]').right, 400, 0.5);
    t.isApprox(t.rect('[data-event-id="firstFeb"]').left, 400, 0.5);
    t.isApprox(t.rect('[data-event-id="lastFeb"]').right, 800, 0.5);
  }); // https://app.assembla.com/spaces/bryntum/tickets/7657

  t.it('Should render correctly when used in TabPanel', async t => {
    const tabPanel = new TabPanel({
      appendTo: document.body,
      height: 500,
      animateTabChange: false,
      items: [{
        type: 'scheduler',
        id: 'one',
        title: 'One',
        startDate: new Date(2019, 2, 11),
        endDate: new Date(2019, 2, 30),
        useInitialAnimation: false,
        columns: [{
          text: 'Name',
          field: 'name',
          width: 150
        }],
        resources: ArrayHelper.populate(5, i => ({
          id: 'r' + i,
          name: 'Resource ' + i
        })),
        events: [{
          id: 'e1',
          resourceId: 'r0',
          startDate: new Date(2019, 2, 12),
          duration: 3,
          name: 'Event A'
        }]
      }, {
        type: 'scheduler',
        id: 'two',
        title: 'Two',
        startDate: new Date(2019, 2, 11),
        endDate: new Date(2019, 2, 30),
        columns: [{
          text: 'Name',
          field: 'name',
          width: 150
        }],
        useInitialAnimation: false,
        resources: ArrayHelper.populate(5, i => ({
          id: 'r' + i,
          name: 'Resource ' + i
        })),
        events: [{
          id: 'e1',
          resourceId: 'r0',
          startDate: new Date(2019, 2, 12),
          duration: 3,
          name: 'Event B'
        }]
      }]
    });
    await t.waitForProjectReady();
    const first = tabPanel.widgetMap.one,
          second = tabPanel.widgetMap.two;
    t.is(first.subGrids.locked.splitterElement.offsetLeft, 150, 'Splitter correctly positioned');
    t.isApprox(first.tickSize, 40, 0.5, 'Correct tickSize');
    t.selectorExists('.b-sch-event:contains(Event A)', 'Event rendered');
    t.isApprox(first.getElementFromEventRecord(first.eventStore.first).getBoundingClientRect().left, 249, 'Event at correct X');
    t.isApprox(first.timeAxisColumn.element.offsetWidth, 840, 'Header has correct width');
    tabPanel.activeTab = 1;
    t.is(second.subGrids.locked.splitterElement.offsetLeft, 150, 'Splitter correctly positioned #2');
    t.isApprox(second.tickSize, 40, 0.5, 'Correct tickSize #2');
    t.selectorExists('.b-sch-event:contains(Event B)', 'Event rendered #2');
    t.isApprox(second.getElementFromEventRecord(second.eventStore.first).getBoundingClientRect().left, 249, 'Event at correct X #2');
    t.isApprox(second.timeAxisColumn.element.offsetWidth, 840, 'Header has correct width #2');
    tabPanel.destroy();
  }); // Arcady: I'm snoozing this assertion so far. Need to review the case.
  // We refresh view twice in this tests:
  // - first time when reacting on "dataset" action caused by store.data = ...
  // - and second time is caused by changes propagation (event endDate get recalculated)

  if (new Date() > new Date(2022, 2, 1)) {
    t.fail('snoozed test woke up'); // https://app.assembla.com/spaces/bryntum/tickets/8411

    t.it('EventStore dataset rerenders events once', async t => {
      scheduler = await t.getSchedulerAsync({
        viewPreset: 'dayAndWeek',
        height: 500
      });
      const renderedEventCount = scheduler.element.querySelectorAll(scheduler.eventSelector).length;
      t.willFireNTimes(scheduler, 'renderEvent', renderedEventCount);
      scheduler.eventStore.data = scheduler.eventStore.records.map(r => {
        const data = r.data;
        data.duration++;
        return data;
      });
      await t.waitForProjectReady();
    });
  }

  t.it('Ending a EventStore batch rerenders events once', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      height: 500
    });
    t.willFireNTimes(scheduler, 'renderEvent', 2);
    const {
      eventStore
    } = scheduler;
    eventStore.beginBatch();
    eventStore.first.duration++;
    eventStore.last.duration++;
    eventStore.endBatch();
    await t.waitForProjectReady();
    t.selectorCountIs(scheduler.unreleasedEventSelector, 5, 'All events still there');
  }); // Both these cases should just run without errors.
  // https://app.assembla.com/spaces/bryntum/tickets/8141

  t.describe('Row reordering', async t => {
    t.it('Many resources', async t => {
      scheduler = await t.getSchedulerAsync({
        resourceStore: t.getResourceStore2({}, 1000),
        features: {
          rowReorder: true
        },
        columns: [{
          text: 'Name',
          width: 100,
          field: 'name',
          locked: true
        }, {
          text: 'Id',
          field: 'id',
          locked: true
        }],
        startDate: new Date(2018, 0, 1),
        endDate: new Date(2018, 2, 31),
        events: [{
          id: 1,
          resourceId: 'r1',
          startDate: '2018-01-01',
          endDate: '2018-01-03'
        }]
      });
      t.chain({
        drag: '.b-grid-cell',
        to: '.b-sch-event-wrap'
      });
    });
    t.it('Few resources', async t => {
      scheduler = await t.getSchedulerAsync({
        id: 'test',
        resourceStore: t.getResourceStore2({}, 5),
        features: {
          rowReorder: true
        },
        columns: [{
          text: 'Name',
          width: 100,
          field: 'name',
          locked: true
        }, {
          text: 'Id',
          field: 'id',
          locked: true
        }],
        startDate: new Date(2018, 0, 1),
        endDate: new Date(2018, 2, 31),
        events: [{
          id: 1,
          resourceId: 'r1',
          startDate: '2018-01-01',
          endDate: '2018-01-03'
        }]
      });
      t.chain({
        drag: '.b-grid-cell',
        to: '.b-sch-event-wrap'
      });
    });
  });
  t.it('Should not throw an exception when mouse is moved out from event which is fading out due to its removing', async t => {
    // Make a long transition so we can determine that it removes slowly
    CSSHelper.insertRule('#animation-state-test-scheduler .b-sch-event-wrap { transition-duration: 1s !important; }');
    scheduler = new Scheduler({
      appendTo: document.body,
      height: 200,
      id: 'animation-state-test-scheduler',
      transitionDuration: 1000,
      enableEventAnimations: true,
      // Needs explicitly configuring because IE11 turns animations off
      useInitialAnimation: false,
      startDate: new Date(2018, 9, 19),
      endDate: new Date(2018, 9, 31),
      columns: [{
        field: 'name',
        text: 'Name'
      }],
      resources: ArrayHelper.fill(2, {}, (resource, i) => Object.assign(resource, {
        id: i + 1,
        name: 'Resource ' + (i + 1)
      })),
      events: [{
        id: 1,
        resourceId: 1,
        startDate: new Date(2018, 9, 20),
        duration: 2
      }, {
        id: 2,
        resourceId: 1,
        startDate: new Date(2018, 9, 24),
        duration: 2,
        cls: 'event2'
      }]
    });
    await t.waitForProjectReady();
    const rec = scheduler.eventStore.getById(2);
    let el;
    t.chain({
      waitForSelector: '.event2'
    }, {
      click: '.event2',
      offset: [1, 1]
    }, async () => el = scheduler.getElementFromEventRecord(rec), {
      type: '[DELETE]',
      target: el
    }, // Events removing happens with a delay (see EventNavigation.onDeleteKeyBuffer),
    // so need to wait when animation starts.
    {
      waitFor: () => scheduler.isAnimating,
      desc: 'Event element starts disappearing'
    }, // This step is required to reproduce the bug, no extra mouse movement needed
    next => {
      // The bug happens when the element becomes `pointer-events: none;` due to being
      // put into an animated removing state. Mouseout is triggered in a real UI,
      // so we have to explicitly fire one here.
      t.simulator.simulateEvent(el, 'mouseout');
      next();
    }, {
      waitForSelectorNotFound: `${scheduler.unreleasedEventSelector} .event2`,
      desc: 'Event is removed'
    });
  });
  t.it('Scheduler in a Popup', async t => {
    scheduler = t.getScheduler({
      multiEventSelect: true,
      features: {
        timeRanges: true
      },
      columns: [{
        text: 'Name',
        field: 'name',
        width: 130
      }]
    });
    const popup = new Popup({
      autoClose: false,
      x: 0,
      y: 0,
      width: 600,
      height: 400,
      layout: 'fit',
      showAnimation: false,
      hideAnimation: false,
      rootElement: document.body,
      items: [scheduler]
    });
    t.ok(scheduler.isVisible);
    popup.hide();
    t.notOk(scheduler.isVisible);
    popup.show();
    t.ok(scheduler.isVisible);
    popup.destroy();
  });
  t.it('Empty text', async t => {
    scheduler = await t.getSchedulerAsync({
      emptyText: 'empty_schedule'
    });
    scheduler.resourceStore.removeAll();
    await t.waitForProjectReady();
    t.is(scheduler.subGrids.normal.dataset.emptyText, 'empty_schedule', 'Should find empty text in schedule with no rows');
  });
  t.it('Should not duplicate event on changing id', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      startDate: new Date(2018, 9, 19),
      endDate: new Date(2018, 9, 31),
      columns: [{
        field: 'name',
        text: 'Name'
      }],
      resources: [{
        id: 1,
        name: 'First'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        startDate: new Date(2018, 9, 20),
        duration: 2
      }]
    });
    await t.waitForProjectReady();
    t.selectorCountIs('.b-sch-event', 1, 'Only one event is rendered');
    const event = scheduler.eventStore.first;
    event.id = 2;
    await t.waitForProjectReady();
    t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Only one event is rendered');
  });
  t.it('New columns should default to locked region', async t => {
    scheduler = t.getScheduler();
    const [col] = scheduler.columns.add({
      field: 'new',
      text: 'new'
    });
    t.is(col.region, 'locked', 'Correct region');
  });
  t.it('Should display zoomed event bars which are too wide for the browser as clipped just beyond the viewport boundaries', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      id: 'test',
      resources: [{
        id: 1,
        name: 'First'
      }],
      // Display a long term project with a months long event.
      viewPreset: 'monthAndYear',
      startDate: new Date(2018, 0, 1),
      endDate: new Date(2018, 11, 31),
      events: [{
        id: 1,
        resourceId: 1,
        startDate: '2018-04-01',
        endDate: '2018-08-01'
      }]
    });
    await t.waitForProjectReady(); // Zoom to where ticks are minutes. The event bar will be insanely wide.

    scheduler.zoomToLevel(scheduler.maxZoomLevel);
    await t.waitFor(() => document.querySelector('.b-sch-event-wrap').offsetWidth > scheduler.timeAxisColumn.width); // In this extreme close up, the calculated bar width of 274,060,800 would not be visible
    // so the Mapper clips it to 100px either side of the TimeAxisColumn.

    t.isApprox(document.querySelector('.b-sch-event-wrap').offsetWidth, scheduler.timeAxisColumn.width + 200, 10);
  });
  t.it('Should use DateHelper.defaultFormat by default', async t => {
    const oldDefault = DateHelper.defaultFormat;
    DateHelper.defaultFormat = 'MM.DD.YY';
    scheduler = new Scheduler({
      startDate: '10.13.19',
      endDate: '11.24.19',
      resources: [{
        id: 1,
        name: 'First'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        startDate: '10.20.19',
        endDate: '10.25.19'
      }]
    });
    await t.waitForProjectReady();
    t.is(scheduler.startDate, new Date(2019, 9, 13), 'Correct timeline start date');
    t.is(scheduler.endDate, new Date(2019, 10, 24), 'Correct timeline end date');
    t.is(scheduler.eventStore.first.startDate, new Date(2019, 9, 20), 'Correct event start date');
    t.is(scheduler.eventStore.first.endDate, new Date(2019, 9, 25), 'Correct event end date');
    DateHelper.defaultFormat = oldDefault;
  });
  t.it('Should not see `b-using-keyboard class after click', async t => {
    scheduler = t.getScheduler();
    document.body.classList.remove('b-using-keyboard');
    await t.click('.b-sch-timeaxis-cell');
    t.selectorNotExists('.b-using-keyboard');
  });
  t.it('Should remove `b-using-keyboard` class after click', async t => {
    scheduler = t.getScheduler();
    document.body.classList.remove('b-using-keyboard');
    await t.type('.b-sch-event', 'foo');
    t.selectorExists('.b-using-keyboard');
    await t.click('.b-sch-timeaxis-cell');
    t.selectorNotExists('.b-using-keyboard');
  });
  t.it('Should support formatting duration via #formatDuration', async t => {
    scheduler = new Scheduler();
    t.expect(scheduler.formatDuration(1)).toBe(1);
    t.expect(scheduler.formatDuration(1, 1)).toBe(1);
    t.expect(scheduler.formatDuration(1.1, 1)).toBe(1.1);
    t.expect(scheduler.formatDuration(1.160, 1)).toBe(1.2);
    t.expect(scheduler.formatDuration(1.160, 0)).toBe(1);
    t.expect(scheduler.formatDuration(1.560, 0)).toBe(2);
  });
  t.it('Should not transition row height initially', async t => {
    t.wontFire(document, 'transitionstart');
    scheduler = await t.getSchedulerAsync({
      useInitialAnimation: false,
      events: [{
        id: 1,
        name: 'Event 1',
        startDate: '2011-01-04',
        duration: 2,
        resourceId: 'r1'
      }, {
        id: 2,
        name: 'Event 2',
        startDate: '2011-01-04',
        duration: 2,
        resourceId: 'r1'
      }]
    }); // Delay is required here to give Chrome time to start transition before test ends

    await t.waitFor(500);
  });
  t.it('Should show load fail message if initial load fails', async t => {
    new Scheduler({
      appendTo: document.body,
      loadMaskError: {
        autoClose: 3000
      },
      resourceStore: {
        autoLoad: true,
        // requests will fail due to x-domain violation
        readUrl: 'http://localhost:3000/'
      }
    });
    await t.waitForSelector('.b-grid-load-failure:contains(Data loading failed)');
    const maskEl = t.query('.b-mask')[0];
    await t.waitFor(() => window.getComputedStyle(maskEl).opacity === '1');
    t.pass('Load mask visible');
  }); // https://github.com/bryntum/support/issues/2368

  t.it('Should not apply background color when hovering timeline subgrid row', async t => {
    new Scheduler({
      appendTo: document.body,
      resources: [{}],
      columns: [{}]
    });
    await t.moveCursorTo('.b-grid-cell');
    t.is(window.getComputedStyle(t.query('.b-sch-timeaxis-cell')[0]).backgroundColor, 'rgba(0, 0, 0, 0)', 'No bg color');
    await t.moveCursorTo('.b-sch-timeaxis-cell');
    t.is(window.getComputedStyle(t.query('.b-sch-timeaxis-cell')[0]).backgroundColor, 'rgba(0, 0, 0, 0)', 'No bg color');
  });
  t.it('Should show Bryntum comment in DOM', async t => {
    scheduler = new Scheduler({
      appendTo: document.body
    });
    t.contentLike(scheduler.element, 'POWERED BY BRYNTUM');
  });

  if (DomHelper.scrollBarWidth) {
    t.it('Should always use correct width to lay out ticks', async t => {
      const resources = [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }, {
        id: 'r3',
        name: 'Don'
      }, {
        id: 'r4',
        name: 'Karen'
      }, {
        id: 'r5',
        name: 'Doug'
      }, {
        id: 'r6',
        name: 'Peter'
      }, {
        id: 'r7',
        name: 'Sam'
      }, {
        id: 'r8',
        name: 'Melissa'
      }, {
        id: 'r9',
        name: 'John'
      }, {
        id: 'r10',
        name: 'Ellen'
      }],
            events = [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2017, 0, 1, 10),
        endDate: new Date(2017, 0, 1, 12),
        name: 'Click me',
        iconCls: 'b-fa b-fa-mouse-pointer'
      }, {
        id: 2,
        resourceId: 'r2',
        startDate: new Date(2017, 0, 1, 12),
        endDate: new Date(2017, 0, 1, 13, 30),
        name: 'Drag me',
        iconCls: 'b-fa b-fa-arrows-alt'
      }, {
        id: 3,
        resourceId: 'r3',
        startDate: new Date(2017, 0, 1, 14),
        duration: 2,
        durationUnit: 'h',
        name: 'Double click me',
        eventColor: 'purple',
        iconCls: 'b-fa b-fa-mouse-pointer'
      }, {
        id: 4,
        resourceId: 'r4',
        startDate: new Date(2017, 0, 1, 8),
        endDate: new Date(2017, 0, 1, 11),
        name: 'Right click me',
        iconCls: 'b-fa b-fa-mouse-pointer'
      }, {
        id: 5,
        resourceId: 'r5',
        startDate: new Date(2017, 0, 1, 15),
        endDate: new Date(2017, 0, 1, 17),
        name: 'Resize me',
        iconCls: 'b-fa b-fa-arrows-alt-h'
      }, {
        id: 6,
        resourceId: 'r6',
        startDate: new Date(2017, 0, 1, 16),
        endDate: new Date(2017, 0, 1, 19),
        name: 'Important meeting',
        iconCls: 'b-fa b-fa-exclamation-triangle',
        eventColor: 'red'
      }, {
        id: 7,
        resourceId: 'r6',
        startDate: new Date(2017, 0, 1, 6),
        endDate: new Date(2017, 0, 1, 8),
        name: 'Sports event',
        iconCls: 'b-fa b-fa-basketball-ball'
      }, {
        id: 8,
        resourceId: 'r7',
        startDate: new Date(2017, 0, 1, 9),
        endDate: new Date(2017, 0, 1, 11, 30),
        name: 'Dad\'s birthday!',
        iconCls: 'b-fa b-fa-birthday-cake',
        // Custom styling from data
        style: 'background-color : teal; font-size: 18px',
        // Prevent default styling
        eventStyle: 'none'
      }];
      scheduler = new Scheduler({
        events,
        resources,
        appendTo: document.body,
        startDate: new Date(2017, 0, 1, 6),
        endDate: new Date(2017, 0, 1, 20),
        viewPreset: 'hourAndDay',
        rowHeight: 50,
        barMargin: 5,
        width: 1024
      });
      t.is(scheduler.timeAxisViewModel.availableSpace, 1024); // Just enough height to show no vertical scrollbar

      scheduler.height = 570;
      await t.waitForAnimationFrame();
      t.is(scheduler.timeAxisViewModel.availableSpace, 1024); // Now a vertical scrollbar will be necessaty

      scheduler.height = 500;
      await t.waitForAnimationFrame();
      t.is(scheduler.timeAxisViewModel.availableSpace, 1024 - DomHelper.scrollBarWidth); // Just enough height to show no vertical scrollbar

      scheduler.height = 570;
      await t.waitForAnimationFrame();
      t.is(scheduler.timeAxisViewModel.availableSpace, 1024);
    });
  }
});