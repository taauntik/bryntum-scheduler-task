"use strict";

StartTest(t => {
  // https://github.com/bryntum/support/issues/541
  t.it('Should support adding static data to encoded request', t => {
    const crud = new CrudManager({
      encoder: {
        requestData: {
          foo: 'bar'
        }
      }
    });
    t.is(crud.encode({}), '{"foo":"bar"}');
  });
});