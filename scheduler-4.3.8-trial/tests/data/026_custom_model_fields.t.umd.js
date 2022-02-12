"use strict";

StartTest(async t => {
  t.ok(EventModel.fieldMap.startDate, 'Event#startDate');
  t.ok(EventModel.fieldMap.endDate, 'Event#endDate'); // Differs for core and basic engines

  t.isGreater(EventModel.$meta.fields.defs.length, 18, 'Event fields');

  class MyResource extends ResourceModel {
    static get fields() {
      return [{
        name: 'id',
        dataSource: 'myId'
      }, {
        name: 'name',
        dataSource: 'myName'
      }, {
        name: 'customName',
        dataSource: 'name'
      }];
    }

  }

  const myResourceFields = MyResource.$meta.fields.defs; // Differs for core and basic engines

  t.isGreater(myResourceFields.length, 12, 'Correct total field count for resource');

  class MyEvent extends EventModel {
    static get fields() {
      // Should be ok for implementor to define their own fields with 'our' default names.
      return [{
        name: 'name',
        dataSource: 'myName'
      }, {
        name: 'startDate',
        dataSource: 'myStartDate',
        type: 'date'
      }, {
        name: 'customStartDate',
        dataSource: 'startDate',
        type: 'date'
      }, {
        name: 'resourceId',
        dataSource: 'myResourceId'
      }];
    }

  }

  const resourceStore = new ResourceStore({
    modelClass: MyResource,
    data: [{
      myId: 'c1',
      myName: 'Foo'
    }, {
      myId: 'c2',
      myName: 'Bar'
    }]
  });
  const eventStore = new EventStore({
    modelClass: MyEvent,
    data: [{
      myResourceId: 'c1',
      myName: 'Linda',
      myStartDate: '2010-11-09',
      endDate: '2010-12-09'
    }, {
      myResourceId: 'c2',
      myName: 'Foo',
      myStartDate: '2010-11-09',
      endDate: '2010-12-09'
    }]
  }); // Tie them together

  const project = new ProjectModel({
    eventStore,
    resourceStore
  });
  await project.commitAsync();
  const event = eventStore.first;
  t.is(event.data.myResourceId, 'c1', 'record.data.myResourceId');
  t.is(event.get('myResourceId'), 'c1', "record.get('myResourceId')");
  t.is(event.resourceId, 'c1', 'resource.resourceId');
  t.is(event.get('myStartDate'), new Date(2010, 10, 9), "record.get('myStartDate')");
  t.isDateEqual(event.startDate, new Date(2010, 10, 9), 'record.startDate');
  t.is(event.resource, resourceStore.first, 'event#resource located the resource from an event');
  t.is(resourceStore.first.events[0], eventStore.first, 'resource#events located the correct event'); // TODO: Mention in changelog that this is no longer valid
  //    t.is(resourceStore.first.get('myName'), 'Foo', 'Name found in resource Model fields');

  t.is(resourceStore.first.name, 'Foo', 'Name found in resource Model fields');
  eventStore.on('update', {
    fn({
      record
    }) {
      t.is(record.meta.modified.resourceId, 'c1', 'After "set", The model "modified" object contained the original resource value');
    },

    once: true
  });
  event.resource = 'c2';
  await project.commitAsync();
});