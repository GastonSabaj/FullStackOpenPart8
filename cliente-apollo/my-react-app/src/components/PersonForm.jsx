import React, { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { CREATE_PERSON } from '../queries'

const PersonForm = ({ setError }) => {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    
  
    const [ createPerson ] = useMutation(CREATE_PERSON, {
        onError: (error) => {
            //const errors = error.graphQLErrors[0].extensions.error.errors // errors.errors NO EXISTE
            const name_error = error.graphQLErrors[0].extensions.stacktrace[0]  //El array de stacktrace tiene en el 1er elemento el titulo del error
            setError(name_error)
            //const messages = Object.values(errors).map(e => e.message).join('\n')
            //setError(messages)
        }
    })
  
    const submit = (event) => {
      event.preventDefault()
        
      createPerson({  variables: { name, phone, street, city } })
  
      setName('')
      setPhone('')
      setStreet('')
      setCity('')
    }
  
    return (
      <div>
        <h2>create new</h2>
        <form onSubmit={submit}>
          <div>
            name <input value={name}
              onChange={({ target }) => setName(target.value)}
            />
          </div>
          <div>
            phone <input value={phone}
              onChange={({ target }) => setPhone(target.value)}
            />
          </div>
          <div>
            street <input value={street}
              onChange={({ target }) => setStreet(target.value)}
            />
          </div>
          <div>
            city <input value={city}
              onChange={({ target }) => setCity(target.value)}
            />
          </div>
          <button type='submit'>add!</button>
        </form>
      </div>
    )
  }
  
  export default PersonForm