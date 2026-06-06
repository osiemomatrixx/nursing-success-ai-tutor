import re

def analyze_html():
    print("--- HTML Containers ---")
    with open("static/index.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    # Find all main sections/divs that might represent pages
    sections = re.findall(r'id="([^"]+)"', html)
    print("All IDs found in index.html:")
    for s in set(sections):
        if any(keyword in s.lower() for keyword in ['dashboard', 'simulation', 'nclex', 'reference', 'chat', 'research', 'auth']):
            print(f"  ID: {s}")

def analyze_js():
    print("\n--- JS Functions and Chat Logic ---")
    with open("static/app.js", "r", encoding="utf-8") as f:
        js = f.read()
    
    # Look for chat related calls
    lines = js.split('\n')
    for i, line in enumerate(lines):
        if any(keyword in line for keyword in ['sendMessage', 'api/chat', 'chat-input', 'chatMessages']):
            print(f"  Line {i+1}: {line.strip()}")

if __name__ == "__main__":
    analyze_html()
    analyze_js()
