# 🧠 PromptLab AI
### The Intelligent Prompt Engineering Studio

**Create Smarter Prompts. Generate Better AI Results.**

PromptLab AI is a modern, AI-powered web application designed to help users create, optimize, analyze, and compare prompts across multiple artificial intelligence models.

Featuring an immersive 3D interface, interactive AI playground, intelligent prompt optimization, and multi-model comparison, PromptLab AI aims to make prompt engineering more accessible, efficient, and effective.

> **Project Status:** Under Development — Features and integrations described below represent the intended application scope. Update this status as features are implemented and tested.

---

## ✨ Key Features

### 🤖 AI Prompt Playground
- Generate AI responses using real language models.
- Experiment with different prompts and instructions.
- Configure supported model parameters.
- Copy, regenerate, and save responses.
- View responses in a clean, interactive interface.

### 🪄 Intelligent Prompt Optimizer
- Transform basic prompts into structured instructions.
- Improve clarity, context, and specificity.
- Compare original and optimized prompts.
- Receive AI-generated improvement suggestions.

### ⚡ Multi-Model AI Comparison
- Google Gemini
- Groq-powered language models
- OpenRouter-supported models

Compare AI-generated responses, execution times, and available usage metrics in one workspace.

### 🧪 Prompt Engineering Techniques
Explore practical prompting techniques, including:

- Zero-shot prompting
- Few-shot prompting
- Role-based prompting
- Task decomposition
- Structured prompting
- Prompt chaining
- Iterative prompt refinement

### 📚 Prompt Library
- Save and organize reusable prompts.
- Explore categorized prompt templates.
- Search, edit, and manage saved prompts.
- Build a personal prompt collection.

### 📊 Analytics Dashboard
- Track prompt activity.
- Monitor model usage.
- Review optimization history.
- Visualize available performance metrics.

### 🌐 Premium 3D User Interface
- Interactive 3D AI orb
- Dark violet Bento Grid design
- Liquid Glass-inspired components
- Smooth hover and scroll animations
- Responsive layouts for desktop, tablet, and mobile
- Performance-aware visual effects

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| 3D Graphics | Three.js, React Three Fiber, Drei |
| Animations | GSAP, Motion for React |
| AI Integration | Google Gemini, Groq, OpenRouter |
| Backend | Next.js Route Handlers |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Data Visualization | Recharts |
| Icons | Lucide React |
| Version Control | Git, GitHub |
| Deployment | Vercel |

*Note: This is the planned technology stack. Confirm the installed dependencies against the actual repository before marking all integrations as implemented.*

---

## 🏗️ System Architecture

```text
                  ┌─────────────────────┐
                  │        User         │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Next.js Frontend   │
                  │  Responsive UI      │
                  │  3D AI Workspace    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Next.js Backend    │
                  │  API Route Handlers │
                  └──────────┬──────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
          ┌──────────┐ ┌──────────┐ ┌────────────┐
          │ Gemini   │ │ Groq API │ │ OpenRouter │
          │ API      │ │          │ │ API        │
          └──────────┘ └──────────┘ └────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Response Processing │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Results Dashboard   │
                  └─────────────────────┘

          Supabase Auth + PostgreSQL
          User accounts, saved prompts,
          history, and analytics
```

---

## 📁 Project Structure

Proposed Next.js App Router structure:

```text
promptlab-ai/
│
├── public/
│   ├── images/
│   └── models/
│
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   │
│   │   ├── dashboard/
│   │   ├── playground/
│   │   ├── optimizer/
│   │   ├── compare/
│   │   ├── techniques/
│   │   ├── library/
│   │   ├── analytics/
│   │   └── api/
│   │       └── ai/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── three/
│   │   └── dashboard/
│   │
│   ├── lib/
│   │   ├── ai/
│   │   ├── supabase/
│   │   └── utils.ts
│   │
│   └── types/
│
├── .env.example
├── .gitignore
├── README.md
├── audit.md
├── Space.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

The actual folder structure may differ depending on implementation.

---

## 🚀 Getting Started

### Prerequisites

Install the following:

- Node.js (current LTS version)
- npm
- Git
- Visual Studio Code or another editor

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/promptlab-ai.git
```

Navigate to the project directory:

```bash
cd promptlab-ai
```

