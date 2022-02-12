import { AjaxTransport, AbstractCrudManager, CrudManager, AjaxHelper, ProjectModel } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    const realFetch = AjaxHelper.fetch;

    let assertBeforeFetch;

    // Override AjaxHelper.fetch to be able to assert its arguments
    AjaxHelper.fetch = function(url, config) {
        assertBeforeFetch && assertBeforeFetch(url, config);
        // we don't want to assert the same arguments twice
        assertBeforeFetch = null;
        return Promise.resolve({ success : true });
    };

    // dummy encoder, does nothing
    const TestEncoder = Base => class extends Base {
        //format  : 'xml',
        encode(data) {
            return data;
        }

        decode(data) {
            return data;
        }
    };

    class TestCrudManager1 extends AjaxTransport(TestEncoder(AbstractCrudManager)) {
    }

    t.it('Correctly prepare params for Ajax request', t => {
        const crud = new TestCrudManager1({
            transport : {
                load : {
                    url       : 'loadurl',
                    method    : 'POST',
                    paramName : 'smth',
                    params    : {
                        qwe : 'rty'
                    },
                    requestConfig : {}
                },
                sync : {
                    url    : 'syncurl',
                    method : 'PUT'
                }
            }
        });

        t.it('for the load packet', t => {
            crud.on({
                beforesend({ requestConfig }) {
                    t.isDeeply(requestConfig, {
                        url    : 'loadurl',
                        method : 'POST',
                        params : {
                            smth : '{foo:"bar"}',
                            qwe  : 'rty'
                        }
                    }, 'Correctly formed params');
                },
                once : true
            });

            crud.sendRequest({
                data    : '{foo:"bar"}',
                type    : 'load',
                success : () => {
                },
                failure : () => {
                },
                thisObj : 'thisObj'
            });
        });

        t.it('for the sync packet', t => {
            crud.on({
                beforesend({ requestConfig }) {
                    t.isDeeply(requestConfig, {
                        url     : 'syncurl',
                        method  : 'PUT',
                        params  : {},
                        headers : {
                            'Content-Type' : 'application/json'
                        },
                        body : '{"qwe":"rty"}'
                    }, 'Correctly formed params');
                },
                once : true
            });

            assertBeforeFetch = (url, config) => {
                t.is(config.body, '{"qwe":"rty"}', 'Proper body passed to fetch() method');
            };

            crud.sendRequest({
                data    : '{"qwe":"rty"}',
                type    : 'sync',
                success : () => {
                },
                failure : () => {
                },
                thisObj : 'thisObj2'
            });
        });
    });

    t.it('Supports requestConfig config for Ajax request', t => {
        const crud = new TestCrudManager1({
            transport : {
                load : {
                    url       : 'loadurl',
                    method    : 'POST',
                    paramName : 'smth',
                    params    : {
                        qwe : 'rty'
                    },
                    requestConfig : {
                        url    : 'loadurl2',
                        method : 'GET',
                        params : {
                            foo : 'bar'
                        }
                    }
                },
                sync : {
                    url           : 'syncurl',
                    method        : 'PUT',
                    requestConfig : {
                        url    : 'syncurl2',
                        method : 'POST',
                        params : {
                            foo : 'bar'
                        }
                    }
                }
            }
        });

        t.it('for the load packet', t => {
            crud.on({
                beforesend({ requestConfig }) {
                    t.isDeeply(requestConfig, {
                        url    : 'loadurl2',
                        method : 'GET',
                        params : {
                            smth : 'loaddata',
                            foo  : 'bar'
                        }
                    }, 'Correctly formed params');
                },
                once : true
            });

            crud.sendRequest({
                data    : 'loaddata',
                type    : 'load',
                success : () => {
                },
                failure : () => {
                },
                thisObj : 'thisObj'
            });
        });

        t.it('for the sync packet', t => {
            crud.on({
                beforesend({ requestConfig }) {
                    t.isDeeply(requestConfig, {
                        url     : 'syncurl2',
                        method  : 'POST',
                        body    : 'syncdata',
                        headers : {
                            'Content-Type' : 'application/json'
                        },
                        params : {
                            foo : 'bar'
                        }
                    }, 'Correctly formed params');
                },
                once : true
            });

            crud.sendRequest({
                data    : 'syncdata',
                type    : 'sync',
                success : () => {
                },
                failure : () => {
                },
                thisObj : 'thisObj2'
            });
        });
    });

    t.it('Should support providing request headers and fetchOptions for the Ajax request', t => {
        const crud = new TestCrudManager1({
            transport : {
                load : {
                    url           : 'loadurl',
                    method        : 'GET',
                    requestConfig : {
                        headers : {
                            qwe : 'rty'
                        },
                        // https://app.assembla.com/spaces/bryntum/tickets/9067
                        fetchOptions : {
                            foo : 'bar'
                        }
                    }
                }
            }
        });

        assertBeforeFetch = (url, config) => {
            t.is(url, 'loadurl', 'Url is correct');
            t.is(config.headers.qwe, 'rty', 'Proper header passed to fetch() method');
            t.is(config.foo, 'bar', 'Proper fetchOptions passed to fetch() method');
        };

        crud.sendRequest({
            data : 'syncdata',
            type : 'load'
        });
    });

    t.it('Should append Content-Type:application/json header for POST requests', t => {
        const crudSync = new TestCrudManager1({
            transport : {
                sync : {
                    url    : 'syncurl',
                    method : 'POST'
                }
            }
        });

        assertBeforeFetch = (url, config) => {
            t.is(config.headers['Content-Type'], 'application/json', 'Proper JSON header passed to fetch() method');
        };

        crudSync.sendRequest({
            data    : '{"qwe":"rty"}',
            type    : 'sync',
            success : () => {
            },
            failure : () => {
            },
            thisObj : 'thisObj2'
        });
    });

    t.it('Should not append Content-Type header for GET requests', t => {
        const crudSync = new TestCrudManager1({
            transport : {
                load : {
                    url : 'loadurl'
                }
            }
        });

        assertBeforeFetch = (url, config) => {
            t.notOk(config.headers, 'No headers added for GET request');
        };

        crudSync.sendRequest({
            data    : '{"qwe":"rty"}',
            type    : 'load',
            success : () => {
            },
            failure : () => {
            },
            thisObj : 'thisObj2'
        });
    });

    t.it('Should throw if trying to load without a URL', async t => {
        t.mockUrl('read', {
            responseText : JSON.stringify({ success : true })
        });

        const crud = new CrudManager({
            transport : {
                load : {}
            }
        });

        await crud.load().catch(e => {
            t.isInstanceOf(e, Error, 'error returned');
            t.is(e.message, 'Trying to request without URL specified');
        });

        const crudWithRequestConfig = new CrudManager({
            validateResponse : false,
            transport        : {
                load : {
                    requestConfig : {
                        url : 'read'
                    }
                }
            }
        });

        await crudWithRequestConfig.load().catch(() => t.fail('should not catch anything here'));

        t.pass('Does not throw if URL is configured in requestConfig object');
    });

    t.it('Should throw in DEBUG mode if trying to load with a URL containing null/undefined/[object', async t => {
        // Only run in debug env
        if (!window.bryntum?.isDebug) {
            t.pass('Test for debug mode only. Skipping.');
            return;
        }

        AjaxHelper.fetch = realFetch;

        let crud = new CrudManager({
            transport : {
                load : {
                    requestConfig : {
                        url : 'foo?undefined'
                    }
                }
            }
        });

        await crud.load().catch(e => t.like(e.message, 'Incorrect URL: foo?undefined'));

        crud = new CrudManager({
            transport : {
                load : {
                    requestConfig : {
                        url : 'foo?null'
                    }
                }
            }
        });

        await crud.load().catch(e => t.like(e.message, 'Incorrect URL: foo?null'));

        crud = new CrudManager({
            transport : {
                load : {
                    requestConfig : {
                        url : 'foo?' + window.toString()
                    }
                }
            }
        });

        await crud.load().catch(e => t.like(e.message, 'Incorrect URL: foo?[object'));
    });

    t.it('Handles cases when paramName is empty and GET request is used', t => {
        const crud = new TestCrudManager1({
            transport : {
                load : {
                    url    : 'loadurl',
                    method : 'POST',
                    params : {
                        qwe : 'rty'
                    },
                    requestConfig : {
                        url    : 'loadurl2',
                        method : 'GET',
                        params : {
                            foo : 'bar'
                        }
                    }
                },
                sync : {
                    url           : 'syncurl',
                    method        : 'PUT',
                    requestConfig : {
                        url    : 'syncurl2',
                        method : 'GET',
                        params : {
                            foo : 'bar'
                        }
                    }
                }
            }
        });

        t.it('for the load packet', t => {
            crud.on({
                beforesend({ requestConfig }) {
                    t.isDeeply(requestConfig, {
                        url    : 'loadurl2',
                        method : 'GET',
                        params : {
                            data : 'loaddata',
                            foo  : 'bar'
                        }
                    }, 'Correctly formed params');
                },
                once : true
            });

            crud.sendRequest({
                data    : 'loaddata',
                type    : 'load',
                success : () => {
                },
                failure : () => {
                },
                thisObj : 'thisObj'
            });
        });

        t.it('for the sync packet', t => {
            crud.on({
                beforesend({ requestConfig }) {
                    t.isDeeply(requestConfig, {
                        url    : 'syncurl2',
                        method : 'GET',
                        params : {
                            data : 'syncdata',
                            foo  : 'bar'
                        }
                    }, 'Correctly formed params');
                },
                once : true
            });

            crud.sendRequest({
                data    : 'syncdata',
                type    : 'sync',
                success : () => {
                },
                failure : () => {
                },
                thisObj : 'thisObj2'
            });
        });
    });

    t.it('Should handle a successful response w/o table sections correctly', async t => {

        t.mockUrl('load', {
            responseText : JSON.stringify({
                success : true,
                events  : {
                    rows : [
                        { id : 1, startDate : '2020-11-18', endDate : '2020-11-19', name : 'one' },
                        { id : 2, startDate : '2020-11-18', endDate : '2020-11-19', name : 'two' }
                    ]
                },
                resources : {
                    rows : [{ id : 1, name : 'foo' }]
                },
                assignments : {
                    rows : [{ id : 1, resourceId : 1, eventId : 1 }]
                }
            })
        });

        t.mockUrl('sync', {
            responseText : JSON.stringify({ success : true })
        });

        const crud = new CrudManager({
            autoSync  : true,
            transport : {
                load : {
                    url : 'load'
                },
                sync : {
                    url : 'sync'
                }
            }
        });

        const spy = t.spyOn(crud, 'sync');

        await crud.load();

        t.notOk(crud.hasChanges(), 'crud manager has no changes after load()');

        crud.resourceStore.first.name = 'smth';

        t.ok(crud.hasChanges(), 'crud manager has changes');

        await t.waitForEvent(crud, 'sync');

        t.notOk(crud.hasChanges(), 'crud manager has no changes');

        crud.assignmentStore.first.eventId = 2;
        crud.eventStore.first.name = 'uno';

        t.ok(crud.hasChanges(), 'crud manager has changes');

        await t.waitForEvent(crud, 'sync');

        t.notOk(crud.hasChanges(), 'crud manager has no changes');

        await t.waitFor(100);

        t.is(spy.calls.count(), 2, 'proper number of sync() calls');
    });

    t.it('Should handle a successful response with server changes only correctly', async t => {

        t.mockUrl('load', {
            responseText : JSON.stringify({
                success : true,
                events  : {
                    rows : [
                        { id : 1, startDate : '2020-11-18', endDate : '2020-11-19', name : 'one' },
                        { id : 2, startDate : '2020-11-18', endDate : '2020-11-19', name : 'two' }
                    ]
                },
                resources : {
                    rows : [{ id : 1, name : 'foo' }]
                },
                assignments : {
                    rows : [{ id : 1, resourceId : 1, eventId : 1 }]
                }
            })
        });

        const crud = new CrudManager({
            project   : new ProjectModel(),
            autoSync  : true,
            transport : {
                load : {
                    url : 'load'
                },
                sync : {
                    url : 'sync'
                }
            }
        });

        const spy = t.spyOn(crud, 'sync');

        await crud.load();

        const { resourceStore } = crud;

        resourceStore.first.name = 'smth';
        const newResource = resourceStore.add({ name : 'smbdy' })[0];

        t.mockUrl('sync', {
            responseText : JSON.stringify({
                success   : true,
                resources : {
                    rows : [{ $PhantomId : newResource.id, id : 2 }]
                }
            })
        });

        t.ok(crud.hasChanges(), 'crud manager has changes');

        await t.waitForEvent(crud, 'sync');

        t.notOk(crud.hasChanges(), 'crud manager has no changes');

        crud.assignmentStore.first.eventId = 2;
        crud.eventStore.first.name = 'uno';

        const newAssignment = crud.assignmentStore.add({ eventId : 2, resourceId : 2 })[0];

        t.mockUrl('sync', {
            responseText : JSON.stringify({
                success     : true,
                assignments : {
                    rows : [{ $PhantomId : newAssignment.id, id : 2 }]
                }
            })
        });

        t.ok(crud.hasChanges(), 'crud manager has changes');

        await t.waitForEvent(crud, 'sync');

        t.notOk(crud.hasChanges(), 'crud manager has no changes');

        await t.waitFor(100);

        t.is(spy.calls.count(), 2, 'proper number of sync() calls');
    });

    // https://github.com/bryntum/support/issues/541
    t.it('Should send POST params on form Request Payload instead of query string on url', t => {
        const crud = new CrudManager({
            encoder : {
                requestData : {
                    foo : 'bar'
                }
            },
            transport : {
                sync : {
                    url    : 'syncurl',
                    method : 'POST'
                }
            }
        });

        AjaxHelper.fetch = (url, params) => {
            t.isDeeply(crud.decode(params.body), {
                id   : 1,
                name : 'test',
                foo  : 'bar'
            }, 'Correct params');

            return Promise.resolve({ success : true });
        };

        crud.sendRequest({
            data : crud.encode({
                id   : 1,
                name : 'test'
            }),
            type    : 'sync',
            success : () => {},
            failure : () => {},
            thisObj : 'thisObj'
        });
    });
});
