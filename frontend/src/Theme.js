import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    // mixins
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
    // colors
    palette: {
        primary: {
            main: '#003366',
        },
        secondary: {
            main: '#F09905',
        },
        error: {
            main: '#cc3300',
        },
        tertiary: {
            black: '#262626',
            slate:'#666666',
            silver: '#b5b5b5',
            rhino: '#b5b5b5',
            sand: '#ebf0cc',
        }
    },
    // text
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
    shape: {
        borderRadius: 0,
    },
    spacing: {
        unit: 8,
    }
})

export default theme