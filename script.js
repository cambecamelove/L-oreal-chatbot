"use strict";

/* =========================================
   OPTIONAL CLOUDFLARE CONNECTION
   ========================================= */

/*
  Leave this as an empty string while using the local chatbot.

  Later, when you receive API access and create a Cloudflare Worker,
  paste the Worker URL between the quotation marks.

  Example:
  const WORKER_URL = "https://loreal-advisor.your-name.workers.dev";
*/

const WORKER_URL = "";


/* =========================================
   SYSTEM PROMPT
   ========================================= */

/*
  This system prompt is ready to be sent to OpenAI through a
  Cloudflare Worker when API access becomes available.
*/

const SYSTEM_PROMPT = `
You are the L'Oréal Paris Smart Beauty Advisor.

Your purpose is to help users understand L'Oréal Paris products,
beauty categories, and routines involving skincare, haircare, and makeup.

Follow these rules throughout the conversation:

1. Only answer questions related to L'Oréal Paris products, skincare,
   haircare, makeup, cosmetics, beauty routines, application order,
   ingredients, shade selection, and general beauty education.

2. When a user asks an unrelated question, politely refuse and redirect
   them toward a L'Oréal Paris beauty topic.

3. Ask helpful follow-up questions when more information is needed,
   including skin type, hair type, desired finish, beauty concern,
   undertone, sensitivity, and routine preferences.

4. Never diagnose medical conditions or claim that a cosmetic product
   will cure a health condition. Encourage users to speak with a
   qualified healthcare professional for medical concerns.

5. Keep responses welcoming, elegant, clear, encouraging, and concise.

6. When recommending a routine, list products in the correct order of use.

7. Mention that product availability can vary by location.

8. Remember relevant details from earlier messages and use them to make
   later responses more personalized.

9. Do not pretend to know information the user has not shared.

10. End useful recommendations with one relevant follow-up question.
`.trim();


/* =========================================
   DOM REFERENCES
   ========================================= */

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");
const characterCount = document.getElementById("characterCount");
const clearChatButton = document.getElementById("clearChatButton");
const sendButton = chatForm.querySelector(".send-button");

const promptButtons = document.querySelectorAll("[data-prompt]");
const categoryButtons = document.querySelectorAll(".category-button");


/* =========================================
   CONVERSATION HISTORY
   ========================================= */

const welcomeMessage = {
  role: "assistant",
  content:
    "Welcome to your L'Oréal Paris beauty consultation. " +
    "Tell me about your skin, hair, makeup goals, or the routine " +
    "you would like to create."
};

let conversationHistory = [
  {
    role: "system",
    content: SYSTEM_PROMPT
  },
  welcomeMessage
];


/* =========================================
   USER PROFILE MEMORY
   ========================================= */

const userProfile = {
  name: "",
  skinType: "",
  hairType: "",
  undertone: "",
  concerns: [],
  category: ""
};


/* =========================================
   PRODUCT KNOWLEDGE
   ========================================= */

const productKnowledge = {
  hydration: {
    title: "RevitaLift 1.5% Pure Hyaluronic Acid Serum",
    summary:
      "A hydration-focused serum that can be applied after cleansing " +
      "and before moisturizer.",
    routine:
      "Cleanser → hydrating serum → moisturizer → sunscreen in the morning."
  },

  glycolic: {
    title: "RevitaLift 10% Pure Glycolic Acid Serum",
    summary:
      "An evening exfoliating serum intended to support smoother-looking, " +
      "more radiant skin.",
    routine:
      "Evening: cleanser → glycolic serum → moisturizer. Introduce gradually " +
      "and use daytime sunscreen."
  },

  damagedHair: {
    title: "Elvive Total Repair 5",
    summary:
      "A repair-focused haircare collection created for visible signs of " +
      "damaged, weak, brittle, tangled, or split-end-prone hair.",
    routine:
      "Shampoo → conditioner → optional repair treatment → gentle styling."
  },

  foundation: {
    title: "True Match Super-Blendable Foundation",
    summary:
      "A buildable complexion option designed around shade depth and cool, " +
      "neutral, or warm undertones.",
    routine:
      "Prep skin → apply thin foundation layers → blend outward → add " +
      "concealer only where needed."
  },

  longWear: {
    title: "Infallible Makeup Collection",
    summary:
      "A makeup collection focused on long-wearing complexion, lip, eye, " +
      "brow, and setting products.",
    routine:
      "Prep → complexion → eyes and brows → lips → setting product."
  }
};


