const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-postcss',
  ],
  framework: '@storybook/react',
  // Storybook 用の静的ファイルを設置するディレクトリ
  staticDirs: ['public'],
  babel: async (options) => ({
    ...options,
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-private-methods',
      '@babel/plugin-proposal-private-property-in-object',
    ],
  }),
  // Storybook のデフォルトの webpack の設定を上書きする。
  // config にはデフォルトの設定が渡される。
  webpackFinal: async (config) => {
    // tsconfig.json に指定してあるエイリアスを webpack.config.js の alias プロパティに追加する。
    config.resolve.plugins = [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, '../tsconfig.json'),
      }),
    ]

    return config
  },
}
