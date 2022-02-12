"use strict";

StartTest(t => {
  t.diag('Double clicking any time header row should fire an event');
  PresetManager.registerPreset('foo', {
    tickWidth: 20,
    rowHeight: 32,
    displayDateFormat: 'HH:mm',
    shiftIncrement: 1,
    shiftUnit: 'day',
    timeResolution: {
      unit: 'minute',
      increment: 15
    },
    defaultSpan: 24,
    headers: [{
      unit: 'month',
      increment: 1,
      dateFormat: 'DD MMM YYYY'
    }, {
      unit: 'day',
      increment: 1,
      dateFormat: 'DD MMM'
    }, {
      unit: 'hour',
      increment: 1,
      dateFormat: 'H'
    }]
  });
  PresetManager.registerPreset('cellGen', {
    tickWidth: 20,
    rowHeight: 32,
    displayDateFormat: 'HH:mm',
    shiftIncrement: 1,
    shiftUnit: 'day',
    timeResolution: {
      unit: 'minute',
      increment: 15
    },
    defaultSpan: 24,
    headers: [{
      unit: 'day',
      increment: 1,
      dateFormat: 'd'
    }, {
      unit: 'hour',
      // Simplified scenario, assuming view will always just show one US fiscal year
      cellGenerator: (viewStart, viewEnd) => [{
        start: new Date(viewStart.getFullYear(), viewStart.getMonth(), viewStart.getDate()),
        end: new Date(viewStart.getFullYear(), viewStart.getMonth(), viewStart.getDate(), 12),
        header: 'First half of day'
      }, {
        start: new Date(viewStart.getFullYear(), viewStart.getMonth(), viewStart.getDate(), 12),
        end: new Date(viewStart.getFullYear(), viewStart.getMonth(), viewStart.getDate() + 1),
        header: 'Second half of day'
      }]
    }, {
      unit: 'hour',
      increment: 12
    }]
  });
  t.it('Measure', t => {
    const timeAxis = t.getTimeAxis(TimeAxis, PresetManager, 'foo', {
      startDate: new Date(2011, 1, 1),
      endDate: new Date(2011, 1, 3)
    });
    const view = new HorizontalTimeAxis({
      model: new TimeAxisViewModel({
        viewPreset: 'foo',
        timeAxis: timeAxis
      })
    }); // 48 columns times 20px, perfect fit

    view.model.update(960);
    view.range = {
      startDate: timeAxis.startDate,
      endDate: timeAxis.endDate
    };
    document.body.innerHTML = `
            <header class="b-grid-header-container">
                <div class="b-grid-header-scroller b-widget b-bar b-header">
                    <div class="b-grid-headers">
                        <div class="b-grid-header b-sch-timeaxiscolumn"></div>
                    </div>
                </div>
            </header>`;
    view.render(document.body.querySelector('.b-sch-timeaxiscolumn'));
    const timeAxisColWidth = PresetManager.getPreset('foo').tickWidth;
    t.is(view.model.tickSize, timeAxisColWidth, 'view.model.tickSize OK');
    t.is(view.model.totalSize, 48 * timeAxisColWidth, 'view.model.totalSize OK');
    t.selectorCountIs('.b-sch-header-row', 3, '3 levels found'); // Since implementation varies depending on browser (webkit), we're allowing a 1px diff

    let bottomTotal = 0;
    t.diag('Verify bottom row cell widths');
    Array.from(document.querySelectorAll('.b-sch-header-row:last-child > div')).forEach((el, index) => {
      const w = el.offsetWidth;
      t.isApproxPx(w, 20, 1, 'Correct width for bottom cell ' + index);
      bottomTotal += w;
    });
    t.diag('Verify middle row cell widths');
    Array.from(document.querySelectorAll('.b-sch-header-row-1 > div')).forEach((el, index) => {
      t.isApproxPx(el.offsetWidth, 480, 1, 'Correct width for middle cell ' + index);
    }); // Verify top row cell width

    t.isApproxPx(document.querySelector('.b-sch-header-row-0 > div').offsetWidth, bottomTotal, 1, 'Correct width for top table cell');
  });
  t.it('Should support cellGenerator', t => {
    const timeAxis = t.getTimeAxis(TimeAxis, PresetManager, 'cellGen', {
      startDate: new Date(2020, 0, 1),
      endDate: new Date(2020, 0, 2)
    });
    const view = new HorizontalTimeAxis({
      model: new TimeAxisViewModel({
        viewPreset: 'cellGen',
        timeAxis: timeAxis
      })
    }); // 1 day column

    view.model.update(960);
    view.range = {
      startDate: timeAxis.startDate,
      endDate: timeAxis.endDate
    };
    document.body.innerHTML = `
            <header class="b-grid-header-container">
                <div class="b-grid-header-scroller b-widget b-bar b-header">
                    <div class="b-grid-headers">
                        <div class="b-grid-header b-sch-timeaxiscolumn"></div>
                    </div>
                </div>
            </header>`;
    view.render(document.body.querySelector('.b-sch-timeaxiscolumn'));
    let bottomTotal = 0;
    t.selectorCountIs('.b-sch-header-row', 3, '3 levels found'); // Since implementation varies depending on browser (webkit), we're allowing a 1px diff

    t.diag('Verify bottom row cell widths');
    Array.from(document.querySelectorAll('.b-sch-header-row:last-child > div')).forEach((el, index) => {
      const w = el.offsetWidth;
      t.isApproxPx(w, 960 / 2, 1, 'Correct width for bottom cell ' + index);
      bottomTotal += w;
    });
    t.is(bottomTotal, 960);
  });
});