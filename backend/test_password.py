"""
Test password verification for debugging login issues
"""
from flask_bcrypt import Bcrypt
import psycopg2

# Initialize bcrypt
bcrypt = Bcrypt()

# Database connection
conn = psycopg2.connect(
    host="127.0.0.1",
    port=5432,
    database="alphanifty",
    user="postgres",
    password="VSFintech2026"
)

# Get user's password hash
cursor = conn.cursor()
cursor.execute("SELECT id, email, password_hash FROM users WHERE email = 'gadi0mani0deep7@gmail.com'")
result = cursor.fetchone()

if result:
    user_id, email, password_hash = result
    print(f"✅ Found user: {email} (ID: {user_id})")
    print(f"Password hash length: {len(password_hash)}")
    print(f"Password hash: {password_hash[:20]}...")
    
    # Test the password they claim to have used
    test_password = input("\nEnter the password to test: ")
    
    try:
        # Test using bcrypt directly
        is_valid = bcrypt.check_password_hash(password_hash, test_password)
        print(f"\n{'✅' if is_valid else '❌'} Password check result: {is_valid}")
        
        # Also test password length and characteristics
        print(f"\nPassword analysis:")
        print(f"  Length: {len(test_password)}")
        print(f"  Has uppercase: {any(c.isupper() for c in test_password)}")
        print(f"  Has lowercase: {any(c.islower() for c in test_password)}")
        print(f"  Has digit: {any(c.isdigit() for c in test_password)}")
        print(f"  Has special char: {any(not c.isalnum() for c in test_password)}")
        
    except Exception as e:
        print(f"❌ Error checking password: {e}")
else:
    print("❌ User not found")

cursor.close()
conn.close()
