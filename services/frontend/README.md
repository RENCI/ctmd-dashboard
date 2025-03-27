# Trial Innovation Center Dashboard
## Frontend

### UI Design

To ensure a clean and familiar interface, this application adheres to Google's Material Design standards by implementing their Material UI React component library. See [https://material-ui.com/](https://material-ui.com/) for information on the componentsand their usage.

### Accessing the API

The ApiContext `frontend/src/contexts/ApiContext.js` holds all the knowledge about endpoints accessible in the API layer of the application.

```javascript
export const endpoints = {
    proposals: apiRoot + 'proposals',
    proposalsByTic: apiRoot + 'proposals/by-tic',
    ...
}
```

This context provider can be pulled in to make use of those endpoints. Import the context at the top of your component file as usual, and define a variable, say `const api = useContext(ApiContext)`, inside your component by making use of React's new [useContext hook](https://reactjs.org/docs/hooks-reference.html#usecontext) so that the endpoint can be referenced within the component as a property of the `api` object. The following example uses the `/proposals` endpoint to grab the proposals and print them to the screen.


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
            { proposals ? JSON.stringify(proposals, null, 2) : 'Loading proposals...' }
        </pre>
    )
}

```

### Global Store

The above example illustrates something that would never actually have to be done because the proposals all live in a global store, which sits at the top node of the application tree, and any descendant has access to it. The global store contains all the often-used primitive elements of this application---proposals, institutions, TICs and RICs, therapeutic areas, etc.

Having this global store eliminates the need to ever have to do something like the above example to grab proposals, but it does work great for items or information that has no business living in the global store.

The example below illustrates how, by having the global store, we can grab the proposals exactly as in the previous example.

```jsx
import React, { useContext } from 'react'
import StoreContext from '../relative/path/to/contexts/StoreContext'

export default props => {
    const [store, setStore] = useContext(StoreContext)

    return (
        <pre>
            { store.proposals ? JSON.stringify(store.proposals, null, 2) : 'Loading proposals...' }
        </pre>
    )
}

```

You'll notice how streamlined this approach is. Moreover, this reduces the need to make excessive API calls and thus database queries. The StoreContext Provider returns a two-element array, the two same two items one expects from the [`useState` hook](https://reactjs.org/docs/hooks-reference.html#usestate), although the `setStore` function can safely be omitted if it is not required, like so `const [store, ] = useContext(StoreContext)`.

