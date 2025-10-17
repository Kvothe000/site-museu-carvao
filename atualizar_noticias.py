import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import json
import os
from urllib.parse import urljoin

# --- 1. CONFIGURAÇÃO ---
# Tenta pegar a chave de API de uma variável de ambiente (mais seguro)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Chave de API do Gemini não encontrada. Defina a variável de ambiente GEMINI_API_KEY.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# A URL da fonte de notícias
SOURCE_URL = 'https://www.cultura.rs.gov.br/inicial'
BASE_URL = 'https://www.cultura.rs.gov.br' # Base para construir links completos

# --- 2. COLETA (WEB SCRAPING) ---
print("Buscando notícias...")
try:
    response = requests.get(SOURCE_URL)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Encontra o primeiro artigo de notícia (este seletor pode precisar de ajuste)
    latest_article = soup.find('article', class_='latest-news-item')

    if not latest_article:
        raise ValueError("Não foi possível encontrar o artigo de notícia mais recente.")

    # Pega o link da notícia e o transforma em um link completo
    relative_link = latest_article.find('a')['href']
    news_link = urljoin(BASE_URL, relative_link)

    # Pega o texto da página da notícia
    news_page_response = requests.get(news_link)
    news_soup = BeautifulSoup(news_page_response.text, 'html.parser')

    # Pega a imagem principal (este seletor pode precisar de ajuste)
    relative_image_src = news_soup.find('figure', class_='news-main-image').find('img')['src']
    image_url = urljoin(BASE_URL, relative_image_src)

    # Pega o corpo do texto da notícia
    news_text = news_soup.find('div', class_='news-body-content').get_text(separator=' ', strip=True)

    print(f"Notícia encontrada: {news_link}")
    print(f"Imagem encontrada: {image_url}")

    # --- 3. PROCESSAMENTO (IA) ---
    print("Enviando texto para a IA para resumo...")
    prompt = f"""
    Analise o seguinte texto de uma notícia. Se a notícia for relevante para o 'Museu do Carvão', faça o seguinte:
    1. Crie um título curto e chamativo para a notícia.
    2. Crie um resumo conciso de no máximo duas frases.

    Formate sua resposta EXATAMENTE assim, sem nenhuma palavra extra:
    TÍTULO: [Seu título aqui]
    RESUMO: [Seu resumo aqui]

    Se a notícia NÃO for sobre o Museu do Carvão, responda apenas com a palavra "IRRELEVANTE".

    Texto da notícia: "{news_text[:2000]}"
    """ # Limita o texto para economizar tokens

    response_ia = model.generate_content(prompt)

    if "IRRELEVANTE" in response_ia.text:
        print("Notícia considerada irrelevante pela IA. Nenhuma atualização será feita.")
        exit()

    # Extrai o título e resumo da resposta da IA
    lines = response_ia.text.split('\n')
    titulo = lines[0].replace("TÍTULO:", "").strip()
    resumo = lines[1].replace("RESUMO:", "").strip()

    print(f"IA gerou o título: {titulo}")

    # --- 4. SALVA OS DADOS ---
    nova_noticia = {
        "titulo": titulo,
        "resumo": resumo,
        "link": news_link,
        "imagem_url": image_url
    }

    with open('noticias.json', 'w', encoding='utf-8') as f:
        json.dump(nova_noticia, f, ensure_ascii=False, indent=4)

    print("Arquivo noticias.json atualizado com sucesso!")

except Exception as e:
    print(f"Ocorreu um erro: {e}")