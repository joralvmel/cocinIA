export const en = {
  common: {
    appName: "CocinIA",
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    cancel: "Cancel",
    save: "Save",
    add: "Add",
    delete: "Delete",
    edit: "Edit",
    done: "Done",
    next: "Next",
    back: "Back",
    search: "Search",
    searchAll: "Search all...",
    noResults: "No results found",
    or: "or",
    apply: "Apply",
    allow: "Allow",
    ok: "OK",
    selected: "selected",
  },
  tabs: {
    home: "Home",
    recipes: "Recipes",
    plan: "Plan",
    shopping: "Shopping",
    pantry: "Pantry",
  },
  auth: {
    login: "Login",
    register: "Register",
    createAccount: "Create account",
    loginTitle: "CocinIA",
    loginSubtitle: "Your AI cooking assistant",
    registerTitle: "Create account",
    registerSubtitle: "Join CocinIA",
    alreadyHaveAccount: "Already got an account?",
    noAccount: "Don't have an account?",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    continueWithGoogle: "Continue with Google",
    invalidEmail: "Invalid email address",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsDontMatch: "Passwords do not match",
    loginError: "Login failed. Please check your credentials.",
    registerError: "Registration failed. Please try again.",
    signOut: "Sign out",
    signOutConfirm: "Are you sure you want to sign out?",
  },
  profile: {
    title: "Profile",
    guestUser: "Guest User",
    signInToSync: "Sign in to sync your data",
    appearance: "Appearance",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    language: "Language",
    moreSettingsSoon: "More settings coming soon",
    editProfile: "Edit Profile",
    // Sections
    basicInfo: "Basic Info",
    basicInfoDesc: "Name, country and currency",
    personalInfo: "Personal Info",
    personalInfoDesc: "Physical data and activity",
    profileInfo: "Profile Info",
    profileInfoDesc: "Name, location and physical data",
    nutritionGoals: "Nutrition Goals",
    nutritionGoalsDesc: "Calories and macros",
    cookingPreferences: "Cooking Preferences",
    cookingPreferencesDesc: "Restrictions, cuisines & equipment",
    equipment: "Kitchen Equipment",
    equipmentDesc: "Appliances and utensils",
    favoriteIngredients: "Favorite Ingredients",
    favoriteIngredientsDesc: "Ingredients you love to cook with",
    routineMeals: "Routine Meals",
    routineMealsDesc: "Define what you usually eat",
    routineMealsTitle: "What do you usually eat?",
    routineMealsDescription:
      "Define what you usually have for breakfast, lunch, dinner, and snacks. The weekly planner will rotate among these options instead of inventing new ones each day.",
    routineMealType: {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snack",
    },
    routineMealPlaceholder: {
      breakfast: "E.g: scrambled eggs",
      lunch: "E.g: pasta with veggies",
      dinner: "E.g: homemade pita pizza",
      snack: "E.g: yogurt with fruit",
    },
    routineMealHint: "Add meals you usually prepare.",
    saveError: "Error saving changes",
    // Basic info fields
    displayName: "Name",
    displayNamePlaceholder: "Your name",
    country: "Country",
    countryPlaceholder: "Select your country",
    currency: "Currency",
    currencyPlaceholder: "Select your currency",
    searchCountry: "Search country...",
    searchCurrency: "Search currency...",
    // Personal info fields
    height: "Height",
    heightUnit: "cm",
    heightUnitImperial: "ft/in",
    weight: "Weight",
    weightUnit: "kg",
    weightUnitImperial: "lbs",
    measurementSystem: "Measurement System",
    metric: "Metric",
    imperial: "Imperial",
    birthDate: "Birth Date",
    birthDatePlaceholder: "Select date",
    selectDate: "Select Date",
    day: "Day",
    month: "Month",
    year: "Year",
    gender: "Gender",
    genderMale: "Male",
    genderFemale: "Female",
    genderOther: "Other",
    genderPlaceholder: "Select your gender",
    activityLevel: "Activity Level",
    activitySedentary: "Sedentary",
    activitySedentaryDesc: "Little or no exercise",
    activityLight: "Light",
    activityLightDesc: "Exercise 1-3 days/week",
    activityModerate: "Moderate",
    activityModerateDesc: "Exercise 3-5 days/week",
    activityActive: "Active",
    activityActiveDesc: "Exercise 6-7 days/week",
    activityVeryActive: "Very Active",
    activityVeryActiveDesc: "Intense daily exercise",
    activityPlaceholder: "Select your activity level",
    // Nutrition goals
    fitnessGoal: "Goal",
    goalLoseWeight: "Lose Weight",
    goalMaintain: "Maintain Weight",
    goalGainMuscle: "Gain Muscle",
    goalEatHealthy: "Eat Healthy",
    goalPlaceholder: "Select your goal",
    dailyCalorieGoal: "Daily Calories",
    proteinGoal: "Protein",
    carbsGoal: "Carbs",
    fatGoal: "Fat",
    defaultServings: "Default Servings",
    calculateGoals: "Calculate Automatically",
    calculatedGoals: "Goals calculated based on your profile",
    completePersonalInfoToCalculate:
      "Complete your personal info to auto-calculate goals",
    // Restrictions
    dietaryRestrictions: "Dietary Restrictions",
    allergies: "Allergies",
    preferences: "Preferences",
    addCustom: "Add Custom",
    customItems: "Custom Items",
    addAllergy: "Add Allergy",
    addPreference: "Add Preference",
    addCuisine: "Add Cuisine",
    addEquipment: "Add Equipment",
    addAllergyDesc: "Add a custom allergy that's not in the list",
    addPreferenceDesc: "Add a custom dietary preference",
    addCuisineDesc: "Add a custom cuisine type",
    addEquipmentDesc: "Add a custom kitchen equipment",
    customValuePlaceholder: "Enter name...",
    customRestrictionLabel: "Custom restriction",
    isAllergy: "Is it an allergy?",
    // Cuisines
    favoriteCuisines: "Favorite Cuisines",
    // Equipment
    kitchenEquipment: "Equipment",
    addCustomEquipment: "Add Equipment",
    customEquipmentLabel: "Equipment name",
    // Favorite Ingredients
    addIngredient: "Add Ingredient",
    addManual: "Add manually",
    fromRecipes: "From your recipes",
    selectFromRecipes: "Select ingredients from your saved recipes",
    noRecipeIngredients: "No saved recipes yet",
    ingredientName: "Ingredient name",
    ingredientPlaceholder: "e.g., Chicken, Tomatoes, Rice...",
    alwaysAvailable: "Always available",
    alwaysAvailableDesc: "This ingredient is always in my pantry",
    noIngredients: "No favorite ingredients",
    ingredientsHelp:
      'Add ingredients you frequently use. Mark as "always available" if they\'re staples in your kitchen.',
    // Actions
    saveChanges: "Save Changes",
    saving: "Saving...",
    profileUpdated: "Profile updated",
    updateError: "Error updating profile",
    editRestrictions: "Edit Restrictions",
    editCuisines: "Edit Favorite Cuisines",
    selectedCount: "{{count}} selected",
    noRestrictions: "No restrictions",
    noCuisines: "No favorite cuisines",
    noEquipment: "No equipment",
  },
  home: {
    title: "CocinIA",
    subtitle: "Your AI cooking assistant",
    placeholder: "Home Screen Placeholder",
    chatPlaceholder: "Write your message...",
  },
  recipes: {
    title: "Recipes",
    subtitle: "Browse and discover recipes",
    searchPlaceholder: "Search recipes...",
    emptyTitle: "No saved recipes",
    emptyDescription: "Generate your first AI recipe and save it here",
    emptyAction: "Generate recipe",
    noResultsTitle: "No results",
    noResultsDescription: "No recipes found with the selected filters",
    filters: {
      title: "Filters",
      active: "Active filters",
      clear: "Clear",
      difficulty: "Difficulty",
      mealType: "Meal type",
      maxTime: "Max time",
      maxCalories: "Max calories",
      cuisine: "Cuisine type",
      ingredients: "Ingredients",
      selectCuisine: "Select cuisines...",
      selectIngredients: "Select ingredients...",
    },
    detail: {
      headerTitle: "Recipe details",
      loadError: "Error loading recipe",
      notFound: "Recipe not found",
      deleteTitle: "Delete recipe",
      deleteConfirm: "Are you sure you want to delete this recipe?",
      deleteError: "Error deleting recipe",
      saveError: "Error saving changes",
      editTitle: "Edit recipe",
      titleLabel: "Title",
      titlePlaceholder: "Recipe name",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Describe the recipe...",
      servingsLabel: "Servings",
      addPhotoTitle: "Add photo",
      addPhotoMessage: "How do you want to add the photo?",
      fromCamera: "Use camera",
      fromGallery: "Choose from gallery",
      permissionDenied: "Permission to access photos is required",
      cameraPermissionDenied: "Permission to use camera is required",
      cameraPermissionTitle: "Camera access",
      cameraPermissionMessage:
        "CocinIA needs access to your camera to take a photo of your recipe. Would you like to allow it?",
      galleryPermissionTitle: "Gallery access",
      galleryPermissionMessage:
        "CocinIA needs access to your photo gallery to select a recipe photo. Would you like to allow it?",
      uploadError: "Error uploading image",
      uploadingImage: "Uploading image...",
      addPhoto: "Add photo",
      changePhoto: "Change photo",
      photoLabel: "Recipe photo",
      deletePhoto: "Delete photo",
      deletePhotoTitle: "Delete photo",
      deletePhotoConfirm: "Are you sure you want to delete the photo?",
      deletePhotoError: "Error deleting photo",
    },
  },
  weeklyPlan: {
    title: "Weekly Plan",
    subtitle: "Plan your meals for the week",

    // Empty state
    emptyTitle: "No active plan",
    emptyDescription:
      "Create a weekly meal plan tailored to your preferences and nutritional goals",
    createFirst: "Create Your First Plan",
    createNew: "Create New Plan",

    // Days
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    },
    daysShort: {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    },
    daysInitial: {
      monday: "M",
      tuesday: "T",
      wednesday: "W",
      thursday: "T",
      friday: "F",
      saturday: "S",
      sunday: "S",
    },

    // Meal types
    mealTypes: {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snack",
    },

    // Wizard
    wizard: {
      title: "New Weekly Plan",
      step1Title: "Days & Meals",
      step1Subtitle: "Select which days and meals to plan",
      step2Title: "Cooking Style",
      step2Subtitle: "Set your cooking preferences",
      step3Title: "Food Preferences",
      step3Subtitle: "Customize cuisines and ingredients",
      step4Title: "Nutrition & Notes",
      step4Subtitle: "Set calorie goals and special requests",
      step5Title: "Summary",
      step5Subtitle: "Review your plan before generating",

      // Step labels for stepper
      steps: {
        days: "Days",
        cooking: "Cooking",
        food: "Food",
        nutrition: "Nutrition",
        summary: "Summary",
      },

      // Step 1
      selectDays: "Days to cook",
      selectDaysHint: "Tap the days you want to plan meals for",
      mealsForDay: "Meals for {{day}}",
      defaultMeals: "Default meals for all days",
      perDayConfig: "Configure per day",
      switchToDefault: "Default",
      switchToPerDay: "Per day",
      eatingOut: "Eating out",
      eatingOutHint: "Mark meals you'll eat outside",
      cookingTime: "Available cooking time",
      cookingTimeHint: "Minutes per meal",
      noDaysSelected: "Select at least one day",

      // Step 2
      batchCooking: "Batch cooking mode",
      batchCookingDescription:
        "Cook multiple meals in advance on specific prep days",
      batchLunchOnly:
        "Batch cooking applies to lunches. Base preparations will be generated and reused to assemble each day's dishes.",
      batchLunchTimeNote:
        "Lunch cooking time is already included in the batch cooking session.",
      onlyBatchMeals:
        "Only batch meals selected — time was set in the previous step.",
      prepDays: "Prep day(s)",
      prepDaysHint: "Which days will you do batch cooking?",
      maxPrepTime: "Max prep time",
      maxPrepTimeHint: "Total minutes for prep day cooking",
      basePrepsCount: "Number of base preparations",
      basePrepsHint:
        "How many base items to prepare (proteins, grains, sauces)",
      reuseStrategy: "Ingredient reuse",
      reuseMaximize: "Maximum reuse",
      reuseMaximizeDesc: "Fewer ingredients, more repeated items",
      reuseBalanced: "Balanced",
      reuseBalancedDesc: "Mix of reuse and variety",
      reuseVariety: "Maximum variety",
      reuseVarietyDesc: "More diverse meals, less reuse",
      batchNotes: "Batch cooking notes",
      batchNotesPlaceholder:
        "E.g: I only have one oven, prefer slow cooker recipes...",

      // Step 3
      cuisinePreferences: "Cuisine preferences",
      cuisineHint: "Select your preferred cuisine types",
      equipmentAvailable: "Kitchen equipment",
      equipmentHint: "Select available equipment",
      ingredientsToInclude: "Ingredients to include",
      ingredientsToIncludePlaceholder: "E.g: chicken, rice, broccoli...",
      ingredientsToExclude: "Ingredients to exclude",
      ingredientsToExcludePlaceholder: "E.g: seafood, cilantro...",
      useFavoriteIngredients: "Use my favorite ingredients",
      useFavoriteIngredientsHint: "Prioritize ingredients from your profile",
      noFavoriteIngredients: "No favorite ingredients in your profile yet.",

      // Step 4
      servings: "Servings per recipe",
      servingsHint: "Number of individual servings for each recipe",
      dailyCalorieTarget: "Daily calorie target",
      dailyCalorieHint: "Leave empty to use your profile goal",
      fromProfile: "From profile",
      specialNotes: "Special notes for AI",
      specialNotesPlaceholder:
        "E.g: I like spicy food, prefer quick breakfasts, want high protein dinners...",
      planName: "Plan name",
      planNamePlaceholder: "E.g: Healthy Week, Meal Prep March...",
      planNameAuto: "Auto-generated if empty",
      startDate: "Week start date",

      // Routine meals
      routineMeals: "Routine meals",
      routineMealsHint:
        "Define what you usually eat. The AI will rotate among these options instead of inventing new ones each day.",
      routineMealsNote: "Leave empty to let the AI generate varied options.",
      routineBreakfastPlaceholder:
        "E.g: scrambled eggs, toast with ham, oatmeal, quesadillas...",
      routineLunchPlaceholder:
        "E.g: pasta, rice with chicken, salads, tacos...",
      routineDinnerPlaceholder:
        "E.g: homemade pizza, tuna tacos, omelettes, sandwiches...",
      routineSnackPlaceholder: "E.g: fruit, yogurt, nuts, toast...",
      useProfileRoutineMeals: "Use profile meals",
      useProfileRoutineMealsHint: "Use routine meals saved in your profile",
      noProfileRoutineMeals: "No routine meals configured in your profile",
      editProfileRoutineMeals: "Edit profile routine meals",

      // Step 5 - Summary
      summaryTitle: "Plan Summary",
      daysSelected: "{{count}} days selected",
      mealsPerDay: "{{count}} meals per day",
      totalMeals: "{{count}} total meals",
      batchCookingOn: "Batch cooking enabled",
      batchCookingOff: "Standard cooking",
      calorieTarget: "{{calories}} cal/day target",
      noCalorieTarget: "No calorie target",
      cuisinesSelected: "{{count}} cuisines selected",
      noCuisines: "All cuisines",
      generatePlan: "Generate Plan",
      generatingPlan: "Generating your meal plan...",
      generatingDay: "Generating meals for {{day}}...",
    },

    // Result view
    result: {
      title: "Your Meal Plan",
      totalCalories: "Total: {{calories}} cal",
      dailyCalories: "{{calories}} cal",
      mealCalories: "{{calories}} cal",
      prepDay: "Prep Day",
      eatingOutLabel: "Eating out",
      noRecipe: "No recipe assigned",

      // Base preparations (batch cooking)
      basePreparations: "Base Preparations",
      basePrepsDescription: "Prepare these in advance on your prep day(s)",
      viewRecipe: "View full recipe",
      basePreparation: "Base preparation",
      noPrepRecipe: "No detailed recipe was generated for this preparation.",
      usedIn: "Used in:",
      prepTime: "{{minutes}} min prep",

      // Actions
      savePlan: "Save Plan",
      savePlanDescription: "Save all recipes to your collection",
      regeneratePlan: "Regenerate Plan",
      regeneratePlanDescription: "Generate a completely new plan",
      discardPlan: "Discard",
      discardPlanDescription: "Discard this plan",
      regenerateMeal: "Regenerate this meal",
      regenerating: "Regenerating...",
      swapRecipe: "Swap from cookbook",
      swapFromCookbook: "Swap from cookbook",
      markEatingOut: "Mark as eating out",
      restoreMeal: "Cook at home instead",
      eatingOut: "Eating out",
      unmarkEatingOut: "Cooking at home",
      addToShoppingList: "Add to shopping list",
      addToShoppingListPlaceholder: "Coming soon!",
      longPressHint:
        "Long-press a meal to regenerate, swap or mark as eating out",
      noCookbookRecipes: "You have no saved recipes yet",
      noMatchingRecipes: "No recipes found",

      // Save
      saving: "Saving plan...",
      preparingPlan: "Preparing your plan...",
      savedTitle: "Plan saved!",
      savedMessage:
        "All recipes have been saved to your collection and the plan is now active",

      // Errors
      generateError: "Error generating plan. Please try again.",
      saveError: "Error saving plan.",
      regenerateError: "Error regenerating meal.",
      modifyError: "Error modifying recipe.",
      regeneratingPrep: "Regenerating base preparation...",
    },

    // Active plan view
    active: {
      today: "Today",
      todaysMeals: "Today's Meals",
      upcomingMeals: "Upcoming",
      allDays: "All days",
      completePlan: "Complete Plan",
      completePlanConfirm: "Mark this plan as completed?",
      deletePlan: "Delete Plan",
      deletePlanConfirm:
        "Are you sure you want to delete this plan? This cannot be undone.",
      viewHistory: "View History",
      planActive: "Active",
      planCompleted: "Completed",
      replaceActive:
        "You have an active plan. Creating a new one will deactivate it. Continue?",
      noPlanForToday: "No meals planned for today",
      progressLabel: "Day {{current}} of {{total}}",
    },

    // History
    history: {
      title: "Plan History",
      emptyTitle: "No past plans",
      emptyDescription: "Your completed and previous plans will appear here",
      repeatPlan: "Repeat Plan",
      repeatPlanConfirm:
        "This will clone the plan and set it as your active plan. Continue?",
      deletePlan: "Delete",
      mealsCount: "{{count}} meals",
      dateRange: "{{start}} - {{end}}",
    },

    // FAB (Floating Action Button)
    fab: {
      reopenPlan: "View generated plan",
      createNew: "Create new plan",
      continueWizard: "Continue setup",
      discardWizard: "Discard setup",
    },
  },
  shoppingList: {
    title: "Shopping List",
    subtitle: "Your grocery shopping list",
  },
  pantry: {
    title: "Pantry",
    subtitle: "Manage your pantry inventory",
  },
  onboarding: {
    // Steps
    step1Title: "Basic Info",
    step2Title: "Restrictions",
    step3Title: "Preferences",
    steps: {
      basics: "Basics",
      diet: "Diet",
      preferences: "Prefs",
    },
    // Step 1
    welcomeTitle: "Welcome to CocinIA!",
    welcomeSubtitle: "Let's personalize your experience",
    nameLabel: "Your name",
    namePlaceholder: "Enter your name",
    countryLabel: "Country",
    countryPlaceholder: "Select your country",
    currencyLabel: "Currency",
    currencyPlaceholder: "Select your currency",
    // Step 2
    restrictionsTitle: "Dietary Restrictions",
    restrictionsSubtitle: "Help us personalize your recipes",
    allergiesSection: "Allergies",
    allergiesDescription: "Select any food allergies you have",
    preferencesSection: "Dietary Preferences",
    preferencesDescription: "Select your dietary preferences",
    addCustomRestriction: "Add custom",
    customRestrictionPlaceholder: "Enter custom restriction",
    // Step 3
    cuisinesTitle: "Favorite Cuisines",
    cuisinesSubtitle: "What kind of food do you enjoy?",
    skipStep: "Skip for now",
    // Complete
    completeTitle: "You're all set!",
    completeSubtitle: "Your personalized cooking experience awaits",
    welcomeMessage: "Welcome, {{name}}!",
    getStarted: "Get Started",
    // Complete features
    featureRecipesTitle: "Personalized Recipes",
    featureRecipesSubtitle: "Based on your preferences",
    featurePlanTitle: "Weekly Meal Plans",
    featurePlanSubtitle: "Organized and easy to follow",
    featureShoppingTitle: "Smart Shopping Lists",
    featureShoppingSubtitle: "Never forget an ingredient",
    // Validation
    nameRequired: "Name is required",
    nameTooShort: "Name must be at least 2 characters",
    countryRequired: "Please select a country",
    currencyRequired: "Please select a currency",
  },
  restrictions: {
    // Allergies
    milk: "Milk/Dairy",
    eggs: "Eggs",
    peanuts: "Peanuts",
    treeNuts: "Tree Nuts",
    wheat: "Wheat",
    soy: "Soy",
    fish: "Fish",
    shellfish: "Shellfish",
    sesame: "Sesame",
    celery: "Celery",
    mustard: "Mustard",
    lupin: "Lupin",
    mollusks: "Mollusks",
    sulfites: "Sulfites",
    // Preferences
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    pescatarian: "Pescatarian",
    glutenFree: "Gluten-Free",
    lactoseFree: "Lactose-Free",
    keto: "Keto",
    paleo: "Paleo",
    lowCarb: "Low Carb",
    lowSodium: "Low Sodium",
    lowFat: "Low Fat",
    halal: "Halal",
    kosher: "Kosher",
    noAlcohol: "No Alcohol",
    noPork: "No Pork",
    noBeef: "No Beef",
  },
  cuisines: {
    mexican: "Mexican",
    american: "American",
    brazilian: "Brazilian",
    peruvian: "Peruvian",
    argentinian: "Argentinian",
    colombian: "Colombian",
    caribbean: "Caribbean",
    italian: "Italian",
    french: "French",
    spanish: "Spanish",
    greek: "Greek",
    german: "German",
    british: "British",
    portuguese: "Portuguese",
    mediterranean: "Mediterranean",
    chinese: "Chinese",
    japanese: "Japanese",
    korean: "Korean",
    thai: "Thai",
    vietnamese: "Vietnamese",
    indian: "Indian",
    indonesian: "Indonesian",
    malaysian: "Malaysian",
    filipino: "Filipino",
    middleEastern: "Middle Eastern",
    turkish: "Turkish",
    lebanese: "Lebanese",
    moroccan: "Moroccan",
    ethiopian: "Ethiopian",
    african: "African",
  },
  equipment: {
    oven: "Oven",
    microwave: "Microwave",
    airfryer: "Air Fryer",
    blender: "Blender",
    foodProcessor: "Food Processor",
    mixer: "Stand Mixer",
    slowCooker: "Slow Cooker",
    pressureCooker: "Pressure Cooker",
    instantPot: "Instant Pot",
    grill: "Grill",
    toaster: "Toaster",
    toasterOven: "Toaster Oven",
    riceCooker: "Rice Cooker",
    coffeeMaker: "Coffee Maker",
    espressoMachine: "Espresso Machine",
    kettle: "Electric Kettle",
    sousVide: "Sous Vide",
    wok: "Wok",
    castIron: "Cast Iron Pan",
    dutchOven: "Dutch Oven",
    induction: "Induction Cooktop",
    gasStove: "Gas Stove",
    electricStove: "Electric Stove",
    freezer: "Freezer",
    iceCreamMaker: "Ice Cream Maker",
    breadMaker: "Bread Maker",
    dehydrator: "Dehydrator",
    juicer: "Juicer",
    waffleMaker: "Waffle Maker",
    crepeMaker: "Crepe Maker",
  },
  recipeGeneration: {
    title: "What do you feel like eating today?",
    greeting: "Hello",
    subtitle:
      "Describe what you want and AI will create a personalized recipe for you",
    promptPlaceholder:
      "E.g: A creamy pasta with chicken, something quick for dinner...",
    advancedOptions: "Advanced options",
    activeFilters: "Active filters",
    noFiltersActive: "Tap to add filters",
    resetFilters: "Reset filters",
    resetToProfile: "Restore profile",
    restoredToProfile: "Restored to profile defaults",
    filtersCleared: "All filters cleared",
    clearAll: "Clear all",
    activeRestrictions: "Active restrictions from your profile",
    viewRecipe: "View recipe",
    generateNew: "Generate new",
    surprisePrompt: "Surprise me with something delicious",
    generateButton: "Generate Recipe",
    generating: "Generating recipe...",
    generatingMessage: "Our AI is creating a personalized recipe for you",
    modifyingMessage: "Modifying your recipe...",

    // Advanced options
    recipeName: "Recipe name",
    recipeNamePlaceholder: "E.g: Paella, Tacos, Lasagna...",
    ingredientsToUse: "Ingredients to use",
    ingredientsPlaceholder: "E.g: chicken, tomato, onion...",
    ingredientsToExclude: "Ingredients to exclude",
    excludePlaceholder: "E.g: seafood, cilantro...",
    usePantry: "Use ingredients from my pantry",
    usePantryShort: "Pantry",
    useFavoriteIngredients: "Use my favorite ingredients",
    favorites: "Favorites",
    mealType: "Meal type",
    servings: "Servings",
    servingsLabel: "servings",
    maxTime: "Maximum time",
    hour: "hour",
    hours: "hours",
    calorieRange: "Calorie range",
    minCalories: "Min",
    maxCalories: "Max calories",
    noLimit: "No limit",
    cuisine: "Cuisine type",
    difficulty: "Difficulty",

    // Meal types
    mealTypes: {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snack",
      dessert: "Dessert",
    },

    // Difficulty
    difficultyEasy: "Easy",
    difficultyMedium: "Medium",
    difficultyHard: "Hard",

    // Recipe result
    ingredients: "Ingredients",
    excluded: "excluded",
    preparation: "Preparation",
    prepTime: "Prep",
    cookTime: "Cook",
    totalTime: "Total",
    optional: "optional",

    // Nutrition
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",

    // Cost
    estimatedCost: "Estimated cost",
    perServing: "Per serving",

    // Tips & extras
    chefTips: "Chef Tips",
    tipLabel: "View tip",
    storage: "Storage",
    variations: "Variations",

    // Actions
    regenerate: "Regenerate",
    modify: "Modify",
    modifyDescription: "Describe the changes you want to make to the recipe",
    saveRecipe: "Save Recipe",
    discard: "Discard",
    modifyPlaceholder:
      "E.g: Reduce servings to 2, no avocado, make it spicier...",
    applyChanges: "Apply changes",

    // Retry errors
    retryError:
      "We had trouble generating your recipe. Please try again or adjust your filters.",

    // Messages
    emptyPromptError: "Write what you want to cook",
    generateError: "Error generating recipe. Try again.",
    modifyError: "Error modifying recipe",
    saveError: "Error saving recipe",
    savedTitle: "Recipe saved!",
    savedMessage: "The recipe has been saved to your collection",
    zodError: "The AI response does not have the expected format. Try again.",
    unknownError: "Unknown error",

    // AI Prompt translations
    prompt: {
      systemIntro: "You are CocinIA, an expert chef and AI cooking assistant.",
      systemTask:
        "Generate detailed and accurate recipes based on the current user request. Respond ONLY with a valid JSON object following the specified structure.",

      restrictionsImportant: "IMPORTANT about dietary restrictions:",
      restrictionsRule:
        "- If the user has ALLERGIES or DIETARY RESTRICTIONS listed below, DO NOT use those ingredients under any circumstances.",
      restrictionsConditional:
        "- If NO allergies or restrictions are listed, generate the recipe normally without modifications.",
      restrictionsNoAssumptions:
        "- DO NOT assume restrictions that are not explicitly stated.",

      descriptionRule:
        "DESCRIPTION RULE: Write a brief description (1 sentence, max 15 words) that is appealing and direct. No filler phrases.",

      jsonInstruction:
        "RESPONSE FORMAT: Respond ONLY with the JSON object. Do not add explanations, comments, or additional text.",
      jsonStructure: "Required JSON structure:",

      userContext: "--- USER CONTEXT ---",
      country: "Country",
      currency: "Currency",
      measurementSystem: "Measurement system",
      metric: "Metric",
      imperial: "Imperial",

      allergiesWarning: "⚠️ CRITICAL ALLERGIES - FORBIDDEN to use",
      dietaryPreferences: "🔒 ACTIVE DIETARY RESTRICTIONS - Strictly respect",
      noRestrictionsActive:
        "✓ No dietary restrictions - Generate recipe without modifications",

      availableEquipment: "Available equipment",

      requirements: "Recipe requirements",
      userRequest: "User request",

      useIngredients: "MUST include these ingredients",
      excludeIngredients: "DO NOT include these ingredients",
      mealType: "Meal type",
      servings: "Servings",
      maxTime: "Maximum preparation time",
      minutes: "minutes",
      caloriesPerServing: "calories per serving",
      maximum: "Maximum",
      cuisineType: "Cuisine style",
      difficultyLabel: "Difficulty level",
      difficultyLevels: {
        easy: "easy",
        medium: "medium",
        hard: "hard",
      },

      modifyRequest: "Requested modification",
      currentRecipe: "Current recipe to modify",
      returnModified: "Return the complete modified recipe in JSON format.",
    },
  },

  // ── AI Prompt translations (used by src/services/ai/*) ──
  aiPrompts: {
    // Shared
    systemIntro: "You are CocinIA, an expert chef and AI cooking assistant.",
    systemTask:
      "Generate detailed and accurate recipes based on the current user request. Respond ONLY with a valid JSON object following the specified structure.",
    languageInstruction:
      "LANGUAGE: Generate ALL content in ENGLISH (title, description, ingredients, steps, tips, etc.)",

    // Restrictions
    restrictionsImportant: "IMPORTANT about dietary restrictions:",
    restrictionsRule:
      "- If the user has ALLERGIES or DIETARY RESTRICTIONS listed below, DO NOT use those ingredients under any circumstances.",
    restrictionsConditional:
      "- If NO allergies or restrictions are listed, generate the recipe normally without modifications.",
    restrictionsNoAssumptions:
      "- DO NOT assume restrictions that are not explicitly stated.",
    allergiesWarning: "⚠️ CRITICAL ALLERGIES - FORBIDDEN to use",
    dietaryPreferences: "🔒 ACTIVE DIETARY RESTRICTIONS - Strictly respect",
    noRestrictionsActive:
      "✓ No dietary restrictions - Generate recipe without modifications",

    // Description & format
    descriptionRule:
      "DESCRIPTION RULE: Write a brief description (1 sentence, max 15 words) that is appealing and direct. No filler phrases.",
    jsonInstruction:
      "RESPONSE FORMAT: Respond ONLY with the JSON object. Do not add explanations, comments, or additional text.",
    jsonStructure: "Required JSON structure:",
    jsonDescriptionHint: "Brief description of max 15 words",
    jsonMealTypesNote:
      '// CRITICAL: meal_types can ONLY be: "breakfast", "lunch", "dinner", "snack", "dessert"',

    // Meal types rule
    mealTypesRule: `CRITICAL meal_types RULE:
The "meal_types" field can ONLY contain these EXACT values (no exceptions):
• "breakfast" - for breakfast dishes
• "lunch" - for lunch meals (also for sauces, sides, accompaniments)
• "dinner" - for dinner meals (also for main courses)
• "snack" - for snacks, appetizers, starters
• "dessert" - for desserts

DO NOT INVENT other values like "side dish", "condiment", "appetizer", "main course", etc.
If it's a sauce or side, use "lunch" or "dinner" depending on when it's served.`,

    // User context
    userContext: "--- USER CONTEXT ---",
    country: "Country",
    currency: "Currency",
    measurementSystem: "Measurement system",
    metric: "Metric",
    imperial: "Imperial",

    // Recipe requirements
    requirements: "Recipe requirements",
    userRequest: "User request",
    useIngredients: "MUST include these ingredients",
    excludeIngredients: "DO NOT include these ingredients",
    preferFavoriteIngredients:
      "Prefer using these favorite ingredients: {{list}}",
    favoriteSelectionMode:
      "VARIETY MODE: For this generation, prioritize ONLY this random selection of favorites.",
    favoriteIngredientsNote:
      "IMPORTANT: These are available favorite ingredients. You do NOT need to use all of them. Pick 1-3 ingredients and vary combinations across generations to avoid repeating the same ones.",
    mealType: "Meal type",
    servings: "Servings",
    maxTime: "Maximum preparation time",
    minutes: "minutes",
    caloriesPerServing: "calories per serving",
    maximum: "Maximum",
    cuisineType: "Cuisine style",
    selectedCuisineForThisRecipe:
      "Cuisine selected for THIS recipe (random pick): {{cuisine}}",
    multipleCuisinesNote:
      "IMPORTANT: Multiple cuisine styles are selected. Choose ONLY ONE for this recipe and keep the whole proposal coherent with that style.",
    difficultyLabel: "Difficulty level",
    difficultyLevels: {
      easy: "easy",
      medium: "medium",
      hard: "hard",
    },
    availableEquipment: "Available equipment",
    equipmentConstraintNote:
      "CRITICAL: Use only this available equipment. Do not suggest techniques or tools outside this list.",
    qualityStrategyTitle: "QUALITY AND VARIETY STRATEGY:",
    qualityStrategyRule1:
      "- Prioritize useful, realistic, tasty recipes; avoid generic outputs.",
    qualityStrategyRule2:
      "- If favorite ingredients are present, diversify combinations across runs.",
    qualityStrategyRule3:
      "- If multiple cuisines are selected, choose one for this recipe and stay consistent.",
    qualityStrategyRule4:
      "- Strictly respect allergies, dietary restrictions, and available equipment.",

    // Modify
    modifyRequest: "Requested modification",
    currentRecipe: "Current recipe to modify",
    returnModified: "Return the complete modified recipe in JSON format.",

    // Batch cooking
    batchPreparationRules: `Your task is to generate {{numPreps}} BASE PREPARATIONS for batch cooking.
These will be cooked in a prep session and stored in the fridge to assemble lunches for {{numDays}} days of the week.

RULES:
- Generate EXACTLY {{numPreps}} base preparations of different types (protein, grain/carb, sauce, vegetable, side).
- If the user specifies ingredients (e.g. "chicken and salmon"), EACH ONE must be a separate "protein" type base preparation. Generate as many proteins as the user requests.
- Each preparation must keep in the fridge for at least 4-5 days.
- Preparations must be VERSATILE: combinable in different ways to create varied dishes.
- TOTAL prep time for all bases must not exceed {{maxPrepTime}} minutes.
- Reuse strategy: {{reuseStrategy}}.`,
    batchKeyIngredients:
      "KEY INGREDIENTS TO USE (distribute across preparations, use ALL): {{list}}",
    batchNotesLabel: "USER BATCH COOKING NOTES",
    batchNotesReinforce:
      "⚠️ IMPORTANT: Respect these user instructions for base preparations: {{notes}}. If they mention specific ingredients, you MUST use them by distributing them across the preparations.",
    specialNotesLabel: "SPECIAL NOTES",
    batchFormatInstruction: "FORMAT: Return ONLY a JSON array. Each object:",
    batchValidTypes:
      "Valid types: protein, grain, sauce, vegetable, side, other. Return ONLY the JSON.",

    // Weekly plan — day prompts
    wpDayTask:
      "Your task is to generate recipes for ONE DAY of a weekly meal plan.",
    wpCalorieTarget:
      "DAILY CALORIE TARGET: {{calories}} calories. Distribute across the day's meals.",
    wpServings:
      "SERVINGS: Each recipe should be for {{count}} individual serving(s).",
    wpBatchCookingMode:
      "BATCH COOKING MODE: The user preps meals in advance. Generate recipes that can be batch-prepared, reuse base ingredients, and store well. Reuse strategy: {{strategy}}.",
    wpResponseFormat:
      "RESPONSE FORMAT: Return a JSON array of recipe objects. Each object must follow EXACTLY this structure:",
    wpGenerateForDay: "Generate recipes for {{day}}.",
    wpMealsToGenerate: "Meals to generate: {{meals}}",
    wpMaxCookingTimeDetailed: "Maximum cooking time: {{details}}",
    wpMaxCookingTime: "Maximum cooking time per recipe: {{minutes}} minutes.",
    wpTryIngredients: "Try to use these ingredients: {{list}}",
    wpRoutineMealRotation:
      "For {{mealLabel}}, rotate among these user's usual options (don't invent new ones unless variety is requested): {{routine}}",
    wpQuickMealGuidance:
      "For breakfasts and dinners, prioritize quick assembly meals (≤15 min, few ingredients) unless the user indicated otherwise. Lunches can be more elaborate.",
    wpCuisineReminder:
      "REMEMBER: Only generate recipes from these cuisine styles: {{list}}",
    wpSpecialNotesReminder: "USER NOTES (respect these): {{notes}}",
    wpForbiddenIngredients:
      "⚠️ FORBIDDEN ingredients - DO NOT use in ANY recipe: {{list}}",
    wpBatchAssembly: `🍱 BATCH COOKING - ASSEMBLY LUNCH:
For today's LUNCH, create a DIFFERENT dish that assembles from the base preparations in the fridge.

AVAILABLE BASE PREPARATIONS:
{{prepList}}

STRICT VARIETY RULES (day {{dayIndex}} of {{totalDays}}):
1. Use MAXIMUM 2-3 base preparations for this dish. DO NOT use all of them.
2. TODAY'S ASSIGNMENT: You must use "{{suggestedProtein}}" as the main protein, combine it with ONLY 1-2 of the other bases.
3. DO NOT repeat the same combination or concept from other days.
4. DISH FORMAT: Choose a DIFFERENT format from other days. Examples: tacos/burritos, salad, wrap, stir-fry, pasta, bowl, sandwich, quesadilla, soup, poke bowl, empanada, baked dish.
5. The recipe should describe ONLY assembly/reheating instructions (max 10-15 min), DO NOT cook from scratch.
6. You may add 1-2 minimal fresh ingredients (lettuce, cheese, tortilla, bread, lime, etc.).

SUGGESTED COMBO FOR TODAY:
{{suggestedCombo}}

IMPORTANT: If other days already used bowl/wrap/salad, choose a completely different format.`,
    wpAvoidRepetition:
      "AVOID repeating these dishes already generated for other days: {{titles}}",
    wpReturnJsonOnly: "Return ONLY the JSON array. Do not add explanations.",

    // Regenerate single meal
    wpRegenMealInstruction:
      "Generate a recipe for {{day}}'s {{meal}}. Max time: {{minutes}} min.",
    wpDoNotRepeat: "DO NOT repeat: {{titles}}",
  },
};
