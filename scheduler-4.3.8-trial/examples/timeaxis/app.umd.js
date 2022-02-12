"use strict";

var {
  Scheduler,
  DateHelper,
  TabPanel
} = bryntum.scheduler;

class SchedulerCustomTimeAxis extends Scheduler {
  // Factoryable type name
  static get type() {
    return 'schedulercustomtimeaxis';
  }

  static get defaultConfig() {
    return {
      eventStyle: 'colored',
      features: {
        sort: 'name',
        eventResize: {
          showExactResizePosition: true
        }
      },
      rowHeight: 60,
      zoomOnTimeAxisDoubleClick: false,
      // Custom preset to display work hours (each hour) below days
      viewPreset: {
        displayDateFormat: 'H:mm',
        tickWidth: 25,
        shiftIncrement: 1,
        shiftUnit: 'WEEK',
        timeResolution: {
          unit: 'MINUTE',
          increment: 60
        },
        headers: [{
          unit: 'DAY',
          align: 'center',
          dateFormat: 'ddd L'
        }, {
          unit: 'HOUR',
          align: 'center',
          dateFormat: 'H'
        }]
      },
      // Custom time axis
      timeAxis: {
        continuous: false,

        generateTicks(start, end, unit, increment) {
          const ticks = [];

          while (start < end) {
            if (unit !== 'hour' || start.getHours() >= 8 && start.getHours() <= 21) {
              ticks.push({
                id: ticks.length + 1,
                startDate: start,
                endDate: DateHelper.add(start, increment, unit)
              });
            }

            start = DateHelper.add(start, increment, unit);
          }

          return ticks;
        }

      },
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }, {
        id: 'r3',
        name: 'Don'
      }, {
        id: 'r4',
        name: 'Karen'
      }, {
        id: 'r5',
        name: 'Doug'
      }, {
        id: 'r6',
        name: 'Peter'
      }, {
        id: 'r7',
        name: 'Fred'
      }, {
        id: 'r8',
        name: 'Lisa'
      }, {
        id: 'r9',
        name: 'Annie'
      }, {
        id: 'r10',
        name: 'Dan'
      }],
      events: [{
        id: 1,
        resourceId: 'r9',
        startDate: '2019-02-11 12:00',
        endDate: '2019-02-11 16:00',
        name: 'Some task',
        eventColor: 'pink'
      }, {
        id: 2,
        resourceId: 'r2',
        startDate: '2019-02-12 08:00',
        endDate: '2019-02-12 14:00',
        name: 'Other task',
        eventColor: 'gray'
      }, {
        id: 3,
        resourceId: 'r10',
        startDate: '2019-02-15 08:00',
        endDate: '2019-02-15 14:00',
        name: 'Important task',
        eventColor: 'orange'
      }],
      // Setup static columns
      columns: [{
        text: 'Name',
        width: 100,
        field: 'name'
      }]
    };
  }

} // Register this widget type with its Factory


SchedulerCustomTimeAxis.initClass();

class SchedulerCustomTimeAxis2 extends Scheduler {
  // Factoryable type name
  static get type() {
    return 'schedulercustomtimeaxis2';
  }

