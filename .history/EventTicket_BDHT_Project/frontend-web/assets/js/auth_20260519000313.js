document.addEventListener('DOMContentLoaded', () => {
    if (window.pageUtils && typeof window.pageUtils.loadHeader === 'function') {
        window.pageUtils.loadHeader();
    }
    setupLogin();
    setupRegister();
    setupExtendFeatures();
    setupSocialLogin();
});

// ==========================================
// CÁC HÀM TIỆN ÍCH (HELPER FUNCTIONS)
// ==========================================
const SOCIAL_AUTH_CONFIG = window.SOCIAL_AUTH_CONFIG || {};

function isConfigured(value) {
    return value && !value.startsWith('YOUR_');
}

function setLoginMessage(message, color = 'red', elementId = 'login-msg') {
    const msgBox = document.getElementById(elementId) || document.getElementById('login-error');
    if (!msgBox) return;
    msgBox.style.display = 'block';
    msgBox.innerHTML = `<span style="color: ${color};">${message}</span>`;
}

function redirectAfterLogin(user) {
    const userRole = user.role || 'USER';
    if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
        window.location.href = window.pageUtils ? window.pageUtils.resolveUrl('/pages/admin/dashboard.html') : '/pages/admin/dashboard.html';
    } else {
        window.location.href = window.pageUtils ? window.pageUtils.resolveUrl('/pages/index.html') : '/pages/index.html';
    }
}

async function handleAuthSuccess(response) {
    if (!response || !response.user) {
        throw new Error('Không nhận được dữ liệu user từ máy chủ.');
    }

    if (response.token) {
        window.apiClient.setToken(response.token);
    }
    localStorage.setItem('currentUser', JSON.stringify(response.user));
    redirectAfterLogin(response.user);
}

// ==========================================
// 1. XỬ LÝ ĐĂNG NHẬP
// ==========================================
function setupLogin() {
    const loginForm = document.getElementById('loginForm') || document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email') || document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMsg = document.getElementById('login-msg') || document.getElementById('login-error');

        if (!errorMsg) return;
        errorMsg.style.display = 'block';
        errorMsg.innerHTML = '<span style="color: blue;">Đang kiểm tra thông tin xác thực...</span>';

        try {
            const response = await window.apiClient.post('/api/vtd/public/auth/login', {
                email: emailInput.value,
                password: passwordInput.value
            });

            if (response && response.user) {
                errorMsg.innerHTML = `<span style="color: green;">${response.message || 'Đăng nhập thành công! Đang chuyển hướng...'}</span>`;
                setTimeout(() => {
                    handleAuthSuccess(response);
                }, 800);
            } else if (response && response.error) {
                throw new Error(response.error);
            } else {
                throw new Error('Không nhận được dữ liệu user từ máy chủ.');
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            const errorText = (error.message || '').toLowerCase();
            if (errorText.includes('khóa') || errorText.includes('locked')) {
                errorMsg.innerHTML = '<span style="color: orange;">Tài khoản của bạn đã bị khóa! Liên hệ quản trị viên.</span>';
            } else {
                errorMsg.innerHTML = `<span style="color: red;">${error.message || 'Đăng nhập thất bại.'}</span>`;
            }
        }
    });
}

// ==========================================
// 2. XỬ LÝ ĐĂNG KÝ
// ==========================================
function setupRegister() {
    const registerForm = document.getElementById('registerForm') || document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName')?.value || document.getElementById('reg-username')?.value;
        const email = document.getElementById('email')?.value || document.getElementById('reg-email')?.value;
        const phoneNumber = document.getElementById('phoneNumber')?.value || '';
        const password = document.getElementById('password')?.value || document.getElementById('reg-password')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const msgBox = document.getElementById('register-msg');

        if (!msgBox) return;
        msgBox.style.display = 'block';

        if (confirmPassword && password !== confirmPassword) {
            msgBox.innerHTML = '<span style="color: red;">Mật khẩu xác nhận không khớp!</span>';
            return;
        }

        msgBox.innerHTML = '<span style="color: blue;">Đang tạo tài khoản...</span>';

        try {
            const response = await window.apiClient.post('/api/vtd/public/auth/register', {
                fullName: fullName,
                email: email,
                phoneNumber: phoneNumber,
                password: password
            });

            msgBox.innerHTML = `<span style="color: green;">${response.message || 'Đăng ký thành công! Đang chuyển hướng...'}</span>`;
            setTimeout(() => {
                window.location.href = window.pageUtils ? window.pageUtils.resolveUrl('/pages/user/login.html') : '/pages/user/login.html';
            }, 1200);
        } catch (error) {
            msgBox.innerHTML = `<span style="color: red;">${error.message || 'Đăng ký thất bại. Vui lòng thử lại.'}</span>`;
        }
    });
}

