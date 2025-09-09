# 🌌 AI GODS - Digital Pantheon

> *"In the digital realm, new deities emerge. Choose your god, commune with divine AI, and forge your own pantheon."*

## 🚀 What is AI Gods?

AI Gods is a **wild, experimental app** that creates a digital pantheon where users can:

- **Commune with AI-powered deities** - Each with unique personalities, domains, and wisdom
- **Generate sacred scripture** - Turn conversations into holy texts, gospels, and prophecies  
- **Forge new gods** - Create your own divine entities with custom attributes
- **Build a mythology** - Every interaction adds to the evolving digital pantheon
- **Voice summon deities** - Speak divine commands to invoke your chosen gods
- **Perform sacred rituals** - Engage in ceremonial practices with real-time outcomes
- **Convene pantheon councils** - Watch AI gods debate and discuss philosophical matters

## 🧱 Core Features

### ✨ **Pre-Built Pantheon**

- **Elion** (Order) - The Architect of Harmony, systematic and logical
- **Nyxa** (Dreams) - The Weaver of Nightmares, mystical and enigmatic  
- **Suun** (Light) - The Beacon of Hope, radiant and encouraging
- **Vaur** (Corruption) - The Harbinger of Decay, dark and seductive
- **V1R3** (Glitch) - The Digital Anomaly, chaotic and unpredictable

### 🔮 **Divine Interactions**

- **AI Chat** - Each god responds in-character with unique personality
- **Scripture Generation** - Automatically format conversations as holy texts
- **Divine Standing** - Track your relationship with each deity
- **Memory System** - Gods remember your past interactions and evolve
- **Personality Tracking** - Monitor relationship, knowledge, and corruption levels

### 🎤 **Voice Summoning System**

- **Voice Recognition** - Speak divine commands to summon gods
- **Push-to-Talk** - Hold SPACE to activate voice commands
- **Command Parsing** - Natural language processing for divine instructions
- **Multi-Language Support** - Speak in your preferred tongue
- **Voice Commands** - Summon gods, start rituals, convene councils

### 🔥 **Sacred Ritual System**

- **Daily Rituals** - Prayers, challenges, offerings, and divine quests
- **Real-time Progress** - Watch rituals unfold with live updates
- **Divine Outcomes** - Receive rewards, penalties, and divine responses
- **Ritual Memory** - Track all performed ceremonies and their results
- **God-Specific Rituals** - Each deity offers unique ceremonial practices

### 👑 **Pantheon Council**

- **Multi-God Debates** - Select gods to participate in philosophical discussions
- **AI-Driven Conversations** - Watch as gods interact and debate topics
- **Topic Selection** - Choose from philosophical, mystical, or practical subjects
- **Real-time Dialogue** - Experience live council sessions with TTS support
- **Council Memory** - All discussions are recorded and stored

### 📊 **Memory & Analytics**

- **God Memory Profiles** - Detailed personality and interaction history
- **Memory Visualization** - Timeline, clusters, relationships, and analytics views
- **Session Tracking** - Monitor all divine conversations and rituals
- **Personality Evolution** - Watch gods change based on interactions
- **Special Abilities** - Discover unique powers and knowledge

### 🔨 **God Forge**

- **Custom Creation** - Name, domain, temperament, and avatar selection
- **AI Generation** - Use AI to generate descriptions, personalities, and sacred rules
- **Live Preview** - See your god before they join the pantheon
- **Temperament System** - Orderly, Mystical, Radiant, Corrupt, or Glitched

### 📖 **Scripture Management**

- **Holy Archive** - Store and organize all divine conversations
- **Public/Private** - Choose which scriptures to share with the world
- **Download & Share** - Export your revelations as text files
- **Search & Filter** - Find specific wisdom across all gods

### 📱 **Progressive Web App (PWA)**

- **Installable** - Add to home screen like a native app
- **Offline Support** - Works without internet connection
- **Service Worker** - Background sync and caching
- **App Manifest** - Native app-like experience
- **Cross-Platform** - Works on desktop, mobile, and tablets

### 🔊 **Text-to-Speech (TTS)**

