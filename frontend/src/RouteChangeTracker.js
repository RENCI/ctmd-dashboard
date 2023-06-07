import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import Analytics from 'react-ga4'

const USE_ANALYTICS = true

export const RouteChangeTracker = () => {
  const history = useHistory()

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
