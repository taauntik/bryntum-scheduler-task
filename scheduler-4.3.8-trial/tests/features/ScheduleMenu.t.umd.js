"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && !scheduler.isDestroyed && scheduler.destroy(); // After scheduler destroy, all menuitems must also have been destroyed

    if (bryntum.queryAll('menuitem').length > 0) {
      t.is(bryntum.queryAll('menuitem').length, 0, 'Menu items all destroyed');
    }
  });
  t.it('Add event should work with EventEdit', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      features: {
        scheduleMenu: true,
        eventMenu: true,
        eventEdit: true
      }
    }, 1);
    t.chain({
      rightClick: '.b-sch-timeaxis-cell',
      offset: [100, 60]
    }, {
      click: '.b-menu:textEquals(Add event)'
    }, {
      waitFor: () => scheduler.features.eventEdit.editor.containsFocus
    }, {
      type: 'New test event'
    }, {
      click: 'button:textEquals(Save)'
    }, {
      waitForSelector: '.b-sch-dirty-new',
      desc: 'New event rendered'
    }, () => {
      t.is(scheduler.eventStore.last.startDate, new Date(2011, 0, 4), 'Start date correct');
    });
  });
  t.it('Should disable "Add event" if no resources exist', async t => {
    // See https://app.assembla.com/spaces/bryntum/tickets/9102-ie11--not-possible-to-reach--b-grid-subgrid-normal-element-in-if-there-are-no/details#
    if (BrowserHelper.isIE11) return;
    scheduler = await t.getSchedulerAsync({
      features: {
        scheduleMenu: true
      },
      resources: []
    }, 0);
    t.chain({
      rightClick: '.b-grid-subgrid-normal',
      offset: [20, 20]
    }, {
      waitForSelector: '.b-menuitem.b-disabled:textEquals(Add event)'
    });
  });
  t.it('Add event should work with dependencyEdit disabled', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      features: {
        scheduleMenu: true,
        eventMenu: true,
        eventEdit: true,
        dependencies: {
          disabled: false
        },
        dependencyEdit: {
          disabled: true
        }
      }
    }, 1);
    t.chain({
      rightClick: '.b-sch-timeaxis-cell',
      offset: [100, 60]
    }, {
      click: '.b-menu:textEquals(Add event)'
    }, {
      waitFor: () => scheduler.features.eventEdit.editor.containsFocus
    }, {
      type: 'New test event'
    }, {
      click: 'button:textEquals(Save)'
    }, {
      waitForSelector: '.b-sch-dirty-new',
      desc: 'New event rendered'
    }, () => {
      t.is(scheduler.eventStore.last.startDate, new Date(2011, 0, 4), 'Start date correct');
    });
  });
  t.it('Add event should work without EventEdit', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      features: {
        scheduleMenu: true,
        eventMenu: true,
        eventEdit: false
      }
    }, 1);
    t.chain({
      rightClick: '.b-sch-timeaxis-cell',
      offset: [100, 60]
    }, {
      click: '.b-menu:textEquals(Add event)'
    }, {
      waitForSelector: '.b-sch-dirty-new',
      desc: 'New event rendered'
    }, () => {
      t.is(scheduler.eventStore.last.startDate, new Date(2011, 0, 4), 'Start date correct');
    });
  });
  t.it('Should be able to add extra items to the menu', async t => {
    let clicked = false;
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      features: {
        scheduleMenu: {
          items: {
            extra: {
              text: 'Extra',
              icon: 'b-fa b-fa-fw b-fa-sheep',

              onItem({
                date,
                resourceRecord
              }) {
                t.is(date, new Date(2011, 0, 4), 'Date param correct');
                t.is(resourceRecord, scheduler.resourceStore.getAt(1), 'Resource param correct');
                clicked = true;
              }

            }
          }
        }
      }
    }, 3);
    t.chain({
      rightClick: '.b-sch-timeaxis-cell',
      offset: [100, 60]
    }, {
      click: ':textEquals(Extra)'
    }, () => {
      t.ok(clicked, 'Click registered');
    });
  });
  t.it('Should be able to process items shown for an event', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      features: {
        scheduleMenu: {
          processItems({
            date,
            resourceRecord,
            items
          }) {
            if (date < new Date(2011, 0, 4)) {
              items.old = {
                text: 'Old'
              };
            }

            if (resourceRecord === scheduler.resourceStore.getAt(2)) {
              return false;
            }
          }

        }
      }
    }, 1);
    t.chain({
      rightClick: '.b-sch-timeaxis-cell',
      offset: [50, 60]
    }, next => {
      t.selectorExists('.b-menu');
      t.selectorExists(':textEquals(Old)', 'Item found');
      next();
    }, {
      rightClick: '.b-sch-timeaxis-cell',
      offset: [400, 60]
    }, next => {
      t.selectorNotExists(':textEquals(Old)', 'Item not found');
      next();
    }, {
      click: '.b-sch-timeaxis-cell',
      offset: [200, 60],
      desc: 'Clicking to hide menu'
    }, {
      waitForSelectorNotFound: '.b-menu',
      desc: 'Menu hidden'
    }, {
      rightClick: '[data-index="2"] .b-sch-timeaxis-cell'
    }, () => {
      t.selectorNotExists('.b-menu', 'No menu shown');
    });
  });
  t.it('Should trigger scheduleMenuBeforeShow & scheduleMenuShow events', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      features: {
        scheduleMenu: true
      }
    }, 1);
    t.firesOk(scheduler, {
      scheduleMenuBeforeShow: 2,
      scheduleMenuShow: 1
    });
    t.chain({
      rightClick: '.b-sch-timeaxis-cell',
      offset: [50, 60]
    }, next => {
      scheduler.on('scheduleMenuBeforeShow', () => false);
      next();
    }, {
      click: '.b-sch-timeaxis-cell',
      offset: [50, 60]
    }, {
      waitForSelectorNotFound: '.b-menu',
      desc: 'Menu hidden'
    }, {
      rightClick: '.b-sch-timeaxis-cell',
      offset: [50, 60]
    }, () => {
      t.selectorNotExists('.b-menu');
    });
  });
  t.it('LEGACY: Should trigger scheduleContextMenuBeforeShow & scheduleContextMenuShow events', async t => {
    const spy = t.spyOn(VersionHelper, 'deprecate').and.callFake(() => {});
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      features: {
        scheduleMenu: true
      }
    }, 1);
    t.firesOk(scheduler, {
      scheduleContextMenuBeforeShow: 1,
      scheduleContextMenuShow: 1
    });
    t.chain({
      rightClick: '.b-sch-timeaxis-cell',
      offset: [50, 60]
    }, () => {
      t.expect(spy).toHaveBeenCalled(2); // Fired at least once with the specified arguments:

      t.expect(spy).toHaveBeenCalledWith('Scheduler', '5.0.0', '`scheduleContextMenuBeforeShow` event is deprecated, in favor of `scheduleMenuBeforeShow` event. Please see https://bryntum.com/docs/scheduler/guide/Scheduler/upgrades/3.1.0 for more information.');
      t.expect(spy).toHaveBeenCalledWith('Scheduler', '5.0.0', '`scheduleContextMenuShow` event is deprecated, in favor of `scheduleMenuShow` event. Please see https://bryntum.com/docs/scheduler/guide/Scheduler/upgrades/3.1.0 for more information.');
    });
  });
  t.it('Should trigger scheduleMenuItem event', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      features: {
        scheduleMenu: {
          items: {
            foo: {
              text: 'foo'
            }
          }
        }
      }
    });
    t.firesOk(scheduler, {
      scheduleMenuItem: 1
    });
    t.chain({
      rightClick: '.b-sch-timeaxis-cell',
      offset: [50, 60]
    }, {
      click: '.b-menuitem:textEquals(foo)'
    });
  });
  t.it('LEGACY: Should trigger scheduleContextMenuItem event', async t => {
    const spy = t.spyOn(VersionHelper, 'deprecate').and.callFake(() => {});
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayAndWeek',
      features: {
        scheduleMenu: {
          items: {
            foo: {
              text: 'foo'
            }
          }
        }
      }
    });
    t.firesOk(scheduler, {
      scheduleContextMenuItem: 1
    });
    t.chain({
      rightClick: '.b-sch-timeaxis-cell',
      offset: [50, 60]
    }, {
      click: '.b-menuitem:textEquals(foo)'
    }, () => {
      t.expect(spy).toHaveBeenCalled(1);
      t.expect(spy).toHaveBeenCalledWith('Scheduler', '5.0.0', '`scheduleContextMenuItem` event is deprecated, in favor of `scheduleMenuItem` event. Please see https://bryntum.com/docs/scheduler/guide/Scheduler/upgrades/3.1.0 for more information.');
    });
  });
  t.it('Should work with AssignmentStore', t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      features: {
        scheduleMenu: true,
        eventEdit: false
      },
      assignments: [{
        id: 'a1',
        eventId: 'e1',
        resourceId: 'r1'
      }, {
        id: 'a2',
        eventId: 'e1',
        resourceId: 'r2'
      }],
      events: [{
        id: 'e1',
        startDate: '2018-12-14',
        duration: 8
      }],
      resources: [{
        id: 'r1'
      }, {
        id: 'r2'
      }],
      startDate: '2018-12-7'
    });
    t.chain({
      waitForProjectReady: scheduler
    }, {
      rightClick: '.b-sch-timeaxis-cell',
      offset: [150, 10]
    }, {
      click: '.b-menu:textEquals(Add event)'
    }, {
      waitForSelector: '.b-sch-dirty-new',
      desc: 'New event rendered'
    }, () => {
      t.is(scheduler.eventStore.last.startDate, DateHelper.clearTime(scheduler.getDateFromCoordinate(150)), 'Start date correct');
      t.is(scheduler.assignmentStore.count, 3, 'Correct number of assignments');
    });
  }); // https://github.com/bryntum/support/issues/2949

  t.it('Should open context menu when clicking outside of rows but disable "Add event" option', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        scheduleMenu: true,
        eventEdit: false
      }
    });
    t.chain({
      contextmenu: '.b-timeline-subgrid'
    }, {
      waitForSelector: '.b-menuitem.b-disabled:contains(Add)'
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/8720

  t.it('Should respect scheduler readOnly mode and do not show default items', async t => {
    scheduler = await t.getSchedulerAsync({
      readOnly: true,
      features: {
        scheduleMenu: {
          items: {
            test: {
              text: 'Foo'
            }
          }
        }
      }
    });
    t.chain({
      contextmenu: '.b-timeline-subgrid'
    }, {
      waitForSelectors: [['.b-menu .b-menuitem']]
    }, () => {
      t.selectorCountIs('.b-menuitem', 1, 'Only 1 item visible');
      t.selectorExists('.b-menuitem :textEquals(Foo)', 'Extra item is there');
      t.selectorNotExists('.b-menuitem :textEquals(Add event)', 'Add item is NOT there');
    });
  });
  t.it('Should respect scheduler readOnly mode which dynamically gets enabled and disabled', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        scheduleMenu: {
          items: {
            test: {
              text: 'Foo'
            }
          }
        }
      }
    });
    t.chain({
      contextmenu: '.b-timeline-subgrid'
    }, {
      waitForSelectors: [['.b-menu .b-menuitem']]
    }, next => {
      t.selectorCountIs('.b-menuitem', 2, 'All items visible');
      t.selectorExists('.b-menuitem :textEquals(Foo)', 'Extra item is there');
      t.selectorExists('.b-menuitem :textEquals(Add event)', 'Add item is there');
      next();
    }, {
      click: '.b-sch-event'
    }, {
      waitForSelectorNotFound: '.b-menu'
    }, next => {
      scheduler.readOnly = true;
      next();
    }, {
      contextmenu: '.b-timeline-subgrid'
    }, {
      waitForSelectors: [['.b-menu .b-menuitem']]
    }, next => {
      t.selectorCountIs('.b-menuitem', 1, 'Only 1 item visible');
      t.selectorExists('.b-menuitem :textEquals(Foo)', 'Extra item is there');
      t.selectorNotExists('.b-menuitem :textEquals(Add event)', 'Add item is NOT there');
      next();
    }, {
      click: '.b-sch-event'
    }, {
      waitForSelectorNotFound: '.b-menu'
    }, next => {
      scheduler.readOnly = false;
      next();
    }, {
      contextmenu: '.b-timeline-subgrid'
    }, {
      waitForSelectors: [['.b-menu .b-menuitem']]
    }, () => {
      t.selectorCountIs('.b-menuitem', 2, 'All items visible');
      t.selectorExists('.b-menuitem :textEquals(Foo)', 'Extra item is there');
      t.selectorExists('.b-menuitem :textEquals(Add event)', 'Add item is there');
    });
  });
  t.it('Should handle contextMenuTriggerEvent and triggerEvent configs to show menu', async t => {
    scheduler = await t.getSchedulerAsync({
      contextMenuTriggerEvent: 'click',
      features: {
        scheduleMenu: {
          items: {
            test: {
              text: 'Foo'
            }
          }
        }
      }
    });
    t.chain( // Click event
    {
      click: '.b-sch-timeaxis-cell'
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
      scheduler.features.scheduleMenu.triggerEvent = 'dblclick';
    }, {
      dblClick: '.b-sch-timeaxis-cell'
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
      scheduler.features.scheduleMenu.triggerEvent = 'contextmenu';
    }, {
      rightClick: '.b-sch-timeaxis-cell'
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
  t.it('Should support disabling', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        scheduleMenu: true
      },
      events: []
    });
    scheduler.features.scheduleMenu.disabled = true;
    t.chain({
      rightClick: '.b-sch-timeaxis-cell'
    }, next => {
      t.selectorNotExists('.b-menu', 'No menu shown');
      scheduler.features.scheduleMenu.disabled = false;
      next();
    }, {
      rightClick: '.b-sch-timeaxis-cell'
    }, () => {
      t.selectorExists('.b-menu', 'Menu shown');
    });
  });
  t.it('Should not activate on special rows like grouping header or summary', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        scheduleMenu: true,
        group: 'name'
      }
    });
    t.chain({
      rightClick: '.b-timeline-subgrid .b-group-row'
    }, () => t.selectorNotExists('.b-menu', 'No menu shown'));
  });
});