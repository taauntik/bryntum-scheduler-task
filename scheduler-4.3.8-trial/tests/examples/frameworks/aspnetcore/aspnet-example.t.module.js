StartTest(async t => {
    await t.waitForSelector('.b-sch-event');
    
    const scheduler = window.scheduler;
    
    scheduler.enableEventAnimations = false;
    
    t.it('Testing add/update/remove resource/event', async t => {
        try {
            const
                [resource] = scheduler.resourceStore.add({ Name : 'New resource' }),
                [event]    = scheduler.eventStore.add({
                    ResourceId : resource.id,
                    Name       : 'New event',
                    StartDate  : '2017-09-12',
                    EndDate    : '2017-09-13'
                });
        
            t.diag('Adding new resource/event');
            
            scheduler.crudManager.on({
                beforeSync({ pack }) {
                    t.isDeeply(
                        pack.resources,
                        {
                            added : [
                                {
                                    $PhantomId : resource.id,
                                    Name       : 'New resource'
                                }
                            ]
                        },
                        'Resource sync pack is ok'
                    );
                
                    t.isDeeply(
                        pack.events,
                        {
                            added : [
                                {
                                    $PhantomId   : event.id,
                                    Name         : 'New event',
                                    StartDate    : new Date('2017-09-12 00:00').toString(),
                                    EndDate      : new Date('2017-09-13 00:00').toString(),
                                    ResourceId   : resource.id,
                                    Cls          : '',
                                    Draggable    : true,
                                    Resizable    : true,
                                    duration     : 1,
                                    durationUnit : 'd'
                                }
                            ]
                        },
                        'Event sync pack is ok'
                    );
                },
                beforeSyncApply({ response }) {
                    const
                        newResourceId = response.resources.rows[0].Id,
                        newEventId    = response.events.rows[0].Id;
                
                    t.isDeeply(
                        response.resources.rows,
                        [
                            {
                                $PhantomId : resource.id,
                                Id         : newResourceId
                            }
                        ],
                        'Resource is added'
                    );
                
                    t.isDeeply(
                        response.events.rows,
                        [
                            {
                                $PhantomId : event.id,
                                Id         : newEventId,
                                ResourceId : newResourceId
                            }
                        ],
                        'Event is added'
                    );
                },
                once : true
            });
        
            await scheduler.crudManager.sync();
            
            t.diag('Changing resource/event');
            
            resource.name = 'resource';
            event.name = 'event';
    
            scheduler.crudManager.on({
                beforeSync({ pack }) {
                    t.isDeeply(
                        pack.resources,
                        {
                            updated : [
                                {
                                    Id   : resource.id,
                                    Name : 'resource'
                                }
                            ]
                        },
                        'Resource sync pack is ok'
                    );
            
                    t.isDeeply(
                        pack.events,
                        {
                            updated : [
                                {
                                    Id   : event.id,
                                    Name : 'event'
                                }
                            ]
                        },
                        'Event sync pack is ok'
                    );
                },
                beforeSyncApply({ response }) {
                    const
                        newResourceId = response.resources.rows[0].Id,
                        newEventId    = response.events.rows[0].Id;
            
                    t.isDeeply(
                        response.resources.rows,
                        [
                            {
                                Id : newResourceId
                            }
                        ],
                        'Resource is updated'
                    );
            
                    t.isDeeply(
                        response.events.rows,
                        [
                            {
                                Id : newEventId
                            }
                        ],
                        'Event is updated'
                    );
                },
                once : true
            });
            
            await scheduler.crudManager.sync();
            
            t.diag('Removing resource/event');
        
            event.remove();
            resource.remove();
        
            scheduler.crudManager.on({
                beforeSync({ pack }) {
                    t.isDeeply(
                        pack.resources,
                        {
                            removed : [{ Id : resource.id }]
                        },
                        'Resource sync pack is ok'
                    );
                
                    t.isDeeply(
                        pack.events,
                        {
                            removed : [{ Id : event.id }]
                        },
                        'Event sync pack is ok'
                    );
                },
                beforeSyncApply({ response }) {
                    t.isDeeply(
                        response.resources.removed,
                        [{ Id : resource.id }],
                        'Resource is removed'
                    );
                
                    t.isDeeply(
                        response.events.removed,
                        [{ Id : event.id }],
                        'Event is removed'
                    );
                },
                once : true
            });
    
            await scheduler.crudManager.sync();
        }
        catch (e) {
            t.fail(e.stack);
        }
    });
    
    t.it('Adding multiple new events to new/existing resource', async t => {
        try {
            t.diag('Adding new events to existing resource');
            
            const existingResource = scheduler.resourceStore.last;
            
            let newEvents = [];
            
            for (let i = 0; i < 4; i++) {
                newEvents.push({
                    ResourceId : existingResource.id,
                    Name       : `Event ${i + 1}`,
                    StartDate  : '2017-09-12',
                    EndDate    : '2017-09-13'
                });
            }
            
            newEvents = scheduler.eventStore.add(newEvents);
    
            scheduler.crudManager.on({
                beforeSyncApply({ response }) {
                    t.isDeeply(
                        response.events.rows,
                        newEvents.map((record, index) => {
                            return {
                                $PhantomId : record.id,
                                Id         : response.events.rows[index].Id
                            };
                        }),
                        'Events are added'
                    );
                },
                once : true
            });
            
            await scheduler.crudManager.sync();
            
            t.diag('Adding existing events to new resource');
            
            const [newResource] = scheduler.resourceStore.add({ Name : 'foo' });
            
            newEvents.forEach(event => event.assign(newResource));
    
            scheduler.crudManager.on({
                beforeSyncApply({ response }) {
                    const newResourceId = response.resources.rows[0].Id;
                    
                    t.isDeeply(
                        response.resources.rows,
                        [{
                            $PhantomId : newResource.id,
                            Id         : newResourceId
                        }],
                        'Resource is added'
                    );
                    
                    t.isDeeply(
                        response.events.rows,
                        newEvents.map(record => {
                            return {
                                Id         : record.id,
                                ResourceId : newResourceId
                            };
                        }),
                        'Events are added'
                    );
                },
                once : true
            });
            
            await scheduler.crudManager.sync();
            
            t.isDeeply(
                newResource.events.map(e => e.id),
                newEvents.map(e => e.id),
                'Resource events are ok'
            );
            
            t.selectorCountIs('.b-sch-event', scheduler.eventStore.count, 'Event selector count is ok');
            
            t.diag('Cleanup');
            
            newResource.remove();
            newEvents.forEach(event => event.remove());
            
            await scheduler.crudManager.sync();
        }
        catch (e) {
            t.fail(e.stack);
        }
    });
    
    t.it('Event dates are sent to and handled by backend including time zone', async t => {
        try {
            const resource = scheduler.resourceStore.last;
    
            let [event] = scheduler.eventStore.add({
                ResourceId : resource.id,
                Name       : 'New event',
                StartDate  : '2017-09-12',
                EndDate    : '2017-09-13'
            });
            
            const { startDate, endDate } = event;
        
            await scheduler.crudManager.sync();
            
            const eventId = event.id;
            
            t.is(event.startDate, startDate, 'Start date is ok after sync');
            t.is(event.endDate, endDate, 'End date is ok after sync');
            
            await scheduler.crudManager.load();
            
            event = scheduler.eventStore.getById(eventId);
    
            t.is(event.startDate, startDate, 'Start date is ok after load');
            t.is(event.endDate, endDate, 'End date is ok after load');
            
            t.diag('Cleanup');
            
            event.remove();
            await scheduler.crudManager.sync();
        }
        catch (e) {
            t.fail(e.stack);
        }
    });
});
