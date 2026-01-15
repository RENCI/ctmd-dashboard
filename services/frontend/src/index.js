import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App';
import * as serviceWorker from './serviceWorker'
import WebFont from 'webfontloader'

WebFont.load({
    google: {
        families: [
            'EB+Garamond:400,700',
            'Roboto:300,400,700',
            'IBM+Plex+Sans:400,700',
            'sans-serif',
        ]
    }
})

// React 18 createRoot API
const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)

// If you want your App to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
