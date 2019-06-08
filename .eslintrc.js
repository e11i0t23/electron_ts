module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "parser":  '@typescript-eslint/parser',
    "extends": ['google', 'plugin:@typescript-eslint/recommended'],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "require-jsdoc":0,
        "no-unused-vars": 0,
        "code":120,
        "comments": 0,
        "smart-tabs":true,
        "no-tabs":0,
        "no-mixed-spaces-and-tabs": 0,
        "@typescript-eslint/no-var-requires": 0,
        "max-len":1
    }
};