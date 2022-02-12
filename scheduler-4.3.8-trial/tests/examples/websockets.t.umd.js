"use strict";

/* eslint-disable no-undef */
StartTest(t => {
  const scheduler = bryntum.query('scheduler'),
        wsHelper = scheduler.webSocketHelper; // To be able to detect Toasts reliably

  t.global.WebSocket = function (host) {
    Object.assign(this, {
      readyState: WebSocket.OPEN,

      send(json) {
        const data = JSON.parse(json);

        switch (data.command) {
          case 'dataset':
            this.onmessage({
              command: 'dataset',
              data: '{"command":"dataset","dataset":{"resources":[{"id":1,"name":"Rob","type":"Sales","eventColor":"red"},{"id":2,"name":"Mike","type":"Sales","eventColor":"orange"},{"id":3,"name":"Kate","type":"Sales","eventColor":"green"},{"id":4,"name":"Lisa","type":"Developer","eventColor":"blue"},{"id":5,"name":"Dave","type":"Developer","eventColor":"teal"},{"id":6,"name":"Arnold","type":"Developer","eventColor":"lime"},{"id":7,"name":"Lee","type":"Marketing","eventColor":"purple"},{"id":8,"name":"Jong","type":"Marketing","eventColor":"cyan"}],"events":[{"id":1,"resourceId":1,"name":"Important Meeting","startDate":"2019-02-07 09:00","endDate":"2019-02-07 10:30","durationUnit":"h","eventType":"Meeting","iconCls":"b-fa b-fa-exclamation-circle"},{"id":2,"resourceId":2,"name":"Team Meeting","startDate":"2019-02-07 10:00","endDate":"2019-02-07 11:30","durationUnit":"h","eventType":"Meeting","iconCls":"b-fa b-fa-calendar"},{"id":3,"resourceId":3,"name":"Take cat to vet","startDate":"2019-02-07 11:00","endDate":"2019-02-07 12:30","durationUnit":"h","eventType":"Appointment","iconCls":"b-fa b-fa-cat"},{"id":4,"resourceId":4,"name":"Launch","startDate":"2019-02-07 12:00","endDate":"2019-02-07 13:30","durationUnit":"h","eventType":"Appointment","iconCls":"b-fa b-fa-info"},{"id":5,"resourceId":5,"name":"Sales demo","startDate":"2019-02-07 13:00","endDate":"2019-02-07 14:30","durationUnit":"h","eventType":"Appointment","iconCls":"b-fa b-fa-clock"},{"id":6,"resourceId":6,"name":"Daily Scrum","startDate":"2019-02-07 14:00","endDate":"2019-02-07 15:30","durationUnit":"h","eventType":"Meeting","iconCls":"b-fa b-fa-calendar"},{"id":7,"resourceId":7,"name":"Sales Forecast Meeting","startDate":"2019-02-07 15:00","endDate":"2019-02-07 16:30","durationUnit":"h","eventType":"Meeting","iconCls":"b-fa b-fa-calendar"},{"id":8,"resourceId":8,"name":"Get car repaired","startDate":"2019-02-07 16:00","endDate":"2019-02-07 17:30","durationUnit":"h","eventType":"Appointment","iconCls":"b-fa b-fa-car"},{"id":9,"resourceId":8,"name":"Dentist Appointment","startDate":"2019-02-07 10:00","endDate":"2019-02-07 11:00","durationUnit":"h","eventType":"Appointment","iconCls":"b-fa b-fa-clock"},{"id":10,"resourceId":6,"name":"Presentation","startDate":"2019-02-07 10:00","endDate":"2019-02-07 12:00","durationUnit":"h","eventType":"Appointment","iconCls":"b-fa b-fa-video"},{"id":11,"resourceId":7,"name":"Customer Meeting","startDate":"2019-02-07 10:00","endDate":"2019-02-07 11:30","durationUnit":"h","eventType":"Meeting","iconCls":"b-fa b-fa-calendar-alt"},{"id":12,"resourceId":3,"name":"Visit cafe","startDate":"2019-02-07 14:00","endDate":"2019-02-07 16:00","durationUnit":"h","eventType":"Appointment","iconCls":"b-fa b-fa-candy-corn"},{"id":13,"resourceId":2,"name":"Movie","startDate":"2019-02-07 14:30","endDate":"2019-02-07 16:00","durationUnit":"h","eventType":"Appointment","iconCls":"b-fa b-fa-film"},{"id":14,"resourceId":1,"name":"Meet train","startDate":"2019-02-07 15:00","endDate":"2019-02-07 16:00","durationUnit":"h","eventType":"Appointment","iconCls":"b-fa b-fa-train"}]}}'
            });
            break;
        }
      },

      close() {
        this.readyState = WebSocket.CLOSED;
        this.onclose();
      }

    });
  };

  wsHelper.wsOpen();

  wsHelper._socket.onopen(); // wsSend({ command : 'hello', userName : 'Henry' });
  // wsHelper.wsSend({ command : 'dataset' });


  let sentData, receivedData, rec;
  scheduler.on('wsReceive', event => {
    receivedData.push(event.data);
  });
  scheduler.on('wsSend', event => {
    sentData.push(event.data);
  });

  function clearData() {
    sentData = [];
    receivedData = [];
  }

  t.beforeEach(() => {
    clearData();
    t.global.__applyTestConfigs = true;
  });
  t.it('sanity', t => {
    t.chain(() => t.checkGridSanity(scheduler));
  });
  t.it('Testing event drag', t => {
    t.is(scheduler.startDate, new Date(2019, 1, 7, 9), 'Correct start date');
    t.is(scheduler.endDate, new Date(2019, 1, 7, 17, 30), 'Correct end date');
    t.chain({
      drag: '[data-event-id="1"]',
      by: [scheduler.timeAxisViewModel.tickSize, 0]
    }, () => {
      rec = sentData[0];
      t.is(rec.command, 'dragEvent', 'Sent dragEvent on drag');
      rec = sentData[sentData.length - 1];
      t.is(rec.command, 'updateEvent', 'Sent updateEvent on end drag');
      t.is(scheduler.startDate, new Date(2019, 1, 7, 10), 'Start date adjusted to fit contents');
      t.is(scheduler.endDate, new Date(2019, 1, 7, 17, 30), 'Correct end date');
    });
  });
  t.it('Testing event resize', t => {
    t.chain({
      drag: '[data-event-id="1"]',
      offset: ['100%-5', '50%'],
      by: [100, 0]
    }, () => {
      rec = sentData[0];
      t.is(rec.command, 'updateEvent', 'Sent updateEvent on resize');
    });
  });
  t.it('Testing event delete', t => {
    t.chain({
      moveMouseTo: '[data-event-id="1"]'
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    }, {
      rightclick: '.b-sch-event'
    }, {
      click: '.b-menu-text:contains(Delete event)'
    }, () => {
      rec = sentData[0];
      t.isDeeply(rec, {
        command: 'removeEvent',
        records: [1]
      }, 'Sent right data on event deletion');
    });
  });
  t.it('Testing event create', t => {
    t.chain({
      drag: '.b-sch-timeaxis-cell',
      offset: [200, 20],
      by: [100, 0]
    }, {
      waitForSelector: '.b-eventeditor:not(.b-hidden)'
    }, {
      type: 'New event[ENTER]'
    }, () => {
      rec = sentData[0];
      t.is(rec.command, 'addEvent', 'Sent addEvent on create');
      t.is(rec.records.length, 1, '1 sent event');
      t.is(rec.records[0].id, scheduler.eventStore.last.id, 'Correct event sent');
    });
  });
  t.it('Testing emulating receive create event', async t => {
    t.global.__applyTestConfigs = false;
    const event = {
      startDate: '2019-02-07 05:00:00',
      endDate: '2019-02-07 06:00:00',
      durationUnit: 'h',
      cls: '',
      id: 'event-test',
      duration: 1,
      name: 'New cool event',
      iconCls: 'b-fa b-fa-info',
      resourceId: 5
    };
    wsHelper.wsReceive({
      command: 'addEvent',
      userName: 'Test',
      records: [event]
    });
    t.ok(scheduler.eventStore.getById('event-test'), 'Right event added');
    await t.waitForSelector('.b-toast:contains(Test added "New cool event")');
    await t.waitForSelector('[data-event-id="event-test"]');
    await t.click('.b-toast');
    t.is(scheduler.startDate, new Date(2019, 1, 7, 5), 'Start date adjusted to fit contents');
  });
  t.it('Testing emulating receive delete event', async t => {
    t.global.__applyTestConfigs = false;
    wsHelper.wsReceive({
      command: 'removeEvent',
      records: ['event-test'],
      userName: 'Test'
    });
    t.waitForSelectorNotFound(scheduler.unreleasedEventSelector + '[data-event-id="event-test"]');
    t.notOk(scheduler.eventStore.getById('event-test'), 'Right event removed');
    await t.click('.b-toast');
    await t.waitForSelector('.b-toast:contains(Test removed "New cool event")');
  });
  t.it('Testing logout', t => {
    t.chain({
      click: '.b-button:contains(Logout)'
    }, {
      waitForElementVisible: '.b-button:contains(Login)',
      desc: 'Login button visible'
    }, {
      waitForElementVisible: '.b-mask:contains(OFFLINE)',
      desc: 'mask shown'
    }, () => {
      t.is(wsHelper.state, WebSocket.CLOSED, 'Right socket CLOSED state');
      t.isDeeply(scheduler.events, [], 'Scheduler events are empty');
      t.isDeeply(scheduler.resources, [], 'Scheduler resources are empty');
    });
  });
});