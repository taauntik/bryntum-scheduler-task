/* eslint-disable */
Ext.define('Bryntum.SchedulerPanel', {
    extend   : 'Ext.Panel',
    xtype    : 'schedulerpanel',
    requires : [
        'Ext.panel.Resizer'
    ],
    layout   : 'fit',
    cls      : 'bryntum-scheduler',
    config   : {
        /**
         * Column definitions
         * @type {Object[]}
         * @config
         */
        columns : [],

        /**
         * An object containing Feature configuration objects (or `true` if no configuration is required)
         * keyed by the Feature class name in all lowercase.
         * @type {Object}
         * @config
         */
        features : {
            regionResize : false,
            timeRanges : {
                enableResizing      : true,
                showCurrentTimeLine : true,
                showHeaderElements  : true
            }
        },

        /**
         * A string key used to lookup a predefined {@link Scheduler.preset.ViewPreset} (e.g. 'weekAndDay', 'hourAndDay'),
         * managed by {@link Scheduler.preset.PresetManager}. See {@link Scheduler.preset.PresetManager} for more information.
         * Or a config object for a viewPreset.
         *
         * Options:
         * - 'secondAndMinute'
         * - 'minuteAndHour'
         * - 'hourAndDay'
         * - 'dayAndWeek'
         * - 'weekAndDay'
         * - 'weekAndMonth',
         * - 'monthAndYear'
         * - 'year'
         * - 'manyYears'
         * - 'weekAndDayLetter'
         * - 'weekDateAndMonth'
         * - 'day'
         * - 'week'
         *
         * If passed as a config object, the settings from the viewPreset with the provided 'base' property will be used along
         * with any overridden values in your object.
         *
         * To override:
         * ```javascript
         * viewPreset       : {
         *   base    : 'hourAndDay',
         *   headers : [
         *       {
         *           unit       : 'hour',
         *           increment  : 12,
         *           renderer   : (startDate, endDate, headerConfig, cellIdx) => {
         *               return '';
         *           }
         *       }
         *   ]
         * }
         * ```
         * or set a new valid preset config if the preset is not registered in the {@link Scheduler.preset.PresetManager}.
         *
         * When you use scheduler in weekview mode, this config is used to pick view preset. If passed view preset is not
         * supported by weekview (only 2 supported by default - 'day' and 'week') default preset will be used - 'week'.
         * @type {String|Object}
         * @default
         * @config
         */
        viewPreset : null,

        /**
         * @cfg {Number} weekStartDay A valid JS day index between 0-6 (0: Sunday, 1: Monday etc.) to be considered the start day of the week.
         * When omitted, the week start day is retrieved from `Ext.Date.firstDayOfWeek`.
         * @type {number}
         * @config
         */
        weekStartDay : Ext.Date.firstDayOfWeek,

        /**
         * The start date of the timeline. If omitted, and a TimeAxis has been set, the start date of the provided {@link Scheduler.data.TimeAxis} will be used.
         * If no TimeAxis has been configured, it'll use the start/end dates of the loaded event dataset. If no date information exists in the event data
         * set, it defaults to the current date and time.
         * @type {Date}
         * @config
         */
        startDate : null,

        /**
         * The end date of the timeline. If omitted, it will be calculated based on the {@link #config-startDate} setting and
         * the 'defaultSpan' property of the current {@link Scheduler.view.mixin.SchedulerViewPresets#config-viewPreset}.
         * @type {Date}
         * @config
         */
        endDate : null,

        /**
         * true to snap to resolution increment while interacting with scheduled events.
         * @type {Boolean}
         * @default
         * @config
         */
        snapToIncrement : false,

        /**
         * Affects drag drop and resizing of events when {@link #config-snapToIncrement} is enabled. If set to `true`, dates will be snapped relative to event start.
         * e.g. for a zoom level with timeResolution = { unit: 's', increment: '20' }, an event that starts at 10:00:03 and is dragged would snap its start date to 10:00:23, 10:00:43 etc.
         * When set to `false`, dates will be snapped relative to the timeAxis startDate (tick start) - 10:00:03, 10:00:20, 10:00:40 etc.
         * @type {Boolean}
         * @default
         * @config
         */
        snapRelativeToEventStartDate : false,

        /**
         * Set to true to force the time columns to fit to the available horizontal space.
         * @type {Boolean}
         * @default
         * @config
         */
        forceFit : false,

        /**
         * Create event on double click if scheduler is not in read only mode.
         * Set to false to turn creating off.
         * @type {Boolean}
         * @default
         * @config
         */
        createEventOnDblClick : true,

        /**
         * Set to false if you don't want to allow events overlapping (defaults to true).
         * @type {Boolean}
         * @default
         * @config
         */
        allowOverlap : true,

        /**
         * Show 'Remove event' item in context menu (if enabled and scheduler not read only)
         */
        showRemoveEventInContextMenu : true,

        /**
         * Set to false if you don't event bar DOM updates to animate
         * @type {Boolean}
         * @default
         * @config
         */
        enableEventAnimations : !Ext.isIE11,

        disableGridRowModelWarning : true,

        // does not look good with locked columns and also interferes with event animations
        animateRemovingRows : false,

        /**
         * The {@link Scheduler.data.EventStore} holding the events to be rendered into the scheduler (required)
         * @type {Scheduler.data.EventStore}
         * @config
         */
        eventStore : null,

        /**
         * The {@link Scheduler.data.ResourceStore} holding the resources to be rendered into the scheduler (required)
         * @type {Scheduler.data.ResourceStore}}
         * @config
         */
        resourceStore : null,

        assignmentStore : null,

        dependencyStore : null,

        eventRenderer : null,

        /**
         * Row height in pixels. When set to null, an empty row will be measured and its height will be used as
         * default row height, enabling it to be controlled using CSS
         * @type {Number}
         * @config
         */
        rowHeight : null,

        scheduler : {
            // This Panel is layout: 'fit', but we are not going through the
            // ExtJS child component add pathway which adds required classes
            // for the layout. Ensure that the Scheduler element is sized.
            cls : 'x-layout-fit-item',

            // Disable built-in styling
            eventStyle : null,
            eventColor : null
        }
    },

    exportedProperties: [
        'appendTo',
        'columns',
        'features',
        'viewPreset',
        'weekStartDay',
        'startDate',
        'endDate',
        'snapToIncrement',
        'snapRelativeToEventStartDate',
        'rowHeight',
        'barMargin',
        'forceFit',
        'createEventOnDblClick',
        'allowOverlap',
        'enableEventAnimations',
        'disableGridRowModelWarning',
        'animateRemovingRows',
        'eventStore',
        'resourceStore',
        'assignmentStore',
        'dependencyStore',
        'eventRenderer'
    ],

    initialize : function() {
        var me = this;

        me.callParent();

        me.on({
            single  : true,
            painted : function() {
                var scheduler = me.getScheduler();

                if (!scheduler.rendered) {
                    scheduler.render(me.bodyElement.dom);
                }
            }
        });
    },

    destroy : function() {
        this._scheduler = Ext.destroy(this._scheduler);

        this.callParent();
    },

    /**
     * Returns the Bryntum Scheduler instance which this Panel wraps.
     * @private
     */
    applyScheduler : function(scheduler) {
        var me = this,
            exportedProperties = me.exportedProperties,
            i, prop, value;

        scheduler = Ext.apply({}, scheduler);

        for (i = exportedProperties.length; i-- > 0; /* empty */) {
            prop = exportedProperties[i];
            value = me.getConfig(prop);  // call the getter (important for eventRenderer)

            if (value != null || prop in me.initialConfig) {
                scheduler[prop] = value;
            }
        }

        scheduler = new bryntum.scheduler.Scheduler(scheduler);

        // We export all events fired by the Scheduler.
        scheduler.on({
            catchAll: me.onSchedulerEvent,
            thisObj: me,
            prio: 100
        });

        return scheduler;
    },

    applyEventRenderer : function(eventRenderer) {
        var me = this,
            functionName = eventRenderer;

        // Allow a controller method to be used.
        if (typeof eventRenderer === 'string') {
            eventRenderer = function() {
                return Ext.callback(functionName, null, arguments, 0, me);
            };
        }

        return eventRenderer;
    },

    onSchedulerEvent : function(event) {
        // NOTE: Ext JS events always pass the sender as the first argument
        return this.fireEvent(event.type, this, event);
    },

    statics: {
        createPropertyProxy : function(proto, name) {
            var capName = Ext.String.capitalize(name),
                propName = '_' + name;

            // During construction, we don't want to proxy configs down because the scheduler itself needs to be
            // created first and it will get all the proxied properties to pass to the scheduler constructor.
            proto['get' + capName] = function () {
                var me = this,
                    ret = me[propName],
                    scheduler;

                // NOTE: We destroy the scheduler in destroy(), so always check that we have one
                if (!me.isConfiguring && (/* assignment */ scheduler = me.getScheduler())) {
                    ret = scheduler[name];
                }

                return ret;
            };

            // We don't want to take over the setter since it has special behavior during construction.
            proto['update' + capName] = function (value) {
                var scheduler;

                // NOTE: We destroy the scheduler in destroy(), so always check that we have one
                if (!this.isConfiguring && (/* assignment */ scheduler = this.getScheduler())) {
                    scheduler[name] = value;
                }
            };
        }
    }
}, function(SchedulerPanel) {
    // Create getXxx/setXxx methods to export the Bryntum scheduler's properties
    var proto = SchedulerPanel.prototype,
        exportedProperties = proto.exportedProperties,
        i;

    for (i = exportedProperties.length; i-- > 0; /* empty */) {
        SchedulerPanel.createPropertyProxy(proto, exportedProperties[i]);
    }
});

