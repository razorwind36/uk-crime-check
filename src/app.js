import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import './style/main.scss'
import 'bulma'

import CrimeMap from './components/CrimeMap'


const App = () => (
  <BrowserRouter>
    <main>
      <div>
        <div>
          <CrimeMap />
        </div>
      </div>
    </main>
  </BrowserRouter>
)


ReactDOM.render(
  <App />,
  document.getElementById('root')
)