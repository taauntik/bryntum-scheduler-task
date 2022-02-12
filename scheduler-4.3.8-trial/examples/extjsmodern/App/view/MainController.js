/* eslint-disable */
Ext.define('App.view.MainController', {
    extend   : 'Ext.app.ViewController',
    alias    : 'controller.main',
    requires : [
        'Bryntum.SchedulerPanel',
        'Bryntum.TimeField',
        'Bryntum.EventEditor',
        'Bryntum.TimeRangeEditor'
    ],

    init : function () {
        var me             = this,
            schedulerPanel = me.lookup('schedulerPanel');

        me.callParent();

        schedulerPanel.on({
            beforeeventedit : function (sender, event) {
                me.editEvent(event.eventRecord, event.eventElement);

                return false;
            }
        });

        Ext.mixin.Observable.capture(schedulerPanel, function (eventName, event) {
            // Be a little selective. Log Scheduler events, and not the "before" ones.
            if (event.source && !eventName.startsWith('before')) {
                //console.log(eventName, ' ', event);
            }
        });
    },

    eventRenderer : function (renderData) {
        renderData.renderData.style = 'background-color:' + renderData.resourceRecord.color;

        return Ext.htmlEncode(renderData.eventRecord.name);
    },

    addTask : function (startDate, resourceRecord) {
        var editor         = this.getEventEditor(),
            schedulerPanel = this.lookup('schedulerPanel'),
            editorForm     = this.lookup('editorForm');

        if (!schedulerPanel.getResourceStore().count) {
            Ext.toast('There is no resource available');
            return;
        }

        editor.setAnchor(false);
        editor.setTitle('New Task Details');
        editorForm.reset();
        editorForm.setValues({
            startDate : Ext.Date.clone(schedulerPanel.getStartDate()),
            startTime : '09:00',
            endDate   : Ext.Date.clone(schedulerPanel.getStartDate()),
            endTime   : '10:00'
        });
        editorForm.clearErrors();
        editor.setActions({
            cancel : true,
            save   : true
        });
        editor.mode = 'create';
        editor.center();
        editor.show();
        editor.focus();
    },

    addTimeRange : function () {
        var editor         = this.getTimeRangeEditor(),
            schedulerPanel = this.lookup('schedulerPanel'),
            editorForm     = this.lookup('timerangeeditorForm');

        if (!schedulerPanel.getResourceStore().count) {
            Ext.toast('There is no resource available');
            return;
        }

        editorForm.setValues({
            name      : 'Fika',
            startDate : Ext.Date.clone(schedulerPanel.getStartDate()),
            startTime : '10:00',
            endDate   : Ext.Date.clone(schedulerPanel.getStartDate()),
            endTime   : '11:00'
        });

        editor.show();
        editor.focus();
    },

    saveTimeRange : function () {
        var editor         = this.getTimeRangeEditor(),
            editorForm     = this.lookup('timerangeeditorForm'),
            schedulerPanel = this.lookup('schedulerPanel'),
            values         = editorForm.getValues();

        editorForm.validate();
        if (editorForm.isValid()) {
            values.startDate = new Date(Ext.Date.clearTime(values.startDate).valueOf() + values.startTime.valueOf());
            values.endDate = new Date(Ext.Date.clearTime(values.endDate).valueOf() + values.endTime.valueOf());

            schedulerPanel.getScheduler().features.timeRanges.store.add(values);
            editor.hide();
        }
    },

    editEvent : function (event, target) {
        var me     = this,
            editor = me.getEventEditor();

        // Work round 6.5 modern bug where first show does not lay out properly
        if (!me.workedAroundShowByBug) {
            editor.show({
                animation : false,
                alignment : {
                    component : target,
                    alignment : 't-b'
                }
            });
            editor.hide(false);
            me.workedAroundShowByBug = true;
        }

        // Note: This would need to use the assignmentStore in multi-assignment mode.
        if (event.isCreating) {
            editor.setTitle('New Event');
            editor.mode = 'create';
            editor.setActions({
                cancel : true,
                delete : false,
                save   : true
            });
        }
        else {
            editor.setTitle('Edit Event');
            editor.mode = 'edit';
            editor.setActions({
                cancel : true,
                delete : true,
                save   : true
            });
        }
        editor.setAnchor(true);
        editor.setEvent(event);


        editor.showBy(target, 't-b?');
        editor.focus();
    },

    cancelEdit : function () {
        // A event created using drag create or dbl click is added early to store, should be removed on cancel
        if (this.getEventEditor().mode === 'create') {
            this.deleteTask();
        }
        else {
            this.eventEditor.hide();
        }
    },

    deleteTask : function () {
        var editor         = this.getEventEditor(),
            schedulerPanel = this.lookup('schedulerPanel');

        schedulerPanel.getEventStore().remove(editor.getEvent());

        editor.hide();
    },

    saveTask : function () {
        var editor         = this.getEventEditor(),
            editorForm     = this.lookup('editorForm'),
            schedulerPanel = this.lookup('schedulerPanel'),
            values         = editorForm.getValues();

        editorForm.validate();
        if (editorForm.isValid()) {
            values.startDate = new Date(Ext.Date.clearTime(values.startDate).valueOf() + values.startTime.valueOf());
            values.endDate = new Date(Ext.Date.clearTime(values.endDate).valueOf() + values.endTime.valueOf());

            if (editor.mode === 'create') {
                editorForm.validate();
                if (editorForm.isValid()) {
                    schedulerPanel.getEventStore().add(values);
                    editor.hide();
                }
            }
            else if (editor.mode === 'edit') {
                editor.getEvent().set(values);
                editor.hide();
            }
        }
    },

    getEventEditor : function () {
        var editor = this.eventEditor;

        if (!editor) {
            editor = this.eventEditor = this.getView().add(new Bryntum.EventEditor({
                reference     : 'editor',
                hideOnMaskTap : true,
                resourceStore : {
                    autoLoad : true,
                    proxy    : {
                        type : 'ajax',
                        url  : 'data/resources.json'
                    }
                }
            }));
        }

        return editor;
    },

    getTimeRangeEditor : function () {
        var editor = this.timeRangeEditor;

        if (!editor) {
            editor = this.timeRangeEditor = this.getView().add(new Bryntum.TimeRangeEditor({
                reference     : 'timerangeeditor',
                hideOnMaskTap : true
            }));
        }

        return editor;
    }
});
