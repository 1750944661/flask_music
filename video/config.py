from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()


class Config:
    # SQLAlchemy配置
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:123456@localhost/lrc_storage'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # 应用配置
    SECRET_KEY = 'qweas'
