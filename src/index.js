import 'dotenv/config'
import Fastify from 'fastify'
import { submitForReview } from './submission.js'
import { getCityInfos, addCityRecipe, deleteCityRecipe } from './cities.js'

const app = Fastify({
  logger: true,
})

// Register routes
app.get('/cities/:cityId/infos', getCityInfos)
app.post('/cities/:cityId/recipes', addCityRecipe)
app.delete('/cities/:cityId/recipes/:recipeId', deleteCityRecipe)

// Start the server
app.listen(
  {
    port: parseInt(process.env.PORT, 10) || 3000, // Use the port provided by Render
    host: '0.0.0.0', // Ensure the application listens on all network interfaces
  },
  function (err, address) {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }

    app.log.info(`Server is running at ${address}`)

    //////////////////////////////////////////////////////////////////////
    // Don't delete this line, it is used to submit your API for review //
    // everytime your start your server.                                //
    //////////////////////////////////////////////////////////////////////
    submitForReview(app)
  }
)
