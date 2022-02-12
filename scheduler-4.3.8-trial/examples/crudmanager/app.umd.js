"use strict";

var {
  Scheduler,
  WidgetHelper,
  Toast
} = bryntum.scheduler;
const cookie = 'PHPSESSID=scheduler-crudmanager';

if (!document.cookie.includes(cookie)) {
  document.cookie = `${cookie}-${Math.random().toString(16).substring(2)}`;
}

const scheduler = new Scheduler({
  appendTo: 'container',
  startDate: new Date(2018, 4, 21, 6),
  endDate: new Date(2018, 4, 21, 18),
  viewPreset: 'hourAndDay',
  rowHeight: 50,
  barMargin: 5,
  eventColor: 'orange',
  eventStyle: 'colored',
  // Sync mask is disabled, crud status is displayed in the toolbar.  When "b-sch-committing" class is supported by
  // CrudManager, special CSS style can be applied to event element to show syncing is in progress.
  // https://github.com/bryntum/support/issues/2720
  syncMask: null,
  loadMask: null,
  features: {
    // Configure event editor to display 'brand' as resource name
    eventEdit: {
      resourceFieldConfig: {
        displayField: 'car'
      }
    }
  },
  columns: [{
    text: 'Id',
    field: 'id',
    width: 100,
    editor: false,
    hidden: true
  }, {
    text: 'Car',
    field: 'car',
    width: 150
  }, {
    type: 'date',
    text: 'Modified',
    field: 'dt',
    width: 90,
    format: 'HH:mm:ss',
    editor: false,
    hidden: true
  }],
  crudManager: {
    resourceStore: {
      // Add some custom fields
      fields: ['car', 'dt']
    },
    eventStore: {
      // Add a custom field and redefine durationUnit to default to hours
      fields: ['dt', {
        name: 'durationUnit',
        defaultValue: 'hour'
      }]
    },
    // This config enables response validation and dumping of found errors to the browser console.
    // It's meant to be used as a development stage helper only so please set it to false for production systems.
    validateResponse: true,
    transport: {
      load: {
        url: 'php/read.php',
        paramName: 'data'
      },
      sync: {
        url: 'php/sync.php'
      }
    },
    autoLoad: true,
    autoSync: true,
    onRequestFail: event => {
      const {
        requestType,
        response
      } = event,
            serverMessage = response && response.message,
            exceptionText = `Action "${requestType}" failed. ${serverMessage ? ` Server response: ${serverMessage}` : ''}`;
      Toast.show({
        html: exceptionText,
        color: 'b-red',
        style: 'color:white',
        timeout: 3000
      });
      console.error(exceptionText);
    }
  },
  tbar: [{
    type: 'button',
    ref: 'reloadButton',
    icon: 'b-fa b-fa-sync',
    text: 'Reload scheduler',

    onAction() {
      scheduler.crudManager.load().then(() => WidgetHelper.toast('Data reloaded')).catch(() => WidgetHelper.toast('Loading failed'));
    }

  }, {
    type: 'button',
    ref: 'resetButton',
    color: 'b-red',
    icon: 'b-fa b-fa-recycle',
    text: 'Reset database',

    onAction() {
      scheduler.crudManager.load({
        // Adding a query string parameter "...&reset=1" to let server know that we want to reset the database
        request: {
          params: {
            reset: 1
          }
        }
      }).then(() => WidgetHelper.toast('Database was reset')).catch(() => WidgetHelper.toast('Database reset failed'));
    }

  }],
  bbar: [{
    type: 'widget',
    ref: 'crudStatus',
    width: 300,
    html: ''
  }]
});
const statusField = scheduler.widgetMap.crudStatus;
scheduler.crudManager.on({
  beforeLoad() {
    statusField.html = 'Loading <i class="b-fa b-fa-spinner"></i>';
  },

  load() {
    statusField.html = 'Data loaded <i class="b-fa b-fa-check-circle"></i>';
  },

  loadFail() {
    statusField.html = 'Data loading failed! <i class="b-fa b-fa-times-circle"></i>';
  },

  beforeSync() {
    statusField.html = 'Saving <i class="b-fa b-fa-spinner"></i>';
  },

  sync() {
    statusField.html = 'Changes saved <i class="b-fa b-fa-check-circle"></i>';
  },

  syncFail() {
    statusField.html = 'Saving changes failed <i class="b-fa b-fa-times-circle"></i>';
  },

  hasChanges() {
    statusField.html = 'Data modified <i class="b-fa b-fa-user-edit"></i>';
  }

});