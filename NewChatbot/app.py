from flask import Flask, render_template, request, jsonify
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
                "model": "deepseek/deepseek-r1-distill-qwen-32b:free", # You can change this to other models
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
