from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem.snowball import SnowballStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.multiclass import OneVsRestClassifier
from sklearn.linear_model import LogisticRegression
import pickle
import warnings
from flask_cors import CORS
warnings.filterwarnings('ignore')

# Initialize Flask app
app = Flask(__name__)

CORS(app)
# Ensure NLTK resources are downloaded
nltk.download('stopwords')
stopwords_set = set(stopwords.words('english'))
stemmer = SnowballStemmer('english')

# Text preprocessing functions
def remove_stopwords(text):
    no_stopword_text = [w for w in text.split() if not w in stopwords_set]
    return " ".join(no_stopword_text)

def clean_text(text):
    text = text.lower()
    text = re.sub(r"what's", "what is ", text)
    text = re.sub(r"\'s", " ", text)
    text = re.sub(r"\'ve", " have ", text)
    text = re.sub(r"can't", "can not ", text)
    text = re.sub(r"n't", " not ", text)
    text = re.sub(r"i'm", "i am ", text)
    text = re.sub(r"\'re", " are ", text)
    text = re.sub(r"\'d", " would ", text)
    text = re.sub(r"\'ll", " will ", text)
    text = re.sub(r"\'scuse", " excuse ", text)
    text = re.sub('\W', ' ', text)
    text = re.sub('\s+', ' ', text)
    return text.strip()

def stemming(sentence):
    stemmed_sentence = ""
    for word in sentence.split():
        stemmed_word = stemmer.stem(word)
        stemmed_sentence += stemmed_word + " "
    return stemmed_sentence.strip()

def preprocess_text(text):
    text = remove_stopwords(text)
    text = clean_text(text)
    text = stemming(text)
    return text

# Initialize and train the model
def initialize_model():
    # Charger les données d'entraînement
    df = pd.read_csv('train.csv')
    
    # Prétraiter les données
    df['comment_text'] = df['comment_text'].apply(preprocess_text)
    
    # Préparer X et y
    X = df['comment_text']
    y = df.drop(columns=['id', 'comment_text'], axis=1)
    
    # Créer et entraîner le pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english')),
        ('clf', OneVsRestClassifier(LogisticRegression(), n_jobs=-1))
    ])
    
    pipeline.fit(X, y)
    
    # Sauvegarder les labels
    global LABELS
    LABELS = y.columns.values
    
    return pipeline

# Endpoint pour l'analyse des commentaires
@app.route('/analyze', methods=['POST'])
def analyze_comment():
    try:
        data = request.get_json()
        if not data or 'comment' not in data:
            return jsonify({
                'error': 'No comment provided'
            }), 400
        
        comment_text = data['comment']
        processed_comment = preprocess_text(comment_text)
        
        # Obtenir les prédictions
        predictions = MODEL.predict([processed_comment])[0]
        
        # Créer le dictionnaire des prédictions
        prediction_results = {}
        for label, pred in zip(LABELS, predictions):
            prediction_results[label] = int(pred)
        
        # Retourner uniquement comment_text et predictions
        return jsonify({
            'comment_text': comment_text,
            'predictions': prediction_results
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Initialiser le modèle au démarrage
    print("Initializing model...")
    MODEL = initialize_model()
    print("Model initialized!")
    
    # Démarrer l'application
    app.run(debug=True)