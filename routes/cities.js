const express = require("express");
const axios = require("axios");
const router = express.Router();

// Données en mémoire pour les recettes
const cityRecipes = {};

// Route GET infos
router.get("/:cityId/infos", async (req, res) => {
  const { cityId } = req.params;
  const API_KEY = process.env.API_KEY;

  try {
    // Appel à City API pour récupérer les infos sur la ville
    const cityResponse = await axios.get(
      `https://api-ugi2pflmha-ew.a.run.app/cities/${cityId}?apiKey=${API_KEY}`
    );

    const cityData = cityResponse.data;

    // Appel à Weather API pour récupérer la météo
    const weatherResponse = await axios.get(
      `https://api-ugi2pflmha-ew.a.run.app/weather/${cityId}?apiKey=${API_KEY}`
    );

    const weatherData = weatherResponse.data;

    // Réponse formatée selon le format attendu
    res.json({
      coordinates: [cityData.lat, cityData.lon],
      population: cityData.population,
      knownFor: cityData.knownFor,
      weatherPredictions: [
        { when: "today", min: weatherData.today.min, max: weatherData.today.max },
        { when: "tomorrow", min: weatherData.tomorrow.min, max: weatherData.tomorrow.max },
      ],
      recipes: cityRecipes[cityId] || [],
    });
  } catch (error) {
    res.status(404).json({ error: "Ville non trouvée" });
  }
});


let recipeIdCounter = 1; // Compteur d'ID unique pour les recettes

router.post("/:cityId/recipes", (req, res) => {
  const { cityId } = req.params;
  const { content } = req.body;

  // Validation
  if (!content) return res.status(400).json({ error: "Le contenu est requis" });
  if (content.length < 10) return res.status(400).json({ error: "Contenu trop court" });
  if (content.length > 2000) return res.status(400).json({ error: "Contenu trop long" });

  // Stocker la recette
  const newRecipe = { id: recipeIdCounter++, content };
  if (!cityRecipes[cityId]) cityRecipes[cityId] = [];
  cityRecipes[cityId].push(newRecipe);

  res.status(201).json(newRecipe);
});


router.delete("/:cityId/recipes/:recipeId", (req, res) => {
    const { cityId, recipeId } = req.params;
  
    if (!cityRecipes[cityId]) return res.status(404).json({ error: "Ville non trouvée ou sans recette" });
  
    const recipeIndex = cityRecipes[cityId].findIndex((r) => r.id === parseInt(recipeId));
  
    if (recipeIndex === -1) return res.status(404).json({ error: "Recette non trouvée" });
  
    cityRecipes[cityId].splice(recipeIndex, 1);
    res.status(204).send();
  });
  

  console.log("API Key:", process.env.API_KEY);
