/**
 * Centralized import of locales
 */
import { LocaleManager } from '@bryntum/scheduler';

import En from '@bryntum/scheduler/locales/scheduler.locale.En.js';
import Ru from '@bryntum/scheduler/locales/scheduler.locale.Ru.js';
import SvSE from '@bryntum/scheduler/locales/scheduler.locale.SvSE.js'

import ExamplesRu   from './examples-Ru.js';
import ExamplesSvSE from './examples-SvSE.js';

LocaleManager.registerLocale('En', { locale : En });
LocaleManager.registerLocale('Ru', { locale : Ru });
LocaleManager.registerLocale('SvSE', { locale : SvSE });

LocaleManager.extendLocale('Ru', ExamplesRu);
LocaleManager.extendLocale('SvSE', ExamplesSvSE);

window.bryntum.locales = {En, Ru, SvSE};

