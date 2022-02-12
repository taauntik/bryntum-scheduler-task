"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => scheduler && !scheduler.isDestroyed && scheduler.destroy());
  t.it('fillTicks should make all event widths multipliers of tickSize', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      startDate: '2018-05-11',
      endDate: '2018-05-18',
      resources: [{
        id: 1,
        name: 'Carl Lewis'
      }, {
        id: 2,
        name: 'Ben Johnson'
      }],
      events: [{
        resourceId: 1,
        name: '100m',
        startDate: '2018-05-11 15:00',
        duration: 10,
        durationUnit: 'seconds'
      }, {
        resourceId: 1,
        name: 'Long jump',
        startDate: '2018-05-11 16:00',
        duration: 4,
        durationUnit: 'hours'
      }, {
        resourceId: 1,
        name: '200m',
        startDate: '2018-05-13 10:00',
        duration: 21,
        durationUnit: 'seconds'
      }, {
        resourceId: 2,
        name: '100m',
        startDate: '2018-05-11 15:00',
        duration: 11,
        durationUnit: 'seconds'
      }],
      fillTicks: true
    });
    const elements = Array.from(document.querySelectorAll(scheduler.unreleasedEventSelector));
    elements.forEach(element => t.isApprox(element.getBoundingClientRect().width, scheduler.tickSize, 0.5, 'Event has correct width'));
  }); // https://github.com/bryntum/support/issues/194

  t.it('fillTicks should make event ending at midnight the correct size', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      startDate: '2018-05-11',
      endDate: '2018-05-18',
      resources: [{
        id: 1,
        name: 'Carl Lewis'
      }, {
        id: 2,
        name: 'Ben Johnson'
      }],
      events: [{
        resourceId: 1,
        name: '100m',
        startDate: '2018-05-11 00:00',
        duration: 1,
        durationUnit: 'day'
      }],
      fillTicks: true
    });
    t.isApprox(document.querySelector(scheduler.unreleasedEventSelector).offsetWidth, scheduler.tickSize, 0.5, 'Event has correct width');
  }); // https://app.assembla.com/spaces/bryntum/tickets/7293

  t.it('Event should be visible in monthAndYear preset if end date is out of scheduler timespan', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'monthAndYear',
      startDate: '2018-05-01',
      endDate: '2018-06-01',
      resources: [{
        id: 1,
        name: 'Carl Lewis'
      }],
      events: [{
        resourceId: 1,
        name: '2 month long',
        startDate: '2018-05-11 15:00',
        duration: 2,
        durationUnit: 'month'
      }]
    });
    const element = document.querySelector(scheduler.unreleasedEventSelector);
    t.ok(element, 'Element found');
    const rect = element.getBoundingClientRect();
    t.isGreater(rect.left, 0, 'Left offset is positive'); // elementIsTopElement checks center or all corners, so use elementIsTop with an offset instead

    t.ok(t.elementIsTop(scheduler.unreleasedEventSelector, true, [5, 5]), 'Event element is reachable');
  });
  t.it('Should apply initial animation cls', async t => {
    async function getScheduler(anim) {
      scheduler && !scheduler.isDestroyed && scheduler.destroy();
      scheduler = await t.getSchedulerAsync({
        useInitialAnimation: anim
      });
    }

    await getScheduler(true);
    t.selectorExists('.b-scheduler.b-initial-fade-in', 'Specifying true uses default animation');
    await getScheduler(false);
    t.selectorNotExists('.b-scheduler.b-initial-fade-in', 'Specifying false prevents default animation');
    await getScheduler('slide-from-left');
    t.selectorExists('.b-scheduler.b-initial-slide-from-left', 'Specified animation name used');
  });
  t.it('Should not interrupt initial animation', async t => {
    t.firesOk({
      observable: document.body,
      events: {
        animationend: '>= 1'
      }
    });
    scheduler = await t.getSchedulerAsync({
      useInitialAnimation: true
    });
    t.selectorExists('.b-initial-fade-in', 'Initial animation applied');
    await t.waitFor(() => !scheduler.isFirstRender);
    t.selectorNotExists('.b-initial-fade-in', 'Initial animation no longer applied');
  });

  if (t.browser.firefox) {
    t.it('Should block transitions during initial animation in FF', async t => {
      scheduler = await t.getSchedulerAsync({
        useInitialAnimation: true
      });
      t.is(window.getComputedStyle(t.query('.b-sch-event-wrap')[0]).transitionProperty, 'none', 'No transition');
    });
  }

  t.it('Should apply custom CSS and style', async t => {
    scheduler = await t.getSchedulerAsync();
    scheduler.eventStore.first.cls = 'custom';
    t.selectorExists('.b-sch-event.custom', 'Custom CSS applied');
    scheduler.eventStore.last.style = 'color: red';
    t.is(scheduler.getElementFromEventRecord(scheduler.eventStore.last).style.color, 'red', 'Custom style applied');
  });
  t.it('resourceMargin', async t => {
    async function assertEventsTop(t, ...tops) {
      await scheduler.project.commitAsync();
      const elements = Array.from(document.querySelectorAll('.b-sch-event-wrap')).map(el => Rectangle.from(el, scheduler.timeAxisSubGridElement));
      tops.forEach((top, i) => {
        t.isApprox(elements[i].top, top, 'Correct top for ' + (i + 1));
      });
    }

    t.it('Should respect configured resourceMargin', async t => {
      scheduler = await t.getSchedulerAsync({
        resourceMargin: 10,
        barMargin: 5,
        enableEventAnimations: false
      }, 3);
      scheduler.eventStore.getById(2).resourceId = 'r1';
      await assertEventsTop(t, 10, 40, 132);
      scheduler.eventStore.getById(3).resourceId = 'r1';
      scheduler.eventStore.getById(3).startDate = new Date(2011, 0, 5, 5);
      await assertEventsTop(t, 10, 40, 70);
    });
    t.it('Should default to barMargin', async t => {
      scheduler = await t.getSchedulerAsync({
        barMargin: 10,
        enableEventAnimations: false
      }, 3);
      scheduler.eventStore.getById(2).resourceId = 'r1';
      t.is(scheduler.resourceMargin, 10, 'Correct default');
      await assertEventsTop(t, 10, 45, 137);
      scheduler.eventStore.getById(3).resourceId = 'r1';
      scheduler.eventStore.getById(3).startDate = new Date(2011, 0, 5, 5);
      await assertEventsTop(t, 10, 45, 80);
    });
    t.it('Should work with layout: none', async t => {
      scheduler = await t.getSchedulerAsync({
        resourceMargin: 10,
        barMargin: 5,
        enableEventAnimations: false,
        eventLayout: 'none'
      }, 3);
      scheduler.eventStore.getById(2).resourceId = 'r1';
      await assertEventsTop(t, 10, 10, 100);
      scheduler.eventStore.getById(3).resourceId = 'r1';
      scheduler.eventStore.getById(3).startDate = new Date(2011, 0, 5, 5);
      await assertEventsTop(t, 10, 10, 10);
    });
    t.it('Should work with layout: pack', async t => {
      scheduler = await t.getSchedulerAsync({
        resourceMargin: 10,
        barMargin: 5,
        enableEventAnimations: false,
        eventLayout: 'pack'
      }, 3);
      scheduler.eventStore.getById(2).resourceId = 'r1';
      await assertEventsTop(t, 10, 25, 100);
      scheduler.eventStore.getById(3).resourceId = 'r1';
      scheduler.eventStore.getById(3).startDate = new Date(2011, 0, 5, 5);
      await assertEventsTop(t, 10, 20, 30);
    });
  });
  t.it('Should render bars correctly in max zoomed out state', async t => {
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(1970, 0, 1),
      endDate: new Date(2070, 0, 1),
      viewPreset: {
        base: 'manyYears',
        tickWidth: 10
      }
    });
    await t.waitForRowsVisible(scheduler);
    t.query(scheduler.unreleasedEventSelector).forEach(barEl => {
      t.isApprox(barEl.offsetWidth, 1);
    });
  });
  t.it('Event animation should stay disabled when change barMargin', async t => {
    // Make a long transition so we can determine the animation in case it is present
    CSSHelper.insertRule('.my-scheduler .b-sch-event-wrap { transition-duration: 2s !important; }');
    scheduler = new Scheduler({
      cls: 'my-scheduler',
      enableEventAnimations: false,
      transitionDuration: 2000,
      appendTo: document.body,
      height: 200,
      resources: [{
        id: 'r1',
        name: 'Mike'
      }],
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2017, 0, 1, 10),
        endDate: new Date(2017, 0, 1, 12),
        name: 'Click me'
      }],
      startDate: new Date(2017, 0, 1, 6),
      endDate: new Date(2017, 0, 1, 20),
      viewPreset: 'hourAndDay',
      rowHeight: 50,
      barMargin: 5,
      columns: [{
        text: 'Name',
        field: 'name',
        width: 130
      }]
    });
    await t.waitForEventsToRender();
    const el = document.querySelector(scheduler.eventSelector);
    t.is(el.offsetHeight, 40);
    scheduler.barMargin = 20;
    t.is(el.offsetHeight, 10, 'Height should be changed immediately with no animation');
  }); // https://github.com/bryntum/support/issues/2014

  t.it('Should handle per resource margins', async t => {
    scheduler = await t.getSchedulerAsync({
      enableEventAnimations: false,
      startDate: '2020-12-02',
      endDate: '2020-12-03',
      resourceMargin: 3,
      barMargin: 6,
      resources: [{
        id: 1,
        name: 'One',
        resourceMargin: 10
      }, {
        id: 2,
        name: 'Two',
        barMargin: 10
      }, {
        id: 3,
        name: 'Three',
        resourceMargin: 10,
        barMargin: 10
      }, {
        id: 4,
        name: 'Four'
      }],
      events: [{
        id: 1,
        name: 'One',
        startDate: '2020-12-02',
        endDate: '2020-12-03'
      }, {
        id: 2,
        name: 'Two',
        startDate: '2020-12-02',
        endDate: '2020-12-03'
      }],
      assignments: [{
        id: 'r1e1',
        eventId: 1,
        resourceId: 1
      }, {
        id: 'r1e2',
        eventId: 2,
        resourceId: 1
      }, {
        id: 'r2e1',
        eventId: 1,
        resourceId: 2
      }, {
        id: 'r2e2',
        eventId: 2,
        resourceId: 2
      }, {
        id: 'r3e1',
        eventId: 1,
        resourceId: 3
      }, {
        id: 'r3e2',
        eventId: 2,
        resourceId: 3
      }, {
        id: 'r4e1',
        eventId: 1,
        resourceId: 4
      }, {
        id: 'r4e2',
        eventId: 2,
        resourceId: 4
      }]
    });

    function assertTop(assignmentId, top) {
      const assignment = scheduler.assignmentStore.getById(assignmentId),
            element = document.querySelector(`[data-assignment-id="${assignmentId}"]`),
            rowElement = document.querySelector(`.b-grid-row[data-id="${assignment.resourceId}"]`),
            bounds = Rectangle.from(element, rowElement);
      t.isApprox(bounds.top, top, 0.5, 'Correct top for ' + assignmentId);
    }

    assertTop('r1e1', 10); // Resource 1 has resourceMargin = 10

    assertTop('r1e2', 10 + 25 + 6); // and barMargin as configured on Scheduler = 6

    assertTop('r2e1', 3); // Resource 2 has resourceMargin as configured on Scheduler = 3

    assertTop('r2e2', 3 + 39 + 10); // and barMargin = 10

    assertTop('r3e1', 10); // Resource 3 has resourceMargin = 10

    assertTop('r3e2', 10 + 25 + 10); // and barMargin = 5

    assertTop('r4e1', 3); // Resource 4 has resourceMargin as configured on Scheduler = 3

    assertTop('r4e2', 3 + 39 + 6); // and barMargin as configured on Scheduler = 6

    t.diag('Changing barMargin for R1');
    scheduler.resourceStore.first.barMargin = 10;
    assertTop('r1e1', 10); // Resource 1 now has resourceMargin = 10

    assertTop('r1e2', 10 + 25 + 10); // and barMargin = 10

    t.diag('Changing resourceMargin for R2');
    scheduler.resourceStore.getAt(1).resourceMargin = 10;
    assertTop('r2e1', 10); // Resource 2 now has resourceMargin = 10

    assertTop('r2e2', 10 + 25 + 10); // and barMargin = 10

    t.diag('Changing barMargin and resourceMargin for R4');
    scheduler.resourceStore.last.resourceMargin = 10;
    scheduler.resourceStore.last.barMargin = 10;
    assertTop('r4e1', 10); // Resource 2 now has resourceMargin = 10

    assertTop('r4e2', 10 + 25 + 10); // and barMargin = 10
  }); // https://github.com/bryntum/support/issues/2158

  t.it('Should handle per resource rowHeight, from data', async t => {
    async function createScheduler(config) {
      scheduler = await t.getSchedulerAsync(Object.assign({
        enableEventAnimations: false,
        startDate: '2020-12-02',
        endDate: '2020-12-03',
        rowHeight: 45,
        resourceMargin: 5,
        barMargin: 5,
        resources: [{
          id: 1,
          name: 'One'
        }, {
          id: 2,
          name: 'Two',
          rowHeight: 105
        }, {
          id: 3,
          name: 'Three',
          rowHeight: 35
        }],
        events: [{
          id: 1,
          name: 'One',
          startDate: '2020-12-02',
          endDate: '2020-12-03'
        }, {
          id: 2,
          name: 'Two',
          startDate: '2020-12-02',
          endDate: '2020-12-03'
        }, {
          id: 3,
          name: 'Three',
          startDate: '2020-12-02',
          endDate: '2020-12-03'
        }],
        assignments: [{
          id: 'r1e1',
          eventId: 1,
          resourceId: 1
        }, {
          id: 'r1e2',
          eventId: 2,
          resourceId: 1
        }, {
          id: 'r2e1',
          eventId: 1,
          resourceId: 2
        }, {
          id: 'r2e2',
          eventId: 2,
          resourceId: 2
        }, {
          id: 'r3e1',
          eventId: 1,
          resourceId: 3
        }, {
          id: 'r3e2',
          eventId: 2,
          resourceId: 3
        }, {
          id: 'r3e3',
          eventId: 3,
          resourceId: 3
        }]
      }, config));
    }

    t.it('Using stack', async t => {
      await createScheduler({
        eventLayout: 'stack'
      }); // event height = resource height - 2 x resourceMargin
      // row height = event height * overlap count + 2 x resourceMargin + barMargin x (overlap count - 1) + border

      t.hasHeight('[data-assignment-id="r1e1"]', 35); // Event, 45 - 2 x 5 = 35

      t.hasHeight('[data-assignment-id="r1e2"]', 35);
      t.hasHeight('[data-id="1"]', 86); // Row, 5 + 35 + 5 + 35 + 5 + 1

      t.hasHeight('[data-assignment-id="r2e1"]', 95); // 105 - 2 x 5 = 95

      t.hasHeight('[data-assignment-id="r2e2"]', 95);
      t.hasHeight('[data-id="2"]', 206); // 5 + 95 + 5 + 95 + 5 + 1

      t.hasHeight('[data-assignment-id="r3e1"]', 25); // 35 - 2 x 5 = 25

      t.hasHeight('[data-assignment-id="r3e2"]', 25);
      t.hasHeight('[data-assignment-id="r3e3"]', 25);
      t.hasHeight('[data-id="3"]', 96); // 5 + 25 + 5 + 25 + 5 + 25 + 5 + 1
    });
    t.it('Using pack', async t => {
      await createScheduler({
        eventLayout: 'pack'
      });
      t.hasHeight('[data-assignment-id="r1e1"]', 15); // Event, (45 - 15) / 2

      t.hasHeight('[data-assignment-id="r1e2"]', 15);
      t.hasHeight('[data-id="1"]', 46);
      t.hasHeight('[data-assignment-id="r2e1"]', 45); // (105 - 15) / 2

      t.hasHeight('[data-assignment-id="r2e2"]', 45);
      t.hasHeight('[data-id="2"]', 106);
      t.hasHeight('[data-assignment-id="r3e1"]', 5); // (35 - 20) / 3

      t.hasHeight('[data-assignment-id="r3e2"]', 5);
      t.hasHeight('[data-assignment-id="r3e3"]', 5);
      t.hasHeight('[data-id="3"]', 36);
    });
    t.it('Using overlap (none)', async t => {
      await createScheduler({
        eventLayout: 'none'
      });
      t.hasHeight('[data-assignment-id="r1e1"]', 35); // Event, 45 - 10

      t.hasHeight('[data-assignment-id="r1e2"]', 35);
      t.hasHeight('[data-id="1"]', 46);
      t.hasHeight('[data-assignment-id="r2e1"]', 95); // 105 - 10

      t.hasHeight('[data-assignment-id="r2e2"]', 95);
      t.hasHeight('[data-id="2"]', 106);
      t.hasHeight('[data-assignment-id="r3e1"]', 25); // 35 - 10

      t.hasHeight('[data-assignment-id="r3e2"]', 25);
      t.hasHeight('[data-assignment-id="r3e3"]', 25);
      t.hasHeight('[data-id="3"]', 36);
    });
  }); // https://github.com/bryntum/support/issues/2158

  t.it('Should handle per resource rowHeight, from renderer', async t => {
    // Clone of the previous t.it(), only how height is set has changed
    async function createScheduler(config) {
      scheduler = await t.getSchedulerAsync(Object.assign({
        enableEventAnimations: false,
        startDate: '2020-12-02',
        endDate: '2020-12-03',
        rowHeight: 45,
        resourceMargin: 5,
        barMargin: 5,
        resources: [{
          id: 1,
          name: 'One'
        }, {
          id: 2,
          name: 'Two'
        }, // 105
        {
          id: 3,
          name: 'Three'
        } // 35
        ],
        events: [{
          id: 1,
          name: 'One',
          startDate: '2020-12-02',
          endDate: '2020-12-03'
        }, {
          id: 2,
          name: 'Two',
          startDate: '2020-12-02',
          endDate: '2020-12-03'
        }, {
          id: 3,
          name: 'Three',
          startDate: '2020-12-02',
          endDate: '2020-12-03'
        }],
        assignments: [{
          id: 'r1e1',
          eventId: 1,
          resourceId: 1
        }, {
          id: 'r1e2',
          eventId: 2,
          resourceId: 1
        }, {
          id: 'r2e1',
          eventId: 1,
          resourceId: 2
        }, {
          id: 'r2e2',
          eventId: 2,
          resourceId: 2
        }, {
          id: 'r3e1',
          eventId: 1,
          resourceId: 3
        }, {
          id: 'r3e2',
          eventId: 2,
          resourceId: 3
        }, {
          id: 'r3e3',
          eventId: 3,
          resourceId: 3
        }],
        columns: [{
          field: 'name',
          text: 'Name',

          renderer({
            record,
            size
          }) {
            if (record.id === 2) {
              size.height = 105;
            } else if (record.id === 3) {
              size.height = 35;
            }

            return record.name;
          }

        }]
      }, config));
    }

    t.it('Using stack', async t => {
      await createScheduler({
        eventLayout: 'stack'
      }); // event height = resource height - 2 x resourceMargin
      // row height = event height * overlap count + 2 x resourceMargin + barMargin x (overlap count - 1) + border

      t.hasHeight('[data-assignment-id="r1e1"]', 35); // Event, 45 - 2 x 5 = 35

      t.hasHeight('[data-assignment-id="r1e2"]', 35);
      t.hasHeight('[data-id="1"]', 86); // Row, 5 + 35 + 5 + 35 + 5 + 1

      t.hasHeight('[data-assignment-id="r2e1"]', 95); // 105 - 2 x 5 = 95

      t.hasHeight('[data-assignment-id="r2e2"]', 95);
      t.hasHeight('[data-id="2"]', 206); // 5 + 95 + 5 + 95 + 5 + 1

      t.hasHeight('[data-assignment-id="r3e1"]', 25); // 35 - 2 x 5 = 25

      t.hasHeight('[data-assignment-id="r3e2"]', 25);
      t.hasHeight('[data-assignment-id="r3e3"]', 25);
      t.hasHeight('[data-id="3"]', 96); // 5 + 25 + 5 + 25 + 5 + 25 + 5 + 1
    });
    t.it('Using pack', async t => {
      await createScheduler({
        eventLayout: 'pack'
      });
      t.hasHeight('[data-assignment-id="r1e1"]', 15); // Event, (45 - 15) / 2

      t.hasHeight('[data-assignment-id="r1e2"]', 15);
      t.hasHeight('[data-id="1"]', 46);
      t.hasHeight('[data-assignment-id="r2e1"]', 45); // (105 - 15) / 2

      t.hasHeight('[data-assignment-id="r2e2"]', 45);
      t.hasHeight('[data-id="2"]', 106);
      t.hasHeight('[data-assignment-id="r3e1"]', 5); // (35 - 20) / 3

      t.hasHeight('[data-assignment-id="r3e2"]', 5);
      t.hasHeight('[data-assignment-id="r3e3"]', 5);
      t.hasHeight('[data-id="3"]', 36);
    });
    t.it('Using overlap (none)', async t => {
      await createScheduler({
        eventLayout: 'none'
      });
      t.hasHeight('[data-assignment-id="r1e1"]', 35); // Event, 45 - 10

      t.hasHeight('[data-assignment-id="r1e2"]', 35);
      t.hasHeight('[data-id="1"]', 46);
      t.hasHeight('[data-assignment-id="r2e1"]', 95); // 105 - 10

      t.hasHeight('[data-assignment-id="r2e2"]', 95);
      t.hasHeight('[data-id="2"]', 106);
      t.hasHeight('[data-assignment-id="r3e1"]', 25); // 35 - 10

      t.hasHeight('[data-assignment-id="r3e2"]', 25);
      t.hasHeight('[data-assignment-id="r3e3"]', 25);
      t.hasHeight('[data-id="3"]', 36);
    });
  }); // https://github.com/bryntum/support/issues/176

  t.it('Should handle per resource eventLayout', async t => {
    scheduler = await t.getSchedulerAsync({
      enableEventAnimations: false,
      startDate: '2020-12-02',
      endDate: '2020-12-03',
      rowHeight: 45,
      resourceMargin: 5,
      barMargin: 5,
      resources: [{
        id: 1,
        name: 'One',
        eventLayout: 'stack'
      }, {
        id: 2,
        name: 'Two',
        eventLayout: 'pack'
      }, {
        id: 3,
        name: 'Three',
        eventLayout: 'none'
      }],
      events: [{
        id: 1,
        name: 'One',
        startDate: '2020-12-02',
        endDate: '2020-12-03'
      }, {
        id: 2,
        name: 'Two',
        startDate: '2020-12-02',
        endDate: '2020-12-03'
      }, {
        id: 3,
        name: 'Three',
        startDate: '2020-12-02',
        endDate: '2020-12-03'
      }],
      assignments: [{
        id: 'r1e1',
        eventId: 1,
        resourceId: 1
      }, {
        id: 'r1e2',
        eventId: 2,
        resourceId: 1
      }, {
        id: 'r2e1',
        eventId: 1,
        resourceId: 2
      }, {
        id: 'r2e2',
        eventId: 2,
        resourceId: 2
      }, {
        id: 'r3e1',
        eventId: 1,
        resourceId: 3
      }, {
        id: 'r3e2',
        eventId: 2,
        resourceId: 3
      }, {
        id: 'r3e3',
        eventId: 3,
        resourceId: 3
      }]
    });
    t.hasHeight('[data-assignment-id="r1e1"]', 35);
    t.hasHeight('[data-assignment-id="r1e2"]', 35);
    t.hasHeight('[data-id="1"]', 86);
    t.hasHeight('[data-assignment-id="r2e1"]', 15);
    t.hasHeight('[data-assignment-id="r2e2"]', 15);
    t.hasHeight('[data-id="2"]', 46);
    t.hasHeight('[data-assignment-id="r3e1"]', 35);
    t.hasHeight('[data-assignment-id="r3e2"]', 35);
    t.hasHeight('[data-assignment-id="r3e3"]', 35);
    t.hasHeight('[data-id="3"]', 46);
  });
  t.it('Should wrap string config to object internally', async t => {
    scheduler = await t.getSchedulerAsync({
      eventLayout: 'pack'
    });
    t.is(scheduler.eventLayout, 'pack', 'eventLayout is "pack"');
    t.isDeeply(scheduler.internalEventLayout, {
      type: 'pack'
    }, 'internalEventLayout is "pack"');
    scheduler.eventLayout = 'stack';
    t.is(scheduler.eventLayout, 'stack', 'eventLayout is "stack"');
    t.isDeeply(scheduler.internalEventLayout, {
      type: 'stack'
    }, 'internalEventLayout is "stack"');
    scheduler.eventLayout = 'none';
    t.is(scheduler.eventLayout, 'none', 'eventLayout is "none"');
    t.isDeeply(scheduler.internalEventLayout, {
      type: 'none'
    }, 'internalEventLayout is "none"');
    scheduler.eventLayout = {
      type: 'stack'
    };
    t.is(scheduler.eventLayout, 'stack', 'eventLayout is "stack"');
    t.isDeeply(scheduler.internalEventLayout, {
      type: 'stack'
    }, 'internalEventLayout is "stack"');
  });
});