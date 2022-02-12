"use strict";

StartTest(t => {
  let scheduler, firstRec, lastRec;
  t.beforeEach(t => {
    scheduler && scheduler.destroy();
    scheduler = null;
  });

  async function setup(config = {}, editRecords = true) {
    scheduler && scheduler.destroy();
    scheduler = t.getScheduler(Object.assign({
      features: {
        eventTooltip: false,
        eventEdit: true // is enabled by default already, but in case we change our minds...

      },
      allowOverlap: false,
      forceFit: true,
      appendTo: document.body
    }, config));
    firstRec = scheduler.eventStore.first;
    lastRec = scheduler.eventStore.last;

    if (editRecords) {
      firstRec.cls = 'FOO';
      lastRec.cls = 'BAR';
      lastRec.assign(firstRec.resource);
      lastRec.setStartDate(firstRec.endDate, true);
    }

    await t.waitForProjectReady();
  }

  t.describe('legacy customization', t => {
    // region https://app.assembla.com/spaces/bryntum/tickets/6871
    t.it('Should display extra fields at correct positions: Test 1 and Test 2 should go last (default)', async t => {
      const expectedWidgets = ['nameField', 'resourceField', 'startDateField', 'startTimeField', 'endDateField', 'endTimeField', 'recurrenceCombo', 'editRecurrenceButton', 'test1Field', 'test2Field'];
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            extraItems: [{
              type: 'text',
              label: 'Test 1',
              ref: 'test1Field'
            }, {
              type: 'text',
              label: 'Test 2',
              ref: 'test2Field'
            }]
          }
        }
      }, false); // Order of widgets should be correct in config when sorted by weight

      const refs = Object.entries(scheduler.eventEdit.editorConfig.items).sort((lhs, rhs) => lhs[1].weight - rhs[1].weight).map(([ref]) => ref);
      t.is(refs.join('|'), expectedWidgets.join('|'), 'Displays all widgets at correct positions');
    });
    t.it('Should display extra fields at correct positions: Test 1 and Test 2 should go first', async t => {
      const expectedWidgets = ['test1Field', 'test2Field', 'nameField', 'resourceField', 'startDateField', 'startTimeField', 'endDateField', 'endTimeField', 'recurrenceCombo', 'editRecurrenceButton'];
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            extraItems: [{
              type: 'text',
              label: 'Test 1',
              ref: 'test1Field',
              index: 0
            }, {
              type: 'text',
              label: 'Test 2',
              ref: 'test2Field',
              index: 1
            }]
          }
        }
      }, false); // Order of widgets should be correct in config when sorted by weight

      const refs = Object.entries(scheduler.eventEdit.editorConfig.items).sort((lhs, rhs) => lhs[1].weight - rhs[1].weight).map(([ref]) => ref);
      t.is(refs.join('|'), expectedWidgets.join('|'), 'Displays all widgets at correct positions');
    });
    t.it('Should display extra fields at correct positions: Test 1 and Test 2 should go last (same as default)', async t => {
      const expectedWidgets = ['nameField', 'resourceField', 'startDateField', 'startTimeField', 'endDateField', 'endTimeField', 'recurrenceCombo', 'editRecurrenceButton', 'test1Field', 'test2Field'];
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            extraItems: [{
              type: 'text',
              label: 'Test 2',
              ref: 'test2Field',
              index: 100
            }, {
              type: 'text',
              label: 'Test 1',
              ref: 'test1Field',
              index: 99
            }]
          }
        }
      }, false); // Order of widgets should be correct in config when sorted by weight

      const refs = Object.entries(scheduler.eventEdit.editorConfig.items).sort((lhs, rhs) => lhs[1].weight - rhs[1].weight).map(([ref]) => ref);
      t.is(refs.join('|'), expectedWidgets.join('|'), 'Displays all widgets at correct positions');
    });
    t.it('Should display extra fields at correct positions: Test 1 should go first, Test 2 should go last (default)', async t => {
      const expectedWidgets = ['test1Field', 'nameField', 'resourceField', 'startDateField', 'startTimeField', 'endDateField', 'endTimeField', 'recurrenceCombo', 'editRecurrenceButton', 'test2Field'];
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            extraItems: [{
              type: 'text',
              label: 'Test 1',
              ref: 'test1Field',
              index: 0
            }, {
              type: 'text',
              label: 'Test 2',
              ref: 'test2Field'
            }]
          }
        }
      }, false); // Order of widgets should be correct in config when sorted by weight

      const refs = Object.entries(scheduler.eventEdit.editorConfig.items).sort((lhs, rhs) => lhs[1].weight - rhs[1].weight).map(([ref]) => ref);
      t.is(refs.join('|'), expectedWidgets.join('|'), 'Displays all widgets at correct positions');
    });
    t.it('Should display extra fields at correct positions: Test 1 should go first, Test 2 should go last (same as default)', async t => {
      const expectedWidgets = ['test1Field', 'nameField', 'resourceField', 'startDateField', 'startTimeField', 'endDateField', 'endTimeField', 'recurrenceCombo', 'editRecurrenceButton', 'test2Field'];
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            extraItems: [{
              type: 'text',
              label: 'Test 1',
              ref: 'test1Field',
              index: 0
            }, {
              type: 'text',
              label: 'Test 2',
              ref: 'test2Field',
              index: 100
            }]
          }
        }
      }, false); // Order of widgets should be correct in config when sorted by weight

      const refs = Object.entries(scheduler.eventEdit.editorConfig.items).sort((lhs, rhs) => lhs[1].weight - rhs[1].weight).map(([ref]) => ref);
      t.is(refs.join('|'), expectedWidgets.join('|'), 'Displays all widgets at correct positions');
    }); // endregion https://app.assembla.com/spaces/bryntum/tickets/6871

    t.it('Should support configuring startDate, startTime, endDate and endTime fields', async t => {
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            startDateConfig: {
              editable: false
            },
            endDateConfig: {
              editable: false
            },
            startTimeConfig: {
              editable: false
            },
            endTimeConfig: {
              editable: false
            }
          }
        }
      }, false);
      scheduler.editEvent(scheduler.eventStore.first);
      t.chain({
        waitFor: () => bryntum.query('timefield')
      }, () => {
        const edit = scheduler.features.eventEdit;
        t.is(edit.startDateField.editable, false, 'startDateConfig');
        t.is(edit.startTimeField.editable, false, 'startDateConfig');
        t.is(edit.endDateField.editable, false, 'startTimeConfig');
        t.is(edit.endTimeField.editable, false, 'endTimeConfig');
      });
    }); // https://app.assembla.com/spaces/bryntum/tickets/7519

    t.it('Should create accessors for all fields with ref or id', async t => {
      const expectedAccessors = ['nameField', 'resourceField', 'startDateField', 'startTimeField', 'endDateField', 'endTimeField', 'test2', 'test1', 'saveButton', 'deleteButton', 'cancelButton'];
      const async = t.beginAsync();
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            extraItems: [{
              type: 'text',
              label: 'Test 2',
              id: 'test2'
            }, {
              type: 'text',
              label: 'Test 1',
              ref: 'test1'
            }]
          }
        },
        listeners: {
          beforeEventEditShow({
            eventEdit
          }) {
            expectedAccessors.forEach(name => t.ok(name in eventEdit, `Accessor for ${name} found`));
            t.endAsync(async);
          }

        }
      }, false);
      scheduler.editEvent(scheduler.eventStore.first);
    });
    t.it('Should be able to filter resource combo', async t => {
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: true
        },
        listeners: {
          beforeEventEditShow({
            eventEdit
          }) {
            eventEdit.resourceField.store.filter(r => r.name.length > 3);
          }

        }
      }, false);
      scheduler.editEvent(scheduler.eventStore.first);
      t.chain({
        click: '.b-combo .b-fieldtrigger'
      }, () => {
        t.selectorCountIs('.b-list-item', 5, 'Combo filtered');
      });
    }); // https://app.assembla.com/spaces/bryntum/tickets/8878

    t.it('Specifying listeners for event editor should not break drag create feature and tooltip', async t => {
      let counter = 0; // failed to check that this function is called with isCalledOnce, used `counter` instead

      const beforeCloseHandler = function () {
        counter++;
      };

      scheduler = t.getScheduler({
        features: {
          eventTooltip: true,
          eventEdit: {
            editorConfig: {
              listeners: {
                beforeclose: beforeCloseHandler
              }
            }
          }
        }
      });
      t.firesOnce(scheduler.features.eventEdit.getEditor(), 'beforehide');
      t.chain({
        drag: '.b-sch-timeaxis-cell',
        fromOffset: [20, 20],
        by: [50, 0]
      }, {
        click: 'button:contains(Cancel)'
      }, {
        waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
      }, next => {
        t.is(counter, 1, 'beforeCloseHandler has been called once');
        next();
      }, {
        waitForSelectorNotFound: '.b-sch-dragcreator-proxy'
      }, {
        moveCursorTo: '.b-sch-event'
      }, {
        waitForSelector: '.b-sch-event-tooltip'
      });
    }); // https://app.assembla.com/spaces/bryntum/tickets/7809

    t.it('Changing eventType should toggle fields', async t => {
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            extraItems: [{
              type: 'combo',
              cls: 'event-type',
              label: 'Type',
              ref: 'eventTypeField',
              name: 'eventType',
              items: ['Shazam', 'Meeting']
            }, {
              type: 'text',
              label: 'Location',
              ref: 'locationField',
              dataset: {
                eventType: 'Meeting'
              }
            }]
          }
        },
        eventStore: t.getEventStore({
          fields: ['eventType']
        })
      }, false);
      let editor;
      t.chain({
        dblclick: '.b-sch-event'
      }, next => {
        editor = scheduler.features.eventEdit.editor;
        t.is(editor.widgetMap.locationField.isVisible, false, 'Location not visible');
        next();
      }, {
        type: 'Meeting[ENTER]',
        target: '.event-type input',
        clearExisting: true
      }, next => {
        t.is(editor.widgetMap.locationField.isVisible, true, 'Location visible');
        t.selectorExists('.b-eventeditor[data-event-type=Meeting]', 'Event type applied to dataset');
        next();
      }, {
        click: 'button:textEquals(Save)'
      }, {
        dblclick: '.b-sch-event'
      }, next => {
        t.is(editor.widgetMap.locationField.isVisible, true, 'Location visible');
        t.selectorExists('.b-eventeditor[data-event-type=Meeting]', 'Event type applied to dataset');
        next();
      }, {
        type: 'Shazam[ENTER]',
        target: '.event-type input',
        clearExisting: true
      }, () => {
        t.is(editor.widgetMap.locationField.isVisible, false, 'Location not visible');
        t.selectorExists('.b-eventeditor[data-event-type=Shazam]', 'Event type applied to dataset');
      });
    });
  });
  t.describe('items object-based customization', t => {
    t.it('Should insert items according to weight', async t => {
      const expectedWidgets = ['test1Field', 'nameField', 'resourceField', 'startDateField', 'startTimeField', 'endDateField', 'endTimeField', 'recurrenceCombo', 'editRecurrenceButton', 'test2Field'];
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            items: {
              test1Field: {
                type: 'text',
                label: 'Test 1',
                ref: 'test1Field',
                weight: 0
              },
              test2Field: {
                type: 'text',
                label: 'Test 2',
                ref: 'test2Field',
                weight: 2000
              }
            }
          }
        }
      }, false); // Order of widgets should be correct in config when sorted by weight

      const refs = Object.entries(scheduler.eventEdit.editorConfig.items).sort((lhs, rhs) => lhs[1].weight - rhs[1].weight).map(([ref]) => ref);
      t.is(refs.join('|'), expectedWidgets.join('|'), 'Displays all widgets at correct positions');
    });
    t.it('Should support configuring startDate, startTime, endDate and endTime fields', async t => {
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            items: {
              startDateField: {
                editable: false
              },
              endDateField: {
                editable: false
              },
              startTimeField: {
                editable: false
              },
              endTimeField: {
                editable: false
              }
            }
          }
        }
      }, false);
      scheduler.editEvent(scheduler.eventStore.first);
      t.chain({
        waitFor: () => bryntum.query('timefield')
      }, () => {
        const edit = scheduler.features.eventEdit;
        t.is(edit.startDateField.editable, false, 'startDateConfig');
        t.is(edit.startTimeField.editable, false, 'startDateConfig');
        t.is(edit.endDateField.editable, false, 'startTimeConfig');
        t.is(edit.endTimeField.editable, false, 'endTimeConfig');
      });
    }); // https://app.assembla.com/spaces/bryntum/tickets/7519

    t.it('Should create accessors for all fields with ref or id', async t => {
      const expectedAccessors = ['nameField', 'resourceField', 'startDateField', 'startTimeField', 'endDateField', 'endTimeField', 'test2', 'test1', 'saveButton', 'deleteButton', 'cancelButton'];
      const async = t.beginAsync();
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            items: {
              test2: {
                type: 'text',
                label: 'Test 2',
                id: 'test2'
              },
              test1: {
                type: 'text',
                label: 'Test 1'
              }
            }
          }
        },
        listeners: {
          beforeEventEditShow({
            eventEdit
          }) {
            expectedAccessors.forEach(name => t.ok(name in eventEdit, `Accessor for ${name} found`));
            t.endAsync(async);
          }

        }
      }, false);
      scheduler.editEvent(scheduler.eventStore.first);
    });
    t.it('Should be able to filter resource combo', async t => {
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: true
        },
        listeners: {
          beforeEventEditShow({
            eventEdit
          }) {
            eventEdit.resourceField.store.filter(r => r.name.length > 3);
          }

        }
      }, false);
      scheduler.editEvent(scheduler.eventStore.first);
      t.chain({
        click: '.b-combo .b-fieldtrigger'
      }, () => {
        t.selectorCountIs('.b-list-item', 5, 'Combo filtered');
      });
    }); // https://app.assembla.com/spaces/bryntum/tickets/8878

    t.it('Specifying listeners for event editor should not break drag create feature and tooltip', t => {
      let counter = 0; // failed to check that this function is called with isCalledOnce, used `counter` instead

      const beforeCloseHandler = function () {
        counter++;
      };

      scheduler = t.getScheduler({
        features: {
          eventTooltip: true,
          eventEdit: {
            editorConfig: {
              listeners: {
                beforeclose: beforeCloseHandler
              }
            }
          }
        }
      });
      t.firesOnce(scheduler.features.eventEdit.getEditor(), 'beforehide');
      t.chain({
        drag: '.b-sch-timeaxis-cell',
        fromOffset: [20, 20],
        by: [50, 0]
      }, {
        click: 'button:contains(Cancel)'
      }, {
        waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
      }, next => {
        t.is(counter, 1, 'beforeCloseHandler has been called once');
        next();
      }, {
        waitForSelectorNotFound: '.b-sch-dragcreator-proxy'
      }, {
        moveCursorTo: '.b-sch-event'
      }, {
        waitForSelector: '.b-sch-event-tooltip'
      });
    }); // https://app.assembla.com/spaces/bryntum/tickets/7809

    t.it('Changing eventType should toggle fields', async t => {
      await setup({
        features: {
          eventTooltip: false,
          eventEdit: {
            items: {
              eventTypeField: {
                type: 'combo',
                cls: 'event-type',
                label: 'Type',
                ref: 'eventTypeField',
                name: 'eventType',
                items: ['Shazam', 'Meeting']
              },
              locationField: {
                type: 'text',
                label: 'Location',
                ref: 'locationField',
                dataset: {
                  eventType: 'Meeting'
                }
              }
            }
          }
        },
        eventStore: t.getEventStore({
          fields: ['eventType']
        })
      }, false);
      let editor;
      t.chain({
        dblclick: '.b-sch-event'
      }, next => {
        editor = scheduler.features.eventEdit.editor;
        t.is(editor.widgetMap.locationField.isVisible, false, 'Location not visible');
        next();
      }, {
        type: 'Meeting[ENTER]',
        target: '.event-type input',
        clearExisting: true
      }, next => {
        t.is(editor.widgetMap.locationField.isVisible, true, 'Location visible');
        t.selectorExists('.b-eventeditor[data-event-type=Meeting]', 'Event type applied to dataset');
        next();
      }, {
        click: 'button:textEquals(Save)'
      }, {
        dblclick: '.b-sch-event'
      }, next => {
        t.is(editor.widgetMap.locationField.isVisible, true, 'Location visible');
        t.selectorExists('.b-eventeditor[data-event-type=Meeting]', 'Event type applied to dataset');
        next();
      }, {
        type: 'Shazam[ENTER]',
        target: '.event-type input',
        clearExisting: true
      }, () => {
        t.is(editor.widgetMap.locationField.isVisible, false, 'Location not visible');
        t.selectorExists('.b-eventeditor[data-event-type=Shazam]', 'Event type applied to dataset');
      });
    });
  });
});