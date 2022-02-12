"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    var _scheduler;

    (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
    scheduler = null;
  });
  t.it('Should react to CTRL-Z when configured with enableUndoRedoKeys', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      enableUndoRedoKeys: true,
      startDate: new Date(2021, 2, 22),
      resources: [{
        id: 1,
        name: 'Resource'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        name: 'foo',
        startDate: new Date(2021, 2, 22),
        duration: 1
      }],
      project: {
        stm: {
          autoRecord: true
        }
      },
      tbar: [{
        type: 'undoredo',
        icon: 'b-fa-undo'
      }]
    });
    await scheduler.project.commitAsync();
    const stm = scheduler.project.stm;
    stm.enable();
    await t.dragBy('.b-sch-event', [100, 0]);
    await t.waitFor(() => stm.canUndo);
    t.ok(stm.canUndo, 'Undo possible'); // UNDO

    await t.type(null, 'Z', null, null, {
      ctrlKey: !BrowserHelper.isMac,
      metaKey: BrowserHelper.isMac
    });
    await t.waitFor(() => stm.canRedo);
    t.notOk(stm.canUndo, 'Undo queue empty');
    t.is(scheduler.eventStore.changes, null, 'Undid changes'); // REDO

    await t.type(null, 'Z', null, null, {
      shiftKey: true,
      ctrlKey: !BrowserHelper.isMac,
      metaKey: BrowserHelper.isMac
    });
    await t.waitFor(() => stm.canUndo);
    t.notOk(stm.canRedo, 'Redo queue empty');
    t.ok(stm.canUndo, 'Undo queue populated');
    t.ok(scheduler.eventStore.changes, 'Changes redone');
  }); // https://github.com/bryntum/support/issues/2880

  t.it('Should not duplicate event when undoing after deleting it', async t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      startDate: new Date(2021, 2, 22),
      resources: [{
        id: 1,
        name: 'Resource'
      }],
      events: [{
        id: 1,
        resourceId: 1,
        name: 'foo',
        startDate: new Date(2021, 2, 22),
        duration: 1
      }],
      project: {
        stm: {
          autoRecord: true
        }
      }
    });
    await scheduler.project.commitAsync();
    const stm = scheduler.project.stm;
    stm.enable();
    scheduler.eventStore.first.remove();
    t.waitForSelectorNotFound(scheduler.unreleasedEventSelector);
    stm.undo();
    await stm.await('restoringStop');
    await scheduler.project.commitAsync();
    t.waitForSelector(scheduler.unreleasedEventSelector);
    t.selectorCountIs(scheduler.unreleasedEventSelector, 1, 'Just one event rendered');
  }); // https://github.com/bryntum/support/issues/2971

  t.it('Should track ResourceTimeRanges and TimeRanges', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        timeRanges: true,
        resourceTimeRanges: true
      },
      project: {
        stm: {
          autoRecord: true
        },
        resourcesData: [{
          id: 1,
          name: 'Resource 1'
        }],
        timeRangesData: [{
          id: 1,
          name: 'Range',
          startDate: '2011-01-05',
          endDate: '2011-01-07'
        }],
        resourceTimeRangesData: [{
          id: 1,
          name: 'Resource range',
          resourceId: 1,
          startDate: '2011-01-08',
          endDate: '2011-01-10'
        }]
      }
    });
    const stm = scheduler.project.stm;
    stm.enable();
    scheduler.timeRangeStore.first.remove();
    t.waitForSelectorNotFound('.b-sch-timerange');
    await t.waitFor(() => stm.canUndo);
    await stm.undo();
    await t.waitFor(() => stm.canRedo);
    t.waitForSelector('.b-sch-timerange');
    scheduler.resourceTimeRangeStore.first.remove();
    t.waitForSelectorNotFound('.b-sch-resourcetimerange');
    await t.waitFor(() => stm.canUndo);
    stm.undo();
    t.waitForSelector('.b-sch-resourcetimerange');
  });
});