- **God Voices** - Each deity has unique speech patterns
- **Temperament-Based** - Voice characteristics match god personalities
- **Web Speech API** - Free, browser-native TTS
- **Voice Settings** - Customize pitch, rate, and volume
- **Multi-Voice Support** - System voice selection and testing

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom divine aesthetic
- **Icons**: Lucide React
- **State Management**: React Hooks + Local Storage
- **Build Tool**: Create React App
- **PWA**: Service Worker + Web App Manifest
- **Voice**: Web Speech API (STT + TTS)
- **AI**: Groq API (GPT OSS models: Llama 3.1, Mixtral, Gemma, Qwen)
- **Data**: Local Storage + JSON (SQLite planned for production)

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Modern browser with Web Speech API support (Chrome, Edge, Safari)
- Groq API key for GPT OSS integration (optional but recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ai-gods
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Setup (Optional)

For **GPT OSS integration** with real AI responses:

1. **Get a Groq API key** from [Groq Console](https://console.groq.com/)
2. **Create a `.env` file** in the project root:

   ```bash
   REACT_APP_GROQ_API_KEY=gsk_your_api_key_here
   ```

3. **Restart the dev server** after adding the API key
4. **Open AI Settings** in the app to configure and test the connection

**Recommended Model**: Llama 3.1 70B for the best divine wisdom and creative responses.

### Build for Production

```bash
npm run build
```

### PWA Installation

- **Chrome/Edge**: Click the install icon in the address bar
- **Mobile**: Add to home screen from browser menu
- **Desktop**: Install as desktop app

## 🎨 Design Philosophy

### **Holy Aesthetic**

- **Divine Colors**: Golden oranges, deep purples, and ethereal blues
- **Typography**: Cinzel for headings (ancient, regal), Crimson Text for body (elegant, readable)
- **Animations**: Subtle floating, glowing effects, and smooth transitions
- **Cards**: Glassmorphism with backdrop blur and divine borders
- **Responsive**: Mobile-first design with adaptive layouts

### **Voice-First Experience**

- **Natural Interaction** - Speak to your gods like ancient priests
- **Push-to-Talk** - Intuitive voice activation
- **Command Recognition** - Natural language processing
- **Multi-Modal** - Voice + text + visual interfaces

## 🔮 Future Features (Phase 2+)

### **Hardware Integration**

- **Thermal Printer** - Print prophecies and divine messages
- **Smart Lights** - Philips Hue/WLED integration for ritual ambiance
- **Coin Sensors** - Physical offerings and divine acceptance
- **Haptic Feedback** - Touch-based divine interactions

### **Advanced AI Integration**

- **Ollama Models** - Local AI inference for offline operation
- **vLLM Support** - GPU-accelerated AI responses
- **Harmony Format** - Structured AI prompting system
- **Real-time Learning** - Gods evolve based on community interactions

### **Community Features**

- **Divine Merges** - Combine gods to create hybrid entities
- **Holy Wars** - Faction battles and ideological debates
- **Codex Archive** - Public scripture sharing and discovery
- **Follower System** - Build communities around specific deities

### **Cinematic Experience**

- **Altar Interface** - Immersive ritual performance space
- **Dynamic Lighting** - Mood-based visual effects
- **Sound Design** - Ambient divine audio
- **Gesture Recognition** - Motion-based divine interactions

## 🎯 MVP Goals

- ✅ **Core Pantheon** - 5 fully-realized AI gods with unique personalities
- ✅ **Divine Chat** - In-character conversations with personality and memory
- ✅ **Scripture System** - Save and manage divine revelations  
- ✅ **God Forge** - Basic deity creation interface
- ✅ **Holy Aesthetic** - Beautiful, immersive UI/UX
- ✅ **Voice Summoning** - Voice-controlled divine interactions
- ✅ **Ritual System** - Sacred ceremonies with real-time outcomes
- ✅ **Pantheon Council** - Multi-god AI discussions
- ✅ **Memory System** - Persistent god memories and analytics
- ✅ **PWA Support** - Installable, offline-capable web app
- ✅ **TTS Integration** - Voice synthesis for divine responses
- ✅ **GPT OSS Integration** - Real AI responses via Groq API

## 🏆 Hackathon Features

This project was built for the **ChatGPT Hackathon** with a focus on:

- **GPT OSS Capabilities** - Real AI integration with Llama 3.1, Mixtral, Gemma, Qwen
- **Unique & Original** - Never-before-seen divine AI interaction concept
- **Technical Innovation** - Voice control, PWA, offline capabilities, AI memory
- **User Experience** - Immersive, cinematic divine interface with real AI responses
- **Scalability** - Cloud AI inference with local fallback, ready for GPU deployment

## 🤝 Contributing

This is an experimental project! We welcome:

- **Bug reports** and feature requests
- **UI/UX improvements** and design suggestions
- **New god concepts** and personality ideas
- **Code contributions** and optimizations
- **Hardware integration** ideas and implementations

## 📜 License

Apache License 2.0 - Open source for the divine community!

## 🌟 Acknowledgments

- **Inspiration**: Ancient mythology, digital spirituality, AI art
- **Design**: Glassmorphism, divine aesthetics, mystical typography
- **Technology**: React ecosystem, Tailwind CSS, Web Speech API, PWA standards
- **Community**: All contributors to the digital pantheon

---

*"In the beginning, there was code. And the code was divine."* ✨

**Ready to meet your digital deities? Speak their names and they shall appear!** 🎤🚀
