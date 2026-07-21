import { useState, useEffect } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function TermsOfService({ onNavigate }) {

  const { user } = useAuth();

  const [catform, setCatForm] = useState({ catname: "", catdesc: "", catauthor: user.id});
  const [status, setStatus] = useState("");

  // Submit Form Values to Server Side

  const handleChange = (e) => {
    setCatForm({ ...catform, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catform),
      });
      const data = await res.json();
      setStatus(res.ok ? "Category Added!" : data.error || "Something went wrong");
      window.location.reload()

    } catch {
      setStatus("Network error");
    }
  };



  if (user.username == 'admin') {

      return (
        <div className="page-content">

                  <div className="admin-card">
                    <div className="admin-header">

                        <h1 className="general-heading">Admin Settings</h1>
                        <hr></hr>
                        <br></br>
                        <h3>
                          <b>This page is for owners / administrators to manage various features of the forum site.</b>
                        </h3>
                        <br></br>
                        <p>For Developers, this is the page where you will want your additional functions on settings to appear
                        </p>
                        <br></br>
                        <hr></hr>
                        <br></br>
                    </div>
                  </div>

                  <div className="admin-card">
                    <div className="admin-content">
                        <h2><b> Add / Remove Categories </b></h2>
                        <br></br>
                        <p> Categories are the Green Section Names on the Home Page (ie.. INFORMATION, GAMEPLAY, COMMUNITY). 
                          From here you are able to add / remove categories. If you choose to remove a category on the backend, be sure to remove any rows under it in other tables
                          (topics, threads, posts) </p>
                        <br></br>
                        <p> + Add Categories </p>

                        <form id="addcat-form" onSubmit={handleSubmit} noValidate>

                          <div className="form-group">
                              <label htmlFor="catname">Category Name</label>
                              <input type="text" id="catname" name="catname" value= {catform.catname}
                                  placeholder="Enter the Category Name" autoComplete="catname" onChange={handleChange} required />
                          </div>

                          <div className="form-group">
                              <label htmlFor="catdesc">Category Description</label>
                              <input type="text" id="catdesc" name="catdesc" value={catform.catdesc}
                                  placeholder="Enter the Category Description" autoComplete="catdesc" onChange={handleChange} required />
                          </div>

                          <div className="form-group" id="hidden">
                              <label htmlFor="catauthor"></label>
                              <input type="number" id="catauthor" name="catauthor" value={catform.catauthor}
                                  placeholder="Enter the Category Description" autoComplete="catauthor" required />
                          </div>

                          <button type="submit" className="btn">Add Category</button>

                        </form>

                        <br></br>
                        <p> - Remove Categories </p>
                        <br></br>
                        <hr></hr>
                        <br></br>
                        <h2><b> Add / Remove Topics </b></h2>
                        <br></br>
                        <p> Topics are the white Sections assigned to a category on the Home Page (ie.. Announcements, Rules & Guidelines, General Discussion, etc...).
                          From here you are able to add / remove topics. If you choose to remove a topic on the backend, be sure to remove any rows under it in other tables
                          (threads, posts)
                        </p>
                        <br></br>
                        <hr></hr>
                        <br></br>
                        <h2><b> Ban Users from Forum</b></h2>
                        <br></br>
                        <p> Here you will be able to ban Specific Users from Interacting on the Forums </p>
                        <br></br>
                        <hr></hr>
                        <br></br>


                        <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>
                    </div>
                  </div>

            </div>
      )
  } else {
    return (
        <div className="page-content">

                  <div className="auth-container">
                    <div className="policy-card">

                      <h1 className="general-heading">Unauthorized User - Page Not Permitted</h1>
                      <hr></hr>
                      <br></br>
                 

                      <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>

                    </div>
                  </div>

            </div>
      )

  }
}