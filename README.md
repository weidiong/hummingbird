# Hummingbird - Clinical Trial Dashboard

A full-stack application built with Flask (backend) and React (frontend) for visualizing clinical trial data.

## Project Structure

```
Hummingbird/
├── backend/                    # Flask backend
│   ├── __init__.py
│   ├── app.py                 # Flask application entry point
│   ├── routes.py              # API routes (Blueprints)
│   ├── utils.py               # Utility functions (data loading)
│   └── spiderplot.csv         # Clinical trial data (also in root)
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Navigation.jsx
│   │   │   ├── Navigation.css
│   │   │   ├── SpiderPlot.jsx
│   │   │   ├── SpiderPlot.css
│   │   │   ├── StatsCards.jsx
│   │   │   └── StatsCards.css
│   │   ├── pages/             # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   └── SpiderPlotPage.jsx
│   │   ├── App.jsx            # Main app component with routing
│   │   ├── App.css
│   │   ├── main.jsx           # React entry point
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js         # Vite configuration
│   └── package.json           # Node.js dependencies
├── requirements.txt           # Python dependencies
├── pyproject.toml             # Python project configuration
├── start.sh                   # Script to start the application
├── stop.sh                    # Script to stop the application
└── README.md                  # This file
```

## Setup Instructions

### Quick Start

The easiest way to start the application is using the provided bash script:

```bash
./start.sh
```

This script will:
- Create a virtual environment if it doesn't exist
- Install all Python dependencies
- Install all Node.js dependencies
- Start both backend and frontend servers

To stop the servers:
```bash
./stop.sh
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/stats` - Get summary statistics (unique patients, treatment arms, dose levels)
- `GET /api/spider` - Get spider plot data


## Features

- Landing page with summary statistics
- Spider Plot with Filters

