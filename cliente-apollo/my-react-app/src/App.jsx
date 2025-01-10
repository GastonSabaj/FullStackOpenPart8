import React from 'react'
import { gql, useQuery } from '@apollo/client';
import Person from './components/Person'
import PersonForm from './components/PersonForm';
import PhoneForm from './components/PhoneForm';
import { ALL_PERSONS } from './queries'
import { useState } from 'react';

const App = () => {

  const [errorMessage, setErrorMessage] = useState(null)


  //  El uso de useQuery es adecuado para situaciones en las que la consulta se realiza cuando se procesa el componente
  const result = useQuery(ALL_PERSONS, {
    pollInterval: 2000 //Cada 2 segundos se ejecuta la consulta, para poder tener los datos actualizados
  })

  if (result.loading)  {
    return <div>loading...</div>
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const Notify = ({errorMessage}) => {
    if ( !errorMessage ) {
      return null
    }
    return (
      <div style={{color: 'red'}}>
      {errorMessage}
      </div>
    )
  }

  return (
    <div>
      <Notify errorMessage={errorMessage} />

      <Person persons={result.data.allPersons} />
      <PersonForm setError={notify} />
      <PhoneForm />
    </div>
  )
}

export default App