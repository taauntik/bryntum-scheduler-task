
StartTest(t => {
    let scheduler;

    t.beforeEach(() => {
        scheduler && scheduler.destroy();
        scheduler = null;

        // After scheduler destroy, all menuitems must also have been destroyed
        t.is(bryntum.queryAll('menuitem').length, 0, 'Menu items all destroyed');
    });

    t.it('Should work with a disabled dependencyEdit feature', t => {
        scheduler = t.getScheduler({
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
            { contextmenu : '.b-sch-header-timeaxis-cell' },

            () => t.ok(scheduler.features.timeAxisHeaderMenu.menu.isVisible, 'Time axis header context menu is visible')
        );
    });

    t.it('Should not throw an error when timeaxis end date set to same as start date', t => {
        scheduler = t.getScheduler({
            viewPreset : 'dayAndWeek',
            startDate  : new Date(2012, 5, 3),
            endDate    : new Date(2012, 5, 17),
            features   : {
                timeAxisHeaderMenu : true
            }
        }, 1);

        t.chain(
            { rightclick : '.b-sch-header-timeaxis-cell', offset : [5, 5] },

            { moveMouseTo : '.b-menuitem:contains(Date range)' },

            { waitForElementVisible : '.b-datefield:contains(Start date)' },

            // This should not throw
            next => {
                const
                    sd = bryntum.fromElement(t.query('.b-datefield:contains(Start date)')[0]),
                    ed = bryntum.fromElement(t.query('.b-datefield:contains(End date)')[0]);

                t.is(scheduler.timeAxis.count, 14, '14 ticks across TimeAxis');
                ed.value = sd.value;
                t.is(scheduler.timeAxis.count, 1, '1 tics across TimeAxis');

                next();
            }
        );
    });

    t.it('Should not throw an error when timeaxis start date set greater than end date', t => {
        scheduler = t.getScheduler({
            viewPreset : 'hourAndDay',
            startDate  : new Date(2012, 5, 3),
            endDate    : new Date(2012, 5, 3, 6),
            appendTo   : document.body,
            features   : {
                timeAxisHeaderMenu : true
            }
        }, 1);
        let startDateField, endDateField;

        t.chain(
            { rightclick : ':textEquals(12 AM)' },

            { moveMouseTo : '.b-menuitem:contains(Date range)' },

            { waitForElementVisible : '.b-datefield:contains(Start date)' },

            { diag : 'Sanity checks' },

            next => {
                startDateField = bryntum.fromElement(t.query('.b-datefield:contains(Start date)')[0]);
                endDateField = bryntum.fromElement(t.query('.b-datefield:contains(End date)')[0]);

                t.is(startDateField.value, new Date(2012, 5, 3), 'start date field value is correct');
                t.is(endDateField.value, new Date(2012, 5, 3), 'end date field value is correct');

                next();
            },

            { diag : 'Change start date +1 day' },

            {
                click : () => startDateField.triggers.forward.element,
                desc  : 'Clicking to shift start date +1 day ..should not throw exception'
            },

            () => {
                t.is(scheduler.timeAxis.count, 24, '1 ticks across TimeAxis');
                t.is(scheduler.timeAxis.startDate, new Date(2012, 5, 4), 'timeaxis start date is correct');
                t.is(scheduler.timeAxis.endDate, new Date(2012, 5, 5), 'timeaxis end date is correct');
            }
        );
    });

    t.it('Should support adding extraItems', t => {
        scheduler = t.getScheduler({
            viewPreset : 'dayAndWeek',
            startDate  : new Date(2012, 5, 3),
            endDate    : new Date(2012, 5, 17),
            features   : {
                timeAxisHeaderMenu : {
                    items : [
                        {
                            text : 'Foo'
                        },
                        {
                            text : 'Bar'
                        }
                    ]
                }
            }
        }, 1);

        t.chain(
            { rightclick : '.b-sch-header-timeaxis-cell', offset : [5, 5] },

            { waitForSelector : '.b-menuitem:contains(Foo)' },
            { waitForSelector : '.b-menuitem:contains(Bar)' }
        );
    });

    t.it('Should support manipulating default menu items', t => {
        scheduler = t.getScheduler({
            viewPreset : 'dayAndWeek',
            startDate  : new Date(2012, 5, 3),
            endDate    : new Date(2012, 5, 17),
            features   : {
                timeAxisHeaderMenu : {
                    processItems({ items }) {
                        t.is(Object.keys(items).length, 5, '3 builtin items, 2 custom extra items');

                        // Filter out Bar item
                        items.bar = false;
                    },
                    items : {
                        foo : {
                            text : 'Foo'
                        },
                        bar : {
                            text : 'Bar'
                        }
                    }
                }
            }
        }, 1);

        t.chain(
            { rightclick : '.b-sch-header-timeaxis-cell', offset : [5, 5] },
            { waitForSelector : '.b-menuitem:contains(Foo)' },
            { waitForSelectorNotFound : '.b-menuitem:contains(Bar)' }
        );
    });

    t.it('Should handle triggerEvent config to show menu', t => {
        scheduler = t.getScheduler({
            features : {
                timeAxisHeaderMenu : {
                    triggerEvent : 'click'
                }
            }
        });

        t.chain(
            // Click event
            { click : '.b-sch-header-timeaxis-cell' },
            { waitForSelector : '.b-menu', desc : 'Menu visible' },
            { type : '[ESC]]' },
            { waitForSelectorNotFound : '.b-menu', desc : 'Menu hidden' },

            // DblClick event
            async() => {
                scheduler.features.timeAxisHeaderMenu.triggerEvent = 'dblclick';
            },

            { dblClick : '.b-sch-header-timeaxis-cell' },
            { waitForSelector : '.b-menu', desc : 'Menu visible' },
            { type : '[ESC]]' },
            { waitForSelectorNotFound : '.b-menu', desc : 'Menu hidden' },

            // Contextmenu event
            async() => {
                scheduler.features.timeAxisHeaderMenu.triggerEvent = 'contextmenu';
            },
            { rightClick : '.b-sch-header-timeaxis-cell' },
            { waitForSelector : '.b-menu', desc : 'Menu visible' },
            { type : '[ESC]]' },
            { waitForSelectorNotFound : '.b-menu', desc : 'Menu hidden' }
        );
    });

    t.it('Should support disabling', t => {
        scheduler = t.getScheduler({
            features : {
                timeAxisHeaderMenu : true
            }
        });

        scheduler.features.timeAxisHeaderMenu.disabled = true;

        t.chain(
            { rightClick : '.b-sch-timeaxiscolumn' },

            next => {
                t.selectorNotExists('.b-menu', 'No menu displayed');

                scheduler.features.timeAxisHeaderMenu.disabled = false;

                next();
            },

            { rightClick : '.b-sch-timeaxiscolumn' },

            () => {
                t.selectorExists('.b-menu', 'Menu displayed');
            }
        );
    });
});
