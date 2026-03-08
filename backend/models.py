from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import secrets

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(15), nullable=True)  # Removed unique=True - multiple users can share phone
    password_hash = db.Column(db.String(255), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), unique=True, nullable=True)
    avatar = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(20), default='user')  # user, admin
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    portfolio = db.relationship('Portfolio', backref='user', lazy=True, cascade='all, delete-orphan')
    watchlist = db.relationship('Watchlist', backref='user', lazy=True, cascade='all, delete-orphan')
    cart = db.relationship('Cart', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        """Check if password matches hash"""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def generate_verification_token(self):
        """Generate email verification token"""
        self.verification_token = secrets.token_urlsafe(32)
        return self.verification_token
    
    def to_dict(self, include_email=True):
        """Convert user to dictionary (safe for API responses)"""
        data = {
            'id': self.id,
            'name': self.name,
            'avatar': self.avatar,
            'role': self.role,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_email:
            data['email'] = self.email
            data['phone'] = self.phone
        return data
    
    def __repr__(self):
        return f'<User {self.email}>'


class Portfolio(db.Model):
    __tablename__ = 'portfolios'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    basket_id = db.Column(db.String(50), nullable=False)
    investment_amount = db.Column(db.Float, nullable=False)
    investment_type = db.Column(db.String(20), nullable=False)  # SIP, Lumpsum
    sip_date = db.Column(db.Integer, nullable=True)  # Day of month for SIP
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'basket_id': self.basket_id,
            'investment_amount': self.investment_amount,
            'investment_type': self.investment_type,
            'sip_date': self.sip_date,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Watchlist(db.Model):
    __tablename__ = 'watchlist'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    item_type = db.Column(db.String(20), nullable=False)  # basket, fund
    item_id = db.Column(db.String(50), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'item_type', 'item_id', name='unique_watchlist_item'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_type': self.item_type,
            'item_id': self.item_id,
            'added_at': self.added_at.isoformat() if self.added_at else None
        }


class Cart(db.Model):
    __tablename__ = 'cart'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    basket_id = db.Column(db.String(50), nullable=False)
    investment_amount = db.Column(db.Float, nullable=False)
    investment_type = db.Column(db.String(20), nullable=False)  # SIP, Lumpsum
    sip_date = db.Column(db.Integer, nullable=True)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'basket_id': self.basket_id,
            'investment_amount': self.investment_amount,
            'investment_type': self.investment_type,
            'sip_date': self.sip_date,
            'added_at': self.added_at.isoformat() if self.added_at else None
        }
