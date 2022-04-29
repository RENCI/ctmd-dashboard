import React, { useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import Analytics from 'react-ga4'

const USE_ANALYTICS = true // process.env.NODE_ENV !== 'production'

export const RouteChangeTracker = () => {
  const history = useHistory()
  const { pathname } = useLocation()

  useEffect(() => {
    if (USE_ANALYTICS) {
      history.listen((location, action) => {
        Analytics.send({
          hitType: 'pageview',
          page: window.location.pathname,
        })
      });
    }
  }, [history.location])

  return <span />
};
