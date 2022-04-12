#!/usr/bin/env python
# coding: utf-8

# In[2]:


import requests
from bs4 import BeautifulSoup

import itertools


# In[61]:


general_url = 'https://www.holidify.com/country/{}/places-to-visit.html'
specific_place_url = 'https://www.holidify.com/places/{}/sightseeing-and-things-to-do.html'
countries = ['uae', 'india', 'thailand', 'singapore', 'oman', 'nepal', 'vietnam', 'seychelles','Mauritius']


links = list()
places = dict() #stores the places to visit per country
for country in countries:
    res = requests.get(general_url.format(country))
    soup = BeautifulSoup(res.text,'lxml')
    dropdown = soup.find_all('ul', class_='dropdown-menu')
#     print(dropdown)
    for i in dropdown:
        links.extend(i.find_all('a'))

    places[country] = list()
    for link in links:
        title = link.get('title')
        if title and title != 'Tourist Places' and title not in list(itertools.chain(*places.values())):
            places[country].append(title)


# In[62]:


# print(places)


# In[63]:


def extract_cards(place):
    res = requests.get(specific_place_url.format(place.lower()))
    soup = BeautifulSoup(res.text, 'lxml')
    
    cards = {'heading': [], 'rating':[], 'location':[],
            'img_url':[], 'text':[]}

    for card in soup.find_all('div', class_='card content-card'):
        cards['heading'].append(card.find('h3', class_='card-heading').text)
        if card.find('span', class_='rating-badge'):
            cards['rating'].append(card.find('span', class_='rating-badge').text)
        else: cards['rating'].append('-1')
            
        cards['img_url'].append(card.find('img',class_='card-img-top')['data-original'])

        if card.find('p',class_='mb-2'):
            cards['location'].append(card.find('p',class_='mb-2').text)
        else: cards['location'].append(place)
        cards['text'].append(card.find('p',class_='card-text').text)
    return cards


# In[64]:


data = {'heading': [], 'rating':[], 'location':[],
            'img_url':[], 'text':[]}
for country, places in places.items():
    if len(places) > 0:
        for place in places:
            cards = extract_cards(place)
            data['heading'].extend(cards['heading'])
            data['rating'].extend(cards['rating'])
            data['location'].extend(cards['location'])
            data['img_url'].extend(cards['img_url'])
            data['text'].extend(cards['text'])
            
    else:
        cards = extract_cards(country)
        data['heading'].extend(cards['heading'])
        data['rating'].extend(cards['rating'])
        data['location'].extend(cards['location'])
        data['img_url'].extend(cards['img_url'])
        data['text'].extend(cards['text'])


# In[65]:


import pandas as pd
df = pd.DataFrame(data)


# In[72]:


df.to_csv('places_to_visit.csv')


# In[ ]:





# In[ ]:




