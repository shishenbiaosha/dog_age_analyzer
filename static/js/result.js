// result.js - 狗狗年龄分析结果页面交互效果

document.addEventListener('DOMContentLoaded', function () {
    // 初始化各项功能 - 仅保留必要功能
    initLifeStageTimeline();
    initShareButtons();
    initButtonEffects();
    initAgeTable(); // 初始化年龄对照表交互效果
    initQRCodeModal(); // 初始化二维码弹出层

    // 如果需要，初始化Bootstrap工具提示
    initTooltips();
});

// 初始化生命阶段时间轴
function initLifeStageTimeline() {
    const stageContainer = document.getElementById('lifestage-progress');
    if (!stageContainer) return;

    const currentStage = stageContainer.getAttribute('data-stage');
    const stagePoints = stageContainer.querySelectorAll('.stage-point');
    const progressTrack = stageContainer.querySelector('.progress-track');

    if (!stagePoints.length || !progressTrack) return;

    const stages = ['幼年期', '青春期', '壮年期', '中年期', '老年期'];
    const currentStageIndex = stages.indexOf(currentStage);

    if (currentStageIndex === -1) return;

    // 计算进度
    const progressPercent = ((currentStageIndex + 1) / stages.length) * 100;

    // 应用动画效果，延迟执行确保CSS已加载
    setTimeout(() => {
        // 确保进度条显示与生命阶段匹配
        let progressUpdate = progressTrack.querySelector('.progress-line');
        if (progressUpdate) {
            if (window.innerWidth >= 768) {
                progressUpdate.style.width = `${progressPercent}%`;
            } else {
                progressUpdate.style.height = `${progressPercent}%`;
            }
        }

        // 为每个阶段点设置视觉效果
        stagePoints.forEach((point, index) => {
            const pointStage = point.getAttribute('data-stage');
            const pointIndex = stages.indexOf(pointStage);
            const marker = point.querySelector('.point-marker');
            const label = point.querySelector('.point-label');
            const age = point.querySelector('.point-age');

            // 视觉效果增强：标记应用阶段特定样式
            if (pointIndex === currentStageIndex) {
                point.classList.add('active');
                marker.classList.add('active');
                label.classList.add('active');
                if (age) age.classList.add('active');
            } else if (pointIndex < currentStageIndex) {
                point.classList.add('completed');
                marker.classList.add('completed');
            }

            // 添加阶段特定属性以便CSS选择器应用
            point.setAttribute('data-is', pointIndex <= currentStageIndex ? 'active' : 'inactive');

            // 动画延迟，创建连续出现的效果
            setTimeout(() => {
                marker.style.opacity = '1';
                marker.style.transform = pointIndex === currentStageIndex ? 'scale(1.5)' : 'scale(1)';

                if (pointIndex === currentStageIndex) {
                    label.style.fontWeight = '700';
                    if (age) age.style.opacity = '1';
                }
            }, 300 + (pointIndex * 150));
        });
    }, 500);

    // 添加窗口大小改变事件监听器来处理响应式布局
    window.addEventListener('resize', function () {
        const progressLine = progressTrack.querySelector('.progress-line');
        if (progressLine) {
            if (window.innerWidth >= 768) {
                progressLine.style.width = `${progressPercent}%`;
                progressLine.style.height = '100%';
            } else {
                progressLine.style.height = `${progressPercent}%`;
                progressLine.style.width = '100%';
            }
        }
    });
}

