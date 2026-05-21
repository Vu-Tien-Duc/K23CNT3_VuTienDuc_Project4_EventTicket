/**
 * Script xử lý Trang Chủ (index.html)
 * Tác giả: Team Frontend (BDHT)
 *
 * Nguyên tắc: File này CHỈ chứa logic JS (API, xử lý dữ liệu, DOM manipulation).
 * Toàn bộ cấu trúc HTML nằm trong các thẻ <template> ở index.html.
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchHomePageData();
    startAutoSlide();
});

// ======================== GỌI API & RENDER ========================

async function fetchHomePageData() {
    try {
        const responseData = await window.apiClient.get('/api/vtd/public/home');

        if (responseData.banners && responseData.banners.length > 0) {
            renderBanners(responseData.banners);
        }

        renderLatestEvents(responseData.latestEvents || []);
        renderFeaturedEvents(responseData.featuredEvents || []);

    } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
        renderTemplate('mini-slider-track', 'tmpl-latest-event-error');
        renderTemplate('featured-events-wrapper', 'tmpl-featured-event-error');
    }
}

// ======================== CÁC HÀM RENDER ========================

/**
 * Render banner images vào hero slider.
 * @param {string[]} banners - Mảng tên file ảnh banner
 */
function renderBanners(banners) {
    for (let i = 0; i < 3; i++) {
        const imgEl = document.getElementById(`banner-img-${i}`);
        if (imgEl && banners[i]) {
            imgEl.src = `../assets/images/${banners[i]}`;
        }
    }
}

/**
 * Render danh sách sự kiện mới nhất vào mini-slider.
 * @param {object[]} events - Mảng object sự kiện từ API
 */
function renderLatestEvents(events) {
    const track = document.getElementById('mini-slider-track');

    if (events.length === 0) {
        renderTemplate('mini-slider-track', 'tmpl-latest-event-empty');
        return;
    }

    track.innerHTML = '';
    events.forEach(event => {
        const card = cloneTemplate('tmpl-latest-event-card');

        fillField(card, 'bannerImage', null, { src: `../assets/images/${event.bannerImageUrl || 'no-image.png'}`, alt: event.title });
        fillField(card, 'categoryName', event.categoryName || 'Sự kiện');
        fillField(card, 'title', event.title);
        fillField(card, 'createdAt', formatDate(event.createdAt));
        fillField(card, 'minPrice', formatCurrency(event.minPrice || 0));

        card.querySelector('.mini-slider-card').addEventListener('click', () => {
            window.location.href = `event-detail.html?id=${event.eventId}`;
        });

        track.appendChild(card);
    });
}

let allFeaturedEvents = []; // Biến toàn cục
let visibleCount = 8;       // Số lượng hiện ban đầu

function renderFeaturedEvents(events) {
    const wrapper = document.getElementById('featured-events-wrapper');
    const gridContainer = document.getElementById('featured-grid-container');
    const btnContainer = document.getElementById('btn-container');

    // 1. Lưu toàn bộ sự kiện nhận được vào biến toàn cục (không cắt ở đây)
    allFeaturedEvents = events; 
    
    if (allFeaturedEvents.length === 0) {
        renderTemplate('featured-events-wrapper', 'tmpl-featured-event-empty');
        return;
    }

    // 2. Render 8 cái đầu tiên
    renderGrid(visibleCount);

    // 3. Xử lý nút "Xem thêm"
    if (btnContainer) {
        // Chỉ hiện nút nếu số sự kiện thực tế > số đang hiển thị
        if (allFeaturedEvents.length > visibleCount) {
            btnContainer.classList.remove('hidden');
            
            // Xóa sự kiện cũ để tránh bị add đè (tránh lỗi bấm nhiều lần)
            const loadMoreBtn = document.getElementById('btn-load-more');
            loadMoreBtn.onclick = () => {
                visibleCount += 8; // Tăng thêm 8
                renderGrid(visibleCount);
                
                // Nếu đã hiển thị hết hoặc đạt giới hạn 16, ẩn nút
                if (visibleCount >= allFeaturedEvents.length || visibleCount >= 16) {
                    btnContainer.classList.add('hidden');
                }
            };
        } else {
            btnContainer.classList.add('hidden');
        }
    }
}

// ======================== TEMPLATE HELPERS ========================

/**
 * Clone nội dung của một <template> và trả về DocumentFragment.
 * @param {string} templateId - ID của thẻ <template>
 * @returns {DocumentFragment}
 */
function cloneTemplate(templateId) {
    const tmpl = document.getElementById(templateId);
    return tmpl.content.cloneNode(true);
}

/**
 * Render một <template> vào container (dùng cho trạng thái rỗng/lỗi).
 * @param {string} containerId - ID của phần tử chứa
 * @param {string} templateId  - ID của thẻ <template>
 */
function renderTemplate(containerId, templateId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.appendChild(cloneTemplate(templateId));
}

/**
 * Điền dữ liệu vào phần tử có data-field bên trong một fragment/node.
 * @param {DocumentFragment|Element} fragment - Fragment hoặc phần tử chứa
 * @param {string}  field   - Giá trị của attribute data-field
 * @param {string|null} text    - Nội dung text (null nếu chỉ dùng attrs)
 * @param {object}  [attrs] - Các attribute cần gán (vd: { src, alt })
 */
function fillField(fragment, field, text = null, attrs = {}) {
    const el = fragment.querySelector(`[data-field="${field}"]`);
    if (!el) return;
    if (text !== null) el.textContent = text;
    Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
}

// ======================== SLIDER UI ========================

let currentSlide = 0;
const totalSlides = 3;
let autoSlideInterval;

function updateSliderUI() {
    const track = document.getElementById('hero-slider-track');
    const dots = document.querySelectorAll('.hero-dot');

    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, index) => {
        const isActive = index === currentSlide;
        dot.classList.toggle('bg-white', isActive);
        dot.classList.toggle('active', isActive);
        dot.classList.toggle('shadow-md', isActive);
        dot.classList.toggle('bg-white/40', !isActive);
    });
}

function moveHeroSlide(direction) {
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateSliderUI();
    resetAutoSlide();
}

function setHeroSlide(index) {
    currentSlide = index;
    updateSliderUI();
    resetAutoSlide();
}

function startAutoSlide() {
    autoSlideInterval = setInterval(() => moveHeroSlide(1), 5000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

function scrollMiniSlider(offset) {
    const track = document.getElementById('mini-slider-track');
    if (track) track.scrollBy({ left: offset, behavior: 'smooth' });
}

// ======================== FORMAT HELPERS ========================

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return 'Đang cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}