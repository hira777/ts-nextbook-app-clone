import { theme } from 'themes'
import { ResponsiveProp, Responsive } from 'types'

// Themeの型
export type AppTheme = typeof theme

// SpaceThemeKeys の場合、'small' | 'medium' | 'large'
type SpaceThemeKeys = keyof typeof theme.space
type ColorThemeKeys = keyof typeof theme.colors
type FontSizeThemeKeys = keyof typeof theme.fontSizes
type LetterSpacingThemeKeys = keyof typeof theme.letterSpacings
type LineHeightThemeKeys = keyof typeof theme.lineHeights

// 各Themeのキーの型
// (string & Record<never, never>)を指定しているのは以下に基づく。
// stackoverflow.com/questions/61047551/typescript-union-of-string-and-string-literals
// （string & {}だとESLintのエラーが発生するので、Record<never, never>で「任意の非ヌル値」を表現している）
// 以下は「デフォルトで{}のエラー出すのやめるべきでは？」という議論。エラーは出し続けるという考えは変わってない。
// https://github.com/typescript-eslint/typescript-eslint/issues/2063
export type Space = SpaceThemeKeys | (string & Record<never, never>)
export type Color = ColorThemeKeys | (string & Record<never, never>)
export type FontSize = FontSizeThemeKeys | (string & Record<never, never>)
export type LetterSpacing =
  | LetterSpacingThemeKeys
  | (string & Record<never, never>)
export type LineHeight = LineHeightThemeKeys | (string & Record<never, never>)

// ブレークポイント
const BREAKPOINTS: { [key: string]: string } = {
  sm: '640px', // 640px以上
  md: '768px', // 768px以上
  lg: '1024px', // 1024px以上
  xl: '1280px', // 1280px以上
}

// これを実現するために、ブレークポイントごとに CSS プロパティの値を設定できる
// Responsive 型、Responsive型から値を取り出す toPropValue関数を実装します。
// Responsive型は通常の CSS の値、もしくはそれぞれのブレークポイントに対応した
//  CSS の値 のオブジェクトを指定できます。これにより
//  propsを通じて自由にレスポンシブに対応した CSS を指定できます。
// toPropValueは Responsive型をメディアクエリ付きの CSS プロパティとその値に変換する 関数です*9 。
// この関数を通すことで任意の要素へ CSS プロパティの値をブレークポイントごと に設定できます。
// たとえば
// <Container flexDirection={{ base: 'column', sm: 'row'}}>
// のように書くと、640px 以上だと横並び(row)、それ以外だと縦並び(colum)になります。
// toPropValueの具体的な実装に関して本章にて後述します。

/**
 * Responsive型をCSSプロパティとその値に変換
 * @param propKey CSSプロパティ
 * @param prop Responsive型
 * @param theme AppTheme
 * @returns CSSプロパティとその値 (ex. background-color: white;)
 * @example
 * // returns 'margin-bottom: 8px;'
 * toPropValue('margin-bottom', '8px', theme)
 *
 * // returns 'margin-bottom: 16px;'
 * toPropValue('margin-bottom', 2, theme)
 * const space: string[] = ['0px', '8px', '16px', '32px', '64px'] の2番目の要素が使われています。
 *
 * // returns margin-bottom: 8px;
 *            @media screen and (min-width: 640px) {
 *              margin-bottom: 16px;
 *            }
 * toPropValue('margin-bottom', { base: 1, sm: 2}, theme)
 */
export function toPropValue<T>(
  propKey: string,
  prop?: Responsive<T>,
  theme?: AppTheme,
) {
  if (prop === undefined) return undefined

  if (isResponsivePropType(prop)) {
    const result = []
    for (const responsiveKey in prop) {
      if (responsiveKey === 'base') {
        // デフォルトのスタイル
        result.push(
          `${propKey}: ${toThemeValueIfNeeded(
            propKey,
            prop[responsiveKey],
            theme,
          )};`,
        )
      } else if (
        responsiveKey === 'sm' ||
        responsiveKey === 'md' ||
        responsiveKey === 'lg' ||
        responsiveKey === 'xl'
      ) {
        // メディアクエリでのスタイル
        const breakpoint = BREAKPOINTS[responsiveKey]
        const style = `${propKey}: ${toThemeValueIfNeeded(
          propKey,
          prop[responsiveKey],
          theme,
        )};`
        result.push(`@media screen and (min-width: ${breakpoint}) {${style}}`)
      }
    }
    return result.join('\n')
  }

  return `${propKey}: ${toThemeValueIfNeeded(propKey, prop, theme)};`
}

