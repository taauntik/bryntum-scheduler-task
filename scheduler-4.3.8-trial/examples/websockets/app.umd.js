"use strict";

var {
  WidgetHelper,
  DomHelper,
  EventModel,
  Toast,
  Scheduler
} = bryntum.scheduler;
const userNames = ['Austin', 'Bennett', 'Christopher', 'Dominic', 'Eddi', 'Felix', 'Grady', 'Henry', 'Ivan', 'Jack', 'Kane', 'Lambert', 'Mickey', 'Nolan', 'Oliver', 'Princeton', 'Quentin', 'Remi', 'Samson', 'Thomas', 'Urbain', 'Vance', 'Weston', 'Xavier', 'York', 'Zane', 'Ariel', 'Brinley', 'Catarina', 'Diana', 'Emma', 'Fiona', 'Gabriella', 'Harmony', 'Isabella', 'Jillian', 'Katalina', 'Lily', 'Matilda', 'Nadia', 'Olivia', 'Priscilla', 'Quinn', 'Renee', 'Staci', 'Trinity', 'Ursula', 'Victoria', 'Wendy', 'Xenia', 'Yasmine', 'Zoe'],
      eventNames = ['Important client', 'Customer meeting', 'Coffee pause', 'Wedding', 'Visit parents', 'Visit post office', 'Visit to school', 'Presentation', 'Movie'],
      eventIcons = ['b-fa-exclamation-circle', 'b-fa-calendar', 'b-fa-cat', 'b-fa-info', 'b-fa-clock', 'b-fa-calendar', 'b-fa-calendar', 'b-fa-car', 'b-fa-clock', 'b-fa-video', 'b-fa-calendar-alt', 'b-fa-candy-corn', 'b-fa-film', 'b-fa-train'],
      demoServer = /bryntum.com/.test(window.location.hostname) ? 'wss://dev.bryntum.com:8081' : undefined;
/**
 * WebSocketHelper class to support scheduler data sending and receiving via WebSocket.
 * Subscribes to Scheduler events and sends them via WebSocket to server.
 * Receives messages from server and updates scheduler events and resources based on received data.
 */

class WebSocketHelper {
  //region Constructor

  /**
   * Constructs WebSocketHelper class for scheduler instance
   * @param scheduler
   */
  constructor(scheduler, label) {
    const me = this,
          params = me.getUrlParams(),
          autoLogin = params.thumb || params.auto;
    me._scheduler = scheduler;
    me._ignoreChange = false;
    me._protocol = window.location.protocol === 'https' ? 'wss://' : 'ws://';
    me._host = params.wsHost || demoServer || `${me._protocol}${window.location.hostname}:8080`;
    me._userName = params.wsName || WebSocketHelper.random(userNames);
    me._debug = params.debug;
    me._label = label; // Setup event store change listener

    scheduler.eventStore.on({
      change: 'onEventStoreChange',
      addConfirmed: 'onEventStoreAddConfirmed',
      thisObj: me
    }); // Update event properties on create

    scheduler.on({
      beforeEventEdit: me.onBeforeEventEdit,
      eventDrag: me.onEventDrag,
      // Always send an event after a drop, in case it was aborted or dropped back to same position (which does not trigger change)
      afterEventDrop: me.onEventDrop,
      thisObj: me
    });
    me.setConnectedState(false);

    if (autoLogin) {
      me.wsOpen();
    }
  } //endregion
  //region Getters and setters

  /**
   * WebSocket server host name and port
   * @returns {string} host name and port
   */


  get host() {
    return this._host;
  }

  set host(value) {
    this._host = value;
  }
  /**
   * WebSocket user name
   * @returns {String} user name
   */


  get userName() {
    return this._userName;
  }

  set userName(value) {
    this._userName = value;
  }
  /**
   * WebSocket state
   * @returns {string} WebSocket state
   */


  get state() {
    return this._socket ? this._socket.readyState : null;
  } //endregion
  //region WebSocket methods

  /**
   * Send a command to the server
   * @param {Object} data Accepts an object that will be transmitted as a JSON string
   */


  wsSend(data) {
    const socket = this._socket;

    if (socket.readyState === WebSocket.OPEN) {
      const json = JSON.stringify(data);
      this.debugLog(`>>> ${json}`);
      socket.send(json); // For debug and testing purposes

      this._scheduler.trigger('wsSend', {
        data
      });
    }
  }

