import React, { useCallback, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudUpload as FileDropIcon } from '@material-ui/icons'
import { Card } from '@material-ui/core'

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
}

const activeStyle = {
    borderColor: '#2196f3'
}

const acceptStyle = {
    borderColor: '#00e676'
}

const rejectStyle = {
    borderColor: '#ff1744'
}

export const FileDrop = () => {
    const handleOnDrop = useCallback(acceptedFiles => {
        // Do something with the files
        console.log(acceptedFiles)
    }, [])

    const {
        acceptedFiles, rejectedFiles,
        getRootProps, getInputProps,
        isDragActive, isDragAccept, isDragReject,
    } = useDropzone({
        onDrop: handleOnDrop,
        multiple: false,
        accept: 'application/json',
    })

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : { }),
        ...(isDragAccept ? acceptStyle : { }),
        ...(isDragReject ? rejectStyle : { }),
    }), [isDragActive, isDragReject])

    const acceptedFilesDisplay = acceptedFiles.map(file => (
        <div>
            <em>{ file.path } - { file.size } bytes</em>        
        </div>
    ))
    
    return (
        <div {...getRootProps()}>
            <input { ...getInputProps() } />
            {
                isDragActive
                ? <p><FileDropIcon /> Drop File Here</p>
                : <Card>
                    <FileDropIcon />
                    { acceptedFiles.length === 0 ? ' Upload file' : acceptedFilesDisplay }
                </Card>
            }
        </div>
    )

}

