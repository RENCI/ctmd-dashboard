# Trial Innovation Center Dashboard
## Frontend

### UI Design

See [https://material-ui.com/](https://material-ui.com/) for information on components.

### Accessing the API

The ApiContext `frontend/src/contexts/ApiContext.js` holds all the knowledge about available API endpoints, and this context provider can be pulled in to make use of those endpoints.

```javascript
export const endpoints = {
    proposals: apiRoot + 'proposals',
    proposalsByTic: apiRoot + 'proposals/by-tic',
    ...
}
```

Import the context at the top of your component file as usual, and define a variable inside your component by making use of React's new [useContext hook](https://reactjs.org/docs/hooks-reference.html#usecontext). Then the endpoint can be referenced in your component as a property of the `api` object. The following example uses the `/proposals` endpoint to grab the proposals and print them to the screen.


```jsx
import React, { useState, useContext } from 'react'
import { ApiContext } from '../relative/path/to/contexts/ApiContext'
import axios from 'axios'

export default props => {
    const api = useContext(ApiContext)
    const [proposals, setProposals] = useState()
        
    useEffect(() => {
        const fetchProposals = () => {
            axios.get(api.proposals)
                .then(response => setProposals(response.data))
                .catch(error => console.log('Error', error))
        }
        fetchProposals()
    }, [])

    return (
        <pre>
            {
                proposals
                    ? JSON.stringify(proposals, null, 2)
                    : 'Loading proposals...'
            }
        </pre>
    )
}

```

### Global Store

The above example would never actually have to be done because the proposals all live in a global store. However, the above method works great for items or information that don't live in the global store.

The global store sits at the top node of the application tree, and any descendant can access the global store, which contains all the often used primitive elements of this application---proposals, institutions, TICs, therapeutic areas, etc.

The example below illustrates how to grab the proposals from the global store, exactly as the previous example does.

```jsx
import React, { useContext } from 'react'
import StoreContext from '../relative/path/to/contexts/StoreContext'

export default props => {
    const [store, setStore] = useContext(StoreContext)

    return (
        <pre>
            {
                store.proposals
                    ? JSON.stringify(store.proposals, null, 2)
                    : 'Loading proposals...'
            }
        </pre>
    )
}

```

You'll notice how streamlined this approach is. More than that, though, this reduces the need to make excessive API calls and thus database queries.
