import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Analytics from 'react-ga4'

const USE_ANALYTICS = true // process.env.NODE_ENV !== 'production'

export const RouteChangeTracker = () => {
  const location = useLocation()

  useEffect(() => {
    if (USE_ANALYTICS) {
      Analytics.send({
        hitType: 'pageview',
        page: location.pathname,
      })
    }
  }, [location])

  return <span />
};
