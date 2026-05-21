package com.eventticket.service.user;

import com.eventticket.entity.G8_order;
import com.eventticket.entity.G8_payment;
import com.eventticket.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    /**
     * MEMBER: Chọn phương thức thanh toán
     */
    public G8_payment createPayment(G8_order order, String paymentMethod) {

        // Validate phương thức thanh toán
        if (!paymentMethod.matches("MOMO|VNPAY|ZALOPAY|CASH")) {
            throw new RuntimeException("Phương thức thanh toán không hợp lệ");
        }

        G8_payment payment = new G8_payment();

        payment.setOrder(order);

        payment.setPaymentMethod(paymentMethod);

        payment.setAmount(order.getFinalAmount());

        payment.setStatus("PENDING");

        return paymentRepository.save(payment);
    }

    /**
     * MEMBER: Nhận và hiển thị kết quả giao dịch
     */
    public G8_payment getPaymentStatus(Integer paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));
    }

    /**
     * INTERNAL: Cập nhật trạng thái thanh toán (Webhook từ cổng thanh toán)
     */
    public G8_payment updatePaymentStatus(Integer paymentId, String status, String transactionId) {
        G8_payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));

        payment.setStatus(status);
        payment.setTransactionId(transactionId);

        if ("SUCCESS".equals(status)) {
            payment.setPaidAt(LocalDateTime.now());
        }

        return paymentRepository.save(payment);
    }

    /**
     * MEMBER: Yêu cầu hoàn tiền
     */
    public G8_payment requestRefund(Integer paymentId) {
        G8_payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));

        // Chỉ có thể hoàn tiền nếu thanh toán thành công
        if (!"SUCCESS".equals(payment.getStatus())) {
            throw new RuntimeException("Chỉ có thể hoàn tiền cho những giao dịch thành công");
        }

        // Cập nhật trạng thái thành REFUND_REQUESTED
        payment.setStatus("REFUND_REQUESTED");
        return paymentRepository.save(payment);
    }
}
