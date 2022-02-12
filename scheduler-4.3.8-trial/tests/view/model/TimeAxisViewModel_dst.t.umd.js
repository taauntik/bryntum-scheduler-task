"use strict";

StartTest(t => {
  // This test requires specific time zone to work
  if (new Date(2021, 9, 31).getTimezoneOffset() - new Date(2021, 9, 31, 12).getTimezoneOffset() === 0 || new Date(2022, 9, 30).getTimezoneOffset() - new Date(2022, 9, 30, 12).getTimezoneOffset() === 0) {
    return;
  }

  t.it('Should correctly create time axis when we render a single day from month (day and week)', t => {
    const viewPreset = 'dayAndWeek';
    const timeAxis = new TimeAxis({
      startDate: new Date(2021, 9, 31, 23),
      endDate: new Date(2022, 9, 30, 1),
      autoAdjust: false,
      viewPreset,
      weekStartDay: 0
    });
    const model = new TimeAxisViewModel({
      timeAxis,
      viewPreset
    });
    const {
      tickSize
    } = model;
    t.it('Start on long day, end on long day', t => {
      t.isApprox(model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate), tickSize / 24, 1, 'First tick width is approximately 1/24 of full tick size');
      t.isApprox(model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate), tickSize / 24, 1, 'Last tick width is approximately 1/24 of full tick size');
      timeAxis.setTimeSpan(new Date(2021, 9, 31, 22), new Date(2022, 9, 30, 2));
      t.isApprox(model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate), tickSize / 24 * 2, 1, 'First tick width is approximately 2/24 of full tick size');
      t.isApprox(model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate), tickSize / 24 * 2, 1, 'Last tick width is approximately 2/24 of full tick size');
    });
    t.it('Start on long day, end on regular', t => {
      timeAxis.setTimeSpan(new Date(2021, 9, 31, 23), new Date(2021, 10, 2, 1));
      t.isApprox(model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate), tickSize / 24, 1, 'First tick width is approximately 1/24 of full tick size');
      t.isApprox(model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate), tickSize / 24, 1, 'Last tick width is approximately 1/24 of full tick size');
      timeAxis.setTimeSpan(new Date(2021, 9, 31, 22), new Date(2021, 10, 2, 2));
      t.isApprox(model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate), tickSize / 24 * 2, 1, 'First tick width is approximately 2/24 of full tick size');
      t.isApprox(model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate), tickSize / 24 * 2, 1, 'Last tick width is approximately 2/24 of full tick size');
    });
    t.it('Start on regular day, end on long', t => {
      timeAxis.setTimeSpan(new Date(2022, 9, 28, 23), new Date(2022, 9, 30, 1));
      t.isApprox(model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate), tickSize / 24, 1, 'First tick width is approximately 1/24 of full tick size');
      t.isApprox(model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate), tickSize / 24, 1, 'Last tick width is approximately 1/24 of full tick size');
      timeAxis.setTimeSpan(new Date(2021, 9, 28, 22), new Date(2022, 9, 30, 2));
      t.isApprox(model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate), tickSize / 24 * 2, 1, 'First tick width is approximately 2/24 of full tick size');
      t.isApprox(model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate), tickSize / 24 * 2, 1, 'Last tick width is approximately 2/24 of full tick size');
    });
    t.it('Start on regular day, end on regular', t => {
      timeAxis.setTimeSpan(new Date(2021, 8, 9, 23), new Date(2021, 8, 12, 1));
      t.isApprox(model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate), tickSize / 24, 1, 'First tick width is approximately 1/24 of full tick size');
      t.isApprox(model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate), tickSize / 24, 1, 'Last tick width is approximately 1/24 of full tick size');
      timeAxis.setTimeSpan(new Date(2021, 8, 9, 22), new Date(2021, 8, 12, 2));
      t.isApprox(model.getDistanceBetweenDates(timeAxis.first.startDate, timeAxis.first.endDate), tickSize / 24 * 2, 1, 'First tick width is approximately 2/24 of full tick size');
      t.isApprox(model.getDistanceBetweenDates(timeAxis.last.startDate, timeAxis.last.endDate), tickSize / 24 * 2, 1, 'Last tick width is approximately 2/24 of full tick size');
    });
  });
});