"use strict";


/* =========================================
   CLOUDFLARE WORKER
   ========================================= */

const WORKER_URL =
  "https://loreal-beauty-advisor.cameronfriedman.workers.dev";


/* =========================================
   PRODUCT DATA
   ========================================= */

const products = [
  {
    id: "revitalift-hyaluronic-serum",
    brand: "RevitaLift",
    name: "1.5% Pure Hyaluronic Acid Serum",
    category: "skincare",
    type: "Serum",
    step: "treatment",
    time: "morning and evening",
    color: "#d9eff3",
    accent: "#8ed5df",
    label: "HA\n1.5%",
    description:
      "A lightweight hydration-focused serum used after cleansing and before moisturizer.",
    tags: [
      "hydration",
      "hyaluronic acid",
      "dry skin",
      "serum"
    ]
  },

  {
    id: "revitalift-triple-power-spf",
    brand: "RevitaLift",
    name: "Triple Power Moisturizer SPF 30",
    category: "skincare",
    type: "Moisturizer",
    step: "protect",
    time: "morning",
    color: "#efe1c0",
    accent: "#c4a25d",
    label: "SPF\n30",
    description:
      "A daytime moisturizer with broad-spectrum SPF protection for the final step of a morning routine.",
    tags: [
      "moisturizer",
      "spf",
      "morning",
      "hydration"
    ]
  },

  {
    id: "revitalift-eye-serum",
    brand: "RevitaLift",
    name: "2.5% Hyaluronic Acid + Caffeine Eye Serum",
    category: "skincare",
    type: "Eye serum",
    step: "eye care",
    time: "morning and evening",
    color: "#e4f0f1",
    accent: "#73b6bd",
    label: "EYE\nSERUM",
    description:
      "A targeted eye serum featuring hyaluronic acid and caffeine for the eye area.",
    tags: [
      "eye care",
      "hyaluronic acid",
      "caffeine",
      "serum"
    ]
  },

  {
    id: "revitalift-triple-power-serum",
    brand: "RevitaLift",
    name: "Triple Power Tri-Peptides Serum",
    category: "skincare",
    type: "Serum",
    step: "treatment",
    time: "morning and evening",
    color: "#e6d8c1",
    accent: "#a98550",
    label: "TRIPLE\nPOWER",
    description:
      "A targeted serum for users focused on radiance, smoother-looking texture, and firmness.",
    tags: [
      "peptides",
      "radiance",
      "texture",
      "serum"
    ]
  },

  {
    id: "elvive-total-repair-shampoo",
    brand: "Elvive",
    name: "Total Repair 5 Repairing Shampoo",
    category: "haircare",
    type: "Shampoo",
    step: "cleanse",
    time: "hair wash day",
    color: "#ece7dd",
    accent: "#d64545",
    label: "TOTAL\nREPAIR 5",
    description:
      "A repairing shampoo designed for visible signs of damaged, weak, brittle, or tangled hair.",
    tags: [
      "damaged hair",
      "repair",
      "shampoo",
      "breakage"
    ]
  },

  {
    id: "elvive-total-repair-conditioner",
    brand: "Elvive",
    name: "Total Repair 5 Repairing Conditioner",
    category: "haircare",
    type: "Conditioner",
    step: "condition",
    time: "hair wash day",
    color: "#f0ebe3",
    accent: "#d64545",
    label: "TOTAL\nREPAIR 5",
    description:
      "A conditioner intended to follow shampoo as part of a damage-focused haircare routine.",
    tags: [
      "conditioner",
      "damaged hair",
      "repair",
      "moisture"
    ]
  },

  {
    id: "elvive-hyaluron-plump",
    brand: "Elvive",
    name: "Hyaluron Plump Moisture Plump Serum",
    category: "haircare",
    type: "Leave-in serum",
    step: "leave-in",
    time: "after washing",
    color: "#d8e7f7",
    accent: "#7f9ed5",
    label: "HYALURON\nPLUMP",
    description:
      "A moisture-focused leave-in product for dry or dehydrated-feeling hair.",
    tags: [
      "dry hair",
      "leave-in",
      "hyaluronic",
      "moisture"
    ]
  },

  {
    id: "true-match-foundation",
    brand: "True Match",
    name: "Super-Blendable Skincare Infused Foundation",
    category: "makeup",
    type: "Foundation",
    step: "complexion",
    time: "makeup application",
    color: "#d5aa82",
    accent: "#b78357",
    label: "TRUE\nMATCH",
    description:
      "A buildable foundation designed around skin depth and cool, warm, or neutral undertones.",
    tags: [
      "foundation",
      "undertone",
      "complexion",
      "natural finish"
    ]
  },

  {
    id: "infallible-fresh-wear",
    brand: "Infallible",
    name: "32 Hour Fresh Wear Foundation",
    category: "makeup",
    type: "Foundation",
    step: "complexion",
    time: "makeup application",
    color: "#d6aa85",
    accent: "#d94b4b",
    label: "FRESH\nWEAR",
    description:
      "A long-wearing foundation option for users seeking extended makeup wear.",
    tags: [
      "foundation",
      "long wear",
      "complexion",
      "infallible"
    ]
  },

  {
    id: "telescopic-lift-mascara",
    brand: "Telescopic",
    name: "Instant Lift Washable Mascara",
    category: "makeup",
    type: "Mascara",
    step: "eyes",
    time: "makeup application",
    color: "#111111",
    accent: "#c5a15a",
    label: "LIFT\nMASCARA",
    description:
      "A washable mascara designed to lift and lengthen the appearance of lashes.",
    tags: [
      "mascara",
      "eyes",
      "length",
      "lift"
    ]
  },

  {
    id: "colour-riche-lipstick",
    brand: "Colour Riche",
    name: "Satin Lipstick",
    category: "makeup",
    type: "Lip color",
    step: "lips",
    time: "makeup application",
    color: "#8b2335",
    accent: "#d1a45f",
    label: "COLOUR\nRICHE",
    description:
      "A satin-finish lip color created to provide rich color with a comfortable feel.",
    tags: [
      "lipstick",
      "satin",
      "lip color",
      "makeup"
    ]
  },

  {
    id: "true-match-powder",
    brand: "True Match",
    name: "Super-Blendable Powder",
    category: "makeup",
    type: "Face powder",
    step: "set",
    time: "makeup application",
    color: "#d8b897",
    accent: "#b5885e",
    label: "TRUE\nMATCH",
    description:
      "A face powder designed to coordinate with the True Match complexion range.",
    tags: [
      "powder",
      "setting",
      "complexion",
      "true match"
    ]
  }
];


