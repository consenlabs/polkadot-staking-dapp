import React, { Component } from 'react'
import { connect } from "react-redux"
import { withRouter } from 'react-router-dom'
import ValidatorCard from 'kusama/components/ValidatorCard'
import { isiPhoneX } from 'kusama/lib/utils'
import t from 'kusama/locales'
import ActionSheet from 'kusama/components/Actionsheet'
import './index.scss'
import { selectSortby } from 'kusama/lib/redux/selectors'
import { updateSortby } from 'kusama/lib/redux/actions'
import { sortValidator } from './helper'
import { getUnit } from 'kusama/lib/helper'
import icons from 'kusama/lib/icons'
import { isPolkadot } from 'kusama/lib/is'

interface Props {
  validators: any[]
  sortBy: string
  updateSortby: any

  isSelect?: boolean
  currentValidator?: string
  history?: any
  isSelectable?: boolean
  selectedValidators?: string[]
  onCheckValidator?: any
  searchValue?: string
}

class Page extends Component<Props, any> {

  constructor(props) {
    super(props)

    this.state = {
      keyword: props.searchValue || '',
      actionsheetVisible: false,
    }
  }

  render() {
    const { actionsheetVisible } = this.state
    return (
      <div className={`validators-wrap ${isPolkadot() ? 'polkadot' : ''}`}>
        {this.renderBar()}
        {this.renderList()}
        {actionsheetVisible && (
          <ActionSheet
            options={['fee_asc', 'staked_total_desc', 'profit'].map(o => ({ locale: t(o, getUnit()), key: o }))}
            title={t('sort')}
            close={() => this.setState({ actionsheetVisible: false })}
            onSelect={(option) => this.props.updateSortby(option)}
          />
        )}
      </div>
    )
  }

  renderBar() {
    return (
      <div className="search-bar">
        {this.renderSearch()}
        {this.renderSort()}
      </div>
    )
  }

  renderSearch() {
    const { keyword } = this.state
    return (
      <div className="search-wrap">
        <img className="search-icon" src={icons.SEARCH} alt="search" />
        <input
          type="text"
          placeholder={t('search_validator')}
          value={keyword}
          onChange={this.onChange}
        />
        {keyword && (
          <img src={icons.CLOSE} alt="close" className="clear" onClick={() => this.setState({ keyword: '' })} />
        )}
      </div>
    )
  }

  renderSort = () => {
    return (
      <div className="sort-bar" onClick={() => this.setState({ actionsheetVisible: true })}>
        <img src={icons.SORT} alt="sort" />
      </div>
    )
  }

  renderList() {
    const { validators, sortBy, isSelectable, selectedValidators, onCheckValidator } = this.props
    const { keyword } = this.state

    if (!validators || !validators.length) {
      return (
        <div className="loading">
          <img src={icons.LOADING_VALIDATORS} style={{ width: 60, height: 60 }} alt="loading" />
          <span>{t('fetching_validators')}</span>
        </div>
      )
    }

    let sortedList = validators
    sortedList = sortValidator(validators, sortBy)

    if (keyword) {
      sortedList = sortedList.filter(v => {
        const kw = keyword.replace(/[\?\*\[\]\(\)\{\}\\\^\$]/g, '\\$&')
        return (new RegExp(kw, 'ig')).test(v.key) || (new RegExp(kw, 'ig')).test(v.displayName)
      })
    }

    if (keyword && sortedList.length === 0) {
      return this.renderEmpty()
    }

    const imTokenKey = '14j5qnVtr1aa11RtWD6ACYemcb2wcBrno7y2zCheq5M9kBu2'
    const iosgKey = '14zybcYPYQEEmmZUnvCpTnAE6Tm2uRKWG4xPmDfHZn9Yjvrq'
    const hashquarkKey = '15BQUqtqhmqJPyvvEH5GYyWffXWKuAgoSUHuG1UeNdb8oDNT'
    let elected = sortedList.filter(v => v.isElected)
    let notElected = sortedList.filter(v => !v.isElected)
    let imTokenV = null
    let iosgV = null
    let hashquarkV = null
    if (isPolkadot()) {
      imTokenV = sortedList.find((t) => t.key === imTokenKey)
      iosgV = sortedList.find((t) => t.key === iosgKey)
      hashquarkV = sortedList.find((t) => t.key === hashquarkKey)

      if (imTokenV) {
        elected = elected.filter(t => t.key !== imTokenKey)
        notElected = notElected.filter(t => t.key !== imTokenKey)
        elected.splice(0, 0, imTokenV)
      }
      if (iosgV) {
        elected = elected.filter(t => t.key !== iosgKey)
        notElected = notElected.filter(t => t.key !== iosgKey)
        elected.splice(1, 0, iosgV)
      }
      if (hashquarkV) {
        elected = elected.filter(t => t.key !== hashquarkKey)
        notElected = notElected.filter(t => t.key !== hashquarkKey)
        elected.splice(2, 0, hashquarkV)
      }
    }

    return (
      <div className="validator-list">
        {elected.map((v) => {
          return (
            <ValidatorCard
              validator={v}
              key={v.key}
              pool={null}
              isSelected={(selectedValidators || []).includes(v.key)}
              onSelect={isSelectable ? onCheckValidator : null}
              isSelectable={isSelectable === undefined ? false : isSelectable}
            />
          )
        })}
        {!!notElected.length && (
          <div className="not-elected">
            <p>{t('nominator_not_elected')}</p>
          </div>
        )}
        {notElected.map((v) => {
          return (
            <ValidatorCard
              validator={v}
              key={v.key}
              pool={null}
              isSelected={(selectedValidators || []).includes(v.key)}
              onSelect={isSelectable ? onCheckValidator : null}
              isSelectable={isSelectable === undefined ? false : isSelectable}
            />
          )
        })}
      </div>
    )
  }

  renderEmpty() {
    const height = window.innerHeight - 66 - 46 - (isiPhoneX() ? 20 : 0)
    return (
      <div className="empty" style={{ height }}>
        <img src={icons.NO_DATA} alt="no data" />
        <span>{t('search_for_nothing')}</span>
      </div>
    )
  }

  onChange = (event) => {
    this.setState({ keyword: event.target.value })
  }
}

const mapStateToProps = state => {
  return {
    sortBy: selectSortby(state),
  }
}

const mapDispatchToProps = {
  updateSortby,
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Page))
