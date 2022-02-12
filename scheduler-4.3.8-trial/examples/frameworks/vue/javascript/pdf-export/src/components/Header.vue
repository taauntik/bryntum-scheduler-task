<!--
 * Header with title and buttons
-->

<template>
    <header class="demo-header">
        <div id="title-container">
          <a id="title" :href="link">{{ $props.title }}</a>
        </div>
        <div id="tools">
            <app-button color="orange b-skip-test" text="Export" action="export"></app-button>
            <bryntum-fullscreen-button></bryntum-fullscreen-button>
        </div>
    </header>
</template>

<script>
    import { BryntumFullscreenButton } from '@bryntum/scheduler-vue';
    import AppButton from './Button.vue';

    export default {
        name  : 'app-header',
        props : {
            link  : { type : String, default : '..' },
            title : { type : String, default : 'Example Header' }
        },
        components: {
            BryntumFullscreenButton,
            AppButton
        },
        mounted() {
            document.title = this.$props.title;
        }

    } // exports the header components
</script>
