/**
 * Asana Wellness Foundation — script.js
 * -----------------------------------------------------------
 * Handles:
 *  1. Sticky nav: .scrolled class on scroll
 *  2. Mobile menu toggle (hamburger)
 *  3. Scroll reveal: IntersectionObserver for .fade-in
 *  4. Active nav link highlighting by scroll position
 *  5. Smooth scroll for anchor links
 *  6. Counter animation for #impact stats
 *  7. Close mobile menu on nav link click
 * -----------------------------------------------------------
 */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     ELEMENT REFERENCES
  ---------------------------------------------------------- */
  const siteHeader    = document.querySelector('.site-header');
  const hamburgerBtn  = document.getElementById('hamburgerBtn');
  const mobileMenu    = document.getElementById('mobileMenu');
  const navLinks      = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const fadeElements  = document.querySelectorAll('.fade-in');
  const impactSection = document.getElementById('impact');
  const statNumbers   = document.querySelectorAll('.impact-stat-number');
  const sections      = document.querySelectorAll('section[id]');

  /* ----------------------------------------------------------
     1. STICKY NAV — add/remove .scrolled class
  ---------------------------------------------------------- */
  function handleNavScroll() {
    if (window.scrollY > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }

  // Run once immediately in case page is already scrolled on load
  handleNavScroll();

  window.addEventListener('scroll', handleNavScroll, { passive: true });


  /* ----------------------------------------------------------
     2. MOBILE MENU TOGGLE
  ---------------------------------------------------------- */
  let menuIsOpen = false;

  function openMenu() {
    menuIsOpen = true;
    hamburgerBtn.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'Close navigation menu');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    // Prevent body scroll while menu is open
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuIsOpen = false;
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Open navigation menu');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    if (menuIsOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMenu);
  }

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuIsOpen) {
      closeMenu();
      hamburgerBtn.focus();
    }
  });

  // Close menu when clicking outside (on the overlay area)
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function (e) {
      // Only close if clicking the backdrop, not the links themselves
      if (e.target === mobileMenu) {
        closeMenu();
      }
    });
  }


  /* ----------------------------------------------------------
     7. CLOSE MOBILE MENU ON NAV LINK CLICK
  ---------------------------------------------------------- */
  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });


  /* ----------------------------------------------------------
     5. SMOOTH SCROLL FOR ANCHOR LINKS
     (Provides JS fallback; CSS scroll-behavior handles modern browsers)
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      // Only handle valid non-empty anchors
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const navHeight = siteHeader ? siteHeader.offsetHeight : 0;
      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });

      // Move focus to the target section for accessibility
      targetEl.setAttribute('tabindex', '-1');
      targetEl.focus({ preventScroll: true });
    });
  });


  /* ----------------------------------------------------------
     3. SCROLL REVEAL — IntersectionObserver for .fade-in
  ---------------------------------------------------------- */
  if ('IntersectionObserver' in window && fadeElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Once revealed, stop observing this element
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,      // Trigger when 12% of the element is visible
        rootMargin: '0px 0px -40px 0px'  // Slight bottom offset for better feel
      }
    );

    fadeElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all elements immediately if IntersectionObserver not supported
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }


  /* ----------------------------------------------------------
     4. ACTIVE NAV LINK HIGHLIGHTING based on scroll position
  ---------------------------------------------------------- */
  function setActiveNavLink() {
    const navHeight = siteHeader ? siteHeader.offsetHeight : 72;
    const scrollPos = window.scrollY + navHeight + 50; // buffer

    let currentSectionId = '';

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      const linkHref = link.getAttribute('href');
      if (linkHref === '#' + currentSectionId) {
        link.classList.add('active');
      }
    });
  }

  // Run on scroll (throttled with requestAnimationFrame)
  let ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        setActiveNavLink();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Run once on load
  setActiveNavLink();


  /* ----------------------------------------------------------
     6. COUNTER ANIMATION for #impact stats
  ---------------------------------------------------------- */

  /**
   * Animate a number counting up from 0 to its target value.
   * @param {HTMLElement} el  — the element whose text content to animate
   * @param {number} target   — the final number to count to
   * @param {string} suffix   — text appended after the number (e.g. "+")
   * @param {number} duration — animation duration in milliseconds
   */
  function animateCounter(el, target, suffix, duration) {
    const startTime = performance.now();
    const startValue = 0;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);

      el.textContent = currentValue.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Ensure we land exactly on the target value
        el.textContent = target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  // Observe the #impact section; start counters when it enters viewport
  let countersAnimated = false;

  if (impactSection && statNumbers.length > 0) {
    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !countersAnimated) {
              countersAnimated = true;

              statNumbers.forEach(function (el) {
                const target = parseInt(el.getAttribute('data-target'), 10);
                const suffix = el.getAttribute('data-suffix') || '';
                const duration = 1800; // ms

                if (!isNaN(target)) {
                  animateCounter(el, target, suffix, duration);
                }
              });

              // Stop observing once triggered
              counterObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.25  // Trigger when 25% of the impact section is visible
        }
      );

      counterObserver.observe(impactSection);
    } else {
      // Fallback: set final values immediately
      statNumbers.forEach(function (el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        if (!isNaN(target)) {
          el.textContent = target.toLocaleString() + suffix;
        }
      });
    }
  }


  /* ----------------------------------------------------------
     BONUS: Window resize — close mobile menu if resizing to desktop
  ---------------------------------------------------------- */
  let resizeTimer;

  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth >= 1024 && menuIsOpen) {
        closeMenu();
      }
    }, 150);
  });


  /* ----------------------------------------------------------
     INIT LOG
  ---------------------------------------------------------- */
  console.log(
    '%cAsana Wellness Foundation%c — Website Initialized',
    'color: #FBB040; font-weight: bold; font-size: 14px;',
    'color: #660591; font-size: 12px;'
  );

})();
