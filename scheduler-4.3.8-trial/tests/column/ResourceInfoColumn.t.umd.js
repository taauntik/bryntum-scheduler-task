"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    var _scheduler, _scheduler$destroy;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : (_scheduler$destroy = _scheduler.destroy) === null || _scheduler$destroy === void 0 ? void 0 : _scheduler$destroy.call(_scheduler);
  });
  t.it('Should show generic image if IMG is not found in list of valid names', async t => {
    scheduler = await t.getSchedulerAsync({
      defaultResourceImageName: 'none.png',
      resources: [{
        name: 'bar'
      }],
      resourceImagePath: '../examples/_shared/images/users/',
      columns: [{
        type: 'resourceInfo',
        text: 'Staff',
        validNames: ['foo']
      }]
    }, 1);
    t.chain({
      waitForSelector: 'img[src*="none.png"]'
    }, {
      waitForTextPresent: '0 events'
    });
  });
  t.it('Should show generic image if IMG is not found', async t => {
    scheduler = t.getScheduler({
      defaultResourceImageName: 'none.png',
      resources: [{
        name: 'foo'
      }],
      resourceImagePath: '../examples/_shared/images/users/',
      columns: [{
        type: 'resourceInfo',
        text: 'Staff',
        validNames: ['foo']
      }]
    }, 1);
    t.isCalledNTimes('onImageErrorEvent', scheduler.columns.first.avatarRendering, 1, 'Default image is set once');
    await t.waitForProjectReady();
    t.chain({
      waitForSelector: 'img[src*="none.png"]'
    });
  });
  t.it('Should show name initials if generic image is not found', async t => {
    scheduler = t.getScheduler({
      defaultResourceImageName: '404.png',
      resources: [{
        name: 'Santa Claus'
      }],
      resourceImagePath: '../examples/_shared/images/users/',
      columns: [{
        type: 'resourceInfo',
        text: 'Staff',
        validNames: ['Santa Claus']
      }]
    }, 1);
    t.waitForSelector('.b-resource-initials:contains(SC)');
  }); // https://app.assembla.com/spaces/bryntum/tickets/9127

  t.it('validNames null should allow all names', t => {
    scheduler = t.getScheduler({
      resources: [{
        name: 'foo'
      }],
      resourceImagePath: '../examples/_shared/images/users/',
      columns: [{
        type: 'resourceInfo',
        text: 'Staff',
        validNames: null
      }]
    }, 1);
    t.chain({
      waitForSelector: 'img[src*="foo.jpg"]'
    }, {
      waitForSelector: '.b-resource-initials:contains(f)'
    }, {
      waitForProjectReady: scheduler
    } // Dont want to destroy it while calculating, not handled well
    );
  });
  t.it('Should not instantly reload images with invalid resourceImagePath or defaultResourceImageName', async t => {
    let errorCount = 0,
        detacher;

    const checkResourceImages = (resourceImagePath, defaultResourceImageName, resourceImageExtension, resourceName, checkImageName, expectedNbrOfErrorEvents) => [async () => {
      var _scheduler2, _detacher;

      (_scheduler2 = scheduler) === null || _scheduler2 === void 0 ? void 0 : _scheduler2.destroy();
      (_detacher = detacher) === null || _detacher === void 0 ? void 0 : _detacher();
      errorCount = 0;
      scheduler = t.getScheduler({
        resources: [{
          name: resourceName
        }],
        columns: [{
          type: 'resourceInfo',
          validNames: []
        }],
        defaultResourceImageName,
        resourceImagePath,
        resourceImageExtension
      }, 1);
      detacher = EventHelper.on({
        element: scheduler.element,
        error: () => errorCount++,
        capture: true
      });
      await scheduler.project.commitAsync();
    }, {
      diag: `path="${resourceImagePath}" default="${defaultResourceImageName}"  extension="${resourceImageExtension}" name="${resourceName}" => ${expectedNbrOfErrorEvents} error(s)`
    }, // If both the resource image and default image fail to load, we show resource initials
    expectedNbrOfErrorEvents === 2 || !defaultResourceImageName && expectedNbrOfErrorEvents === 1 ? {
      waitForSelector: `.b-resource-initials:contains(${resourceName[0]})`
    } : {
      waitForSelector: `img[src="${checkImageName}"]`,
      desc: `${checkImageName} image found`
    }, {
      waitFor: () => errorCount === expectedNbrOfErrorEvents,
      desc: `Expected amount of errors = ${expectedNbrOfErrorEvents}`
    }]; // Each resource tries to load image by name and if it fails then loads default one
    // Error count depends on name image and default image existence


    const validPath = '../examples/_shared/images/users/';
    t.chain(checkResourceImages(validPath, 'none.png', '.jpg', 'Kate', validPath + 'kate.jpg', 0), checkResourceImages(validPath, 'none.png', '.png', 'Kate', validPath + 'none.png', 1), checkResourceImages(validPath, 'none.png', '.jpg', 'Foo', validPath + 'none.png', 1), checkResourceImages(validPath, 'bad.jpg', '.jpg', 'Foo', validPath + 'bad.jpg', 2), checkResourceImages('', 'none.png', '.jpg', 'Foo', '/none.png', 2), checkResourceImages('..', 'none.png', '.jpg', 'Foo', '../none.png', 2), checkResourceImages('../', 'none.png', '.jpg', 'Foo', '../none.png', 2), checkResourceImages(validPath, 'none.jpg', '.png', 'None', validPath + 'none.png', 0), checkResourceImages('', null, '.png', 'Foo', '/foo.png', 1), checkResourceImages('', undefined, '.png', 'Foo', '/foo.png', 1), checkResourceImages('', '', '.png', 'Foo', '/foo.png', 1));
  }); // https://app.assembla.com/spaces/bryntum/tickets/9316

  t.it('Should be possible to specify renderer for ResourceInfoColumn', async t => {
    scheduler = await t.getSchedulerAsync({
      resources: [{
        name: 'foo'
      }],
      columns: [{
        type: 'resourceInfo',
        text: 'Staff',
        field: 'name',

        renderer() {
          return 'custom';
        }

      }]
    });
    t.waitForSelector('.b-grid-cell:contains(custom)');
  });
  t.it('Should contain resource name in default renderer', async t => {
    scheduler = await t.getSchedulerAsync({
      resources: [{
        name: 'foo'
      }],
      columns: [{
        type: 'resourceInfo',
        text: 'Staff',
        field: 'name'
      }]
    });
    t.waitForSelector('.b-grid-cell:contains(foo)');
    t.waitForSelector('.b-resource-initials:contains(f)');
  });
  t.it('Should show image by image and imageUrl resource fields', async t => {
    let loadCount = 0,
        handler = e => {
      if (e.target.nodeName.toUpperCase() === 'IMG') {
        loadCount++;
      }
    };

    document.body.addEventListener('load', handler, true);
    scheduler = await t.getSchedulerAsync({
      resourceImagePath: '../examples/_shared/images/users/',
      resources: [{
        age: 22,
        name: 'resource 1',
        image: 'team.jpg'
      }, {
        age: 88,
        name: 'resource 2',
        imageUrl: '../examples/_shared/images/users/amit.jpg'
      }],
      columns: [{
        field: 'age'
      }, {
        autoSyncHtml: false,
        type: 'resourceInfo'
      }],
      features: {
        group: 'id'
      }
    }, 1);
    t.chain({
      waitForSelector: 'img[src*="examples/_shared/images/users/team.jpg"]'
    }, {
      waitForSelector: 'img[src*="examples/_shared/images/users/amit.jpg"]'
    }, {
      waitFor: () => loadCount === 2
    }, async () => {
      document.body.removeEventListener('load', handler, true);

      handler = () => t.fail('load should not be called after a record update');

      document.body.addEventListener('load', handler, true);
    }, {
      dblClick: '.b-grid-cell:contains("22")'
    }, {
      type: '42[ENTER]',
      clearExisting: true
    }, {
      waitFor: 500,
      desc: 'some to allow the image to load, in case there is a bug in DOM update triggering a reload of the image'
    }, async () => {
      t.is(loadCount, 2, 'No load triggered');
      document.body.removeEventListener('load', handler, true);
    });
  });
  t.it('Should show resource initials if no default image is available', async t => {
    scheduler = await t.getSchedulerAsync({
      resources: [{
        name: 'Santa Claus'
      }],
      columns: [{
        type: 'resourceInfo',
        text: 'Staff',
        field: 'name'
      }]
    });
    t.waitForSelector('.b-resource-initials:contains(SC)');
  });
  t.it('Should show resource initials if resource has image is set to false', async t => {
    let errorCount = 0;

    const handler = () => errorCount++;

    document.body.addEventListener('error', handler, true);
    scheduler = await t.getSchedulerAsync({
      resources: [{
        name: 'Santa Claus',
        image: false
      }],
      columns: [{
        type: 'resourceInfo',
        text: 'Staff',
        field: 'name'
      }]
    });
    await t.waitForSelector('.b-resource-initials:contains(SC)');
    document.body.removeEventListener('error', handler, true);
  });
  t.it('Should htmlEncode content', async t => {
    scheduler = await t.getSchedulerAsync({
      resources: [{
        age: 22,
        name: '<Bob><img class="fail" src="foo">',
        role: 'Role<img class="fail" src="foo">',
        image: false
      }],
      columns: [{
        type: 'resourceInfo',
        showRole: true
      }]
    }, 1);
    await t.waitForRowsVisible(scheduler);
    t.selectorNotExists('.b-grid-cell img');
    t.selectorExists('.b-resource-avatar:contains(<)');
  });
  t.it('Should support showing resource icon', async t => {
    scheduler = await t.getSchedulerAsync({
      resources: [{
        age: 22,
        name: 'Bob',
        iconCls: 'b-fa b-fa-user',
        image: false
      }],
      columns: [{
        type: 'resourceInfo'
      }]
    }, 1);
    await t.waitForSelector('.b-resource-avatar.b-resource-icon.b-fa.b-fa-user');
  });
  t.it('Should support showing meta info about resource', async t => {
    scheduler = await t.getSchedulerAsync({
      resources: [{
        name: 'Bob',
        image: false
      }],
      columns: [{
        type: 'resourceInfo',
        showMeta: r => 'Metalicious',
        showRole: false,
        showEventCount: false
      }]
    }, 1);
    await t.waitForSelector('.b-resource-meta:contains(Metalicious)');
  }); // https://github.com/bryntum/support/issues/3300

  t.it('Should support using external URL starting with // as resourceImagePath', async t => {
    const paths = location.pathname.split('/');
    paths.pop();
    const resourceImagePath = `//${location.hostname}${paths.join('/')}/resource`;
    scheduler = await t.getSchedulerAsync({
      resourceImagePath,
      resourceImageExtension: '.svg',
      resources: [{
        name: 'Bob'
      }],
      columns: [{
        type: 'resourceInfo'
      }]
    }, 1);
    await t.waitForSelector(`.b-resource-info img[src="${resourceImagePath}/bob.svg"]`);
    t.pass(`Correct image rendered for ${resourceImagePath}`);
  }); // https://github.com/bryntum/support/issues/3300

  t.it('Should support using external URL starting with http:// as resourceImagePath', async t => {
    const paths = location.pathname.split('/');
    paths.pop();
    const resourceImagePath = `${location.protocol}//${location.hostname}${paths.join('/')}/resource`;
    scheduler = await t.getSchedulerAsync({
      resourceImagePath,
      resourceImageExtension: '.svg',
      resources: [{
        name: 'Bob'
      }],
      columns: [{
        type: 'resourceInfo'
      }]
    }, 1);
    await t.waitForSelector(`.b-resource-info img[src="${resourceImagePath}/bob.svg"]`);
    t.pass(`Correct image rendered for ${resourceImagePath}`);
  });
});