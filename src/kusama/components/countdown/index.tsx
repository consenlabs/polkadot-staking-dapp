import React, { Component } from 'react'
import countdown from 'countdown'
import './index.scss'

interface Props {
  endTime: number
}

class CountDown extends Component<Props, any> {

  constructor(props) {
    super(props)
    this.state = {
      timespan: {}
    }
  }

  timerId: null


  componentDidMount() {
    this.timerId = countdown(this.props.endTime, (ts) => {
      this.setState({ timespan: ts })
    })
  }

  componentWillMount() {
    this.timerId && clearInterval(this.timerId)
  }

  componentWillUnmount() {
  }

  render() {
    const { timespan } = this.state
    return <div className="countdown">
      <i>{doubleDigit(timespan.days)}</i>
      <span>{'day'}</span>
      <i>{doubleDigit(timespan.hours)}</i>
      <span>:</span>
      <i>{doubleDigit(timespan.minutes)}</i>
      <span>:</span>
      <i>{doubleDigit(timespan.seconds)}</i>
    </div>
  }
}

const doubleDigit = (num) => {
  return String(num).length < 2 ? `0${num}` : num
}

export default CountDown