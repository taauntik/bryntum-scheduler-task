"use strict";

StartTest(t => {
  const labelsConfig = {
    // using field as label (will first look in event and then in resource)
    top: {
      field: 'fullDuration',
      editor: {
        type: 'durationfield',
        width: 110
      },
      renderer: ({
        eventRecord
      }) => 'At the very least, ' + eventRecord.duration + ' ' + DateHelper.getLocalizedNameOfUnit(eventRecord.durationUnit, eventRecord.duration !== 1)
    },
    // using renderer
    bottom: {
      field: 'fullDuration',
      editor: {
        type: 'durationfield',
        width: 110
      },
      renderer: ({
        eventRecord
      }) => eventRecord.duration + ' ' + DateHelper.getLocalizedNameOfUnit(eventRecord.durationUnit, eventRecord.duration !== 1)
    }
  };
  let scheduler;

  async function getScheduler(config) {
    scheduler && scheduler.destroy();
    scheduler = t.getScheduler(Object.assign({
      dependencyStore: new DependencyStore(),
      resourceStore: t.getResourceStore2({}, 10)
    }, config), 10);
    await t.waitForProjectReady(scheduler);
  }

  t.it('Terminals should not be found from start', async t => {
    await getScheduler();
    t.selectorNotExists('.b-sch-terminal-top', 'Top terminal is hidden');
    t.selectorNotExists('.b-sch-terminal-right', 'Right terminal is hidden');
    t.selectorNotExists('.b-sch-terminal-bottom', 'Bottom terminal is hidden');
    t.selectorNotExists('.b-sch-terminal-left', 'Left terminal is hidden');
  });
  t.it('Terminals should be visible on hover, and hide on mouseleave', async t => {
    await getScheduler();
    t.chain({
      setCursorPosition: [1, 1]
    }, {
      moveCursorTo: '.b-sch-event:contains(Assignment 1)'
    }, next => {
      t.elementIsVisible('.b-sch-event-hover .b-sch-terminal-top', 'Top terminal is visible');
      t.elementIsVisible('.b-sch-event-hover .b-sch-terminal-right', 'Right terminal is visible');
      t.elementIsVisible('.b-sch-event-hover .b-sch-terminal-bottom', 'Bottom terminal is visible');
      t.elementIsVisible('.b-sch-event-hover .b-sch-terminal-left', 'Left terminal is visible');
      next();
    }, {
      moveCursorTo: '.b-sch-event:contains(Assignment 1)',
      offset: ['110%', '50%']
    }, next => {
      t.selectorNotExists('.b-sch-event-hover .b-sch-terminal-top', 'Top terminal is hidden');
      t.selectorNotExists('.b-sch-event-hover .b-sch-terminal-right', 'Right terminal is hidden');
      t.selectorNotExists('.b-sch-event-hover .b-sch-terminal-bottom', 'Bottom terminal is hidden');
      t.selectorNotExists('.b-sch-event-hover .b-sch-terminal-left', 'Left terminal is hidden');
      next();
    });
  });
  t.it('Only specified terminals should be visible on hover', async t => {
    await getScheduler({
      features: {
        dependencies: {
          terminalSides: ['left', 'right']
        }
      }
    });
    t.chain({
      setCursorPosition: [1, 1]
    }, {
      moveCursorTo: '.b-sch-event:contains(Assignment 1)'
    }, next => {
      t.selectorNotExists('.b-sch-event-hover .b-sch-terminal-top', 'Top terminal not rendered');
      t.elementIsVisible('.b-sch-event-hover .b-sch-terminal-right', 'Right terminal is visible');
      t.selectorNotExists('.b-sch-event-hover .b-sch-terminal-bottom', 'Bottom terminal not rendered');
      t.elementIsVisible('.b-sch-event-hover .b-sch-terminal-left', 'Left terminal is visible');
      next();
    });
  });
  t.it('Terminals should be visible on hover, and hide on mouseleave with labels', async t => {
    await getScheduler({
      rowHeight: 85,
      features: {
        labels: labelsConfig,
        eventTooltip: false
      }
    });
    const eventEl = scheduler.getElementFromEventRecord(scheduler.eventStore.first),
          wrap = eventEl.parentNode;
    t.chain({
      setCursorPosition: [1, 1]
    }, {
      moveCursorTo: eventEl
    }, next => {
      t.elementIsVisible('.b-sch-event-hover .b-sch-terminal-top', 'Top terminal is visible');
      t.elementIsVisible('.b-sch-event-hover .b-sch-terminal-right', 'Right terminal is visible');
      t.elementIsVisible('.b-sch-event-hover .b-sch-terminal-bottom', 'Bottom terminal is visible');
      t.elementIsVisible('.b-sch-event-hover .b-sch-terminal-left', 'Left terminal is visible');
      next();
    }, // Mouseout into a label, voiding the terminal.
    // Should trigger an eventMouseLeave which hides the terminals
    {
      moveCursorTo: wrap.querySelector('.' + scheduler.features.labels.labelCls),
      offset: ['90%', '50%']
    }, () => {
      t.selectorNotExists('.b-sch-event-hover .b-sch-terminal-top', 'Top terminal is hidden');
      t.selectorNotExists('.b-sch-event-hover .b-sch-terminal-right', 'Right terminal is hidden');
      t.selectorNotExists('.b-sch-event-hover .b-sch-terminal-bottom', 'Bottom terminal is hidden');
      t.selectorNotExists('.b-sch-event-hover .b-sch-terminal-left', 'Left terminal is hidden');
    });
  }); // https://github.com/bryntum/support/issues/3169

  t.it('Terminals should always hide when mouse leaves task bar', async t => {
    await getScheduler({
      rowHeight: 85,
      features: {
        labels: labelsConfig,
        eventTooltip: false
      }
    });
    t.simulator.setSpeed('speedRun');
    t.chain({
      setCursorPosition: [1, 1]
    }, {
      moveCursorTo: '.b-sch-event:contains(Assignment 1)'
    }, next => {
      t.selectorCountIs('.b-sch-event-hover .b-sch-terminal', 4, '4 terminals visible');
      next();
    }, {
      mouseDown: '.b-sch-event:contains(Assignment 1) .b-sch-terminal-right'
    }, {
      moveCursorTo: '.b-sch-event:contains(Assignment 2)'
    }, {
      moveCursorBy: [-100, 100]
    }, () => {
      t.selectorCountIs('.b-sch-terminal', 0, '0 terminals visible');
      t.simulator.setSpeed('turboMode');
    });
  });
});