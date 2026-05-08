package com.eventticket.controller.user;

import com.eventticket.entity.G8_promotion;
import com.eventticket.service.PromotionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.Data;

@RestController
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    /**
     * GUEST/MEMBER: Nhập mã khuyến mãi để áp dụng
     */
    @PostMapping("/api/vtd/public/promotions/validate")
    public ResponseEntity<PromotionResponse> validatePromotion(@RequestBody ValidatePromotionRequest request) {
        try {
            G8_promotion promotion = promotionService.validateAndApplyPromotion(request.getCode());
            PromotionResponse response = new PromotionResponse();
            response.setSuccess(true);
            response.setPromotion(promotion);
            response.setDiscountAmount(promotion.getDiscountAmount());
            response.setDiscountPercent(promotion.getDiscountPercent());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            PromotionResponse response = new PromotionResponse();
            response.setSuccess(false);
            response.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * GUEST/MEMBER: Lấy thông tin chi tiết một mã khuyến mãi
     */
    @GetMapping("/api/vtd/public/promotions/{code}")
    public ResponseEntity<G8_promotion> getPromotionByCode(@PathVariable String code) {
        G8_promotion promotion = promotionService.validateAndApplyPromotion(code);
        return ResponseEntity.ok(promotion);
    }

    /**
     * GUEST/MEMBER: Tính giá sau khi áp dụng khuyến mãi
     */
    @PostMapping("/api/vtd/public/promotions/calculate-discount")
    public ResponseEntity<Map<String, Object>> calculateDiscount(@RequestBody CalculateDiscountRequest request) {
        try {
            G8_promotion promotion = promotionService.validateAndApplyPromotion(request.getPromotionCode());
            
            java.math.BigDecimal originalPrice = request.getOriginalPrice();
            java.math.BigDecimal discountAmount = java.math.BigDecimal.ZERO;
            
            // Tính chiết khấu theo loại
            if (promotion.getDiscountPercent() != null) {
                discountAmount = originalPrice.multiply(new java.math.BigDecimal(promotion.getDiscountPercent()))
                        .divide(new java.math.BigDecimal(100));
            } else if (promotion.getDiscountAmount() != null) {
                discountAmount = promotion.getDiscountAmount();
            }
            
            java.math.BigDecimal finalPrice = originalPrice.subtract(discountAmount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("originalPrice", originalPrice);
            response.put("discountAmount", discountAmount);
            response.put("discountPercent", promotion.getDiscountPercent());
            response.put("finalPrice", finalPrice);
            response.put("promotionCode", request.getPromotionCode());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * DTO: Yêu cầu xác nhận mã khuyến mãi
     */
    @Data
    public static class ValidatePromotionRequest {
        private String code;

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    /**
     * DTO: Response xác nhận mã khuyến mãi
     */
    @Data
    public static class PromotionResponse {
        private boolean success;
        private String message;
        private G8_promotion promotion;
        private java.math.BigDecimal discountAmount;
        private Integer discountPercent;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public G8_promotion getPromotion() { return promotion; }
        public void setPromotion(G8_promotion promotion) { this.promotion = promotion; }
        public java.math.BigDecimal getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(java.math.BigDecimal discountAmount) { this.discountAmount = discountAmount; }
        public Integer getDiscountPercent() { return discountPercent; }
        public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }
    }

    /**
     * DTO: Yêu cầu tính giá sau giảm
     */
    @Data
    public static class CalculateDiscountRequest {
        private String promotionCode;
        private java.math.BigDecimal originalPrice;

        public String getPromotionCode() { return promotionCode; }
        public void setPromotionCode(String promotionCode) { this.promotionCode = promotionCode; }
        public java.math.BigDecimal getOriginalPrice() { return originalPrice; }
        public void setOriginalPrice(java.math.BigDecimal originalPrice) { this.originalPrice = originalPrice; }
    }
}
