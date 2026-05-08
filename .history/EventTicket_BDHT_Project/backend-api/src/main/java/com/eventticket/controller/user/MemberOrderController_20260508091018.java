package com.eventticket.controller.user;

import com.eventticket.entity.G8_order;
import com.eventticket.entity.G8_ticket;
import com.eventticket.entity.G8_users;
import com.eventticket.repository.UserRepository;
import com.eventticket.service.OrderService;
import com.eventticket.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/vtd/member/orders")
public class MemberOrderController {

    private final OrderService orderService;
    private final TicketService ticketService;
    private final UserRepository userRepository;

    public MemberOrderController(OrderService orderService, TicketService ticketService,
            UserRepository userRepository) {
        this.orderService = orderService;
        this.ticketService = ticketService;
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

    /**
     * MEMBER: get my orders
     */
    @GetMapping("/history")
    public ResponseEntity<List<G8_order>> getMyOrders(@RequestParam(value = "status", required = false) String status) {
        Integer userId = currentUserIdOrThrow();
        List<G8_order> orders = (status == null || status.isBlank())
                ? orderService.getUserOrders(userId)
                : orderService.getUserOrdersByStatus(userId, status);
        return ResponseEntity.ok(orders);
    }

    /**
     * MEMBER: get order detail by id
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<G8_order> getOrderDetail(@PathVariable Integer orderId) {
        // NOTE: OrderService không filter theo userId, nên ở đây vẫn có thể lộ dữ liệu.
        // Nếu cần đúng nghiệp vụ, phải kiểm tra order belongsTo currentUser.
        G8_order order = orderService.getOrderDetails(orderId);
        return ResponseEntity.ok(order);
    }

    /**
     * MEMBER: cancel order (PENDING only)
     */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Integer orderId) {
        Integer userId = currentUserIdOrThrow();
        // TODO nếu cần: verify order thuộc userId trước khi cancel
        orderService.cancelOrder(orderId);
        return ResponseEntity.ok().build();
    }

    /**
     * MEMBER: checkout hiện phụ thuộc PaymentService (payment flow chưa được
     * controller viết ở repo này).
     * Skeleton endpoint để FE gọi sau khi tạo payment flow.
     */
    @PostMapping("/{orderId}/checkout")
    public ResponseEntity<?> checkout(@PathVariable Integer orderId) {
        return ResponseEntity.status(501).body("Chưa triển khai checkout cho member");
    }

    /**
     * MEMBER: get my electronic tickets (QR generate trên FE)
     */
    @GetMapping("/tickets")
    public ResponseEntity<List<G8_ticket>> getMyTickets() {
        Integer userId = currentUserIdOrThrow();
        return ResponseEntity.ok(ticketService.getUserTickets(userId));
    }
}
