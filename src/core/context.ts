import React from 'react'
import { CheckMode, FieldValue, FormValues, Rules } from './types'

interface ContextType {
  formValues: FormValues
  handleInput: (value: FieldValue) => void
  handleBlur: (value: FieldValue) => void
  collectFieldItem: (
    rule: Rules,
    name: string,
    checkMode?: CheckMode
  ) => void
  deleteFieldItem: (name: string) => void
  onSubmit: (values: FormValues) => void
}

export const FormContext = React.createContext<ContextType>({} as ContextType)
