<!--
 * Main App component
 -->
<template>
    <div id="app">
        <bryntum-demo-header
            link='../../../../../#example-frameworks-vue-javascript-advanced'
        />
        <demo-header/>
        <keep-alive>
            <router-view/>
        </keep-alive>
  </div>
</template>

<script>
    // Stockholm theme
    import 'bootstrap/scss/bootstrap.scss';
    // Bootstrap css forces page and body size
    // https://github.com/twbs/bootstrap/issues/25629
    import './bootstrap-fix.css';

    import DemoHeader from './components/header/Header';
    import { BryntumDemoHeader } from '@bryntum/scheduler-vue';

    export default {
        components : {
            DemoHeader,
            BryntumDemoHeader
        }
    }
</script>

<style lang="scss">
    @import './App.scss';
</style>
