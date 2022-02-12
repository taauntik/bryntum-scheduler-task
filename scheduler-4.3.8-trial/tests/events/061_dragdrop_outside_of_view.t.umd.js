"use strict";

StartTest(async t => {
  let scheduler, tickSize, event;

  async function setup(config = {}) {
    if (scheduler) scheduler.destroy();
    document.body.width = '800px';
    scheduler = t.getScheduler(Object.assign({
      startDate: new Date(2010, 0, 1),
      endDate: new Date(2010, 2, 1),
      events: [{
        id: 1,
        name: 'Test event',
        resourceId: 'r1',
        cls: 'event1',
        startDate: new Date(2009, 11, 1),
        endDate: new Date(2010, 3, 1)
      }],
      //resourceStore           : config.__tree ? t.getResourceTreeStore() : t.getResourceStore(),
      resourceStore: t.getResourceStore(),
      features: {
        eventDrag: {
          showTooltip: false
        }
      }
    }, config));
    await t.waitForProjectReady(scheduler);
    event = scheduler.eventStore.first;
    tickSize = scheduler.timeAxisViewModel.tickSize;
  }

  let testSteps = [// moving forward in time
  {
    drag: () => {
      const gridRectangle = Rectangle.from(scheduler.timeAxisSubGridElement),
            eventRectangle = Rectangle.from(document.querySelector('.event1')),
            center = gridRectangle.intersect(eventRectangle).center;
      return center.toArray();
    },
    by: () => [tickSize, scheduler.rowHeight]
  }, next => {
    t.isApprox(DateHelper.getDurationInUnit(event.meta.modified.startDate, event.startDate, scheduler.timeAxis.mainUnit), 1, 1, 'Event moved approximately on 1 unit');
    t.isApprox(DateHelper.getDurationInUnit(event.meta.modified.endDate, event.endDate, scheduler.timeAxis.mainUnit), 1, 1, 'Event moved approximately on 1 unit');
    t.is(event.resourceId, 'r2', 'Event has been re-assigned to another resource');
    next();
  }, // moving backward in time
  {
    drag: () => {
      let gridRectangle = Rectangle.from(scheduler.timeAxisSubGridElement),
          eventRectangle = Rectangle.from(document.querySelector('.event1')),
          center = gridRectangle.intersect(eventRectangle).center;
      return center.toArray();
    },
    by: () => [-tickSize, -scheduler.rowHeight - 1]
  }, next => {
    t.isApprox(DateHelper.getDurationInUnit(event.meta.modified.startDate, event.startDate, scheduler.timeAxis.mainUnit), -1, 1, 'Event moved approximately on 1 unit');
    t.isApprox(DateHelper.getDurationInUnit(event.meta.modified.endDate, event.endDate, scheduler.timeAxis.mainUnit), -1, 1, 'Event moved approximately on 1 unit');
    next();
  }, {
    waitFor: () => event.resourceId === 'r1',
    desc: 'Event has been re-assigned to another resource'
  }]; // eof test steps

  await setup();
  t.diag('Plain horizontal scheduler');
  t.chain(testSteps // TODO: PORT tree later

  /*,
    function(next) {
   t.diag('Tree scheduler');
   setup({ __tree : true });
   next()
   },
   testSteps*/
  );
});