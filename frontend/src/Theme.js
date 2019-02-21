import { createMuiTheme } from '@material-ui/core/styles';

let theme = createMuiTheme({
    palette: {
        primary: { main: '#1c253b' },
        secondary: { main: '#324f69' },
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
    },
    typography: {
        useNextVariants: true,
        htmlFontSize: 18,
        h1: { fontFamily: 'EB Garamond', },
        h2: { fontFamily: 'EB Garamond', },
        h3: { fontFamily: 'EB Garamond', },
        h4: { fontFamily: 'EB Garamond', },
        h5: { fontFamily: 'EB Garamond', },
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
        MuiToolbar: {
            // root: {
            //     backgroundColor: theme.palette.common.white,
            //     borderBottomLeftRadius: theme.shape.borderRadius,
            //     borderBottomRightRadius: theme.shape.borderRadius,
            //     boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 2px 1px -1px rgba(0,0,0,0.12)',
            // }
        },
        MuiPaper: {
        },
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
        MuiDrawer: {
            paper: {
                backgroundColor: theme.palette.common.white,
                // backgroundImage: `linear-gradient(
                //     135deg,
                //     ${theme.palette.secondary.light} 25%,
                //     ${theme.palette.extended.shaleBlue} 25%,
                //     ${theme.palette.extended.shaleBlue} 50%,
                //     ${theme.palette.secondary.light} 50%,
                //     ${theme.palette.secondary.light} 75%,
                //     ${theme.palette.extended.shaleBlue} 75%,
                //     ${theme.palette.extended.shaleBlue} 100%
                // )`,
                // backgroundSize: `5.66px 5.66px`,
            },
        },
    }
}

export default theme