import React, { useState, useEffect } from 'react'
import { FlashMessage, FlashMessageContainer } from '../components/FlashMessage/FlashMessage'

export const FlashMessageContext = React.createContext({})

export const FlashMessageProvider = ({ children }) => {
    const [queue, setQueue] = useState([])

    const addFlashMessage = newMessage => {
        let newQueue = queue
            .concat(newMessage)
        setQueue(newQueue)
    }

    return (
        <FlashMessageContext.Provider value={ addFlashMessage }>
            { children }
            <FlashMessageContainer>
                { queue.map((message, i) => <FlashMessage key={ i } messageType={ message.type } messageText={ message.text } />) }
            </FlashMessageContainer>
        </FlashMessageContext.Provider>
    )
}

