/* eslint-disable */
Ext.define('Bryntum.EventEditor', {
    extend : 'Ext.Dialog',
    xtype  : 'eventeditor',

    defaultFocus: 'textfield',

    title: 'Edit Task',

    showAnimation : false,
    hideAnimation : false,

    closeAction : 'hide',
    modal       : false,
    config      : {
        /**
         * An event record to load into the form.
         */
        event: null,

        actions: null,

        resourceStore: null
    },

    layout: 'fit',

    draggable: false,

    items: [{
        xtype: 'formpanel',
        reference: 'editorForm',
        defaults: {
            required : true
        },
        items: [{
            xtype: 'textfield',
            name: 'name',
            label: 'Name'
        }, {
            xtype: 'selectfield',
            label: 'Assigned',
            name: 'resourceId',
            reference: 'resourceId',
            autoSelect: true,
            valueField: 'id',
            displayField: 'name'
        }, {
            xtype: 'fieldcontainer',
            label: 'Start',
            layout: 'hbox',
            items: [{
                xtype: 'datefield',
                name: 'startDate',
                flex : 6,
                margin : '0 10 0 0',
                required : true
            }, {
                xtype: 'timefield',
                name: 'startTime',
                flex: 4,
                required : true
            }]
        }, {
            label: 'Start',
            xtype: 'fieldcontainer',
            layout: 'hbox',
            items: [{
                xtype: 'datefield',
                name: 'endDate',
                flex : 6,
                margin : '0 10 0 0',
                required : true
            }, {
                xtype: 'timefield',
                name: 'endTime',
                flex: 4,
                required : true
            }]
        }]
    }],

    // Link up the ENTER key to saving the task
    keyMap: {
        ENTER: 'saveTask'
    },

    bbar: {
        layout: {
            pack: 'space-between'
        },
        items: [{
            reference: 'deleteButton',
            text: 'Delete',
            handler: 'deleteTask'
        }, {
            reference: 'cancelButton',
            text: 'Cancel',
            handler: 'cancelEdit'
        }, {
            reference: 'saveButton',
            text: 'Save',
            handler: 'saveTask'
        }]
    },

    onFocusLeave: function(e) {
        this.callParent([e]);
        this.hide();
    },

    beforeHide: function() {
        this.callParent();
        var p = this.eventProxyElement;

        // If we're aligned to a proxy for a newly created event, ensure it's deleted.
        if (p) {
            this.eventProxyElement = null;
            p.parentNode.removeChild(p);
        }
    },

    updateEvent: function(event) {
        var form = this.child('formpanel');

        if (event) {
            form.setValues({
                name: event.name,
                resourceId: event.resource.id,
                startDate: event.startDate,
                startTime: Ext.Date.format(event.startDate, 'H:i'),
                endDate: event.endDate,
                endTime: Ext.Date.format(event.endDate, 'H:i')
            });
        }
        else {
            form.reset();
            form.clearErrors();
        }
    },

    updateActions: function(actions) {
        var bbar = this.getBbar();

        bbar.down('[reference=deleteButton]')[actions.delete ? 'show' : 'hide']();
        bbar.down('[reference=cancelButton]')[actions.cancel ? 'show' : 'hide']();
        bbar.down('[reference=saveButton]')[actions.save ? 'show' : 'hide']();
    },

    updateResourceStore: function(resourceStore) {
        this.down('[reference=resourceId]').setStore(resourceStore);
    }
});
