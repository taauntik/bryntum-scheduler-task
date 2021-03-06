import { Bubble } from 'vue-chartjs'
import { chartMixin } from './chartMixin.js'

export default {
  extends: Bubble,
  mixins: [chartMixin],
}
