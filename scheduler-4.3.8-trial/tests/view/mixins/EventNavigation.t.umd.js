"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => scheduler && scheduler.destroy());

  async function getScheduler(config = {}) {
    const scheduler = t.getScheduler(config);
    await t.waitForProjectReady();
    return scheduler;
  }

  t.it('Should allow key activation', async t => {
    scheduler = await getScheduler({
      features: {
        eventEdit: true
      }
    });
    t.chain({
      click: '.b-sch-event.event1'
    }, {
      waitFor: () => {
        return document.activeElement === document.querySelector('.b-sch-event.event1').parentNode;
      },
      desc: 'event1 is focused'
    }, {
      waitFor: () => {
        return scheduler.activeAssignment === scheduler.assignmentStore.getAt(0);
      },
      desc: 'event1 is the active event'
    }, {
      type: '[RIGHT]'
    }, {
      waitFor: () => {
        return document.activeElement === document.querySelector('.b-sch-event.event2').parentNode;
      },
      desc: 'event2 is focused'
    }, {
      waitFor: () => {
        return scheduler.activeAssignment === scheduler.assignmentStore.getAt(1);
      },
      desc: 'event2 is the active event'
    }, {
      type: '[DELETE]'
    }, {
      waitFor: () => {
        return document.activeElement === document.querySelector('.b-sch-event.event3').parentNode;
      },
      desc: 'event3 is focused'
    }, {
      waitFor: () => scheduler.activeAssignment === scheduler.assignmentStore.getAt(1),
      desc: 'event3 is the active event'
    }, {
      type: '[ENTER]'
    }, {
      waitForElementVisible: '.b-eventeditor'
    }, next => {
      const secondRec = scheduler.eventStore.getAt(1); // check editor contents

      t.is(document.querySelector('input[name=name]').value, secondRec.name, 'Name correct');
      t.is(document.querySelector('input[name=resource]').value, secondRec.resource.name, 'Resource correct');
      t.is(document.querySelector('.b-datefield input[name=startDate]').value, '01/06/2011', 'Start date correct');
      t.is(document.querySelector('.b-datefield input[name=endDate]').value, '01/08/2011', 'End date correct');
      t.is(document.querySelector('.b-timefield input[name=startDate]').value, '12:00 AM', 'Start time correct');
      t.is(document.querySelector('.b-timefield input[name=endDate]').value, '12:00 AM', 'End time correct'); // exposes fields?

      const editor = scheduler.features.eventEdit;
      t.ok(editor.nameField, 'name field exposed');
      t.ok(editor.resourceField, 'resource field exposed');
      t.ok(editor.startDateField, 'startDate field exposed');
      t.ok(editor.endDateField, 'endDate field exposed');
      t.ok(editor.startTimeField, 'startTime field exposed');
      t.ok(editor.endTimeField, 'endTime field exposed');
      next();
    }, {
      type: '[ESCAPE]'
    }, {
      waitFor: () => {
        return document.activeElement === document.querySelector('.b-sch-event.event3').parentNode;
      },
      desc: 'Focus has reverted to event3'
    }, next => {
      t.ok(scheduler.activeAssignment === scheduler.assignmentStore.getAt(1), 'event3 is the active event');
      next();
    });
  });
  t.it('Should omit events outside the TimeAxis', async t => {
    scheduler = await getScheduler({
      features: {
        eventEdit: true
      }
    });
    const [a1, a2, a3] = scheduler.assignmentStore;
    t.is(scheduler.getNext(a1), a2, 'assignment2 is next from assignment1');
    t.is(scheduler.getPrevious(a3), a2, 'assignment2 is previous from assignment3'); // Push e2 out of the TimeAxis so that it is not navigable

    await a2.event.setStartDate(DateHelper.add(a2.event.startDate, 6, 'month'), true); // getNext(1) should return 3 and getPrevious(3) should return 2

    t.is(scheduler.getNext(a1), a3, 'assignment3 is next from assignment1');
    t.is(scheduler.getPrevious(a3), a1, 'assignment1 is previous from assignment3');
  });
  t.it('Navigation should be disabled during scrolling event into view, and should be unresponsive', async t => {
    scheduler = await getScheduler({
      events: [{
        startDate: new Date(2011, 0, 3),
        endDate: new Date(2011, 0, 4),
        name: 'Event 1',
        resourceId: 'r1'
      }, {
        startDate: new Date(2011, 0, 12),
        endDate: new Date(2011, 0, 13),
        name: 'Event 2',
        resourceId: 'r2'
      }]
    }); // This should just not throw

    t.chain({
      click: '.b-sch-event'
    }, {
      type: '[RIGHT][RIGHT]'
    });
  });
  t.it('Clicking on half-visible event should not scroll it', async t => {
    scheduler = await getScheduler({
      startDate: new Date(2011, 0, 1),
      endDate: new Date(2011, 0, 31),
      events: [{
        startDate: new Date(2011, 0, 3),
        endDate: new Date(2011, 0, 4),
        name: 'Event 1',
        resourceId: 'r1'
      }, {
        startDate: new Date(2011, 0, 12),
        endDate: new Date(2011, 0, 13),
        name: 'Event 2',
        resourceId: 'r2'
      }]
    });
    scheduler.timeAxisSubGrid.scrollable.x = 255;
    t.chain( // It's hanging off the left edge, so click what we can see.
    // This must not scroll it fully into view. https://github.com/bryntum/support/issues/105
    {
      click: '.b-sch-event',
      offset: ['85%', '50%']
    }, () => {
      t.is(scheduler.timeAxisSubGrid.scrollable.x, 255, 'Clicking has not changed scroll');
    });
  });
  t.it('Derendering an event which is scrolled out of the rendered block should focus the view', async t => {
    scheduler = await getScheduler({
      events: [{
        startDate: new Date(2011, 0, 3),
        endDate: new Date(2011, 0, 4),
        name: 'Event 1',
        resourceId: 'r1'
      }, {
        startDate: new Date(2011, 2, 12),
        endDate: new Date(2011, 2, 13),
        name: 'Event 2',
        resourceId: 'r2'
      }],
      startDate: new Date(2011, 0, 3),
      endDate: new Date(2011, 2, 31)
    });
    const firstEventEl = scheduler.getElementFromEventRecord(scheduler.eventStore.first); // Focus should be thrown up to the main Scheduler element when the focused event scrolls out of view

    t.chain({
      click: '.b-sch-event'
    }, // First event element is focused
    {
      waitFor: () => document.activeElement === firstEventEl.parentNode
    }, next => {
      // Scroll rightwards a long way
      scheduler.timeAxisSubGrid.scrollable.scrollBy(10000);
      next();
    }, // Focus jumped upwards to Scheduler
    {
      waitFor: () => document.activeElement === scheduler.focusElement
    });
  });
  t.it('Navigate event arguments are fired correctly', async t => {
    scheduler = await getScheduler();

    function assertEvent(element) {
      scheduler.navigator.on({
        navigate({
          item
        }) {
          t.is(item, element, 'Event argument is ok');
        },

        once: true
      });
    }

    assertEvent(document.querySelector('.b-sch-event-wrap[data-event-id="1"]'));
    t.chain({
      click: '.b-sch-event-wrap[data-event-id="1"]'
    }, next => {
      assertEvent(document.querySelector('.b-sch-event-wrap[data-event-id="2"]'));
      next();
    }, {
      type: '[RIGHT]'
    }, next => {
      assertEvent(document.querySelector('.b-sch-event-wrap[data-event-id="3"]'));
      next();
    }, {
      type: '[RIGHT]'
    });
  });
  t.it('Should navigate events on filtered time axis', async t => {
    scheduler = await getScheduler({
      viewPreset: 'weekAndDay',
      resources: [{
        id: 1,
        name: 'Alber'
      }, {
        id: 2,
        name: 'Ben'
      }],
      startDate: '2011-01-04',
      endDate: '2011-03-06',
      events: [{
        id: 1,
        cls: 'event1',
        resourceId: 1,
        startDate: '2011-01-04',
        endDate: '2011-01-04 17:00:00',
        name: 'Visible'
      }, {
        id: 2,
        cls: 'event2',
        resourceId: 1,
        startDate: '2011-01-04 18:00:00',
        endDate: '2011-01-04 20:00:00',
        name: 'Filtered'
      }, {
        id: 3,
        cls: 'event3',
        resourceId: 1,
        startDate: '2011-01-05',
        endDate: '2011-01-05 17:00:00',
        name: 'Visible'
      }, {
        id: 4,
        cls: 'event4',
        resourceId: 1,
        startDate: '2011-03-03',
        endDate: '2011-03-03 17:00:00',
        name: 'Far right'
      }],
      workingTime: {
        fromDay: 1,
        toDay: 6,
        fromHour: 8,
        toHour: 17
      }
    });
    t.chain({
      click: '.b-sch-event'
    }, {
      type: '[RIGHT]'
    }, {
      waitForSelector: '.event3.b-sch-event-selected',
      desc: 'Navigated to event 3 successfully'
    }, {
      type: '[RIGHT]'
    }, {
      waitForSelector: '.event4.b-sch-event-selected',
      desc: 'Navigated to event 4 successfully'
    });
  });
  t.it('Programmatic focus through scrollEventIntoView should activate event', async t => {
    scheduler = await getScheduler({
      features: {
        eventEdit: true
      }
    });
    t.chain(async () => scheduler.scrollEventIntoView(scheduler.eventStore.first, {
      focus: true
    }), {
      waitFor: () => {
        return scheduler.activeAssignment === scheduler.assignmentStore.first && document.activeElement === document.querySelector('.b-sch-event.event1').parentNode;
      },
      desc: 'event1 is focused'
    });
  });
  t.it('Should navigate between events in tree', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      features: {
        tree: true
      },
      columns: [{
        type: 'tree',
        text: 'Name',
        width: 220,
        field: 'name'
      }],
      startDate: '2019-07-03',
      endDate: '2019-07-20',
      crudManager: {
        autoLoad: true,
        transport: {
          load: {
            url: 'view/mixins/EventNavigation.json'
          }
        }
      }
    });
    t.chain({
      click: '.b-sch-event'
    }, {
      type: '[RIGHT]'
    }, async () => {
      t.is(scheduler.selectedEvents[0].id, 2, 'Proper event is selected');
    });
  });
  t.it('Keyboard event removal should be preventable', async t => {
    scheduler = await getScheduler({
      listeners: {
        beforeEventDelete() {
          return false;
        }

      }
    });
    t.chain({
      click: '[data-event-id="1"]'
    }, {
      type: '[DELETE]'
    }, () => {
      t.selectorExists('[data-event-id="1"]', 'Element not removed');
      t.ok(scheduler.eventStore.getById(1), 'Record not removed');
    });
  });
  t.it('Should skip filtered events during navigation', async t => {
    scheduler = await getScheduler(); // filter out resources with even ids

    scheduler.eventStore.filter(e => e.id % 2);
    t.chain({
      waitForSelectorNotFound: `${scheduler.unreleasedEventSelector}[data-event-id="4"]`
    }, {
      click: '.event5'
    }, {
      type: '[LEFT]'
    }, {
      waitForSelector: '.event3.b-sch-event-selected',
      desc: 'Navigated to previous event'
    }, {
      type: '[RIGHT]'
    }, {
      waitForSelector: '.event5.b-sch-event-selected',
      desc: 'Navigated to next event'
    });
  }); // https://github.com/bryntum/support/issues/3479

  t.it('Should not crash after multi-event removal using keyboard', async t => {
    scheduler = await getScheduler({
      multiEventSelect: true
    });
    t.chain({
      click: '[data-event-id="5"]'
    }, {
      type: '[LEFT]',
      options: {
        metaKey: true,
        ctrlKey: true
      }
    }, {
      type: '[DELETE]'
    }, {
      waitFor: () => {
        return scheduler.activeAssignment === scheduler.assignmentStore.getAt(2);
      },
      desc: 'Assignment 3 is the activeAssignment'
    });
  });
});