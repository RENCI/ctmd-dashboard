import React from 'react'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { FormControlLabel, Switch, Tooltip } from '@material-ui/core'
import {
    Sort as ValueSortIcon, SortByAlpha as AlphaSortIcon,
    PieChart as PieChartIcon, BarChart as BarChartIcon
} from '@material-ui/icons'

export const ChartOptions = (props) => {
    const {
        typeSelectionHandler, currentType,
        sortingSelectionHandler, currentSorting,
        toggleHideEmptyGroupsHandler, hideEmptyGroups,
    } = props

    return (
        <div style={{ textAlign: 'center', }}>
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
            <FormControlLabel
                control={ <Switch checked={ hideEmptyGroups } onChange={ toggleHideEmptyGroupsHandler } /> }
                label="Hide Empty Groups"
                labelPlacement="start"
            />
       </div>
    )
}