/* =========================================
   KEYWORD GROUPS
   ========================================= */

const beautyKeywords = [
  "loreal",
  "l'oréal",
  "l’oreal",
  "l’oréal",
  "beauty",
  "skin",
  "skincare",
  "face",
  "serum",
  "cleanser",
  "moisturizer",
  "sunscreen",
  "spf",
  "wrinkle",
  "acne",
  "dry",
  "oily",
  "sensitive",
  "combination",
  "hydration",
  "hydrate",
  "dark spot",
  "texture",
  "glow",
  "radiance",
  "glycolic",
  "hyaluronic",
  "hair",
  "haircare",
  "shampoo",
  "conditioner",
  "damaged",
  "frizz",
  "curly",
  "straight",
  "wavy",
  "coily",
  "color treated",
  "makeup",
  "foundation",
  "concealer",
  "mascara",
  "lipstick",
  "eyeliner",
  "eyebrow",
  "brow",
  "shade",
  "undertone",
  "true match",
  "infallible",
  "revitalift",
  "elvive",
  "routine",
  "product",
  "cosmetic"
];

const greetingKeywords = [
  "hello",
  "hi",
  "hey",
  "good morning",
  "good afternoon",
  "good evening"
];

const medicalKeywords = [
  "diagnose",
  "disease",
  "infection",
  "eczema",
  "psoriasis",
  "allergic reaction",
  "burning",
  "swelling",
  "severe rash",
  "medicine",
  "prescription"
];


/* =========================================
   EVENT LISTENERS
   ========================================= */

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = userInput.value.trim();

  if (!query) {
    return;
  }

  await processUserMessage(query);
});


promptButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const prompt = button.dataset.prompt;

    if (!prompt) {
      return;
    }

    userInput.value = prompt;
    updateCharacterCount();

    await processUserMessage(prompt);
  });
});


categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    categoryButtons.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");
  });
});


userInput.addEventListener("input", () => {
  autoResizeInput();
  updateCharacterCount();
});


userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});


clearChatButton.addEventListener("click", () => {
  resetConversation();
});


/* =========================================
   MAIN MESSAGE PROCESS
   ========================================= */

async function processUserMessage(query) {
  setInterfaceBusy(true);

  appendMessage("user", query);

  conversationHistory.push({
    role: "user",
    content: query
  });

  collectUserDetails(query);

  userInput.value = "";
  autoResizeInput();
  updateCharacterCount();

  const typingMessage = appendTypingIndicator();

  try {
    let responseText;

    if (WORKER_URL.trim()) {
      responseText = await requestAIResponse();
    } else {
      responseText = await createLocalResponse(query);
    }

    typingMessage.remove();

    appendMessage("assistant", responseText);

    conversationHistory.push({
      role: "assistant",
      content: responseText
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    typingMessage.remove();

    const errorMessage =
      "I’m sorry, but I had trouble preparing your beauty recommendation. " +
      "Please try again in a moment.";

    appendMessage("assistant", errorMessage, true);
  } finally {
    setInterfaceBusy(false);
    userInput.focus();
  }
}


/* =========================================
   CLOUDFLARE / OPENAI REQUEST
   ========================================= */

async function requestAIResponse() {
  const response = await fetch(WORKER_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      messages: conversationHistory,
      temperature: 0.5,
      max_completion_tokens: 650,
      frequency_penalty: 0.25
    })
  });

  if (!response.ok) {
    throw new Error(
      `The Cloudflare Worker returned status ${response.status}.`
    );
  }

  const data = await response.json();

  const responseText =
    data?.choices?.[0]?.message?.content ||
    data?.message ||
    data?.response;

  if (!responseText) {
    throw new Error("No assistant response was returned.");
  }

  return responseText.trim();
}


