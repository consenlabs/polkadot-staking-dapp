import React, { Component } from 'react'
import './App.scss'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import Kusama from 'kusama/pages/route'
import kusamaConfigureStore from 'kusama/lib/redux/configureStore'

class App extends Component<{}> {
  render() {
    return <Provider store={kusamaConfigureStore(undefined)}>
      <BrowserRouter>
        <Switch>
          <Route path="/kusama">
            <Kusama />
          </Route>
          <Route path="/polkadot">
            <Kusama />
          </Route>
        </Switch>
      </BrowserRouter>
    </Provider>
  }
}

export default App
