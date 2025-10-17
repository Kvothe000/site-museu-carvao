import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import json
import os

# --- 1. CONFIGURAÇÃO ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Chave de API do Gemini não encontrada.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-pro-latest')

# A NOVA FONTE: O FEED RSS DO GOOGLE NOTÍCIAS. MUITO MAIS ESTÁVEL!
RSS_URL = 'https://news.google.com/rss/search?q=%22Museu%20do%20Carv%C3%A3o%22&hl=pt-BR&gl=BR&ceid=BR:pt-419'

# --- 2. COLETA (LENDO O FEED RSS) ---
print("Lendo o feed RSS do Google News...")
try:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }

    response = requests.get(RSS_URL, headers=headers, timeout=15)
    response.raise_for_status()

    # Usamos o parser de XML, que é perfeito para RSS
    soup = BeautifulSoup(response.content, 'xml')

    # No RSS, cada notícia é um <item>
    first_item = soup.find('item')
    
    if not first_item:
        print("Nenhuma notícia recente encontrada no feed RSS. Nenhuma atualização será feita.")
        exit()

    # A estrutura é sempre a mesma: <title>, <link>, <pubDate>
    news_title = first_item.find('title').get_text()
    news_link = first_item.find('link').get_text()

    print(f"Notícia encontrada: {news_title}")

    # --- 3. PROCESSAMENTO (IA) ---
    print("Enviando título para a IA para resumo...")
    
    prompt = f"""
    Com base no seguinte título de uma notícia, crie um resumo conciso e chamativo de no máximo duas frases para a homepage de um site.
    
    Título: "{news_title}"
    
    Formate sua resposta EXATAMENTE assim, sem nenhuma palavra extra:
    RESUMO: [Seu resumo aqui]
    """

    response_ia = model.generate_content(prompt)
    resumo = response_ia.text.replace("RESUMO:", "").strip()

    print(f"IA gerou o resumo: {resumo}")

    # --- 4. SALVA OS DADOS ---
    nova_noticia = {
        "titulo": news_title,
        "resumo": resumo,
        "link": news_link,
        "imagem_url": "img/projeto-enchente.jpg" # Mantemos nossa imagem padrão
    }

    with open('noticias.json', 'w', encoding='utf-8') as f:
        json.dump(nova_noticia, f, ensure_ascii=False, indent=4)

    print("Arquivo noticias.json atualizado com sucesso!")

except Exception as e:
    print(f"Ocorreu um erro geral: {e}")