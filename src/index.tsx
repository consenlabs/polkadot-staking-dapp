import React from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import '@common/lib/sdk'
import App from './App'
import * as serviceWorker from './serviceWorker'

if (process.env.NODE_ENV !== 'development') {
  console.log = console.warn = console.error = console.dir = console.group = console.info = () => { }
}



ReactDOM.render(
  <App />,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