/* =========================================
   SYSTEM PROMPT
   ========================================= */

const SYSTEM_PROMPT = `
You are the L'Oréal Paris Product-Aware Routine Builder and Beauty Advisor.

Your role is to help users build routines using the specific product data
provided in the conversation.

Follow these rules:

1. Only answer questions related to L'Oréal Paris products, skincare,
haircare, makeup, beauty routines, ingredients, application techniques,
shade selection, or the products selected by the user.

2. Politely refuse unrelated questions and redirect the user toward beauty,
L'Oréal products, or their selected routine.

3. When the user selects products, use only those selected products when
creating the main routine. You may mention a missing product category, such
as cleanser or sunscreen, but clearly state that it was not selected.

4. Organize routines in a logical order. Clearly separate morning, evening,
hair wash day, or makeup steps when appropriate.

5. Explain what each selected product contributes to the routine.

6. Never diagnose medical conditions or claim that a cosmetic product cures
a health condition.

7. Encourage patch testing, following package directions, and consulting a
qualified professional for medical concerns.

8. Product availability and formulas may vary by location.

9. Keep responses elegant, practical, clear, and easy to scan.

10. Remember previous user messages and selected products throughout the
conversation.
`.trim();


/* =========================================
   DOM REFERENCES
   ========================================= */

const productGrid =
  document.getElementById("productGrid");

const productSearch =
  document.getElementById("productSearch");

const categoryFilter =
  document.getElementById("categoryFilter");

const productResultCount =
  document.getElementById("productResultCount");

const clearFiltersButton =
  document.getElementById("clearFiltersButton");

const emptyProducts =
  document.getElementById("emptyProducts");

const selectedProductsContainer =
  document.getElementById("selectedProducts");

const emptySelection =
  document.getElementById("emptySelection");

const selectedCount =
  document.getElementById("selectedCount");

const generateRoutineButton =
  document.getElementById("generateRoutineButton");

const clearSelectionButton =
  document.getElementById("clearSelectionButton");

const routineGoal =
  document.getElementById("routineGoal");

const routineTime =
  document.getElementById("routineTime");

const customConcern =
  document.getElementById("customConcern");

