import React, { Fragment, useState } from 'react'
import { IconButton, Dialog, DialogTitle, DialogContent } from '@material-ui/core'
import { Info as InfoIcon } from '@material-ui/icons'
import { Subheading } from '../Typography'
import { Helper } from './Helper'
import { Subsubheading, Paragraph } from '../../components/Typography'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { SaveAlt as ExportIcon, CloudUpload as UploadIcon } from '@material-ui/icons'
import { CSVIcon } from '../../components/Icons/Csv'

export const DataUploadHelper = () => {
  return (
    <Helper>
        <Subsubheading>Uploading Data</Subsubheading>
        <List dense>
          <ListItem>
            <ListItemText primary={ <Fragment>1. Download the template by clicking the <CSVIcon /> button</Fragment> } />
          </ListItem>
          <ListItem>
            <ListItemText primary={ <Fragment>2. Enter and save your data into the template CSV you obtained in step 1.</Fragment> } />
          </ListItem>
          <ListItem>
            <ListItemText primary={ <Fragment>3. Choose the file with new data from your computer and upload <UploadIcon /> it *.</Fragment> } />
          </ListItem>
          <ListItem>
            <ListItemText primary={ <Fragment>4. You may need to refresh your browser window to see the changes reflected in the table.</Fragment>} />
          </ListItem>
        </List>

        <Subsubheading>* Important Note</Subsubheading>
        <Paragraph>
          Uploading data will overwrite existing data.
          If you need to preserve previously uploaded data in the CTMD, you must export it first using the <ExportIcon /> button.
        </Paragraph>
    </Helper>
  )
}