// 初始化分享按钮
function initShareButtons() {
    const shareButtons = document.querySelectorAll('[data-share]');
    const successMessage = document.getElementById('share-success-message');

    shareButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const platform = this.getAttribute('data-share');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent('我的狗狗年龄分析结果');
            let shareUrl;

            // 添加点击反馈
            this.classList.add('click-feedback');
            setTimeout(() => {
                this.classList.remove('click-feedback');
            }, 300);

            switch (platform) {
                case 'wechat':
                    // 显示二维码弹出层
                    showQRCode(window.location.href);
                    return;
                case 'qq':
                    shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&pics=&summary=我家狗狗年龄分析结果，狗狗正处于绝佳年龄！`;
                    break;
                case 'weibo':
                    shareUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${title}`;
                    break;
                case 'copy':
                    // 复制链接到剪贴板
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        // 显示成功消息
                        showSuccessMessage('链接已复制到剪贴板!');
                    }).catch(err => {
                        console.error('无法复制: ', err);
                        // 降级方案
                        const textarea = document.createElement('textarea');
                        textarea.value = window.location.href;
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = 0;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        showSuccessMessage('链接已复制到剪贴板!');
                    });
                    return;
                case 'download':
                    // 将分享卡片转为图片并下载
                    generateShareImage();
                    return;
            }

            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=500');
            }
        });
    });

    // 显示成功消息
    function showSuccessMessage(message) {
        if (successMessage) {
            successMessage.classList.remove('d-none');
            successMessage.textContent = message;

            // 3秒后隐藏消息
            setTimeout(() => {
                successMessage.classList.add('d-none');
            }, 3000);
        }
    }

    // 生成分享图片并下载
    function generateShareImage() {
        // 这里创建一个临时的分享图片内容
        const tempShareElement = document.createElement('div');
        tempShareElement.className = 'temp-share-preview';
        tempShareElement.style.padding = '20px';
        tempShareElement.style.background = 'white';
        tempShareElement.style.borderRadius = '12px';
        tempShareElement.style.maxWidth = '400px';
        tempShareElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';

        // 从页面获取分析结果数据
        const resultAge = document.querySelector('.result-age');
        const humanAge = document.querySelector('.result-age + p .badge');
        const lifeStage = document.querySelector('.stage-badge');
        const dogImage = document.querySelector('.dog-avatar img');

        if (!resultAge || !humanAge || !lifeStage || !dogImage) {
            alert('无法生成分享图片，请尝试截图分享。');
            return;
        }

        // 创建内容HTML
        tempShareElement.innerHTML = `
            <div style="display:flex; align-items:center; margin-bottom:15px;">
                <div style="width:60px; height:60px; margin-right:15px; border-radius:50%; overflow:hidden; border:3px solid #f0f0f0;">
                    <img src="${dogImage.src}" style="width:100%; height:100%; object-fit:cover;" />
                </div>
                <div>
                    <h3 style="margin:0 0 5px 0; color:#333; font-size:16px;">我家狗狗的年龄分析结果</h3>
                    <p style="margin:0; color:#666; font-size:14px;">狗狗年龄: ${resultAge.textContent} (相当于人类${humanAge.textContent})</p>
                </div>
            </div>
            <div style="background:#f5f7ff; padding:12px; border-radius:8px; margin-bottom:10px; font-size:14px; border-left:3px solid #5156D0; text-align:center;">
                <span style="font-style:italic;">AI分析显示: 我家狗狗正处于${lifeStage.textContent}阶段</span>
            </div>
            <div style="font-size:12px; color:#999; text-align:right;">-- 来自狗狗年龄分析工具</div>
        `;

        // 临时添加到body
        document.body.appendChild(tempShareElement);

        // 使用html2canvas截图
        html2canvas(tempShareElement, {
            scale: 2, // 提高图片质量
            backgroundColor: null,
            logging: false
        }).then(canvas => {
            // 转换canvas为图片URL
            const imgData = canvas.toDataURL('image/png');

            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = imgData;
            downloadLink.download = '狗狗年龄分析.png';
            downloadLink.click();

            // 显示成功消息
            showSuccessMessage('图片已保存!');

            // 移除临时元素
            document.body.removeChild(tempShareElement);
        }).catch(err => {
            console.error('无法生成图片: ', err);
            document.body.removeChild(tempShareElement);
            alert('无法生成分享图片，请尝试截图分享。');
        });
    }
}

// 按钮效果
function initButtonEffects() {
    // 简单的点击反馈
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 300);
        });
    });
}

// 初始化工具提示（如果使用Bootstrap）
function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltipTriggerList.length > 0 && typeof bootstrap !== 'undefined') {
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
}

