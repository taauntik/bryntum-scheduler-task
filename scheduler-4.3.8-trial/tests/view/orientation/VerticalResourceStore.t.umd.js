"use strict";

StartTest(t => {
  let scheduler, resourceStore;

  async function createScheduler(config) {
    scheduler = await t.getVerticalSchedulerAsync(Object.assign({
      resourceColumns: {
        fillWidth: false,
        fitWidth: false
      }
    }, config));
    resourceStore = scheduler.resourceStore;
  } // async beforeEach doesn't work in umd


  t.beforeEach(async (t, next) => {
    scheduler && scheduler.destroy();
    await createScheduler();
    next();
  });

  function assertEventElement(t, eventId, resourceId, x = null, y, width, height, msg = '') {
    const selector = `[data-resource-id="${resourceId}"][data-event-id="${eventId}"]:not(.b-released)`;

    if (x === null) {
      t.selectorNotExists(selector, `Element found for event ${eventId} ${msg}`);
    } else {
      const element = document.querySelector(selector),
            box = element && Rectangle.from(element, scheduler.timeAxisSubGridElement);

      if (element) {
        t.selectorExists(selector, `Element found for event ${eventId} ${msg}`);
        t.is(box.top, y, 'Correct top');
        t.is(box.left, x, 'Correct left');
        t.is(box.width, width, 'Correct width');
        t.is(box.height, height, 'Correct height');
      } else {
        t.fail(`Element for event ${eventId} not found`);
      }
    }
  }

  function assertHeaderElement(t, resourceId, left = null, msg = '') {
    const headerElement = document.querySelector(`.b-resourceheader-cell[data-resource-id="${resourceId}"]`);

    if (left === null) {
      t.notOk(headerElement, 'Header element not found ' + msg);
    } else {
      t.ok(headerElement, 'Header element found ' + msg);
      headerElement && t.isApprox(Rectangle.from(headerElement, scheduler.timeAxisSubGridElement).left, left, 0.5, 'At correct x');
    }
  }

  t.it('CRUD - Add', async t => {
    t.diag('Add in view');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 5,
        releaseEvent: 0
      },

      async during() {
        resourceStore.insert(0, {
          id: 'r100',
          name: 'Resource 100'
        });
        await scheduler.project.commitAsync();
      }

    });
    assertHeaderElement(t, 'r100', 0);
    assertEventElement(t, 1, 'r1', 150, 100, 75, 100);
    t.diag('Add outside of view');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 0,
        releaseEvent: 0
      },

      async during() {
        resourceStore.add({
          id: 'r101',
          name: 'Resource 101'
        });
        await scheduler.project.commitAsync();
      }

    });
    assertHeaderElement(t, 'r101');
    assertEventElement(t, 1, 'r1', 150, 100, 75, 100); // Did not move

    t.chain(next => {
      t.waitForEvent(scheduler, 'horizontalscroll', next);
      scheduler.scrollLeft = 1000;
    }, () => {
      assertHeaderElement(t, 'r101', 1500, 'after scroll');
    });
  });
  t.it('CRUD - Remove', async t => {
    t.diag('Remove from view');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 3,
        releaseEvent: 2
      },

      async during() {
        resourceStore.first.remove();
        await scheduler.project.commitAsync();
      }

    });
    assertHeaderElement(t, 'r1');
    assertEventElement(t, 1, 'r1');
    assertEventElement(t, 3, 'r2', 0, 300, 150, 200);
    t.diag('Remove from outside of view');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 0,
        releaseEvent: 0
      },

      async during() {
        resourceStore.remove('r9');
        await scheduler.project.commitAsync();
      }

    });
    scheduler.scrollLeft = 1000;
    await scheduler.await('horizontalscroll');
    assertHeaderElement(t, 'r9', null, ' after scroll');
    assertEventElement(t, 8, 'r9');
  });
  t.it('CRUD - Remove all', async t => {
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 0,
        releaseEvent: 5
      },

      async during() {
        resourceStore.removeAll();
        await scheduler.project.commitAsync();
      }

    });
    t.selectorNotExists('.b-sch-event-wrap:not(.b-released)', 'No event elements visible');
    t.selectorNotExists('.b-resourceheader-cell:not(b-released)', 'No resource headers visible');
  });
  t.it('CRUD - Update', async t => {
    t.diag('Update name in view');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 0,
        releaseEvent: 0
      },

      async during() {
        resourceStore.first.name = 'First';
      }

    });
    t.selectorExists('[data-resource-id="r1"]:contains(First)', 'Updated');
    t.diag('Update name outside of view');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 0,
        releaseEvent: 0
      },

      async during() {
        resourceStore.last.name = 'Last';
      }

    });
    scheduler.scrollResourceIntoView(resourceStore.last); // Need to wait for scroll event, events are updated by that

    await scheduler.await('horizontalscroll');
    t.selectorExists('[data-resource-id="r9"]:contains(Last)', 'Element found after scroll');
  }); // TODO: Nick

  t.it('CRUD - Replace', async t => {
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 0,
        releaseEvent: 0
      },

      async during() {
        resourceStore.add({
          id: 'r1',
          name: 'Replaced'
        });
        await scheduler.project.commitAsync();
      }

    });
    t.selectorExists('[data-resource-id="r1"]:contains(Replaced)', 'Updated');
  });
  t.it('CRUD - Changing id', async t => {
    scheduler.resourceStore.first.id = 'r5000';
    await t.waitForProjectReady(scheduler);
    t.selectorExists('.b-resourceheader-cell[data-resource-id="r5000"]:contains(Resource 1)', 'Header updated'); // Should be gone

    assertEventElement(t, 1, 'r1');
    assertEventElement(t, 2, 'r1'); // Should instead find

    assertEventElement(t, 1, 'r5000', 0, 100, 75, 100);
    assertEventElement(t, 2, 'r5000', 75, 150, 75, 200);
  });
  t.it('Filtering', async t => {
    t.diag('Applying filter');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 1,
        // Event on r4 moves to the left when r3 hides
        releaseEvent: 1 // Event on r3 hides

      },

      async during() {
        resourceStore.filter(r => ['r1', 'r2', 'r4'].includes(r.id));
      }

    });
    assertEventElement(t, 3, 'r2', 150, 300, 150, 200);
    assertEventElement(t, 4, 'r3');
    assertEventElement(t, 5, 'r4', 300, 650, 150, 100);
    assertHeaderElement(t, 'r1', 0);
    assertHeaderElement(t, 'r2', 150);
    assertHeaderElement(t, 'r4', 300);
    t.diag('Removing filters');
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 2,
        // Event on r4 moves to the right when r3 is shown + event on r3
        releaseEvent: 0
      },

      async during() {
        resourceStore.clearFilters();
      }

    });
    assertEventElement(t, 4, 'r3', 300, 500, 150, 250);
    assertHeaderElement(t, 'r1', 0);
    assertHeaderElement(t, 'r2', 150);
    assertHeaderElement(t, 'r3', 300);
    assertHeaderElement(t, 'r4', 450);
  }); // TODO: Nick

  t.it('Change ResourceStore', async t => {
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 1,
        releaseEvent: 4
      },

      async during() {
        scheduler.resourceStore = new ResourceStore({
          data: [{
            id: 'r2',
            name: 'New 1'
          }]
        });
        await scheduler.project.commitAsync();
      }

    });
    t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Single event visible');
    assertHeaderElement(t, 'r2', 0);
    assertEventElement(t, 3, 'r2', 0, 300, 150, 200);
  });
  t.it('Sorting', async t => {
    await t.firesOk({
      observable: scheduler,
      events: {
        renderEvent: 4,
        // r3 is unaffected by the sort, thus not 5
        releaseEvent: 0
      },

      async during() {
        scheduler.resourceStore.sort('location');
      }

    });
    t.chain(next => {
      assertHeaderElement(t, 'r8', 0);
      assertHeaderElement(t, 'r1', 150);
      assertHeaderElement(t, 'r3', 300);
      assertHeaderElement(t, 'r5', 450);
      assertHeaderElement(t, 'r7', 600);
      assertHeaderElement(t, 'r9', 750);
      assertHeaderElement(t, 'r2', 900);
      assertHeaderElement(t, 'r4', 1050);
      assertHeaderElement(t, 'r6'); // Out of view, not yet rendered

      scheduler.scrollResourceIntoView(scheduler.resourceStore.getById('r6'));
      next();
    }, {
      waitForEvent: [scheduler, 'horizontalscroll']
    }, () => {
      assertHeaderElement(t, 'r8'); // Out of view, released

      assertHeaderElement(t, 'r1', 150);
      assertHeaderElement(t, 'r3', 300);
      assertHeaderElement(t, 'r5', 450);
      assertHeaderElement(t, 'r7', 600);
      assertHeaderElement(t, 'r9', 750);
      assertHeaderElement(t, 'r2', 900);
      assertHeaderElement(t, 'r4', 1050);
      assertHeaderElement(t, 'r6', 1200);
    });
  });
  t.it('Grouping not yet supported', t => {
    t.throwsOk(() => {
      scheduler.resourceStore.group('location');
    }, 'Grouping of resources not supported in vertical mode');
  }); // https://github.com/bryntum/support/issues/2519

  t.it('Should clear view completely if filter includes no resources', async t => {
    await t.waitForSelector('.b-resourceheader-cell');
    scheduler.resourceStore.filter(() => false);
    t.selectorNotExists('.b-resourceheader-cell', 'No resources rendered');
    scheduler.resourceStore.clearFilters();
    t.selectorCountIs('.b-resourceheader', 1, 'Resource header rendered');
    t.selectorCountIs('.b-resourceheader-cell', 8, 'Resource cells rendered');
  }); // https://github.com/bryntum/support/issues/1158

  t.it('Should show empty text if no resources are present', async t => {
    await t.waitForSelector('.b-resourceheader-cell');
    t.selectorNotExists('.b-resourceheader.b-empty', 'Resource store not empty');
    scheduler.resourceStore.filter(() => false);
    t.selectorExists('.b-grid-empty', 'Resource store empty');
    scheduler.resourceStore.clearFilters();
    t.selectorNotExists('.b-grid-empty', 'Resource store not empty');
  });
});