  static get defaultConfig() {
    return {
      eventStyle: 'colored',
      features: {
        sort: 'name',
        stripe: true,
        headerMenu: false,
        eventResize: {
          showExactResizePosition: true
        }
      },
      zoomOnMouseWheel: false,
      zoomOnTimeAxisDoubleClick: false,
      // Custom preset to display work hours below day
      viewPreset: {
        displayDateFormat: 'H:mm',
        shiftIncrement: 1,
        shiftUnit: 'WEEK',
        timeResolution: {
          unit: 'MINUTE',
          increment: 10
        },
        headers: [{
          unit: 'DAY',
          dateFormat: 'ddd D MMM'
        }, {
          unit: 'DAY',

          renderer(start, end, cfg) {
            cfg.headerCellCls = 'sch-hdr-startend';
            return `<span>${DateHelper.format(start, 'H')}</span><span>${DateHelper.format(end, 'H')}</span>`;
          }

        }]
      },
      rowHeight: 60,
      // Custom time axis
      timeAxis: {
        continuous: false,

        generateTicks(start, end, unit, increment) {
          // Use our own custom time intervals for day time-axis
          if (unit === 'day') {
            const ticks = [];
            let intervalEnd;

            while (start < end) {
              if (start.getDay() === 5) {
                // Fridays are lazy days, working 10am - 4pm
                start.setHours(10);
                intervalEnd = DateHelper.add(start, 6, 'h');
              } else {
                start.setHours(8);
                intervalEnd = DateHelper.add(start, 8, 'h');
              }

              ticks.push({
                id: ticks.length + 1,
                startDate: start,
                endDate: intervalEnd
              });
              start = DateHelper.add(start, 1, 'd');
            }

            return ticks;
          }
        }

      },
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }, {
        id: 'r3',
        name: 'Don'
      }, {
        id: 'r4',
        name: 'Karen'
      }, {
        id: 'r5',
        name: 'Doug'
      }, {
        id: 'r6',
        name: 'Peter'
      }, {
        id: 'r7',
        name: 'Fred'
      }, {
        id: 'r8',
        name: 'Lisa'
      }, {
        id: 'r9',
        name: 'Annie'
      }, {
        id: 'r10',
        name: 'Dan'
      }],
      events: [{
        id: 1,
        resourceId: 'r9',
        startDate: '2019-02-11 12:00',
        endDate: '2019-02-11 16:00',
        name: 'Some task',
        eventColor: 'blue'
      }, {
        id: 2,
        resourceId: 'r2',
        startDate: '2019-02-13 08:00',
        endDate: '2019-02-13 14:00',
        name: 'Other task',
        eventColor: 'lime'
      }, {
        id: 3,
        resourceId: 'r10',
        startDate: '2019-02-14 08:00',
        endDate: '2019-02-14 14:00',
        name: 'Important task',
        eventColor: 'red'
      }],
      // Setup static columns
      columns: [{
        text: 'Name',
        width: 100,
        field: 'name'
      }]
    };
  }

  eventRenderer({
    eventRecord
  }) {
    return DateHelper.format(eventRecord.startDate, 'H:mm') + ' - ' + DateHelper.format(eventRecord.endDate, 'H:mm');
  } // Constrain events horizontally within their current day


  getDateConstraints(resourceRecord, eventRecord) {
    if (eventRecord) {
      const {
        timeAxis
      } = this;
      let minDate, maxDate; // DragCreate supplies a date instead of an event record

      if (eventRecord instanceof Date) {
        const date = eventRecord,
              tick = timeAxis.getAt(Math.floor(timeAxis.getTickFromDate(date)));
        minDate = tick.startDate;
        maxDate = tick.endDate;
      } // EventResize & EventDrag
      else {
        const constrainedStartDate = DateHelper.max(eventRecord.startDate, timeAxis.startDate),
              constrainedEndDate = DateHelper.min(eventRecord.endDate, timeAxis.endDate);
        let endDateTick = timeAxis.getTickFromDate(constrainedEndDate); // If event ends at tick end, use prev tick end as constraining date

        if (endDateTick === Math.floor(endDateTick)) {
          endDateTick--;
        }

        const minTickRecord = timeAxis.getAt(Math.floor(timeAxis.getTickFromDate(constrainedStartDate))),
              maxTickRecord = timeAxis.getAt(Math.floor(endDateTick));
        minDate = minTickRecord.startDate;
        maxDate = constrainedEndDate - timeAxis.endDate === 0 ? constrainedEndDate : maxTickRecord.endDate;
      }

      return {
        start: minDate,
        end: maxDate
      };
    }
  }

} // Register this widget type with its Factory


SchedulerCustomTimeAxis2.initClass();

class SchedulerCustomTimeAxis3 extends Scheduler {
  // Factoryable type name
  static get type() {
    return 'schedulercustomtimeaxis3';
  }

