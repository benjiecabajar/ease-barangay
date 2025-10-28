import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing-page.css';
import logo from '../assets/logo.png';
import { FaBullhorn, FaFileContract, FaExclamationTriangle, FaCalendarAlt, FaUserPlus, FaUserCheck, FaComments, FaArrowUp } from 'react-icons/fa';

const LandingPage = () => {
    const [openFaq, setOpenFaq] = useState(null);
    const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
            }
        );

        const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
        elementsToAnimate.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsBackToTopVisible(true);
            } else {
                setIsBackToTopVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="landing-page">
            <header className="landing-header">
                <div className="landing-logo">
                    <img src={logo} alt="Ease Barangay Logo" />
                    <span>Ease Barangay</span>
                </div>
                <nav className="landing-nav">
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/admin-login" className="nav-link">Admin Portal</Link>
                    <Link to="/sign-in" className="nav-link cta-button">Sign Up</Link>
                </nav>
            </header>

            <main>
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Connecting Your Community, Simplifying Services.</h1>
                        <p>Welcome to Ease Barangay, your one-stop digital portal for all local government needs. Stay informed, request documents, and engage with your community like never before.</p>
                        <Link to="/login" className="hero-cta">Get Started</Link>
                    </div>
                </section>

                <section className="features-section">
                    <h2 className="animate-on-scroll">Key Features</h2>
                    <div className="features-grid">
                        <div className="feature-card animate-on-scroll">
                            <FaBullhorn className="feature-icon" />
                            <h3>Stay Informed</h3>
                            <p>Receive real-time announcements and updates directly from your barangay officials.</p>
                        </div>
                        <div className="feature-card animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
                            <FaFileContract className="feature-icon" />
                            <h3>Effortless Documents</h3>
                            <p>Request barangay clearances, certificates, and other documents online, anytime.</p>
                        </div>
                        <div className="feature-card animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
                            <FaExclamationTriangle className="feature-icon" />
                            <h3>Community Reporting</h3>
                            <p>Easily report local issues, from infrastructure problems to safety concerns.</p>
                        </div>
                        <div className="feature-card animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
                            <FaCalendarAlt className="feature-icon" />
                            <h3>Event Calendar</h3>
                            <p>Keep track of all community events, meetings, and important dates in one place.</p>
                        </div>
                    </div>
                </section>

                <section className="value-prop-section">
                    <h2 className="animate-on-scroll">Why Choose Ease Barangay?</h2>
                    <p className="value-prop-subtitle animate-on-scroll" style={{ transitionDelay: '0.1s' }}>We bridge the gap between residents and local governance through technology, fostering a more connected, transparent, and responsive community.</p>
                    <div className="benefits-grid">
                        <div className="benefit-item animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
                            <FaUserCheck className="benefit-icon" />
                            <h3>Empowerment</h3>
                            <p>Gives residents a direct line to their local government, making their voices heard.</p>
                        </div>
                        <div className="benefit-item animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
                            <FaComments className="benefit-icon" />
                            <h3>Engagement</h3>
                            <p>Fosters a stronger community through shared information and easier communication.</p>
                        </div>
                        <div className="benefit-item animate-on-scroll" style={{ transitionDelay: '0.4s' }}>
                            <FaUserPlus className="benefit-icon" />
                            <h3>Accessibility</h3>
                            <p>Provides easy access to essential services for all residents, from anywhere.</p>
                        </div>
                    </div>
                </section>

                <section className="testimonials-section">
                    <h2 className="animate-on-scroll">What Our Users Say</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial-card animate-on-scroll">
                            <p className="testimonial-quote">"Requesting my barangay clearance used to take half a day. With Ease Barangay, I did it in minutes from home. A total game-changer!"</p>
                            <span className="testimonial-author">- Blazy Baby Llanera</span>
                        </div>
                        <div className="testimonial-card animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
                            <p className="testimonial-quote">"I love getting updates directly on my phone. I feel more connected and informed about what's happening in our community."</p>
                            <span className="testimonial-author">- Marky Anthonio Talan</span>
                        </div>
                        <div className="testimonial-card animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
                            <p className="testimonial-quote">"Reporting the broken street light was so easy. The maintenance team fixed it the next day. It's great to see such quick responses."</p>
                            <span className="testimonial-author">- Jeyb Aba</span>
                        </div>
                    </div>
                </section>

                <section className="faq-section">
                    <h2 className="animate-on-scroll">Frequently Asked Questions</h2>
                    <div className="faq-container">
                        <div className={`faq-item animate-on-scroll ${openFaq === 0 ? 'open' : ''}`}>
                            <button className="faq-question" onClick={() => toggleFaq(0)}>
                                Is my data secure?
                                <span className={`faq-icon ${openFaq === 0 ? 'open' : ''}`}>+</span>
                            </button>
                            <div className="faq-answer">
                                <p>Absolutely. We use modern security practices to ensure your personal information is protected and handled with the utmost care, in compliance with data privacy laws.</p>
                            </div>
                        </div>
                        <div className={`faq-item animate-on-scroll ${openFaq === 1 ? 'open' : ''}`} style={{ transitionDelay: '0.1s' }}>
                            <button className="faq-question" onClick={() => toggleFaq(1)}>
                                How much does it cost to use the platform?
                                <span className={`faq-icon ${openFaq === 1 ? 'open' : ''}`}>+</span>
                            </button>
                            <div className="faq-answer">
                                <p>Ease Barangay is free for all residents. Fees for document requests follow the official barangay rates, with no extra platform charges.</p>
                            </div>
                        </div>
                        <div className={`faq-item animate-on-scroll ${openFaq === 2 ? 'open' : ''}`} style={{ transitionDelay: '0.2s' }}>
                            <button className="faq-question" onClick={() => toggleFaq(2)}>
                                What documents can I request online?
                                <span className={`faq-icon ${openFaq === 2 ? 'open' : ''}`}>+</span>
                            </button>
                            <div className="faq-answer">
                                <p>You can request common documents such as Barangay Clearance, Certificate of Indigency, and Business Permits. The available documents may vary by barangay.</p>
                            </div>
                        </div>
                        <div className={`faq-item animate-on-scroll ${openFaq === 3 ? 'open' : ''}`} style={{ transitionDelay: '0.3s' }}>
                            <button className="faq-question" onClick={() => toggleFaq(3)}>
                                Can I report a problem with the platform?
                                <span className={`faq-icon ${openFaq === 3 ? 'open' : ''}`}>+</span>
                            </button>
                            <div className="faq-answer">
                                <p>Yes, please feel free to contact us if you encounter any issues. Our support team is here to help.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="team-section">
                    <h2 className="animate-on-scroll">Meet Our Team</h2>
                    <p className="team-subtitle animate-on-scroll" style={{ transitionDelay: '0.1s' }}>The passionate individuals dedicated to bringing local governance closer to you.</p>
                    <div className="team-grid">
                        <div className="team-member-card animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
                            <h4>Benjie Cabajar</h4>
                            <p className="team-member-role">Full-Stack Developer</p>
                            <p className="team-member-bio">"Fueled by a passion for community empowerment, I envisioned a platform that makes local services accessible to everyone."</p>
                        </div>
                        <div className="team-member-card animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
                            <h4>Justin Alba</h4>
                            <p className="team-member-role">Database Management</p>
                            <p className="team-member-bio">"Responsible for the robust and secure database architecture that powers the platform's data."</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-info">
                        <h3>Ease Barangay</h3>
                        <p>Connecting communities, one barangay at a time. Our platform simplifies access to local services and enhances communication between residents and officials.</p>
                        <p>Zone 7 Calalahan, Agusan, Cagayan de Oro City, 9000</p>
                        <p>benjiejhonaumentarcabajar@gmail.com | (+63) 970-0439-304 </p>
                    </div>
                    <div className="footer-form">
                        <h3>Contact Us</h3>
                        <form>
                            <input type="text" name="name" placeholder="Your Name" required />
                            <input type="email" name="email" placeholder="Your Email" required />
                            <textarea name="message" placeholder="Your Message" rows="4" required></textarea>
                            <button type="submit" className="hero-cta">Send Message</button>
                        </form>
                    </div>
                </div>
                <div className="footer-bottom">&copy; 2024 Ease Barangay. All Rights Reserved.</div>
            </footer>

            {isBackToTopVisible && (
                <button onClick={scrollToTop} className="back-to-top-btn">
                    <FaArrowUp />
                </button>
            )}
        </div>
    );
};

export default LandingPage;