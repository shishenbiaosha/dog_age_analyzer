import os
from flask import Flask
from config import config
from database import db
from routes import main, auth, dog

def create_app(config_name='default'):
    """创建Flask应用实例"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # 确保上传目录存在
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # 初始化扩展
    db.init_app(app)
    
    # 注册蓝图
    app.register_blueprint(main)
    app.register_blueprint(auth)
    app.register_blueprint(dog)
    
    with app.app_context():
        try:
            # 只验证连接，不创建表
            db.engine.connect()
            print("数据库连接成功！")
        except Exception as e:
            print(f"MySQL连接错误: {e}")
            print("尝试使用SQLite作为备选数据库...")
            # 切换到SQLite
            app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dog_age.db'
            db.init_app(app)
            print("已成功切换到SQLite数据库！")
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True) 