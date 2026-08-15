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
                  <h3><b>4. Your content and license</b></h3>
                  <br></br>
                  <p><b>4.1.</b> <b>You own your content.</b> You retain ownership of the posts, images, and other material you submit ("User Content").</p>
                  <br></br>
                  <p><b>4.2.</b> <b>License to us.</b> By posting User Content, you grant us a non-exclusive, worldwide, royalty-free license to host, store, display, 
                  reproduce, and distribute that content for the purpose of operating and promoting the Forum. This license ends when you delete your content, 
                  except for copies retained in backups or where others have already quoted or shared it.</p>
                  <br></br>
                  <p><b>4.3.</b> <b>Your responsibilities.</b> You represent that you have the rights to post your User Content and that it does not violate these Terms or any law.</p>
                  <br></br>
                  <p><b>4.4.</b> <b>No obligation to host.</b> We may remove or refuse any User Content at our discretion, but we are not obligated to monitor everything posted.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>5. Intellectual property and trademarks</b></h3>
                  <br></br>
                  <p><b>5.1.</b> The Forum software is open source and distributed under its own license 
                  ([SOFTWARE LICENSE NAME, e.g. MIT / AGPL-3.0] — see [LINK]). Nothing in these Terms restricts your rights under that software license. 
                  These Terms govern your use of this hosted instance, not the underlying code.</p>
                  <br></br>
                  <p><b>5.2.</b> Our name, logo, and branding belong to [OPERATOR] and may not be used without permission.</p>
                  <br></br>
                  <p><b>5.3.</b> <b>Not affiliated with game publishers.</b> [FORUM NAME] is an independent, fan-run community. We are not affiliated with, 
                  endorsed by, or sponsored by Mojang Studios, Microsoft (the makers of Minecraft), Hypixel Studios, Riot Games (associated with Hytale), 
                  or any other game publisher. Minecraft, Hytale, and related names and logos are trademarks of their respective owners.</p>
                  <br></br>
                  <p><b>5.4.</b> When discussing or sharing game-related content (servers, mods, maps, etc.), you are responsible for complying with the relevant 
                  publisher's terms, EULA, and brand/usage guidelines.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>6. Moderation and enforcement</b></h3>
                  <br></br>
                  <p><b>6.1.</b> Moderators and administrators may edit, hide, lock, or remove content and may warn, suspend, or ban accounts for violations of 
                  these Terms or the community rules.</p>
                  <br></br>
                  <p><b>6.2.</b> We aim to apply rules fairly, but moderation decisions are ultimately at our discretion.</p>
                  <br></br>
                  <p><b>6.3.</b> Serious violations — especially anything involving child safety, threats of violence, or illegal activity — may be reported to 
                  law enforcement or relevant authorities.</p>
                  <br></br>
                  <p><b>6.4.</b> If you believe a moderation action was a mistake, you may appeal by contacting [CONTACT EMAIL / APPEAL CHANNEL].</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>7. Reporting content</b></h3>
                  <br></br>
                  <p>If you see content that violates these Terms, please report it using [REPORT FEATURE / EMAIL]. To report a copyright concern, 
                  include enough detail to identify the work and the allegedly infringing post, and send it to [DMCA / COPYRIGHT CONTACT].</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>8. Third-party links and services</b></h3>
                  <br></br>
                  <p>The Forum may contain links to third-party sites, game servers, or services we do not control. We are not responsible for their content, 
                  practices, or safety. Use them at your own risk and review their terms.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>9. Privacy</b></h3>
                  <br></br>
                  <p>Your use of the Forum is also governed by our Privacy Policy, which explains what data we collect and how we use it. Please review it.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>10. Disclaimers</b></h3>
                  <br></br>
                  <p>The Forum is provided "as is" and "as available," without warranties of any kind, whether express or implied, including fitness for a 
                  particular purpose, accuracy, or non-infringement. We do not guarantee that the Forum will be uninterrupted, secure, or error-free, or that any 
                  content posted by users is accurate or reliable.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>11. Limitation of liability</b></h3>
                  <br></br>
                  <p>To the maximum extent permitted by law, [OPERATOR] and its contributors and moderators will not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages, or any loss of data, goodwill, or other intangible losses, arising from your use of the Forum. Where liability 
                  cannot be excluded, it is limited to the maximum extent allowed by law. Some jurisdictions do not allow certain limitations, so parts of this section 
                  may not apply to you.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>12. Indemnification</b></h3>
                  <br></br>
                  <p>You agree to indemnify and hold harmless [OPERATOR], its contributors, and its moderators from any claims, damages, or expenses arising out of 
                  your User Content, your use of the Forum, or your violation of these Terms or any law.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>13. Termination</b></h3>
                  <br></br>
                  <p><b>13.1.</b> You may stop using the Forum and delete your account at any time.</p>
                  <br></br>
                  <p><b>13.2.</b> We may suspend or terminate your access at any time, with or without notice, for violations of these Terms or to protect the community.</p>
                  <br></br>
                  <p><b>13.3.</b> Sections that by their nature should survive termination (including content license for already-shared content, disclaimers, 
                  limitation of liability, and indemnification) continue to apply.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>14. Changes to these Terms</b></h3>
                  <br></br>
                  <p>We may update these Terms from time to time. If we make material changes, we will provide reasonable notice (for example, a notice on the Forum 
                  or by email). Your continued use after changes take effect means you accept the updated Terms.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>15. Governing law and disputes</b></h3>
                  <br></br>
                  <p>These Terms are governed by the laws of [JURISDICTION / COUNTRY / STATE], without regard to conflict-of-law rules. Any disputes will be handled 
                  in the courts of [VENUE], unless your local law gives you the right to bring claims elsewhere.</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <h3><b>16. Contact</b></h3>
                  <br></br>
                  <p>Questions about these Terms? Contact us at:</p>
                  <br></br>
                  <p><b>[OPERATOR NAME]</b></p>
                  <p>[CONTACT EMAIL]</p>
                  <p>[OPTIONAL: mailing address / Discord / support link]</p>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <p><i>This document is a community template provided with the [FORUM SOFTWARE NAME] open-source project. It is not legal advice. 
                  Operators are responsible for ensuring their Terms comply with the laws that apply to them and their users.</i></p>
                  <br></br>




                  

                  <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>

                </div>
              </div>

        </div>
  )
}
