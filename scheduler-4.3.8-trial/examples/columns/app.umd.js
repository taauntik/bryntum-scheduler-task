"use strict";

var {
  Scheduler,
  StringHelper
} = bryntum.scheduler;
const scheduler = new Scheduler({
  appendTo: 'container',
  startDate: new Date(2019, 1, 19, 6),
  endDate: new Date(2019, 1, 19, 20),
  viewPreset: 'hourAndDay',
  rowHeight: 50,
  barMargin: 5,
  eventStyle: 'colored',
  crudManager: {
    autoLoad: true,
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true,
    resourceStore: {
      // Additional fields for resources
      fields: ['capacity', 'condition', 'color', 'floor', {
        name: 'redecorated',
        type: 'date'
      }]
    },
    transport: {
      load: {
        url: 'data/data.json'
      }
    }
  },
  columns: [{
    text: 'Room',
    field: 'name',
    width: 130,
    region: 'left',
    htmlEncode: false,
    renderer: ({
      value,
      record
    }) => StringHelper.xss`<div class="box b-sch-${record.color}"></div>${value}`
  }, {
    text: 'Floor',
    field: 'floor',
    width: 100,
    region: 'left'
  }, {
    text: 'Capacity',
    field: 'capacity',
    width: 80,
    region: 'left',
    type: 'number',
    align: 'right',
    htmlEncode: false,

    renderer({
      value
    }) {
      const icon = value < 25 ? 'user' : value < 200 ? 'user-friends' : 'users';
      return StringHelper.xss`${value}<div class="capacity b-fa b-fa-${icon}"></div>`;
    }

  }, {
    text: 'Redecorated',
    field: 'redecorated',
    width: 115,
    region: 'right',
    type: 'date'
  }, {
    text: 'Condition',
    field: 'condition',
    region: 'right',
    type: 'rating'
  }],
  subGridConfigs: {
    left: {
      width: 310
    },
    // A "normal" flexed region is automatically added for scheduler unless specified
    right: {
      width: 275
    }
  },

  eventRenderer({
    eventRecord,
    renderData
  }) {
    const hours = eventRecord.duration * 24;

    if (hours > 8) {
      renderData.eventColor = 'red';
    } else if (hours > 4) {
      renderData.eventColor = 'orange';
    } else if (hours > 2) {
      renderData.eventColor = 'lime';
    }

    return StringHelper.xss`${eventRecord.name}<span>(${hours} hour${hours > 1 ? 's' : ''})</span>`;
  },

  features: {
    eventEdit: {
      resourceFieldConfig: {
        label: 'Room'
      }
    }
  },
  columnLines: false,
  tbar: [{
    type: 'button',
    ref: 'addButton',
    icon: 'b-fa-plus',
    text: 'Add column',

    onClick() {
      // scheduler.columns is a store, it supports the normal Store CRUD operations
      scheduler.columns.insert(1, {
        text: 'Accessible',
        field: 'accessible',
        region: 'left',
        type: 'check'
      });
      scheduler.widgetMap.addButton.disable();
      scheduler.widgetMap.removeButton.enable();
    }

  }, {
    type: 'button',
    ref: 'removeButton',
    cls: 'b-red',
    icon: 'b-fa-trash',
    text: 'Remove column',
    disabled: true,

    onClick() {
      scheduler.columns.getAt(1).remove();
      scheduler.widgetMap.addButton.enable();
      scheduler.widgetMap.removeButton.disable();
    }

  }]
});