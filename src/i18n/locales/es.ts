export const es = {
  common: {
    appName: "CocinIA",
    loading: "Cargando...",
    error: "Error",
    retry: "Reintentar",
    cancel: "Cancelar",
    save: "Guardar",
    add: "Añadir",
    delete: "Eliminar",
    edit: "Editar",
    done: "Listo",
    next: "Siguiente",
    back: "Atras",
    search: "Buscar",
    searchAll: "Buscar en todo...",
    noResults: "No se encontraron resultados",
    or: "o",
    apply: "Aplicar",
    allow: "Permitir",
    ok: "OK",
    selected: "seleccionados",
  },
  tabs: {
    home: "Inicio",
    recipes: "Recetas",
    plan: "Plan",
    shopping: "Compras",
    pantry: "Despensa",
  },
  auth: {
    login: "Iniciar sesion",
    register: "Registrarse",
    createAccount: "Crear cuenta",
    loginTitle: "CocinIA",
    loginSubtitle: "Tu asistente de cocina con IA",
    registerTitle: "Crear cuenta",
    registerSubtitle: "Unete a CocinIA",
    alreadyHaveAccount: "Ya tienes una cuenta?",
    noAccount: "No tienes una cuenta?",
    email: "Correo electronico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    continueWithGoogle: "Continuar con Google",
    invalidEmail: "Correo electronico invalido",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    passwordsDontMatch: "Las contraseñas no coinciden",
    loginError: "Error al iniciar sesion. Verifica tus credenciales.",
    registerError: "Error al registrarse. Intenta de nuevo.",
    signOut: "Cerrar sesion",
    signOutConfirm: "¿Estás seguro de que deseas cerrar sesión?",
  },
  profile: {
    title: "Perfil",
    guestUser: "Usuario Invitado",
    signInToSync: "Inicia sesion para sincronizar tus datos",
    appearance: "Apariencia",
    theme: "Tema",
    themeLight: "Claro",
    themeDark: "Oscuro",
    language: "Idioma",
    moreSettingsSoon: "Mas ajustes proximamente",
    editProfile: "Editar Perfil",
    // Sections
    basicInfo: "Información Básica",
    basicInfoDesc: "Nombre, país y moneda",
    personalInfo: "Información Personal",
    personalInfoDesc: "Datos físicos y actividad",
    profileInfo: "Información del Perfil",
    profileInfoDesc: "Nombre, ubicación y datos físicos",
    nutritionGoals: "Objetivos Nutricionales",
    nutritionGoalsDesc: "Calorías y macros",
    cookingPreferences: "Preferencias de Cocina",
    cookingPreferencesDesc: "Restricciones, cocinas y equipamiento",
    equipment: "Equipamiento de Cocina",
    equipmentDesc: "Electrodomésticos y utensilios",
    favoriteIngredients: "Ingredientes Favoritos",
    favoriteIngredientsDesc: "Ingredientes que te gusta usar al cocinar",
    routineMeals: "Comidas Habituales",
    routineMealsDesc: "Define qué sueles comer normalmente",
    routineMealsTitle: "¿Qué sueles comer?",
    routineMealsDescription:
      "Define lo que sueles desayunar, comer, cenar y merendar. El planificador semanal rotará entre estas opciones en vez de inventar algo nuevo cada día.",
    routineMealType: {
      breakfast: "Desayuno",
      lunch: "Comida",
      dinner: "Cena",
      snack: "Snack",
    },
    routineMealPlaceholder: {
      breakfast: "Ej: huevos revueltos",
      lunch: "Ej: pasta con verduras",
      dinner: "Ej: pizza casera con pan pita",
      snack: "Ej: yogur con fruta",
    },
    routineMealHint: "Añade las comidas que sueles preparar.",
    saveError: "Error al guardar los cambios",
    // Basic info fields
    displayName: "Nombre",
    displayNamePlaceholder: "Tu nombre",
    country: "País",
    countryPlaceholder: "Selecciona tu país",
    currency: "Moneda",
    currencyPlaceholder: "Selecciona tu moneda",
    searchCountry: "Buscar país...",
    searchCurrency: "Buscar moneda...",
    // Personal info fields
    height: "Altura",
    heightUnit: "cm",
    heightUnitImperial: "ft/in",
    weight: "Peso",
    weightUnit: "kg",
    weightUnitImperial: "lbs",
    measurementSystem: "Sistema de Medidas",
    metric: "Métrico",
    imperial: "Imperial",
    birthDate: "Fecha de Nacimiento",
    birthDatePlaceholder: "Seleccionar fecha",
    selectDate: "Seleccionar Fecha",
    day: "Día",
    month: "Mes",
    year: "Año",
    gender: "Género",
    genderMale: "Masculino",
    genderFemale: "Femenino",
    genderOther: "Otro",
    genderPlaceholder: "Selecciona tu género",
    activityLevel: "Nivel de Actividad",
    activitySedentary: "Sedentario",
    activitySedentaryDesc: "Poco o nada de ejercicio",
    activityLight: "Ligero",
    activityLightDesc: "Ejercicio 1-3 días/semana",
    activityModerate: "Moderado",
    activityModerateDesc: "Ejercicio 3-5 días/semana",
    activityActive: "Activo",
    activityActiveDesc: "Ejercicio 6-7 días/semana",
    activityVeryActive: "Muy Activo",
    activityVeryActiveDesc: "Ejercicio intenso diario",
    activityPlaceholder: "Selecciona tu nivel de actividad",
    // Nutrition goals
    fitnessGoal: "Objetivo",
    goalLoseWeight: "Perder Peso",
    goalMaintain: "Mantener Peso",
    goalGainMuscle: "Ganar Músculo",
    goalEatHealthy: "Comer Saludable",
    goalPlaceholder: "Selecciona tu objetivo",
    dailyCalorieGoal: "Calorías Diarias",
    proteinGoal: "Proteína",
    carbsGoal: "Carbohidratos",
    fatGoal: "Grasa",
    defaultServings: "Porciones por Defecto",
    calculateGoals: "Calcular Automáticamente",
    calculatedGoals: "Objetivos calculados según tu perfil",
    completePersonalInfoToCalculate:
      "Completa tu información personal para calcular automáticamente",
    // Restrictions
    dietaryRestrictions: "Restricciones Dietéticas",
    allergies: "Alergias",
    preferences: "Preferencias",
    addCustom: "Añadir Personalizado",
    customItems: "Items Personalizados",
    addAllergy: "Añadir Alergia",
    addPreference: "Añadir Preferencia",
    addCuisine: "Añadir Cocina",
    addEquipment: "Añadir Equipo",
    addAllergyDesc: "Añade una alergia personalizada que no esté en la lista",
    addPreferenceDesc: "Añade una preferencia dietética personalizada",
    addCuisineDesc: "Añade un tipo de cocina personalizado",
    addEquipmentDesc: "Añade un equipo de cocina personalizado",
    customValuePlaceholder: "Ingresa el nombre...",
    customRestrictionLabel: "Restricción personalizada",
    isAllergy: "¿Es alergia?",
    // Cuisines
    favoriteCuisines: "Cocinas Favoritas",
    // Equipment
    kitchenEquipment: "Equipamiento",
    addCustomEquipment: "Añadir Equipo",
    customEquipmentLabel: "Nombre del equipo",
    // Favorite Ingredients
    addIngredient: "Añadir Ingrediente",
    addManual: "Añadir manualmente",
    fromRecipes: "De tus recetas",
    selectFromRecipes: "Selecciona ingredientes de tus recetas guardadas",
    noRecipeIngredients: "Aún no tienes recetas guardadas",
    ingredientName: "Nombre del ingrediente",
    ingredientPlaceholder: "ej., Pollo, Tomates, Arroz...",
    alwaysAvailable: "Siempre disponible",
    alwaysAvailableDesc: "Este ingrediente siempre está en mi despensa",
    noIngredients: "Sin ingredientes favoritos",
    ingredientsHelp:
      'Añade ingredientes que usas frecuentemente. Márcalos como "siempre disponible" si son básicos en tu cocina.',
    // Actions
    saveChanges: "Guardar Cambios",
    saving: "Guardando...",
    profileUpdated: "Perfil actualizado",
    updateError: "Error al actualizar el perfil",
    editRestrictions: "Editar Restricciones",
    editCuisines: "Editar Cocinas Favoritas",
    selectedCount: "{{count}} seleccionados",
    noRestrictions: "Sin restricciones",
    noCuisines: "Sin cocinas favoritas",
    noEquipment: "Sin equipamiento",
  },
  home: {
    title: "CocinIA",
    subtitle: "Tu asistente de cocina con IA",
    placeholder: "Pantalla de inicio",
    chatPlaceholder: "Escribe tu mensaje...",
  },
  recipes: {
    title: "Recetas",
    subtitle: "Explora y descubre recetas",
    searchPlaceholder: "Buscar recetas...",
    emptyTitle: "Sin recetas guardadas",
    emptyDescription: "Genera tu primera receta con IA y guárdala aquí",
    emptyAction: "Generar receta",
    noResultsTitle: "Sin resultados",
    noResultsDescription:
      "No se encontraron recetas con los filtros seleccionados",
    filters: {
      title: "Filtros",
      active: "Filtros activos",
      clear: "Limpiar",
      difficulty: "Dificultad",
      mealType: "Tipo de comida",
      maxTime: "Tiempo máximo",
      maxCalories: "Calorías máximas",
      cuisine: "Tipo de cocina",
      ingredients: "Ingredientes",
      selectCuisine: "Seleccionar cocinas...",
      selectIngredients: "Seleccionar ingredientes...",
    },
    detail: {
      headerTitle: "Detalles de receta",
      loadError: "Error al cargar la receta",
      notFound: "Receta no encontrada",
      deleteTitle: "Eliminar receta",
      deleteConfirm: "¿Estás seguro de que deseas eliminar esta receta?",
      deleteError: "Error al eliminar la receta",
      saveError: "Error al guardar los cambios",
      editTitle: "Editar receta",
      titleLabel: "Título",
      titlePlaceholder: "Nombre de la receta",
      descriptionLabel: "Descripción",
      descriptionPlaceholder: "Describe la receta...",
      servingsLabel: "Porciones",
      addPhotoTitle: "Añadir foto",
      addPhotoMessage: "¿Cómo quieres añadir la foto?",
      fromCamera: "Usar cámara",
      fromGallery: "Elegir de galería",
      permissionDenied: "Se necesitan permisos para acceder a las fotos",
      cameraPermissionDenied: "Se necesitan permisos para usar la cámara",
      cameraPermissionTitle: "Acceso a la cámara",
      cameraPermissionMessage:
        "CocinIA necesita acceso a tu cámara para tomar una foto de tu receta. ¿Deseas permitirlo?",
      galleryPermissionTitle: "Acceso a la galería",
      galleryPermissionMessage:
        "CocinIA necesita acceso a tu galería de fotos para seleccionar una foto de receta. ¿Deseas permitirlo?",
      uploadError: "Error al subir la imagen",
      uploadingImage: "Subiendo imagen...",
      addPhoto: "Añadir foto",
      changePhoto: "Cambiar foto",
      photoLabel: "Foto de la receta",
      deletePhoto: "Eliminar foto",
      deletePhotoTitle: "Eliminar foto",
      deletePhotoConfirm: "¿Estás seguro de que deseas eliminar la foto?",
      deletePhotoError: "Error al eliminar la foto",
    },
  },
  weeklyPlan: {
    title: "Plan Semanal",
    subtitle: "Planifica tus comidas de la semana",

    // Empty state
    emptyTitle: "Sin plan activo",
    emptyDescription:
      "Crea un plan semanal de comidas adaptado a tus preferencias y objetivos nutricionales",
    createFirst: "Crear tu primer plan",
    createNew: "Crear nuevo plan",

    // Days
    days: {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo",
    },
    daysShort: {
      monday: "Lun",
      tuesday: "Mar",
      wednesday: "Mié",
      thursday: "Jue",
      friday: "Vie",
      saturday: "Sáb",
      sunday: "Dom",
    },
    daysInitial: {
      monday: "L",
      tuesday: "M",
      wednesday: "X",
      thursday: "J",
      friday: "V",
      saturday: "S",
      sunday: "D",
    },

    // Meal types
    mealTypes: {
      breakfast: "Desayuno",
      lunch: "Comida",
      dinner: "Cena",
      snack: "Snack",
    },

    // Wizard
    wizard: {
      title: "Nuevo Plan Semanal",
      step1Title: "Días y Comidas",
      step1Subtitle: "Selecciona qué días y comidas planificar",
      step2Title: "Estilo de Cocina",
      step2Subtitle: "Configura tus preferencias de cocina",
      step3Title: "Preferencias",
      step3Subtitle: "Personaliza cocinas e ingredientes",
      step4Title: "Nutrición y Notas",
      step4Subtitle: "Define objetivos calóricos y peticiones especiales",
      step5Title: "Resumen",
      step5Subtitle: "Revisa tu plan antes de generar",

      // Step labels for stepper
      steps: {
        days: "Días",
        cooking: "Cocina",
        food: "Comida",
        nutrition: "Nutrición",
        summary: "Resumen",
      },

      // Step 1
      selectDays: "Días para cocinar",
      selectDaysHint: "Toca los días que quieres planificar",
      mealsForDay: "Comidas para {{day}}",
      defaultMeals: "Comidas por defecto para todos los días",
      perDayConfig: "Configurar por día",
      switchToDefault: "Por defecto",
      switchToPerDay: "Por día",
      eatingOut: "Comer fuera",
      eatingOutHint: "Marca las comidas que harás fuera de casa",
      cookingTime: "Tiempo disponible para cocinar",
      cookingTimeHint: "Minutos por comida",
      noDaysSelected: "Selecciona al menos un día",

      // Step 2
      batchCooking: "Modo batch cooking",
      batchCookingDescription:
        "Cocina varias comidas de antemano en días de preparación",
      batchLunchOnly:
        "El batch cooking aplica a las comidas (almuerzos). Se generarán preparaciones base que se reutilizarán para armar los platos de cada día.",
      batchLunchTimeNote:
        "El tiempo de cocina para las comidas ya está incluido en la sesión de batch cooking.",
      onlyBatchMeals:
        "Solo hay comidas batch — el tiempo se configuró en el paso anterior.",
      prepDays: "Día(s) de preparación",
      prepDaysHint: "¿Qué días harás batch cooking?",
      maxPrepTime: "Tiempo máximo de preparación",
      maxPrepTimeHint: "Minutos totales para el día de preparación",
      basePrepsCount: "Número de preparaciones base",
      basePrepsHint: "Cuántos items base preparar (proteínas, granos, salsas)",
      reuseStrategy: "Reutilización de ingredientes",
      reuseMaximize: "Máxima reutilización",
      reuseMaximizeDesc: "Menos ingredientes, más repetición",
      reuseBalanced: "Equilibrado",
      reuseBalancedDesc: "Mezcla de reutilización y variedad",
      reuseVariety: "Máxima variedad",
      reuseVarietyDesc: "Comidas más diversas, menos reutilización",
      batchNotes: "Notas de batch cooking",
      batchNotesPlaceholder:
        "Ej: Solo tengo un horno, prefiero recetas con olla lenta...",

      // Step 3
      cuisinePreferences: "Preferencias de cocina",
      cuisineHint: "Selecciona tus tipos de cocina preferidos",
      equipmentAvailable: "Equipamiento de cocina",
      equipmentHint: "Selecciona el equipamiento disponible",
      ingredientsToInclude: "Ingredientes a incluir",
      ingredientsToIncludePlaceholder: "Ej: pollo, arroz, brócoli...",
      ingredientsToExclude: "Ingredientes a excluir",
      ingredientsToExcludePlaceholder: "Ej: mariscos, cilantro...",
      useFavoriteIngredients: "Usar mis ingredientes favoritos",
      useFavoriteIngredientsHint: "Priorizar ingredientes de tu perfil",
      noFavoriteIngredients: "No tienes ingredientes favoritos en tu perfil.",

      // Step 4
      servings: "Porciones por receta",
      servingsHint: "Número de porciones individuales para cada receta",
      dailyCalorieTarget: "Objetivo calórico diario",
      dailyCalorieHint: "Deja vacío para usar tu objetivo del perfil",
      fromProfile: "Del perfil",
      specialNotes: "Notas especiales para la IA",
      specialNotesPlaceholder:
        "Ej: Me gusta la comida picante, prefiero desayunos rápidos, quiero cenas altas en proteína...",
      planName: "Nombre del plan",
      planNamePlaceholder: "Ej: Semana Saludable, Meal Prep Marzo...",
      planNameAuto: "Se genera automáticamente si está vacío",
      startDate: "Fecha de inicio de la semana",

      // Routine meals
      routineMeals: "Comidas habituales",
      routineMealsHint:
        "Define qué sueles comer normalmente. La IA rotará entre estas opciones en vez de inventar algo nuevo cada día.",
      routineMealsNote: "Deja vacío para que la IA genere opciones variadas.",
      routineBreakfastPlaceholder:
        "Ej: huevos revueltos, tostadas con jamón, quesadillas, avena...",
      routineLunchPlaceholder:
        "Ej: pasta, arroz con pollo, ensaladas, tacos...",
      routineDinnerPlaceholder:
        "Ej: pizza casera con pan pita, tacos de atún, tortilla, sándwiches...",
      routineSnackPlaceholder: "Ej: fruta, yogur, frutos secos, tostadas...",
      useProfileRoutineMeals: "Usar comidas del perfil",
      useProfileRoutineMealsHint:
        "Usa las comidas habituales guardadas en tu perfil",
      noProfileRoutineMeals:
        "No tienes comidas habituales configuradas en tu perfil",
      editProfileRoutineMeals: "Editar comidas habituales del perfil",

      // Step 5 - Summary
      summaryTitle: "Resumen del Plan",
      daysSelected: "{{count}} días seleccionados",
      mealsPerDay: "{{count}} comidas por día",
      totalMeals: "{{count}} comidas en total",
      batchCookingOn: "Batch cooking activado",
      batchCookingOff: "Cocina estándar",
      calorieTarget: "{{calories}} cal/día objetivo",
      noCalorieTarget: "Sin objetivo calórico",
      cuisinesSelected: "{{count}} cocinas seleccionadas",
      noCuisines: "Todas las cocinas",
      generatePlan: "Generar Plan",
      generatingPlan: "Generando tu plan de comidas...",
      generatingDay: "Generando comidas para {{day}}...",
    },

    // Result view
    result: {
      title: "Tu Plan de Comidas",
      totalCalories: "Total: {{calories}} cal",
      dailyCalories: "{{calories}} cal",
      mealCalories: "{{calories}} cal",
      prepDay: "Día de Preparación",
      eatingOutLabel: "Comer fuera",
      noRecipe: "Sin receta asignada",

      // Base preparations (batch cooking)
      basePreparations: "Preparaciones Base",
      basePrepsDescription:
        "Prepara estos con antelación en tus días de preparación",
      viewRecipe: "Ver receta completa",
      basePreparation: "Preparación base",
      noPrepRecipe: "No se generó receta detallada para esta preparación.",
      usedIn: "Se usa en:",
      prepTime: "{{minutes}} min de prep",

      // Actions
      savePlan: "Guardar Plan",
      savePlanDescription: "Guarda todas las recetas en tu colección",
      regeneratePlan: "Regenerar Plan",
      regeneratePlanDescription: "Genera un plan completamente nuevo",
      discardPlan: "Descartar",
      discardPlanDescription: "Descartar este plan",
      regenerateMeal: "Regenerar esta comida",
      regenerating: "Regenerando...",
      swapRecipe: "Cambiar del recetario",
      swapFromCookbook: "Cambiar del recetario",
      markEatingOut: "Marcar como comer fuera",
      restoreMeal: "Volver a cocinar en casa",
      eatingOut: "Comer fuera",
      unmarkEatingOut: "Cocinar en casa",
      addToShoppingList: "Añadir a lista de compras",
      addToShoppingListPlaceholder: "¡Próximamente!",
      longPressHint:
        "Mantén presionada una comida para regenerar, cambiar o marcar como comer fuera",
      noCookbookRecipes: "No tienes recetas guardadas aún",
      noMatchingRecipes: "No se encontraron recetas",

      // Save
      saving: "Guardando plan...",
      preparingPlan: "Preparando tu plan...",
      savedTitle: "¡Plan guardado!",
      savedMessage:
        "Todas las recetas se han guardado en tu colección y el plan está activo",

      // Errors
      generateError: "Error al generar el plan. Inténtalo de nuevo.",
      saveError: "Error al guardar el plan.",
      regenerateError: "Error al regenerar la comida.",
      modifyError: "Error al modificar la receta.",
      regeneratingPrep: "Regenerando preparación base...",
    },

    // Active plan view
    active: {
      today: "Hoy",
      todaysMeals: "Comidas de Hoy",
      upcomingMeals: "Próximas",
      allDays: "Todos los días",
      completePlan: "Completar Plan",
      completePlanConfirm: "¿Marcar este plan como completado?",
      deletePlan: "Eliminar Plan",
      deletePlanConfirm:
        "¿Estás seguro de que quieres eliminar este plan? No se puede deshacer.",
      viewHistory: "Ver Historial",
      planActive: "Activo",
      planCompleted: "Completado",
      replaceActive:
        "Tienes un plan activo. Crear uno nuevo lo desactivará. ¿Continuar?",
      noPlanForToday: "No hay comidas planificadas para hoy",
      progressLabel: "Día {{current}} de {{total}}",
    },

    // History
    history: {
      title: "Historial de Planes",
      emptyTitle: "Sin planes anteriores",
      emptyDescription: "Tus planes completados y anteriores aparecerán aquí",
      repeatPlan: "Repetir Plan",
      repeatPlanConfirm:
        "Esto clonará el plan y lo establecerá como tu plan activo. ¿Continuar?",
      deletePlan: "Eliminar",
      mealsCount: "{{count}} comidas",
      dateRange: "{{start}} - {{end}}",
    },

    // FAB (Floating Action Button)
    fab: {
      reopenPlan: "Ver plan generado",
      createNew: "Crear nuevo plan",
      continueWizard: "Continuar configuración",
      discardWizard: "Descartar configuración",
    },
  },
  shoppingList: {
    title: "Lista de Compras",
    subtitle: "Tu lista de compras",
  },
  pantry: {
    title: "Despensa",
    subtitle: "Gestiona tu inventario de despensa",
  },
  onboarding: {
    // Steps
    step1Title: "Información Básica",
    step2Title: "Restricciones",
    step3Title: "Preferencias",
    steps: {
      basics: "Básico",
      diet: "Dieta",
      preferences: "Prefs",
    },
    // Step 1
    welcomeTitle: "¡Bienvenido a CocinIA!",
    welcomeSubtitle: "Vamos a personalizar tu experiencia",
    nameLabel: "Tu nombre",
    namePlaceholder: "Ingresa tu nombre",
    countryLabel: "País",
    countryPlaceholder: "Selecciona tu país",
    currencyLabel: "Moneda",
    currencyPlaceholder: "Selecciona tu moneda",
    // Step 2
    restrictionsTitle: "Restricciones Alimenticias",
    restrictionsSubtitle: "Ayúdanos a personalizar tus recetas",
    allergiesSection: "Alergias",
    allergiesDescription: "Selecciona las alergias alimentarias que tengas",
    preferencesSection: "Preferencias Alimenticias",
    preferencesDescription: "Selecciona tus preferencias alimenticias",
    addCustomRestriction: "Añadir personalizada",
    customRestrictionPlaceholder: "Ingresa restricción personalizada",
    // Step 3
    cuisinesTitle: "Cocinas Favoritas",
    cuisinesSubtitle: "¿Qué tipo de comida disfrutas?",
    skipStep: "Saltar por ahora",
    // Complete
    completeTitle: "¡Todo listo!",
    completeSubtitle: "Tu experiencia de cocina personalizada te espera",
    welcomeMessage: "¡Bienvenido, {{name}}!",
    getStarted: "Comenzar",
    // Complete features
    featureRecipesTitle: "Recetas Personalizadas",
    featureRecipesSubtitle: "Basadas en tus preferencias",
    featurePlanTitle: "Planes Semanales",
    featurePlanSubtitle: "Organizados y fáciles de seguir",
    featureShoppingTitle: "Listas de Compras Inteligentes",
    featureShoppingSubtitle: "Nunca olvides un ingrediente",
    // Validation
    nameRequired: "El nombre es requerido",
    nameTooShort: "El nombre debe tener al menos 2 caracteres",
    countryRequired: "Por favor selecciona un país",
    currencyRequired: "Por favor selecciona una moneda",
  },
  restrictions: {
    // Allergies
    milk: "Leche/Lácteos",
    eggs: "Huevos",
    peanuts: "Maní",
    treeNuts: "Frutos Secos",
    wheat: "Trigo",
    soy: "Soja",
    fish: "Pescado",
    shellfish: "Mariscos",
    sesame: "Sésamo",
    celery: "Apio",
    mustard: "Mostaza",
    lupin: "Lupino",
    mollusks: "Moluscos",
    sulfites: "Sulfitos",
    // Preferences
    vegetarian: "Vegetariano",
    vegan: "Vegano",
    pescatarian: "Pescetariano",
    glutenFree: "Sin Gluten",
    lactoseFree: "Sin Lactosa",
    keto: "Keto",
    paleo: "Paleo",
    lowCarb: "Bajo en Carbohidratos",
    lowSodium: "Bajo en Sodio",
    lowFat: "Bajo en Grasa",
    halal: "Halal",
    kosher: "Kosher",
    noAlcohol: "Sin Alcohol",
    noPork: "Sin Cerdo",
    noBeef: "Sin Carne de Res",
  },
  cuisines: {
    mexican: "Mexicana",
    american: "Americana",
    brazilian: "Brasileña",
    peruvian: "Peruana",
    argentinian: "Argentina",
    colombian: "Colombiana",
    caribbean: "Caribeña",
    italian: "Italiana",
    french: "Francesa",
    spanish: "Española",
    greek: "Griega",
    german: "Alemana",
    british: "Británica",
    portuguese: "Portuguesa",
    mediterranean: "Mediterránea",
    chinese: "China",
    japanese: "Japonesa",
    korean: "Coreana",
    thai: "Tailandesa",
    vietnamese: "Vietnamita",
    indian: "India",
    indonesian: "Indonesia",
    malaysian: "Malasia",
    filipino: "Filipina",
    middleEastern: "Medio Oriente",
    turkish: "Turca",
    lebanese: "Libanesa",
    moroccan: "Marroqui",
    ethiopian: "Etíope",
    african: "Africana",
  },
  equipment: {
    oven: "Horno",
    microwave: "Microondas",
    airfryer: "Freidora de Aire",
    blender: "Licuadora",
    foodProcessor: "Procesador de Alimentos",
    mixer: "Batidora de Pie",
    slowCooker: "Olla de Cocción Lenta",
    pressureCooker: "Olla a Presión",
    instantPot: "Instant Pot",
    grill: "Parrilla",
    toaster: "Tostadora",
    toasterOven: "Horno Tostador",
    riceCooker: "Arrocera",
    coffeeMaker: "Cafetera",
    espressoMachine: "Máquina de Espresso",
    kettle: "Hervidor Eléctrico",
    sousVide: "Sous Vide",
    wok: "Wok",
    castIron: "Sartén de Hierro Fundido",
    dutchOven: "Olla Holandesa",
    induction: "Placa de Inducción",
    gasStove: "Estufa de Gas",
    electricStove: "Estufa Eléctrica",
    freezer: "Congelador",
    iceCreamMaker: "Máquina de Helados",
    breadMaker: "Panificadora",
    dehydrator: "Deshidratador",
    juicer: "Extractor de Jugos",
    waffleMaker: "Wafflera",
    crepeMaker: "Crepera",
  },
  recipeGeneration: {
    title: "¿Qué te apetece comer hoy?",
    greeting: "Hola",
    subtitle:
      "Describe lo que quieres y la IA creará una receta personalizada para ti",
    promptPlaceholder:
      "Ej: Una pasta cremosa con pollo, algo rápido para cenar...",
    advancedOptions: "Opciones avanzadas",
    activeFilters: "Filtros activos",
    noFiltersActive: "Toca para agregar filtros",
    resetFilters: "Reiniciar filtros",
    resetToProfile: "Restaurar perfil",
    restoredToProfile: "Restaurado a valores del perfil",
    filtersCleared: "Todos los filtros limpiados",
    clearAll: "Limpiar todo",
    activeRestrictions: "Restricciones activas de tu perfil",
    viewRecipe: "Ver receta",
    generateNew: "Generar nueva",
    surprisePrompt: "Sorpréndeme con algo delicioso",
    generateButton: "Generar Receta",
    generating: "Generando receta...",
    generatingMessage:
      "Nuestra IA está creando una receta personalizada para ti",
    modifyingMessage: "Modificando tu receta...",

    // Advanced options
    recipeName: "Nombre de receta",
    recipeNamePlaceholder: "Ej: Paella, Tacos, Lasaña...",
    ingredientsToUse: "Ingredientes a usar",
    ingredientsPlaceholder: "Ej: pollo, tomate, cebolla...",
    ingredientsToExclude: "Ingredientes a excluir",
    excludePlaceholder: "Ej: mariscos, cilantro...",
    usePantry: "Usar ingredientes de mi despensa",
    usePantryShort: "Despensa",
    useFavoriteIngredients: "Usar mis ingredientes favoritos",
    favorites: "Favoritos",
    mealType: "Tipo de comida",
    servings: "Porciones",
    servingsLabel: "porciones",
    maxTime: "Tiempo máximo",
    hour: "hora",
    hours: "horas",
    calorieRange: "Rango de calorías",
    minCalories: "Mín",
    maxCalories: "Calorías máximas",
    noLimit: "Sin límite",
    cuisine: "Tipo de cocina",
    difficulty: "Dificultad",

    // Meal types
    mealTypes: {
      breakfast: "Desayuno",
      lunch: "Almuerzo",
      dinner: "Cena",
      snack: "Snack",
      dessert: "Postre",
    },

    // Difficulty
    difficultyEasy: "Fácil",
    difficultyMedium: "Intermedio",
    difficultyHard: "Difícil",

    // Recipe result
    ingredients: "Ingredientes",
    excluded: "excluidos",
    preparation: "Preparación",
    prepTime: "Preparación",
    cookTime: "Cocción",
    totalTime: "Total",
    optional: "opcional",

    // Nutrition
    protein: "Proteínas",
    carbs: "Carbos",
    fat: "Grasas",

    // Cost
    estimatedCost: "Costo estimado",
    perServing: "Por porción",

    // Tips & extras
    chefTips: "Tips del Chef",
    tipLabel: "Ver tip",
    storage: "Almacenamiento",
    variations: "Variaciones",

    // Actions
    regenerate: "Regenerar",
    modify: "Modificar",
    modifyDescription: "Describe los cambios que quieres hacer a la receta",
    saveRecipe: "Guardar Receta",
    discard: "Descartar",
    modifyPlaceholder:
      "Ej: Reduce las porciones a 2, sin aguacate, más picante...",
    applyChanges: "Aplicar cambios",

    // Retry errors
    retryError:
      "Tuvimos problemas al generar tu receta. Intenta de nuevo o ajusta tus filtros.",

    // Messages
    emptyPromptError: "Escribe qué quieres cocinar",
    generateError: "Error al generar la receta. Intenta de nuevo.",
    modifyError: "Error al modificar la receta",
    saveError: "Error al guardar la receta",
    savedTitle: "¡Receta guardada!",
    savedMessage: "La receta se ha guardado en tu colección",
    zodError:
      "La respuesta de la IA no tiene el formato esperado. Intenta de nuevo.",
    unknownError: "Error desconocido",

    // AI Prompt translations
    prompt: {
      systemIntro:
        "Eres CocinIA, un chef experto y asistente de cocina con IA.",
      systemTask:
        "Genera recetas detalladas y precisas basadas en la petición actual del usuario. Responde ÚNICAMENTE con un objeto JSON válido siguiendo la estructura especificada.",

      restrictionsImportant: "IMPORTANTE sobre restricciones dietéticas:",
      restrictionsRule:
        "- Si el usuario tiene ALERGIAS o RESTRICCIONES DIETÉTICAS listadas más abajo, NO uses esos ingredientes bajo ninguna circunstancia.",
      restrictionsConditional:
        "- Si NO hay alergias ni restricciones listadas, genera la receta normalmente sin modificaciones.",
      restrictionsNoAssumptions:
        "- NO asumas restricciones que no estén explícitamente indicadas.",

      descriptionRule:
        "REGLA DE DESCRIPCIÓN: Escribe una descripción breve (1 oración, máximo 15 palabras) que sea atractiva y directa. No uses frases de relleno.",

      jsonInstruction:
        "FORMATO DE RESPUESTA: Responde ÚNICAMENTE con el objeto JSON. No agregues explicaciones, comentarios ni texto adicional.",
      jsonStructure: "Estructura JSON requerida:",

      userContext: "--- CONTEXTO DEL USUARIO ---",
      country: "País",
      currency: "Moneda",
      measurementSystem: "Sistema de medidas",
      metric: "Métrico",
      imperial: "Imperial",

      allergiesWarning: "⚠️ ALERGIAS CRÍTICAS - PROHIBIDO usar",
      dietaryPreferences:
        "🔒 RESTRICCIONES DIETÉTICAS ACTIVAS - Respetar estrictamente",
      noRestrictionsActive:
        "✓ Sin restricciones dietéticas - Genera receta sin modificaciones",

      availableEquipment: "Equipamiento disponible",

      requirements: "Requisitos de la receta",
      userRequest: "Solicitud del usuario",

      useIngredients: "DEBE incluir estos ingredientes",
      excludeIngredients: "NO incluir estos ingredientes",
      mealType: "Tipo de comida",
      servings: "Porciones",
      maxTime: "Tiempo máximo de preparación",
      minutes: "minutos",
      caloriesPerServing: "calorías por porción",
      maximum: "Máximo",
      cuisineType: "Estilo de cocina",
      difficultyLabel: "Nivel de dificultad",
      difficultyLevels: {
        easy: "fácil",
        medium: "intermedio",
        hard: "difícil",
      },

      modifyRequest: "Modificación solicitada",
      currentRecipe: "Receta actual a modificar",
      returnModified: "Devuelve la receta modificada completa en formato JSON.",
    },
  },

  // ── AI Prompt translations (used by src/services/ai/*) ──
  aiPrompts: {
    // Shared
    systemIntro: "Eres CocinIA, un chef experto y asistente de cocina con IA.",
    systemTask:
      "Genera recetas detalladas y precisas basadas en la petición actual del usuario. Responde ÚNICAMENTE con un objeto JSON válido siguiendo la estructura especificada.",
    languageInstruction:
      "IDIOMA: Genera TODO el contenido en ESPAÑOL (título, descripción, ingredientes, pasos, consejos, etc.)",

    // Restrictions
    restrictionsImportant: "IMPORTANTE sobre restricciones dietéticas:",
    restrictionsRule:
      "- Si el usuario tiene ALERGIAS o RESTRICCIONES DIETÉTICAS listadas más abajo, NO uses esos ingredientes bajo ninguna circunstancia.",
    restrictionsConditional:
      "- Si NO hay alergias ni restricciones listadas, genera la receta normalmente sin modificaciones.",
    restrictionsNoAssumptions:
      "- NO asumas restricciones que no estén explícitamente indicadas.",
    allergiesWarning: "⚠️ ALERGIAS CRÍTICAS - PROHIBIDO usar",
    dietaryPreferences:
      "🔒 RESTRICCIONES DIETÉTICAS ACTIVAS - Respetar estrictamente",
    noRestrictionsActive:
      "✓ Sin restricciones dietéticas - Genera receta sin modificaciones",

    // Description & format
    descriptionRule:
      "REGLA DE DESCRIPCIÓN: Escribe una descripción breve (1 oración, máximo 15 palabras) que sea atractiva y directa. No uses frases de relleno.",
    jsonInstruction:
      "FORMATO DE RESPUESTA: Responde ÚNICAMENTE con el objeto JSON. No agregues explicaciones, comentarios ni texto adicional.",
    jsonStructure: "Estructura JSON requerida:",
    jsonDescriptionHint: "Descripción breve de máximo 15 palabras",
    jsonMealTypesNote:
      '// CRÍTICO: meal_types SOLO puede ser: "breakfast", "lunch", "dinner", "snack", "dessert"',

    // Meal types rule
    mealTypesRule: `REGLA CRÍTICA DE meal_types:
El campo "meal_types" SOLO puede contener estos valores EXACTOS (sin excepciones):
• "breakfast" - para desayunos
• "lunch" - para comidas/almuerzos (también para salsas, acompañamientos, guarniciones)
• "dinner" - para cenas (también para platos principales)
• "snack" - para meriendas, aperitivos, entrantes
• "dessert" - para postres

NO INVENTES otros valores como "side dish", "condiment", "appetizer", "main course", etc.
Si es una salsa o acompañamiento, usa "lunch" o "dinner" según cuándo se sirva.`,

    // User context
    userContext: "--- CONTEXTO DEL USUARIO ---",
    country: "País",
    currency: "Moneda",
    measurementSystem: "Sistema de medidas",
    metric: "Métrico",
    imperial: "Imperial",

    // Recipe requirements
    requirements: "Requisitos de la receta",
    userRequest: "Solicitud del usuario",
    useIngredients: "DEBE incluir estos ingredientes",
    excludeIngredients: "NO incluir estos ingredientes",
    preferFavoriteIngredients:
      "Preferir usar estos ingredientes favoritos: {{list}}",
    favoriteSelectionMode:
      "MODO VARIEDAD: Para esta generación, prioriza SOLO esta selección aleatoria de favoritos.",
    favoriteIngredientsNote:
      "IMPORTANTE: Estos son ingredientes favoritos disponibles. NO es necesario usarlos todos. Elige 1-3 ingredientes y crea combinaciones variadas entre generaciones para evitar repetir siempre los mismos.",
    mealType: "Tipo de comida",
    servings: "Porciones",
    maxTime: "Tiempo máximo de preparación",
    minutes: "minutos",
    caloriesPerServing: "calorías por porción",
    maximum: "Máximo",
    cuisineType: "Estilo de cocina",
    selectedCuisineForThisRecipe:
      "Cocina elegida para ESTA receta (selección aleatoria): {{cuisine}}",
    multipleCuisinesNote:
      "IMPORTANTE: Hay múltiples estilos de cocina seleccionados. Elige SOLO UNO para esta receta y basa toda la propuesta en ese estilo.",
    difficultyLabel: "Nivel de dificultad",
    difficultyLevels: {
      easy: "fácil",
      medium: "intermedio",
      hard: "difícil",
    },
    availableEquipment: "Equipamiento disponible",
    equipmentConstraintNote:
      "CRÍTICO: Usa únicamente este equipamiento. No propongas técnicas ni herramientas fuera de esta lista.",
    qualityStrategyTitle: "ESTRATEGIA DE CALIDAD Y VARIEDAD:",
    qualityStrategyRule1:
      "- Prioriza recetas útiles, realistas y sabrosas; evita respuestas genéricas.",
    qualityStrategyRule2:
      "- Si hay ingredientes favoritos, busca variedad de combinaciones entre ejecuciones.",
    qualityStrategyRule3:
      "- Si hay varias cocinas, elige una para esta receta y sé coherente con ese estilo.",
    qualityStrategyRule4:
      "- Respeta estrictamente alergias, restricciones dietéticas y equipamiento disponible.",

    // Modify
    modifyRequest: "Modificación solicitada",
    currentRecipe: "Receta actual a modificar",
    returnModified: "Devuelve la receta modificada completa en formato JSON.",

    // Batch cooking
    batchPreparationRules: `Tu tarea es generar {{numPreps}} PREPARACIONES BASE para batch cooking.
Estas preparaciones se cocinarán en una sesión de preparación y se almacenarán en la nevera para armar las comidas (almuerzos) de {{numDays}} días de la semana.

REGLAS:
- Genera EXACTAMENTE {{numPreps}} preparaciones base de diferentes tipos (proteína, grano/carbohidrato, salsa, vegetal, guarnición).
- Si el usuario indica ingredientes específicos (ej: "pollo y salmón"), CADA UNO debe ser una preparación base separada de tipo "protein". Genera tantas proteínas como ingredientes pida el usuario.
- Cada preparación debe poder almacenarse en la nevera al menos 4-5 días.
- Las preparaciones deben ser VERSÁTILES: poder combinarse de diferentes formas para crear platos variados.
- El tiempo TOTAL de preparación de todas las bases no debe exceder {{maxPrepTime}} minutos.
- Estrategia de reutilización: {{reuseStrategy}}.`,
    batchKeyIngredients:
      "INGREDIENTES PRINCIPALES A USAR (distribúyelos entre las preparaciones, usa TODOS): {{list}}",
    batchNotesLabel: "NOTAS DEL USUARIO PARA BATCH COOKING",
    batchNotesReinforce:
      "⚠️ IMPORTANTE: Respeta estas indicaciones del usuario para las preparaciones base: {{notes}}. Si mencionan ingredientes específicos, úsalos obligatoriamente distribuyéndolos entre las preparaciones.",
    specialNotesLabel: "NOTAS ESPECIALES",
    batchFormatInstruction:
      "FORMATO: Devuelve SOLO un JSON array. Cada objeto:",
    batchValidTypes:
      "Tipos válidos: protein, grain, sauce, vegetable, side, other. Devuelve SOLO el JSON.",

    // Weekly plan — day prompts
    wpDayTask:
      "Tu tarea es generar las recetas para UN DÍA de un plan semanal de comidas.",
    wpCalorieTarget:
      "OBJETIVO CALÓRICO DIARIO: {{calories}} calorías. Distribuye entre las comidas del día.",
    wpServings:
      "PORCIONES: Cada receta debe ser para {{count}} porción(es) individual(es).",
    wpBatchCookingMode:
      "MODO BATCH COOKING: El usuario prepara comidas de antemano. Genera recetas que se puedan preparar en lote, reutilicen ingredientes base y se almacenen bien. Estrategia de reutilización: {{strategy}}.",
    wpResponseFormat:
      "FORMATO DE RESPUESTA: Devuelve un JSON array con objetos de recetas. Cada objeto debe seguir EXACTAMENTE esta estructura:",
    wpGenerateForDay: "Genera las recetas para el {{day}}.",
    wpMealsToGenerate: "Comidas a generar: {{meals}}",
    wpCaloriesPerServingRule:
      "REGLA NUTRICIONAL CRÍTICA: Todos los valores de calorías y macros deben ser POR PORCIÓN (no por receta completa).",
    wpDailyCaloriesConsistencyRule:
      "OBJETIVO DIARIO ESTRICTO: La suma de 'estimated_calories' de las {{mealCount}} comidas del día debe aproximarse a {{calories}} kcal (margen máximo recomendado: +/-{{tolerance}} kcal). Distribuye lógicamente las calorías entre comidas.",
    wpMaxCookingTimeDetailed: "Tiempo máximo de cocina: {{details}}",
    wpMaxCookingTime:
      "Tiempo máximo de cocina por receta: {{minutes}} minutos.",
    wpTryIngredients: "Intentar usar estos ingredientes: {{list}}",
    wpRoutineMealRotation:
      "Para {{mealLabel}}, rota entre estas opciones habituales del usuario (no inventes otras a menos que se pida variedad): {{routine}}",
    wpQuickMealGuidance:
      "Para desayunos y cenas, prioriza recetas de ensamblaje rápido (≤15 min, pocos ingredientes) a menos que el usuario haya indicado lo contrario. Las comidas/almuerzos pueden ser más elaboradas.",
    wpCuisineReminder:
      "RECUERDA: Solo genera recetas de estos estilos de cocina: {{list}}",
    wpSpecialNotesReminder: "NOTAS DEL USUARIO (respétalas): {{notes}}",
    wpForbiddenIngredients:
      "⚠️ PROHIBIDO usar estos ingredientes en NINGUNA receta: {{list}}",
    wpBatchAssembly: `🍱 BATCH COOKING - COMIDA DE ENSAMBLAJE:
Para la COMIDA (lunch) de hoy, crea un PLATO DIFERENTE que se arme con las preparaciones base de la nevera.

PREPARACIONES BASE DISPONIBLES:
{{prepList}}

REGLAS ESTRICTAS DE VARIEDAD (día {{dayIndex}} de {{totalDays}}):
1. USA MÁXIMO 2-3 preparaciones base para este plato. NO uses todas.
2. ASIGNACIÓN DE HOY: Usa obligatoriamente "{{suggestedProtein}}" como proteína principal, combínala con SOLO 1-2 de las otras bases.
3. NO repitas la misma combinación ni concepto de otros días.
4. FORMATO DEL PLATO: Elige un formato DIFERENTE al de otros días. Ejemplos: tacos/burritos, ensalada, wrap, salteado/stir-fry, pasta, bowl, sándwich/torta, quesadilla, sopa, poke bowl, empanada, plato al horno.
5. La receta debe describir SOLO instrucciones de ensamblaje/calentamiento (máx 10-15 min), NO cocinar desde cero.
6. Puedes añadir 1-2 ingredientes frescos mínimos (lechuga, queso, tortilla, pan, limón, etc.).

COMBINACIONES SUGERIDAS PARA HOY:
{{suggestedCombo}}

IMPORTANTE: Si otros días ya usaron bowl/wrap/ensalada, elige un formato completamente distinto.`,
    wpAvoidRepetition:
      "EVITA repetir estos platos que ya se generaron para otros días: {{titles}}",
    wpReturnJsonOnly: "Devuelve SOLO el JSON array. No añadas explicaciones.",

    // Regenerate single meal
    wpRegenMealInstruction:
      "Genera una receta para el {{meal}} del {{day}}. Tiempo máximo: {{minutes}} min.",
    wpDoNotRepeat: "NO repitas: {{titles}}",
  },
};
