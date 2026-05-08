package com.eventticket.controller.user;

import com.eventticket.entity.G8_users;
import com.eventticket.service.AuthService;
import com.eventticket.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vtd/member/account")
public class MemberAccountController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    private Integer currentUserIdOrThrow() {
        // JWT subject đang là email (xem JwtUtil.generateToken)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }

        // Project hiện không có claim userId, nên tạm dùng email->userId là không khả
        // thi nếu không có repo mapping.
        // Do đó controller này cần được bổ sung UserRepository tìm theo email, hoặc
        // chỉnh jwt.
        throw new RuntimeException("Chưa cấu hình currentUserId từ JWT");
    }

    @GetMapping("/me")
    public G8_users getMe() {
        Integer userId = currentUserIdOrThrow();
        return userService.getUserProfile(userId);
    }

    @PutMapping("/me")
    public G8_users updateMe(@RequestBody UpdateMeRequest request) {
        Integer userId = currentUserIdOrThrow();
        return userService.updateUserProfile(userId, request.getFullName(), request.getPhoneNumber());
    }

    @PostMapping("/me/change-password")
    public void changePassword(@RequestBody ChangePasswordRequest request) {
        Integer userId = currentUserIdOrThrow();
        userService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
    }

    @PostMapping("/me/reset-password")
    public void requestResetPassword(@RequestBody ForgotPasswordRequest request) {
        // Thành viên có thể request reset qua email giống guest
        authService.requestPasswordReset(request.getEmail());
    }

    public static class UpdateMeRequest {
        private String fullName;
        private String phoneNumber;

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }
    }

    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;

        public String getOldPassword() {
            return oldPassword;
        }

        public void setOldPassword(String oldPassword) {
            this.oldPassword = oldPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    public static class ForgotPasswordRequest {
        private String email;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}
