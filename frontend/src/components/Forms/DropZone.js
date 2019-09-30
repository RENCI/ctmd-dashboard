import React, { useContext, useRef, useState } from 'react'
import axios from 'axios'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { CloudUpload as UploadIcon } from '@material-ui/icons'
import { FlashMessageContext } from '../../contexts/FlashMessageContext'

const useStyles = makeStyles(theme => ({
    dropzone: {
        display: 'flex',
        alignItems: 'center',
    },
    fileInput: {
        flex: 1,
        backgroundColor: theme.palette.grey[200],
    },
    uploadButton: {
        margin: theme.spacing(2),
    },
    buttonIcon: {
        marginLeft: theme.spacing(1),
    }
}))

export const DropZone = ({ endpoint, headers }) => {
    const classes = useStyles()
    const fileInputRef = useRef()
    const [file, setFile] = useState([])
    const addFlashMessage = useContext(FlashMessageContext)

    const onFilesAdded = event => {
        try {
            setFile(event.target.files[0])
            addFlashMessage({ type: 'success', text: 'File selected!'})
            console.log('file selected')
        } catch (error) {
            console.error(error)
        }
    }

    const handleClickUpload = event => {
        if (file) {
            console.log('uploading', file.name)
            const formdata = new FormData()
            formdata.append('data', file)
            formdata.append('content-type', 'application/json')
            formdata.append('json', '{}')
            headers = { 'Access-Control-Allow-Origin': '*' }
            axios({
                url: endpoint,
                method: 'POST',
                headers: headers,
                data: formdata
            })
            addFlashMessage({ type: 'success', text: 'File uploaded!'})
            window.location.reload(false)
        } else {
            console.log('No file selected')
            addFlashMessage({ type: 'error', text: 'Error uploading file!'})
        }
    }

    return (
        <div className={ classes.dropzone }>
            <input type="file" accept="application/json"
                ref={ fileInputRef }
                className={ classes.fileInput }
                onChange={ onFilesAdded }
            />
            <Button color="secondary" variant="contained" className={ classes.uploadButton } onClick={ handleClickUpload }>
                Upload <UploadIcon className={ classes.buttonIcon }/>
            </Button>
        </div>
    )
}
