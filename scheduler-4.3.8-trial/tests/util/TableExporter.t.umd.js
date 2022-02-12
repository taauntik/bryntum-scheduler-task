"use strict";

StartTest(t => {
  let scheduler, exporter;
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
    exporter && exporter.destroy();
  });
  t.it('Should export events', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      startDate: '2019-09-01',
      columns: [{
        text: 'Name',
        field: 'name'
      }],
      resources: [{
        id: 1,
        name: 'Albert'
      }, {
        id: 2,
        name: 'Ben'
      }],
      events: [{
        resourceId: 1,
        name: 'Task 1',
        startDate: '2019-09-05',
        endDate: '2019-09-07'
      }, {
        resourceId: 1,
        name: 'Task 2',
        startDate: '2019-09-06',
        endDate: '2019-09-07'
      }, {
        resourceId: 2,
        name: 'Task 3',
        startDate: '2019-09-07',
        endDate: '2019-09-09'
      }, {
        resourceId: 2,
        name: 'Task 4',
        startDate: '2019-09-08',
        endDate: '2019-09-09'
      }]
    });
    exporter = new ScheduleTableExporter({
      target: scheduler
    });
    await t.waitForProjectReady();
    let {
      rows,
      columns
    } = exporter.export();
    rows = rows.map(row => row.map(cell => cell instanceof Date ? DateHelper.format(cell, 'YYYY-MM-DD') : cell));
    t.isDeeply(rows, [['Albert', 'Task 1', '2019-09-05', '2019-09-07'], ['Albert', 'Task 2', '2019-09-06', '2019-09-07'], ['Ben', 'Task 3', '2019-09-07', '2019-09-09'], ['Ben', 'Task 4', '2019-09-08', '2019-09-09']], 'Rows are ok');
    t.isDeeply(columns, [{
      field: 'name',
      value: 'Name',
      width: 100,
      type: 'string'
    }, {
      field: 'name',
      value: 'Task',
      eventColumn: true,
      width: 100,
      type: 'string'
    }, {
      field: 'startDate',
      value: 'Starts',
      eventColumn: true,
      width: 140,
      type: 'date'
    }, {
      field: 'endDate',
      value: 'Ends',
      eventColumn: true,
      width: 140,
      type: 'date'
    }], 'Columns are ok');
  });
  t.it('Exporting unassigned events', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      columns: [{
        text: 'Name',
        field: 'name'
      }],
      resources: [{
        id: 1,
        name: 'Albert'
      }, {
        id: 2,
        name: 'Ben'
      }],
      events: [{
        resourceId: 1,
        name: 'Task 1',
        startDate: '2019-09-05',
        endDate: '2019-09-07'
      }, {
        resourceId: 2,
        name: 'Task 2',
        startDate: '2019-09-06',
        endDate: '2019-09-07'
      }, {
        name: 'Task 3',
        startDate: '2019-09-07',
        endDate: '2019-09-09'
      }, {
        name: 'Task 4',
        startDate: '2019-09-08',
        endDate: '2019-09-09'
      }]
    });
    exporter = new ScheduleTableExporter({
      target: scheduler
    });
    await t.waitForProjectReady();
    let {
      rows,
      columns
    } = exporter.export({
      includeUnassigned: false
    });
    rows = rows.map(row => row.map(cell => cell instanceof Date ? DateHelper.format(cell, 'YYYY-MM-DD') : cell));
    t.isDeeply(rows, [['Albert', 'Task 1', '2019-09-05', '2019-09-07'], ['Ben', 'Task 2', '2019-09-06', '2019-09-07']], 'Rows are ok');
    t.isDeeply(columns, [{
      field: 'name',
      value: 'Name',
      width: 100,
      type: 'string'
    }, {
      field: 'name',
      value: 'Task',
      eventColumn: true,
      width: 100,
      type: 'string'
    }, {
      field: 'startDate',
      value: 'Starts',
      eventColumn: true,
      width: 140,
      type: 'date'
    }, {
      field: 'endDate',
      value: 'Ends',
      eventColumn: true,
      width: 140,
      type: 'date'
    }], 'Columns are ok');
    ({
      rows,
      columns
    } = exporter.export());
    rows = rows.map(row => row.map(cell => cell instanceof Date ? DateHelper.format(cell, 'YYYY-MM-DD') : cell));
    t.isDeeply(rows, [['Albert', 'Task 1', '2019-09-05', '2019-09-07'], ['Ben', 'Task 2', '2019-09-06', '2019-09-07'], ['', 'No resource assigned'], ['', 'Task 3', '2019-09-07', '2019-09-09'], ['', 'Task 4', '2019-09-08', '2019-09-09']], 'Rows are ok');
    t.isDeeply(columns, [{
      field: 'name',
      value: 'Name',
      width: 100,
      type: 'string'
    }, {
      field: 'name',
      value: 'Task',
      eventColumn: true,
      width: 100,
      type: 'string'
    }, {
      field: 'startDate',
      value: 'Starts',
      eventColumn: true,
      width: 140,
      type: 'date'
    }, {
      field: 'endDate',
      value: 'Ends',
      eventColumn: true,
      width: 140,
      type: 'date'
    }], 'Columns are ok');
  });
});