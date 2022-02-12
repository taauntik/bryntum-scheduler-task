<!--
 * Custom event editor component
-->
<template>
    <v-dialog
        v-model="editorShown"
        width="500"
    >
        <v-card>
            <v-card-title
                class="headline grey lighten-2"
                primary-title
            >
                {{ eventName || '&nbsp;'}}
            </v-card-title>

            <v-card-text class="pt-5">
                <v-text-field
                    label="Name"
                    v-model="eventName"
                    prepend-icon="mdi-file-document-edit-outline"
                    class="pb-3 event-name"
                ></v-text-field>
                <datetime v-model="startDate" label="Start" />
                <datetime v-model="endDate" label="End" />
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn color="primary" text @click="editorShown = false">Cancel</v-btn>
                <v-btn color="primary" text @click="saveHandler">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import Datetime from './DateTime.vue';

    export default {
        name  : 'event-editor',

        props : {
            value : [ Boolean, Object ],
            eventRecord : Object,
            eventStore : Object,
            resourceId : [ String, Number ]
        },

        components : {
            Datetime
        },

        data() {
            return {
                eventName : '',
                endDate : null,
                startDate : null
            }
        },

        methods: {
            saveHandler(){
                var me = this;

                // Mark this event as a real one
                me.eventRecord.isCreating = false;

                // Set the name
                me.eventRecord.set({name: me.eventName});

                // Calling this method updates also duration (resizes the event)
                me.eventRecord.setStartEndDate(me.startDate, me.endDate);

                if (!me.eventRecord.eventStore) {
                    // New record is needed as Vue adds watchers to the original.
                    // See https://github.com/bryntum/support/issues/2754
                    const data = {...me.eventRecord.data, resourceId: me.resourceId};
                    me.eventStore.add(data);
                }

                // Close the editor
                me.editorShown = false;
                this.$emit('close');
            }
        },

        computed : {
            editorShown : {
                get() {
                    const
                        me = this,
                        eventRecord = me.eventRecord
                    ;

                    // we're opening so initialize data
                    if(true === me.value) {
                        if(eventRecord) {
                            Object.assign(me, {
                                eventName : eventRecord.name,
                                startDate : new Date(eventRecord.startDate),
                                endDate : new Date(eventRecord.endDate)
                            })
                        }
                    }

                    // return always Boolean
                    return !!this.value;
                },
                // only runs on close
                set(value) {
                    const { eventRecord, eventStore } = this;
                    if(eventRecord.isCreating) {
                        eventStore.remove(eventRecord);
                        eventRecord.isCreating = false;
                    }
                    this.$emit('input', value);
                }
            }
        }
    }
</script>
