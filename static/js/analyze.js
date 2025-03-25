document.addEventListener('DOMContentLoaded', function () {
    // 获取表单和按钮元素
    const uploadForm = document.getElementById('upload-form');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analysisInfoCard = document.getElementById('analysis-info-card');
    const miniProgressIndicator = document.getElementById('mini-progress-indicator');
    const mainContainer = document.querySelector('.container-fluid'); // 主容器
    const resultPreview = document.querySelector('#analysis-info-card .result-preview'); // 更新结果预览区选择器
    const analysisCompleteBanner = document.getElementById('analysis-complete-banner'); // 新增的分析完成提示

    // 创建步骤完成工具提示
    const stepCompleteTooltip = document.createElement('div');
    stepCompleteTooltip.className = 'step-complete-tooltip';
    stepCompleteTooltip.innerHTML = '<i class="fas fa-info-circle me-1"></i> 分析即将完成，请等待结果生成...';
    document.body.appendChild(stepCompleteTooltip);

    // 添加分析状态通知图标
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        const notification = document.createElement('div');
        notification.className = 'analyzing-notification';
        notification.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> 分析中';
        uploadArea.appendChild(notification);
    }

    // 如果表单存在，添加提交事件监听器
    if (uploadForm && analyzeBtn) {
        uploadForm.addEventListener('submit', function (e) {
            // 阻止表单默认提交行为
            e.preventDefault();

            // 检查是否已选择文件
            const photoInput = document.getElementById('photo');
            if (!photoInput.files || !photoInput.files[0]) {
                alert('请先选择一张狗狗照片！');
                return;
            }

            // 添加分析活动状态类
            if (mainContainer) {
                mainContainer.classList.add('analyzing-active');
            }

            // 显示分析状态卡片
            if (analysisInfoCard) {
                analysisInfoCard.classList.remove('d-none');

                // 滚动到分析状态卡片 - 修改滚动位置确保标题可见
                setTimeout(function () {
                    const analysisStatusRow = document.getElementById('analysis-status-row');
                    if (analysisStatusRow) {
                        // 计算一个适当的偏移量，确保标题区域可见
                        const offset = window.innerHeight * 0.2; // 视口高度的20%作为偏移
                        const targetPosition = analysisStatusRow.getBoundingClientRect().top + window.pageYOffset - offset;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    } else {
                        // 备用方法
                        analysisInfoCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }

            // 显示结果预览区
            if (resultPreview) {
                resultPreview.classList.remove('d-none');
            }

            // 禁用分析按钮
            analyzeBtn.disabled = true;
            analyzeBtn.classList.add('btn-analyzing');
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>分析中...';

            // 显示分析状态
            simulateProgress();

            // 显示完成提示条
            stepCompleteTooltip.classList.add('show');

            // 给用户一个短暂的时间看到提示，然后提交表单
            setTimeout(function () {
                // 直接提交表单
                uploadForm.submit();
            }, 1000); // 只等待1秒钟，让用户能看到提示条
        });
    }

    // 模拟进度增加函数
    function simulateProgress() {
        const progressBar = document.querySelector('#mini-progress-indicator .progress-bar');
        const progressPercentage = document.querySelector('.progress-percentage');
        const analysisSteps = document.querySelectorAll('.analysis-step');
        const statusText = document.querySelector('.analysis-status');

        if (!statusText) {
            const newStatusText = document.createElement('div');
            newStatusText.className = 'analysis-status text-primary text-center mb-3';
            newStatusText.textContent = '准备分析...';
            if (miniProgressIndicator) {
                miniProgressIndicator.insertAdjacentElement('afterend', newStatusText);
            }
        }

        const statusMessages = [
            '准备分析...',
            '正在加载分析模型...',
            '处理图像数据...',
            '提取图像特征...',
            '应用AI算法分析中...',
            '生成年龄预测结果...'
        ];

        let progress = 0;
        let messageIndex = 0;
        let currentStep = 0;
        let finalStepShown = false; // 跟踪最后步骤是否已显示
        let lastStepDelay = false; // 最后一步是否已延迟

        // 更新状态消息
        function updateStatus() {
            const statusTextElement = document.querySelector('.analysis-status');
            if (messageIndex < statusMessages.length && statusTextElement) {
                statusTextElement.textContent = statusMessages[messageIndex];
                messageIndex++;

                // 更新分析步骤显示
                updateAnalysisSteps();
            }
        }

        // 更新分析步骤状态
        function updateAnalysisSteps() {
            const statusSteps = document.querySelectorAll('.status-step');
            const stepConnectors = document.querySelectorAll('.step-connector');

            // 根据进度更新步骤状态
            if (progress > 30 && currentStep === 0) {
                // 第一步完成，第二步开始
                if (statusSteps && statusSteps.length > 0) {
                    statusSteps[0].classList.remove('active');
                    statusSteps[0].classList.add('completed');
                    statusSteps[0].querySelector('.step-dot i').className = 'fas fa-check';

                    statusSteps[1].classList.add('active');
                    statusSteps[1].querySelector('.step-dot i').className = 'fas fa-cog fa-spin';

                    if (stepConnectors && stepConnectors.length > 0) {
                        stepConnectors[0].classList.add('active');
                    }
                }
                currentStep = 1;
            } else if (progress > 65 && currentStep === 1) {
                // 第二步完成，第三步开始
                if (statusSteps && statusSteps.length > 0) {
                    statusSteps[1].classList.remove('active');
                    statusSteps[1].classList.add('completed');
                    statusSteps[1].querySelector('.step-dot i').className = 'fas fa-check';

                    statusSteps[2].classList.add('active');
                    statusSteps[2].querySelector('.step-dot i').className = 'fas fa-hourglass-half fa-spin';

                    if (stepConnectors && stepConnectors.length > 1) {
                        stepConnectors[1].classList.add('active');
                    }
                }
                currentStep = 2;
            } else if (progress > 88 && currentStep === 2 && !lastStepDelay) {
                // 第三步接近完成，故意放慢速度
                lastStepDelay = true;
                // 放慢速度，确保有足够时间看到对号

                // 在这里添加临近完成状态文本
                const statusTextElement = document.querySelector('.analysis-status');
                if (statusTextElement) {
                    statusTextElement.textContent = '即将完成年龄分析...';
                }
            } else if (progress > 93 && currentStep === 2 && !finalStepShown) {
                // 第三步完成，显示对号
                if (statusSteps && statusSteps.length > 0) {
                    statusSteps[2].classList.remove('active');
                    statusSteps[2].classList.add('completed');
                    statusSteps[2].querySelector('.step-dot i').className = 'fas fa-check';

                    // 添加完成效果
                    statusSteps[2].querySelector('.step-dot').style.animation = 'pulse 0.5s ease-in-out';
                }

                finalStepShown = true;

                // 在这里添加最终状态文本
                const statusTextElement = document.querySelector('.analysis-status');
                if (statusTextElement) {
                    statusTextElement.textContent = '分析完成，正在生成报告...';
                }

                // 更新结果预览内容
                if (resultPreview) {
                    const resultContent = resultPreview.querySelector('.result-preview-content');
                    if (resultContent) {
                        resultContent.innerHTML = `
                            <h6 class="mb-1 text-primary fw-bold">分析完成！</h6>
                            <p class="text-muted small mb-0">即将为您显示详细结果...</p>
                        `;
                    }
                }

                // 显示分析完成横幅
                if (analysisCompleteBanner) {
                    analysisCompleteBanner.classList.remove('d-none');
                    analysisCompleteBanner.style.animation = 'fadeInUp 0.6s ease-out';
                }
            }
        }

        // 初始状态
        updateStatus();

        // 设置进度条更新间隔
        const interval = setInterval(function () {
            // 根据当前进度确定增量
            let increment;

            if (progress < 20) {
                increment = 2.0 + Math.random() * 2.0; // 开始更慢
            } else if (progress < 50) {
                increment = 2.5 + Math.random() * 2.0; // 中间稍快
                if (progress > 20 && messageIndex <= 1) updateStatus();
                if (progress > 30 && messageIndex <= 2) updateStatus();
            } else if (progress < 75) {
                increment = 2.0 + Math.random() * 1.5; // 接近结束稍慢
                if (progress > 50 && messageIndex <= 3) updateStatus();
                if (progress > 60 && messageIndex <= 4) updateStatus();
            } else {
                increment = 1.5 + Math.random() * 1.0; // 最后变得更慢
                if (progress > 80 && messageIndex <= 5) updateStatus();
            }

            // 放慢最后的进度以确保看到所有步骤
            if (progress > 85) {
                increment = 0.8 + Math.random() * 0.5;
            }

            // 特别放慢最后几个百分比
            if (progress > 90) {
                increment = 0.4 + Math.random() * 0.3;
            }

            // 最后一点特别慢
            if (progress > 95) {
                increment = 0.2 + Math.random() * 0.2;
            }

            // 更新进度
            progress = Math.min(progress + increment, 98); // 最多到98%，留下最后2%给服务器响应

            // 更新进度条和百分比文本
            if (progressBar && progressPercentage) {
                progressBar.style.width = progress + '%';
                progressBar.setAttribute('aria-valuenow', progress);
                progressPercentage.textContent = Math.round(progress) + '%';
            }

            // 更新分析步骤
            updateAnalysisSteps();

            // 如果接近完成，清除定时器
            if (progress >= 98) {
                clearInterval(interval);
            }

            // 在高进度时显示结果预览区（如果还没显示）
            if (progress > 80 && resultPreview && resultPreview.classList.contains('d-none')) {
                resultPreview.classList.remove('d-none');
                resultPreview.style.animation = 'fadeIn 0.5s ease-out';
            }
        }, 180); // 更新间隔
    }
}); 