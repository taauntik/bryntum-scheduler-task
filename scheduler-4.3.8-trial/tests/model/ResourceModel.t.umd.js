"use strict";

StartTest(t => {
  //region Data
  t.it('Should return empty string for intials if there is no name', async t => {
    const resource = new ResourceModel();
    t.is(resource.initials, '', 'Empty string');
    resource.name = 'foo';
    t.is(resource.initials, 'f', 'f');
    resource.name = 'foo bar';
    t.is(resource.initials, 'fb', 'fb');
  });
});