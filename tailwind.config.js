import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
        './resources/**/*.tsx',
        './resources/**/*.vue',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                oswald: ['Oswald', ...defaultTheme.fontFamily.sans],
                jost: ['Jost', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'dash-bg': 'rgb(var(--color-dash-bg) / <alpha-value>)',
                'dashcomponent-bg': 'rgb(var(--color-dashcomponent-bg) / <alpha-value>)',
                'dashcomponent-border': 'rgb(var(--color-dashcomponent-border) / <alpha-value>)',
                'activemenuitem-bg' : 'rgb(var(--color-activemenuitem-bg) / <alpha-value>)',
                'offwhite' : 'rgb(var(--color-offwhite-font) / <alpha-value>)',
                'offblack' : 'rgb(var(--color-offblack-font) / <alpha-value>)',
                'tablebutton-bg' : 'rgb(var(--color-tablebutton-bg) / <alpha-value>)',
                'redtablebutton-color' : 'rgb(var(--color-redtablebutton) / <alpha-value>)',
            },
        },
    },
    plugins: [],
};
