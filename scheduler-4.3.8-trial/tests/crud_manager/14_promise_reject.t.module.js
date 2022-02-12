import { CrudManager } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    const
        resourceStore = t.getResourceStore({
            storeId : 'resources',
            data    : []
        }),

        eventStore    = t.getEventStore({
            storeId : 'events',
            data    : []
        }),

        crudManager = new CrudManager({
            resourceStore : resourceStore,
            eventStore    : eventStore,
            autoSync      : true,
            transport     : {
                sync : {
                    url : 'syncUrl'
                },
                load : {
                    url : 'loadUrl'
                }
            }
        });

    t.it('Should not throw Uncaught (in promise) in console for 404 server response', t => {
        t.mockUrl('syncUrl', {
            status : 404,
            ok     : false
        });

        t.waitForEvent(crudManager, 'syncfail');
        crudManager.eventStore.add({ id : 1 });

    });

    t.it('Should not throw Uncaught (in promise) in console for 500 server response', t => {
        t.mockUrl('syncUrl', {
            status : 500,
            ok     : false
        });

        t.waitForEvent(crudManager, 'syncfail');
        crudManager.eventStore.add({ id : 2 });

    });

    t.it('Should not throw Uncaught (in promise) in console for unsuccessful response', t => {
        t.mockUrl('syncUrl', {
            status       : 200,
            ok           : true,
            responseText : JSON.stringify({
                success : false
            })
        });

        t.waitForEvent(crudManager, 'syncfail');
        crudManager.eventStore.add({ id : 3 });
    });

});
