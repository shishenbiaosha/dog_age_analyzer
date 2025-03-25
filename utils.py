import os
import uuid
from datetime import datetime
from PIL import Image
import random
import subprocess
import re

def save_image(file, upload_folder):
    """保存上传的图片并返回文件路径"""
    # 生成唯一文件名
    filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
    filepath = os.path.join(upload_folder, filename)
    
    # 保存图片
    img = Image.open(file)
    img.save(filepath)
    
    # 返回相对路径（不包含 static 前缀），确保使用正斜杠
    return 'uploads/' + filename

def analyze_dog_age(image_path):
    """
    分析狗狗年龄
    调用predict.py进行预测，并从predict.txt读取结果
    """
    # 获取图片文件名
    filename = os.path.basename(image_path)
    print(f"开始分析狗狗年龄: {filename}")
    
    try:
        # 构建完整的图片路径
        full_image_path = os.path.join('static', image_path) if not image_path.startswith('static') else image_path
        print(f"完整图片路径: {full_image_path}")
        
        # 检查图片是否存在
        if not os.path.exists(full_image_path):
            error_msg = f"图片文件不存在: {full_image_path}"
            print(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
            
        # 调用predict.py进行预测
        print(f"调用predict.py进行预测...")
        # 设置环境变量，禁用SSL验证和代理
        env = os.environ.copy()
        env['PYTHONHTTPSVERIFY'] = '0'  # 禁用SSL验证
        env['HTTP_PROXY'] = ''  # 清除HTTP代理
        env['HTTPS_PROXY'] = ''  # 清除HTTPS代理
        
        result = subprocess.run(['python', 'predict.py', '--file', filename], 
                               check=True, 
                               capture_output=True, 
                               text=True,
                               env=env)
        
        print(f"predict.py执行结果: {result.returncode}")
        if result.stdout:
            print(f"标准输出: {result.stdout}")
        if result.stderr:
            print(f"标准错误: {result.stderr}")
        
        # 检查predict.txt是否存在
        if not os.path.exists('predict.txt'):
            error_msg = "预测结果文件predict.txt不存在"
            print(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
        
        # 从predict.txt读取预测结果
        with open('predict.txt', 'r', encoding='utf-8') as f:
            content = f.read().strip()
        
        print(f"预测结果内容: {content}")
            
        # 解析预测结果 - 使用更灵活的正则表达式
        match = re.search(r'{}[\s\t]+([\d.]+)'.format(re.escape(filename)), content)
        if not match:
            # 尝试另一种格式
            match = re.search(r'{}\\t([\d.]+)'.format(re.escape(filename)), content)
            
        if match:
            # 获取预测的月龄，并转换为年龄（除以12）
            pred_months = float(match.group(1))
            estimated_age = pred_months / 12.0
            
            print(f"预测月龄: {pred_months}，转换为年龄: {estimated_age}")
            
            return {
                'estimated_age': estimated_age,
                'human_age_equivalent': calculate_human_age(estimated_age),
                'success': True
            }
        else:
            # 如果没有找到匹配的预测结果，尝试直接解析数字
            numbers = re.findall(r'[\d.]+', content)
            if numbers and len(numbers) >= 2:  # 假设第二个数字是预测月龄
                pred_months = float(numbers[1])
                estimated_age = pred_months / 12.0
                print(f"使用备用方法解析 - 预测月龄: {pred_months}，转换为年龄: {estimated_age}")
                return {
                    'estimated_age': estimated_age,
                    'human_age_equivalent': calculate_human_age(estimated_age),
                    'success': True
                }
            
            # 如果仍然无法解析，返回错误信息
            error_msg = f"无法解析预测结果: {content}"
            print(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
            
    except subprocess.CalledProcessError as e:
        # 捕获predict.py执行错误
        error_msg = f"预测脚本执行失败: {e.stderr}"
        print(error_msg)
        return {
            'success': False,
            'error': error_msg
        }
    except Exception as e:
        # 捕获其他错误
        error_msg = f"分析狗狗年龄时发生错误: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': error_msg
        }

def calculate_human_age(dog_age):
    """
    计算狗狗年龄对应的人类年龄
    根据狗狗年龄阶段表格计算：
    - 幼年期：0个月-6个月
    - 青春期：6个月-1岁
    - 壮年期：1岁-5岁
    - 中年期：5岁-10岁
    - 老年期：10岁-16岁
    """
    # 限制最大年龄为16岁
    if dog_age > 16:
        dog_age = 16
    
    # 根据表格进行精确匹配
    if dog_age <= 0.06:  # 约3周
        return 1
    elif dog_age <= 0.12:  # 约6周
        return 2
    elif dog_age <= 0.15:  # 约7周
        return 3
    elif dog_age <= 0.25:  # 约3个月
        return 5
    elif dog_age <= 0.5:  # 6个月
        return 5
    elif dog_age <= 0.58:  # 约7个月
        return 8
    elif dog_age <= 0.75:  # 9个月
        return 10
    elif dog_age <= 0.83:  # 10个月
        return 13
    elif dog_age <= 1:  # 1岁
        return 15
    elif dog_age <= 1.5:  # 1岁6个月
        return 17
    elif dog_age <= 2:  # 2岁
        return 20
    elif dog_age <= 3:  # 3岁
        return 23
    elif dog_age <= 4:  # 4岁
        return 28
    elif dog_age <= 5:  # 5岁
        return 32
    elif dog_age <= 6:  # 6岁
        return 36
    elif dog_age <= 7:  # 7岁
        return 40
    elif dog_age <= 8:  # 8岁
        return 44
    elif dog_age <= 9:  # 9岁
        return 48
    elif dog_age <= 10:  # 10岁
        return 52
    elif dog_age <= 11:  # 11岁
        return 56
    elif dog_age <= 12:  # 12岁
        return 60
    elif dog_age <= 13:  # 13岁
        return 64
    elif dog_age <= 14:  # 14岁
        return 68
    elif dog_age <= 15:  # 15岁
        return 72
    else:  # 16岁
        return 80

def get_dog_life_stage(dog_age):
    """
    根据狗狗年龄确定其所处的生命阶段
    幼年期：0个月-6个月
    青春期：6个月-1岁
    壮年期：1岁-5岁
    中年期：5岁-10岁
    老年期：10岁以上（10岁-16岁）
    """
    # 将狗狗年龄转换为月龄，便于计算
    dog_months = dog_age * 12
    
    if dog_months <= 6:  # 0-6个月
        return "幼年期"
    elif dog_months <= 12:  # 6个月-1岁
        return "青春期"
    elif dog_months <= 60:  # 1岁-5岁
        return "壮年期"
    elif dog_months <= 120:  # 5岁-10岁
        return "中年期"
    else:  # 10岁以上
        return "老年期"

def get_health_tips(dog_age):
    """根据狗狗年龄提供健康建议"""
    # 获取狗狗生命阶段
    life_stage = get_dog_life_stage(dog_age)
    
    if life_stage == "幼年期":
        tips = [
            "定期接种疫苗，预防常见疾病",
            "提供充足的营养，支持幼犬生长发育",
            "开始基础训练，建立良好习惯",
            "定期驱虫，保持健康"
        ]
    elif life_stage == "青春期":
        tips = [
            "保持适量运动，促进身体健康",
            "注意社交训练，培养良好性格",
            "开始关注牙齿健康，预防牙结石",
            "根据生长需求调整饮食"
        ]
    elif life_stage == "壮年期":
        tips = [
            "定期体检，关注健康变化",
            "保持适度运动，维持肌肉力量",
            "注意控制饮食，避免肥胖",
            "注意口腔卫生，预防牙周疾病"
        ]
    elif life_stage == "中年期":
        tips = [
            "增加体检频率，关注中年期常见疾病",
            "调整饮食结构，满足中年犬需求",
            "保持适度运动，但避免过度运动",
            "关注关节健康，预防关节问题"
        ]
    else:  # 老年期
        tips = [
            "增加体检频率，关注老年疾病",
            "调整饮食为老年犬专用粮",
            "减少高强度运动，增加休息时间",
            "关注关节健康，提供适当补充剂",
            "保持温暖舒适的环境，避免温度变化过大"
        ]
    
    return tips 