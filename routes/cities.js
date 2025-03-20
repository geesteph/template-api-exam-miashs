import axios from 'axios'

const cityRecipes = {}
let recipeIdCounter = 1

export default async function cityRoutes(fastify) {
  // Route GET /cities/:cityId/infos
  fastify.get('/cities/:cityId/infos', async (request, reply) => {
    const { cityId } = request.params

    try {
      // Récupérer les informations de la ville
      const cityResponse = await axios.get(`https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}`)
      const cityData = cityResponse.data

      // Vérifiez que les données de la ville sont valides
      if (!cityData.coordinates || !Array.isArray(cityData.coordinates)) {
        throw new Error('Invalid city data')
      }

      // Récupérer les prévisions météorologiques
      const weatherResponse = await axios.get(
        `https://api-ugi2pflmha-ew.a.run.app/weather?lat=${cityData.coordinates[0]}&lon=${cityData.coordinates[1]}`
      )
      const weatherData = weatherResponse.data

      // Récupérer les recettes associées à la ville
      const recipes = cityRecipes[cityId] || []

      reply.send({
        coordinates: cityData.coordinates,
        population: cityData.population,
        knownFor: cityData.knownFor,
        weatherPredictions: [
          { when: 'today', min: weatherData.today.min, max: weatherData.today.max },
          { when: 'tomorrow', min: weatherData.tomorrow.min, max: weatherData.tomorrow.max },
        ],
        recipes,
      })
    } catch (error) {
      reply.status(404).send({ error: 'City not found or invalid data' })
    }
  })

  // Route POST /cities/:cityId/recipes
  fastify.post('/cities/:cityId/recipes', async (request, reply) => {
    const { cityId } = request.params
    const { content } = request.body

    try {
      // Vérifier si la ville existe
      await axios.get(`https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}`)

      // Validation du contenu
      if (!content) {
        return reply.status(400).send({ error: 'Content is required' })
      }
      if (content.length < 10) {
        return reply.status(400).send({ error: 'Content is too short' })
      }
      if (content.length > 2000) {
        return reply.status(400).send({ error: 'Content is too long' })
      }

      // Créer une nouvelle recette
      const newRecipe = { id: recipeIdCounter++, content }
      if (!cityRecipes[cityId]) {
        cityRecipes[cityId] = []
      }
      cityRecipes[cityId].push(newRecipe)

      reply.status(201).send(newRecipe)
    } catch {
      reply.status(404).send({ error: 'City not found' })
    }
  })

  // Route DELETE /cities/:cityId/recipes/:recipeId
  fastify.delete('/cities/:cityId/recipes/:recipeId', async (request, reply) => {
    const { cityId, recipeId } = request.params

    try {
      // Vérifier si la ville existe
      await axios.get(`https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}`)

      // Supprimer la recette
      const recipes = cityRecipes[cityId] || []
      const recipeIndex = recipes.findIndex((r) => r.id === parseInt(recipeId))

      if (recipeIndex === -1) {
        return reply.status(404).send({ error: 'Recipe not found' })
      }

      recipes.splice(recipeIndex, 1)
      reply.status(204).send()
    } catch {
      reply.status(404).send({ error: 'City not found' })
    }
  })
}
