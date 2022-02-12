"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
  });

  function getPointFromBox(el, side, isMilestone) {
    const adjustLeft = 0,
          adjustRight = 0,
          box = el.getBoundingClientRect();
    let fromPoint;

    switch (side) {
      case 'top':
        fromPoint = [box.left + box.width / 2, box.top];
        break;

      case 'bottom':
        fromPoint = [box.left + box.width / 2, box.bottom];
        break;

      case 'left':
        fromPoint = [box.left - adjustLeft, box.top + box.height / 2];
        break;

      case 'right':
        fromPoint = [box.right + adjustRight, box.top + box.height / 2];
        break;
    }

    return fromPoint;
  }

  function getFromSide(dependency) {
    return dependency.fromSide || (dependency.type < 2 ? 'left' : 'right');
  }

  function getToSide(dependency) {
    return dependency.toSide || (dependency.type % 2 ? 'right' : 'left');
  }

  function getDependencyCoordinates(t, dependency, includeFrom = true, includeTo = true) {
    const dependencyEl = scheduler.features.dependencies.getElementsForDependency(dependency)[0],
          svgBox = dependencyEl.ownerSVGElement.getBoundingClientRect(),
          dependencyPoints = dependencyEl.points,
          depStartPoint = dependencyPoints[0],
          depEndPoint = dependencyPoints[dependencyPoints.length - 1],
          depFromPoint = [depStartPoint.x + svgBox.left, depStartPoint.y + svgBox.top],
          depToPoint = [depEndPoint.x + svgBox.left, depEndPoint.y + svgBox.top];
    let fromPoint, toPoint;

    if (includeFrom) {
      const from = dependency.fromEvent,
            fromEl = scheduler.getElementsFromEventRecord(from, null, true)[0];
      fromPoint = getPointFromBox(fromEl, getFromSide(dependency), from.isMilestone);
    }

    if (includeTo) {
      const to = dependency.toEvent,
            toEl = scheduler.getElementsFromEventRecord(to, null, true)[0];
      toPoint = getPointFromBox(toEl, getToSide(dependency), to.isMilestone);
    }

    return {
      depFromPoint,
      depToPoint,
      fromPoint,
      toPoint
    };
  }

  function assertDependency(t, dependency, includeFrom = true, includeTo = true) {
    const threshold = t.bowser.firefox ? 2 : 1;

    if (includeFrom) {
      const {
        depFromPoint,
        fromPoint
      } = getDependencyCoordinates(t, dependency, includeFrom, includeTo);
      t.isApproxPx(depFromPoint[0], fromPoint[0], threshold, 'Dependency start point x is ok');
      t.isApproxPx(depFromPoint[1], fromPoint[1], threshold, 'Dependency start point y is ok');
    }

    if (includeTo) {
      const {
        depToPoint,
        toPoint
      } = getDependencyCoordinates(t, dependency, includeFrom, includeTo);
      t.isApproxPx(depToPoint[0], toPoint[0], threshold, 'Dependency end point x is ok');
      t.isApproxPx(depToPoint[1], toPoint[1], threshold, 'Dependency end point y is ok');
    }
  }

  function dependencyIsOk(t, dependency, includeFrom = true, includeTo = true) {
    let result = true;

    if (includeFrom) {
      const {
        depFromPoint,
        fromPoint
      } = getDependencyCoordinates(t, dependency, includeFrom, includeTo);
      result = result && Math.abs(depFromPoint[0] - fromPoint[0]) < 2 && Math.abs(depFromPoint[1] - fromPoint[1]) < 2;
    }

    if (includeTo) {
      const {
        depToPoint,
        toPoint
      } = getDependencyCoordinates(t, dependency, includeFrom, includeTo);
      result = result && Math.abs(depToPoint[0] - toPoint[0]) < 2 && Math.abs(depToPoint[1] - toPoint[1]) < 2;
    }

    return result;
  }

  function It(desc, config, iit = false) {
    t[iit ? 'iit' : 'it'](desc, async t => {
      let eventStore;

      if (config.events) {
        eventStore = t.getEventStore({
          data: config.events
        }, 2);
      }

      scheduler = t.getScheduler({
        dependencyStore: t.getDependencyStore({
          data: config.dependencies
        }),
        eventStore,
        resourceStore: t.getResourceStore2({}, 2),
        features: {
          dependencies: {
            pathFinderConfig: {
              endArrowMargin: 10
            },
            overCls: 'b-sch-dependency-over'
          }
        }
      }, 2);
      await t.waitForFontLoaded();
      await t.waitForSelector('.b-sch-dependency');
      assertDependency(t, scheduler.dependencies[0]);
    });
  }

  It('Start to start dependency is ok', {
    dependencies: [{
      from: 1,
      to: 2,
      type: 0
    }]
  });
  It('Start to end dependency is ok', {
    dependencies: [{
      from: 1,
      to: 2,
      type: 1
    }]
  });
  It('End to start dependency is ok', {
    dependencies: [{
      from: 1,
      to: 2,
      type: 2
    }]
  });
  It('End to end dependency is ok', {
    dependencies: [{
      from: 1,
      to: 2,
      type: 3
    }]
  });
  It('Top to bottom dependency is ok', {
    dependencies: [{
      from: 1,
      to: 2,
      fromSide: 'top',
      toSide: 'bottom'
    }]
  });
  It('Bottom to bottom dependency is ok', {
    dependencies: [{
      from: 1,
      to: 2,
      fromSide: 'bottom',
      toSide: 'bottom'
    }]
  });
  It('Start to milestone start', {
    events: [{
      id: 1,
      cls: 'event1',
      resourceId: 'r1',
      name: 'Assignment 1',
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 5)
    }, {
      id: 2,
      cls: 'event2',
      resourceId: 'r2',
      name: 'Assignment 2',
      startDate: new Date(2011, 0, 8),
      endDate: new Date(2011, 0, 8)
    }],
    dependencies: [{
      from: 1,
      to: 2,
      fromSide: 'left',
      toSide: 'left'
    }]
  });
  It('Start to milestone end', {
    events: [{
      id: 1,
      cls: 'event1',
      resourceId: 'r1',
      name: 'Assignment 1',
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 5)
    }, {
      id: 2,
      cls: 'event2',
      resourceId: 'r2',
      name: 'Assignment 2',
      startDate: new Date(2011, 0, 8),
      endDate: new Date(2011, 0, 8)
    }],
    dependencies: [{
      from: 1,
      to: 2,
      fromSide: 'left',
      toSide: 'right'
    }]
  });
  It('Start to milestone top', {
    events: [{
      id: 1,
      cls: 'event1',
      resourceId: 'r1',
      name: 'Assignment 1',
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 5)
    }, {
      id: 2,
      cls: 'event2',
      resourceId: 'r2',
      name: 'Assignment 2',
      startDate: new Date(2011, 0, 8),
      endDate: new Date(2011, 0, 8)
    }],
    dependencies: [{
      from: 1,
      to: 2,
      fromSide: 'left',
      toSide: 'top'
    }]
  });
  It('Start to milestone bottom', {
    events: [{
      id: 1,
      cls: 'event1',
      resourceId: 'r1',
      name: 'Assignment 1',
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 5)
    }, {
      id: 2,
      cls: 'event2',
      resourceId: 'r2',
      name: 'Assignment 2',
      startDate: new Date(2011, 0, 8),
      endDate: new Date(2011, 0, 8)
    }],
    dependencies: [{
      from: 1,
      to: 2,
      fromSide: 'left',
      toSide: 'bottom'
    }]
  });
  It('Start to icon milestone start', {
    events: [{
      id: 1,
      cls: 'event1',
      resourceId: 'r1',
      name: 'Assignment 1',
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 5)
    }, {
      id: 2,
      cls: 'event2',
      resourceId: 'r2',
      iconCls: 'b-fa b-fa-search',
      style: 'background-color:blue',
      startDate: new Date(2011, 0, 8),
      endDate: new Date(2011, 0, 8)
    }],
    dependencies: [{
      from: 1,
      to: 2,
      fromSide: 'left',
      toSide: 'left'
    }]
  });
  It('Start to icon milestone end', {
    events: [{
      id: 1,
      cls: 'event1',
      resourceId: 'r1',
      name: 'Assignment 1',
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 5)
    }, {
      id: 2,
      cls: 'event2',
      resourceId: 'r2',
      iconCls: 'b-fa b-fa-search',
      style: 'background-color:blue',
      startDate: new Date(2011, 0, 8),
      endDate: new Date(2011, 0, 8)
    }],
    dependencies: [{
      from: 1,
      to: 2,
      fromSide: 'left',
      toSide: 'right'
    }]
  });
  It('Start to icon milestone top', {
    events: [{
      id: 1,
      cls: 'event1',
      resourceId: 'r1',
      name: 'Assignment 1',
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 5)
    }, {
      id: 2,
      cls: 'event2',
      resourceId: 'r2',
      iconCls: 'b-fa b-fa-search',
      style: 'background-color:blue',
      startDate: new Date(2011, 0, 8),
      endDate: new Date(2011, 0, 8)
    }],
    dependencies: [{
      from: 1,
      to: 2,
      fromSide: 'left',
      toSide: 'top'
    }]
  });
  It('Start to icon milestone bottom', {
    events: [{
      id: 1,
      cls: 'event1',
      resourceId: 'r1',
      name: 'Assignment 1',
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 5)
    }, {
      id: 2,
      cls: 'event2',
      resourceId: 'r2',
      iconCls: 'b-fa b-fa-search',
      style: 'background-color:blue',
      startDate: new Date(2011, 0, 8),
      endDate: new Date(2011, 0, 8)
    }],
    dependencies: [{
      from: 1,
      to: 2,
      fromSide: 'left',
      toSide: 'bottom'
    }]
  });
  t.it('Dependency start/end boxes out of range', t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      startDate: new Date(2018, 9, 19),
      endDate: new Date(2018, 9, 31),
      columns: [{
        field: 'name',
        text: 'Name'
      }],
      features: {
        dependencies: true
      },
      resources: ArrayHelper.populate(100, i => ({
        id: i + 1,
        name: 'Resource ' + (i + 1)
      })),
      // Must be some overlapping events to cause the position of the
      // dependency end events to be not calculable exactly, but to
      // fall back to a best guess basis which will not be correct.
      // When these are scrolled into view, dep line should be corrected
      // as the best guess bounds cache is discarded in favour of one
      // gathered from the event's rendered element position.
      events: [{
        id: 1,
        resourceId: 1,
        startDate: new Date(2018, 9, 20),
        duration: 2
      }, {
        id: 2,
        resourceId: 50,
        startDate: new Date(2018, 9, 23),
        duration: 2
      }, {
        id: 3,
        resourceId: 50,
        startDate: new Date(2018, 9, 24),
        duration: 2
      }, {
        id: 4,
        resourceId: 100,
        startDate: new Date(2018, 9, 27),
        duration: 2
      }, {
        id: 5,
        resourceId: 100,
        startDate: new Date(2018, 9, 28),
        duration: 2
      }],
      dependencies: [{
        id: 1,
        from: 1,
        to: 3
      }, {
        id: 2,
        from: 3,
        to: 5
      }]
    });
    const event1 = scheduler.eventStore.getAt(1),
          event3 = scheduler.eventStore.getAt(3),
          dep0 = scheduler.dependencyStore.getAt(0),
          dep1 = scheduler.dependencyStore.getAt(1);
    t.chain({
      waitForDependencies: null
    }, next => {
      // From side of dep 0 must be correct.
      // The to side is outside the rendered block so will not be correct.
      assertDependency(t, dep0, true, false); // Scroll the middle event into view

      scheduler.scrollEventIntoView(event1, {
        block: 'center'
      }).then(next);
    }, // Deps are redrawn on frame
    {
      waitForEvent: [scheduler, 'dependenciesDrawn']
    }, {
      waitFor: () => dependencyIsOk(t, dep0, false, true)
    }, next => {
      // To side of dep 0 must be correct.
      // The from side is outside the rendered block so will not be correct.
      assertDependency(t, dep0, false, true); // From side of dep 1 must be correct.
      // The to side is outside the rendered block so will not be correct.

      assertDependency(t, dep1, true, false); // Scroll the end event into view

      scheduler.scrollEventIntoView(event3, {
        block: 'center'
      }).then(next);
    }, // Deps are redrawn on frame
    {
      waitForEvent: [scheduler, 'dependenciesDrawn']
    }, {
      waitFor: () => dependencyIsOk(t, dep1, false, true)
    }, () => {
      // To side of dep 1 must be correct.
      // The from side is outside the rendered block so will not be correct.
      assertDependency(t, dep1, false, true);
    });
  });
});