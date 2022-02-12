"use strict";

StartTest(t => {
  const scheduler = bryntum.query('schedule'),
        grid = bryntum.query('unplannedgrid'),
        {
    resourceStore,
    eventStore
  } = scheduler; // Avoid scrolling triggered in test

  scheduler.timeAxisViewModel.forceFit = true;
  t.it('Should be able to drag a task from grid onto the schedule', t => {
    // Cell width is not equal to dragging event width so using fixed offset in pixels to check cursor position later
    const offsetPx = 10;
    t.chain({
      drag: '.b-grid-cell:textEquals(Fun task)',
      fromOffset: [offsetPx, '50%'],
      to: '.b-grid-row[data-index=4] .b-sch-timeaxis-cell',
      toOffset: ['50%', '50%'],
      dragOnly: true
    }, async () => {
      const el = document.querySelector(scheduler.eventSelector + '.b-dragging');
      t.isApproxPx(el.getBoundingClientRect().left - el.style.paddingLeft + offsetPx, t.currentPosition[0], 1, 'Proxy is at cursor');
    }, {
      mouseUp: null
    }, {
      waitForSelectorNotFound: '[data-ref=unplanned] .b-grid-row .b-grid-cell:textEquals(Fun task)'
    }, async () => {
      const maxim = resourceStore.getAt(4);
      t.is(maxim.events.length, 1);
      t.is(maxim.events[0].name, 'Fun task');
    }, {
      contextmenu: scheduler.eventSelector + ':contains(Fun task)'
    }, {
      click: '.b-menuitem:contains(Unassign)'
    }, {
      waitForSelector: '[data-ref=unplanned] .b-grid-row .b-grid-cell:textEquals(Fun task)'
    }, () => {
      const maxim = resourceStore.getAt(4);
      t.is(maxim.events.length, 0);
    });
  });
  t.it('Dropping on an existing event should work', t => {
    t.chain({
      waitForSelector: scheduler.eventSelector + '[data-event-id="r1"]'
    }, {
      drag: '.b-grid-cell:textEquals(Fun task)',
      fromOffset: ['5%', '50%'],
      to: scheduler.eventSelector + '[data-event-id="r1"]'
    }, () => {
      const arcady = resourceStore.first;
      t.is(arcady.events.length, 3, 'Arcady now assigned 3 events');
    });
  });
  t.it('Dragging to invalid place should have no side effect on data', t => {
    const store = grid.store;
    t.wontFire(store, 'change');
    t.chain({
      drag: '[data-ref=unplanned] .b-grid-cell',
      fromOffset: ['5%', '50%'],
      to: '.demo-header'
    });
  });
  t.it('Should reschedule tasks when there is an overlap (based on button pressed state)', t => {
    const droppedOnTask = eventStore.find(event => event.name.match('Conference')),
          startDate = droppedOnTask.startDate; // Trying to fix test, not sure why it does not reschedule

    scheduler.autoRescheduleTasks = true;
    t.firesOnce(eventStore, 'refreshPreCommit');
    t.wontFire(eventStore, 'addPreCommit', 'Should batch store changes'); // Removed `wontFire('update')`, since ending the batch makes engine normalize changes, which triggers 'update'

    const eventElCount = scheduler.timeAxisSubGridElement.querySelectorAll(scheduler.unreleasedEventSelector).length;
    t.chain({
      click: '.reschedule-button'
    }, {
      waitForSelector: scheduler.eventSelector + ':contains(Conference prep)'
    }, {
      // No longer redrawn from batch on `refresh`, but instead on following record updates
      waitForEvent: [eventStore, 'update'],
      trigger: {
        drag: '[data-ref=unplanned] .b-grid-cell:textEquals(Gym)',
        to: scheduler.eventSelector + ':contains(Conference prep)',
        fromOffset: ['5%', '50%'],
        toOffset: ['5%', '50%']
      }
    }, async () => {
      const draggedTask = eventStore.find(event => event.name === 'Gym');
      t.expect(draggedTask.startDate).toEqual(startDate);
      t.expect(droppedOnTask.startDate).toEqual(draggedTask.endDate); // https://app.assembla.com/spaces/bryntum/tickets/8663
      // No duplicate elements.

      t.selectorCountIs(scheduler.unreleasedEventSelector, scheduler.timeAxisSubGridElement, eventElCount + 1);
    }, {
      click: '.reschedule-button',
      desc: 'Restore button state'
    });
  });
  t.it('Should NOT reschedule tasks when there is an overlap if button is not pressed', t => {
    const droppedOnTask = eventStore.find(event => event.name.match('Arrange')); // For normalization

    t.firesOnce(eventStore, 'update');
    t.chain({
      waitForSelector: scheduler.eventSelector + ':contains(Arrange)'
    }, {
      drag: '[data-ref=unplanned] .b-grid-cell:contains(boring)',
      to: scheduler.eventSelector + ':contains(Arrange)',
      fromOffset: ['5%', '50%'],
      toOffset: ['5%', '50%']
    }, () => {
      const draggedTask = eventStore.find(event => event.name.match('boring'));
      t.expect(draggedTask.startDate).toEqual(droppedOnTask.startDate);
    });
  });
  t.it('Should scroll timeline when task is dragged from external grid', t => {
    t.chain(async () => {
      scheduler.timeAxisViewModel.forceFit = false;
      t.firesAtLeastNTimes(scheduler.timeAxisSubGrid.scrollable, 'scroll', 1);
    }, {
      drag: '[data-ref=unplanned] .b-grid-cell',
      to: '.b-scheduler',
      toOffset: ['100%-20', '50%'],
      dragOnly: true
    }, {
      waitFor: () => t.samePx(scheduler.timeAxisSubGrid.scrollable.x, scheduler.timeAxisSubGrid.scrollable.maxX)
    }, {
      mouseUp: null
    }, () => {
      // Restore for further tests
      scheduler.timeAxisViewModel.forceFit = true;
    });
  });
  t.it('Should use correct store & model classes', t => {
    t.ok(scheduler.eventStore.isTaskStore, 'Correct EventStore class');
    t.ok(scheduler.eventStore.modelClass.isTask, 'Correct EventStore modelClass');
    t.ok(grid.store.modelClass.isTask, 'Correct grid modelClass');
  }); // https://github.com/bryntum/support/issues/1464

  t.it('Unassigning new event should keep data', async t => {
    const count = grid.store.count;
    await t.doubleClick('[data-id="12"] .b-sch-timeaxis-cell');
    await t.click('button:textEquals(Save)');
    scheduler.eventStore.last.unassign();
    await t.waitFor(() => grid.store.count > count);
    t.is(grid.store.last.name, 'New event', 'Correct name on unassigned event');
    t.is(grid.store.last.duration, 1, 'Correct duration on unassigned event');
    t.is(grid.store.last.durationUnit, 'hour', 'Correct durationUnit on unassigned event');
  }); // https://github.com/bryntum/support/issues/1482

  t.it('Should show tooltip while dragging from the grid', async t => {
    await t.dragTo({
      source: '.b-grid-cell:textEquals(Book flight)',
      fromOffset: [10, '50%'],
      target: '.b-sch-timeaxis-cell',
      dragOnly: true,
      targetOffset: [200, 310]
    }); // Check the tooltip dates

    await t.waitForSelector('.b-sch-tooltip-startdate');
    await t.waitForSelector('.b-sch-tooltip-enddate');
    t.mouseUp(); // Check that tooltip is hidden

    await t.waitForSelectorNotFound('.b-sch-tooltip-startdate');
  });
  t.it('Should support dragging from grid in vertical mode', async t => {
    await t.click('.b-fa-arrows-alt-v');
    await t.waitForSelector('[data-id="verticalTimeAxisRow"]');
    await t.waitForSelector('.b-sch-event');
    const scheduler = bryntum.query('schedule'),
          gridCount = grid.store.count,
          schedulerCount = scheduler.eventStore.count;
    t.firesOnce(grid.store, 'remove');
    t.firesOnce(scheduler.eventStore, 'add');
    t.is(t.query('#main')[0].firstElementChild, scheduler.element, 'Scheduler is the first child');
    await t.dragTo({
      source: '[data-ref=unplanned] .b-grid-cell',
      target: '.b-sch-timeaxis-cell',
      targetOffset: [150, 250]
    });
    t.selectorNotExists('.b-dragging-event');
    t.waitFor(() => grid.store.count === gridCount - 1);
    t.pass('Correct record count after drop in Grid');
    t.waitFor(() => scheduler.eventStore.count === schedulerCount + 1);
    t.pass('Correct event count after drop in Scheduler');
  });
});