  /**
   * Send reset data command to the server
   */
  wsResetData() {
    this.wsSend({
      command: 'reset'
    });
  }

  /**
   * Processes received data
   * @data {Object} data JSON data object
   */
  wsReceive(data) {
    const me = this,
          scheduler = me._scheduler,
          eventRecord = data.id ? scheduler.eventStore.getById(data.id) : null;
    me.debugLog(`<<< ${JSON.stringify(data)}`); // For debug and testing purposes

    me._scheduler.trigger('wsReceive', {
      data
    });

    switch (data.command) {
      // User has connected to the server
      case 'hello':
        WidgetHelper.toast(`${data.userName} just connected`);
        break;
      // User has disconnected from the server

      case 'bye':
        WidgetHelper.toast(`${data.userName} disconnected`);
        break;

      case 'users':
        WebSocketHelper.showOnlineUsers(data.users);
        break;
      // User reset the data

      case 'reset':
        if (data.userName === me._userName) {
          WidgetHelper.toast(`Data was reset`);
        } else {
          WidgetHelper.toast(`${data.userName} reset the data`);
        }

        break;
      // Received dataset from server

      case 'dataset':
        Object.assign(scheduler, data.dataset);
        scheduler.unmaskBody();
        me.updateTimeLine();
        break;
      // Updating an event (the record), reflect changes

      case 'updateEvent':
        // Allow dragging & resizing that was disabled by other user performing some operation
        eventRecord.draggable = true;
        eventRecord.resizeable = true;
        Object.keys(data.changes).forEach(key => {
          if (key.endsWith('Date')) {
            data.changes[key] = new Date(data.changes[key]);
          }
        });
        Object.assign(eventRecord, data.changes);
        me.updateTimeLine();
        break;
      // Removing an event

      case 'removeEvent':
        WidgetHelper.toast(`${data.userName} removed "${data.records.map(id => scheduler.eventStore.getById(id).name).join(', ')}"`);
        scheduler.eventStore.remove(data.records);
        break;
      // Adding an event

      case 'addEvent':
        scheduler.eventStore.add(data.records);
        WidgetHelper.toast(`${data.userName} added "${data.records.map(rec => rec.name).join(', ')}"`);
        break;
      // Dragging or resizing, move the local element to match ongoing operation

      case 'dragEvent':
      case 'resizeEvent':
        {
          const element = scheduler.getElementFromEventRecord(eventRecord),
                startDate = new Date(data.startDate),
                startX = scheduler.getCoordinateFromDate(startDate);

          if (!element) {
            break;
          }

          element.dataset.userName = data.userName; // Prevent dragging & resizing while other user is performing an action on the event

          eventRecord.draggable = false;
          eventRecord.resizeable = false;

          if (element) {
            // Dragging, match position
            if (data.command === 'dragEvent') {
              element.classList.add('b-remote-drag');
              DomHelper.setTranslateXY(element.parentElement, startX, data.newY * scheduler.rowHeight);
            } // Resizing, match position + size


            if (data.command === 'resizeEvent') {
              element.classList.add(`b-remote-resize-${data.edge}`);
              const endDate = new Date(data.endDate),
                    endX = scheduler.getCoordinateFromDate(endDate);
              DomHelper.setTranslateX(element.parentElement, startX);
              element.parentElement.style.width = `${Math.abs(endX - startX)}px`;
            }
          }

          break;
        }

      default:
        me.debugLog(`Unhandled message command ${data.command}`);
    }
  }

