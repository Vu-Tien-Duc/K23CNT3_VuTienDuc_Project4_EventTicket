package com.eventticket.controller.user;

import com.eventticket.entity.G8_AiChatLog;
import com.eventticket.entity.G8_review;
import com.eventticket.entity.G8_users;
import com.eventticket.repository.UserRepository;
import com.eventticket.service.AiChatService;
import com.eventticket.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vtd/member")
public class UserInteractionController {

    private final UserRepository userRepository;
    private final ReviewService reviewService;
    private final AiChatService aiChatService;

    public UserInteractionController(UserRepository userRepository, ReviewService reviewService,
            AiChatService aiChatService) {
        this.userRepository = userRepository;
        this.reviewService = reviewService;
        this.aiChatService = aiChatService;
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

    /**
     * 32) postReview: gửi đánh giá & bình luận (create/update)
     */
    @PostMapping("/reviews")
    public ResponseEntity<G8_review> postReview(@RequestBody PostReviewRequest req) {
        Integer userId = currentUserIdOrThrow();
        G8_review review = reviewService.createReview(userId, req.eventId, req.rating, req.comment);
        return ResponseEntity.ok(review);
    }

    /**
     * Lấy review của event cho member
     */
    @GetMapping("/reviews/event/{eventId}")
    public ResponseEntity<List<G8_review>> getEventReviews(@PathVariable Integer eventId) {
        return ResponseEntity.ok(reviewService.getEventReviews(eventId));
    }

    /**
     * (Optional) Update review
     */
    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<G8_review> updateReview(@PathVariable Integer reviewId,
            @RequestBody UpdateReviewRequest req) {
        return ResponseEntity.ok(reviewService.updateReview(reviewId, req.rating, req.comment));
    }

    /**
     * (Optional) Delete review
     */
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Integer reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok().build();
    }

    /**
     * 33-34) chatWithAI: lưu tin nhắn USER và tin nhắn AI
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chatWithAI(@RequestBody ChatWithAIRequest req) {
        Integer userId = currentUserIdOrThrow();

        // Session code: nếu FE chưa có thì tạo mới
        String sessionCode = (req.sessionCode == null || req.sessionCode.isBlank())
                ? aiChatService.generateSessionCode()
                : req.sessionCode;

        // Lưu USER message
        G8_AiChatLog userLog = aiChatService.saveUserMessage(userRepository.findById(userId).orElseThrow(), sessionCode,
                req.message);

        // TODO: integrate AI model. Hiện lưu response placeholder.
        String responseText = "AI response placeholder";
        G8_AiChatLog aiLog = aiChatService.saveAiResponse(userRepository.findById(userId).orElseThrow(), sessionCode,
                responseText);

        return ResponseEntity.ok(new ChatWithAIResponse(sessionCode, userLog, aiLog));
    }

    /**
     * Lấy history theo session
     */
    @GetMapping("/chat/session/{sessionCode}")
    public ResponseEntity<List<G8_AiChatLog>> getChatHistory(@PathVariable String sessionCode) {
        return ResponseEntity.ok(aiChatService.getChatHistory(sessionCode));
    }

    /**
     * Lấy session của user hiện tại
     */
    @GetMapping("/chat/sessions")
    public ResponseEntity<List<String>> getMyChatSessions() {
        Integer userId = currentUserIdOrThrow();
        return ResponseEntity.ok(aiChatService.getUserSessions(userId));
    }

    @Data
    public static class PostReviewRequest {
        public Integer eventId;
        public Integer rating;
        public String comment;
    }

    @Data
    public static class UpdateReviewRequest {
        public Integer rating;
        public String comment;
    }

    @Data
    public static class ChatWithAIRequest {
        public String sessionCode;
        public String message;
    }

    @Data
    public static class ChatWithAIResponse {
        public String sessionCode;
        public G8_AiChatLog userLog;
        public G8_AiChatLog aiLog;

        public ChatWithAIResponse(String sessionCode, G8_AiChatLog userLog, G8_AiChatLog aiLog) {
            this.sessionCode = sessionCode;
            this.userLog = userLog;
            this.aiLog = aiLog;
        }
    }
}
