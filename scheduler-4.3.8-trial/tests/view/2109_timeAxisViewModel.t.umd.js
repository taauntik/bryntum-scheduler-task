"use strict";

StartTest(t => {
  document.body.style.width = '800px';
  let scheduler;
  t.beforeEach(function () {
    scheduler && scheduler.destroy();
    scheduler = null;
  });
  t.it('Should get sane tickSize', t => {
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      startDate: new Date(2010, 0, 1),
      endDate: new Date(2010, 0, 17),
      appendTo: document.body
    });
    const model = scheduler.timeAxisViewModel;
    scheduler.tickSize = 50;
    scheduler.rowHeight = 100;
    t.is(model.tickSize, 50, 'horizontal: tickSize got assigned correct value'); //TODO: PORT porting vertical model later
    //        scheduler.setMode('vertical');
    //        t.is(model.tickSize, 50, 'vertical: tickWidth got assigned correct value');
  });
  t.it('Should get sane tickSize from getSnapPixelAmount method', t => {
    const ta = new TimeAxis({
      unit: 'minute',
      increment: 30,
      resolutionUnit: 'minute',
      resolutionIncrement: 30
    });
    const model = new TimeAxisViewModel({
      snap: true,
      forceFit: false,
      timeAxis: ta,
      tickSize: 100
    });
    t.is(model.snapPixelAmount, 100, '1 minute == 3.33333333px');
  });
  t.it('Should get 4 arguments in header renderer', t => {
    let isCalled,
        eventStore = t.getEventStore();
    PresetManager.registerPreset('header', {
      tickWidth: 35,
      rowHeight: 32,
      displayDateFormat: 'HH:mm',
      shiftIncrement: 1,
      shiftUnit: 'day',
      timeResolution: {
        unit: 'minute',
        increment: 15
      },
      defaultSpan: 24,
      headers: [{
        unit: 'day',
        increment: 1,
        renderer: function (startDate, endDate, headerConfig, cellIdx) {
          isCalled = true;
          t.is(startDate, new Date(2010, 1, 1), 'Start of the cell is ok');
          t.is(endDate, new Date(2010, 1, 2), 'End of the cell is ok');
          t.isObject(headerConfig, 'headerConfig is ok');
          t.is(cellIdx, 0, 'index is ok');
          t.is(arguments.length, 4, 'Exactly 4 args passed');
        }
      }]
    }); // a scheduler with 3 level headers

    scheduler = t.getScheduler({
      viewPreset: 'header',
      appendTo: document.body,
      eventStore,
      startDate: new Date(2010, 1, 1),
      endDate: new Date(2010, 1, 2)
    });
    t.ok(isCalled);
  });
  t.it('getDates()', t => {
    const scenarios = [{
      name: 'month & week - week',
      viewPreset: {
        timeResolution: {
          unit: 'week',
          increment: 1
        },
        headers: [{
          unit: 'month',
          dateFormat: 'MMMM' // Januari

        }, {
          unit: 'week',
          dateFormat: 'W' // 1 - 52

        }]
      },
      count: 53,
      // jan 1 was last week 2016
      majorCount: 0
    }, {
      name: 'month & week - month',
      viewPreset: {
        timeResolution: {
          unit: 'week',
          increment: 1
        },
        columnLinesFor: 0,
        mainHeaderLevel: 0,
        headers: [{
          unit: 'month',
          dateFormat: 'MMMM' // Januari

        }, {
          unit: 'week',
          dateFormat: 'W' // 1 - 52

        }]
      },
      count: 12,
      majorCount: 0
    }, {
      name: 'month & day',
      viewPreset: {
        timeResolution: {
          unit: 'day',
          increment: 1
        },
        mainHeaderLevel: 0,
        headers: [{
          unit: 'month',
          dateFormat: 'MM'
        }, {
          unit: 'day',
          dateFormat: 'DD'
        }]
      },
      count: 365,
      majorCount: 12
    }, {
      name: 'year & month',
      viewPreset: {
        timeResolution: {
          unit: 'month',
          increment: 1
        },
        mainHeaderLevel: 1,
        headers: [{
          unit: 'year',
          dateFormat: 'YYYY'
        }, {
          unit: 'month',
          dateFormat: 'MM'
        }]
      },
      count: 12,
      majorCount: 1
    }];
    scenarios.forEach(scenario => {
      t.it(scenario.name, t => {
        const ta = new TimeAxis({
          startDate: new Date(2017, 0, 1),
          endDate: new Date(2017, 11, 31),
          viewPreset: scenario.viewPreset,
          weekStartDay: 1
        });
        const model = new TimeAxisViewModel({
          //forceFit   : false,
          timeAxis: ta,
          viewPreset: scenario.viewPreset
        });
        model.update(1000);
        const dates = model.getDates();
        t.is(dates.length, scenario.count, 'Date count correct');
        t.is(dates.filter(date => date.isMajor).length, scenario.majorCount, 'Major count correct');
      });
    });
  });
});