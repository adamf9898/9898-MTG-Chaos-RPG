import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                alert: 'readonly',
                confirm: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                Map: 'readonly',
                Set: 'readonly',
                Promise: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                AbortSignal: 'readonly',
                AbortController: 'readonly',
                FormData: 'readonly',
                Headers: 'readonly',
                Request: 'readonly',
                Response: 'readonly',
                // Node globals (for test files / scripts)
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
        },
        rules: {
            // Possible errors
            'no-console': 'off',
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

            // Best practices
            eqeqeq: ['error', 'always'],
            'no-var': 'error',
            'prefer-const': 'warn',
            curly: ['error', 'all'],

            // ES6+
            'prefer-template': 'warn',
            'prefer-arrow-callback': 'warn',
            'arrow-body-style': ['warn', 'as-needed'],

            // Code style (handled by Prettier, disable conflicting rules)
            semi: 'off',
            quotes: 'off',
            indent: 'off',
        },
    },
    {
        // Test files can use node:test globals
        files: ['tests/**/*.js', 'tools/**/*.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                test: 'readonly',
                it: 'readonly',
                before: 'readonly',
                after: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
            },
        },
    },
    {
        ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**'],
    },
];
