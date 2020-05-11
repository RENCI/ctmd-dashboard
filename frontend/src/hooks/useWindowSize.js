import { useState, useEffect } from 'react'

export const useWindowSize = () => {
    const [width, setWidth] = useState(window.innerWidth)
    const [height, setHeight] = useState(window.innerheight)
    
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth)
            setHeight(window.innerHeight)
        }
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    })
    
    return { width, height }
}
