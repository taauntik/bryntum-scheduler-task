"use strict";

StartTest(t => {
  let project;
  t.beforeEach(() => {
    var _project;

    (_project = project) === null || _project === void 0 ? void 0 : _project.destroy();
  });
  t.it('assignment store cache iteration time increases linearly when adding events (single resource)', async t => {
    project = new ProjectModel({
      resourcesData: [{
        id: 1,
        name: 'Resource'
      }],
      eventsData: [{
        id: 1,
        resourceId: 1,
        startDate: '2021-07-13',
        endDate: '2021-07-14'
      }]
    });

    async function measure(eventCount) {
      const events = [];

      for (let i = 1; i <= eventCount; i++) {
        events.push({
          id: i,
          resourceId: 1,
          startDate: new Date(2021, 6, 13),
          endDate: new Date(2021, 6, 14)
        });
      }

      project.eventStore.clear();
      project.assignmentStore.clear();
      await project.commitAsync();
      const spy = t.spyOn(project.assignmentStore.modelClass.prototype, 'getCurrentOrProposed');
      project.eventStore.add(events);
      const result = spy.calls.count();
      await project.commitAsync();
      return result;
    }

    let base,
        pass = true;

    for (let i = 1; i < 4; i++) {
      const result = await measure(i * 500);

      if (i === 1) {
        base = result;
      } else {
        // Values is within 10 percent of base * n events
        if (result - base * i > result * 0.1) {
          pass = false;
          t.isApprox(result, base * i, result * 0.1, `It took X*${Math.round(result * 100 / base) / 100} more calls to add X*${i} events`);
        }
      }
    }

    if (pass) {
      t.pass('Call count grows linearly');
    }
  });
  t.it('assignment store cache iteration time increases linearly when adding events (multiple resources)', async t => {
    project = new ProjectModel({
      resourcesData: [{
        id: 1,
        name: 'Resource'
      }],
      eventsData: [{
        id: 1,
        resourceId: 1,
        startDate: '2021-07-13',
        endDate: '2021-07-14'
      }]
    });

    async function measure(eventCount) {
      const events = [],
            resources = [];

      for (let i = 1; i <= eventCount; i++) {
        events.push({
          id: i,
          resourceId: i,
          startDate: new Date(2021, 6, 13),
          endDate: new Date(2021, 6, 14)
        });
        resources.push({
          id: i
        });
      }

      project.eventStore.clear();
      project.assignmentStore.clear();
      project.resourceStore.add(resources);
      await project.commitAsync();
      const spy = t.spyOn(project.assignmentStore.modelClass.prototype, 'getCurrentOrProposed');
      project.eventStore.add(events);
      const result = spy.calls.count();
      await project.commitAsync();
      return result;
    }

    let base,
        pass = true;

    for (let i = 1; i < 4; i++) {
      const result = await measure(i * 500);

      if (i === 1) {
        base = result;
      } else {
        // Values is within 10 percent of base * n events
        if (result - base * i > result * 0.1) {
          pass = false;
          t.isApprox(result, base * i, result * 0.1, `It took X*${Math.round(result * 100 / base) / 100} more calls to add X*${i} events`);
        }
      }
    }

    if (pass) {
      t.pass('Call count grows linearly');
    }
  });
  t.it('assignment store cache iteration time increases linearly when adding resources', async t => {
    project = new ProjectModel({
      resourcesData: [{
        id: 1,
        name: 'Resource'
      }],
      eventsData: [{
        id: 1,
        resourceId: 1,
        startDate: '2021-07-13',
        endDate: '2021-07-14'
      }]
    });

    async function measure(eventCount) {
      const events = [],
            resources = [];

      for (let i = 1; i <= eventCount; i++) {
        events.push({
          id: i,
          resourceId: i,
          startDate: new Date(2021, 6, 13),
          endDate: new Date(2021, 6, 14)
        });
        resources.push({
          id: i,
          name: `Resource ${i}`
        });
      }

      project.eventStore.clear();
      project.resourceStore.clear();
      project.assignmentStore.clear();
      project.eventStore.add(events);
      await project.commitAsync();
      const spy = t.spyOn(project.assignmentStore.modelClass.prototype, 'getCurrentOrProposed');
      project.resourceStore.add(resources);
      const result = spy.calls.count();
      await project.commitAsync();
      return result;
    }

    let base,
        pass = true;

    for (let i = 1; i < 4; i++) {
      const result = await measure(i * 500);

      if (i === 1) {
        base = result;
      } else {
        // Values is within 10 percent of base * n events
        if (result - base * i > result * 0.1) {
          pass = false;
          t.isApprox(result, base * i, result * 0.1, `It took X*${Math.round(result * 100 / base) / 100} more calls to add X*${i} resources`);
        }
      }
    }

    if (pass) {
      t.pass('Call count grows linearly');
    }
  });
  t.it('project listeners count is sane', async t => {
    project = new ProjectModel({
      resourcesData: [{
        id: 1,
        name: 'Resource'
      }],
      eventsData: [{
        id: 1,
        resourceId: 1,
        startDate: '2021-07-13',
        endDate: '2021-07-14'
      }]
    });
    const spy = t.spyOn(project, 'on');

    async function measure(eventCount) {
      const events = [];

      for (let i = 1; i <= eventCount; i++) {
        events.push({
          id: i,
          resourceId: 1,
          startDate: new Date(2021, 6, 13),
          endDate: new Date(2021, 6, 14)
        });
      }

      project.eventStore.clear();
      project.assignmentStore.clear();
      await project.commitAsync();
      project.eventStore.add(events);
      await project.commitAsync();
    }

    for (let i = 1; i < 4; i++) {
      await measure(i * 500);
    }

    t.expect(spy).toHaveBeenCalled('<100');
  });
  t.it('time to add events to populated store grows linear', async t => {
    project = new ProjectModel({
      resourcesData: [{
        id: 1,
        name: 'Resource'
      }],
      eventsData: [{
        id: 1,
        resourceId: 1,
        startDate: '2021-07-13',
        endDate: '2021-07-14'
      }]
    });
    let proto = project.assignmentStore.modelClass.prototype,
        descriptor,
        eventResourceKeyCounter = 0;

    while (!descriptor && (proto = Object.getPrototypeOf(proto))) {
      descriptor = Object.getOwnPropertyDescriptor(proto, 'eventResourceKey');
    }

    if (descriptor) {
      Object.defineProperty(proto, 'eventResourceKey', {
        get() {
          ++eventResourceKeyCounter;
          return descriptor.get.apply(this);
        }

      });
    }

    async function measure(eventCount) {
      const events = [];

      for (let i = 1; i <= eventCount; i++) {
        events.push({
          resourceId: 1,
          startDate: new Date(2021, 6, 13),
          endDate: new Date(2021, 6, 14)
        });
      }

      project.eventStore.clear();
      project.assignmentStore.clear();
      await project.commitAsync();
      project.eventStore.add(events);
      await project.commitAsync();
      eventResourceKeyCounter = 0;
      project.eventStore.add(events);
      const result = eventResourceKeyCounter;
      await project.commitAsync();
      return result;
    }

    let base,
        pass = true;

    for (let i = 1; i < 4; i++) {
      const result = await measure(i * 500);

      if (i === 1) {
        base = result;
      } else {
        // Values is within 10 percent of base * n events
        if (result - base * i > result * 0.1) {
          pass = false;
          t.isApprox(result, base * i, result * 0.1, `It took X*${Math.round(result * 100 / base) / 100} more calls to add X*${i} events`);
        }
      }
    }

    if (pass) {
      t.pass('Call count grows linearly');
    }
  });
});