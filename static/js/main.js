document.addEventListener('DOMContentLoaded', function () {
    // 初始化 AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // 图片上传预览
    const photoInput = document.getElementById('photo');
    const uploadArea = document.querySelector('.upload-area');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('preview-image');
    const uploadForm = document.getElementById('upload-form');

    if (photoInput && uploadArea) {
        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', function () {
            photoInput.click();
        });

        // 拖拽文件上传
        uploadArea.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadArea.classList.add('border-primary');
        });

        uploadArea.addEventListener('dragleave', function () {
            uploadArea.classList.remove('border-primary');
        });

        uploadArea.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadArea.classList.remove('border-primary');

            if (e.dataTransfer.files.length) {
                photoInput.files = e.dataTransfer.files;
                handleFileSelect();
            }
        });

        // 文件选择处理
        photoInput.addEventListener('change', handleFileSelect);

        function handleFileSelect() {
            if (photoInput.files && photoInput.files[0]) {
                const file = photoInput.files[0];

                // 检查文件类型
                const fileType = file.type;
                if (fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/jpg') {
                    alert('请选择 JPG, JPEG 或 PNG 格式的图片！');
                    return;
                }

                // 检查文件大小（限制为5MB）
                if (file.size > 5 * 1024 * 1024) {
                    alert('图片大小不能超过5MB！');
                    return;
                }

                // 显示预览
                const reader = new FileReader();
                reader.onload = function (e) {
                    previewImage.src = e.target.result;
                    previewContainer.classList.remove('d-none');
                    uploadArea.classList.add('d-none');
                };
                reader.readAsDataURL(file);

                // 启用提交按钮
                const submitBtn = document.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
            }
        }

        // 重新上传按钮
        const reuploadBtn = document.getElementById('reupload-btn');
        if (reuploadBtn) {
            reuploadBtn.addEventListener('click', function (e) {
                e.preventDefault();
                previewContainer.classList.add('d-none');
                uploadArea.classList.remove('d-none');
                photoInput.value = '';

                // 禁用提交按钮
                const submitBtn = document.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                }
            });
        }
    }

    // 表单验证 - 仅用于非auth页面的表单
    const forms = document.querySelectorAll('.needs-validation:not(.auth-form)');
    Array.from(forms).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // 分析结果页面动画
    const resultCard = document.querySelector('.result-card');
    if (resultCard) {
        resultCard.classList.add('animate-fade-in');
    }

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 返回顶部按钮
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 自动关闭警告消息
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        // 为关闭按钮添加点击事件
        const closeBtn = alert.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                // 添加淡出动画
                alert.classList.remove('animate__fadeIn');
                alert.classList.add('animate__fadeOut');

                // 等待动画完成后移除元素
                setTimeout(() => {
                    alert.remove();
                }, 500);
            });
        }

        // 3秒后自动关闭
        setTimeout(() => {
            // 添加淡出动画
            alert.classList.remove('animate__fadeIn');
            alert.classList.add('animate__fadeOut');

            // 等待动画完成后移除元素
            setTimeout(() => {
                alert.remove();
            }, 500);
        }, 3000);
    });
}); 