import fetch from 'node-fetch';

const recipesStore = {};
let recipeIdCounter = 1;

// GET /cities/:cityId/infos
export async function getCityInfos(request, reply) {
  const { cityId } = request.params;

  try {
    // Fetch city information
    const cityResponse = await fetch(
      `https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}?apiKey=${process.env.API_KEY}`
    );
    if (!cityResponse.ok) {
      return reply.status(404).send({ error: `City with id "${cityId}" not found` });
    }
    const cityData = await cityResponse.json();

    // Fetch weather data
    const weatherResponse = await fetch(
      `https://api-ugi2pflmha-ew.a.run.app/weather?lat=${cityData.coordinates[0]}&lon=${cityData.coordinates[1]}`
    );
    if (!weatherResponse.ok) {
      return reply.status(500).send({ error: 'Failed to fetch weather data' });
    }
    const weatherData = await weatherResponse.json();

    // Build response payload
    const responsePayload = {
      coordinates: cityData.coordinates,
      population: cityData.population,
      knownFor: cityData.knownFor,
      weatherPredictions: [
        { when: 'today', min: weatherData.today.min, max: weatherData.today.max },
        { when: 'tomorrow', min: weatherData.tomorrow.min, max: weatherData.tomorrow.max },
      ],
      recipes: recipesStore[cityId] || [],
    };

    reply.send(responsePayload);
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

// POST /cities/:cityId/recipes
export async function addCityRecipe(request, reply) {
  const { cityId } = request.params;
  const { content } = request.body;

  try {
    // Validate city existence
    const cityResponse = await fetch(
      `https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}?apiKey=${process.env.API_KEY}`
    );
    if (!cityResponse.ok) {
      return reply.status(404).send({ error: `City with id "${cityId}" not found` });
    }

    // Validate content
    if (!content || content.trim() === '') {
      return reply.status(400).send({ error: 'Content is required' });
    }
    if (content.length < 10) {
      return reply.status(400).send({ error: 'Content is too short' });
    }
    if (content.length > 2000) {
      return reply.status(400).send({ error: 'Content is too long' });
    }

    // Add recipe
    const newRecipe = { id: recipeIdCounter++, content: content.trim() };
    if (!recipesStore[cityId]) {
      recipesStore[cityId] = [];
    }
    recipesStore[cityId].push(newRecipe);

    reply.status(201).send(newRecipe);
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

// DELETE /cities/:cityId/recipes/:recipeId
export async function deleteCityRecipe(request, reply) {
  const { cityId, recipeId } = request.params;

  try {
    // Validate city existence
    const cityResponse = await fetch(
      `https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}?apiKey=${process.env.API_KEY}`
    );
    if (!cityResponse.ok) {
      return reply.status(404).send({ error: `City with id "${cityId}" not found` });
    }

    // Delete recipe
    const recipes = recipesStore[cityId];
    if (!recipes) {
      return reply.status(404).send({ error: `No recipes found for city "${cityId}"` });
    }

    const recipeIndex = recipes.findIndex((recipe) => recipe.id === parseInt(recipeId, 10));
    if (recipeIndex === -1) {
      return reply.status(404).send({ error: `Recipe with id "${recipeId}" not found` });
    }

    recipes.splice(recipeIndex, 1);
    reply.status(204).send();
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}
