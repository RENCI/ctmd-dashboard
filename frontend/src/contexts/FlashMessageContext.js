import React, { useState, useEffect } from 'react'
import FlashMessage from '../components/FlashMessage/FlashMessage'
import FlashMessageContainer from '../components/FlashMessage/FlashMessageContainer'

export const FlashMessageContext = React.createContext({})

export const FlashMessageProvider = ({ children }) => {
    const [queue, setQueue] = useState([])

    const addFlashMessage = newMessage => {
        let newQueue = queue
            .concat({
                createdAt: Date.now(),
                text: newMessage,
            })
        setQueue(newQueue)
    }

    return (
        <FlashMessageContext.Provider value={ addFlashMessage }>
            { children }
            <FlashMessageContainer>
                { queue.map((message, i) => <FlashMessage key={ i } message={ message.text } />) }
            </FlashMessageContainer>
        </FlashMessageContext.Provider>
    )
}

