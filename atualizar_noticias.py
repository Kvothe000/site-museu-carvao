import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import json
import os
from urllib.parse import urljoin

# --- 1. CONFIGURAÇÃO ---
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Chave de API do Gemini não encontrada.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

SOURCE_URL = 'https://www.cultura.rs.gov.br/inicial'
BASE_URL = 'https://www.cultura.rs.gov.br'

# --- 2. COLETA (WEB SCRAPING) ---
print("Buscando notícias...")
try:
    # ADICIONAMOS O CABEÇALHO (O DISFARCE) AQUI
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    response = requests.get(SOURCE_URL, headers=headers)
    response.raise_for_status() # Verifica se a requisição foi bem sucedida
    soup = BeautifulSoup(response.text, 'html.parser')

    latest_article = soup.find('article', class_='latest-news-item')
    if not latest_article:
        raise ValueError("Não foi possível encontrar o artigo de notícia mais recente.")

    relative_link = latest_article.find('a')['href']
    news_link = urljoin(BASE_URL, relative_link)

    # USAMOS O MESMO CABEÇALHO PARA A SEGUNDA REQUISIÇÃO
    news_page_response = requests.get(news_link, headers=headers)
    news_page_response.raise_for_status()
    news_soup = BeautifulSoup(news_page_response.text, 'html.parser')
    
    relative_image_src = news_soup.find('figure', class_='news-main-image').find('img')['src']
    image_url = urljoin(BASE_URL, relative_image_src)
    
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
    """

    response_ia = model.generate_content(prompt)
    
    if "IRRELEVANTE" in response_ia.text:
        print("Notícia considerada irrelevante pela IA. Nenhuma atualização será feita.")
        exit()

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

except requests.exceptions.RequestException as e:
    print(f"Ocorreu um erro de rede: {e}")
except Exception as e:
    print(f"Ocorreu um erro geral: {e}")