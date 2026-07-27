# SmartCart AI Recommendation System

This project provides AI-powered product recommendations
based on user preferences and shopping behavior.

## Future Improvements

- Add payment integration
- Improve product recommendation accuracy
- Add admin dashboard
- Add order tracking

## Setup Instructions

Follow these steps to run the project locally.

### 1. Clone the repository
\`\`\`
git clone https://github.com/riya-dumbare/SmartCart-AI-Recommendation-System.git
cd SmartCart-AI-Recommendation-System
\`\`\`

### 2. Install backend dependencies
\`\`\`
cd Backend
pip install -r requirements.txt
\`\`\`

### 3. Configure environment variables
Copy the example env file and fill in your own values:
\`\`\`
cp .env.example .env
\`\`\`
Then open `.env` and set:
- `MYSQL_HOST`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DB`
- `SECRET_KEY`

### 4. Set up the database
Import the schema into MySQL:
\`\`\`
mysql -u root -p smartcart < ../Database/SmartCart.sql
\`\`\`
(Create the `smartcart` database first if it doesn't already exist.)

### 5. Run the backend
\`\`\`
python app.py
\`\`\`
The server will start at `http://127.0.0.1:5000/`.

### 6. Open the frontend
Open `Frontend/index.html` in your browser.

## Tech Stack

- **Backend:** Python, Flask
- **Database:** MySQL
- **Frontend:** HTML, CSS, JavaScript
- **ML:** scikit-learn, pandas (cosine similarity for recommendations)
