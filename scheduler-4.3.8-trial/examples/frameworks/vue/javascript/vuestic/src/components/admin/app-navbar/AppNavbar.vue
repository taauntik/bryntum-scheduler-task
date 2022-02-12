<template>
  <vuestic-navbar>
    <header-selector slot="selector" :isOpen.sync="valueProxy"/>
    <span slot="logo">
      <router-link id="title" href="../../../../../#example-frameworks-vue-javascript-vuestic" to="" @click.native="titleClick">
        <h1>Vue Scheduler + Vuestic demo</h1>
      </router-link>
    </span>
    <message-dropdown class="col nav-item"/>
    <notification-dropdown class="col nav-item"/>
    <language-dropdown class="col nav-item"/>
    <profile-dropdown class="col nav-item">
      <img class="profile-img" src="logo_bryntum_bw.png"/>
    </profile-dropdown>
  </vuestic-navbar>
</template>

<script>
import VuesticIconVuestic from '../../../vuestic-theme/vuestic-components/vuestic-icon/VuesticIconVuestic.vue';
import VuesticNavbar from '../../../vuestic-theme/vuestic-components/vuestic-navbar/VuesticNavbar.vue';
import HeaderSelector from './components/HeaderSelector.vue';

import LanguageDropdown from './components/dropdowns/LanguageDropdown.vue';
import ProfileDropdown from './components/dropdowns/ProfileDropdown.vue';
import NotificationDropdown from './components/dropdowns/NotificationDropdown.vue';
import MessageDropdown from './components/dropdowns/MessageDropdown.vue';

export default {
  name: 'app-navbar',
  components: {
    VuesticIconVuestic,
    VuesticNavbar,
    HeaderSelector,
    MessageDropdown,
    NotificationDropdown,
    LanguageDropdown,
    ProfileDropdown,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    valueProxy: {
      get () {
        return this.isOpen
      },
      set (opened) {
        this.$emit('toggle-menu', opened)
      },
    },
  },
  methods : {
    titleClick : ({currentTarget}) => {
      window.location = currentTarget.href;
    }
  }
}
</script>
