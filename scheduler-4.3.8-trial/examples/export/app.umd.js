"use strict";

var {
  AsyncHelper,
  DateHelper,
  WidgetHelper,
  DataGenerator,
  Scheduler
} = bryntum.scheduler;
const RESOURCES = 100,
      EVENTS = 5;

async function generateResources() {
  const resourceCount = RESOURCES,
        eventCount = EVENTS,
        today = DateHelper.clearTime(new Date()),
        mask = WidgetHelper.mask(scheduler.element, 'Generating records'),
        colors = ['cyan', 'green', 'indigo'],
        resources = [],
        events = [],
        dependencies = [];
  let schedulerEndDate = today;

  for (const res of DataGenerator.generate(resourceCount)) {
    resources.push(res);

    for (let j = 0; j < eventCount; j++) {
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
        resourceId: res.id,
        eventColor: colors[resources.length % 3]
      });

      if (j > 0) {
        dependencies.push({
          id: dependencies.length + 1,
          from: eventId - 1,
          to: eventId
        });
      }

      if (endDate > schedulerEndDate) schedulerEndDate = endDate;
    }

    if (resources.length % 20 === 0) {
      mask.text = `Generated ${resources.length * eventCount} of ${resourceCount * eventCount} records`;
      await AsyncHelper.animationFrame();
    }
  }

  scheduler.endDate = schedulerEndDate;
  scheduler.eventStore.data = events;
  scheduler.resourceStore.data = resources;
  scheduler.dependencyStore.data = dependencies;
  mask.close();
}

const headerTpl = ({
  currentPage,
  totalPages
}) => `
    <div class="demo-export-header">
        <img src="resources/logo.png"/>
        <dl>
            <dt>Date: ${DateHelper.format(new Date(), 'll LT')}</dt>
            <dd>${totalPages ? `Page: ${currentPage + 1}/${totalPages}` : ''}</dd>
        </dl>
    </div>`;

const footerTpl = () => '<div class="demo-export-footer"><h3>© 2020 Bryntum AB</h3></div>';

const scheduler = new Scheduler({
  appendTo: 'container',
  eventStyle: 'border',
  rowHeight: 50,
  columns: [{
    type: 'rownumber'
  }, {
    text: 'First name',
    field: 'firstName',
    flex: 1
  }, {
    text: 'Surname',
    field: 'surName',
    flex: 1
  }, {
    type: 'number',
    text: 'Score',
    field: 'score',
    flex: 1
  }],
  features: {
    dependencies: {
      disabled: true
    },
    pdfExport: {
      exportServer: 'http://localhost:8080/',
      headerTpl,
      footerTpl
    }
  },
  tbar: [{
    type: 'button',
    toggleable: true,
    icon: 'b-fa-square',
    pressedIcon: 'b-fa-check-square',
    text: 'Show dependencies',

    onToggle({
      pressed
    }) {
      scheduler.features.dependencies.disabled = !pressed;
    }

  }, {
    ref: 'exportButton',
    type: 'button',
    icon: 'b-fa-file-export',
    text: 'Export',

    onClick() {
      scheduler.features.pdfExport.showExportDialog();
    }

  }]
});
generateResources();