import LocaleManager from '../../../lib/Core/localization/LocaleManager.js';
//<umd>
import LocaleHelper from '../../../lib/Core/localization/LocaleHelper.js';
import SvSE from '../../../lib/Scheduler/localization/SvSE.js';

const customSvSELocale = {

    extends : 'SvSE',

    App : {
        'Localization demo' : 'Lokalisierungs-Demo'
    },

    Button : {
        'Add column'    : 'Lägg till kolumn',
        'Display hints' : 'Visa tips',
        'Remove column' : 'Ta bort kolumn',
        Apply           : 'Verkställ'
    },

    Checkbox : {
        'Auto apply'  : 'Auto applicera',
        Automatically : 'Automatiskt'
    },

    CodeEditor : {
        'Code editor'   : 'Kodredigerare',
        'Download code' : 'Ladda ner kod'
    },

    Column : {
        Name    : 'Namn',
        Company : 'Företag'
    },

    Combo : {
        Theme    : 'Välj tema',
        Language : 'Välj språk',
        Size     : 'Välj storlek'
    },

    Shared : {
        'Full size'      : 'Full storlek',
        'Locale changed' : 'Språk ändrat',
        'Phone size'     : 'Telefonstorlek'
    },

    Tooltip : {
        'Click to show info and switch theme or locale' : 'Klicka för att visa information och byta tema eller språk',
        'Click to show the built in code editor'        : 'Klicka för att visa den inbyggda kodredigeraren',
        CheckAutoHints                                  : 'Markera för att automatiskt visa tips när du laddar exemplet',
        Fullscreen                                      : 'Fullskärm'
    }

};

// Publishing locales to be loaded automatically (for umd bundles)
LocaleHelper.publishLocale('SvSE', SvSE);
LocaleHelper.publishLocale('SvSE-Custom', customSvSELocale);
//</umd>

// Or extending locales directly
LocaleManager.extendLocale('SvSE', customSvSELocale);
