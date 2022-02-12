"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => scheduler && scheduler.destroy());
  t.it('Clock in tooltip is updated on resize', t => {
    scheduler = t.getScheduler({
      viewPreset: 'hourAndDay',
      startDate: new Date(2018, 3, 27),
      endDate: new Date(2018, 3, 30),
      eventStore: t.getEventStore({
        data: [{
          name: 'foo',
          startDate: '2018-04-27 02:00',
          endDate: '2018-04-27 03:45',
          id: 1,
          resourceId: 'r1'
        }, {
          name: 'bar',
          startDate: '2018-04-27 06:20',
          endDate: '2018-04-27 06:20',
          id: 2,
          resourceId: 'r3'
        }]
      })
    });

    function assertClock(t, hour, minute, side) {
      const hourIndicator = document.querySelector(`.b-sch-event-tooltip .b-sch-tooltip-${side}date .b-sch-hour-indicator`),
            minuteIndicator = document.querySelector(`.b-sch-event-tooltip .b-sch-tooltip-${side}date .b-sch-minute-indicator`);
      t.is(hourIndicator.style.transform, `rotate(${hour * 30}deg)`, 'Hour indicator is ok');
      t.is(minuteIndicator.style.transform, `rotate(${minute * 6}deg)`, 'Minute indicator is ok');
    }

    t.chain({
      moveMouseTo: '.b-sch-event'
    }, {
      waitForSelector: '.b-sch-event-tooltip:contains(foo)'
    }, next => {
      assertClock(t, 2, 0, 'start');
      assertClock(t, 3, 45, 'end');
      next();
    }, {
      moveMouseTo: '.b-milestone'
    }, {
      waitForSelector: '.b-sch-event-tooltip:contains(bar)'
    }, next => {
      assertClock(t, 6, 20, 'start');
      t.selectorNotExists('.b-sch-event-tooltip .b-sch-tooltip-enddate', 'Only start shown for milestone');
      next();
    });
  });
  t.it('displays properly after hovered event is deleted', t => {
    scheduler = t.getScheduler({
      viewPreset: 'hourAndDay',
      startDate: new Date(2018, 3, 27),
      endDate: new Date(2018, 3, 30),
      features: true,
      eventStore: t.getEventStore({
        data: [{
          startDate: '2018-04-27 02:00',
          endDate: '2018-04-27 03:45',
          id: 1,
          resourceId: 'r1'
        }, {
          startDate: '2018-04-27 06:00',
          endDate: '2018-04-27 07:45',
          id: 2,
          resourceId: 'r1'
        }]
      })
    });
    t.chain({
      moveMouseTo: scheduler.unreleasedEventSelector
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    }, {
      rightclick: scheduler.unreleasedEventSelector
    }, {
      click: '.b-menu-text:contains(Delete event)'
    }, {
      moveMouseTo: scheduler.unreleasedEventSelector
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    }, // The bug was rapid disappearance of the tooltip,
    // so wait for that to happen.
    {
      waitFor: 500
    }, // Assert that the event tooltip is still there.
    () => {
      t.selectorExists('.b-sch-event-tooltip');
      t.selectorExists('.b-sch-clock-text:contains(6 AM)', 'Time format is correct');
    });
  });
  t.it('Date in the clock matches text', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      viewPreset: 'weekAndDayLetter',
      startDate: '2018-04-24',
      endDate: '2018-04-30',
      features: true,
      eventStore: t.getEventStore({
        data: [{
          startDate: '2018-04-27T00:00:00',
          endDate: '2018-04-29T00:00:00',
          id: 1,
          resourceId: 'r1'
        }]
      })
    });
    t.chain({
      moveMouseTo: document.body,
      offset: [0, 0]
    }, // reset cursor position
    {
      moveMouseTo: '.b-sch-event'
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    }, next => {
      t.selectorExists('.b-sch-event-tooltip .b-sch-tooltip-enddate .b-sch-minute-indicator:contains(28)');
      t.selectorExists('.b-sch-event-tooltip .b-sch-tooltip-enddate .b-sch-clock-text:contains(28)');
    });
  });
  t.it('should encode event name to avoid XSS issues', async t => {
    scheduler = t.getScheduler({
      viewPreset: 'weekAndDayLetter',
      startDate: '2018-04-24',
      endDate: '2018-04-30',
      features: true,
      eventStore: t.getEventStore({
        data: [{
          startDate: '2018-04-27T00:00:00',
          endDate: '2018-04-29T00:00:00',
          id: 1,
          resourceId: 'r1',
          name: 'Foo<b>Bar</b>'
        }]
      })
    });
    await t.waitForSelector('.b-sch-event-content:contains(Foo)'); // Ensure that default event renderer properly encodes event name:

    await t.waitForSelector('.b-sch-event-content:contains(Foo<b>)');
    await t.waitForSelectorNotFound('.b-sch-event:contains(Foo&)');
    await t.moveMouseTo([0, 0], () => {});
    await t.moveMouseTo('.b-sch-event', () => {});
    await t.waitForSelector('.b-sch-event-tooltip'); // Ensure that EventTooltip also properly encodes event name:

    await t.waitForSelector('.b-sch-event-tooltip:contains(Foo<b>)');
    await t.waitForSelectorNotFound('.b-sch-event-tooltip:contains(Foo&)');
  });
  t.it('Should only show one date for milestone', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      events: [{
        startDate: '2011-01-04',
        endDate: '2011-01-05',
        id: 1,
        cls: 'event-1',
        resourceId: 'r3'
      }, {
        startDate: '2011-01-05',
        endDate: '2011-01-05',
        id: 2,
        cls: 'event-2',
        resourceId: 'r4'
      }]
    });
    t.chain({
      moveMouseTo: '.event-1'
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    }, next => {
      t.selectorCountIs('.b-sch-event-tooltip .b-sch-clockwrap', 2, 'Start/end dates are shown in the tooltip');
      next();
    }, {
      moveMouseTo: '.event-2'
    }, next => {
      t.selectorCountIs('.b-sch-event-tooltip .b-sch-clockwrap', 1, 'Only milestone end is shown in the tooltip');
      scheduler.features.eventTooltip.tooltip.hide();
      next();
    }, {
      moveMouseBy: [100, 0]
    }, {
      moveMouseTo: '.event-1'
    }, () => {
      t.selectorCountIs('.b-sch-event-tooltip .b-sch-clockwrap', 2, 'Start/end dates are shown in regular task tooltip');
    });
  }); // https://app.assembla.com/spaces/bryntum/tickets/9249

  t.it('Should show correct end date if event ends on midnight', t => {
    scheduler = t.getScheduler({
      appendTo: document.body,
      events: [{
        startDate: '2011-01-04',
        endDate: '2011-01-05',
        id: 1,
        cls: 'event-1',
        resourceId: 'r3'
      }, {
        startDate: '2011-01-05',
        endDate: '2011-01-05',
        id: 2,
        cls: 'event-2',
        resourceId: 'r4'
      }]
    });
    t.chain({
      moveMouseTo: document.body,
      offset: [0, 0]
    }, // reset cursor position
    {
      moveMouseTo: '.event-1'
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    }, // Check using `is` instead of `waitForSelector` to see actual value in case of failure
    next => {
      // there is a potential problem with localization on server
      t.contentLike('.b-sch-tooltip-startdate .b-sch-clock-text', 'Jan 4, 2011 12 AM', 'Event start date is correct');
      t.contentLike('.b-sch-tooltip-enddate .b-sch-clock-text', 'Jan 5, 2011 12 AM', 'Event end date is correct');
      next();
    }, {
      moveMouseTo: '.event-2'
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    }, () => {
      t.contentLike('.b-sch-tooltip-startdate .b-sch-clock-text', 'Jan 5, 2011 12 AM', 'Milestone date is correct');
    });
  });
  t.it('Should support disabling', t => {
    scheduler = t.getScheduler();
    scheduler.features.eventTooltip.disabled = true;
    t.chain({
      moveMouseTo: '.b-sch-event'
    }, {
      waitFor: 250
    }, next => {
      t.selectorNotExists('.b-sch-event-tooltip', 'Tooltip not shown');
      scheduler.features.eventTooltip.disabled = false;
      next();
    }, {
      moveMouseTo: '.b-sch-event:contains(Assignment 2)'
    }, {
      waitForSelector: '.b-sch-event-tooltip',
      desc: 'Tooltip shown'
    });
  }); // https://github.com/bryntum/support/issues/104

  t.it('Should show calendar icon if date format does not include hour info', t => {
    scheduler = t.getScheduler({
      displayDateFormat: 'DD-MM-YYYY'
    });
    t.chain({
      moveMouseTo: '.b-sch-event'
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    }, next => {
      t.selectorNotExists('.b-sch-clock-hour', 'Clock icon is not shown');
      t.selectorExists('.b-sch-clock-day', 'Calendar icon is shown');
      t.selectorExists('.b-sch-clock-text', 'Date text is shown');
      next();
    }, {
      moveMouseTo: document.body,
      offset: [0, 0]
    }, // reset cursor position
    {
      waitForSelectorNotFound: '.b-sch-event-tooltip'
    }, next => {
      scheduler.displayDateFormat = 'DD-MM-YYYY HH:mm';
      next();
    }, {
      moveMouseTo: '.b-sch-event'
    }, {
      waitForSelector: '.b-sch-event-tooltip'
    }, () => {
      t.selectorExists('.b-sch-clock-hour', 'Clock icon is shown');
      t.selectorNotExists('.b-sch-clock-day', 'Calendar icon is not shown');
      t.selectorExists('.b-sch-clock-text', 'Date text is shown');
    });
  });
  t.it('Should support async tooltip by returning Promise', t => {
    scheduler = t.getScheduler({
      events: [{
        startDate: '2011-01-05',
        endDate: '2011-01-05',
        id: 2,
        cls: 'event-2',
        resourceId: 'r4'
      }],
      features: {
        eventTooltip: {
          template: ({
            eventRecord
          }) => AjaxHelper.get('./fakeServer').then(response => response.text())
        }
      }
    });
    t.mockUrl('./fakeServer', {
      responseText: 'Remote content'
    });
    t.chain({
      moveMouseTo: '.b-sch-event'
    }, {
      waitForSelector: '.b-sch-event-tooltip:contains(Remote content)'
    });
  }); // https://github.com/bryntum/support/issues/434

  t.it('Should not show empty event tooltip', t => {
    scheduler = t.getScheduler({
      events: [{
        startDate: '2011-01-05',
        endDate: '2011-01-06',
        resourceId: 'r4'
      }],
      features: {
        eventTooltip: {
          template: () => '',
          hoverDelay: 0,
          hideDelay: 0
        }
      }
    });
    t.chain({
      moveMouseTo: '.b-sch-event'
    }, {
      waitForSelectorNotFound: '.b-sch-event-tooltip',
      desc: 'No tooltips shown for empty string'
    });
  }); // https://github.com/bryntum/support/issues/2077

  t.it('Should update tooltip content if its record changes while visible', async t => {
    scheduler = t.getScheduler({
      height: 300,
      events: [{
        startDate: '2011-01-05',
        endDate: '2011-01-06',
        resourceId: 'r4'
      }],
      features: {
        eventTooltip: {
          hoverDelay: 0,
          hideDelay: 0
        }
      }
    });
    await t.moveMouseTo('.b-sch-event', () => {});
    await t.waitForSelector('.b-sch-event-tooltip');
    scheduler.eventStore.first.shift(4);
    await t.waitForSelector('.b-sch-event-tooltip:contains(Jan 9)');
    t.click();
  }); // https://github.com/bryntum/support/issues/1974

  t.it('Should be possible to register events', async t => {
    let called;
    scheduler = await t.getSchedulerAsync({
      features: {
        eventTooltip: {
          listeners: {
            show: ({
              source
            }) => {
              called = true;
              t.is(source, scheduler.features.eventTooltip.tooltip, 'show function called with tooltip parameter');
            }
          }
        }
      }
    });
    t.firesOnce(scheduler.features.eventTooltip.tooltip, 'show', 'show was fired once');
    await t.moveMouseTo('.b-sch-event');
    await t.waitForSelector('.b-tooltip');
    t.ok(called, 'listener fn was called');
  }); // https://github.com/bryntum/support/issues/2974

  t.it('Should not crash when moving mouse between events', async t => {
    let expectedId;

    t.waitForAnimations = next => next();

    scheduler = await t.getSchedulerAsync({
      features: {
        eventTooltip: {
          hideAnimation: {
            opacity: {
              from: 1,
              to: 0,
              duration: '1s',
              delay: '0s'
            }
          },

          onBeforeShow({
            source: tooltip
          }) {
            t.is(tooltip.eventRecord.id, expectedId, `eventRecord id: ${expectedId} is set`);
          }

        }
      }
    });
    expectedId = 1;
    await t.moveMouseTo('.b-sch-event:contains(Assignment 1)');
    await t.waitForSelector('.b-tooltip');
    expectedId = 2;
    await t.moveMouseTo('.b-sch-event:contains(Assignment 2)');
    await t.waitForSelector('.b-tooltip');
    await t.moveMouseTo('.b-sch-event:contains(Assignment 2)', null, null, ['100%+10', '100%+10']);
    expectedId = 3;
    await t.moveMouseTo('.b-sch-event:contains(Assignment 3)');
    await t.moveMouseTo('.b-sch-event:contains(Assignment 2)', null, null, ['100%+10', '100%+10']);
    await t.waitForSelector('.b-hiding');
    expectedId = 2;
    await t.moveMouseTo('.b-sch-event:contains(Assignment 2)');
  }); // https://github.com/bryntum/support/issues/3139

  t.it('Should support using "on"/"un" function for registering/unregistering events', async t => {
    let tipInstanceCalled,
        featureInstanceCalled = 0;
    scheduler = await t.getSchedulerAsync();
    const {
      eventTooltip
    } = scheduler.features;

    const beforeShow = e => {
      tipInstanceCalled = true;
      t.is(e.source, scheduler.features.eventTooltip.tooltip, 'show function called with tooltip parameter');
    };

    const disable = e => {
      featureInstanceCalled++;
      t.ok(scheduler.features.eventTooltip.disabled, 'feature is disabled');
    }; // Add listener


    eventTooltip.on({
      beforeShow
    });
    await t.moveMouseTo('.b-sch-event');
    await t.waitForSelector('.b-tooltip');
    t.ok(tipInstanceCalled, 'listener fn was called'); // Add enable/disable listener

    eventTooltip.on({
      disable
    });
    eventTooltip.disabled = true;
    eventTooltip.disabled = false;
    t.is(featureInstanceCalled, 1, 'feature listener was called'); // Remove listener

    eventTooltip.un({
      beforeShow
    });
    tipInstanceCalled = false;
    await t.moveMouseTo('.b-grid-header-text');
    await t.moveMouseTo('.b-sch-event');
    await t.waitForSelector('.b-tooltip');
    t.notOk(tipInstanceCalled, 'listener fn was not called');
  });
  t.it('Should support widget.up from the tooltip', async t => {
    scheduler = t.getScheduler({
      events: [{
        startDate: '2011-01-05',
        endDate: '2011-01-05',
        id: 2,
        cls: 'event-2',
        resourceId: 'r4'
      }],
      features: {
        eventTooltip: {
          tools: {
            testTool: {
              cls: 'b-fa b-fa-angle-left',

              handler() {
                testToolClicked = true; // this.up call must work if Panel owner is a Feature, not a widget

                t.is(this.up('scheduler'), scheduler);
              },

              tooltip: {
                getHtml() {
                  testToolTooltipShown = true; // this.up call must work.
                  // Shared tooltip must have access to its owner hierarchy

                  t.is(this.up('scheduler'), scheduler);
                  return 'Test tool tooltip';
                }

              }
            }
          }
        }
      }
    });
    let testToolClicked = false,
        testToolTooltipShown = false;
    t.mockUrl('./fakeServer', {
      responseText: 'Remote content'
    });
    await t.moveMouseTo('.b-sch-event');
    await t.moveMouseTo('.b-sch-event-tooltip .b-fa.b-fa-angle-left');
    await t.waitFor(() => testToolTooltipShown);
    await t.waitForSelector('.b-tooltip:contains(Test tool tooltip)');
    await t.click('.b-sch-event-tooltip .b-fa.b-fa-angle-left');
    t.is(testToolClicked, true);
  }); // https://github.com/bryntum/support/issues/3709

  t.it('Should only realign once per scroll', async t => {
    scheduler = await t.getSchedulerAsync({
      features: {
        eventTooltip: {
          scrollAction: 'realign'
        }
      }
    });
    await t.moveMouseTo('$event=1');
    await t.waitForSelector('.b-sch-event-tooltip');
    const spy = t.spyOn(scheduler.features.eventTooltip.tooltip, 'alignTo');
    scheduler.scrollLeft = 1; // Wait twice since scroll sync takes an additional frame

    await t.waitForAnimationFrame();
    await t.waitForAnimationFrame();
    t.expect(spy).toHaveBeenCalled(1);
  });
});