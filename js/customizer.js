/**
 * Streamlined Customizer Studio & Permanent Storage Engine
 */
const DEFAULT_HEARTFELT_NOTE = `Happy Birthday, dearest {recipient}! 🎂✨

On this extraordinary day, I want to send you all my warmest love and deepest wishes from the bottom of my heart. You are truly one of a kind—someone whose gentle smile and presence instantly brightens up everything around.

May every single step of your journey ahead be filled with abundant joy, radiant health, boundless success, and inner peace. No matter where life takes us, always remember that I am right here cheering for you. May all your silent wishes and beautiful dreams turn into reality this year.

Stay wonderfully you, and take great care of yourself. Wishing you the happiest birthday ever! 💖

— With all my love,
{sender}`;

const DEFAULT_GIFT_DATA = {
  recipientName: "Bisma Aapi",
  senderName: "Your Well-Wisher ❤️",
  birthdayDate: "Today",
  pinCode: "2004",
  hint: "Passcode: 2004",
  theme: "theme-lavender",
  musicUrl: "",
  letter: DEFAULT_HEARTFELT_NOTE
};

class CustomizerStudio {
  constructor(app) {
    this.app = app;
    this.data = JSON.parse(JSON.stringify(DEFAULT_GIFT_DATA));
    this.modal = document.getElementById("customizer-modal");
    this.init();
  }

  init() {
    this.loadSavedData();
    this.bindEvents();
    this.populateForm();
  }

  loadSavedData() {
    try {
      const localData = localStorage.getItem("birthday_gift_custom_data");
      if (localData) {
        const parsed = JSON.parse(localData);
        this.data = { ...DEFAULT_GIFT_DATA, ...parsed };
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }

    try {
      if (window.location.hash && window.location.hash.startsWith("#gift=")) {
        const encoded = window.location.hash.substring(6);
        const jsonString = decodeURIComponent(escape(atob(encoded)));
        const parsed = JSON.parse(jsonString);
        this.data = { ...DEFAULT_GIFT_DATA, ...parsed };
      }
    } catch (e) {
      console.warn("Could not parse gift data from URL hash:", e);
    }
  }

  bindEvents() {
    const openBtn = document.getElementById("open-customizer-btn");
    const closeBtn = document.getElementById("close-customizer-btn");
    const saveBtn = document.getElementById("save-customizer-btn");
    const shareBtn = document.getElementById("share-link-btn");
    const copyBtn = document.getElementById("copy-link-btn");
    const resetBtn = document.getElementById("reset-customizer-btn");

    if (openBtn) openBtn.addEventListener("click", () => this.openModal());
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeModal());
    if (saveBtn) saveBtn.addEventListener("click", () => this.saveChanges());
    if (shareBtn) shareBtn.addEventListener("click", () => this.generateShareLink());
    if (copyBtn) copyBtn.addEventListener("click", () => this.copyShareLink());
    if (resetBtn) resetBtn.addEventListener("click", () => this.resetDefaults());

    const themeButtons = document.querySelectorAll(".theme-btn");
    themeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        themeButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.data.theme = btn.dataset.theme;
        document.body.className = this.data.theme;
      });
    });
  }

  openModal() {
    if (this.modal) {
      this.populateForm();
      this.modal.classList.add("active");
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove("active");
    }
  }

  getFormattedLetter() {
    let text = this.data.letter || DEFAULT_HEARTFELT_NOTE;
    text = text.replace(/{recipient}/g, this.data.recipientName || "Bisma Aapi");
    text = text.replace(/{sender}/g, this.data.senderName || "Your Well-Wisher ❤️");
    return text;
  }

  populateForm() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };

    setVal("cust-recipient", this.data.recipientName);
    setVal("cust-sender", this.data.senderName);
    setVal("cust-date", this.data.birthdayDate);
    setVal("cust-pin", this.data.pinCode);
    setVal("cust-hint", this.data.hint);
    setVal("cust-letter", this.data.letter);
    setVal("cust-music", this.data.musicUrl);

    const themeButtons = document.querySelectorAll(".theme-btn");
    themeButtons.forEach(b => {
      if (b.dataset.theme === this.data.theme) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }

  saveChanges() {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    };

    this.data.recipientName = getVal("cust-recipient") || "Bisma Aapi";
    this.data.senderName = getVal("cust-sender") || "Your Well-Wisher ❤️";
    this.data.birthdayDate = getVal("cust-date") || "Today";
    this.data.pinCode = getVal("cust-pin") || "2004";
    this.data.hint = getVal("cust-hint") || `Passcode: ${this.data.pinCode}`;
    this.data.letter = getVal("cust-letter") || DEFAULT_HEARTFELT_NOTE;
    this.data.musicUrl = getVal("cust-music");

    try {
      localStorage.setItem("birthday_gift_custom_data", JSON.stringify(this.data));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    this.closeModal();
    this.app.applyData(this.data);
    this.showToast("✨ Saved permanently!");
  }

  generateShareLink() {
    this.saveChanges();
    const jsonStr = JSON.stringify(this.data);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    const fullUrl = `${window.location.origin}${window.location.pathname}#gift=${encoded}`;

    const linkInput = document.getElementById("share-link-input");
    const shareResult = document.getElementById("share-result-container");
    if (linkInput && shareResult) {
      linkInput.value = fullUrl;
      shareResult.classList.remove("hidden");
    }
    return fullUrl;
  }

  copyShareLink() {
    const linkInput = document.getElementById("share-link-input");
    if (linkInput) {
      linkInput.select();
      navigator.clipboard.writeText(linkInput.value).then(() => {
        this.showToast("📋 Share link copied to clipboard!");
      }).catch(() => {
        document.execCommand("copy");
        this.showToast("📋 Link copied to clipboard!");
      });
    }
  }

  resetDefaults() {
    if (confirm("Reset all settings back to default values?")) {
      this.data = JSON.parse(JSON.stringify(DEFAULT_GIFT_DATA));
      try {
        localStorage.removeItem("birthday_gift_custom_data");
      } catch (e) {}
      window.location.hash = "";
      this.populateForm();
      this.app.applyData(this.data);
      this.showToast("🔄 Reset to default values!");
    }
  }

  showToast(msg) {
    let toast = document.getElementById("app-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "app-toast";
      toast.className = "app-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("visible");
    setTimeout(() => {
      toast.classList.remove("visible");
    }, 2800);
  }
}

window.CustomizerStudio = CustomizerStudio;
window.DEFAULT_GIFT_DATA = DEFAULT_GIFT_DATA;