/* =========================================
   LOCAL CHATBOT ENGINE
   ========================================= */

async function createLocalResponse(query) {
  /*
    Adds a brief delay so the thinking state is visible and
    the chatbot interaction feels natural.
  */

  await delay(750);

  const normalizedQuery = normalizeText(query);

  if (containsAny(normalizedQuery, medicalKeywords)) {
    return createMedicalSafetyResponse();
  }

  if (isGreeting(normalizedQuery)) {
    return createGreetingResponse();
  }

  if (asksAboutMemory(normalizedQuery)) {
    return createMemoryResponse();
  }

  if (!isBeautyRelated(normalizedQuery)) {
    return createOffTopicResponse();
  }

  if (containsAny(normalizedQuery, ["dry skin", "dehydrated", "hydration"])) {
    userProfile.skinType = "dry or dehydrated";
    userProfile.category = "skincare";

    return createDrySkinResponse();
  }

  if (containsAny(normalizedQuery, ["oily skin", "greasy skin", "oil control"])) {
    userProfile.skinType = "oily";
    userProfile.category = "skincare";

    return createOilySkinResponse();
  }

  if (
    containsAny(normalizedQuery, [
      "sensitive skin",
      "sensitivity",
      "easily irritated"
    ])
  ) {
    userProfile.skinType = "sensitive";
    userProfile.category = "skincare";

    return createSensitiveSkinResponse();
  }

  if (
    containsAny(normalizedQuery, [
      "dark spot",
      "uneven tone",
      "texture",
      "glycolic",
      "radiance"
    ])
  ) {
    userProfile.category = "skincare";

    return createTextureResponse();
  }

  if (
    containsAny(normalizedQuery, [
      "damaged hair",
      "breakage",
      "split ends",
      "brittle",
      "fried hair",
      "hair repair"
    ])
  ) {
    userProfile.category = "haircare";

    return createDamagedHairResponse();
  }

  if (
    containsAny(normalizedQuery, [
      "dry hair",
      "frizzy",
      "frizz",
      "moisture",
      "hair hydration"
    ])
  ) {
    userProfile.category = "haircare";

    return createDryHairResponse();
  }

  if (
    containsAny(normalizedQuery, [
      "foundation",
      "true match",
      "undertone",
      "shade match",
      "complexion"
    ])
  ) {
    userProfile.category = "makeup";

    return createFoundationResponse(normalizedQuery);
  }

  if (
    containsAny(normalizedQuery, [
      "long wear",
      "long-lasting makeup",
      "infallible",
      "setting spray"
    ])
  ) {
    userProfile.category = "makeup";

    return createLongWearResponse();
  }

  if (
    containsAny(normalizedQuery, [
      "routine order",
      "order of products",
      "what order",
      "skincare routine",
      "build a routine"
    ])
  ) {
    userProfile.category = "skincare";

    return createRoutineOrderResponse();
  }

  if (
    containsAny(normalizedQuery, [
      "serum",
      "treatment",
      "difference"
    ])
  ) {
    return createSerumExplanation();
  }

  if (userProfile.category === "skincare") {
    return createGeneralSkincareResponse();
  }

  if (userProfile.category === "haircare") {
    return createGeneralHaircareResponse();
  }

  if (userProfile.category === "makeup") {
    return createGeneralMakeupResponse();
  }

  return createGeneralBeautyResponse();
}


/* =========================================
   RESPONSE BUILDERS
   ========================================= */