Ext.define(null, {
    override: 'Ext.field.Select',

    syncValue : function() {
        var me = this,
            store = me.getStore(),
            valueField = me.getValueField(),
            displayField = me.getDisplayField(),
            forceSelection = me.getForceSelection(),
            valueNotFoundText = me.getValueNotFoundText(),
            is, isCleared, isInput, value, matchedRecord, dataObj;

        // If we are not ready to reconcile values for any reason.
        //   We are in the middle of value syncing
        //   Store has not arrived from bind
        //   Store has not been loaded
        //   Store is currently loading
        // Then we cannot reconcile values now, this will be called later
        // when the store arrives, or is loaded.
        if (me.reconcilingValue || !store || !store.isLoaded() || store.hasPendingLoad()) {
            return;
        }

        me.reconcilingValue = true;

        me.getSelection(); // make sure selection config is flushed

        is = {};
        is[me.syncMode] = true;
        value = (isInput = is.input || is.filter) ? me.getInputValue() : me.getValue();
        isCleared = value == null || value === '';

        // Get the record that matches our input value
        if (!isCleared) {
            // Check for >= Ext JS 6.7
            if (me.syncMultiValues && me.getMultiSelect()) {
                return me.syncMultiValues(Ext.Array.from(value));
            }

            matchedRecord = (isInput ? store.byText : store.byValue).get(value);

            if (matchedRecord) {
                if (!matchedRecord.isEntity) {
                    // Since we lookup values not id's there can be multiple matching
                    // records... so if we get back something that isn't a record, it is
                    // an array.
                    matchedRecord = matchedRecord[0];
                }
            }
            else if (!forceSelection) {
                // Not found in the regular indexes which index the store.
                // If we are potentially inserting unmatched values as new "isEntered"
                // records, then find a match in the valueCollection if possible.
                matchedRecord = me.findRecordByValue(value);
            }
        }

        // Either user has typed something (isInput), or we've had a setValue
        // to a value which has no match in the store, and we are not forceSelection: true.
        // We create a new record.
        if (!isCleared && !matchedRecord && !forceSelection) {
            matchedRecord = me.createEnteredRecord(value);
        }
        else {
            // Not in an record.isEntered situation.
            // Value is the typed value.
            if (isInput || is.store) {

                /** This is the fix */
                // If we are syncing due to the store loading, we must still honour autoSelect if we are cleared
                if (is.store && isCleared) {
                    if (me.mustAutoSelect()) {
                        matchedRecord = store.first();

                        if (me.getAutoSelect() === 'initial') {
                            me.setAutoSelect(false);
                        }
                    }
                }
                /** end of fix */
                else if (!matchedRecord && forceSelection) {
                    me.setValue(null);
                    me.setSelection(null);

                    // If we're processing a store load in response to remote filtering
                    // then we must not clear the input value used to kick off that filter.
                    // If they blur the field now, completeEdit will clear the value as unmatched.
                    if (!is.filter) {
                        me.setFieldDisplay();
                    }
                }
            }
            // Value is the set value.
            else {
                if (isCleared) {
                    if (me.mustAutoSelect()) {
                        matchedRecord = store.first();

                        if (me.getAutoSelect() === 'initial') {
                            me.setAutoSelect(false);
                        }
                    } else {
                        me.setSelection(null);
                    }
                }
                // We have a value, so get the record that matches our current value.
                // Note that setValue can
                else if (!matchedRecord && valueNotFoundText) {
                    me.setError(valueNotFoundText);
                }
            }
        }

        if (matchedRecord) {
            me.setSelection(matchedRecord);
        }

        me.reconcilingValue = false;
    }
});
