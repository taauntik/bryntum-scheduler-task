"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    scheduler && scheduler.destroy();
    scheduler = null;
  });

  async function setup(t, config = {}) {
    scheduler && scheduler.destroy();
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
        startDate: new Date(2018, 9, 20),
        duration: 2,
        name: 'task 1'
      }, {
        id: 2,
        resourceId: 1,
        startDate: new Date(2018, 9, 24),
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
    await t.waitForDependencies();
  }

  t.it('Should show editor on dblclick on dependency', async t => {
    await setup(t);
    t.firesOnce(scheduler, 'beforeDependencyEdit');
    t.chain({
      dblclick: '.b-sch-dependency'
    }, {
      waitForSelector: '.b-popup .b-header-title:contains(Edit dependency)',
      desc: 'Popup shown with correct title'
    }, () => {
      const depFeature = scheduler.features.dependencyEdit;
      t.hasValue(depFeature.fromNameField, 'task 1');
      t.hasValue(depFeature.toNameField, 'task 2');
      t.hasValue(depFeature.typeField, 2);
      t.is(depFeature.typeField.inputValue, 'End to Start');
      t.selectorNotExists('label:contains(Lag)', 'Lag field should not exist by default');
    });
  });
  t.it('Should delete dependency on Delete click', async t => {
    await setup(t);
    t.firesOnce(scheduler.dependencyStore, 'remove');
    t.firesOnce(scheduler, 'beforeDependencyDelete');
    t.firesOnce(scheduler, 'beforeDependencyEdit');
    t.chain({
      dblclick: '.b-sch-dependency'
    }, {
      click: '.b-popup button:textEquals(Delete)'
    }, {
      waitForSelectorNotFound: '.b-sch-dependency'
    });
  });
  t.it('Should change nothing on Cancel and close popup', async t => {
    await setup(t);
    t.wontFire(scheduler.dependencyStore, 'change');
    t.firesOnce(scheduler, 'beforeDependencyEdit');
    t.chain({
      dblclick: '.b-sch-dependency'
    }, {
      click: '.b-popup button:textEquals(Cancel)'
    });
  });
  t.it('Should repaint and update model when changing type', async t => {
    await setup(t); // TODO: Revisit when engine integration is complete
    // t.firesOnce(scheduler.dependencyStore, 'update');

    t.firesOnce(scheduler, 'beforeDependencyEdit');
    t.firesOnce(scheduler, 'beforeDependencyEditShow');
    t.firesOnce(scheduler, 'afterDependencySave');
    t.chain({
      dblclick: '.b-sch-dependency'
    }, next => {
      const depFeature = scheduler.features.dependencyEdit;
      depFeature.typeField.value = 0;
      next();
    }, {
      click: '.b-popup button:textEquals(Save)'
    }, () => {
      t.is(scheduler.dependencyStore.first.type, 0, 'Type updated');
    });
  });
  t.it('Should not show if scheduler is readOnly', async t => {
    await setup(t, {
      readOnly: true
    });
    t.wontFire(scheduler, 'beforeDependencyEdit');
    await t.doubleClick('.b-sch-dependency');
  });
  t.it('Should be possible to show editor programmatically', async t => {
    await setup(t, {
      height: 300
    });
    scheduler.features.dependencyEdit.editDependency(scheduler.dependencyStore.first);
    await t.waitForSelector('.b-dependencyeditor');
  });
  t.it('Should support disabling', async t => {
    await setup(t);
    scheduler.features.dependencyEdit.disabled = true;
    t.firesOk(scheduler, {
      beforeDependencyEdit: 1
    });
    await t.doubleClick('.b-sch-dependency');
    t.selectorNotExists('.b-popup.b-dependencyeditor');
    scheduler.features.dependencyEdit.disabled = false;
    await t.doubleClick('.b-sch-dependency');
    t.selectorExists('.b-popup.b-dependencyeditor');
  }); // https://github.com/bryntum/support/issues/3166

  t.it('Should allow to edit lag', async t => {
    scheduler = t.getScheduler({
      startDate: new Date(2018, 9, 14),
      endDate: new Date(2018, 9, 30),
      viewPreset: 'weekAndMonth',
      project: {
        eventsData: [{
          id: 1,
          startDate: new Date(2018, 9, 20),
          duration: 2,
          name: 'task 1'
        }, {
          id: 2,
          startDate: new Date(2018, 9, 20),
          duration: 2,
          name: 'task 2'
        }],
        resourcesData: [{
          id: 1,
          name: 'foo'
        }, {
          id: 2,
          name: 'bar'
        }],
        assignmentsData: [{
          id: 1,
          resource: 1,
          event: 1
        }, {
          id: 2,
          resource: 2,
          event: 2
        }],
        dependenciesData: [{
          id: 1,
          fromEvent: 1,
          toEvent: 2,
          type: 2,
          lag: 1,
          lagUnit: 'hour'
        }]
      },
      features: {
        dependencies: {
          showTooltip: false
        },
        eventTooltip: false,
        dependencyEdit: {
          autoClose: false,
          showLagField: true
        }
      }
    });
    await t.waitForSelector('.b-sch-dependency');
    const depFeature = scheduler.features.dependencyEdit;
    depFeature.editDependency(scheduler.dependencyStore.first);
    t.is(depFeature.lagField.unit, 'hour', 'lag field uses proper unit');
    await t.click('button:contains(Save)');
    t.is(scheduler.dependencyStore.first.lag, 1, 'dependency has proper lag');
    t.is(scheduler.dependencyStore.first.lagUnit, 'hour', 'dependency has proper lag unit');
  });
});