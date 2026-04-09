import React from 'react'
import { FlashMessageContainer } from '../components/FlashMessage/FlashMessage'

export const FlashMessageContext = React.createContext(null)

export const useFlashMessaging = () => {
  const ctx = React.useContext(FlashMessageContext)
  if (!ctx) {
    throw new Error('useFlashMessaging must be used within FlashMessageProvider')
  }
  return ctx
}

export const FlashMessageProvider = ({ children }) => {
  const [messages, setMessages] = React.useState([])

  // add message
  const addFlashMessage = React.useCallback((msg) => {
    const id = Date.now() + Math.random()

    setMessages(prev => [
      ...prev,
      {
        id,
        messageType: msg.type || 'info',
        messageText: msg.text || '',
      },
    ])
  }, [])

  // remove message
  const removeFlashMessage = React.useCallback((id) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [])

  return (
    <FlashMessageContext.Provider value={addFlashMessage}>
      {children}

      <FlashMessageContainer
        messages={messages}
        onClose={removeFlashMessage}
        disableAutoHide={false} // set to `true` while developing/debugging
      />
    </FlashMessageContext.Provider>
  )
}