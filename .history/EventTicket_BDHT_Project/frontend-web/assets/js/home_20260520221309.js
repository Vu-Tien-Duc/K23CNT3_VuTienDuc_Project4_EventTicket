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

/**
 * Render danh sách sự kiện nổi bật (1 thẻ lớn + tối đa 4 thẻ nhỏ).
 * @param {object[]} events - Mảng object sự kiện từ API
 */
function renderFeaturedEvents(events) {
    const wrapper = document.getElementById('featured-events-wrapper');

    if (events.length === 0) {
        renderTemplate('featured-events-wrapper', 'tmpl-featured-event-empty');
        return;
    }

    wrapper.innerHTML = '';

    // Tạo grid tổng thể
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 lg:grid-cols-3 gap-8';

    // --- Cột trái: Thẻ TOP 1 ---
    const topEvent = events[0];
    const leftCol = document.createElement('div');
    leftCol.className = 'lg:col-span-1';

    const topCard = cloneTemplate('tmpl-featured-top-card');
    fillField(topCard, 'bannerImage', null, { src: `../assets/images/${topEvent.bannerImageUrl || 'no-image.png'}`, alt: topEvent.title });
    fillField(topCard, 'title', topEvent.title);
    fillField(topCard, 'description', topEvent.description || 'Sự kiện hấp dẫn không thể bỏ lỡ, đặt vé ngay hôm nay để có vị trí đẹp nhất!');
    fillField(topCard, 'minPrice', formatCurrency(topEvent.minPrice || 0));

    topCard.firstElementChild.addEventListener('click', () => {
        window.location.href = `event-detail.html?id=${topEvent.eventId}`;
    });

    leftCol.appendChild(topCard);
    grid.appendChild(leftCol);

    // --- Cột phải: Lưới 2x2 thẻ nhỏ ---
    const rightCol = document.createElement('div');
    rightCol.className = 'lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6';

    const nextEvents = events.slice(1, 5);
    nextEvents.forEach(event => {
        const smallCard = cloneTemplate('tmpl-featured-small-card');
        fillField(smallCard, 'bannerImage', null, { src: `../assets/images/${event.bannerImageUrl || 'no-image.png'}`, alt: event.title });
        fillField(smallCard, 'categoryName', event.categoryName || 'Sự kiện');
        fillField(smallCard, 'title', event.title);
        fillField(smallCard, 'minPrice', formatCurrency(event.minPrice || 0));

        smallCard.firstElementChild.addEventListener('click', () => {
            window.location.href = `event-detail.html?id=${event.eventId}`;
        });

        rightCol.appendChild(smallCard);
    });

    grid.appendChild(rightCol);
    wrapper.appendChild(grid);
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