"use strict";

var {
  Scheduler,
  StringHelper
} = bryntum.scheduler;
const red = '#FF1744',
      green = '#64DD17';
new Scheduler({
  appendTo: 'container',
  eventColor: null,
  eventStyle: null,
  barMargin: 15,
  viewPreset: 'hourAndDay',
  resourceImagePath: '../_shared/images/users/',
  features: {
    summary: {
      summaries: [{
        label: 'Total',
        renderer: ({
          events
        }) => events.length || 0
      }, {
        label: 'High rating',
        renderer: ({
          events
        }) => events.filter(event => event.resource.rating > 4).length || 0
      }, {
        label: 'Low rating',

        renderer({
          events
        }) {
          const value = events.filter(event => event.resource.rating < 3).length || 0;
          return value > 0 ? `<span style="color: ${red}">${value}</span>` : 0;
        }

      }]
    }
  },
  startDate: new Date(2017, 11, 1, 6),
  endDate: new Date(2017, 11, 3),
  columns: [{
    type: 'resourceInfo',
    text: 'Name',
    field: 'name',
    width: 150,
    sum: 'count',
    summaryRenderer: ({
      sum
    }) => 'Total: ' + sum
  }, {
    type: 'number',
    text: 'Rating',
    field: 'rating',
    width: 150,
    sum: 'average',
    summaryRenderer: ({
      sum
    }) => `Average: ${sum.toFixed(2)}`,

    renderer({
      value,
      cellElement
    }) {
      if (value < 3) {
        cellElement.style.color = red;
      }

      return value;
    }

  }],
  crudManager: {
    autoLoad: true,
    transport: {
      load: {
        url: 'data/data.json'
      }
    },
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true
  },

  eventRenderer({
    eventRecord,
    resourceRecord,
    renderData
  }) {
    renderData.style += 'background-color: ' + (resourceRecord.rating < 3 ? red : green);
    return StringHelper.encodeHtml(eventRecord.name);
  }

});