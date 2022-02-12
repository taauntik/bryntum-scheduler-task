"use strict";

var {
  DateHelper,
  AsyncHelper,
  WidgetHelper,
  DataGenerator,
  Scheduler
} = bryntum.scheduler;
let scheduler, resourceCountField, eventCountField;

async function generateResources(resourceCount = resourceCountField.value, eventCount = eventCountField.value) {
  const today = DateHelper.clearTime(new Date()),
        mask = WidgetHelper.mask(scheduler.element, 'Generating records'),
        colors = ['cyan', 'green', 'indigo'],
        resources = [],
        events = [],
        assignments = [],
        dependencies = [],
        resourceTimeRanges = [],
        useResourceTimeRanges = !scheduler.features.resourceTimeRanges.disabled,
        useDependencies = !scheduler.features.dependencies.disabled;
  let schedulerEndDate = today,
      j,
      step;
  console.time('generate');
  const generator = DataGenerator.generate(resourceCount);

  while ((step = generator.next()) && !step.done) {
    const res = step.value;
    resources.push(res);

    for (j = 0; j < eventCount; j++) {
      const startDate = DateHelper.add(today, Math.round(Math.random() * (j + 1) * 20), 'days'),
            duration = Math.round(Math.random() * 9) + 2,
            endDate = DateHelper.add(startDate, duration, 'days'),
            eventId = events.length + 1;
      events.push({
        id: eventId,
        name: 'Task #' + (events.length + 1),
        startDate,
        duration,
        endDate,
        eventColor: colors[resources.length % 3]
      });
      assignments.push({
        id: 'a' + eventId,
        event: eventId,
        resource: res.id
      });

      if (useDependencies && j > 0) {
        dependencies.push({
          id: dependencies.length + 1,
          from: eventId - 1,
          to: eventId
        });
      }

      if (useResourceTimeRanges && j % 2 === 0) {
        resourceTimeRanges.push({
          id: resourceTimeRanges.length + 1,
          resourceId: res.id,
          name: `Range ${resourceTimeRanges.length + 1}`,
          startDate: DateHelper.add(startDate, Math.round(Math.random() * 5), 'days'),
          duration: Math.round(Math.random() * 5) + 4,
          timeRangeColor: 'red'
        });
      }

      if (endDate > schedulerEndDate) {
        schedulerEndDate = endDate;
      }
    }

    if (resources.length % 2000 === 0) {
      mask.text = `Generated ${resources.length * eventCount} of ${resourceCount * eventCount} records`;
      await AsyncHelper.animationFrame();
    }
  }

  console.timeEnd('generate');
  mask.text = 'Loading data'; // Give the UI a chance to catch up, to update the mask before proceeding

  await AsyncHelper.sleep(100);
  console.time('data');
  scheduler.suspendRefresh();
  scheduler.endDate = schedulerEndDate;
  scheduler.project = {
    assignmentStore: {
      useRawData: true,
      data: assignments
    },
    resourceStore: {
      useRawData: true,
      data: resources
    },
    eventStore: {
      useRawData: true,
      data: events
    },
    dependencyStore: {
      useRawData: true,
      data: dependencies
    },
    resourceTimeRangeStore: {
      useRawData: true,
      data: resourceTimeRanges
    }
  };
  scheduler.resumeRefresh(true);
  await scheduler.project.await('refresh');
  console.timeEnd('data');
  mask.close();
}

function toggleCustom(show) {
  scheduler.widgetMap.rangesButton.hidden = scheduler.widgetMap.dependenciesButton.hidden = resourceCountField.hidden = eventCountField.hidden = !show;
}

function applyPreset(resources, events) {
  toggleCustom(false);
  resourceCountField.value = resources;
  eventCountField.value = events;
  generateResources();
}

scheduler = new Scheduler({
  appendTo: 'container',
  eventStyle: 'border',
  rowHeight: 50,
  useInitialAnimation: false,
  enableEventAnimations: false,
  generateResources,
  columns: [{
    type: 'rownumber'
  }, {
    text: 'Id',
    field: 'id',
    width: 50,
    hidden: true
  }, {
    text: 'First name',
    field: 'firstName',
    flex: 1
  }, {
    text: 'Surname',
    field: 'surName',
    flex: 1
  }, {
    text: 'Score',
    field: 'score',
    type: 'number',
    flex: 1
  }],
  features: {
    dependencies: {
      disabled: true
    },
    resourceTimeRanges: {
      disabled: true
    },
    // Turn sticky events off to boost performance with many events on screen simultaneously
    stickyEvents: false,
    // Turn off schedule tooltip to boost scrolling performance a bit
    scheduleTooltip: false
  },
  tbar: ['Presets', {
    type: 'buttongroup',
    toggleGroup: true,
    items: [{
      text: '1K events',
      pressed: true,
      dataConfig: {
        resources: 200,
        events: 5
      }
    }, {
      text: '5K events',
      dataConfig: {
        resources: 1000,
        events: 5
      }
    }, {
      text: '10K events',
      dataConfig: {
        resources: 1000,
        events: 10
      }
    }, {
      text: 'Custom',
      ref: 'customButton',

      onClick() {
        toggleCustom(true);
      }

    }],

    onClick({
      source: button
    }) {
      if (button.dataConfig) {
        applyPreset(button.dataConfig.resources, button.dataConfig.events);
      }
    }

  }, '->', {
    ref: 'resourceCountField',
    type: 'number',
    placeholder: 'Number of resources',
    label: 'Resources',
    tooltip: 'Enter number of resource rows to generate and press [ENTER]',
    min: 1,
    max: 10000,
    width: 'auto',
    inputWidth: '5em',
    keyStrokeChangeDelay: 500,
    changeOnSpin: 500,
    hidden: true,
    onChange: ({
      userAction
    }) => userAction && generateResources()
  }, {
    ref: 'eventCountField',
    type: 'number',
    placeholder: 'Number of events',
    label: 'Events',
    tooltip: 'Enter number of events per resource to generate and press [ENTER]',
    min: 1,
    max: 100,
    width: 'auto',
    inputWidth: '4em',
    keyStrokeChangeDelay: 500,
    changeOnSpin: 500,
    hidden: true,
    onChange: ({
      userAction
    }) => userAction && generateResources()
  }, {
    type: 'button',
    ref: 'dependenciesButton',
    toggleable: true,
    icon: 'b-fa-square',
    pressedIcon: 'b-fa-check-square',
    text: 'Dependencies',
    hidden: true,

    onToggle({
      pressed
    }) {
      scheduler.features.dependencies.disabled = !pressed;

      if (pressed && !scheduler.dependencyStore.count) {
        generateResources();
      }
    }

  }, {
    type: 'button',
    ref: 'rangesButton',
    toggleable: true,
    icon: 'b-fa-square',
    pressedIcon: 'b-fa-check-square',
    text: 'Resource ranges',
    hidden: true,

    onToggle({
      pressed
    }) {
      scheduler.features.resourceTimeRanges.disabled = !pressed;

      if (pressed && !scheduler.resourceTimeRangeStore.count) {
        generateResources();
      }
    }

  }]
});
resourceCountField = scheduler.widgetMap.resourceCountField;
eventCountField = scheduler.widgetMap.eventCountField;
applyPreset(200, 5);