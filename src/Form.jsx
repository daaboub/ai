import React, { useState } from "react";

function CommentForm() {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");

  const analyzeComment = async () => {
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse du commentaire");
      }

      const data = await response.json();

      setComments([...comments, { ...data, comment_text: comment }]);

      setComment(""); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ 
      maxWidth: "600px", 
      margin: "20px auto", 
      backgroundColor: "#f4f6f9", 
      borderRadius: "10px", 
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)", 
      padding: "20px", 
      backgroundSize: "cover", 
      backgroundPosition: "center"
    }}>
      <div style={{ marginBottom: "15px", textAlign: "center" }}>
        <img
          src="post.jpg"
          alt="Post"
          style={{ width: "100%", borderRadius: "10px", maxHeight: "300px", objectFit: "cover" }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Exprimez-vous..."
          rows="3"
          style={{ width: "100%", borderRadius: "10px", padding: "10px", fontSize: "16px", border: "1px solid #ccc" }}
        />
        <button 
          onClick={analyzeComment} 
          style={{ 
            backgroundColor: "#1877f2", 
            color: "white", 
            border: "none", 
            borderRadius: "50%", 
            padding: "10px", 
            marginLeft: "10px", 
            cursor: "pointer" 
          }}
        >
          <i className="fa fa-paper-plane" style={{ fontSize: "16px" }}></i>
        </button>
      </div>

      <p style={{ textAlign: "end" }}>{comments.length} commentaires</p>
      <hr />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
        {comments.map((commentData, index) => {
          const { comment_text, ...categories } = commentData;
          const detectedCategories = Object.keys(categories).filter(
            (category) => categories[category] === 1
          );

          return (
            <div key={index} style={{ marginBottom: "10px", padding: "10px", borderRadius: "8px" }}>
              <div
                style={{
                  backgroundColor: detectedCategories.includes("toxic") ? "#f8d7da" : "#e9ecef",
                  color: detectedCategories.includes("toxic") ? "#721c24" : "#333",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                  {comment_text}
                </div>
                {/* Afficher le label seulement si des catégories sont détectées */}
                {detectedCategories.length > 0 && (
                  <small>
                    Catégories détectées
                    {detectedCategories.map((category, index) => (
                    <span key={index} className="badge bg-danger m-1">
                      {category}
                    </span>
      ))}
                  </small>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CommentForm;
