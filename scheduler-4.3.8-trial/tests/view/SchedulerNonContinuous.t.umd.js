"use strict";

StartTest(t => {
  let scheduler;

  async function getScheduler(config = {}) {
    scheduler = await t.getSchedulerAsync(Object.assign({
      width: 1000,
      enableEventAnimations: false,
      columns: [],
      timeAxis: {
        continuous: false,

        generateTicks(start, end, unit, increment) {
          const ticks = [];

          while (start < end) {
            if (start.getDay() % 2 === 0) {
              ticks.push({
                startDate: start,
                endDate: DateHelper.add(start, increment, unit)
              });
            }

            start = DateHelper.add(start, increment, unit);
          }

          return ticks;
        }

      }
    }, config));
  }

  function getBox(id) {
    const el = document.querySelector(`[data-event-id="${id}"]`);
    return el && el.getBoundingClientRect();
  }

  function assertLayout(t, id, x, width) {
    const box = getBox(id);
    t.isApprox(box.left, x, 1, id + ' has correct x');
    t.isApprox(box.width, width, 1, id + ' has correct width');
  }

  t.beforeEach(() => scheduler && !scheduler.isDestroyed && scheduler.destroy());
  t.it('Should render correctly with non-continuous timeaxis', async t => {
    await getScheduler();
    const topHeaders = Array.from(document.querySelectorAll('.b-sch-header-row-0 .b-sch-header-timeaxis-cell'));
    const middleHeaders = Array.from(document.querySelectorAll('.b-sch-header-row-1 .b-sch-header-timeaxis-cell'));
    const eventBoxes = Array.from(document.querySelectorAll('.b-sch-event')).map(el => el.getBoundingClientRect());
    t.is(topHeaders.length, 2, 'Correct top header count');
    t.is(middleHeaders.length, 5, 'Correct middle header count');
    t.isApprox(scheduler.tickSize, 200, 1, 'Correct tickSize'); // 1000 / 5

    t.isApprox(topHeaders[0].offsetWidth, 600, 1, 'First top header has correct width');
    t.isApprox(topHeaders[1].offsetWidth, 400, 1, 'Second top header has correct width');
    middleHeaders.forEach(element => {
      t.isApprox(element.offsetWidth, 200, 1, 'Middle header has correct width');
    });
    t.isApprox(eventBoxes[0].left, 0, 1, 'Correct event x');
    t.isApprox(eventBoxes[1].left, 200, 1, 'Correct event x');
    t.isApprox(eventBoxes[2].left, 200, 1, 'Correct event x');
    t.isApprox(eventBoxes[3].left, 400, 1, 'Correct event x');
    t.isApprox(eventBoxes[4].left, 400, 1, 'Correct event x');
    t.isApprox(eventBoxes[0].width, 200, 1, 'Correct event width');
    t.isApprox(eventBoxes[1].width, 200, 1, 'Correct event width');
    t.isApprox(eventBoxes[2].width, 200, 1, 'Correct event width');
    t.isApprox(eventBoxes[3].width, 200, 1, 'Correct event width');
    t.isApprox(eventBoxes[4].width, 400, 1, 'Correct event width');
  });
  t.it('Should redraw correctly on CRUD', async t => {
    await getScheduler();
    scheduler.eventStore.first.startDate = new Date(2011, 0, 8, 12);
    await scheduler.eventStore.getAt(1).setStartDate(new Date(2011, 0, 4), false);
    scheduler.eventStore.getAt(2).endDate = new Date(2011, 0, 11, 12); // Setting endDate now keeps duration

    await t.waitForProjectReady();
    const eventBoxes = Array.from(document.querySelectorAll('.b-sch-event')).map(el => el.getBoundingClientRect());
    t.isApprox(eventBoxes[0].left, 500, 1, 'Correct event x');
    t.isApprox(eventBoxes[1].left, 0, 1, 'Correct event x');
    t.isApprox(eventBoxes[2].left, 200, 1, 'Correct event x');
    t.isApprox(eventBoxes[0].width, 300, 1, 'Correct event width');
    t.isApprox(eventBoxes[1].width, 400, 1, 'Correct event width');
    t.isApprox(eventBoxes[2].width, 700, 1, 'Correct event width');
  });
  t.it('Should handle timeAxis#include#day for "smaller" ticks, minuteAndHour', async t => {
    async function getSch(config) {
      return getScheduler(Object.assign({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            } // Exclude Su, Sa

          }
        },
        startDate: new Date(2019, 0, 27),
        endDate: new Date(2019, 0, 28, 4),
        viewPreset: 'minuteAndHour'
      }, config));
    }

    t.it('Should not draw fully excluded events', async t => {
      await getSch({
        events: [{
          id: 'sunday',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2019, 0, 27),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'saturday',
          resourceId: 'r1',
          name: 'Saturday',
          startDate: new Date(2019, 0, 26),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'weekend',
          resourceId: 'r1',
          name: 'Weekend',
          startDate: new Date(2019, 0, 26),
          duration: 48,
          durationUnit: 'h'
        }]
      });
      t.selectorNotExists('.b-sch-event', 'No event elements found');
    });
    t.it('Should draw partially excluded events', async t => {
      await getSch({
        events: [{
          id: 'sunday',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2019, 0, 27),
          duration: 25,
          durationUnit: 'h'
        }]
      });
      t.selectorExists('.b-sch-event', 'Event element found');
    });
  });
  t.it('Should handle timeAxis#include#hour for "smaller" ticks, minuteAndHour', t => {
    async function getSch(config) {
      return getScheduler(Object.assign({
        timeAxis: {
          include: {
            hour: {
              from: 10,
              to: 14
            }
          }
        },
        startDate: new Date(2019, 0, 28),
        endDate: new Date(2019, 0, 29),
        viewPreset: 'minuteAndHour'
      }, config));
    }

    t.it('Should not draw fully excluded events', async t => {
      await getSch({
        events: [{
          id: 'early',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2019, 0, 28, 4),
          duration: 5,
          durationUnit: 'h'
        }, {
          id: 'late',
          resourceId: 'r1',
          name: 'Saturday',
          startDate: new Date(2019, 0, 28, 14),
          duration: 4,
          durationUnit: 'h'
        }]
      });
      t.selectorNotExists('.b-sch-event', 'No event elements found');
    });
    t.it('Should draw partially excluded events', async t => {
      await getSch({
        events: [{
          id: 'early',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2019, 0, 28, 4),
          duration: 7,
          durationUnit: 'h'
        }]
      });
      t.selectorExists('.b-sch-event', 'Event element found');
    });
  });
  t.it('Should handle timeAxis#include#day for "smaller" ticks, hourAndDay', t => {
    async function getSch(config) {
      return getScheduler(Object.assign({
        startDate: new Date(2019, 0, 26),
        endDate: new Date(2019, 0, 29),
        viewPreset: {
          base: 'hourAndDay',
          tickWidth: 20,
          headers: [{
            unit: 'day',
            align: 'center',
            dateFormat: 'ddd DD/MM' //Mon 01/10

          }, {
            unit: 'hour',
            align: 'center',
            dateFormat: 'HH'
          }]
        }
      }, config));
    }

    t.it('Should not draw fully excluded events', async t => {
      await getSch({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            } // Exclude Su, Sa

          }
        },
        events: [{
          id: 'sunday',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2019, 0, 27),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'saturday',
          resourceId: 'r1',
          name: 'Saturday',
          startDate: new Date(2019, 0, 26),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'weekend',
          resourceId: 'r1',
          name: 'Weekend',
          startDate: new Date(2019, 0, 26),
          duration: 48,
          durationUnit: 'h'
        }]
      });
      t.selectorNotExists('.b-sch-event', 'No event elements found');
    });
    t.it('Should draw partially excluded events', async t => {
      await getSch({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            } // Exclude Su, Sa

          }
        },
        events: [{
          id: 'sunday',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2019, 0, 27),
          duration: 36,
          durationUnit: 'h'
        }]
      });
      t.selectorExists('.b-sch-event', 'Event element found');
    });
  });
  t.it('Should handle timeAxis#include#day for "smaller" ticks, weekAndDay', t => {
    async function getSch(config) {
      return getScheduler(Object.assign({
        startDate: new Date(2019, 0, 21),
        endDate: new Date(2019, 1, 1),
        viewPreset: 'weekAndDay'
      }, config));
    }

    t.it('Should not draw fully excluded events', async t => {
      await getSch({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            } // Exclude Su, Sa

          }
        },
        events: [{
          id: 'sunday',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2019, 0, 27),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'saturday',
          resourceId: 'r1',
          name: 'Saturday',
          startDate: new Date(2019, 0, 26),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'weekend',
          resourceId: 'r1',
          name: 'Weekend',
          startDate: new Date(2019, 0, 26),
          duration: 48,
          durationUnit: 'h'
        }]
      });
      t.selectorNotExists('.b-sch-event', 'No event elements found');
    });
    t.it('Should draw partially excluded events', async t => {
      await getSch({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            } // Exclude Su, Sa

          }
        },
        events: [{
          id: 'sundayToMonday',
          resourceId: 'r1',
          name: 'Su-Mo',
          startDate: new Date(2019, 0, 27),
          duration: 48,
          durationUnit: 'h'
        }, {
          id: 'fridayToTuesday',
          resourceId: 'r1',
          name: 'Fr-Tu',
          startDate: new Date(2019, 0, 25),
          duration: 5,
          durationUnit: 'd'
        }]
      });
      assertLayout(t, 'sundayToMonday', 500, 100);
      assertLayout(t, 'fridayToTuesday', 400, 300);
    }); // No need to test drawing within actual ticks here, that is made sure to work elsewhere :)
  });
  t.it('Should handle timeAxis#include#day for "larger" ticks', async t => {
    t.it('Should not draw fully excluded events', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            }
          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'sunday',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2011, 0, 2),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'saturday',
          resourceId: 'r1',
          name: 'Saturday',
          startDate: new Date(2011, 0, 8),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'weekend',
          resourceId: 'r1',
          name: 'Weekend',
          startDate: new Date(2011, 0, 8),
          duration: 48,
          durationUnit: 'h'
        }]
      });
      t.selectorNotExists('.b-sch-event', 'No event elements found');
    });
    t.it('Should not draw fully excluded events 2', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 7
            } // Exclude Su

          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'sunday',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2011, 0, 2),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'sunday2',
          resourceId: 'r1',
          name: 'Sunday 2',
          startDate: new Date(2011, 0, 2, 12),
          duration: 8,
          durationUnit: 'h'
        }]
      });
      t.selectorNotExists('.b-sch-event', 'No event elements found');
    });
    t.it('Should not draw fully excluded events 2', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            day: {
              from: 0,
              to: 6
            } // Exclude Sa

          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'saturday',
          resourceId: 'r1',
          name: 'Saturday',
          startDate: new Date(2011, 0, 8),
          duration: 24,
          durationUnit: 'h'
        } //{ id : 'saturday2', resourceId : 'r1', name : 'Saturday 2', startDate : new Date(2011, 0, 8, 12), duration : 8, durationUnit : 'h' }
        ]
      });
      t.selectorNotExists('.b-sch-event', 'No event elements found');
    });
    t.it('Should draw partially excluded events', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            } // Exclude Su, Sa

          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'sundayToMonday',
          resourceId: 'r1',
          name: 'Sunday-Monday',
          startDate: new Date(2011, 0, 2),
          duration: 36,
          durationUnit: 'h'
        }, {
          id: 'saturdayToMonday',
          resourceId: 'r1',
          name: 'Saturday-Monday',
          startDate: new Date(2011, 0, 8),
          duration: 72,
          durationUnit: 'h'
        }]
      });
      assertLayout(t, 'sundayToMonday', 0, 50);
      assertLayout(t, 'saturdayToMonday', 500, 100);
    });
    t.it('Should draw partially excluded events 2', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 7
            } // Exclude Su

          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'sundayToMonday',
          resourceId: 'r1',
          name: 'Sunday-Monday',
          startDate: new Date(2011, 0, 2),
          duration: 36,
          durationUnit: 'h'
        }, {
          id: 'saturdayToMonday',
          resourceId: 'r1',
          name: 'Saturday-Monday',
          startDate: new Date(2011, 0, 8),
          duration: 72,
          durationUnit: 'h'
        }, {
          id: 'saturday',
          resourceId: 'r1',
          name: 'Saturday',
          startDate: new Date(2011, 0, 8),
          duration: 24,
          durationUnit: 'h'
        }]
      });
      assertLayout(t, 'sundayToMonday', 0, 42);
      assertLayout(t, 'saturdayToMonday', 417, 166);
      assertLayout(t, 'saturday', 417, 83);
    });
    t.it('Should draw partially excluded events 3', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            day: {
              from: 0,
              to: 6
            } // Exclude Sa

          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'saturdayToSunday',
          resourceId: 'r1',
          name: 'Saturday-Sunday',
          startDate: new Date(2011, 0, 8),
          duration: 36,
          durationUnit: 'h'
        }, {
          id: 'fridayToSunday',
          resourceId: 'r1',
          name: 'Friday-Sunday',
          startDate: new Date(2011, 0, 7),
          duration: 72,
          durationUnit: 'h'
        }, {
          id: 'sunday',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2011, 0, 9),
          duration: 24,
          durationUnit: 'h'
        }]
      });
      assertLayout(t, 'saturdayToSunday', 500, 42);
      assertLayout(t, 'fridayToSunday', 417, 166);
      assertLayout(t, 'sunday', 500, 83);
    });
    t.it('Should stretch to fill excluded space, Su & Sa', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            } // Exclude Su, Sa

          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'su1',
          resourceId: 'r1',
          name: 'SU1',
          startDate: new Date(2011, 0, 2),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: 'mo1',
          resourceId: 'r1',
          name: 'MO1',
          startDate: new Date(2011, 0, 3),
          duration: 16,
          durationUnit: 'h'
        }, {
          id: 'tu1',
          resourceId: 'r1',
          name: 'TU1',
          startDate: new Date(2011, 0, 4),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'we1',
          resourceId: 'r1',
          name: 'WE1',
          startDate: new Date(2011, 0, 5, 12),
          duration: 6,
          durationUnit: 'h'
        }, {
          id: 'th1',
          resourceId: 'r1',
          name: 'TH1',
          startDate: new Date(2011, 0, 6),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: 'fr1',
          resourceId: 'r1',
          name: 'FR1',
          startDate: new Date(2011, 0, 7),
          duration: 16,
          durationUnit: 'h'
        }, {
          id: 'sa1',
          resourceId: 'r1',
          name: 'SA1',
          startDate: new Date(2011, 0, 8),
          duration: 24,
          durationUnit: 'h'
        }]
      });
      t.notOk(getBox('su1'), 'su1 not shown');
      assertLayout(t, 'mo1', 0, 67);
      assertLayout(t, 'tu1', 100, 100);
      assertLayout(t, 'we1', 250, 25);
      assertLayout(t, 'th1', 300, 33);
      assertLayout(t, 'fr1', 400, 67);
      t.notOk(getBox('sa1'), 'sa1 not shown');
    });
    t.it('Should stretch to fill excluded space, Su, Th, Fr, Sa', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 4
            } // Exclude Su, Th, Fr, Sa -> Showing Mo, Tu, We

          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'm1',
          resourceId: 'r1',
          name: 'M1',
          startDate: new Date(2011, 0, 3),
          duration: 8,
          durationUnit: 'h'
        }, // M
        {
          id: 't1',
          resourceId: 'r1',
          name: 'T1',
          startDate: new Date(2011, 0, 4),
          duration: 24,
          durationUnit: 'h'
        }, // T
        {
          id: 'w1',
          resourceId: 'r1',
          name: 'W1',
          startDate: new Date(2011, 0, 5),
          duration: 16,
          durationUnit: 'h'
        }, // W
        {
          id: 'm2',
          resourceId: 'r1',
          name: 'M2',
          startDate: new Date(2011, 0, 10),
          duration: 24,
          durationUnit: 'h'
        }, // Next M
        {
          id: 't2',
          resourceId: 'r1',
          name: 'T2',
          startDate: new Date(2011, 0, 11),
          duration: 8,
          durationUnit: 'h'
        } // Next T
        ]
      });
      assertLayout(t, 'm1', 0, 56);
      assertLayout(t, 't1', 167, 167);
      assertLayout(t, 'w1', 333, 111);
      assertLayout(t, 'm2', 500, 167);
      assertLayout(t, 't2', 667, 55);
    });
  });
  t.it('Should handle weekStartDay = 1', async t => {
    async function getSch(config) {
      await getScheduler(Object.assign({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            }
          }
        },
        weekStartDay: 1,
        startDate: new Date(2019, 1, 11),
        endDate: new Date(2019, 1, 25),
        viewPreset: 'weekAndMonth'
      }, config));
    }

    t.it('Should not draw fully excluded events', async t => {
      await getSch({
        events: [{
          id: 'sunday',
          resourceId: 'r1',
          name: 'Sunday',
          startDate: new Date(2019, 1, 17),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'saturday',
          resourceId: 'r1',
          name: 'Saturday',
          startDate: new Date(2019, 1, 16),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'weekend',
          resourceId: 'r1',
          name: 'Weekend',
          startDate: new Date(2019, 1, 16),
          duration: 48,
          durationUnit: 'h'
        }]
      });
      t.selectorNotExists('.b-sch-event', 'No event elements found');
    });
    t.it('Should stretch to fill excluded space', async t => {
      await getSch({
        events: [{
          id: 'mo1',
          resourceId: 'r1',
          name: 'MO1',
          startDate: new Date(2019, 1, 11),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'tu1',
          resourceId: 'r1',
          name: 'TU1',
          startDate: new Date(2019, 1, 12),
          duration: 12,
          durationUnit: 'h'
        }, {
          id: 'we1',
          resourceId: 'r1',
          name: 'WE1',
          startDate: new Date(2019, 1, 13),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'th1',
          resourceId: 'r1',
          name: 'TH1',
          startDate: new Date(2019, 1, 14),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'fr1',
          resourceId: 'r1',
          name: 'FR1',
          startDate: new Date(2019, 1, 15),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'sa1',
          resourceId: 'r1',
          name: 'SA1',
          startDate: new Date(2019, 1, 16),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'su1',
          resourceId: 'r1',
          name: 'SU1',
          startDate: new Date(2019, 1, 17),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'mo2',
          resourceId: 'r1',
          name: 'MO2',
          startDate: new Date(2019, 1, 18),
          duration: 6,
          durationUnit: 'h'
        }]
      });
      assertLayout(t, 'mo1', 0, 100);
      assertLayout(t, 'tu1', 100, 50);
      assertLayout(t, 'we1', 200, 100);
      assertLayout(t, 'th1', 300, 100);
      assertLayout(t, 'fr1', 400, 100);
      t.notOk(getBox('sa1'), 'sa1 not shown');
      t.notOk(getBox('su1'), 'su1 not shown');
      assertLayout(t, 'mo2', 500, 25);
    });
    t.it('Should stretch to fill excluded space 2', async t => {
      await getSch({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            },
            hour: {
              from: 9,
              to: 14
            }
          }
        },
        events: [{
          id: 'mo1',
          resourceId: 'r1',
          name: 'MO1',
          startDate: new Date(2019, 1, 11, 9),
          duration: 5,
          durationUnit: 'h'
        }, {
          id: 'tu1',
          resourceId: 'r1',
          name: 'TU1',
          startDate: new Date(2019, 1, 12, 10),
          duration: 1,
          durationUnit: 'h'
        }, {
          id: 'we1',
          resourceId: 'r1',
          name: 'WE1',
          startDate: new Date(2019, 1, 13, 9),
          duration: 5,
          durationUnit: 'h'
        }, {
          id: 'th1',
          resourceId: 'r1',
          name: 'TH1',
          startDate: new Date(2019, 1, 14, 9),
          duration: 5,
          durationUnit: 'h'
        }, {
          id: 'fr1',
          resourceId: 'r1',
          name: 'FR1',
          startDate: new Date(2019, 1, 15),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'sa1',
          resourceId: 'r1',
          name: 'SA1',
          startDate: new Date(2019, 1, 16),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'su1',
          resourceId: 'r1',
          name: 'SU1',
          startDate: new Date(2019, 1, 17),
          duration: 24,
          durationUnit: 'h'
        }, {
          id: 'mo2',
          resourceId: 'r1',
          name: 'MO2',
          startDate: new Date(2019, 1, 18),
          duration: 24,
          durationUnit: 'h'
        }]
      });
      assertLayout(t, 'mo1', 0, 100);
      assertLayout(t, 'tu1', 120, 20);
      assertLayout(t, 'we1', 200, 100);
      assertLayout(t, 'th1', 300, 100);
      assertLayout(t, 'fr1', 400, 100);
      t.notOk(getBox('sa1'), 'sa1 not shown');
      t.notOk(getBox('su1'), 'su1 not shown');
      assertLayout(t, 'mo2', 500, 100);
    });
  });
  t.it('Should handle timeAxis#include#hour for "larger" ticks', async t => {
    t.it('Should not draw fully excluded events', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            hour: {
              from: 8,
              to: 16
            }
          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'early',
          resourceId: 'r1',
          name: 'Early',
          startDate: new Date(2011, 0, 7),
          duration: 4,
          durationUnit: 'h'
        }, {
          id: 'late',
          resourceId: 'r1',
          name: 'Late',
          startDate: new Date(2011, 0, 7, 18),
          duration: 4,
          durationUnit: 'h'
        }]
      });
      t.selectorNotExists('.b-sch-event', 'No event elements found');
    });
    t.it('Should draw partially excluded events', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            hour: {
              from: 8,
              to: 16
            }
          }
        },
        viewPreset: 'weekAndMonth',
        tickSize: 700,
        events: [{
          id: 'early',
          resourceId: 'r1',
          name: 'Early',
          startDate: new Date(2011, 0, 7, 7),
          duration: 2,
          durationUnit: 'h'
        }, {
          id: 'long',
          resourceId: 'r1',
          name: 'Long',
          startDate: new Date(2011, 0, 7),
          duration: 16,
          durationUnit: 'h'
        }, {
          id: 'late',
          resourceId: 'r1',
          name: 'Late',
          startDate: new Date(2011, 0, 7, 15),
          duration: 4,
          durationUnit: 'h'
        }, {
          id: 'twodays',
          resourceId: 'r1',
          name: 'Two days',
          startDate: new Date(2011, 0, 7),
          duration: 48,
          durationUnit: 'h'
        }]
      });
      assertLayout(t, 'early', 500, 12);
      assertLayout(t, 'long', 500, 100);
      assertLayout(t, 'late', 588, 12);
      assertLayout(t, 'twodays', 500, 200);
    });
    t.it('Should stretch to fill excluded space, 8-16', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            hour: {
              from: 8,
              to: 16
            }
          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: '8to16',
          resourceId: 'r1',
          name: 'Fr, 8to16',
          startDate: new Date(2011, 0, 7, 8),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: '8to12',
          resourceId: 'r1',
          name: 'Fr, 8to12',
          startDate: new Date(2011, 0, 7, 8),
          duration: 4,
          durationUnit: 'h'
        }, {
          id: '12to16',
          resourceId: 'r1',
          name: 'Fr, 12to16',
          startDate: new Date(2011, 0, 7, 12),
          duration: 4,
          durationUnit: 'h'
        }, {
          id: '7to17',
          resourceId: 'r1',
          name: 'Fr, 7to17',
          startDate: new Date(2011, 0, 7, 7),
          duration: 10,
          durationUnit: 'h'
        }, {
          id: '2days',
          resourceId: 'r1',
          name: 'Mo-Tu',
          startDate: new Date(2011, 0, 10),
          duration: 48,
          durationUnit: 'h'
        }]
      });
      assertLayout(t, '8to16', 357, 72);
      assertLayout(t, '8to12', 357, 36);
      assertLayout(t, '12to16', 393, 36);
      assertLayout(t, '7to17', 357, 72);
      assertLayout(t, '2days', 571, 143);
    });
    t.it('Should stretch to fill excluded space, 5-15', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            hour: {
              from: 5,
              to: 15
            }
          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: '8to16',
          resourceId: 'r1',
          name: 'Fr, 8to16',
          startDate: new Date(2011, 0, 7, 8),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: '8to12',
          resourceId: 'r1',
          name: 'Fr, 8to12',
          startDate: new Date(2011, 0, 7, 8),
          duration: 4,
          durationUnit: 'h'
        }, {
          id: '12to16',
          resourceId: 'r1',
          name: 'Fr, 12to16',
          startDate: new Date(2011, 0, 7, 12),
          duration: 4,
          durationUnit: 'h'
        }, {
          id: '7to17',
          resourceId: 'r1',
          name: 'Fr, 7to17',
          startDate: new Date(2011, 0, 7, 7),
          duration: 10,
          durationUnit: 'h'
        }, {
          id: '2days',
          resourceId: 'r1',
          name: 'Mo-Tu',
          startDate: new Date(2011, 0, 10),
          duration: 48,
          durationUnit: 'h'
        }]
      });
      assertLayout(t, '8to16', 378, 51);
      assertLayout(t, '8to12', 378, 28);
      assertLayout(t, '12to16', 408, 21);
      assertLayout(t, '7to17', 372, 57);
      assertLayout(t, '2days', 571, 143);
    });
  });
  t.it('Should handle timeAxis#include combinations for "larger" ticks', async t => {
    t.it('Work week and hours', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 6
            },
            hour: {
              from: 8,
              to: 16
            }
          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'sunday',
          resourceId: 'r1',
          name: 'S 8-16',
          startDate: new Date(2011, 0, 2, 8),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: 'monday',
          resourceId: 'r1',
          name: 'M 8-16',
          startDate: new Date(2011, 0, 3, 8),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: 'tuesday',
          resourceId: 'r1',
          name: 'T 8-16',
          startDate: new Date(2011, 0, 4, 8),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: 'wednesday',
          resourceId: 'r1',
          name: 'W 8-12',
          startDate: new Date(2011, 0, 5, 8),
          duration: 4,
          durationUnit: 'h'
        }, {
          id: 'thursday',
          resourceId: 'r1',
          name: 'T 12-16',
          startDate: new Date(2011, 0, 6, 12),
          duration: 4,
          durationUnit: 'h'
        }, {
          id: 'friday',
          resourceId: 'r1',
          name: 'F 8-16',
          startDate: new Date(2011, 0, 7, 8),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: 'saturday',
          resourceId: 'r1',
          name: 'S 8-16',
          startDate: new Date(2011, 0, 8, 8),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: 'twodays',
          resourceId: 'r1',
          name: 'M-T',
          startDate: new Date(2011, 0, 10),
          duration: 48,
          durationUnit: 'h'
        }]
      });
      t.notOk(getBox('sunday'), 'sunday not found');
      assertLayout(t, 'monday', 0, 100);
      assertLayout(t, 'tuesday', 100, 100);
      assertLayout(t, 'wednesday', 200, 50);
      assertLayout(t, 'thursday', 350, 50);
      assertLayout(t, 'friday', 400, 100);
      t.notOk(getBox('saturday'), 'saturday not found');
      assertLayout(t, 'twodays', 500, 200);
    });
    t.it('Long work week and hours', async t => {
      await getScheduler({
        timeAxis: {
          include: {
            day: {
              from: 1,
              to: 7
            },
            hour: {
              from: 7,
              to: 16
            }
          }
        },
        viewPreset: 'weekAndMonth',
        events: [{
          id: 'sunday',
          resourceId: 'r1',
          name: 'S 8-16',
          startDate: new Date(2011, 0, 2, 8),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: 'monday',
          resourceId: 'r1',
          name: 'M 7-16',
          startDate: new Date(2011, 0, 3, 7),
          duration: 9,
          durationUnit: 'h'
        }, {
          id: 'tuesday',
          resourceId: 'r1',
          name: 'T 8-16',
          startDate: new Date(2011, 0, 4, 8),
          duration: 8,
          durationUnit: 'h'
        }, {
          id: 'wednesday',
          resourceId: 'r1',
          name: 'W 4-8',
          startDate: new Date(2011, 0, 5, 4),
          duration: 4,
          durationUnit: 'h'
        }, {
          id: 'thursday',
          resourceId: 'r1',
          name: 'T 4-20',
          startDate: new Date(2011, 0, 6, 4),
          duration: 16,
          durationUnit: 'h'
        }, {
          id: 'friday',
          resourceId: 'r1',
          name: 'F 7-8',
          startDate: new Date(2011, 0, 7, 7),
          duration: 1,
          durationUnit: 'h'
        }, {
          id: 'saturday',
          resourceId: 'r1',
          name: 'S 7-16',
          startDate: new Date(2011, 0, 8, 7),
          duration: 9,
          durationUnit: 'h'
        }, {
          id: 'twodays',
          resourceId: 'r1',
          name: 'M-T',
          startDate: new Date(2011, 0, 10),
          duration: 48,
          durationUnit: 'h'
        }]
      });
      t.notOk(getBox('sunday'), 'sunday not found');
      assertLayout(t, 'monday', 0, 83);
      assertLayout(t, 'tuesday', 92, 75);
      assertLayout(t, 'wednesday', 167, 9);
      assertLayout(t, 'thursday', 250, 83);
      assertLayout(t, 'friday', 333, 9);
      assertLayout(t, 'saturday', 417, 83);
      assertLayout(t, 'twodays', 500, 167);
    });
  });
  t.it('Should reconfigure time axis when applying working time', async t => {
    scheduler = await t.getSchedulerAsync({
      width: 1000,
      columns: []
    });
    t.diag('workingTime assigned');
    scheduler.workingTime = {
      fromDay: 1,
      toDay: 6
    };
    t.selectorNotExists('.b-sch-dayheadercell-6', 'No saturdays');
    t.selectorNotExists('.b-sch-dayheadercell-0', 'No sundays');
    t.diag('workingTime unassigned');
    scheduler.workingTime = null;
    t.selectorExists('.b-sch-dayheadercell-6', 'Saturdays found');
    t.selectorExists('.b-sch-dayheadercell-0', 'Sundays found');
  });
  t.it('Should update header when changing working time config', async t => {
    scheduler = await t.getSchedulerAsync({
      width: 800,
      height: 600,
      startDate: new Date(2021, 3, 28),
      endDate: new Date(2021, 3, 29),
      viewPreset: 'hourAndDay',
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: '2021-04-28 12:00',
        endDate: '2021-04-28 14:00'
      }]
    });
    await t.waitForSelector('.b-grid-row');
    scheduler.workingTime = {
      fromDay: 0,
      toDay: 7,
      fromHour: 10,
      toHour: 16
    };
    t.is(scheduler.timeAxis.count, 6, 'Correct amount of ticks');
    t.is(scheduler.startDate, new Date(2021, 3, 28, 10), 'Start date is ok');
    t.is(scheduler.endDate, new Date(2021, 3, 28, 16), 'End date is ok');
    t.is(scheduler.timeAxisSubGrid.scrollable.scrollWidth, 6 * scheduler.tickSize, 'Time axis scroll width is ok');
    t.selectorCountIs('.b-sch-header-row-1 .b-sch-header-timeaxis-cell', 6, 'Correct amount of ticks rendered');
  });
});