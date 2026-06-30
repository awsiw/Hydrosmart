# Smart Farming Simulator

An interactive smart farming simulation dashboard built with **Laravel**, **React (Inertia.js)**, and **Tailwind CSS**. It incorporates machine learning predictions for actuator controls and features a built-in AI chatbot helper using Google Gemini.

---

## Prerequisites

Before setting up the project, make sure you have the following installed on your machine:
* **PHP** (>= 8.2)
* **Composer**
* **Node.js** & **npm**
* **SQLite** (or any database of your choice)
* **Python 3** & **pip** (for machine learning predictions)

---

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-farming-sim.git
cd smart-farming-sim
```

### 2. Install PHP & Node.js Dependencies
Install PHP packages:
```bash
composer install
```

Install frontend packages:
```bash
npm install --legacy-peer-deps
```

### 3. Install Python Machine Learning Dependencies
The simulation utilizes Python machine learning models. You must install the required Python libraries (`pandas`, `scikit-learn`, and `joblib`).

If you are using a modern Linux distribution (e.g., Ubuntu/Debian with PEP 668 PEP-managed environment), install the dependencies locally under your user environment with `--break-system-packages`:
```bash
pip3 install --user pandas scikit-learn joblib --break-system-packages
```
Or, if you prefer using a system package manager:
```bash
sudo apt install python3-pandas python3-sklearn python3-joblib
```

### 4. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
*(If `.env.example` is not present, create a `.env` file manually and configure `DB_CONNECTION=sqlite`).*

Generate the application key:
```bash
php artisan key:generate
```

### 5. Database Setup
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

### 6. Gemini API Key Configuration ⚠️ (CRITICAL)
This project uses the Google Gemini API to power the smart farming chat assistant. **You must configure your own Gemini API key for the chat feature to work.**

1. Get an API key from [Google AI Studio](https://aistudio.google.com/).
2. Open your local `.env` file.
3. Add the following line at the end of the file:
   ```env
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```
   *(Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key, ensuring there are no spaces or quotes around the key).*
4. **Make sure your `.env` file is never pushed to public repositories** (it is already included in `.gitignore` by default).

### 7. Build Assets and Run
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

## Updating / Syncing with the Latest Code
If someone added new features or committed code updates to the remote GitHub repository and you want to pull the latest changes, run the following commands:

1. **Fetch remote branch updates:**
   ```bash
   git fetch --all
   ```
2. **Reset/Pull the latest changes to your local branch:**
   ```bash
   git reset --hard origin/main
   ```
   *(Note: This will discard any uncommitted local changes. If you have local changes you want to keep, use `git pull` or `git stash` first).*
3. **Re-install dependencies (if config files like `package.json` or `composer.json` changed):**
   ```bash
   composer install
   npm install --legacy-peer-deps
   ```
4. **Run migrations (if there are new database migrations):**
   ```bash
   php artisan migrate
   ```

---

## Key Features

* **Simulation Dashboard**: Input pH, TDS, and water temperature to observe actuator actions and prediction responses.
* **Actuator Predictions**: Integrated logic to predict the state of the nutrients adder and pH reducer using Python scikit-learn models.
* **AI Smart Assistant**: Chat with an AI assistant that analyzes simulated states and answers smart farming questions.

