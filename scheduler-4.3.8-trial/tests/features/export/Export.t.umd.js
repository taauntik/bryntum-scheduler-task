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
  CSSHelper.insertRule('.b-horizontaltimeaxis .b-sch-header-row { flex:1; }');
  t.overrideAjaxHelper();
  t.beforeEach(() => {
    var _scheduler;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });

  async function assertContent(t, html) {
    await new Promise(resolve => {
      t.setIframe({
        height: paperHeight + 50,
        html: html[0].html,

        onload(doc, frame) {
          t.ok(t.assertHeaderPosition(doc), 'Header is exported ok');
          t.ok(t.assertFooterPosition(doc), 'Footer is exported ok');
          t.ok(t.assertRowsExportedWithoutGaps(doc, false, true), 'Rows exported without gaps');
          t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');
          t.isExportedTickCount(doc, scheduler.timeAxis.count);
          t.is(doc.querySelectorAll(scheduler.unreleasedEventSelector).length, scheduler.eventStore.count / 2, 'All events exported');
          frame.remove();
          resolve();
        }

      });
    });
  }

  t.it('Sanity', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport());
    let html, fileName;
    t.chain(async () => {
      t.diag('Using singlepage export');
      const result = await scheduler.features.pdfExport.export({
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'singlepage',
        range: 'completeview'
      });
      t.ok(scheduler.enableEventAnimations, 'Event animations are enabled');
      ({
        html,
        fileName
      } = result.response.request.body);
      t.is(html.length, 1, '1 page is exported');
      t.is(fileName, 'Scheduler', 'File name is ok');
      await assertContent(t, html);
      t.diag('Using multipage export');
      scheduler.features.pdfExport.on({
        exportStep() {
          t.notOk(scheduler.enableEventAnimations, 'Event animations are disabled during export');
        },

        thisObj: scheduler,
        once: true
      });
      html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'multipage',
        range: 'completeview'
      });
      t.ok(scheduler.enableEventAnimations, 'Event animations are enabled');
      t.is(html.length, 1, '1 page is exported');
      await assertContent(t, html);
    });
  });
  t.it('Should not trigger scrolls after export promise is resolved', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport());
    await scheduler.features.pdfExport.export({
      columns: scheduler.columns.map(c => c.id)
    });
    t.firesOk({
      observable: scheduler,
      events: {
        horizontalscroll: 0
      }
    });
    t.firesOk({
      observable: scheduler.timeAxisSubGrid.scrollable,
      events: {
        scrollEnd: 0
      }
    }); // Timeout is absolutely required here. We need to wait for some time to know that scheduler won't fire anything

    await t.waitFor(1000);
  });
  t.it('Should export with dependencies disabled', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport({
      featuresConfig: {
        dependencies: true
      },
      config: {
        dependencies: []
      }
    }));
    let html;
    t.chain(async () => {
      t.diag('Using singlepage export');
      html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'singlepage',
        range: 'completeview'
      });
      t.is(html.length, 1, '1 page is exported');
      await assertContent(t, html);
      t.diag('Using multipage export');
      html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'multipage',
        range: 'completeview'
      });
      t.is(html.length, 1, '1 page is exported');
      await assertContent(t, html);
    });
  });
  t.it('Should export with column lines disabled', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport({
      featuresConfig: {
        columnLines: false
      }
    }));
    let html;
    t.chain(async () => {
      t.diag('Using singlepage export');
      html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'singlepage',
        range: 'completeview'
      });
      t.is(html.length, 1, '1 page is exported');
      await assertContent(t, html);
      t.diag('Using multipage export');
      html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'multipage',
        range: 'completeview'
      });
      t.is(html.length, 1, '1 page is exported');
      await assertContent(t, html);
    });
  });
  t.it('Should export when locked grid is wider than first page', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport({
      width: 2000,
      horizontalPages: 2,
      verticalPages: 1
    }));
    let html;
    t.chain(async () => {
      scheduler.subGrids.locked.width = 1000;
      await new Promise(resolve => setTimeout(resolve, 1000));
      t.diag('Using singlepage export');
      html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'multipage',
        range: ScheduleRange.currentview,
        keepRegionSizes: {
          locked: true
        }
      });
      t.is(html.length, 3, 'Few pages is exported');
      await new Promise(resolve => {
        t.setIframe({
          height: paperHeight,
          html: html[0].html,

          onload(doc, frame) {
            t.ok(t.assertHeaderPosition(doc), 'Header is exported ok');
            t.ok(t.assertFooterPosition(doc), 'Footer is exported ok');
            t.ok(t.assertRowsExportedWithoutGaps(doc, false, true), 'Rows exported without gaps');
            t.isExportedTickCount(doc, 0);
            t.is(doc.querySelectorAll(scheduler.unreleasedEventSelector).length, 0, 'No events exported');
            frame.remove();
            resolve();
          }

        });
      });
    });
  });
});