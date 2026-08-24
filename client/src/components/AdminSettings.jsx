import { useState, useEffect } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function TermsOfService({ onNavigate }) {

  const { user } = useAuth();

  const [catform, setCatForm] = useState({ catname: "", catdesc: "", catauthor: user.id});
  const [topform, setTopForm] = useState({ topname: "", topdesc: "", topcat: "", topicon: "💬", topcolor: "#4CAF50", topauthor: user.id});
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("");
  const [hexDraft, setHexDraft] = useState(topform.topcolor);

  const capitalize = str => str[0].toUpperCase() + str.slice(1);


  //Handle Hex inputting
  // Swatch picker: always a valid value, so commit it straight through
  const handleColorPick = (e) => {
    setHexDraft(e.target.value);
    handleChange(e);            // name="topcolor" routes to topform already
  };

  // Typing: keep the draft freely editable, commit only when it's complete
  const handleHexType = (e) => {
    let value = e.target.value.trim();
    if (value && !value.startsWith("#")) value = "#" + value;
    setHexDraft(value);

    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setTopForm(prev => ({ ...prev, topcolor: value.toLowerCase() }));
    }
  };

  // Leaving the field: expand shorthand, or roll back a half-typed value
  const handleHexBlur = () => {
    const expanded = /^#[0-9a-fA-F]{3}$/.test(hexDraft)
      ? "#" + hexDraft.slice(1).split("").map(c => c + c).join("")
      : hexDraft;

    if (/^#[0-9a-fA-F]{6}$/.test(expanded)) {
      setTopForm(prev => ({ ...prev, topcolor: expanded.toLowerCase() }));
      setHexDraft(expanded.toLowerCase());
    } else {
      setHexDraft(topform.topcolor);
    }
  };



  //Load Categories to list in dropdown for add Topic

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("http://localhost:3001/api/categories");
        const data = await res.json();
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setStatus("Could not load categories");
      }
    })();

    return () => { cancelled = true; };
  }, []);



  // Submit Form Values to Server Side

  const handleChange = (e) => {

    setCatForm({ ...catform, [e.target.name]: e.target.value });
    if (e.target.name.substring(0,3) == "cat"){
       setCatForm({ ...catform, [e.target.name]: e.target.value });
    }

    if (e.target.name.substring(0,3) == "top"){
       setTopForm({ ...topform, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (e.target.id.substring(0,6) == "addcat"){
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
    }

    if (e.target.id.substring(0,6) == "addtop"){
       try {
        const res = await fetch("http://localhost:3001/api/topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(topform),
        });
        const data = await res.json();
        setStatus(res.ok ? "Topic Added!" : data.error || "Something went wrong");
        window.location.reload()

      } catch {
        setStatus("Network error");
      }
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
                                  placeholder="Enter Author ID" autoComplete="catauthor" required />
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
                        <p> + Add Topics </p>

                        <form id="addtop-form" onSubmit={handleSubmit} noValidate>

                          <div className="form-group">
                              <label htmlFor="topname">Topic Name</label>
                              <input type="text" id="topname" name="topname" value= {topform.topname}
                                  placeholder="Enter the Topic Name" autoComplete="topname" onChange={handleChange} required />
                          </div>

                          <div className="form-group">
                              <label htmlFor="catdesc">Topic Description</label>
                              <input type="text" id="topdesc" name="topdesc" value={topform.topdesc}
                                  placeholder="Enter the Topic Description" autoComplete="topdesc" onChange={handleChange} required />
                          </div>

                          <div className="form-group">
                              <label htmlFor="topcat">Category</label>
                              <select id="topcat" name="topcat" value={topform.topcat}
                                  onChange={handleChange} required>
                                <option value="" disabled>
                                  {categories.length ? "Choose a category" : "No categories yet"}
                                </option>
                                {categories.map((cat) => (
                                  <option key={cat.id} value={cat.id}>{capitalize(cat.name)}</option>
                                ))}
                              </select>
                          </div>

                          <div className="form-group">
                              <label htmlFor="topicon">Icon</label>
                              <select id="topicon" name="topicon" value={topform.topicon}
                                  onChange={handleChange} required>
                                <option value="" disabled>
                                  {categories.length ? "Choose an icon" : "No icon yet"}
                                </option>
                                <option key="a" value="💬">💬</option>
                                <option key="b" value="🔧">🔧</option>
                                <option key="c" value="🔌">🔌</option>
                                <option key="d" value="🏗️">🏗️</option>
                                <option key="e" value="👋">👋</option>
                                <option key="f" value="💼">💼</option>
                                <option key="g" value="📢">📢</option>
                                <option key="h" value="📋">📋</option>
                              </select>
                          </div>

                          <div className="form-group">
                              <label htmlFor="topcolor">Accent Color</label>
                              <div className="color-row">
                                <input type="color" id="topcolor" name="topcolor" value={topform.topcolor}
                                    onChange={handleColorPick} />
                                <input type="text" id="topcolor-hex" name="topcolor-hex" value={hexDraft}
                                    onChange={handleHexType} onBlur={handleHexBlur}
                                    placeholder="#4CAF50" maxLength={7} spellCheck={false}
                                    aria-label="Accent color hex code" />
                              </div>
                          </div>

                          <div className="form-group" id="hidden">
                              <label htmlFor="topauthor"></label>
                              <input type="number" id="topauthor" name="topauthor" value={topform.topauthor}
                                  placeholder="Enter Author ID" autoComplete="topauthor" required />
                          </div>

                          <button type="submit" className="btn">Add Topic</button>

                        </form>

                        <br></br>
                        <p> - Remove Topics </p>
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