  static get defaultConfig() {
    return {
      eventStyle: 'colored',
      features: {
        sort: 'name',
        stripe: true,
        eventResize: {
          showExactResizePosition: true
        }
      },
      zoomOnTimeAxisDoubleClick: false,
      zoomOnMouseWheel: false,
      // Custom preset to display work hours below day
      viewPreset: {
        displayDateFormat: 'H:mm',
        shiftIncrement: 1,
        shiftUnit: 'WEEK',
        timeResolution: {
          unit: 'MINUTE',
          increment: 10
        },
        headers: [{
          unit: 'year',
          // Simplified scenario, assuming view will always just show one US fiscal year
          cellGenerator: (viewStart, viewEnd) => [{
            start: viewStart,
            end: viewEnd,
            header: `Fiscal Year ${viewStart.getFullYear() + 1}`
          }]
        }, {
          unit: 'quarter',

          renderer(start, end) {
            const quarter = Math.floor(start.getMonth() / 3) + 1,
                  fiscalQuarter = quarter === 4 ? 1 : quarter + 1;
            return `FQ${fiscalQuarter} ${start.getFullYear() + (fiscalQuarter === 1 ? 1 : 0)}`;
          }

        }, {
          unit: 'month',
          dateFormat: 'MMM Y'
        }]
      },
      rowHeight: 60,
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }, {
        id: 'r3',
        name: 'Don'
      }, {
        id: 'r4',
        name: 'Karen'
      }, {
        id: 'r5',
        name: 'Doug'
      }, {
        id: 'r6',
        name: 'Peter'
      }, {
        id: 'r7',
        name: 'Fred'
      }, {
        id: 'r8',
        name: 'Lisa'
      }, {
        id: 'r9',
        name: 'Annie'
      }, {
        id: 'r10',
        name: 'Dan'
      }],
      events: [{
        id: 1,
        resourceId: 'r9',
        startDate: '2021-02-11',
        endDate: '2021-02-28',
        name: 'Some task',
        eventColor: 'blue'
      }, {
        id: 2,
        resourceId: 'r2',
        startDate: '2021-08-13',
        endDate: '2021-09-23',
        name: 'Other task',
        eventColor: 'lime'
      }, {
        id: 3,
        resourceId: 'r3',
        startDate: '2021-02-24',
        endDate: '2021-06-24',
        name: 'Important task',
        eventColor: 'red'
      }],
      // Setup static columns
      columns: [{
        text: 'Name',
        width: 100,
        field: 'name'
      }]
    };
  }

}

; // Register this widget type with its Factory

SchedulerCustomTimeAxis3.initClass();

class SchedulerFilterableTimeAxis extends Scheduler {
  // Factoryable type name
  static get type() {
    return 'schedulerfilterabletimeaxis';
  }

  static get configurable() {
    return {
      tbar: [{
        type: 'buttonGroup',
        color: 'b-orange',
        toggleGroup: true,
        items: [{
          type: 'button',
          text: 'No filter',
          onClick: 'up.onClearFilterClick',
          pressed: true
        }, {
          type: 'button',
          text: 'Only weekdays',
          onClick: 'up.onWeekdaysClick'
        }, {
          type: 'button',
          text: 'Only weekends',
          onClick: 'up.onWeekendsClick'
        }, {
          type: 'button',
          text: 'Only days with booked events',
          onClick: 'up.onBookedClick'
        }]
      }],
      zoomOnTimeAxisDoubleClick: false,
      features: {
        sort: 'name'
      },
      forceFit: true,
      columns: [{
        text: 'Name',
        width: 100,
        field: 'name'
      }]
    };
  }

