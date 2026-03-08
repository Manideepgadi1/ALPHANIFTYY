"""
Alphanifty Backend - Initialization and Configuration
This file sets up the Flask app with all extensions and configurations
"""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 hours
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 2592000  # 30 days
    
    # Database configuration
    database_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:VSFintech2026@127.0.0.1:5432/alphanifty')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    # Email configuration
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', 'Alphanifty <vsfintech@gmail.com>')
    
    # Debug mode
    app.config['DEBUG'] = os.environ.get('DEBUG', 'False') == 'True'
    
    # Initialize extensions
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://localhost:5174",
                "https://app.vsfintech.in"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Range", "X-Content-Range"],
            "supports_credentials": True
        }
    })
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Initialize database
    from models import db, bcrypt
    db.init_app(app)
    bcrypt.init_app(app)
    
    # Initialize email
    from email_service import mail
    mail.init_app(app)
    
    # JWT callback for token blacklist check
    from auth_routes import check_if_token_revoked
    jwt.token_in_blocklist_loader(check_if_token_revoked)
    
    # Register blueprints
    from auth_routes import auth_bp
    app.register_blueprint(auth_bp)
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created successfully")
        except Exception as e:
            print(f"⚠️ Database table creation warning: {str(e)}")
    
    return app
