({
    queueAction : function(method, args, callback) {
        const action = this.component.get(method);
        args && action.setParams(args);
        action.setCallback(this, callback);
        $A.enqueueAction(action);
    },

    createScheduler : function(component) {
        const me = this;

        me.component = component;

        // This flag will make scheduler to utilize template element
        // but for security reasons that element might be replaced by Proxy
        // and not behave like real template element. Disabling flag uses slower
        // implementation
        bryntum.scheduler.DomHelper.supportsTemplate = false;

        const DH = bryntum.scheduler.DateHelper,
            date = DH.clearTime(new Date());

        me.scheduler = new bryntum.scheduler.Scheduler({
            appendTo      : component.find('scheduler_container').getElement(),
            resourceStore : {
                fields : [
                    { name : 'id', dataSource : 'Id' },
                    { name : 'image', dataSource : 'Picture__c' },
                    { name : 'name', dataSource : 'Name' }
                ]
            },
            eventStore : {
                fields : [
                    { name : 'id', dataSource : 'Id' },
                    { name : 'name', dataSource : 'Subject' },
                    { name : 'startDate', dataSource : 'StartDateTime', type : 'date' },
                    { name : 'endDate', dataSource : 'EndDateTime', type : 'date' },
                    { name : 'resourceId', dataSource : 'WhatId' }
                ]
            },
            startDate  : DH.add(date, -date.getDate(), 'd'),
            endDate    : DH.add(date, 7 - date.getDate(), 'd'),
            viewPreset : 'hourAndDay',
            rowHeight  : 65,
            barMargin  : 5,

            eventRenderer : function(data) {
                return data.eventRecord.name || '';
            },

            columns : [
                { type : 'resourceInfo', text : 'Name', field : 'Name', width : 200 }
            ]
        });

        me.scheduler.eventStore.on({
            update  : me.onEventUpdate,
            add     : me.onEventAdd,
            remove  : me.onEventRemove,
            thisObj : me
        });

        this.queueAction('c.getProperties', null, function(response) {
            const state = response.getState();
            if (state === 'SUCCESS') {
                const records = response.getReturnValue();
                me.scheduler.resourceStore.data = records;
            }
            else {
                console.log('Failed with state: ' + state);
            }
        });

        this.queueAction('c.getEvents', null, function(response) {
            const state = response.getState();
            if (state === 'SUCCESS') {
                me.scheduler.eventStore.data = response.getReturnValue();
                const totalTimeSpan = me.scheduler.eventStore.getTotalTimeSpan();
                me.scheduler.setTimeSpan(totalTimeSpan.startDate, totalTimeSpan.endDate);
            }
            else {
                console.log('Failed with state: ' + state);
            }
        });
    },

    onEventUpdate : function(data) {
        let record = data.record,
            changes = data.changes,
            shouldUpdate = false;

        // Ignore changes if only ID field was changed
        for (const key in changes) {
            if (changes.hasOwnProperty(key) && key !== 'id') {
                shouldUpdate = true;
                break;
            }
        }

        if (!shouldUpdate) return;

        // Backend cannot process extra fields that our event record has (e.g. id, draggable etc.) so we prepare object with
        // specific set of fields.
        const tmp = {
            Id            : record.id,
            Subject       : record.name,
            WhatId        : record.resourceId,
            StartDateTime : record.startDate.toISOString(),
            EndDateTime   : record.endDate.toISOString()
        };

        setTimeout($A.getCallback(() => {
            this.queueAction('c.saveEvent', {
                item : tmp
            }, function(response) {
                const state = response.getState();
                if (state !== 'SUCCESS') {
                    console.log('Failed with state: ' + state);
                }
            });
        }));
    },

    onEventRemove : function(data) {
        const me = this,
            records = data.records;

        setTimeout($A.getCallback(() => {
            me.queueAction('c.removeEvents', {
                ids : records.map(r => r.id)
            }, response => {
                const state = response.getState();
                if (state === 'SUCCESS') {
                    console.log('records removed');
                }
            });
        }));
    },

    onEventAdd : function(data) {
        const records = data.records,
            scheduler = this.scheduler;

        setTimeout($A.getCallback(() => {
            records.forEach(eventRecord => {
                this.queueAction('c.createEvent', {
                    item : {
                        WhatId        : eventRecord.resourceId,
                        StartDateTime : eventRecord.startDate.toISOString(),
                        EndDateTime   : eventRecord.endDate.toISOString(),
                        Subject       : eventRecord.name
                    }
                }, function(response) {
                    const state = response.getState();

                    if (state === 'SUCCESS') {
                        // Update record Id
                        eventRecord.id = response.getReturnValue().Id;
                    }
                    else {
                        scheduler.eventStore.remove(eventRecord);
                    }
                });
            });
        }));
    }
});
