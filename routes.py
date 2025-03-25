import os
from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime

from database import db, User, AgeAnalysis
from forms import LoginForm, RegisterForm, UploadPhotoForm, ContactForm
from utils import save_image, analyze_dog_age, get_health_tips, calculate_human_age, get_dog_life_stage

# 创建蓝图
main = Blueprint('main', __name__)
auth = Blueprint('auth', __name__, url_prefix='/auth')
dog = Blueprint('dog', __name__, url_prefix='/dog')

# 主页路由
@main.route('/')
def index():
    return render_template('index.html')

@main.route('/contact', methods=['GET', 'POST'])
def contact():
    form = ContactForm()
    if form.validate_on_submit():
        # 在实际应用中，这里应该保存联系信息到数据库或发送邮件
        flash('感谢您的留言，我们会尽快回复！', 'success')
        return redirect(url_for('main.contact'))
    return render_template('contact.html', form=form)

# 认证路由
@auth.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and check_password_hash(user.password_hash, form.password.data):
            # 保存登录前的analysis_ids
            analysis_ids = session.get('analysis_ids', [])
            
            # 清除会话并设置用户ID
            session.clear()
            session['user_id'] = user.id
            
            # 恢复analysis_ids
            if analysis_ids:
                session['analysis_ids'] = analysis_ids
                print(f"登录后恢复分析记录IDs: {analysis_ids}")
            
            flash('登录成功！', 'success')
            return redirect(url_for('main.index'))
        flash('邮箱或密码错误，请重试。', 'danger')
    return render_template('auth/login.html', form=form)

@auth.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        # 检查用户名和邮箱是否已存在
        if User.query.filter_by(username=form.username.data).first():
            flash('用户名已被使用，请选择其他用户名。', 'danger')
            return render_template('auth/register.html', form=form)
        if User.query.filter_by(email=form.email.data).first():
            flash('该邮箱已注册，请直接登录或使用其他邮箱。', 'danger')
            return render_template('auth/register.html', form=form)
        
        # 创建新用户
        user = User(
            username=form.username.data,
            email=form.email.data,
            password_hash=generate_password_hash(form.password.data)
        )
        db.session.add(user)
        db.session.commit()
        
        flash('注册成功！请登录。', 'success')
        return redirect(url_for('auth.login'))
    return render_template('auth/register.html', form=form)

@auth.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('您已成功退出登录。', 'success')
    return redirect(url_for('main.index'))

# 狗狗相关路由
@dog.route('/analyze', methods=['GET', 'POST'])
def analyze():
    form = UploadPhotoForm()
    
    if form.validate_on_submit():
        try:
            # 保存上传的图片
            print("保存上传的图片...")
            photo_path = save_image(form.photo.data, current_app.config['UPLOAD_FOLDER'])
            print(f"图片保存路径: {photo_path}")
            
            # 确保图片文件存在
            full_photo_path = os.path.join(current_app.static_folder, photo_path.replace('/', os.path.sep))
            if not os.path.exists(full_photo_path):
                print(f"错误：保存的图片文件不存在: {full_photo_path}")
                flash('上传图片失败，请重试。', 'danger')
                return render_template('dog/analyze.html', form=form)
            
            # 分析狗狗年龄
            print("开始分析狗狗年龄...")
            analysis_result = analyze_dog_age(photo_path)
            
            # 检查分析是否成功
            if not analysis_result.get('success', False):
                # 分析失败，显示错误信息
                error_message = analysis_result.get('error', '未知错误')
                print(f"分析失败: {error_message}")
                flash(f'分析失败: {error_message}', 'danger')
                # 删除上传的图片
                try:
                    print(f"删除图片: {full_photo_path}")
                    os.remove(full_photo_path)
                except Exception as e:
                    print(f"删除图片失败: {str(e)}")
                return render_template('dog/analyze.html', form=form)
            
            # 获取健康建议
            print("获取健康建议...")
            health_tips = get_health_tips(analysis_result['estimated_age'])
            
            # 保存分析结果到数据库
            print("保存分析结果到数据库...")
            analysis = AgeAnalysis(
                estimated_age=analysis_result['estimated_age'],
                photo_path=photo_path,
                created_at=datetime.now()  # 使用当前本地时间而不是UTC时间
            )
            
            # 如果用户已登录，关联到用户
            if 'user_id' in session:
                user = User.query.get(session['user_id'])
                if user:
                    # 设置用户ID关联
                    analysis.user_id = user.id
                    print(f"关联到用户: ID={user.id}, 用户名={user.username}")
            
            db.session.add(analysis)
            db.session.commit()
            print(f"分析结果已保存，ID: {analysis.id}")
            
            # 将分析结果存入会话，用于结果页面显示
            session['analysis_id'] = analysis.id
            
            # 将分析ID添加到会话中的analysis_ids列表
            analysis_ids = session.get('analysis_ids', [])
            if analysis.id not in analysis_ids:
                analysis_ids.append(analysis.id)
                session['analysis_ids'] = analysis_ids
                print(f"更新会话中的analysis_ids: {session['analysis_ids']}")
            
            print("重定向到结果页面...")
            # 定位到结果位置
            return redirect(url_for('dog.analysis_result') + '#analysis-result')
        except Exception as e:
            print(f"处理上传图片时出错: {str(e)}")
            import traceback
            traceback.print_exc()
            flash(f'处理图片时出错: {str(e)}', 'danger')
            return render_template('dog/analyze.html', form=form)
    
    return render_template('dog/analyze.html', form=form)

