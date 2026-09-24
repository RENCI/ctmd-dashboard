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
  // queue model: all active messages are rendered together in the
  // FlashMessageContainer. success/info auto-dismiss; warning/error
  // persist until the user closes them. messages are removed by id.
  const [messages, setMessages] = React.useState([])

  const addFlashMessage = React.useCallback((msg) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        messageType: msg.type || 'info',
        messageText: msg.text || '',
      },
    ])
  }, [])

  const removeFlashMessage = React.useCallback((id) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [])

  return (
    <FlashMessageContext.Provider value={addFlashMessage}>
      {children}
      <FlashMessageContainer
        messages={messages}
        onClose={removeFlashMessage}
      />
    </FlashMessageContext.Provider>
  )
}
