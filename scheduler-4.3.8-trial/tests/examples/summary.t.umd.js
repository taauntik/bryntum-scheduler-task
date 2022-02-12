"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(async t => {
    await t.waitForSelector('.b-sch-event-wrap');
    scheduler = bryntum.query('scheduler');
  });
  t.it('sanity', t => {
    t.chain(next => {
      // Make test work.
      // TODO: Fix summary feature leaving cached bodyHeight stale.
      // https://github.com/bryntum/bryntum-suite/issues/631
      scheduler.onHeightChange();
      next();
    }, () => t.checkGridSanity(scheduler));
  });
  t.it('Sticky centered text', async t => {
    const {
      timeAxisSubGrid
    } = scheduler,
          {
      scrollable
    } = timeAxisSubGrid,
          timeAxisViewport = timeAxisSubGrid.element.getBoundingClientRect();

    const checkElementsContent = () => {
      t.query(`${scheduler.unreleasedEventSelector}`, timeAxisSubGrid.element).forEach(e => {
        const ebox = e.getBoundingClientRect(),
              c = e.querySelector('.b-sch-event-content'),
              cbox = c.getBoundingClientRect(),
              cmargins = DomHelper.getEdgeSize(c, 'margin'); // If the event bar is showing enough, check that the content is fully visible

        if (ebox.right - (cbox.width + cmargins.width) > timeAxisViewport.left + 2) {
          t.isGreaterOrEqual(c.getBoundingClientRect().left - cmargins.left, timeAxisViewport.left);
        }
      });
    };

    await scrollable.scrollTo(scrollable.maxX, null, {
      animate: {
        duration: 1000
      }
    });
    checkElementsContent();
    await scrollable.scrollTo(0, 0); // Wait for render engine to catch up.

    await t.waitForAnimationFrame();
    await t.dragBy({
      source: '.b-sch-event-wrap[data-event-id="2"]',
      delta: [-800, 0],
      dragOnly: true,
      offset: ['80%', '50%']
    }); // After dragging, the elements must be in place

    t.query(`${scheduler.unreleasedEventSelector} > * > .b-sch-event-content`, timeAxisSubGrid.element).forEach(e => {
      t.isGreater(e.getBoundingClientRect().left, e.parentNode.parentNode.getBoundingClientRect().left);
    });
    await t.mouseUp();
  }); // Sequence fails with very quick (faster than a human can do) click sequence after a delete.

  t.it('Monkey-discovered failure vector', t => {
    // This should not throw
    t.chain({
      rightclick: [919, 206]
    }, {
      click: [532, 602]
    }, {
      type: '[LEFT][DELETE]'
    }, {
      click: [435, 658]
    });
  });
});