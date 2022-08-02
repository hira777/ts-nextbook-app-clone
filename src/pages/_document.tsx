import Document, { DocumentContext, DocumentInitialProps } from 'next/document'
// styled-components を利用した SSR をするためには ServerStyleSheet を利用する
import { ServerStyleSheet } from 'styled-components'

// カスタムドキュメント
export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      // renderPage をカスタマイズする
      ctx.renderPage = () =>
        originalRenderPage({
          // React ツリー全体を何かラップしたい時に利用するオプション
          // 今回の場合、sheet.collectStyles を実行すると以下のように App が StyleSheetManagerにラップされる
          // <StyleSheetManager sheet={sheet.instance}>
          //   <App />
          // </StyleSheetManager>
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)

      return {
        ...initialProps,
        // styles をオーバーライド
        // デフォルトのスタイルと styled-components のスタイルをマージ
        styles: [
          <>
            {initialProps.styles} {sheet.getStyleElement()}
          </>,
        ],
      }
    } finally {
      sheet.seal()
    }
  }
}
