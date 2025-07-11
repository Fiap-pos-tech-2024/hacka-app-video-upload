/* eslint-disable @typescript-eslint/no-require-imports */
const tsConfig = require('./tsconfig.json')
const tsConfigPaths = require('tsconfig-paths')

const baseUrl = './dist'
tsConfigPaths.register({
    baseUrl,
    paths: tsConfig.compilerOptions.paths,
})