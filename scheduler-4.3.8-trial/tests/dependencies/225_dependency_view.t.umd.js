"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    var _scheduler;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });

  const injectDependencyStyle = () => {
    const style = document.createElement('style');
    style.innerHTML = `
            polyline {
                stroke-width: 15 !important;
            }`;
    document.head.appendChild(style);
    return style;
  },
        applyPointerHook = () => {
    // Can't find a simple way to trigger hover perfect across browsers since SVG impl is different
    // Force pointer events to all to get reliable hover triggering
    Array.from(scheduler.element.querySelectorAll('.b-sch-dependency')).forEach(node => {
      node.style['pointer-events'] = 'all';
    });
  };

  t.it('Should maintain a steady number of drawn dependencies on scroll', t => {
    const dependencySelector = 'polyline.b-sch-dependency:not(.b-sch-released)';
    const eventStore = new EventStore({
      data: ArrayHelper.populate(1000, i => ({
        id: i,
        cls: 'event' + i,
        resourceId: 'r' + i,
        name: 'Assignment ' + i,
        startDate: new Date(2011, 0, 4),
        endDate: new Date(2011, 0, 6)
      }))
    });
    scheduler = t.getScheduler({
      eventStore,
      dependencyStore: true,
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 0, 13),
      resourceStore: t.getResourceStore2({}, 2500)
    }, 1000);
    const scroller = scheduler.scrollable;
    let lineCount, drawnDepLen; // The line count must remain stable during scroll

    t.chain({
      waitForDependencies: null
    }, // Scroll to where we have dependencies spilling out both top and bottom of scheduler's scrolling viewport.
    // From here, the number of dependencies should remain stable to within a tolerance of 2 on scroll.
    // Depending upon the exact scroll position, there may be 2 more or fewer lines.
    {
      waitForEvent: [scroller, 'scrollend'],
      trigger: () => {
        scheduler.scrollEventIntoView(scheduler.eventStore.getAt(30));
      },
      desc: 'Scrolled to Event 30'
    }, {
      waitForAnimationFrame: null
    }, async () => {
      lineCount = t.query(dependencySelector).length;
      drawnDepLen = scheduler.features.dependencies.drawnDependencies.length;
    }, {
      waitForEvent: [scroller, 'scrollend'],
      trigger: () => {
        scheduler.scrollEventIntoView(scheduler.eventStore.getAt(40));
      },
      desc: 'Scrolled to Event 40'
    }, {
      waitForAnimationFrame: null
    }, async () => {
      t.isApprox(t.query(dependencySelector).length, lineCount, 2, `Number of lines is correct: ${lineCount}`);
      t.isApprox(scheduler.features.dependencies.drawnDependencies.length, drawnDepLen, 2, `Number of drawn dependencies is correct: ${drawnDepLen}`);
    }, {
      waitForEvent: [scroller, 'scrollend'],
      trigger: () => {
        scheduler.scrollEventIntoView(scheduler.eventStore.getAt(60));
      },
      desc: 'Scrolled to Event 60'
    }, {
      waitForAnimationFrame: null
    }, async () => {
      t.isApprox(t.query(dependencySelector).length, lineCount, 2, `Number of lines is correct: ${lineCount}`);
      t.isApprox(scheduler.features.dependencies.drawnDependencies.length, drawnDepLen, 2, `Number of drawn dependencies is correct: ${drawnDepLen}`);
    }, {
      waitForEvent: [scroller, 'scrollend'],
      trigger: () => {
        scheduler.scrollEventIntoView(scheduler.eventStore.getAt(200));
      },
      desc: 'Scrolled to Event 200'
    }, {
      waitForAnimationFrame: null
    }, async () => {
      t.isApprox(t.query(dependencySelector).length, lineCount, 2, `Number of lines is correct: ${lineCount}`);
      t.isApprox(scheduler.features.dependencies.drawnDependencies.length, drawnDepLen, 2, `Number of drawn dependencies is correct: ${drawnDepLen}`);
    }, {
      waitForEvent: [scroller, 'scrollend'],
      trigger: () => {
        scheduler.scrollEventIntoView(scheduler.eventStore.getAt(300));
      },
      desc: 'Scrolled to Event 300'
    }, {
      waitForAnimationFrame: null
    }, async () => {
      t.isApprox(t.query(dependencySelector).length, lineCount, 2, `Number of lines is correct: ${lineCount}`);
      t.isApprox(scheduler.features.dependencies.drawnDependencies.length, drawnDepLen, 2, `Number of drawn dependencies is correct: ${drawnDepLen}`);
    }, {
      waitForEvent: [scroller, 'scrollend'],
      trigger: () => {
        scheduler.scrollEventIntoView(scheduler.eventStore.getAt(900));
      },
      desc: 'Scrolled to Event 900'
    }, {
      waitForAnimationFrame: null
    }, () => {
      t.isApprox(t.query(dependencySelector).length, lineCount, 2, `Number of lines is correct: ${lineCount}`);
      t.isApprox(scheduler.features.dependencies.drawnDependencies.length, drawnDepLen, 2, `Number of drawn dependencies is correct: ${drawnDepLen}`);
    });
  });
  !BrowserHelper.isIE11 && t.it('Should fire dependencymouseover/dependencymouseout events', t => {
    scheduler = t.getScheduler({
      dependencyStore: true,
      resourceStore: t.getResourceStore2({}, 2),
      features: {
        eventTooltip: false,
        dependencies: {
          overCls: 'b-sch-dependency-over',
          showTooltip: true
        }
      }
    }, 2);
    t.firesAtLeastNTimes(scheduler, 'dependencymouseover', 1);
    t.firesAtLeastNTimes(scheduler, 'dependencymouseout', 1);
    t.chain({
      waitForSelector: '.b-sch-dependency'
    }, async () => {
      const lineElement = document.querySelector('.b-sch-dependency');
      lineElement.style.transition = 'none';
      lineElement.style.strokeWidth = '10px';
      await scheduler.nextAnimationFrame();
    }, {
      moveCursorTo: '.b-sch-dependency',
      offset: [-5, '50%']
    }, {
      moveMouseTo: '.b-sch-event'
    }, {
      waitForSelectorNotFound: '.b-sch-dependency-over'
    });
  }); // #3243

  t.it('Dependency painted ok on the last rendered row', async t => {
    scheduler = await t.getSchedulerAsync({
      events: [],
      resources: ArrayHelper.populate(50, i => ({
        id: i + 1,
        name: i + 1
      })),
      dependencies: [],
      features: {
        eventTooltip: false,
        dependencies: true
      }
    }); // Add two events so only one is rendered and link them with dependency

    scheduler.eventStore.add([{
      id: 1,
      name: 'Realized',
      resourceId: 10,
      startDate: '2011-01-06',
      endDate: '2011-01-08'
    }, {
      id: 2,
      name: 'Unrealized',
      resourceId: 25,
      startDate: '2011-01-06',
      endDate: '2011-01-08'
    }]);
    scheduler.dependencyStore.add({
      from: 1,
      to: 2
    }); // Add two records to stretch row vertically, to make things more fun and complex

    scheduler.eventStore.add([{
      startDate: '2011-01-06',
      endDate: '2011-01-08',
      resourceId: 2
    }, {
      startDate: '2011-01-06',
      endDate: '2011-01-08',
      resourceId: 2
    }]);
    await t.waitForProjectReady();
    t.chain({
      waitForDependencies: null
    }, {
      waitFor: () => {
        const dependency = document.querySelector('.b-sch-dependency'),
              svg = document.querySelector('svg'),
              record = scheduler.eventStore.first,
              eventBox = scheduler.getElementsFromEventRecord(record)[0].getBoundingClientRect();
        return dependency && dependency.getBBox().y + svg.getBoundingClientRect().top - (eventBox.top + eventBox.height / 2) <= 2;
      }
    }, () => {
      t.pass('Horizontal line placed ok');
    });
  });
  t.it('Should not draw dependency to missing event', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventTooltip: false,
        dependencies: true
      },
      dependencies: [{
        from: 1,
        to: 2
      }],
      resources: [{
        id: 1,
        name: 'Dude'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        name: 'A',
        startDate: '2011-01-06',
        endDate: '2011-01-08'
      }, {
        id: 2,
        resourceId: 1,
        name: 'B',
        startDate: '2011-01-10',
        endDate: '2011-01-12'
      }]
    }, 25);
    t.chain({
      waitForDependencies: null
    }, async () => {
      scheduler.features.dependencies.dependencyStore.first.to = 3;
    }, {
      waitForSelectorNotFound: '.b-sch-dependency:not(.b-sch-released)',
      desc: 'Dependency not drawn'
    });
  });
  !BrowserHelper.isIE11 && t.it('Should show tooltip when hovering a dependency line', t => {
    const style = injectDependencyStyle();
    scheduler = t.getScheduler({
      dependencyStore: true,
      resourceStore: t.getResourceStore2({}, 2),
      features: {
        eventTooltip: false,
        scheduleTooltip: false,
        dependencies: {
          overCls: 'b-sch-dependency-over',
          showTooltip: true
        }
      }
    }, 2);
    t.chain({
      moveCursorTo: [0, 0]
    }, {
      waitForDependencies: null
    }, async () => applyPointerHook, {
      moveCursorTo: '.b-sch-dependency',
      offset: ['50%-3', '50%-3']
    }, // (next) => {
    //     // With SVG, triggering of mouseover is not reliable x-browser
    //     t.simulateEvent('.b-sch-dependency', 'mouseover');
    //
    //     next();
    // },
    {
      waitForSelector: '.b-sch-dependency-tooltip:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-tooltip:contains(To: Assignment 2)'
    }, {
      moveMouseBy: [0, 50]
    }, {
      waitForSelectorNotFound: '.b-tooltip'
    }, () => {
      document.head.removeChild(style);
    });
  });
  t.it('Should not crash nor draw dependency to event of non-existing resource', t => {
    scheduler = t.getScheduler({
      features: {
        eventTooltip: false,
        dependencies: true
      },
      dependencies: [{
        from: 1,
        to: 2
      }],
      resources: [{
        id: 1,
        name: 'Dude'
      }, {
        id: 2,
        name: 'Other Dude'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        name: 'A',
        startDate: '2011-01-06',
        endDate: '2011-01-08'
      }, {
        id: 2,
        resourceId: 2,
        name: 'A',
        startDate: '2011-01-06',
        endDate: '2011-01-08'
      }]
    });
    t.chain({
      waitForDependencies: null
    }, async () => {
      scheduler.eventStore.first.resourceId = 'blargh';
    }, {
      waitForSelectorNotFound: '.b-sch-dependency:not(.b-sch-released)',
      desc: 'Dependency not drawn'
    });
  });
  t.it('Should be possible to disable creating dependencies while still drawing them', t => {
    scheduler = t.getScheduler({
      features: {
        eventTooltip: false,
        dependencies: {
          allowCreate: false
        }
      },
      resources: [{
        id: 1,
        name: 'Dude'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        cls: 'foo',
        startDate: '2011-01-06',
        endDate: '2011-01-08'
      }, {
        id: 2,
        resourceId: 1,
        cls: 'bar',
        startDate: '2011-01-06',
        endDate: '2011-01-08'
      }]
    });
    t.chain({
      moveCursorTo: '.b-sch-event.foo'
    }, {
      waitForSelectorNotFound: '.b-sch-terminal',
      desc: 'Dependency terminals not shown'
    }, async () => {
      scheduler.features.dependencies.allowCreate = true;
    }, {
      moveCursorTo: '.b-sch-event.bar'
    }, {
      waitForSelector: '.b-sch-terminal',
      desc: 'Dependency terminals hown'
    });
  });
  t.it('Should respect Scheduler readOnly state', t => {
    scheduler = t.getScheduler({
      features: {
        eventTooltip: false,
        dependencies: {
          allowCreate: true
        }
      },
      resources: [{
        id: 1,
        name: 'Dude'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        cls: 'foo',
        startDate: '2011-01-06',
        endDate: '2011-01-08'
      }, {
        id: 2,
        resourceId: 1,
        cls: 'bar',
        startDate: '2011-01-06',
        endDate: '2011-01-08'
      }]
    });
    t.chain(async () => {
      scheduler.readOnly = true;
    }, {
      moveCursorTo: '.b-sch-event.foo'
    }, {
      waitForSelectorNotFound: '.b-sch-terminal',
      desc: 'Dependency terminals not shown when Scheduler is readOnly'
    }, async () => {
      scheduler.readOnly = false;
    }, {
      moveCursorTo: '.b-sch-event.bar'
    }, {
      waitForSelector: '.b-sch-terminal',
      desc: 'Dependency terminals shown when Scheduler is not readOnly'
    });
  });
  t.it('Should respect feature disabled state', t => {
    scheduler = t.getScheduler({
      features: {
        eventTooltip: false,
        dependencies: {
          allowCreate: true
        }
      },
      resources: [{
        id: 1,
        name: 'Dude'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        cls: 'foo',
        startDate: '2011-01-06',
        endDate: '2011-01-08'
      }, {
        id: 2,
        resourceId: 1,
        cls: 'bar',
        startDate: '2011-01-06',
        endDate: '2011-01-08'
      }]
    });
    t.chain(async () => {
      scheduler.features.dependencies.disabled = true;
    }, {
      moveCursorTo: '.b-sch-event.foo'
    }, {
      waitForSelectorNotFound: '.b-sch-terminal',
      desc: 'Dependency terminals not shown when Scheduler is readOnly'
    }, async () => {
      scheduler.features.dependencies.disabled = false;
    }, {
      moveCursorTo: '.b-sch-event.bar'
    }, {
      waitForSelector: '.b-sch-terminal',
      desc: 'Dependency terminals shown when Scheduler is not readOnly'
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/9093

  t.it('Should clear dependencies when event store is cleared', t => {
    scheduler = t.getScheduler({
      dependencies: [{
        from: 1,
        to: 2
      }, {
        from: 2,
        to: 3
      }, {
        from: 3,
        to: 4
      }, {
        from: 4,
        to: 5
      }]
    });
    t.chain({
      waitForDependencies: null
    }, async () => {
      scheduler.eventStore.removeAll();
    }, {
      waitForSelectorNotFound: '.b-sch-dependency'
    }, next => {
      scheduler.eventStore.add({
        resourceId: 'r1',
        startDate: '2011-01-04',
        endDate: '2011-01-06'
      });
      scheduler.eventStore.add({
        resourceId: 'r2',
        startDate: '2011-01-04',
        endDate: '2011-01-06'
      });
      scheduler.features.dependencies.scheduleDraw();
      t.waitForEvent(scheduler, 'dependenciesdrawn', next);
    }, () => {
      t.selectorCountIs('.b-sch-dependency', 0, 'No dependencies rendered');
    });
  });
  t.it('Should not be affected by XSS injection', t => {
    const style = injectDependencyStyle();
    scheduler = t.getScheduler({
      dependencies: [{
        id: 1,
        from: 1,
        to: 2
      }, {
        id: 2,
        from: 3,
        to: 1
      }]
    });
    t.injectXSS(scheduler);
    t.chain({
      waitForDependencies: null
    }, async () => applyPointerHook, {
      moveCursorTo: '.b-sch-dependency[depId="1"]',
      offset: [0, '50%']
    }, {
      moveCursorTo: '.b-sch-dependency[depId="2"]',
      offset: [0, '50%']
    }, () => document.head.removeChild(style));
  });
});