// 初始化年龄对照表交互效果
function initAgeTable() {
    const ageTable = document.querySelector('.age-table');
    if (!ageTable) return;

    // 获取当前狗狗的生命阶段
    const stageContainer = document.getElementById('lifestage-progress');
    let currentStage = '';
    if (stageContainer) {
        currentStage = stageContainer.getAttribute('data-stage');
    }

    // 获取所有阶段行和内容行
    const stageDividers = ageTable.querySelectorAll('tr.stage-divider');
    const stageRows = {
        puppy: ageTable.querySelectorAll('tr.stage-puppy'),
        juvenile: ageTable.querySelectorAll('tr.stage-juvenile'),
        adult: ageTable.querySelectorAll('tr.stage-adult'),
        middle: ageTable.querySelectorAll('tr.stage-middle'),
        senior: ageTable.querySelectorAll('tr.stage-senior')
    };

    // 当前预测阶段的对应类型
    let currentStageType = '';
    if (currentStage === '幼年期') currentStageType = 'puppy';
    else if (currentStage === '青春期') currentStageType = 'juvenile';
    else if (currentStage === '壮年期') currentStageType = 'adult';
    else if (currentStage === '中年期') currentStageType = 'middle';
    else if (currentStage === '老年期') currentStageType = 'senior';

    // 为阶段分隔行添加点击事件，实现折叠/展开效果
    stageDividers.forEach(divider => {
        // 添加可点击的视觉提示
        divider.style.cursor = 'pointer';

        // 获取阶段标题元素
        const stageHeader = divider.querySelector('.stage-header');
        const stageText = stageHeader.textContent.trim();

        // 确定当前阶段对应的行
        let stageType = '';
        if (stageText.includes('幼年期')) stageType = 'puppy';
        else if (stageText.includes('青春期')) stageType = 'juvenile';
        else if (stageText.includes('壮年期')) stageType = 'adult';
        else if (stageText.includes('中年期')) stageType = 'middle';
        else if (stageText.includes('老年期')) stageType = 'senior';

        if (!stageType) return;

        // 添加切换图标
        const toggleIcon = document.createElement('i');
        toggleIcon.className = 'fas fa-chevron-down';
        toggleIcon.style.fontSize = '0.8rem';
        toggleIcon.style.transition = 'transform 0.3s ease';
        toggleIcon.style.opacity = '0.7';
        toggleIcon.style.marginLeft = 'auto';
        stageHeader.appendChild(toggleIcon);

        // 设置当前阶段标记和样式
        if (stageType === currentStageType && currentStageType !== '') {
            divider.classList.add('active');

            // 为当前阶段行添加高亮效果
            stageRows[stageType].forEach(row => {
                row.classList.add('highlight-current-stage');
            });
        } else if (currentStageType !== '') {
            // 默认折叠非当前阶段
            divider.classList.add('collapsed');
            toggleIcon.style.transform = 'rotate(-90deg)';

            // 隐藏相关行
            stageRows[stageType].forEach(row => {
                row.style.display = 'none';
            });
        }

        // 点击事件处理
        divider.addEventListener('click', () => {
            const isCollapsed = divider.classList.toggle('collapsed');

            // 更新图标
            if (isCollapsed) {
                toggleIcon.style.transform = 'rotate(-90deg)';
            } else {
                toggleIcon.style.transform = 'rotate(0)';
            }

            // 切换相关行的显示状态
            stageRows[stageType].forEach(row => {
                if (isCollapsed) {
                    row.style.display = 'none';
                } else {
                    row.style.display = '';
                }
            });
        });

        // 悬停效果
        divider.addEventListener('mouseenter', () => {
            if (!divider.classList.contains('active')) {
                divider.style.backgroundColor = 'rgba(99, 102, 241, 0.08)';
            }
        });

        divider.addEventListener('mouseleave', () => {
            if (!divider.classList.contains('collapsed') && !divider.classList.contains('active')) {
                divider.style.backgroundColor = '';
            }
        });
    });
}

// 高亮显示当前阶段 - 简化，因为我们已经在上面的初始化中处理了高亮
function highlightCurrentStage() {
    // 空实现，高亮逻辑已经移到initAgeTable中
}

// 初始化二维码弹出层
function initQRCodeModal() {
    const qrcodeModal = document.getElementById('qrcode-modal');
    const closeButton = document.getElementById('qrcode-close');

    if (!qrcodeModal || !closeButton) return;

    // 关闭按钮事件
    closeButton.addEventListener('click', () => {
        qrcodeModal.classList.remove('active');

        // 动画完成后隐藏
        setTimeout(() => {
            qrcodeModal.style.display = 'none';
        }, 300);
    });

    // 点击遮罩层关闭
    qrcodeModal.addEventListener('click', (e) => {
        if (e.target === qrcodeModal) {
            closeButton.click();
        }
    });

    // 按ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && qrcodeModal.classList.contains('active')) {
            closeButton.click();
        }
    });
}

// 显示二维码
function showQRCode(url) {
    const qrcodeModal = document.getElementById('qrcode-modal');
    const qrcodeDisplay = document.getElementById('qrcode-display');

    if (!qrcodeModal || !qrcodeDisplay) return;

    // 清空之前的内容
    qrcodeDisplay.innerHTML = '<div class="loading">正在生成二维码...</div>';

    // 显示弹出层
    qrcodeModal.style.display = 'flex';

    // 添加活动类以触发动画
    setTimeout(() => {
        qrcodeModal.classList.add('active');
    }, 10);

    // 生成二维码
    if (typeof QRCode !== 'undefined') {
        qrcodeDisplay.innerHTML = '';

        new QRCode(qrcodeDisplay, {
            text: url,
            width: 160,
            height: 160,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        // 如果没有加载QRCode库，显示错误
        qrcodeDisplay.innerHTML = `
            <div style="padding: 20px;">
                <i class="fas fa-exclamation-circle text-danger mb-2" style="font-size: 2rem;"></i>
                <p class="mt-2">无法生成二维码，请截图分享。</p>
            </div>
        `;
    }
} 