Replace `YOUR_USERNAME` with the actual repository owner.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory.

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Only configure the variables required by the implemented features. Variable names must match the application's actual code.

**Security:** Never commit `.env.local`, private API keys, or service-role credentials to GitHub. Keep privileged Supabase credentials server-side.

### 4. Run the Development Server

```bash
npm run dev
```

Open:

http://localhost:3000

### 5. Build for Production

```bash
npm run build
```

To start the production server locally:

```bash
npm run start
```

---

## 🔐 API Integration

PromptLab AI is designed to support multiple AI providers.

| Provider | Purpose |
|---|---|
| Google Gemini | Prompt generation, optimization, analysis |
| Groq | Fast AI inference and comparison |
| OpenRouter | Access to additional supported AI models |
| Supabase | Authentication and data persistence |

### API Security

- API requests containing secret credentials are handled server-side.
- Environment variables are used to protect API keys.
- Input validation and request limits should be enforced.
- Provider failures should be handled gracefully.
- User-specific data should be protected using authentication and Row Level Security.

API integrations require valid credentials, supported models, and available provider quotas.

---

## 🎨 UI/UX Design

PromptLab AI uses a futuristic Bento Grid interface inspired by modern premium SaaS applications.

### Design Highlights

- Midnight navy background
- Purple and indigo gradient cards
- Interactive multicolor 3D AI orb
- Glassmorphic components
- Neon-accented interactive buttons
- Animated feature cards
- Clean typography
- Responsive layouts
- Smooth navigation transitions

The interface is designed to deliver a visually engaging experience while maintaining accessibility and usability.

---

## 🌍 Deployment on Vercel

1. Push the project to GitHub.
2. Visit https://vercel.com.
3. Select **Add New Project**.
4. Import the GitHub repository.
5. Configure the required environment variables.
6. Verify the framework and build settings.
7. Click **Deploy**.
8. Test the generated production URL.

### Live Website

**Live Demo:** Add your verified Vercel deployment URL here.

**GitHub Repository:** Add your actual repository URL here.

---

## 🧪 Testing & Quality Assurance

The following areas should be tested before final submission:

- Responsive layouts on mobile, tablet, and desktop
- AI prompt generation
- Prompt optimization
- Multi-model comparison
- API error handling
- Authentication
- Prompt history and persistence
- Navigation and interactions
- 3D animation performance
- Keyboard accessibility
- Production deployment

Record actual test results, unresolved issues, and security checks in `audit.md`.

---

## 🎓 Academic Project Information

**Project Title:** PromptLab AI — Intelligent Prompt Engineering Studio

**Project Type:** Prompt Engineering Capstone Project

**Student:** Neel Sharma

**Institution:** JECRC University

**Course:** Prompt Engineering

**Project Objective:**

To design and develop an AI-powered web application that demonstrates practical prompt engineering techniques, improves prompt quality, and enables users to experiment with multiple AI models through a unified interactive interface.

### Learning Outcomes

- Practical application of prompt engineering
- AI API integration
- Full-stack web development
- Responsive UI/UX design
- Git and GitHub collaboration
- API security
- Cloud deployment
- System architecture documentation

---

## 📋 Capstone Deliverables

- [ ] Functional web application
- [ ] GitHub repository with source code
- [ ] README.md documentation
- [ ] audit.md testing and security report
- [ ] Space.md project documentation and evidence
- [ ] Feature branch and Pull Request
- [ ] Working AI API integration
- [ ] Secure environment variable configuration
- [ ] Vercel production deployment
- [ ] Six-slide system design presentation
- [ ] Actual screenshots and verified links

---

## 🔮 Future Enhancements

- AI-powered prompt recommendations
- Collaborative prompt workspaces
- Prompt version control
- Advanced prompt evaluation
- More AI model providers
- Multilingual prompt optimization
- Prompt export and sharing
- Additional performance analytics

---

## 👨‍💻 Author

**Neel Sharma**

B.Tech — Computer Science & Engineering (AI & ML)

JECRC University

**GitHub:** Add your GitHub profile URL

**LinkedIn:** Add your LinkedIn profile URL

---

## 📄 License

License not yet specified. Add a `LICENSE` file if you decide to release the project under an open-source license.

---

**PromptLab AI — Engineering Better Prompts for Smarter AI.**
