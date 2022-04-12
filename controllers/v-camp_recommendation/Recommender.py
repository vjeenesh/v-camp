from nltk.corpus import stopwords
from nltk.tokenize import RegexpTokenizer
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import sys
import os
import json

path = os.getcwd()
data = pd.read_csv(path+'\\controllers\\v-camp_recommendation\\cleaned_data.csv', index_col=0)

def recommend_k_places(place, k=5):
    heading = place['title']
    location = place['location']
    df = data.loc[data['location'] == location].reset_index(level=0)
    indices = pd.Series(df.index, index=df.heading)
    

    if df.shape[0] < k and k != 5:
        k = df.shape[0]
    
    tfidf = TfidfVectorizer(min_df=1, stop_words='english')
    tf_matrix = tfidf.fit_transform(df['cleaned_text'])
    
    cosine = cosine_similarity(tf_matrix, tf_matrix)

    idx = indices[heading]
    scores = list(enumerate(cosine[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    scores = scores[1:k+1]
    place_idx = [i[0] for i in scores]
    
    recs = df.iloc[place_idx]
    # print(list(recs['heading']))
    return recs


place = sys.argv[1]
# print('title: ', json.loads(place)['title'])


place = json.loads(place)
# The place we are looking recommendations with is a temple
recs = recommend_k_places(place).to_dict()['heading']
recs_js = {'heading': []}
for rec in recs.values():
    recs_js['heading'].append(rec)

print(json.dumps(recs_js))