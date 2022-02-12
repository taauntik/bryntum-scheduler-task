"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy(); // After scheduler destroy, all menuitems must also have been destroyed

    t.is(bryntum.queryAll('menuitem').length, 0, 'Menu items all destroyed');
  });
  const spy = t.spyOn(VersionHelper, 'deprecate').and.callFake(() => {});
  t.it('LEGACY: should work with a disabled dependencyEdit feature', t => {
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      features: {
        eventContextMenu: true,
        dependencies: {
          disabled: false
        },
        dependencyEdit: {
          disabled: true
        }
      }
    }, 3);
    t.chain({
      contextmenu: '.b-sch-event'
    }, () => {
      t.ok(scheduler.features.eventContextMenu.menu.isVisible, 'Event context menu is visible');
      t.expect(spy).toHaveBeenCalled(1);
      t.expect(spy).toHaveBeenCalledWith('Scheduler', '5.0.0', '`EventContextMenu` feature is deprecated, in favor of `EventMenu` feature. Please see https://bryntum.com/docs/scheduler/guide/Scheduler/upgrades/3.1.0 for more information.');
    });
  });
  t.it('LEGACY: Removing event from context menu by keyboard action should focus next event', t => {
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      features: {
        eventContextMenu: true
      }
    }, 3);
    t.chain({
      contextmenu: '.b-sch-event'
    }, // Key down to the delete option.
    // Focus reversion only happens if using keyboard
    {
      type: '[DOWN]'
    }, {
      type: '[DOWN]'
    }, {
      type: '[DOWN]'
    }, {
      type: '[DOWN]'
    }, {
      type: ' '
    }, // Wait for next one to be focused
    {
      waitFor: () => document.activeElement === scheduler.getElementFromEventRecord(scheduler.eventStore.first).parentNode
    }, // Then move on to last one
    {
      type: '[RIGHT]'
    }, () => {
      t.ok(document.activeElement.firstElementChild.classList.contains('event3'), 'Last event is focused');
    });
  });
  t.it('LEGACY: Should be able to add extra items to the menu', t => {
    let clicked = false;
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      features: {
        // Gets in the way in FF
        eventTooltip: false,
        eventContextMenu: {
          items: {
            extra: {
              text: 'Extra',
              icon: 'b-fa b-fa-fw b-fa-fish',

              onItem() {
                clicked = true;
              }

            }
          }
        }
      }
    }, 3);
    t.chain({
      moveCursorTo: '[data-event-id="1"]'
    }, // Utility method to create steps to show contextmenu and click item.
    t.eventContextMenuSteps(scheduler, scheduler.eventStore.first, 'Extra'), () => {
      t.ok(clicked, 'Click registered');
    });
  });
  t.it('LEGACY: Should be able to process items shown for an event', t => {
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      features: {
        eventContextMenu: {
          items: {
            foo: {
              text: 'foo'
            }
          },

          processItems({
            eventRecord,
            items
          }) {
            if (eventRecord === scheduler.eventStore.getAt(1)) {
              items.extra = {
                text: 'Extra'
              };
              t.is(ObjectHelper.getTruthyKeys(items).filter(ref => !items[ref].hidden).length, 6, '6 visible items (4 default, one extra on feature config, one added dynamically)');
            }

            if (eventRecord === scheduler.eventStore.getAt(2)) {
              return false;
            }
          }

        }
      }
    }, 3);
    t.chain({
      rightClick: '[data-event-id="2"]'
    }, next => {
      t.selectorExists('.b-menu');
      t.selectorExists(':textEquals(Extra)', 'Item found');
      next();
    }, {
      rightClick: '[data-event-id="1"]'
    }, next => {
      t.selectorNotExists(':textEquals(Extra)', 'Item not found');
      next();
    }, {
      click: '[data-event-id="3"]',
      desc: 'Clicking to hide menu'
    }, {
      waitForSelectorNotFound: '.b-menu',
      desc: 'Menu hidden'
    }, {
      rightClick: '[data-event-id="3"]'
    }, () => {
      t.selectorNotExists('.b-menu', 'No menu shown');
    });
  });
  t.it('LEGACY: Should trigger eventContextMenuBeforeShow & eventContextMenuShow events', t => {
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      features: {
        eventContextMenu: true
      }
    }, 3);
    t.firesOk(scheduler, {
      eventContextMenuBeforeShow: 2,
      eventContextMenuShow: 1
    });
    t.chain({
      rightClick: '.b-sch-event'
    }, {
      waitForSelector: '.b-menu',
      desc: 'Menu shown'
    }, next => {
      scheduler.on('eventContextMenuBeforeShow', () => false);
      next();
    }, {
      click: '.b-sch-event'
    }, {
      waitForSelectorNotFound: '.b-menu',
      desc: 'Menu hidden on event click'
    }, {
      rightClick: '.b-sch-event'
    }, () => t.selectorNotExists('.b-menu'));
  });
  t.it('LEGACY: Should trigger eventContextMenuItem event', t => {
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      appendTo: document.body,
      features: {
        eventContextMenu: {
          items: {
            foo: {
              text: 'foo'
            }
          }
        }
      }
    });
    t.firesOk(scheduler, {
      eventContextMenuItem: 1
    });
    t.chain({
      rightClick: '.b-sch-event'
    }, {
      click: '.b-menuitem:textEquals(foo)'
    });
  });
  t.it('LEGACY: Should work with AssignmentStore', t => {
    let index = 0;
    scheduler = new Scheduler({
      appendTo: document.body,
      features: {
        eventContextMenu: {
          processItems({
            eventRecord,
            assignmentRecord,
            resourceRecord
          }) {
            t.is(eventRecord, scheduler.eventStore.getAt(0), 'Correct event');
            t.is(assignmentRecord, scheduler.assignmentStore.getAt(index), 'Correct resource');
            t.is(resourceRecord, scheduler.resourceStore.getAt(index), 'Correct assignment');
          }

        }
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
      startDate: '2018-12-10'
    });
    t.chain({
      rightClick: '[data-assignment-id=a1]'
    }, next => {
      index = 1;
      next();
    }, {
      rightClick: '[data-assignment-id=a2]'
    });
  });
  t.it('LEGACY: Should be possible to trigger menu using API', t => {
    scheduler = t.getScheduler({
      features: {
        eventTooltip: false,
        eventContextMenu: true
      },
      startDate: new Date(2011, 0, 7),
      endDate: new Date(2011, 0, 10)
    });

    const menu = scheduler.features.eventContextMenu,
          getEvent = id => scheduler.eventStore.getById(id); // return;


    t.chain({
      waitForEventsToRender: null
    }, next => {
      let event = getEvent(1);
      menu.showContextMenuFor(event);
      t.selectorCountIs('.b-menuitem', 0, 'Menu was not opened because event1 is outside time axis');
      event = getEvent(4);
      t.waitForEvent(scheduler, 'eventcontextmenushow', next);
      menu.showContextMenuFor(event);
    }, next => {
      t.selectorCountIs('.b-menu', 1, 'Event context menu appears');
      const event = scheduler.getElementsFromEventRecord(getEvent(4))[0].getBoundingClientRect(),
            menuBox = document.querySelector('.b-menu').getBoundingClientRect();
      t.ok(event.left < menuBox.left && event.right > menuBox.left, 'Menu is aligned horizontally');
      t.ok(event.top < menuBox.top && event.bottom > menuBox.top, 'Menu is aligned vertically');
      next();
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/8720

  t.it('LEGACY: Should respect scheduler readOnly mode and do not show default items', t => {
    scheduler = t.getScheduler({
      readOnly: true,
      features: {
        eventContextMenu: {
          items: {
            test: {
              text: 'Foo'
            }
          }
        }
      }
    });
    t.chain({
      contextmenu: '.b-sch-event'
    }, {
      waitForSelectors: [['.b-menu .b-menuitem']]
    }, () => {
      t.selectorCountIs('.b-menuitem:not(.b-hidden)', 1, 'Only 1 item visible');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Foo)', 'Extra item is there');
      t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Edit event)', 'Edit item is NOT there');
      t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Copy event)', 'Copy item is NOT there');
      t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Cut event)', 'Cut item is NOT there');
      t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Delete event)', 'Delete item is NOT there');
    });
  });
  t.it('LEGACY: Should respect scheduler readOnly mode which dynamically gets enabled and disabled', t => {
    scheduler = t.getScheduler({
      features: {
        eventContextMenu: {
          items: {
            test: {
              text: 'Foo'
            }
          }
        }
      }
    });
    t.chain({
      contextmenu: '.b-sch-event'
    }, {
      waitForSelectors: [['.b-menu .b-menuitem']]
    }, next => {
      t.selectorCountIs('.b-menuitem:not(.b-hidden)', 5, 'All items are visible');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Foo)', 'Extra item is there');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Edit event)', 'Edit item is there');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Copy event)', 'Copy item is there');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Cut event)', 'Cut item is there');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Delete event)', 'Delete item is there');
      next();
    }, {
      click: '.b-timeline-subgrid'
    }, {
      waitForSelectorNotFound: '.b-menu'
    }, next => {
      scheduler.readOnly = true;
      next();
    }, {
      contextmenu: '.b-sch-event'
    }, {
      waitForSelectors: [['.b-menu .b-menuitem']]
    }, next => {
      t.selectorCountIs('.b-menuitem:not(.b-hidden)', 1, 'Only 1 item visible');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Foo)', 'Extra item is there');
      t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Edit event)', 'Edit item is NOT there');
      t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Copy event)', 'Copy item is NOT there');
      t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Cut event)', 'Cut item is NOT there');
      t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Delete event)', 'Delete item is NOT there');
      next();
    }, {
      click: '.b-timeline-subgrid'
    }, {
      waitForSelectorNotFound: '.b-menu'
    }, next => {
      scheduler.readOnly = false;
      next();
    }, {
      contextmenu: '.b-sch-event'
    }, {
      waitForSelectors: [['.b-menu .b-menuitem']]
    }, () => {
      t.selectorCountIs('.b-menuitem:not(.b-hidden)', 5, 'All items are visible');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Foo)', 'Extra item is there');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Edit event)', 'Edit item is there');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Copy event)', 'Copy item is there');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Cut event)', 'Cut item is there');
      t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Delete event)', 'Delete item is there');
    });
  });
  t.it('LEGACY: Should handle contextMenuTriggerEvent and triggerEvent configs to show menu', t => {
    scheduler = t.getScheduler({
      contextMenuTriggerEvent: 'click',
      features: {
        eventEdit: false,
        eventContextMenu: {
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
      click: '.b-sch-event'
    }, {
      waitForSelector: '.b-menu',
      desc: 'Menu visible'
    }, {
      type: '[ESC]'
    }, {
      waitForSelectorNotFound: '.b-menu',
      desc: 'Menu hidden'
    }, // DblClick event
    async () => {
      scheduler.features.eventContextMenu.triggerEvent = 'dblclick';
    }, {
      dblClick: '.b-sch-event'
    }, {
      waitForSelector: '.b-menu',
      desc: 'Menu visible'
    }, {
      type: '[ESC]'
    }, {
      waitForSelectorNotFound: '.b-menu',
      desc: 'Menu hidden'
    }, // Contextmenu event
    async () => {
      scheduler.features.eventContextMenu.triggerEvent = 'contextmenu';
    }, {
      rightClick: '.b-sch-event'
    }, {
      waitForSelector: '.b-menu',
      desc: 'Menu visible'
    }, {
      type: '[ESC]'
    }, {
      waitForSelectorNotFound: '.b-menu',
      desc: 'Menu hidden'
    });
  });
  t.it('LEGACY: Should activate event context menu by Space click', t => {
    scheduler = t.getScheduler({
      features: {
        eventContextMenu: {
          items: {
            test: {
              text: 'Foo'
            }
          }
        }
      }
    });
    t.chain({
      click: '.b-sch-event'
    }, {
      type: ' '
    }, {
      waitForSelector: '.b-menu',
      desc: 'Menu visible'
    });
  });
  t.it('LEGACY: Should support disabling', t => {
    scheduler = t.getScheduler({
      features: {
        eventContextMenu: true
      }
    });
    scheduler.features.eventContextMenu.disabled = true;
    t.chain({
      rightClick: '.b-sch-event'
    }, next => {
      t.selectorNotExists('.b-menu', 'Menu not shown');
      scheduler.features.eventContextMenu.disabled = false;
      next();
    }, {
      rightClick: '.b-sch-event'
    }, () => {
      t.selectorExists('.b-menu', 'Menu shown');
    });
  });
});