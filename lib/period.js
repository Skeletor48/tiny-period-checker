exports.calculateTouchPointType = clientData => {

  if (!clientData.frequency) {
    return "Provided data is not valid!"
  }

  if (
    !clientData.clientTouchedAt &&
    clientData.frequency
  ) {
    return 'Upcoming'
  }

  const touchPoint = new Date(
    new Date(clientData.clientTouchedAt).toISOString().substring(0, 10) +
    'T00:00:00Z'
  )

  return getTouchPointType(touchPoint, clientData.frequency)
}

const getTouchPointType = (touchPoint, frequency) => {
  const isTouchedInCurrentPeriod = this.periodChecker(frequency, touchPoint, true)

  if (isTouchedInCurrentPeriod) {
    return 'Done'
  }

  const isTouchedInPreviousPeriod = this.periodChecker(frequency, touchPoint)

  if (isTouchedInPreviousPeriod) {
    return 'Upcoming'
  }

  return 'Missed'
}

const modifyDateToPreviousPeriod = frequency => {
  const yearInMillisec = 31557600000
  const currentDate = new Date(
    new Date().toISOString().substring(0, 10) + 'T00:00:00Z'
  )

  const currentTime = new Date(currentDate).getTime()

  const modifiedDateMap = {
    Annual: new Date(
      new Date(new Date(currentTime - yearInMillisec))
        .toISOString()
        .substring(0, 10) + 'T00:00:00Z'
    ),
    Quarterly: new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        getMonthsOfQuarter(currentDate).firstMonth,
        0,
        0,
        0,
        0
      )
    ),
    Monthly: new Date(
      Date.UTC(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        0,
        0,
        0,
        0
      )
    )
  }

  return modifiedDateMap[frequency]
}

exports.periodChecker = (frequency, touchPoint, isCurrentPeriodCheck) => {
  const date = isCurrentPeriodCheck
    ? new Date()
    : modifyDateToPreviousPeriod(frequency)
  const period = this.getPeriod(frequency, date)
  return period.firstDate <= touchPoint && touchPoint <= period.lastDate
}

exports.getPeriod = (frequency, date) => {
  const frequencyPeriodMap = {
    Annual: {
      firstDate: new Date(Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0)),
      lastDate: new Date(Date.UTC(date.getUTCFullYear(), 12, 0, 23, 59, 59))
    },
    Quarterly: {
      firstDate: new Date(
        Date.UTC(
          date.getUTCFullYear(),
          getMonthsOfQuarter(date).firstMonth,
          1,
          0,
          0,
          0
        )
      ),
      lastDate: new Date(
        Date.UTC(
          date.getUTCFullYear(),
          getMonthsOfQuarter(date).lastMonth + 1,
          0,
          23,
          59,
          59
        )
      )
    },
    Monthly: {
      firstDate: new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0)
      ),
      lastDate: new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59)
      )
    }
  }

  return frequencyPeriodMap[frequency]
}

const getMonthsOfQuarter = date => {
  const quarter = this.getQuarter(date)
  const monthMap = {
    1: {
      firstMonth: 0,
      lastMonth: 2
    },
    2: {
      firstMonth: 3,
      lastMonth: 5
    },
    3: {
      firstMonth: 6,
      lastMonth: 8
    },
    4: {
      firstMonth: 9,
      lastMonth: 11
    }
  }

  return monthMap[quarter]
}

exports.getQuarter = date => {
  return Math.ceil((date.getUTCMonth() + 1) / 3)
}
