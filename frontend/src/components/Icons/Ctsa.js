import React, { Fragment } from 'react'
import createSvgIcon from '@material-ui/icons/utils/createSvgIcon'

export const CTSAIcon = createSvgIcon(
    <Fragment>
        <text fontSize="16" fontWeight="bold" x="2" y="12">C</text>
        <text fontSize="16" fontWeight="bold" x="14" y="12">T</text>
        <text fontSize="16" fontWeight="bold" x="2" y="24">S</text>
        <text fontSize="16" fontWeight="bold" x="14" y="24">A</text>
    </Fragment>
    , 'CTSAIcon'
)
