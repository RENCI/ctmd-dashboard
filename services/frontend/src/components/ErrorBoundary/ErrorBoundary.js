import React from 'react'
import { Paper, Typography, Button } from '@material-ui/core'

/**
 * Catches render/lifecycle errors in its subtree and shows a recoverable
 * message instead of letting the error propagate to the root — which, under
 * React 18's createRoot, unmounts the entire app and produces a blank white
 * page. Several tables use material-table v1 (unsupported on React 18) and can
 * throw during re-render; this keeps one table's crash from taking down the
 * whole dashboard.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Surface details for debugging; the UI stays usable.
    console.error('ErrorBoundary caught an error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <Paper style={{ padding: '1.5rem', margin: '1rem 0' }}>
        <Typography variant="h6" gutterBottom>
          Something went wrong displaying this section.
        </Typography>
        <Typography variant="body2" color="textSecondary" style={{ marginBottom: '1rem' }}>
          The rest of the dashboard is still available. Try again, or navigate to another page.
        </Typography>
        <Button variant="outlined" onClick={this.handleReset}>
          Try again
        </Button>
      </Paper>
    )
  }
}
