"use strict";

StartTest(t => {
  let dialog, event, recurrence;
  const allFields = ['frequencyField', 'intervalField', 'daysButtonField', 'monthDaysRadioField', 'monthDaysButtonField', 'monthsButtonField', 'positionAndDayRadioField', 'positionsCombo', 'daysCombo', 'stopRecurrenceField', 'countField', 'endDateField'];
  t.beforeEach(() => {
    dialog && dialog.destroy();
    dialog = null;
    event = null;
    recurrence = null;
  });

  function setup(config) {
    config = config || {};
    event = new EventModel(Object.assign({
      id: 'event1',
      startDate: new Date(2018, 5, 14),
      endDate: new Date(2018, 5, 15),
      name: 'Foo'
    }, config.event));
    recurrence = new RecurrenceModel(Object.assign({
      id: 'recurrence1',
      timeSpan: event
    }, config.recurrence));
    dialog = new RecurrenceEditor(Object.assign({
      autoClose: false,
      rootElement: document.body
    }, config.dialog)); // loading record

    dialog.record = recurrence;
    dialog.show();
  }

  function checkAvailability(t, visibleFields, enabledFields) {
    visibleFields = visibleFields || []; // only visible fields should be enabled by default

    enabledFields = enabledFields || visibleFields.slice();
    const {
      widgetMap
    } = dialog,
          hiddenFields = allFields.filter(x => !visibleFields.includes(x)),
          disabledFields = allFields.filter(x => !enabledFields.includes(x));
    t.diag('Check that fields are visible');
    visibleFields.forEach(field => t.ok(widgetMap[field].isVisible, `Field ${field} is visible`));
    t.diag('Check that fields are enabled');
    enabledFields.forEach(field => t.notOk(widgetMap[field].disabled, `Field ${field} is enabled`));
    t.diag('Check that fields are hidden');
    hiddenFields.forEach(field => t.notOk(widgetMap[field].isVisible, `Field ${field} is hidden`));
    t.diag('Check that fields are disabled');
    disabledFields.forEach(field => t.ok(widgetMap[field].disabled, `Field ${field} is disabled`));
  }

  t.it('Init dialog with default recurrence', t => {
    setup();
    t.is(dialog.widgetMap.frequencyField.value, 'DAILY', 'Default frequencyField value is correct');
    t.is(dialog.widgetMap.intervalField.value, 1, 'Default intervalField value is correct');
    t.is(dialog.widgetMap.stopRecurrenceField.value, 'never', 'Default stopRecurrenceField value is correct');
    checkAvailability(t, ['frequencyField', 'intervalField', 'stopRecurrenceField']);
  });
  t.it('Init dialog with Daily recurrence', t => {
    setup({
      recurrence: {
        frequency: 'DAILY',
        interval: 2,
        count: 3
      }
    });
    t.is(dialog.widgetMap.frequencyField.value, 'DAILY', 'Daily frequencyField value is correct');
    t.is(dialog.widgetMap.intervalField.value, 2, 'Daily intervalField value is correct');
    t.is(dialog.widgetMap.stopRecurrenceField.value, 'count', 'Daily stopRecurrenceField value is correct');
    t.is(dialog.widgetMap.countField.value, 3, 'Daily stop count value is correct');
    checkAvailability(t, ['frequencyField', 'intervalField', 'stopRecurrenceField', 'countField']);
  });
  t.it('Init dialog with Weekly recurrence with no days specified', t => {
    setup({
      recurrence: {
        frequency: 'WEEKLY',
        interval: 3,
        endDate: new Date(2018, 6, 14)
      }
    });
    t.is(dialog.widgetMap.frequencyField.value, 'WEEKLY', 'Weekly frequencyField value is correct');
    t.is(dialog.widgetMap.intervalField.value, 3, 'Weekly intervalField value is correct');
    t.isDeeply(dialog.widgetMap.daysButtonField.value, 'TH', 'Weekly days value is correct (from event start date)');
    t.is(dialog.widgetMap.stopRecurrenceField.value, 'date', 'Weekly stopRecurrenceField value is correct');
    t.is(dialog.widgetMap.endDateField.value, new Date(2018, 6, 14), 'Daily stop date value is correct');
    checkAvailability(t, ['frequencyField', 'intervalField', 'daysButtonField', 'stopRecurrenceField', 'endDateField']);
  });
  t.it('Init dialog with Weekly recurrence', t => {
    setup({
      recurrence: {
        frequency: 'WEEKLY',
        interval: 3,
        days: ['WE', 'MO']
      }
    });
    t.is(dialog.widgetMap.frequencyField.value, 'WEEKLY', 'Weekly frequencyField value is correct');
    t.is(dialog.widgetMap.intervalField.value, 3, 'Weekly intervalField value is correct');
    t.isDeeply(dialog.widgetMap.daysButtonField.value, 'WE,MO', 'Weekly days value is correct');
    t.is(dialog.widgetMap.stopRecurrenceField.value, 'never', 'Weekly stopRecurrenceField value is correct');
    checkAvailability(t, ['frequencyField', 'intervalField', 'daysButtonField', 'stopRecurrenceField']);
  });
  t.it('Init dialog with Monthly recurrence', t => {
    setup({
      recurrence: {
        frequency: 'MONTHLY',
        interval: 4
      }
    });
    t.is(dialog.widgetMap.frequencyField.value, 'MONTHLY', 'Monthly frequencyField value is correct');
    t.is(dialog.widgetMap.intervalField.value, 4, 'Monthly intervalField value is correct');
    t.ok(dialog.widgetMap.monthDaysRadioField.checked, 'Monthly month days radio field is on');
    t.isDeeply(dialog.widgetMap.monthDaysButtonField.value, [14], 'Monthly date value is correct (from event start date)');
    t.notOk(dialog.widgetMap.positionAndDayRadioField.checked, 'Monthly week days radio field is off');
    t.isDeeply(dialog.widgetMap.positionsCombo.value, ['1'], 'Monthly positions combo value is correct');
    t.isDeeply(dialog.widgetMap.daysCombo.value, 'SU,MO,TU,WE,TH,FR,SA', 'Monthly week days combo value is correct');
    t.is(dialog.widgetMap.stopRecurrenceField.value, 'never', 'Monthly stopRecurrenceField value is correct');
    checkAvailability(t, ['frequencyField', 'intervalField', 'monthDaysRadioField', 'monthDaysButtonField', 'positionAndDayRadioField', 'positionsCombo', 'daysCombo', 'stopRecurrenceField'], ['frequencyField', 'intervalField', 'monthDaysRadioField', 'monthDaysButtonField', 'positionAndDayRadioField', 'stopRecurrenceField']);
  });
  t.it('Init dialog with Monthly recurrence with month days specified', t => {
    setup({
      recurrence: {
        frequency: 'MONTHLY',
        interval: 4,
        monthDays: [3, 5]
      }
    });
    t.is(dialog.widgetMap.frequencyField.value, 'MONTHLY', 'Monthly frequencyField value is correct');
    t.is(dialog.widgetMap.intervalField.value, 4, 'Monthly intervalField value is correct');
    t.ok(dialog.widgetMap.monthDaysRadioField.checked, 'Monthly month days radio field is on');
    t.isDeeply(dialog.widgetMap.monthDaysButtonField.value, [3, 5], 'Monthly month days value is correct');
    t.notOk(dialog.widgetMap.positionAndDayRadioField.checked, 'Monthly week days radio field is off');
    t.isDeeply(dialog.widgetMap.positionsCombo.value, ['1'], 'Monthly positions combo value is correct');
    t.isDeeply(dialog.widgetMap.daysCombo.value, 'SU,MO,TU,WE,TH,FR,SA', 'Monthly week days combo value is correct');
    t.is(dialog.widgetMap.stopRecurrenceField.value, 'never', 'Monthly stopRecurrenceField value is correct');
    checkAvailability(t, ['frequencyField', 'intervalField', 'monthDaysRadioField', 'monthDaysButtonField', 'positionAndDayRadioField', 'positionsCombo', 'daysCombo', 'stopRecurrenceField'], ['frequencyField', 'intervalField', 'monthDaysRadioField', 'monthDaysButtonField', 'positionAndDayRadioField', 'stopRecurrenceField']);
  });
  t.it('Init dialog with Monthly recurrence with week days specified', t => {
    setup({
      recurrence: {
        frequency: 'MONTHLY',
        interval: 4,
        days: ['MO', 'TU', 'WE', 'TH', 'FR'],
        positions: [-1]
      }
    });
    t.is(dialog.widgetMap.frequencyField.value, 'MONTHLY', 'Monthly frequencyField value is correct');
    t.is(dialog.widgetMap.intervalField.value, 4, 'Monthly intervalField value is correct');
    t.notOk(dialog.widgetMap.monthDaysRadioField.checked, 'Monthly month days radio field is off');
    t.isDeeply(dialog.widgetMap.monthDaysButtonField.value, [14], 'Monthly date value is correct (from event start date)');
    t.ok(dialog.widgetMap.positionAndDayRadioField.checked, 'Monthly week days radio field is on');
    t.isDeeply(dialog.widgetMap.positionsCombo.value, [-1], 'Monthly position is correct');
    t.isDeeply(dialog.widgetMap.daysCombo.value, 'MO,TU,WE,TH,FR', 'Monthly week days are correct');
    t.is(dialog.widgetMap.stopRecurrenceField.value, 'never', 'Monthly stopRecurrenceField value is correct');
    checkAvailability(t, ['frequencyField', 'intervalField', 'monthDaysRadioField', 'monthDaysButtonField', 'positionAndDayRadioField', 'positionsCombo', 'daysCombo', 'stopRecurrenceField'], ['frequencyField', 'intervalField', 'monthDaysRadioField', 'positionAndDayRadioField', 'positionsCombo', 'daysCombo', 'stopRecurrenceField']);
  });
  t.it('Init dialog with Weekly recurrence and check that Monthly is correct', t => {
    setup({
      recurrence: {
        frequency: 'WEEKLY',
        interval: 4,
        days: ['MO', 'TU', 'WE', 'TH', 'FR'],
        positions: [-1]
      }
    });
    t.chain({
      click: '.b-recurrencefrequencycombo .b-icon'
    }, {
      click: '.b-list-item:textEquals(Monthly)'
    }, next => {
      t.is(dialog.widgetMap.frequencyField.value, 'MONTHLY', 'Monthly frequencyField value is correct');
      t.is(dialog.widgetMap.intervalField.value, 4, 'Monthly intervalField value is correct');
      t.notOk(dialog.widgetMap.monthDaysRadioField.checked, 'Monthly month days radio field is off');
      t.isDeeply(dialog.widgetMap.monthDaysButtonField.value, [14], 'Monthly date value is correct (from event start date)');
      t.ok(dialog.widgetMap.positionAndDayRadioField.checked, 'Monthly week days radio field is on');
      t.isDeeply(dialog.widgetMap.positionsCombo.value, [-1], 'Monthly position is correct');
      t.isDeeply(dialog.widgetMap.daysCombo.value, 'MO,TU,WE,TH,FR', 'Monthly week days are correct');
      t.is(dialog.widgetMap.stopRecurrenceField.value, 'never', 'Monthly stopRecurrenceField value is correct');
      checkAvailability(t, ['frequencyField', 'intervalField', 'monthDaysRadioField', 'monthDaysButtonField', 'positionAndDayRadioField', 'positionsCombo', 'daysCombo', 'stopRecurrenceField'], ['frequencyField', 'intervalField', 'monthDaysRadioField', 'positionAndDayRadioField', 'positionsCombo', 'daysCombo', 'stopRecurrenceField']);
    });
  });
  t.it('Init dialog with Yearly recurrence with no months and no week days specified', t => {
    setup({
      recurrence: {
        frequency: 'YEARLY',
        interval: 5
      }
    });
    t.is(dialog.widgetMap.frequencyField.value, 'YEARLY', 'Yearly frequencyField value is correct');
    t.is(dialog.widgetMap.intervalField.value, 5, 'Yearly intervalField value is correct');
    t.isDeeply(dialog.widgetMap.monthsButtonField.value, [6], 'Yearly month value is correct (from event start date)');
    t.notOk(dialog.widgetMap.positionAndDayRadioField.checked, 'positions checkbox field is off');
    t.isDeeply(dialog.widgetMap.positionsCombo.value, ['1'], 'Monthly positions combo value is correct');
    t.isDeeply(dialog.widgetMap.daysCombo.value, 'SU,MO,TU,WE,TH,FR,SA', 'Monthly week days combo value is correct');
    t.is(dialog.widgetMap.stopRecurrenceField.value, 'never', 'Yearly stopRecurrenceField value is correct');
    checkAvailability(t, ['frequencyField', 'intervalField', 'monthsButtonField', 'positionAndDayRadioField', 'positionsCombo', 'daysCombo', 'stopRecurrenceField'], ['frequencyField', 'intervalField', 'monthsButtonField', 'stopRecurrenceField', 'positionAndDayRadioField']);
  });
  t.it('Init dialog with Yearly recurrence with months specified', t => {
    setup({
      recurrence: {
        frequency: 'YEARLY',
        interval: 5,
        months: [2, 12]
      }
    });
    t.is(dialog.widgetMap.frequencyField.value, 'YEARLY', 'Yearly frequencyField value is correct');
    t.is(dialog.widgetMap.intervalField.value, 5, 'Yearly intervalField value is correct');
    t.isDeeply(dialog.widgetMap.monthsButtonField.value, [2, 12], 'Yearly month value is correct');
    t.notOk(dialog.widgetMap.positionAndDayRadioField.checked, 'positions checkbox field is off');
    t.isDeeply(dialog.widgetMap.positionsCombo.value, ['1'], 'Monthly positions combo value is correct');
    t.isDeeply(dialog.widgetMap.daysCombo.value, 'SU,MO,TU,WE,TH,FR,SA', 'Monthly week days combo value is correct');
    t.is(dialog.widgetMap.stopRecurrenceField.value, 'never', 'Yearly stopRecurrenceField value is correct');
    checkAvailability(t, ['frequencyField', 'intervalField', 'monthsButtonField', 'positionAndDayRadioField', 'positionsCombo', 'daysCombo', 'stopRecurrenceField'], ['frequencyField', 'intervalField', 'monthsButtonField', 'stopRecurrenceField', 'positionAndDayRadioField']);
  });
  t.it('Init dialog with Yearly recurrence with week days specified', t => {
    setup({
      recurrence: {
        frequency: 'YEARLY',
        interval: 5,
        days: ['TH'],
        positions: [2]
      }
    });
    t.is(dialog.widgetMap.frequencyField.value, 'YEARLY', 'Yearly frequencyField value is correct');
    t.is(dialog.widgetMap.intervalField.value, 5, 'Yearly intervalField value is correct');
    t.isDeeply(dialog.widgetMap.monthsButtonField.value, [6], 'Yearly month value is correct (from event start date)');
    t.ok(dialog.widgetMap.positionAndDayRadioField.checked, 'positions checkbox field is on');
    t.isDeeply(dialog.widgetMap.positionsCombo.value, ['2'], 'Monthly positions combo value is correct');
    t.isDeeply(dialog.widgetMap.daysCombo.value, 'TH', 'Monthly week days combo value is correct');
    t.is(dialog.widgetMap.stopRecurrenceField.value, 'never', 'Yearly stopRecurrenceField value is correct');
    checkAvailability(t, ['frequencyField', 'intervalField', 'monthsButtonField', 'positionAndDayRadioField', 'positionsCombo', 'daysCombo', 'stopRecurrenceField']);
  }); // TODO: port

  t.xit('Check values', t => {
    setup();
    t.chain({
      waitForElementVisible: '.b-recurrenceeditor'
    }, next => {
      // simulate the Save button click but without closing the dialog
      dialog.updateRecord();
      t.isDeeply(recurrence.data, {
        id: 'recurrence1',
        frequency: 'DAILY',
        interval: 1,
        count: null,
        endDate: null,
        positions: null,
        days: null,
        monthDays: null,
        months: null
      }, 'Daily data is the same when no changes applied');
      next();
    }, {
      click: '>>stopconditioncombo[fieldLabel=End repeat]'
    }, {
      click: 'stopconditioncombo[fieldLabel=End repeat] boundlist => :textEquals(After)'
    }, {
      type: '5',
      target: '>>numberfield[name=Count]'
    }, function (next) {
      // simulate the Save button click but without closing the dialog
      dialog.updateRecord();
      t.isDeeply(recurrence.getData(), {
        Id: 'recurrence1',
        Frequency: 'DAILY',
        Interval: 1,
        Count: 5,
        EndDate: null,
        Positions: null,
        Days: null,
        MonthDays: null,
        Months: null
      }, 'Daily data is OK when repeat count is set');
      next();
    }, {
      click: '>>combobox[name=Frequency]'
    }, {
      click: 'combobox[name=Frequency] boundlist => :textEquals(Weekly)'
    }, function (next) {
      // simulate the Save button click but without closing the dialog
      dialog.updateRecord();
      t.isDeeply(recurrence.getData(), {
        Id: 'recurrence1',
        Frequency: 'WEEKLY',
        Interval: 1,
        Count: 5,
        EndDate: null,
        Positions: null,
        Days: null,
        MonthDays: null,
        Months: null
      }, 'Weekly data is correct after switching from Daily mode');
      next();
    }, {
      click: '>>button[text=Wed]'
    }, function (next) {
      // simulate the Save button click but without closing the dialog
      dialog.updateRecord();
      t.isDeeply(recurrence.getData(), {
        Id: 'recurrence1',
        Frequency: 'WEEKLY',
        Interval: 1,
        Days: ['TH', 'WE'],
        Count: 5,
        EndDate: null,
        Positions: null,
        MonthDays: null,
        Months: null
      }, 'Weekly data is correct after selected days change');
      next();
    }, {
      click: '>>stopconditioncombo[fieldLabel=End repeat]'
    }, {
      click: 'stopconditioncombo[fieldLabel=End repeat] boundlist => :textEquals(On date)'
    }, {
      type: '2018-07-15',
      target: '>>datefield[name=EndDate]'
    }, function (next) {
      // simulate the Save button click but without closing the dialog
      dialog.updateRecord();
      t.isDeeply(recurrence.getData(), {
        Id: 'recurrence1',
        Frequency: 'WEEKLY',
        Interval: 1,
        Days: ['TH', 'WE'],
        EndDate: new Date(2018, 6, 15),
        Count: null,
        Positions: null,
        MonthDays: null,
        Months: null
      }, 'Weekly data is correct after end date change');
      next();
    }, {
      click: '>>combobox[name=Frequency]'
    }, {
      click: 'combobox[name=Frequency] boundlist => :textEquals(Monthly)'
    }, {
      click: '>>button[text=12]'
    }, {
      click: 'numberfield[name=Interval] => .x-form-spinner-up'
    }, {
      click: '>>stopconditioncombo[fieldLabel=End repeat]'
    }, {
      click: '>>stopconditioncombo[fieldLabel=End repeat] boundlist => :textEquals(Never)'
    }, function (next) {
      // simulate the Save button click but without closing the dialog
      dialog.updateRecord();
      t.isDeeply(recurrence.getData(), {
        Id: 'recurrence1',
        Frequency: 'MONTHLY',
        Interval: 2,
        MonthDays: ['14', '12'],
        Days: null,
        EndDate: null,
        Count: null,
        Positions: null,
        Months: null
      }, 'Monthly data is correct after changing interval, month days and removing stop date');
      next();
    }, {
      click: '>>combobox[name=Frequency]'
    }, {
      click: 'combobox[name=Frequency] boundlist => :textEquals(Yearly)'
    }, {
      click: '>>button[text=Jul]'
    }, {
      click: '>>button[text=Jun]'
    }, {
      click: '>>checkboxfield[inputType=checkbox]'
    }, {
      click: '>>positionscombobox[name=Positions]'
    }, {
      click: 'positionscombobox[name=Positions] boundlist => :textEquals(last)'
    }, {
      click: '>>dayscombo[name=Days]'
    }, {
      click: '>>dayscombo[name=Days] boundlist => :textEquals(weekday)'
    }, function (next) {
      // simulate the Save button click but without closing the dialog
      dialog.updateRecord();
      t.isDeeply(recurrence.getData(), {
        Id: 'recurrence1',
        Frequency: 'YEARLY',
        Interval: 2,
        Months: [7],
        Positions: [-1],
        Days: ['MO', 'TU', 'WE', 'TH', 'FR'],
        MonthDays: null,
        EndDate: null,
        Count: null
      }, 'Yearly data is correct after changing month, setting position and week days');
      next();
    });
  });
});