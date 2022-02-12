!function(e,n){if("object"==typeof exports&&"object"==typeof module)module.exports=n();else if("function"==typeof define&&define.amd)define([],n);else{var t=n();for(var r in t)("object"==typeof exports?exports:e)[r]=t[r]}}(window,(function(){return function(e){var n={};function t(r){if(n[r])return n[r].exports;var a=n[r]={i:r,l:!1,exports:{}};return e[r].call(a.exports,a,a.exports,t),a.l=!0,a.exports}return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var a in e)t.d(r,a,function(n){return e[n]}.bind(null,a));return r},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s="./examples/localization/locales/custom.locale.De.js")}({"./examples/localization/locales/custom.locale.De.js":
/*!***********************************************************!*\
  !*** ./examples/localization/locales/custom.locale.De.js ***!
  \***********************************************************/
/*! no static exports found */function(module,exports){eval("/**\n * The following technique, although workable, is not recommended if the IE compatibility\n * is not needed. Importing LocaleManager and registering locale is the recommended way\n * for modern browsers that support modules.\n *\n * We want our examples to work also in IE 11 therefore we use for this locale ES5 style\n * script that assigns this German locale to the global namespace where it is recognized\n * by the Locale Manager. When the Locale Manager runs first time the locales found in\n * `window.bryntum.locales` are automatically registered.\n */\n// prepare \"namespace\"\nwindow.bryntum = window.bryntum || {};\nwindow.bryntum.locales = window.bryntum.locales || {}; // put the locale under window.bryntum.locales to make sure it is discovered automatically\n\nwindow.bryntum.locales.De = {\n  localeName: 'De',\n  localeDesc: 'Deutsch',\n  //region Custom localization\n  App: {\n    'Localization demo': 'Lokalisierungs-Demo'\n  },\n  //endregion\n  //region Shared localization\n  Button: {\n    'Add column': 'Spalte hinzufügen',\n    Apply: 'Anwenden',\n    'Display hints': 'Tipps anzeigen',\n    'Remove column': 'Spalte entfernen'\n  },\n  Checkbox: {\n    'Auto apply': 'Automatisch anwenden',\n    Automatically: 'Automatisch'\n  },\n  CodeEditor: {\n    'Code editor': 'Code-Editor',\n    'Download code': 'Code herunterladen'\n  },\n  Combo: {\n    noResults: 'Keine Ergebnisse',\n    Theme: 'Thema wählen',\n    Language: 'Gebietsschema auswählen',\n    Size: 'Wähle die Größe aus',\n    recordNotCommitted: 'Datensatz konnte nicht hinzugefügt werden',\n    addNewValue: function addNewValue(value) {\n      return \"\".concat(value, \" hinzuf\\xFCgen\");\n    }\n  },\n  Tooltip: {\n    'Click to show info and switch theme or locale': 'Klicken Sie hier, um Informationen anzuzeigen und das Thema oder Gebietsschema zu wechseln',\n    'Click to show the built in code editor': 'Klicken Sie hier, um den integrierten Code-Editor anzuzeigen',\n    CheckAutoHints: 'Aktivieren Sie diese Option, um beim Laden des Beispiels automatisch Hinweise anzuzeigen',\n    Fullscreen: 'Ganzer Bildschirm'\n  },\n  Shared: {\n    'Locale changed': 'Sprache geändert',\n    'Full size': 'Volle Größe',\n    'Phone size': 'Telefongröße'\n  },\n  UndoRedo: {\n    Undo: 'Rückgängig machen',\n    Redo: 'Wiederholen',\n    UndoLastAction: 'Letzte Aktion rückgängig machen',\n    RedoLastAction: 'Wiederholen Sie die letzte rückgängig gemachte Aktion'\n  },\n  //endregion\n  // Translations for common words and phrases which are used by all classes.\n  Object: {\n    Ok: 'OK',\n    Yes: 'Ja',\n    No: 'Nein',\n    Cancel: 'Stornieren',\n    newEvent: 'neues Event'\n  },\n  //region Features\n  ColumnPicker: {\n    column: 'Splate',\n    columnsMenu: 'Spalten',\n    hideColumn: 'Versteck spalte',\n    hideColumnShort: 'Versteck',\n    newColumns: 'Neue Spalten'\n  },\n  Filter: {\n    applyFilter: 'Filter anwenden',\n    filter: 'Filter',\n    editFilter: 'Filter redigieren',\n    on: 'Auf',\n    before: 'Vor',\n    after: 'Nach',\n    equals: 'Gleichen',\n    lessThan: 'Weniger als',\n    moreThan: 'Mehr als',\n    removeFilter: 'Filter entfernen'\n  },\n  FilterBar: {\n    enableFilterBar: 'Filterleiste anzeigen',\n    disableFilterBar: 'Filterleiste ausblenden'\n  },\n  Group: {\n    group: 'Gruppe',\n    groupAscending: 'Aufsteigend gruppieren',\n    groupDescending: 'Absteigend gruppieren',\n    groupAscendingShort: 'Aufsteigend',\n    groupDescendingShort: 'Absteigend',\n    stopGrouping: 'Stoppen gruppierung',\n    stopGroupingShort: 'Stoppen'\n  },\n  RowCopyPaste: {\n    copyRecord: 'Kopieren',\n    cutRecord: 'Schnitt',\n    pasteRecord: 'Einfügen'\n  },\n  Search: {\n    searchForValue: 'Suche nach Wert'\n  },\n  Sort: {\n    sort: 'Sorte',\n    sortAscending: 'Aufsteigend sortierung',\n    sortDescending: 'Absteigend sortierung',\n    multiSort: 'Multi sortieren',\n    removeSorter: 'Sortierung entfernen',\n    addSortAscending: 'Aufsteigend sortieren hinzufügen',\n    addSortDescending: 'Absteigend sortieren hinzufügen',\n    toggleSortAscending: 'Ändern Sie auf aufsteigend',\n    toggleSortDescending: 'Zu absteigend wechseln',\n    sortAscendingShort: 'Aufsteigend',\n    sortDescendingShort: 'Absteigend',\n    removeSorterShort: 'Entfernen',\n    addSortAscendingShort: '+ Aufsteigend',\n    addSortDescendingShort: '+ Absteigend'\n  },\n  //endregion\n  //region Trial\n  TrialButton: {\n    downloadTrial: 'Demo herunterladen'\n  },\n  TrialPanel: {\n    title: 'Bitte Felder ausfüllen',\n    name: 'Name',\n    email: 'Email',\n    company: 'Gesellschaft',\n    product: 'Produkt',\n    cancel: 'Abbrechen',\n    submit: 'Einreichen',\n    downloadStarting: 'Download startet, bitte warten...'\n  },\n  //endregion\n  //region Grid\n  GridBase: {\n    loadFailedMessage: 'Wird geladen, bitte versuche es erneut!',\n    syncFailedMessage: 'Datensynchronisation fehlgeschlagen!',\n    unspecifiedFailure: 'Nicht spezifizierter Fehler',\n    networkFailure: 'Netzwerkfehler',\n    parseFailure: 'Serverantwort konnte nicht analysiert werden',\n    loadMask: 'Laden...',\n    syncMask: 'Speichere Änderungen, bitte warten...',\n    noRows: 'Keine Zeilen zum Anzeigen',\n    removeRow: 'Zeile',\n    moveColumnLeft: 'Bewegen Sie sich zum linken Bereich',\n    moveColumnRight: 'Bewegen Sie sich nach rechts',\n    moveColumnTo: function moveColumnTo(region) {\n      return 'Spalte verschieben nach ' + region;\n    }\n  },\n  CellMenu: {\n    removeRow: 'Zeile'\n  },\n  //endregion\n  //region Widgets\n  FilePicker: {\n    file: 'Datei'\n  },\n  Field: {\n    badInput: 'Ungültiger Feldwert',\n    patternMismatch: 'Der Wert sollte einem bestimmten Muster entsprechen',\n    rangeOverflow: function rangeOverflow(value) {\n      return 'Der Wert muss größer als oder gleich ' + value.max + ' sein';\n    },\n    rangeUnderflow: function rangeUnderflow(value) {\n      return 'Der Wert muss größer als oder gleich ' + value.min + ' sein';\n    },\n    stepMismatch: 'Der Wert sollte zum Schritt passen',\n    tooLong: 'Der Wert sollte kürzer sein',\n    tooShort: 'Der Wert sollte länger sein',\n    typeMismatch: 'Der Wert muss in einem speziellen Format vorliegen',\n    valueMissing: 'Dieses Feld wird benötigt',\n    fieldRequired: 'Dieses Feld wird benötigt',\n    invalidValue: 'Ungültiger Feldwert',\n    maximumValueViolation: 'Maximalwertverletzung',\n    minimumValueViolation: 'Mindestwertverletzung',\n    validateFilter: 'Der Wert muss aus der Liste ausgewählt werden'\n  },\n  DateField: {\n    invalidDate: 'Ungültige Datumseingabe'\n  },\n  NumberFormat: {\n    locale: 'de',\n    currency: 'EUR'\n  },\n  DurationField: {\n    invalidUnit: 'Ungültige Einheit'\n  },\n  TimeField: {\n    invalidTime: 'Ungültige Zeitangabe'\n  },\n  //endregion\n  //region Others\n  DateHelper: {\n    locale: 'de',\n    weekStartDay: 1,\n    // Non-working days which match weekends by default, but can be changed according to schedule needs\n    nonWorkingDays: {\n      0: true,\n      6: true\n    },\n    // Days considered as weekends by the selected country, but could be working days in the schedule\n    weekends: {\n      0: true,\n      6: true\n    },\n    unitNames: [{\n      single: 'Millisekunde',\n      plural: 'Millisekunden',\n      abbrev: 'ms'\n    }, {\n      single: 'Sekunde',\n      plural: 'Sekunden',\n      abbrev: 's'\n    }, {\n      single: 'Minute',\n      plural: 'Minuten',\n      abbrev: 'min'\n    }, {\n      single: 'Stunde',\n      plural: 'Stunden',\n      abbrev: 'std'\n    }, {\n      single: 'Tag',\n      plural: 'Tage',\n      abbrev: 't'\n    }, {\n      single: 'Woche',\n      plural: 'Wochen',\n      abbrev: 'W'\n    }, {\n      single: 'Monat',\n      plural: 'Monathe',\n      abbrev: 'mon'\n    }, {\n      single: 'Quartal',\n      plural: 'Quartal',\n      abbrev: 'Q'\n    }, {\n      single: 'Jahr',\n      plural: 'Jahre',\n      abbrev: 'jahr'\n    }, {\n      single: 'Dekade',\n      plural: 'Jahrzehnte',\n      abbrev: 'dek'\n    }],\n    // Used to build a RegExp for parsing time units.\n    // The full names from above are added into the generated Regexp.\n    // So you may type \"2 w\" or \"2 wk\" or \"2 week\" or \"2 weeks\" into a DurationField.\n    // When generating its display value though, it uses the full localized names above.\n    unitAbbreviations: [['mil'], ['s', 'sec'], ['m', 'min'], ['h', 'hr'], ['d'], ['w', 'wk'], ['mo', 'mon', 'mnt'], ['q', 'quar', 'qrt'], ['y', 'yr'], ['dek']],\n    parsers: {\n      L: 'DD.MM.YYYY',\n      LT: 'HH:mm'\n    },\n    ordinalSuffix: function ordinalSuffix(number) {\n      return number;\n    }\n  },\n  PagingToolbar: {\n    firstPage: 'Gehe zur ersten Seite',\n    prevPage: 'Zurück zur letzten Seite',\n    page: 'Seite',\n    nextPage: 'Gehe zur nächsten Seite',\n    lastPage: 'Gehe zur letzten Seite',\n    reload: 'Aktuelle Seite neu laden',\n    noRecords: 'Keine Zeilen zum Anzeigen',\n    pageCountTemplate: function pageCountTemplate(data) {\n      return 'von ' + data.lastPage;\n    },\n    summaryTemplate: function summaryTemplate(data) {\n      return 'Ergebnisse ' + data.start + ' - ' + data.end + ' von ' + data.allCount;\n    }\n  },\n  PanelCollapser: {\n    Collapse: 'Reduzieren',\n    Expand: 'Erweitern'\n  },\n  List: {\n    loading: 'Beladung...'\n  },\n  //region Export\n  PdfExport: {\n    'Waiting for response from server': 'Warten auf Antwort vom Server...',\n    'Export failed': 'Export fehlgeschlagen',\n    'Server error': 'Serverfehler',\n    'Generating pages': 'Seiten generieren ...'\n  },\n  ExportDialog: {\n    width: '40em',\n    labelWidth: '12em',\n    exportSettings: 'Exporteinstellungen',\n    \"export\": 'Export',\n    exporterType: 'Kontrolliere die Paginierung',\n    cancel: 'Stornieren',\n    fileFormat: 'Datei Format',\n    rows: 'Reihen',\n    alignRows: 'Zeilen ausrichten',\n    columns: 'Säulen',\n    paperFormat: 'Papierformat',\n    orientation: 'Orientierung',\n    repeatHeader: 'Header wiederholen'\n  },\n  ExportRowsCombo: {\n    all: 'Alle Zeilen',\n    visible: 'Sichtbare Zeilen'\n  },\n  ExportOrientationCombo: {\n    portrait: 'Porträt',\n    landscape: 'Landschaft'\n  },\n  EventCopyPaste: {\n    copyEvent: 'Kopieren redigieren',\n    cutEvent: 'Schnitt redigieren',\n    pasteEvent: 'Einfügen redigieren'\n  },\n  SinglePageExporter: {\n    singlepage: 'Einzelne Seite'\n  },\n  MultiPageExporter: {\n    multipage: 'Mehrere Seiten',\n    exportingPage: function exportingPage(data) {\n      return 'Seite exportieren ' + data.currentPage + '/' + data.totalPages;\n    }\n  },\n  MultiPageVerticalExporter: {\n    multipagevertical: 'Mehrere Seiten (vertikal)',\n    exportingPage: function exportingPage(data) {\n      return 'Seite exportieren ' + data.currentPage + '/' + data.totalPages;\n    }\n  },\n  //endregion\n  //endregion\n  //region Scheduler\n  ResourceInfoColumn: {\n    eventCountText: function eventCountText(data) {\n      return data + ' Veranstaltung' + (data !== 1 ? 'en' : '');\n    }\n  },\n  Dependencies: {\n    from: 'Von',\n    to: 'Zo',\n    valid: 'Gültig',\n    invalid: 'Ungültig'\n  },\n  DependencyType: {\n    SS: 'AA',\n    SF: 'EA',\n    FS: 'AE',\n    FF: 'EE',\n    StartToStart: 'Anfang-Anfang',\n    StartToEnd: 'Anfang-Ende',\n    EndToStart: 'Enge-Anfang',\n    EndToEnd: 'Enge-Ende',\n    \"short\": ['AA', 'EA', 'AE', 'EE'],\n    \"long\": ['Anfang-Anfang', 'Anfang-Ende', 'Enge-Anfang', 'Enge-Ende']\n  },\n  DependencyEdit: {\n    From: 'Von',\n    To: 'Zu',\n    Type: 'Typ',\n    Lag: 'Verzögern',\n    'Edit dependency': 'Abhängigkeit bearbeiten',\n    Save: 'Speichern',\n    Delete: 'Löschen',\n    Cancel: 'Abbrechen',\n    StartToStart: 'Anfang-Anfang',\n    StartToEnd: 'Anfang-Ende',\n    EndToStart: 'Ende-Anfang',\n    EndToEnd: 'Ende-Ende'\n  },\n  EventEdit: {\n    Name: 'Name',\n    Resource: 'Ressource',\n    Start: 'Start',\n    End: 'Ende',\n    Save: 'Speichern',\n    Delete: 'Löschen',\n    Cancel: 'Abbrechen',\n    'Edit event': 'Buchung redigieren',\n    Repeat: 'Wiederholen'\n  },\n  EventDrag: {\n    eventOverlapsExisting: 'Ereignis überlappt vorhandenes Ereignis für diese Ressource',\n    noDropOutsideTimeline: 'Event wird möglicherweise nicht vollständig außerhalb der Timeline gelöscht'\n  },\n  SchedulerBase: {\n    'Add event': 'Ereignis hinzufügen',\n    'Delete event': 'Buchung löschen',\n    'Unassign event': 'Ereignis nicht zuordnen'\n  },\n  // TODO: 'headerContextMenu' is deprecated. Please see https://bryntum.com/docs/scheduler/guide/Scheduler/upgrades/3.1.0 for more information.\n  HeaderContextMenu: {\n    pickZoomLevel: 'Zoomen',\n    activeDateRange: 'Datumsbereich',\n    startText: 'Anfangsdatum',\n    endText: 'Endtermin',\n    todayText: 'Heute'\n  },\n  TimeAxisHeaderMenu: {\n    pickZoomLevel: 'Zoomen',\n    activeDateRange: 'Datumsbereich',\n    startText: 'Anfangsdatum',\n    endText: 'Endtermin',\n    todayText: 'Heute'\n  },\n  EventFilter: {\n    filterEvents: 'Aufgaben filtern',\n    byName: 'Namentlich'\n  },\n  TimeRanges: {\n    showCurrentTimeLine: 'Aktuelle Zeitleiste anzeigen'\n  },\n  PresetManager: {\n    minuteAndHour: {\n      topDateFormat: 'ddd DD.MM, HH:mm'\n    },\n    hourAndDay: {\n      topDateFormat: 'ddd DD.MM'\n    },\n    weekAndDay: {\n      displayDateFormat: 'HH:mm'\n    }\n  },\n  RecurrenceConfirmationPopup: {\n    'delete-title': 'Du löschst ein Ereignis',\n    'delete-all-message': 'Möchten Sie alle Vorkommen dieses Ereignisses löschen?',\n    'delete-further-message': 'Möchten Sie dieses und alle zukünftigen Vorkommen dieses Ereignisses oder nur das ausgewählte Vorkommen löschen?',\n    'delete-further-btn-text': 'Alle zukünftigen Ereignisse löschen',\n    'delete-only-this-btn-text': 'Nur dieses Ereignis löschen',\n    'update-title': 'Sie ändern ein sich wiederholendes Ereignis',\n    'update-all-message': 'Möchten Sie alle Vorkommen dieses Ereignisses ändern?',\n    'update-further-message': 'Möchten Sie nur dieses Vorkommen des Ereignisses oder dieses und aller zukünftigen Ereignisse ändern?',\n    'update-further-btn-text': 'Alle zukünftigen Ereignisse',\n    'update-only-this-btn-text': 'Nur dieses Ereignis',\n    Yes: 'Ja',\n    Cancel: 'Abbrechen',\n    width: 600\n  },\n  RecurrenceLegend: {\n    // list delimiters\n    ' and ': ' und ',\n    // frequency patterns\n    Daily: 'Täglich',\n    'Weekly on {1}': function WeeklyOn1(data) {\n      return 'Wöchentlich am ' + data.days;\n    },\n    'Monthly on {1}': function MonthlyOn1(data) {\n      return 'Monatlich am ' + data.days;\n    },\n    'Yearly on {1} of {2}': function YearlyOn1Of2(data) {\n      return 'Jährlich am ' + data.days + ' von ' + data.months;\n    },\n    'Every {0} days': function Every0Days(data) {\n      return 'Alle ' + data.interval + ' Tage';\n    },\n    'Every {0} weeks on {1}': function Every0WeeksOn1(data) {\n      return 'Alle ' + data.interval + ' Wochen am ' + data.days;\n    },\n    'Every {0} months on {1}': function Every0MonthsOn1(data) {\n      return 'Alle ' + data.interval + ' Monate auf ' + data.days;\n    },\n    'Every {0} years on {1} of {2}': function Every0YearsOn1Of2(data) {\n      return 'Alle ' + data.interval + ' Jahre auf ' + data.days + ' von ' + data.months;\n    },\n    // day position translations\n    position1: 'ersten',\n    position2: 'zweiten',\n    position3: 'dritten',\n    position4: 'vierten',\n    position5: 'fünften',\n    'position-1': 'letzten',\n    // day options\n    day: 'Tag',\n    weekday: 'Wochentag',\n    'weekend day': 'Wochenend-Tag',\n    // {0} - day position info (\"the last\"/\"the first\"/...)\n    // {1} - day info (\"Sunday\"/\"Monday\"/.../\"day\"/\"weekday\"/\"weekend day\")\n    // For example:\n    //  \"the last Sunday\"\n    //  \"the first weekday\"\n    //  \"the second weekend day\"\n    daysFormat: function daysFormat(data) {\n      return data.position + ' ' + data.days;\n    }\n  },\n  RecurrenceEditor: {\n    'Repeat event': 'Ereignis wiederholen',\n    Cancel: 'Abbrechen',\n    Save: 'Speichern',\n    Frequency: 'Häufigkeit',\n    Every: 'Jede(n/r)',\n    DAILYintervalUnit: 'Tag',\n    WEEKLYintervalUnit: 'Woche',\n    MONTHLYintervalUnit: 'Monat',\n    YEARLYintervalUnit: 'Jahr',\n    Each: 'Jeder',\n    'On the': 'Am',\n    'End repeat': 'Ende',\n    'time(s)': 'Zeit'\n  },\n  RecurrenceDaysCombo: {\n    day: 'Tag',\n    weekday: 'Wochentag',\n    'weekend day': 'Wochenend-Tag'\n  },\n  RecurrencePositionsCombo: {\n    position1: 'ersten',\n    position2: 'zweiten',\n    position3: 'dritten',\n    position4: 'vierten',\n    position5: 'fünften',\n    'position-1': 'letzten'\n  },\n  RecurrenceStopConditionCombo: {\n    Never: 'Niemals',\n    After: 'Nach',\n    'On date': 'Am Tag'\n  },\n  RecurrenceFrequencyCombo: {\n    Daily: 'täglich',\n    Weekly: 'wöchentlich',\n    Monthly: 'monatlich',\n    Yearly: 'jährlich'\n  },\n  RecurrenceCombo: {\n    None: 'Nie',\n    Custom: 'Benutzerdefiniert...'\n  },\n  //region Features\n  Summary: {\n    'Summary for': function SummaryFor(date) {\n      return 'Zusammenfassung für ' + date;\n    }\n  },\n  //endregion\n  //region Export\n  ScheduleRangeCombo: {\n    completeview: 'Vollständiger Zeitplan',\n    currentview: 'Sichtbarer Zeitplan',\n    daterange: 'Datumsbereich',\n    completedata: 'Vollständiger Zeitplan (für alle Veranstaltungen)'\n  },\n  SchedulerExportDialog: {\n    'Schedule range': 'Zeitplanbereich ',\n    'Export from': 'Von',\n    'Export to': 'Zu'\n  },\n  ExcelExporter: {\n    'No resource assigned': 'Keine Ressource zugewiesen'\n  },\n  //endregion\n  //region Examples\n  Column: {\n    Name: 'Name',\n    Age: 'Alter',\n    City: 'Stadt',\n    Food: 'Essen',\n    Color: 'Farbe',\n    'First name': 'Vorname',\n    Surname: 'Nachname',\n    Team: 'Team',\n    Score: 'Ergebnis',\n    Rank: 'Rang',\n    Percent: 'Prozent',\n    Birthplace: 'Geburstort',\n    Start: 'Anfang',\n    Finish: 'Ende',\n    Template: 'Vorlage (template)',\n    Date: 'Datum',\n    Check: 'Check',\n    Contact: 'Kontakt',\n    Favorites: 'Favoriten',\n    'Customer#': 'Kunde#',\n    When: 'Wann',\n    Brand: 'Marke',\n    Model: 'Modell',\n    'Personal best': 'Persönlicher rekord',\n    'Current rank': 'Aktueller rang',\n    Hometown: 'Heimatstadt',\n    Satisfaction: 'Zufriedenheit',\n    'Favorite color': 'Lieblingsfarbe',\n    Rating: 'Wertung',\n    Cooks: 'Zuberaiten',\n    Birthday: 'Geburstag',\n    Staff: 'Personal',\n    Machines: 'Maschinen',\n    Type: 'Typ',\n    'Task color': 'Aufgabe farbe',\n    'Employment type': 'Beschäftigungsverhältnis',\n    Capacity: 'Kapazität',\n    'Production line': 'Fließband',\n    Company: 'Firma',\n    End: 'Ende'\n  },\n  //endregion\n  CrudManagerView: {\n    serverResponseLabel: 'Serverantwort:'\n  }\n};\n\n//# sourceURL=webpack:///./examples/localization/locales/custom.locale.De.js?")}})}));