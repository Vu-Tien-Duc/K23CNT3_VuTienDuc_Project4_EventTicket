package com.eventticket.controller.user;

import com.eventticket.entity.G8_users;
import com.eventticket.repository.UserRepository;
import com.eventticket.security.JwtUtil;
import com.eventticket.service.AuthService;
import com.eventticket.service.UserService;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/vtd/member/account")
public class MemberAccountController {

    private final UserService userService;
    private final UserRepository userRepository;

    public MemberAccountController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    private Integer currentUserIdOrThrow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        String email = auth.getName();
        G8_users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user theo email: " + email));
        return user.getUserId();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Integer userId = currentUserIdOrThrow();
        G8_users me = userService.getUserProfile(userId);
        return ResponseEntity.ok(me);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody UpdateMeRequest req) {
        Integer userId = currentUserIdOrThrow();
        G8_users updated = userService.updateProfile(userId, req.fullName, req.phone);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req) {
        Integer userId = currentUserIdOrThrow();
        userService.changePassword(userId, req.oldPassword, req.newPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        // Project hiện chỉ có changePassword (cần oldPassword). Reset password cho user
        // đang đăng nhập
        // có thể triển khai thành đổi mật khẩu trực tiếp, nhưng cần oldPassword.
        // Tạm thời trả 400 nếu client không gửi oldPassword.
        throw new RuntimeException("Reset password cho member hiện chưa được hỗ trợ");
    }

    @Data
    public static class UpdateMeRequest {
        private String fullName;
        private String phone;
    }

    @Data
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
    }

    @Data
    public static class ResetPasswordRequest {
        private String newPassword;
    }
}
