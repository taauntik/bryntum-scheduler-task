/**
 * Setup locales
 */
// basic scheduler locales
import EnLocale from '@bryntum/scheduler/locales/scheduler.locale.En';
import SvSELocale from '@bryntum/scheduler/locales/scheduler.locale.SvSE';
import RuLocale from '@bryntum/scheduler/locales/scheduler.locale.Ru';

// example locales (grid column names, etc)
import SvSELocaleExamples from './locales/examples.locale.SvSE.umd';
import RuLocaleExamples from './locales/examples.locale.Ru.umd';

// LocaleManager
import { LocaleManager } from '@bryntum/scheduler/scheduler.umd';

// register locales
LocaleManager.registerLocale('En', { locale : EnLocale });
LocaleManager.registerLocale('SvSE', { locale : SvSELocale });
LocaleManager.registerLocale('Ru', { locale : RuLocale });

// extend locales
LocaleManager.extendLocale('SvSE', SvSELocaleExamples);
LocaleManager.extendLocale('Ru', RuLocaleExamples);
