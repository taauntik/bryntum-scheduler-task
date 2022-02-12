"use strict";

//TODO: move test to common
StartTest(t => {
  /*let store;
    t.beforeEach(function(t) {
   store && store.destroy();
   });*/
  t.it('Customizable record should support nested set() calls w/o begin/endEdit() if setting a single field', function (t) {
    let store = new Store({
      data: [{
        a: 'a',
        b: 'b'
      }]
    }); // Single field case

    store.on('update', {
      fn({
        record
      }) {
        t.is(record.meta.modified && record.meta.modified.a, 'a', 'Previous value of field `a` is present and correct before nested set() call');
        record.set('b', 'b-new');
        t.is(record.meta.modified && record.meta.modified.a, 'a', 'Previous value of field `a` is present and correct after nested set() call');
      },

      once: true
    });
    store.first.set('a', 'a-new');
  });
  t.it('Customizable record should support nested set() calls w/o begin/endEdit() if setting multiple fields', function (t) {
    let store = new Store({
      data: [{
        a: 'a',
        b: 'b',
        c: 'c'
      }]
    });
    store.on('update', {
      fn({
        record
      }) {
        t.is(record.meta.modified && record.meta.modified.a, 'a', 'Previous value of field `a` is present and correct before nested set() call');
        t.is(record.meta.modified && record.meta.modified.b, 'b', 'Previous value of field `b` is present and correct before nested set() call');
        record.set('c', 'c-new');
        t.is(record.meta.modified && record.meta.modified.a, 'a', 'Previous value of field `a` is present and correct after nested set() call');
        t.is(record.meta.modified && record.meta.modified.b, 'b', 'Previous value of field `b` is present and correct after nested set() call');
      },

      once: true
    });
    store.first.set({
      a: 'a-new',
      b: 'b-new'
    });
  });
});