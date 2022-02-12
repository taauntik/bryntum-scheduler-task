"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    var _scheduler;

    (_scheduler = scheduler) === null || _scheduler === void 0 ? void 0 : _scheduler.destroy();
  });
  t.it('Should stop dragdrop gracefully on 2nd mousedown', async t => {
    document.body.style = '';
    document.body.innerHTML = `
        <div id="container" style="width: 600px; height:400px;">
            <bryntum-scheduler
                    stylesheet="../build/scheduler.stockholm.css"
                    fa-path="../build/fonts"
                    data-min-height="20em"
                    data-view-preset="weekAndDay"
                    data-start-date="2011-01-03"
                    data-end-date="2011-01-09">
                <column data-field="name">Name</column>
                <data>
                    <events>
                        <data data-id="1" data-name="Click me" data-icon-cls="b-fa b-fa-mouse-pointer" data-resource-id="r1" data-start-date="2011-01-04" data-end-date="2011-01-05"></data>
                    </events>
                    <resources>
                        <data data-id="r1" data-name="Daniel"></data>
                        <data data-id="r2" data-name="Mark"></data>
                    </resources>
                </data>
            </bryntum-scheduler>
        </div>`;
    await t.waitFor(() => scheduler = bryntum.query('scheduler'));
    scheduler.on({
      beforeEventDropFinalize: async ({
        context
      }) => {
        context.async = true;
        await t.waitFor(100);
        context.finalize(true);
      }
    });
    await t.mouseDown('bryntum-scheduler -> .b-sch-event');
    await t.moveMouseBy([100, 40]);
    await t.mouseDown();
    await t.mouseUp();
    await t.waitFor(() => {
      const el = t.rect('bryntum-scheduler -> [data-event-id="1"]'),
            elRect = new Rectangle(el.left, el.top, el.width, el.height),
            rowEl = t.rect('bryntum-scheduler -> .b-timeaxissubgrid [data-id="r2"]'),
            rowRect = new Rectangle(rowEl.left, rowEl.top, rowEl.width, rowEl.height);
      return rowRect.contains(elRect);
    });
  }); // Cannot emulate blurring window in FF

  if (!t.bowser.firefox) {
    t.it('Should stop dragdrop gracefully on window blur', async t => {
      document.body.style = '';
      document.body.innerHTML = `
        <div id="container" style="width: 600px; height:400px;">
            <bryntum-scheduler
                    stylesheet="../build/scheduler.stockholm.css"
                    fa-path="../build/fonts"
                    data-min-height="20em"
                    data-view-preset="weekAndDay"
                    data-start-date="2011-01-03"
                    data-end-date="2011-01-09">
                <column data-field="name">Name</column>
                <data>
                    <events>
                        <data data-id="1" data-name="Click me" data-icon-cls="b-fa b-fa-mouse-pointer" data-resource-id="r1" data-start-date="2011-01-04" data-end-date="2011-01-05"></data>
                    </events>
                    <resources>
                        <data data-id="r1" data-name="Daniel"></data>
                        <data data-id="r2" data-name="Mark"></data>
                    </resources>
                </data>
            </bryntum-scheduler>
        </div>`;
      await t.waitFor(() => scheduler = bryntum.query('scheduler'));
      scheduler.on({
        beforeEventDropFinalize: async ({
          context
        }) => {
          context.async = true;
          await t.waitFor(100);
          context.finalize(true);
        }
      });
      await t.mouseDown('bryntum-scheduler -> .b-sch-event');
      await t.moveMouseBy([100, 40]);
      const {
        defaultView
      } = scheduler.element.ownerDocument;
      const promise = new Promise(resolve => defaultView.addEventListener('blur', () => resolve()));
      defaultView.parent.focus();
      await promise;
      await t.waitFor(() => {
        const el = t.rect('bryntum-scheduler -> [data-event-id="1"]'),
              elRect = new Rectangle(el.left, el.top, el.width, el.height),
              rowEl = t.rect('bryntum-scheduler -> .b-timeaxissubgrid [data-id="r1"]'),
              rowRect = new Rectangle(rowEl.left, rowEl.top, rowEl.width, rowEl.height);
        return rowRect.contains(elRect);
      });
    });
  }
});