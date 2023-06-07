import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { makeStyles } from '@material-ui/styles'
import { Grid } from '@material-ui/core'
import { Subsubheading, Paragraph } from '../Typography'
import api from '../../Api'

const useStyles = makeStyles((theme) => ({
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', { duration: theme.transitions.duration.shortest }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  danger: {
    color: '#f66',
    border: '1px solid #f66',
    '&:hover': {
      backgroundColor: '#fee',
    },
  },
  taskGridRow: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.grey[300],
    marginBottom: theme.spacing(1),
    transition: 'border-color 250ms',
    '&:hover': {
      borderColor: theme.palette.grey[800],
    },
  },
  taskGridCell: {
    border: '1px solid #eee',
    padding: theme.spacing(2),
  },
  taskGridCellDescription: {
    color: '#999',
  },
}))

const Task = ({ id }) => {
  const classes = useStyles()
  const [name, setName] = useState()
  const [dateStarted, setDateStarted] = useState()
  const [dateEnqueued, setDateEnqueued] = useState()
  const [dateEnded, setDateEnded] = useState()
  const [dateCreated, setDateCreated] = useState()

  useEffect(() => {
    const fetchTaskDetails = async () => {
      await axios
        .get(api.dataGetTask(id))
        .then((response) => {
          const { name, started_at, enqueued_at, ended_at, created_at } = response.data
          setName(name)
          setDateStarted(started_at)
          setDateEnqueued(enqueued_at)
          setDateEnded(ended_at)
          setDateCreated(created_at)
        })
        .catch((error) => console.error(error))
    }
    fetchTaskDetails()
  }, [id])

  return (
    <Grid container className={classes.taskGridRow}>
      <Grid item xs={12} className={classes.taskGridCell}>
        <strong>{id}</strong>
      </Grid>
      <Grid item xs={12} md={2} className={classes.taskGridCell}>
        <span className={classes.taskGridCellDescription}>Type</span> <br />
        {name ? name : 'Fetching...'}
      </Grid>
      <Grid item xs={12} md={3} className={classes.taskGridCell}>
        <span className={classes.taskGridCellDescription}>Created at</span> <br />
        {dateCreated ? dateCreated : 'Fetching...'}
      </Grid>
      <Grid item xs={12} md={3} className={classes.taskGridCell}>
        <span className={classes.taskGridCellDescription}>Enqueued at</span> <br />
        {dateEnqueued ? dateEnqueued : 'Fetching...'}
      </Grid>
      <Grid item xs={12} md={3} className={classes.taskGridCell}>
        <span className={classes.taskGridCellDescription}>Started at</span> <br />
        {dateStarted ? dateStarted : 'Fetching...'}
      </Grid>
      <Grid item xs={12} md={1} className={classes.taskGridCell}>
        <span className={classes.taskGridCellDescription}>Ended at</span> <br />
        {dateEnded ? dateEnded : 'Fetching...'} <br />
      </Grid>
    </Grid>
  )
}

const TaskList = ({ tasks }) => {
  return tasks && tasks.job_ids && tasks.job_ids.length > 0 ? tasks.job_ids.map((id) => <Task id={id} />) : <Paragraph>None</Paragraph>
}

export const TaskManager = (props) => {
  const [queuedTasks, setQueuedTasks] = useState([])
  const [startedTasks, setStartedTasks] = useState([])
  const [finishedTasks, setFinishedTasks] = useState([])
  const [failedTasks, setFailedTasks] = useState([])
  const [deferredTasks, setDeferredTasks] = useState([])

  useEffect(() => {
    const fetchTasks = async () => {
      await axios
        .get(api.dataGetTasks)
        .then((response) => {
          setQueuedTasks(response.data.queued)
          setStartedTasks(response.data.started)
          setFinishedTasks(response.data.finished)
          setFailedTasks(response.data.failed)
          setDeferredTasks(response.data.deferred)
        })
        .catch((error) => console.error(error))
    }
    fetchTasks()
  }, [])

  return (
    <Grid container spacing={8} alignItems="center">
      <Grid item xs={12}>
        <Subsubheading>Queued Tasks</Subsubheading>
        <TaskList tasks={queuedTasks} />

        <Subsubheading>Started Tasks</Subsubheading>
        <TaskList tasks={startedTasks} />

        <Subsubheading>Finished Tasks</Subsubheading>
        <TaskList tasks={finishedTasks} />

        <Subsubheading>Failed Tasks</Subsubheading>
        <TaskList tasks={failedTasks} />

        <Subsubheading>Deferred Tasks</Subsubheading>
        <TaskList tasks={deferredTasks} />
      </Grid>
    </Grid>
  )
}
