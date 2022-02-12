import { Scheduler, ObjectHelper, VersionHelper } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();

        // After scheduler destroy, all menuitems must also have been destroyed
        t.is(bryntum.queryAll('menuitem').length, 0, 'Menu items all destroyed');
    });

    t.it('Should work with a disabled dependencyEdit feature', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            features   : {
                eventMenu    : true,
                dependencies : {
                    disabled : false
                },
                dependencyEdit : {
                    disabled : true
                }
            }
        }, 3);
        t.chain(
            { contextmenu : '.b-sch-event' },

            () => t.ok(scheduler.features.eventMenu.menu.isVisible, 'Event context menu is visible')
        );
    });

    t.it('Removing event from context menu by keyboard action should focus next event', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            appendTo   : document.body,
            features   : {
                eventMenu : true
            }
        }, 3);

        t.chain(
            { contextmenu : '.b-sch-event' },

            // Key down to the delete option.
            // Focus reversion only happens if using keyboard
            { type : '[DOWN]' },
            { type : '[DOWN]' },
            { type : '[DOWN]' },
            { type : '[DOWN]' },
            { type : ' ' },

            // Wait for next one to be focused
            { waitFor : () => document.activeElement === scheduler.getElementFromEventRecord(scheduler.eventStore.first).parentNode },

            // Then move on to last one
            { type : '[RIGHT]' },

            () => {
                t.ok(document.activeElement.firstElementChild.classList.contains('event3'), 'Last event is focused');
            }
        );
    });

    t.it('Should be able to add extra items to the menu', async t => {
        let clicked = false;

        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            appendTo   : document.body,
            features   : {
                // Gets in the way in FF
                eventTooltip : false,
                eventMenu    : {
                    items : {
                        extra : {
                            text : 'Extra',
                            icon : 'b-fa .b-fa-fw .b-fa-fish',
                            onItem() {
                                clicked = true;
                            }
                        }
                    }
                }
            }
        }, 3);

        t.chain(
            // Utility method to create steps to show contextmenu and click item.
            t.eventContextMenuSteps(scheduler, scheduler.eventStore.first, 'Extra'),
            () => {
                t.ok(clicked, 'Click registered');
            }
        );
    });

    t.it('Should be able to process items shown for an event', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            appendTo   : document.body,
            features   : {
                eventMenu : {
                    items : {
                        foo : { text : 'foo' }
                    },
                    processItems({ eventRecord, items }) {
                        if (eventRecord === scheduler.eventStore.getAt(1)) {
                            items.extra = {
                                text : 'Extra'
                            };

                            t.is(ObjectHelper.getTruthyKeys(items).filter(ref => !items[ref].hidden).length, 6, '6 items (4 default, one extra on feature config, one added dynamically)');
                        }

                        if (eventRecord === scheduler.eventStore.getAt(2)) {
                            return false;
                        }
                    }
                }
            }
        }, 3);

        t.chain(
            { rightClick : '[data-event-id="2"]' },

            next => {
                t.selectorExists('.b-menu');
                t.selectorExists(':textEquals(Extra)', 'Item found');
                next();
            },

            { rightClick : '[data-event-id="1"]' },

            next => {
                t.selectorNotExists(':textEquals(Extra)', 'Item not found');
                next();
            },

            { click : '[data-event-id="3"]', desc : 'Clicking to hide menu' },

            { waitForSelectorNotFound : '.b-menu', desc : 'Menu hidden' },

            { rightClick : '[data-event-id="3"]' },

            () => {
                t.selectorNotExists('.b-menu', 'No menu shown');
            }
        );
    });

    t.it('Should trigger eventMenuBeforeShow & eventMenuShow events', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            appendTo   : document.body,
            features   : {
                eventMenu : true
            }
        });

        t.firesOk(scheduler, {
            eventMenuBeforeShow : 2,
            eventMenuShow       : 1
        });

        t.chain(
            { rightClick : '.b-sch-event' },

            { waitForSelector : '.b-menu', desc : 'Menu shown' },

            next => {
                scheduler.on('eventMenuBeforeShow', () => false);
                next();
            },

            { click : '.b-sch-event' },

            { waitForSelectorNotFound : '.b-menu', desc : 'Menu hidden on event click' },

            { rightClick : '.b-sch-event' },

            () => t.selectorNotExists('.b-menu')
        );
    });

    t.it('LEGACY: Should trigger eventContextMenuBeforeShow & eventContextMenuShow events', async t => {
        const spy = t.spyOn(VersionHelper, 'deprecate').and.callFake(() => {});

        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            appendTo   : document.body,
            features   : {
                eventMenu : true
            }
        });

        t.firesOk(scheduler, {
            eventContextMenuBeforeShow : 1,
            eventContextMenuShow       : 1
        });

        t.chain(
            { rightClick : '.b-sch-event' },
            () => {
                t.expect(spy).toHaveBeenCalled(2);
                // Fired at least once with the specified arguments:
                t.expect(spy).toHaveBeenCalledWith('Scheduler', '5.0.0', '`eventContextMenuBeforeShow` event is deprecated, in favor of `eventMenuBeforeShow` event. Please see https://bryntum.com/docs/scheduler/guide/Scheduler/upgrades/3.1.0 for more information.');
                t.expect(spy).toHaveBeenCalledWith('Scheduler', '5.0.0', '`eventContextMenuShow` event is deprecated, in favor of `eventMenuShow` event. Please see https://bryntum.com/docs/scheduler/guide/Scheduler/upgrades/3.1.0 for more information.');
            }
        );
    });

    t.it('Should trigger eventMenuItem event', async t => {
        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            appendTo   : document.body,
            features   : {
                eventMenu : {
                    items : {
                        foo : { text : 'foo' }
                    }
                }
            }
        });

        t.firesOk(scheduler, {
            eventMenuItem : 1
        });

        t.chain(
            { rightClick : '.b-sch-event' },
            { click : '.b-menuitem:not(.b-hidden) :textEquals(foo)' }
        );
    });

    t.it('LEGACY: Should trigger eventContextMenuItem event', async t => {
        const spy = t.spyOn(VersionHelper, 'deprecate').and.callFake(() => {});

        scheduler = await t.getSchedulerAsync({
            viewPreset : 'dayAndWeek',
            appendTo   : document.body,
            features   : {
                eventMenu : {
                    items : {
                        foo : { text : 'foo' }
                    }
                }
            }
        });

        t.firesOk(scheduler, {
            eventContextMenuItem : 1
        });

        t.chain(
            { rightClick : '.b-sch-event' },
            { click : '.b-menuitem:not(.b-hidden) :textEquals(foo)' },
            () => {
                t.expect(spy).toHaveBeenCalled(1);
                t.expect(spy).toHaveBeenCalledWith('Scheduler', '5.0.0', '`eventContextMenuItem` event is deprecated, in favor of `eventMenuItem` event. Please see https://bryntum.com/docs/scheduler/guide/Scheduler/upgrades/3.1.0 for more information.');
            }
        );
    });

    t.it('Should work with AssignmentStore', async t => {
        let index = 0;

        scheduler = new Scheduler({
            appendTo : document.body,

            features : {
                eventMenu : {
                    processItems({ eventRecord, assignmentRecord, resourceRecord }) {
                        t.is(eventRecord, scheduler.eventStore.getAt(0), 'Correct event');
                        t.is(assignmentRecord, scheduler.assignmentStore.getAt(index), 'Correct resource');
                        t.is(resourceRecord, scheduler.resourceStore.getAt(index), 'Correct assignment');
                    }
                }
            },

            assignments : [
                { id : 'a1', eventId : 'e1', resourceId : 'r1' },
                { id : 'a2', eventId : 'e1', resourceId : 'r2' }
            ],
            events : [
                { id : 'e1', startDate : '2018-12-14', duration : 8 }
            ],
            resources : [
                { id : 'r1' },
                { id : 'r2' }
            ],

            startDate : '2018-12-10'
        });

        t.chain(
            { rightClick : '[data-assignment-id=a1]' },

            next => {
                index = 1;
                next();
            },

            { rightClick : '[data-assignment-id=a2]' }
        );
    });

    t.it('Should be possible to trigger menu using API', async t => {
        scheduler = await t.getSchedulerAsync({
            appendTo : document.body,

            features : {
                eventTooltip : false,
                eventMenu    : true
            },

            startDate : new Date(2011, 0, 7),
            endDate   : new Date(2011, 0, 10)
        });

        const
            menu     = scheduler.features.eventMenu,
            getEvent = id => scheduler.eventStore.getById(id);

        // return;
        t.chain(
            { waitForSelector : '.b-sch-event' },
            next => {
                let event = getEvent(1);
                menu.showContextMenuFor(event);
                t.selectorCountIs('.b-menuitem', 0, 'Menu was not opened because event1 is outside time axis');

                event = getEvent(4);
                t.waitForEvent(scheduler, 'eventmenushow', next);
                menu.showContextMenuFor(event);
            },
            next => {
                t.selectorCountIs('.b-menu', 1, 'Event context menu appears');
                const
                    event   = scheduler.getElementsFromEventRecord(getEvent(4))[0].getBoundingClientRect(),
                    menuBox = document.querySelector('.b-menu').getBoundingClientRect();

                t.ok(event.left < menuBox.left && event.right > menuBox.left, 'Menu is aligned horizontally');
                t.ok(event.top < menuBox.top && event.bottom > menuBox.top, 'Menu is aligned vertically');
                next();
            }
        );
    });

    // https://app.assembla.com/spaces/bryntum/tickets/8720
    t.it('Should respect scheduler readOnly mode and do not show default items', async t => {
        scheduler = await t.getSchedulerAsync({
            readOnly : true,
            features : {
                eventMenu : {
                    items : {
                        test : {
                            text : 'Foo'
                        }
                    }
                }
            }
        });

        t.chain(
            { contextmenu : '.b-sch-event' },
            { waitForSelector : '.b-menu .b-menuitem:not(.b-hidden)' },
            () => {
                t.selectorCountIs('.b-menuitem:not(.b-hidden) ', 1, 'Only 1 item visible');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Foo)', 'Extra item is there');
                t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Edit event)', 'Edit item is NOT there');
                t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Copy event)', 'Copy item is NOT there');
                t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Cut event)', 'Cut item is NOT there');
                t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Delete event)', 'Delete item is NOT there');
            }
        );
    });

    t.it('Should respect scheduler readOnly mode which dynamically gets enabled and disabled', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventMenu : {
                    items : {
                        test : {
                            text : 'Foo'
                        }
                    }
                }
            }
        });

        t.chain(
            { contextmenu : '.b-sch-event' },
            { waitForSelectors : [['.b-menu .b-menuitem:not(.b-hidden) ']] },
            next => {
                t.selectorCountIs('.b-menuitem:not(.b-hidden)', 5, 'All items are visible');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Foo)', 'Extra item is there');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Edit event)', 'Edit item is there');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Copy event)', 'Copy item is there');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Cut event)', 'Cut item is there');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Delete event)', 'Delete item is there');
                next();
            },

            { click : '.b-timeline-subgrid' },
            { waitForSelectorNotFound : '.b-menu' },
            next => {
                scheduler.readOnly = true;
                next();
            },

            { contextmenu : '.b-sch-event' },
            { waitForSelectors : [['.b-menu .b-menuitem:not(.b-hidden) ']] },
            next => {
                t.selectorCountIs('.b-menuitem:not(.b-hidden) ', 1, 'Only 1 item visible');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Foo)', 'Extra item is there');
                t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Edit event)', 'Edit item is NOT there');
                t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Copy event)', 'Copy item is NOT there');
                t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Cut event)', 'Cut item is NOT there');
                t.selectorNotExists('.b-menuitem:not(.b-hidden) :textEquals(Delete event)', 'Delete item is NOT there');
                next();
            },

            { click : '.b-timeline-subgrid' },
            { waitForSelectorNotFound : '.b-menu' },
            next => {
                scheduler.readOnly = false;
                next();
            },

            { contextmenu : '.b-sch-event' },
            { waitForSelectors : [['.b-menu .b-menuitem:not(.b-hidden) ']] },
            () => {
                t.selectorCountIs('.b-menuitem:not(.b-hidden) ', 5, 'All items are visible');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Foo)', 'Extra item is there');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Edit event)', 'Edit item is there');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Copy event)', 'Copy item is there');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Cut event)', 'Cut item is there');
                t.selectorExists('.b-menuitem:not(.b-hidden) :textEquals(Delete event)', 'Delete item is there');
            }
        );
    });

    t.it('Should handle contextMenuTriggerEvent and triggerEvent configs to show menu', async t => {
        scheduler = await t.getSchedulerAsync({
            contextMenuTriggerEvent : 'click',
            features                : {
                eventEdit : false,
                eventMenu : {
                    items : {
                        test : {
                            text : 'Foo'
                        }
                    }
                }
            }
        });

        t.chain(
            // Click event
            { click : '.b-sch-event' },
            { waitForSelector : '.b-menu', desc : 'Menu visible' },
            { type : '[ESC]' },
            { waitForSelectorNotFound : '.b-menu', desc : 'Menu hidden' },

            // DblClick event
            async() => {
                scheduler.features.eventMenu.triggerEvent = 'dblclick';
            },

            { dblClick : '.b-sch-event' },
            { waitForSelector : '.b-menu', desc : 'Menu visible' },
            { type : '[ESC]' },
            { waitForSelectorNotFound : '.b-menu', desc : 'Menu hidden' },

            // Contextmenu event
            async() => {
                scheduler.features.eventMenu.triggerEvent = 'contextmenu';
            },
            { rightClick : '.b-sch-event' },
            { waitForSelector : '.b-menu', desc : 'Menu visible' },
            { type : '[ESC]' },
            { waitForSelectorNotFound : '.b-menu', desc : 'Menu hidden' }
        );
    });

    t.it('Should activate event context menu by Space click', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventMenu : {
                    items : {
                        test : {
                            text : 'Foo'
                        }
                    }
                }
            }
        });
        t.chain(
            { click : '.b-sch-event' },
            { type : ' ' },
            { waitForSelector : '.b-menu', desc : 'Menu visible' }
        );
    });

    t.it('Should support disabling', async t => {
        scheduler = await t.getSchedulerAsync({
            features : {
                eventMenu : true
            }
        });

        scheduler.features.eventMenu.disabled = true;

        t.chain(
            { rightClick : '.b-sch-event' },

            next => {
                t.selectorNotExists('.b-menu', 'Menu not shown');

                scheduler.features.eventMenu.disabled = false;

                next();
            },

            { rightClick : '.b-sch-event' },

            () => {
                t.selectorExists('.b-menu', 'Menu shown');
            }
        );
    });

    // https://github.com/bryntum/support/issues/2800
    t.it('Should delete all selected events ', async t => {
        scheduler = await t.getScheduler({
            features : {
                eventMenu : true
            }
        });

        scheduler.selectedEvents = scheduler.eventStore.records;

        t.chain(
            { rightClick : '.b-sch-event' },
            { click : '.b-menuitem:contains(Delete)' },
            () =>  {
                t.selectorCountIs(scheduler.unreleasedEventSelector, 0, 'All events removed from DOM');
                t.is(scheduler.eventStore.count, 0, 'All events removed');
            }
        );
    });
});
