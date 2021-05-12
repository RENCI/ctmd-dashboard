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
  },
  fileInput: {
    flex: 1,
    backgroundColor: theme.palette.grey[300],
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px',
  },
  uploadButton: {
    margin: theme.spacing(2),
  },
  buttonIcon: {
    marginLeft: theme.spacing(1),
  },
}))

export const DropZone = ({ endpoint, method = 'POST', headers = {} }) => {
  const { isPLAdmin } = useContext(AuthContext)
  const classes = useStyles()
  const fileInputRef = useRef()
  const [file, setFile] = useState([])
  const addFlashMessage = useContext(FlashMessageContext)

  const onFilesAdded = (event) => {
    try {
      setFile(event.target.files[0])
      addFlashMessage({ type: 'success', text: 'File selected!' })
      console.log('file selected')
    } catch (error) {
      console.error(error)
    }
  }

  const handleClickUpload = (event) => {
    if (file) {
      console.log('uploading', file.name)
      const formdata = new FormData()
      formdata.append('data', file)
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
        console.log(response)
        if (response.status === 200) {
          addFlashMessage({ type: 'success', text: 'File uploaded!' })
        } else {
          addFlashMessage({ type: 'error', text: 'Error uploading file!' })
        }
      })
    } else {
      console.log('No file selected')
      addFlashMessage({ type: 'error', text: 'Error uploading file!' })
    }
  }

  return (
    <>
      {isPLAdmin && (
        <div className={classes.dropzone}>
          <input type="file" accept="text/csv" ref={fileInputRef} className={classes.fileInput} onChange={onFilesAdded} />
          <Button color="secondary" variant="contained" className={classes.uploadButton} onClick={handleClickUpload}>
            Upload <UploadIcon className={classes.buttonIcon} />
          </Button>
        </div>
      )}
    </>
  )
}
