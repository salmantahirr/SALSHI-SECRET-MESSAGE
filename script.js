"use strict";

const ALPHABET_SIZE = 26;

/**
 * Shift a single character by `shift` places (positive = right, negative = left).
 * Only A-Z and a-z are changed; everything else is returned unchanged.
 */
function shiftCharacter(character, shift) {
  const code = character.charCodeAt(0);
  let base = null;
  if (code >= 65 && code <= 90) base = 65;
  else if (code >= 97 && code <= 122) base = 97;
  if (base === null) return character;
  // Double modulo keeps the result positive for negative shifts.
  const offset = (((code - base + shift) % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;
  return String.fromCharCode(base + offset);
}

/** Encryption moves letters LEFT. */
function encryptMessage(message, shift) {
  return Array.from(message, (ch) => shiftCharacter(ch, -shift)).join("");
}

/** Decryption moves letters RIGHT. */
function decryptMessage(message, shift) {
  return Array.from(message, (ch) => shiftCharacter(ch, shift)).join("");
}

function parseShift(rawValue) {
  const value = rawValue.trim();
  if (value === "") return { error: "Please enter a shift amount." };
  if (!/^-?\d+$/.test(value)) return { error: "Shift amount must be a whole number." };
  return { value: parseInt(value, 10) % ALPHABET_SIZE };
}

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const panels = {
    encrypt: document.getElementById("panel-encrypt"),
    decrypt: document.getElementById("panel-decrypt"),
  };

  function switchMode(mode) {
    tabs.forEach((tab) => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    Object.entries(panels).forEach(([key, panel]) => {
      panel.hidden = key !== mode;
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => switchMode(tab.dataset.mode));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const next = tabs[(index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      switchMode(next.dataset.mode);
    });
  });

  function setupPanel(mode, transform) {
    const form = document.getElementById(`${mode}-form`);
    const messageInput = document.getElementById(`${mode}-message`);
    const shiftInput = document.getElementById(`${mode}-shift`);
    const errorBox = document.getElementById(`${mode}-error`);
    const resultBox = document.getElementById(`${mode}-result`);
    const output = document.getElementById(`${mode}-output`);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      errorBox.textContent = "";
      if (messageInput.value.trim() === "") {
        errorBox.textContent = "Please enter a message.";
        resultBox.hidden = true;
        messageInput.focus();
        return;
      }
      const shift = parseShift(shiftInput.value);
      if (shift.error) {
        errorBox.textContent = shift.error;
        resultBox.hidden = true;
        shiftInput.focus();
        return;
      }
      output.textContent = transform(messageInput.value, shift.value);
      resultBox.hidden = false;
    });
  }

  setupPanel("encrypt", encryptMessage);
  setupPanel("decrypt", decryptMessage);

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = document.getElementById(button.dataset.copy).textContent;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const helper = document.createElement("textarea");
        helper.value = text;
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
      }
      const label = button.textContent;
      button.textContent = "Copied!";
      setTimeout(() => (button.textContent = label), 1600);
    });
  });

  document.getElementById("send-to-decrypt").addEventListener("click", () => {
    document.getElementById("decrypt-message").value =
      document.getElementById("encrypt-output").textContent;
    document.getElementById("decrypt-shift").value =
      document.getElementById("encrypt-shift").value;
    document.getElementById("decrypt-result").hidden = true;
    document.getElementById("decrypt-error").textContent = "";
    switchMode("decrypt");
    document.getElementById("decrypt-message").focus();
  });
});
