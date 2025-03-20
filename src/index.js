import 'dotenv/config'
import Fastify from 'fastify'
import { submitForReview } from './submission.js'
import cityRoutes from '../routes/cities.js'

const fastify = Fastify({
  logger: true,
})

// Enregistrement des routes
fastify.register(cityRoutes)

// Gestion des erreurs globales
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error)
  reply.status(500).send({ error: 'Internal Server Error' })
})

fastify.listen(
  {
    port: process.env.PORT || 3000,
    host: process.env.RENDER_EXTERNAL_URL ? '0.0.0.0' : process.env.HOST || 'localhost',
  },
  function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }

    fastify.log.info(`Server is running at ${address}`)

    //////////////////////////////////////////////////////////////////////
    // Don't delete this line, it is used to submit your API for review //
    // everytime your start your server.                                //
    //////////////////////////////////////////////////////////////////////
    submitForReview(fastify)
  }
)
