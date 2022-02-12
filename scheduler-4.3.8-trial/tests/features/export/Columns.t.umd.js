"use strict";

StartTest(t => {
  let scheduler, paperHeight;
  Object.assign(window, {
    DateHelper,
    DomHelper,
    Override,
    DataGenerator,
    RandomGenerator,
    PaperFormat,
    Rectangle
  });
  t.overrideAjaxHelper();
  CSSHelper.insertRule('.b-horizontaltimeaxis .b-sch-header-row { flex:1; }');
  t.beforeEach(() => {
    scheduler && scheduler.destroy();
  });
  t.it('Should size regions according to the', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport());
    t.chain(async () => {
      const splitterWidth = scheduler.resolveSplitter('normal').offsetWidth;

      async function assertColumns(exporterType) {
        const html = await t.getExportHtml(scheduler, {
          columns: [],
          exporterType
        });
        const {
          document: doc,
          iframe
        } = await t.setIframeAsync({
          height: paperHeight,
          html: html[0].html
        });
        const expectedNormalWidth = scheduler.timeAxisColumn.width,
              lockedGridEl = doc.getElementById(scheduler.subGrids.locked.id),
              normalGridEl = doc.getElementById(scheduler.subGrids.normal.id),
              schedulerEl = doc.getElementById(scheduler.id);
        t.is(lockedGridEl.offsetWidth, 0, 'Locked region width is ok');
        t.isApproxPx(normalGridEl.offsetWidth, expectedNormalWidth, 2, 'Normal region width is ok');
        t.is(schedulerEl.offsetWidth, expectedNormalWidth + splitterWidth, 'Scheduler width is ok');
        iframe.remove();
      }

      await assertColumns('singlepage');
      await assertColumns('multipage');
    });
  });
  t.it('Should keep region size', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport({
      config: {
        subGridConfigs: {
          locked: {
            width: 150
          }
        }
      },
      width: 400
    }));
    const normalScrollWidth = scheduler.timeAxisSubGrid.scrollable.scrollWidth,
          lockedScrollWidth = scheduler.subGrids.locked.scrollable.scrollWidth,
          splitterWidth = 5;

    async function assertExport(config, locked, normal, total) {
      const pages = await t.getExportHtml(scheduler, config);
      const {
        document,
        iframe
      } = await t.setIframeAsync({
        html: pages[0].html,
        height: paperHeight
      }),
            lockedEl = document.querySelector('.b-grid-subgrid-locked'),
            normalEl = document.querySelector('.b-grid-subgrid-normal'),
            gridEl = document.querySelector('.b-gridbase');
      t.is(lockedEl.offsetWidth, locked, 'Locked region width is ok');
      t.is(normalEl.offsetWidth, normal, 'Normal region width is ok');
      t.is(gridEl.offsetWidth, total, 'Scheduler width is ok');
      iframe.remove();
    }

    await assertExport({
      exporterType: 'singlepage',
      keepRegionSizes: {
        locked: true
      }
    }, 150, normalScrollWidth, 150 + splitterWidth + normalScrollWidth);
    await assertExport({
      exporterType: 'singlepage',
      keepRegionSizes: {
        normal: true
      }
    }, lockedScrollWidth, scheduler.timeAxisSubGrid.width, lockedScrollWidth + splitterWidth + scheduler.timeAxisSubGrid.width);
    await assertExport({
      exporterType: 'multipage',
      keepRegionSizes: {
        locked: true
      }
    }, 150, normalScrollWidth, 150 + splitterWidth + normalScrollWidth);
    await assertExport({
      exporterType: 'multipage',
      keepRegionSizes: {
        normal: true
      }
    }, lockedScrollWidth, scheduler.timeAxisSubGrid.width, lockedScrollWidth + splitterWidth + scheduler.timeAxisSubGrid.width);
  });
  t.it('Should export with collapsed regions', async t => {
    function assertRegions(doc, locked, normal) {
      const splitterEl = doc.querySelector('.b-grid-splitter'),
            lockedEl = doc.querySelector('.b-grid-subgrid-locked'),
            normalEl = doc.querySelector('.b-grid-subgrid-normal');

      if (locked === 'collapsed') {
        t.ok(lockedEl.className.match(/b-grid-subgrid-collapsed/), 'Locked subgrid is collapsed');
      } else {
        t.isApprox(lockedEl.offsetWidth, locked, 1, 'Locked subgrid width is ok');
      }

      if (normal === 'collapsed') {
        t.ok(normalEl.className.match(/b-grid-subgrid-collapsed/), 'Locked subgrid is collapsed');
      } else {
        t.isApprox(normalEl.offsetWidth, normal, 1, 'Normal subgrid width is ok');
      }

      t.is(splitterEl.offsetWidth, 10, 'Splitter width is ok');
    }

    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport());
    await Promise.all([scheduler.subGrids.locked.collapse(), scheduler.await('timelineViewportResize', {
      checkLog: false
    }), t.waitForAnimationFrame()]);
    let pages = await t.getExportHtml(scheduler, {
      exporterType: 'singlepage'
    });
    let {
      document,
      iframe
    } = await t.setIframeAsync({
      height: 1123,
      html: pages[0].html
    });
    assertRegions(document, 'collapsed', scheduler.timeAxisSubGrid.element.offsetWidth);
    iframe.remove();
    await scheduler.subGrids.normal.collapse();
    pages = await t.getExportHtml(scheduler, {
      exporterType: 'singlepage',
      keepRegionSizes: {
        locked: true
      }
    });
    ({
      document,
      iframe
    } = await t.setIframeAsync({
      height: 1123,
      html: pages[0].html
    }));
    assertRegions(document, scheduler.subGrids.locked.element.offsetWidth, 'collapsed');
    iframe.remove();
  }); // This is more of a sanity test that narrow scheduling view works and doesn't throw. There is no strong opinion on
  // this behavior.

  t.it('Should export with narrow time axis subgrid', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport());
    scheduler.timeAxisSubGrid.width = 3;
    const pages = await t.getExportHtml(scheduler, {
      exporterType: 'singlepage',
      keepRegionSizes: {
        normal: true
      }
    });
    const {
      document,
      iframe
    } = await t.setIframeAsync({
      height: paperHeight,
      html: pages[0].html
    });
    t.ok(t.assertRowsExportedWithoutGaps(document, false, true), 'Rows exported without gaps');
    t.ok(t.assertTicksExportedWithoutGaps(document), 'Ticks exported without gaps');
    t.is(document.querySelectorAll('.b-grid-row').length, scheduler.resourceStore.count * 2, 'All resources exported');
    t.isExportedTickCount(document, scheduler.timeAxis.count);
    t.is(document.querySelectorAll('.b-sch-event').length, scheduler.eventStore.count / 2, 'Event count is correct');
    t.is(document.querySelector('.b-grid-subgrid-normal').offsetWidth, 3, 'Normal grid width is ok');
    iframe.remove();
  });
});