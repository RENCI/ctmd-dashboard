import { createMuiTheme } from '@material-ui/core/styles';
import * as d3 from 'd3-scale-chromatic'

d3.interpolateBrBG(0.5)

let theme = createMuiTheme({
    palette: {
        primary: { main: '#324f69' },
        secondary: { main: '#339898' },
        error: { main: '#cc3300' },
        extended: {
            copper: '#C84E00',
            persimmon: '#E89923',
            dandelion: '#FFD960',
            piedmont: '#A1B70D',
            eno: '#339898',
            magnolia: '#1D6363',
            prussianBlue: '#005587',
            shaleBlue: '#0577B1',
            ironweed: '#993399',
            hatteras: '#E2E6ED',
            whisperGray: '#F3F2F1',
            gingerBeer: '#FCF7E5',
            dogwood: '#988675',
            shackleford: '#DAD0C6',
            castIron: '#262626',
            graphite: '#666666',
            granite: '#B5B5B5',
            limestone: '#E5E5E5',
        },
        chartColors: d3.schemeSet2,
    },
    typography: {
        useNextVariants: true,
        htmlFontSize: 20,
        h1: { fontFamily: 'EB Garamond', },
        h2: { fontFamily: 'EB Garamond', },
        h3: { fontFamily: 'EB Garamond', },
        h4: { fontFamily: 'EB Garamond', },
        h5: { fontFamily: 'Roboto', },
        headline: { fontFamily: 'EB Garamond', },
        body1: { fontFamily: 'Roboto', lineHeight: '1.75rem', },
        body2: { fontFamily: 'Roboto', lineHeight: '1.5rem', }, // paragraph gets this by default
    },
    shape: { borderRadius: 8 },
    spacing: { unit: 8 },
    mixins: {
        container: {
            width: '100%',
            maxWidth: '900px',
            margin: '0 auto',
        },
        debug: {
            border: '1px solid #fcc',
            '& *': {
                border: '1px solid #fcc',
            }
        }
    },
})

theme = {
    ...theme,
    overrides: {
        MuiGrid: {
            item: {
                marginBottom: 2 * theme.spacing.unit,
            }
        },
        MuiCard:{
            root: {
                padding: 2 * theme.spacing.unit,
                backgroundColor: theme.palette.common.white,
                borderRadius: theme.shape.borderRadius,
            }
        },
        MuiCardHeader: {
            title: {
                color: theme.palette.primary.light,
                fontSize: '150%',
                fontWeight: 'bold',
            },
            subheader: {
                color: theme.palette.secondary.light,
                fontSize: '110%',
                fontWeight: 'bold',
            },
        },
        MuiDrawer: {
            paper: {
                backgroundColor: theme.palette.common.white,
            },
        },
        MuiFormHelperText: {
            root: {
                marginLeft: 0,
            }
        },
        MuiOutlinedInput: {
            root: {
                // marginTop: `${ theme.spacing.unit }px`,
            }
        },
    }
}

export default theme