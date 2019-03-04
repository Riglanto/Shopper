import * as React from 'react'
import * as ReactDOM from 'react-dom'
import registerServiceWorker from './registerServiceWorker'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import { Router, Route, Switch } from 'react-router'
import { Provider } from 'react-redux'
import { configureStore } from './store'
import './index.css'
import { LoginComponent } from './components/Login'
import { MainContainer } from './containers/MainContainer'
import history from './History'
import * as ReactGA from 'react-ga'

const store = configureStore()

const muiTheme = getMuiTheme({
  appBar: {
    height: 40,
  },
})

ReactGA.initialize('UA-115478349-1')

ReactDOM.render(
  <MuiThemeProvider muiTheme={muiTheme}>
    <Provider store={store}>
      <Router history={history}>
        <Switch>
          <Route exact path='/' component={MainContainer} />
          <Route path='/login' component={LoginComponent} />
        </Switch>
      </Router>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('root') as HTMLElement
)
registerServiceWorker()
