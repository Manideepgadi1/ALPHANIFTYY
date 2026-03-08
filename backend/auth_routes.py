from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from models import db, User
from datetime import timedelta
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Token blacklist (in production, use Redis)
token_blacklist = set()

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate Indian phone number"""
    if not phone:
        return True  # Phone is optional
    pattern = r'^[6-9]\d{9}$'
    return re.match(pattern, phone) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    return True, "Password is valid"


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        phone = data.get('phone', '').strip()
        password = data.get('password', '')
        
        if not name or len(name) < 3:
            return jsonify({'status': 'error', 'message': 'Name must be at least 3 characters'}), 400
        
        if not email or not validate_email(email):
            return jsonify({'status': 'error', 'message': 'Invalid email format'}), 400
        
        if phone and not validate_phone(phone):
            return jsonify({'status': 'error', 'message': 'Invalid phone number (10 digits, starting with 6-9)'}), 400
        
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'status': 'error', 'message': message}), 400
        
        # Check if user already exists
        print(f"📧 Checking if email exists: {email}")
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"❌ Email already exists: {email} (User ID: {existing_user.id}, Name: {existing_user.name})")
            return jsonify({
                'status': 'error', 
                'message': 'This email is already registered. Please try logging in instead or use a different email.'
            }), 409
        print(f"✅ Email available: {email}")
        
        # Phone number doesn't need to be unique - multiple users can have same phone
        # if phone and User.query.filter_by(phone=phone).first():
        #     return jsonify({'status': 'error', 'message': 'Phone number already registered'}), 409
        
        # Create new user
        user = User(name=name, email=email, phone=phone)
        
        print(f"📝 Registration - Email: {email}")
        print(f"📝 Registration - Password received - Length: {len(password)}, First: '{password[0]}', Last: '{password[-1]}'")
        
        user.set_password(password)
        
        print(f"📝 Registration - Password hash created - Length: {len(user.password_hash)}, First 10: {user.password_hash[:10]}")
        
        token = user.generate_verification_token()
        
        db.session.add(user)
        db.session.commit()
        
        print(f"✅ Registration - User created and saved to DB")
        
        # Send verification email
        from email_service import send_verification_email
        send_verification_email(user, token)
        
        return jsonify({
            'status': 'success',
            'message': 'Registration successful! Please check your email to verify your account.',
            'data': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Registration failed'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'status': 'error', 'message': 'Email and password are required'}), 400
        
        print(f"🔐 Login attempt for: {email}")
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user:
            print(f"❌ User not found: {email}")
            return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401
        
        print(f"✅ User found: {user.email}, verified: {user.is_verified}, active: {user.is_active}")
        print(f"🔑 Password received - Length: {len(password)}, First char: '{password[0] if password else ''}', Last char: '{password[-1] if password else ''}'")
        print(f"🔑 Password hash length: {len(user.password_hash)}, First 10 chars: {user.password_hash[:10]}")
        print(f"🔑 Password hash type: {type(user.password_hash)}, Password type: {type(password)}")
        
        # Try password check
        password_check_result = user.check_password(password)
        print(f"🔑 Password check result: {password_check_result}")
        
        if not password_check_result:
            print(f"❌ Password check failed for: {email}")
            return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401
        
        print(f"✅ Password check passed for: {email}")
        
        if not user.is_active:
            print(f"❌ Account not active: {email}")
            return jsonify({'status': 'error', 'message': 'Account is deactivated'}), 403
        
        if not user.is_verified:
            print(f"❌ Email not verified: {email}")
            return jsonify({'status': 'error', 'message': 'Please verify your email before logging in. Check your inbox for the verification link.'}), 403
        
        # Create tokens
        access_token = create_access_token(
            identity=user.id,
            additional_claims={'email': user.email, 'role': user.role},
            expires_delta=timedelta(hours=24)
        )
        refresh_token = create_refresh_token(
            identity=user.id,
            expires_delta=timedelta(days=30)
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'data': {
                'user': user.to_dict(),
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Login failed'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current logged-in user info"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        
        return jsonify({
            'status': 'success',
            'data': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Get user error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Failed to get user info'}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (add token to blacklist)"""
    try:
        jti = get_jwt()['jti']
        token_blacklist.add(jti)
        
        return jsonify({
            'status': 'success',
            'message': 'Logged out successfully'
        }), 200
        
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Logout failed'}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'status': 'error', 'message': 'Invalid user'}), 401
        
        access_token = create_access_token(
            identity=user.id,
            additional_claims={'email': user.email, 'role': user.role},
            expires_delta=timedelta(hours=24)
        )
        
        return jsonify({
            'status': 'success',
            'data': {'access_token': access_token}
        }), 200
        
    except Exception as e:
        print(f"Refresh token error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Token refresh failed'}), 500


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'name' in data:
            name = data['name'].strip()
            if len(name) >= 3:
                user.name = name
            else:
                return jsonify({'status': 'error', 'message': 'Name must be at least 3 characters'}), 400
        
        if 'phone' in data:
            phone = data['phone'].strip()
            if phone and not validate_phone(phone):
                return jsonify({'status': 'error', 'message': 'Invalid phone number'}), 400
            # Check if phone is already used by another user
            if phone and User.query.filter(User.phone == phone, User.id != user.id).first():
                return jsonify({'status': 'error', 'message': 'Phone number already in use'}), 409
            user.phone = phone
        
        if 'avatar' in data:
            user.avatar = data['avatar']
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Profile updated successfully',
            'data': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Update profile error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Profile update failed'}), 500


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
        
        data = request.get_json()
        # Support both camelCase and snake_case
        current_password = data.get('current_password') or data.get('currentPassword', '')
        new_password = data.get('new_password') or data.get('newPassword', '')
        
        if not current_password:
            return jsonify({'status': 'error', 'message': 'Current password is required'}), 400
        
        if not new_password:
            return jsonify({'status': 'error', 'message': 'New password is required'}), 400
        
        # Verify current password
        if not user.check_password(current_password):
            return jsonify({'status': 'error', 'message': 'Current password is incorrect'}), 401
        
        # Validate new password
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'status': 'error', 'message': message}), 400
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        print(f"✅ Password changed successfully for user: {user.email}")
        
        return jsonify({
            'status': 'success',
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Change password error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Password change failed'}), 500


@auth_bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    """Verify user email with token"""
    try:
        user = User.query.filter_by(verification_token=token).first()
        
        if not user:
            return jsonify({'status': 'error', 'message': 'Invalid verification token'}), 404
        
        if user.is_verified:
            return jsonify({'status': 'success', 'message': 'Email already verified'}), 200
        
        user.is_verified = True
        user.verification_token = None
        db.session.commit()
        
        # Send welcome email
        from email_service import send_welcome_email
        send_welcome_email(user)
        
        return jsonify({
            'status': 'success',
            'message': 'Email verified successfully!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Email verification error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Verification failed'}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Request password reset - sends email with reset token"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'status': 'error', 'message': 'Email is required'}), 400
        
        if not validate_email(email):
            return jsonify({'status': 'error', 'message': 'Invalid email format'}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        # Always return success to prevent email enumeration
        # But only send email if user exists
        if user:
            # Generate reset token (reuse verification_token field)
            import secrets
            reset_token = secrets.token_urlsafe(32)
            user.verification_token = reset_token
            db.session.commit()
            
            # Send password reset email
            from email_service import send_password_reset_email
            send_password_reset_email(user, reset_token)
            
            print(f"🔐 Password reset requested for: {email}")
        else:
            print(f"⚠️ Password reset requested for non-existent email: {email}")
        
        # Always return success message
        return jsonify({
            'status': 'success',
            'message': 'If an account exists with this email, you will receive a password reset link shortly.'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Forgot password error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Failed to process request'}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token from email"""
    try:
        data = request.get_json()
        token = data.get('token', '').strip()
        new_password = data.get('password', '')
        
        if not token:
            return jsonify({'status': 'error', 'message': 'Reset token is required'}), 400
        
        if not new_password:
            return jsonify({'status': 'error', 'message': 'New password is required'}), 400
        
        # Validate password strength
        is_valid, message = validate_password(new_password)
        if not is_valid:
            return jsonify({'status': 'error', 'message': message}), 400
        
        # Find user by token
        user = User.query.filter_by(verification_token=token).first()
        
        if not user:
            return jsonify({'status': 'error', 'message': 'Invalid or expired reset token'}), 404
        
        # Update password
        user.set_password(new_password)
        user.verification_token = None  # Clear token after use
        db.session.commit()
        
        print(f"✅ Password reset successfully for: {user.email}")
        
        return jsonify({
            'status': 'success',
            'message': 'Password reset successfully! You can now log in with your new password.'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Reset password error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Password reset failed'}), 500


# JWT callback to check if token is blacklisted
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in token_blacklist