function createGreetingResponse() {
  const nameText = userProfile.name
    ? `, ${userProfile.name}`
    : "";

  return (
    `Hello${nameText}! I’m your L'Oréal Paris Smart Beauty Advisor.\n\n` +
    "I can help with:\n" +
    "• Skincare routines and product order\n" +
    "• Haircare for dryness, damage, or frizz\n" +
    "• Foundation shades and undertones\n" +
    "• Long-wearing makeup suggestions\n\n" +
    "Which beauty category would you like to explore?"
  );
}


function createMedicalSafetyResponse() {
  return (
    "That sounds like it may require medical guidance rather than a cosmetic " +
    "recommendation. I’m unable to diagnose skin or scalp conditions.\n\n" +
    "Please pause any product that is causing a severe reaction and speak " +
    "with a qualified healthcare professional or dermatologist. Once you " +
    "have professional guidance, I can help you organize a gentle L'Oréal " +
    "beauty routine around it."
  );
}


function createOffTopicResponse() {
  return (
    "I’m designed specifically for L'Oréal Paris products, beauty routines, " +
    "skincare, haircare, and makeup, so I’m unable to help with that topic.\n\n" +
    "You could ask me something like:\n" +
    "• “Help me build a routine for dry skin.”\n" +
    "• “What should I use for damaged hair?”\n" +
    "• “How do I identify my foundation undertone?”"
  );
}


function createDrySkinResponse() {
  const product = productKnowledge.hydration;

  return (
    "For dry or dehydrated skin, focus on gentle cleansing, hydration, and " +
    "moisture retention.\n\n" +
    "Suggested routine:\n" +
    "1. Use a gentle cleanser.\n" +
    `2. Apply ${product.title} to slightly damp skin.\n` +
    "3. Follow with a moisturizer.\n" +
    "4. Finish with broad-spectrum sunscreen during the day.\n\n" +
    `${product.summary}\n\n` +
    "Introduce one new product at a time and patch-test first. Does your skin " +
    "feel dry all day, or mainly after cleansing?"
  );
}


function createOilySkinResponse() {
  return (
    "Oily skin still benefits from hydration. The goal is balance, not " +
    "removing every trace of oil.\n\n" +
    "Suggested routine:\n" +
    "1. Cleanse gently without over-scrubbing.\n" +
    "2. Apply a lightweight hydrating serum.\n" +
    "3. Use a lightweight moisturizer.\n" +
    "4. Finish with sunscreen in the morning.\n\n" +
    "Avoid introducing several strong exfoliating products at once. Are you " +
    "mainly concerned about shine, clogged pores, or makeup longevity?"
  );
}


function createSensitiveSkinResponse() {
  return (
    "For sensitive skin, keep the routine simple and introduce products " +
    "gradually.\n\n" +
    "A basic approach:\n" +
    "1. Gentle cleanser\n" +
    "2. Simple hydrating serum or moisturizer\n" +
    "3. Broad-spectrum sunscreen in the morning\n\n" +
    "Patch-test each new product and stop using anything that causes continued " +
    "burning, swelling, or a severe reaction. Do you know whether fragrance, " +
    "exfoliating acids, or another ingredient usually bothers your skin?"
  );
}


function createTextureResponse() {
  const product = productKnowledge.glycolic;

  return (
    `For uneven-looking texture or radiance, ${product.title} is an example ` +
    "of a more targeted evening treatment.\n\n" +
    `${product.routine}\n\n` +
    "Because exfoliating acids can be strong, introduce them gradually, avoid " +
    "stacking multiple exfoliants on the same night, and patch-test first. " +
    "Would you describe your skin as dry, oily, combination, or sensitive?"
  );
}


function createDamagedHairResponse() {
  const product = productKnowledge.damagedHair;

  return (
    `For visible damage and breakage, consider a repair-focused routine such ` +
    `as the ${product.title} collection.\n\n` +
    "Suggested order:\n" +
    "1. Repairing shampoo focused on the scalp and roots\n" +
    "2. Conditioner through the mid-lengths and ends\n" +
    "3. Optional repair treatment as directed\n" +
    "4. Heat protectant before hot tools\n\n" +
    "Reduce excessive heat and rough towel drying where possible. Is your " +
    "damage mainly from heat styling, chemical processing, or dryness?"
  );
}


