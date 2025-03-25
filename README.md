# 狗狗年龄分析系统

这是一个用于分析狗狗年龄的系统，支持用户上传图片并获取狗狗的估计年龄。系统具有用户账号管理和分析历史记录功能。

## 系统特点

- 用户注册和登录功能
- 管理员账号权限管理
- 狗狗年龄分析功能
- 分析历史记录查看
- 每个用户可以查看自己的分析历史记录

## 数据库设置

### 前提条件

1. 已安装MySQL服务器（推荐5.7或8.0版本）
2. 已安装Python 3.6+
3. 已安装项目依赖（`pip install -r requirements.txt`）

### 配置数据库连接

1. 创建`.env`文件，设置数据库连接参数，示例如下：

```
DATABASE_URL=mysql+pymysql://用户名:密码@主机地址/数据库名
```

将`用户名`、`密码`、`主机地址`和`数据库名`替换为您的MySQL连接信息。

### 初始化数据库

1. 首先确保MySQL服务已启动

2. 运行以下命令初始化数据库：

```bash
python database.py
```

3. 如果需要重新创建数据库（**警告：这将删除所有现有数据**），请使用：

```bash
python database.py --force
```

### 创建管理员账号

初始化数据库后，系统会询问是否要创建管理员账号，按照提示操作即可。

您也可以在之后任何时候通过再次运行数据库初始化脚本并选择创建管理员账号来添加管理员：

```bash
python database.py
```

### 数据库结构

系统使用以下两个主要表：

1. **users表** - 存储用户信息
   - id: 主键
   - username: 用户名（唯一）
   - email: 电子邮件（唯一）
   - password_hash: 密码哈希
   - is_admin: 管理员标志
   - created_at: 创建时间

2. **age_analyses表** - 存储年龄分析结果
   - id: 主键
   - estimated_age: 估计年龄（以年为单位）
   - photo_path: 照片路径
   - user_id: 外键，关联到users表
   - created_at: 创建时间

### 使用SQLAlchemy

本项目使用Flask-SQLAlchemy进行数据库操作。数据库模型已在`database.py`中定义：

- User模型：对应users表
- AgeAnalysis模型：对应age_analyses表

应用启动时会自动初始化数据库连接并创建必要的表结构。

### 常见问题解决

如果遇到连接错误：

1. 确保MySQL服务已启动
2. 检查用户名和密码是否正确
3. 确保用户有创建数据库的权限
4. 如果使用远程MySQL服务器，检查防火墙设置

可以通过以下命令授予用户权限：

```sql
CREATE USER '用户名'@'localhost' IDENTIFIED BY '密码';
GRANT ALL PRIVILEGES ON 数据库名.* TO '用户名'@'localhost';
FLUSH PRIVILEGES;
```

## 使用说明

### 用户功能

- 注册和登录账号
- 上传狗狗照片进行年龄分析
- 查看个人的分析历史记录

### 管理员功能

- 查看所有用户的信息
- 查看所有的分析记录
- 管理系统设置

## 开发说明

如需修改数据库结构，请编辑`database.py`文件中的模型定义，然后使用`--force`参数重新创建数据库。

## 技术栈

- **后端**: Flask, SQLAlchemy
- **前端**: HTML, CSS, JavaScript, Bootstrap 5
- **数据库**: MySQL
- **图像处理**: Pillow
- **深度学习**: PyTorch, timm

## 安装步骤

1. 克隆仓库
```
git clone https://github.com/shishenbiaosha/dog_age_analyzer.git
cd dog_age_analyzer
```

2. 创建并激活虚拟环境
```
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

3. 安装依赖
```
pip install -r requirements.txt
```

4. 配置数据库
   - 创建MySQL数据库
   - 修改`.env`文件中的数据库连接信息

5. 运行应用
```
python app.py
```

6. 在浏览器中访问 `http://127.0.0.1:5000`

## 项目结构

```
dog_age_analyzer/
├── app.py              # 应用入口
├── config.py           # 配置文件
├── database.py         # 数据库模型和初始化
├── routes.py           # 路由定义
├── forms.py            # 表单类
├── utils.py            # 工具函数
├── model.py            # 深度学习模型定义
├── predict.py          # 年龄预测功能
├── static/             # 静态文件
│   ├── css/            # CSS样式
│   ├── js/             # JavaScript脚本
│   ├── images/         # 图片资源
│   └── uploads/        # 上传的图片
├── templates/          # HTML模板
│   ├── auth/           # 认证相关模板
│   ├── dog/            # 狗狗相关模板
│   └── ...
└── model/              # 预训练模型存储
    └── best_model.pth  # 预训练的狗狗年龄预测模型
```

## 注意事项

- 本应用使用深度学习模型进行狗狗年龄分析
- 请确保上传的图片清晰可见，以获得更准确的分析结果
- 系统会自动处理上传的图片，无需手动调整图片大小

## 许可证

MIT 
