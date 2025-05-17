import 'dotenv/config'
import Fastify from 'fastify'
import { submitForReview } from './submission.js'
import { getCityInfos, addCityRecipe, deleteCityRecipe } from './cities.js'

const fastify = Fastify({
  logger: true,
})

// Enregistrement des routes
fastify.get('/cities/:cityId/infos', getCityInfos)
fastify.post('/cities/:cityId/recipes', addCityRecipe)
fastify.delete('/cities/:cityId/recipes/:recipeId', deleteCityRecipe)

fastify.listen(
  {
    port: parseInt(process.env.PORT, 10) || 3000, // Utilisez le port fourni par Render
    host: '0.0.0.0', // Assurez-vous que l'application écoute sur toutes les interfaces réseau
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