const SPACE_KEYS = new Set([
  'margin',
  'margin-top',
  'margin-left',
  'margin-bottom',
  'margin-right',
  'padding',
  'padding-top',
  'padding-left',
  'padding-bottom',
  'padding-right',
])
const COLOR_KEYS = new Set(['color', 'background-color'])
const FONT_SIZE_KEYS = new Set(['font-size'])
const LINE_SPACING_KEYS = new Set(['letter-spacing'])
const LINE_HEIGHT_KEYS = new Set(['line-height'])

/**
 * Themeに指定されたCSSプロパティの値に変換
 * @param propKey CSSプロパティ
 * @param value CSSプロパティの値
 * @param theme AppTheme
 * @returns CSSプロパティの値
 * @example
 * // returns '10px;'
 * toThemeValueIfNeeded('margin-bottom', '10px', theme)
 *
 * // returns '16px;'
 * toThemeValueIfNeeded('margin-bottom', 2, theme)
 *
 * // returns '32px;'
 * toThemeValueIfNeeded('margin-bottom', 'large', theme)
 */
function toThemeValueIfNeeded<T>(propKey: string, value: T, theme?: AppTheme) {
  if (
    theme &&
    theme.space &&
    SPACE_KEYS.has(propKey) &&
    isSpaceThemeKeys(value, theme)
  ) {
    return theme.space[value]
  } else if (
    theme &&
    theme.colors &&
    COLOR_KEYS.has(propKey) &&
    isColorThemeKeys(value, theme)
  ) {
    return theme.colors[value]
  } else if (
    theme &&
    theme.fontSizes &&
    FONT_SIZE_KEYS.has(propKey) &&
    isFontSizeThemeKeys(value, theme)
  ) {
    return theme.fontSizes[value]
  } else if (
    theme &&
    theme.letterSpacings &&
    LINE_SPACING_KEYS.has(propKey) &&
    isLetterSpacingThemeKeys(value, theme)
  ) {
    return theme.letterSpacings[value]
  } else if (
    theme &&
    theme.lineHeights &&
    LINE_HEIGHT_KEYS.has(propKey) &&
    isLineHeightThemeKeys(value, theme)
  ) {
    return theme.lineHeights[value]
  }

  return value
}

/**
 * propがResponsiveProp型かどうか
 * 戻り値の型アノテーションはprop is ResponsiveProp<T>のため
 * if (isResponsivePropType(prop)) {}を追加したブロックでは、
 * propがResponsiveProp<T>型という推論が適用される。
 * @param prop
 * @returns propがResponsiveProp型かどうか
 */
function isResponsivePropType<T>(prop: any): prop is ResponsiveProp<T> {
  return (
    prop &&
    (prop.base !== undefined ||
      prop.sm !== undefined ||
      prop.md !== undefined ||
      prop.lg !== undefined ||
      prop.xl !== undefined)
  )
}

function isSpaceThemeKeys(prop: any, theme: AppTheme): prop is SpaceThemeKeys {
  return Object.keys(theme.space).filter((key) => key == prop).length > 0
}

function isColorThemeKeys(prop: any, theme: AppTheme): prop is ColorThemeKeys {
  return Object.keys(theme.colors).filter((key) => key == prop).length > 0
}

function isFontSizeThemeKeys(
  prop: any,
  theme: AppTheme,
): prop is FontSizeThemeKeys {
  return Object.keys(theme.fontSizes).filter((key) => key == prop).length > 0
}

function isLetterSpacingThemeKeys(
  prop: any,
  theme: AppTheme,
): prop is LetterSpacingThemeKeys {
  return (
    Object.keys(theme.letterSpacings).filter((key) => key == prop).length > 0
  )
}

function isLineHeightThemeKeys(
  prop: any,
  theme: AppTheme,
): prop is LineHeightThemeKeys {
  return Object.keys(theme.lineHeights).filter((key) => key == prop).length > 0
}
