package com.eventticket.controller.user;

import com.eventticket.entity.G8_review;
import com.eventticket.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vtd/member/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    private Integer currentUserIdOrThrow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }
        // JWT subject là email; cần mapping email->userId nếu muốn dùng review theo
        // userId.
        // Hiện tại chưa cấu hình mapping trong controller.
        throw new RuntimeException("Chưa cấu hình currentUserId từ JWT");
    }

    @GetMapping("/event/{eventId}")
    public List<G8_review> getEventReviews(@PathVariable Integer eventId) {
        return reviewService.getEventReviews(eventId);
    }

    @PostMapping("/event/{eventId}")
    public G8_review createOrUpdateReview(@PathVariable Integer eventId, @RequestBody CreateReviewRequest req) {
        Integer userId = currentUserIdOrThrow();
        return reviewService.createReview(userId, eventId, req.getRating(), req.getComment());
    }

    @PutMapping("/{reviewId}")
    public G8_review updateReview(@PathVariable Integer reviewId, @RequestBody UpdateReviewRequest req) {
        return reviewService.updateReview(reviewId, req.getRating(), req.getComment());
    }

    @DeleteMapping("/{reviewId}")
    public void deleteReview(@PathVariable Integer reviewId) {
        reviewService.deleteReview(reviewId);
    }

    @PostMapping("/{reviewId}/hide")
    public void hideReview(@PathVariable Integer reviewId) {
        reviewService.hideReview(reviewId);
    }

    public static class CreateReviewRequest {
        private Integer rating;
        private String comment;

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }
    }

    public static class UpdateReviewRequest {
        private Integer rating;
        private String comment;

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }
    }
}
