from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from .routes import api_bp

# Load environment variables from .env file
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for React frontend
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    host = os.getenv('FLASK_HOST', 'localhost')
    app.run(debug=debug, port=port, host=host)

