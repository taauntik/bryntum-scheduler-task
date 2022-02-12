"use strict";

// https://app.assembla.com/spaces/bryntum/tickets/8842
StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    scheduler && scheduler.destroy();
    scheduler = null;
  }); //region Should fire beforeclose/beforehide/hide once

  t.it('Should fire beforeclose/beforehide/hide once on cancel click', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: true
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.firesOnce(editor, 'beforeclose');
    t.firesOnce(editor, 'beforehide');
    t.firesOnce(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'button:textEquals(Cancel)'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    });
  });
  t.it('Should fire beforeclose/beforehide/hide once on delete click', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: true
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.firesOnce(editor, 'beforeclose');
    t.firesOnce(editor, 'beforehide');
    t.firesOnce(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'button:textEquals(Delete)'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    });
  });
  t.it('Should fire beforeclose/beforehide/hide once on save click', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: true
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.firesOnce(editor, 'beforeclose');
    t.firesOnce(editor, 'beforehide');
    t.firesOnce(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'button:textEquals(Save)'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    });
  });
  t.it('Should fire beforeclose/beforehide/hide once on Enter click', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: true
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.firesOnce(editor, 'beforeclose');
    t.firesOnce(editor, 'beforehide');
    t.firesOnce(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'input[name=name]'
    }, {
      type: 'foo[ENTER]'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    });
  });
  t.it('Should fire beforeclose/beforehide/hide once on close icon click', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: true
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.firesOnce(editor, 'beforeclose');
    t.firesOnce(editor, 'beforehide');
    t.firesOnce(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: '.b-popup-close'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    });
  });
  t.it('Should fire beforeclose/beforehide/hide once on outside click', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: true
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.firesOnce(editor, 'beforeclose');
    t.firesOnce(editor, 'beforehide');
    t.firesOnce(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      waitForSelector: '.b-eventeditor:not(.b-hidden)'
    }, {
      click: '.b-grid-cell'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    });
  }); //endregion
  //region Should fire beforeclose/beforehide/hide once when autoClose and closable are false

  t.it('Should fire beforeclose/beforehide/hide once on cancel click when autoClose and closable are false', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: {
          closable: false,
          autoClose: false
        }
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.firesOnce(editor, 'beforeclose');
    t.firesOnce(editor, 'beforehide');
    t.firesOnce(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'button:textEquals(Cancel)'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    });
  });
  t.it('Should fire beforeclose/beforehide/hide once on delete click when autoClose and closable are false', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: {
          closable: false,
          autoClose: false
        }
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.firesOnce(editor, 'beforeclose');
    t.firesOnce(editor, 'beforehide');
    t.firesOnce(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'button:textEquals(Delete)'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    });
  });
  t.it('Should fire beforeclose/beforehide/hide once on save click when autoClose and closable are false', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: {
          closable: false,
          autoClose: false
        }
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.firesOnce(editor, 'beforeclose');
    t.firesOnce(editor, 'beforehide');
    t.firesOnce(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'button:textEquals(Save)'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    });
  });
  t.it('Should fire beforeclose/beforehide/hide once on Enter click when autoClose and closable are false', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: {
          closable: false,
          autoClose: false
        }
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.firesOnce(editor, 'beforeclose');
    t.firesOnce(editor, 'beforehide');
    t.firesOnce(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'input[name=name]'
    }, {
      type: 'foo[ENTER]'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    });
  }); //endregion
  //region Should prevent closing when beforeclose returns false

  t.it('Should prevent closing when beforeclose returns false on cancel click', t => {
    let beforeCloseCounter = 0;
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: {
          editorConfig: {
            showAnimation: false,
            hideAnimation: false,
            listeners: {
              beforeClose: () => {
                beforeCloseCounter++;
                return false;
              }
            }
          }
        }
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.isntFired(editor, 'beforehide');
    t.isntFired(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'button:textEquals(Cancel)'
    }, () => {
      t.selectorExists('.b-eventeditor:not(.b-hidden)', 'Editor still visible');
      t.is(beforeCloseCounter, 1, 'beforeclose has been fired once');
    });
  });
  t.it('Should prevent closing when beforeclose returns false on delete click', t => {
    let beforeCloseCounter = 0;
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: {
          editorConfig: {
            showAnimation: false,
            hideAnimation: false,
            listeners: {
              beforeclose() {
                beforeCloseCounter++;
                return false;
              }

            }
          }
        }
      }
    });
    const editor = scheduler.features.eventEdit.getEditor(); // See ticket for more info
    // https://app.assembla.com/spaces/bryntum/tickets/8842-beforeclose-event-not-fired-consistently-for-eventeditor/details

    if (!BrowserHelper.isIE11) {
      t.isntFired(editor, 'beforehide');
      t.isntFired(editor, 'hide');
    }

    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'button:textEquals(Delete)'
    }, () => {
      if (!BrowserHelper.isIE11) {
        t.selectorExists('.b-eventeditor:not(.b-hidden)', 'Editor still visible');
      }

      t.is(beforeCloseCounter, 1, 'beforeclose has been fired once');
    });
  });
  t.it('Should prevent closing when beforeclose returns false on save click', t => {
    let beforeCloseCounter = 0;
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: {
          editorConfig: {
            showAnimation: false,
            hideAnimation: false,
            listeners: {
              beforeClose: () => {
                beforeCloseCounter++;
                return false;
              }
            }
          }
        }
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.isntFired(editor, 'beforehide');
    t.isntFired(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'button:textEquals(Save)'
    }, () => {
      t.selectorExists('.b-eventeditor:not(.b-hidden)', 'Editor still visible');
      t.is(beforeCloseCounter, 1, 'beforeclose has been fired once');
    });
  });
  t.it('Should prevent closing when beforeclose returns false on Enter click', t => {
    let beforeCloseCounter = 0;
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: {
          editorConfig: {
            showAnimation: false,
            hideAnimation: false,
            listeners: {
              beforeClose: () => {
                beforeCloseCounter++;
                return false;
              }
            }
          }
        }
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.isntFired(editor, 'beforehide');
    t.isntFired(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: 'input[name=name]'
    }, {
      type: 'foo[ENTER]'
    }, () => {
      t.selectorExists('.b-eventeditor:not(.b-hidden)', 'Editor still visible');
      t.is(beforeCloseCounter, 1, 'beforeclose has been fired once');
    });
  });
  t.it('Should prevent closing when beforeclose returns false on close icon click', t => {
    let beforeCloseCounter = 0;
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: {
          editorConfig: {
            showAnimation: false,
            hideAnimation: false,
            listeners: {
              beforeClose: () => {
                beforeCloseCounter++;
                return false;
              }
            }
          }
        }
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.isntFired(editor, 'beforehide');
    t.isntFired(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      click: '.b-popup-close'
    }, () => {
      t.selectorExists('.b-eventeditor:not(.b-hidden)', 'Editor still visible');
      t.is(beforeCloseCounter, 1, 'beforeclose has been fired once');
    });
  });
  t.it('Should prevent closing when beforeclose returns false on outside click', t => {
    let beforeCloseCounter = 0;
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventTooltip: false,
        eventEdit: {
          editorConfig: {
            showAnimation: false,
            hideAnimation: false,
            listeners: {
              beforeClose: () => {
                beforeCloseCounter++;
                return false;
              }
            }
          }
        }
      }
    });
    const editor = scheduler.features.eventEdit.getEditor();
    t.isntFired(editor, 'beforehide');
    t.isntFired(editor, 'hide');
    t.chain({
      dblclick: '.b-sch-event'
    }, {
      waitForSelector: '.b-eventeditor:not(.b-hidden)'
    }, {
      click: '.b-grid-cell'
    }, () => {
      t.selectorExists('.b-eventeditor:not(.b-hidden)', 'Editor still visible');
      t.is(beforeCloseCounter, 1, 'beforeclose has been fired once');
    });
  }); //endregion

  t.it('Delete should be preventable', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventEdit: true
      },
      listeners: {
        beforeEventDelete() {
          return false;
        }

      }
    });
    t.chain({
      dblClick: '[data-event-id="1"]'
    }, {
      click: 'button:textEquals(Delete)'
    }, () => {
      t.selectorExists('[data-event-id="1"]', 'Element not removed');
      t.ok(scheduler.eventStore.getById(1), 'Record not removed');
    });
  }); // https://github.com/bryntum/support/issues/2593

  t.it('Should cancel changes when async beforeEventSave listener returns false', t => {
    let response = false;
    scheduler = t.getScheduler({
      features: {
        eventEdit: true
      },
      listeners: {
        async beforeEventSave({
          context
        }) {
          context.async = true;
          setTimeout(() => {
            context.finalize(false);
            response = true;
          }, 1);
        }

      }
    });
    t.chain({
      dblclick: '.b-sch-event:contains(Assignment 1)'
    }, {
      click: 'input[name=name]'
    }, {
      type: 'foo[ENTER]'
    }, {
      waitFor: () => response
    }, () => {
      t.selectorExists('.b-eventeditor:not(.b-hidden)', 'Editor opened');
      t.is(scheduler.eventStore.first.name, 'Assignment 1');
    });
  });
  t.it('Should save changes when async beforeEventSave listener returns true', t => {
    let response = false;
    scheduler = t.getScheduler({
      features: {
        eventEdit: true
      },
      listeners: {
        async beforeEventSave({
          context
        }) {
          context.async = true;
          setTimeout(() => {
            context.finalize(true);
            response = true;
          }, 1);
        }

      }
    });
    t.chain({
      dblclick: '.b-sch-event:contains(Assignment 1)'
    }, {
      click: 'input[name=name]'
    }, {
      type: 'foo[ENTER]'
    }, {
      waitFor: () => response
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    }, () => {
      t.is(scheduler.eventStore.first.name, 'Assignment 1foo');
    });
  });
  t.it('Should cancel changes when beforeEventSave listener returns false', t => {
    scheduler = t.getScheduler({
      features: {
        eventEdit: true
      },
      listeners: {
        beforeEventSave() {
          return false;
        }

      }
    });
    t.chain({
      dblclick: '.b-sch-event:contains(Assignment 1)'
    }, {
      click: 'input[name=name]'
    }, {
      type: 'foo[ENTER]'
    }, () => {
      t.selectorExists('.b-eventeditor:not(.b-hidden)', 'Editor opened');
      t.is(scheduler.eventStore.first.name, 'Assignment 1');
    });
  });
  t.it('Should save changes when beforeEventSave listener returns true', t => {
    scheduler = t.getScheduler({
      features: {
        eventEdit: true
      },
      listeners: {
        beforeEventSave() {
          return true;
        }

      }
    });
    t.chain({
      dblclick: '.b-sch-event:contains(Assignment 1)'
    }, {
      click: 'input[name=name]'
    }, {
      type: 'foo[ENTER]'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    }, () => {
      t.is(scheduler.eventStore.first.name, 'Assignment 1foo');
    });
  });
  t.it('Should save changes when beforeEventSave listener returns nothing', t => {
    scheduler = t.getScheduler({
      features: {
        eventEdit: true
      },
      listeners: {
        beforeEventSave() {}

      }
    });
    t.chain({
      dblclick: '.b-sch-event:contains(Assignment 1)'
    }, {
      click: 'input[name=name]'
    }, {
      type: 'foo[ENTER]'
    }, {
      waitForSelectorNotFound: '.b-eventeditor:not(.b-hidden)'
    }, () => {
      t.is(scheduler.eventStore.first.name, 'Assignment 1foo');
    });
  });
});