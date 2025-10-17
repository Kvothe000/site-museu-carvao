import requests
from bs4 import BeautifulSoup
import json
import os
from urllib.parse import urljoin

# --- 1. CONFIGURAÇÃO ---
RSS_URL = 'https://news.google.com/rss/search?q=%22Museu%20do%20Carv%C3%A3o%22&hl=pt-BR&gl=BR&ceid=BR:pt-419'
IMAGEM_PADRAO = 'img/projeto-enchente.jpg' # Nosso plano B

# Cabeçalhos para simular um navegador
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
}

# --- 2. COLETA (LENDO O FEED RSS) ---
print("Lendo o feed RSS do Google News...")
try:
    response_rss = requests.get(RSS_URL, headers=HEADERS, timeout=15)
    response_rss.raise_for_status()
    soup_rss = BeautifulSoup(response_rss.content, 'xml')

    first_item = soup_rss.find('item')
    if not first_item:
        print("Nenhuma notícia recente encontrada no feed RSS. Nenhuma atualização será feita.")
        exit()

    news_title = first_item.find('title').get_text()
    news_link = first_item.find('link').get_text()
    print(f"Notícia encontrada no RSS: {news_title}")

    # --- 3. TENTATIVA DE BUSCAR A IMAGEM NA PÁGINA DA NOTÍCIA ---
    image_url = IMAGEM_PADRAO # Começamos com o padrão como plano B
    print(f"Tentando buscar imagem na página: {news_link}")
    try:
        response_page = requests.get(news_link, headers=HEADERS, timeout=20) # Timeout um pouco maior
        response_page.raise_for_status()
        soup_page = BeautifulSoup(response_page.text, 'html.parser')

        # Procura pela tag Open Graph (og:image) - o método mais confiável
        og_image_tag = soup_page.find('meta', property='og:image')

        if og_image_tag and og_image_tag.get('content'):
            found_image_url = og_image_tag['content']
            # Garante que a URL da imagem seja absoluta
            image_url = urljoin(news_link, found_image_url) 
            print(f"Imagem encontrada via og:image: {image_url}")
        else:
            print("Tag og:image não encontrada. Usando imagem padrão.")

    except requests.exceptions.RequestException as e_img:
        print(f"Erro ao acessar a página da notícia para buscar imagem: {e_img}. Usando imagem padrão.")
    except Exception as e_parse:
        print(f"Erro ao analisar a página da notícia: {e_parse}. Usando imagem padrão.")

    # --- 4. SALVA OS DADOS ---
    nova_noticia = {
        "titulo": news_title,
        "resumo": "", # Resumo fica vazio
        "link": news_link,
        "imagem_url": image_url # Usa a imagem encontrada ou a padrão
    }

    with open('noticias.json', 'w', encoding='utf-8') as f:
        json.dump(nova_noticia, f, ensure_ascii=False, indent=4)

    print("Arquivo noticias.json atualizado com sucesso!")

except Exception as e:
    print(f"Ocorreu um erro geral no processo: {e}")