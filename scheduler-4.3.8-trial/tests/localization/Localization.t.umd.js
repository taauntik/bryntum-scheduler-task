"use strict";

StartTest(t => {
  function applyLocale(t, name) {
    t.diag(`Applying locale ${name}`);
    return LocaleManager.locale = window.bryntum.locales[name];
  }

  Object.assign(window, {
    Scheduler,
    EventStore,
    ResourceStore,
    DependencyStore
  });
  let scheduler;
  t.beforeEach(t => {
    scheduler && scheduler.destroy();
    scheduler = null;
  });
  t.it('Should update event editor date pickers weekStartDay on switching locales', t => {
    scheduler = t.getScheduler({
      features: {
        eventTooltip: false,
        eventEdit: true // is enabled by default already, but in case we change our minds...

      }
    });
    t.chain({
      waitForRowsVisible: scheduler
    }, async () => {
      const locale = applyLocale(t, 'En');
      t.is(locale.DateHelper.weekStartDay, 0, 'English week starts from Sunday');
    }, {
      doubleClick: '.b-sch-event'
    }, {
      click: '.b-pickerfield[data-ref="startDateField"] .b-icon-calendar'
    }, {
      waitForSelector: '.b-calendar-day-header[data-column-index="0"][data-cell-day="0"]',
      desc: 'Start date: Week starts with correct day'
    }, {
      type: '[ESC]'
    }, {
      click: '.b-pickerfield[data-ref="endDateField"] .b-icon-calendar'
    }, {
      waitForSelector: '.b-calendar-day-header[data-column-index="0"][data-cell-day="0"]',
      desc: 'End date: Week starts with correct day'
    }, {
      type: '[ESC]'
    }, async () => {
      const locale = applyLocale(t, 'Ru');
      t.is(locale.DateHelper.weekStartDay, 1, 'Russian week starts from Monday');
    }, {
      click: '.b-pickerfield[data-ref="startDateField"] .b-icon-calendar'
    }, {
      waitForSelector: '.b-calendar-day-header[data-column-index="0"][data-cell-day="1"]',
      desc: 'Start date: Week starts with correct day'
    }, {
      type: '[ESC]'
    }, {
      click: '.b-pickerfield[data-ref="endDateField"] .b-icon-calendar'
    }, {
      waitForSelector: '.b-calendar-day-header[data-column-index="0"][data-cell-day="1"]',
      desc: 'End date: Week starts with correct day'
    });
  });
  t.it('Should update topDateFormat for dayAndWeek preset on switching locales', t => {
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek'
    }); // new Intl.DateTimeFormat('ru', { month : 'short' }).format(new Date(2011, 0, 1))
    // Chrome => "янв."
    // IE11   => "янв"

    const ruDateText = BrowserHelper.isIE11 ? 'нед.01 янв 2011' : 'нед.01 янв. 2011';
    t.chain({
      waitForRowsVisible: scheduler
    }, async () => {
      applyLocale(t, 'En');
    }, {
      waitForSelector: '.b-sch-header-timeaxis-cell[data-tick-index="0"]:contains(w.01 Jan 2011)',
      desc: 'English topDateFormat is correct for dayAndWeek preset'
    }, async () => {
      applyLocale(t, 'Ru');
    }, {
      waitForSelector: `.b-sch-header-timeaxis-cell[data-tick-index="0"]:contains(${ruDateText})`,
      desc: 'Russian topDateFormat is correct for dayAndWeek preset'
    });
  });
  t.it('Should update topDateFormat for dayAndWeek and weekAndDay presets on switching locales', t => {
    const customEnLocale = LocaleHelper.mergeLocales(window.bryntum.locales.En, {
      PresetManager: {
        dayAndWeek: {
          topDateFormat: 'MMMM YYYY'
        },
        weekAndDay: {
          topDateFormat: 'YYYY MMM DD'
        }
      }
    });
    LocaleHelper.publishLocale('En-Custom', customEnLocale);
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek'
    });
    t.chain({
      waitForRowsVisible: scheduler
    }, () => {
      applyLocale(t, 'En');
      t.selectorExists('.b-sch-header-timeaxis-cell[data-tick-index="0"]:contains(w.01 Jan 2011)', 'English topDateFormat is correct for dayAndWeek preset');
      applyLocale(t, 'En-Custom');
      t.selectorExists('.b-sch-header-timeaxis-cell[data-tick-index="0"]:contains(January 2011)', 'English Custom topDateFormat is correct for dayAndWeek preset');
      scheduler.viewPreset = 'weekAndDay';
      applyLocale(t, 'En');
      t.selectorExists('.b-sch-header-timeaxis-cell[data-tick-index="0"]:contains(2011 January 02)', 'English topDateFormat is correct for weekAndDay preset');
      applyLocale(t, 'En-Custom');
      t.selectorExists('.b-sch-header-timeaxis-cell[data-tick-index="0"]:contains(2011 Jan 02)', 'English Custom topDateFormat is correct for weekAndDay preset');
    });
  }); // https://github.com/bryntum/support/issues/2770

  t.it('Should update column lines when changing locale', async t => {
    scheduler = await t.getSchedulerAsync({
      viewPreset: 'weekAndDayLetter',
      startDate: '2011-01-03',
      endDate: '2011-01-29',
      tickSize: 50
    });
    applyLocale(t, 'En');
    await t.waitForAnimationFrame();
    t.is(scheduler.timeAxis.first.startDate.getDay(), 0, 'Week starts on Sunday');
    t.isApprox(DomHelper.getTranslateX(t.query('[data-line="major-1"]')[0]), 7 * scheduler.tickSize, 'First major after 7 ticks');
    applyLocale(t, 'SvSE');
    await t.waitForAnimationFrame();
    t.is(scheduler.timeAxis.first.startDate, new Date(2011, 0, 2), 'Same tick setup after locale changed');
    t.is(scheduler.timeAxis.weekStartDay, 1, 'Time axis reports week starts on Monday');
    t.isApprox(DomHelper.getTranslateX(t.query('[data-line="major-1"]')[0]), scheduler.tickSize, 'First major now after 1 tick');
  });
});