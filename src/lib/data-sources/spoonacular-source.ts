import { DataSource, DataSourceConfig, RawRecord, CleanRecord, FetchResult } from './types';

const config: DataSourceConfig = {
  id: 'spoonacular',
  name: 'Spoonacular',
  icon: 'ChefHat',
  description: 'Recipe data with ingredients, instructions, nutritional info, and difficulty ratings for AI training.',
  color: 'hsl(25 95% 53%)',
  freeTierLimit: '150 requests/day',
  fields: [
    {
      key: 'cuisine',
      label: 'Cuisine',
      type: 'select',
      options: [
        { label: 'Italian', value: 'italian' },
        { label: 'Mexican', value: 'mexican' },
        { label: 'Asian', value: 'asian' },
        { label: 'Mediterranean', value: 'mediterranean' },
        { label: 'American', value: 'american' },
        { label: 'Indian', value: 'indian' },
      ],
      default: 'italian',
    },
    {
      key: 'diet',
      label: 'Diet',
      type: 'select',
      options: [
        { label: 'Any', value: 'any' },
        { label: 'Vegetarian', value: 'vegetarian' },
        { label: 'Vegan', value: 'vegan' },
        { label: 'Gluten Free', value: 'gluten-free' },
        { label: 'Keto', value: 'keto' },
      ],
      default: 'any',
    },
    {
      key: 'limit',
      label: 'Number of recipes',
      type: 'number',
      default: 50,
      min: 10,
      max: 500,
    },
  ],
};

const RECIPE_NAMES: Record<string, string[]> = {
  italian: ['Pasta Carbonara', 'Margherita Pizza', 'Risotto ai Funghi', 'Bruschetta al Pomodoro', 'Tiramisu', 'Lasagna Bolognese', 'Gnocchi al Pesto'],
  mexican: ['Tacos al Pastor', 'Guacamole Fresco', 'Enchiladas Suizas', 'Churros con Chocolate', 'Pozole Rojo', 'Tamales de Pollo'],
  asian: ['Pad Thai', 'Sushi Rolls', 'Ramen Tonkotsu', 'Dim Sum Platter', 'Green Curry', 'Bibimbap', 'Pho Bo'],
  mediterranean: ['Falafel Wrap', 'Greek Salad', 'Hummus Classic', 'Shakshuka', 'Moussaka', 'Tabbouleh'],
  american: ['Classic Burger', 'BBQ Ribs', 'Mac and Cheese', 'Pancake Stack', 'Clam Chowder', 'Apple Pie'],
  indian: ['Butter Chicken', 'Palak Paneer', 'Biryani', 'Samosa', 'Naan Bread', 'Dal Makhani', 'Tikka Masala'],
};

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const INGREDIENTS_POOL = ['olive oil', 'garlic', 'onion', 'salt', 'pepper', 'tomatoes', 'basil', 'chicken', 'rice', 'flour', 'eggs', 'butter', 'cream', 'lemon', 'parmesan'];

function generateMockRecipe(index: number, cuisine: string): RawRecord {
  const names = RECIPE_NAMES[cuisine] || RECIPE_NAMES.italian;
  const name = names[index % names.length];
  const suffix = index >= names.length ? ` (Variation ${Math.floor(index / names.length) + 1})` : '';
  const numIngredients = 4 + Math.floor(Math.random() * 8);
  const ingredients = [];
  for (let i = 0; i < numIngredients; i++) {
    ingredients.push({
      name: INGREDIENTS_POOL[(index + i) % INGREDIENTS_POOL.length],
      amount: (1 + Math.random() * 4).toFixed(1),
      unit: ['cups', 'tbsp', 'tsp', 'g', 'oz', 'pieces'][i % 6],
    });
  }

  return {
    title: `${name}${suffix}`,
    cuisine,
    difficulty: DIFFICULTIES[index % 3],
    prepTime: 10 + Math.floor(Math.random() * 30),
    cookTime: 15 + Math.floor(Math.random() * 60),
    servings: 2 + Math.floor(Math.random() * 6),
    ingredients,
    steps: [
      `Prepare all ingredients by washing and chopping as needed.`,
      `Heat olive oil in a large pan over medium heat.`,
      `Add the main ingredients and cook for ${5 + Math.floor(Math.random() * 15)} minutes.`,
      `Season with salt, pepper, and ${cuisine === 'italian' ? 'basil' : cuisine === 'asian' ? 'soy sauce' : 'cumin'}.`,
      `Serve hot and garnish with fresh herbs.`,
    ],
    calories: 200 + Math.floor(Math.random() * 600),
    protein: 10 + Math.floor(Math.random() * 40),
    carbs: 20 + Math.floor(Math.random() * 80),
    fat: 5 + Math.floor(Math.random() * 30),
    rating: (3.5 + Math.random() * 1.5).toFixed(1),
  };
}

export const spoonacularSource: DataSource = {
  config,
  async fetch(params) {
    const limit = params.limit || 50;
    const cuisine = params.cuisine || 'italian';

    await new Promise(r => setTimeout(r, 700 + Math.random() * 900));

    const records: RawRecord[] = [];
    for (let i = 0; i < limit; i++) {
      records.push(generateMockRecipe(i, cuisine));
    }
    return { records, total: limit, source: 'spoonacular' };
  },
  transform(raw) {
    return raw.map((r, i) => ({
      id: `recipe-${i}-${Date.now()}`,
      text: `${r.title}\n\nIngredients: ${r.ingredients.map((ing: any) => `${ing.amount} ${ing.unit} ${ing.name}`).join(', ')}\n\nSteps:\n${r.steps.map((s: string, j: number) => `${j + 1}. ${s}`).join('\n')}`,
      metadata: {
        title: r.title,
        cuisine: r.cuisine,
        difficulty: r.difficulty,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        servings: r.servings,
        ingredients: r.ingredients,
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fat: r.fat,
        rating: parseFloat(r.rating),
      },
      source: 'Spoonacular',
      timestamp: new Date().toISOString(),
    }));
  },
};
