/* ==========================================
   WarungNusantara - Custom JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ========== PRELOADER ==========
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function () {
      setTimeout(() => {
        preloader.classList.add('hidden');
      }, 500);
    });
    // Fallback: hide preloader after 3 seconds
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 3000);
  }

  // ========== NAVBAR SCROLL EFFECT ==========
  const navbar = document.querySelector('.navbar-custom');
  if (navbar) {
    function handleNavScroll() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', handleNavScroll);
    handleNavScroll(); // Check on load
  }

  // ========== ACTIVE NAV LINK ==========
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-custom .nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ========== BACK TO TOP ==========
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========== COUNTER ANIMATION ==========
  const counters = document.querySelectorAll('.counter');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'));
          const suffix = counter.getAttribute('data-suffix') || '';
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target + suffix;
              clearInterval(interval);
            } else {
              counter.textContent = Math.floor(current) + suffix;
            }
          }, duration / steps);
          counterObserver.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  // ========== MENU FILTERING ==========
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');

  if (filterBtns.length > 0 && menuItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const category = this.getAttribute('data-filter');

        menuItems.forEach(item => {
          if (category === 'semua' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
            item.style.animation = 'fadeInUp 0.5s ease forwards';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // ========== ORDER FORM ==========
  const orderForm = document.getElementById('orderForm');
  const orderTable = document.getElementById('orderTableBody');
  const orderSuccess = document.getElementById('orderSuccess');
  const orderCount = document.getElementById('orderCount');
  let orders = JSON.parse(localStorage.getItem('warungOrders') || '[]');

  // Load existing orders
  if (orderTable) {
    renderOrders();
  }

  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Get form values
      const nama = document.getElementById('namaLengkap').value.trim();
      const hp = document.getElementById('nomorHP').value.trim();
      const menu = document.getElementById('pilihMenu');
      const menuText = menu.options[menu.selectedIndex].text;
      const jumlah = document.getElementById('jumlah').value;
      const alamat = document.getElementById('alamat').value.trim();
      const catatan = document.getElementById('catatan').value.trim();
      const setuju = document.getElementById('setujuSyarat');

      // Validation
      if (!nama || !hp || menu.value === '' || !jumlah || !alamat) {
        showAlert('Mohon lengkapi semua field yang wajib diisi!', 'danger');
        return;
      }

      // HP validation
      const hpRegex = /^(\+62|62|08)\d{8,12}$/;
      if (!hpRegex.test(hp.replace(/[\s-]/g, ''))) {
        showAlert('Nomor HP tidak valid! Gunakan format: 08xx atau +62xxx', 'danger');
        return;
      }

      if (setuju && !setuju.checked) {
        showAlert('Anda harus menyetujui syarat dan ketentuan!', 'danger');
        return;
      }

      // Get payment method
      const paymentEl = document.querySelector('input[name="payment"]:checked');
      const payment = paymentEl ? paymentEl.value : 'COD';

      // Get price from menu option
      const menuParts = menuText.split(' - ');
      const price = menuParts.length > 1 ? menuParts[1] : 'Rp 0';

      // Create order
      const order = {
        id: Date.now(),
        no: orders.length + 1,
        nama: nama,
        hp: hp,
        menu: menuParts[0],
        harga: price,
        jumlah: parseInt(jumlah),
        alamat: alamat,
        catatan: catatan || '-',
        payment: payment,
        tanggal: new Date().toLocaleDateString('id-ID'),
        status: 'Diproses'
      };

      orders.push(order);
      localStorage.setItem('warungOrders', JSON.stringify(orders));

      // Show success
      orderForm.style.display = 'none';
      if (orderSuccess) {
        orderSuccess.classList.add('show');
        document.getElementById('successNama').textContent = nama;
        document.getElementById('successMenu').textContent = order.menu;
        document.getElementById('successTotal').textContent = order.jumlah;
      }

      renderOrders();
      orderForm.reset();
    });
  }

  // Render orders table
  function renderOrders() {
    if (!orderTable) return;
    orderTable.innerHTML = '';

    if (orders.length === 0) {
      orderTable.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4"><i class="bi bi-inbox fs-3 d-block mb-2"></i>Belum ada pesanan</td></tr>';
      return;
    }

    orders.forEach((order, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${index + 1}</strong></td>
        <td>${order.nama}</td>
        <td>${order.menu}</td>
        <td class="text-center">${order.jumlah}</td>
        <td>${order.harga}</td>
        <td>${order.payment}</td>
        <td>${order.tanggal}</td>
        <td>
          <span class="badge bg-warning text-dark badge-status">${order.status}</span>
        </td>
      `;
      orderTable.appendChild(row);
    });

    if (orderCount) {
      orderCount.textContent = orders.length;
    }
  }

  // Reset order form
  window.resetOrderForm = function () {
    if (orderForm) {
      orderForm.style.display = 'block';
    }
    if (orderSuccess) {
      orderSuccess.classList.remove('show');
    }
  };

  // Clear all orders
  window.clearOrders = function () {
    if (confirm('Hapus semua data pesanan?')) {
      orders = [];
      localStorage.removeItem('warungOrders');
      renderOrders();
      showAlert('Semua pesanan telah dihapus.', 'info');
    }
  };

  // ========== CONTACT FORM ==========
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nama = document.getElementById('kontakNama').value.trim();
      const email = document.getElementById('kontakEmail').value.trim();
      const subjek = document.getElementById('kontakSubjek').value.trim();
      const pesan = document.getElementById('kontakPesan').value.trim();

      if (!nama || !email || !subjek || !pesan) {
        showAlert('Mohon lengkapi semua field!', 'danger');
        return;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert('Format email tidak valid!', 'danger');
        return;
      }

      showAlert('Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.', 'success');
      contactForm.reset();
    });
  }

  // ========== GALLERY LIGHTBOX ==========
  const galleryItems = document.querySelectorAll('.gallery-item[data-bs-toggle="modal"]');
  galleryItems.forEach(item => {
    item.addEventListener('click', function () {
      const imgSrc = this.querySelector('img').src;
      const imgAlt = this.querySelector('img').alt;
      const modalImg = document.getElementById('galleryModalImg');
      const modalLabel = document.getElementById('galleryModalLabel');
      if (modalImg) modalImg.src = imgSrc;
      if (modalLabel) modalLabel.textContent = imgAlt;
    });
  });

  // ========== ALERT HELPER ==========
  function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
      // Create alert container if not exists
      const container = document.createElement('div');
      container.id = 'alertContainer';
      container.style.cssText = 'position:fixed;top:90px;right:20px;z-index:9999;max-width:400px;';
      document.body.appendChild(container);
      showAlertIn(container, message, type);
    } else {
      showAlertIn(alertContainer, message, type);
    }
  }

  function showAlertIn(container, message, type) {
    const iconMap = {
      success: 'bi-check-circle-fill',
      danger: 'bi-exclamation-triangle-fill',
      warning: 'bi-exclamation-circle-fill',
      info: 'bi-info-circle-fill'
    };

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show d-flex align-items-center gap-2 shadow-lg`;
    alert.style.cssText = 'animation: fadeInUp 0.3s ease; border-radius: 12px; font-size: 0.92rem;';
    alert.innerHTML = `
      <i class="bi ${iconMap[type] || iconMap.info}"></i>
      <span>${message}</span>
      <button type="button" class="btn-close btn-sm" data-bs-dismiss="alert"></button>
    `;
    container.appendChild(alert);

    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => alert.remove(), 300);
    }, 4000);
  }

  // ========== SMOOTH SCROLL FOR INTERNAL LINKS ==========
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ========== NAVBAR COLLAPSE ON CLICK (Mobile) ==========
  const navbarCollapse = document.querySelector('.navbar-collapse');
  if (navbarCollapse) {
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  // ========== AOS INITIALIZATION ==========
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      offset: 80,
      easing: 'ease-out-cubic',
      once: true,
      disable: 'mobile'
    });
  }

  // ========== TYPING EFFECT FOR HERO ==========
  const typingEl = document.getElementById('typingText');
  if (typingEl) {
    const words = ['Lezat', 'Autentik', 'Tradisional', 'Spesial'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWord() {
      const current = words[wordIndex];
      if (isDeleting) {
        typingEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === current.length) {
        speed = 2000; // Pause
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        speed = 300;
      }

      setTimeout(typeWord, speed);
    }

    typeWord();
  }

});
