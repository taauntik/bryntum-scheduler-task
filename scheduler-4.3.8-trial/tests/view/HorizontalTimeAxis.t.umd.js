"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && !scheduler.isDestroyed && scheduler.destroy();
  });
  t.it('TimeAxis header should render correctly after a long, animated scroll', async t => {
    PresetManager.registerPreset('dayNightShift', {
      name: 'Day/night shift (custom)',
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
      mainHeaderLevel: 1,
      headers: [{
        unit: 'day',
        increment: 1,
        dateFormat: 'MMMM Do YYYY'
      }, {
        unit: 'hour',
        increment: 12,

        renderer(startDate, endDate, headerConfig, cellIdx) {
          if (startDate.getHours() === 0) {
            // Setting a custom CSS on the header cell element
            headerConfig.headerCellCls = 'b-fa b-fa-moon';
            return DateHelper.format(startDate, 'MMM DD') + ' Night Shift';
          } else {
            // Setting a custom CSS on the header cell element
            headerConfig.headerCellCls = 'b-fa b-fa-sun';
            return DateHelper.format(startDate, 'MMM DD') + ' Day Shift';
          }
        }

      }, {
        unit: 'hour',
        increment: 1,
        dateFormat: 'H'
      }]
    });
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'dayNightShift',
      startDate: new Date(2019, 0, 1),
      endDate: new Date(2019, 0, 6),
      appendTo: document.body,
      events: [{
        id: 1,
        resourceId: 'r1',
        name: 'Meeting #1',
        cls: 'event1',
        startDate: new Date(2019, 0, 1, 8),
        endDate: new Date(2019, 0, 1, 24)
      }, {
        id: 2,
        resourceId: 'r1',
        name: 'Meeting #2',
        cls: 'event2',
        startDate: new Date(2019, 0, 5, 0),
        endDate: new Date(2019, 0, 5, 17)
      }]
    });
    const f = scheduler.assignmentStore.first,
          l = scheduler.assignmentStore.last;
    t.chain({
      waitForRowsVisible: scheduler
    }, async () => await scheduler.navigateTo(l), async () => {
      t.is(scheduler.activeAssignment, l, 'Navigation worked');
      t.is(Rectangle.from(scheduler.getElementFromAssignmentRecord(l, true)).roundPx().right, Rectangle.from(scheduler.timeAxisSubGridElement).right - 20, 'Scrolled with correct 20px edgeOffset');
      await scheduler.navigateTo(f);
    }, {
      waitForEvent: [scheduler.navigator, 'navigate'],
      trigger: () => scheduler.navigateTo(f)
    }, () => {
      t.is(scheduler.activeAssignment, f, 'Navigation worked');
      t.is(Rectangle.from(scheduler.getElementFromAssignmentRecord(f, true)).roundPx().left, Rectangle.from(scheduler.timeAxisSubGridElement).left + 20, 'Scrolled with correct 20px edgeOffset'); // Reaching for cell in 3rd row

      const cell = document.elementFromPoint(285, 2.5 * t.rect('.b-sch-header-timeaxis-cell').height).closest('.b-sch-header-timeaxis-cell');
      t.ok(cell.classList.contains('b-sch-header-timeaxis-cell'), 'Cell in place');
      t.is(cell.textContent, '12', 'Cell content correct');
    });
  });
  t.it('Should size time axis header correctly', async t => {
    scheduler = await t.getSchedulerAsync({
      columns: [{
        text: 'N<br>a<br>m<br>e',
        field: 'name',
        htmlEncodeHeaderText: false
      }]
    });
    const expectedHeight = t.rect('.b-grid-header').height / 2;
    t.hasHeight('.b-sch-header-row-0', expectedHeight, 'Top header row has correct height');
    t.hasHeight('.b-sch-header-row-1', expectedHeight, 'Bottom header row has correct height');
  });
  t.it('Should render header correctly with ResizeObserver polyfill', async t => {
    const RO = window.ResizeObserver;
    delete window.ResizeObserver;
    scheduler = await t.getSchedulerAsync();
    t.selectorExists('.b-sch-header-timeaxis-cell');
    window.ResizeObserver = RO;
  });
});