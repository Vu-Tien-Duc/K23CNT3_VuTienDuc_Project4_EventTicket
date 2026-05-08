package com.eventticket.controller.user;

import com.eventticket.entity.G8_order;
import com.eventticket.entity.G8_order_item;
import com.eventticket.entity.G8_payment;
import com.eventticket.service.OrderService;
import com.eventticket.service.PaymentService;
import com.eventticket.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vtd/member/orders")
public class MemberOrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private TicketService ticketService;

    private Integer currentUserIdOrThrow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthorized");
        }
        // JWT subject là email => hiện thiếu mapping email->userId ở controller
        throw new RuntimeException("Chưa cấu hình currentUserId từ JWT");
    }

    @GetMapping("/history")
    public List<G8_order> history(@RequestParam(required = false) String status) {
        Integer userId = currentUserIdOrThrow();
        if (status == null || status.isBlank()) {
            return orderService.getUserOrders(userId);
        }
        return orderService.getUserOrdersByStatus(userId, status);
    }

    @GetMapping("/{orderId}")
    public G8_order orderDetail(@PathVariable Integer orderId) {
        return orderService.getOrderDetails(orderId);
    }

    @PostMapping("/{orderId}/cancel")
    public void cancelOrder(@PathVariable Integer orderId) {
        orderService.cancelOrder(orderId);
    }

    @PostMapping("/{orderId}/checkout")
    public G8_payment checkout(@PathVariable Integer orderId, @RequestBody CheckoutRequest request) {
        return paymentService.createPayment(orderService.getOrderDetails(orderId), request.getPaymentMethod());
    }

    @GetMapping("/tickets")
    public List<?> myTickets() {
        Integer userId = currentUserIdOrThrow();
        return ticketService.getUserTickets(userId);
    }

    public static class CheckoutRequest {
        private String paymentMethod;

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }
    }
}