function createDryHairResponse() {
  return (
    "For dry or frizz-prone hair, build the routine around moisture and gentle " +
    "handling.\n\n" +
    "Try this approach:\n" +
    "1. Shampoo primarily at the scalp.\n" +
    "2. Condition the mid-lengths and ends.\n" +
    "3. Detangle gently while the hair has slip.\n" +
    "4. Apply a lightweight leave-in or smoothing product.\n" +
    "5. Limit high heat and use heat protection.\n\n" +
    "Is your hair straight, wavy, curly, or coily?"
  );
}


function createFoundationResponse(query) {
  const product = productKnowledge.foundation;

  let undertoneGuidance =
    "To estimate your undertone, consider whether your skin generally appears " +
    "cool, neutral, or warm rather than relying only on wrist veins.";

  if (query.includes("cool")) {
    userProfile.undertone = "cool";

    undertoneGuidance =
      "Since you mentioned a cool undertone, begin with shades labeled cool " +
      "near your skin-depth range.";
  }

  if (query.includes("warm")) {
    userProfile.undertone = "warm";

    undertoneGuidance =
      "Since you mentioned a warm undertone, begin with shades labeled warm " +
      "near your skin-depth range.";
  }

  if (query.includes("neutral")) {
    userProfile.undertone = "neutral";

    undertoneGuidance =
      "Since you mentioned a neutral undertone, begin with shades labeled " +
      "neutral near your skin-depth range.";
  }

  return (
    `${product.title} is designed around shade depth and undertones with ` +
    "buildable coverage.\n\n" +
    `${undertoneGuidance}\n\n` +
    "Shade-matching tips:\n" +
    "1. Test along the jawline rather than the hand.\n" +
    "2. Compare a few neighboring shades.\n" +
    "3. Check the match in natural light.\n" +
    "4. Allow the product to settle before deciding.\n\n" +
    "Do you prefer light, medium, or fuller-looking coverage?"
  );
}


function createLongWearResponse() {
  const product = productKnowledge.longWear;

  return (
    `For a longer-wearing makeup routine, the ${product.title} includes ` +
    "products designed around extended wear.\n\n" +
    "Application order:\n" +
    "1. Prep and lightly moisturize the skin.\n" +
    "2. Apply complexion products in thin layers.\n" +
    "3. Add eye, brow, and lip products.\n" +
    "4. Finish with a compatible setting product.\n\n" +
    "Thin layers usually wear more evenly than one heavy layer. Are you " +
    "creating an everyday look, an event look, or makeup for hot weather?"
  );
}


function createRoutineOrderResponse() {
  return (
    "A simple skincare order is:\n\n" +
    "Morning:\n" +
    "1. Cleanser\n" +
    "2. Lightweight serum\n" +
    "3. Moisturizer\n" +
    "4. Broad-spectrum sunscreen\n\n" +
    "Evening:\n" +
    "1. Makeup removal, when needed\n" +
    "2. Cleanser\n" +
    "3. Targeted serum or treatment\n" +
    "4. Moisturizer\n\n" +
    "Apply products from lighter textures to richer textures unless the " +
    "product directions say otherwise. What is the main concern you want " +
    "your routine to address?"
  );
}


function createSerumExplanation() {
  return (
    "A serum is usually a lightweight product used to deliver targeted " +
    "ingredients after cleansing and before moisturizer.\n\n" +
    "“Treatment” is a broader category. A treatment may be a serum, cream, " +
    "mask, or spot product created for a particular concern.\n\n" +
    "A simple order is:\n" +
    "Cleanser → serum or treatment → moisturizer → sunscreen in the morning.\n\n" +
    "Which concern are you hoping to target: hydration, texture, radiance, " +
    "or something else?"
  );
}


function createGeneralSkincareResponse() {
  return (
    "I can help refine your L'Oréal skincare routine, but I need a little more " +
    "information first.\n\n" +
    "Please tell me:\n" +
    "• Your skin type\n" +
    "• Your main concern\n" +
    "• Whether your skin is sensitive\n" +
    "• Whether you want a morning, evening, or complete routine"
  );
}


