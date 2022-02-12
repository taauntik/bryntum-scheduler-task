"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy(); // After scheduler destroy, all menuitems must also have been destroyed

    t.is(bryntum.queryAll('menuitem').length, 0, 'Menu items all destroyed');
  });
  t.it('Sanity', t => {
    class MyMenu extends TimeSpanMenuBase {
      static get defaultConfig() {
        return {
          type: 'myEvent'
        };
      }

      construct(grid, config) {
        t.is(grid.features.myMenu, this, 'This feature is already available');
        super.construct(grid, config);
      }

    }

    GridFeatureManager.registerFeature(MyMenu);
    scheduler = t.getScheduler({
      viewPreset: 'dayAndWeek',
      features: {
        myMenu: true
      }
    });
    t.chain({
      contextmenu: '.b-sch-header-timeaxis-cell'
    });
  });
});