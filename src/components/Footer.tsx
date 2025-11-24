import PemiraLogos from './shared/PemiraLogos'
import '../styles/Footer.css'
import type { JSX } from 'react'

const Footer = (): JSX.Element => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <PemiraLogos size="sm" />
          </div>
          <p className="footer-tagline">
            Sistem pemilu kampus yang aman, transparan, dan modern.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Informasi</h4>
            <a href="#tentang">Tentang</a>
            <a href="/kandidat">Kandidat</a>
            <a href="/jadwal">Jadwal Pemilu</a>
          </div>
          <div className="footer-column">
            <h4>Bantuan</h4>
            <a href="/panduan">Tutorial Voting</a>
            <a href="#faq">FAQ</a>
            <a href="/panduan">Lokasi TPS</a>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <a href="#privacy">Kebijakan Privasi</a>
            <a href="#terms">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 PEMIRA UNIWA. All rights reserved.</p>
        <div className="footer-contact">
          <span>📞 Hotline Panitia: 0800-123-456</span>
          <span>📧 pemira@uniwa.ac.id</span>
        </div>
        <div className="footer-credits">
          <a href="https://noahis.me" target="_blank" rel="noopener noreferrer" className="web-dev-credit">
            web dev: noahis.me
          </a>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
