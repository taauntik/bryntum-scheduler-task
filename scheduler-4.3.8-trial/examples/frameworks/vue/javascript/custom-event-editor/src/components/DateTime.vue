<!--
/**
 * Datetime component
 *
 * Combines text fields and Vuetify date and
 * time pickers into one datetime field.
 */
-->
<template>
    <v-container ma-0 pa-0>
        <v-row>
            <v-col cols="6" class="">
                <v-menu
                    v-model="datePickerShown"
                    :close-on-content-click="false"
                    :nudge-right="100"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                >
                    <template v-slot:activator="{ on }">
                        <v-text-field
                            :value="dateString"
                            :label="dateLabel"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker v-model="dateString" @input="datePickerShown = false"></v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="6" class="">
                <v-menu
                    :close-on-content-click="false"
                    :nudge-right="80"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                >
                    <template v-slot:activator="{ on }">
                        <v-text-field
                            :value="timeString"
                            :label="timeLabel"
                            prepend-icon="mdi-clock-outline"
                            readonly
                            v-on="on"
                        ></v-text-field>
                    </template>
                    <v-time-picker v-model="timeString" format="24hr"></v-time-picker>
                </v-menu>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import format from 'date-fns/format';

    export default {
        name : 'datetime',

        props : {
            value : [ Date, null ],
            label : String
        },

        mounted() {
            this.setDateStrings();
        },

        data() {
            return {
                dateString: null,
                dateLabel: this.label + ' date',
                datePickerShown:false,

                timeString: null,
                timeLabel: this.label + ' time'
            }
        },

        watch : {
            value() {
                this.setDateStrings();
            },
            dateString(value) {
                let d = new Date(this.value);
                this.setDate(d, value);
                this.$emit('input', d);
            },

            timeString(value) {
                let d = new Date(this.value);
                this.setTime(d, value);
                this.$emit('input', d);
            }
        },

        methods : {
            setDateStrings() {
                let me = this;
                    me.dateString = format(this.value, 'yyyy-MM-dd');
                    me.timeString = format(this.value, 'HH:mm')
                ;
            },
            setDate(date, parts) {
                if('string' === typeof parts) {
                    parts = parts.split('-');
                }
                date.setFullYear(parts[0]);
                date.setMonth(parts[1] - 1);
                date.setDate(parts[2]);
            },

            setTime(date, parts) {
                if('string' === typeof parts) {
                    parts = parts.split(':');
                }
                date.setHours(parts[0]);
                date.setMinutes(parts[1]);
            }
        }

    }
</script>
