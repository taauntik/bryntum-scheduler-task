import { CrudManager, ProjectModel } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    // Checks that CRUD manager can retrieve storeId value from other properties

    t.it('CrudManager can use any store property as storeId', t => {
        t.it('defined on prototype', t => {
            //t.expectGlobal('TestCrudManager1');

            class TestCrudManager1 extends CrudManager {
                static get defaultConfig() {
                    return {
                        storeIdProperty : 'oops'
                    };
                }
            }

            const
                project       = new ProjectModel({
                    resourceStore : t.getResourceStore({ oops : 'res' }),
                    eventStore    : t.getEventStore({ oops : 'eve' })
                }),
                {
                    resourceStore,
                    eventStore
                } = project;

            const crud = new TestCrudManager1({
                resourceStore : 'resources',
                eventStore    : 'events'
            });

            t.is(crud.stores.length, 4, 'proper number of stores'); // +2 assignmentstore & dep
            t.is(crud.getStore('res'), resourceStore, 'resourceStore found');
            t.is(crud.getStore('eve'), eventStore, 'eventStore found');

            resourceStore.destroy();
            eventStore.destroy();
        });

        t.it('defined on instance', t => {
            const
                project       = new ProjectModel({
                    resourceStore : t.getResourceStore({ oops : 'res' }),
                    eventStore    : t.getEventStore({ oops : 'eve' })
                }),
                {
                    resourceStore,
                    eventStore
                } = project;

            const crud = new CrudManager({
                resourceStore   : 'resources',
                eventStore      : 'events',
                storeIdProperty : 'oops'
            });

            t.is(crud.stores.length, 4, 'proper number of stores'); // +2 assignmentstore & dep
            t.is(crud.getStore('res'), resourceStore, 'resourceStore found');
            t.is(crud.getStore('eve'), eventStore, 'eventStore found');

            resourceStore.destroy();
            eventStore.destroy();
        });
    });

    t.it('CrudManager takes into account storeIdProperty on a store', t => {
        //t.expectGlobal('TestCrudManager2');

        class TestCrudManager2 extends CrudManager {
            static get defaultConfig() {
                return {
                    storeIdProperty : 'oops'
                };
            }
        }

        const
            project       = new ProjectModel({
                resourceStore : t.getResourceStore({ oops : 'res' }),
                eventStore    : t.getEventStore({ foo : 'eve', storeIdProperty : 'foo' })
            }),
            {
                resourceStore,
                eventStore
            } = project;

        const crud = new TestCrudManager2({
            resourceStore : 'resources',
            eventStore    : 'events'
        });

        t.is(crud.stores.length, 4, 'proper number of stores'); // +2 assignmentstore & dep
        t.is(crud.getStore('res'), resourceStore, 'resourceStore found');
        t.is(crud.getStore('eve'), eventStore, 'eventStore found');

        resourceStore.destroy();
        eventStore.destroy();
    });
});
