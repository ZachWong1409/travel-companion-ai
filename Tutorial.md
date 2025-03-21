#AI Travel Companion Chatbot Tutorial
This is Step By step Guide on how i created this Travel Chatbot. This tutorial will guide you through creating a travel companion chatbot using Python, Flask, and OpenRouter API for AI responses.

The model used for this chatbot is using DeepSeek: R1 Distill Qwen 32B which is free at the moment on OpenRouter.ai, however you may explore and play around with all the available models on the website.

This parts talks about what is DeepSeek: R1 Distill Qwen 32B abit, so if u want to skip to step 1, go ahead. DeepSeek: R1 Distill Qwen 32B is a language model that created through a process called "distillation", meaning that a smaller model (Qwen 2.5 32B) is trained to mimic the behavior of Deepseek R1 which is a more larger and powerful model. https://www.ibm.com/think/topics/knowledge-distillation#:~:text=Knowledge%20distillation%20is%20a%20machine,for%20massive%20deep%20neural%20networks. is a good place to understand how distillation works as IBM goes in-detail on how distillation works.

Ok now the fun part, this is where we start setting up the project.

# Step 1: Set Up Project Structure

Create a new directory for your project:
bashCopymkdir travel-companion-ai
cd travel-companion-ai

Create the following folder structure:
Copytravel-companion-ai/
├── static/
│   ├── css/
│   ├── js/
│   └── images/
├── templates/
├── app.py
├── .env.template
├── .gitignore
└── requirements.txt


# Step 2: Set Up Version Control with Git

Initialize a Git repository:
bashCopygit init

Create a .gitignore file:
Copy# Environment variables
.env

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
ENV/

# IDE specific files
.idea/
.vscode/

Create a basic README.md file:
markdownCopy# AI Travel Companion

A Flask-based web application that uses AI to provide travel recommendations and advice.


# Step 3: Create the Flask Application

Create app.py:
pythonCopyfrom flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
import requests
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Using OpenRouter API
def get_ai_response(prompt):
    try:
        api_key = os.getenv("OPENROUTER_API_KEY")
        site_url = os.getenv("SITE_URL", "http://localhost:5000")
        site_name = os.getenv("SITE_NAME", "AI Travel Companion")
        
        # Format the input as a travel assistant prompt
        travel_prompt = f"You are a helpful travel companion assistant. Provide travel advice, recommendations, and information for this request: {prompt}"
        
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": site_url,
                "X-Title": site_name,
                "Content-Type": "application/json"
            },
            data=json.dumps({
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a friendly travel companion AI assistant that provides helpful, concise advice and recommendations for travelers."
                    },
                    {
                        "role": "user",
                        "content": travel_prompt
                    }
                ]
            })
        )
        
        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        else:
            return f"Error: {response.status_code}, {response.text}"
            
    except Exception as e:
        return f"Error generating response: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    
    # Get response from AI
    ai_response = get_ai_response(user_message)
    
    return jsonify({'response': ai_response})

if __name__ == '__main__':
    app.run(debug=True)

Create .env.template:
Copy# OpenRouter API Key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Your site information (optional for OpenRouter)
SITE_URL=http://localhost:5000
SITE_NAME=AI Travel Companion

# Flask configuration
FLASK_ENV=development

# Create requirements.txt:
Copyflask==2.3.3
requests==2.31.0
python-dotenv==1.0.0


# Step 4: Create HTML Template
Create templates/index.html:
htmlCopy<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Travel Companion</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <div class="container">
        <header>
            <h1>AI Travel Companion</h1>
            <p>Your personal assistant for travel recommendations and advice</p>
        </header>
        
        <main>
            <div class="chat-container">
                <div id="chat-messages" class="chat-messages">
                    <div class="message assistant">
                        <p>Hello! I'm your AI travel companion. Where would you like to travel? Ask me about destinations, recommendations, or travel tips!</p>
                    </div>
                </div>
                
                <div class="chat-input">
                    <input type="text" id="user-input" placeholder="Ask about a destination...">
                    <button id="send-button">Send</button>
                </div>
            </div>
        </main>
        
        <footer>
            <p>Created by [Your Name] - <a href="https://github.com/yourusername/travel-companion-ai" target="_blank">GitHub Repository</a></p>
        </footer>
    </div>

    <script src="{{ url_for('static', filename='js/script.js') }}"></script>
</body>
</html>
# Step 5: Add CSS Styling
Create static/css/style.css:
cssCopy* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #fffdf0;
}

.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
}

header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background-color: #ffc107;
    color: #333;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

header h1 {
    margin-bottom: 10px;
}

.chat-container {
    background-color: white;
    background-image: url('/static/images/travel-bg.png');
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.chat-messages {
    height: 500px;
    overflow-y: auto;
    padding: 20px;
}

.message {
    margin-bottom: 15px;
    padding: 12px 15px;
    border-radius: 8px;
    max-width: 80%;
    line-height: 1.5;
}

.user {
    background-color: #fff8d6;
    margin-left: auto;
    border: 1px solid #f0e0a0;
}

.assistant {
    background-color: rgba(255, 255, 255, 0.85);
    margin-right: auto;
    border: 1px solid #e0e0e0;
}

.chat-input {
    display: flex;
    padding: 15px;
    border-top: 1px solid #ddd;
}

#user-input {
    flex: 1;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    margin-right: 10px;
}

