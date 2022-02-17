import React from 'react'

import useForm, { hasLengthyError, hasEmailError } from '@colorfy-software/use-form'

const FORM_SCHEMA = {
  email: '',
  password: '',
}

const FORM_VALIDATION = {
  email: {
    validatorFn: (value) => hasLengthyError(value) || hasEmailError(value),
  },
  password: {
    validatorFn: (value) => hasLengthyError(value),
  },
}

const App = () => {
  const onSubmitForm = async ({ email, password }) => {
    console.log('onSubmitForm', { email, password })
  }

  const { state, onHandleChange, onHandleSubmit, errors } = useForm(FORM_SCHEMA, FORM_VALIDATION, onSubmitForm)

  return (
    <div>
      <h1>useForm</h1>
      {errors.email && <p>{errors.email}</p>}
      <input
        type="email"
        name="email"
        placeholder="email"
        value={state.email}
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
      <button onClick={onHandleSubmit}>Submit</button>
    </div>
  )
}
export default App
