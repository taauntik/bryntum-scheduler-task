"use strict";

var {
  AsyncHelper,
  DateHelper,
  WidgetHelper,
  Scheduler,
  DataGenerator,
  RandomGenerator
} = bryntum.scheduler;
const today = DateHelper.clearTime(new Date()),
      colors = ['cyan', 'green', 'indigo'];

async function generateResources() {
  const resourceCount = scheduler.widgetMap.resourceCountField.value,
        eventCount = scheduler.widgetMap.eventCountField.value,
        mask = WidgetHelper.mask(scheduler.element, 'Generating records'),
        resources = [],
        events = [],
        random = new RandomGenerator();
  let schedulerEndDate = today;
  console.time('generate');

  for (const res of DataGenerator.generate(resourceCount)) {
    resources.push(res);

    for (let j = 0; j < eventCount; j++) {
      const num = random.nextRandom(j * 2 + 1) + j,
            startDate = DateHelper.add(today, num, 'days'),
            duration = Math.round(random.nextRandom(9)) + 2,
            endDate = DateHelper.add(startDate, duration, 'days');
      events.push({
        id: events.length + 1,
        name: `Task #${events.length + 1}`,
        eventColor: colors[resources.length % 3],
        resourceId: res.id,
        startDate,
        duration //endDate

      });

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
  console.time('data');
  scheduler.suspendRefresh();
  scheduler.setTimeSpan(today, schedulerEndDate);
  scheduler.project = {
    resourceStore: {
      useRawData: true,
      data: resources
    },
    eventStore: {
      useRawData: true,
      data: events
    }
  };
  scheduler.resumeRefresh(true);
  console.timeEnd('data');
  mask.close();
}

const scheduler = new Scheduler({
  appendTo: 'container',
  eventStyle: 'border',
  rowHeight: 50,
  barMargin: 0,
  mode: 'vertical',
  tbar: [{
    ref: 'resourceCountField',
    type: 'number',
    placeholder: 'Number of resources',
    label: 'Resources',
    tooltip: 'Enter number of resource columns to generate and press [ENTER]',
    value: 100,
    width: 200,
    onChange: () => generateResources()
  }, {
    type: 'widget',
    html: 'X',
    width: 30,
    style: 'text-align: center'
  }, {
    ref: 'eventCountField',
    type: 'number',
    placeholder: 'Number of events',
    label: 'Events',
    tooltip: 'Enter number of events per resource to generate and press [ENTER]',
    min: 1,
    max: 100,
    value: 10,
    width: 180,
    onChange: () => generateResources()
  }]
});
generateResources();