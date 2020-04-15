export function parseDuration(duration) {
  const regex = /P((([1-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/
  var matches = duration.match(regex)
  return {
    years: parseFloat(matches[3]),
    months: parseFloat(matches[5]),
    weeks: parseFloat(matches[7]),
    days: parseFloat(matches[9]),
    hours: parseFloat(matches[12]),
    minutes: parseFloat(matches[14]),
    seconds: parseFloat(matches[16]),
  }
}

export function timeago(date) {
  const seconds = Math.floor((Date.now() - date) / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor(seconds / 60)

  if (days > 1) {
    return date.toLocaleString('default', { month: 'short', day: 'numeric' })
  } else if (hours >= 1) {
    return hours + ' hr' + (hours > 1 ? 's' : '')
  } else if (minutes >= 1) {
    return minutes + ' min' + (minutes > 1 ? 's' : '')
  }

  return seconds + ' sec'
}
