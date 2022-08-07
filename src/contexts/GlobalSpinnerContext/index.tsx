import React from 'react'

type GlobalSpinnerActions = React.SetStateAction<boolean>

const GlobalSpinnerContext = React.createContext<boolean>(false)
const GlobalSpinnerActionsContext = React.createContext<
  React.Dispatch<GlobalSpinnerActions>
  // eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {})

// グローバルスピナーの表示・非表示
export const useGlobalSpinnerContext = (): boolean =>
  React.useContext<boolean>(GlobalSpinnerContext)

// グローバルスピナーの表示・非表示のアクション
export const useGlobalSpinnerActionsContext =
  (): React.Dispatch<GlobalSpinnerActions> =>
    React.useContext<React.Dispatch<GlobalSpinnerActions>>(
      GlobalSpinnerActionsContext,
    )

interface GlobalSpinnerContextProviderProps {
  children?: React.ReactNode
}

const GlobalSpinnerContextProvider = ({
  children,
}: GlobalSpinnerContextProviderProps) => {
  const [isGlobalSpinnerOn, setGlobalSpinner] = React.useState(false)

  return (
    <GlobalSpinnerContext.Provider value={isGlobalSpinnerOn}>
      <GlobalSpinnerActionsContext.Provider value={setGlobalSpinner}>
        {children}
      </GlobalSpinnerActionsContext.Provider>
    </GlobalSpinnerContext.Provider>
  )
}

export default GlobalSpinnerContextProvider
