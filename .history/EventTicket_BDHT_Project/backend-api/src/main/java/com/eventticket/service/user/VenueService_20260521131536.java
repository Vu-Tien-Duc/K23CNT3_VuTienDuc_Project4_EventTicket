package com.eventticket.service.user;

import com.eventticket.entity.G8_venue;
import com.eventticket.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenueService {

    @Autowired
    private VenueRepository venueRepository;

    /**
     * GUEST: Xem chi tiết địa điểm tổ chức (Bản đồ/Địa chỉ, Sức chứa)
     */
    public G8_venue getVenueDetails(Integer venueId) {
        return venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Địa điểm không tồn tại"));
    }

}
