import React, { Fragment, useState } from 'react'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { Menu, MenuItem, IconButton, Tooltip } from '@material-ui/core'
import { 
    Sort as ValueSortIcon, SortByAlpha as AlphaSortIcon,
    PieChart as PieChartIcon, BarChart as BarChartIcon
} from '@material-ui/icons'

const ChartOptions = (props) => {
    const { typeSelectionHandler, currentType, sortingSelectionHandler, currentSorting } = props

    return (
        <div style={{ display: 'flex' }}>
            <ToggleButtonGroup value={ currentSorting } exclusive onChange={ sortingSelectionHandler } style={{ marginRight: '1rem' }}>
                <ToggleButton value="alpha">
                    <Tooltip title="Sort Alphabetically">
                        <AlphaSortIcon />
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value="value">
                    <Tooltip title="Sort by Value">
                        <ValueSortIcon />
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup value={ currentType } exclusive onChange={ typeSelectionHandler }>
                <ToggleButton value="pie">
                    <Tooltip title="View as Pie Chart">
                        <PieChartIcon />
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value="bar">
                    <Tooltip title="View as Bar Chart">
                        <BarChartIcon />
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
        </div>
    )
}

export default ChartOptions

