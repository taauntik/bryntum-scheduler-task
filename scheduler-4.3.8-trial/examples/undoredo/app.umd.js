"use strict";

var {
  Scheduler,
  ResourceModel,
  EventModel,
  DependencyModel,
  StringHelper
} = bryntum.scheduler;

class Gate extends ResourceModel {
  static get fields() {
    return ['capacity'];
  }

}

new Scheduler({
  appendTo: 'container',
  features: {
    tree: true,
    regionResize: true,
    dependencies: true
  },
  rowHeight: 45,
  barMargin: 5,
  columns: [{
    type: 'tree',
    text: 'Name',
    width: 200,
    field: 'name'
  }, {
    type: 'number',
    text: 'Capacity',
    width: 80,
    field: 'capacity'
  }],
  startDate: new Date(2017, 11, 2, 8),
  viewPreset: 'hourAndDay',
  enableUndoRedoKeys: true,
  crudManager: {
    autoLoad: true,
    resourceStore: {
      modelClass: Gate
    },
    transport: {
      load: {
        url: 'data/data.json'
      }
    },
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true
  },
  // Scheduler always has a Project instance internally, we need to configure its internal StateTrackingManager
  // so that the UndoRedo widget gets customized titles in its transaction dropdown.
  project: {
    stm: {
      autoRecord: true,

      getTransactionTitle(transaction) {
        const lastAction = transaction.queue[transaction.queue.length - 1];
        let {
          type,
          model
        } = lastAction;

        if (lastAction.modelList && lastAction.modelList.length) {
          model = lastAction.modelList[0];
        }

        let title = 'Transaction ' + this.position;

        if (type === 'UpdateAction' && model instanceof EventModel) {
          title = 'Edit flight ' + model.name;
        } else if (type === 'UpdateAction' && model instanceof ResourceModel) {
          title = 'Edit gate ' + model.name;
        } else if (type === 'RemoveAction' && model instanceof EventModel) {
          title = 'Remove flight ' + model.name;
        } else if (type === 'RemoveAction' && model instanceof ResourceModel) {
          title = 'Remove gate ' + model.name;
        } else if (type === 'AddAction' && model instanceof EventModel) {
          title = 'Add flight ' + model.name;
        } else if (type === 'AddAction' && model instanceof DependencyModel) {
          title = StringHelper.xss`Link ${model.fromEvent.name} -> ${model.toEvent.name}`;
        }

        return title;
      }

    }
  },

  eventRenderer({
    eventRecord,
    resourceRecord,
    renderData
  }) {
    renderData.iconCls = 'b-fa b-fa-plane';

    if (resourceRecord.isLeaf) {
      renderData.eventColor = 'blue';
      return StringHelper.encodeHtml(eventRecord.name);
    } else {
      renderData.eventColor = 'orange';
      return '';
    }
  },

  tbar: [{
    type: 'undoredo',
    icon: 'b-fa-undo',
    items: {
      transactionsCombo: {
        width: 250,

        displayValueRenderer(value, combo) {
          const stmPos = combo.up('panel', true).project.stm.position || 0;
          return stmPos + ' undo actions / ' + (this.store.count - stmPos) + ' redo actions';
        }

      }
    }
  }]
});