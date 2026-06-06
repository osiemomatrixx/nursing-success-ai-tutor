// Mentor.js - Client-Side Dedicated AI Preceptor Chat Logic

let chatHistory = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check if there was an initial message from the dashboard or core
    const input = document.getElementById('chat-input');
    if (input) {
        input.focus();
    }
    bindButtonRipples();
    applyStaggeredReveal('chat');
});

function handleChatKeyDown(event) {
    if (event.key === 'Enter') {
        sendUserChatMessage();
    }
}

function sendSuggestedMessage(msgText) {
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = msgText;
        sendUserChatMessage();
    }
}

async function sendUserChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const msgText = input.value.trim();
    if (!msgText) return;
    
    input.value = '';
    appendChatMessage('user', 'Student Nurse', msgText);
    
    chatHistory.push({ role: 'user', content: msgText });
    const typingId = appendChatTypingBubble();
    
    const apiKey = localStorage.getItem('nursing_openai_key') || null;
    const mcpBridgeUrl = localStorage.getItem('nursing_mcp_bridge_url') || null;
    
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msgText,
                history: chatHistory,
                mcp_bridge_url: mcpBridgeUrl,
                api_key: apiKey
            })
        });
        
        removeChatTypingBubble(typingId);
        
        if (!res.ok) throw new Error('Chat API response failed');
        const data = await res.json();
        
        appendChatMessage('preceptor', 'Preceptor Sarah, RN', data.response, data.source || 'openai');
        chatHistory.push({ role: 'assistant', content: data.response });
        
    } catch (err) {
        console.error(err);
        removeChatTypingBubble(typingId);
        appendChatMessage('preceptor', 'Preceptor Sarah, RN', `[Connection error: ${err.message}. Please verify your API key or backend connection status.]`, 'connection_error');
    }
}

function appendChatMessage(senderType, senderName, text, sourceLabel = null) {
    const chatBox = document.getElementById('chat-messages');
    if (!chatBox) return;
    
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${senderType === 'user' ? 'user' : 'preceptor'}`;
    
    const initials = localStorage.getItem('nursing_user_email') ? localStorage.getItem('nursing_user_email').slice(0,2).toUpperCase() : 'SN';
    const avatarImg = senderType === 'user' ? 
      `<div class="message-avatar">${initials}</div>` : 
      `<img src="/static/preceptor_avatar.png" class="message-avatar-img" alt="Preceptor Sarah">`;
      
    const formattedText = formatChatMessageText(text);
    
    bubble.innerHTML = `
        ${avatarImg}
        <div class="message-content-wrapper">
            <span class="message-sender">${senderName}</span>
            <div class="message-text">${formattedText}</div>
            ${sourceLabel ? `<span class="message-source">Source: ${sourceLabel === 'openai' ? 'OpenAI' : 'OpenAI unavailable'}</span>` : ''}
        </div>
    `;
    
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendChatTypingBubble() {
    const chatBox = document.getElementById('chat-messages');
    if (!chatBox) return null;
    
    const typingId = 'typing-' + Date.now();
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble preceptor typing-bubble';
    bubble.id = typingId;
    
    bubble.innerHTML = `
        <img src="/static/preceptor_avatar.png" class="message-avatar-img" alt="Preceptor Sarah">
        <div class="message-content-wrapper">
            <span class="message-sender">Preceptor Sarah, RN</span>
            <div class="message-text">
                <span class="typing-dot">.</span>
                <span class="typing-dot">.</span>
                <span class="typing-dot">.</span>
            </div>
        </div>
    `;
    
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingId;
}

function removeChatTypingBubble(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function formatChatMessageText(text) {
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
        
    return html;
}
