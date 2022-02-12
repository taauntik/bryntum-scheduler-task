"use strict";

var {
  WidgetHelper,
  Splitter,
  Scheduler
} = bryntum.scheduler; //region Data

WidgetHelper.append([{
  type: 'button',
  ref: 'zoomInButton',
  cls: 'b-tool',
  icon: 'b-icon-search-plus',
  tooltip: 'Zoom in',
  onAction: () => scheduler1.zoomIn()
}, {
  type: 'button',
  ref: 'zoomOutButton',
  cls: 'b-tool',
  icon: 'b-icon-search-minus',
  tooltip: 'Zoom out',
  onAction: () => scheduler1.zoomOut()
}], {
  insertFirst: document.getElementById('tools') || document.body
});
const resources = [{
  id: 1,
  name: 'Arcady',
  role: 'Core developer',
  eventColor: 'purple'
}, {
  id: 2,
  name: 'Dave',
  role: 'Tech Sales',
  eventColor: 'indigo'
}, {
  id: 3,
  name: 'Henrik',
  role: 'Sales',
  eventColor: 'blue'
}, {
  id: 4,
  name: 'Linda',
  role: 'Core developer',
  eventColor: 'cyan'
}, {
  id: 5,
  name: 'Maxim',
  role: 'Developer & UX',
  eventColor: 'green'
}, {
  id: 6,
  name: 'Mike',
  role: 'CEO',
  eventColor: 'lime'
}, {
  id: 7,
  name: 'Lee',
  role: 'CTO',
  eventColor: 'orange'
}],
      events = [{
  id: 1,
  resourceId: 1,
  name: 'First Task',
  startDate: new Date(2018, 0, 1, 10),
  duration: 2,
  durationUnit: 'h'
}, {
  id: 2,
  resourceId: 2,
  name: 'Second Task',
  startDate: new Date(2018, 0, 1, 12),
  duration: 2,
  durationUnit: 'h'
}, {
  id: 3,
  resourceId: 3,
  name: 'Third Task',
  startDate: new Date(2018, 0, 1, 14),
  duration: 2,
  durationUnit: 'h'
}, {
  id: 4,
  resourceId: 4,
  name: 'Fourth Task',
  startDate: new Date(2018, 0, 1, 8),
  duration: 2,
  durationUnit: 'h'
}, {
  id: 5,
  resourceId: 5,
  name: 'Fifth Task',
  startDate: new Date(2018, 0, 1, 15),
  duration: 2,
  durationUnit: 'h'
}, {
  id: 6,
  resourceId: 6,
  name: 'Sixth Task',
  startDate: new Date(2018, 0, 1, 16),
  duration: 2,
  durationUnit: 'h'
}]; //endregion

const scheduler1 = new Scheduler({
  ref: 'top-scheduler',
  appendTo: 'container',
  flex: '1 1 50%',
  multiEventSelect: true,
  resourceImagePath: '../_shared/images/users/',
  features: {
    stripe: true,
    sort: 'name',
    eventDrag: {
      // Allow drag outside of this Scheduler
      constrainDragToTimeline: false
    },
    eventDragCreate: false,
    eventDragSelect: true
  },
  columns: [{
    type: 'resourceInfo',
    text: 'New York office',
    width: '15em'
  }],
  resources,
  events,
  startDate: new Date(2018, 0, 1, 6),
  endDate: new Date(2018, 0, 2, 20),
  viewPreset: 'hourAndDay'
});
new Splitter({
  appendTo: 'container'
}); // eslint-disable-next-line no-unused-vars

const scheduler2 = new Scheduler({
  ref: 'bottom-scheduler',
  appendTo: 'container',
  flex: '1 1 50%',
  partner: scheduler1,
  resourceImagePath: '../_shared/images/users/',
  // hideHeaders : true,
  features: {
    stripe: true,
    sort: 'name',
    eventDrag: {
      // Allow drag outside of this Scheduler
      constrainDragToTimeline: false
    },
    eventDragCreate: false,
    eventDragSelect: true
  },
  columns: [{
    type: 'resourceInfo',
    text: 'Stockholm office',
    width: '15em'
  }],
  resources: [{
    id: 11,
    name: 'Angelo'
  }, {
    id: 12,
    name: 'Gloria'
  }, {
    id: 13,
    name: 'Madison'
  }, {
    id: 14,
    name: 'Malik'
  }, {
    id: 15,
    name: 'Mark'
  }, {
    id: 16,
    name: 'Rob'
  }],
  events: [{
    id: 11,
    resourceId: 11,
    name: 'Implement Feature X',
    startDate: new Date(2018, 0, 1, 10),
    duration: 2,
    durationUnit: 'h'
  }, {
    id: 12,
    resourceId: 12,
    name: 'Refactoring',
    startDate: new Date(2018, 0, 1, 12),
    duration: 2,
    durationUnit: 'h'
  }, {
    id: 13,
    resourceId: 16,
    name: 'Write application tests',
    startDate: new Date(2018, 0, 1, 14),
    duration: 2,
    durationUnit: 'h'
  }]
});