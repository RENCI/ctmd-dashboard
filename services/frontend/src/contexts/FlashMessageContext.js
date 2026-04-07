import React from 'react'
import { FlashMessage, FlashMessageContainer } from '../components/FlashMessage/FlashMessage'

export const FlashMessageContext = React.createContext({})
export const useFlashMessaging = () => React.useContext(FlashMessageContext)

export const FlashMessageProvider = ({ children }) => {
    const [queue, setQueue] = React.useState([
        { type: 'success', text: 'Test' },
    ]);

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

