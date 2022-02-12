"use strict";

StartTest(t => {
  let resourceStore, rangeStore, range1, range2, range3;
  t.beforeEach(t => {
    resourceStore = new ResourceStore({
      data: [{
        id: 1,
        name: 'First resource'
      }, {
        id: 2,
        name: 'Second resource'
      }]
    });
    rangeStore = new ResourceTimeRangeStore({
      resourceStore,
      data: [{
        id: 1,
        resourceId: 1,
        name: 'First zone'
      }, {
        id: 2,
        resourceId: 1,
        name: 'Second zone'
      }, {
        id: 3,
        resourceId: 2,
        name: 'Third zone'
      }, {
        id: 4,
        resourceId: 3,
        name: 'Forth zone'
      }]
    });
    [range1, range2, range3] = rangeStore.records;
  });
  t.it('Resource relation sanity checks', t => {
    t.isDeeply(rangeStore.map(r => r.resource), [resourceStore.first, resourceStore.first, resourceStore.last, {
      id: 3,
      placeHolder: true
    }], 'Correct resource initially');
    t.isDeeply(resourceStore.first.timeRanges, [range1, range2], 'Correct ranges initially');
    t.isDeeply(resourceStore.last.timeRanges, [range3], 'Correct ranges initially'); // Reassign using relation setter

    range1.resource = resourceStore.last;
    t.is(range1.resourceId, resourceStore.last.id, 'Assigning to resource worked'); // Reassign using relation key

    range2.resourceId = 2;
    t.is(range2.resource, resourceStore.last, 'Assigning to resourceId worked');
  });
  t.it('Ranges should get `resourceId=null` when resource is removed', t => {
    resourceStore.first.remove();
    t.is(range1.resourceId, null, 'First zone has resourceId null after removing resource');
    t.is(range2.resourceId, null, 'Second zone has resourceId null after removing resource');
  });
  t.it('Adding range should populate `resource` & `timeRanges`', t => {
    const [zone5] = rangeStore.add({
      id: 5,
      resourceId: 1,
      name: 'Fifth zone'
    });
    t.is(rangeStore.last.resource, resourceStore.first, 'Correct resource');
    t.isDeeply(resourceStore.first.timeRanges, [range1, range2, zone5], 'Correct timeRanges');
  });
});