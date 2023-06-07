import React, { useContext, useRef, useState } from 'react'
import axios from 'axios'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { CloudUpload as UploadIcon } from '@material-ui/icons'
import { FlashMessageContext } from '../../contexts/FlashMessageContext'
import { AuthContext } from '../../contexts'

const useStyles = makeStyles((theme) => ({
  dropzone: {
    display: 'flex',
    alignItems: 'center',
    mxWidth: '400px',
  },
  fileInput: {
    flex: 1,
    backgroundColor: theme.palette.grey[300],
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px',
    padding: '6px',
  },
  uploadButton: {
    margin: theme.spacing(2),
  },
  buttonIcon: {
    marginLeft: theme.spacing(1),
  },
}))

export const DropZone = ({ endpoint, method = 'POST', headers = {} }) => {
  const { isPLAdmin, user } = useContext(AuthContext)
  const classes = useStyles()
  const fileInputRef = useRef()
  const [file, setFile] = useState(null)
  const addFlashMessage = useContext(FlashMessageContext)

  // bail out here (don't render this component) if
  // we're a non-pladmin user on the heal server
  const shouldRender = process.env.NODE_ENV === 'development' || (process.env.REACT_APP_IS_HEAL_SERVER !== 'true' || isPLAdmin)
  if (!shouldRender) {
    return null
  }

  const onFilesAdded = (event) => {
    try {
      if(event.target.files[0] && (!event.target.files[0].type.includes('csv') && !event.target.files[0].type.includes('excel'))){
        addFlashMessage({ type: 'error', text: 'File must be a CSV' })
      }
      else {
        setFile(event.target.files[0])
        addFlashMessage({ type: 'success', text: 'File selected!' })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleClickUpload = (event) => {
    if (file && file !== undefined) {
      console.log('uploading', file.name)
      const formdata = new FormData()
      formdata.append('data', file)
      formdata.append('user', user['email'])
      formdata.append('content-type', 'text/csv')
      formdata.append('json', '{}')
      formdata.append('has_comments', 'true')
      headers = {
        ...headers,
        // TODO: Figure out if this is needed
        // 'Access-Control-Allow-Origin': '*',
        // 'content-type': 'multipart/form-data'
      }
      axios({
        url: endpoint,
        method: method,
        headers: headers,
        data: formdata,
      }).then((response) => {
        if (response.status === 200) {
          addFlashMessage({ type: 'success', text: 'File uploaded!' })
        } else {
          addFlashMessage({ type: 'error', text: 'Error uploading file.' })
        }
      }).catch((error) => {
        if(error.response && error.response.data) {
          let errorMsg = "Error uploading file:"
          let index = 1
          error.response.data.forEach((elm) => {
            errorMsg += `\n${index}. ${elm}`
            index++
          })
          addFlashMessage({ type: 'error', text: errorMsg })
        } else {
          addFlashMessage({ type: 'error', text: 'Error uploading file.' })
        }
      })
    } else {
      addFlashMessage({ type: 'error', text: 'No file selected!' })
    }
  }

  return (
    <div className={classes.dropzone}>
      <input type="file" accept="text/csv" ref={fileInputRef} className={classes.fileInput} onChange={onFilesAdded} />
      <Button
        color="secondary"
        variant="contained"
        className={classes.uploadButton}
        onClick={handleClickUpload}
        startIcon={<UploadIcon className={classes.buttonIcon} />}
      >Upload</Button>
    </div>
  )
}