  /**
   * Connect to the server and start listening for messages
   */
  wsOpen() {
    const me = this;

    if (!me._host || me._host.trim() === '') {
      WidgetHelper.toast(`Server address can not be empty`);
      return;
    }

    if (!me._userName || me.userName.trim() === '') {
      WidgetHelper.toast(`User name can not be empty`);
      return;
    }

    const scheduler = me._scheduler,
          wsHost = (/^wss?:\/\//i.test(me._host) ? '' : me._protocol) + me._host;
    scheduler.maskBody(`<div style="text-align: center">Connecting to<br>${wsHost}</div>`);
    const socket = me._socket = new WebSocket(wsHost);

    socket.onerror = () => {
      scheduler.maskBody('Error connecting to server!');
    }; // Called when socket is established


    socket.onopen = () => {
      WidgetHelper.toast(`Connected to server`);
      me.setConnectedState(true);
      me._label.html = `Login: ${me._userName}`; // User login to server

      scheduler.maskBody('Connecting ...');
      me.wsSend({
        command: 'hello',
        userName: me._userName
      });
      scheduler.maskBody('Requesting data ...');
      me.wsSend({
        command: 'dataset'
      });
    };

    socket.onclose = () => {
      WidgetHelper.toast(`Disconnected from server`);
      me.setConnectedState(false);
    }; // Called when a message is received from the server


    socket.onmessage = async msg => {
      me._ignoreChange = true;

      try {
        me.wsReceive(JSON.parse(msg.data));
        await me._scheduler.project.commitAsync();
      } finally {
        me._ignoreChange = false;
      }
    };
  }

  /**
   * Close socket and disconnect from the server
   */
  wsClose() {
    const scheduler = this._scheduler,
          socket = this._socket;

    if (socket) {
      socket.close();
    }

    if (scheduler) {
      scheduler.events = [];
      scheduler.resources = [];
    }
  }

  //endregion
  //region Helper functions

  /**
   * Decode params from window search string.
   */
  getUrlParams() {
    const params = {},
          pairs = window.location.search.substring(1).split('&');
    pairs.forEach(pair => {
      if (pair !== '') {
        const [key, value = true] = pair.split('=', 2);
        params[key] = value;
      }
    });
    return params;
  }
  /**
   * Updates Scheduler's timeline to fit all events
   */


  updateTimeLine() {
    const scheduler = this._scheduler;

    if (scheduler.events.length > 0) {
      scheduler.setTimeSpan(scheduler.eventStore.min('startDate'), scheduler.eventStore.max('endDate'));
    }
  }
  /**
   * Get random value from array
   * @param array input values
   * @returns {*} random array value
   */


  static random(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  /**
   * Output console debug log
   * @param txt log text
   */


  debugLog(txt) {
    if (this._debug) {
      console.log(txt);
    }
  }
  /**
   * Sets visibility for elements with the specified css class
   * @param {String} cls css class name
   * @param {Boolean} visible flag
   */


  setVisibility(cls, visible) {
    DomHelper.forEachSelector(document.body, cls, element => {
      element.style.display = visible ? 'flex' : 'none';
    });
  }
  /**
   * Sets visual state for login / logout controls
   * @param {Boolean} connected Connected status
   */


  setConnectedState(connected) {
    const scheduler = this._scheduler;
    this.setVisibility('.b-login', !connected);
    this.setVisibility('.b-logout', connected);
    WebSocketHelper.clearOnlineUsers();

    if (!connected) {
      scheduler.events = [];
      scheduler.maskBody('<div style="text-align: center">OFFLINE</div>');
    }
  }
  /**
   * Clears online users
   */


  static clearOnlineUsers() {
    DomHelper.removeEachSelector(document, '.ws-online-user');
  }
  /**
   * Shows online users
   */


  static showOnlineUsers(users) {
    WebSocketHelper.clearOnlineUsers();

    for (const user of users) {
      WidgetHelper.append({
        type: 'widget',
        cls: 'ws-online-user',
        html: `<label>${user}</label>`
      }, 'ws-online-container');
    }
  } //endregion
  // region event listeners


  onEventStoreChange(event) {
    const me = this,
          {
      action,
      changes
    } = event; // Log received change event

    me.debugLog(JSON.stringify(event)); // Filter out non-persistable records.
    // This would be records in the middle of a batch update, or tentative "isCreating" records

    const records = (event.records ? event.records : [event.record]).filter(r => r.isPersistable);

    if (!records.length || me._ignoreChange) {
      return;
    }

    switch (action) {
      case 'update':
        {
          const data = {}; // changes has format { value, old }, we only need value

          Object.keys(changes).forEach(key => {
            data[key] = changes[key].value;
          });
          me.wsSend({
            command: 'updateEvent',
            id: records[0].id,
            changes: data
          });
          break;
        }

      case 'remove':
        me.wsSend({
          command: 'removeEvent',
          records: records.map(rec => rec.id)
        });
        break;

      case 'add':
        me.wsSend({
          command: 'addEvent',
          records
        });
        break;
    }

    me.updateTimeLine();
  }

  onEventStoreAddConfirmed({
    record
  }) {
    this.wsSend({
      command: 'addEvent',
      records: [record]
    });
  }

  onBeforeEventEdit({
    eventRecord
  }) {
    if (!eventRecord.name) {
      eventRecord.name = WebSocketHelper.random(eventNames);
      eventRecord.iconCls = `b-fa ${WebSocketHelper.random(eventIcons)}`;
    }
  }

  onEventDrag({
    eventRecords,
    startDate,
    context
  }) {
    this.wsSend({
      command: 'dragEvent',
      id: eventRecords[0].id,
      startDate,
      newY: context.context.newY / this._scheduler.rowHeight
    });
  }

  onEventDrop({
    eventRecords,
    valid
  }) {
    if (!valid) {
      const eventRec = eventRecords[0];
      this.wsSend({
        command: 'updateEvent',
        id: eventRec.id,
        changes: {
          startDate: eventRec.startDate,
          endDate: eventRec.endDate,
          resourceId: eventRec.resourceId
        }
      });
    }
  } // endregion


}
/**
 * Override generateID method to create unique event ID
 * @returns {string} new event id
 */


EventModel.prototype.generateId = function () {
  const uuid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  return `event-${uuid}`;
}; //region Init Scheduler


const scheduler = new Scheduler({
  appendTo: 'container',
  autoAdjustTimeAxis: false,
  emptyText: '',
  zoomOnMouseWheel: false,
  zoomOnTimeAxisDoubleClick: false,
  features: {
    regionResize: false,
    cellMenu: {
      items: {
        removeRow: false
      }
    }
  },
  responsiveLevels: {
    small: {
      levelWidth: 800,
      rowHeight: 35,
      barMargin: 5
    },
    normal: {
      levelWidth: '*',
      rowHeight: 50,
      barMargin: 10
    }
  },
  viewPreset: {
    base: 'hourAndDay',
    timeResolution: {
      unit: 'minute',
      increment: 5
    }
  },
  columns: [{
    field: 'name',
    text: 'Name',
    width: 70
  }],
  tbar: [{
    type: 'textfield',
    ref: 'wsHost',
    placeholder: 'Address:Port',
    label: 'Host',
    cls: 'b-login',
    inputType: 'url',
    width: 300,
    required: true,

    onChange({
      value
    }) {
      wsHelper.host = value;
    }

  }, {
    type: 'textfield',
    ref: 'wsUserName',
    placeholder: 'Your name',
    label: 'Username',
    cls: 'b-login',

    onChange({
      value
    }) {
      wsHelper.userName = value;
    }

  }, {
    type: 'button',
    ref: 'wsLogin',
    cls: 'b-login b-blue',
    icon: 'b-fa b-fa-sign-in-alt',
    text: 'Login',

    onClick() {
      if (scheduler.widgetMap.wsHost.isValid) {
        wsHelper.wsOpen();
      } else {
        Toast.show('Invalid host');
      }
    }

  }, {
    type: 'widget',
    ref: 'wsLoginLabel',
    html: '<label>:</label>',
    cls: 'b-logout b-login-name'
  }, {
    type: 'button',
    ref: 'wsReset',
    cls: 'b-logout b-blue',
    icon: 'b-fa b-fa-trash',
    text: 'Reset data',

    onClick() {
      wsHelper.wsResetData();
    }

  }, {
    type: 'button',
    ref: 'wsLogout',
    cls: 'b-logout b-red',
    icon: 'b-fa b-fa-sign-out-alt',
    text: 'Logout',

    onClick() {
      wsHelper.wsClose();
    }

  }]
});
const {
  wsHost,
  wsUserName,
  wsLoginLabel
} = scheduler.widgetMap; //endregion
//region Online user container

WidgetHelper.append([{
  type: 'container',
  id: 'ws-online',
  cls: 'b-logout',
  items: [{
    type: 'container',
    cls: 'ws-online-users',
    items: [{
      type: 'widget',
      html: '<label>Who is online:</label>'
    }, {
      type: 'container',
      id: 'ws-online-container'
    }]
  }]
}], 'container'); //endregion
//region Init WebSocketHelper

const wsHelper = scheduler.webSocketHelper = new WebSocketHelper(scheduler, wsLoginLabel);
wsHost.value = wsHelper.host;
wsUserName.value = wsHelper.userName; //endregion