package com.eventticket.controller.user;

import com.eventticket.entity.G8_event;
import com.eventticket.service.user.EventService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class HomeController {

    private final EventService eventService;

    public HomeController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping({ "/", "/home", "/index" })
    @ResponseBody
    public String index() throws IOException {
        String projectRoot = System.getProperty("user.dir");
        Path indexPath = Path.of(projectRoot, "..", "frontend-web", "pages", "index.html").normalize();
        return Files.readString(indexPath, StandardCharsets.UTF_8);
    }

    /**
     * GUEST: API du lieu tong hop cho trang chu.
     */
    @GetMapping("/api/vtd/public/home")
    @ResponseBody
    public ResponseEntity<HomePageResponse> getHomePageData() {
        List<G8_event> publishedEvents = eventService.getAllPublishedEvents();

        // 1. BANNER: Lấy 3 URL ảnh random từ danh sách sự kiện
        List<String> randomBanners = publishedEvents.stream()
                .map(G8_event::getBannerImageUrl) // Giả định getter tên là getBannerImageUrl()
                .filter(url -> url != null && !url.isBlank())
                .collect(Collectors.collectingAndThen(Collectors.toList(), list -> {
                    Collections.shuffle(list); // Trộn ngẫu nhiên danh sách
                    return list.stream().limit(3).toList(); // Cắt lấy 3 ảnh
                }));

        // 2. SỰ KIỆN MỚI NHẤT: Tạo trong vòng 5 ngày đổ lại đây
        LocalDateTime fiveDaysAgo = LocalDateTime.now().minusDays(5);
        List<G8_event> latestEvents = publishedEvents.stream()
                .filter(e -> e.getCreatedAt() != null && e.getCreatedAt().isAfter(fiveDaysAgo)) // Lọc created_at > 5
                                                                                                // ngày trước
                .sorted(Comparator.comparing(G8_event::getCreatedAt).reversed()) // Sắp xếp giảm dần (mới nhất lên đầu)
                .toList();

        // 3. SỰ KIỆN NỔI BẬT: Lấy 8 sự kiện có điểm đánh giá (Rating) cao nhất
        List<G8_event> featuredEvents = publishedEvents.stream()
                .filter(e -> e.getRating() != null) // Lọc các sự kiện đã có đánh giá
                .sorted(Comparator.comparing(G8_event::getRating).reversed()) // Xếp rating từ cao xuống thấp
                .limit(8) // Lấy đúng 8 sự kiện
                .toList();

        // Danh mục (Giữ nguyên logic của bạn)
        List<String> categories = publishedEvents.stream()
                .map(G8_event::getCategoryName)
                .filter(category -> category != null && !category.isBlank())
                .distinct()
                .sorted()
                .toList();

        // Khởi tạo Response trả về cho Frontend
        HomePageResponse response = new HomePageResponse(
                randomBanners,
                featuredEvents,
                latestEvents,
                categories,
                publishedEvents.size());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/vtd/public/home/categories")
    @ResponseBody
    public ResponseEntity<List<String>> getHomeCategories() {
        List<String> categories = eventService.getAllPublishedEvents()
                .stream()
                .map(G8_event::getCategoryName)
                .filter(category -> category != null && !category.isBlank())
                .distinct()
                .sorted()
                .toList();

        return ResponseEntity.ok(categories);
    }

    // --- CẬP NHẬT DTO RESPONSE ---
    public static class HomePageResponse {
        private List<String> banners; // Thêm list chứa url ảnh banner
        private List<G8_event> featuredEvents;
        private List<G8_event> latestEvents;
        private List<String> categories;
        private Integer totalPublishedEvents;

        public HomePageResponse(List<String> banners, List<G8_event> featuredEvents, List<G8_event> latestEvents,
                List<String> categories, Integer totalPublishedEvents) {
            this.banners = banners;
            this.featuredEvents = featuredEvents;
            this.latestEvents = latestEvents;
            this.categories = categories;
            this.totalPublishedEvents = totalPublishedEvents;
        }

        // --- Bổ sung Getter & Setter ---
        public List<String> getBanners() {
            return banners;
        }

        public void setBanners(List<String> banners) {
            this.banners = banners;
        }

        public List<G8_event> getFeaturedEvents() {
            return featuredEvents;
        }

        public void setFeaturedEvents(List<G8_event> featuredEvents) {
            this.featuredEvents = featuredEvents;
        }

        public List<G8_event> getLatestEvents() {
            return latestEvents;
        }

        public void setLatestEvents(List<G8_event> latestEvents) {
            this.latestEvents = latestEvents;
        }

        public List<String> getCategories() {
            return categories;
        }

        public void setCategories(List<String> categories) {
            this.categories = categories;
        }

        public Integer getTotalPublishedEvents() {
            return totalPublishedEvents;
        }

        public void setTotalPublishedEvents(Integer totalPublishedEvents) {
            this.totalPublishedEvents = totalPublishedEvents;
        }
    }
}