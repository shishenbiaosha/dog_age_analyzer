// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function () {
    // 格式化所有年龄显示
    formatAgeDisplay();

    // 添加图片查看效果
    setupImagePreview();

    // 添加表格行悬停效果
    setupTableRowHover();

    // 初始化筛选表单功能
    setupFilterForm();

    // 增强日期控件
    enhanceDatePickers();

    // 添加分页跳转功能
    setupPageJump();

    // 添加表格行动画
    animateTableRows();

    // 添加筛选标签动画
    animateFilterTags();

    // 添加表单控件动画和增强效果
    enhanceFormControls();

    // 添加筛选卡片入场动画
    animateFilterCard();

    // 初始化Bootstrap工具提示
    initializeTooltips();

    // 页面加载完成后移除可能存在的加载指示器
    window.addEventListener('load', removeLoadingIndicator);

    // 监听AJAX请求完成
    document.addEventListener('readystatechange', function () {
        if (document.readyState === 'complete') {
            setTimeout(removeLoadingIndicator, 500);
        }
    });
});

// 格式化年龄显示为一位小数
function formatAgeDisplay() {
    // 查找所有显示年龄的元素
    const ageElements = document.querySelectorAll('.dog-age');

    ageElements.forEach(function (element) {
        // 获取原始年龄文本
        const originalText = element.textContent.trim();
        // 提取数字部分
        const ageValue = parseFloat(originalText);

        if (!isNaN(ageValue)) {
            // 格式化为一位小数
            const formattedAge = ageValue.toFixed(1);
            // 更新显示文本，保留"岁"字
            element.textContent = formattedAge + ' 岁';

            // 不添加额外的类，保持原有徽章样式
        }
    });
}

// 设置图片预览效果
function setupImagePreview() {
    const dogImages = document.querySelectorAll('.history-image');

    dogImages.forEach(function (img) {
        img.addEventListener('mouseover', function () {
            this.style.transform = 'scale(1.1)';
            this.parentElement.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
        });

        img.addEventListener('mouseout', function () {
            this.style.transform = '';
            this.parentElement.style.boxShadow = '';
        });

        // 点击图片时放大查看
        img.addEventListener('click', function () {
            showImageModal(this.src);
        });
    });
}

// 显示图片模态框
function showImageModal(imgSrc) {
    // 检查是否已存在模态框
    let modal = document.getElementById('image-preview-modal');

    // 如果不存在，创建一个新的
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'image-preview-modal';
        modal.classList.add('image-modal');

        // 创建模态框内容
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="image-modal-close">&times;</span>
                <img class="image-modal-img">
                <div class="image-modal-controls">
                    <button class="btn btn-sm btn-primary zoom-in"><i class="fas fa-search-plus"></i></button>
                    <button class="btn btn-sm btn-primary zoom-out"><i class="fas fa-search-minus"></i></button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 关闭按钮事件
        const closeBtn = modal.querySelector('.image-modal-close');
        closeBtn.onclick = function () {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        // 点击模态框背景也关闭
        modal.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        };

        // 缩放功能
        let zoomLevel = 1;
        const img = modal.querySelector('.image-modal-img');
        const zoomIn = modal.querySelector('.zoom-in');
        const zoomOut = modal.querySelector('.zoom-out');

        zoomIn.onclick = function () {
            zoomLevel += 0.1;
            img.style.transform = `scale(${zoomLevel})`;
        };

        zoomOut.onclick = function () {
            if (zoomLevel > 0.5) {
                zoomLevel -= 0.1;
                img.style.transform = `scale(${zoomLevel})`;
            }
        };
    }

    // 设置图片源
    const modalImg = modal.querySelector('.image-modal-img');
    modalImg.src = imgSrc;

    // 显示模态框
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 设置表格行悬停效果
function setupTableRowHover() {
    const tableRows = document.querySelectorAll('tbody tr');

    tableRows.forEach(function (row) {
        row.addEventListener('mouseover', function () {
            this.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
            this.style.transition = 'background-color 0.3s ease';
        });

        row.addEventListener('mouseout', function () {
            this.style.backgroundColor = '';
        });
    });
}

