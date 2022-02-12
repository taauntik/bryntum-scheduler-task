"use strict";

StartTest(t => {
  let scheduler; // async beforeEach doesn't work in umd

  t.beforeEach(async (t, next) => {
    scheduler && scheduler.destroy();
    next();
  });
  if (t.browser.safari) return;
  t.it('Should be displayed when hovering empty area', async t => {
    scheduler = await t.getSchedulerAsync();
    t.chain({
      moveMouseTo: '.b-sch-timeaxis-cell'
    }, {
      waitForSelector: '.b-sch-scheduletip:not(.b-hidden)',
      desc: 'Waiting for tooltip'
    }, next => {
      t.is(document.querySelector('.b-sch-scheduletip .b-sch-clock-text').innerText, 'Jan 8, 2011 12 AM', 'Displays correct date/time');
      next();
    }, // A click should hide it
    {
      click: []
    }, {
      waitForSelectorNotFound: '.b-sch-scheduletip:not(.b-hidden)',
      desc: 'Waiting for tooltip'
    }, // But the very next mousemove should show it again
    {
      moveMouseBy: [1, 0]
    }, {
      waitForSelector: '.b-sch-scheduletip:not(.b-hidden)',
      desc: 'Waiting for tooltip'
    });
  });
  t.it('Should not be displayed when hovering event', async t => {
    scheduler = await t.getSchedulerAsync();
    t.chain({
      moveMouseTo: [0, 0]
    }, {
      moveMouseTo: '.b-sch-event'
    }, {
      waitFor: 100
    }, {
      waitForSelectorNotFound: '.b-sch-scheduletip:not(.b-hidden)',
      desc: 'Not shown'
    });
  });
  t.it('Should not be displayed when dragging an event', async t => {
    scheduler = await t.getSchedulerAsync();
    t.chain( // Position the mouse close to the event we're going to drag
    // so that we can begin the drag before the ScheduleTooltip
    // has a chance to hide
    {
      moveMouseTo: '.b-sch-event',
      offset: ['50%', '0%-1']
    }, {
      waitForSelector: '.b-sch-scheduletip:not(.b-hidden)',
      desc: 'Shown'
    }, // Move the mouse 2px down into the event and drag from there.
    // This will allow no time for the ScheduleTooltip to hide.
    // The event dropping to pointer-events:none will trigger a mouseover
    // on the Scheduler, but the ScheduleToolTip's selector rejects
    // if the scheduler is currently dragging an event, so the scheduled
    // hide will not get canceled.
    {
      drag: '.b-sch-event',
      offset: ['50%', '0%+1'],
      by: [-50, 0],
      dragOnly: true
    }, {
      waitForSelectorNotFound: '.b-sch-scheduletip:not(.b-hidden)',
      desc: 'Not shown'
    }, {
      mouseUp: null
    });
  });
  t.it('Should still be displayed when scheduler is readOnly', async t => {
    scheduler = await t.getSchedulerAsync();
    scheduler.readOnly = true;
    t.chain({
      moveMouseTo: [0, 0]
    }, {
      moveMouseTo: '.b-sch-timeaxis-cell',
      offset: [10, 10]
    }, {
      waitForSelector: '.b-sch-scheduletip:not(.b-hidden)',
      desc: 'Shown'
    });
  });
  t.it('Clock template should respect time axis resolution', async t => {
    scheduler = await t.getSchedulerAsync();
    scheduler.eventStore.clear();
    scheduler.on('beforedragcreatefinalize', ({
      context
    }) => {
      context.finalize(false);
      return false;
    });
    t.chain({
      moveMouseTo: [0, 0]
    }, {
      waitForEvent: [scheduler, 'presetChange'],
      trigger: () => scheduler.zoomOutFull()
    }, // Don't use `offset` here, because it will fail in FF
    {
      moveMouseTo: '.b-sch-timeaxis-cell'
    }, {
      waitForSelector: '.b-sch-scheduletip:not(.b-hidden) .b-sch-clock-day',
      desc: 'Waiting for cell tooltip'
    }, {
      mouseDown: null
    }, {
      moveMouseBy: [[100, 0]]
    }, {
      waitForSelector: '.b-tooltip:not(.b-hidden) .b-sch-clock-day',
      desc: 'Waiting for drag tooltip'
    }, {
      mouseUp: null
    }, {
      waitForEvent: [scheduler, 'presetChange'],
      trigger: () => scheduler.zoomToLevel('hourAndDay')
    }, {
      moveMouseTo: '.b-grid-header'
    }, {
      waitForSelectorNotFound: '.b-sch-scheduletip:not(.b-hidden)',
      desc: 'Waiting for cell tooltip to hide'
    }, {
      moveMouseTo: '.b-sch-timeaxis-cell'
    }, {
      waitForSelector: '.b-sch-scheduletip:not(.b-hidden) .b-sch-clock-hour',
      desc: 'Waiting for cell tooltip'
    }, {
      mouseDown: null
    }, {
      moveMouseBy: [[100, 0]]
    }, {
      waitForSelector: '.b-tooltip:not(.b-hidden) .b-sch-clock-hour',
      desc: 'Waiting for drag tooltip'
    }, {
      mouseUp: null
    });
  });
  t.it('Hour and minute indicators are rotating', async t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      viewPreset: 'hourAndDay',
      startDate: new Date(2018, 1, 1),
      endDate: new Date(2018, 1, 1, 12)
    });
    await t.waitForProjectReady();
    t.waitForSelector('.b-sch-timeaxis-cell', () => {
      const headers = Array.from(scheduler.element.querySelectorAll('.b-sch-header-row-main .b-sch-header-timeaxis-cell')),
            steps = [];
      headers.forEach((el, i) => {
        steps.push({
          moveMouseTo: el,
          offset: ['25%', '200%']
        }, {
          waitForSelector: '.b-sch-hour-indicator'
        }, (next, indicatorEl) => {
          const minuteIndicator = document.body.querySelector('.b-sch-minute-indicator');

          if (i * 2 % 2 === 0) {
            t.is(minuteIndicator.style.transform, 'rotate(0deg)', 'Minute indicator is ok');
          } else {
            t.is(minuteIndicator.style.transform, 'rotate(180deg)', 'Minute indicator is ok');
          }

          t.is(indicatorEl[0].style.transform, `rotate(${i * 30}deg)`, 'Hour indicator is ok');
          next();
        }, {
          moveMouseTo: el,
          offset: ['75%', '200%']
        }, {
          waitForSelector: '.b-sch-hour-indicator'
        }, (next, indicatorEl) => {
          const minuteIndicator = document.body.querySelector('.b-sch-minute-indicator');

          if ((i * 2 + 1) % 2 === 0) {
            t.is(minuteIndicator.style.transform, 'rotate(0deg)', 'Minute indicator is ok');
          } else {
            t.is(minuteIndicator.style.transform, 'rotate(180deg)', 'Minute indicator is ok');
          }

          t.is(indicatorEl[0].style.transform, `rotate(${i * 30}deg)`, 'Hour indicator is ok');
          next();
        });
      });
      t.chain(steps);
    });
  });
  t.it('mousemove over the ScheduleTooltip should not crash', t => {
    scheduler = t.getScheduler({
      features: {
        scheduleTooltip: {
          generateTipContent({
            date,
            resourceRecord
          }) {
            return `
                            <dl>
                                <dt>Date</dt><dd>${date}</dd>
                                <dt>Resource</dt><dd>${resourceRecord.name}</dd>
                            </dl>
                        `;
          }

        }
      },
      startDate: new Date(2018, 1, 1),
      endDate: new Date(2018, 1, 1, 12)
    }); // Mouseover the ScheduleTip which is constrained at the bottom of the screen.
    // Should not crash

    t.chain({
      moveMouseTo: [180, 170]
    }, {
      waitForSelector: '.b-sch-scheduletip'
    }, {
      moveMouseTo: [280, 170]
    }, {
      waitForSelector: '.b-sch-scheduletip'
    }, {
      moveMouseTo: [980, 730]
    }, {
      waitForSelector: '.b-sch-scheduletip'
    }, {
      moveMouseTo: [846, 749]
    });
  });
  t.it('Should not crash if encountering a DOM element with `b-sch-event-wrap` class outside Scheduler', async t => {
    scheduler = await t.getSchedulerAsync();
    scheduler.eventStore.removeAll();
    await t.waitForProjectReady(); // Mouseover the ScheduleTip which is constrained at the bottom of the screen.
    // Should not crash

    const div = document.createElement('div');
    div.className = 'b-sch-event-wrap outside';
    div.style.cssText = `
            position:absolute;
            top : 100px;
            left : 100px;
            width:100px;
            height:100px;
            background : #ddd;
            z-index : 2;
        `;
    document.body.appendChild(div);
    t.chain({
      moveMouseTo: '.b-sch-timeaxis-cell'
    }, {
      waitForSelector: '.b-tooltip'
    }, {
      moveMouseTo: '.outside'
    });
  });
  t.it('Should support disabling', async t => {
    scheduler = await t.getSchedulerAsync();
    scheduler.features.scheduleTooltip.disabled = true;
    t.chain({
      moveMouseTo: '.b-sch-timeaxis-cell',
      offset: [10, 10]
    }, {
      waitFor: 250
    }, next => {
      t.selectorNotExists('.b-sch-scheduletip', 'No tooltip');
      scheduler.features.scheduleTooltip.disabled = false;
      next();
    }, {
      moveMouseTo: [0, 0]
    }, {
      moveMouseTo: '.b-sch-timeaxis-cell',
      offset: [10, 10]
    }, {
      waitForSelector: '.b-sch-scheduletip'
    });
  });
  t.it('Should be able to fully control the HTML shown in the tooltip using generateTipContent', t => {
    scheduler = t.getScheduler({
      features: {
        scheduleTooltip: {
          generateTipContent({
            date,
            event,
            resourceRecord
          }) {
            t.isInstanceOf(date, Date, 'Date');
            t.isInstanceOf(event, Event, 'Event');
            t.is(resourceRecord.name, 'Mike', 'Correct resource');
            return `
                            <dl>
                                <dt>Date</dt><dd> ${date}</dd>
                                <dt>Resource</dt><dd> ${resourceRecord.name}</dd>
                            </dl>
                        `;
          }

        }
      }
    });
    t.chain({
      moveMouseTo: '.b-sch-timeaxis-cell',
      offset: [0, 0]
    }, {
      moveMouseTo: '.b-sch-timeaxis-cell',
      offset: [10, 10]
    }, {
      waitForSelector: '.b-sch-scheduletip:not(.b-hidden):contains(Jan 03 2011)'
    }, {
      waitForSelector: '.b-sch-scheduletip:not(.b-hidden):contains(Mike)'
    });
  });
  t.it('Should be able to customize the text shown in the tooltip using getText', t => {
    scheduler = t.getScheduler({
      features: {
        scheduleTooltip: {
          getText(date, event, resource) {
            t.isInstanceOf(date, Date, 'Date');
            t.isInstanceOf(event, Event, 'Event');
            t.is(resource.name, 'Mike', 'Resource was passed');
            return resource.name;
          }

        }
      }
    });
    t.chain({
      moveMouseTo: '.b-sch-timeaxis-cell',
      offset: [0, 0]
    }, {
      moveMouseTo: '.b-sch-timeaxis-cell',
      offset: [10, 10]
    }, {
      waitForSelector: '.b-sch-scheduletip:not(.b-hidden):contains(Mike)'
    });
  }); // https://github.com/bryntum/support/issues/895

  t.it('Should update content when scrolling', async t => {
    scheduler = await t.getSchedulerAsync({
      events: [],
      width: 300
    });
    await t.moveCursorTo('.b-sch-timeaxis-cell', null, null, [11, 10]);
    await t.waitForSelector('.b-sch-scheduletip:not(.b-hidden):contains(Jan 3)');
    scheduler.timeAxisSubGrid.scrollable.x = 300;
    await t.waitForSelector('.b-sch-scheduletip:not(.b-hidden):contains(Jan 6)');
  });
  t.it('Should hide when generateTipContent returns empty string', async t => {
    scheduler = t.getScheduler({
      events: [],
      features: {
        scheduleTooltip: {
          generateTipContent() {
            return '';
          }

        }
      }
    });
    await t.moveCursorTo('.b-sch-timeaxis-cell', null, null, [11, 10]);
    await t.waitFor(100);
    t.selectorNotExists('.b-tooltip');
  }); // https://github.com/bryntum/support/issues/3290

  t.it('Should optionally hide when hovering non-working time', async t => {
    scheduler = t.getScheduler({
      events: [],
      startDate: new Date(2021, 7, 16),
      endDate: new Date(2021, 7, 23),
      features: {
        nonWorkingTime: true,
        scheduleTooltip: {
          // Hide schedule tooltip when hovering non-working days
          hideForNonWorkingTime: true
        }
      }
    });
    await t.moveCursorTo('.b-sch-timeaxis-cell', null, null, [11, 10]);
    await t.waitForSelector('.b-sch-scheduletip:not(.b-hidden)');
    await t.moveCursorTo('.b-sch-timeaxis-cell', null, null, ['100%-100', 10]);
    await t.waitForSelector('.b-sch-scheduletip.b-nonworking-time');
  }); // https://github.com/bryntum/support/issues/3899

  t.it('Configurability', async t => {
    scheduler = t.getScheduler({
      events: [],
      startDate: new Date(2021, 7, 16),
      endDate: new Date(2021, 7, 23),
      features: {
        nonWorkingTime: true,
        scheduleTooltip: {
          hoverDelay: 3000,
          listeners: {
            show() {
              shown++;
            }

          }
        }
      }
    });
    let shown = 0;
    await t.moveCursorTo('.b-sch-timeaxis-cell', null, null, [11, 10]);
    const overTime = performance.now();
    t.selectorNotExists('.b-sch-scheduletip:not(.b-hidden)');
    await t.waitForSelector('.b-sch-scheduletip:not(.b-hidden)'); // Must have been at least 3 seconds since mouseover time. Show must have been called once.

    t.isGreaterOrEqual(performance.now(), overTime);
    t.is(shown, 1);
  });
});