import React, { Fragment, useState } from 'react'
import { Menu, MenuItem, IconButton } from '@material-ui/core'
import { MoreVert as MoreIcon } from '@material-ui/icons'

const ChartTypeMenu = (props) => {
    const { selectHandler, currentType } = props
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [chartType, setChartType] = useState('pie')
    
    function makeSelection(event, value) {
        selectHandler(event, value)
        handleMenuClose()
    }

    const handleMenuClick = event => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    return (
        <Fragment>
            <IconButton onClick={ handleMenuClick } aria-owns={ anchorEl ? 'chart-type-menu' : undefined } aria-haspopup="true"><MoreIcon/></IconButton>
            <Menu id="chart-type-menu" anchorEl={ anchorEl } open={ Boolean(anchorEl) } onClose={ handleMenuClose }>
                <MenuItem selected={ chartType === 'pie'} onClick={ event => makeSelection(event, 'pie') }>Pie</MenuItem>
                <MenuItem selected={ chartType === 'bar'} onClick={ event => makeSelection(event, 'bar') }>Bar</MenuItem>
            </Menu>
        </Fragment>
    )
}

export default ChartTypeMenu