"use strict";

var {
  DateHelper,
  DomClassList,
  Scheduler,
  StringHelper
} = bryntum.scheduler;
const scheduler = new Scheduler({
  appendTo: 'container',
  eventStyle: 'colored',
  eventColor: null,
  features: {
    filterBar: true,
    stripe: true,
    timeRanges: true,
    eventEdit: {
      items: {
        location: {
          weight: 210,
          // After resource
          type: 'text',
          name: 'location',
          label: 'Location',
          dataset: {
            eventType: 'Meeting'
          }
        }
      }
    }
  },
  columns: [{
    type: 'resourceInfo',
    text: 'Staff',
    width: 170
  }, {
    text: 'Role',
    field: 'role',
    width: 140,
    editor: {
      type: 'combo',
      items: ['Sales', 'Developer', 'Marketing', 'Product manager'],
      editable: false,
      pickerWidth: 140
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
  barMargin: 5,
  rowHeight: 55,
  startDate: new Date(2017, 1, 7, 8),
  endDate: new Date(2017, 1, 7, 18),
  viewPreset: 'hourAndDay',
  resourceImagePath: '../_shared/images/users/',
  // Specialized body template with header and footer
  eventBodyTemplate: data => StringHelper.xss`
        <div class="b-sch-event-header">${data.headerText}</div>
        <div class="b-sch-event-footer">${data.footerText}</div>
    `,

  eventRenderer({
    eventRecord,
    resourceRecord,
    renderData
  }) {
    renderData.style = 'background-color:' + resourceRecord.color;
    return {
      headerText: DateHelper.format(eventRecord.startDate, this.displayDateFormat),
      footerText: eventRecord.name || ''
    };
  },

  tbar: ['->', {
    type: 'textfield',
    ref: 'filterByName',
    icon: 'b-fa b-fa-filter',
    placeholder: 'Find tasks by name',
    clearable: true,
    keyStrokeChangeDelay: 100,
    triggers: {
      filter: {
        align: 'start',
        cls: 'b-fa b-fa-filter'
      }
    },

    onChange({
      value
    }) {
      value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Replace all previous filters and set a new filter

      scheduler.eventStore.filter({
        filters: event => event.name.match(new RegExp(value, 'i')),
        replace: true
      });
      /*
              // The code above is a one liner version of:
               // Remove all previous filters
              scheduler.eventStore.clearFilters();
               // Set a new filter
              scheduler.eventStore.filter(event => event.name.match(new RegExp(value, 'i')));
               // Having `replace` provided makes the filter config go to the nested `filters` property,
              // see more in the Store.filter docs
          */
    }

  }, {
    type: 'textfield',
    ref: 'highlight',
    placeholder: 'Highlight tasks',
    clearable: true,
    keyStrokeChangeDelay: 100,
    triggers: {
      filter: {
        align: 'start',
        cls: 'b-fa b-fa-search'
      }
    },

    onChange({
      value
    }) {
      scheduler.eventStore.forEach(task => {
        const taskClassList = new DomClassList(task.cls);

        if (value !== '' && task.name.toLowerCase().includes(value.toLowerCase())) {
          taskClassList.add('b-match');
        } else {
          taskClassList.remove('b-match');
        }

        task.cls = taskClassList.value;
      });
      scheduler.element.classList[value.length > 0 ? 'add' : 'remove']('b-highlighting');
    }

  }]
});