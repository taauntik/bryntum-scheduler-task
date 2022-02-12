"use strict";

StartTest(t => {
  let scheduler;
  t.it('Events outside of timeaxis should not trigger rows repainting', async t => {
    const eventStore = new EventStore();
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2010, 1, 1),
      endDate: new Date(2010, 2, 2),
      eventStore: eventStore,
      resourceStore: t.getResourceStore({
        data: [{
          id: 1
        }]
      })
    });
    t.it('Should not render events outside the timeaxis', async t => {
      t.wontFire(scheduler, 'renderEvent', 'Rows should not be repainted when modifying event records outside the timeaxis');
      const [event] = eventStore.add({
        startDate: new Date(1999, 1, 1, 10),
        endDate: null,
        //new Date(1999, 1, 1, 12),
        resourceId: 1
      });
      await t.waitForProjectReady(); // testing complex condition checking case when resource and dates are changed simultaneously

      event.beginBatch();
      event.endDate = new Date(1999, 1, 1, 13);
      event.resourceId = 'r2';
      event.endBatch();
      await t.waitForProjectReady();
      event.startDate = null;
      await t.waitForProjectReady();
      eventStore.remove(event);
      await t.waitForProjectReady();
    });
    t.it('Moving event to/from time axis should repaint rows', async t => {
      eventStore.data = [{
        id: 1,
        startDate: new Date(2010, 1, 1, 10),
        endDate: new Date(2010, 1, 1, 12),
        resourceId: 1
      }];
      await t.waitForProjectReady();
      t.selectorExists('.b-sch-event', 'Event is inside of timeaxis');
      const event = eventStore.getAt(0);
      event.beginBatch();
      event.startDate = new Date(2010, 0, 1);
      event.endDate = new Date(2010, 0, 2);
      event.endBatch();
      await t.waitForProjectReady();
      t.selectorNotExists(scheduler.unreleasedEventSelector, 'Event is outside of timeaxis');
      event.beginBatch();
      event.startDate = new Date(2010, 1, 1, 10);
      event.endDate = new Date(2010, 1, 1, 12);
      event.endBatch();
      await t.waitForProjectReady();
      t.selectorExists(scheduler.unreleasedEventSelector, 'Event is inside of timeaxis');
    });
  });
});