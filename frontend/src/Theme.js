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
            main: '#1c253b',
        },
        secondary: {
            main: '#324f69',
        },
        error: {
            main: '#cc3300',
        },
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
    },
})

export default theme