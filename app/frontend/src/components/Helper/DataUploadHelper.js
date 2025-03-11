import React, { Fragment, useState, useContext } from 'react'
import { IconButton, Dialog, DialogTitle, DialogContent } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { Info as InfoIcon } from '@material-ui/icons'
import { Subheading } from '../Typography'
import { Helper } from './Helper'
import { Subsubheading, Paragraph } from '../../components/Typography'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { SaveAlt as ExportIcon, CloudUpload as UploadIcon } from '@material-ui/icons'
import { CSVIcon } from '../../components/Icons/Csv'
import { AuthContext } from '../../contexts'

const useStyle = makeStyles((theme) => ({
  inlineIcon: {
    display: 'inline-flex',
    verticalAlign: 'middle',
  },
}))

export const DataUploadHelper = () => {
  const { isPLAdmin } = useContext(AuthContext)

  const classes = useStyle()
  return (
    <>
      {isPLAdmin && (
        <Helper>
          <Subsubheading>Uploading Data</Subsubheading>
          <List dense>
            <ListItem>
              <ListItemText
                primary={
                  <Fragment>
                    1. Download the template by clicking the <CSVIcon fontSize="small" className={classes.inlineIcon} /> button
                  </Fragment>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText primary={<Fragment>2. Enter and save your data into the template CSV you obtained in step 1.</Fragment>} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={
                  <Fragment>
                    3. Choose the file with new data from your computer and upload{' '}
                    <UploadIcon fontSize="small" className={classes.inlineIcon} /> it *.
                  </Fragment>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={<Fragment>4. You may need to refresh your browser window to see the changes reflected in the table.</Fragment>}
              />
            </ListItem>
          </List>

          <Subsubheading>* Important Note</Subsubheading>
          <Paragraph>
            Uploading data will overwrite existing data. If you need to preserve previously uploaded data in the CTMD, you must export it
            first using the <ExportIcon fontSize="small" className={classes.inlineIcon} /> button.
          </Paragraph>
        </Helper>
      )}
    </>
  )
}
