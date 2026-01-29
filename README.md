# 🍳 CocinIA

**Your AI-powered personal cooking assistant**

CocinIA is a mobile meal planning and recipe generation app that uses AI to help you maintain a healthy and organized diet without spending excessive time on planning.

---

## 📱 About the Project

### Problem It Solves

| User Problem | cocinIA Solution |
|--------------|------------------|
| "I don't know what to cook today" | AI-powered recipe generator with simple input |
| "I don't have time to plan the week" | Automatic weekly planner adapted to your life |
| "I always buy too many ingredients or miss some" | Smart auto-generated shopping list |
| "Ingredients go bad before I use them" | Digital pantry with tracking |
| "Cooking every day is exhausting" | Batch Cooking mode that optimizes cooking sessions |
| "Recipes I find don't fit my needs" | Personalized recipes based on restrictions, time, and preferences |

### Target Users

- **Primary**: Adults 25-45 years old with busy lives who want to eat healthy
- **Secondary**: Families organizing meals for multiple members, people with dietary restrictions
- **Tertiary**: People starting to cook, users with specific nutritional goals

---

## 🚀 Key Features (MVP)

### 1. 🤖 AI Recipe Generator
- Simple or advanced input with customizable filters
- Recipe generation adapted to your preferences and restrictions
- Nutritional information and estimated cost
- Editing and regeneration with specific changes

### 2. 📅 Weekly Planner
- Flexible configuration of days and meals
- Batch Cooking mode to cook in one session
- Adaptation to external meals (restaurants, events)
- History and duplication of previous plans

### 3. 🛒 Smart Shopping List
- Automatic generation from recipes or weekly plans
- Intelligent ingredient aggregation
- Cost estimation per product
- Share list via WhatsApp or other apps

### 4. 🏠 Digital Pantry
- Inventory of available ingredients
- Alerts for products about to expire
- Recipe suggestions based on your pantry

### 5. 📚 Personal Recipe Book
- Storage of favorite recipes
- Advanced filters and search
- Quick access to add to plans

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **React Native** - Cross-platform framework
- **Expo SDK 52+** - Development platform
- **TypeScript** - Static typing
- **Expo Router** - File-based routing
- **NativeWind 4** - Tailwind CSS for React Native
- **Zustand** - Global UI state
- **TanStack Query** - Server state and caching
- **Zod** - Validation and schemas
- **React Native Paper** - Material Design UI components

### Backend
- **Supabase** - Backend as a Service (PostgreSQL, Auth, Storage)
- **OpenAI API (GPT-4)** - AI recipe generation

---

## 📦 Installation and Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- [Supabase](https://supabase.com) account
- [OpenAI](https://platform.openai.com) account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cocinIA.git
   cd cocinIA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root with the following variables:

   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # OpenAI Configuration
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-openai-key-here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   Or with cleared cache:
   ```bash
   npx expo start -c
   ```

---

## 📱 Available Commands

```bash
# Development
npm start              # Start development server
npm run android        # Open on Android emulator/device
npm run ios           # Open on iOS simulator (macOS only)
npm run web           # Open in web browser

# Cleanup
npx expo start -c     # Start with cleared cache
```

---

## 🏗️ Project Structure

```
cocinIA/
├── app/                              # Expo Router (file-based routing)
│   ├── (auth)/                       # Authentication routes (not authenticated)
│   │   ├── login.tsx
│   │   └── onboarding/
│   ├── (main)/                       # Main app (authenticated)
│   │   ├── index.tsx                 # Home
│   │   ├── recipes/
│   │   ├── planner/
│   │   ├── shopping/
│   │   ├── pantry/
│   │   └── profile/
│   └── _layout.tsx                   # Root layout
├── src/
│   ├── components/                   # React components
│   │   ├── ui/                       # Reusable UI components
│   │   ├── recipes/
│   │   ├── planner/
│   │   └── shared/
│   ├── lib/                          # Configuration files
│   │   ├── supabase.ts
│   │   └── openai.ts
│   ├── hooks/                        # Custom React hooks
│   ├── stores/                       # Zustand stores (UI state only)
│   ├── services/                     # Business logic
│   ├── schemas/                      # Zod validation schemas
│   ├── constants/
│   └── types/
├── assets/
├── supabase/                         # Database migrations
├── global.css
├── tailwind.config.js
├── .env
└── package.json
```

---

## 🤝 Contributing

This is a personal project in development. If you have suggestions or find bugs, feel free to open an issue.

---

## 📄 License

[MIT](LICENSE) - Open source project

---

## 👨‍💻 Author

Built with ❤️

---

## 📞 Support

If you need help with setup:

1. Review the [Installation and Setup](#-installation-and-setup) section
2. Make sure you have the correct versions of Node.js and npm
3. Clear cache with `npx expo start -c`
4. Verify your `.env` file is in the project root

---

**Bon appétit! 🍽️**
