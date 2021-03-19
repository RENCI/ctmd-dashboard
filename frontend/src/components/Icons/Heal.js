import React, { Fragment } from 'react'
import createSvgIcon from '@material-ui/icons/utils/createSvgIcon'

export const HEALIcon = createSvgIcon(
    <Fragment>
        <text fontSize="14" fontWeight="bold" x="2" y="11">H</text>
        <text fontSize="14" fontWeight="bold" x="13" y="11">E</text>
        <text fontSize="14" fontWeight="bold" x="2" y="24">A</text>
        <text fontSize="14" fontWeight="bold" x="13" y="24">L</text>
    </Fragment>
    , 'HEALIcon'
)
