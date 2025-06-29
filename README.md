# Sehat AI: Your Voice-First Post-Operative Care Assistant

## Revolutionizing Recovery with Intelligent AI

Sehat AI is an innovative, voice-first healthcare platform designed to provide comprehensive and personalized post-operative care. Our mission is to empower patients in their recovery journey by offering intelligent assistance, seamless communication with healthcare providers, and proactive health management, all through an intuitive and accessible interface.

## The Problem We Solve

Post-operative recovery can be a challenging and often isolating period for patients. They face difficulties in managing medication schedules, adhering to exercise routines, understanding complex medical reports, and knowing when to seek urgent help. Healthcare providers, on the other hand, struggle with efficiently monitoring patient progress, providing timely support, and managing a high volume of patient inquiries. Sehat AI bridges this gap by bringing advanced AI and voice technology directly to the patient, while providing doctors with powerful monitoring and analytical tools.

## Core Features

*   **AI-Powered Medical Report Analysis:**
    *   Patients can upload PDF or image medical reports.
    *   AI analyzes reports, extracts key details (symptoms, diagnosis, recommendations), and generates a clear, legally-formatted text summary.
    *   Reports can be saved to the patient's portal for future reference and downloaded as PDFs.
    *   Healthcare providers can securely view analyzed reports for their patients.
*   **Voice-First Interaction:**
    *   Intuitive voice commands for navigation, task management, and health inquiries.
    *   Voice-guided exercise sessions and personalized health advice.
    *   Multilingual support (English and Hindi).
*   **Personalized Recovery Task Management:**
    *   Daily recovery tasks (medication, exercises, appointments) are displayed and can be marked as complete via voice or touch.
    *   Tasks can be toggled (marked complete/incomplete) for flexibility.
*   **Emergency Alert System:**
    *   Voice-activated emergency trigger to alert pre-registered family members and medical contacts.
    *   Automatic sharing of live location during emergencies.
    *   Direct calling options for ambulance, family, and hospital.
*   **Health Intelligence Dashboard:**
    *   AI-driven health score and predictive risk analysis based on patient metrics.
    *   Personalized AI recommendations for improving health and recovery.
    *   Visual health trends and progress graphs (pain, mobility, compliance) with simulated historical data.
*   **Interactive Calendar for Appointments:**
    *   Manage and view upcoming appointments.
    *   Ability to create, update, and delete appointments.
    *   Seamless integration for rescheduling calls directly from the calendar.
*   **Exercise Guidance with Video Demonstrations:**
    *   Personalized exercise plans with detailed instructions.
    *   Embedded YouTube videos for clear visual demonstrations of each exercise.
*   **"Ask AI" Chat:**
    *   Direct chat interface for patients to ask health-related questions to the AI.
    *   Ability to save AI-generated recommendations directly as recovery tasks.
*   **Secure User Authentication:**
    *   Supports Google and GitHub authentication for secure access.
    *   Guest mode for quick exploration.
*   **Provider Dashboard:**
    *   Overview of active alerts and patient monitoring.
    *   Access to patient medical reports and call history.

## Technology Used

*   **Frontend:**
    *   [React](https://react.dev/) (JavaScript library for building user interfaces)
    *   [TypeScript](https://www.typescriptlang.org/) (Superset of JavaScript for type safety)
    *   [Vite](https://vitejs.dev/) (Fast build tool for modern web projects)
    *   [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
    *   [Framer Motion](https://www.framer.com/motion/) (Animation library for React)
    *   [Recharts](https://recharts.org/) (Composable charting library built with React and D3)
    *   [date-fns](https://date-fns.org/) (Modern JavaScript date utility library)
*   **Backend & Database:**
    *   [Firebase](https://firebase.google.com/) (Authentication, Firestore NoSQL database)
*   **AI/ML Integration:**
    *   Multi-AI Model Consensus (integrates with APIs from):
        *   OpenAI (GPT-4o)
        *   Google Gemini (Gemini 1.5 Pro Vision)
        *   Groq (Llama 3.1, Llama 3.2 Vision)
        *   OpenRouter (for various models like Claude 3.5 Sonnet)
        *   Hugging Face (various open-source models)
*   **Voice Interaction:**
    *   OmniDimension Voice Service (custom voice processing and command handling)

## Demo

A live demo of Sehat AI will be available soon!
[Demo VIDEO Link Here]
(https://drive.google.com/drive/folders/177aN5W8P6yNWKqanKPzjYukAzDDPKR16?usp=drive_link)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

*   [Git](https://git-scm.com/)
*   [Node.js](https://nodejs.org/en/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js) or [Yarn](https://yarnpkg.com/)
*   A [Firebase Project](https://firebase.google.com/) with Firestore and Authentication enabled.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url> # Replace with your actual repository URL
    cd POAI
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or if you use yarn
    # yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project directory (`POAI/.env`) and add your Firebase configuration and AI API keys. Replace the placeholder values with your actual credentials.

    ```
    # Firebase Configuration (from your Firebase project settings)
    VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    VITE_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"

    # AI API Keys (obtain from respective AI provider dashboards)
    VITE_OPENAI_API_KEY="sk-your-openai-api-key-here"
    VITE_GEMINI_API_KEY="your-gemini-api-key-here"
    VITE_GROQ_API_KEY="gsk_your-groq-api-key-here"
    VITE_OPENROUTER_API_KEY="sk-or-your-openrouter-api-key-here"
    VITE_HUGGINGFACE_API_KEY="hf_your-huggingface-api-key-here"
    ```
    **Note:** The `VITE_GEMINI_API_v2_KEY` you provided earlier is not directly used in the current `enhancedAIAnalysisService.ts` setup, but you can keep it in your `.env` file for future extensions.

4.  **Run the application:**
    ```bash
    npm run dev
    # or if you use yarn
    # yarn dev
    ```
    The application will open in your browser, usually at `http://localhost:5173`.

5.  **Build for production:**
    ```bash
    npm run build
    # or if you use yarn
    # yarn build
    ```
    This will create a `dist` folder with the production-ready build.

## Contributing

We welcome contributions to Sehat AI! If you have suggestions for improvements, bug fixes, or new features, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