  construct(config) {
    const me = this; // Custom preset to display number of events per day in header

    Object.assign(config, {
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }, {
        id: 'r3',
        name: 'Don'
      }, {
        id: 'r4',
        name: 'Karen'
      }, {
        id: 'r5',
        name: 'Doug'
      }, {
        id: 'r6',
        name: 'Peter'
      }, {
        id: 'r7',
        name: 'Fred'
      }, {
        id: 'r8',
        name: 'Lisa'
      }, {
        id: 'r9',
        name: 'Annie'
      }, {
        id: 'r10',
        name: 'Dan'
      }],
      events: [{
        id: 1,
        resourceId: 'r9',
        startDate: '2019-02-16 12:00',
        endDate: '2019-02-16 16:00',
        name: 'Some task',
        eventColor: 'pink'
      }, {
        id: 2,
        resourceId: 'r2',
        startDate: '2019-02-10 08:00',
        endDate: '2019-02-10 14:00',
        name: 'Other task',
        eventColor: 'gray'
      }, {
        id: 3,
        resourceId: 'r10',
        startDate: '2019-02-15 08:00',
        endDate: '2019-02-15 14:00',
        name: 'Important task',
        eventColor: 'orange'
      }],
      viewPreset: {
        tickWidth: 20,
        displayDateFormat: 'L',
        shiftUnit: 'WEEK',
        shiftIncrement: 1,
        defaultSpan: 10,
        timeResolution: {
          unit: 'HOUR',
          increment: 6
        },
        headers: [{
          unit: 'WEEK',
          dateFormat: 'ddd D MMM YYYY'
        }, {
          unit: 'DAY',
          align: 'center',
          dateFormat: 'd1'
        }, {
          unit: 'DAY',
          align: 'center',

          renderer(start, end, config, index) {
            return me.eventStore.getEvents({
              startDate: start,
              endDate: end
            }).length;
          }

        }]
      }
    });
    super.construct(config); // Refresh headers on changes to the eventStore, to show the amount of tasks per day

    me.eventStore.on('change', () => {
      me.timeAxisColumn.refreshHeader();
    });
  }

  eventRenderer({
    eventRecord
  }) {
    return DateHelper.format(eventRecord.startDate, 'L');
  } //region eventlisteners


  onClearFilterClick() {
    this.timeAxis.clearFilters();
  }

  onWeekdaysClick() {
    this.timeAxis.filterBy(tick => tick.startDate.getDay() !== 6 && tick.startDate.getDay() !== 0);
  }

  onWeekendsClick() {
    this.timeAxis.filterBy(tick => tick.startDate.getDay() === 6 || tick.startDate.getDay() === 0);
  }

  onBookedClick() {
    this.timeAxis.filterBy(tick => {
      return this.eventStore.query(eventRecord => {
        return DateHelper.intersectSpans(eventRecord.startDate, eventRecord.endDate, tick.startDate, tick.endDate);
      }).length > 0;
    });
  } //endregion


} // Register this widget type with its Factory


SchedulerFilterableTimeAxis.initClass();

const DH = DateHelper,
      sleepingEmoji = '\u{1F634}',
      eatingEmoji = '\u{1F96A}',
      startTime = 7,
      lunchTime = 11,
      endTime = 16,
      // 11:00 - 12:00 lunch time
isLunch = date => date.getHours() === lunchTime,
      // 7:00 - 11:00 && 12:00 - 16:00 working time
isWorkingTime = date => !isLunch(date) && date.getHours() >= startTime && date.getHours() < endTime;

class SchedulerCompressedTimeAxis extends Scheduler {
  // Factoryable type name
  static get type() {
    return 'schedulercompressedtimeaxis';
  }

