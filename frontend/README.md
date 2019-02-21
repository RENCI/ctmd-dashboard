## Dashboard UI

### UI Design

See [https://material-ui.com/](https://material-ui.com/) for information on components.

## API Context

The ApiContext `frontend/src/contexts/ApiContext.js` holds all the knowledge about available endpoints, and it can be pulled in to make use of those endpoints.

```
export const endpoints = {
    proposals: apiRoot + 'proposals',
    proposalsByTic: apiRoot + 'proposals/by-tic',
    ...
}
```

Import the context at the top of your component file as usual, and define a variable inside your component by making use of React's new useContext hook. Then the endpoint can be referenced in your component as a property of the `api` object. The following example uses the `/proposals` endpoint.


```JSX
        import React, { useState, useContext } from 'react'
        import { ApiContext } from '../relative/path/to/contexts/ApiContext'
        import axios from 'axios'

        const MyComponent = props => {
            const api = useContext(ApiContext)
            const [proposals, setProposals] = useState()

            useEffect(() => {
                axios.get(api.proposals)
                    .then(response => setProposals(response.data))
                    .catch(error => console.log('Error', error))
            }, [])

            return proposals ? (
                    <div>{ JSON.stringify(proposals, null, 2) }</div>
                ) : (
                    <div>Loading proposals...</div>
                )
            )
        }

```