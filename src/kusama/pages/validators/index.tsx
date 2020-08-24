import React from 'react'
import { connect } from "react-redux"

import { selectValidators } from 'kusama/lib/redux/selectors'
import Navbar from 'kusama/components/Navbar';
import './index.scss'
import ValidatorList from 'kusama/components/ValidatorList'
import { updateSortby } from 'kusama/lib/redux/actions'
import { selectSortby } from 'kusama/lib/redux/selectors'
import { getRouteName } from 'kusama/lib/helper'
import icons from 'kusama/lib/icons'

const Validators = ({ validators, sortBy, updateSortby }) => {
  return (
    <div>
      <Navbar index={1} chain={getRouteName()} />
      <ValidatorList
        validators={validators}
        sortBy={sortBy}
        updateSortby={updateSortby}
      />
      <img src={icons.TO_TOP} className="to-top" onClick={() => window.scrollTo(0, 0)} alt="to top" />
    </div>
  )
}

const mapStateToProps = state => {
  return {
    validators: selectValidators(state),
    sortBy: selectSortby(state),
  }
}

const mapDispatchToProps = {
  updateSortby,
}

export default connect(mapStateToProps, mapDispatchToProps)(Validators)
