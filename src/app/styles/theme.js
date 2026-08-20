import { createTheme } from '@mui/material/styles';

const FONT_WEIGHT = {
    light: 300,
    normal: 400,
    medium: 500,
    bold: 700,
};

const theme = createTheme({
    typography: {
        fontWeightLight: FONT_WEIGHT.light,
        fontWeightNormal: FONT_WEIGHT.normal,
        fontWeightMedium: FONT_WEIGHT.medium,
        fontWeightBold: FONT_WEIGHT.bold,
        fontFamily: 'Roboto',
        // 1 rem = 16px
        header1: {
            fontSize: '1.125rem',
            fontWeight: FONT_WEIGHT.bold,
            display: 'block',
        },
        header2: {
            fontSize: '0.875rem',
            fontWeight: FONT_WEIGHT.medium,
            display: 'block',
        },
        content1: {
            fontSize: '1rem',
            fontWeight: FONT_WEIGHT.normal,
            display: 'block',
        },
        content2: {
            fontSize: '0.875rem',
            fontWeight: FONT_WEIGHT.light,
            display: 'block',
        },
        content3: {
            fontSize: '0.75rem',
            fontWeight: FONT_WEIGHT.bold,
            display: 'block',
        },
        content4: {
            fontSize: '0.75rem',
            fontWeight: FONT_WEIGHT.normal,
            display: 'block',
        },
    },
    color: {
        white: '#FFFFFF',
        black: '#333333',
        lightGrey: '#828282',
        grey: '#F2F2F2',
        darkGrey: '#EAEBF2',
    },
    components: {
        MuiButton: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {
                root: {
                    padding: 0,
                    backgroundColor: 'transparent',
                    textTransform: 'none',
                    '&:hover': {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        MuiIconButton: {
            defaultProps: {
                disableRipple: true,
            },
            styleOverrides: {
                root: {
                    padding: 0,
                    textTransform: 'none',
                    '&:hover': {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
    },
});

export default theme;
