'use strict'
const moment = require('moment')
const assert = require('assert')
// const should = require('should')
// const path = require('path')
const touchPoint = require('../lib/period.js')

describe('TouchPoint Type generation test', function () {
  it('should return Upcoming when client has no valid clientTouchedAt value', function () {
    const clientData = {
      clientTouchedAt: null,
      ClientSegment: {
        frequency: 'Monthly'
      }
    }

    assert.equal(touchPoint.calculateTouchPointType(clientData), 'Upcoming')
  })

  it('should return None when client has no valid clientTouchedAt value but frequency is None', function () {
    const clientData = {
      clientTouchedAt: null,
      ClientSegment: {
        frequency: 'None'
      }
    }

    assert.equal(touchPoint.calculateTouchPointType(clientData), 'None')
  })

  it('should return None when client has no valid ClientSegment value', function () {
    const clientData = {
      clientTouchedAt: null,
      ClientSegment: null
    }

    assert.equal(touchPoint.calculateTouchPointType(clientData), 'None')
  })

  it('should return None when client has no valid ClientSegment value even it has valid clientTouchedAt value', function () {
    const clientData = {
      clientTouchedAt: '2020-09-15 16:14:20',
      ClientSegment: null
    }

    assert.equal(touchPoint.calculateTouchPointType(clientData), 'None')
  })

  it('should return the right statuses when client has Monthly frequency', function () {
    const daysToFirstDayOfCurrentMonth =
      moment().date() > 1 ? moment().date() - 1 : 0
    const daysToLastDayOfPreviousMonth = moment().date() + 1
    const missedTouchPoint = moment()
      .subtract(2, 'months')
      .toDate()
    const doneTouchPoint = moment()
      .subtract(daysToFirstDayOfCurrentMonth, 'days')
      .toDate()
    const upcomingTouchPoint = moment()
      .subtract(daysToLastDayOfPreviousMonth, 'days')
      .toDate()

    const dates = [missedTouchPoint, upcomingTouchPoint, doneTouchPoint]
    const assertations = ['Missed', 'Upcoming', 'Done']

    dates.forEach((date, i) => {
      const clientData = {
        clientTouchedAt: date,
        ClientSegment: {
          frequency: 'Monthly'
        }
      }
      assert.equal(
        touchPoint.calculateTouchPointType(clientData),
        assertations[i]
      )
    })
  })

  it('should return the right statuses when client has Quarterly frequency', function () {
    const quarterAdjustment = (moment().month() % 3) + 1
    const lastQuarterEndDate = moment()
      .clone()
      .subtract({ months: quarterAdjustment })
      .endOf('month')
    const lastQuarterStartDate = lastQuarterEndDate
      .clone()
      .subtract({ months: 3 })
      .startOf('month')

    const missedTouchPoint = lastQuarterStartDate
      .clone()
      .subtract(1, 'days')
      .toDate()
    const upcomingTouchPoint = lastQuarterEndDate.clone().toDate()
    const doneTouchPoint = lastQuarterEndDate
      .clone()
      .add(1, 'days')
      .toDate()

    const dates = [missedTouchPoint, upcomingTouchPoint, doneTouchPoint]
    const assertations = ['Missed', 'Upcoming', 'Done']

    dates.forEach((date, i) => {
      const clientData = {
        clientTouchedAt: date,
        ClientSegment: {
          frequency: 'Quarterly'
        }
      }
      assert.equal(
        touchPoint.calculateTouchPointType(clientData),
        assertations[i]
      )
    })
  })

  it('should return the right statuses when client has Annual frequency', function () {
    const currentYearStartDate = moment()
      .clone()
      .startOf('year')
    const lastYearEndDate = currentYearStartDate.clone().subtract(1, 'days')
    const missedTouchPoint = lastYearEndDate
      .clone()
      .subtract(1, 'years')
      .toDate()
    const upcomingTouchPoint = lastYearEndDate.clone().toDate()
    const doneTouchPoint = moment()
      .clone()
      .startOf('year')
      .add(10, 'days')
      .toDate()

    const dates = [missedTouchPoint, upcomingTouchPoint, doneTouchPoint]
    const assertations = ['Missed', 'Upcoming', 'Done']

    dates.forEach((date, i) => {
      const clientData = {
        clientTouchedAt: date,
        ClientSegment: {
          frequency: 'Annual'
        }
      }
      assert.equal(
        touchPoint.calculateTouchPointType(clientData),
        assertations[i]
      )
    })
  })
})
