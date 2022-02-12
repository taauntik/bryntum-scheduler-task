"use strict";

StartTest(t => {
  let scheduler;
  t.beforeEach(() => {
    scheduler && scheduler.destroy(); // After scheduler destroy, all menuitems must also have been destroyed

    t.is(bryntum.queryAll('menuitem').length, 0, 'Menu items all destroyed');
  });
  t.it('Should show cell context menu with correct text', t => {
    scheduler = new Scheduler({
      appendTo: document.body,
      columns: [{
        field: 'name',
        width: 150
      }],
      resources: [{
        id: 1,
        name: 'Steve'
      }, {
        id: 2,
        name: 'Mike'
      }, {
        id: 3,
        name: 'Mark'
      }, {
        id: 4,
        name: 'Sergey'
      }]
    });
    t.chain({
      contextmenu: '.b-grid-row',
      desc: 'Show context menu for one row'
    }, {
      waitForSelector: '.b-menu-text:contains(Delete)',
      desc: 'Correct cell menu text'
    }, {
      click: '.b-grid-row[data-index=2]',
      desc: 'Select row'
    }, {
      click: '.b-grid-row[data-index=3]',
      options: {
        shiftKey: true
      },
      desc: 'Add row to selection'
    }, {
      contextmenu: null,
      desc: 'Show context menu for two rows'
    }, {
      waitForSelector: '.b-menu-text:contains(Delete)',
      desc: 'Correct cell menu text'
    });
  });
});