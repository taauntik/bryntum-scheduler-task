"use strict";

StartTest(t => {
  let scheduler, renderCount, releaseCount;
  t.beforeEach(t => {
    scheduler && !scheduler.isDestroyed && scheduler.destroy();
    renderCount = 0;
    releaseCount = 0;
  });

  async function getScheduler(config = {}) {
    scheduler = await t.getVerticalSchedulerAsync(Object.assign({
      listeners: {
        renderEvent() {
          renderCount++;
        },

        releaseEvent() {
          releaseCount++;
        }

      }
    }, config));
  }

  function assertEventElement(t, eventId, x = null, y = null, width = null, height = null, msg = '') {
    const selector = `[data-event-id="${eventId}"]:not(.b-released)`;

    if (x === null) {
      t.selectorNotExists(selector, `Element not found for ${eventId} ${msg}`);
    } else {
      const element = document.querySelector(selector);
      t.ok(element, `Element found for ${eventId} ${msg}`);
      const box = Rectangle.from(element, scheduler.timeAxisSubGridElement);
      t.isApprox(box.left, x, 2, 'Correct left');
      t.isApprox(box.top, y, 2, 'Correct top');
      t.isApprox(box.width, width, 2, 'Correct width');
      t.isApprox(box.height, height, 2, 'Correct height');
      t.contentLike(element, `Event ${eventId}`, 'Correct text');
    }
  }

  function assertHeaderElement(t, resourceId, left = null, msg = '') {
    const headerElement = document.querySelector(`.b-resourceheader-cell[data-resource-id="${resourceId}"]`);

    if (left === null) {
      t.notOk(headerElement, `Header element not found ${msg}`);
    } else {
      t.ok(headerElement, `Header element found ${msg}`);
      headerElement && t.is(Rectangle.from(headerElement, scheduler.timeAxisSubGridElement).left, left, 'At correct x');
    }
  }

  t.it('Initial render', async t => {
    await getScheduler();
    t.selectorCountIs(scheduler.eventSelector, 5, 'Five events rendered initially');
    t.is(renderCount, 5, 'Triggered 5 renderEvent initially');
    t.is(releaseCount, 0, 'Triggered 0 releaseEvent initially');
    assertEventElement(t, 1, 0, 100, 75, 100);
    assertEventElement(t, 2, 75, 150, 75, 200);
    assertEventElement(t, 3, 150, 300, 150, 200);
    assertEventElement(t, 4, 300, 500, 150, 250);
    assertEventElement(t, 5, 450, 650, 150, 100);
    assertEventElement(t, 6);
    assertEventElement(t, 7);
    assertEventElement(t, 8);
    assertHeaderElement(t, 'r1', 0);
    assertHeaderElement(t, 'r2', 150);
    assertHeaderElement(t, 'r3', 300);
    assertHeaderElement(t, 'r4', 450);
    assertHeaderElement(t, 'r5', 600);
    assertHeaderElement(t, 'r6', 750);
    assertHeaderElement(t, 'r7', 900);
    assertHeaderElement(t, 'r8', 1050);
    assertHeaderElement(t, 'r9');
  });
  t.it('Initial render with rendering after instantiation', async t => {
    await getScheduler({
      appendTo: null
    });
    scheduler.render(document.body);
    t.selectorCountIs(scheduler.eventSelector, 5, 'Five events rendered initially');
    t.is(renderCount, 5, 'Triggered 5 renderEvent initially');
    t.is(releaseCount, 0, 'Triggered 0 releaseEvent initially');
    assertEventElement(t, 1, 0, 100, 75, 100);
    assertEventElement(t, 2, 75, 150, 75, 200);
    assertEventElement(t, 3, 150, 300, 150, 200);
    assertEventElement(t, 4, 300, 500, 150, 250);
    assertEventElement(t, 5, 450, 650, 150, 100);
    assertEventElement(t, 6);
    assertEventElement(t, 7);
    assertEventElement(t, 8);
    assertHeaderElement(t, 'r1', 0);
    assertHeaderElement(t, 'r2', 150);
    assertHeaderElement(t, 'r3', 300);
    assertHeaderElement(t, 'r4', 450);
    assertHeaderElement(t, 'r5', 600);
    assertHeaderElement(t, 'r6', 750);
    assertHeaderElement(t, 'r7', 900);
    assertHeaderElement(t, 'r8', 1050);
    assertHeaderElement(t, 'r9');
  }); // https://app.assembla.com/spaces/bryntum/tickets/8972-crash-in-vertical-mode-if-a-resource-has-no-name-defined/details#

  t.it('Should not crash if a resource has no name', async t => {
    await getScheduler({
      resourceImagePath: './',
      resources: [{}]
    });
    t.pass('rendered ok');
  });
  t.it('Scrolling vertically', async t => {
    await getScheduler();
    scheduler.scrollTop = 1000; // Need to wait for scroll event, events are updated by that

    await scheduler.await('scroll');
    t.selectorCountIs(scheduler.eventSelector + ':not(.b-released)', 2, 'Two events rendered after scroll');
    assertEventElement(t, 1);
    assertEventElement(t, 2);
    assertEventElement(t, 3);
    assertEventElement(t, 4);
    assertEventElement(t, 5);
    assertEventElement(t, 6, 0, 1250, 150, 100);
    assertEventElement(t, 7, 0, 1500, 150, 100);
    assertEventElement(t, 8);
    assertHeaderElement(t, 'r1', 0);
    assertHeaderElement(t, 'r2', 150);
    assertHeaderElement(t, 'r3', 300);
    assertHeaderElement(t, 'r4', 450);
    assertHeaderElement(t, 'r5', 600);
    assertHeaderElement(t, 'r6', 750);
    assertHeaderElement(t, 'r7', 900);
    assertHeaderElement(t, 'r8', 1050);
    assertHeaderElement(t, 'r9');
  });
  t.it('Scrolling horizontally', async t => {
    await getScheduler();
    scheduler.scrollTop = 1000;
    await scheduler.await('scroll');
    scheduler.scrollLeft = 1000;
    await scheduler.await('horizontalscroll');
    t.selectorCountIs(scheduler.eventSelector + ':not(.b-released)', 1, 'One event rendered after scroll');
    t.is(renderCount, 8, 'All 8 events rendered once along the way');
    t.is(releaseCount, 7, '7 of them released');
    assertEventElement(t, 1);
    assertEventElement(t, 2);
    assertEventElement(t, 3);
    assertEventElement(t, 4);
    assertEventElement(t, 5);
    assertEventElement(t, 6);
    assertEventElement(t, 7);
    assertEventElement(t, 8, 1200, 1500, 150, 100);
    assertHeaderElement(t, 'r1');
    assertHeaderElement(t, 'r2', 150);
    assertHeaderElement(t, 'r3', 300);
    assertHeaderElement(t, 'r4', 450);
    assertHeaderElement(t, 'r5', 600);
    assertHeaderElement(t, 'r6', 750);
    assertHeaderElement(t, 'r7', 900);
    assertHeaderElement(t, 'r8', 1050);
    assertHeaderElement(t, 'r9', 1200);
  });
  t.it('Resizing viewport', async t => {
    await getScheduler();
    t.chain(next => {
      t.diag('Going small');
      t.waitForGridEvent(scheduler, 'timelineViewportResize', next);
      t.setWindowSize(200, 200);
    }, {
      waitForSelectorNotFound: '[data-event-id="3"]:not(.b-released)'
    }, next => {
      assertEventElement(t, 1, 0, 100, 75, 100);
      assertEventElement(t, 2, 75, 150, 75, 200);
      assertEventElement(t, 3);
      assertEventElement(t, 4);
      assertEventElement(t, 5);
      assertEventElement(t, 6);
      assertEventElement(t, 7);
      assertEventElement(t, 8);
      assertEventElement(t, 1, 0, 100, 75, 100);
      assertEventElement(t, 2, 75, 150, 75, 200);
      assertEventElement(t, 3);
      assertEventElement(t, 4);
      assertEventElement(t, 5);
      assertEventElement(t, 6);
      assertEventElement(t, 7);
      assertEventElement(t, 8);
      t.diag('Going big');
      t.waitForGridEvent(scheduler, 'timelineViewportResize', next);
      t.setWindowSize(1024, 768);
    }, {
      waitForSelector: '[data-event-id="3"]:not(.b-released)'
    }, () => {
      assertEventElement(t, 1, 0, 100, 75, 100);
      assertEventElement(t, 2, 75, 150, 75, 200);
      assertEventElement(t, 3, 150, 300, 150, 200);
      assertEventElement(t, 4, 300, 500, 150, 250);
      assertEventElement(t, 5, 450, 650, 150, 100);
      assertEventElement(t, 6);
      assertEventElement(t, 7);
      assertEventElement(t, 8);
      assertHeaderElement(t, 'r1', 0);
      assertHeaderElement(t, 'r2', 150);
      assertHeaderElement(t, 'r3', 300);
      assertHeaderElement(t, 'r4', 450);
      assertHeaderElement(t, 'r5', 600);
      assertHeaderElement(t, 'r6', 750);
      assertHeaderElement(t, 'r7', 900);
      assertHeaderElement(t, 'r8', 1050);
      assertHeaderElement(t, 'r9');
    });
  });
  t.it('Extending timespan', async t => {
    await getScheduler();
    t.diag('Extending end');
    scheduler.setTimeSpan(new Date(2019, 5, 1), new Date(2019, 7, 1));
    t.isApprox(scheduler.timeAxisSubGridElement.offsetHeight, 3501, 'Correct height');
    scheduler.scrollable.y = scheduler.scrollable.maxY;
    await scheduler.await('scroll');
    assertEventElement(t, 1001, 0, 2750, 150, 100);
    t.diag('Extending start');
    scheduler.setTimeSpan(new Date(2019, 4, 1), new Date(2019, 7, 1));
    t.isApprox(scheduler.timeAxisSubGridElement.offsetHeight, 4900, 'Correct height');
    scheduler.scrollable.y = 0;
    await scheduler.await('scroll');
    assertEventElement(t, 1000, 0, 600, 150, 100);
  });
  t.it('Complex scenario', async t => {
    await getScheduler({
      eventStyle: 'border',
      events: [{
        id: 1,
        name: 'Event 1',
        resourceId: 'r1',
        startDate: new Date(2019, 4, 27),
        duration: 8
      }, {
        id: 2,
        name: 'Event 2',
        resourceId: 'r1',
        startDate: new Date(2019, 4, 28),
        duration: 9
      }, {
        id: 3,
        name: 'Event 3',
        resourceId: 'r1',
        startDate: new Date(2019, 4, 29),
        duration: 5
      }, {
        id: 4,
        name: 'Event 4',
        resourceId: 'r1',
        startDate: new Date(2019, 5, 3),
        duration: 7
      }]
    });
    assertEventElement(t, 1, 0, 50, 50, 400);
    assertEventElement(t, 2, 50, 100, 50, 450);
    assertEventElement(t, 3, 100, 150, 50, 250);
    assertEventElement(t, 4, 100, 400, 50, 350);
  });
  t.it('Complex scenario, with barMargin', async t => {
    await getScheduler({
      barMargin: 5,
      events: [{
        id: 1,
        name: 'Event 1',
        resourceId: 'r1',
        startDate: new Date(2019, 4, 27),
        duration: 8
      }, {
        id: 2,
        name: 'Event 2',
        resourceId: 'r1',
        startDate: new Date(2019, 4, 28),
        duration: 9
      }, {
        id: 3,
        name: 'Event 3',
        resourceId: 'r1',
        startDate: new Date(2019, 4, 29),
        duration: 5
      }, {
        id: 4,
        name: 'Event 4',
        resourceId: 'r1',
        startDate: new Date(2019, 5, 3),
        duration: 7
      }]
    });
    assertEventElement(t, 1, 5, 50, 43, 400);
    assertEventElement(t, 2, 53, 100, 43, 450);
    assertEventElement(t, 3, 101, 150, 43, 250);
    assertEventElement(t, 4, 101, 400, 43, 350);
  }); // pack is the default and tested in all other tests, no need to test here again...

  t.it('eventLayout: none', async t => {
    await getScheduler({
      eventLayout: 'none'
    });
    assertEventElement(t, 1, 0, 100, 150, 100);
    assertEventElement(t, 2, 0, 150, 150, 200); // Should not change

    assertEventElement(t, 3, 150, 300, 150, 200); // Should not change

    scheduler.eventStore.first.resourceId = 'r2';
    scheduler.eventStore.first.startDate = new Date(2019, 4, 31);
    await t.waitForProjectReady();
    assertEventElement(t, 1, 150, 250, 150, 100);
    assertEventElement(t, 2, 0, 150, 150, 200);
    assertEventElement(t, 3, 150, 300, 150, 200);
  });
  t.it('eventLayout: mixed', async t => {
    t.diag('Initial');
    await getScheduler({
      eventLayout: 'mixed'
    }); // E1 & E2 overlaps

    assertEventElement(t, 1, 0, 100, 150, 100);
    assertEventElement(t, 2, 15, 150, 135, 200);
    assertEventElement(t, 3, 150, 300, 150, 200);
    t.diag('Overlap');
    scheduler.eventStore.first.resourceId = 'r2';
    scheduler.eventStore.first.startDate = new Date(2019, 4, 31);
    await scheduler.project.commitAsync(); // E1 & E3 overlaps

    assertEventElement(t, 1, 150, 250, 150, 100);
    assertEventElement(t, 2, 0, 150, 150, 200);
    assertEventElement(t, 3, 165, 300, 135, 200);
    t.diag('Pack');
    scheduler.eventStore.getAt(1).resourceId = 'r2';
    await scheduler.project.commitAsync(); // All 3 overlaps = pack

    assertEventElement(t, 1, 200, 250, 50, 100);
    assertEventElement(t, 2, 150, 150, 50, 200);
    assertEventElement(t, 3, 250, 300, 50, 200);
    t.diag('Overlap');
    scheduler.eventStore.getAt(2).remove();
    await scheduler.project.commitAsync(); // Back to overlap

    assertEventElement(t, 1, 165, 250, 135, 100);
    assertEventElement(t, 2, 150, 150, 150, 200);
    assertEventElement(t, 3);
  });
  t.it('resourceMargin', async t => {
    t.it('Only resourceMargin', async t => {
      await getScheduler({
        resourceMargin: 10
      });
      assertEventElement(t, 1, 10, 100, 65, 100);
      assertEventElement(t, 2, 75, 150, 65, 200);
      assertEventElement(t, 3, 160, 300, 130, 200);
    });
    t.it('resourceMargin + barMargin', async t => {
      await getScheduler({
        resourceMargin: 10,
        barMargin: 5
      });
      assertEventElement(t, 1, 10, 100, 62.5, 100);
      assertEventElement(t, 2, 77.5, 150, 62.5, 200);
      assertEventElement(t, 3, 160, 300, 130, 200);
    });
  });
  t.it('Should adjust canvas height when suppressing fit and not filling height', async t => {
    await getScheduler({
      startDate: new Date(2019, 4, 28, 7),
      // 3 ticks
      endDate: new Date(2019, 4, 28, 10),
      viewPreset: 'hourAndDay',
      tickSize: 80,
      suppressFit: true
    });
    t.is(scheduler.foregroundCanvas.offsetHeight, 3 * 80, 'Canvas has correct height');
    scheduler.tickSize = 100;
    t.is(scheduler.foregroundCanvas.offsetHeight, 3 * 100, 'Canvas has correct height');
  }); // https://github.com/bryntum/support/issues/2501

  t.it('Should stretch foreground canvas to 100% of width', async t => {
    await getScheduler({
      resources: []
    });
    t.hasApproxWidth('.b-sch-foreground-canvas', scheduler.timeAxisSubGrid.width, 'Foreground canvas sized ok');
  });
  t.it('Should return visible resources', async t => {
    await getScheduler({
      width: 500
    });
    t.isDeeply(scheduler.visibleResources, {
      first: scheduler.resourceStore.first,
      last: scheduler.resourceStore.getAt(2)
    }, 'All resources visible');
    scheduler.width = 200;
    await t.waitFor(() => scheduler.visibleResources.first === scheduler.visibleResources.last);
    t.isDeeply(scheduler.visibleResources, {
      first: scheduler.resourceStore.first,
      last: scheduler.resourceStore.first
    }, 'First resource visible only');
    scheduler.scrollLeft = 5000;
    await t.waitFor(() => scheduler.visibleResources.first === scheduler.resourceStore.last);
    t.isDeeply(scheduler.visibleResources, {
      first: scheduler.resourceStore.last,
      last: scheduler.resourceStore.last
    }, 'Last resource visible only');
  }); // https://github.com/bryntum/support/issues/3254

  t.it('Should support fillWidth config when loading remote data', async t => {
    t.mockUrl('data', {
      delay: 100,
      responseText: JSON.stringify({
        success: true,
        resources: {
          rows: [{
            id: 1,
            name: 'Mike'
          }]
        }
      })
    });
    await t.getScheduler({
      mode: 'vertical',
      crudManager: {
        autoLoad: true,
        transport: {
          load: {
            url: 'data'
          }
        }
      },
      resourceColumns: {
        fillWidth: true
      }
    });
    await t.waitForSelector('.b-resourceheader-cell');
    await t.waitForSelector('.b-sch-timeaxis-cell');
    t.isApprox(t.rect('.b-resourceheader').width, t.rect('.b-timeaxissubgrid').width, 'Column stretched ok');
  }); // https://github.com/bryntum/support/issues/3254

  t.it('Should support fitWidth config when loading remote data', async t => {
    t.mockUrl('data', {
      delay: 100,
      responseText: JSON.stringify({
        success: true,
        resources: {
          rows: [{
            id: 1,
            name: 'Mike'
          }]
        }
      })
    });
    await t.getScheduler({
      mode: 'vertical',
      crudManager: {
        autoLoad: true,
        transport: {
          load: {
            url: 'data'
          }
        }
      },
      resourceColumns: {
        fitWidth: true
      }
    });
    await t.waitForSelector('.b-resourceheader-cell');
    await t.waitForSelector('.b-sch-timeaxis-cell');
    t.isApprox(t.rect('.b-resourceheader').width, t.rect('.b-timeaxissubgrid').width, 'Column stretched ok');
  });
});