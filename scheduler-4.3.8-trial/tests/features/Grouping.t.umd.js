"use strict";

StartTest(t => {
  let scheduler;
  Object.assign(window, {
    Rectangle
  });
  t.beforeEach(t => {
    var _scheduler, _scheduler$destroy;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : (_scheduler$destroy = _scheduler.destroy) === null || _scheduler$destroy === void 0 ? void 0 : _scheduler$destroy.call(_scheduler);
  });

  async function getScheduler(config) {
    scheduler = await t.getSchedulerAsync(Object.assign({
      viewPreset: 'hourAndDay',
      height: 900,
      features: {
        eventTooltip: false,
        scheduleTooltip: false,
        eventEdit: false
      },
      columns: [{
        text: 'Name',
        field: 'name',
        width: 200
      }]
    }, config));
  }

  t.it('Should group resources', async t => {
    await getScheduler({
      startDate: new Date(2019, 10, 4),
      endDate: new Date(2019, 11, 9),
      viewPreset: 'weekAndDayLetter',
      enableEventAnimations: false,
      resources: [{
        firstName: 'Don',
        name: 'Don A Taylor',
        id: 1
      }, {
        firstName: 'John',
        name: 'John B Adams',
        id: 2
      }, {
        firstName: 'Doug',
        name: 'Doug C Jones',
        id: 3
      }, {
        firstName: 'James',
        name: 'James D Davis',
        id: 4
      }, {
        firstName: 'Mike',
        name: 'Mike E Johnson',
        id: 5
      }, {
        firstName: 'Don',
        name: 'Don F Johnson',
        id: 6
      }, {
        firstName: 'Jane',
        name: 'Jane G McGregor',
        id: 7
      }, {
        firstName: 'Jane',
        name: 'Jane H Thomas',
        id: 8
      }, {
        firstName: 'Lisa',
        name: 'Lisa I Anderson',
        id: 9
      }, {
        firstName: 'Don',
        name: 'Don J Thomas',
        id: 10
      }, {
        firstName: 'Doug',
        name: 'Doug K Jackson',
        id: 11
      }, {
        firstName: 'James',
        name: 'James L Ewans',
        id: 12
      }, {
        firstName: 'Jenny',
        name: 'Jenny M Brown',
        id: 13
      }, {
        firstName: 'Doug',
        name: 'Doug N Ewans',
        id: 14
      }, {
        firstName: 'Mike',
        name: 'Mike O Ewans',
        id: 15
      }, {
        firstName: 'Linda',
        name: 'Linda P McGregor',
        id: 16
      }, {
        firstName: 'Jenny',
        name: 'Jenny Q Jones',
        id: 17
      }, {
        firstName: 'Linda',
        name: 'Linda R Taylor',
        id: 18
      }, {
        firstName: 'Daniel',
        name: 'Daniel S Wilson',
        id: 19
      }],
      events: [{
        resourceId: 1,
        startDate: '2019-11-06T21:00:00.000Z',
        duration: 3,
        name: 'Assignment 2',
        id: '1-1'
      }, {
        resourceId: 1,
        startDate: '2019-11-23T21:00:00.000Z',
        duration: 0,
        name: 'Assignment 3',
        id: '1-2'
      }, {
        resourceId: 2,
        startDate: '2019-11-15T21:00:00.000Z',
        duration: 1,
        name: 'Assignment 2',
        id: '2-1'
      }, {
        resourceId: 2,
        startDate: '2019-11-25T21:00:00.000Z',
        duration: 11,
        name: 'Assignment 3',
        id: '2-2'
      }, {
        resourceId: 3,
        startDate: '2019-11-04T21:00:00.000Z',
        duration: 0,
        name: 'Assignment 2',
        id: '3-1'
      }, {
        resourceId: 3,
        startDate: '2019-11-29T21:00:00.000Z',
        duration: 8,
        name: 'Assignment 3',
        id: '3-2'
      }, {
        resourceId: 4,
        startDate: '2019-11-08T21:00:00.000Z',
        duration: 2,
        name: 'Assignment 2',
        id: '4-1'
      }, {
        resourceId: 4,
        startDate: '2019-11-21T21:00:00.000Z',
        duration: 1,
        name: 'Assignment 3',
        id: '4-2'
      }, {
        resourceId: 5,
        startDate: '2019-11-16T21:00:00.000Z',
        duration: 2,
        name: 'Assignment 2',
        id: '5-1'
      }, {
        resourceId: 5,
        startDate: '2019-12-04T21:00:00.000Z',
        duration: 0,
        name: 'Assignment 3',
        id: '5-2'
      }, {
        resourceId: 6,
        startDate: '2019-11-05T21:00:00.000Z',
        duration: 6,
        name: 'Assignment 2',
        id: '6-1'
      }, {
        resourceId: 6,
        startDate: '2019-11-26T21:00:00.000Z',
        duration: 0,
        name: 'Assignment 3',
        id: '6-2'
      }, {
        resourceId: 7,
        startDate: '2019-11-12T21:00:00.000Z',
        duration: 0,
        name: 'Assignment 2',
        id: '7-1'
      }, {
        resourceId: 7,
        startDate: '2019-12-05T21:00:00.000Z',
        duration: 0,
        name: 'Assignment 3',
        id: '7-2'
      }, {
        resourceId: 8,
        startDate: '2019-11-08T21:00:00.000Z',
        duration: 7,
        name: 'Assignment 2',
        id: '8-1'
      }, {
        resourceId: 8,
        startDate: '2019-11-20T21:00:00.000Z',
        duration: 4,
        name: 'Assignment 3',
        id: '8-2'
      }, {
        resourceId: 9,
        startDate: '2019-11-04T21:00:00.000Z',
        duration: 12,
        name: 'Assignment 2',
        id: '9-1'
      }, {
        resourceId: 9,
        startDate: '2019-12-04T21:00:00.000Z',
        duration: 1,
        name: 'Assignment 3',
        id: '9-2'
      }, {
        resourceId: 10,
        startDate: '2019-11-05T21:00:00.000Z',
        duration: 3,
        name: 'Assignment 2',
        id: '10-1'
      }, {
        resourceId: 10,
        startDate: '2019-11-24T21:00:00.000Z',
        duration: 7,
        name: 'Assignment 3',
        id: '10-2'
      }, {
        resourceId: 11,
        startDate: '2019-11-17T21:00:00.000Z',
        duration: 2,
        name: 'Assignment 2',
        id: '11-1'
      }, {
        resourceId: 11,
        startDate: '2019-12-01T21:00:00.000Z',
        duration: 5,
        name: 'Assignment 3',
        id: '11-2'
      }, {
        resourceId: 12,
        startDate: '2019-11-16T21:00:00.000Z',
        duration: 1,
        name: 'Assignment 2',
        id: '12-1'
      }, {
        resourceId: 12,
        startDate: '2019-11-28T21:00:00.000Z',
        duration: 3,
        name: 'Assignment 3',
        id: '12-2'
      }, {
        resourceId: 13,
        startDate: '2019-11-06T21:00:00.000Z',
        duration: 0,
        name: 'Assignment 2',
        id: '13-1'
      }, {
        resourceId: 13,
        startDate: '2019-11-27T21:00:00.000Z',
        duration: 9,
        name: 'Assignment 3',
        id: '13-2'
      }, {
        resourceId: 14,
        startDate: '2019-11-04T21:00:00.000Z',
        duration: 12,
        name: 'Assignment 2',
        id: '14-1'
      }, {
        resourceId: 14,
        startDate: '2019-12-02T21:00:00.000Z',
        duration: 0,
        name: 'Assignment 3',
        id: '14-2'
      }, {
        resourceId: 15,
        startDate: '2019-11-12T21:00:00.000Z',
        duration: 0,
        name: 'Assignment 2',
        id: '15-1'
      }, {
        resourceId: 15,
        startDate: '2019-11-21T21:00:00.000Z',
        duration: 7,
        name: 'Assignment 3',
        id: '15-2'
      }, {
        resourceId: 16,
        startDate: '2019-11-04T21:00:00.000Z',
        duration: 6,
        name: 'Assignment 2',
        id: '16-1'
      }, {
        resourceId: 16,
        startDate: '2019-12-06T21:00:00.000Z',
        duration: 1,
        name: 'Assignment 3',
        id: '16-2'
      }, {
        resourceId: 17,
        startDate: '2019-11-13T21:00:00.000Z',
        duration: 1,
        name: 'Assignment 2',
        id: '17-1'
      }, {
        resourceId: 17,
        startDate: '2019-11-23T21:00:00.000Z',
        duration: 9,
        name: 'Assignment 3',
        id: '17-2'
      }, {
        resourceId: 18,
        startDate: '2019-11-05T21:00:00.000Z',
        duration: 7,
        name: 'Assignment 2',
        id: '18-1'
      }, {
        resourceId: 18,
        startDate: '2019-11-29T21:00:00.000Z',
        duration: 4,
        name: 'Assignment 3',
        id: '18-2'
      }, {
        resourceId: 19,
        startDate: '2019-11-05T21:00:00.000Z',
        duration: 10,
        name: 'Assignment 2',
        id: '19-1'
      }, {
        resourceId: 19,
        startDate: '2019-12-05T21:00:00.000Z',
        duration: 2,
        name: 'Assignment 3',
        id: '19-2'
      }]
    });
    scheduler.resourceStore.group('firstName');
    const renderedEvents = t.query('.b-sch-event-wrap').map(element => scheduler.resolveEventRecord(element));
    t.assertEventsPositions(scheduler, renderedEvents);
  }); // https://github.com/bryntum/support/issues/3283

  t.it('Should be no collision errors if numeric/letter ids used', async t => {
    await getScheduler({
      startDate: new Date(2019, 10, 4),
      endDate: new Date(2019, 11, 9),
      viewPreset: 'weekAndDayLetter',
      enableEventAnimations: false,
      resourceStore: {
        groupers: [{
          field: 'modeltype'
        }],
        data: [{
          modeltype: 'A310',
          id: '0707',
          name: '0707'
        }, {
          modeltype: 'A310',
          id: '101',
          name: '101'
        }, {
          modeltype: 'A320-211',
          id: '102',
          name: '102'
        }, {
          modeltype: 'VT6169',
          id: '1025',
          name: '1025'
        }, {
          modeltype: '1313',
          id: '1026',
          name: '1026'
        }, {
          modeltype: 'KA350',
          id: '11001',
          name: '11001'
        }, {
          modeltype: '0613',
          id: '123',
          name: '123'
        }, {
          modeltype: '737-800',
          id: '1471',
          name: '1471'
        }, {
          modeltype: '737-800',
          id: '1472',
          name: '1472'
        }, {
          modeltype: '737-800',
          id: '1473',
          name: '1473'
        }, {
          modeltype: '737-800',
          id: '1474',
          name: '1474'
        }, {
          modeltype: '737-800',
          id: '1475',
          name: '1475'
        }, {
          modeltype: 'A320-211',
          id: '5001',
          name: '5001'
        }, {
          modeltype: 'KA350',
          id: '5007',
          name: '5007'
        }, {
          modeltype: 'KA350',
          id: '5008',
          name: '5008'
        }, {
          modeltype: 'KA350',
          id: '5009',
          name: '5009'
        }, {
          modeltype: 'AW139',
          id: '5N-BSG',
          name: '5N-BSG'
        }, {
          modeltype: 'A310',
          id: '6-001',
          name: '6-001'
        }, {
          modeltype: '1212',
          id: '6Y-JMR-123',
          name: '6Y-JMR-123'
        }, {
          modeltype: 'A320-211',
          id: '6YJMZ',
          name: '6YJMZ'
        }, {
          modeltype: '737-800',
          id: '7171',
          name: '7171'
        }, {
          modeltype: '737-800',
          id: '7172',
          name: '7172'
        }, {
          modeltype: '008-200',
          id: 'AK-01',
          name: 'AK-01'
        }, {
          modeltype: '008-200',
          id: 'AK-02',
          name: 'AK-02'
        }, {
          modeltype: 'A320-200',
          id: 'N645JB',
          name: 'N645JB'
        }]
      }
    });
    await t.waitForSelector('.b-group-title');
  });
});