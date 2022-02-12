"use strict";

var {
  Scheduler,
  ResourceModel,
  EventModel,
  StringHelper
} = bryntum.scheduler;

class Property extends ResourceModel {
  static get fields() {
    return ['sleeps', // Using icons for resources
    {
      name: 'image',
      defaultValue: false
    }];
  }

}

class Booking extends EventModel {
  static get fields() {
    return [{
      name: 'guests',
      defaultValue: 2
    }];
  }

}

const scheduler = new Scheduler({
  appendTo: 'container',
  eventStyle: 'line',
  viewPreset: 'weekAndDayLetter',
  rowHeight: 60,
  barMargin: 15,
  resourceImagePath: '../_shared/images/users/',
  features: {
    summary: {
      renderer: ({
        events: reservations
      }) => {
        let result;

        if (scheduler.widgetMap.summaryCombo.value === 'count') {
          result = reservations.length;
        } else {
          result = reservations.reduce((total, reservation) => total += reservation.guests, 0);
        }

        result = result || '';
        return StringHelper.xss`${result}`;
      }
    },
    eventEdit: {
      editorConfig: {
        defaults: {
          labelPosition: 'above'
        }
      },
      items: {
        startDateField: {
          flex: '1 0 50%'
        },
        endDateField: {
          flex: '1 0 50%',
          cls: ''
        },
        startTimeField: false,
        endTimeField: false,
        // Custom field for number of guests
        guestsField: {
          type: 'number',
          name: 'guests',
          label: 'Guests',
          weight: 210,
          value: 2,
          required: true,
          min: 1
        }
      }
    }
  },
  startDate: new Date(2017, 11, 1),
  endDate: new Date(2017, 11, 20),
  allowOverlap: false,
  tbar: [{
    type: 'combo',
    ref: 'summaryCombo',
    width: 300,
    label: 'Summary:',
    displayField: 'name',
    valueField: 'id',
    editable: false,
    items: [{
      id: 'count',
      name: 'Booked properties / day'
    }, {
      id: 'guests',
      name: 'Booked guests / day'
    }],
    value: 'count',

    onChange() {
      scheduler.features.summary.refresh();
    }

  }, {
    text: 'Sum selected rows',
    toggleable: true,
    onToggle: 'up.onSelectToggle'
  }],
  tickSize: 80,
  columns: [{
    type: 'resourceInfo',
    text: 'Name',
    width: 200,
    sum: 'count',
    summaryRenderer: ({
      sum
    }) => StringHelper.xss`Total properties: ${sum}`,
    showEventCount: false,
    showMeta: property => StringHelper.xss`Sleeps ${property.sleeps}`
  }],
  crudManager: {
    autoLoad: true,
    resourceStore: {
      modelClass: Property
    },
    eventStore: {
      modelClass: Booking
    },
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
    eventRecord
  }) {
    return StringHelper.xss`${eventRecord.name} <i class="b-fa b-fa-user"><sup>${eventRecord.guests}</sup>`;
  },

  onSelectToggle() {
    this.features.summary.selectedOnly = !this.features.summary.selectedOnly;
  }

});