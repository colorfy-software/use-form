# @colorfy-software/use-form

>

[![NPM](https://img.shields.io/npm/v/@colorfy-software/use-form.svg)](https://www.npmjs.com/package/@colorfy-software/use-form) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
yarn add @colorfy-software/use-form
```

## Usage

```tsx
import * as React from 'react'
import useForm, { hasLengthyError, hasEmailError, FormValidatorType } from '@colorfy-software/use-form'

// Define the form fields
const FORM_SCHEMA = {
  email: '',
  password: '',
}

// Define the form validators
// Validators should return either false or the error
// this allows for error chaining
const FORM_VALIDATION: FormValidatorType<typeof FORM_SCHEMA> = {
  email: {
    validatorFn: (value) => hasLengthyError(value) || hasEmailError(value),
  },
  password: {
    validatorFn: (value) => hasLengthyError(value),
  },
}

const Example = () => {
  // Submit function that will be called when the form is submitted
  const onSubmitForm = async (form: typeof FORM_SCHEMA) => {
    console.log('onSubmitForm', {
      email: form.email,
      password: form.password,
    })
  }

  const { state, onHandleChange, onHandleSubmit, errors } = useForm(FORM_SCHEMA, FORM_VALIDATION, onSubmitForm)

  return (
    <div>
      <h1>useForm</h1>
      {/*  Show errors if error exists */}
      {errors.email && <p>{errors.email}</p>}
      <input
        type="email"
        name="email"
        placeholder="email"
        {/* Pass the value from the hook to the input */}
        value={state.email}
        {/* Update hook state when input changes */}
        onChange={(e) => onHandleChange('email', e.target.value)}
      />

      {errors.password && <p>{errors.password}</p>}
      <input
        type="password"
        name="password"
        placeholder="password"
        value={state.password}
        onChange={(e) => onHandleChange('password', e.target.value)}
      />

      {/* Call the submit function when the form is submitted. This handles validation and error chaining */}
      <button onClick={onHandleSubmit}>Submit</button>
    </div>
  )
}
```

## License

MIT © [colorfy-software](https://github.com/colorfy-software)
