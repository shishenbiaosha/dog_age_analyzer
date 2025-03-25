// auth.js - 登录和注册页面交互脚本

document.addEventListener('DOMContentLoaded', function () {
    // 表单验证
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
        }, false);
    });

    // 密码可见性切换 - 登录页面
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const passwordField = document.getElementById('password');
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // 忘记密码临时提示 - 登录页面
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function () {
            alert('密码重置功能正在开发中。如需帮助，请联系系统管理员。');
        });
    }

    // 密码可见性切换 - 注册页面（第二个密码字段）
    const togglePassword2 = document.getElementById('togglePassword2');
    if (togglePassword2) {
        togglePassword2.addEventListener('click', function () {
            const passwordField = document.getElementById('password2');
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // 密码强度检测
    const passwordInput = document.getElementById('password');
    const passwordStrengthText = document.getElementById('password-strength');
    const strengthMeter = document.querySelector('.strength-meter-fill');
    const password2Input = document.getElementById('password2');
    const matchText = document.getElementById('password-match');

    if (passwordInput && passwordStrengthText && strengthMeter) {
        passwordInput.addEventListener('input', function () {
            const value = this.value;
            let strength = 0;

            if (value.length >= 8) strength += 1;
            if (value.match(/[A-Z]/)) strength += 1;
            if (value.match(/[0-9]/)) strength += 1;
            if (value.match(/[^A-Za-z0-9]/)) strength += 1;

            switch (strength) {
                case 0:
                    strengthMeter.style.width = '0%';
                    strengthMeter.style.background = '#ff4d4d';
                    passwordStrengthText.textContent = '密码强度: 请输入密码';
                    break;
                case 1:
                    strengthMeter.style.width = '25%';
                    strengthMeter.style.background = '#ff4d4d';
                    passwordStrengthText.textContent = '密码强度: 弱';
                    break;
                case 2:
                    strengthMeter.style.width = '50%';
                    strengthMeter.style.background = '#ffb84d';
                    passwordStrengthText.textContent = '密码强度: 中等';
                    break;
                case 3:
                    strengthMeter.style.width = '75%';
                    strengthMeter.style.background = '#4cd964';
                    passwordStrengthText.textContent = '密码强度: 良好';
                    break;
                case 4:
                    strengthMeter.style.width = '100%';
                    strengthMeter.style.background = '#4cd964';
                    passwordStrengthText.textContent = '密码强度: 强';
                    break;
            }

            // 如果在注册页面，检查密码匹配
            if (password2Input && matchText) {
                checkPasswordMatch();
            }
        });
    }

    // 密码确认匹配检查
    function checkPasswordMatch() {
        if (passwordInput.value && password2Input.value) {
            matchText.classList.remove('invisible');
            if (password2Input.value === passwordInput.value) {
                matchText.textContent = '✓ 密码匹配';
                matchText.style.color = '#4cd964';
            } else {
                matchText.textContent = '✗ 密码不匹配';
                matchText.style.color = '#ff4d4d';
            }
        } else {
            matchText.classList.add('invisible');
        }
    }

    // 添加密码2的输入监听器
    if (password2Input && matchText) {
        password2Input.addEventListener('input', checkPasswordMatch);
    }

    // 表单输入动画效果
    const formControls = document.querySelectorAll('.form-control');

    formControls.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('input-focused');
        });

        input.addEventListener('blur', function () {
            if (this.value === '') {
                this.parentElement.classList.remove('input-focused');
            }
        });

        // 检查初始状态
        if (input.value !== '') {
            input.parentElement.classList.add('input-focused');
        }
    });

    // 社交登录按钮悬停效果
    const socialBtns = document.querySelectorAll('.social-btn');

    socialBtns.forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            this.classList.add('social-btn-hover');
        });

        btn.addEventListener('mouseleave', function () {
            this.classList.remove('social-btn-hover');
        });
    });

    // 记住我复选框自定义样式
    const rememberCheckbox = document.getElementById('remember');

    if (rememberCheckbox) {
        // 简化处理方式，不改变DOM结构
        const formCheck = rememberCheckbox.closest('.form-check');
        const label = formCheck.querySelector('label');

        // 直接添加样式类
        formCheck.classList.add('remember-checkbox-container');
        rememberCheckbox.classList.add('custom-remember-checkbox');

        // 确保标签点击功能正常
        if (label) {
            label.classList.add('custom-remember-label');
        }
    }

    // 表单提交加载动画
    const submitButtons = document.querySelectorAll('button[type="submit"]');

    submitButtons.forEach(button => {
        button.addEventListener('click', function () {
            const form = this.closest('form');

            if (form.checkValidity()) {
                this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 处理中...';
                this.disabled = true;

                // 保存原始按钮文本
                if (!this.getAttribute('data-original-text')) {
                    this.setAttribute('data-original-text', this.innerHTML);
                }
            }
        });
    });
}); 