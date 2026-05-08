package com.eventticket.controller.user;

import com.eventticket.entity.G8_order;
import com.eventticket.entity.G8_order_item;
import com.eventticket.entity.G8_promotion;
import com.eventticket.entity.G8_ticketType;
import com.eventticket.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vtd/member/cart")
public class CartOrderController {

    @Autowired
    private OrderService orderService;

    private Integer currentUserIdOrThrow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }
        throw new RuntimeException("Chưa cấu hình currentUserId từ JWT");
    }

    @PostMapping("/orders")
    public G8_order createCart() {
        Integer userId = currentUserIdOrThrow();
        return orderService.createOrder(userId);
    }

    @PostMapping("/{orderId}/items")
    public G8_order_item addTicketType(@PathVariable Integer orderId,
            @RequestParam Integer ticketTypeId,
            @RequestParam Integer quantity) {
        return orderService.addTicketTypeToOrder(orderId, ticketTypeId, quantity);
    }

    @PutMapping("/items/{orderItemId}")
    public G8_order_item updateQuantity(@PathVariable Integer orderItemId,
            @RequestParam Integer quantity) {
        return orderService.updateOrderItemQuantity(orderItemId, quantity);
    }

    @PostMapping("/{orderId}/promotion")
    public G8_order applyPromotion(@PathVariable Integer orderId,
            @RequestParam String code) {
        return orderService.applyPromotionToOrder(orderId, code);
    }

    @DeleteMapping("/{orderId}/promotion")
    public G8_order removePromotion(@PathVariable Integer orderId) {
        return orderService.removePromotionFromOrder(orderId);
    }
}