#send-button {
    padding: 12px 20px;
    background-color: #ffc107;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

#send-button:hover {
    background-color: #e0a800;
}

footer {
    margin-top: 30px;
    text-align: center;
    color: #666;
}

footer a {
    color: #ffc107;
    text-decoration: none;
}

footer a:hover {
    text-decoration: underline;
}

/* Itinerary styling */
.itinerary-container {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.itinerary-intro {
  margin-bottom: 15px;
  font-style: italic;
}

.itinerary-day {
  margin-bottom: 20px;
  border-left: 3px solid #ffc107;
  padding-left: 15px;
}

.itinerary-day h3 {
  color: #e0a800;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.itinerary-content {
  line-height: 1.6;
}

.itinerary-content strong {
  color: #d97706;
  display: block;
  margin-top: 10px;
}

.itinerary-budget {
  margin-top: 20px;
  padding: 10px;
  background-color: #fffbeb;
  border: 1px dashed #fbbf24;
  border-radius: 5px;
  font-weight: bold;
}

/* Responsive design */
@media (max-width: 768px) {
    .chat-messages {
        height: 400px;
    }
    
    .message {
        max-width: 90%;
    }
}
# Step 6: Add JavaScript for Chat Functionality
Create static/js/script.js:
javascriptCopydocument.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    // Set a reasonable timeout for model responses
    const RESPONSE_TIMEOUT = 30000; // 30 seconds

    // Function to format itineraries
    function formatItinerary(text) {
      // Check if this is an itinerary (contains "Day 1" or similar patterns)
      if (text.includes("Day 1") || text.includes("Day 1:")) {
        // Split by days
        const days = text.split(/Day \d+:?/).filter(day => day.trim().length > 0);
        
        // Create HTML structure
        let formattedHtml = '<div class="itinerary-container">';
        
        // Add intro text if present (before the days listing)
        const introText = text.split("Day 1")[0].trim();
        if (introText) {
          formattedHtml += `<div class="itinerary-intro">${introText}</div>`;
        }
        
        // Format each day
        days.forEach((day, index) => {
          formattedHtml += `
            <div class="itinerary-day">
              <h3>Day ${index + 1}</h3>
              <div class="itinerary-content">
                ${day.replace(/- Morning:/g, '<strong>Morning:</strong>')
                     .replace(/- Afternoon:/g, '<strong>Afternoon:</strong>')
                     .replace(/- Evening:/g, '<strong>Evening:</strong>')}
              </div>
            </div>
          `;
        });
        
        // Add budget summary if present
        if (text.includes("budget") || text.includes("MYR")) {
          const budgetMatch = text.match(/Total estimated budget[^.]*/);
          if (budgetMatch) {
            formattedHtml += `<div class="itinerary-budget">${budgetMatch[0]}</div>`;
          }
        }
        
        formattedHtml += '</div>';
        return formattedHtml;
      }
      
      // If not an itinerary, return original text
      return text;
    }

    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user' : 'assistant');
        
        // Check if this looks like an itinerary
        if (!isUser && (content.includes("Day 1") || content.includes("itinerary"))) {
            // Use HTML formatting for itineraries
            const formattedContent = formatItinerary(content);
            messageDiv.innerHTML = formattedContent;
        } else {
            // Use regular text for normal messages
            const messagePara = document.createElement('p');
            messagePara.textContent = content;
            messageDiv.appendChild(messagePara);
        }
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
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
            
            // Remove loading indicator
            chatMessages.removeChild(loadingDiv);
            
            if (response.ok) {
                const data = await response.json();
                // Add AI response
                addMessage(data.response);
            } else {
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
# Step 7: Add a Background Image

Create a folder static/images/ and add a travel-themed background image named travel-bg.png.
You can download a free travel-themed image from sites like Unsplash or Pexels. Here are some search terms to use:

"travel map"
"world landmarks"
"travel icons"
"passport stamps"


Make sure the image is not too detailed, as it will be behind text.

Step 8: Set Up OpenRouter API

Sign up for an account at OpenRouter
Generate an API key from your dashboard
Create a .env file by copying .env.template and add your API key:
CopyOPENROUTER_API_KEY=your_actual_api_key_here
SITE_URL=http://localhost:5000
SITE_NAME=AI Travel Companion
FLASK_ENV=development


# Step 9: Install Dependencies and Run the Application

Set up a virtual environment:
bashCopypython -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

Install dependencies:
bashCopypip install -r requirements.txt

Run the application:
bashCopypython app.py

Open your browser and go to http://127.0.0.1:5000

# Step 11: Update GitHub Repository

Commit your changes:
bashCopygit add .
git commit -m "Create AI Travel Companion chatbot"

Push to GitHub:
bashCopygit remote add origin https://github.com/yourusername/travel-companion-ai.git
git branch -M main
git push -u origin main

Update your repository with:

A detailed README.md (this tutorial)
Screenshots of your application
A license file (MIT recommended)



# Next Steps and Enhancements
Once your basic application is working, consider these enhancements:

User accounts: Add login functionality to save conversations
Multiple language support: Allow users to choose their preferred language
Travel API integration: Connect to flight, hotel, or weather APIs
Itinerary saving: Allow users to save and export itineraries
Visual improvements: Add animations and transitions
Offline mode: Cache responses for offline use


Feel free to customize this project to showcase your own skills and interests. Happy coding!
