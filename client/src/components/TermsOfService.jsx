import { useState, useEffect } from 'react'
import { api } from '../api';

export default function TermsOfService({ onNavigate }) {


  return (
    <div className="page-content">

              <div className="auth-container">
                <div className="policy-card">

                  <h1 className="general-heading">Terms of Service</h1>
                  <hr></hr>
                  <br></br>
                  <p><b>Template note (delete before publishing): This document is a starting template for operators self-hosting this open-source forum software. 
                    Replace every [BRACKETED] placeholder, adapt sections to your situation, and have a qualified lawyer review it before you launch. Laws differ by country 
                    and by the age of your users. This template is provided without warranty and is not legal advice.</b>
                  </p>
                  <br></br>
                  <h3>
                    <b>Effective date: [DATE] Last updated: [DATE]</b>
                  </h3>
                  <br></br>
                  <p>Welcome to [FORUM NAME] (the "Forum," "we," "us," or "our"), a community forum operated by 
                    [OPERATOR LEGAL NAME / HANDLE]. These Terms of Service ("Terms") govern your access to and use of the Forum, including any content, 
                    features, and services we make available.
                  </p>
                  <br></br>
                  <p>By creating an account, posting, or otherwise using the Forum, you agree to these Terms and to our Privacy Policy. 
                  If you do not agree, please do not use the Forum.
                  </p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>1. Eligibility and age requirements</b></h3>
                  <br></br>
                  <p><b>1.1.</b> You must be at least 13 years old to create an account or use the Forum. Some communities served by this Forum tend to include younger players, 
                  so we take this requirement seriously.</p>
                  <br></br>
                  <p><b>1.2.</b> If you are between 13 and the age of majority where you live, you confirm that a parent or legal guardian has reviewed and agreed to 
                  these Terms on your behalf.</p>
                  <br></br>
                  <p><b>1.3.</b> We do not knowingly collect personal information from anyone under 13. If we learn that an account belongs to someone under 13, we will close it and delete associated personal data. 
                  (See our Privacy Policy for how to report this.)</p>
                  <br></br>
                  <p><b>1.4.</b> If you are in the EU/EEA, UK, or another region with a higher digital-consent age, the applicable minimum age is the greater of 13 or 
                  the age set by your local law (for example, 16 in some EU member states under GDPR).</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>2. Your account</b></h3>
                  <br></br>
                  <p><b>2.1.</b> You are responsible for keeping your login credentials secure and for all activity that happens under your account.</p>
                  <br></br>
                  <p><b>2.2.</b> You agree to provide accurate registration information and to keep it reasonably up to date.</p>
                  <br></br>
                  <p><b>2.3.</b> Do not share your account, impersonate others, or create accounts to evade a ban or moderation action.</p>
                  <br></br>
                  <p><b>2.4.</b> Notify us promptly at [CONTACT EMAIL] if you believe your account has been compromised.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>3. Community rules and acceptable use</b></h3>
                  <br></br>
                  <p>You agree not to post, upload, link to, or otherwise share content that:</p>
                  <br></br>
                  <div className="center-div">
                    <div className="list-container">
                      <ul>
                        <li>harasses, bullies, threatens, or intimidates any person;</li>
                        <li>targets anyone with hateful content based on race, ethnicity, religion, nationality, disability, sex, gender identity, 
                        sexual orientation, or similar characteristics;</li>
                        <li>sexualizes minors in any way, or attempts to contact, groom, or solicit personal information from a minor — 
                        this results in an immediate permanent ban and may be reported to authorities;</li>
                        <li>shares another person's private or identifying information without consent ("doxxing");</li>
                        <li>is sexually explicit, gratuitously violent, or otherwise not safe for a general-audience gaming community;</li>
                        <li>promotes self-harm, dangerous activities, or illegal conduct;</li>
                        <li>is spam, advertising, or repetitive promotional content not permitted by the community;</li>
                        <li>contains malware, phishing links, account-stealing schemes, or fraudulent offers 
                          (including fake "free items," scam giveaways, or account-trading scams);</li>
                        <li>infringes anyone's intellectual property or other rights;</li>
                        <li>distributes cheats, hacks, exploits, or pirated game software, or facilitates breaking the rules or terms of any game or service.</li>
                      </ul>
                    </div>
                  </div>
                  <br></br>
                  <p>You also agree not to disrupt the Forum itself — for example by attempting to gain unauthorized access, scraping at abusive volumes, 
                  overloading the servers, or interfering with other users' use of the Forum.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>




                  

                  <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>

                </div>
              </div>

        </div>
  )
}