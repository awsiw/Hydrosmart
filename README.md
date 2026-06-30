# Smart Farming Simulator

An interactive smart farming simulation dashboard built with **Laravel**, **React (Inertia.js)**, and **Tailwind CSS**. It incorporates machine learning predictions for actuator controls and features a built-in AI chatbot helper using Google Gemini.

---

## Prerequisites

Before setting up the project, make sure you have the following installed on your machine:
* **PHP** (>= 8.2)
* **Composer**
* **Node.js** & **npm**
* **SQLite** (or any database of your choice)

---

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-farming-sim.git
cd smart-farming-sim
```

### 2. Install Dependencies
Install PHP packages:
```bash
composer install
```

Install frontend packages:
```bash
npm install
```

### 3. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
Generate the application key:
```bash
php artisan key:generate
```

### 4. Database Setup
The project uses SQLite by default. To initialize the database:
1. Make sure your `.env` file has `DB_CONNECTION=sqlite` configured.
2. Create the SQLite database file:
   ```bash
   touch database/database.sqlite
   ```
3. Run the migrations:
   ```bash
   php artisan migrate
   ```

### 5. Gemini API Key Configuration ⚠️ (CRITICAL)
This project uses the Google Gemini API to power the smart farming chat assistant. **You must set up your own Gemini API key for the chat feature to work.**

1. Get an API key from [Google AI Studio](https://aistudio.google.com/).
2. Create a file named `geminiapi.txt` in the **root directory** of this project.
3. Paste your Gemini API key into the file:
   ```text
   YOUR_GEMINI_API_KEY_HERE
   ```
   *(Make sure there are no other characters or spaces around the key).*
4. **Ensure `geminiapi.txt` is added to your `.gitignore` file** before pushing your code to GitHub to avoid leaking your credentials!

### 6. Build Assets and Run
Compile the frontend assets:
```bash
npm run build
```

Start the local server:
```bash
php artisan serve
```
Open your browser and navigate to `http://127.0.0.1:8000`.

---

## Key Features

* **Simulation Dashboard**: Input pH, TDS, and water temperature to observe actuator actions and prediction responses.
* **Actuator Predictions**: Integrated logic to predict the state of the nutrients adder and pH reducer.
* **AI Smart Assistant**: Chat with an AI assistant that analyzes simulated states and answers smart farming questions.