const routineOutput =
  document.getElementById("routineOutput");

const chatForm =
  document.getElementById("chatForm");

const userInput =
  document.getElementById("userInput");

const chatMessages =
  document.getElementById("chatMessages");

const characterCount =
  document.getElementById("characterCount");

const clearChatButton =
  document.getElementById("clearChatButton");

const sendButton =
  chatForm.querySelector(".send-button");

const promptButtons =
  document.querySelectorAll("[data-prompt]");


/* =========================================
   STATE
   ========================================= */

let selectedProductIds = [];

let currentRoutine = "";

const welcomeMessage = {
  role: "assistant",
  content:
    "Welcome to the L'Oréal Paris Product-Aware Routine Builder. " +
    "Select products above to generate a routine, or ask me a question " +
    "about skincare, haircare, or makeup."
};

let conversationHistory = [
  {
    role: "system",
    content: SYSTEM_PROMPT
  },

  welcomeMessage
];


/* =========================================
   PRODUCT CATALOG
   ========================================= */

function renderProducts() {
  const searchTerm =
    productSearch.value.trim().toLowerCase();

  const selectedCategory =
    categoryFilter.value;

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    const searchableText = [
      product.brand,
      product.name,
      product.category,
      product.type,
      product.description,
      ...product.tags
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !searchTerm ||
      searchableText.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = "";

  filteredProducts.forEach((product) => {
    productGrid.appendChild(
      createProductCard(product)
    );
  });

  const total = filteredProducts.length;

  productResultCount.textContent =
    total === products.length
      ? `Showing all ${total} products`
      : `Showing ${total} matching product${total === 1 ? "" : "s"}`;

  emptyProducts.classList.toggle(
    "hidden",
    total !== 0
  );
}


function createProductCard(product) {
  const isSelected =
    selectedProductIds.includes(product.id);

  const card =
    document.createElement("article");

  card.className =
    `product-card${isSelected ? " selected" : ""}`;

  card.dataset.productId = product.id;

  card.innerHTML = `
    <span class="product-category">
      ${escapeHTML(product.category)}
    </span>

    <span class="product-check" aria-hidden="true">
      ✓
    </span>

    <div class="product-art" aria-hidden="true">

      <div
        class="product-mockup"
        style="
          --mockup-color: ${product.color};
          --mockup-accent: ${product.accent};
        "
      >

        <div class="mockup-cap"></div>

        <div class="mockup-body">
          <strong>${escapeHTML(product.label)}</strong>
          <small>L'ORÉAL PARIS</small>
        </div>

      </div>

    </div>

    <p class="product-brand">
      ${escapeHTML(product.brand)}
    </p>

    <h3 class="product-name">
      ${escapeHTML(product.name)}
    </h3>

    <p class="product-description">
      ${escapeHTML(product.description)}
    </p>

    <div class="product-tags">
      ${product.tags
        .slice(0, 3)
        .map((tag) => {
          return `<span>${escapeHTML(tag)}</span>`;
        })
        .join("")}
    </div>

    <button
      class="select-product-button"
      type="button"
      data-product-id="${product.id}"
      aria-pressed="${isSelected}"
    >
      ${isSelected ? "Remove product" : "Add to routine"}
    </button>
  `;

  const selectButton =
    card.querySelector(".select-product-button");

  selectButton.addEventListener("click", () => {
    toggleProductSelection(product.id);
  });

  return card;
}


/* =========================================
   PRODUCT SELECTION
   ========================================= */

function toggleProductSelection(productId) {
  const isSelected =
    selectedProductIds.includes(productId);

  if (isSelected) {
    selectedProductIds =
      selectedProductIds.filter((id) => {
        return id !== productId;
      });
  } else {
    if (selectedProductIds.length >= 6) {
      window.alert(
        "You can select up to six products for one routine."
      );

      return;
    }

    selectedProductIds.push(productId);
  }

  renderProducts();
  renderSelectedProducts();
  updateSelectionControls();
}


function renderSelectedProducts() {
  selectedProductsContainer.innerHTML = "";

  const selectedProducts =
    getSelectedProducts();

  if (selectedProducts.length === 0) {
    selectedProductsContainer.appendChild(
      createEmptySelection()
    );

    return;
  }

  selectedProducts.forEach((product) => {
    const chip =
      document.createElement("article");

    chip.className = "selected-chip";

    chip.innerHTML = `
      <div
        class="selected-chip-art"
        style="--chip-color: ${product.color};"
        aria-hidden="true"
      >
        ${escapeHTML(product.brand)}
      </div>

      <div>
        <strong>${escapeHTML(product.name)}</strong>
        <small>${escapeHTML(product.type)}</small>
      </div>

      <button
        class="remove-chip"
        type="button"
        aria-label="Remove ${escapeHTML(product.name)}"
      >
        ×
      </button>
    `;

    chip
      .querySelector(".remove-chip")
      .addEventListener("click", () => {
        toggleProductSelection(product.id);
      });

    selectedProductsContainer.appendChild(chip);
  });
}


function createEmptySelection() {
  const element =
    document.createElement("div");

  element.className = "empty-selection";

  element.innerHTML = `
    <span aria-hidden="true">＋</span>

    <p>
      Select products from the catalog to begin building your
      routine.
    </p>
  `;

  return element;
}


function updateSelectionControls() {
  const count =
    selectedProductIds.length;

  selectedCount.textContent =
    String(count);

  generateRoutineButton.disabled =
    count === 0;

  clearSelectionButton.disabled =
    count === 0;
}


function clearSelections() {
  selectedProductIds = [];
  currentRoutine = "";

  renderProducts();
  renderSelectedProducts();
  updateSelectionControls();
  resetRoutineOutput();
}


function getSelectedProducts() {
  return selectedProductIds
    .map((id) => {
      return products.find((product) => {
        return product.id === id;
      });
    })
    .filter(Boolean);
}


/* =========================================
   ROUTINE GENERATION
   ========================================= */

async function generateRoutine() {
  const selectedProducts =
    getSelectedProducts();

  if (selectedProducts.length === 0) {
    return;
  }

  setRoutineLoading(true);

  const productContext =
    selectedProducts
      .map((product, index) => {
        return [
          `${index + 1}. ${product.brand} ${product.name}`,
          `Category: ${product.category}`,
          `Product type: ${product.type}`,
          `Suggested step: ${product.step}`,
          `Typical timing: ${product.time}`,
          `Description: ${product.description}`,
          `Tags: ${product.tags.join(", ")}`
        ].join("\n");
      })
      .join("\n\n");

  const extraConcern =
    customConcern.value.trim() ||
    "No additional concern was provided.";

  const routineRequest = `
Create a personalized L'Oréal Paris routine using the products below.

User's primary goal:
${routineGoal.value}

Requested routine timing:
${routineTime.value}

Additional user information:
${extraConcern}

Selected product data:
${productContext}

Requirements:
- Use every selected product unless there is a clear safety or routine reason not to.
- Put the selected products in a logical application order.
- Clearly separate morning, evening, hair wash day, or makeup steps when relevant.
- Explain briefly why each product belongs in that step.
- Clearly identify any important missing category, but do not pretend the user selected a product they did not select.
- Include a brief patch-test and package-directions reminder.
- Keep the routine practical and easy to scan.
`.trim();

  const temporaryMessages = [
    ...conversationHistory,

    {
      role: "user",
      content: routineRequest
    }
  ];

  try {
    const routineText =
      await requestAIResponse(temporaryMessages);

    currentRoutine = routineText;

    displayRoutineResult(routineText);

    conversationHistory.push({
      role: "user",
      content:
        "I generated a routine using these selected products: " +
        selectedProducts
          .map((product) => {
            return `${product.brand} ${product.name}`;
          })
          .join(", ") +
        `. My goal is ${routineGoal.value}, and I requested a ` +
        `${routineTime.value}.`
    });

    conversationHistory.push({
      role: "assistant",
      content: routineText
    });

    appendMessage(
      "assistant",
      "Your product-aware routine has been generated above. " +
      "You can ask me follow-up questions about the order, timing, " +
      "or any of the selected products."
    );
  } catch (error) {
    console.error("Routine generation error:", error);

    displayRoutineError(
      error.message ||
      "The routine could not be generated."
    );
  } finally {
    setRoutineLoading(false);
  }
}


function setRoutineLoading(isLoading) {
  generateRoutineButton.disabled =
    isLoading ||
    selectedProductIds.length === 0;

  clearSelectionButton.disabled =
    isLoading ||
    selectedProductIds.length === 0;

  if (isLoading) {
    generateRoutineButton.innerHTML = `
      <span aria-hidden="true">✦</span>
      Building routine...
    `;

    routineOutput.innerHTML = `
      <div class="routine-loading">

        <div>

          <div class="loading-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <p>
            The beauty advisor is organizing your selected products.
          </p>

        </div>

      </div>
    `;
  } else {
    generateRoutineButton.innerHTML = `
      <span aria-hidden="true">✦</span>
      Generate AI routine
    `;
  }
}


function displayRoutineResult(text) {
  routineOutput.innerHTML = "";

  const result =
    document.createElement("article");

  result.className = "routine-result";

  const heading =
    document.createElement("h3");

  heading.textContent =
    "Your personalized routine";

  const content =
    document.createElement("div");

  content.className =
    "routine-result-text";

  content.textContent = text;

  const note =
    document.createElement("p");

  note.className =
    "routine-result-note";

  note.textContent =
    "General beauty guidance only. Follow individual product directions, " +
    "patch-test when appropriate, and seek qualified medical guidance for " +
    "skin or scalp health concerns.";

  result.appendChild(heading);
  result.appendChild(content);
  result.appendChild(note);

  routineOutput.appendChild(result);

  routineOutput.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


function displayRoutineError(message) {
  routineOutput.innerHTML = `
    <div class="routine-placeholder routine-error">

      <span aria-hidden="true">!</span>

      <div>

        <h3>Routine unavailable</h3>

        <p>${escapeHTML(message)}</p>

      </div>

    </div>
  `;
}


function resetRoutineOutput() {
  routineOutput.innerHTML = `
    <div class="routine-placeholder">

      <span aria-hidden="true">L</span>

      <div>

        <h3>About your routine</h3>

        <p>
          Your personalized product order and application guidance
          will appear here.
        </p>

      </div>

    </div>
  `;
}


/* =========================================
   CHATBOT
   ========================================= */

async function processUserMessage(query) {
  setChatBusy(true);

  appendMessage("user", query);

  const selectedProducts =
    getSelectedProducts();

  const selectedContext =
    selectedProducts.length > 0
      ? selectedProducts
          .map((product) => {
            return [
              `${product.brand} ${product.name}`,
              `type: ${product.type}`,
              `step: ${product.step}`,
              `timing: ${product.time}`
            ].join(", ");
          })
          .join("\n")
      : "The user has not currently selected any products.";

  const contextMessage = `
Current selected-product context:
${selectedContext}

Current generated routine:
${currentRoutine || "No routine has been generated yet."}

User's question:
${query}
`.trim();

  conversationHistory.push({
    role: "user",
    content: contextMessage
  });

  userInput.value = "";
  autoResizeInput();
  updateCharacterCount();

  const typingMessage =
    appendTypingIndicator();

  try {
    const responseText =
      await requestAIResponse(conversationHistory);

    typingMessage.remove();

    appendMessage(
      "assistant",
      responseText
    );

    conversationHistory.push({
      role: "assistant",
      content: responseText
    });
  } catch (error) {
    console.error("Chat error:", error);

    typingMessage.remove();

    appendMessage(
      "assistant",
      error.message ||
      "I’m sorry, but the beauty advisor could not respond.",
      true
    );
  } finally {
    setChatBusy(false);
    userInput.focus();
  }
}


/* =========================================
   CLOUDFLARE REQUEST
   ========================================= */

async function requestAIResponse(messages) {
  const response =
    await fetch(WORKER_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        messages
      })
    });

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error(
      "The Worker returned a response that could not be read."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      `The Cloudflare Worker returned status ${response.status}.`
    );
  }

  const responseText =
    data?.choices?.[0]?.message?.content ||
    data?.message ||
    data?.response;

  if (!responseText) {
    throw new Error(
      "No AI response was returned."
    );
  }

  return responseText.trim();
}


