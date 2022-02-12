"use strict";

StartTest(t => {
  const dependencySelector = 'polyline.b-sch-dependency:not(.b-sch-released)';
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
  });
  t.it('Should refresh dependencies on scheduler resize', t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      // use this very specific width to start scheduler with a horizontal scrollbar
      width: 615,
      height: 400,
      startDate: new Date(2018, 9, 19),
      endDate: new Date(2018, 9, 31),
      columns: [{
        field: 'name',
        text: 'Name'
      }],
      features: {
        dependencies: true
      },
      resources: ArrayHelper.fill(50, {}, (resource, i) => Object.assign(resource, {
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
        duration: 2
      }],
      dependencies: [{
        id: 1,
        from: 1,
        to: 2
      }]
    });

    function resizeUntilUpdateEvent(callback, decrease) {
      let counter = 0;
      scheduler.timeAxisViewModel.on({
        update() {
          clearInterval(intervalId);
          scheduler.on({
            dependenciesdrawn() {
              t.assertDependency(scheduler, scheduler.dependencies[0]);
              callback();
            },

            once: true
          });
        },

        once: true
      });
      const intervalId = setInterval(() => {
        if (counter++ > 22) clearInterval(intervalId);
        scheduler.element.style.width = `${parseInt(scheduler.element.style.width) + 1}px`;
      }, 100);
    }

    t.chain({
      waitForDependencies: null
    }, {
      waitFor: () => {
        const eventBox = t.rect('[data-event-id="1"]'),
              [dependencyEl] = t.query('[depId="1"]');

        if (eventBox && dependencyEl) {
          const threshold = t.bowser.firefox ? 2 : 1,
                box = t.getSVGBox(dependencyEl);
          return t.samePx(eventBox.right, box.left, threshold);
        }
      }
    }, next => {
      t.assertDependency(scheduler, scheduler.dependencies[0]);
      resizeUntilUpdateEvent(next);
    }, resizeUntilUpdateEvent, next => {
      scheduler.on({
        subgridcollapse() {
          scheduler.on({
            dependenciesdrawn() {
              t.assertDependency(scheduler, scheduler.dependencies[0]);
              next();
            },

            once: true
          });
        },

        once: true
      });
    });
  });
  t.it('Should draw dependency line if dependency dates are outside of the view', t => {
    scheduler = t.getScheduler({
      dependencyStore: t.getDependencyStore({
        data: [{
          id: 1,
          from: 1,
          to: 2,
          fromSide: 'right',
          toSide: 'left'
        }, {
          id: 2,
          from: 1,
          to: 2,
          fromSide: 'top',
          toSide: 'top'
        }, {
          id: 3,
          from: 1,
          to: 2,
          fromSide: 'bottom',
          toSide: 'bottom'
        }]
      }),
      eventStore: t.getEventStore({
        data: [{
          id: 1,
          startDate: '2017-12-01 10:00',
          endDate: '2017-12-01 12:00',
          resourceId: 'r2'
        }, {
          id: 2,
          startDate: '2017-12-03 10:00',
          endDate: '2017-12-03 12:00',
          resourceId: 'r2'
        }]
      }),
      resourceStore: t.getResourceStore2({}, 2),
      features: {
        dependencies: {
          overCls: 'b-sch-dependency-over'
        }
      },
      viewPreset: {
        base: 'hourAndDay',
        tickWidth: 25,
        columnLinesFor: 0,
        headers: [{
          unit: 'd',
          align: 'center',
          dateFormat: 'ddd DD MMM'
        }, {
          unit: 'h',
          align: 'center',
          dateFormat: 'HH'
        }]
      },
      startDate: new Date(2017, 11, 1),
      endDate: new Date(2017, 11, 4)
    }, 2);
    const expectedRects = {};
    t.chain({
      waitForSelector: '.b-sch-dependency'
    }, next => {
      DomHelper.forEachSelector(document, dependencySelector, el => {
        expectedRects[el.getAttribute('depId')] = el.getBoundingClientRect();
      });
      t.waitForEvent(scheduler, 'dependenciesdrawn', next);
      scheduler.setTimeSpan(new Date(2017, 11, 2), new Date(2017, 11, 3));
    }, () => {
      const cellBox = document.querySelector('.b-sch-timeaxis-cell').getBoundingClientRect();
      DomHelper.forEachSelector(document, dependencySelector, el => {
        const id = el.getAttribute('depId'),
              gotRect = el.getBoundingClientRect();
        t.is(gotRect.top, expectedRects[id].top, `Top position is ok for dep ${id}`);
        t.isGreater(gotRect.width, cellBox.width, 'Dep width is ok');
        t.ok(gotRect.right > cellBox.right && gotRect.left < cellBox.left, 'Dep line located correctly');
      });
    });
  });
  t.it('Should draw line to milestone', t => {
    scheduler = t.getScheduler({
      dependencyStore: t.getDependencyStore({
        data: [{
          id: 1,
          from: 1,
          to: 2,
          fromSide: 'right',
          toSide: 'left'
        }, {
          id: 2,
          from: 1,
          to: 2,
          fromSide: 'top',
          toSide: 'top'
        }, {
          id: 3,
          from: 1,
          to: 2,
          fromSide: 'bottom',
          toSide: 'bottom'
        }, {
          id: 4,
          from: 1,
          to: 3,
          fromSide: 'left',
          toSide: 'right'
        }, {
          id: 5,
          from: 1,
          to: 3,
          fromSide: 'top',
          toSide: 'top'
        }, {
          id: 6,
          from: 1,
          to: 3,
          fromSide: 'bottom',
          toSide: 'bottom'
        }]
      }),
      eventStore: t.getEventStore({
        data: [{
          id: 1,
          startDate: '2017-12-02 10:00',
          endDate: '2017-12-02 12:00',
          resourceId: 'r2'
        }, {
          id: 2,
          startDate: '2017-12-03 10:00',
          endDate: '2017-12-03 10:00',
          resourceId: 'r2'
        }, {
          id: 3,
          startDate: '2017-12-01 10:00',
          endDate: '2017-12-01 10:00',
          resourceId: 'r2',
          iconCls: 'b-fa b-fa-search'
        }]
      }),
      resourceStore: t.getResourceStore2({}, 2),
      features: {
        dependencies: {
          overCls: 'b-sch-dependency-over'
        }
      },
      viewPreset: {
        base: 'hourAndDay',
        tickWidth: 25,
        columnLinesFor: 0,
        headers: [{
          unit: 'd',
          align: 'center',
          dateFormat: 'ddd DD MMM'
        }, {
          unit: 'h',
          align: 'center',
          dateFormat: 'HH'
        }]
      },
      startDate: new Date(2017, 11, 1),
      endDate: new Date(2017, 11, 4)
    }, 2);
    const expectedRects = {};
    t.chain({
      waitForSelector: '.b-sch-dependency'
    }, next => {
      DomHelper.forEachSelector(document, dependencySelector, el => {
        expectedRects[el.getAttribute('depId')] = el.getBBox();
      });
      t.waitForEvent(scheduler, 'dependenciesdrawn', next);
      scheduler.setTimeSpan(new Date(2017, 11, 2), new Date(2017, 11, 3));
    }, () => {
      const cellBox = document.querySelector('.b-sch-timeaxis-cell').getBoundingClientRect(),
            eventBox = document.querySelector('.b-sch-event-wrap:not(.b-milestone-wrap) .b-sch-event').getBoundingClientRect(),
            eventCenter = (eventBox.left + eventBox.right) / 2;
      DomHelper.forEachSelector(document, dependencySelector, el => {
        const id = el.getAttribute('depId'),
              gotRect = el.getBBox();
        t.is(gotRect.y, expectedRects[id].y, `Top position is ok for dep ${id}`); // Dep now goes to the likely position outside of view, either need to hardcode expectations or
        // scale expectedRects, or do relaxed check such as this...

        t.isGreater(gotRect.width, cellBox.width / 2, 'Dep width is ok');
        t.ok(gotRect.x + gotRect.width - eventCenter < 40 || gotRect.x - eventCenter < 40, 'Dep line points from event center');
      });
    });
  });
  t.it('Should live update dependencies when dragging events', t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      startDate: new Date(2018, 8, 2),
      endDate: new Date(2018, 8, 16),
      height: 200,
      enableEventAnimations: false,
      features: {
        dependencies: true
      },
      resources: [{
        id: 'r1',
        name: 'Machine'
      }],
      events: [{
        id: 1,
        resourceId: 'r1',
        name: 'A',
        startDate: new Date(2018, 8, 2),
        duration: 1,
        cls: 'event1'
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'B',
        endDate: new Date(2018, 8, 8),
        duration: 1,
        cls: 'event2'
      }],
      dependencies: [{
        id: 1,
        from: 1,
        to: 2
      }]
    });
    t.chain({
      drag: '.event2',
      by: [0, 300],
      dragOnly: true
    }, {
      moveMouseBy: [100, 0]
    }, next => {
      t.assertDependency(scheduler, scheduler.dependencies[0]);
      next();
    }, {
      moveMouseBy: [-200, 0]
    }, next => {
      t.assertDependency(scheduler, scheduler.dependencies[0]);
      next();
    }, {
      moveMouseBy: [100, -300]
    }, {
      mouseUp: null
    }, () => {
      t.assertDependency(scheduler, scheduler.dependencies[0]);
    });
  });
  t.it('Should remove dependency lines when records are removed from store', t => {
    scheduler = t.getScheduler({
      dependencyStore: t.getDependencyStore({
        data: [{
          id: 1,
          from: 1,
          to: 2,
          fromSide: 'top',
          toSide: 'top'
        }, {
          id: 2,
          from: 1,
          to: 2,
          fromSide: 'bottom',
          toSide: 'bottom'
        }, {
          id: 3,
          from: 1,
          to: 3,
          fromSide: 'left',
          toSide: 'right'
        }]
      }),
      eventStore: t.getEventStore({
        data: [{
          id: 1,
          startDate: '2017-12-02 10:00',
          endDate: '2017-12-02 12:00',
          resourceId: 'r2'
        }, {
          id: 2,
          startDate: '2017-12-03 10:00',
          endDate: '2017-12-03 10:00',
          resourceId: 'r2'
        }, {
          id: 3,
          startDate: '2017-12-01 10:00',
          endDate: '2017-12-01 10:00',
          resourceId: 'r2'
        }]
      }),
      resourceStore: t.getResourceStore2({}, 2),
      features: {
        dependencies: {
          overCls: 'b-sch-dependency-over'
        }
      },
      startDate: new Date(2017, 11, 1),
      endDate: new Date(2017, 11, 4)
    }, 2);
    t.chain({
      waitForSelector: '.b-sch-dependency'
    }, next => {
      t.waitForSelectorNotFound('.b-sch-dependency', next);
      scheduler.dependencyStore.removeAll();
    }, () => {
      t.waitForEvent(scheduler, 'dependenciesdrawn', () => {
        t.selectorCountIs('.b-sch-dependency', 0, 'No dependency lines visible');
      });
      scheduler.features.dependencies.scheduleDraw();
    });
  }); // TODO : Do not understand this test...

  t.xit('Dependencies should be rendered properly after add/remove followed by redraw', t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      startDate: new Date(2018, 8, 2),
      endDate: new Date(2018, 8, 16),
      features: {
        dependencies: true
      },
      resources: [{
        id: 'r1',
        name: 'Machine'
      }],
      events: [{
        id: 1,
        resourceId: 'r1',
        name: 'A',
        startDate: new Date(2018, 8, 2),
        duration: 1
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'B',
        endDate: new Date(2018, 8, 8),
        duration: 1
      }],
      dependencies: []
    });
    t.chain({
      waitForSelector: '.b-sch-event'
    }, next => {
      // Checking if redrawing all deps works properly, when working with records directly, they are always
      // rendered, but redrawing uses cache and by doing tht we are checking if records are cached properly.
      // It occurs e.g. when user scrolls the view
      // #7009
      t.waitForEvent(scheduler, 'dependenciesdrawn', () => {
        t.waitForEvent(scheduler, 'dependenciesdrawn', next);
        scheduler.features.dependencies.scheduleDraw();
      });
      scheduler.dependencyStore.add([{
        id: 1,
        from: 1,
        to: 2,
        fromSide: 'top',
        toSide: 'top'
      }, {
        id: 2,
        from: 1,
        to: 2,
        fromSide: 'bottom',
        toSide: 'bottom'
      }]);
    }, next => {
      t.selectorCountIs(dependencySelector, 2, 'Dependencies are ok');
      t.waitForEvent(scheduler, 'dependenciesdrawn', () => {
        t.waitForEvent(scheduler, 'dependenciesdrawn', next);
        scheduler.features.dependencies.scheduleDraw();
      });
      scheduler.dependencyStore.add([{
        id: 3,
        from: 1,
        to: 2
      }]);
    }, next => {
      t.selectorCountIs(dependencySelector, 3, 'Dependencies are ok');
      t.waitForEvent(scheduler, 'dependenciesdrawn', () => {
        t.waitForEvent(scheduler, 'dependenciesdrawn', next);
        scheduler.features.dependencies.scheduleDraw();
      });
      scheduler.dependencyStore.remove([2, 3]);
    }, next => {
      t.selectorCountIs(dependencySelector, 1, 'Dependencies are ok');
      t.waitForEvent(scheduler, 'dependenciesdrawn', () => {
        t.waitForEvent(scheduler, 'dependenciesdrawn', next);
        scheduler.features.dependencies.scheduleDraw();
      });
      scheduler.dependencyStore.remove(1);
    }, () => {
      t.selectorCountIs(dependencySelector, 0, 'Dependencies are ok');
    });
  });
  t.it('Dependencies feature should not try to redraw upon any store changes before first render', async t => {
    const depStore = new DependencyStore({
      data: [{
        id: 1,
        from: 1,
        to: 2
      }]
    }),
          oldOn = depStore.on,
          project = new ProjectModel({
      resourcesData: [{
        id: 'r1',
        name: 'Machine'
      }],
      eventsData: [{
        id: 1,
        resourceId: 'r1',
        name: 'A',
        startDate: new Date(2018, 8, 2),
        duration: 1
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'B',
        endDate: new Date(2018, 8, 8),
        duration: 1
      }]
    });
    await t.waitForProjectReady(project); // Fire event as soon as someone listens for something

    depStore.on = function () {
      const retVal = oldOn.apply(this, arguments);
      this.first.from = 3;
      return retVal;
    };

    scheduler = new Scheduler({
      appendTo: document.body,
      startDate: new Date(2018, 8, 2),
      endDate: new Date(2018, 8, 16),
      features: {
        dependencies: true
      },
      project
    });
  });
  t.it('Dependency repainted properly when moving successor outside of the view', async t => {
    scheduler = await t.getSchedulerAsync({
      enableEventAnimations: false,
      resources: [{
        id: 1,
        name: 'Foo'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        name: 'Event 1',
        startDate: '2017-01-16',
        endDate: '2017-01-18'
      }, {
        id: 2,
        resourceId: 1,
        name: 'Event 2',
        startDate: '2017-01-19',
        endDate: '2017-01-21'
      }],
      dependencies: [{
        id: 1,
        from: 1,
        to: 2
      }],
      startDate: '2017-01-15',
      endDate: '2017-01-30'
    });
    const dep = scheduler.dependencies[0],
          event = scheduler.eventStore.getById(2);
    let newStart, newLeft;
    await t.waitForDependencies();
    t.assertDependency(scheduler, dep);
    const refreshDependencySpy = t.spyOn(scheduler.features.dependencies, 'scheduleRefreshDependency').and.callThrough();
    newStart = new Date(2017, 0, 29);
    await event.setStartDate(newStart);
    await t.waitFor(() => {
      t.diag(refreshDependencySpy.calls.count());
      return refreshDependencySpy.calls.count() === 2;
    });
    await scheduler.await('dependenciesDrawn', false);
    await t.waitForSelector('.b-sch-dependency[depId="1"]');
    t.pass('First refresh');
    const el = scheduler.getElementsFromEventRecord(scheduler.events[0])[0],
          box = el.getBoundingClientRect();
    newLeft = scheduler.getCoordinateFromDate(newStart) + scheduler.timeAxisSubGridElement.getBoundingClientRect().left;
    t.assertDependency(scheduler, dep, {
      toBox: {
        left: newLeft,
        width: box.width,
        top: box.top,
        height: box.height
      }
    });
    newStart = new Date(2017, 1, 10);
    await event.setStartDate(newStart);
    await t.waitFor(() => refreshDependencySpy.calls.count() === 4);
    await scheduler.await('dependenciesDrawn', false);
    await t.waitForSelector('.b-sch-dependency[depId="1"]');
    t.pass('Second refresh'); // New rendering positions it "correctly" outside of view

    newLeft =
    /*scheduler.timeAxisViewModel.totalSize*/
    2560 + scheduler.timeAxisSubGridElement.getBoundingClientRect().left;
    t.assertDependency(scheduler, dep, {
      toBox: {
        left: newLeft,
        width: box.width,
        top: box.top,
        height: box.height
      }
    });
  });
  t.it('Should not throw when dragging task with invalid incoming/outgoing deps', t => {
    scheduler = t.getScheduler({
      resources: [{
        id: 1,
        name: 'Foo'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        name: 'Event 1',
        startDate: '2017-01-16',
        endDate: '2017-01-18'
      }],
      dependencies: [{
        id: 1,
        from: 1,
        to: 2
      }, {
        id: 2,
        from: 3,
        to: 1
      }],
      startDate: '2017-01-15',
      endDate: '2017-01-30'
    });
    t.chain({
      waitForEventsToRender: null
    }, {
      drag: '.b-sch-event',
      by: [100, 0]
    }, () => {
      t.pass('Dragging does not throw');
    });
  });
  t.it('Should reset bounds cache if at least one draw was scheduled with relayout option', t => {
    scheduler = t.getScheduler({
      dependencyStore: true
    });
    const depFeature = scheduler.features.dependencies;
    t.chain({
      waitForSelector: '.b-sch-dependency'
    }, next => {
      t.isCalledNTimes('resetBoundsCache', depFeature, 2, 'Cache is reset');
      t.waitForEvent(scheduler, 'dependenciesdrawn', next);
      depFeature.scheduleDraw(true);
      depFeature.scheduleDraw(false);
    }, next => {
      t.waitForEvent(scheduler, 'dependenciesdrawn', next);
      depFeature.scheduleDraw(false);
      depFeature.scheduleDraw(true);
    });
  });
});