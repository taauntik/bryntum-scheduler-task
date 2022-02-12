"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    var _scheduler;

    (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });
  t.it('Should calculate correct tick width for final tick', t => {
    scheduler = t.getScheduler({
      startDate: new Date(2021, 6, 1),
      endDate: new Date(2021, 9, 1),
      autoAdjustTimeAxis: false,
      viewPreset: 'monthAndYear',
      resources: []
    });
    t.diag(`Checking 2021-10-02`);
    const {
      timeAxis,
      tickSize
    } = scheduler;
    scheduler.endDate = new Date(2021, 9, 2);
    let size = scheduler.timeAxisViewModel.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate);
    t.isApprox(size, 1 / 30 * tickSize, 2, 'View model return correct distance for last tick');
    t.isApprox(t.rect('.b-lowest .b-sch-header-timeaxis-cell.b-last').width, size, 1, 'Final tick has correct width');
    t.diag(`Checking 2021-10-03`);
    scheduler.endDate = new Date(2021, 9, 3);
    size = scheduler.timeAxisViewModel.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate);
    t.isApprox(size, 2 / 30 * tickSize, 2, 'View model return correct distance for last tick');
    t.isApprox(t.rect('.b-lowest .b-sch-header-timeaxis-cell.b-last').width, size, 1, 'Final tick has correct width');
  });
});