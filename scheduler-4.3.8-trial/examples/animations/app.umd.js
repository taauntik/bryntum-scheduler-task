"use strict";

var {
  DateHelper,
  Scheduler,
  StringHelper
} = bryntum.scheduler;

const styleNode = document.createElement('style'),
      setAnimationDuration = value => {
  scheduler.transitionDuration = value;
  styleNode.innerHTML = `.b-grid-row,.b-sch-event-wrap { transition-duration: ${value / 1000}s !important; }`;
};

document.head.appendChild(styleNode);
const scheduler = new Scheduler({
  appendTo: 'container',
  eventColor: null,
  resourceImagePath: '../_shared/images/users/',
  columns: [{
    type: 'resourceInfo',
    text: 'Staff',
    field: 'name',
    width: 150
  }, {
    text: 'Task color',
    field: 'eventColor',
    width: 90,
    htmlEncode: false,
    renderer: ({
      record
    }) => `<div class="color-box b-sch-${record.eventColor}"></div>${StringHelper.capitalize(record.eventColor)}`,
    editor: {
      type: 'combo',
      items: Scheduler.eventColors,
      editable: false,
      listItemTpl: ({
        value
      }) => `<div class="color-box b-sch-${value}"></div><div>${value}</div>`
    }
  }],
  features: {
    timeRanges: true
  },
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
  barMargin: 1,
  rowHeight: 50,
  startDate: new Date(2017, 1, 7, 8),
  endDate: new Date(2017, 1, 7, 18),
  viewPreset: 'hourAndDay',
  useInitialAnimation: 'slide-from-left',
  tbar: [{
    type: 'slider',
    ref: 'duration',
    text: 'Animation duration ',
    min: 0,
    max: 3000,
    value: 500,
    step: 200,
    showValue: false,
    showTooltip: true,
    onChange: ({
      value
    }) => setAnimationDuration(value)
  }, {
    type: 'buttongroup',
    items: [{
      type: 'button',
      text: 'Max 1hr meetings',
      onAction: () => {
        scheduler.eventStore.query(task => task.eventType === 'Meeting').forEach(task => task.duration = Math.min(task.duration, 1));
      }
    }, {
      type: 'button',
      text: 'After lunch',
      onAction: () => {
        const eventStore = scheduler.eventStore,
              lunchFinishTime = scheduler.features.timeRanges.store.getById('lunch').endDate;
        eventStore.query(task => task.eventType === 'Meeting').forEach(task => task.startDate = DateHelper.max(task.startDate, lunchFinishTime));
      }
    }]
  }, {
    type: 'button',
    text: 'Random update',
    onAction: async () => {
      if (scheduler.isEngineReady) {
        const {
          eventStore
        } = scheduler,
              nbrToAnimate = Math.min(eventStore.count, 4); // Grab a bunch of random events to change

        for (let i = 0; i < nbrToAnimate; i++) {
          const index = Math.floor(Math.random() * eventStore.count),
                event = eventStore.getAt(index);
          event.set({
            resourceId: (scheduler.resourceStore.indexOf(event.resource) + 2) % 8 + 1,
            startDate: DateHelper.add(event.startDate, event.startDate.getHours() % 2 ? 1 : -1, 'hour')
          });
        }
      }
    }
  }, {
    type: 'button',
    text: 'Initial animation',
    icon: 'b-fa-sliders-h',
    toggleable: true,
    menu: {
      onItem: ({
        item
      }) => scheduler.restartInitialAnimation(item.animation),
      onBeforeShow: ({
        source: menu
      }) => {
        menu.items.map(item => item.disabled = scheduler.useInitialAnimation === item.animation);
      },
      items: [{
        text: 'Fade in',
        icon: 'b-fa b-fa-play',
        animation: 'fade-in'
      }, {
        text: 'Slide from left',
        icon: 'b-fa b-fa-play',
        animation: 'slide-from-left'
      }, {
        text: 'Slide from top',
        icon: 'b-fa b-fa-play',
        animation: 'slide-from-top'
      }, {
        text: 'Zoom in',
        icon: 'b-fa b-fa-play',
        animation: 'zoom-in'
      }, {
        text: 'Custom',
        icon: 'b-fa b-fa-play',
        cls: 'b-separator',
        animation: 'custom'
      }]
    }
  }]
});
setAnimationDuration(500);