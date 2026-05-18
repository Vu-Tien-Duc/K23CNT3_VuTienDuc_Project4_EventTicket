package com.eventticket.service;

import com.eventticket.entity.G8_event_image;
import com.eventticket.repository.EventImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventImageService {

    @Autowired
    private EventImageRepository eventImageRepository;

    /**
     * GUEST: Xem thư viện hình ảnh sự kiện (Event Gallery)
     */
    public List<G8_event_image> getEventImages(Integer eventId) {
        return eventImageRepository.findByEventIdOrderBySortOrder(eventId);
    }

}
