/**
 * folder  : example folder under ./examples
 * group   : browser page group
 * title   : example title
 * build   : true if example needs building
 * offline : true if example is not available online
 * since   : package version since example is available
 */
window.examples = [
    // Basic
    { folder : 'animations', group : 'Basic', title : 'Animations' },
    { folder : 'basic', group : 'Basic', title : 'Basic' },
    { folder : 'configuration', group : 'Basic', title : 'Configuration' },
    { folder : 'customeventstyling', group : 'Basic', title : 'Custom event styling', updated : '4.3.4' },
    { folder : 'dragselection', group : 'Basic', title : 'Drag drop selection mode', since : '2.0' },
    { folder : 'eventstyles', group : 'Basic', title : 'Event styles', updated : '4.0.0' },
    { folder : 'fillticks', group : 'Basic', title : 'Fill ticks' },
    { folder : 'filtering', group : 'Basic', title : 'Filtering' },
    { folder : 'resource-collapsing', group : 'Basic', title : 'Resource collapsing', since : '4.1.5' },
    { folder : 'resourcetimeranges', group : 'Basic', title : 'Resource time ranges', since : '1.2' },
    { folder : 'rowheight', group : 'Basic', title : 'Row height', updated : '4.1' },
    { folder : 'scrollto', group : 'Basic', title : 'Scrolling' },
    { folder : 'simpleeditor', group : 'Basic', title : 'Simple event editor', since : '2.0' },
    { folder : 'timeranges', group : 'Basic', title : 'Time ranges' },
    { folder : 'timeresolution', group : 'Basic', title : 'Time resolution' },
    { folder : 'tooltips', group : 'Basic', title : 'Tooltips' },
    { folder : 'vertical', group : 'Basic', title : 'Vertical mode', since : '2.2', updated : '4.2.3' },

    // Intermediate
    { folder : 'bigdataset', group : 'Intermediate', title : 'Big data set', updated : '4.3.1' },
    { folder : 'bigdataset-tree', group : 'Intermediate', title : 'Big data set tree', since : '4.3.1' },
    { folder : 'bigdataset-vertical', group : 'Intermediate', title : 'Big data set vertical', since : '2.2' },
    { folder : 'columns', group : 'Intermediate', title : 'Columns', since : '2.0' },
    { folder : 'eventeditor', group : 'Intermediate', title : 'Event editor', updated : '4.2.6' },
    { folder : 'eventeditor-combos', group : 'Intermediate', title : 'Event editor with cascading combos' },
    { folder : 'eventmenu', group : 'Intermediate', title : 'Customized event menu', since : '1.2', updated : '4.1.6' },
    { folder : 'grouping', group : 'Intermediate', title : 'Grouping' },
    { folder : 'icons', group : 'Intermediate', title : 'Icons' },
    { folder : 'infinite-scroll', group : 'Intermediate', title : 'Infinite timeline scrolling', since : '4.2.0' },
    { folder : 'labels', group : 'Intermediate', title : 'Labels', updated : '4.1' },
    { folder : 'layouts', group : 'Intermediate', title : 'Event layouts', updated : '4.1' },
    { folder : 'localization', group : 'Intermediate', title : 'Localization' },
    { folder : 'milestonelayout', group : 'Intermediate', title : 'Milestone layout' },
    { folder : 'multiassign', group : 'Intermediate', title : 'Multi assignment' },
    { folder : 'nestedevents', group : 'Intermediate', title : 'Nested events' },
    { folder : 'nonworkingdays', group : 'Intermediate', title : 'Non-working days', since : '4.1.0' },
    { folder : 'recurrence', group : 'Intermediate', title : 'Recurring events', since : '2.3' },
    { folder : 'recurringtimeranges', group : 'Intermediate', title : 'Recurring time ranges', since : '3.0.3' },
    { folder : 'responsive', group : 'Intermediate', title : 'Responsive' },
    { folder : 'stress', group : 'Intermediate', title : 'Stress test', since : '4.1' },
    { folder : 'summary', group : 'Intermediate', title : 'Summary', updated : '4.1.5' },
    { folder : 'tree', group : 'Intermediate', title : 'Tree' },
    { folder : 'validation', group : 'Intermediate', title : 'Validation when dragging, creating or resizing tasks' },
    { folder : 'workingtime', group : 'Intermediate', title : 'Working hours & days', since : '2.0' },

    // Advanced
    { folder : 'dependencies', group : 'Advanced', title : 'Dependencies' },
    { folder : 'drag-between-schedulers', group : 'Advanced', title : 'Drag drop tasks between different Scheduler instances', since : '1.2' },
    { folder : 'drag-onto-tasks', group : 'Advanced', title : 'Drag drop objects onto tasks' },
    { folder : 'dragfromgrid', group : 'Advanced', title : 'Drag drop from a grid', updated : '4.2.0' },
    { folder : 'export', group : 'Advanced', title : 'Export to PDF/PNG', since : '3.0' },
    { folder : 'exporttoexcel', group : 'Advanced', title : 'Export to Excel' },
    { folder : 'exporttoics', group : 'Advanced', title : 'Export to ICS', since : '4.0' },
    { folder : 'groupsummary', group : 'Advanced', title : 'Group summary', updated : '4.2.5' },
    { folder : 'histogramsummary', group : 'Advanced', title : 'Summary with histogram' },
    { folder : 'multiassign-with-dependencies', group : 'Advanced', title : 'Multi assignment + dependencies', since : '2.0' },
    { folder : 'multisummary', group : 'Advanced', title : 'Multi summary' },
    { folder : 'partners', group : 'Advanced', title : 'Partnered Schedulers', updated : '2.3' },
    { folder : 'rough', group : 'Advanced', title : 'Custom styling with Rough.js', since : '2.0' },
    { folder : 'tasks', group : 'Advanced', title : 'Tasks application demo' },
    { folder : 'theme', group : 'Advanced', title : 'Custom theme' },
    { folder : 'timeaxis', group : 'Advanced', title : 'Non-continuous time axis', since : '2.0' },
    { folder : 'undoredo', group : 'Advanced', title : 'Undo/Redo' },
    { folder : 'websockets', group : 'Advanced', title : 'WebSockets online demo', build : true, since : '2.0' },

    // Integration
    { folder : 'crudmanager', group : 'Integration', title : 'Backend in PHP + CrudManager', overlay : 'php' },
    
    { folder : 'custom-event-editor', group : 'Integration', title : 'Replace the event editor', since : '4.0', updated : '4.2.0' },
    { folder : 'custom-eventmenu', group : 'Intermediate', title : 'Replace the event menu', since : '4.0' },
    { folder : 'esmodule', group : 'Integration', title : 'Include using EcmaScript module' },
    { folder : 'extjsmodern', group : 'Integration', title : 'ExtJS Modern App integration demo', overlay : 'extjs', version : 'ExtJS 6.5.3', updated : '4.2' },
    { folder : 'php', group : 'Integration', title : 'Backend in PHP', overlay : 'php' },
    { folder : 'salesforce', group : 'Integration', title : 'Integrate with Salesforce Lightning (offline)', offline : true },
    { folder : 'scripttag', group : 'Integration', title : 'Include using script tag' },
    { folder : 'webcomponents', group : 'Integration', title : 'Use as web component' },

    // Integration/DotNet
    { folder : 'frameworks/aspnet', group : 'Integration', title : 'ASP.NET demo', overlay : 'dotnet', offline : true, since : '3.1.0' },
    { folder : 'frameworks/aspnetcore', group : 'Integration', title : 'ASP.NET Core demo', overlay : 'dotnet', offline : true, since : '3.1.0' },

    // Integration/WebPack
    { folder : 'frameworks/webpack', group : 'Integration', title : 'Custom build using WebPack', overlay : 'webpack', version : 'WebPack 4', since : '2.3', offline : true },

    // Integration/Angular
    { folder : 'frameworks/angular/advanced', group : 'Integration/Angular', title : 'Angular Routing + NgRx demo', overlay : 'angular', version : 'Angular 13', build : true, since : '2.0', updated : '4.3.4' },
    { folder : 'frameworks/angular/angular-11-routing', group : 'Integration/Angular', title : 'Angular 11 Routing demo', overlay : 'angular', version : 'Angular 11', build : true, since : '4.1.1' },
    { folder : 'frameworks/angular/angular-6', group : 'Integration/Angular', title : 'Angular 6 demo', overlay : 'angular', version : 'Angular 6', build : true },
    { folder : 'frameworks/angular/angular-7', group : 'Integration/Angular', title : 'Angular 7 demo', overlay : 'angular', version : 'Angular 7', build : true },
    { folder : 'frameworks/angular/angular-8', group : 'Integration/Angular', title : 'Angular 8 demo', overlay : 'angular', version : 'Angular 8', build : true, since : '2.3' },
    { folder : 'frameworks/angular/animations', group : 'Integration/Angular', title : 'Angular Animations demo', overlay : 'angular', version : 'Angular 13', build : true, since : '2.0', updated : '4.3.4' },
    { folder : 'frameworks/angular/basic', group : 'Integration/Angular', title : 'Angular Basic demo', overlay : 'angular', version : 'Angular 8', build : true, since : '2.0' },
    { folder : 'frameworks/angular/custom-event-editor', group : 'Integration/Angular', title : 'Angular Custom Event Editor demo', overlay : 'angular', version : 'Angular 13', build : true, since : '2.2.5', updated : '4.3.4' },
    { folder : 'frameworks/angular/dependencies', group : 'Integration/Angular', title : 'Angular Dependencies demo', overlay : 'angular', version : 'Angular 8', build : true, since : '2.0', updated : '4.2' },
    { folder : 'frameworks/angular/drag-between-schedulers', group : 'Integration/Angular', title : 'Angular Drag between Schedulers', overlay : 'angular', version : 'Angular 8', build : true, since : '2.0', updated : '2.3' },
    { folder : 'frameworks/angular/drag-from-grid', group : 'Integration/Angular', title : 'Angular Drag Tasks from Grid', overlay : 'angular', version : 'Angular 13', build : true, since : '2.0', updated : '4.3.4' },
    { folder : 'frameworks/angular/drag-onto-tasks', group : 'Integration/Angular', title : 'Angular Drop Equipment onto Tasks', overlay : 'angular', version : 'Angular 8', build : true, since : '2.0' },
    { folder : 'frameworks/angular/filtering', group : 'Integration/Angular', title : 'Angular Filtering demo', overlay : 'angular', version : 'Angular 8', build : true, since : '2.0' },
    { folder : 'frameworks/angular/localization', group : 'Integration/Angular', title : 'Angular Localization demo', overlay : 'angular', version : 'Angular 8', build : true, since : '2.0' },
    { folder : 'frameworks/angular/pdf-export', group : 'Integration/Angular', title : 'Angular PDF export demo (offline)', overlay : 'angular', version : 'Angular 8', build : true, since : '3.0', offline : true },
    { folder : 'frameworks/angular/recurring-events', group : 'Integration/Angular', title : 'Angular Recurring Events Demo', overlay : 'angular', version : 'Angular 9', build : true, since : '3.1' },
    { folder : 'frameworks/angular/recurring-timeranges', group : 'Integration/Angular', title : 'Angular Recurring Timeranges Demo', overlay : 'angular', version : 'Angular 13', build : true, since : '4.3.4' },
    { folder : 'frameworks/angular/tasks', group : 'Integration/Angular', title : 'Angular Tasks demo', overlay : 'angular', version : 'Angular 8', build : true, since : '2.0' },

    // Integration/Ionic
    { folder : 'frameworks/ionic/ionic-4', group : 'Integration/Ionic', title : 'Integrate with Ionic', build : true, overlay : 'ionic', version : 'Ionic 4', since : '1.2.1' },
    { folder : 'frameworks/ionic/themes', group : 'Integration/Ionic', title : 'Themes with Ionic', build : true, overlay : 'ionic', version : 'Ionic 4', since : '3.0' },

    // Integration/React
    { folder : 'frameworks/react/javascript/advanced', group : 'Integration/React', title : 'React + Redux Toolkit advanced demo', overlay : 'react', version : 'React 17', build : true, since : '2.0' },
    { folder : 'frameworks/react/javascript/animations', group : 'Integration/React', title : 'React animations demo', overlay : 'react', version : 'React 16', build : true, since : '2.0' },
    { folder : 'frameworks/react/javascript/custom-event-editor', group : 'Integration/React', title : 'React Custom Event Editor demo', overlay : 'react', version : 'React 16', build : true, since : '2.2' },
    { folder : 'frameworks/react/javascript/dependencies', group : 'Integration/React', title : 'React dependencies demo', overlay : 'react', version : 'React 16', build : true, since : '2.0' },
    { folder : 'frameworks/react/javascript/drag-between-schedulers', group : 'Integration/React', title : 'React Drag between Schedulers demo', overlay : 'react', version : 'React 16', build : true, since : '2.0' },
    { folder : 'frameworks/react/javascript/drag-from-grid', group : 'Integration/React', title : 'React Drag from Grid demo', overlay : 'react', version : 'React 16', build : true, since : '2.0', updated : '4.2.0' },
    { folder : 'frameworks/react/javascript/drag-onto-tasks', group : 'Integration/React', title : 'React Drag onto Tasks demo', overlay : 'react', version : 'React 16', build : true, since : '2.0' },
    { folder : 'frameworks/react/javascript/filtering', group : 'Integration/React', title : 'React Filtering Demo', overlay : 'react', version : 'React 16', build : true, since : '2.2' },
    { folder : 'frameworks/react/javascript/localization', group : 'Integration/React', title : 'React localization demo', overlay : 'react', version : 'React 16', build : true, since : '2.1' },
    { folder : 'frameworks/react/javascript/pdf-export', group : 'Integration/React', title : 'React PDF export demo (offline)', overlay : 'react', version : 'React 16', build : true, since : '3.0', offline : true },
    { folder : 'frameworks/react/javascript/react-state', group : 'Integration/React', title : 'Using React state demo', overlay : 'react', version : 'React 17', build : true, since : '4.3.2' },
    { folder : 'frameworks/react/javascript/simple', group : 'Integration/React', title : 'React simple demo', overlay : 'react', version : 'React 16', build : true, since : '2.0', updated : '2.3' },
    { folder : 'frameworks/react/javascript/vertical', group : 'Integration/React', title : 'React Vertical mode demo', overlay : 'react', version : 'React 17', build : true, since : '4.1' },
    { folder : 'frameworks/react/typescript/basic', group : 'Integration/React', title : 'React + TypeScript basic demo', overlay : 'react', version : 'React 16', build : true, since : '1.2' },
    { folder : 'frameworks/react/typescript/filtering', group : 'Integration/React', title : 'React + TypeScript filtering demo', overlay : 'react', version : 'React 16', build : true, since : '2.2' },
    { folder : 'frameworks/react/typescript/recurring-events', group : 'Integration/React', title : 'React + TypeScript Recurring Events demo', overlay : 'react', version : 'React 16', build : true, since : '3.1' },
    { folder : 'frameworks/react/typescript/recurring-timeranges', group : 'Integration/React', title : 'React + TypeScript Recurring Timeranges Demo', overlay : 'react', version : 'React 16', build : true, since : '4.3.4' },

    // Integration/Vue
    { folder : 'frameworks/vue/javascript/advanced', group : 'Integration/Vue', title : 'Vue Advanced demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.0.4' },
    { folder : 'frameworks/vue/javascript/animations', group : 'Integration/Vue', title : 'Vue Animations demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.0.4' },
    { folder : 'frameworks/vue/javascript/custom-event-editor', group : 'Integration/Vue', title : 'Vue Custom Event Editor demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.2.5' },
    { folder : 'frameworks/vue/javascript/dependencies', group : 'Integration/Vue', title : 'Vue Dependencies demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.0.4' },
    { folder : 'frameworks/vue/javascript/drag-between-schedulers', group : 'Integration/Vue', title : 'Vue Drag between Schedulers demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.0.4' },
    { folder : 'frameworks/vue/javascript/drag-from-grid', group : 'Integration/Vue', title : 'Vue Drag Tasks from grid demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.0.4', updated : '4.2.0' },
    { folder : 'frameworks/vue/javascript/drag-onto-tasks', group : 'Integration/Vue', title : 'Vue Drag onto Tasks demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.0.4' },
    { folder : 'frameworks/vue/javascript/localization', group : 'Integration/Vue', title : 'Vue Localization demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.0.4' },
    { folder : 'frameworks/vue/javascript/pdf-export', group : 'Integration/Vue', title : 'Vue PDF export demo', overlay : 'vue', version : 'Vue 2', build : true, since : '3.0', offline : true },
    { folder : 'frameworks/vue/javascript/simple', group : 'Integration/Vue', title : 'Vue Simple demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.0.4' },
    { folder : 'frameworks/vue/javascript/tasks', group : 'Integration/Vue', title : 'Vue Tasks demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.0.4' },
    { folder : 'frameworks/vue/javascript/vue-renderer', group : 'Integration/Vue', title : 'Vue Cell Renderer Demo', overlay : 'vue', version : 'Vue 2', build : true, since : '4.1' },
    { folder : 'frameworks/vue/javascript/vuestic', group : 'Integration/Vue', title : 'Vue Integrate Vuestic Admin demo', overlay : 'vue', version : 'Vue 2', build : true, since : '2.0' },

    // Integration/Vue-3
    { folder : 'frameworks/vue-3/javascript/simple', group : 'Integration/Vue', title : 'Vue 3 Simple demo', overlay : 'vue', version : 'Vue 3', build : true, since : '4.1' }

];
