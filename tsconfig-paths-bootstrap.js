import tsConfig from './tsconfig.json'
import tsConfigPaths from 'tsconfig-paths'

const baseUrl = './dist'
tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
})
