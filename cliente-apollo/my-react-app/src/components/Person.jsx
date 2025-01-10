
import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { useState, useEffect } from 'react'
import { FIND_PERSON } from '../queries'

const Persons = ({ persons }) => {

  const [getPerson, result] = useLazyQuery(FIND_PERSON) 
  //Cuando un usuario quiere volver a la lista de personas, el estado person se establece en null.
  const [person, setPerson] = useState(null)

    /* 
La variable nameToSearch de la consulta recibe un valor cuando se ejecuta la consulta.
La respuesta de la consulta se guarda en la variable result, y su valor se guarda en el estado del componente person en el hook useEffect.
    */
  const showPerson = (name) => {
    getPerson({ variables: { nameToSearch: name } })
  }


  useEffect(() => {
    if (result.data) { //Cuando se ejecutó la consulta getPerson, result.data va a ser no nulo y se va a setear en el estado person
      setPerson(result.data.findPerson)
    }
  }, [result]) //  se ejecuta cada vez que la consulta obtiene los detalles de una persona diferente.


  if (person) {
    return(
      <div>
        <h2>{person.name}</h2>
        <div>{person.address.street} {person.address.city}</div>
        <div>{person.phone}</div>
        <button onClick={() => setPerson(null)}>close</button>
      </div>
    )
  }
  
  return (
    <div>
      <h2>Persons</h2>
      {persons.map(p =>
        <div key={p.name}>
          {p.name} {p.phone}

          <button onClick={() => showPerson(p.name)} >
            show address
          </button> 
        </div>  
      )}
    </div>
  )
}

export default Persons