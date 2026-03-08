"""
Create the Alphanifty database in PostgreSQL
Run this script to create the database before running the application
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Database connection parameters (from .env)
DB_USER = 'postgres'
DB_PASSWORD = 'VSFintech2026'
DB_HOST = '127.0.0.1'
DB_PORT = 5432
DB_NAME = 'alphanifty'

def create_database():
    """Create the Alphanifty database if it doesn't exist"""
    try:
        # Connect to PostgreSQL server (default postgres database)
        conn = psycopg2.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        exists = cursor.fetchone()
        
        if exists:
            print(f"✅ Database '{DB_NAME}' already exists")
        else:
            # Create database
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"✅ Database '{DB_NAME}' created successfully")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {str(e)}")
        return False

def initialize_tables():
    """Initialize database tables using Flask app"""
    try:
        from init_app import create_app
        from models import db
        
        app = create_app()
        with app.app_context():
            db.create_all()
            print("✅ Database tables created successfully")
            
            # Print table names
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"📊 Created tables: {', '.join(tables)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("🚀 Setting up Alphanifty database...")
    print()
    
    # Step 1: Create database
    if create_database():
        print()
        # Step 2: Create tables
        if initialize_tables():
            print()
            print("🎉 Database setup complete!")
            print()
            print("You can now run the application:")
            print("  python app.py")
        else:
            print("❌ Failed to create tables")
    else:
        print("❌ Failed to create database")
