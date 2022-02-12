"use strict";

StartTest(t => {
  let scheduler, assignmentStore;

  async function createScheduler(config) {
    scheduler = await t.getVerticalSchedulerMultiAsync(Object.assign({
      resourceColumns: {
        fillWidth: false,
        fitWidth: false
      }
    }, config));
    assignmentStore = scheduler.assignmentStore;
  } // async beforeEach doesn't work in umd


  t.beforeEach(async (t, next) => {
    scheduler && scheduler.destroy();
    await createScheduler();
    next();
  });

  function assertEventElement(t, assignmentId, x = null, y, width, height, msg = '') {
    // Need to use scheduler.assignmentStore and not shortcut assignmentStore since one test creates a new store
    const assignment = typeof assignmentId !== 'object' ? scheduler.assignmentStore.getById(assignmentId) : assignmentId;
    let selector = `[data-event-id="${assignment.eventId}"][data-resource-id="${assignment.resourceId}"]:not(.b-released)`;

    if (typeof assignmentId !== 'object') {
      selector = `[data-sync-id="${assignmentId}"]${selector}`;
    }

    if (x === null) {
      t.selectorNotExists(selector, 'Element not found ' + msg);
    } else {
      t.selectorExists(selector, 'Element found ' + msg);
      const box = Rectangle.from(document.querySelector(selector), scheduler.timeAxisSubGridElement);
      t.is(box.top, y, 'Correct top');
      t.is(box.left, x, 'Correct left');
      t.is(box.width, width, 'Correct width');
      t.is(box.height, height, 'Correct height');
    }
  }

  t.it('Renders correctly using AssignmentStore', async t => {
    assertEventElement(t, 'a1', 0, 100, 75, 100);
    assertEventElement(t, 'a2', 75, 150, 75, 200);
    assertEventElement(t, 'a3', 0, 300, 75, 200);
    assertEventElement(t, 'a4', 0, 500, 150, 250);
    assertEventElement(t, 'a5', 150, 100, 75, 100);
    assertEventElement(t, 'a6', 225, 150, 75, 200);
    assertEventElement(t, 'a7', 300, 500, 75, 250);
    assertEventElement(t, 'a8', 375, 650, 75, 100);
    assertEventElement(t, 'a9');
    assertEventElement(t, 'a10', 450, 100, 150, 100);
    assertEventElement(t, 'a11');
    assertEventElement(t, 'a12');
    assertEventElement(t, 'a13');
    assertEventElement(t, 'a14');
    assertEventElement(t, 'a15');
  });
  t.it('Resolves element <-> record', t => {
    const element = document.querySelector('.b-sch-event-wrap .b-sch-event'),
          eventRecord = scheduler.resolveEventRecord(element),
          resourceRecord = scheduler.resolveResourceRecord(element),
          assignmentRecord = scheduler.resolveAssignmentRecord(element);
    t.is(eventRecord, scheduler.eventStore.first, 'Event record resolved from element');
    t.is(resourceRecord, scheduler.resourceStore.first, 'Resource record resolved from element');
    t.is(assignmentRecord, scheduler.assignmentStore.first, 'Assignment record resolved from element');
    const eventElement = scheduler.getElementFromEventRecord(eventRecord, resourceRecord),
          assignmentElement = scheduler.getElementFromAssignmentRecord(assignmentRecord);
    t.is(eventElement, element, 'Event element resolved from event record');
    t.is(assignmentElement, element, 'Event element resolved from assignment record');
  });
  t.it('CRUD - Add', async t => {
    t.diag('Add in view');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 1,
        releaseEvent: 0
      },

      async during() {
        assignmentStore.add({
          id: 'a100',
          resourceId: 'r5',
          eventId: 1
        });
        await t.waitForProjectReady();
      }

    });
    assertEventElement(t, 'a100', 600, 100, 150, 100);
    t.diag('Add outside of view');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 0,
        releaseEvent: 0
      },

      async during() {
        assignmentStore.add({
          id: 'a101',
          resourceId: 'r5',
          eventId: 6
        });
        await t.waitForProjectReady();
      }

    });
    assertEventElement(t, 'a101');
    scheduler.scrollTop = 1000;
    await scheduler.await('scroll');
    assertEventElement(t, 'a101', 600, 1250, 150, 100);
  });
  t.it('CRUD - Remove', async t => {
    t.diag('Remove from view');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 2,
        // Affects layout of event 2 & 3 also
        releaseEvent: 1
      },

      async during() {
        assignmentStore.first.remove();
        await t.waitForProjectReady();
      }

    });
    assertEventElement(t, {
      resourceId: 'r1',
      eventId: 1
    });
    assertEventElement(t, 'a2', 0, 150, 75, 200);
    t.diag('Remove from outside of view');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 0,
        releaseEvent: 0
      },

      async during() {
        assignmentStore.last.remove();
        await t.waitForProjectReady();
      }

    });
    scheduler.scrollLeft = 1000;
    await scheduler.await('horizontalscroll');
    assertEventElement(t, {
      resourceId: 9,
      eventId: 1
    });
  });
  t.it('CRUD - Remove all', async t => {
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 0,
        releaseEvent: 9
      },

      async during() {
        assignmentStore.removeAll();
        await t.waitForProjectReady();
      }

    });
    t.selectorNotExists('.b-sch-event-wrap:not(.b-released)', 'No event elements visible');
  });
  t.it('CRUD - Update', async t => {
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 4,
        // Event 2 & 3 from old location, 4 & self from new
        releaseEvent: 0
      },

      async during() {
        assignmentStore.first.eventId = 5;
        await t.waitForProjectReady();
      }

    });
    assertEventElement(t, 'a1', 75, 650, 75, 100);
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 2,
        // Event 4 from old location, self in new
        releaseEvent: 0
      },

      async during() {
        assignmentStore.first.resourceId = 'r2';
        await t.waitForProjectReady();
      }

    });
    assertEventElement(t, {
      resourceId: 'r1',
      eventId: 5
    });
    assertEventElement(t, 'a1', 150, 650, 150, 100);
  });
  t.it('CRUD - Replace', async t => {
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 3,
        // Event 2 & 3 from old location, self in new
        releaseEvent: 0
      },

      async during() {
        assignmentStore.add({
          id: 'a1',
          eventId: 5,
          resourceId: 'r2'
        });
        await t.waitForProjectReady();
      }

    });
    t.selectorNotExists('[data-assignment-id="a1"][data-resource-id="r1"][data-event-id="1"]', 'Old assignment gone from DOM');
    assertEventElement(t, 'a1', 150, 650, 150, 100);
  });
  t.it('CRUD - Changing id', async t => {
    scheduler.assignmentStore.first.id = 'a5000';
    await t.waitForProjectReady();
    t.selectorNotExists('[data-event-id="a1"]', 'Old id gone from DOM');
    assertEventElement(t, 'a5000', 0, 100, 75, 100);
  });
  t.it('Filtering', t => {
    t.diag('Applying filter to assignments');
    t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 0,
        releaseEvent: 2
      },

      during() {
        assignmentStore.filter(a => ['r1', 'r2', 'r4'].includes(a.resourceId));
      }

    });
    assertEventElement(t, 'a1', 0, 100, 75, 100);
    assertEventElement(t, 'a2', 75, 150, 75, 200);
    assertEventElement(t, 'a3', 0, 300, 75, 200);
    assertEventElement(t, 'a4', 0, 500, 150, 250);
    assertEventElement(t, 'a5', 150, 100, 75, 100);
    assertEventElement(t, 'a6', 225, 150, 75, 200);
    assertEventElement(t, 'a7');
    assertEventElement(t, 'a8');
    assertEventElement(t, 'a9');
    assertEventElement(t, 'a10', 450, 100, 150, 100);
    assertEventElement(t, 'a11');
    assertEventElement(t, 'a12');
    assertEventElement(t, 'a13');
    assertEventElement(t, 'a14');
    assertEventElement(t, 'a15');
    t.diag('Removing filters');
    t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 2,
        releaseEvent: 0
      },

      during() {
        assignmentStore.clearFilters();
      }

    });
    assertEventElement(t, 'a7', 300, 500, 75, 250);
    assertEventElement(t, 'a8', 375, 650, 75, 100);
    t.diag('Applying filter to resources');
    t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 1,
        // r4 moves to the left
        releaseEvent: 2
      },

      during() {
        scheduler.resourceStore.filter(r => ['r1', 'r2', 'r4'].includes(r.id));
      }

    });
    assertEventElement(t, 'a1', 0, 100, 75, 100);
    assertEventElement(t, 'a2', 75, 150, 75, 200);
    assertEventElement(t, 'a3', 0, 300, 75, 200);
    assertEventElement(t, 'a4', 0, 500, 150, 250);
    assertEventElement(t, 'a5', 150, 100, 75, 100);
    assertEventElement(t, 'a6', 225, 150, 75, 200);
    assertEventElement(t, 'a7');
    assertEventElement(t, 'a8');
    assertEventElement(t, 'a9');
    assertEventElement(t, 'a10', 300, 100, 150, 100);
    assertEventElement(t, 'a11');
    assertEventElement(t, 'a12');
    assertEventElement(t, 'a13');
    assertEventElement(t, 'a14');
    assertEventElement(t, 'a15');
  });
  t.it('Change AssignmentStore', async t => {
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 1,
        releaseEvent: 8
      },

      async during() {
        scheduler.assignmentStore = new AssignmentStore({
          data: [{
            id: 'a1',
            eventId: 1,
            resourceId: 'r6'
          }]
        });
        await t.waitForProjectReady();
      }

    });
    t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Single event visible');
    assertEventElement(t, 'a1', 750, 100, 150, 100);
  });
});