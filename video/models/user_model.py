from config import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import relationship
from flask_login import UserMixin
from datetime import datetime


class User(UserMixin,db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 按用户名获取用户
    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username).first()

    def set_password(self, password):
        """设置密码哈希"""
        self.password_hash = generate_password_hash(password)

    # 密码检查方法 (实例方法)
    def check_password(self, password):
        """验证密码"""
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)


    @staticmethod
    def authenticate(email, password):
        """认证用户"""
        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            return user
        return None


    @staticmethod
    def register(username, email, password, is_admin=False):
        """注册新用户"""
        if User.query.filter_by(email=email).first():
            return None  # 邮箱已存在

        user = User(
            username=username,
            email=email,
            is_admin=is_admin
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user
    ##################################
    # 查询所有用户的基本信息
    @staticmethod
    def get_all():
        return User.query.with_entities(User.id, User.username, User.email).all()

    # 按ID获取用户
    @staticmethod
    def get_by_id(user_id):
        return User.query.get(user_id)

    # 按用户名获取用户
    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username).first()


    # 创建新用户
    @staticmethod
    def create(username, password, nickname, email):
        user = User(
            username=username,
            password=generate_password_hash(password),
            nickname=nickname,
            email=email
        )
        db.session.add(user)
        db.session.commit()
        return user