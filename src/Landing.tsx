import { useEffect } from 'react';

function Landing() {

  useEffect(() => {
    // Inject styles
    const styleId = 'landing-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Landing Page Styles with Brown Color Scheme */
        :root {
            --primary: #8B6F47;
            --primary-dark: #6B5537;
            --secondary: #D4A574;
            --dark: #1A1410;
            --dark-light: #2D2419;
            --gray: #8B7E6F;
            --light: #F5F1ED;
            --white: #FFFFFF;
            --success: #7A9B76;
            --gradient: linear-gradient(135deg, #8B6F47 0%, #D4A574 100%);
        }

        .landing-page * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .landing-page {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: var(--dark);
            background: var(--dark);
        }

        .landing-page .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* Navigation */
        .landing-page .nav-bar {
            background: rgba(26, 20, 16, 0.9);
            backdrop-filter: blur(10px);
            padding: 20px 0;
            position: sticky;
            top: 0;
            z-index: 1000;
            border-bottom: 1px solid rgba(139, 111, 71, 0.2);
        }

        .landing-page .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .landing-page .logo {
            font-size: 24px;
            font-weight: 800;
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .landing-page .nav-links {
            display: flex;
            gap: 30px;
            align-items: center;
        }

        .landing-page .nav-links a {
            color: var(--light);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }

        .landing-page .nav-links a:hover {
            color: var(--primary);
        }

        .landing-page .btn-nav {
            background: var(--gradient);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .landing-page .btn-nav:hover {
            transform: translateY(-2px);
        }

        /* Hero Section */
        .landing-page .hero {
            background: var(--dark);
            padding: 80px 0 60px;
            position: relative;
            overflow: hidden;
        }

        .landing-page .hero::before {
            content: '';
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(139, 111, 71, 0.15) 0%, transparent 70%);
            top: -200px;
            right: -200px;
            border-radius: 50%;
        }

        .landing-page .hero-content {
            position: relative;
            z-index: 1;
            text-align: center;
            max-width: 900px;
            margin: 0 auto;
        }

        .landing-page .hero h1 {
            font-size: 56px;
            font-weight: 800;
            color: white;
            margin-bottom: 20px;
            line-height: 1.2;
        }

        .landing-page .hero .highlight {
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .landing-page .hero .subtitle {
            font-size: 24px;
            color: var(--gray);
            margin-bottom: 40px;
        }

        .landing-page .hero-features {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }

        .landing-page .hero-feature {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--light);
            font-weight: 500;
        }

        .landing-page .hero-feature svg {
            color: var(--success);
        }

        .landing-page .cta-primary {
            background: var(--gradient);
            color: white;
            padding: 18px 40px;
            font-size: 18px;
            font-weight: 700;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: transform 0.2s;
            display: inline-block;
            text-decoration: none;
        }

        .landing-page .cta-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 20px 40px rgba(139, 111, 71, 0.4);
        }

        .landing-page .hero-trust {
            margin-top: 30px;
            color: var(--gray);
            font-size: 14px;
        }

        .landing-page .hero-testimonial {
            background: rgba(139, 111, 71, 0.1);
            border: 1px solid rgba(139, 111, 71, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin-top: 40px;
            color: var(--light);
            font-style: italic;
        }

        .landing-page .stars {
            color: var(--secondary);
            margin-bottom: 10px;
        }

        /* Price Comparison */
        .landing-page .price-comparison {
            background: var(--dark-light);
            padding: 80px 0;
        }

        .landing-page .section-title {
            text-align: center;
            font-size: 42px;
            font-weight: 800;
            color: white;
            margin-bottom: 50px;
        }

        .landing-page .comparison-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            max-width: 1000px;
            margin: 0 auto;
        }

        .landing-page .comparison-card {
            background: var(--dark);
            border: 2px solid rgba(139, 126, 111, 0.3);
            border-radius: 16px;
            padding: 30px;
            position: relative;
        }

        .landing-page .comparison-card.highlight {
            border-color: var(--primary);
            background: linear-gradient(135deg, rgba(139, 111, 71, 0.1) 0%, rgba(212, 165, 116, 0.1) 100%);
            transform: scale(1.05);
        }

        .landing-page .comparison-card h3 {
            color: white;
            font-size: 20px;
            margin-bottom: 10px;
        }

        .landing-page .comparison-price {
            font-size: 36px;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 10px;
        }

        .landing-page .comparison-card.highlight .comparison-price {
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .landing-page .comparison-details {
            color: var(--gray);
            font-size: 14px;
            margin-bottom: 15px;
        }

        .landing-page .comparison-badge {
            background: var(--secondary);
            color: var(--dark);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            display: inline-block;
            margin-top: 10px;
        }

        .landing-page .comparison-badge.good {
            background: var(--success);
            color: white;
        }

        /* Upload Section */
        .landing-page .upload-section {
            background: var(--dark);
            padding: 80px 0;
        }

        .landing-page .upload-box {
            max-width: 700px;
            margin: 40px auto;
            background: var(--dark-light);
            border: 3px dashed rgba(139, 111, 71, 0.5);
            border-radius: 20px;
            padding: 60px 40px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        }

        .landing-page .upload-box:hover {
            border-color: var(--primary);
            background: rgba(139, 111, 71, 0.05);
        }

        .landing-page .upload-icon {
            font-size: 60px;
            margin-bottom: 20px;
        }

        .landing-page .upload-box h3 {
            color: white;
            font-size: 28px;
            margin-bottom: 10px;
        }

        .landing-page .upload-box p {
            color: var(--gray);
            margin-bottom: 20px;
        }

        .landing-page .upload-features {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 30px;
            flex-wrap: wrap;
        }

        .landing-page .upload-feature {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--light);
            font-size: 14px;
        }

        /* Audio Player */
        .landing-page .audio-player-section {
            background: var(--dark-light);
            padding: 80px 0;
        }

        .landing-page .comparison-player {
            max-width: 900px;
            margin: 40px auto;
            background: var(--dark);
            border-radius: 20px;
            padding: 40px;
        }

        .landing-page .player-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }

        .landing-page .player-box {
            background: var(--dark-light);
            border-radius: 12px;
            padding: 25px;
        }

        .landing-page .player-box h4 {
            color: white;
            margin-bottom: 15px;
            font-size: 18px;
        }

        .landing-page .player-label {
            color: var(--gray);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }

        .landing-page .waveform {
            height: 80px;
            background: linear-gradient(to right, var(--primary), var(--secondary));
            border-radius: 8px;
            margin: 20px 0;
            position: relative;
            overflow: hidden;
        }

        .landing-page .waveform::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 10px);
        }

        .landing-page .lufs-badge {
            background: rgba(139, 111, 71, 0.2);
            color: var(--primary);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
        }

        .landing-page .play-button {
            background: var(--gradient);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 15px;
            transition: transform 0.2s;
        }

        .landing-page .play-button:hover {
            transform: translateY(-2px);
        }

        /* Testimonials */
        .landing-page .testimonials {
            background: var(--dark);
            padding: 80px 0;
        }

        .landing-page .testimonial-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }

        .landing-page .testimonial-card {
            background: var(--dark-light);
            border: 1px solid rgba(139, 111, 71, 0.2);
            border-radius: 16px;
            padding: 30px;
        }

        .landing-page .testimonial-text {
            color: var(--light);
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 20px;
        }

        .landing-page .testimonial-author {
            color: var(--gray);
            font-size: 14px;
        }

        .landing-page .testimonial-author strong {
            color: white;
            display: block;
            margin-bottom: 5px;
        }

        .landing-page .testimonial-link {
            color: var(--primary);
            text-decoration: none;
            font-size: 14px;
            margin-top: 10px;
            display: inline-block;
        }

        /* Stats */
        .landing-page .stats {
            background: var(--dark-light);
            padding: 60px 0;
        }

        .landing-page .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 40px;
            text-align: center;
        }

        .landing-page .stat-number {
            font-size: 48px;
            font-weight: 800;
            background: var(--gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }

        .landing-page .stat-label {
            color: var(--gray);
            font-size: 14px;
        }

        /* FAQ */
        .landing-page .faq {
            background: var(--dark);
            padding: 80px 0;
        }

        .landing-page .faq-list {
            max-width: 800px;
            margin: 40px auto;
        }

        .landing-page .faq-item {
            background: var(--dark-light);
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
        }

        .landing-page .faq-question {
            color: white;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .landing-page .faq-answer {
            color: var(--gray);
            line-height: 1.8;
        }

        /* Final CTA */
        .landing-page .final-cta {
            background: var(--dark);
            padding: 100px 0;
            text-align: center;
        }

        .landing-page .final-cta h2 {
            color: white;
            font-size: 42px;
            font-weight: 800;
            margin-bottom: 20px;
        }

        .landing-page .final-cta p {
            color: var(--gray);
            font-size: 20px;
            margin-bottom: 40px;
        }

        /* Footer */
        .landing-page .footer {
            background: var(--dark-light);
            padding: 40px 0;
            text-align: center;
            color: var(--gray);
        }

        .landing-page .footer-links {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 20px;
        }

        .landing-page .footer-links a {
            color: var(--gray);
            text-decoration: none;
        }

        .landing-page .footer-links a:hover {
            color: var(--primary);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .landing-page .hero h1 {
                font-size: 36px;
            }
            .landing-page .hero .subtitle {
                font-size: 18px;
            }
            .landing-page .section-title {
                font-size: 32px;
            }
            .landing-page .player-grid {
                grid-template-columns: 1fr;
            }
            .landing-page .nav-links {
                display: none;
            }
            .landing-page .testimonial-grid,
            .landing-page .comparison-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Animations */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .landing-page .fade-in {
            animation: fadeIn 0.6s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const scrollToUpload = () => {
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log('File selected:', file.name);
      alert(`Processing ${file.name}...\n\nIn production, this would:\n1. Upload to your server\n2. Process with your mastering engine\n3. Show before/after comparison\n4. Let user download`);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="container nav-container">
          <div className="logo">AIMSTR</div>
          <div className="nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#testimonials">Reviews</a>
            <button className="btn-nav" onClick={scrollToUpload}>Try Free</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content fade-in">
            <h1>
              Professional AI Mastering<br />
              <span className="highlight">100% FREE</span> (Beta)
            </h1>
            <p className="subtitle">
              🚀 <strong>We're in BETA:</strong> Free unlimited mastering while we perfect our AI!<br />
              Sound like you paid a professional engineer. Get radio-ready masters in 30 seconds.
            </p>

            <div className="hero-features">
              <div className="hero-feature">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>100% Free Beta</span>
              </div>
              <div className="hero-feature">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Unlimited Masters</span>
              </div>
              <div className="hero-feature">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No Credit Card</span>
              </div>
            </div>

            <a href="#upload" className="cta-primary">Master Your Track FREE 🚀</a>

            <p className="hero-trust">
              ✓ 100% Free during beta &nbsp;•&nbsp; ✓ No signup required &nbsp;•&nbsp; ✓ Results in 30 seconds
            </p>

            <div className="hero-testimonial">
              <div className="stars">★★★★★</div>
              <p>"Got my first track FREE, paid $2.99 for the second. Both sound like I paid $150 each. Absolutely insane."</p>
              <strong>- Marcus T., Hip-Hop Producer</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Why AIMSTR Section */}
      <section className="price-comparison">
        <div className="container">
          <h2 className="section-title">Why AIMSTR?</h2>

          <div className="comparison-grid">
            <div className="comparison-card">
              <h3>Professional Engineer</h3>
              <div className="comparison-price">$100-150</div>
              <div className="comparison-details">per track</div>
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Wait time: 2-5 days</p>
              <span className="comparison-badge">EXPENSIVE</span>
            </div>

            <div className="comparison-card">
              <h3>iZotope Ozone</h3>
              <div className="comparison-price">$249</div>
              <div className="comparison-details">one-time</div>
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Learning curve: 20+ hours</p>
              <span className="comparison-badge">COMPLICATED</span>
            </div>

            <div className="comparison-card">
              <h3>LANDR</h3>
              <div className="comparison-price">$12.99</div>
              <div className="comparison-details">per month</div>
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Limited features</p>
              <span className="comparison-badge">OVERPRICED</span>
            </div>

            <div className="comparison-card highlight">
              <h3>AIMSTR (BETA)</h3>
              <div className="comparison-price">FREE</div>
              <div className="comparison-details">unlimited masters</div>
              <p style={{ color: 'var(--light)', fontSize: '14px' }}>Results in: 30 seconds</p>
              <span className="comparison-badge good">🚀 BETA ACCESS</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <p style={{ color: 'var(--gray)', fontSize: '18px', marginBottom: '20px' }}>
              💡 Get <strong style={{ color: 'white' }}>unlimited professional masters for FREE</strong> while we're in beta
            </p>
            <a href="#upload" className="cta-primary">Start Mastering FREE</a>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="upload-section" id="upload">
        <div className="container">
          <h2 className="section-title">Upload & Master Your Track FREE 🚀</h2>

          <div className="upload-box" onClick={() => document.getElementById('fileInput')?.click()}>
            <div className="upload-icon">🎵</div>
            <h3>Drag Your Track Here</h3>
            <p>WAV, MP3, FLAC - We Handle It All</p>
            <button className="cta-primary" style={{ marginTop: '20px' }}>Click to Upload & Get FREE Master</button>
            <input type="file" id="fileInput" accept="audio/*" style={{ display: 'none' }} onChange={handleFileUpload} />
          </div>

          <div className="upload-features">
            <div className="upload-feature">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>🚀 100% FREE during beta</span>
            </div>
            <div className="upload-feature">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Unlimited masters</span>
            </div>
            <div className="upload-feature">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No signup required</span>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--gray)', marginTop: '30px' }}>
            Over <strong style={{ color: 'white' }}>5,000</strong> tracks mastered this month · <strong style={{ color: 'var(--primary)' }}>Beta access - completely free!</strong>
          </p>
        </div>
      </section>

      {/* Before/After Player */}
      <section className="audio-player-section" id="how-it-works">
        <div className="container">
          <h2 className="section-title">Hear The Difference</h2>

          <div className="comparison-player">
            <div className="player-grid">
              <div className="player-box">
                <div className="player-label">BEFORE</div>
                <h4>Your Original</h4>
                <div className="waveform"></div>
                <div className="lufs-badge">-18.5 LUFS</div>
                <p style={{ color: 'var(--gray)', marginTop: '10px' }}>Amateur Sound</p>
                <button className="play-button">▶ Play Before</button>
              </div>

              <div className="player-box">
                <div className="player-label">AFTER</div>
                <h4>Our Master</h4>
                <div className="waveform"></div>
                <div className="lufs-badge">-14.0 LUFS</div>
                <p style={{ color: 'var(--gray)', marginTop: '10px' }}>Radio-Ready</p>
                <button className="play-button">▶ Play After</button>
              </div>
            </div>

            <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
              <h4 style={{ color: 'white', marginBottom: '15px' }}>What we did:</h4>
              <ul style={{ color: 'var(--light)', lineHeight: '2', listStyle: 'none' }}>
                <li>✓ Boosted clarity in high frequencies</li>
                <li>✓ Tightened bass response</li>
                <li>✓ Optimized for Spotify/Apple Music</li>
                <li>✓ Maximized loudness without distortion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">5,247</div>
              <div className="stat-label">Beta Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">12,394</div>
              <div className="stat-label">Tracks Mastered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.8/5.0</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">28 sec</div>
              <div className="stat-label">Avg Process Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">FREE During Beta</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">$300k+</div>
              <div className="stat-label">Saved By Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <h2 className="section-title">Real Artists, Real Results</h2>

          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">
                "Completely FREE during beta. Unlimited masters. Sounds like I paid $150 each time. This is absolutely insane."
              </p>
              <div className="testimonial-author">
                <strong>Marcus T.</strong>
                Hip-Hop Producer · Beta Tester
              </div>
              <a href="#" className="testimonial-link">Listen to Marcus's Track ▶</a>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">
                "Mastered my entire 10-track album for FREE during beta. Would have cost me $1000+ at a studio. Life changing!"
              </p>
              <div className="testimonial-author">
                <strong>Sarah K.</strong>
                Indie Artist · Beta Tester
              </div>
              <a href="#" className="testimonial-link">Listen to Sarah's Album ▶</a>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">
                "30 seconds. That's all it took. I spent weeks learning Ozone and still couldn't get results this good."
              </p>
              <div className="testimonial-author">
                <strong>James P.</strong>
                Bedroom Producer
              </div>
              <a href="#" className="testimonial-link">Listen to James's Track ▶</a>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">
                "My podcast now sounds professional without hiring an audio engineer. Listeners are noticing!"
              </p>
              <div className="testimonial-author">
                <strong>Lisa M.</strong>
                Podcast Host
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">
                "Perfect for independent artists on a budget. Sounds just as good as expensive mastering services."
              </p>
              <div className="testimonial-author">
                <strong>David R.</strong>
                Singer-Songwriter
              </div>
            </div>

            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="testimonial-text">
                "Tried LANDR before AIMSTR. AIMSTR is better, and my first track was FREE. No brainer."
              </p>
              <div className="testimonial-author">
                <strong>Alex Chen</strong>
                EDM Producer
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
              Read 247 More 5-Star Reviews →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="container">
          <h2 className="section-title">Common Questions</h2>

          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">Why is AIMSTR completely free?</div>
              <div className="faq-answer">
                🚀 We're in BETA! We're perfecting our AI and need real users to help us improve.
                In exchange for your feedback, you get unlimited professional mastering for FREE.
                When we officially launch, early beta testers will get lifetime discounts!
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">Will it always be free?</div>
              <div className="faq-answer">
                During the beta period (next few months), yes - completely free unlimited masters!
                When we launch officially, we'll introduce paid plans, but all beta testers will
                get special lifetime pricing as a thank you for helping us improve.
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">What if I don't like the result?</div>
              <div className="faq-answer">
                Try a different style preset (free). Still not happy? Get a 100% refund within 30 days.
                No questions asked. We want you to love your master.
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">How does AIMSTR compare to LANDR?</div>
              <div className="faq-answer">
                Same quality mastering, but AIMSTR gives you your first track FREE, then $9.99/month (vs LANDR's $12.99/month).
                Plus, our AI is newer and learns from every track processed, constantly improving.
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">Will it work for my genre?</div>
              <div className="faq-answer">
                Yes! Our AI works for Hip-Hop, Pop, Rock, EDM, Jazz, Classical, Country, Podcast audio, and more.
                It automatically detects your genre and applies the appropriate processing.
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">What file formats do you accept?</div>
              <div className="faq-answer">
                We accept WAV, MP3, FLAC, M4A, OGG, and AIFF. Basically everything!
                Upload in any format, we'll handle it.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to Master Your Music?</h2>
          <p>
            🚀 <strong>100% FREE Beta Access</strong> - Unlimited Masters<br />
            Join 5,000+ artists getting professional masters for free
          </p>

          <a href="#upload" className="cta-primary">Start Mastering FREE 🚀</a>

          <div style={{ marginTop: '30px', color: 'var(--gray)' }}>
            <p>✓ Completely FREE during beta &nbsp;•&nbsp; ✓ Results in 30 seconds &nbsp;•&nbsp; ✓ No signup required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">API</a>
            <a href="#">Pricing</a>
            <a href="#">FAQ</a>
            <a href="#">Contact</a>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
          <p>&copy; 2024 AIMSTR. All rights reserved.</p>
          <p style={{ marginTop: '10px', fontSize: '12px' }}>
            Made with ❤️ for independent artists
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
