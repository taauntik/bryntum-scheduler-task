"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    var _scheduler;

    (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
    scheduler = null;
  });

  async function setup(t, config = {}) {
    var _scheduler2;

    (_scheduler2 = scheduler) === null || _scheduler2 === void 0 ? void 0 : _scheduler2.destroy();
    scheduler = t.getScheduler(Object.assign({
      startDate: new Date(2018, 8, 20),
      endDate: new Date(2018, 9, 30),
      viewPreset: 'weekAndMonth',
      resources: [{
        id: 1
      }, {
        id: 2
      }],
      events: [{
        id: 1,
        resourceId: 1,
        startDate: new Date(2018, 8, 17),
        duration: 2,
        name: 'task 1'
      }, {
        id: 2,
        resourceId: 1,
        startDate: new Date(2018, 8, 24),
        duration: 2,
        name: 'task 2'
      }],
      dependencies: [{
        id: 1,
        from: 1,
        to: 2,
        type: 2
      }],
      features: {
        dependencies: {
          showTooltip: false
        },
        eventTooltip: false,
        dependencyEdit: true
      }
    }, config));
    await t.waitForProjectReady(scheduler);
  }

  function getSVGRect() {
    return t.query('.b-sch-foreground-canvas svg')[0].getBoundingClientRect();
  }

  function getLastPoint(t, selector) {
    const points = t.query(selector)[0].points;
    return points.getItem(points.numberOfItems - 1);
  }

  function getTaskRect(t, selector) {
    return t.query(selector)[0].getBoundingClientRect();
  } // #8730 https://app.assembla.com/spaces/bryntum/tickets/8730


  t.it('Should redraw dependency on dependency type change via data API', async t => {
    await setup(t);
    t.chain( // Waiting for dependencies to be drawn
    next => {
      if (t.query('.b-sch-dependency').length) {
        next();
      } else {
        scheduler.on({
          once: true,
          dependenciesDrawn: next
        });
      }
    }, // Checking that dependency arrow is to the left of task 2
    next => {
      const svgRect = getSVGRect(),
            lastPoint = getLastPoint(t, '.b-sch-foreground-canvas polyline[depId=1]'),
            taskRect = getTaskRect(t, 'div[data-event-id=2] .b-sch-event');
      t.isApproxPx(taskRect.left, svgRect.left + lastPoint.x, 0.6, 'Marker points to task 2 start');
      next();
    }, // Changing dependency type
    next => {
      const dependency = scheduler.dependencyStore.getById(1);
      dependency.type = DependencyBaseModel.Type.StartToEnd;
      scheduler.on({
        once: true,
        dependenciesDrawn: next
      });
    }, // Checking that dependency arrow is to the right of task 2
    () => {
      const svgRect = getSVGRect(),
            lastPoint = getLastPoint(t, '.b-sch-foreground-canvas polyline[depId=1]'),
            taskRect = getTaskRect(t, 'div[data-event-id=2] .b-sch-event');
      t.isApproxPx(svgRect.left + lastPoint.x, taskRect.right, 0.6, 'Marker points to task 2 end');
    });
  }); // #8730 https://app.assembla.com/spaces/bryntum/tickets/8730

  t.it('Should redraw dependency on dependency type change via editor with just created task', async t => {
    let dep = null;
    await setup(t);
    t.chain( // Waiting for dependencies to be drawn
    {
      waitForDependencies: null
    }, {
      diag: 'Creating new event'
    }, // Creating new event
    {
      drag: '.b-grid-row[data-index=0] .b-sch-timeaxis-cell',
      offset: [250, '50%'],
      by: [100, 0]
    }, {
      waitForSelector: '.b-eventeditor'
    }, {
      type: '123[ENTER]'
    }, {
      waitForSelectorNotFound: '.b-eventeditor'
    }, {
      diag: 'Creating new dependency'
    }, // Creating new dependency
    {
      moveCursorTo: '.b-sch-event-wrap[data-event-id=2]'
    }, {
      mouseDown: '.b-sch-terminal-right'
    }, {
      moveCursorTo: '.b-sch-event-wrap .b-sch-dirty-new'
    }, {
      mouseUp: '.b-sch-event-wrap .b-sch-dirty-new .b-sch-terminal-left'
    }, // Waiting for dependencies to be drawn
    {
      waitFor: () => document.querySelector(`[depId="${scheduler.dependencyStore.last.id}"]`)
    }, // Checking that dependency arrow is to the left of task 2
    next => {
      dep = scheduler.dependencyStore.last;
      const svgRect = getSVGRect(),
            lastPoint = getLastPoint(t, `.b-sch-foreground-canvas polyline[depId=${dep.id}]`),
            taskRect = getTaskRect(t, '.b-sch-event-wrap:contains(123) .b-sch-event');
      t.isApproxPx(taskRect.left, svgRect.left + lastPoint.x, 0.6, 'Marker points to task 2 start');
      scheduler.clearLog('dependenciesDrawn');
      next();
    }, {
      diag: 'Changing dependency type'
    }, // Changing dependency type
    {
      dblclick: dep
    }, {
      waitForSelector: '.b-popup .b-header-title:contains(Edit dependency)',
      desc: 'Popup shown'
    }, {
      click: '.b-icon-picker'
    }, {
      click: '.b-list-item:contains(Start to End)'
    }, {
      click: '.b-popup .b-button:contains(Save)'
    }, () => scheduler.await('dependenciesDrawn'), // Checking that dependency arrow is to the right of task 2
    () => {
      const svgRect = getSVGRect(),
            lastPoint = getLastPoint(t, `.b-sch-foreground-canvas polyline[depId=${dep.id}]`),
            taskRect = getTaskRect(t, '.b-sch-event-wrap:contains(123) .b-sch-event');
      t.isApproxPx(svgRect.left + lastPoint.x, taskRect.right, 0.6, 'Marker points to task 2 end');
    });
  });
});