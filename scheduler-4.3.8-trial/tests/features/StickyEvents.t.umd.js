"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(t => {
    var _scheduler;

    return (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });
  t.it('horizontal', async t => {
    scheduler = t.getScheduler({
      startDate: '2011-01-03',
      endDate: '2011-01-23',
      resourceStore: t.getResourceStore2({}, 25)
    }, 200);
    const {
      timeAxisSubGrid
    } = scheduler,
          {
      scrollable
    } = timeAxisSubGrid;
    const timeAxisViewport = timeAxisSubGrid.element.getBoundingClientRect();
    scheduler.eventStore.add({
      startDate: '2011-01-13',
      endDate: '2011-01-18',
      name: 'Check vertical scroll',
      resourceId: 'r20'
    });

    const checkElementsContent = () => {
      t.query(`${scheduler.unreleasedEventSelector}`, timeAxisSubGrid.element).forEach(e => {
        const ebox = e.getBoundingClientRect(),
              c = e.querySelector('.b-sch-event-content'),
              cbox = c.getBoundingClientRect(),
              cmargins = DomHelper.getEdgeSize(c, 'margin'); // If the event bar is showing enough, check that the content is fully visible

        if (ebox.right - (cbox.width + cmargins.width) > timeAxisViewport.left + 2) {
          t.isGreaterOrEqual(cbox.left - cmargins.left, timeAxisViewport.left);
        }

        if (ebox.left > timeAxisViewport.left + 2) {
          // check that text was shifted back to very left if an event is fully shown
          t.isGreaterOrEqual(ebox.left + cmargins.left, cbox.left);
        }
      });
    };

    scrollable.on({
      scroll: checkElementsContent
    });
    await scrollable.scrollTo(scrollable.maxX, null, {
      animate: {
        duration: 2000
      }
    });
    await scrollable.scrollTo(null, scrollable.maxY, {
      animate: {
        duration: 2000
      }
    }); // check 'Check vertical scroll' event after scroll down
    // https://github.com/bryntum/support/issues/2666

    checkElementsContent();
    await scrollable.scrollTo(0, null, {
      animate: {
        duration: 2000
      }
    });
    await scrollable.scrollTo(null, 0, {
      animate: {
        duration: 2000
      }
    }); // Waot for render engine to catch up.

    await t.waitForAnimationFrame();
    checkElementsContent(); // After scrolling back, the elements must be in place

    t.query(`${scheduler.unreleasedEventSelector} > * > .b-sch-event-content`, timeAxisSubGrid.element).forEach(e => {
      t.isGreater(e.getBoundingClientRect().left, e.parentNode.parentNode.getBoundingClientRect().left);
    });
    await t.dragBy('.b-sch-event-wrap:contains(Assignment 1)', [-200, 0], null, null, null, true); // After dragging, the elements must be in place

    t.query(`${scheduler.unreleasedEventSelector} > * > .b-sch-event-content`, timeAxisSubGrid.element).forEach(e => {
      t.isGreater(e.getBoundingClientRect().left, e.parentNode.parentNode.getBoundingClientRect().left);
    });
  });
  t.it('vertical', async t => {
    scheduler = t.getScheduler({
      mode: 'vertical',
      startDate: '2011-01-03',
      endDate: '2011-01-23',
      resourceStore: t.getResourceStore2({}, 10)
    }, 200);
    const {
      timeAxisSubGrid
    } = scheduler,
          {
      scrollable
    } = timeAxisSubGrid;
    const timeAxisViewport = timeAxisSubGrid.element.getBoundingClientRect();
    scrollable.on({
      scroll() {
        t.query(`${scheduler.unreleasedEventSelector}`, timeAxisSubGrid.element).forEach(e => {
          const ebox = e.getBoundingClientRect(),
                c = e.querySelector('.b-sch-event-content'),
                cbox = c.getBoundingClientRect(),
                cmargins = DomHelper.getEdgeSize(c, 'margin'); // If the event bar is showing enough, check that the content is fully visible

          if (ebox.right - (cbox.height + cmargins.height) > timeAxisViewport.top + 2) {
            t.isGreaterOrEqual(c.getBoundingClientRect().top - cmargins.top, timeAxisViewport.top);
          }
        });
      }

    });
    await scrollable.scrollTo(null, scrollable.maxY, {
      animate: {
        duration: 2000
      }
    });
    await scrollable.scrollTo(null, 0); // After scrolling back, the elements must be in place

    t.query(`${scheduler.unreleasedEventSelector} > * > .b-sch-event-content`, timeAxisSubGrid.element).forEach(e => {
      t.isGreater(e.getBoundingClientRect().top, e.parentNode.parentNode.getBoundingClientRect().top);
    });
  });
  t.it('Should not crash if events have no content', async t => {
    scheduler = t.getScheduler({
      eventRenderer() {}

    }, 1);
    const {
      timeAxisSubGrid
    } = scheduler,
          {
      scrollable
    } = timeAxisSubGrid;
    t.waitForEvent(scrollable, 'scrollEnd');
    await scrollable.scrollTo(scrollable.maxX, null);
    t.pass('No crash');
  });
  t.it('Content should be shifted on initial render', async t => {
    scheduler = await t.getScheduler({
      startDate: '2011-01-03',
      endDate: '2011-01-23',
      resourceStore: t.getResourceStore2({}, 200),
      height: 700,
      width: 1000,
      events: (() => {
        const result = [];
        let startDate = new Date(2010, 11, 1);

        for (let i = 0; i < 200; i++) {
          result.push({
            id: i,
            name: `This is event ${i + 1}`,
            resourceId: `r${i + 1}`,
            startDate,
            duration: 395
          });
          startDate = DateHelper.add(startDate, 1, 'hour');
        }

        return result;
      })()
    });
    scheduler.timeAxisSubGrid.scrollable.x = 500;
    const {
      timeAxisSubGrid,
      scrollable
    } = scheduler,
          timeAxisViewport = Rectangle.from(timeAxisSubGrid.element).intersect(Rectangle.from(scheduler.scrollable.element));
    let eventMap = {};
    scheduler.on({
      scroll() {
        t.query(`${scheduler.unreleasedEventSelector}`, timeAxisSubGrid.element).forEach(e => {
          const eventId = e.elementData.eventId;

          if (eventMap[eventId]) {
            return;
          }

          const ebox = e.getBoundingClientRect(),
                c = e.querySelector('.b-sch-event-content'),
                cbox = c.getBoundingClientRect(),
                cmargins = DomHelper.getEdgeSize(c, 'margin'); // If the event bar is showing enough, check that the content is fully visible

          if (ebox.right - (cbox.width + cmargins.width) > timeAxisViewport.left + 2) {
            if (ebox.top > 0) {
              // make it faster
              if (Math.ceil(cbox.left - cmargins.left) < Math.ceil(timeAxisViewport.left)) {
                t.isGreaterOrEqual(Math.ceil(cbox.left - cmargins.left), Math.ceil(timeAxisViewport.left), `Content visible for #${e.textContent}, ebox.top = ${ebox.top}`);
              }

              eventMap[eventId] = true;
            }
          }
        });
      }

    });
    await scrollable.scrollTo(null, scrollable.maxY, {
      animate: {
        duration: 6000
      }
    });
    eventMap = {}; // clear checked events map

    await scheduler.timeAxisSubGrid.scrollable.scrollTo(600, null, {
      animate: {
        duration: 600
      }
    });
    eventMap = {}; // clear checked events map

    await scrollable.scrollTo(null, 0, {
      animate: {
        duration: 6000
      }
    }); // After scrolling back, the elements must be in place

    t.query(`${scheduler.unreleasedEventSelector} > * > .b-sch-event-content`, timeAxisSubGrid.element).forEach(e => {
      t.isGreater(e.getBoundingClientRect().left, e.parentNode.parentNode.getBoundingClientRect().left, `Content visible for #${e.textContent}`);
    });
  });
  t.it('Should support opt out of stickiness for individual events', async t => {
    scheduler = t.getScheduler({
      startDate: new Date(2011, 0, 5),
      endDate: new Date(2011, 0, 26),
      visibleDate: {
        date: new Date(2011, 0, 10),
        block: 'start'
      },
      events: [{
        id: 1,
        resourceId: 'r1',
        stickyContents: false,
        startDate: new Date(2011, 0, 6, 10),
        duration: 5,
        name: 'non sticky'
      }]
    }, 1);
    await t.waitForSelector(scheduler.unreleasedEventSelector);
    t.isLess(t.rect('.b-sch-event-content').left, scheduler.timeAxisSubGridElement.getBoundingClientRect().left, 'Event content out of view');
  }); // https://github.com/bryntum/support/issues/2495

  t.it('Should support disabling stickiness', async t => {
    scheduler = await t.getSchedulerAsync({
      startDate: new Date(2011, 0, 5),
      endDate: new Date(2011, 0, 26),
      visibleDate: {
        date: new Date(2011, 0, 10),
        block: 'start'
      },
      features: {
        stickyEvents: {
          disabled: true
        }
      },
      events: [{
        id: 1,
        resourceId: 'r1',
        startDate: new Date(2011, 0, 6, 10),
        duration: 5,
        name: 'non sticky'
      }]
    }, 1);
    await t.waitForSelector(scheduler.unreleasedEventSelector);
    t.isLess(t.rect('.b-sch-event-content').left, scheduler.timeAxisSubGridElement.getBoundingClientRect().left, 'Event content out of view');
    await t.waitForAsyncness();
    scheduler.features.stickyEvents.disabled = false;
    t.isGreaterOrEqual(t.rect('.b-sch-event-content').left, scheduler.timeAxisSubGridElement.getBoundingClientRect().left, 'Event content in view');
  }); // https://github.com/bryntum/support/issues/3709

  t.it('Should not affect events fully in view', async t => {
    scheduler = await t.getSchedulerAsync();
    const spy = t.spyOn(scheduler.features.stickyEvents, 'updateStyles');
    scheduler.scrollLeft = 1;
    await t.waitForAnimationFrame();
    t.expect(spy).toHaveBeenCalled(0);
  }); // https://github.com/bryntum/support/issues/3856

  t.it('Should refresh sticky content after aborted drag', async t => {
    scheduler = await t.getSchedulerAsync({
      columns: [{
        width: 400
      }]
    });
    await t.dragTo({
      source: scheduler.unreleasedEventSelector,
      target: '.b-grid-subgrid-locked .b-grid-cell',
      targetOffset: ['100%-5', '50%'],
      dragOnly: true
    });
    await t.type(null, '[ESCAPE]');
    await t.waitForSelectorNotFound('.b-aborting');
    t.is(DomHelper.getTranslateX(t.query(scheduler.unreleasedEventSelector + ' .b-sch-event-content')[0]), 0, 'Stickiness updated after abort');
  });
});