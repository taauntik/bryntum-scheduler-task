
StartTest(t => {
    let cmp;

    const createScheduler = () => {
        document.body.innerHTML += `
            <bryntum-scheduler 
                stylesheet="../build/scheduler.stockholm.css?456730"
                data-view-preset="weekAndDay"
                data-start-date="2018-04-02"
                data-end-date="2018-04-09"
            >
                    <column data-field="name">Name</column>
                    <data>
                        <events>
                            <data data-id="1" data-name="Click me" data-icon-cls="b-fa b-fa-mouse-pointer" data-resource-id="1" data-start-date="2018-04-03" data-end-date="2018-04-05"></data>
                            <data data-id="2" data-name="Drag me" data-icon-cls="b-fa b-fa-arrows-alt" data-resource-id="2" data-start-date="2018-04-04" data-end-date="2018-04-06"></data>
                            <data data-id="3" data-name="Resize me" data-icon-cls="b-fa b-fa-arrows-alt-h" data-resource-id="3" data-start-date="2018-04-05" data-end-date="2018-04-07"></data>
                        </events>
                        <resources>
                            <data data-id="1" data-name="Daniel"></data>
                            <data data-id="2" data-name="Steven"></data>
                            <data data-id="3" data-name="Sergei"></data>
                        </resources>
                    </data>
            </bryntum-scheduler>`;
    };

    t.beforeEach(t => {
        cmp && cmp.remove();
        document.body.style = 'height:100%;width:100%;overflow:hidden;';

        document.body.innerHTML = '';
    });

    t.it('Should finalize drag drop if mouse up happens outside shadow root', async t => {
        createScheduler();
        cmp = document.querySelector('bryntum-scheduler');

        document.body.style.padding = '10em';
        await t.dragBy('bryntum-scheduler -> .b-sch-event', [-20, 0], null, null, null, true);
        await t.moveCursorTo([1, 1]);
        await t.mouseUp();

        t.selectorNotExists('.b-draghelper-active');
        t.selectorNotExists('bryntum-scheduler -> .b-draghelper-active');
    });

    t.it('Should show event editor in ShadowRoot´s float root', async t => {
        createScheduler();
        cmp = document.querySelector('bryntum-scheduler');

        await t.doubleClick('bryntum-scheduler -> .b-sch-event');

        await t.waitForSelector('bryntum-scheduler -> .b-float-root .b-eventeditor');
    });

    t.it('Should show event tooltip in ShadowRoot´s float root', async t => {
        createScheduler();
        cmp = document.querySelector('bryntum-scheduler');

        await t.moveCursorTo([0, 0]);
        await t.moveCursorTo('bryntum-scheduler -> .b-sch-event');

        await t.waitForSelector('bryntum-scheduler -> .b-float-root .b-tooltip');
    });

    t.it('Should handle multiple scheduler web components', async t => {
        createScheduler();
        document.querySelector('bryntum-scheduler').style.cssText = 'display:block;height:200px;width:400px';
        createScheduler();
        document.querySelector('bryntum-scheduler:last-child').style.cssText = 'display:block;height:200px;width:400px';

        await t.doubleClick('bryntum-scheduler -> .b-sch-event');
        await t.click('bryntum-scheduler -> .b-button:textEquals(Save)');

        await t.doubleClick('bryntum-scheduler:last-child -> .b-sch-event');
        await t.click('bryntum-scheduler:last-child -> .b-button:textEquals(Save)');

        t.pass('No crash due to hard coded id´s used');
    });

    t.it('Should show event editor fully, overflowing shadow root, when web component is small', async t => {
        createScheduler();
        cmp = document.querySelector('bryntum-scheduler');

        cmp.style.cssText = 'display:block;height:200px;width:400px';
        await t.doubleClick('bryntum-scheduler -> .b-sch-event');

        await t.waitForSelector('bryntum-scheduler -> .b-float-root .b-eventeditor');

        await t.click('bryntum-scheduler -> .b-button:textEquals(Save)');

        await t.waitForSelectorNotFound('bryntum-scheduler -> .b-float-root .b-eventeditor');
    });

    t.it('Should stop dependency creation when dropping outside of web component', t => {
        document.body.style = '';
        document.body.innerHTML = `
        <div id="container" style="width: 600px; height:400px;">
            <bryntum-scheduler
                    stylesheet="../build/scheduler.stockholm.css?456730"
                    fa-path="../build/fonts"
                    data-min-height="20em"
                    data-view-preset="weekAndDay"
                    data-start-date="2018-04-02"
                    data-end-date="2018-04-09">
                <column data-field="name">Name</column>
                <feature data-name="dependencies"></feature>
                <data>
                    <events>
                        <data data-id="1" data-name="Click me" data-icon-cls="b-fa b-fa-mouse-pointer" data-resource-id="1" data-start-date="2018-04-03" data-end-date="2018-04-05"></data>
                        <data data-id="2" data-name="Drag me" data-icon-cls="b-fa b-fa-arrows-alt" data-resource-id="2" data-start-date="2018-04-04" data-end-date="2018-04-06"></data>
                        <data data-id="3" data-name="Resize me" data-icon-cls="b-fa b-fa-arrows-alt-h" data-resource-id="3" data-start-date="2018-04-05" data-end-date="2018-04-07"></data>
                    </events>
                    <resources>
                        <data data-id="1" data-name="Daniel"></data>
                        <data data-id="2" data-name="Steven"></data>
                        <data data-id="3" data-name="Sergei"></data>
                    </resources>
                </data>
            </bryntum-scheduler>
        </div>`;

        t.chain(
            // Regular dependency dragdrop works fine
            { moveMouseTo : 'bryntum-scheduler -> .b-sch-event' },
            { drag : 'bryntum-scheduler -> .b-sch-event .b-sch-terminal-left', to : 'bryntum-scheduler -> [data-event-id="2"]', dragOnly : true },
            { mouseUp : 'bryntum-scheduler -> [data-event-id="2"] .b-sch-terminal-left' },
            { waitForSelectorNotFound : 'bryntum-scheduler -> .b-sch-dependency-connector' },

            // Dropping dependency line outside of webcomponent works too
            { moveMouseTo : 'bryntum-scheduler -> .b-sch-event' },
            { drag : 'bryntum-scheduler -> .b-sch-event .b-sch-terminal-bottom', to : 'bryntum-scheduler -> [data-event-id="2"]', dragOnly : true },
            { mouseUp : '#container', offset : ['100%', '100%+50'] },
            { waitForSelectorNotFound : 'bryntum-scheduler -> .b-sch-dependency-connector' }
        );
    });
});