/* =========================================
   CHAT DISPLAY
   ========================================= */

function appendMessage(
  role,
  text,
  isError = false
) {
  const row =
    document.createElement("article");

  const avatar =
    document.createElement("div");

  const messageContent =
    document.createElement("div");

  const label =
    document.createElement("p");

  const bubble =
    document.createElement("div");

  const paragraph =
    document.createElement("p");

  const isUser =
    role === "user";

  row.className =
    `message-row ${isUser ? "user-row" : "assistant-row"}`;

  avatar.className =
    `avatar ${isUser ? "user-avatar" : "assistant-avatar"}`;

  avatar.textContent =
    isUser ? "Y" : "L";

  avatar.setAttribute(
    "aria-hidden",
    "true"
  );

  messageContent.className =
    "message-content";

  label.className =
    "message-label";

  label.textContent =
    isUser ? "You" : "Beauty Advisor";

  bubble.className =
    `message-bubble ${
      isUser
        ? "user-bubble"
        : "assistant-bubble"
    }`;

  if (isError) {
    bubble.classList.add(
      "error-bubble"
    );
  }

  paragraph.textContent = text;

  bubble.appendChild(paragraph);

  messageContent.appendChild(label);
  messageContent.appendChild(bubble);

  row.appendChild(avatar);
  row.appendChild(messageContent);

  chatMessages.appendChild(row);

  scrollToLatestMessage();

  return row;
}


