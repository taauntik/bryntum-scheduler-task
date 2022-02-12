const
    Project                 = new Siesta.Project.Browser(),
    { isPR, isTC, isTrial } = BryntumTestHelper;

Project.configure({
    title                   : 'Bryntum Scheduler Test Suite',
    isReadyTimeout          : 20000, // longer for memory profiling which slows things down
    testClass               : BryntumSchedulerTest,
    runCore                 : 'sequential',
    disableCaching          : false,
    autoCheckGlobals        : false,
    keepResults             : false,
    enableCodeCoverage      : Boolean(window.IstanbulCollector),
    failOnResourceLoadError : true,
    turboMode               : true,
    recorderConfig          : {
        recordOffsets    : false,
        ignoreCssClasses : [
            'b-sch-event-hover',
            'b-active',
            'b-icon',
            'b-hover',
            'b-dirty',
            'b-focused',
            'b-contains-focus'
        ],
        shouldIgnoreDomElementId : id => /^b-/.test(id)
    }
});

const
    getItems                = mode => {
        const
            examples   = [
                {
                    pageUrl : '../examples/animations?test',
                    url     : 'examples/animations.t.js'
                },
                'basic',
                {
                    pageUrl : '../examples/bigdataset?test',
                    url     : 'examples/bigdataset.t.js'
                },
                'bigdataset-tree',
                'bigdataset-vertical',
                {
                    pageUrl : '../examples/columns?test',
                    url     : 'examples/columns.t.js'
                },
                {
                    pageUrl : '../examples/configuration',
                    url     : 'examples/configuration.t.js'
                },
                {
                    pageUrl : '../examples/crudmanager?test',
                    url     : 'examples/crudmanager.t.js'
                },
                // 'csp', // Skip testing (Siesta cannot run CSP page)
                {
                    pageUrl : '../examples/custom-event-editor?test',
                    url     : 'examples/customeventeditor.t.js'
                },
                {
                    pageUrl : '../examples/customeventstyling?test',
                    url     : 'examples/customeventstyling.t.js'
                },
                {
                    pageUrl : '../examples/dependencies?test',
                    url     : 'examples/dependencies.t.js'
                },
                'drag-between-schedulers',
                {
                    pageUrl : '../examples/drag-onto-tasks?test',
                    url     : 'examples/dragontotasks.t.js'
                },
                {
                    pageUrl : '../examples/dragfromgrid?test',
                    url     : 'examples/dragfromgrid.t.js'
                },
                {
                    pageUrl            : '../examples/dragfromgrid?test',
                    url                : 'examples/dragfromgrid_overlap.t.js',
                    mouseDragPrecision : 1
                },
                'dragselection',
                // 'esmodule', // Skip testing
                'eventmenu',
                'eventeditor',
                {
                    pageUrl : '../examples/eventeditor?test',
                    url     : 'examples/eventeditor.t.js'
                },
                {
                    pageUrl : '../examples/eventeditor-combos?test',
                    url     : 'examples/eventeditor-combos.t.js'
                },
                {
                    pageUrl : '../examples/eventstyles?test&reset',
                    url     : 'examples/eventstyles.t.js'
                },
                'export',
                'exporttoics',
                {
                    pageUrl : '../examples/exporttoexcel?test',
                    url     : 'examples/exporttoexcel.t.js'
                },
                {
                    pageUrl     : '../examples/extjsmodern',
                    url         : 'examples/extjsmodern.t.js',
                    keepPageUrl : true
                },
                'fillticks',
                {
                    pageUrl : '../examples/filtering?test',
                    url     : 'examples/filtering.t.js'
                },
                {
                    pageUrl : '../examples/grouping?test',
                    url     : 'examples/grouping.t.js'
                },
                {
                    pageUrl : '../examples/groupsummary?test',
                    url     : 'examples/groupsummary.t.js'
                },
                'histogramsummary',
                'icons',
                {
                    pageUrl : '../examples/labels?test',
                    url     : 'examples/labels.t.js'
                },
                {
                    pageUrl : '../examples/layouts?test',
                    url     : 'examples/layouts.t.js'
                },
                {
                    pageUrl : '../examples/localization?test&reset',
                    url     : 'examples/localization.t.js'
                },
                {
                    pageUrl : '../examples/milestonelayout?test&reset',
                    url     : 'examples/milestonelayout.t.js'
                },
                'multiassign',
                'multiassign-with-dependencies',
                'multisummary',
                {
                    pageUrl : '../examples/nestedevents?test&reset',
                    url     : 'examples/nestedevents.t.js'
                },
                {
                    pageUrl : '../examples/nonworkingdays?test&reset',
                    url     : 'examples/nonworkingdays.t.js'
                },
                {
                    pageUrl            : '../examples/partners?test',
                    url                : 'examples/partners_resize.t.js',
                    mouseDragPrecision : 1,
                    alsoPreload        : [preloadNoResizeObserver],
                    // TODO Configure this and similar tests to handle window ResizeObserver errors
                    // https://github.com/bryntum/bryntum-suite/issues/1323
                    skip               : !bowser.chrome
                },
                {
                    pageUrl     : '../examples/partners?test',
                    url         : 'examples/partners_scroll.t.js',
                    alsoPreload : [preloadNoResizeObserver]
                },
                {
                    pageUrl : '../examples/php?test',
                    url     : 'examples/php.t.js'
                },
                'recurrence',
                {
                    pageUrl : '../examples/recurringtimeranges',
                    url     : 'examples/recurringtimeranges.t.js'
                },
                'resource-collapsing',
                'resourcetimeranges',
                'responsive',
                'rough',
                'rowheight',
                // 'salesforce', // Skip testing
                {
                    pageUrl     : '../examples/scripttag',
                    keepPageUrl : true
                },
                'scrollto',
                'simpleeditor',
                {
                    pageUrl : '../examples/summary?test',
                    url     : 'examples/summary.t.js'
                },
                'tasks',
                'theme',
                {
                    pageUrl : '../examples/timeaxis?test',
                    url     : 'examples/timeaxis.t.js'
                },
                {
                    pageUrl : '../examples/timeranges?test',
                    url     : 'examples/timeranges.t.js'
                },
                {
                    pageUrl : '../examples/timeresolution?test',
                    url     : 'examples/timeresolution.t.js'
                },
                {
                    pageUrl : '../examples/tooltips?test',
                    url     : 'examples/tooltips.t.js'
                },
                {
                    pageUrl : '../examples/tree?test',
                    url     : 'examples/tree.t.js'
                },
                {
                    pageUrl : '../examples/undoredo?test',
                    url     : 'examples/undoredo.t.js'
                },
                {
                    pageUrl : '../examples/validation?test',
                    url     : 'examples/validation.t.js'
                },
                {
                    pageUrl    : '../examples/vertical?test',
                    includeFor : isTrial ? 'module' : 'es6',
                    url        : 'examples/vertical.t.js'
                },
                {
                    pageUrl     : '../examples/webcomponents?test',
                    url         : 'examples/webcomponents.t.js',
                    keepPageUrl : true,
                    includeFor  : isTrial ? 'module' : 'es6'
                },
                {
                    pageUrl : '../examples/websockets?test',
                    url     : 'examples/websockets.t.js'
                },
                {
                    pageUrl : '../examples/workingtime?test',
                    url     : 'examples/workingtime.t.js'
                },
                {
                    pageUrl        : '../examples/stress',
                    url            : 'examples/stresstest.t.js',
                    alsoPreload    : preloadNoResizeObserver,
                    defaultTimeout : 120000
                }
            ],

            frameworks = [
                'angular/advanced',
                'angular/angular-6',
                {
                    pageUrl : 'angular/angular-7',
                    url     : 'angular/angular-7.t.js'
                },
                {
                    pageUrl : 'angular/angular-8',
                    url     : 'angular/angular-8.t.js'
                },
                'angular/angular-7',
                'angular/angular-8',
                {
                    pageUrl : 'angular/angular-11-routing',
                    url     : 'angular/angular-11-routing.t.js'
                },
                'angular/animations',
                {
                    pageUrl : 'angular/basic',
                    url     : 'angular/angular-basic.t.js'
                },
                {
                    pageUrl       : 'angular/custom-event-editor',
                    url           : 'angular/angular-custom-event-editor.t.js',
                    viewportWidth : 1200
                },
                'angular/dependencies',
                'angular/drag-between-schedulers',
                {
                    pageUrl : 'angular/drag-from-grid',
                    url     : 'angular/angular-drag-from-grid.t.js'
                },
                'angular/drag-onto-tasks',
                'angular/filtering',
                'angular/localization',
                'angular/pdf-export',
                'angular/recurring-events',
                'angular/recurring-timeranges',
                'angular/tasks',
                'ionic/ionic-4',
                'ionic/themes',
                'react/javascript/advanced',
                'react/javascript/animations',
                {
                    pageUrl       : 'react/javascript/custom-event-editor',
                    url           : 'react/react-custom-event-editor.t.js',
                    viewportWidth : 1200
                },
                'react/javascript/dependencies',
                'react/javascript/drag-between-schedulers',
                'react/javascript/drag-from-grid',
                {
                    pageUrl : 'react/javascript/drag-onto-tasks',
                    url     : 'react/react-drag-onto-tasks.t.js'
                },
                'react/javascript/drag-onto-tasks',
                'react/javascript/filtering',
                'react/javascript/localization',
                'react/javascript/pdf-export',
                {
                    pageUrl : 'react/javascript/react-state',
                    url     : 'react/react-state.t.js'

                },
                {
                    pageUrl : 'react/javascript/simple',
                    url     : 'react/react-simple.t.js'
                },
                'react/javascript/vertical',
                'react/typescript/basic',
                {
                    pageUrl : 'vue/javascript/custom-event-editor',
                    url     : 'vue/vue-custom-event-editor.t.js'
                },
                'react/typescript/filtering',
                'react/typescript/recurring-events',
                'react/typescript/recurring-timeranges',
                'vue/javascript/advanced',
                'vue/javascript/animations',
                'vue/javascript/dependencies',
                'vue/javascript/drag-between-schedulers',
                'vue/javascript/drag-from-grid',
                'vue/javascript/drag-onto-tasks',
                {
                    pageUrl : 'vue/javascript/localization',
                    url     : 'vue/vue-localization.t.js'
                },
                'vue/javascript/pdf-export',
                {
                    pageUrl : 'vue/javascript/simple',
                    url     : 'vue/vue-simple.t.js'
                },
                'vue/javascript/tasks',
                'vue/javascript/vue-renderer',
                'vue/javascript/vuestic',
                'vue-3/javascript/simple',
                // This setting requires requests to be proxied. Usual setup would be like:
                // app running on http://localhost:8080
                // tests running on http://localhost/bryntum-suite/scheduler/tests
                // CORS would block requests to different origin, so they has to be proxied.
                // Web server should be adjusted to map http://localhost/scheduler-netcore to http://localhost:8080/
                {
                    pageUrl     : '/scheduler-netcore/index.html',
                    url         : 'aspnetcore/aspnet-example.t.js',
                    keepPageUrl : true,
                    skip        : !BryntumTestHelper.isNetCore
                },
                {
                    pageUrl : 'webpack',
                    url     : 'webpack.t.js'
                }
            ],

            items      = [
                {
                    group     : 'Data',
                    collapsed : true,
                    items     : [
                        'data/020_timeaxis.t.js',
                        'data/020_timeaxis_dst.t.js',
                        'data/023_loading_data.t.js',
                        'data/026_custom_model_fields.t.js',
                        'data/026_customizable.t.js',
                        'data/028_timeaxis_dst.t.js',
                        'data/030_timeaxis_dst_chile.t.js',
                        'data/031_timeaxis_noncontinuous.t.js',
                        'data/032_timeaxis_date_methods.t.js',
                        'data/034_event_multi_assignment.t.js',
                        'data/035_id_consistency_manager.t.js',
                        'data/037_customizable_nested_set.t.js',
                        'data/AssignmentStore.t.js',
                        'data/DependencyStore.t.js',
                        'data/EventStore.t.js',
                        'data/EventStorePerformance.t.js',
                        'data/MultiAssignmentPersistence.t.js',
                        'data/ResourceStore.t.js',
                        'data/ResourceStorePerformance.t.js',
                        'data/ResourceTimeRangeStore.t.js',
                        'data/SingleAssignmentMode.t.js',
                        'data/TimeAxisExclude.t.js',
                        'data/TimeAxisFiltered.t.js',
                        'data/040_recurrence_iterators.t.js',
                        'data/040_recurrence_iterator_weekly.t.js',
                        'data/041_recurrence.t.js',
                        'data/050_initial_commit.t.js',
                        'data/UndoRedo.t.js'
                    ]
                }, {
                    group : 'CrudManager',
                    items : [
                        'crud_manager/01_add_stores.t.js',
                        'crud_manager/01_add_stores_proto.t.js',
                        'crud_manager/01_add_stores_setCrudManager.t.js',
                        'crud_manager/01_add_stores_storeIdProperty.t.js',
                        'crud_manager/02_load_package.t.js',
                        'crud_manager/02_load_package_filters.t.js',
                        'crud_manager/03_change_set_package.t.js',
                        'crud_manager/03_change_set_package2.t.js',
                        'crud_manager/03_change_set_package3.t.js',
                        'crud_manager/04_load_data.t.js',
                        'crud_manager/05_apply_change_set.t.js',
                        'crud_manager/05_apply_change_set_nested.t.js',
                        'crud_manager/06_reject.t.js',
                        {
                            url         : 'crud_manager/06_sync.t.js',
                            usesConsole : true
                        },
                        'crud_manager/06_sync_2.t.js',
                        {
                            url                     : 'crud_manager/07_load.t.js',
                            failOnPromiseRejection  : false,
                            allowedConsoleMessageRe : /Unhandled promise rejection|CrudManager error while auto-loading the data/
                        },
                        'crud_manager/07_load_inline.t.js',
                        'crud_manager/07_load_append.t.js',
                        'crud_manager/08_auto_sync.t.js',
                        //'crud_manager/09_xml_encoder.t.js',
                        'crud_manager/09_json_encoder.t.js',
                        'crud_manager/10_ajax_transport.t.js',
                        // Tests run in parallel in teamcity and possibly could start this test at the same time.
                        // Only run it in chrome to make sure there's no interference from other tests.
                        // $.browser.webkit ? {
                        //     url         : 'crud_manager/11_backend.t.js',
                        //     load        : {
                        //         url     : '../examples/php/php/read.php'
                        //     },
                        //     sync        : {
                        //         url     : '../examples/php/php/save.php'
                        //     },
                        //     resetUrl    : '../examples/php/php/reset.php'
                        // } : null,
                        'crud_manager/11_response_driven_processing.t.js',
                        {
                            url                     : 'crud_manager/12_mask.t.js',
                            failOnPromiseRejection  : false,
                            allowedConsoleMessageRe : /Unhandled promise rejection/
                        },
                        'crud_manager/13_view_update.t.js',
                        'crud_manager/14_crudmanager_sharing.t.js',
                        {
                            url                     : 'crud_manager/14_promise_reject.t.js',
                            allowedConsoleMessageRe : /CrudManager error while auto-syncing the data/
                        },
                        'crud_manager/15_date_format.t.js',
                        {
                            url         : 'crud_manager/loading_performance.t.js',
                            usesConsole : true
                        },
                        'crud_manager/Api.t.js'
                    ]
                }, {
                    group : 'Dependencies',
                    items : [
                        {
                            url       : 'dependencies/225_dependency_view.t.js',
                            turboMode : false
                        },
                        'dependencies/DependencyDrawing.t.js',
                        'dependencies/DependencyDrawing_2.t.js',
                        'dependencies/DependencyDrawing_3.t.js',
                        'dependencies/DependencyDrawing_4.t.js',
                        'dependencies/DependencyDrawing_5.t.js',
                        'dependencies/DependencyGridCache.t.js',
                        'dependencies/Create.t.js',
                        'dependencies/Create-Events.t.js',
                        'dependencies/Create-Terminals.t.js',
                        'dependencies/231_vertically_close.t.js',
                        {
                            url      : 'dependencies/Create-Type.t.js',
                            speedRun : false
                        },
                        {
                            url      : 'dependencies/Create-Validation.t.js',
                            speedRun : false
                        },
                        'dependencies/2492_persisted_dependency.t.js',
                        'dependencies/Dependencies.t.js',
                        'dependencies/DependenciesMulti.t.js',
                        'dependencies/RefreshTriggers.t.js'
                    ]
                },
                {
                    group                  : 'Docs',
                    includeFor             : isTrial ? 'module' : 'es6',
                    pageUrl                : '../docs/?reset',
                    keepPageUrl            : true,
                    subTestTimeout         : 120000,
                    defaultTimeout         : 360000,
                    waitForTimeout         : 10000,
                    disableNoTimeoutsCheck : true,
                    alsoPreload            : bowser.firefox && preloadNoResizeObserver,
                    viewportHeight         : 500,
                    viewportWidth          : 1500,
                    items                  : [
                        {
                            url            : 'docs/open-all-links.t.js',
                            subTestTimeout : 360000,
                            ignoreTopics   : [
                                'demos'
                            ],
                            ignoreLinks : [
                                'Grid/feature/CellMenu#Grid/guides/customization/contextmenu.md',
                                'Grid/view/Grid#Grid/guides/data/displayingdata.md'
                            ],
                            ignoreClasses : [
                                'guides/calendars.md',
                                'guides/project_data.md'
                            ],
                            docsTitle : 'Bryntum Scheduler'
                        },
                        {
                            url            : 'docs/verify-links-in-guides.t.js',
                            subTestTimeout : 240000,
                            ignoreLinks    : [
                                'Core/guides/advanced/widgets.md#foo'
                            ]
                        },
                        
                    ]
                },
                {
                    group : 'Column',
                    items : [
                        'column/ReplaceColumns.t.js',
                        'column/ResourceCollapseColumn.t.js',
                        {
                            failOnResourceLoadError : false,
                            url                     : 'column/ResourceInfoColumn.t.js'
                        },
                        {
                            failOnResourceLoadError : /_shared\/images\/users\/.*?\d?\.jpg$/,
                            url                     : 'column/ResourceInfoColumn2.t.js'
                        },
                        'column/TimeAxisColumn.t.js',
                        'column/VerticalTimeAxisColumn.t.js'
                    ]
                },
                {
                    group : 'Events',
                    items : [
                        'events/060_events.t.js',
                        'events/061_dragdrop.t.js',
                        'events/061_dragdrop_filtered_timeaxis.t.js',
                        'events/061_dragdrop_outside_of_view.t.js',
                        'events/061_dragdrop_sanity.t.js',
                        'events/062_resize.t.js',
                        'events/063_create.t.js',
                        'events/068_dragdrop_invalid.t.js',
                        'events/BeforeEventAdd.t.js',
                        'events/BeforeEventRemove.t.js',
                        'events/EventRefreshTriggers.t.js',
                        'events/EventStoreSetData.t.js'
                    ]
                },
                {
                    group : 'Features',
                    items : [
                        {
                            group : 'experimental',
                            items : [
                                'features/experimental/ExcelExporter.t.js',
                                'features/experimental/GridExcelExporter.t.js'
                            ]
                        },
                        {
                            group : 'Export',
                            items : [
                                'features/export/Columns.t.js',
                                'features/export/Export.t.js',
                                'features/export/ExportHeader.t.js',
                                'features/export/Features.t.js',
                                {
                                    url         : 'features/export/MultiPage.t.js',
                                    usesConsole : true
                                },
                                {
                                    url         : 'features/export/MultiPageVertical.t.js',
                                    usesConsole : true
                                },
                                'features/export/RowsOptions.t.js',
                                'features/export/SinglePage.t.js'
                            ]
                        },
                        'features/018_dragdrop_events.t.js',
                        'features/018_dragdrop_events_webcomponent.t.js',
                        'features/CellEdit.t.js',
                        'features/CellEditFields.t.js',
                        'features/ColumnLines.t.js',
                        'features/ContextMenu.t.js',
                        'features/DependencyEdit.t.js',
                        {
                            url      : 'features/DependencyEdit2.t.js',
                            speedRun : false
                        },
                        'features/EventContextMenu.t.js',
                        'features/EventCopyPaste.t.js',
                        'features/EventMenu.t.js',
                        'features/EventDrag.t.js',
                        'features/EventDrag2.t.js',
                        'features/EventDrag3.t.js',
                        'features/EventDrag4.t.js',
                        'features/EventDragBetweenSchedulers.t.js',
                        'features/EventDragCreate.t.js',
                        'features/EventDragCreate2.t.js',
                        'features/EventDragCreateAsync.t.js',
                        'features/EventDragCreateNonContinuous.t.js',
                        'features/EventDragFiltered.t.js',
                        'features/EventDragMulti.t.js',
                        'features/EventDragMultiassignment.t.js',
                        'features/EventDragNonContinuous.t.js',
                        'features/EventDragScroll.t.js',
                        'features/EventDragSelect.t.js',
                        {
                            url         : 'features/EventDragTouch.t.js',
                            alsoPreload : [preloadTouchMock]
                        },
                        'features/EventEdit.t.js',
                        {
                            alsoPreload : ['../build/scheduler.material.css'].concat(mode === 'umd' ? ['../build/scheduler.umd.js'] : []),
                            url         : 'features/EventEdit.t.js?material'
                        },
                        {
                            url         : 'features/EventEditCustomization.t.js',
                            usesConsole : true
                        },
                        'features/EventEditEvents.t.js',
                        'features/EventEditFields.t.js',
                        'features/EventEditMulti.t.js',
                        'features/EventEditSTM.t.js',
                        'features/EventResize.t.js',
                        'features/EventResize2.t.js',
                        'features/EventTooltip.t.js',
                        'features/FilterBar.t.js',
                        'features/Group.t.js',
                        'features/Grouping.t.js',
                        'features/GroupSummary.t.js',
                        'features/HeaderContextMenu.t.js',
                        'features/HeaderContextMenu2.t.js',
                        'features/HeaderZoom.t.js',
                        'features/Labels.t.js',
                        {
                            alsoPreload : preloadLocales,
                            url         : 'features/NonWorkingTime.t.js'
                        },
                        'features/Pan.t.js',
                        'features/ResourceTimeRanges.t.js',
                        'features/ResourceTimeRangesRecurrence.t.js',
                        'features/ScheduleContextMenu.t.js',
                        'features/ScheduleMenu.t.js',
                        'features/ScheduleTooltip.t.js',
                        'features/SimpleEventEdit.t.js',
                        'features/StickyEvents.t.js',
                        'features/Summary.t.js?mode=horizontal',
                        'features/Summary.t.js?mode=vertical',
                        'features/TimeAxisHeaderMenu.t.js',
                        'features/TimeRanges.t.js',
                        'features/TimeSpanMenuBase.t.js',
                        'features/TimeSpanRecordContextMenuBase.t.js',
                        'features/Tree.t.js',
                        {
                            group   : 'Recurring Events',
                            // TODO: revisit this later, try to make recurring events test to work robust in parallel
                            runCore : 'sequential',
                            items   : [
                                'features/recurrence/RecurringEvents.t.js',
                                'features/recurrence/RecurringEvents.t.js?vertical',
                                'features/recurrence/RecurringEventsCustomOccurrence.t.js',
                                'features/recurrence/RecurringEventEditor.t.js',
                                'features/recurrence/RecurringEventsConfirmationDragDrop.t.js',
                                'features/recurrence/RecurringEventsConfirmationDragResize.t.js',
                                'features/recurrence/RecurringEventsConfirmationEventEditorDelete.t.js',
                                'features/recurrence/RecurringEventsConfirmationEventEditor.t.js',
                                'features/recurrence/RecurringEventsConfirmationDelete.t.js',
                                'features/recurrence/RecurringEventsCrud.t.js',
                                'features/recurrence/RecurringAssignmentsConfirmationDelete.t.js'
                            ]
                        }
                    ]
                },
                {
                    group : 'Header',
                    items : [
                        'header/125_timeaxiscolumn_header_refresh.t.js',
                        'header/200_timeaxisview_model.t.js',
                        'header/201_timeaxisview.t.js',
                        'header/310_single_timeaxisheader.t.js',
                        'header/314_single_headers_heights.t.js',
                        'header/317_filtered_time_axis_horizontal.t.js',
                        'header/318_header_scroll_bug.t.js',
                        'header/319_not_adjusted_custom_hour_timeaxis.t.js',
                        'header/HorizontalHeaderRendering.t.js',
                        'header/ReorderColumns.t.js',
                        'header/SingleLevelHeader.t.js',
                        'header/UpdateFromHorizontalScroll.t.js'
                    ]
                },
                {
                    group : 'Localization',
                    items : [
                        
                    ]
                },
                
                {
                    group       : 'Translation',
                    alsoPreload : {
                        module : [
                            '../build/locales/scheduler.locale.En.js',
                            '../build/locales/scheduler.locale.Nl.js',
                            '../build/locales/scheduler.locale.Ru.js',
                            '../build/locales/scheduler.locale.SvSE.js'
                        ]
                    },
                    items : [
                        {
                            alsoPreload : preloadLocales,
                            url         : 'localization/Localization.t.js',
                            includeFor  : 'umd,es6'
                        }
                    ]
                },
                {
                    group : 'Model',
                    items : [
                        'model/AssignmentModel.t.js',
                        'model/DependencyModel.t.js',
                        'model/EventModel.t.js',
                        'model/ProjectModel.t.js',
                        'model/ResourceModel.t.js',
                        'model/TimeSpan.t.js'
                    ]
                },
                {
                    group : 'Performance',
                    items : [
                        'performance/CrudManagerStoreAdd.t.js',
                        'performance/ProjectStoreAdd.t.js'
                    ]
                },
                {
                    group : 'Preset',
                    items : [
                        'preset/200_preset.t.js',
                        'preset/202_preset_cfg.t.js'
                    ]
                },
                {
                    group : 'Shared',
                    items : [
                        'shared/001_view.t.js'
                    ]
                },
                {
                    group : 'Util',
                    items : [
                        'util/RectangularPathFinder.t.js',
                        'util/TableExporter.t.js'
                    ]
                },
                {
                    group   : 'View',
                    sandbox : true,
                    items   : [
                        
                        {
                            group : 'DST',
                            items : [
                                'view/dst/EventRendering.t.js'
                            ]
                        },
                        {
                            group : 'mixins',
                            items : [
                                'view/mixins/EventNavigation.t.js',
                                'view/mixins/SchedulerEventRendering.t.js',
                                'view/mixins/SchedulerResponsive.t.js',
                                'view/mixins/SchedulerScroll.t.js',
                                'view/mixins/SchedulerState.t.js',
                                'view/mixins/SchedulerStores.t.js',
                                'view/mixins/SchedulerViewPresets.t.js',
                                {
                                    url         : 'view/mixins/SchedulerZoomable.t.js',
                                    usesConsole : true
                                },
                                'view/mixins/TimelineDateMapper.t.js'
                            ]
                        },
                        {
                            group : 'model',
                            items : [
                                'view/model/RowManager.t.js',
                                'view/model/TimeAxisViewModel.t.js',
                                'view/model/TimeAxisViewModel_dst.t.js'
                            ]
                        },
                        {
                            group : 'orientation',
                            items : [
                                'view/orientation/HorizontalSchedule.t.js',
                                'view/orientation/VerticalAssignmentStore.t.js',
                                'view/orientation/VerticalEventCreate.t.js',
                                'view/orientation/VerticalEventDrag.t.js',
                                'view/orientation/VerticalEventDragCreate.t.js',
                                'view/orientation/VerticalEventResize.t.js',
                                'view/orientation/VerticalEventStore.t.js',
                                'view/orientation/VerticalFeatures.t.js',
                                'view/orientation/VerticalMapping.t.js',
                                {
                                    failOnResourceLoadError : false,
                                    url                     : 'view/orientation/VerticalRendering.t.js'
                                },
                                'view/orientation/VerticalResourceStore.t.js',
                                'view/orientation/VerticalSchedule.t.js',
                                'view/orientation/VerticalScroll.t.js',
                                'view/orientation/VerticalViewPresets.t.js'
                            ]
                        },
                        'view/2101_view.t.js',
                        'view/2107_timeaxis_projection.t.js',
                        'view/2108_getResourceRegion.t.js',
                        'view/2109_timeAxisViewModel.t.js',
                        'view/GetDateFromX.t.js',
                        'view/2114_display_date_format.t.js',
                        'view/2115_eventStore_crud.t.js',
                        'view/2115_eventStore_crud2.t.js',
                        'view/2200_item_box.t.js',
                        'view/8041_flexbox_layout.t.js',
                        {
                            // Prevent preloading of imports
                            preload    : preloads,
                            url        : 'view/SchedulerBase.t.js',
                            includeFor : 'es6'
                        },
                        'view/Scheduler.t.js',
                        'view/SchedulerMisconfiguration.t.js',
                        'view/ScheduleDblClick.t.js',
                        'view/HeaderContextMenu.t.js',
                        'view/HeaderContextMenu2.t.js',
                        'view/TimeAxisHeaderMenu.t.js',
                        'view/HorizontalTimeAxis.t.js',
                        'view/EventCommittingCls.t.js',
                        'view/EventLayout.t.js',
                        {
                            url        : 'view/Leaks.t.js',
                            includeFor : 'es6'
                        },
                        'view/MilestoneLayout.t.js',
                        'view/HeaderZoomLevels.t.js',
                        {
                            url         : 'view/Partners.t.js',
                            alsoPreload : (bowser.firefox || bowser.safari) ? [preloadNoResizeObserver] : null
                        },
                        'view/PartnerZoom.t.js',
                        'view/EventSelection.t.js',
                        'view/EventStyle.t.js',
                        'view/ExportDialog.t.js',
                        {
                            failOnResourceLoadError : false,
                            url                     : 'view/ResourceHeader.t.js'
                        },
                        'view/sanity.t.js',
                        'view/SchedulerWithAssignmentStore.t.js',
                        'view/SchedulerWithAutoCommitStore.t.js',
                        'view/SchedulerFilteredEvents.t.js',
                        'view/SchedulerFilteredTimeAxis.t.js',
                        'view/SchedulerMultiRegion.t.js',
                        'view/SchedulerNonContinuous.t.js',
                        'view/SchedulerRendering.t.js',
                        'view/Scrolling.t.js',
                        'view/SyncDataOnLoad.t.js',
                        {
                            url  : 'view/TimeViewRangePageZoom.t.js',
                            skip : !bowser.chrome
                        },
                        'view/TreeScheduler.t.js',
                        {
                            alsoPreload : preloadLocales,
                            url         : 'view/002_recurrence_dialog.t.js'
                        },
                        {
                            url        : 'view/WebComponent.t.js',
                            includeFor : isTrial ? 'module' : 'es6'
                        }
                    ]
                },
                {
                    group : 'Widget',
                    items : [
                        'widget/ResourceCombo.t.js',
                        'widget/ResourceFilter.t.js',
                        'widget/UndoRedo.t.js'
                    ]
                },
                {
                    group              : 'Trial examples',
                    skip               : !isTrial,
                    enablePageRedirect : true,
                    includeFor         : 'module',
                    consoleFail        : ['error', 'warn'],
                    items              : [
                        {
                            pageUrl    : '../examples/basic?test',
                            url        : 'examples/trial-expired-example.t.js?basic',
                            includeFor : 'umd,module'
                        },
                        {
                            pageUrl    : '../examples/filtering?test',
                            url        : 'examples/trial-expired-example.t.js?filtering',
                            includeFor : 'umd,module'
                        },
                        {
                            pageUrl    : '../examples/tree?test',
                            url        : 'examples/trial-expired-example.t.js?tree',
                            includeFor : 'umd,module'
                        },
                        {
                            pageUrl : '../examples/webcomponents?test',
                            url     : 'examples/trial-expired-example.t.js?webcomponents'
                        }
                    ]
                },

                {
                    group : 'Examples',
                    // Filter out examples used for monkey tests only
                    items : examples.filter(example => example?.pageUrl != null && example?.url != null)
                },
                {
                    group          : 'Examples browser',
                    subTestTimeout : 120000,
                    defaultTimeout : 120000,
                    waitForTimeout : 60000,
                    items          : [
                        {
                            pageUrl            : '../examples/?theme=material&test',
                            url                : 'examples/browser/examplebrowser.t.js',
                            enablePageRedirect : true,
                            exampleName        : 'columns',
                            exampleTitle       : 'Columns',
                            offlineExampleName : 'frameworks-ionic-ionic-4',
                            jumpSectionName    : 'Advanced',
                            jumpExampleName    : 'dependencies',
                            filterText         : 'group',
                            filterCount        : 2
                        },
                        {
                            pageUrl : '../examples/?online&test',
                            url     : 'examples/browser/examplebrowseronline.t.js'
                        },
                        {
                            pageUrl         : '../examples/?online&test',
                            url             : 'examples/browser/examplebrowser-links.t.js',
                            isPR,
                            isTrial,
                            config          : { skipSanityChecks : true },
                            productName     : 'Scheduler',
                            skipHeaderCheck : [
                                'esmodule',
                                'scripttag',
                                'frameworks-vue-javascript-localization'
                            ],
                            skipTrialCheck : [
                                'csp',
                                'extjsmodern',
                                'frameworks-vue-javascript-vuestic'
                            ],
                            enablePageRedirect : true,
                            defaultTimeout     : 480000,
                            skip               : {
                                // Demo browser opens module demos even if opened as umd when not run on an ancient
                                // browser (which we do not support), so no point in running this test for umd
                                umd : true
                            }
                        }
                    ]
                },
                {
                    group : 'Monkey Tests for Examples',
                    items : BryntumTestHelper.prepareMonkeyTests({
                        items  : examples,
                        mode,
                        config : {
                            webComponent   : 'bryntum-scheduler',
                            waitSelector   : '.b-sch-event',
                            targetSelector : '.b-schedulerbase',
                            skipTargets    : ['.b-resourceinfo-cell']
                        }
                    })
                },
                {
                    group : 'Smart Monkey Tests for Examples',
                    items : BryntumTestHelper.prepareMonkeyTests({
                        items        : examples.concat([{ pageUrl : '../examples' }]),
                        mode,
                        smartMonkeys : true,
                        config       : {
                            webComponent   : 'bryntum-scheduler',
                            waitSelector   : '.b-sch-event',
                            targetSelector : '.b-schedulerbase',
                            skipTargets    : ['.b-resourceinfo-cell']
                        }
                    })
                },
                {
                    group      : 'Frameworks examples (npm build)',
                    includeFor : 'umd',
                    skip       : !(isTrial && bowser.chrome),
                    items      : [
                        'examples/frameworks-build.t.js'
                    ]
                },
                {
                    group          : 'Frameworks',
                    consoleFail    : ['error', 'warn'],
                    includeFor     : isTrial ? 'umd' : 'es6',
                    config         : { skipSanityChecks : true },
                    subTestTimeout : 120000,
                    defaultTimeout : 120000,
                    skip           : isTC && !isTrial,
                    items          : [
                        {
                            group : 'Frameworks examples',
                            items : BryntumTestHelper.prepareFrameworkTests(frameworks)
                        },
                        {
                            group : 'Monkey tests for Frameworks examples',
                            items : BryntumTestHelper.prepareFrameworkMonkeyTests({
                                items  : frameworks,
                                config : {
                                    waitSelector   : '.b-sch-event',
                                    targetSelector : '.b-schedulerbase',
                                    skipTargets    : ['.b-resourceinfo-cell']
                                }
                            })
                        },
                        {
                            group : 'Smart Monkey tests for Frameworks examples',
                            items : BryntumTestHelper.prepareFrameworkMonkeyTests({
                                items        : frameworks,
                                smartMonkeys : true,
                                config       : {
                                    waitSelector   : '.b-sch-event',
                                    targetSelector : '.b-schedulerbase',
                                    skipTargets    : ['.b-resourceinfo-cell']
                                }
                            })
                        }
                    ]
                }
            ];

        return BryntumTestHelper.prepareItems(items, mode);
    },
    // Preloads for tests. Usage example: alsoPreload : [preloadName]
    preloadFont             = {
        // want size to be as equal as possible on different platforms
        type    : 'css',
        content : 'body, button { font-family: Arial, Helvetica, sans-serif;  font-size: 14px; }'
    },
    preloadLocales          = {
        umd : [
            '../examples/_shared/locales/examples.locale.En.umd.js',
            '../examples/_shared/locales/examples.locale.Nl.umd.js',
            '../examples/_shared/locales/examples.locale.Ru.umd.js',
            '../examples/_shared/locales/examples.locale.SvSE.umd.js'
        ],
        default : [{
            type         : 'js',
            isEcmaModule : true,
            content      : [
                'import En from "../lib/Scheduler/localization/En.js";',
                'import Nl from "../lib/Scheduler/localization/Nl.js";',
                'import Ru from "../lib/Scheduler/localization/Ru.js";',
                'import SvSE from "../lib/Scheduler/localization/SvSE.js";',
                'import "../examples/_shared/locales/examples.locale.En.js";',
                'import "../examples/_shared/locales/examples.locale.Nl.js";',
                'import "../examples/_shared/locales/examples.locale.Ru.js";',
                'import "../examples/_shared/locales/examples.locale.SvSE.js";',
                'if (!window.bryntum.locales) window.bryntum.locales = {};',
                'window.bryntum.locales.En = En;',
                'window.bryntum.locales.Nl = Nl;',
                'window.bryntum.locales.Ru = Ru;',
                'window.bryntum.locales.SvSE = SvSE;'
            ].join('')
        }]
    },
    preloadNoResizeObserver = {
        type    : 'js',
        content : 'window.ResizeObserver = false; window.onerror = function(err) { return /ResizeObserver/.test(err);};'
    },
    preloadTouchMock        = {
        // Force our core code to detect touch device
        type    : 'js',
        content : 'if (window.Touch) { window.ontouchstart = function(){}; }'
    },
    preloadTurbo            = {
        // To allow classes to have different config values in test execution
        type    : 'js',
        content : 'window.__applyTestConfigs = ' + String(Project.turboMode) + ';'
    },
    preloadCss              = '../build/scheduler.classic.css',
    // eslint-disable-next-line no-unused-vars
    preloadLocalization     = {
        umd : [
            '../build/locales/scheduler.locale.En.js',
            '../build/locales/scheduler.locale.Nl.js',
            '../build/locales/scheduler.locale.Ru.js',
            '../build/locales/scheduler.locale.SvSE.js',
            '../examples/localization/locales/custom.locale.De.umd.js'
        ],
        default : [{
            type         : 'js',
            isEcmaModule : true,
            content      : [
                'import En from "../lib/Scheduler/localization/En.js";',
                'import Nl from "../lib/Scheduler/localization/Nl.js";',
                'import Ru from "../lib/Scheduler/localization/Ru.js";',
                'import SvSE from "../lib/Scheduler/localization/SvSE.js";',
                'import "../examples/localization/locales/custom.locale.De.js";',
                'window.bryntum.locales.En = En;',
                'window.bryntum.locales.Nl = Nl;',
                'window.bryntum.locales.Ru = Ru;',
                'window.bryntum.locales.SvSE = SvSE;'
            ].join('')
        }]
    },
    preloads                = [
        preloadCss,
        preloadFont,
        preloadTurbo
    ],
    groups                  = [];



groups.push({
    group   : 'Using module bundle',
    preload : preloads.concat([
        {
            type         : 'js',
            isEcmaModule : true,
            content      : `
                import * as Module from "../build/scheduler.module.js";
                Object.assign(window, Module);
            `
        }
    ]),
    isEcmaModule : true,
    mode         : 'module',
    items        : getItems('module')
});

groups.push({
    group        : 'Using umd bundle',
    preload      : preloads.concat(isTrial ? '../build/scheduler.umd.js' : '../build/scheduler.umd.min.js'),
    isEcmaModule : false,
    mode         : 'umd',
    items        : getItems('umd')
});

Project.start(groups);
