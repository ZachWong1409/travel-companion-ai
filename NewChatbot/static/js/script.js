document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    // Set a reasonable timeout for model responses
    const RESPONSE_TIMEOUT = 30000; // 30 seconds

    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user' : 'assistant');
        
        const messagePara = document.createElement('p');
        messagePara.textContent = content;
        
        messageDiv.appendChild(messagePara);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
    }

    // Function to format itineraries with HTML
    function formatItinerary(text) {
        // Simple formatter that wraps days in divs and adds styling
        let formatted = '<div class="itinerary-container">';
        
        // Split by newlines and process
        const lines = text.split('\n');
        let inDay = false;
        
        for (const line of lines) {
            if (line.includes('Day') && line.match(/Day \d+/)) {
                // Close previous day div if we're starting a new one
                if (inDay) {
                    formatted += '</div>';
                }
                
                // Start a new day section
                formatted += `<div class="itinerary-day"><h3>${line}</h3><div class="itinerary-content">`;
                inDay = true;
            } else if (inDay) {
                // Format activity items
                if (line.includes(':')) {
                    const [time, activity] = line.split(':');
                    formatted += `<strong>${time}:</strong> ${activity}<br>`;
                } else if (line.toLowerCase().includes('budget') || line.toLowerCase().includes('cost')) {
                    formatted += `<div class="itinerary-budget">${line}</div>`;
                } else {
                    formatted += `${line}<br>`;
                }
            } else {
                // Intro text before any day begins
                formatted += `<div class="itinerary-intro">${line}</div>`;
            }
        }
        
        // Close any open day div
        if (inDay) {
            formatted += '</div>';
        }
        
        formatted += '</div>';
        return formatted;
    }

    // Function to send message to backend and get response
    async function sendMessage() {
        const message = userInput.value.trim();
        
        if (message === '') return;
        
        // Disable input while processing
        userInput.disabled = true;
        sendButton.disabled = true;
        
        // Add user message to chat
        addMessage(message, true);
        
        // Clear input field
        userInput.value = '';
        
        try {
            // Show loading indicator with more informative messages
            const loadingDiv = addMessage('Thinking...', false);
            
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Response timeout')), RESPONSE_TIMEOUT);
            });
            
            // Create fetch promise
            const fetchPromise = fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            // Race between fetch and timeout
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            // Update loading indicator with progress
            loadingDiv.querySelector('p').textContent = 'Processing response...';
            
            if (response.ok) {
                const data = await response.json();
                // Remove loading indicator
                chatMessages.removeChild(loadingDiv);
                
                // Add AI response
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('message', 'assistant');
                
                // Check if response looks like an itinerary
                if (data.response.includes("Day 1") || data.response.includes("itinerary")) {
                    // For itineraries, use HTML formatting
                    const formattedResponse = formatItinerary(data.response);
                    const messageContent = document.createElement('div');
                    messageContent.innerHTML = formattedResponse;
                    messageDiv.appendChild(messageContent);
                } else {
                    // For regular messages, use text
                    const messagePara = document.createElement('p');
                    messagePara.textContent = data.response;
                    messageDiv.appendChild(messagePara);
                }
                
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                // Remove loading indicator
                chatMessages.removeChild(loadingDiv);
                
                // Add error message
                addMessage(`Sorry, I encountered an error: ${response.status} ${response.statusText}. Please try again with a simpler question.`);
            }
        } catch (error) {
            console.error('Error:', error);
            
            // Find and remove any existing loading indicators
            const loadingDivs = document.querySelectorAll('.message.assistant');
            const lastLoadingDiv = loadingDivs[loadingDivs.length - 1];
            if (lastLoadingDiv && lastLoadingDiv.textContent.includes('Thinking')) {
                chatMessages.removeChild(lastLoadingDiv);
            }
            
            // Add specific error messages based on the error type
            if (error.message === 'Response timeout') {
                addMessage('Sorry, the model is taking too long to respond. This might be due to high computational load. Please try a simpler question or try again later.');
            } else {
                addMessage(`Sorry, I encountered an error: ${error.message}. Please try again.`);
            }
        } finally {
            // Re-enable input controls
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Focus input field on page load
    userInput.focus();
});