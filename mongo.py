from pymongo import MongoClient

MONGO_URI = "mongodb+srv://stefanristevski:CScy60inEM57biAU@cluster1.l9gjnkg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"

client = MongoClient(MONGO_URI)
db = client["knowledge_db"]


qa_collection = db["qa_pairs"]

def find_in_db(question):
    result = qa_collection.find_one({"question": question})
    if result:
        return result["answer"]
    return None

def insert_to_db(question, answer):
    qa_collection.insert_one({"question": question, "answer": answer})


users_collection = db["users"]

def find_user_by_email(email):
    return users_collection.find_one({"email": email})

def insert_user(username, email, password):
    users_collection.insert_one({
        "username": username,
        "email": email,
        "password": password
    })
