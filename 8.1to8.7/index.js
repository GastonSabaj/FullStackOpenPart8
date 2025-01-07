import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { v4 as uuidv4 } from 'uuid';
import { GraphQLError } from 'graphql';

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

//Definiciones de esquemas
const typeDefs = `
  type Book {
    title: String!
    author: String!
    published: Int!
    genres: [String!]
  }

   type Author {
    name: String!
    born: Int
    bookCount: Int
  }

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book!]
    allAuthors: [Author!]
  }

  type Mutation{
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => {
        //Al estar utilizando Set, estoy eliminando los duplicados
        const uniqueAuthors = [...new Set(books.map(book => book.author))];
        return uniqueAuthors.length; //Devuelvo el numero de autores unicos
    },

    /**
     * Returns a list of books, optionally filtered by the specified author's name.
     *
     * @param {Object} _ - Unused root value.
     * @param {Object} args - Arguments object.
     * @param {string} [args.author] - Optional author's name to filter books by.
     * @returns {Array} List of books, filtered by author if specified.
     */
    allBooks: (_, args) => {
        // Si se especifica un autor, filtrar los libros por ese autor
        if (args.author) {
            return books.filter(book => book.author === args.author);
        }

        if(args.genre){
            return books.filter(book => book.genres.includes(args.genre)); //Uso .includes porque es genres está definido como un array
        }

        if(args.author && args.genre){
            return books.filter(book => book.author === args.author && book.genres.includes(args.genre));
        }
        // Si no se especifica un autor, devolver todos los libros
        return books;
    },
    allAuthors: () => {
        return authors.map(author => ({
            name: author.name,
            born: author.born,
            bookCount: books.filter(book => book.author === author.name).length
          }));
    }
  },
  Mutation:
  {
    addBook: (root, args) => {
        const book = { 
            title: args.title, 
            author: args.author, 
            published: args.published, 
            genres: args.genres, 
            id: uuidv4() 
            };

        if(!authors.find(author => author.name === args.author)){
            authors = [...authors, { name: args.author, id: uuidv4() }]
        }

        books = [...books, book]
        return book
    },
    editAuthor: (root, args) => {
        //Busco el autor a ver si existe
        const author = authors.find(author => author.name === args.name)
        //Si no existe, devuelvo null
        if (!author) {
          return null
        }

        //Solo se edita el año en el que nació.
        const updatedAuthor = { ...author, born: args.setBornTo }

        //Actualizo al author en el listado de autores, donde con .map voy preguntando si el nombre del autor coincide, entonces devuelvo el autor actualizado
        authors = authors.map(author => (author.name === args.name ? updatedAuthor : author))

        //Devuelvo los datos del autor actualizado
        return updatedAuthor
    }
 }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})