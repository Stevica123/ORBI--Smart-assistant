from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_mail import Mail, Message
from pymongo import MongoClient
from main import get_answer

app = Flask(__name__)
app.secret_key = "your_secret_key"


app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'stefanristevski20@gmail.com'
app.config['MAIL_PASSWORD'] = 'bothpfsoczhzywru'

mail = Mail(app)


MONGO_URI = "mongodb+srv://stefanristevski:CScy60inEM57biAU@cluster1.l9gjnkg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"
client = MongoClient(MONGO_URI)
db = client["knowledge_db"]
users_collection = db["users"]

def find_user_by_email(email):
    return users_collection.find_one({"email": email})

def insert_user(username, email, password):
    users_collection.insert_one({
        "username": username,
        "email": email,
        "password": password,
        "chats": {}  
    })



@app.route("/api/chats", methods=["GET"])
def get_chats():
    user_email = session.get('user')
    if not user_email:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_doc = find_user_by_email(user_email)
    if not user_doc:
        return jsonify({"error": "User not found"}), 404
    
    chats = user_doc.get("chats", {})  
    return jsonify({"chats": chats})

@app.route("/api/chats", methods=["POST"])
def create_chat():
    user_email = session.get('user')
    if not user_email:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = find_user_by_email(user_email)
    if not user_doc:
        return jsonify({"error": "User not found"}), 404

    existing_chats = user_doc.get("chats", {})
    new_chat_id = 1
    while str(new_chat_id) in existing_chats:
        new_chat_id += 1

    existing_chats[str(new_chat_id)] = []

    users_collection.update_one(
        {"email": user_email},
        {"$set": {"chats": existing_chats}}
    )

    return jsonify({"chat_id": new_chat_id})

@app.route("/api/chats/<chat_id>/messages", methods=["POST"])
def post_message(chat_id):
    user_email = session.get('user')
    if not user_email:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = find_user_by_email(user_email)
    if not user_doc:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "Question is required"}), 400

    chats = user_doc.get("chats", {})
    if chat_id not in chats:
        return jsonify({"error": "Chat not found"}), 404

    
    answer = get_answer(question)

    chats[chat_id].append({"q": question, "a": answer})

    users_collection.update_one(
        {"email": user_email},
        {"$set": {"chats": chats}}
    )

    return jsonify({"question": question, "answer": answer})

@app.route("/api/chats/<chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    user_email = session.get('user')
    if not user_email:
        return jsonify({"error": "Unauthorized"}), 401

    user_doc = find_user_by_email(user_email)
    if not user_doc:
        return jsonify({"error": "User not found"}), 404

    chats = user_doc.get("chats", {})
    if chat_id not in chats:
        return jsonify({"error": "Chat not found"}), 404

    del chats[chat_id]

    users_collection.update_one(
        {"email": user_email},
        {"$set": {"chats": chats}}
    )

    return jsonify({"message": "Chat deleted"})


@app.route("/", methods=["GET", "POST"])
def index():
    answer = ""
    user = session.get('user')
    if request.method == "POST":
        question = request.form.get("question")
        if question:
            answer = get_answer(question)
    return render_template("index.html", answer=answer, user=user)

@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form.get("name")
        sender_email = request.form.get("email")
        message = request.form.get("message")
        msg = Message(subject=f"Contact form from: {name}",
                      sender=sender_email,
                      recipients=["stefanristevski20@gmail.com"])
        msg.body = f"Email: {sender_email}\n\nMessage:\n{message}"
        try:
            mail.send(msg)
            flash("Your message has been sent successfully!", "success")
        except Exception as e:
            flash(f"An error occurred: {str(e)}", "error")
        return redirect(url_for('contact'))
    return render_template("contact.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/learn-about-orbi")
def learn():
    user = session.get('user')
    return render_template("learn-about-orbi.html", user=user)

@app.route("/start-with-orbi")
def start():
    user = session.get('user')
    return render_template("start-with-orbi.html", user=user)

@app.route("/login", methods=["GET", "POST"])
def login():
    next_page = request.args.get('next', 'index')
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        user = find_user_by_email(email)

        if 'login_attempts' not in session:
            session['login_attempts'] = 0

        if user and user["password"] == password:
            session.pop('login_attempts', None)
            session['user'] = user["email"] 
            return redirect(url_for(next_page))
        else:
            session['login_attempts'] += 1
            if session['login_attempts'] >= 3:
                session.pop('login_attempts', None)
                return redirect(url_for('register', next=next_page))
            else:
                flash("Погрешен email или лозинка.", "error")
                return redirect(url_for('login', next=next_page))
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    next_page = request.args.get('next', 'index')
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")

        if find_user_by_email(email):
            flash("Корисникот веќе постои, најавете се.", "error")
            return redirect(url_for('login', next=next_page))

        insert_user(username, email, password)
        flash("Успешна регистрација! Сега најавете се.", "success")
        return redirect(url_for('login', next=next_page))
    return render_template("register.html")

@app.route("/logout")
def logout():
    session.pop('user', None)
    flash("Успешно излогување.", "success")
    referer = request.headers.get("Referer", "")
    if "/start-with-orbi" in referer:
        return redirect(url_for("start"))
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)