function appendTypingIndicator() {
  const row =
    document.createElement("article");

  const avatar =
    document.createElement("div");

  const messageContent =
    document.createElement("div");

  const label =
    document.createElement("p");

  const bubble =
    document.createElement("div");

  row.className =
    "message-row assistant-row";

  avatar.className =
    "avatar assistant-avatar";

  avatar.textContent = "L";

  avatar.setAttribute(
    "aria-hidden",
    "true"
  );

  messageContent.className =
    "message-content";

  label.className =
    "message-label";

  label.textContent =
    "Beauty Advisor is thinking";

  bubble.className =
    "message-bubble assistant-bubble typing-bubble";

  for (
    let index = 0;
    index < 3;
    index += 1
  ) {
    const dot =
      document.createElement("span");

    dot.className =
      "typing-dot";

    dot.setAttribute(
      "aria-hidden",
      "true"
    );

    bubble.appendChild(dot);
  }

  messageContent.appendChild(label);
  messageContent.appendChild(bubble);

  row.appendChild(avatar);
  row.appendChild(messageContent);

  chatMessages.appendChild(row);

  scrollToLatestMessage();

  return row;
}


/* =========================================
   CHAT RESET
   ========================================= */

function resetConversation() {
  conversationHistory = [
    {
      role: "system",
      content: SYSTEM_PROMPT
    },

    welcomeMessage
  ];

  chatMessages.innerHTML = "";

  appendMessage(
    "assistant",
    welcomeMessage.content
  );

  userInput.value = "";

  autoResizeInput();
  updateCharacterCount();
  userInput.focus();
}


