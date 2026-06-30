import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"VT323"', 'monospace', ...defaultTheme.fontFamily.sans],
                pixel: ['"Press Start 2P"', 'monospace'],
                terminal: ['"VT323"', 'monospace'],
            },
        },
    },

    plugins: [forms],
};
