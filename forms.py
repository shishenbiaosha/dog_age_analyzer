from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, PasswordField, SubmitField, DateField, TextAreaField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional

class LoginForm(FlaskForm):
    """登录表单"""
    email = StringField('邮箱', validators=[DataRequired(), Email()])
    password = PasswordField('密码', validators=[DataRequired()])
    submit = SubmitField('登录')

class RegisterForm(FlaskForm):
    """注册表单"""
    username = StringField('用户名', validators=[DataRequired(), Length(2, 64)])
    email = StringField('邮箱', validators=[DataRequired(), Email()])
    password = PasswordField('密码', validators=[
        DataRequired(), 
        Length(8, 128, message='密码长度必须至少为8个字符')
    ])
    password2 = PasswordField('确认密码', validators=[
        DataRequired(), 
        EqualTo('password', message='两次输入的密码不匹配')
    ])
    submit = SubmitField('注册')

class UploadPhotoForm(FlaskForm):
    """上传照片表单"""
    photo = FileField('上传狗狗照片', validators=[
        FileRequired('请选择一张照片!'),
        FileAllowed(['jpg', 'jpeg', 'png'], '只允许上传jpg, jpeg或png格式的图片!')
    ])
    submit = SubmitField('开始分析')

class ContactForm(FlaskForm):
    """联系我们表单"""
    name = StringField('您的姓名', validators=[DataRequired(), Length(1, 64)])
    email = StringField('您的邮箱', validators=[DataRequired(), Email()])
    message = TextAreaField('留言内容', validators=[DataRequired(), Length(5, 500)])
    submit = SubmitField('提交') 