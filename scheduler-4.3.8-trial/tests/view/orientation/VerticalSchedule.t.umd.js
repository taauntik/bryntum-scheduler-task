"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

StartTest(t => {
  let scheduler;
  t.beforeEach(t => scheduler && scheduler.destroy());
  t.it('Should support EventModel subclassing with cls returning string', async t => {
    const events = [{
      id: 1,
      resourceId: 'r1',
      startDate: '2021-01-03T10:00',
      endDate: '2021-01-03T10:30'
    }, {
      id: 2,
      resourceId: 'r2',
      startDate: '2021-01-03T11:00',
      endDate: '2021-01-03T11:30'
    }, {
      id: 3,
      resourceId: 'r3',
      startDate: '2021-01-03T12:00',
      endDate: '2021-01-03T12:30'
    }],
          resources = [{
      id: 'r1',
      name: 'Resource 1'
    }, {
      id: 'r2',
      name: 'Resource 2'
    }, {
      id: 'r3',
      name: 'Resource 3'
    }];

    class MyEventModel extends EventModel {
      get cls() {
        return MyEventModel.clsValue;
      }

    }

    _defineProperty(MyEventModel, "clsValue", 'some-css-class');

    scheduler = await t.getVerticalSchedulerAsync({
      events: undefined,
      eventStore: {
        data: events,
        modelClass: MyEventModel
      },
      resources,
      startDate: new Date(2021, 0, 3, 10),
      endDate: new Date(2021, 0, 3, 14),
      viewPreset: 'hourAndDay'
    });
    await t.waitForSelector('.some-css-class.b-sch-event');
    t.pass('Css applied correctly with String');
  });
});