function createGeneralHaircareResponse() {
  return (
    "I can help narrow down a L'Oréal haircare routine.\n\n" +
    "Please tell me:\n" +
    "• Whether your hair is straight, wavy, curly, or coily\n" +
    "• Whether it is fine, medium, or thick\n" +
    "• Your main concern, such as dryness, damage, frizz, or color care\n" +
    "• How often you use heat"
  );
}


function createGeneralMakeupResponse() {
  return (
    "I can help with L'Oréal complexion, eye, lip, brow, and long-wear makeup.\n\n" +
    "Tell me what you are shopping for, your desired finish, and whether you " +
    "prefer a natural, soft-glam, or full-glam result."
  );
}


function createGeneralBeautyResponse() {
  return (
    "I’d be happy to personalize a L'Oréal Paris recommendation.\n\n" +
    "Which area would you like help with?\n" +
    "• Skincare\n" +
    "• Haircare\n" +
    "• Makeup\n\n" +
    "You can also tell me your main concern and the result you want."
  );
}


function createMemoryResponse() {
  const knownDetails = [];

  if (userProfile.name) {
    knownDetails.push(`your name is ${userProfile.name}`);
  }

  if (userProfile.skinType) {
    knownDetails.push(`your skin is ${userProfile.skinType}`);
  }

  if (userProfile.hairType) {
    knownDetails.push(`your hair is ${userProfile.hairType}`);
  }

  if (userProfile.undertone) {
    knownDetails.push(`your undertone is ${userProfile.undertone}`);
  }

  if (userProfile.category) {
    knownDetails.push(`we have been discussing ${userProfile.category}`);
  }

  if (knownDetails.length === 0) {
    return (
      "I remember the messages in this conversation, but you have not shared " +
      "many personal beauty details yet. Tell me your skin type, hair type, " +
      "undertone, or main concern, and I’ll use that information in later " +
      "recommendations."
    );
  }

  return (
    `Yes. Based on our conversation, I remember that ` +
    `${formatReadableList(knownDetails)}.\n\n` +
    "I’ll continue using those details to personalize your recommendations."
  );
}


/* =========================================
   USER DETAIL COLLECTION
   ========================================= */

function collectUserDetails(query) {
  const normalizedQuery = normalizeText(query);

  const nameMatch = query.match(
    /\b(?:my name is|i am|i'm)\s+([a-zA-Z'-]{2,20})\b/i
  );

  if (nameMatch && !isCommonNonName(nameMatch[1])) {
    userProfile.name = capitalizeWord(nameMatch[1]);
  }

  if (normalizedQuery.includes("dry skin")) {
    userProfile.skinType = "dry";
  }

  if (normalizedQuery.includes("oily skin")) {
    userProfile.skinType = "oily";
  }

  if (normalizedQuery.includes("combination skin")) {
    userProfile.skinType = "combination";
  }

  if (normalizedQuery.includes("sensitive skin")) {
    userProfile.skinType = "sensitive";
  }

  if (normalizedQuery.includes("curly hair")) {
    userProfile.hairType = "curly";
  }

  if (normalizedQuery.includes("coily hair")) {
    userProfile.hairType = "coily";
  }

  if (normalizedQuery.includes("wavy hair")) {
    userProfile.hairType = "wavy";
  }

  if (normalizedQuery.includes("straight hair")) {
    userProfile.hairType = "straight";
  }
}


/* =========================================
   CHAT DISPLAY
   ========================================= */

