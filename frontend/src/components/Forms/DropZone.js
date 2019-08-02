import React, { useRef, useState } from 'react'
import { Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { CloudUpload as UploadIcon } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    dropzone: {
        // backgroundColor: theme.palette.grey[200],
        // borderRadius: theme.shape.borderRadius,
        // padding: theme.spacing(2),
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

export const DropZone = props => {
    const classes = useStyles()
    const fileInputRef = useRef()
    const [files, setFiles] = useState([])

    const onFilesAdded = event => {
        try {
            const files = Array.from(event.target.files)
            console.log('Files Selected!')
            setFiles(files)
        } catch (error) {
            console.error(error)
        }
    }

    const handleClickUpload = event => {
        if (files.length > 0) {
            console.log(`Uploading ${ files.length } files:`)
            files.forEach(file => console.log(`- ${ file.name }`))
        } else {
            console.log('No files selected')
        }
    }

    return (
        <div className={ classes.dropzone }>
            <input type="file" multiple
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