/* =========================================
   INTERFACE HELPERS
   ========================================= */

function setChatBusy(isBusy) {
  sendButton.disabled = isBusy;
  userInput.disabled = isBusy;

  sendButton
    .querySelector("span:first-child")
    .textContent =
      isBusy ? "Thinking" : "Send";
}


function updateCharacterCount() {
  characterCount.textContent =
    `${userInput.value.length} / ${userInput.maxLength}`;
}


function autoResizeInput() {
  userInput.style.height = "auto";

  const height =
    Math.min(
      userInput.scrollHeight,
      150
    );

  userInput.style.height =
    `${height}px`;
}


function scrollToLatestMessage() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop =
      chatMessages.scrollHeight;
  });
}


function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================
   EVENTS
   ========================================= */

productSearch.addEventListener(
  "input",
  renderProducts
);

categoryFilter.addEventListener(
  "change",
  renderProducts
);

clearFiltersButton.addEventListener(
  "click",
  () => {
    productSearch.value = "";
    categoryFilter.value = "all";

    renderProducts();
    productSearch.focus();
  }
);

generateRoutineButton.addEventListener(
  "click",
  generateRoutine
);

clearSelectionButton.addEventListener(
  "click",
  clearSelections
);

chatForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const query =
      userInput.value.trim();

    if (!query) {
      return;
    }

    await processUserMessage(query);
  }
);

promptButtons.forEach((button) => {
  button.addEventListener(
    "click",
    async () => {
      const prompt =
        button.dataset.prompt;

      if (!prompt) {
        return;
      }

      userInput.value = prompt;

      updateCharacterCount();
      autoResizeInput();

      await processUserMessage(prompt);
    }
  );
});

userInput.addEventListener(
  "input",
  () => {
    updateCharacterCount();
    autoResizeInput();
  }
);

userInput.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      chatForm.requestSubmit();
    }
  }
);

clearChatButton.addEventListener(
  "click",
  resetConversation
);


/* =========================================
   INITIALIZE
   ========================================= */

renderProducts();
renderSelectedProducts();
updateSelectionControls();
updateCharacterCount();
autoResizeInput();