/* eslint-disable */

import colors from 'chalk'
import DateModule from '../lib/support/modules/DateModule'
import moment from 'moment-business-days'

const PLUGIN_NAME = `📙 ${colors.yellow('np.Templating')}`
const section = colors.blue
const block = colors.magenta.green
const method = colors.magenta.bold

describe(`${PLUGIN_NAME}`, () => {
  describe(section('DateModule'), () => {
    it(`should ${method('.createDateTime')} from pivotDate`, async () => {
      const pivotDate = '2021-11-24'

      const result = new DateModule().createDateTime(pivotDate)

      const test = new Date(`${pivotDate}T00:01:00`).toLocaleString()

      expect(result).toEqual(test)
    })

    it(`should ${method('.createDateTime')} from current date`, async () => {
      const result = new DateModule().createDateTime()
      const resultFormatted = moment(new Date(result)).format('YYYY-MM-DD')
      let testDate = moment(new Date()).format('YYYY-MM-DD')

      const test = new Date(`${testDate}T00:01:00`).toLocaleString()

      expect(resultFormatted).toContain(testDate)
    })

    it(`should render ${method('.now')}`, async () => {
      const result = new DateModule().now()
      expect(result).toEqual(moment(new Date()).format('YYYY-MM-DD'))
    })

    it(`should render ${method('.now')} using short format`, () => {
      const result = new DateModule().now('short')

      const test = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' }).format(new Date())

      expect(result).toEqual(test)
    })

    it(`should render ${method('.now')} using 'medium' format`, () => {
      const result = new DateModule().now('medium')

      const test = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date())

      expect(result).toEqual(test)
    })

    it(`should render ${method('.now')} using 'long' format`, () => {
      const result = new DateModule().now('long')

      const test = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date())

      expect(result).toEqual(test)
    })

    it(`should render ${method('.now')} using 'full' format`, () => {
      const result = new DateModule().now('full')

      const test = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date())

      expect(result).toEqual(test)
    })

    it(`should render ${method('.now')} using custom format`, async () => {
      const result = new DateModule().now('YYYY-MM')
      expect(result).toEqual(moment(new Date()).format('YYYY-MM'))
    })

    it(`should render ${method('.now')} using configuration`, async () => {
      const testConfig = {
        defaultFormats: {
          date: 'YYYY-MM',
        },
      }
      const result = new DateModule(testConfig).now()
      expect(result).toEqual(moment(new Date()).format('YYYY-MM'))
    })

    it(`should render ${method('.now')} using positive offset`, async () => {
      const result = new DateModule().now('', 7)

      const assertValue = moment(new Date()).add(7, 'days').format('YYYY-MM-DD')

      expect(result).toEqual(assertValue)
    })

    it(`should render ${method('.now')} using negative offset`, async () => {
      const result = new DateModule().now('', -7)

      const assertValue = moment(new Date()).subtract(7, 'days').format('YYYY-MM-DD')

      expect(result).toEqual(assertValue)
    })

    it(`should render ${method('.today')}`, async () => {
      const result = new DateModule().today()

      expect(result).toEqual(moment(new Date()).format('YYYY-MM-DD'))
    })

    it(`should render ${method('.today')} w/ custom format`, async () => {
      const result = new DateModule({ defaultFormats: { date: 'short' } }).today()

      expect(result).toEqual(moment(new Date()).format('MM/D/YY'))
    })

    it(`should render ${method('.yesterday')}`, async () => {
      const result = new DateModule().yesterday()

      const assertValue = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD')

      expect(result).toEqual(assertValue)
    })

    it(`should render ${method('.yesterday')} w/ intl format`, async () => {
      const result = new DateModule({ defaultFormats: { date: 'short' } }).yesterday()

      const assertValue = moment(new Date()).subtract(1, 'days').format('MM/D/YY')

      expect(result).toEqual(assertValue)
    })

    it(`should render ${method('.yesterday')} w/ custom format`, async () => {
      const result = new DateModule({ defaultFormats: { date: 'short' } }).yesterday('YYYY/MM/DD')

      const assertValue = moment(new Date()).subtract(1, 'days').format('YYYY/MM/DD')

      expect(result).toEqual(assertValue)
    })

    it(`should render ${method('.tomorrow')}`, async () => {
      const result = new DateModule().tomorrow()

      const assertValue = moment(new Date()).add(1, 'days').format('YYYY-MM-DD')

      expect(result).toEqual(assertValue)
    })

    it(`should render ${method('.tomorrow')} w/ intl format`, async () => {
      const result = new DateModule({ defaultFormats: { date: 'short' } }).tomorrow()

      const assertValue = moment(new Date()).add(1, 'days').format('MM/D/YY')

      expect(result).toEqual(assertValue)
    })

    it(`should render ${method('.tomorrow')} w/ custom format`, async () => {
      const result = new DateModule({ defaultFormats: { date: 'short' } }).tomorrow('YYYY/MM/DD')

      const assertValue = moment(new Date()).add(1, 'days').format('YYYY/MM/DD')

      expect(result).toEqual(assertValue)
    })

    it(`should render ${method('.weekday')} (this monday)`, async () => {
      const result = new DateModule().weekday('', 0)

      const assertValue = moment(new Date()).weekday(0).format('YYYY-M-DD')

      expect(result).toEqual(assertValue)
    })

    it(`should render ${method('.weekday')} (this monday) using pivotDate`, async () => {
      const result = new DateModule().weekday('', 0, '2021-11-03')

      expect(result).toEqual('2021-10-31')
    })

    it(`should render true if ${method('.isWeekend')}`, async () => {
      const result = new DateModule().isWeekend('10-16-2021')

      expect(result).toEqual(true)
    })

    it(`should render false if not ${method('.isWeekend')}`, async () => {
      const result = new DateModule().isWeekend('10-15-2021')

      expect(result).toEqual(false)
    })

    it(`should render true if ${method('.isWeekday')}`, async () => {
      const result = new DateModule().isWeekday('10-15-2021')

      expect(result).toEqual(true)
    })

    it(`should ${method('.format')} supplied date`, async () => {
      const result = new DateModule().format('YYYY-MM', '2021-10-16')

      const assertValue = moment('2021-10-16').format('YYYY-MM')

      expect(result).toEqual(assertValue)
    })

    it(`should calculate ${method('.weekOf')} based on current date`, async () => {
      let result = new DateModule().weekOf()

      const startDate = new DateModule().weekday('YYYY-MM-DD', 0)
      const endDate = new DateModule().weekday('MM/DD', 6)
      const weekNumber = new DateModule().weeknumber(startDate)

      // W44 (2021-10-31..11/06)
      const assertValue = `W${weekNumber} (${startDate}..${endDate})`

      expect(result).toEqual(assertValue)
    })

    it(`should calculate ${method('.weekOf')} based on pivotDate`, async () => {
      const pivotDate = '2021-11-03'
      let result = new DateModule().weekOf(null, null, pivotDate)
      const startDate = new DateModule().weekday('YYYY-MM-DD', 0, pivotDate)
      const endDate = new DateModule().weekday('MM/DD', 6, pivotDate)
      const weekNumber = new DateModule().weeknumber(startDate)

      // W44 (2021-10-31..11/06)
      const assertValue = `W${weekNumber} (${startDate}..${endDate})`

      expect(result).toEqual(assertValue)
    })

    it(`should calculate ${method('.weekOf')} based on pivotDate only`, async () => {
      const pivotDate = '2021-11-03'
      let result = new DateModule().weekOf(pivotDate)

      const startDate = new DateModule().weekday('YYYY-MM-DD', 0, pivotDate)
      const endDate = new DateModule().weekday('MM/DD', 6, pivotDate)
      const weekNumber = new DateModule().weeknumber(startDate)

      const assertValue = `W${weekNumber} (${startDate}..${endDate})`

      expect(result).toEqual(assertValue)
    })

    describe(`${block('business days')}`, () => {
      it(`should ${method('.businessAdd')} using supplied current date`, async () => {
        const result = new DateModule().businessAdd(3)

        const test = new DateModule().isWeekday(result)

        expect(test).toEqual(true)
      })

      it(`should ${method('.businessAdd')} using supplied pivotDate`, async () => {
        const pivotDate = '2021-11-24'

        const result = new DateModule().businessAdd(3, pivotDate)

        expect(result).toEqual('2021-11-29')
      })

      it(`should ${method('.businessAdd')} using supplied pivotDate using custom format`, async () => {
        const pivotDate = '2021-11-24'

        const result = new DateModule().businessAdd(3, pivotDate, 'MM/DD/YYYY')

        expect(result).toEqual('11/29/2021')
      })

      it(`should ${method('.businessSubtract')} using supplied current date`, async () => {
        const result = new DateModule().businessSubtract(3)

        const test = new DateModule().isWeekday(result)

        expect(test).toEqual(true)
      })

      it(`should ${method('.businessSubtract')} using supplied pivotDate`, async () => {
        const pivotDate = '2021-11-22'

        const result = new DateModule().businessSubtract(3, pivotDate)

        expect(result).toEqual('2021-11-17')
      })

      it(`should ${method('.businessSubtract')} using supplied pivotDate with custom format`, async () => {
        const pivotDate = '2021-11-22'

        const result = new DateModule().businessSubtract(3, pivotDate, 'MM/DD/YYYY')

        expect(result).toEqual('11/17/2021')
      })

      it(`should ${method('.nextBusinessDay')} from current date`, async () => {
        const result = new DateModule().nextBusinessDay()

        let test = new DateModule().isWeekday(result)

        expect(test).toEqual(true)
      })

      it(`should ${method('.nextBusinessDay')} from pivotDate`, async () => {
        const result = new DateModule().nextBusinessDay('2021-11-30')

        expect(result).toEqual('2021-12-01')
      })

      it(`should ${method('.nextBusinessDay')} from pivotDate with custom format`, async () => {
        const result = new DateModule().nextBusinessDay('2021-11-30', 'MM/DD/YYYY')

        expect(result).toEqual('12/01/2021')
      })

      it(`should ${method('.previousBusinessDay')} from current date`, async () => {
        const result = new DateModule().previousBusinessDay()

        let test = new DateModule().isWeekday(result)

        expect(test).toEqual(true)
      })

      it(`should ${method('.previousBusinessDay')} from pivotDate`, async () => {
        const result = new DateModule().previousBusinessDay('2021-12-01')

        expect(result).toEqual('2021-11-30')
      })

      it(`should ${method('.previousBusinessDay')} from pivotDate with custom format`, async () => {
        const result = new DateModule().previousBusinessDay('2021-12-01', 'MM/DD/YYYY')

        expect(result).toEqual('11/30/2021')
      })
    })
  })
})