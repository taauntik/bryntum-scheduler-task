"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    scheduler && scheduler.destroy();
  });

  async function waitForHeader(t, resourceId, left) {
    await t.waitFor(() => {
      const headerElement = document.querySelector(`.b-resourceheader-cell[data-resource-id="${resourceId}"]:not(.b-released)`),
            box = Rectangle.from(headerElement, scheduler.timeAxisColumn.element);
      return Math.abs(box.left - left) <= 1;
    });
  }

  function assertHeaderElement(t, resourceId, left = null, width) {
    const headerElement = document.querySelector(`.b-resourceheader-cell[data-resource-id="${resourceId}"]:not(.b-released)`);

    if (left === null) {
      t.notOk(headerElement, 'Header element not found for ' + resourceId);
    } else {
      const resourceRecord = scheduler.resourceStore.getById(resourceId);
      t.ok(headerElement, 'Header element found for ' + resourceId);
      const box = Rectangle.from(headerElement, scheduler.timeAxisColumn.element);
      t.isApproxPx(box.left, left, 1, 'At correct x');
      t.isApproxPx(box.width, width, 1, 'Correct width');
      t.contentLike(headerElement, resourceRecord.name, 'Correct text');
    }
  }

  function assertEventElement(t, eventId, x = null, y, width, height) {
    const selector = `[data-event-id="${eventId}"]:not(.b-released)`;

    if (x === null) {
      t.selectorNotExists(selector, 'Element not found for event ' + eventId);
    } else {
      const element = document.querySelector(selector);
      t.ok(element, 'Element found for event ' + eventId);
      const box = Rectangle.from(element, scheduler.timeAxisSubGridElement);
      t.isApproxPx(box.x, x, 1, 'Correct x');
      t.isApproxPx(box.y, y, 1, 'Correct y');
      t.isApproxPx(box.width, width, 1, 'Correct width');
      t.isApproxPx(box.height, height, 1, 'Correct height');
    }
  }

  t.it('Initial render', async t => {
    scheduler = await t.getVerticalSchedulerAsync(); // 8 initially visible

    for (let i = 0; i < 8; i++) {
      assertHeaderElement(t, 'r' + (i + 1), i * 150, 150);
    } // 2 not visible = not rendered


    for (let i = 8; i < 10; i++) {
      assertHeaderElement(t, 'r' + (i + 1));
    }
  });
  t.it('Scrolled view', async t => {
    scheduler = await t.getVerticalSchedulerAsync();
    scheduler.scrollLeft = 1000;
    await scheduler.await('horizontalscroll');
    assertHeaderElement(t, 'r1'); // the rest visible

    for (let i = 1; i < 9; i++) {
      assertHeaderElement(t, 'r' + (i + 1), i * 150, 150);
    }
  });
  t.it('Displaying icon', async t => {
    scheduler = await t.getVerticalSchedulerAsync({
      resources: [{
        id: 'r1',
        iconCls: 'b-fa b-fa-bus',
        name: 'Bus'
      }, {
        id: 'r2',
        iconCls: 'b-fa b-fa-car',
        name: 'Car'
      }]
    });
    t.selectorExists('[data-resource-id="r1"] i.b-fa-bus', 'Icon applied to header 1');
    t.selectorExists('[data-resource-id="r2"] i.b-fa-car', 'Icon applied to header 2');
    scheduler.resourceStore.first.iconCls = 'b-fa b-fa-truck';
    t.selectorExists('[data-resource-id="r1"] i.b-fa-truck', 'Icon changed for header 1');
  });
  t.it('columnWidth config', async t => {
    scheduler = await t.getVerticalSchedulerAsync({
      resourceColumns: {
        columnWidth: 50,
        fillWidth: false
      }
    });
    assertHeaderElement(t, 'r2', 50, 50);
    assertEventElement(t, 1, 0, 100, 25, 100);
    scheduler.resourceColumns.columnWidth = 100;
    assertHeaderElement(t, 'r2', 100, 100);
    assertEventElement(t, 1, 0, 100, 50, 100);
  });
  t.it('headerRenderer config, altering config object', async t => {
    const calledFor = [];
    scheduler = await t.getVerticalSchedulerAsync({
      resourceColumns: {
        headerRenderer({
          elementConfig,
          resourceRecord
        }) {
          elementConfig.html = `R${resourceRecord.id}`;
          elementConfig.style.backgroundColor = 'rgb(0,0,255)';
          calledFor.push(resourceRecord);
        }

      }
    });
    t.isDeeply(calledFor, scheduler.resourceStore.getRange(0, 8), 'Called for correct resources');
    const headerEl = document.querySelector('.b-resourceheader-cell[data-resource-id="r5"]');
    t.is(headerEl.innerText, 'Rr5', 'Correct text');
    t.is(DomHelper.getStyleValue(headerEl, 'backgroundColor'), 'rgb(0, 0, 255)', 'Correct custom style applied');
    t.is(DomHelper.getStyleValue(headerEl, 'left'), '600px', 'Correct original style applied');
  });
  t.it('headerRenderer config, as template', async t => {
    scheduler = await t.getVerticalSchedulerAsync({
      resourceColumns: {
        headerRenderer: ({
          resourceRecord
        }) => `<div>${resourceRecord.id}</div>`
      }
    });
    const headerEl = document.querySelector('.b-resourceheader-cell[data-resource-id="r5"]');
    t.is(headerEl.innerHTML, '<div>r5</div>', 'Correct html');
  });
  t.it('Filling available width', async t => {
    t.setWindowSize(1024 + DomHelper.scrollBarWidth, 768);
    scheduler = await t.getVerticalSchedulerAsync({
      resources: [{
        id: 'r1',
        name: 'Resource 1'
      }, {
        id: 'r2',
        name: 'Resource 2'
      }, {
        id: 'r3',
        name: 'Resource 3'
      }, {
        id: 'r4',
        name: 'Resource 4'
      }, {
        id: 'r5',
        name: 'Resource 5'
      }]
    });
    t.diag('Fitting to 1024'); //////////////////////////

    assertHeaderElement(t, 'r2', 184, 184);
    assertEventElement(t, 3, 184, 300, 184, 200);
    t.chain( // FFs ResizeObserver seems to be triggered async somehow, have to give it time to settle
    {
      waitFor: 100
    }, next => {
      t.diag('Fitting to 1200');
      t.waitForGridEvent(scheduler, 'timelineViewportResize', next);
      t.setWindowSize(1200 + DomHelper.scrollBarWidth, 768);
    }, async () => {
      //scheduler.resourceColumns.refreshWidths();
      await waitForHeader(t, 'r2', 219); // Wait for animation frame to get rid of Safari ResizeObserver exception
      //await t.animationFrame();

      assertHeaderElement(t, 'r2', 219, 219);
      assertEventElement(t, 3, 219, 300, 219, 200);
      scheduler.resourceColumns.columnWidth = 100;
    }, next => {
      t.diag('Fitting to 400'); /////////////////////////
      // For FFs ResizeObserver to not get mad...

      t.waitForGridEvent(scheduler, 'timelineViewportResize', next);
      t.setWindowSize(400, 768);
    }, next => {
      assertHeaderElement(t, 'r2', 100, 100);
      assertEventElement(t, 3, 100, 300, 100, 200); // For FFs ResizeObserver to not get mad...

      t.waitForGridEvent(scheduler, 'timelineViewportResize', next);
      t.setWindowSize(1024, 768);
    });
  });
  t.it('Toggling fillWidth', async t => {
    t.setWindowSize(1024 + DomHelper.scrollBarWidth, 768);
    scheduler = await t.getVerticalSchedulerAsync({
      resourceColumns: {
        fillWidth: false
      },
      resources: [{
        id: 'r1',
        name: 'Resource 1'
      }, {
        id: 'r2',
        name: 'Resource 2'
      }, {
        id: 'r3',
        name: 'Resource 3'
      }, {
        id: 'r4',
        name: 'Resource 4'
      }, {
        id: 'r5',
        name: 'Resource 5'
      }]
    });
    assertHeaderElement(t, 'r2', 150, 150);
    scheduler.resourceColumns.fillWidth = true;
    assertHeaderElement(t, 'r2', 184, 184);
    scheduler.resourceColumns.fillWidth = false;
    assertHeaderElement(t, 'r2', 150, 150);
    t.setWindowSize(1024, 768);
  });
  t.it('Fitting available width', async t => {
    t.setWindowSize(1024 + DomHelper.scrollBarWidth, 768);
    scheduler = await t.getVerticalSchedulerAsync({
      resourceColumns: {
        fitWidth: true
      }
    });
    t.diag('Initial');
    assertHeaderElement(t, 'r9', 817, 102);
    assertEventElement(t, 3, 102, 300, 102, 200);
    t.diag('Removed one');
    scheduler.resourceStore.first.remove();
    await t.waitForProjectReady();
    assertHeaderElement(t, 'r9', 798, 114);
    assertEventElement(t, 3, 0, 300, 114, 200);
    t.diag('Added two');
    scheduler.resourceStore.add([{
      id: 'r10',
      name: 'Resource 10'
    }, {
      id: 'r11',
      name: 'Resource 11'
    }]);
    await t.waitForProjectReady();
    assertHeaderElement(t, 'r11', 819, 91);
    assertEventElement(t, 4, 91, 500, 91, 250);
    t.diag('Filtered');
    scheduler.resourceStore.filter(r => parseInt(r.id.substring(1)) < 10);
    assertHeaderElement(t, 'r9', 798, 114);
    assertEventElement(t, 3, 0, 300, 114, 200);
    t.setWindowSize(1024, 768);
  });
  t.it('Toggling fitWidth', async t => {
    t.setWindowSize(1024 + DomHelper.scrollBarWidth, 768);
    scheduler = await t.getVerticalSchedulerAsync({
      resourceColumns: {
        fillWidth: false,
        fitWidth: false
      }
    });
    assertHeaderElement(t, 'r2', 150, 150);
    scheduler.resourceColumns.fitWidth = true;
    assertHeaderElement(t, 'r2', 102, 102);
    scheduler.resourceColumns.fitWidth = false;
    assertHeaderElement(t, 'r2', 150, 150);
    t.setWindowSize(1024, 768);
  }); // CRUD is asserted elsewhere

  t.it('Should not instantly reload images with invalid resourceImagePath or defaultResourceImageName', async t => {
    let errorCount = 0;
    EventHelper.on({
      element: window,
      error: () => errorCount++,
      capture: true
    });

    const checkResourceImages = (resourceImagePath, defaultResourceImageName, resourceImageExtension, resourceName, checkImageName, expectedNbrOfErrorEvents) => [async () => {
      errorCount = 0;
      scheduler = await t.getVerticalSchedulerAsync({
        resources: [{
          name: resourceName
        }],
        defaultResourceImageName,
        resourceImagePath,
        resourceImageExtension
      });
      t.diag(`path="${resourceImagePath}" default="${defaultResourceImageName}" extension="${resourceImageExtension}" name="${resourceName}" => ${expectedNbrOfErrorEvents} error(s)`);
    }, // If both the resource image and default image fail to load, we show resource initials
    expectedNbrOfErrorEvents === 2 || !defaultResourceImageName && expectedNbrOfErrorEvents === 1 ? {
      waitForSelector: `.b-resource-initials:contains(${resourceName[0]})`
    } : {
      waitForSelector: `img[src="${checkImageName}"]`,
      desc: `${checkImageName} image found`
    }, {
      waitFor: () => errorCount === expectedNbrOfErrorEvents,
      desc: `Expected amount of errors = ${expectedNbrOfErrorEvents}`
    }, async () => {
      scheduler.destroy();
      scheduler = null;
    }]; // Each resource tries to load image by name and if it fails then loads default one
    // Error count depends on name image and default image existence


    const validPath = '../examples/_shared/images/users/';
    t.chain(checkResourceImages(validPath, 'none.png', '.jpg', 'Kate', validPath + 'kate.jpg', 0), checkResourceImages(validPath, 'none.png', '.png', 'Kate', validPath + 'none.png', 1), checkResourceImages(validPath, 'none.png', '.jpg', 'Foo', validPath + 'none.png', 1), checkResourceImages(validPath, 'bad.jpg', '.jpg', 'Foo', validPath + 'bad.jpg', 2), checkResourceImages('', 'none.png', '.jpg', 'Foo', '/none.png', 2), checkResourceImages('..', 'none.png', '.jpg', 'Foo', '../none.png', 2), checkResourceImages('../', 'none.png', '.jpg', 'Foo', '../none.png', 2), checkResourceImages(validPath, 'none.jpg', '.png', 'None', validPath + 'none.png', 0), checkResourceImages('', null, '.png', 'Foo', '/foo.png', 1), checkResourceImages('', undefined, '.png', 'Foo', '/foo.png', 1), checkResourceImages('', '', '.png', 'Foo', '/foo.png', 1));
  });
  t.it('Should show image by image and imageUrl resource fields', async t => {
    scheduler = await t.getVerticalSchedulerAsync({
      resourceImagePath: '../examples/_shared/images/users/',
      resources: [{
        name: 'resource 1',
        image: 'team.jpg'
      }, {
        name: 'resource 2',
        imageUrl: '../examples/_shared/images/users/amit.jpg'
      }],
      columns: [{
        type: 'resourceInfo'
      }]
    }, 1);
    t.chain({
      waitForSelector: 'img[src*="examples/_shared/images/users/team.jpg"]'
    }, {
      waitForSelector: 'img[src*="examples/_shared/images/users/amit.jpg"]'
    });
  });
  t.it('Should fire mouse events when clicking a header cell element', t => {
    scheduler = t.getVerticalScheduler();
    t.firesOnce(scheduler, 'resourceheaderdblclick');
    t.firesOnce(scheduler, 'resourceheadercontextmenu');
    scheduler.on('resourceheaderclick', event => {
      t.is(event.resourceRecord, scheduler.resourceStore.getAt(1));
      t.isInstanceOf(event.event, MouseEvent);
    });
    t.chain({
      dblclick: '.b-resourceheader-cell:contains(Resource 2)'
    }, {
      contextmenu: '.b-resourceheader-cell:contains(Resource 2)'
    }, next => {
      t.firesOnce(scheduler, 'resourceheaderclick');
      next();
    }, {
      click: '.b-resourceheader-cell:contains(Resource 2)'
    });
  });
  t.it('Should render initials if resource image fails to load', async t => {
    let eventCount = 0,
        listener = () => eventCount++;

    document.documentElement.addEventListener('error', listener, true);
    scheduler = t.getVerticalScheduler({
      resources: [{
        name: 'John Wayne'
      }, {
        name: 'Lil Wayne'
      }, {
        name: 'Dan'
      }],
      resourceImagePath: '../examples/_shared/images/users/'
    });
    scheduler.resourceStore.first.name = 'John Wayne';
    await t.waitForSelector('.b-resource-avatar.b-resource-initials:contains(JW)');
    await t.waitForSelector('.b-resource-avatar.b-resource-initials:contains(LW)');
    t.is(eventCount, 2, '2 error events');
    document.documentElement.removeEventListener('error', listener, true);
  });
});