// 初始化筛选表单功能
function setupFilterForm() {
    const filterForm = document.getElementById('filter-form');

    if (!filterForm) return;

    // 当用户选择变化时自动提交表单（针对管理员）
    const userSelect = document.getElementById('user_id');
    if (userSelect) {
        userSelect.addEventListener('change', function () {
            // 添加加载动画
            addLoadingIndicator();
            filterForm.submit();
        });
    }

    // 保留筛选参数的处理
    const paginationLinks = document.querySelectorAll('.pagination .page-link');
    paginationLinks.forEach(function (link) {
        const url = new URL(link.href);

        // 获取当前的筛选参数
        const currentParams = new URLSearchParams(window.location.search);

        // 保留所有筛选参数，但排除page参数（因为分页链接已包含page参数）
        currentParams.forEach(function (value, key) {
            if (key !== 'page') {
                url.searchParams.set(key, value);
            }
        });

        // 更新链接
        link.href = url.toString();
    });

    // 切换筛选区域显示/隐藏的按钮效果
    const toggleFilterBtn = document.querySelector('.toggle-filter-btn');
    if (toggleFilterBtn) {
        toggleFilterBtn.addEventListener('click', function () {
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-sliders-h')) {
                icon.classList.remove('fa-sliders-h');
                icon.classList.add('fa-times');
                this.innerHTML = '<i class="fas fa-times me-1"></i>隐藏筛选';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-sliders-h');
                this.innerHTML = '<i class="fas fa-sliders-h me-1"></i>显示筛选';
            }
        });
    }

    // 绑定表单提交事件
    filterForm.addEventListener('submit', function (e) {
        // 在表单提交前添加加载指示器
        addLoadingIndicator();

        // 按钮动画
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                submitBtn.style.transform = '';
            }, 200);
        }
    });

    // 为重置按钮添加点击动画
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('mousedown', function () {
            this.style.transform = 'scale(0.95)';
        });

        resetBtn.addEventListener('mouseup', function () {
            this.style.transform = '';
        });

        resetBtn.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    }

    // 为清除所有筛选按钮添加点击事件
    const resetFilters = document.querySelector('.reset-filters');
    if (resetFilters) {
        resetFilters.addEventListener('click', function (e) {
            // 添加加载动画
            addLoadingIndicator();
        });
    }

    // 为所有分页链接添加加载指示器
    paginationLinks.forEach(link => {
        if (!link.getAttribute('href') || link.getAttribute('href') === '#') return;

        link.addEventListener('click', function (e) {
            // 只有当链接不是禁用状态且有href时才添加加载指示器
            if (!this.classList.contains('disabled') && this.getAttribute('href') !== '#') {
                addLoadingIndicator();
            }
        });
    });

    // 跳转页面表单
    setupPageJump();
}

