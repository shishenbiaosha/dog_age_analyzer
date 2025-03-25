import os
import sys
import pymysql
import getpass
import re  # 添加正则表达式模块
from dotenv import load_dotenv
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

# 初始化SQLAlchemy
db = SQLAlchemy()

# 定义数据库模型
class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, index=True)
    email = db.Column(db.String(120), unique=True, index=True)
    password_hash = db.Column(db.String(128))
    is_admin = db.Column(db.Boolean, default=False)  # 管理员标志
    created_at = db.Column(db.DateTime, default=datetime.now)  # 使用本地时间而不是UTC时间
    
    # 用户与分析记录的一对多关系
    analyses = db.relationship('AgeAnalysis', backref='user', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.username}>'

class AgeAnalysis(db.Model):
    """年龄分析模型"""
    __tablename__ = 'age_analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    estimated_age = db.Column(db.Float)  # 估计年龄（以年为单位）
    photo_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now)  # 使用本地时间而不是UTC时间
    
    # 外键关联到用户
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    def __repr__(self):
        return f'<AgeAnalysis {self.id}>'

# 数据库设置函数
def init_app(app):
    """初始化应用的数据库"""
    db.init_app(app)
    
    # 在应用上下文中创建所有表
    with app.app_context():
        db.create_all()

# 加载环境变量
load_dotenv()

# 获取数据库连接信息
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print("错误：未找到DATABASE_URL环境变量")
    print("请确保.env文件中包含正确的DATABASE_URL")
    sys.exit(1)

# 解析数据库连接URL
# 格式：mysql+pymysql://username:password@host/dbname
try:
    # 移除驱动前缀
    db_info = db_url.replace('mysql+pymysql://', '')
    # 分离用户名密码和主机信息
    auth, rest = db_info.split('@')
    username, password = auth.split(':')
    host, dbname = rest.split('/')
except Exception as e:
    print(f"错误：无法解析数据库URL: {e}")
    print("正确的格式应为: mysql+pymysql://username:password@host/dbname")
    sys.exit(1)

def create_database():
    """创建数据库（如果不存在）"""
    print("开始初始化数据库...")
    
    try:
        # 连接到MySQL服务器（不指定数据库）
        conn = pymysql.connect(
            host=host,
            user=username,
            password=password,
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        print(f"成功连接到MySQL服务器: {host}")
        
        # 创建数据库（如果不存在）
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {dbname} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"数据库 '{dbname}' 已创建或已存在")
        
        # 关闭连接
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"创建数据库时出错: {e}")
        print("\n可能的解决方案:")
        print("1. 确保MySQL服务已启动")
        print("2. 检查用户名和密码是否正确")
        print("3. 确保用户有创建数据库的权限")
        print("4. 如果使用远程MySQL服务器，检查防火墙设置")
        return False

def create_tables():
    """创建数据库表"""
    try:
        # 连接到已存在的数据库
        conn = pymysql.connect(
            host=host,
            user=username,
            password=password,
            database=dbname,
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        print(f"成功连接到数据库: {dbname}")
        
        # 用户表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(64) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(128) NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        print("用户表创建成功")
        
        # 年龄分析表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS age_analyses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            estimated_age FLOAT NOT NULL,
            photo_path VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        print("年龄分析表创建成功")
        
        # 添加索引以提高查询性能
        try:
            cursor.execute("CREATE INDEX idx_analyses_user_id ON age_analyses(user_id)")
            cursor.execute("CREATE INDEX idx_users_email ON users(email)")
            print("索引创建成功")
        except pymysql.err.InternalError as e:
            # 如果索引已存在，忽略错误
            if "Duplicate key name" in str(e):
                print("索引已存在，跳过创建")
            else:
                raise e
        
        # 提交更改
        conn.commit()
        
        # 关闭连接
        cursor.close()
        conn.close()
        
        print("\n表创建完成！")
        
        return True
    except Exception as e:
        print(f"创建表时出错: {e}")
        return False

def create_admin():
    """创建管理员账号"""
    try:
        # 连接到数据库
        conn = pymysql.connect(
            host=host,
            user=username,
            password=password,
            database=dbname,
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        
        print("=== 创建管理员账号 ===")
        
        # 检查是否已存在管理员
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_admin = TRUE")
        admin_count = cursor.fetchone()[0]
        
        if admin_count > 0:
            print(f"已存在 {admin_count} 个管理员账号。")
            choice = input("是否要创建新的管理员账号？(y/n): ")
            if choice.lower() != 'y':
                print("取消创建新管理员账号。")
                conn.close()
                return False
        
        # 获取管理员信息
        admin_username = input("请输入管理员用户名: ")
        
        # 检查用户名是否已存在
        cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s", (admin_username,))
        if cursor.fetchone()[0] > 0:
            print("错误：该用户名已被使用。")
            conn.close()
            return False
        
        # 获取并验证邮箱格式
        while True:
            admin_email = input("请输入管理员邮箱: ")
            
            # 使用正则表达式验证邮箱格式
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, admin_email):
                print("错误：请输入有效的邮箱地址。")
                continue
            
            # 检查邮箱是否已存在
            cursor.execute("SELECT COUNT(*) FROM users WHERE email = %s", (admin_email,))
            if cursor.fetchone()[0] > 0:
                print("错误：该邮箱已被使用。")
                continue
            
            # 邮箱验证通过
            break
        
        # 获取密码并确认
        while True:
            admin_password = getpass.getpass("请输入管理员密码: ")
            if len(admin_password) < 6:
                print("密码长度至少为6个字符。")
                continue
                
            confirm_password = getpass.getpass("请再次输入密码确认: ")
            if admin_password != confirm_password:
                print("两次输入的密码不匹配，请重新输入。")
            else:
                break
        
        # 生成密码哈希
        password_hash = generate_password_hash(admin_password)
        
        # 创建管理员账号
        cursor.execute("""
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES (%s, %s, %s, TRUE)
        """, (admin_username, admin_email, password_hash))
        
        conn.commit()
        
        print(f"\n管理员账号 '{admin_username}' 创建成功！")
        print("您现在可以使用此账号登录系统并进行管理操作。")
        
        # 关闭连接
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"创建管理员账号时出错: {e}")
        return False

def setup_database(force_recreate=False):
    """设置数据库和表"""
    
    # 如果需要强制重新创建数据库
    if force_recreate:
        try:
            conn = pymysql.connect(
                host=host,
                user=username,
                password=password,
                charset='utf8mb4'
            )
            cursor = conn.cursor()
            cursor.execute(f"DROP DATABASE IF EXISTS {dbname}")
            print(f"数据库 '{dbname}' 已删除")
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"删除数据库时出错: {e}")
            return False
    
    # 创建数据库
    if not create_database():
        return False
    
    # 创建表
    if not create_tables():
        return False
    
    print("\n数据库设置完成！")
    
    # 询问是否创建管理员账号
    create_admin_now = input("是否现在创建管理员账号？(y/n): ")
    if create_admin_now.lower() == 'y':
        create_admin()
    
    print(f"您现在可以运行应用: python app.py")
    return True

if __name__ == "__main__":
    # 检查是否需要强制重新创建数据库
    force_recreate = False
    if len(sys.argv) > 1 and sys.argv[1] == '--force':
        force_recreate = True
        print("警告：将删除并重新创建数据库！")
    
    setup_database(force_recreate)