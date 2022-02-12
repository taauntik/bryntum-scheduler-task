"use strict";

StartTest(t => {
  let scheduler, resourceStore, eventStore, resources; // async beforeEach doesn't work in umd

  t.beforeEach(() => {
    scheduler && scheduler.destroy();
  }); // #8923 - Child nodes not shown for newly added resource in a tree

  t.it('Append nodes and collapse/expand after works fine', async t => {
    resources = [];

    for (let i = 0; i < 100; i++) {
      resources.push({
        id: i,
        name: `r${i}`
      });
    }

    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2018, 8, 20),
      endDate: new Date(2018, 9, 30),
      viewPreset: 'weekAndMonth',
      resourceStore: new ResourceStore({
        tree: true,
        data: resources
      }),
      events: [],
      features: {
        tree: true
      },
      columns: [{
        type: 'tree',
        field: 'name'
      }]
    });
    resourceStore = scheduler.resourceStore;
    eventStore = scheduler.eventStore;
    let resource;
    t.chain({
      waitFor: () => scheduler,
      desc: 'Scheduler is here'
    }, next => {
      resource = resourceStore.rootNode.appendChild({
        id: 2000,
        name: 'parent',
        expanded: true,
        children: [{
          id: 2001,
          name: 'child'
        }]
      });
      eventStore.add({
        startDate: new Date(2018, 8, 21),
        endDate: new Date(2018, 8, 22),
        name: 'foo',
        resourceId: 2000
      });
      next();
    }, {
      waitForEvent: [scheduler, 'scroll'],
      trigger: () => scheduler.scrollResourceIntoView(resource.firstChild)
    }, {
      waitForSelector: '.b-grid-cell:contains(child)',
      desc: 'Child is visible initially'
    }, {
      diag: 'Collapsing...'
    }, () => scheduler.features.tree.collapse(resource), {
      waitForSelectorNotFound: '.b-grid-cell:contains(child)',
      desc: 'Child got hidden'
    }, {
      diag: 'Expanding...'
    }, () => scheduler.features.tree.expand(resource), next => {
      t.ok(scheduler.getRowById(2001), 'Sub node is here');
      next();
    }, {
      waitForSelector: '.b-grid-cell:contains(child)',
      desc: 'Child got visible'
    });
  }); // #635 Events disappear when toggling other node

  t.it('Events are rendered correctly after collapse/expand', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      resources: [{
        id: 1,
        name: 'School',
        expanded: true,
        children: [{
          id: 11,
          name: 'Floor 11',
          expanded: true,
          children: [{
            id: 111,
            name: 'Room 11-1'
          }, {
            id: 112,
            name: 'Room 11-2'
          }]
        }, {
          id: 12,
          name: 'Floor 12',
          expanded: true,
          children: [{
            id: 121,
            name: 'Room 12-1'
          }, {
            id: 122,
            name: 'Room 12-2'
          }]
        }]
      }],
      events: [{
        id: 1,
        resourceId: 111,
        name: 'Moving out',
        startDate: '2020-04-27',
        duration: 1
      }, {
        id: 2,
        resourceId: 112,
        name: 'Moving in',
        startDate: '2020-04-29',
        duration: 1
      }, {
        id: 3,
        resourceId: 121,
        name: 'Moving in',
        startDate: '2020-04-28',
        duration: 1
      }, {
        id: 4,
        resourceId: 122,
        name: 'Moving out',
        startDate: '2020-04-30',
        duration: 1
      }],
      startDate: '2020-04-27',
      endDate: '2020-04-30',
      features: {
        tree: true
      },
      columns: [{
        type: 'tree',
        field: 'name',
        text: 'Name',
        width: 200
      }]
    });
    await t.waitForProjectReady(scheduler);
    await scheduler.collapse(11);
    await scheduler.collapse(12);
    await scheduler.expand(11);
    await t.waitForSelector(scheduler.unreleasedEventSelector);
    await scheduler.expand(12);
    await t.waitForSelector(scheduler.unreleasedEventSelector);
    t.selectorCountIs(scheduler.unreleasedEventSelector, 4, '4 events rendered');
  }); // https://github.com/bryntum/support/issues/1227

  t.it('Should be possible to undo event removing when tree feature is used and assignment is set using resourceId field', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        tree: true,
        dependencies: true
      },
      columns: [{
        type: 'tree',
        text: 'Name',
        field: 'name',
        width: 200
      }],
      events: [{
        id: 1,
        resourceId: 1,
        name: 'Test',
        startDate: '2011-01-04',
        endDate: '2011-01-05'
      }],
      resources: [{
        id: 1,
        name: 'Foo',
        leaf: true
      }],
      enableEventAnimations: false
    });
    const stm = scheduler.project.getStm();
    stm.enable();
    stm.autoRecord = true;
    t.chain(async () => {
      scheduler.eventStore.first.remove();
    }, {
      waitFor: () => stm.canUndo
    }, () => {
      stm.undo();
      t.notOk(scheduler.eventStore.changes);
    });
  });
  t.it('Should be possible to undo event removing when tree feature is used and assignment is set as a record in AssignmentStore', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        tree: true,
        dependencies: true
      },
      columns: [{
        type: 'tree',
        text: 'Name',
        field: 'name',
        width: 200
      }],
      events: [{
        id: 1,
        name: 'Test',
        startDate: '2011-01-04',
        endDate: '2011-01-05'
      }],
      assignments: [{
        id: 1,
        resourceId: 1,
        eventId: 1
      }],
      resources: [{
        id: 1,
        name: 'Foo',
        leaf: true
      }],
      enableEventAnimations: false
    });
    const stm = scheduler.project.getStm();
    stm.enable();
    stm.autoRecord = true;
    t.chain(async () => {
      scheduler.eventStore.first.remove();
    }, {
      waitFor: () => stm.canUndo
    }, () => {
      stm.undo();
      t.notOk(scheduler.eventStore.changes);
    });
  });
});