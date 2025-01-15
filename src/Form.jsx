import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const CommentForm = () => {
  const [comment, setComment] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [commentaire, setCommentaire] = useState(''); 
  const [comments, setComments] = useState([]);
  const [response, setResponse] = useState(''); 
  const [toxic, setToxic] = useState(''); 
  const [loading, setLoading] = useState(false); 

   
   const handleChange = (e) => {
    setCommentaire(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setResponse(''); 

    try {
      const response = await axios.post('http://127.0.0.1:5000/analyze', {

        comment: commentaire,
      });

      
      setResponse(response.data.predictions); 

      const allZero = (!Object.values(response.data.predictions).includes(1));

      setToxic(response.data.toxic)
      
      
      if (!response.data.toxic) {
        setComments((prevComments) => [...prevComments, response.data.comment]);
      }
      
          
    } catch (error) {
      console.error('Erreur lors de l\'envoi du commentaire:', error);
      setResponse('Erreur lors de l\'envoi du commentaire');
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="container py-5 d-felx ">
      <div className="row">

        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">

              {response && (
                <div 
                  className={`alert ${toxic ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`} 
                  role="alert"
                >
                  <p>
                  {toxic
                    ? <>Nous ne pouvons pas accepter votre commentaire car il est <strong>toxique</strong></> 
                    : 'Votre commentaire est accepté'}
                </p> 
                  <button 
                    type="button" 
                    className="btn-close" 
                    data-bs-dismiss="alert" 
                    aria-label="Close"
                  ></button>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                <div>
        <h2>Commentaires :</h2>
        {comments.map((comment, index) => (
          
          <p key={index}>- <b>{comment}</b></p>
        ))}
      </div>
                
                  <textarea
                    id="comment"
                    className="form-control"
                    rows="6"
                    placeholder="Entrez votre commentaire ici..."
                    value={commentaire}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={`btn btn-primary w-100 ${loading ? 'disabled' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Analyse en cours...
                    </>
                  ) : (
                    'Analyser le Commentaire'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="mb-4" style={{ fontSize: '6rem', color: '#0d6efd' }}>
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            
            <div className="d-flex justify-content-center gap-4">
              <div className="text-center">
                <div style={{ fontSize: '2.5rem', color: '#198754' }}>
                  <i className="bi bi-emoji-smile"></i>
                </div>
                <div className="mt-2">Positif</div>
              </div>
              <div className="text-center">
                <div style={{ fontSize: '2.5rem', color: '#dc3545' }}>
                  <i className="bi bi-emoji-neutral"></i>
                </div>
                <div className="mt-2">Neutre</div>
              </div>
              <div className="text-center">
                <div style={{ fontSize: '2.5rem', color: '#ffc107' }}>
                  <i className="bi bi-emoji-frown"></i>
                </div>
                <div className="mt-2">Négatif</div>
              </div>
            </div>


          </div>
        </div>
      </div>

      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
      />
    </div>
  );
};

export default CommentForm;