// 添加加载指示器
function addLoadingIndicator() {
    // 如果已经存在加载指示器，则不重复添加
    if (document.querySelector('.loading-overlay')) {
        return;
    }

    // 使用模板字符串创建加载指示器元素
    const loadingHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>加载中...</span>
        </div>
    `;

    // 创建覆盖层并添加内容
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = loadingHTML;
    document.body.appendChild(loadingOverlay);

    // 强制重排以确保动画效果
    loadingOverlay.offsetHeight;

    // 显示加载指示器
    loadingOverlay.style.opacity = '1';

    return loadingOverlay;
}

// 移除加载指示器
function removeLoadingIndicator() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (!loadingOverlay) return;

    // 淡出动画
    loadingOverlay.style.opacity = '0';

    // 动画完成后移除元素
    setTimeout(() => {
        if (document.body.contains(loadingOverlay)) {
            document.body.removeChild(loadingOverlay);
        }
    }, 300); // 与CSS中的transition时间相匹配
}

// 增强日期选择器功能
function enhanceDatePickers() {
    const dateFrom = document.getElementById('date_from');
    const dateTo = document.getElementById('date_to');
    const filterForm = document.getElementById('filter-form');

    if (!dateFrom || !dateTo || !filterForm) return;

    // 为日期输入框添加占位符提示
    dateFrom.setAttribute('placeholder', '开始日期');
    dateTo.setAttribute('placeholder', '结束日期');

    // 添加辅助文本提示
    const dateFromContainer = dateFrom.closest('.date-input-group');
    const dateToContainer = dateTo.closest('.date-input-group');

    if (dateFromContainer && dateToContainer) {
        // 添加日期值的可视化显示
        function updateDateDisplay(input, container) {
            if (!container.querySelector('.date-display')) {
                const dateDisplay = document.createElement('div');
                dateDisplay.className = 'date-display';
                dateDisplay.style.position = 'absolute';
                dateDisplay.style.top = '50%';
                dateDisplay.style.left = '70px';
                dateDisplay.style.transform = 'translateY(-50%)';
                dateDisplay.style.pointerEvents = 'none';
                dateDisplay.style.color = '#4b5563';
                dateDisplay.style.fontSize = '0.95rem';
                dateDisplay.style.fontWeight = '500';
                dateDisplay.style.opacity = '0';
                dateDisplay.style.transition = 'opacity 0.3s ease';
                container.style.position = 'relative';
                container.appendChild(dateDisplay);
            }

            const dateDisplay = container.querySelector('.date-display');
            if (input.value) {
                const date = new Date(input.value);
                const formattedDate = date.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                dateDisplay.textContent = formattedDate;
                dateDisplay.style.opacity = '1';
            } else {
                dateDisplay.style.opacity = '0';
            }
        }

        // 初始化日期显示
        updateDateDisplay(dateFrom, dateFromContainer);
        updateDateDisplay(dateTo, dateToContainer);

        // 当日期输入变化时更新显示
        dateFrom.addEventListener('change', function () {
            updateDateDisplay(this, dateFromContainer);
        });

        dateTo.addEventListener('change', function () {
            updateDateDisplay(this, dateToContainer);
        });
    }

    // 设置日期范围限制并处理日期变化
    dateFrom.addEventListener('change', function () {
        // 应用日期限制
        if (this.value) {
            dateTo.min = this.value;
            // 如果结束日期早于开始日期，更新结束日期
            if (dateTo.value && dateTo.value < this.value) {
                dateTo.value = this.value;
                updateDateDisplay(dateTo, dateToContainer);
            }

            // 向用户显示确认反馈
            showDateChangeToast("已选择开始日期", "success");

            // 在移动设备上自动提交
            if (window.innerWidth < 768 && !dateTo.value) {
                // 添加轻微延迟让用户看到日期选择
                setTimeout(() => {
                    addLoadingIndicator();
                    filterForm.submit();
                }, 300);
            }
        } else {
            // 清除限制
            dateTo.min = '';
        }
    });

    dateTo.addEventListener('change', function () {
        if (this.value) {
            dateFrom.max = this.value;
            // 如果开始日期晚于结束日期，更新开始日期
            if (dateFrom.value && dateFrom.value > this.value) {
                dateFrom.value = this.value;
                updateDateDisplay(dateFrom, dateFromContainer);
            }

            // 显示确认反馈
            showDateChangeToast("已选择结束日期", "success");

            // 在移动设备上自动提交
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    addLoadingIndicator();
                    filterForm.submit();
                }, 300);
            }
        } else {
            // 清除限制
            dateFrom.max = '';
        }
    });

    // 设置日期格式化和自动填充辅助功能
    [dateFrom, dateTo].forEach(function (dateInput) {
        // 添加日期选择交互改进
        dateInput.addEventListener('focus', function () {
            const container = this.closest('.date-input-group');
            if (container) {
                container.classList.add('date-input-focus');

                // 添加动画效果
                const icon = container.querySelector('i');
                if (icon) {
                    icon.classList.add('label-icon-animate');
                    setTimeout(() => {
                        icon.classList.remove('label-icon-animate');
                    }, 600);
                }
            }
        });

        dateInput.addEventListener('blur', function () {
            const container = this.closest('.date-input-group');
            if (container) {
                container.classList.remove('date-input-focus');
            }
        });

        // 添加双击清空功能
        dateInput.addEventListener('dblclick', function () {
            this.value = '';
            // 更新相应的显示
            if (this.id === 'date_from') {
                updateDateDisplay(this, dateFromContainer);
                dateTo.min = '';
            } else {
                updateDateDisplay(this, dateToContainer);
                dateFrom.max = '';
            }
            showDateChangeToast("已清除日期", "info");
        });
    });

    // 初始化
    if (dateFrom.value) {
        dateTo.min = dateFrom.value;
    }
    if (dateTo.value) {
        dateFrom.max = dateTo.value;
    }
}

// 显示日期变更确认提示
function showDateChangeToast(message, type = "success") {
    // 检查是否已存在toast
    let toast = document.getElementById('date-change-toast');

    if (!toast) {
        // 创建toast元素
        toast = document.createElement('div');
        toast.id = 'date-change-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '0.75rem 1.25rem';
        toast.style.borderRadius = '30px';
        toast.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        toast.style.zIndex = '9999';
        toast.style.fontSize = '0.95rem';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.transition = 'all 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px)';
        document.body.appendChild(toast);
    }

    // 设置toast类型样式
    if (type === "success") {
        toast.style.backgroundColor = 'rgba(16, 185, 129, 0.9)';
        toast.style.color = 'white';
        toast.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;
    } else {
        toast.style.backgroundColor = 'rgba(59, 130, 246, 0.9)';
        toast.style.color = 'white';
        toast.innerHTML = `<i class="fas fa-info-circle me-2"></i>${message}`;
    }

    // 显示toast
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%, 0)';
    }, 10);

    // 自动隐藏
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px)';

        // 移除元素
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

// 添加分页跳转功能
function setupPageJump() {
    const jumpForm = document.getElementById('jump-to-page');
    if (!jumpForm) return;

    const pageInput = document.getElementById('page-input');
    if (!pageInput) return;

    // 添加波纹效果
    const jumpBtn = jumpForm.querySelector('.jump-btn');
    if (jumpBtn) {
        jumpBtn.addEventListener('click', function (e) {
            // 创建波纹元素
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            this.appendChild(ripple);

            // 设置波纹位置
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            // 波纹动画结束后移除
            ripple.addEventListener('animationend', function () {
                this.remove();
            });
        });
    }

    jumpForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const page = parseInt(pageInput.value);
        if (isNaN(page) || page < 1 || page > parseInt(pageInput.getAttribute('max'))) {
            showDateChangeToast('请输入有效的页码', 'error');
            return;
        }

        // 添加加载指示器
        addLoadingIndicator();

        // 构建URL
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        params.set('page', page);

        // 跳转到指定页面
        window.location.href = window.location.pathname + '?' + params.toString();
    });

    // 增强输入框交互体验
    pageInput.addEventListener('focus', function () {
        this.select();
    });

    pageInput.addEventListener('keydown', function (e) {
        // 按Enter键提交表单
        if (e.key === 'Enter') {
            e.preventDefault();
            jumpForm.dispatchEvent(new Event('submit'));
        }
    });
}

// 表格行动画效果
function animateTableRows() {
    const tableRows = document.querySelectorAll('.table-row-animate');

    // 检查是否有表格行
    if (tableRows.length === 0) return;

    // 使用IntersectionObserver观察表格行出现在视口中
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 已经应用了CSS动画，这里不需要添加额外的动画
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // 观察每一行
    tableRows.forEach(row => {
        observer.observe(row);
    });
}

// 筛选标签动画
function animateFilterTags() {
    const filterTags = document.querySelectorAll('.active-filters .badge, .active-filters .filter-badge');

    filterTags.forEach((tag, index) => {
        // 添加延迟显示动画
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(10px)';
        tag.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, 100 * index);

        // 对于user-badge类的标签，保留其原有动画效果
        if (!tag.classList.contains('user-badge')) {
            // 添加悬停效果和波纹动画
            tag.addEventListener('mouseover', function () {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.1)';
                // 触发波纹动画
                activateShimmer(this);
            });

            tag.addEventListener('mouseout', function () {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.05)';
            });
        } else {
            // user-badge类的标签使用CSS中已定义的悬停效果
            // 但仍然应用初始动画
            tag.addEventListener('mouseover', function () {
                // 针对user-badge标签的特定效果处理
                activateShimmer(this);
            });
        }
    });
}

// 添加波纹动画效果
function activateShimmer(element) {
    // 重置动画
    element.style.animation = 'none';
    element.offsetHeight; // 触发重流
    element.style.animation = '';

    // 如果元素上有::before伪元素有shimmer动画，使用JS手动操作动画
    const shimmerEffect = document.createElement('div');
    shimmerEffect.style.position = 'absolute';
    shimmerEffect.style.top = '0';
    shimmerEffect.style.left = '0';
    shimmerEffect.style.width = '100%';
    shimmerEffect.style.height = '100%';
    shimmerEffect.style.background = 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)';
    shimmerEffect.style.transform = 'translateX(-100%)';
    shimmerEffect.style.animation = 'shimmer 1.5s forwards';
    shimmerEffect.style.pointerEvents = 'none';
    shimmerEffect.style.zIndex = '1';

    element.style.overflow = 'hidden';
    element.appendChild(shimmerEffect);

    // 动画结束后移除元素
    setTimeout(() => {
        if (element.contains(shimmerEffect)) {
            element.removeChild(shimmerEffect);
        }
    }, 1500);
}

// 增强表单控件
function enhanceFormControls() {
    // 为所有输入框添加焦点效果
    const inputs = document.querySelectorAll('.form-control, .form-select');

    inputs.forEach(input => {
        // 为每个输入框父容器添加焦点类
        input.addEventListener('focus', function () {
            // 如果父元素是input-group，给父元素添加类
            if (this.parentElement.classList.contains('input-group')) {
                this.parentElement.classList.add('input-focus');
            }
            // 添加脉冲动画效果
            this.classList.add('pulse-focus');
        });

        input.addEventListener('blur', function () {
            // 移除焦点类
            if (this.parentElement.classList.contains('input-group')) {
                this.parentElement.classList.remove('input-focus');
            }
            // 移除脉冲动画
            this.classList.remove('pulse-focus');
        });

        // 添加值变化的视觉反馈
        if (input.classList.contains('form-select')) {
            input.addEventListener('change', function () {
                // 选择框变化动画
                this.classList.add('select-changed');
                setTimeout(() => {
                    this.classList.remove('select-changed');
                }, 500);
            });
        }
    });

    // 为筛选按钮添加波纹效果
    const filterBtns = document.querySelectorAll('.filter-btn, .reset-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            // 创建波纹效果
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            this.appendChild(ripple);

            // 动画结束后移除
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 为标签图标添加动画
    const labelIcons = document.querySelectorAll('.label-icon');

    labelIcons.forEach(icon => {
        const label = icon.closest('.label-with-icon');
        if (label) {
            label.addEventListener('mouseover', function () {
                icon.classList.add('label-icon-animate');
            });

            label.addEventListener('mouseout', function () {
                icon.classList.remove('label-icon-animate');
            });
        }
    });
}

// 添加筛选卡片入场动画
function animateFilterCard() {
    const filterCard = document.querySelector('.filter-card');

    if (filterCard) {
        // 初始状态
        filterCard.style.opacity = '0';
        filterCard.style.transform = 'translateY(-10px)';

        // 触发动画
        setTimeout(() => {
            filterCard.style.transition = 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)';
            filterCard.style.opacity = '1';
            filterCard.style.transform = 'translateY(0)';
        }, 100);
    }

    // 筛选标题图标动画
    const filterIcon = document.querySelector('.filter-icon');
    if (filterIcon) {
        setTimeout(() => {
            filterIcon.classList.add('filter-icon-pulse');

            // 移除动画类以便于再次触发
            setTimeout(() => {
                filterIcon.classList.remove('filter-icon-pulse');
            }, 1000);
        }, 500);
    }

    // 为筛选表单输入框添加动画效果
    animateFilterFormInputs();
}

// 为筛选表单输入框添加动画效果
function animateFilterFormInputs() {
    const filterInputs = document.querySelectorAll('#filter-form .form-control, #filter-form .form-select');
    const inputGroups = document.querySelectorAll('#filter-form .input-group');

    // 输入框逐个淡入
    filterInputs.forEach((input, index) => {
        input.style.opacity = '0';
        input.style.transform = 'translateY(10px)';
        input.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            input.style.opacity = '1';
            input.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
    });

    // 输入组悬停效果增强
    inputGroups.forEach(group => {
        group.addEventListener('mouseenter', () => {
            group.style.transform = 'translateY(-2px)';
            group.style.boxShadow = '0 6px 15px rgba(99, 102, 241, 0.15)';
        });

        group.addEventListener('mouseleave', () => {
            group.style.transform = '';
            group.style.boxShadow = '';
        });
    });

    // 为筛选按钮添加波纹效果
    const filterBtn = document.querySelector('.filter-btn');
    const resetBtn = document.querySelector('.reset-btn');

    if (filterBtn && resetBtn) {
        [filterBtn, resetBtn].forEach(btn => {
            btn.addEventListener('click', function (e) {
                const x = e.clientX - this.getBoundingClientRect().left;
                const y = e.clientY - this.getBoundingClientRect().top;

                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// 设置日期筛选功能
function setupDateFilters() {
    const dateFrom = document.getElementById('date_from');
    const dateTo = document.getElementById('date_to');
    const filterForm = document.getElementById('filter-form');

    if (!dateFrom || !dateTo || !filterForm) return;

    // 初始化日期控件
    enhanceDatePickers();

    // 监听日期变化
    dateFrom.addEventListener('change', function () {
        // 验证日期范围
        if (dateTo.value && this.value > dateTo.value) {
            // 如果开始日期晚于结束日期，调整结束日期
            dateTo.value = this.value;
            showDateChangeToast('结束日期已自动调整', 'warning');
        }

        // 更新日期显示
        showDateChangeToast('开始日期已更新: ' + formatDateForDisplay(this.value));

        // 自动提交表单 (添加延迟让Toast显示)
        setTimeout(() => {
            addLoadingIndicator(); // 添加加载指示器
            filterForm.submit();
        }, 500);
    });

    dateTo.addEventListener('change', function () {
        // 验证日期范围
        if (dateFrom.value && this.value < dateFrom.value) {
            // 如果结束日期早于开始日期，调整开始日期
            dateFrom.value = this.value;
            showDateChangeToast('开始日期已自动调整', 'warning');
        }

        // 更新日期显示
        showDateChangeToast('结束日期已更新: ' + formatDateForDisplay(this.value));

        // 自动提交表单 (添加延迟让Toast显示)
        setTimeout(() => {
            addLoadingIndicator(); // 添加加载指示器
            filterForm.submit();
        }, 500);
    });
}

// 更新日期显示
function updateDateDisplay() {
    const dateFrom = document.getElementById('date_from');
    const dateTo = document.getElementById('date_to');
    const dateDisplay = document.querySelector('.date-display');

    if (!dateDisplay) return;

    if (dateFrom.value || dateTo.value) {
        let displayText = '<i class="bi bi-calendar-check text-primary me-2"></i>选择的日期范围: ';

        if (dateFrom.value && dateTo.value) {
            if (dateFrom.value === dateTo.value) {
                displayText += `<strong>${formatDateForDisplay(dateFrom.value)}</strong>`;
            } else {
                displayText += `从 <strong>${formatDateForDisplay(dateFrom.value)}</strong> 到 <strong>${formatDateForDisplay(dateTo.value)}</strong>`;
            }
        } else if (dateFrom.value) {
            displayText += `从 <strong>${formatDateForDisplay(dateFrom.value)}</strong> 开始`;
        } else if (dateTo.value) {
            displayText += `截至 <strong>${formatDateForDisplay(dateTo.value)}</strong>`;
        }

        dateDisplay.innerHTML = displayText;
        dateDisplay.style.display = 'block';
    } else {
        dateDisplay.innerHTML = '<i class="bi bi-calendar text-muted me-2"></i>未选择日期范围';
        dateDisplay.style.display = 'block';
    }
}

// 格式化日期为更友好的显示格式
function formatDateForDisplay(dateStr) {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // 检查是否是今天或昨天
    if (date.toDateString() === today.toDateString()) {
        return `今天 (${year}-${month}-${day})`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `昨天 (${year}-${month}-${day})`;
    } else {
        return `${year}-${month}-${day}`;
    }
}

// 初始化自定义工具提示
function initializeTooltips() {
    // 获取所有需要tooltip的元素
    const tooltipTriggers = document.querySelectorAll('[data-bs-toggle="tooltip"]');

    // 创建一个全局tooltip容器
    let tooltipContainer = document.getElementById('fixed-tooltip-container');
    if (!tooltipContainer) {
        tooltipContainer = document.createElement('div');
        tooltipContainer.id = 'fixed-tooltip-container';
        tooltipContainer.style.position = 'fixed';
        tooltipContainer.style.zIndex = '10000';
        tooltipContainer.style.pointerEvents = 'none';
        document.body.appendChild(tooltipContainer);
    }

    // 当前显示的tooltip
    let currentTooltip = null;
    let tooltipTimeout = null;

    // 为每个触发元素添加事件监听
    tooltipTriggers.forEach(trigger => {
        // 获取tooltip内容
        let title = trigger.getAttribute('data-bs-title') || trigger.getAttribute('title') || '';
        const placement = trigger.getAttribute('data-bs-placement') || 'top';
        const html = trigger.getAttribute('data-bs-html') === 'true';

        // 创建自定义tooltip显示函数
        const showTooltip = () => {
            // 清除任何现有的tooltip超时
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }

            // 如果已有tooltip显示，先清除
            if (currentTooltip) {
                tooltipContainer.innerHTML = '';
                currentTooltip = null;
            }

            // 获取触发元素位置
            const rect = trigger.getBoundingClientRect();
            const triggerMiddle = rect.left + rect.width / 2;

            // 创建tooltip元素
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip tooltip-fixed bs-tooltip-' + placement + ' show';

            // 创建tooltip内容
            let tooltipContent = '';

            // 标准tooltip
            tooltipContent = `
                <div class="tooltip-arrow" style="position: absolute;"></div>
                <div class="tooltip-inner">${html ? title : escapeHtml(title)}</div>
            `;

            tooltip.innerHTML = tooltipContent;
            tooltipContainer.appendChild(tooltip);
            currentTooltip = tooltip;

            // 计算tooltip位置
            const tooltipRect = tooltip.getBoundingClientRect();

            // 根据placement计算位置
            let top, left;

            switch (placement) {
                case 'top':
                    top = rect.top - tooltipRect.height - 10;
                    left = triggerMiddle - (tooltipRect.width / 2);
                    break;
                case 'bottom':
                    top = rect.bottom + 10;
                    left = triggerMiddle - (tooltipRect.width / 2);
                    break;
                case 'left':
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                    left = rect.left - tooltipRect.width - 10;
                    break;
                case 'right':
                    top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                    left = rect.right + 10;
                    break;
                default:
                    top = rect.top - tooltipRect.height - 10;
                    left = triggerMiddle - (tooltipRect.width / 2);
            }

            // 确保tooltip不会超出视窗
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // 水平方向调整
            if (left < 10) left = 10;
            if (left + tooltipRect.width > viewportWidth - 10) {
                left = viewportWidth - tooltipRect.width - 10;
            }

            // 垂直方向调整
            if (top < 10) {
                // 如果在顶部没有足够空间，尝试显示在底部
                if (placement === 'top') {
                    top = rect.bottom + 10;
                    tooltip.classList.remove('bs-tooltip-top');
                    tooltip.classList.add('bs-tooltip-bottom');
                } else {
                    top = 10;
                }
            }

            if (top + tooltipRect.height > viewportHeight - 10) {
                // 如果在底部没有足够空间，尝试显示在顶部
                if (placement === 'bottom') {
                    top = rect.top - tooltipRect.height - 10;
                    tooltip.classList.remove('bs-tooltip-bottom');
                    tooltip.classList.add('bs-tooltip-top');
                } else {
                    top = viewportHeight - tooltipRect.height - 10;
                }
            }

            // 应用定位
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;

            // 设置箭头位置
            const arrow = tooltip.querySelector('.tooltip-arrow');
            if (arrow) {
                if (tooltip.classList.contains('bs-tooltip-top') || tooltip.classList.contains('bs-tooltip-bottom')) {
                    const arrowLeft = triggerMiddle - left - arrow.offsetWidth / 2;
                    arrow.style.left = `${arrowLeft}px`;

                    if (tooltip.classList.contains('bs-tooltip-top')) {
                        arrow.style.bottom = '-6px';
                    } else {
                        arrow.style.top = '-6px';
                    }
                } else if (tooltip.classList.contains('bs-tooltip-left') || tooltip.classList.contains('bs-tooltip-right')) {
                    const arrowTop = rect.top + rect.height / 2 - top - arrow.offsetHeight / 2;
                    arrow.style.top = `${arrowTop}px`;

                    if (tooltip.classList.contains('bs-tooltip-left')) {
                        arrow.style.right = '-6px';
                    } else {
                        arrow.style.left = '-6px';
                    }
                }
            }

            // 添加动画
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(10px)';

            requestAnimationFrame(() => {
                tooltip.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(0)';
            });
        };

        // 隐藏tooltip函数
        const hideTooltip = () => {
            if (currentTooltip) {
                currentTooltip.style.opacity = '0';
                currentTooltip.style.transform = 'translateY(10px)';

                tooltipTimeout = setTimeout(() => {
                    tooltipContainer.innerHTML = '';
                    currentTooltip = null;
                    tooltipTimeout = null;
                }, 300);
            }
        };

        // 添加鼠标事件
        trigger.addEventListener('mouseenter', showTooltip);
        trigger.addEventListener('mouseleave', hideTooltip);
        trigger.addEventListener('focus', showTooltip);
        trigger.addEventListener('blur', hideTooltip);

        // 移除默认标题属性以防止默认tooltip显示
        if (trigger.hasAttribute('title')) {
            trigger.setAttribute('data-original-title', trigger.getAttribute('title'));
            trigger.removeAttribute('title');
        }
    });

    // 处理页面滚动和调整大小事件
    ['scroll', 'resize'].forEach(event => {
        window.addEventListener(event, () => {
            if (currentTooltip && tooltipContainer.querySelector('.tooltip')) {
                // 找到当前活动的触发元素
                const activeTrigger = Array.from(tooltipTriggers).find(t =>
                    t.matches(':hover') || t === document.activeElement
                );

                if (activeTrigger) {
                    // 重新定位tooltip
                    const rect = activeTrigger.getBoundingClientRect();
                    const triggerMiddle = rect.left + rect.width / 2;
                    const tooltipRect = currentTooltip.getBoundingClientRect();

                    // 确定tooltip的最佳位置
                    let placement = activeTrigger.getAttribute('data-bs-placement') || 'top';
                    let top, left;

                    switch (placement) {
                        case 'top':
                            top = rect.top - tooltipRect.height - 10;
                            left = triggerMiddle - (tooltipRect.width / 2);
                            break;
                        case 'bottom':
                            top = rect.bottom + 10;
                            left = triggerMiddle - (tooltipRect.width / 2);
                            break;
                        case 'left':
                            top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                            left = rect.left - tooltipRect.width - 10;
                            break;
                        case 'right':
                            top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                            left = rect.right + 10;
                            break;
                        default:
                            top = rect.top - tooltipRect.height - 10;
                            left = triggerMiddle - (tooltipRect.width / 2);
                    }

                    // 应用边界检查
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;

                    // 水平调整
                    if (left < 10) left = 10;
                    if (left + tooltipRect.width > viewportWidth - 10) {
                        left = viewportWidth - tooltipRect.width - 10;
                    }

                    // 垂直调整
                    if (top < 10) {
                        if (placement === 'top') {
                            placement = 'bottom';
                            top = rect.bottom + 10;
                        } else {
                            top = 10;
                        }
                    }

                    if (top + tooltipRect.height > viewportHeight - 10) {
                        if (placement === 'bottom') {
                            placement = 'top';
                            top = rect.top - tooltipRect.height - 10;
                        } else {
                            top = viewportHeight - tooltipRect.height - 10;
                        }
                    }

                    // 更新tooltip类
                    currentTooltip.className = `tooltip tooltip-fixed bs-tooltip-${placement} show`;

                    // 立即应用位置更新
                    currentTooltip.style.transition = 'none';
                    currentTooltip.style.top = `${top}px`;
                    currentTooltip.style.left = `${left}px`;

                    // 更新箭头位置
                    const arrow = currentTooltip.querySelector('.tooltip-arrow');
                    if (arrow) {
                        if (currentTooltip.classList.contains('bs-tooltip-top') || currentTooltip.classList.contains('bs-tooltip-bottom')) {
                            const arrowLeft = triggerMiddle - left - arrow.offsetWidth / 2;
                            arrow.style.left = `${arrowLeft}px`;

                            if (currentTooltip.classList.contains('bs-tooltip-top')) {
                                arrow.style.bottom = '-6px';
                            } else {
                                arrow.style.top = '-6px';
                            }
                        } else if (currentTooltip.classList.contains('bs-tooltip-left') || currentTooltip.classList.contains('bs-tooltip-right')) {
                            const arrowTop = rect.top + rect.height / 2 - top - arrow.offsetHeight / 2;
                            arrow.style.top = `${arrowTop}px`;

                            if (currentTooltip.classList.contains('bs-tooltip-left')) {
                                arrow.style.right = '-6px';
                            } else {
                                arrow.style.left = '-6px';
                            }
                        }
                    }
                }
            }
        }, { passive: true });
    });

    // 添加CSS动画
    if (!document.getElementById('tooltip-animations')) {
        var style = document.createElement('style');
        style.id = 'tooltip-animations';
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 0.2; }
                50% { opacity: 0.3; }
                100% { opacity: 0.2; }
            }
            
            /* 固定tooltip的样式 */
            .tooltip-fixed {
                position: fixed !important;
                z-index: 9999 !important;
                pointer-events: none !important;
            }
            
            /* 箭头样式 */
            .tooltip .tooltip-arrow {
                position: absolute;
                width: 0;
                height: 0;
                border-style: solid;
            }
            
            .bs-tooltip-top .tooltip-arrow {
                bottom: -6px;
                border-width: 6px 6px 0;
                border-color: white transparent transparent transparent;
            }
            
            .bs-tooltip-bottom .tooltip-arrow {
                top: -6px;
                border-width: 0 6px 6px;
                border-color: transparent transparent white transparent;
            }
            
            .bs-tooltip-left .tooltip-arrow {
                right: -6px;
                border-width: 6px 0 6px 6px;
                border-color: transparent transparent transparent white;
            }
            
            .bs-tooltip-right .tooltip-arrow {
                left: -6px;
                border-width: 6px 6px 6px 0;
                border-color: transparent white transparent transparent;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 转义HTML
 * @param {string} str - 需要转义的字符串
 * @returns {string} - 转义后的字符串
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * 添加脉动动画的关键帧
 */
if (!document.getElementById('pulse-animation')) {
    const style = document.createElement('style');
    style.id = 'pulse-animation';
    style.textContent = `
        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
        }
    `;
    document.head.appendChild(style);
}
