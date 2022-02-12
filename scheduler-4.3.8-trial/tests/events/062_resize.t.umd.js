"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
  });
  document.body.style.width = '600px';
  t.it('Basic use cases', t => {
    scheduler = t.getScheduler({
      features: {
        eventResize: true,
        eventEdit: false
      }
    }, 1);
    const fired = {
      beforeeventresize: 0,
      eventresizestart: 0,
      eventpartialresize: 0,
      eventresizeend: 0
    };
    const record = scheduler.eventStore.first;
    scheduler.on({
      beforeeventresize({
        source,
        eventRecord,
        event
      }) {
        t.ok(source instanceof Scheduler && eventRecord instanceof EventModel && event instanceof MouseEvent, 'Correct event signature of `beforeeventresize`');
        fired.beforeeventresize++;
      },

      eventresizestart({
        source,
        eventRecord
      }) {
        t.ok(source instanceof Scheduler && eventRecord instanceof EventModel, 'Correct event signature of "eventresizestart"');
        fired.eventresizestart++;
      },

      eventpartialresize({
        source,
        eventRecord,
        startDate,
        endDate,
        element
      }) {
        if (fired.eventpartialresize === 0) {
          t.ok(source instanceof Scheduler && eventRecord instanceof EventModel && startDate instanceof Date && endDate instanceof Date && element instanceof HTMLElement, 'Correct event signature of `eventpartialresize`');
          fired.eventpartialresize = 1;
        }
      },

      eventresizeend({
        source,
        eventRecord
      }) {
        t.ok(source instanceof Scheduler && eventRecord instanceof EventModel, 'Correct event signature of `eventresizeend`');
        fired.eventresizeend++;
      }

    });
    t.chain({
      waitForEventsToRender: null
    }, //Drag end resize handle bar 100px to the right
    {
      drag: '.event1',
      offset: ['100%-5', '50%'],
      by: [100, 0]
    }, next => {
      for (const o in fired) {
        if (o === 'eventpartialresize') {
          t.ok(fired[o] > 0, `'${o}' event fired`);
        } else {
          t.ok(fired[o] === 1, `'${o}' event fired`);
        }
      }

      t.isGreater(record.endDate, record.meta.modified.endDate, 'Dragged end-handle, EndDate changed');
      t.notOk(record.meta.modified.startDate, 'StartDate unchanged');
      record.resizable = 'start';
      next();
    }, // Drag start resize handle bar 100px to the left
    {
      drag: '.event1',
      offset: [3, 5],
      by: [-100, 0]
    }, next => {
      t.isLess(record.startDate, record.meta.modified.startDate, 'Dragged start-handle, StartDate changed, Resizable=start');
      record.resizable = false;
      next();
    }, {
      moveMouseTo: '.event1'
    }, (next, el) => {
      // TODO: this doesn't actually test if it is resizable, only that cls is set...
      t.ok(el.classList.contains('b-sch-event-resizable-false'), 'Event not resizable');
      record.resizable = 'end'; // changing data currently rerenders events, creating a new element. cannot reuse el here

      t.ok(document.querySelector('.b-sch-event').classList.contains('b-sch-event-resizable-end'), 'Events end resizable');
      next();
    }, next => {
      scheduler.on('beforeeventresize', () => false);

      for (const o in fired) {
        fired[o] = 0;
      }

      next();
    }, {
      drag: '.event1',
      offset: ['100%-3', 5],
      by: [100, 0]
    }, next => {
      delete fired.beforeeventresize; // Make sure no events were fired, e.g. operation didn't start

      for (const o in fired) {
        t.is(fired[o], 0, `'${o}' event not fired since false was returned by beforeeventresize handler`);
      } // behaviour changed, triggered when checking if an element can be resized
      //t.wontFire(scheduler, 'beforeeventresize', 'Double clicking a resize handle should not trigger any resize activity');


      t.wontFire(scheduler, 'eventresizestart', 'Double clicking a resize handle should not trigger any resize activity');
      t.wontFire(scheduler, 'eventresizeend', 'Double clicking a resize handle should not trigger any resize activity');
      next();
    }, {
      moveMouseTo: '.event1',
      desc: 'Hover event node to force resize handles'
    }, {
      doubleClick: '.event1',
      offset: ['100%-3', 5]
    });
  });
  t.it('Should finalize if mouse only moves a little', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventResize: true
      }
    });
    t.firesOnce(scheduler, 'beforeeventresize');
    t.firesOnce(scheduler, 'eventresizestart');
    t.firesOnce(scheduler, 'eventresizeend');
    t.chain({
      waitForEventsToRender: null
    }, {
      moveMouseTo: [0, 0]
    }, {
      moveMouseTo: '.event1',
      desc: 'Hover event node to force resize handles'
    }, {
      drag: '.event1',
      offset: ['100%-3', 5],
      by: [3, 0]
    });
  }); // how should it behave?

  t.xit('Should handle moving mouse outside of scheduling view', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      eventStore: t.getEventStore({
        data: [{
          id: 1,
          startDate: '2011-01-05',
          endDate: '2011-01-06',
          resourceId: 'r3'
        }]
      }),
      features: {
        eventResize: {
          showExactResizePosition: true
        }
      }
    });

    const getEventBox = () => document.querySelector('.b-sch-event').getBoundingClientRect();

    let eventBox;
    t.chain(next => {
      scheduler.scrollTo(100);
      next();
    }, {
      moveMouseTo: '.b-sch-event'
    }, next => {
      eventBox = getEventBox();
      next();
    }, {
      drag: '.b-sch-event',
      offset: [3, 8],
      by: [0, 1],
      dragOnly: true
    }, next => {
      const currentBox = getEventBox();
      t.isApprox(currentBox.width, eventBox.width, 1);
      t.is(currentBox.x, eventBox.x);
      next();
    }, {
      moveMouseBy: [-200, 0]
    }, next => {
      t.is(document.querySelector('.b-sch-event-resizing').offsetWidth, 200, 'Event width is correct');
      next();
    }, {
      action: 'mouseup'
    } // TODO: PORT vertical later
    // function(next) {
    //     t.waitForEvent(scheduler, 'modechange', next);
    //     scheduler.setMode('vertical');
    // },
    // { waitFor : 100 },
    // { moveMouseTo : '.sch-event' },
    // function(next) {
    //     eventBox = getEventBox();
    //     t.dragBy('.sch-resizable-handle-start', [-1, 0], function() {
    //         var currentBox = getEventBox();
    //         t.is(currentBox.height, eventBox.height);
    //         t.is(currentBox.y, eventBox.y);
    //         next();
    //     }, null, null, true);
    // },
    // { moveMouseBy : [0, -50] },
    // function(next) {
    //     var currentBox = getEventBox();
    //     t.is(currentBox.height, 250, 'Height is ok');
    //     t.is(currentBox.y, eventBox.y - 50, 'Vertical position is ok');
    //     next();
    // },
    // { action : 'mouseup' }
    );
  });
  t.it('Should not crash when clicking resizer element', t => {
    scheduler = t.getScheduler({
      features: {
        eventResize: true
      }
    });
    t.wontFire(scheduler, 'eventresizestart');
    t.chain({
      waitForEventsToRender: null
    }, {
      moveMouseTo: '.b-sch-event'
    }, {
      click: '.b-sch-event',
      offset: [3, '50%'],
      desc: 'Should not crash when clicking resizer element'
    });
  });
});