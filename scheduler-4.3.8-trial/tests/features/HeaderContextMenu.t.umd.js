"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy(); // After scheduler destroy, all menuitems must also have been destroyed

    t.is(bryntum.queryAll('menuitem').length, 0, 'Menu items all destroyed');
  });
  const spy = t.spyOn(VersionHelper, 'deprecate').and.callFake(() => {});
  t.it('LEGACY: Should work with a disabled dependencyEdit feature', t => {
    spy.reset();
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      features: {
        contextMenu: true,
        headerContextMenu: true,
        eventMenu: true,
        dependencies: {
          disabled: false
        },
        dependencyEdit: {
          disabled: true
        }
      }
    }, 3);
    t.chain({
      contextmenu: '.b-sch-header-timeaxis-cell'
    }, () => {
      t.ok(scheduler.features.contextMenu.currentMenu.isVisible, 'Header context menu is visible');
      t.expect(spy).toHaveBeenCalled(2);
      t.expect(spy).toHaveBeenCalledWith('Grid', '5.0.0', '`ContextMenu` feature is deprecated, in favor of `CellMenu` and `HeaderMenu` features. Please see https://bryntum.com/docs/grid/guide/Grid/upgrades/3.1.0 for more information.');
      t.expect(spy).toHaveBeenCalledWith('Scheduler', '5.0.0', '`HeaderContextMenu` feature is deprecated, in favor of `TimeAxisHeaderMenu` feature. Please see https://bryntum.com/docs/scheduler/guide/Scheduler/upgrades/3.1.0 for more information.');
    });
  });
  t.it('LEGACY: Should not throw an error when timeaxis end date set to same as start date', t => {
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      startDate: new Date(2012, 5, 3),
      endDate: new Date(2012, 5, 17),
      features: {
        contextMenu: true,
        headerContextMenu: true
      }
    }, 1);
    t.chain({
      rightclick: '.b-sch-header-timeaxis-cell',
      offset: [5, 5]
    }, {
      moveMouseTo: '.b-menuitem:contains(Date range)'
    }, {
      waitForElementVisible: '.b-datefield:contains(Start date)'
    }, // This should not throw
    next => {
      const sd = bryntum.fromElement(t.query('.b-datefield:contains(Start date)')[0]),
            ed = bryntum.fromElement(t.query('.b-datefield:contains(End date)')[0]);
      t.is(scheduler.timeAxis.count, 14, '14 ticks across TimeAxis');
      ed.value = sd.value;
      t.is(scheduler.timeAxis.count, 1, '1 tics across TimeAxis');
      next();
    });
  });
  t.it('LEGACY: Should not throw an error when timeaxis start date set greater than end date', t => {
    scheduler = t.getScheduler({
      viewPreset: 'hourAndDay',
      startDate: new Date(2012, 5, 3),
      endDate: new Date(2012, 5, 3, 6),
      features: {
        contextMenu: true,
        headerContextMenu: true
      }
    }, 1);
    let startDateField, endDateField;
    t.chain({
      rightclick: ':textEquals(12 AM)'
    }, {
      moveMouseTo: '.b-menuitem:contains(Date range)'
    }, {
      waitForElementVisible: '.b-datefield:contains(Start date)'
    }, {
      diag: 'Sanity checks'
    }, next => {
      startDateField = bryntum.fromElement(t.query('.b-datefield:contains(Start date)')[0]);
      endDateField = bryntum.fromElement(t.query('.b-datefield:contains(End date)')[0]);
      t.is(startDateField.value, new Date(2012, 5, 3), 'start date field value is correct');
      t.is(endDateField.value, new Date(2012, 5, 3), 'end date field value is correct');
      next();
    }, {
      diag: 'Change start date +1 day'
    }, {
      click: () => startDateField.triggers.forward.element,
      desc: 'Clicking to shift start date +1 day ..should not throw exception'
    }, () => {
      t.is(scheduler.timeAxis.count, 24, '1 ticks across TimeAxis');
      t.is(scheduler.timeAxis.startDate, new Date(2012, 5, 4), 'timeaxis start date is correct');
      t.is(scheduler.timeAxis.endDate, new Date(2012, 5, 5), 'timeaxis end date is correct');
    });
  });
  t.it('LEGACY: Should support adding extraItems', t => {
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      startDate: new Date(2012, 5, 3),
      endDate: new Date(2012, 5, 17),
      features: {
        contextMenu: true,
        headerContextMenu: {
          extraItems: [{
            text: 'Foo'
          }, {
            text: 'Bar'
          }]
        }
      }
    }, 1);
    t.chain({
      rightclick: '.b-sch-header-timeaxis-cell',
      offset: [5, 5]
    }, {
      waitForSelector: '.b-menuitem:contains(Foo)'
    }, {
      waitForSelector: '.b-menuitem:contains(Bar)'
    });
  });
  t.it('LEGACY: Should support manipulating default menu items', t => {
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      startDate: new Date(2012, 5, 3),
      endDate: new Date(2012, 5, 17),
      features: {
        contextMenu: true,
        headerContextMenu: {
          processItems({
            items
          }) {
            t.is(items.length, 4, '3 builtin items, 2 custom extra items'); // Filter out Bar item

            items.splice(items.findIndex(item => item.text === 'Bar'), 1);
          },

          extraItems: [{
            text: 'Foo'
          }, {
            text: 'Bar'
          }]
        }
      }
    }, 1);
    t.chain({
      rightclick: '.b-sch-header-timeaxis-cell',
      offset: [5, 5]
    }, {
      waitForSelector: '.b-menuitem:contains(Foo)'
    }, {
      waitForSelectorNotFound: '.b-menuitem:contains(Bar)'
    });
  });
  t.it('LEGACY: Should handle triggerEvent config to show menu', t => {
    scheduler = t.getScheduler({
      features: {
        headerContextMenu: true,
        contextMenu: {
          triggerEvent: 'click'
        }
      }
    });
    t.chain( // Click event
    {
      click: '.b-sch-header-timeaxis-cell'
    }, {
      waitForSelector: '.b-menu',
      desc: 'Menu visible'
    }, {
      type: '[ESC]]'
    }, {
      waitForSelectorNotFound: '.b-menu',
      desc: 'Menu hidden'
    }, // DblClick event
    async () => {
      scheduler.features.contextMenu.triggerEvent = 'dblclick';
    }, {
      dblClick: '.b-sch-header-timeaxis-cell'
    }, {
      waitForSelector: '.b-menu',
      desc: 'Menu visible'
    }, {
      type: '[ESC]]'
    }, {
      waitForSelectorNotFound: '.b-menu',
      desc: 'Menu hidden'
    }, // Contextmenu event
    async () => {
      scheduler.features.contextMenu.triggerEvent = 'contextmenu';
    }, {
      rightClick: '.b-sch-header-timeaxis-cell'
    }, {
      waitForSelector: '.b-menu',
      desc: 'Menu visible'
    }, {
      type: '[ESC]]'
    }, {
      waitForSelectorNotFound: '.b-menu',
      desc: 'Menu hidden'
    });
  });
  t.it('LEGACY: Should support disabling', t => {
    scheduler = t.getScheduler({
      features: {
        contextMenu: true,
        headerContextMenu: true
      }
    });
    scheduler.features.headerContextMenu.disabled = true;
    t.chain({
      rightClick: '.b-sch-timeaxiscolumn'
    }, next => {
      t.selectorCountIs('.b-menuitem.b-disabled', 2, 'Items disabled');
      scheduler.features.headerContextMenu.disabled = false;
      next();
    }, {
      rightClick: '.b-sch-timeaxiscolumn'
    }, () => {
      t.selectorNotExists('.b-menuitem.b-disabled', 'Items enabled');
    });
  });
});