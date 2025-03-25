import os.path
import argparse
import numpy as np
import torch
from PIL import Image
from torchvision import transforms
import sys

from model import Model

def predict_image(image_path):
    """预测单张图片的年龄"""
    print(f"开始处理图片: {image_path}")
    
    # 检查文件是否存在
    if not os.path.exists(image_path):
        print(f"错误：文件 {image_path} 不存在")
        return None
    
    img_size = 256
    transform2 = transforms.Compose([
        transforms.ToTensor(),  # 将PIL图像转为Tensor格式（自动归一化到[0,1]）
        transforms.Resize([img_size, img_size]),  # 调整图像尺寸
    ])

    try:
        # 初始化模型
        print("初始化模型...")
        model = Model(timm_pretrained=False)
        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        print(f"使用设备: {device}")

        # 加载模型权重
        m_path = os.path.join('model', 'best_model.pth')
        print(f"加载模型权重: {m_path}")
        
        if not os.path.exists(m_path):
            print(f"错误：模型文件 {m_path} 不存在")
            # 尝试在当前目录下查找
            current_dir_path = os.path.join(os.getcwd(), 'best_model.pth')
            if os.path.exists(current_dir_path):
                print(f"在当前目录找到模型文件: {current_dir_path}")
                m_path = current_dir_path
            else:
                print("无法找到模型文件，请确保模型文件存在")
                return None
        
        model.load_state_dict(torch.load(m_path, map_location=device))
        model = model.to(device)
        model.eval()
        print("模型加载成功")

        # 读取和预处理图片
        print("读取和预处理图片...")
        image = Image.open(image_path).convert('RGB')
        image = np.array(image)
        input_tensor = transform2(image).unsqueeze(0).to(device)
        
        # 进行预测
        print("进行预测...")
        with torch.no_grad():
            out = model(input_tensor)
        pred_age = out.detach().cpu().numpy().reshape(-1)[0]
        
        # 写入预测结果到文件
        print(f"预测结果: {pred_age:.2f} 个月")
        with open('predict.txt', 'w', encoding='utf-8') as f:
            result_line = f"{os.path.basename(image_path)}\t{pred_age:.2f}\n"
            f.write(result_line)
        
        print(f"预测完成: {os.path.basename(image_path)}: {pred_age:.2f} 个月")
        return pred_age
    
    except Exception as e:
        print(f"处理图片时出错: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--file', type=str, required=True, help='图片文件名')
    args = parser.parse_args()
    
    # 构建完整的图片路径
    image_path = os.path.join("static/uploads", args.file)
    
    # 检查文件是否存在
    if not os.path.exists(image_path):
        print(f"错误：文件 {image_path} 不存在")
        # 尝试使用备用路径
        alt_path = os.path.join("static", "uploads", args.file)
        if os.path.exists(alt_path):
            print(f"找到备用路径: {alt_path}")
            image_path = alt_path
        else:
            print("无法找到图片文件")
            sys.exit(1)
    
    result = predict_image(image_path)
    if result is None:
        print("预测失败")
        sys.exit(1)
    else:
        print(f"预测成功: {result:.2f} 个月")
        sys.exit(0)