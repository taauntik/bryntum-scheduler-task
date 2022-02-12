"use strict";

StartTest(t => {
  let scheduler;

  class MyDependencyStore extends DependencyStore {
    isValidDependency(fromId, toId, type) {
      return type === DependencyBaseModel.Type.StartToEnd || type === DependencyBaseModel.Type.StartToStart;
    }

  }

  t.beforeEach(() => {
    scheduler && scheduler.destroy();
    scheduler = null;
  });

  const setupScheduler = cfg => {
    scheduler = t.getScheduler(Object.assign({
      appendTo: document.body,
      features: {
        dependencies: {
          showTooltip: false
        },
        eventTooltip: false,
        scheduleTooltip: false
      },
      resourceStore: t.getResourceStore2(null, 10)
    }, cfg), 2);
  };

  function assertDepenencyType(t, from, to, type, valid) {
    t.chain({
      moveMouseTo: '.event1'
    }, {
      drag: `.event1 .b-sch-terminal-${from}`,
      to: '.event2',
      dragOnly: true
    }, {
      moveMouseTo: `.event2 .b-sch-terminal-${to}`
    }, {
      mouseUp: null
    }, () => {
      const dep = scheduler.dependencyStore.first;

      if (valid) {
        t.is(dep.fromEvent.name, 'Assignment 1');
        t.is(dep.toEvent.name, 'Assignment 2');
        t.is(dep.type, type);
        t.is(dep.fromSide, from);
        t.is(dep.toSide, to);
      } else {
        t.notOk(dep, 'No dependency has been created');
      }
    });
  }

  t.it('Should be possible to validate to be created dependency', t => {
    const Type = DependencyBaseModel.Type;
    t.it('Start-to-Start', t => {
      setupScheduler({
        dependencyStore: new MyDependencyStore()
      });
      assertDepenencyType(t, 'left', 'left', Type.StartToStart, true);
    });
    t.it('Start-to-End', t => {
      setupScheduler({
        dependencyStore: new MyDependencyStore()
      });
      assertDepenencyType(t, 'left', 'right', Type.StartToEnd, true);
    });
    t.it('End-to-Start', t => {
      setupScheduler({
        dependencyStore: new MyDependencyStore()
      });
      assertDepenencyType(t, 'right', 'left', Type.EndToStart, false);
    });
    t.it('End-to-End', t => {
      setupScheduler({
        dependencyStore: new MyDependencyStore()
      });
      assertDepenencyType(t, 'right', 'right', Type.EndToEnd, false);
    });
  }); //https://github.com/bryntum/support/issues/172

  t.it('Creating a dependency between already linked events should consider to be valid', t => {
    setupScheduler();
    t.firesOk(scheduler.dependencyStore, 'add', 2, 'DependencyStore should be changed 2 times');
    t.chain( // It should be possible to create a dependency.
    {
      moveMouseTo: '.event1'
    }, {
      drag: '.event1 .b-sch-terminal-right',
      to: '.event2',
      dragOnly: true
    }, {
      moveMouseTo: '.event2 .b-sch-terminal-left'
    }, {
      waitForSelector: '.b-sch-dependency-connector.b-valid'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip .b-icon-valid'
    }, {
      mouseUp: null
    }, // It should be possible to create the same dependency again.
    {
      moveMouseTo: '.event1'
    }, {
      drag: '.event1 .b-sch-terminal-right',
      to: '.event2',
      dragOnly: true
    }, {
      moveMouseTo: '.event2 .b-sch-terminal-left'
    }, {
      waitForSelector: '.b-sch-dependency-connector.b-valid'
    }, {
      waitForSelector: '.b-sch-dependency-creation-tooltip .b-icon-valid'
    }, {
      mouseUp: null
    });
  });
});