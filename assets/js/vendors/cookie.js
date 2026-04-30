export function initCookieConsent(options = {}) {
  // Параметры по умолчанию
  const defaults = {
    type: "row",
    theme: "light",
    hasCloseButton: true,
    buttonAcceptClass: "cookie-consent-accept",
    buttonRejectClass: "cookie-consent-reject",
    positionX: "right",
    positionY: "bottom",
    cookieTitleHTML: "Сайт использует cookie",
    cookieTextHTML: `<p>Мы используем файлы cookie, чтобы сайт работал лучше, 
			а вы — комфортнее. Продолжая пользоваться сайтом, 
			вы соглашаетесь с политикой обработки данных.</p>`,
    buttonAcceptText: "Согласен",
    buttonRejectText: "Не согласен",
    expireDays: 30,
    cookieCustom: "",
    onAccept: () => { },
  };

  const config = { ...defaults, ...options };

  if (document.cookie.includes("cookieConsent=accepted")) {
    config.onAccept();
    return;
  }

  const cookieBanner = document.createElement("div");
  cookieBanner.id = "cookie-consent-banner";
  cookieBanner.className = `cookie-consent ${config.theme} ${config.type} ${config.positionX} ${config.positionY} cookie-consent-hidden`;
  const cookieTitleHTML = config.cookieTitleHTML
    ? `<div class="cookie-consent-title">${config.cookieTitleHTML}</div>`
    : "";

  switch (config.type) {
    case "column":
      cookieBanner.innerHTML = `
	  	<div class="cookie-consent-icon"></div>
        <div class="cookie-consent-content">
          ${cookieTitleHTML}
          ${config.cookieTextHTML}
        </div>
      <div class="cookie-consent-buttons">
        <button class="button ${config.buttonAcceptClass
        }" data-cookie-accept  role="button" aria-label="Принять и закрыть уведомление">
            <span>${config.buttonAcceptText}</span>
        </button>
        <button class="button ${config.buttonRejectClass
        }" role="button" aria-label="Отказаться от использования cookie-файлов" data-cookie-reject>${config.buttonRejectText
        }</button>
      </div>
			${config.hasCloseButton
          ? '<button class="cookie-consent-close" role="button" aria-label="Закрыть уведомление" data-cookie-close></button>'
          : ""
        }`;
      break;

    case "row":
      cookieBanner.innerHTML = `
	  	<div class="cookie-consent-icon"></div>
        <div class="cookie-consent-content">
        ${cookieTitleHTML}
             ${config.cookieTextHTML}
        </div>
       <div class="cookie-consent-buttons">
          <button class="btn btn-primary" data-cookie-accept  role="button" aria-label="Принять и закрыть уведомление">
              <span>${config.buttonAcceptText}</span>
          </button>
          <button class="button  ${config.buttonRejectClass
        }" role="button" aria-label="Отказаться от использования cookie-файлов" data-cookie-reject>${config.buttonRejectText
        }</button>
        </div>
			${config.hasCloseButton
          ? '<button class="cookie-consent-close" role="button" aria-label="Закрыть уведомление" data-cookie-close></button>'
          : ""
        }
		`;
      break;
    case "mixed":
      {
        cookieBanner.innerHTML = `
	  	<div class="cookie-consent-icon"></div>
        <div class="cookie-consent-content">
          ${cookieTitleHTML}
          ${config.cookieTextHTML}
			  <div class="cookie-consent-buttons">
          <button class="button ${config.buttonAcceptClass
          }" data-cookie-accept  role="button" aria-label="Принять и закрыть уведомление">
              ${config.buttonAcceptText}
          </button>
          <button class="button  ${config.buttonRejectClass
          }" role="button" aria-label="Отказаться от использования cookie-файлов" data-cookie-reject>${config.buttonRejectText
          }</button>
        </div>
        </div>
			${config.hasCloseButton
            ? '<button class="cookie-consent-close" role="button" aria-label="Закрыть уведомление" data-cookie-close></button>'
            : ""
          }`;
      }
      break;
    default: {
      cookieBanner.innerHTML = config.cookieCustom;
    }
  }

  document.body.appendChild(cookieBanner);

  const acceptButton = cookieBanner.querySelector("[data-cookie-accept]");
  const closeButton = config.hasCloseButton
    ? cookieBanner.querySelector("[data-cookie-close]")
    : null;
  const rejectButton = cookieBanner.querySelector("[data-cookie-reject]");

  acceptButton.addEventListener("click", () => {
    config.onAccept();
    setCookie("cookieConsent", "accepted", config.expireDays);
    cookieBanner.classList.add("cookie-consent-hidden");
    setTimeout(() => {
      cookieBanner.remove();
    }, 400);
  });

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      cookieBanner.classList.add("cookie-consent-hidden");
      setTimeout(() => {
        cookieBanner.remove();
      }, 400);
    });
  }

  setTimeout(() => {
    cookieBanner.classList.remove("cookie-consent-hidden");
  }, 300);

  rejectButton.addEventListener("click", () => {
    cookieBanner.classList.add("cookie-consent-hidden");
    setTimeout(() => {
      cookieBanner.remove();
    }, 400);
  });

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  }
}
