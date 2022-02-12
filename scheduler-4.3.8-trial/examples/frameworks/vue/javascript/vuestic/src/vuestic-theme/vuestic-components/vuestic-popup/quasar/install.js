import Platform from './plugins/platform.js'
import Vue from 'vue'

export const installQuasarPlatform = () => {
  const queues = {
    server: [], // on SSR update
    takeover: [], // on client takeover
  }

  const framework = {}
  Platform.install(framework, queues, Vue)
}
