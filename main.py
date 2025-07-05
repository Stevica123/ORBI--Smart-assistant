from mongo import find_in_db, insert_to_db
from chatgpt import query_chatgpt  

def get_answer(question):
    answer = find_in_db(question)
    if answer:
        print("🟢 Одговор пронајден во базата.")
        return answer
    
    print("🟠 Прашањето не е во базата, прашувам ChatGPT 3.5...")
    answer = query_chatgpt(question)
    
    if answer and not answer.startswith("Настана грешка"):
        insert_to_db(question, answer)
        print("🟢 Новиот одговор е зачуван во базата.")
    else:
        print("🔴 Не успеав да најдам одговор.")
    
    return answer

if __name__ == "__main__":
    while True:
        question = input("Постави прашање (или 'exit' за излез): ")
        if question.lower() == "exit":
            break
        answer = get_answer(question)
        print(f"Одговор: {answer}\n")