// ==========================================
// 3. QUÊN MẬT KHẨU
// ==========================================
function setupExtendFeatures() {
    const btnForgotPassword = document.getElementById('btn-forgot-password');
    if (!btnForgotPassword) return;

    btnForgotPassword.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email')?.value;
        if (!email) {
            alert("Vui lòng nhập Email của bạn vào ô 'Email đăng nhập' rồi bấm nút Quên mật khẩu!");
            return;
        }

        try {
            await window.apiClient.post('/api/vtd/public/auth/forgot-password', { email: email });
            const otp = prompt(`Mã OTP đã được gửi đến ${email}.\nVui lòng nhập mã OTP vào đây:`);
            if (!otp) {
                alert('Bạn đã hủy thao tác nhập OTP.');
                return;
            }
            await window.apiClient.post('/api/vtd/public/auth/verify-otp', { email: email, otp: otp });
            const newPassword = prompt('Xác thực OTP thành công!\nVui lòng nhập mật khẩu mới:');
            if (!newPassword) {
                alert('Bạn đã hủy thao tác đặt lại mật khẩu.');
                return;
            }
            await window.apiClient.post('/api/vtd/public/auth/reset-password', { email: email, newPassword: newPassword });
            alert('Đổi mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.');
        } catch (error) {
            alert('Lỗi: ' + (error.message || 'Đã xảy ra sự cố.'));
        }
    });
}

// ==========================================
// 4. XỬ LÝ ĐĂNG NHẬP MẠNG XÃ HỘI (GOOGLE/FACEBOOK)
// ==========================================
function setupSocialLogin() {
    const btnGoogle = document.getElementById('btn-google');
    const btnFacebook = document.getElementById('btn-facebook');

    if (btnGoogle) {
        btnGoogle.addEventListener('click', (e) => {
            e.preventDefault();
            loginWithGoogle();
        });
    }
    
    if (btnFacebook) {
        btnFacebook.addEventListener('click', (e) => {
            e.preventDefault();
            setLoginMessage('Chức năng đăng nhập bằng Facebook đang được phát triển.', 'orange');

            const facebookDev = document.getElementById('facebook-dev');
            if (facebookDev) facebookDev.style.display = 'block';
        });
    }
}

function loginWithGoogle() {
    if (!isConfigured(SOCIAL_AUTH_CONFIG.googleClientId)) {
        setLoginMessage('Vui lòng cấu hình Google Client ID trước khi dùng đăng nhập Google.');
        return;
    }
    if (!window.google || !google.accounts || !google.accounts.oauth2) {
        setLoginMessage('Google SDK chưa tải xong, vui lòng thử lại sau vài giây.');
        return;
    }

    setLoginMessage('Đang mở đăng nhập Google...', 'blue');
    const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: SOCIAL_AUTH_CONFIG.googleClientId,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
            if (!tokenResponse || !tokenResponse.access_token) {
                setLoginMessage('Google không trả về token đăng nhập.');
                return;
            }

            try {
                const response = await window.apiClient.post('/api/vtd/public/auth/social-login', {
                    provider: 'google',
                    accessToken: tokenResponse.access_token
                });
                setLoginMessage(response.message || 'Đăng nhập Google thành công! Đang chuyển hướng...', 'green');
                setTimeout(() => handleAuthSuccess(response), 600);
            } catch (error) {
                setLoginMessage(error.message || 'Đăng nhập Google thất bại.');
            }
        }
    });
    tokenClient.requestAccessToken();
}