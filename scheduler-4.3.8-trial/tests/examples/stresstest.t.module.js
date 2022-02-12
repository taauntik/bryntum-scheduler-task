StartTest(async t => {

    await t.waitForSelector('.b-scheduler .b-sch-event');
    t.pass('Example rendered without exception');

    t.it('Monkey test for stress app', async  t =>  {
        t.disableWaitingForCSSAnimations = true;

        await t.waitForAnimations();
        bryntum.query('slider').value = 80;

        await new Promise(resolve => {
            t.monkeyTest({
                target          : '.b-scheduler',
                skipTargets     : ['#fullscreen-button', '.b-skip-test', '.b-codeeditor', '.b-no-monkeys', '.b-print-button'],
                nbrInteractions : 30,
                callback() {
                    // Using click() on button element which may be covered with opened EventEdit
                    const button = t.global.document.querySelector('[data-ref="stopButton"]');
                    button.click();
                    resolve();
                }
            });
        });
        await t.waitForSelectorNotFound('.b-animating');
    });

});
