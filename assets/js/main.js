const body = document.body;
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".nav-toggle");
const navigation = document.querySelector(".site-nav");
const modalTriggers = document.querySelectorAll("[data-modal-open]");
const form = document.querySelector("#contact-form");
const feedback = document.querySelector("#form-feedback");

let activeModal = null;

const syncBodyLock = () => {
  const menuOpen = header?.classList.contains("is-menu-open");
  const modalOpen = activeModal && !activeModal.hidden;
  body.classList.toggle("is-locked", Boolean(menuOpen || modalOpen));
};

const closeMenu = () => {
  if (!header || !menuButton) return;

  header.classList.remove("is-menu-open");
  menuButton.setAttribute("aria-expanded", "false");
  syncBodyLock();
};

const toggleMenu = () => {
  if (!header || !menuButton) return;

  const isOpen = header.classList.toggle("is-menu-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  syncBodyLock();
};

const updateHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

menuButton?.addEventListener("click", toggleMenu);

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeMenu();
  }
});
updateHeaderState();

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const faqItems = document.querySelectorAll(".faq__item");

const setFaqState = (item, isOpen) => {
  const button = item.querySelector(".faq__question");
  item.classList.toggle("is-open", isOpen);
  button?.setAttribute("aria-expanded", String(isOpen));
};

faqItems.forEach((item) => {
  const button = item.querySelector(".faq__question");
  setFaqState(item, item.classList.contains("is-open"));

  button?.addEventListener("click", () => {
    const alreadyOpen = item.classList.contains("is-open");

    faqItems.forEach((faqItem) => setFaqState(faqItem, false));

    if (!alreadyOpen) {
      setFaqState(item, true);
    }
  });
});

const openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  activeModal = modal;
  modal.hidden = false;
  syncBodyLock();
  modal.querySelector(".modal__close")?.focus();
};

const closeModal = () => {
  if (!activeModal) return;

  activeModal.hidden = true;
  activeModal = null;
  syncBodyLock();
};

modalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => openModal(trigger.dataset.modalOpen));
});

document.querySelectorAll("[data-modal-close]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (activeModal) {
    closeModal();
    return;
  }

  closeMenu();
});

const fieldRules = {
  name: {
    validate: (value) => value.length >= 2,
    message: "Укажите имя, чтобы можно было к вам обратиться."
  },
  phone: {
    validate: (value) => value.replace(/\D/g, "").length >= 10,
    message: "Введите телефон для обратной связи."
  },
  message: {
    validate: (value) => value.length >= 10,
    message: "Коротко опишите задачу, хотя бы в 10 символах."
  }
};

const setFieldError = (field, message = "") => {
  const wrapper = field.closest(".form-field");
  const errorNode = wrapper?.querySelector(".field-error");

  wrapper?.classList.toggle("is-invalid", Boolean(message));
  if (errorNode) {
    errorNode.textContent = message;
  }
};

const validateField = (fieldName) => {
  const field = form?.elements.namedItem(fieldName);
  if (!(field instanceof HTMLElement) || !(fieldName in fieldRules)) {
    return false;
  }

  const value = "value" in field ? String(field.value).trim() : "";
  const rule = fieldRules[fieldName];
  const isValid = rule.validate(value);

  setFieldError(field, isValid ? "" : rule.message);
  return isValid;
};

Object.keys(fieldRules).forEach((fieldName) => {
  const field = form?.elements.namedItem(fieldName);
  if (!(field instanceof HTMLElement)) return;

  field.addEventListener("input", () => validateField(fieldName));
  field.addEventListener("blur", () => validateField(fieldName));
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const isValid = Object.keys(fieldRules).every((fieldName) => validateField(fieldName));

  feedback?.classList.remove("is-success", "is-error");
  if (feedback) feedback.textContent = "";

  if (!isValid) {
    feedback?.classList.add("is-error");
    if (feedback) {
      feedback.textContent = "Проверьте поля формы и попробуйте ещё раз.";
    }
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = true;
    submitButton.textContent = "Отправляем...";
  }

  try {
    /*
      АДАПТАЦИЯ: подключите здесь реальную отправку формы.
      Пример Formspree:
      await fetch("https://formspree.io/f/your-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    */

    await new Promise((resolve) => setTimeout(resolve, 700));
    console.info("Demo form payload", payload);

    form.reset();
    Object.keys(fieldRules).forEach((fieldName) => {
      const field = form.elements.namedItem(fieldName);
      if (field instanceof HTMLElement) {
        setFieldError(field, "");
      }
    });

    feedback?.classList.add("is-success");
    if (feedback) {
      feedback.textContent = "Заявка отправлена. Я свяжусь с вами в ближайшее время.";
    }
  } catch (error) {
    console.error(error);
    feedback?.classList.add("is-error");
    if (feedback) {
      feedback.textContent =
        "Не удалось отправить форму. Подключите обработчик или попробуйте позже.";
    }
  } finally {
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = false;
      submitButton.textContent = "Отправить заявку";
    }
  }
});
