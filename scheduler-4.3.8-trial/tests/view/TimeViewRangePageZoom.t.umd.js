"use strict";

StartTest(t => {
  // TODO: Ask Max to check
  t.it('Should update view range correctly on page zoom', async t => {
    const scheduler = await t.getSchedulerAsync({
      width: 400,
      height: 300
    }); // Browser zoom levels

    const levels = ['0.33', '0.5', '0.67', '0.75', '0.8', '0.9', '1', '1.1', '1.25', '1.5', '1.75'];
    t.chain({
      waitForSelector: '.b-sch-event'
    }, async () => {
      for (let i = 0, l = levels.length; i < l; i++) {
        const scrollable = scheduler.timeAxisSubGrid.scrollable,
              zoom = levels[i];
        document.body.style.zoom = zoom;
        await scheduler.await('visibleRangeChange'); // Scroll view to the right, we need to make sure that float value in left scroll still allows
        // to resolve scheduler end date in maximum right position

        await scrollable.scrollTo(scrollable.maxX);
        await t.waitFor(() => !(scheduler.timeView.endDate - scheduler.endDate));
        t.is(scheduler.timeView.endDate, scheduler.endDate, `View range end is ok on page zoom ${zoom}`);
      }
    });
  });
});