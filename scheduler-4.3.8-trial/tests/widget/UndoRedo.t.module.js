import { ProjectModel, UndoRedo } from '../../build/scheduler.module.js?456730';

StartTest(t => {
    let undoRedoWidget;

    t.beforeEach((t) => {
        undoRedoWidget?.destroy();
    });

    t.it('Should have disabled buttons when no changes have been made', async t => {
        const project = new ProjectModel({
            stm : {
                autoRecord : true
            }
        });

        project.stm.enable();

        undoRedoWidget = new UndoRedo({
            project,
            appendTo : document.body
        });

        t.is(undoRedoWidget.widgetMap.undoBtn.disabled, true, 'Undo initially disabled');
        t.is(undoRedoWidget.widgetMap.redoBtn.disabled, true, 'Undo initially disabled');

        project.eventStore.add({
            name : 'foo'
        });

        await t.waitFor(() => !undoRedoWidget.widgetMap.undoBtn.disabled);
    });

    // https://github.com/bryntum/support/issues/2953
    t.it('Should have enabled buttons when undo widget is created when changes have already been made', async t => {
        const project = new ProjectModel({
            stm : {
                autoRecord : true
            }
        });

        project.stm.enable();

        project.eventStore.add({
            name : 'foo'
        });

        await t.waitFor(() => project.stm.isReady);

        undoRedoWidget = new UndoRedo({
            project,
            appendTo : document.body
        });

        t.is(undoRedoWidget.widgetMap.undoBtn.disabled, false, 'Undo initially enabled');
        t.is(undoRedoWidget.widgetMap.redoBtn.disabled, true, 'Undo initially disabled');
    });

    // https://github.com/bryntum/support/issues/2834
    t.it('Should use icons defined with b-icon', t => {
        const project = new ProjectModel({
            stm : {
                autoRecord : true
            }
        });

        project.stm.enable();

        new UndoRedo({
            appendTo : document.body,
            project,
            items    : {
                transactionsCombo : null
            }
        });

        t.chain(
            { waitForElementVisible : '.b-icon-undo', desc : 'b-icon applied for the button undo' },
            { waitForElementVisible : '.b-icon-redo', desc : 'b-icon applied for the button redo' },
            () => {
                t.elementIsVisible('.b-icon-undo', 'Icon undo is visible');
                t.elementIsVisible('.b-icon-redo', 'Icon redo is visible');
            }
        );
    });
});
