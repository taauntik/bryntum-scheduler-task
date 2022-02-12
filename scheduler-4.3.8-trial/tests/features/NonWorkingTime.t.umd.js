"use strict";

StartTest(t => {
  let scheduler;
  const defaultWeekends = LocaleManager.locale.DateHelper.nonWorkingDays;
  t.beforeEach(t => {
    var _scheduler, _scheduler$destroy;

    (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : (_scheduler$destroy = _scheduler.destroy) === null || _scheduler$destroy === void 0 ? void 0 : _scheduler$destroy.call(_scheduler);
  });

  const createScheduler = (weekends = defaultWeekends) => {
    // reset weekends
    LocaleManager.locale.DateHelper.nonWorkingDays = weekends;
    scheduler = t.getScheduler({
      startDate: new Date(2018, 1, 1),
      endDate: new Date(2018, 1, 15),
      viewPreset: 'weekAndDayLetter',
      height: 300,
      features: {
        nonWorkingTime: true
      }
    });
  };

  t.it('Rendering sanity checks', t => {
    createScheduler();
    t.chain({
      waitForSelector: '.b-grid-headers .b-sch-nonworkingtime',
      desc: 'Should find range element in header'
    }, () => {
      t.isApproxPx(document.querySelector('.b-grid-headers .b-sch-nonworkingtime').offsetHeight, document.querySelector('.b-grid-headers').offsetHeight / 2, 'non working time elements has half height of 2-level header');
    });
  });
  t.it('Should support disabling', t => {
    createScheduler();
    scheduler.features.nonWorkingTime.disabled = true;
    t.selectorNotExists('.b-sch-timerange', 'No timeranges');
    scheduler.features.nonWorkingTime.disabled = false;
    t.selectorExists('.b-sch-timerange', 'Timeranges found');
  }); // https://github.com/bryntum/support/issues/2309

  t.it('Weekends should be configurable. Weekends are Sat - Sun', async t => {
    createScheduler();
    await t.waitForSelector('.b-sch-nonworkingtime');
    const firstDay = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index="6"]')[0],
          // Saturday header
    secondDay = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index="7"]')[0],
          // Sunday header
    interval = t.query('.b-sch-nonworkingtime[data-id=nonworking-2]')[0],
          // Second interval
    firstDayRect = firstDay.getBoundingClientRect(),
          secondDayRect = secondDay.getBoundingClientRect(),
          intervalRect = interval.getBoundingClientRect();
    t.isApproxPx(firstDayRect.left, intervalRect.left - 1, 'Non working time starts at Sat');
    t.isApproxPx(secondDayRect.right, intervalRect.right - 1, 'Non working time end at Sun');
  });
  t.it('Weekends should be configurable. Weekends are Fri - Sat', async t => {
    createScheduler({
      5: true,
      6: true
    });
    await t.waitForSelector('.b-sch-nonworkingtime');
    const firstDay = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index="5"]')[0],
          // Friday header
    secondDay = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index="6"]')[0],
          // Saturday header
    interval = t.query('.b-sch-nonworkingtime[data-id=nonworking-1]')[0],
          // First interval
    firstDayRect = firstDay.getBoundingClientRect(),
          secondDayRect = secondDay.getBoundingClientRect(),
          intervalRect = interval.getBoundingClientRect();
    t.isApproxPx(firstDayRect.left, intervalRect.left - 1, 'Non working time starts at Fri');
    t.isApproxPx(secondDayRect.right, intervalRect.right - 1, 'Non working time end at Sat');
  });
  t.it('Weekends should be configurable. Weekends are Sun - Mon', async t => {
    createScheduler({
      0: true,
      1: true
    });
    await t.waitForSelector('.b-sch-nonworkingtime');
    const firstDay = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index="0"]')[0],
          // Sunday header
    secondDay = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index="1"]')[0],
          // Monday header
    interval = t.query('.b-sch-nonworkingtime[data-id=nonworking-1]')[0],
          // First interval
    firstDayRect = firstDay.getBoundingClientRect(),
          secondDayRect = secondDay.getBoundingClientRect(),
          intervalRect = interval.getBoundingClientRect();
    t.isApproxPx(firstDayRect.left, intervalRect.left - 1, 'Non working time starts at Sun');
    t.isApproxPx(secondDayRect.right, intervalRect.right - 1, 'Non working time end at Mon');
  });
  t.it('Should be possible to update weekends dynamically', async t => {
    createScheduler();
    await t.waitForSelector('.b-sch-nonworkingtime');
    let firstDay = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index="6"]')[0],
        // Saturday header
    secondDay = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index="7"]')[0],
        // Sunday header
    interval = t.query('.b-sch-nonworkingtime[data-id=nonworking-2]')[0],
        // Second interval
    firstDayRect = firstDay.getBoundingClientRect(),
        secondDayRect = secondDay.getBoundingClientRect(),
        intervalRect = interval.getBoundingClientRect();
    t.isApproxPx(firstDayRect.left, intervalRect.left - 1, 'Non working time starts at Sat');
    t.isApproxPx(secondDayRect.right, intervalRect.right - 1, 'Non working time end at Sun');
    LocaleManager.locale.DateHelper.nonWorkingDays = {};
    LocaleManager.applyLocale(LocaleManager.locale.localeName, true);
    await t.waitForSelectorNotFound('.b-sch-nonworkingtime');
    LocaleManager.locale.DateHelper.nonWorkingDays = {
      0: true,
      1: true
    };
    LocaleManager.applyLocale(LocaleManager.locale.localeName, true);
    await t.waitForSelector('.b-sch-nonworkingtime');
    firstDay = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index="0"]')[0]; // Sunday header

    secondDay = t.query('.b-sch-header-row-1 .b-sch-header-timeaxis-cell[data-tick-index="1"]')[0]; // Monday header

    interval = t.query('.b-sch-nonworkingtime[data-id=nonworking-1]')[0]; // First interval

    firstDayRect = firstDay.getBoundingClientRect();
    secondDayRect = secondDay.getBoundingClientRect();
    intervalRect = interval.getBoundingClientRect();
    t.isApproxPx(firstDayRect.left, intervalRect.left - 1, 'Non working time starts at Sun');
    t.isApproxPx(secondDayRect.right, intervalRect.right - 1, 'Non working time end at Mon');
  }); // https://github.com/bryntum/support/issues/2788

  t.it('Should be possible to define at what level nonworking time elements stop being rendered', async t => {
    scheduler = t.getScheduler({
      startDate: new Date(2018, 1, 1),
      endDate: new Date(2019, 0, 1),
      viewPreset: 'weekAndDayLetter',
      features: {
        nonWorkingTime: {
          maxTimeAxisUnit: 'month',
          hideRangesOnZooming: false
        }
      }
    });
    await t.waitForSelector('.b-sch-nonworkingtime');
    const count = t.query('.b-sch-nonworkingtime').length;
    scheduler.viewPreset = 'monthAndYear';
    await t.waitForSelector('.b-sch-nonworkingtime');
    t.isGreater(t.query('.b-sch-nonworkingtime').length, count, 'More ranges rendered');
    scheduler.viewPreset = 'year';
    t.selectorNotExists('.b-sch-nonworkingtime', 'Ranges hidden');
  }); // https://github.com/bryntum/support/issues/2771

  t.it('Should work in non-english locale', async t => {
    scheduler = t.getScheduler({
      startDate: new Date(2018, 1, 1),
      endDate: new Date(2018, 1, 15),
      viewPreset: 'weekAndDayLetter',
      height: 300,
      features: {
        nonWorkingTime: true
      }
    });
    await t.waitForSelector('.b-sch-header-timeaxis-cell[data-tick-index="1"]:contains(M)');
    await t.waitForSelector('.b-sch-nonworkingtime');
    t.applyLocale('Ru'); // Non-working time generates new calendar intervals, so need to wait when propagation is finished

    await scheduler.project.commitAsync();
    await t.waitForSelector(`.b-sch-header-timeaxis-cell[data-tick-index="1"]:contains(${BrowserHelper.isSafari ? 'П' : 'п'})`);
    await t.waitForSelector('.b-sch-nonworkingtime');
    t.applyLocale('En');
    LocaleManager.locale = window.bryntum.locales.En; // Non-working time generates new calendar intervals, so need to wait when propagation is finished

    await scheduler.project.commitAsync();
    await t.waitForSelector('.b-sch-header-timeaxis-cell[data-tick-index="1"]:contains(M)');
    await t.waitForSelector('.b-sch-nonworkingtime');
  });
});