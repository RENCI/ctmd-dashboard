import React, { Fragment } from 'react'
import createSvgIcon from '@material-ui/icons/utils/createSvgIcon'

export const CTMDIcon = createSvgIcon(
    <Fragment>
        <text fontSize="14" fontWeight="bold" x="2" y="11">C</text>
        <text fontSize="14" fontWeight="bold" x="13" y="11">T</text>
        <text fontSize="14" fontWeight="bold" x="2" y="24">M</text>
        <text fontSize="14" fontWeight="bold" x="13" y="24">D</text>
    </Fragment>
    , 'CTMDIcon'
)
