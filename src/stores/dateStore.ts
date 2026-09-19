import { getDateRangeAPI } from '@/apis/clickstream_node'
import { defineStore } from 'pinia'

type YearMonthData = {
  [year: number]: number[]
}

export const useDateStore = defineStore('date', () => {
  const dates = ref<string[]>([])
  const years = ref<number[]>([])
  const months = ref<YearMonthData>({})
  const latestDate = ref('')

  const loadedLang = ref('')

  const getDateRange = async (lang = 'zh'): Promise<void> => {
    const res = await getDateRangeAPI(lang)
    const dateRange = res.data

    dates.value = dateRange.dates
    years.value = dateRange.years
    months.value = dateRange.months
    latestDate.value = dateRange.latestDate

    loadedLang.value = lang
  }

  const ensureDateRange = async (lang = 'zh'): Promise<void> => {
    if (loadedLang.value === lang && dates.value.length > 0) {
      return
    }

    await getDateRange(lang)
  }

  const getNearestDate = (currDate: string): string => {
    const index = dates.value.indexOf(currDate)
    return dates.value[index - 1] || dates.value[index + 1]
  }

  return {
    dates,
    years,
    months,
    latestDate,
    getDateRange,
    ensureDateRange,
    getNearestDate
  }
})
