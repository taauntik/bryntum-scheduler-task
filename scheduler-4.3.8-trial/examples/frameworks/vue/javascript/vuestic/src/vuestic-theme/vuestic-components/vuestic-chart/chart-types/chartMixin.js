import { mixins } from 'vue-chartjs'
import { defaultConfig } from '../VuesticChartConfigs.js'

export const chartMixin = {
  mixins: [mixins.reactiveProp],
  props: ['data', 'chartOptions'],
  mounted () {
    this.refresh()
  },
  methods: {
    refresh () {
      this.renderChart(this.chartData, this.options)
    },
  },
  computed: {
    // `this.options` is used by vue-chart.js mixin on refresh.
    options () {
      return Object.assign({}, defaultConfig, this.chartOptions)
    },
  },
}
