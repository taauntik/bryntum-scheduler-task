"use strict";

// Ported from 061_dragdrop_filtered_timeaxis.t.js
StartTest(t => {
  let scheduler, tickSize;

  function setup(config) {
    config = config || {};
    scheduler && scheduler.destroy();
    scheduler = t.getScheduler(Object.assign({
      viewPreset: 'dayAndWeek',
      startDate: new Date(2010, 0, 6),
      endDate: new Date(2010, 2, 1),
      features: {
        tree: Boolean(config.__tree)
      },
      columns: [{
        type: config.__tree ? 'tree' : null,
        text: 'Name',
        width: 200,
        field: 'name'
      }],
      events: [{
        id: 1,
        name: 'Test event',
        resourceId: 'r1',
        startDate: new Date(2010, 0, 11),
        endDate: new Date(2010, 0, 14)
      }],
      resourceStore: config.__tree ? t.getResourceTreeStore() : t.getResourceStore(),
      appendTo: document.body
    }, config));
    scheduler.timeAxis.filterBy(tick => tick.startDate.getDay() !== 6 && tick.startDate.getDay() !== 0);
    tickSize = scheduler.timeAxisViewModel.tickSize;
  }

  function getTestSteps(t) {
    return [{
      drag: '.b-sch-event',
      by: [-tickSize, 0]
    }, () => {
      const event = scheduler.eventStore.first;
      t.is(event.startDate, new Date(2010, 0, 8), 'Event\'s start date has been changed according to the proxy element\'s position');
    }];
  }

  t.it('Plain horizontal scheduler', t => {
    setup();
    t.chain(getTestSteps(t));
  });
  t.it('Tree scheduler', t => {
    setup({
      __tree: true
    });
    t.chain(getTestSteps(t));
  }); // https://github.com/bryntum/support/issues/1635

  t.it('Should not crash when dragging outside scheduler with filtered timeaxis', async t => {
    scheduler = t.getScheduler({
      style: 'margin-left:200px',
      startDate: new Date(2020, 2, 24),
      endDate: new Date(2020, 2, 25),
      width: 500,
      tickSize: 20,
      resources: [{
        id: 'r1',
        name: 'Buldozer'
      }],
      events: [{
        id: 'e1',
        name: 'Buldoze 1',
        startDate: new Date(2020, 2, 24, 17),
        duration: 3,
        durationUnit: 'h'
      }],
      assignments: [{
        id: 'a1',
        resource: 'r1',
        event: 'e1'
      }],
      viewPreset: 'hourAndDay'
    });
    scheduler.timeAxis.filter(t => t.startDate.getHours() > 8 && t.startDate.getHours() < 18);
    await t.waitForSelector('.b-sch-event');
    t.setCursorPosition(t.rect('.b-sch-event').left, t.rect('.b-sch-event').top);
    t.simulator.setSpeed('speedRun');
    await t.dragTo('.b-sch-event', '.b-scheduler', null, null, null, true, null, ['100%+100', 50]);
    await t.moveCursorTo([0, 0], () => {
      t.mouseUp(null);
    });
    t.simulator.setSpeed('turboMode');
  });
});