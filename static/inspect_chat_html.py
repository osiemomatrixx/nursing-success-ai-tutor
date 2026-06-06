with open("static/index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's find where the chat tab starts and ends
start_idx = html.find('id="chat"')
if start_idx != -1:
    # Print 2000 characters from start_idx
    print(html[start_idx:start_idx+3500])
else:
    print("id='chat' not found")
