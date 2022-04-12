import re
import pandas as pd
from nltk.corpus import stopwords
from nltk.tokenize import RegexpTokenizer


data = pd.read_csv('places_to_visit.csv', index_col=0)


def clean_loc(location):
    if location.strip().startswith('Located in'):
        return location.split(':')[1].strip()
    return location.strip()

def clean_rating(rating):
    if rating == '-1':
        return rating
    rating = rating.split('\n')
    rate = None
    for i in rating:
        try:
            rate = float(i)
            return rate
        except: 
            continue
            
            
data['heading'] = data['heading'].apply(lambda x: x[4:].strip())
data.location = data['location'].apply(lambda x: clean_loc(x))    
data.rating = data.rating.apply(lambda x: clean_rating(x))    
#Flagging the unknown rating values
data['rating_unknown'] = data.rating.astype('float').apply(lambda x: 1 if x == -1 else 0)
data.rating = data.rating.astype('float')

data.to_csv('cleaned_data.csv')

def remove_non_ascii(text):
    return "".join([i for i in text if ord(i) < 128])
def remove_stopwords(text):
    text = text.split()
    stops = set(stopwords.words('english'))
    text = [w for w in text if w not in stops]
    text = " ".join(text)
    return text
def remove_punct(text):
    tokenizer = RegexpTokenizer(r'\w+')
    text = tokenizer.tokenize(text)
    return " ".join(text)
    return text
def remove_html(text):
    html_pattern = re.compile('<.*?>')
    return html_pattern.sub(r'', text)

data = pd.read_csv('cleaned_data.csv', index_col=0)

data['text'] = data['text'].apply(lambda x: x.strip().lower())
data['cleaned_text'] = data['text'].apply(remove_non_ascii)
data['cleaned_text'] = data['cleaned_text'].apply(remove_stopwords)
data['cleaned_text'] = data['cleaned_text'].apply(remove_punct)
data['cleaned_text'] = data['cleaned_text'].apply(remove_html)

print(data['cleaned_text'][0])
print('*'*100)
print(data['text'][0])
data.to_csv('cleaned_data.csv')

data.to_json('../seeds/seed_data.json')