package com.eventticket.entity.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "G8_order_items")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class G8_order_item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "G8_order_item_id")
    private Integer orderItemId;

    @ManyToOne
    @JoinColumn(name = "G8_order_id", nullable = false)
    private G8_order order;

    @ManyToOne
    @JoinColumn(name = "G8_ticket_type_id", nullable = false)
    private G8_ticketType ticketType;

    @Column(name = "G8_quantity", nullable = false)
    private Integer quantity;

    @Column(name = "G8_price_at_time", nullable = false)
    private BigDecimal priceAtTime; // Giá tại thời điểm mua để lưu lịch sử
}