function appendMessage(role, text, isError = false) {
  const row = document.createElement("article");
  const avatar = document.createElement("div");
  const messageContent = document.createElement("div");
  const label = document.createElement("p");
  const bubble = document.createElement("div");
  const paragraph = document.createElement("p");

  const isUser = role === "user";

  row.className =
    `message-row ${isUser ? "user-row" : "assistant-row"}`;

  avatar.className =
    `avatar ${isUser ? "user-avatar" : "assistant-avatar"}`;

  avatar.textContent = isUser
    ? getUserInitial()
    : "L";

  avatar.setAttribute("aria-hidden", "true");

  messageContent.className = "message-content";
  label.className = "message-label";

  label.textContent = isUser
    ? "You"
    : "Beauty Advisor";

  bubble.className =
    `message-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`;

  if (isError) {
    bubble.classList.add("error-bubble");
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
  const row = document.createElement("article");
  const avatar = document.createElement("div");
  const messageContent = document.createElement("div");
  const label = document.createElement("p");
  const bubble = document.createElement("div");

  row.className = "message-row assistant-row";
  row.dataset.typing = "true";

  avatar.className = "avatar assistant-avatar";
  avatar.textContent = "L";
  avatar.setAttribute("aria-hidden", "true");

  messageContent.className = "message-content";

  label.className = "message-label";
  label.textContent = "Beauty Advisor is thinking";

  bubble.className =
    "message-bubble assistant-bubble typing-bubble";

  for (let index = 0; index < 3; index += 1) {
    const dot = document.createElement("span");

    dot.className = "typing-dot";
    dot.setAttribute("aria-hidden", "true");

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
   CONVERSATION RESET
   ========================================= */

function resetConversation() {
  conversationHistory = [
    {
      role: "system",
      content: SYSTEM_PROMPT
    },
    welcomeMessage
  ];

  userProfile.name = "";
  userProfile.skinType = "";
  userProfile.hairType = "";
  userProfile.undertone = "";
  userProfile.concerns = [];
  userProfile.category = "";

  chatMessages.innerHTML = "";

  appendMessage("assistant", welcomeMessage.content);

  userInput.value = "";
  autoResizeInput();
  updateCharacterCount();
  userInput.focus();
}


/* =========================================
   INTERFACE HELPERS
   ========================================= */

function setInterfaceBusy(isBusy) {
  sendButton.disabled = isBusy;
  userInput.disabled = isBusy;

  sendButton.querySelector("span:first-child").textContent = isBusy
    ? "Thinking"
    : "Send";
}


function updateCharacterCount() {
  characterCount.textContent =
    `${userInput.value.length} / ${userInput.maxLength}`;
}


function autoResizeInput() {
  userInput.style.height = "auto";

  const newHeight = Math.min(userInput.scrollHeight, 150);

  userInput.style.height = `${newHeight}px`;
}


function scrollToLatestMessage() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}


/* =========================================
   TEXT AND INTENT HELPERS
   ========================================= */

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s'’%-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function containsAny(text, keywords) {
  return keywords.some((keyword) => {
    return text.includes(keyword);
  });
}


function isGreeting(text) {
  const wordCount = text.split(" ").length;

  return (
    wordCount <= 8 &&
    containsAny(text, greetingKeywords)
  );
}


function isBeautyRelated(text) {
  return containsAny(text, beautyKeywords);
}


function asksAboutMemory(text) {
  return containsAny(text, [
    "remember my",
    "do you remember",
    "what did i tell you",
    "what do you know about me",
    "what is my name"
  ]);
}


function getUserInitial() {
  if (userProfile.name) {
    return userProfile.name.charAt(0).toUpperCase();
  }

  return "Y";
}


function capitalizeWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}


function isCommonNonName(word) {
  const normalizedWord = word.toLowerCase();

  const blockedWords = [
    "looking",
    "trying",
    "using",
    "asking",
    "interested",
    "dry",
    "oily",
    "sensitive",
    "curious",
    "worried",
    "planning"
  ];

  return blockedWords.includes(normalizedWord);
}


function formatReadableList(items) {
  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return (
    items.slice(0, -1).join(", ") +
    `, and ${items[items.length - 1]}`
  );
}


function delay(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}


/* =========================================
   INITIALIZATION
   ========================================= */

updateCharacterCount();
autoResizeInput();