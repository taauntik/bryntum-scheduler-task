"use strict";

var {
  Scheduler,
  StringHelper
} = bryntum.scheduler;

const listItemTpl = item => StringHelper.xss`<div class="color-box b-sch-${item.value}"></div><div>${item.value}</div>`;

let // Event style to apply to all events
eventStyle = null,
    // Color to apply to all events
eventColor = null;

function hideMilestones() {
  scheduler.eventStore.filter(eventRecord => !eventRecord.isMilestone);
}

function showMilestones(withWidth) {
  scheduler.eventStore.clearFilters();

  if (withWidth) {
    scheduler.milestoneLayoutMode = 'measure';
  } else {
    scheduler.milestoneLayoutMode = 'default';
  }
}

const scheduler = new Scheduler({
  appendTo: 'container',
  startDate: new Date(2017, 0, 1, 6),
  endDate: new Date(2017, 0, 1, 20),
  viewPreset: 'hourAndDay',
  barMargin: 5,
  rowHeight: 50,
  multiEventSelect: true,
  features: {
    cellEdit: false,
    // Not yet compatible with the event styles which center their content
    stickyEvents: false,
    eventDrag: {
      constrainDragToResource: true
    },
    eventEdit: {
      items: {
        resourceField: false,
        nameField: false,
        eventStyle: {
          type: 'combo',
          label: 'Style',
          name: 'eventStyle',
          editable: false,
          weight: 10,
          items: Scheduler.eventStyles
        },
        eventColor: {
          type: 'combo',
          label: 'Color',
          name: 'eventColor',
          editable: false,
          weight: 20,
          listItemTpl,
          items: Scheduler.eventColors
        }
      }
    }
  },
  columns: [{
    text: 'Name',
    field: 'name',
    htmlEncode: false,
    width: 130,
    renderer: ({
      record
    }) => StringHelper.xss`<div class="color-box b-sch-${record.name.toLowerCase()}"></div>${record.name}`
  }],
  crudManager: {
    autoLoad: true,
    transport: {
      load: {
        url: 'data/data.json'
      }
    },
    listeners: {
      load() {
        hideMilestones();
      }

    },
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true
  },

  eventRenderer({
    eventRecord,
    renderData
  }) {
    // If a color is specified, apply it to all events
    if (eventColor) {
      renderData.eventColor = eventColor;
    } // And the same for event styles


    if (eventStyle) {
      renderData.eventStyle = eventStyle;
    }

    return renderData.eventStyle + ' ' + renderData.eventColor;
  },

  tbar: [{
    type: 'widget',
    cls: 'b-has-label',
    html: '<label>Milestones</label>'
  }, {
    type: 'buttongroup',
    toggleGroup: true,
    style: 'margin-left : 0',
    items: [{
      text: 'None',
      pressed: true,

      onClick() {
        hideMilestones();
      }

    }, {
      text: 'Normal',

      onClick() {
        showMilestones(false);
      }

    }, {
      text: 'Width',

      onClick() {
        showMilestones(true);
      }

    }]
  }, {
    type: 'combo',
    items: ['mixed'].concat(Scheduler.eventStyles),
    value: 'mixed',
    label: 'Style',
    editable: false,
    listCls: 'style-list',
    // Match events element structure to have matching look in the list
    listItemTpl: item => `
            <div class="b-sch-event-wrap b-sch-style-${item.value} b-sch-color-red">
                <div class="b-sch-event">
                    <div class="b-sch-event-content">${item.value}</div>
                    </div>
            </div>`,

    onSelect({
      record
    }) {
      // Picked "Mixed", use styles from data
      if (record.value === 'mixed') {
        eventStyle = null;
      } // Picked a named style, use it
      else {
        eventStyle = record.value;
      }

      scheduler.refreshWithTransition();
    }

  }, {
    ref: 'colorCombo',
    type: 'combo',
    items: ['mixed', 'custom'].concat(Scheduler.eventColors),
    value: 'mixed',
    label: 'Color',
    editable: false,
    width: '13em',
    listItemTpl,

    onSelect({
      record
    }) {
      const {
        customColor
      } = scheduler.widgetMap;
      customColor.hide(); // Picked "Mixed", use colors from data

      if (record.value === 'mixed') {
        eventColor = null;
      } // Picked "Custom", display text field to input custom color
      else if (record.value === 'custom') {
        customColor.show();
        customColor.focus();

        if (customColor.value) {
          eventColor = customColor.value;
        }
      } // Picked a named color, use it
      else {
        eventColor = record.value;
      }

      scheduler.refreshWithTransition();
    }

  }, {
    ref: 'customColor',
    type: 'textfield',
    label: 'Custom hex',
    inputWidth: '6em',
    hidden: true,
    listeners: {
      change({
        value
      }) {
        eventColor = value;
        scheduler.refreshWithTransition();
      }

    }
  }]
});