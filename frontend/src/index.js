import ReactDOM from 'react-dom'
import './index.css'
import * as serviceWorker from './serviceWorker'
import { makeMainRoutes } from './Routes'
import WebFont from 'webfontloader'

WebFont.load({
    google: {
        families: ['EB+Garamond:400,700', 'Roboto:300,400,700', 'Roboto+Slab:300,400,700', 'sans-serif']
    }
})

const routes = makeMainRoutes()

ReactDOM.render(
    routes, document.getElementById('root')
)

// If you want your App to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
