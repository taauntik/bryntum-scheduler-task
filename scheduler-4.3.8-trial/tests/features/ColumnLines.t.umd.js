"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    scheduler && !scheduler.isDestroyed && scheduler.destroy();
  });

  async function assertColumnLines(t, skipExists = false) {
    const bottomCells = t.query(`.b-sch-header-row-1 .b-sch-header-timeaxis-cell`),
          topCells = t.query(`.b-sch-header-row-0 .b-sch-header-timeaxis-cell`);

    if (bottomCells.length > 1) {
      await t.waitForSelector('.b-column-line');
      t.pass('Column lines found');
      let bottomCorrect = true;
      bottomCells.forEach((element, i) => {
        if (i) {
          const line = document.querySelector(`.b-column-line[data-line="line-${element.dataset.tickIndex}"]`),
                left = element.getBoundingClientRect().left; // Some lines might be replaced by major lines, thus the check that line exists

          if (line && Math.abs(line.getBoundingClientRect().left - left) > 0.5) {
            t.fail(`Misalign for bottom line ${element.dataset.tickIndex}, expected ${left}, got ${line.offsetLeft}`);
            bottomCorrect = false;
          }
        }
      });

      if (bottomCorrect) {
        t.pass('Bottom lines align');
      }
    }

    if (topCells.length > 1) {
      if (!skipExists) {
        await t.waitForSelector('.b-column-line-major');
        t.pass('Major lines found');
      }

      await t.waitForSelector('.b-column-line-major');
      let topCorrect = true;
      topCells.forEach((element, i) => {
        if (i) {
          const line = document.querySelector(`.b-column-line-major[data-line="major-${element.dataset.tickIndex}"]`),
                left = element.getBoundingClientRect().left; // Some lines might be replaced by major lines, thus the check that line exists

          if (line && Math.abs(line.getBoundingClientRect().left - left) > 0.5) {
            t.fail(`Misalign for major line ${element.dataset.tickIndex}, expected ${left}, got ${line.offsetLeft}`);
            topCorrect = false;
          }
        }
      });

      if (topCorrect) {
        t.pass('Top lines align');
      }
    }
  }

  t.it('Column lines align initially', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        columnLines: true
      }
    });
    await assertColumnLines(t);
    scheduler.zoomOut();
    await t.waitForAnimationFrame();
    await assertColumnLines(t);
    scheduler.zoomOut();
    await t.waitForAnimationFrame();
    await assertColumnLines(t);
    scheduler.zoomIn();
  });
  t.it('Column lines appear properly (zooming)', async t => {
    scheduler = new Scheduler({
      features: {
        columnLines: true
      },
      columns: [{
        field: 'name',
        width: 150
      }],
      resources: [{
        id: 1,
        name: 'Steve',
        job: 'Carpenter'
      }, {
        id: 2,
        name: 'John',
        job: 'Contractor'
      }],
      events: [{
        id: 1,
        name: 'Work',
        resourceId: 1,
        startDate: new Date(2017, 0, 1),
        endDate: new Date(2017, 0, 5)
      }, {
        id: 2,
        name: 'Plan',
        resourceId: 2,
        startDate: new Date(2017, 0, 2),
        endDate: new Date(2017, 0, 6)
      }],
      startDate: new Date(2017, 0, 1),
      endDate: new Date(2017, 0, 1, 0, 5),
      viewPreset: 'secondAndMinute',
      barMargin: 0,
      rowHeight: 55,
      appendTo: document.body
    });
    const steps = [];

    for (let i = scheduler.presets.count; i > 0; --i) {
      steps.push(async () => {
        scheduler.zoomOut();
        await t.waitForAnimationFrame();
        t.diag(`Zoom level ${scheduler.zoomLevel}`);
        await assertColumnLines(t);
      });
    }

    t.chain({
      waitForProjectReady: scheduler.project
    }, {
      waitForSelector: '.b-sch-timeaxis-cell'
    }, async () => {
      scheduler.zoomToLevel(25);
      await t.waitForAnimationFrame();
    }, steps);
  });
  t.it('Column lines work properly for complex header', async t => {
    PresetManager.registerPreset('dayNightShift', {
      tickWidth: 35,
      rowHeight: 32,
      displayDateFormat: 'HH:mm',
      shiftIncrement: 1,
      shiftUnit: 'day',
      timeResolution: {
        unit: 'minute',
        increment: 15
      },
      defaultSpan: 24,
      columnLinesFor: 1,
      headers: [{
        unit: 'day',
        increment: 1
      }, {
        unit: 'hour',
        increment: 12
      }, {
        unit: 'hour',
        increment: 2,
        dateFormat: 'H'
      }]
    });
    scheduler = await t.getSchedulerAsync({
      features: {
        columnLines: true
      },
      viewPreset: 'dayNightShift',
      startDate: new Date(2017, 0, 1),
      endDate: new Date(2019, 0, 6)
    });
    await assertColumnLines(t);
  });
  t.it('Should align when filtering time axis', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        columnLines: true
      }
    });
    scheduler.timeAxis.filter(tick => tick.startDate.getDay() !== 0);
    await t.waitForAnimationFrame();
    await assertColumnLines(t);
    scheduler.timeAxis.clearFilters();
    await t.waitForAnimationFrame();
    await assertColumnLines(t);
    scheduler.timeAxis.filter(tick => tick.startDate.getDay() < 3);
    await t.waitForAnimationFrame();
    await assertColumnLines(t);
  });
  t.it('Should align when resizing viewport', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        columnLines: true
      }
    });
    t.chain({
      waitForEvent: [scheduler, 'horizontalscroll'],
      trigger: () => t.setWindowSize(900, 768)
    }, async () => {
      await t.waitForAnimationFrame();
      await assertColumnLines(t);
    }, {
      waitForEvent: [scheduler, 'horizontalscroll'],
      trigger: () => t.setWindowSize(1200, 768)
    }, async () => {
      await t.waitForAnimationFrame();
      await assertColumnLines(t);
    }, {
      waitForEvent: [scheduler, 'horizontalscroll'],
      trigger: () => t.setWindowSize(1024, 768)
    }, async () => {
      await t.waitForAnimationFrame();
      await assertColumnLines(t);
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/7492

  t.it('Should align with autoAdjustTimeAxis false', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        columnLines: true
      },
      startDate: new Date(2016, 11, 30),
      endDate: new Date(2017, 0, 10),
      viewPreset: 'weekAndDay',
      autoAdjustTimeAxis: false
    });
    await assertColumnLines(t);
  });
  t.it('Should support disabling', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        columnLines: true
      }
    });
    scheduler.features.columnLines.disabled = true;
    await t.waitForAnimationFrame();
    t.selectorNotExists('.b-column-line', 'No column lines');
    scheduler.features.columnLines.disabled = false;
    await t.waitForAnimationFrame();
    t.selectorExists('.b-column-line', 'Column lines');
  });
  t.it('Should update column lines when reconfiguring working time', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        columnLines: true
      },
      width: 1000,
      columns: [],
      workingTime: {
        fromDay: 1,
        toDay: 6
      },
      startDate: '2011-01-03',
      endDate: '2011-01-09'
    });
    t.diag('1 - 6');
    scheduler.workingTime = {
      fromDay: 1,
      toDay: 5
    };
    await t.waitForAnimationFrame();
    await assertColumnLines(t, true);
    t.diag('1 - 5');
    scheduler.workingTime = {
      fromDay: 1,
      toDay: 5
    };
    await t.waitForAnimationFrame();
    await assertColumnLines(t, true);
    t.diag('1 - 4');
    scheduler.workingTime = {
      fromDay: 1,
      toDay: 4
    };
    await t.waitForAnimationFrame();
    await assertColumnLines(t, true);
    t.diag('1 - 3');
    scheduler.workingTime = {
      fromDay: 1,
      toDay: 3
    };
    await t.waitForAnimationFrame();
    await assertColumnLines(t, true);
    t.diag('1 - 2');
    scheduler.workingTime = {
      fromDay: 1,
      toDay: 2
    };
    await t.waitForAnimationFrame();
    await assertColumnLines(t, true);
  }); // https://github.com/bryntum/support/issues/1199

  t.it('Should keep showing the bold ticks when working time is applied for week days', async t => {
    scheduler = t.getScheduler({
      workingTime: {
        fromDay: 1,
        toDay: 6
      },
      startDate: new Date(2017, 0, 1),
      endDate: new Date(2017, 0, 20),
      viewPreset: 'weekAndDay'
    });
    await t.waitForAnimationFrame();
    scheduler.backgroundCanvas.style.pointerEvents = 'all';
    await t.waitForElementTop('.b-column-line-major');
  });
  t.it('Should update column lines when reconfiguring working time', async t => {
    scheduler = await t.getSchedulerAsync({
      width: 1000,
      columns: [],
      workingTime: {
        fromDay: 1,
        toDay: 6
      },
      startDate: '2011-01-03',
      endDate: '2011-01-09'
    });
    scheduler.workingTime = {
      fromDay: 1,
      toDay: 5
    };
    await t.waitForAnimationFrame();
    await assertColumnLines(t, true);
    scheduler.workingTime = {
      fromDay: 1,
      toDay: 4
    };
    await t.waitForAnimationFrame();
    await assertColumnLines(t, true);
    scheduler.workingTime = {
      fromDay: 1,
      toDay: 3
    };
    await t.waitForAnimationFrame();
    await assertColumnLines(t, true);
    scheduler.workingTime = {
      fromDay: 1,
      toDay: 2
    };
    await t.waitForAnimationFrame();
    await assertColumnLines(t, true);
  });
});