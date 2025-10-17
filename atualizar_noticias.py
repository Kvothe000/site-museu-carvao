import requests
from bs4 import BeautifulSoup
import json
import os
from urllib.parse import urljoin # Embora não usemos mais para construir links do Google

# --- 1. CONFIGURAÇÃO ---
# Não precisamos mais da chave de API do Gemini! 🎉
RSS_URL = 'https://news.google.com/rss/search?q=%22Museu%20do%20Carv%C3%A3o%22&hl=pt-BR&gl=BR&ceid=BR:pt-419'

# --- 2. COLETA (LENDO O FEED RSS) ---
print("Lendo o feed RSS do Google News...")
try:
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
    }

    response = requests.get(RSS_URL, headers=headers, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'xml')

    first_item = soup.find('item')
    if not first_item:
        print("Nenhuma notícia recente encontrada no feed RSS. Nenhuma atualização será feita.")
        exit()

    # Pega apenas o título e o link direto do RSS
    news_title = first_item.find('title').get_text()
    news_link = first_item.find('link').get_text()

    print(f"Notícia encontrada: {news_title}")

    # --- 3. SALVA OS DADOS (SEM IA) ---
    nova_noticia = {
        "titulo": news_title,
        "resumo": "", # Deixamos o resumo vazio por enquanto
        "link": news_link,
        "imagem_url": "img/projeto-enchente.jpg" # Mantemos nossa imagem padrão
    }

    with open('noticias.json', 'w', encoding='utf-8') as f:
        json.dump(nova_noticia, f, ensure_ascii=False, indent=4)

    print("Arquivo noticias.json atualizado com sucesso (sem resumo da IA)!")

except Exception as e:
    print(f"Ocorreu um erro geral: {e}")