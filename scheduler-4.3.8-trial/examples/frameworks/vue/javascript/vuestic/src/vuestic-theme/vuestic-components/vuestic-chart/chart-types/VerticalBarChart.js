import { Bar } from 'vue-chartjs'
import { chartMixin } from './chartMixin.js'

export default {
  extends: Bar,
  mixins: [chartMixin],
}
