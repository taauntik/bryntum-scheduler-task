import { LocaleManager } from '@bryntum/scheduler';

const examplesLocale = {
    extends : 'Ru',

    Column : {
        'Name'             : 'Имя',
        'Staff'            : 'Персонал',
        'Machines'         : 'Машины',
        'Type'             : 'Тип',
        'Task color'       : 'Цвет задачи',
        'Employment type'  : 'Тип занятости',
        'Capacity'         : 'Вместительность',
        'Production line'  : 'Производственная линия',
        'Company'          : 'Компания',
        'Start'            : 'Начало',
        'End'              : 'Конец',
        'Role'             : 'Роль',
        'Id'               : '№',
        'First name'       : 'Имя',
        'Surname'          : 'Фамилия',
        'Score'            : 'Счет',
        'Rating'           : 'Рейтинг',
        'Nbr tasks'        : 'Кол-во задач',
        'Unassigned tasks' : 'Неназначенные задачи',
        'Duration'         : 'Продолжительность'
    },

    Shared : {
        'Locale changed'                                                : 'Язык изменен',
        'Fullscreen'                                                    : 'На весь экран',
        'Click to show the built in code editor'                        : 'Показать редактор кода',
        'Click to show info and switch theme or locale'                 : 'Показать информацию, переключить тему или язык',
        'Select theme'                                                  : 'Выбрать тему',
        'Select locale'                                                 : 'Выбрать язык',
        'Select size'                                                   : 'Выбрать размер',
        'Full size'                                                     : 'Полный размер',
        'Phone size'                                                    : 'Экран смартфона',
        'Display hints'                                                 : 'Показать подсказки',
        'Automatically'                                                 : 'Автоматически',
        'CheckAutoHints' :  'Автоматически показывать подсказки при загрузке примера'
    },

    CodeEditor : {
        'Code editor'   : 'Редактор кода',
        'Download code' : 'Скачать код',
        'Auto apply'    : 'Применять автоматически',
        'Apply'         : 'Применить'
    }
};

export default examplesLocale;

LocaleManager.extendLocale('Ru', examplesLocale);
