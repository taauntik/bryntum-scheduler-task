"use strict";

StartTest(t => {
  let scheduler, event, start, end; // So that we can t.iit certain tests

  t.beforeEach(async t => {
    scheduler = bryntum.query('scheduler');
    await t.waitForEventsToRender();
  });
  t.it('sanity', t => {
    t.chain(async () => {
      t.checkGridSanity(scheduler); // Disable tooltips to do not cover event elements

      scheduler.features.eventTooltip.disabled = true;
      scheduler.features.scheduleTooltip.disabled = true;
    });
  });
  t.it('Confirmation button should enable confirmation', t => {
    event = scheduler.eventStore.getById(1);
    start = event.startDate;
    t.chain({
      click: '[data-ref="confirmationBtn"]'
    }, {
      drag: '[data-event-id="1"]',
      offset: [15, 10],
      by: [-1 * scheduler.tickSize, 0]
    }, {
      click: '[data-ref="okButton"]'
    }, async () => {
      t.is(event.resourceId, 'a', 'Assigned to correct resource');
      t.ok(start - event.startDate, 'Start time is changed');
    }, {
      click: '[data-ref="confirmationBtn"]'
    });
  });
  t.it('ReadOnly button should lock modifications', t => {
    event = scheduler.eventStore.getById(1);
    start = event.startDate;
    t.chain({
      click: '[data-ref="lockBtn"]'
    }, {
      drag: '[data-event-id="1"]',
      offset: [15, 10],
      by: [scheduler.tickSize, 0]
    }, async () => {
      t.is(event.resourceId, 'a', 'Assigned to correct resource');
      t.notOk(start - event.startDate, 'Start time is the same');
    }, {
      click: '[data-ref="lockBtn"]'
    }, {
      drag: '[data-event-id="1"]',
      offset: [15, 10],
      by: [scheduler.tickSize, 0]
    }, () => {
      t.is(event.resourceId, 'a', 'Assigned to correct resource');
      t.ok(start - event.startDate, 'Start time is changed');
    });
  });
  t.it('Dragging Scrum task to non-Developer resource should not be allowed', t => {
    t.chain({
      drag: '[data-event-id="1"]',
      offset: [15, 10],
      by: [0, scheduler.rowHeight]
    }, () => {
      t.is(scheduler.eventStore.getById(1).resourceId, 'a', 'Assigned to correct resource');
    });
  });
  t.it('Dragging CannotDrag task is not allowed', t => {
    event = scheduler.eventStore.getById(2);
    start = event.startDate;
    t.chain({
      drag: '[data-event-id="2"]',
      offset: [15, 10],
      by: [-4 * scheduler.tickSize, scheduler.rowHeight]
    }, async () => {
      t.is(event.resourceId, 'a', 'Assigned to correct resource');
    }, {
      drag: '[data-event-id="2"]',
      offset: [15, 10],
      by: [scheduler.tickSize, 0]
    }, () => {
      t.notOk(start - event.startDate, 'Start time is the same');
    });
  });
  t.it('Dragging PrepareCampaign task to non-Sales resource should not be allowed', t => {
    t.chain({
      drag: '[data-event-id="3"]',
      offset: [15, 10],
      by: [-4 * scheduler.tickSize, scheduler.rowHeight]
    }, () => {
      t.is(scheduler.eventStore.getById(3).resourceId, 'b', 'Assigned to correct resource');
    });
  });
  t.it('Dragging MarketingMeeting task to another resource should not be allowed', t => {
    t.chain({
      drag: '[data-event-id="4"]',
      offset: [15, 10],
      by: [0, scheduler.rowHeight]
    }, () => {
      t.is(scheduler.eventStore.getById(4).resourceId, 'c', 'Assigned to correct resource');
    });
  });
  t.it('Dragging CodingSession task to non-Developer resource should not be allowed', t => {
    t.chain({
      drag: '[data-event-id="5"]',
      offset: [15, 10],
      by: [0, -scheduler.rowHeight]
    }, () => {
      t.is(scheduler.eventStore.getById(5).resourceId, 'd', 'Assigned to correct resource');
    });
  });
  t.it('Dragging UXImprovements task to non-Developer resource should not be allowed', t => {
    t.chain({
      drag: '[data-event-id="6"]',
      offset: [15, 10],
      by: [0, -2 * scheduler.rowHeight]
    }, () => {
      t.is(scheduler.eventStore.getById(6).resourceId, 'e', 'Assigned to correct resource');
    });
  });
  t.it('Dragging FixedTime task to another time should not be allowed', t => {
    t.chain({
      drag: '[data-event-id="7"]',
      offset: [15, 10],
      by: [3 * scheduler.tickSize, 0]
    }, () => {
      t.is(scheduler.eventStore.getById(7).resourceId, 'e', 'Assigned to correct resource');
    });
  });
  t.it('Dragging first Golf task to non-CEO resource should not be allowed', t => {
    t.chain({
      drag: '[data-event-id="8"]',
      offset: [15, 10],
      by: [2 * scheduler.tickSize, -2 * scheduler.rowHeight]
    }, () => {
      t.is(scheduler.eventStore.getById(8).resourceId, 'g', 'Assigned to correct resource');
    });
  });
  t.it('Dragging second Golf task to non-CTO resource should not be allowed', t => {
    t.chain({
      drag: '[data-event-id="9"]',
      offset: [15, 10],
      by: [2 * scheduler.tickSize, -3 * scheduler.rowHeight]
    }, () => {
      t.is(scheduler.eventStore.getById(9).resourceId, 'h', 'Assigned to correct resource');
    });
  });
  t.it('Dragging Scrum task to another Developer resource should be allowed', t => {
    event = scheduler.eventStore.getById(1);
    start = event.startDate;
    t.chain({
      drag: '[data-event-id="1"]',
      offset: [15, 10],
      by: [3 * scheduler.tickSize, 3 * scheduler.rowHeight]
    }, () => {
      t.is(scheduler.eventStore.getById(1).resourceId, 'd', 'Assigned to correct resource');
      t.ok(start - event.startDate, 'Start time is changed');
    });
  });
  t.it('Dragging PrepareCampaign task to another time should be allowed', t => {
    event = scheduler.eventStore.getById(3);
    start = event.startDate;
    t.chain({
      drag: '[data-event-id="3"]',
      offset: [15, 10],
      by: [scheduler.tickSize, 0]
    }, () => {
      t.ok(start - event.startDate, 'Start time is changed');
    });
  });
  t.it('Dragging MarketingMeeting task to another time should be allowed', t => {
    event = scheduler.eventStore.getById(4);
    start = event.startDate;
    t.chain({
      drag: '[data-event-id="4"]',
      offset: [15, 10],
      by: [scheduler.tickSize, 0]
    }, () => {
      t.ok(start - event.startDate, 'Start time is changed');
    });
  });
  t.it('Dragging CodingSession task to another Developer resource and another time should be allowed', t => {
    event = scheduler.eventStore.getById(5);
    start = event.startDate;
    t.chain({
      drag: '[data-event-id="5"]',
      offset: [15, 10],
      by: [scheduler.tickSize, -3 * scheduler.rowHeight]
    }, () => {
      t.is(event.resourceId, 'a', 'Assigned to correct resource');
      t.ok(start - event.startDate, 'Start time is changed');
    });
  });
  t.it('Dragging UXImprovements task to another time should be allowed', t => {
    event = scheduler.eventStore.getById(6);
    start = event.startDate;
    t.chain({
      drag: '[data-event-id="6"]',
      offset: [15, 10],
      by: [5 * scheduler.tickSize, 0]
    }, () => {
      t.ok(start - event.startDate, 'Start time is changed');
    });
  });
  t.it('Dragging FixedTime task to another Developer resource but the same time should be allowed', t => {
    event = scheduler.eventStore.getById(7);
    start = event.startDate;
    t.chain({
      drag: '[data-event-id="7"]',
      offset: [15, 10],
      by: [-1 * scheduler.tickSize, -1 * scheduler.rowHeight]
    }, () => {
      t.is(event.resourceId, 'd', 'Assigned to correct resource');
      t.notOk(start - event.startDate, 'Start time is the same');
    });
  });
  t.it('Dragging first Golf task to CTO resource should be allowed', t => {
    event = scheduler.eventStore.getById(8);
    start = event.startDate;
    t.chain({
      drag: '[data-event-id="8"]',
      offset: [15, 10],
      by: [7 * scheduler.tickSize, scheduler.rowHeight]
    }, () => {
      t.is(event.resourceId, 'h', 'Assigned to correct resource');
      t.ok(start - event.startDate, 'Start time is changed');
    });
  });
  t.it('Dragging second Golf task to CEO resource should be allowed', t => {
    event = scheduler.eventStore.getById(9);
    start = event.startDate;
    t.chain({
      drag: '[data-event-id="9"]',
      offset: [15, 10],
      by: [scheduler.tickSize, -1 * scheduler.rowHeight]
    }, () => {
      t.is(event.resourceId, 'g', 'Assigned to correct resource');
      t.ok(start - event.startDate, 'Start time is changed');
    });
  });
  t.it('Resizing Scrum task in both directions should be allowed', t => {
    event = scheduler.eventStore.getById(1);
    start = event.startDate;
    end = event.endDate;
    t.chain(() => scheduler.scrollEventIntoView(event, {
      block: 'center'
    }), {
      drag: '[data-event-id="1"]',
      offset: [5, '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(start - event.startDate, 'Start time is changed');
    }, {
      drag: '[data-event-id="1"]',
      offset: [5, '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(start - event.startDate, 'Start time is back');
    }, {
      drag: '[data-event-id="1"]',
      offset: ['100%-5', '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(end - event.endDate, 'End time is changed');
    }, {
      drag: '[data-event-id="1"]',
      offset: ['100%-5', '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, () => {
      t.notOk(end - event.endDate, 'End time is back');
    });
  });
  t.it('Resizing CannotDrag task in both directions should be allowed', t => {
    event = scheduler.eventStore.getById(2);
    start = event.startDate;
    end = event.endDate;
    t.chain(() => scheduler.scrollEventIntoView(event, {
      block: 'center'
    }), {
      drag: '[data-event-id="2"]',
      offset: [5, '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(start - event.startDate, 'Start time is changed');
    }, {
      drag: '[data-event-id="2"]',
      offset: [5, '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(start - event.startDate, 'Start time is back');
    }, {
      drag: '[data-event-id="2"]',
      offset: ['100%-5', '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(end - event.endDate, 'End time is changed');
    }, {
      drag: '[data-event-id="2"]',
      offset: ['100%-5', '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, () => {
      t.notOk(end - event.endDate, 'End time is back');
    });
  });
  t.it('Resizing PrepareCampaign task in both directions should be allowed', t => {
    event = scheduler.eventStore.getById(3);
    start = event.startDate;
    end = event.endDate;
    t.chain(() => scheduler.scrollEventIntoView(event, {
      block: 'center'
    }), {
      drag: '[data-event-id="3"]',
      offset: [5, '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(start - event.startDate, 'Start time is changed');
    }, {
      drag: '[data-event-id="3"]',
      offset: [5, '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(start - event.startDate, 'Start time is back');
    }, {
      drag: '[data-event-id="3"]',
      offset: ['100%-5', '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(end - event.endDate, 'End time is changed');
    }, {
      drag: '[data-event-id="3"]',
      offset: ['100%-5', '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, () => {
      t.notOk(end - event.endDate, 'End time is back');
    });
  });
  t.it('Resizing MarketingMeeting task in both directions should be allowed', t => {
    event = scheduler.eventStore.getById(4);
    start = event.startDate;
    end = event.endDate;
    t.chain(() => scheduler.scrollEventIntoView(event, {
      block: 'center'
    }), {
      drag: '[data-event-id="4"]',
      offset: [5, '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(start - event.startDate, 'Start time is changed');
    }, {
      drag: '[data-event-id="4"]',
      offset: [5, '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(start - event.startDate, 'Start time is back');
    }, {
      drag: '[data-event-id="4"]',
      offset: ['100%-5', '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(end - event.endDate, 'End time is changed');
    }, {
      drag: '[data-event-id="4"]',
      offset: ['100%-5', '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, () => {
      t.notOk(end - event.endDate, 'End time is back');
    });
  });
  t.it('Resizing CodingSession task in both directions should be allowed but the task cannot be shortened', t => {
    event = scheduler.eventStore.getById(5);
    start = event.startDate;
    end = event.endDate;
    t.chain(() => scheduler.scrollEventIntoView(event, {
      block: 'center'
    }), {
      drag: '[data-event-id="5"]',
      offset: [5, '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(start - event.startDate, 'Start time is changed');
    }, {
      drag: '[data-event-id="5"]',
      offset: [5, '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(start - event.startDate, 'Start time is not back');
    }, {
      drag: '[data-event-id="5"]',
      offset: ['100%-5', '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(end - event.endDate, 'End time is not changed');
    }, {
      drag: '[data-event-id="5"]',
      offset: ['100%-5', '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, () => {
      t.ok(end - event.endDate, 'End time is changed');
    });
  });
  t.it('Resizing UXImprovements task in both directions should be allowed but the task cannot be shortened', t => {
    event = scheduler.eventStore.getById(6);
    start = event.startDate;
    end = event.endDate;
    t.chain(() => scheduler.scrollEventIntoView(event, {
      block: 'center'
    }), {
      drag: '[data-event-id="6"]',
      offset: [5, '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(start - event.startDate, 'Start time is changed');
    }, {
      drag: '[data-event-id="6"]',
      offset: [5, '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, async () => {
      t.ok(start - event.startDate, 'Start time is not back');
    }, {
      drag: '[data-event-id="6"]',
      offset: ['100%-5', '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(end - event.endDate, 'End time is not changed');
    }, {
      drag: '[data-event-id="6"]',
      offset: ['100%-5', '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, () => {
      t.ok(end - event.endDate, 'End time is changed');
    });
  });
  t.it('Resizing FixedTime task in both directions should not be allowed', t => {
    event = scheduler.eventStore.getById(7);
    start = event.startDate;
    end = event.endDate;
    t.chain(() => scheduler.scrollEventIntoView(event, {
      block: 'center'
    }), {
      drag: '[data-event-id="7"]',
      offset: [5, '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(start - event.startDate, 'Start time is not changed');
    }, {
      drag: '[data-event-id="7"]',
      offset: [5, '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(start - event.startDate, 'Start time is not changed');
    }, {
      drag: '[data-event-id="7"]',
      offset: ['100%-5', '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(end - event.endDate, 'End time is not changed');
    }, {
      drag: '[data-event-id="7"]',
      offset: ['100%-5', '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, () => {
      t.notOk(end - event.endDate, 'End time is not changed');
    });
  });
  t.it('Resizing first Golf task in both directions should not be allowed', t => {
    event = scheduler.eventStore.getById(8);
    start = event.startDate;
    end = event.endDate;
    t.chain(() => {
      scheduler.zoomOut();
      return scheduler.scrollEventIntoView(event, {
        block: 'center'
      });
    }, {
      drag: '[data-event-id="8"]',
      offset: [5, '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(start - event.startDate, 'Start time is not changed');
    }, {
      drag: '[data-event-id="8"]',
      offset: [5, '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(start - event.startDate, 'Start time is not changed');
    }, () => scheduler.scrollEventIntoView(event, {
      block: 'end',
      edgeOffset: 3 * scheduler.tickSize
    }), {
      drag: '[data-event-id="8"]',
      offset: ['100%-5', '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(end - event.endDate, 'End time is not changed');
    }, {
      drag: '[data-event-id="8"]',
      offset: ['100%-5', '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, () => {
      t.notOk(end - event.endDate, 'End time is not changed');
    });
  });
  t.it('Resizing second Golf task in both directions should not be allowed', t => {
    event = scheduler.eventStore.getById(9);
    start = event.startDate;
    end = event.endDate;
    t.chain(() => scheduler.scrollEventIntoView(event, {
      block: 'center'
    }), {
      drag: '[data-event-id="9"]',
      offset: [5, '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(start - event.startDate, 'Start time is not changed');
    }, {
      drag: '[data-event-id="9"]',
      offset: [5, '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(start - event.startDate, 'Start time is not changed');
    }, {
      drag: '[data-event-id="9"]',
      offset: ['100%-5', '50%'],
      by: [-1 * scheduler.tickSize / 2, 0]
    }, async () => {
      t.notOk(end - event.endDate, 'End time is not changed');
    }, {
      drag: '[data-event-id="9"]',
      offset: ['100%-5', '50%'],
      by: [scheduler.tickSize / 2, 0]
    }, () => {
      t.notOk(end - event.endDate, 'End time is not changed');
    });
  });
  t.it('Should not fail on dbl click to create event', t => {
    t.chain(async () => scheduler.timeAxisSubGrid.scrollable.x = 0, {
      dblClick: '[data-region="normal"] .b-grid-row',
      offset: [10, '50%'],
      desc: 'Create new event with dbl click'
    });
  });
});