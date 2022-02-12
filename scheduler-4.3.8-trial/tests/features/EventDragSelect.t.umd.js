"use strict";

StartTest({
  defaultTimeout: 90000
}, t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
  });

  async function getScheduler(config) {
    const scheduler = t.getScheduler(Object.assign({
      features: {
        eventDragCreate: false,
        eventDragSelect: true
      }
    }, config));
    await t.waitForProjectReady();
    return scheduler;
  }

  t.it('Should select events during drag', async t => {
    scheduler = await getScheduler({
      events: [{
        id: 1,
        cls: 'one',
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 7)
      }, {
        id: 2,
        cls: 'two',
        resourceId: 'r3',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 7)
      }]
    });
    t.willFireNTimes(scheduler, 'eventselectionchange', 3);
    t.chain({
      drag: '.two',
      fromOffset: ['0%-20', '100%+10'],
      by: [50, -50],
      dragOnly: true
    }, next => {
      t.is(scheduler.selectedEvents.length, 1);
      t.is(scheduler.selectedEvents[0].id, 2);
      next();
    }, {
      moveCursorTo: '.one'
    }, next => {
      t.is(scheduler.selectedEvents.length, 2);
      next();
    }, {
      moveCursorTo: '.two'
    }, next => {
      t.is(scheduler.selectedEvents.length, 1);
      t.is(scheduler.selectedEvents[0].id, 2);
      next();
    }, {
      mouseUp: null
    }, next => {
      t.is(scheduler.selectedEvents.length, 1);
      t.is(scheduler.selectedEvents[0].id, 2);
    });
  });
  t.it('Should deselect selected events during drag', async t => {
    scheduler = await getScheduler({
      events: [{
        id: 1,
        cls: 'one',
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 7)
      }, {
        id: 2,
        cls: 'two',
        resourceId: 'r3',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 7)
      }]
    });
    t.willFireNTimes(scheduler, 'eventselectionchange', 6);
    t.chain({
      drag: '.two',
      fromOffset: ['0%-20', '100%+10'],
      by: [50, -50],
      dragOnly: true
    }, next => {
      t.is(scheduler.selectedEvents.length, 1);
      t.is(scheduler.selectedEvents[0].id, 2);
      next();
    }, {
      moveCursorBy: [-50, 50]
    }, next => {
      t.is(scheduler.selectedEvents.length, 0);
      next();
    }, {
      mouseUp: null
    }, // Move the scheduler down and scroll the page:
    next => {
      scheduler.element.style['margin-top'] = '200px';
      DomHelper.up(scheduler.element, 'html').scrollTop = 150;
      next();
    }, // drag right to get both events and up well above the grid to test clipping of drag rect:
    {
      drag: '.two',
      fromOffset: ['0%-20', '100%+10'],
      by: [50, -175],
      dragOnly: true
    }, next => {
      const events = scheduler.selectedEvents.map(e => e.id).sort();
      t.expect(events).toEqual([1, 2]);
      const dragRect = scheduler.features.eventDragSelect.element.getBoundingClientRect();
      const gridRect = scheduler.timeAxisSubGrid.element.getBoundingClientRect(); // tops should match... give or take fractional pixels

      t.isApprox(dragRect.top, gridRect.top, 1, 'Drag can reach top of grid');
      next();
    }, {
      moveCursorBy: [-50, 50]
    }, next => {
      t.is(scheduler.selectedEvents.length, 0);
      next();
    }, {
      mouseUp: null
    });
  });
  t.it('Should support disabling', async t => {
    scheduler = await getScheduler({
      events: []
    });
    scheduler.features.eventDragSelect.disabled = true;
    t.chain({
      drag: '.b-sch-timeaxis-cell',
      by: [50, 50],
      dragOnly: true
    }, next => {
      t.selectorNotExists('.b-dragselect-rect', 'Not selecting');
      scheduler.features.eventDragSelect.disabled = false;
      next();
    }, {
      mouseUp: null
    }, {
      drag: '.b-sch-timeaxis-cell',
      by: [50, 50],
      dragOnly: true
    }, next => {
      t.selectorExists('.b-dragselect-rect', 'Selecting');
      next();
    }, {
      mouseUp: null
    });
  });
  t.it('Should not trigger selection when dragging outside schedule area', async t => {
    scheduler = await getScheduler({});
    t.wontFire(scheduler, 'eventselectionchange');
    t.chain({
      drag: '.b-grid-cell:contains(Mike)',
      by: [200, 100],
      dragOnly: true
    }, () => t.selectorNotExists('.b-dragselecting'));
  });
  t.it('Should focus last selected event on mouse up', async t => {
    scheduler = await getScheduler();
    t.chain({
      drag: '.b-sch-timeaxis-cell',
      by: [200, 100],
      offset: [5, 5]
    }, () => t.selectorExists('.b-sch-event-wrap.b-active:contains(Assignment 2)'));
  });
  t.it('Should be possible to click-select an event after a drag select with mouse up outside schedule element', async t => {
    scheduler = await getScheduler({});
    t.chain({
      drag: '.b-sch-timeaxis-cell',
      to: [6, 6],
      offset: [5, 5]
    }, {
      click: '.b-sch-event:contains(Assignment 1)'
    }, () => t.is(scheduler.selectedEvents.length, 1, '1 event selected'));
  });
});