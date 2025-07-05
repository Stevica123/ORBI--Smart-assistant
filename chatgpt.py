import time
from openai import OpenAI
import openai

client = OpenAI(api_key="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") 

def query_chatgpt(question, retries=3, delay=3):
    for attempt in range(1, retries + 1):
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Одговарај концизно со максимум 5 реченици. Користи 2 до 5 реченици."},
                    {"role": "user", "content": question}
                ],
                timeout=10
            )
            return response.choices[0].message.content.strip()
        except openai.APIError as e:
            if "insufficient_quota" in str(e):
                return "❗ Немаш доволно кредит за да го користиш моделот. Внеси платежна картичка во OpenAI Billing."
            print(f"Грешка при повик до OpenAI API: {e}. Обид {attempt} од {retries}.")
            if attempt < retries:
                time.sleep(delay)
            else:
                return "⚠️ Настана грешка. Обиди се подоцна."

if __name__ == "__main__":
    while True:
        question = input("Постави прашање (или 'exit' за излез): ")
        if question.lower() == "exit":
            break
        print("🟠 Прашањето не е во базата, прашувам ChatGPT 3.5...")
        answer = query_chatgpt(question)
        print(f"Одговор: {answer}\n")