  static get defaultConfig() {
    return {
      eventStyle: 'colored',
      features: {
        sort: 'name',
        stripe: true,
        eventResize: {
          showExactResizePosition: true
        }
      },
      zoomOnTimeAxisDoubleClick: false,
      zoomOnMouseWheel: false,
      viewPreset: {
        displayDateFormat: 'H:mm',
        tickWidth: 40,
        shiftIncrement: 1,
        shiftUnit: 'DAY',
        timeResolution: {
          unit: 'MINUTE',
          increment: 30
        },
        headers: [{
          unit: 'DAY',
          align: 'center',
          dateFormat: 'ddd L'
        }, {
          unit: 'MINUTE',
          align: 'center',
          increment: 30,
          renderer: date => isWorkingTime(date) ? DH.format(date, 'H:mm') : isLunch(date) ? eatingEmoji : sleepingEmoji
        }]
      },
      timeAxis: {
        continuous: false,

        generateTicks(start, end, unit, increment) {
          // Use our own custom time intervals for minute time-axis
          if (unit === 'minute') {
            const // add early morning
            ticks = [{
              startDate: start,
              endDate: DH.add(start, startTime, 'hours')
            }]; // generate the 1st half of the day

            for (let date = ticks[0].endDate; date.getHours() < lunchTime;) {
              const tickEnd = DH.add(date, 30, 'minute');
              ticks.push({
                startDate: date,
                endDate: tickEnd
              });
              date = tickEnd;
            } // add lunch


            const lunchStart = ticks[ticks.length - 1].endDate;
            ticks.push({
              startDate: lunchStart,
              endDate: DH.add(lunchStart, 1, 'hour')
            }); // generate the 2nd half of the day

            for (let date = ticks[ticks.length - 1].endDate; date.getHours() < endTime;) {
              const tickEnd = DH.add(date, 30, 'minute');
              ticks.push({
                startDate: date,
                endDate: tickEnd
              });
              date = tickEnd;
            } // add the rest of the day


            ticks.push({
              startDate: ticks[ticks.length - 1].endDate,
              endDate: end
            });
            return ticks;
          }
        }

      },
      rowHeight: 60,
      resources: [{
        id: 'r1',
        name: 'Mike'
      }, {
        id: 'r2',
        name: 'Linda'
      }, {
        id: 'r3',
        name: 'Don'
      }, {
        id: 'r4',
        name: 'Karen'
      }, {
        id: 'r5',
        name: 'Doug'
      }, {
        id: 'r6',
        name: 'Peter'
      }, {
        id: 'r7',
        name: 'Fred'
      }, {
        id: 'r8',
        name: 'Lisa'
      }, {
        id: 'r9',
        name: 'Annie'
      }, {
        id: 'r10',
        name: 'Dan'
      }],
      events: [{
        id: 1,
        resourceId: 'r9',
        startDate: '2020-02-20 06:30',
        endDate: '2020-02-20 08:30',
        name: 'Morning task',
        eventColor: 'blue'
      }, {
        id: 2,
        resourceId: 'r2',
        startDate: '2020-02-20 10:00',
        endDate: '2020-02-20 13:00',
        name: 'No lunch task',
        eventColor: 'lime'
      }, {
        id: 3,
        resourceId: 'r3',
        startDate: '2020-02-20 17:00',
        endDate: '2020-02-20 20:00',
        name: 'Night task',
        eventColor: 'red'
      }, {
        id: 4,
        resourceId: 'r5',
        startDate: '2020-02-20 11:30',
        endDate: '2020-02-20 20:00',
        name: 'After lunch overtime',
        eventColor: 'orange'
      }],
      // Setup static columns
      columns: [{
        text: 'Name',
        width: 100,
        field: 'name'
      }]
    };
  }

}

; // Register this widget type with its Factory

SchedulerCompressedTimeAxis.initClass();
const tabPanel = new TabPanel({
  appendTo: 'container',
  items: [{
    title: 'Custom timeaxis #1',
    ref: 'custom1',
    type: 'schedulercustomtimeaxis',
    startDate: new Date(2019, 1, 11),
    endDate: new Date(2019, 1, 16)
  }, {
    title: 'Custom timeaxis #2',
    ref: 'custom2',
    type: 'schedulercustomtimeaxis2',
    startDate: new Date(2019, 1, 11),
    endDate: new Date(2019, 1, 16)
  }, {
    title: 'Filterable timeaxis',
    ref: 'filterable',
    type: 'schedulerfilterabletimeaxis',
    startDate: new Date(2019, 1, 10),
    endDate: new Date(2019, 1, 17)
  }, {
    title: 'Custom header tick spans',
    ref: 'custom3',
    type: 'schedulercustomtimeaxis3',
    startDate: new Date(2020, 9, 1),
    endDate: new Date(2021, 9, 1)
  }, {
    title: 'Compressed non-working time',
    ref: 'compressed',
    type: 'schedulercompressedtimeaxis',
    startDate: new Date(2020, 1, 20),
    endDate: new Date(2020, 1, 21)
  }]
});