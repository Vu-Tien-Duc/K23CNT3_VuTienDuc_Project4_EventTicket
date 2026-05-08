package com.eventticket.controller.user;

import com.eventticket.entity.G8_event;
import com.eventticket.entity.G8_event_image;
import com.eventticket.entity.G8_order;
import com.eventticket.entity.G8_ticketType;
import com.eventticket.entity.G8_review;
import com.eventticket.entity.G8_venue;
import com.eventticket.service.EventImageService;
import com.eventticket.service.EventService;
import com.eventticket.service.TicketTypeService;
import com.eventticket.service.ReviewService;
import com.eventticket.service.VenueService;
import com.eventticket.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/vtd/guest/events")
public class GuestEventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private VenueService venueService;

    @Autowired
    private EventImageService eventImageService;

    @Autowired
    private TicketTypeService ticketTypeService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/featured")
    public List<G8_event> getFeaturedEvents() {
        return eventService.getFeaturedEvents();
    }

    @GetMapping
    public List<G8_event> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // TODO: hiện EventService chỉ trả List; phân trang sẽ cần nâng cấp
        // service/repo.
        return eventService.getAllPublishedEvents();
    }

    @GetMapping("/search")
    public List<G8_event> searchEvents(@RequestParam String keyword) {
        return eventService.searchEventsByTitle(keyword);
    }

    @GetMapping("/category")
    public List<G8_event> filterEventsByCategory(@RequestParam String categoryName) {
        return eventService.filterEventsByCategory(categoryName);
    }

    @GetMapping("/time")
    public List<G8_event> filterEventsByTime(
            @RequestParam String type) {
        LocalDateTime now = LocalDateTime.now();
        switch (type) {
            case "upcoming":
                return eventService.getEventsInTimeRange(now, now.plusYears(100));
            case "week":
                return eventService.getEventsInTimeRange(now, now.plusWeeks(1));
            case "month":
                return eventService.getEventsInTimeRange(now, now.plusMonths(1));
            default:
                throw new RuntimeException("Invalid time filter type");
        }
    }

    @GetMapping("/{eventId}")
    public G8_event getEventDetails(@PathVariable Integer eventId) {
        return eventService.getEventDetails(eventId);
    }

    @GetMapping("/{eventId}/venue")
    public G8_venue getEventVenue(@PathVariable Integer eventId) {
        return eventService.getEventVenue(eventId);
    }

    @GetMapping("/{eventId}/gallery")
    public List<G8_event_image> getEventGallery(@PathVariable Integer eventId) {
        return eventImageService.getEventImages(eventId);
    }

    @GetMapping("/{eventId}/ticket-types")
    public List<G8_ticketType> getOpenTicketTypes(@PathVariable Integer eventId) {
        return ticketTypeService.getActiveTicketTypesByEvent(eventId);
    }

    @GetMapping("/{eventId}/reviews")
    public List<G8_review> getEventReviews(@PathVariable Integer eventId) {
        return reviewService.getEventReviews(eventId);
    }
}
