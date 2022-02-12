"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    var _scheduler, _scheduler$destroy;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : (_scheduler$destroy = _scheduler.destroy) === null || _scheduler$destroy === void 0 ? void 0 : _scheduler$destroy.call(_scheduler);
  }); // https://github.com/bryntum/support/issues/2958

  t.it('Should fit week days on week buttons', async t => {
    const initialTheme = DomHelper.getThemeInfo().name,
          checkEllipsis = () => {
      scheduler.features.eventEdit.recurrenceEditor.widgetMap.daysButtonField.items.forEach(btn => {
        const {
          label: el
        } = btn;
        t.notOk(el.scrollWidth > el.clientWidth, `${btn.text} is visible on week button`);
      });
    };

    scheduler = await t.getSchedulerAsync({
      enableRecurringEvents: true,
      startDate: '2021-05-13',
      features: {
        eventTooltip: false,
        eventEdit: true
      },
      events: [{
        id: 1,
        name: 'Foo',
        startDate: '2021-05-14',
        endDate: '2021-05-15'
      }, {
        id: 2,
        name: 'Bar',
        startDate: '2021-05-14',
        endDate: '2021-05-15',
        recurrenceRule: 'FREQ=WEEKLY;INTERVAL=2',
        cls: 'sch-event2'
      }],
      resources: [{
        id: 'r1',
        name: 'Resource 1'
      }, {
        id: 'r2',
        name: 'Resource 2'
      }],
      assignments: [{
        id: 1,
        eventId: 1,
        resourceId: 'r1'
      }, {
        id: 2,
        eventId: 2,
        resourceId: 'r1'
      }]
    });
    await t.doubleClick('[data-event-id=2]');
    await t.click('.b-recurrencelegendbutton');
    ['Classic', 'Classic-Light', 'Classic-Dark', 'Material', 'Stockholm'].forEach(theme => {
      t.diag(`Theme ${theme}`);
      DomHelper.setTheme(theme);
      t.applyLocale('Nl');
      checkEllipsis();
      t.applyLocale('Ru');
      checkEllipsis();
      t.applyLocale('SvSE');
      checkEllipsis();
      t.applyLocale('En');
      checkEllipsis();
    });
    DomHelper.setTheme(initialTheme);
  });
});