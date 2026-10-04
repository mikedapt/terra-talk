import { useState, useEffect } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function CreateNewThread({ topic, onNavigate }) {

  const { user, token } = useAuth();

  const [form, setForm] = useState({ threadtitle: "", threadbody: "", threadtopic: topic.id});
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit Form Values to Server Side

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/newthread", {
        method: "POST",
        headers: { "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
         setStatus(data.error || "Something went wrong");
         return;
      }
      setStatus("New Thread Created");
      setForm((f) => ({ ...f, threadtitle: "", threadbody: "" }));

    } catch {
      setStatus("Network error");
    }
  };

  return (
    <div className="page-content">

            <div className="breadcrumb">
              <button className="breadcrumb-link" onClick={() => onNavigate('home')}>Home</button>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-link" onClick={() => onNavigate('topic', { topic })}>{topic.name}</span>
              <span className="breadcrumb-sep">›</span>
              <span className="breadcrumb-current">{form.title}</span>
            </div>
        
            <div>
                <div className="newthread-box">

                    <div className="logo">
                    </div>

                    <form id="thread-form" onSubmit={handleSubmit} noValidate>


                    <h3 className="newthread-box-title">Start a Thread</h3>
                    
                    <div className="form-group">
                    <label htmlFor="threadtitle">Title</label>
                    <input className="newthread-input" type="text" id="threadtitle" name="threadtitle" value={form.threadtitle}
                           placeholder="Enter your Title" autoComplete="threadtitle" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                    <label htmlFor="threadbody">Message</label>
                    <textarea className="newthread-textarea" id="threadbody" name="threadbody" value={form.threadbody} placeholder="Write your message here..." onChange={handleChange} rows={5} />
                    <div className="newthread-box-footer">
                      <button type="submit" className="btn-submit-reply">Create Thread</button>
                    </div>
                    </div>


                    <div className="divider"></div>

                    </form>
                    {status && <p className="form-status">{status}</p>}

                    <div className="form-group">
                        <button className="btn" onClick={() => onNavigate('home')}>Return to Homepage</button>
                    </div>

                </div>
            </div>

        </div>
  )
}