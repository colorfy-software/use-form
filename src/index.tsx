import { useState } from 'react'

import { isBoolean, isFunction, isObject, isString } from './validation-utils'

// useForm LIBRARY TYPES

type Form = { [key: string]: string }

interface ValidationType<K> {
  validatorFn: ((value: string, values: K) => false | string) | false | string
}

export type FormValidatorType<T> = { [key in keyof T]: ValidationType<T> }

function hasValidParamDataStructure<K>(
  formSchema: K,
  formValidation: { [key: string]: ValidationType<K> },
  onSubmitForm: (values: K) => void | Promise<void>,
): void {
  // TEST formSchema

  if (!formSchema) {
    throw new Error('useForm() expected formSchema to be present')
  }

  if (!isObject(formSchema)) {
    throw new Error(`useForm() expected formSchema to be an object, but received ${typeof formSchema}`)
  }

  if (isObject(formSchema)) {
    const formSchemaValues = Object.values(formSchema)
    const formSchemaKeys = Object.keys(formSchema)

    formSchemaValues.forEach((value, index) => {
      if (!isString(value)) {
        const key = formSchemaKeys[index]

        throw new Error(
          `useForm() expected type string for key: ${key}, but got ${typeof value}. All values need to be of type string`,
        )
      }
    })
  }

  // TEST formValidation

  if (!formValidation) {
    throw new Error('useForm() expected formValidation to be present')
  }

  if (!isObject(formValidation)) {
    throw new Error(`useForm() expected formValidation to be an object, but received ${typeof formValidation}`)
  }

  if (isObject(formValidation)) {
    const formValidationValues = Object.values(formValidation)
    const formValidationKeys = Object.keys(formValidation)

    formValidationValues.forEach((value, index) => {
      // console.log('formValidationValues', value.validatorFn)

      if (typeof value.validatorFn === 'undefined') {
        throw new Error(`useForm() expected validatorFn() to be present in validation schema`)
      }

      if (!isFunction(value.validatorFn) && !isBoolean(value.validatorFn)) {
        const key = formValidationKeys[index]

        throw new Error(
          `useForm() expected validatorFN() of type Function or Boolean for key: ${key}, but got ${typeof value.validatorFn}`,
        )
      }
    })
  }

  // TEST onSubmitForm

  if (!onSubmitForm) {
    throw new Error('useForm() expected onSubmitForm to be present')
  }

  if (!isFunction(onSubmitForm)) {
    throw new Error(`useForm() expected onSubmitForm to be a Function, but received ${typeof onSubmitForm}`)
  }
}

// ACTUAL useForm FUNCTION

/**
 * @param formSchema Data structure of the form
 * @example
 * const LOGIN_FORM = {
 *  email: '',
 *  password: ''
 * }
 *
 * @param formValidation Validation options for each field in the form
 * @example
 * const LOGIN_FORM_VALIDATION: FormValidatorType<typeof LOGIN_FORM> = {
 *  email: {
 *    validationOn: 'submit',
 *    validationFn: (value): false | string => hasLengthyError(value) && hasEmailError(value)
 *  },
 *  password: {
 *    validateOn: 'submit',
 *    validationFn: (value): false | string => hasLengthyError(value) && (value.length >= 6 ? false : 'Password needs to be 6 characters or more')
 *  }
 * }
 *
 * @param onSubmitForm Callback that gets called when form is submitted and no errors have been found
 *
 *
 *
 *
 *
 *
 * @see Bottom of the file for full example
 */
export default function useForm<K extends Form>(
  formSchema: K,
  formValidation: { [key: string]: ValidationType<K> },
  onSubmitForm: (values: K) => void | Promise<void>,
  onErrors?: ((errors: { [key in keyof K]: string | false }) => void) | undefined,
): {
  onHandleChange: (stateKey: keyof K, value: string) => void
  onHandleSubmit: () => void
  clearErrors: () => void
  clearState: () => void
  state: K
  errors: { [key in keyof K]: false | string }
} {
  // Validate incoming data
  hasValidParamDataStructure(formSchema, formValidation, onSubmitForm)

  const [state, setState] = useState<K>(formSchema)
  const [errors, setErrors] = useState<{ [key in keyof K]: false | string }>(
    (function (): { [key in keyof K]: false | string } {
      let errs = formSchema

      for (const [key] of Object.entries(formSchema)) {
        errs = { ...errs, [key]: false }
      }

      return errs
    })(),
  )

  const onHandleChange = (stateKey: keyof K, value: string): void => {
    setState((s) => ({
      ...s,
      [stateKey]: value,
    }))
  }

  const onHandleSubmit = (): void => {
    const valueKeys = Object.keys(state)
    const validator = formValidation

    setErrors(
      (function (): { [key in keyof K]: false | string } {
        let errs = formSchema

        for (const [key] of Object.entries(formSchema)) {
          errs = { ...errs, [key]: false }
        }

        return errs
      })(),
    )

    let currentErrors = errors

    const errorsArray = valueKeys.map((key) => {
      const validationForKey = validator[key]
      const validationFunction = validationForKey.validatorFn
      const value = state[key]

      let errorForKey: boolean | string = false

      if (
        isFunction(validationFunction) &&
        isString(typeof validationFunction === 'function' && validationFunction(value, state))
      ) {
        errorForKey = typeof validationFunction === 'function' ? validationFunction(value, state) : errorForKey
      } else if (!isFunction(validationFunction) && (isBoolean(validationFunction) || isString(validationFunction))) {
        errorForKey = isBoolean(validationFunction)
          ? false
          : typeof validationFunction === 'string'
          ? validationFunction
          : false

        currentErrors = { ...currentErrors, [key]: errorForKey }
      }

      currentErrors = { ...currentErrors, [key]: errorForKey }

      return errorForKey
    })

    const hasErrors = errorsArray.filter((error) => typeof error === 'string' && error.length > 0)

    if (hasErrors && hasErrors.length === 0 && state) {
      // send submit callback
      onSubmitForm(state)
    } else {
      setErrors(currentErrors)

      onErrors?.(currentErrors)
    }
  }

  const clearState = (): void => {
    setState(formSchema)
  }

  const clearErrors = (): void => {
    setErrors(
      (function (): { [key in keyof K]: false | string } {
        let errs = formSchema

        for (const [key] of Object.entries(formSchema)) {
          errs = { ...errs, [key]: false }
        }

        return errs
      })(),
    )
  }

  return {
    onHandleChange,
    onHandleSubmit,
    clearState,
    clearErrors,
    state,
    errors,
  }
}

/**
 * Checks if string has any length. Trims for empty spaces.
 * If hasLengthyError returns false, otherwise returns error message.
 * This is mainly used with useForm hook to provide form validation
 * @param str -`{ string }`— Pass the string you want to test.
 */
export const hasLengthyError = (str: string, errorMessage?: string): false | string => {
  if (str?.trim?.()?.length) return false

  return errorMessage || 'This is a required field'
}

/**
 * Checks if a string is a valid email. Returns false if valid, and error if not.
 * @param email -`{ string }`—  Pass the string you want to test for.
 */
export const hasEmailError = (email: string, errorMessage?: string): false | string => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const isEmail = re.test(email)

  if (isEmail) return false

  return errorMessage || 'This is not a valid email address'
}
