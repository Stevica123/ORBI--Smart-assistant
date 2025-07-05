document.addEventListener("DOMContentLoaded", () => {
  const newChatBtn = document.getElementById("newChatBtn");
  const chatList = document.getElementById("chatList");
  const chatTitle = document.getElementById("chatTitle");
  const chatMessagesContainer = document.getElementById("chatMessagesContainer");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  let chatData = {};  
  let activeChat = null;

 function renderMessages(chatId) {
  chatMessagesContainer.innerHTML = "";
  if (!chatData[chatId] || chatData[chatId].length === 0) {
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-message";
    typingDiv.textContent = "How can I help you?";
    chatMessagesContainer.appendChild(typingDiv);
    return;
  }

  chatData[chatId].forEach(({ q, a }) => {
   
    const qDiv = document.createElement("div");
    qDiv.textContent = q;
    qDiv.style.background = "#6599cb";
    qDiv.style.color = "#fff";
    qDiv.style.padding = "12px 20px";
    qDiv.style.borderRadius = "20px";
    qDiv.style.margin = "10px 0 4px 0";
    qDiv.style.maxWidth = "60%";
    qDiv.style.alignSelf = "flex-start";

   
    const answerWrapper = document.createElement("div");
    answerWrapper.style.display = "flex";
    answerWrapper.style.alignItems = "center";
    answerWrapper.style.justifyContent = "flex-end";
    answerWrapper.style.margin = "0 0 10px 0";
    answerWrapper.style.gap = "12px";

    
    const aDiv = document.createElement("div");
    aDiv.textContent = a;
    aDiv.style.background = "#d9d9d9";
    aDiv.style.color = "#000";
    aDiv.style.padding = "12px 20px";
    aDiv.style.borderRadius = "20px";
    aDiv.style.maxWidth = "60%";
    aDiv.classList.add("answer");

 
const splineDiv = document.createElement("div");
splineDiv.style.width = "170px";
splineDiv.style.height = "170px";
splineDiv.style.flexShrink = "0";
splineDiv.style.borderRadius = "50%";
splineDiv.style.overflow = "hidden";

const iframe = document.createElement("iframe");
iframe.src = "https://my.spline.design/genkubgreetingrobot-9rR23eYwUxI7onBNgF66fizS/";
iframe.width = "100%";
iframe.height = "100%";
iframe.setAttribute("frameborder", "0");
iframe.setAttribute("allowfullscreen", "");
iframe.setAttribute("allow", "autoplay; fullscreen");
iframe.style.border = "none";

splineDiv.appendChild(iframe);


answerWrapper.appendChild(aDiv);
answerWrapper.appendChild(splineDiv);


    chatMessagesContainer.appendChild(qDiv);
    chatMessagesContainer.appendChild(answerWrapper);
  });

  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}


  function renderChatList() {
    chatList.innerHTML = "";
    Object.keys(chatData).forEach((chatId) => {
      const chatItem = document.createElement("div");
      chatItem.classList.add("chat-item");
      chatItem.style.width = "349px";
      chatItem.style.height = "70px";
      chatItem.style.backgroundColor = activeChat === chatId ? "#4a7bc1" : "#6599cb";
      chatItem.style.borderRadius = "35px";
      chatItem.style.marginTop = "10px";
      chatItem.style.display = "flex";
      chatItem.style.alignItems = "center";
      chatItem.style.justifyContent = "space-between";
      chatItem.style.color = "#000";
      chatItem.style.fontWeight = "600";
      chatItem.style.fontFamily = "'Outfit', Helvetica, sans-serif";
      chatItem.style.fontSize = "24px";
      chatItem.style.cursor = "pointer";
      chatItem.style.userSelect = "none";

      const chatText = document.createElement("span");
      chatText.textContent = `Chat ${chatId}`;
      chatText.style.paddingLeft = "20px";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "×";
      deleteBtn.style.marginRight = "20px";
      deleteBtn.style.background = "transparent";
      deleteBtn.style.border = "none";
      deleteBtn.style.color = "#000";
      deleteBtn.style.fontSize = "28px";
      deleteBtn.style.cursor = "pointer";
      deleteBtn.style.fontWeight = "700";
      deleteBtn.style.userSelect = "none";
      deleteBtn.title = "Delete chat";

      chatItem.appendChild(chatText);
      chatItem.appendChild(deleteBtn);
      chatList.appendChild(chatItem);

      chatItem.addEventListener("click", () => {
        activateChat(chatId);
      });

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteChat(chatId);
      });
    });
  }

  
  function activateChat(chatId) {
    activeChat = chatId;
    chatTitle.textContent = `Chat ${chatId}`;
    chatInput.style.display = "inline-block";
    sendBtn.style.display = "inline-block";
    renderMessages(chatId);
    chatInput.focus();
    renderChatList();
  }

  
  async function loadChats() {
    try {
      const res = await fetch("/api/chats");
      if (!res.ok) throw new Error("Failed to load chats");
      const data = await res.json();
      chatData = data.chats || {};
      const chatIds = Object.keys(chatData);
      if (chatIds.length > 0) {
        activateChat(chatIds[0]);
      } else {
        activeChat = null;
        chatTitle.textContent = "";
        chatInput.style.display = "none";
        sendBtn.style.display = "none";
        chatMessagesContainer.innerHTML = "<div style='text-align:center; margin-top:30%; font-size: 24px;'>Select or create a chat</div>";
        renderChatList();
      }
    } catch (error) {
      console.error(error);
    }
  }


  async function createNewChat() {
    try {
      const res = await fetch("/api/chats", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create chat");
      const data = await res.json();
      chatData[data.chat_id] = [];
      activateChat(data.chat_id);
    } catch (error) {
      console.error(error);
    }
  }

  
  async function sendQuestion() {
    if (!activeChat) {
      alert("Please create or select a chat first.");
      return;
    }

    const question = chatInput.value.trim();
    if (!question) return;

    
    chatData[activeChat].push({ q: question, a: "Loading..." });
    renderMessages(activeChat);
    chatInput.value = "";
    chatInput.disabled = true;
    sendBtn.disabled = true;

    try {
      const res = await fetch(`/api/chats/${activeChat}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error("Failed to send question");
      const data = await res.json();

  
      chatData[activeChat][chatData[activeChat].length - 1].a = data.answer;
      renderMessages(activeChat);
    } catch (error) {
      console.error(error);
      chatData[activeChat][chatData[activeChat].length - 1].a = "Error fetching answer";
      renderMessages(activeChat);
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }


  async function deleteChat(chatId) {
  if (!confirm("Are you sure you want to delete this chat?")) return;

  try {
    const res = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete chat");

    delete chatData[chatId];

    if (activeChat === chatId) {
      const remainingChats = Object.keys(chatData);
      if (remainingChats.length > 0) {
        activateChat(remainingChats[0]);
      } else {
        activeChat = null;
        chatTitle.textContent = "";
        chatInput.style.display = "none";
        sendBtn.style.display = "none";

        const messageDiv = document.createElement("div");
        messageDiv.className = "typing-message";
        messageDiv.textContent = "Select or create a chat";
        chatMessagesContainer.innerHTML = "";
        chatMessagesContainer.appendChild(messageDiv);

        renderChatList();
      }
    } else {
      renderChatList();
    }
  } catch (error) {
    console.error(error);
  }
}

  
  newChatBtn.addEventListener("click", createNewChat);
  sendBtn.addEventListener("click", sendQuestion);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendQuestion();
    }
  });

 
  loadChats();
});
