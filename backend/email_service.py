from flask_mail import Mail, Message
from flask import current_app, render_template_string
import os

mail = Mail()

def send_verification_email(user, token):
    """Send email verification link to user"""
    try:
        # Frontend URL for verification
        frontend_url = os.environ.get('FRONTEND_URL', 'https://app.vsfintech.in/alphanifty')
        verification_link = f"{frontend_url}/verify-email?token={token}"
        
        # Email HTML template
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Alphanifty</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2E89C4 0%, #3BAF4A 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎯 Alphanifty</h1>
                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Smart Mutual Fund Baskets</p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Welcome to Alphanifty, {user.name}! 👋</h2>
                            <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                                Thank you for joining Alphanifty! We're excited to help you on your investment journey.
                            </p>
                            <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                                To get started, please verify your email address by clicking the button below:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #2E89C4 0%, #3BAF4A 100%);">
                                        <a href="{verification_link}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                            ✅ Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                If the button doesn't work, copy and paste this link into your browser:<br>
                                <a href="{verification_link}" style="color: #2E89C4; word-break: break-all;">{verification_link}</a>
                            </p>
                            
                            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eeeeee;">
                                <h3 style="margin: 0 0 15px; color: #333333; font-size: 18px;">What's Next?</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                                    <li>Explore our curated mutual fund baskets</li>
                                    <li>Use our investment calculators</li>
                                    <li>Build your personalized portfolio</li>
                                    <li>Track your investments in real-time</li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                                This email was sent to <strong>{user.email}</strong>
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © 2026 Alphanifty by VS Fintech. All rights reserved.
                            </p>
                            <p style="margin: 15px 0 0; color: #999999; font-size: 12px;">
                                If you didn't create an account, please ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """
        
        # Plain text version
        text_body = f"""
Welcome to Alphanifty, {user.name}!

Thank you for joining Alphanifty! We're excited to help you on your investment journey.

Please verify your email address by clicking the link below:
{verification_link}

What's Next?
- Explore our curated mutual fund baskets
- Use our investment calculators
- Build your personalized portfolio
- Track your investments in real-time

This email was sent to {user.email}

© 2026 Alphanifty by VS Fintech. All rights reserved.

If you didn't create an account, please ignore this email.
        """
        
        msg = Message(
            subject='Verify Your Email - Alphanifty',
            recipients=[user.email],
            html=html_body,
            body=text_body
        )
        
        mail.send(msg)
        print(f"✅ Verification email sent to {user.email}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending verification email: {str(e)}")
        return False


def send_welcome_email(user):
    """Send welcome email after verification"""
    try:
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Alphanifty!</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px;">
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #2E89C4 0%, #3BAF4A 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px;">🎉 Welcome Aboard!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #333333;">Hi {user.name},</h2>
                            <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                Your email has been verified successfully! You're all set to start your investment journey with Alphanifty.
                            </p>
                            <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                Start exploring our curated mutual fund baskets and build your dream portfolio today!
                            </p>
                            <table role="presentation" style="margin: 30px auto;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #2E89C4 0%, #3BAF4A 100%);">
                                        <a href="https://app.vsfintech.in/alphanifty/dashboard" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold;">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © 2026 Alphanifty by VS Fintech
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """
        
        msg = Message(
            subject='Welcome to Alphanifty! 🎉',
            recipients=[user.email],
            html=html_body
        )
        
        mail.send(msg)
        print(f"✅ Welcome email sent to {user.email}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending welcome email: {str(e)}")
        return False


def send_password_reset_email(user, token):
    """Send password reset link to user"""
    try:
        # Frontend URL for password reset
        frontend_url = os.environ.get('FRONTEND_URL', 'https://app.vsfintech.in/alphanifty')
        reset_link = f"{frontend_url}/reset-password?token={token}"
        
        # Email HTML template
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Alphanifty</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #2E89C4 0%, #3BAF4A 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 Password Reset</h1>
                            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Alphanifty Account Security</p>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hi {user.name},</h2>
                            <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.6;">
                                We received a request to reset your password for your Alphanifty account.
                            </p>
                            <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                                Click the button below to reset your password:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #2E89C4 0%, #3BAF4A 100%);">
                                        <a href="{reset_link}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                            🔑 Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 30px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                If the button doesn't work, copy and paste this link into your browser:<br>
                                <a href="{reset_link}" style="color: #2E89C4; word-break: break-all;">{reset_link}</a>
                            </p>
                            
                            <div style="margin-top: 40px; padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                    <strong>⚠️ Security Notice:</strong><br>
                                    This password reset link will expire in 1 hour for your security.<br>
                                    If you didn't request this, please ignore this email and your password will remain unchanged.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                                This email was sent to <strong>{user.email}</strong>
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © 2026 Alphanifty by VS Fintech. All rights reserved.
                            </p>
                            <p style="margin: 15px 0 0; color: #999999; font-size: 12px;">
                                Need help? Contact support at vsfintech@gmail.com
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """
        
        # Plain text version
        text_body = f"""
Password Reset Request - Alphanifty

Hi {user.name},

We received a request to reset your password for your Alphanifty account.

Click the link below to reset your password:
{reset_link}

⚠️ Security Notice:
This password reset link will expire in 1 hour for your security.
If you didn't request this, please ignore this email and your password will remain unchanged.

This email was sent to {user.email}

© 2026 Alphanifty by VS Fintech. All rights reserved.
        """
        
        msg = Message(
            subject='Reset Your Password - Alphanifty',
            recipients=[user.email],
            html=html_body,
            body=text_body
        )
        
        mail.send(msg)
        print(f"✅ Password reset email sent to {user.email}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending password reset email: {str(e)}")
        return False