@dog.route('/result')
@dog.route('/result/<int:analysis_id>')
def analysis_result(analysis_id=None):
    # 从会话中获取分析ID，或使用URL中的分析ID
    if analysis_id is None:
        analysis_id = session.get('analysis_id')
    
    if not analysis_id:
        flash('没有找到分析结果，请先上传照片。', 'warning')
        return redirect(url_for('dog.analyze'))
    
    # 获取分析结果
    analysis = AgeAnalysis.query.get(analysis_id)
    if not analysis:
        flash('分析结果不存在，请重新上传照片。', 'warning')
        return redirect(url_for('dog.analyze'))
    
    # 将分析ID添加到会话中的analysis_ids列表
    analysis_ids = session.get('analysis_ids', [])
    if analysis_id not in analysis_ids:
        analysis_ids.append(analysis_id)
        session['analysis_ids'] = analysis_ids
    
    # 获取健康建议
    health_tips = get_health_tips(analysis.estimated_age)
    
    # 计算人类年龄等价
    human_age = calculate_human_age(analysis.estimated_age)
    
    # 获取狗狗生命阶段
    life_stage = get_dog_life_stage(analysis.estimated_age)
    
    return render_template('dog/result.html', 
                          analysis=analysis, 
                          health_tips=health_tips,
                          human_age=human_age,
                          life_stage=life_stage)

@dog.route('/history')
def history():
    # 检查用户是否登录
    if 'user_id' not in session:
        flash('请先登录后再查看历史记录。', 'warning')
        return redirect(url_for('auth.login'))
    
    user = User.query.get(session['user_id'])
    if not user:
        flash('用户不存在，请重新登录。', 'danger')
        return redirect(url_for('auth.login'))
    
    print(f"查看历史记录: 用户ID={user.id}, 用户名={user.username}, 是否管理员={user.is_admin}")
    
    # 获取筛选参数
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    user_id = request.args.get('user_id')
    page = request.args.get('page', 1, type=int)
    per_page = 10  # 每页显示10条记录
    
    # 查询基础
    query = AgeAnalysis.query
    
    # 获取所有用户，并计算他们的分析记录数量
    user_stats = {}
    all_users = []
    if user.is_admin:
        all_users = User.query.all()
        for u in all_users:
            analysis_count = AgeAnalysis.query.filter_by(user_id=u.id).count()
            # 确定用户角色和注册天数
            role = 'admin' if u.is_admin else 'regular'
            days_registered = (datetime.now() - u.created_at).days
            if not u.is_admin and days_registered < 7:
                role = 'new'  # 新用户（注册不到7天）
            
            user_stats[u.id] = {
                'role': role,
                'analysis_count': analysis_count,
                'days_registered': days_registered
            }
    
    # 管理员可以查看所有记录，普通用户只能查看自己的记录
    if user.is_admin:
        # 管理员可以按用户筛选
        if user_id:
            if user_id == "none":
                # 筛选无用户关联的记录
                query = query.filter(AgeAnalysis.user_id == None)
            elif user_id.isdigit():
                # 筛选指定用户ID的记录
                query = query.filter(AgeAnalysis.user_id == int(user_id))
    else:
        # 普通用户只能查看自己的记录
        query = query.filter(AgeAnalysis.user_id == user.id)
    
    # 日期筛选（对所有用户都适用）
    if date_from:
        try:
            from_date = datetime.strptime(date_from, '%Y-%m-%d')
            query = query.filter(AgeAnalysis.created_at >= from_date)
        except ValueError:
            flash('开始日期格式无效，已忽略此筛选条件。', 'warning')
    
    if date_to:
        try:
            # 将结束日期设为当天的23:59:59，以包括整天
            to_date = datetime.strptime(date_to, '%Y-%m-%d')
            to_date = to_date.replace(hour=23, minute=59, second=59)
            query = query.filter(AgeAnalysis.created_at <= to_date)
        except ValueError:
            flash('结束日期格式无效，已忽略此筛选条件。', 'warning')
    
    # 预加载关联数据以优化性能
    if user.is_admin:
        query = query.options(
            db.joinedload(AgeAnalysis.user)
        )
    
    # 按创建时间降序排序并应用分页
    paginated_analyses = query.order_by(AgeAnalysis.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False)
    
    print(f"查询结果: 总数={paginated_analyses.total}, 当前页={page}, 每页={per_page}")
    
    # 普通用户还需要处理当前会话中的临时记录（如果有）
    if not user.is_admin:
        current_session_analysis_id = session.get('analysis_id')
        if current_session_analysis_id:
            # 只获取当前会话刚刚创建的记录（如果还未关联到用户）
            current_analysis = AgeAnalysis.query.filter_by(
                id=current_session_analysis_id,
                user_id=None
            ).first()
            
            # 如果存在未关联的分析记录并且不在当前页中，特殊处理
            if current_analysis and not any(a.id == current_analysis.id for a in paginated_analyses.items):
                # 对于未关联的临时记录，我们可以在前端显示一个特殊提示
                # 这里我们不直接修改paginated_analyses，因为它是SQLAlchemy分页对象
                print(f"注意: 有一个未关联的会话分析记录 ID={current_analysis.id}，未显示在当前页面")
    
    return render_template(
        'dog/history.html', 
        analyses=paginated_analyses, 
        user=user, 
        user_stats=user_stats if user.is_admin else {},
        all_users=all_users if user.is_admin else []
    ) 