"use strict";

// https://app.assembla.com/spaces/bryntum/tickets/8750
StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
    scheduler = null;
  });

  const beforeEventAddHandler = function ({
    source,
    eventRecord,
    resourceRecords
  }) {
    this.ok(source instanceof Scheduler && eventRecord instanceof EventModel && resourceRecords instanceof Array, 'Correct event signature of `beforeeventadd`');
  };

  t.it('Event edit feature should fire beforeEventAdd event when Save button is clicked', t => {
    scheduler = t.getScheduler({
      features: {
        eventEdit: true
      }
    });
    scheduler.on({
      beforeeventadd: beforeEventAddHandler,
      thisObj: t
    });
    t.firesOnce(scheduler, 'beforeeventadd', 'beforeeventadd is fired once');
    const resource = scheduler.resourceStore.first;
    const event = new EventModel({
      name: 'Foo',
      startDate: new Date(2011, 0, 4),
      endDate: new Date(2011, 0, 5),
      resourceId: resource.id
    });
    t.chain({
      waitForEvent: [scheduler, 'beforeeventadd'],
      trigger: () => scheduler.editEvent(event, resource)
    }, {
      waitForSelector: '.b-eventeditor:not(.b-hidden)'
    }, next => {
      t.click('button:contains(Save)');
      next();
    }, {
      diag: 'Done!'
    });
  });
  t.it('Scheduler should not fire beforeEventAdd event on scheduledblclick if event edit feature exists before Save button is clicked', t => {
    scheduler = t.getScheduler({
      createEventOnDblClick: true,
      features: {
        eventEdit: true
      }
    });
    scheduler.on({
      beforeeventadd: beforeEventAddHandler,
      thisObj: t
    });
    t.isCalledOnce('onEventCreated', scheduler, 'onEventCreated hook is called once');
    t.firesOnce(scheduler, 'beforeeventadd', 'beforeeventadd is fired once');
    t.chain({
      waitForEventsToRender: null
    }, {
      waitForEvent: [scheduler, 'beforeeventadd'],
      trigger: {
        dblclick: '.b-sch-timeaxis-cell'
      }
    }, {
      waitFor: () => {
        var _scheduler$features$e;

        return (_scheduler$features$e = scheduler.features.eventEdit.editor) === null || _scheduler$features$e === void 0 ? void 0 : _scheduler$features$e.containsFocus;
      }
    }, {
      type: 'New test event'
    }, next => {
      t.click('button:contains(Save)');
      next();
    }, {
      diag: 'Done!'
    });
  });
  t.it('Scheduler should fire beforeEventAdd event on scheduledblclick if event edit feature does not exist', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      onEventCreated: ev => ev.name = 'foo',
      createEventOnDblClick: true,
      features: {
        eventEdit: false
      }
    });
    scheduler.on({
      beforeeventadd: beforeEventAddHandler,
      thisObj: t
    });
    t.isCalledOnce('onEventCreated', scheduler, 'onEventCreated hook is called once');
    t.firesOnce(scheduler, 'beforeeventadd', 'beforeeventadd is fired once');
    t.chain({
      dblclick: '.b-sch-timeaxis-cell'
    }, {
      waitForSelector: '.b-sch-event:textEquals(foo)'
    });
  });
  t.it('Scheduler should not fire beforeEventAdd event on dragcreate if event edit feature exists before Save button is clicked', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      features: {
        eventEdit: true,
        eventDragCreate: true
      }
    });
    scheduler.on({
      beforeeventadd: beforeEventAddHandler,
      thisObj: t
    });
    t.isCalledOnce('onEventCreated', scheduler, 'onEventCreated hook is called once');
    t.firesOnce(scheduler, 'beforeeventadd', 'beforeeventadd is fired once');
    t.chain({
      waitForEvent: [scheduler, 'beforeeventadd'],
      trigger: {
        drag: '.b-sch-timeaxis-cell',
        fromOffset: [20, 20],
        by: [100, 0]
      }
    }, {
      waitFor: () => {
        var _scheduler$features$e2;

        return (_scheduler$features$e2 = scheduler.features.eventEdit.editor) === null || _scheduler$features$e2 === void 0 ? void 0 : _scheduler$features$e2.containsFocus;
      }
    }, {
      type: 'New test event'
    }, next => {
      t.click('button:contains(Save)');
      next();
    }, {
      diag: 'Done!'
    });
  });
  t.it('Scheduler should fire beforeEventAdd event on dragcreate if event edit feature does not exist', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      onEventCreated: ev => ev.name = 'foo',
      features: {
        eventEdit: false,
        eventDragCreate: true
      }
    });
    scheduler.on({
      beforeeventadd: beforeEventAddHandler,
      thisObj: t
    });
    t.isCalledOnce('onEventCreated', scheduler, 'onEventCreated hook is called once');
    t.firesOnce(scheduler, 'beforeeventadd', 'beforeeventadd is fired once');
    t.chain({
      drag: '.b-sch-timeaxis-cell',
      fromOffset: [20, 20],
      by: [100, 0]
    }, {
      waitForSelector: '.b-sch-event:textEquals(foo)'
    });
  }); // https://github.com/bryntum/support/issues/3604

  t.it('Should not leave any elements when returning false from beforeEventAdd listener', async t => {
    scheduler = t.getScheduler({
      startDate: new Date(2017, 0, 1, 6),
      endDate: new Date(2017, 0, 1, 20),
      viewPreset: 'hourAndDay',
      events: [{
        id: 4,
        resourceId: 'r4',
        startDate: new Date(2017, 0, 1, 8),
        endDate: new Date(2017, 0, 1, 11),
        cls: 'foo'
      }],
      listeners: {
        beforeEventAdd: () => false
      }
    });
    t.wontFire(scheduler.eventStore, 'add');
    t.wontFire(scheduler.assignmentStore, 'add');
    await t.dragBy({
      source: '.b-sch-timeaxis-cell',
      fromOffset: [2, 2],
      delta: [100, 0]
    });
    t.selectorCountIs('.b-sch-event', 1);
  });
});