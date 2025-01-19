#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import re
import nltk
from nltk.stem.snowball import SnowballStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.multiclass import OneVsRestClassifier
from sklearn.linear_model import LogisticRegression
from flask import Flask, request, jsonify
from flask_cors import CORS
import warnings

warnings.filterwarnings('ignore')

df = pd.read_csv('train.csv')
df = df.drop(columns=['id'], axis=1)

stemmer = SnowballStemmer('english')

def preprocess(text):
    text = text.lower()
    text = re.sub(r'\W', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return " ".join(stemmer.stem(word) for word in text.split())

df['comment_text'] = df['comment_text'].apply(preprocess)

X = df['comment_text']
y = df.drop(columns=['comment_text'], axis=1)

vectorizer = TfidfVectorizer(stop_words='english', max_features=10000)
X_tfidf = vectorizer.fit_transform(X)

model = OneVsRestClassifier(LogisticRegression(), n_jobs=-1)
model.fit(X_tfidf, y)

app = Flask(__name__)
CORS(app)
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    sentence = data.get('comment', '')
    processed_sentence = preprocess(sentence)
    tfidf_sentence = vectorizer.transform([processed_sentence])
    results = model.predict(tfidf_sentence)[0]
    labels = y.columns.values
    output_dict = {label: int(result) for label, result in zip(labels, results)}
    return jsonify(output_dict)

if __name__ == '__main__':
    port = 5000
    print(f"App is running on http://127.0.0.1:{port}")
    app.run(debug=True, port=port)