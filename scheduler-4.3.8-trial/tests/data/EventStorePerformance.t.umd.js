"use strict";

StartTest(t => {
  let project;
  t.beforeEach(() => {
    var _project;

    (_project = project) === null || _project === void 0 ? void 0 : _project.destroy();
  }); // https://github.com/bryntum/support/issues/3131
  // Problem comes from SharedEventStoreMixin which generated assignments on the fly thus it is not reproducible in
  // Scheduling Engine

  t.it('Should add events to the store', async t => {
    project = new ProjectModel({
      destroyStores: true,
      resourcesData: [{
        id: 1,
        name: 'Resource 1'
      }]
    });
    await project.commitAsync();
    const eventsData = [];

    for (let i = 1; i < 1000; i++) {
      eventsData.push({
        id: i,
        resourceId: 'r1',
        startDate: new Date(2021, 6, 5),
        endDate: new Date(2021, 6, 6)
      });
    }

    const assignmentIndicesSpy = t.spyOn(project.assignmentStore.storage, 'rebuildIndices');
    project.eventStore.add(eventsData);
    await project.commitAsync();
    t.expect(assignmentIndicesSpy).toHaveBeenCalled('<10');
  });
  t.it('Should load events to the store', async t => {
    project = new ProjectModel({
      destroyStores: true,
      resourcesData: [{
        id: 1,
        name: 'Resource 1'
      }]
    });
    await project.commitAsync();
    const eventsData = [];

    for (let i = 1; i < 1000; i++) {
      eventsData.push({
        id: i,
        resourceId: 'r1',
        startDate: new Date(2021, 6, 5),
        endDate: new Date(2021, 6, 6)
      });
    }

    const assignmentIndicesSpy = t.spyOn(project.assignmentStore.storage, 'rebuildIndices');
    await project.eventStore.loadDataAsync(eventsData);
    t.expect(assignmentIndicesSpy).toHaveBeenCalled('<10');
  });
  t.it('Load and add take comparable time to finish', async t => {
    project = new ProjectModel({
      destroyStores: true,
      resourcesData: [{
        id: 1,
        name: 'Resource 1'
      }]
    });
    await project.commitAsync();
    const eventsData = [];

    for (let i = 1; i < 1000; i++) {
      eventsData.push({
        id: i,
        resourceId: 'r1',
        startDate: new Date(2021, 6, 5),
        endDate: new Date(2021, 6, 6)
      });
    }

    let now = performance.now();
    project.eventStore.add(eventsData);
    await project.commitAsync();
    const addTime = performance.now() - now;
    project.destroy();
    project = new ProjectModel({
      destroyStores: true,
      resourcesData: [{
        id: 1,
        name: 'Resource 1'
      }]
    });
    await project.commitAsync();
    now = performance.now();
    await project.eventStore.loadDataAsync(eventsData);
    const loadTime = performance.now() - now;
    t.isApprox(addTime, loadTime, loadTime * 10, 'store.add is within 1 order of magnitude of store.loadDataAsync');
  });

  https: //github.com/bryntum/support/issues/3219
  t.it('Event replace take comparable time to finish', async t => {
    project = new ProjectModel({
      destroyStores: true,
      resourcesData: [{
        id: 1,
        name: 'Resource 1'
      }]
    });
    await project.commitAsync();
    const eventsData = [];

    for (let i = 1; i < 1000; i++) {
      eventsData.push({
        id: i,
        resourceId: 'r1',
        startDate: new Date(2021, 6, 5),
        endDate: new Date(2021, 6, 6)
      });
    }

    project.eventStore.add(eventsData);
    await project.commitAsync();
    let now = performance.now();
    project.eventStore.add(eventsData);
    await project.commitAsync();
    const addTime = performance.now() - now;
    project.destroy();
    project = new ProjectModel({
      destroyStores: true,
      resourcesData: [{
        id: 1,
        name: 'Resource 1'
      }]
    });
    await project.commitAsync();
    now = performance.now();
    await project.eventStore.loadDataAsync(eventsData);
    const loadTime = performance.now() - now;
    t.isApprox(addTime, loadTime, loadTime * 10, 'store.add is within 1 order of magnitude of store.loadDataAsync');
  });
});