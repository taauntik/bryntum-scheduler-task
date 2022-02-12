"use strict";

StartTest(async t => {
  t.resetCursorPosition = false;
  const sched = await t.getSchedulerAsync({
    width: 420,
    features: {
      eventEdit: false,
      scheduleMenu: false,
      eventMenu: false
    }
  }, 1),
        taskEl = sched.getElementFromEventRecord(sched.eventStore.first),
        firstTimeCellEl = document.querySelector('.b-sch-timeaxis-cell'),
        task = sched.resolveEventRecord(taskEl);

  function verifyEventSignature({
    source: scheduler,
    eventRecord,
    event
  }) {
    /**
     * @event event_xxx
     * Fires when xxx
     * @param {SchedulerView}    scheduler The scheduler view object
     * @param {EventModel}  eventRecord The event record
     * @param {Event}  e The event object
     */
    t.it('Should fire correct params for ' + event.type, t => {
      t.is(scheduler, sched, 'Correct 1st argument for event' + event.type);
      t.is(eventRecord, task, 'Correct 2nd argument for event' + event.type);
    });
  }

  function verifyScheduleEventSignature({
    source: scheduler,
    date,
    tickStartDate,
    tickEndDate,
    index,
    resourceRecord,
    event
  }) {
    /**
     * @event scheduledblclick
     * Fires after a doubleclick on the schedule area
     * @param {SchedulerView} scheduler The scheduler object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Event} e The event object
     */
    t.it('Should fire correct params for ' + event.type, t => {
      t.is(sched, scheduler, 'Correct argument for schedule' + event.type);
      t.ok(date instanceof Date, 'Correct argument for schedule' + event.type);
      t.ok(tickStartDate instanceof Date, 'Correct argument for schedule' + event.type);
      t.ok(tickEndDate instanceof Date, 'Correct argument for schedule' + event.type);
      t.is(index, 0, 'Correct 3rd argument for schedule' + event.type);
      t.isaOk(resourceRecord, ResourceModel, 'Correct argument for schedule' + event.type);
    });
  }

  function verifyKeyEventSignature({
    source: scheduler,
    assignmentRecord,
    eventRecord,
    eventRecords,
    assignmentRecords,
    event
  }, expectedType) {
    /**
     * Triggered when a keydown event is observed if there are selected events.
     * @event eventKeyDown
     * @param {Scheduler.view.Scheduler} source This Scheduler
     * @param {Scheduler.model.EventModel[]} eventRecords Event records
     * @param {Scheduler.model.AssignmentModel[]} assignmentRecords Assignment records
     * @param {KeyboardEvent} event Browser event
     */
    t.it('Should fire correct params for ' + event.type, t => {
      t.is(eventRecords.length, 1, '1 event selected');
      t.is(assignmentRecords.length, 1, '1 assignment selected');
      t.is(sched, scheduler, 'Correct argument for source: ' + event.type);
      t.ok(eventRecords[0].isEvent, 'Correct argument for eventRecord: ' + event.type);
      t.ok(assignmentRecords[0].isAssignment, 'Correct argument for assignmentRecord: ' + event.type);
      t.ok(event.type === expectedType && event.key === 'Enter', `Correct argument for event: ${expectedType}`); // Backwards compat

      t.isDeeply(eventRecords, eventRecord, 'Old singular param works');
      t.isDeeply(assignmentRecords, assignmentRecord, 'Old singular param works');
    });
  }

  const removeEventListeners = sched.on({
    eventclick: verifyEventSignature,
    eventdblclick: verifyEventSignature,
    eventcontextmenu: verifyEventSignature,
    eventmouseenter: verifyEventSignature,
    eventmouseleave: verifyEventSignature
  });
  sched.on({
    schedulemousemove: verifyScheduleEventSignature,
    scheduleclick: verifyScheduleEventSignature,
    scheduledblclick: verifyScheduleEventSignature,
    schedulecontextmenu: verifyScheduleEventSignature,
    eventkeyup: event => verifyKeyEventSignature(event, 'keyup'),
    eventkeydown: event => verifyKeyEventSignature(event, 'keydown'),
    once: true
  });
  ['eventdblclick', 'eventcontextmenu', 'eventkeydown', 'eventkeyup', 'scheduledblclick', 'schedulecontextmenu'].forEach(evName => t.willFireNTimes(sched, evName, 1));
  ['eventmouseenter', 'eventmouseleave', 'schedulemousemove'].forEach(evName => // These events bubble in IE8
  t.firesAtLeastNTimes(sched, evName, 1));
  ['eventclick', 'scheduleclick'].forEach(evName => t.willFireNTimes(sched, evName, 3));
  t.ok(firstTimeCellEl, 'Time cell found');
  t.wontFire(sched.subGrids.normal.scrollable, 'scroll', 'Time axis should never scroll after clicking a time axis cell'); // https://app.assembla.com/spaces/bryntum/tickets/7723/details

  t.wontFire(sched, 'beforeeventdrag', 'dragging not triggered by any mousedown/up/click actions');
  t.chain({
    click: taskEl
  }, next => {
    t.is(t.activeElement(), taskEl.parentNode, 'Event should be focused after a click');
    next();
  }, {
    doubleClick: taskEl
  }, {
    rightClick: taskEl
  }, {
    type: '[ENTER]',
    target: taskEl
  }, {
    moveCursorTo: '.b-sch-header-timeaxis-cell',
    offset: [5, 5]
  }, next => {
    t.selectorNotExists('.b-sch-event-wrap.b-released', 'No released events');
    sched.eventStore.forEach(event => event.unassign(event.resource));
    sched.eventStore.removeAll(); // Must not trigger these again.

    removeEventListeners();
    next();
  }, {
    click: firstTimeCellEl,
    offset: [5, 5]
  }, {
    doubleClick: firstTimeCellEl,
    offset: [5, 5]
  }, {
    rightClick: firstTimeCellEl,
    offset: [5, 5]
  }, {
    moveCursorTo: '.b-sch-header-timeaxis-cell'
  });
});