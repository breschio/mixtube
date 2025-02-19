
import sys
import json
import requests
from bs4 import BeautifulSoup
import re

def extract_video_id(url):
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/results\?search_query=(.+)'
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def scrape_youtube(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        if 'results?search_query' in url:
            # Handle search results
            videos = []
            video_elements = soup.find_all('div', {'class': 'yt-lockup-video'})
            
            for element in video_elements:
                video_id = element.get('data-context-item-id')
                if not video_id:
                    continue
                    
                title_element = element.find('a', {'class': 'yt-uix-tile-link'})
                channel_element = element.find('div', {'class': 'yt-lockup-byline'})
                
                videos.append({
                    'id': video_id,
                    'title': title_element.get('title') if title_element else 'Unknown Title',
                    'thumbnail': f'https://img.youtube.com/vi/{video_id}/mqdefault.jpg',
                    'channelTitle': channel_element.text if channel_element else 'Unknown Channel'
                })
            
            return json.dumps({'videos': videos})
        else:
            # Handle single video
            title = soup.find('meta', property='og:title')
            description = soup.find('meta', property='og:description')
            
            return json.dumps({
                'title': title['content'] if title else None,
                'description': description['content'] if description else None
            })
            
    except Exception as e:
        return json.dumps({'error': str(e)})

if __name__ == '__main__':
    if len(sys.argv) > 1:
        url = sys.argv[1]
        print(scrape_youtube(url))
