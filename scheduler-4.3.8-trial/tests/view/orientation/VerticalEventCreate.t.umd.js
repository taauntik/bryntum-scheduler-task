"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    scheduler && scheduler.destroy();
  });
  t.it('Should create event on dblclick on schedule', async t => {
    scheduler = await t.getVerticalSchedulerAsync({
      startDate: new Date(2019, 0, 1, 6),
      endDate: new Date(2019, 0, 1, 18),
      viewPreset: 'hourAndDay',
      events: [],
      features: {
        eventEdit: false
      }
    });
    t.chain({
      dblClick: '.b-sch-timeaxis-cell',
      offset: [100, 100]
    }, {
      waitForSelector: '.b-sch-event'
    }, next => {
      t.is(scheduler.eventStore.first.startDate, new Date(2019, 0, 1, 7, 30), 'Correct start date');
      t.is(scheduler.eventStore.first.resource, scheduler.resourceStore.first, 'Correct resource');
    });
  });
  t.it('Should properly append event', async t => {
    scheduler = await t.getVerticalSchedulerAsync({
      startDate: new Date(2019, 0, 1, 6),
      endDate: new Date(2019, 0, 1, 18),
      viewPreset: 'hourAndDay',
      events: [{
        id: 1,
        name: 'Event 1',
        resourceId: 'r4',
        startDate: new Date(2019, 0, 1, 10),
        endDate: new Date(2019, 0, 1, 12)
      }],
      width: 400,
      resourceColumns: {
        columnWidth: 100
      }
    });
    t.chain({
      waitForSelector: '.b-sch-event'
    }, async () => {
      scheduler.subGrids.locked.width = 200;
    }, {
      waitForSelector: '.b-released'
    }, {
      dblClick: '.b-sch-timeaxis-cell',
      offset: [50, 100]
    }, {
      waitFor: () => scheduler.features.eventEdit.editor.containsFocus
    }, {
      type: 'New test event'
    }, {
      type: '[ENTER]'
    }, {
      waitForSelector: '.b-sch-event'
    }, next => {
      t.is(scheduler.eventStore.last.startDate, new Date(2019, 0, 1, 7, 30), 'Correct start date');
      t.is(scheduler.eventStore.last.resource, scheduler.resourceStore.first, 'Correct resource');
    });
  });
  t.it('Dragcreate proxy should be removed if event is edited to be outside of time axis', async t => {
    scheduler = await t.getVerticalSchedulerAsync({
      startDate: new Date(2019, 0, 1, 6),
      endDate: new Date(2019, 0, 1, 18),
      viewPreset: 'hourAndDay',
      events: []
    });
    let editorWidgetMap;
    t.chain({
      dblclick: '.b-grid-cell.b-sch-timeaxis-cell',
      offset: [75, 45]
    }, {
      waitFor: () => {
        editorWidgetMap = scheduler.features.eventEdit.editor.widgetMap;
        return editorWidgetMap.nameField.containsFocus;
      }
    }, {
      type: 'New Event'
    }, {
      click: () => editorWidgetMap.startDateField.input
    }, // Make it far into the future, outside the timeAxis
    {
      type: '31/12/2030',
      clearExisting: true
    }, // Save it
    {
      click: () => scheduler.features.eventEdit.editor.widgetMap.saveButton.element
    }, // Wait for editor to have gone
    {
      waitFor: () => !scheduler.features.eventEdit.editor.isVisible
    }, () => {
      // The event is in the store
      t.is(scheduler.eventStore.count, 1); // But it's outside the visible timeaxis, so there must be no rendered event elements.

      t.is(scheduler.timeAxisSubGridElement.querySelectorAll(scheduler.eventSelector).length, 0);
    });
  });
});