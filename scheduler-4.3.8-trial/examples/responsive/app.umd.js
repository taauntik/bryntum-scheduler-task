"use strict";

var {
  Scheduler
} = bryntum.scheduler;
const scheduler = new Scheduler({
  appendTo: 'container',
  startDate: new Date(2018, 4, 14),
  endDate: new Date(2018, 4, 19),
  autoAdjustTimeAxis: false,
  viewPreset: 'dayAndWeek',
  barMargin: 5,
  eventStyle: 'border',
  resourceImagePath: '../_shared/images/users/',
  responsiveLevels: {
    small: {
      levelWidth: 800,
      tickSize: 127,
      fillTicks: true,
      rowHeight: 40
    },
    normal: {
      levelWidth: '*',
      tickSize: 150,
      fillTicks: false,
      rowHeight: 50
    }
  },
  columns: [{
    type: 'resourceInfo',
    text: 'Name',
    field: 'name',
    responsiveLevels: {
      small: {
        width: 50,
        minWidth: 50
      },
      normal: {
        width: 130
      }
    }
  }, {
    text: 'Role',
    field: 'role',
    width: 120,
    responsiveLevels: {
      small: {
        hidden: true
      },
      normal: {
        hidden: false
      }
    }
  }],
  eventStore: {
    readUrl: 'data/events.json',
    autoLoad: true
  },
  resourceStore: {
    readUrl: 'data/resources.json',
    autoLoad: true
  },
  listeners: {
    responsive({
      source: scheduler,
      level
    }) {
      scheduler.tbar.items[3].html = `Responsive level: <b style="margin-left : .5em">${level}</b>`;
    }

  },
  tbar: ['Force', {
    type: 'buttongroup',
    toggleGroup: true,
    items: [{
      text: 'Small',
      schedulerMaxWidth: 700
    }, {
      text: 'Normal',
      schedulerMaxWidth: 1000
    }, {
      text: 'None',
      pressed: true,
      tooltip: 'Level is decided by browser window width',
      schedulerMaxWidth: null
    }],

    onClick({
      source: button
    }) {
      scheduler.maxWidth = button.schedulerMaxWidth;
    }

  }, '->', 'Responsive level:']
});