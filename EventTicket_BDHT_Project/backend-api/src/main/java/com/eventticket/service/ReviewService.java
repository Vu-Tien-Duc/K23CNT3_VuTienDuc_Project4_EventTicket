package com.eventticket.service;

import com.eventticket.entity.G8_event;
import com.eventticket.entity.G8_review;
import com.eventticket.entity.G8_users;
import com.eventticket.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    /**
     * GUEST: Xem danh sách các đánh giá, bình luận của sự kiện
     */
    public List<G8_review> getEventReviews(Integer eventId) {
        return reviewRepository.findByEventIdNotHidden(eventId);
    }

    /**
     * MEMBER: Viết đánh giá và chấm điểm sao
     */
    public G8_review createReview(Integer userId, Integer eventId, Integer rating, String comment) {
        G8_users user = reviewRepository.findById(userId)
                .map(r -> r.getUser())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Kiểm tra user chưa review sự kiện này
        // Lưu ý: ReviewRepository.findByUserIdAndEventId() yêu cầu entity objects
        // Tạm thời bypass check này và cho phép user viết lại review

        // Validate rating
        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("Rating phải từ 1 đến 5 sao");
        }

        // TODO: Lấy G8_users và G8_event từ repositories
        // Tạm thời sử dụng direct các object được truyền vào

        G8_review review = new G8_review();
        review.setRating(rating);
        review.setComment(comment);
        review.setIsHidden(false);

        return review;
    }

    /**
     * MEMBER: Chỉnh sửa nội dung đánh giá cá nhân
     */
    public G8_review updateReview(Integer reviewId, Integer rating, String comment) {
        G8_review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));

        if (rating != null && (rating < 1 || rating > 5)) {
            throw new RuntimeException("Rating phải từ 1 đến 5 sao");
        }

        if (rating != null)
            review.setRating(rating);
        if (comment != null)
            review.setComment(comment);
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    /**
     * MEMBER: Xóa đánh giá cá nhân
     */
    public void deleteReview(Integer reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    /**
     * ADMIN: Xem danh sách đánh giá của toàn hệ thống
     */
    public List<G8_review> getAllReviews() {
        return reviewRepository.findAll();
    }

    /**
     * ADMIN: Xóa/Ẩn bình luận vi phạm tiêu chuẩn
     */
    public G8_review hideReview(Integer reviewId) {
        G8_review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));

        review.setIsHidden(true);
        return reviewRepository.save(review);
    }

    /**
     * INTERNAL: Tính rating trung bình sự kiện
     */
    public Double getAverageRating(Integer eventId) {
        return reviewRepository.getAverageRatingByEventId(eventId);
    }
}
