from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_login import LoginManager

from config import Config
from config import db
from views.admin_view import admin_bp

# 初始化Flask应用
app = Flask(__name__) # 创建Flask应用实例
app.config['SECRET_KEY'] = 'funny'
app.config.from_object(Config())  # 加载配置
db.init_app(app) # 初始化SQLAlchemy

#注册蓝图
app.register_blueprint(admin_bp)




if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # 创建所有未存在的表
    app.run(debug=True)