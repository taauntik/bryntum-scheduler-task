"use strict";

StartTest(t => {
  let scheduler;
  const DependencyModelType = DependencyModel.Type;
  t.beforeEach(t => {
    scheduler && scheduler.destroy();
    scheduler = t.getScheduler({
      features: {
        dependencies: {
          allowDropOnEventBar: false,
          // the legacy behavior
          showTooltip: false
        },
        eventTooltip: false,
        scheduleTooltip: false
      },
      dependencyStore: new DependencyStore(),
      resourceStore: t.getResourceStore2({}, 10)
    }, 10);
  });
  t.it('Should create an End-To-Start dependency in the store after successful drop', t => {
    t.firesOk(scheduler, {
      beforedependencycreatedrag: 1,
      dependencycreatedragstart: 1,
      dependencycreatedrop: 1
    });
    t.chain({
      moveCursorTo: '[data-event-id="1"]'
    }, {
      mousedown: '[data-event-id="1"] .b-sch-terminal-right'
    }, {
      moveCursorTo: '[data-event-id="2"]'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:textEquals(To:)'
    }, async () => {
      t.is(scheduler.features.dependencies.creationTooltip.constrainTo, null, 'Tooltip not constrained');
    }, {
      moveCursorTo: '[data-event-id="2"] .b-sch-terminal-left'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:textEquals(To: Assignment 2)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:first-child .b-sch-box.b-right'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:last-child .b-sch-box.b-left'
    }, {
      mouseup: '[data-event-id="2"] .b-sch-terminal-left'
    }, {
      waitForDependencies: null
    }, () => {
      const dep = scheduler.dependencyStore.first;
      t.expect(dep.fromEvent.name).toBe('Assignment 1');
      t.expect(dep.toEvent.name).toBe('Assignment 2');
      t.expect(dep.type).toBe(DependencyModelType.EndToStart);
      t.expect(dep.fromSide).toBe('right');
      t.expect(dep.toSide).toBe('left');
    });
  });
  t.it('Should create an End-to-End dependency in the store after successful drop', t => {
    t.firesOk(scheduler, {
      beforedependencycreatedrag: 1,
      dependencycreatedragstart: 1,
      dependencycreatedrop: 1
    });
    t.chain({
      moveCursorTo: '[data-event-id="1"]'
    }, {
      mousedown: '[data-event-id="1"] .b-sch-terminal-right'
    }, {
      moveCursorTo: '[data-event-id="2"]'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:textEquals(To:)'
    }, next => {
      t.is(scheduler.features.dependencies.creationTooltip.constrainTo, null, 'Tooltip not constrained');
      next();
    }, {
      moveCursorTo: '[data-event-id="2"] .b-sch-terminal-right'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:textEquals(To: Assignment 2)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:first-child .b-sch-box.b-right'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:last-child .b-sch-box.b-right'
    }, {
      mouseup: '[data-event-id="2"] .b-sch-terminal-right'
    }, {
      waitForDependencies: null
    }, () => {
      const dep = scheduler.dependencyStore.first;
      t.expect(dep.fromEvent.name).toBe('Assignment 1');
      t.expect(dep.toEvent.name).toBe('Assignment 2');
      t.expect(dep.type).toBe(3);
      t.expect(dep.fromSide).toBe('right');
      t.expect(dep.toSide).toBe('right');
    });
  });
  t.it('Should not create a dependency if view returns false on beforedrag', t => {
    t.firesOk(scheduler, {
      beforedependencycreatedrag: 1,
      dependencycreatedragstart: 0,
      dependencycreatedrop: 0
    });
    scheduler.on('beforedependencycreatedrag', () => false);
    t.chain({
      moveCursorTo: '.b-sch-event:contains(Assignment 1)'
    }, {
      mousedown: '.b-sch-event:contains(Assignment 1) .b-sch-terminal-right'
    }, {
      moveCursorTo: '.b-sch-event:contains(Assignment 2)'
    }, {
      moveCursorTo: '.b-sch-event:contains(Assignment 2) .b-sch-terminal-left'
    }, {
      mouseup: null
    });
  });
  t.it('Terminals should be hidden in read only mode', function (t) {
    scheduler.readOnly = true;
    t.chain({
      moveCursorTo: '.b-sch-event'
    }, function () {
      t.selectorNotExists('.b-sch-event .b-sch-terminal', 'No terminals');
    });
  });
  t.it('Should not start dependency creation when right clicking on a terminal', t => {
    t.firesOk(scheduler, {
      beforedependencycreatedrag: 0,
      dependencycreatedragstart: 0,
      dependencycreatedrop: 0
    });
    t.chain({
      setCursorPosition: [1, 1]
    }, {
      moveCursorTo: '[data-event-id="1"]'
    }, {
      mousedown: '[data-event-id="1"] .b-sch-terminal-right',
      options: {
        button: 2
      }
    }, {
      moveCursorTo: '[data-event-id="2"]'
    }, {
      moveCursorTo: '[data-event-id="2"] .b-sch-terminal-left'
    }, {
      mouseup: '[data-event-id="2"] .b-sch-terminal-left'
    }, () => {
      t.notOk(scheduler.dependencyStore.first, 'no dependencies made');
    });
  });
  t.it('Should not raise an exception when left-clicked start terminal and right-clicked end terminal', t => {
    t.firesOk(scheduler, {
      beforedependencycreatedrag: 1,
      dependencycreatedragstart: 1,
      dependencycreatedrop: 1
    });
    t.chain({
      moveCursorTo: '[data-event-id="1"]'
    }, {
      mousedown: '[data-event-id="1"] .b-sch-terminal-right'
    }, {
      moveCursorTo: '[data-event-id="2"]'
    }, {
      moveCursorTo: '[data-event-id="2"] .b-sch-terminal-left'
    }, {
      mousedown: '[data-event-id="2"] .b-sch-terminal-left',
      options: {
        button: 2
      },
      desc: 'rightclicked on end terminal'
    }, {
      mouseup: '[data-event-id="2"] .b-sch-terminal-left'
    }, () => {
      const dep = scheduler.dependencyStore.first;
      t.expect(dep.fromEvent.name).toBe('Assignment 1');
      t.expect(dep.toEvent.name).toBe('Assignment 2');
      t.expect(dep.type).toBe(DependencyModelType.EndToStart);
      t.expect(dep.fromSide).toBe('right');
      t.expect(dep.toSide).toBe('left');
    });
  });
  t.it('View should be scrolled when dependency is dragged to the edge', t => {
    scheduler.width = scheduler.height = 400;
    let lineLength;
    const verticalScroller = scheduler.scrollable.element,
          horizontalScroller = scheduler.subGrids.normal.scrollable.element,
          // caching scrollWidth for edge
    horizontalScrollWidth = horizontalScroller.scrollWidth;
    t.chain({
      moveCursorTo: '.b-scheduler'
    }, // For IE, terminals gets lost somehow when resizing and mouse already over event
    {
      moveCursorTo: '[data-event-id="1"]'
    }, {
      mousedown: '[data-event-id="1"] .b-sch-terminal-bottom'
    }, {
      moveMouseTo: '.b-grid-body-container',
      offset: ['50%', '100%-10']
    }, {
      waitFor: () => verticalScroller.scrollTop + verticalScroller.clientHeight === verticalScroller.scrollHeight
    }, {
      moveMouseTo: '.b-grid-body-container',
      offset: ['100%-100', '50%']
    }, next => {
      lineLength = document.querySelector('.b-sch-dependency-connector').clientWidth;
      next();
    }, {
      moveMouseTo: '.b-grid-body-container',
      offset: ['100%-30', '50%']
    }, {
      waitFor: () => horizontalScroller.scrollLeft + horizontalScroller.clientWidth === horizontalScrollWidth
    }, next => {
      t.isGreater(document.querySelector('.b-sch-dependency-connector').clientWidth, lineLength * 2, 'Line width updated during scrolling');
      next();
    }, {
      moveMouseBy: [[-50, 0]]
    }, {
      moveMouseTo: '.event6',
      offset: ['100%-10', '50%']
    }, {
      moveMouseTo: '.event6 .b-sch-terminal-right'
    }, {
      mouseUp: '.event6 .b-sch-terminal-right'
    }, () => {
      const dep = scheduler.dependencyStore.first;
      t.expect(dep.fromEvent.name).toBe('Assignment 1');
      t.expect(dep.toEvent.name).toBe('Assignment 6');
      t.expect(dep.fromSide).toBe('bottom');
      t.expect(dep.toSide).toBe('right');
    });
  }); // https://github.com/bryntum/support/issues/2323

  t.it('Should not generate error when hovering in/out of terminals', async t => {
    await t.moveCursorTo('.b-sch-event:textEquals(Assignment 1)');
    await t.dragTo('.b-sch-event:textEquals(Assignment 1) [data-side="right"]', '.b-sch-event:textEquals(Assignment 2)', null, null, null, true);
    await t.moveCursorTo('.b-sch-event:textEquals(Assignment 2) [data-side="right"]');
    await t.moveCursorTo('.b-sch-event:textEquals(Assignment 1)');
    await t.moveCursorTo('.b-sch-event:textEquals(Assignment 1) [data-side="right"]');
    await t.moveCursorBy([50, 0]);
  });
  t.it('Should include correct event params', async t => {
    scheduler.on({
      beforedependencycreatedrag({
        data,
        source
      }) {
        t.diag('beforedependencycreatedrag');
        t.is(source.name, 'Assignment 1', 'source param');
        t.is(data.source, source, 'Backwards compat');
      },

      dependencycreatedragstart({
        data,
        source
      }) {
        t.diag('dependencycreatedragstart');
        t.is(source.name, 'Assignment 1', 'source param');
        t.ok(data, 'Backwards compat');
      },

      dependencyValidationStart({
        data,
        source,
        target,
        dependencyType
      }) {
        t.diag('dependencyValidationStart');
        t.is(source.name, 'Assignment 1', 'source param');
        t.is(target.name, 'Assignment 2', 'target param');
        t.is(dependencyType, DependencyModelType.EndToStart, 'dependencyType param');
        t.ok(data, 'Backwards compat');
      },

      dependencyValidationComplete({
        data,
        source,
        target,
        dependencyType
      }) {
        t.diag('dependencyValidationComplete');
        t.is(source.name, 'Assignment 1', 'source param');
        t.is(target.name, 'Assignment 2', 'target param');
        t.is(dependencyType, DependencyModelType.EndToStart, 'dependencyType param');
        t.ok(data, 'Backwards compat');
      },

      dependencycreatedrop({
        data,
        source,
        target,
        dependency
      }) {
        t.diag('dependencycreatedrop');
        t.is(source.name, 'Assignment 1', 'source param');
        t.is(target.name, 'Assignment 2', 'target param');
        t.isInstanceOf(dependency, DependencyModel, 'dependency param');
        t.ok(data, 'Backwards compat');
      },

      afterDependencyCreateDrop({
        data,
        source,
        target,
        dependency
      }) {
        t.diag('afterDependencyCreateDrop');
        t.is(source.name, 'Assignment 1', 'source param');
        t.is(target.name, 'Assignment 2', 'target param');
        t.isInstanceOf(dependency, DependencyModel, 'dependency param');
        t.ok(data, 'Backwards compat');
      }

    });
    t.chain({
      moveCursorTo: '.b-sch-event:contains(Assignment 1)'
    }, {
      mousedown: '.b-sch-event:contains(Assignment 1) .b-sch-terminal-right'
    }, {
      moveCursorTo: '.b-sch-event:contains(Assignment 2)'
    }, {
      moveCursorTo: '.b-sch-event:contains(Assignment 2) .b-sch-terminal-left'
    }, {
      mouseup: null
    });
  });
  t.it('Should create a dependency after drop on event element, not on terminal', t => {
    scheduler.features.dependencies.allowDropOnEventBar = true;
    t.chain({
      moveCursorTo: '[data-event-id="1"]'
    }, {
      mousedown: '[data-event-id="1"] .b-sch-terminal-right'
    }, {
      moveCursorTo: '[data-event-id="2"]'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(To: Assignment 2)'
    }, {
      mouseUp: null
    }, () => {
      const dep = scheduler.dependencyStore.first;
      t.expect(dep.fromEvent.name).toBe('Assignment 1');
      t.expect(dep.toEvent.name).toBe('Assignment 2');
      t.expect(dep.type).toBe(2);
      t.expect(dep.fromSide).toBe('right');
      t.expect(dep.toSide).toBe('left');
    });
  });
  t.it('Should create a dependency after drop on event element if allowDropOnEventBar is set, with modifed default type', t => {
    DependencyModel.fieldMap.type.defaultValue = DependencyModelType.EndToEnd;
    scheduler.features.dependencies.allowDropOnEventBar = true;
    t.chain({
      moveCursorTo: '[data-event-id="1"]'
    }, {
      mousedown: '[data-event-id="1"] .b-sch-terminal-right'
    }, {
      moveCursorTo: '[data-event-id="2"]'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(To: Assignment 2)'
    }, {
      waitForSelector: '.b-sch-terminal[data-side=right].b-valid'
    }, {
      mouseUp: null
    }, () => {
      const dep = scheduler.dependencyStore.first;
      t.expect(dep.fromEvent.name).toBe('Assignment 1');
      t.expect(dep.toEvent.name).toBe('Assignment 2');
      t.expect(dep.type).toBe(DependencyModelType.EndToEnd);
      t.expect(dep.fromSide).toBe('right');
      t.expect(dep.toSide).toBe('right');
      DependencyModel.fieldMap.type.defaultValue = DependencyModelType.EndToStart;
    });
  });
  t.it('Should support async finalization using beforeDependencyCreateFinalize event', t => {
    scheduler.on('beforeDependencyCreateFinalize', async ({
      source,
      target,
      fromSide,
      toSide
    }) => {
      t.is(source.id, 1, 'Correct from task');
      t.is(target.id, 2, 'Correct to task');
      t.is(fromSide, 'right', 'Correct fromSide');
      t.is(toSide, 'left', 'Correct toSide');
      const result = await MessageDialog.confirm({
        title: 'Please confirm',
        message: 'Did you want to create?'
      }); // true to accept the drop or false to reject

      return result === MessageDialog.yesButton;
    });
    scheduler.features.dependencies.allowDropOnEventBar = true;
    t.chain({
      moveCursorTo: '[data-event-id="1"]'
    }, {
      mousedown: '[data-event-id="1"] .b-sch-terminal-right'
    }, {
      moveCursorTo: '[data-event-id="2"]'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(To: Assignment 2)'
    }, {
      mouseUp: null
    }, {
      click: 'button:contains(OK)'
    }, () => {
      const dep = scheduler.dependencyStore.first;
      t.expect(dep.fromEvent.name).toBe('Assignment 1');
      t.expect(dep.toEvent.name).toBe('Assignment 2');
      t.expect(dep.type).toBe(DependencyModelType.EndToStart);
      t.expect(dep.fromSide).toBe('right');
      t.expect(dep.toSide).toBe('left');
    });
  });
  t.it('Should create no dependencies when not dropping on a task', t => {
    t.wontFire(scheduler.dependencyStore, 'add');
    t.chain({
      moveCursorTo: '[data-event-id="1"]'
    }, {
      mousedown: '[data-event-id="1"] .b-sch-terminal-right'
    }, {
      moveCursorTo: '[data-event-id="2"]'
    }, {
      moveCursorTo: '[data-event-id="2"] .b-sch-terminal-right'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(To: Assignment 2)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip .b-header-title:textEquals(Valid)'
    }, {
      waitForSelector: '.b-sch-dependency-connector.b-valid'
    }, // Move cursor away from any task bar
    {
      moveCursorBy: [100, 0]
    }, // Should not show any target task, + mark as invalid
    {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:textEquals(To:)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip .b-header-title:textEquals(Invalid)'
    }, {
      waitForSelector: '.b-sch-dependency-connector:not(.b-valid)'
    }, // Back to valid target task, + mark as valid
    {
      moveCursorTo: '[data-event-id="2"]'
    }, {
      moveCursorTo: '[data-event-id="2"] .b-sch-terminal-right'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(To: Assignment 2)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip .b-header-title:textEquals(Valid)'
    }, {
      waitForSelector: '.b-sch-dependency-connector.b-valid'
    }, // Should not show any target task, + mark as invalid
    {
      moveCursorBy: [100, 0]
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:textEquals(To:)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip .b-header-title:textEquals(Invalid)'
    }, {
      waitForSelector: '.b-sch-dependency-connector:not(.b-valid)'
    }, {
      mouseUp: null
    }, {
      waitForSelectorNotFound: '.b-sch-dependency-creation-tooltip'
    });
  });
  t.it('Should mark drop position as invalid if not hovering a target terminal by default', t => {
    t.chain({
      moveCursorTo: '[data-event-id="1"]'
    }, {
      mousedown: '[data-event-id="1"] .b-sch-terminal-right'
    }, {
      moveCursorTo: '[data-event-id="2"]'
    }, {
      moveCursorTo: '[data-event-id="2"] .b-sch-terminal-right'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(To: Assignment 2)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip .b-header-title:textEquals(Valid)'
    }, {
      waitForSelector: '.b-sch-dependency-connector.b-valid'
    }, // Move cursor to center of task bar => invalid
    {
      moveCursorTo: '[data-event-id="2"]'
    }, // Should not show any target task, + mark as invalid
    {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:textEquals(To:)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip .b-header-title:textEquals(Invalid)'
    }, {
      waitForSelector: '.b-sch-dependency-connector:not(.b-valid)'
    }, // Back to valid terminal task => mark as valid
    {
      moveCursorTo: '[data-event-id="2"] .b-sch-terminal-right'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(From: Assignment 1)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip tr:contains(To: Assignment 2)'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip .b-header-title:textEquals(Valid)'
    }, {
      waitForSelector: '.b-sch-dependency-connector.b-valid'
    });
  }); // https://github.com/bryntum/support/issues/794

  t.it('Should align tooltip correctly at the start of creation', async t => {
    await t.moveCursorTo('[data-event-id="1"]');
    await t.dragBy({
      source: '[data-event-id="1"]  .b-sch-terminal-right',
      delta: [1, 1],
      dragOnly: true
    });
    t.isApprox(scheduler.features.dependencies.creationTooltip.x, t.currentPosition[0] + 10, 10, 'X ok');
    t.isApprox(scheduler.features.dependencies.creationTooltip.y, t.currentPosition[1] + 10, 10, 'Y ok');
  });
});