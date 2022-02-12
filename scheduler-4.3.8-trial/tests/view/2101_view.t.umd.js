"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
  });
  t.it('Basic view functionality tests', async t => {
    scheduler = await t.getSchedulerAsync({
      emptyText: 'empty_schedule',
      eventRenderer: ({
        resourceRecord
      }) => resourceRecord.name,
      animateRemovingRows: false
    }); // actually, a full render is triggered in case rows height change because of overlapping events
    // but since rendering only renders events in view it is really fast
    //t.wontFire(scheduler.rowManager, 'fullrender', 'full render should not be triggered after event is added');

    const newEvent = new EventModel({
      startDate: scheduler.startDate,
      endDate: scheduler.endDate,
      cls: 'foo',
      resourceId: scheduler.resourceStore.first.id
    });
    scheduler.eventStore.add(newEvent);
    scheduler.resourceStore.first.name = 'BLARGH';
    await t.waitForProjectReady();
    t.contentLike(scheduler.getElementsFromEventRecord(newEvent)[0], 'BLARGH', 'Event row should be refreshed when resource is updated');
    newEvent.resourceId = 'BLARGH';
    await t.waitForProjectReady(); // event animations are disabled in IE11 so when event resource is changed element is not getting removed with
    // a timeout but instantly. Element is removed eventually in normal browsers too, so we just wait for it to happen.
    // If at some point event stays rendered (e.g. cache logic change) just add condition for IE to still use
    // waitForSelectorNotFound

    t.waitForSelectorNotFound(':not(.b-released) > .b-sch-event.foo', () => {
      t.pass('Event removed from DOM after remove');
    });
    scheduler.resourceStore.remove(scheduler.resourceStore.first);
    await t.waitForProjectReady();
  });
  t.it('Multiple events per resource', async t => {
    class MyEvent extends EventModel {
      static get fields() {
        return [{
          name: 'resourceId',
          dataSource: 'resId'
        }];
      }

    }

    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2018, 4, 14),
      endDate: new Date(2018, 4, 21),
      eventStore: {
        modelClass: MyEvent,
        data: [{
          id: 1,
          name: 'First',
          startDate: '2018-05-15',
          endDate: '2018-05-16',
          resId: 'r1'
        }, {
          id: 2,
          name: 'Second',
          startDate: '2018-05-18',
          endDate: '2018-05-19',
          resId: 'r1'
        }]
      }
    });
    t.waitForSelector('.b-sch-event:contains(Second)', () => {
      const eventEls = document.querySelectorAll('.b-sch-event');
      t.is(eventEls.length, 2, '2 events visible');
      t.is(eventEls[0].innerText.trim(), 'First');
      t.is(eventEls[1].innerText.trim(), 'Second');
    });
  });
  t.it('Removing a resource should unassign it from all its events', async t => {
    scheduler = await t.getSchedulerAsync();
    const resource = scheduler.resourceStore.first;
    let events = resource.events;
    t.expect(events.length).toBe(1);
    events[0].name = 'FOO';
    scheduler.resourceStore.remove(resource);
    t.waitForElementNotVisible('.b-sch-event:contains(FOO)', () => {
      events = resource.events;
      t.expect(events.length).toBe(0);
      t.pass('Event unassigned and from DOM after remove');
    });
  });
  t.it('Updating an event with no resource should not cause a crash', async t => {
    scheduler = await t.getSchedulerAsync({
      emptyText: 'empty_schedule'
    });
    const newEvent = new EventModel({
      startDate: scheduler.startDate,
      endDate: scheduler.endDate,
      cls: 'foo'
    });
    scheduler.eventStore.add(newEvent);
    newEvent.name = 'FOO';
    await t.waitForProjectReady();
    t.pass('No crash');
  });
  t.it('Updating an event with mapped resourceId field should render event properly', async t => {
    class MyEvent extends EventModel {
      static get fields() {
        return [{
          name: 'resourceId',
          dataSource: 'resId'
        }];
      }

    }

    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2018, 4, 14),
      endDate: new Date(2018, 4, 21),
      eventStore: {
        modelClass: MyEvent,
        data: [{
          id: 1,
          startDate: '2018-05-17',
          endDate: '2018-05-18',
          resId: 'r1'
        }]
      }
    });
    t.waitForSelector('.b-sch-event', () => {
      const event = scheduler.eventStore.first; // update using batch

      event.beginBatch();
      event.resourceId = 'r2';
      event.endBatch();
      t.selectorCountIs('.b-sch-event', 1, 'Only 1 event visible'); // update without batch

      scheduler.eventStore.first.resourceId = 'r3';
      t.selectorCountIs('.b-sch-event', 1, 'Only 1 event visible');
    });
  });
  t.it('Basic API tests', async t => {
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2010, 1, 1),
      endDate: new Date(2010, 5, 1)
    });
    t.is(scheduler.getCoordinateFromDate(new Date(2010, 1, 1)), 0);
    t.is(scheduler.getCoordinateFromDate(new Date(2010, 0, 1)), -1);
    t.is(scheduler.getCoordinateFromDate(new Date(2020, 0, 1)), -1);
    t.is(scheduler.resolveResourceRecord(document.querySelector('.b-sch-timeaxis-cell')), scheduler.resourceStore.first, 'resolveResource horizontal');
  });
  t.it('getCoordinateFromDate should work when scheduler is inside another DIV', async t => {
    document.body.innerHTML = '<div id="ct" style="height: 400px;width:800px;position:relative;left:200px;"></div>';
    scheduler = await t.getSchedulerAsync({
      appendTo: document.getElementById('ct'),
      startDate: new Date(2010, 1, 1),
      endDate: new Date(2010, 5, 1),
      columns: [{
        width: 100,
        text: 'foo'
      }]
    });
    t.is(scheduler.timeAxisViewModel.tickSize, 100); // local schedule coordinates

    t.is(scheduler.getCoordinateFromDate(new Date(2010, 1, 1)), 0);
    t.isApprox(scheduler.getCoordinateFromDate(new Date(2010, 1, 2)), 0.5, 100);
    t.is(scheduler.getDateFromCoordinate(100, 'round', true), new Date(2010, 1, 2)); // coordinates relative to page
    // 200 = container offset,
    // 100 = locked grid column
    // 5 = splitter width
    // 100 = tickSize

    t.isApprox(scheduler.getCoordinateFromDate(new Date(2010, 1, 2), false), 200 + 100 + 5 + 100, 0.5);
    t.is(scheduler.getDateFromCoordinate(200 + 100 + 5 + 100, 'round', false), new Date(2010, 1, 2));
  });
  t.it('Should fire "renderEvent" when an event gets updated in the DOM, should fire once for a single event', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      mode: 'horizontal',
      useInitialAnimation: false,
      startDate: new Date(2010, 1, 1),
      endDate: new Date(2010, 1, 3),
      resources: [{
        id: 1
      }, {
        id: 2
      }]
    });
    await t.waitForProjectReady();
    t.diag('should fire once for a single event');
    scheduler.eventStore.data = [{
      resourceId: 1,
      startDate: new Date(2010, 1, 1),
      endDate: new Date(2010, 1, 2)
    }, {
      resourceId: 2,
      startDate: new Date(2010, 1, 1),
      endDate: new Date(2010, 1, 2)
    }];
    await t.waitForProjectReady();
    t.firesOnce(scheduler, 'renderEvent');
    scheduler.eventStore.first.name = 'Foo';
  }); // https://www.assembla.com/spaces/bryntum/tickets/1827-investigate-locked-grid-view-ondatarefresh-unnecessary-call/details#

  t.it('Should refresh views once when data changes', async t => {
    scheduler = await t.getSchedulerAsync();
    t.firesOnce(scheduler, 'beforeRenderRows');
    t.firesOnce(scheduler, 'renderRows');
    t.willFireNTimes(scheduler.rowManager, 'renderRow', scheduler.store.count);
    scheduler.store.sort('name', false);
  });
  t.it('Should support different row heights', async t => {
    scheduler = await t.getSchedulerAsync({
      rowHeight: 22,
      barMargin: 1,
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 10)
      }]
    });
    const cell = document.querySelector('.b-grid-cell');

    function rowHeightIsCorrect() {
      // Row height must be correct
      return cell.offsetHeight === scheduler.rowHeight;
    }

    t.chain({
      waitForSelector: '.b-sch-event'
    }, {
      waitFor: rowHeightIsCorrect
    }, next => {
      scheduler.rowHeight = 30;
      next();
    }, {
      waitFor: rowHeightIsCorrect
    }, next => {
      scheduler.rowHeight = 25;
      next();
    }, {
      waitFor: rowHeightIsCorrect
    });
  });
  t.it('Should always draw at least a 1px high bar even if barMargin/rowHeight combination is misconfigured', async t => {
    scheduler = await t.getSchedulerAsync({
      rowHeight: 20,
      barMargin: 20,
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 10)
      }]
    });
    t.chain({
      waitForSelector: '.b-sch-event'
    }, () => {
      const eventEl = document.querySelector('.b-sch-event'),
            foregroundEl = document.querySelector('.b-sch-foreground-canvas');
      t.isGreaterOrEqual(eventEl.offsetHeight, 1, 'Event element is rendered');
      t.isLessOrEqual(eventEl.getBoundingClientRect().top - foregroundEl.getBoundingClientRect().top, scheduler.rowHeight / 2, 'Event is placed in the top half of the row');
    });
  });
  t.it('should be able to resolve Resource from a Row element, Row child element or an Event element', async t => {
    scheduler = await t.getSchedulerAsync({
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6),
        endDate: new Date(2011, 0, 10)
      }]
    });
    const resource = scheduler.resourceStore.getById('r1'),
          row = scheduler.getRowFor(resource),
          rowEl = row.getElement('normal'),
          eventElement = document.querySelector('.b-sch-event');
    t.is(scheduler.resolveResourceRecord(eventElement), resource, 'Event element matched to resource record');
    t.is(scheduler.resolveResourceRecord(rowEl), resource, 'Row element matched to resource record');
    t.is(scheduler.resolveResourceRecord(rowEl.firstElementChild), resource, 'Row child element matched to resource record');
  });
  t.it('should support visibleDateRange', async t => {
    document.body.innerHTML = '<div id="ct" style="height: 400px;width:800px;position:relative;left:200px;"></div>';
    scheduler = await t.getSchedulerAsync({
      appendTo: document.getElementById('ct'),
      startDate: new Date(2010, 1, 1),
      endDate: new Date(2010, 5, 1),
      width: 405,
      columns: [{
        width: 100,
        text: 'foo'
      }]
    });
    t.is(scheduler.visibleDateRange.startDate, new Date(2010, 1, 1), 'Correct visible start date');
    t.is(scheduler.visibleDateRange.endDate, new Date(2010, 1, 4), 'Correct visible end date');
    await scheduler.scrollToDate(new Date(2010, 1, 5));
    t.is(scheduler.visibleDateRange.startDate, new Date(2010, 1, 3), 'Correct visible start date after scroll to Jan 5');
    t.is(scheduler.visibleDateRange.endDate, new Date(2010, 1, 6), 'Correct visible end date after scroll to Jan 5');
  });
  t.it('should update visibleDateRange after zoom', async t => {
    document.body.innerHTML = '<div id="ct" style="height: 400px;width:800px;position:relative;left:200px;"></div>';
    scheduler = await t.getSchedulerAsync({
      appendTo: document.getElementById('ct'),
      viewPreset: 'weekAndDayLetter',
      startDate: new Date(2020, 5, 1),
      endDate: new Date(2020, 5, 7),
      weekStartDay: 1,
      width: 420,
      columns: [{
        width: 100,
        text: 'foo'
      }]
    });
    t.is(scheduler.visibleDateRange.startDate, new Date(2020, 5, 1), 'Correct visible start date');
    t.is(scheduler.visibleDateRange.endDate, new Date(2020, 5, 8), 'Correct visible end date');
    scheduler.viewPreset = {
      base: 'weekAndDayLetter',
      shiftUnit: 'day',
      // change one field to make timespan different
      options: {
        startDate: new Date(2020, 5, 8),
        endDate: new Date(2020, 5, 15)
      }
    };
    t.is(scheduler.visibleDateRange.startDate, new Date(2020, 5, 8), 'Correct visible start date');
    t.is(scheduler.visibleDateRange.endDate, new Date(2020, 5, 15), 'Correct visible end date');
  });
  t.it('Should not mark non-persistable events as dirty', async t => {
    class MyEvent extends EventModel {
      get isPersistable() {
        return this.id === 1;
      }

    }

    scheduler = await t.getSchedulerAsync({
      eventStore: t.getEventStore({
        modelClass: MyEvent,
        data: [{
          id: 1,
          resourceId: 'r1',
          startDate: new Date(2011, 0, 6),
          endDate: new Date(2011, 0, 10)
        }, {
          id: 2,
          resourceId: 'r1',
          startDate: new Date(2011, 0, 6),
          endDate: new Date(2011, 0, 10)
        }]
      })
    });
    const {
      dirtyCls
    } = scheduler;
    scheduler.eventStore.first.cls = 'foo';
    scheduler.eventStore.last.cls = 'bar';
    await t.waitForProjectReady();
    t.waitForSelector('.bar', () => {
      t.selectorExists(`[data-event-id=1] .${dirtyCls}`, 'persistable event got dirty class');
      t.selectorNotExists(`[data-event-id=2] .${dirtyCls}`, 'not persistable event hasn`t got dirty class');
    });
  }); // https://github.com/bryntum/support/issues/896

  t.it('Should not duplicate event when calling reassign with autoCommit:true ', async t => {
    scheduler = await t.getSchedulerAsync({
      eventStore: t.getEventStore({
        autoCommit: true,
        data: [{
          id: 1,
          resourceId: 'r1',
          startDate: new Date(2011, 0, 6),
          duration: 2
        }]
      })
    });
    scheduler.eventStore.first.reassign('r1', 'r2');
    t.selectorCountIs('.b-sch-event', 1);
  });
});