import { LocaleManager } from '@bryntum/scheduler';

const examplesLocale = {
    extends : 'SvSE',

    Column : {
        'Name'             : 'Namn',
        'City'             : 'Stad',
        'Role'             : 'Roll',
        'Staff'            : 'Personal',
        'Machines'         : 'Maskiner',
        'Type'             : 'Typ',
        'Task color'       : 'Uppgiftsfärg',
        'Employment type'  : 'Anställning',
        'Capacity'         : 'Kapacitet',
        'Production line'  : 'Produktionslinje',
        'Company'          : 'Företag',
        'Start'            : 'Start',
        'End'              : 'Slut',
        'Nbr tasks'        : 'Antal aktiviteter',
        'Unassigned tasks' : 'Otilldelade aktiviteter',
        'Duration'         : 'Längd'
    },

    Shared : {
        'Locale changed' : 'Språk ändrat'
    },

    EventEdit : {
        'Location' : 'Plats'
    }
};

export default examplesLocale;

LocaleManager.extendLocale('SvSE', examplesLocale);
