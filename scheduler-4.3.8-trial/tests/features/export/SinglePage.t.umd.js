"use strict";

StartTest(t => {
  let scheduler, paperHeight;
  const widthThreshold = t.bowser.firefox ? 3 : 2;
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
  t.it('Should export complete view', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport({
      horizontalPages: 2,
      verticalPages: 2,
      startDate: new Date(2019, 10, 4),
      endDate: new Date(2019, 11, 9)
    }));
    t.chain(async () => {
      const html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'singlepage',
        range: 'completeview'
      });
      t.is(html.length, 1, '1 page is exported');
      await new Promise(resolve => {
        t.setIframe({
          height: paperHeight,
          html: html[0].html,

          onload(doc, frame) {
            t.ok(t.assertRowsExportedWithoutGaps(doc, false, true), 'Rows exported without gaps');
            t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');
            t.is(doc.querySelectorAll('.b-grid-row').length, scheduler.resourceStore.count * 2, 'All resources exported');
            t.isExportedTickCount(doc, scheduler.timeAxis.count);
            t.is(doc.querySelectorAll('.b-sch-event').length, scheduler.eventStore.count / 2, 'Event count is correct');
            frame.remove();
            resolve();
          }

        });
      });
    });
  });
  t.it('Should export specific range of dates', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport({
      horizontalPages: 2,
      verticalPages: 2,
      startDate: new Date(2019, 10, 4),
      endDate: new Date(2019, 11, 9)
    }));
    t.chain(async () => {
      const rangeStart = new Date(2019, 10, 11),
            rangeEnd = new Date(2019, 10, 18),
            html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'singlepage',
        scheduleRange: 'daterange',
        rangeStart: rangeStart,
        rangeEnd: rangeEnd
      });
      t.is(html.length, 1, '1 page is exported');
      await new Promise(resolve => {
        t.setIframe({
          height: paperHeight,
          html: html[0].html,

          onload(doc, frame) {
            t.ok(t.assertRowsExportedWithoutGaps(doc, false, true), 'Rows exported without gaps');
            t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');
            t.is(doc.querySelectorAll('.b-grid-row').length, scheduler.resourceStore.count * 2, 'All resources exported');
            const tickCount = 7,
                  tickWidth = doc.querySelector('.b-lowest .b-sch-header-timeaxis-cell').offsetWidth,
                  lockedGridWidth = scheduler.subGrids.locked.scrollable.scrollWidth,
                  normalGridWidth = tickCount * tickWidth,
                  splitterWidth = scheduler.resolveSplitter('locked').offsetWidth,
                  schedulerEl = doc.querySelector('.b-scheduler'),
                  normalGridEl = doc.querySelector('.b-grid-subgrid-normal'),
                  normalGridBox = normalGridEl.getBoundingClientRect(),
                  normalHeaderEl = doc.querySelector('.b-grid-headers-normal'),
                  {
              firstTick,
              lastTick
            } = t.getFirstLastVisibleTicks(doc);
            t.isApproxPx(schedulerEl.offsetWidth, lockedGridWidth + normalGridWidth + splitterWidth, widthThreshold, 'Scheduler width is ok');
            t.isApproxPx(normalGridEl.offsetWidth, normalGridWidth, widthThreshold, 'Normal grid width is ok');
            t.isApproxPx(normalHeaderEl.offsetWidth, normalGridWidth, widthThreshold, 'Normal header width is ok');
            t.is(firstTick.dataset.tickIndex, '0', 'First visible tick index is ok');
            t.is(lastTick.dataset.tickIndex, '6', 'Last visible tick index is ok'); // find first event which is fit completely into the exported range

            const event = scheduler.eventStore.find(r => DateHelper.intersectSpans(rangeStart, rangeEnd, r.startDate, r.endDate));

            if (event) {
              const exportedEventEl = doc.querySelector(`[data-event-id="${event.id}"]`),
                    exportedEventBox = exportedEventEl.getBoundingClientRect(),
                    scale = exportedEventBox.width / exportedEventEl.offsetWidth,
                    eventStartCoord = DateHelper.getDurationInUnit(rangeStart, event.startDate, 'd') * tickWidth * scale,
                    expectedStartCoord = normalGridBox.left + eventStartCoord;
              t.isApproxPx(exportedEventBox.left, expectedStartCoord - (event.isMilestone ? exportedEventBox.height : 0) / 2, 'Event is positioned properly horizontally');
            }

            frame.remove();
            resolve();
          }

        });
      });
    });
  });
  t.it('Should export specific range of dates before schduler start date', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport({
      horizontalPages: 2,
      verticalPages: 2,
      startDate: new Date(2019, 10, 4),
      endDate: new Date(2019, 11, 9)
    }));
    t.chain(async () => {
      const rangeStart = new Date(2019, 9, 28),
            rangeEnd = new Date(2019, 10, 4),
            html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'singlepage',
        scheduleRange: 'daterange',
        rangeStart: rangeStart,
        rangeEnd: rangeEnd
      });
      t.is(html.length, 1, '1 page is exported');
      await new Promise(resolve => {
        t.setIframe({
          height: paperHeight,
          html: html[0].html,

          onload(doc, frame) {
            t.ok(t.assertRowsExportedWithoutGaps(doc, false, true), 'Rows exported without gaps');
            t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');
            t.is(doc.querySelectorAll('.b-grid-row').length, scheduler.resourceStore.count * 2, 'All resources exported');
            const tickCount = 7,
                  tickWidth = doc.querySelector('.b-lowest .b-sch-header-timeaxis-cell').offsetWidth,
                  lockedGridWidth = scheduler.subGrids.locked.scrollable.scrollWidth,
                  normalGridWidth = tickCount * tickWidth,
                  splitterWidth = scheduler.resolveSplitter('locked').offsetWidth,
                  schedulerEl = doc.querySelector('.b-scheduler'),
                  normalGridEl = doc.querySelector('.b-grid-subgrid-normal'),
                  normalGridBox = normalGridEl.getBoundingClientRect(),
                  normalHeaderEl = doc.querySelector('.b-grid-headers-normal'),
                  {
              firstTick: topTickEl
            } = t.getFirstLastVisibleTicks(doc, doc.querySelector('.b-sch-header-row-0')),
                  {
              firstTick,
              lastTick
            } = t.getFirstLastVisibleTicks(doc);
            t.isApproxPx(schedulerEl.offsetWidth, lockedGridWidth + normalGridWidth + splitterWidth, widthThreshold, 'Scheduler width is ok');
            t.isApproxPx(normalGridEl.offsetWidth, normalGridWidth, widthThreshold, 'Normal grid width is ok');
            t.isApproxPx(normalHeaderEl.offsetWidth, normalGridWidth, widthThreshold, 'Normal header width is ok');
            t.is(topTickEl.textContent, 'Mon 28 Oct 2019', 'Top tick is ok');
            t.is(firstTick.dataset.tickIndex, '0', 'First visible tick index is ok');
            t.is(lastTick.dataset.tickIndex, '6', 'Last visible tick index is ok'); // find first event which is fit completely into the exported range

            const event = scheduler.eventStore.find(r => DateHelper.intersectSpans(rangeStart, rangeEnd, r.startDate, r.endDate));

            if (event) {
              const exportedEventEl = doc.querySelector(`[data-event-id="${event.id}"]`),
                    exportedEventBox = exportedEventEl.getBoundingClientRect(),
                    scale = exportedEventBox.width / exportedEventEl.offsetWidth,
                    eventStartCoord = DateHelper.getDurationInUnit(rangeStart, event.startDate, 'd') * tickWidth * scale,
                    expectedStartCoord = normalGridBox.left + eventStartCoord;
              t.isApproxPx(exportedEventBox.left, expectedStartCoord - (event.isMilestone ? exportedEventBox.height : 0) / 2, 1.5, 'Event is positioned properly horizontally');
            }

            frame.remove();
            resolve();
          }

        });
      });
    });
  });
  t.it('Should export range [before start, end]', async t => {
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport({
      horizontalPages: 2,
      verticalPages: 2,
      startDate: new Date(2019, 10, 4),
      endDate: new Date(2019, 11, 9)
    }));
    t.chain(async () => {
      const rangeStart = new Date(2019, 9, 28),
            rangeEnd = new Date(2019, 11, 9),
            html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'singlepage',
        scheduleRange: 'daterange',
        rangeStart: rangeStart,
        rangeEnd: rangeEnd
      });
      t.is(html.length, 1, '1 page is exported');
      await new Promise(resolve => {
        t.setIframe({
          height: paperHeight,
          html: html[0].html,

          onload(doc, frame) {
            t.ok(t.assertRowsExportedWithoutGaps(doc, false, true), 'Rows exported without gaps');
            t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');
            t.is(doc.querySelectorAll('.b-grid-row').length, scheduler.resourceStore.count * 2, 'All resources exported');
            const tickCount = DateHelper.getDurationInUnit(rangeStart, rangeEnd, 'd'),
                  tickWidth = scheduler.tickSize,
                  lockedGridWidth = scheduler.subGrids.locked.scrollable.scrollWidth,
                  normalGridWidth = tickCount * tickWidth,
                  splitterWidth = scheduler.resolveSplitter('locked').offsetWidth,
                  schedulerEl = doc.querySelector('.b-scheduler'),
                  normalGridEl = doc.querySelector('.b-grid-subgrid-normal'),
                  normalGridBox = normalGridEl.getBoundingClientRect(),
                  normalHeaderEl = doc.querySelector('.b-grid-headers-normal'),
                  {
              firstTick: firstTopTickEl,
              lastTick: lastTopTickEl
            } = t.getFirstLastVisibleTicks(doc, doc.querySelector('.b-sch-header-row-0')),
                  {
              firstTick: firstTickEl,
              lastTick: lastTickEl
            } = t.getFirstLastVisibleTicks(doc);
            t.isApproxPx(schedulerEl.offsetWidth, lockedGridWidth + normalGridWidth + splitterWidth, widthThreshold, 'Scheduler width is ok');
            t.isApproxPx(normalGridEl.offsetWidth, normalGridWidth, widthThreshold, 'Normal grid width is ok');
            t.isApproxPx(normalHeaderEl.offsetWidth, normalGridWidth, widthThreshold, 'Normal header width is ok');
            t.is(firstTopTickEl.textContent, 'Mon 28 Oct 2019', 'First top tick is ok');
            t.is(lastTopTickEl.textContent, 'Mon 02 Dec 2019', 'Last top tick is ok');
            t.is(firstTickEl.dataset.tickIndex, 0, 'First visible tick index is ok');
            t.is(lastTickEl.dataset.tickIndex, tickCount - 1, 'Last visible tick index is ok'); // find first event which is fit completely into the exported range

            const event = scheduler.eventStore.find(r => DateHelper.intersectSpans(rangeStart, rangeEnd, r.startDate, r.endDate));

            if (event) {
              const exportedEventEl = doc.querySelector(`[data-event-id="${event.id}"]`),
                    exportedEventBox = exportedEventEl.getBoundingClientRect(),
                    scale = exportedEventBox.width / exportedEventEl.offsetWidth,
                    eventStartCoord = DateHelper.getDurationInUnit(rangeStart, event.startDate, 'd') * tickWidth * scale,
                    expectedStartCoord = normalGridBox.left + eventStartCoord;
              t.is(Math.round(exportedEventBox.left), Math.round(expectedStartCoord - (event.isMilestone ? exportedEventBox.height : 0) / 2), 'Event is positioned properly horizontally');
            }

            t.assertExportedEventsList(doc, scheduler.eventStore.query(record => DateHelper.intersectSpans(record.startDate, record.endDate, rangeStart, rangeEnd)));
            frame.remove();
            resolve();
          }

        });
      });
    });
  });
  t.it('Should export dependencies', async t => {
    const verticalPages = 2,
          horizontalPages = 2,
          totalPages = 1;
    ({
      scheduler,
      paperHeight
    } = await t.createSchedulerForExport({
      verticalPages,
      horizontalPages,
      featuresConfig: {
        dependencies: true
      }
    }));
    t.chain({
      waitForSelector: '.b-sch-dependency'
    }, async () => {
      const toAdd = []; // increase row heights to get scheduler to start estimating rows and offset rows at the bottom

      scheduler.resources.forEach((resource, index) => {
        if (index % 3 === 0) {
          toAdd.push(resource.events[2].copy());
        }
      });
      scheduler.eventStore.add(toAdd);
      await scheduler.await('dependenciesdrawn'); // filter out deps that point to invisible events

      scheduler.dependencyStore.filter(r => !(r.toOutside || r.fromOutside)); // wait till the engine handles the added records

      await Promise.all([t.waitForProjectReady(scheduler), scheduler.await('dependenciesdrawn')]);
      const html = await t.getExportHtml(scheduler, {
        columns: scheduler.columns.visibleColumns.map(c => c.id),
        exporterType: 'singlepage',
        scheduleRange: 'completeview'
      });
      t.is(html.length, totalPages, `${totalPages} pages are exported`);
      await new Promise(resolve => {
        t.setIframe({
          height: paperHeight,
          html: html[0].html,

          onload(doc, frame) {
            const eventsInView = scheduler.events.filter(r => DateHelper.intersectSpans(scheduler.startDate, scheduler.endDate, r.startDate, r.endDate));
            t.ok(t.assertExportedEventDependenciesList(doc, scheduler.dependencies), 'Dependencies exported ok');
            t.ok(t.assertExportedEventsList(doc, eventsInView), 'Events are exported ok');
            frame.remove();
            resolve();
          }

        });
      });
    });
  });
  t.it('Should export visible rows/schedule when scrolled to the bottom', async t => {
    async function generateResources(resourceCount = 100, eventCount = 5) {
      const today = DateHelper.clearTime(new Date()),
            colors = ['cyan', 'green', 'indigo'],
            resources = [],
            events = [];
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
          if (endDate > schedulerEndDate) schedulerEndDate = endDate;
        }
      }

      return {
        events,
        resources,
        schedulerEndDate
      };
    }

    const {
      events,
      resources
    } = await generateResources();
    scheduler = await t.getSchedulerAsync({
      appendTo: document.body,
      startDate: new Date(2021, 3, 4),
      endDate: new Date(2021, 7, 1),
      viewPreset: 'weekAndDayLetter',
      features: {
        pdfExport: {
          exportServer: '/export',
          footerTpl: () => `<style>.b-horizontaltimeaxis .b-sch-header-row { flex:1; }</style>`
        }
      },
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
      }],
      events,
      resources
    });
    await scheduler.scrollRowIntoView(scheduler.resourceStore.last);
    const {
      startDate,
      endDate
    } = scheduler.visibleDateRange,
          {
      rowManager
    } = scheduler,
          visibleRowCount = rowManager.rows.indexOf(rowManager.lastVisibleRow) - rowManager.rows.indexOf(rowManager.firstVisibleRow) + 1,
          html = await t.getExportHtml(scheduler, {
      columns: scheduler.columns.visibleColumns.map(c => c.id),
      exporterType: 'singlepage',
      scheduleRange: ScheduleRange.currentview,
      rowsRange: RowsRange.visible
    });
    t.is(html.length, 1, '1 page is exported');
    await new Promise(resolve => {
      t.setIframe({
        height: PaperFormat.A4.height * 96,
        html: html[0].html,

        onload(doc, frame) {
          t.ok(t.assertRowsExportedWithoutGaps(doc, false, true), 'Rows exported without gaps');
          t.ok(t.assertTicksExportedWithoutGaps(doc), 'Ticks exported without gaps');
          t.isGreaterOrEqual(doc.querySelectorAll('.b-grid-row').length, visibleRowCount * 2, 'All resources exported');
          const tickCount = DateHelper.getDurationInUnit(startDate, endDate, 'd'),
                tickWidth = scheduler.tickSize,
                lockedGridWidth = scheduler.subGrids.locked.scrollable.scrollWidth,
                normalGridWidth = tickCount * tickWidth,
                splitterWidth = scheduler.resolveSplitter('locked').offsetWidth,
                schedulerEl = doc.querySelector('.b-scheduler'),
                normalGridEl = doc.querySelector('.b-grid-subgrid-normal'),
                normalHeaderEl = doc.querySelector('.b-grid-headers-normal'),
                {
            firstTick: firstTopTickEl,
            lastTick: lastTopTickEl
          } = t.getFirstLastVisibleTicks(doc, doc.querySelector('.b-sch-header-row-0')),
                {
            firstTick: firstTickEl,
            lastTick: lastTickEl
          } = t.getFirstLastVisibleTicks(doc);
          t.isApproxPx(schedulerEl.offsetWidth, lockedGridWidth + normalGridWidth + splitterWidth, widthThreshold, 'Scheduler width is ok');
          t.isApproxPx(normalGridEl.offsetWidth, normalGridWidth, widthThreshold, 'Normal grid width is ok');
          t.isApproxPx(normalHeaderEl.offsetWidth, normalGridWidth, widthThreshold, 'Normal header width is ok');
          t.is(firstTopTickEl.textContent, 'Sun 04 Apr 2021', 'First top tick is ok');
          t.is(lastTopTickEl.textContent, 'Sun 09 May 2021', 'Last top tick is ok');
          t.is(firstTickEl.dataset.tickIndex, 0, 'First visible tick index is ok');
          t.is(lastTickEl.dataset.tickIndex, Math.ceil(tickCount - 1), 'Last visible tick index is ok');
          frame.remove();
          resolve();
        }

      });
    });
  });
});