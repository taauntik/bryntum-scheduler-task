import LocaleManager from '../../../lib/Core/localization/LocaleManager.js';
//<umd>
import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import En from '../../../lib/Scheduler/localization/En.js';

const customEnLocale = {

    extends : 'En',

    App : {
        'Localization demo' : 'Localization demo'
    },

    Button : {
        'Add column'    : 'Add column',
        'Display hints' : 'Display hints',
        'Remove column' : 'Remove column',
        Apply           : 'Apply'
    },

    Column : {
        Company : 'Company',
        Name    : 'Name'
    },

    Checkbox : {
        'Auto apply'  : 'Auto apply',
        Automatically : 'Automatically'
    },

    CodeEditor : {
        'Code editor'   : 'Code editor',
        'Download code' : 'Download code'
    },

    Combo : {
        Theme    : 'Select theme',
        Language : 'Select locale',
        Size     : 'Select size'
    },

    Shared : {
        'Full size'      : 'Full size',
        'Locale changed' : 'Locale changed',
        'Phone size'     : 'Phone size'
    },

    Tooltip : {
        'Click to show info and switch theme or locale' : 'Click to show info and switch theme or locale',
        'Click to show the built in code editor'        : 'Click to show the built in code editor',
        CheckAutoHints                                  : 'Check to automatically display hints when loading the example',
        Fullscreen                                      : 'Fullscreen'
    }

};

// Publishing locales to be loaded automatically (for umd bundles)
LocaleHelper.publishLocale('En', En);
LocaleHelper.publishLocale('En-Custom', customEnLocale);
//</umd>

// Or extending locales directly
LocaleManager.extendLocale('En', customEnLocale);
