<template>
  <vuestic-layout v-layout>
    <app-navbar :isOpen="opened" @toggle-menu="toggleSidebar"/>
    <app-sidebar :isOpen="opened" @toggle-menu="toggleSidebar"/>
    <main
      slot="content"
      id="content"
      class="content va-layout gutter--lg fluid"
      role="main"
    >
      <app-breadcrumbs/>
      <vuestic-pre-loader
        v-show="isLoading"
        class="pre-loader"
      />
      <router-view/>
    </main>
    <span slot="footer">
      ©2018. Made by&nbsp;<a href="https://epicmax.co" target="_blank"> Epicmax</a>
    </span>
  </vuestic-layout>
</template>

<script>
import VuesticLayout
  from '../../vuestic-theme/vuestic-components/vuestic-layout/VuesticLayout.vue'
import AppNavbar from './app-navbar/AppNavbar.vue'
import AppSidebar from './app-sidebar/AppSidebar.vue'
import AppBreadcrumbs from './app-breadcrumbs/AppBreadcrumbs.vue'
import Layout from '../../vuestic-theme/vuestic-directives/Layout.js'
import { mapGetters } from 'vuex'

export default {
  name: 'app-layout',
  components: {
    VuesticLayout,
    AppNavbar,
    AppSidebar,
    AppBreadcrumbs,
  },
  directives: {
    layout: Layout,
  },
  data () {
    return {
      opened: true,
    }
  },
  methods: {
    toggleSidebar (opened) {
      this.opened = opened
    },
  },
  computed: {
    ...mapGetters([
      'isLoading',
    ]),
  },
}
</script>
