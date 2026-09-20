const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

const themeStylesheet = document.createElement('link');
themeStylesheet.rel = 'stylesheet';
themeStylesheet.href = 'theme.css';
document.head.appendChild(themeStylesheet);

const platformBar = document.querySelector('.platform-bar');
if (platformBar) {
  const themeToggle = document.createElement('button');
  themeToggle.className = 'theme-toggle';
  themeToggle.type = 'button';
  themeToggle.setAttribute('aria-label', 'Aktifkan mode gelap');
  themeToggle.title = 'Ubah mode tampilan';
  platformBar.insertBefore(themeToggle, document.querySelector('.menu-toggle'));

  const applyTheme = (isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
    themeToggle.textContent = isDark ? '☀' : '◐';
    themeToggle.setAttribute('aria-label', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
  };

  applyTheme(localStorage.getItem('pem-theme') === 'dark');
  themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    localStorage.setItem('pem-theme', isDark ? 'dark' : 'light');
    applyTheme(isDark);
  });
}

const trainerHeader = document.querySelector('.trainer-screen-top');
if (trainerHeader) {
  const trainerHeaderLabel = trainerHeader.querySelector('span:nth-child(2)');
  if (trainerHeaderLabel) trainerHeaderLabel.textContent = 'HEART RATE MONITOR · MODE SIMULASI';

  const trainerWave = document.querySelector('.trainer-wave');
  if (trainerWave) {
    const chartLabel = document.createElement('p');
    chartLabel.className = 'trainer-chart-label';
    chartLabel.textContent = 'TREN DETAK JANTUNG · 60 DETIK TERAKHIR · BPM';
    trainerWave.insertAdjacentElement('beforebegin', chartLabel);
    trainerWave.setAttribute('aria-label', 'Grafik tren detak jantung contoh dalam BPM');
    trainerWave.innerHTML = '<path d="M0 45H800M0 105H800M0 165H800M80 0V250M180 0V250M280 0V250M380 0V250M480 0V250M580 0V250M680 0V250" fill="none" stroke="#376b83" stroke-width="1"/><path d="M0 128 L55 122 L110 132 L165 116 L220 124 L275 111 L330 118 L385 102 L440 115 L495 108 L550 121 L605 113 L660 127 L715 106 L770 117 L800 111" fill="none" stroke="#54e1cb" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="10" y="34" fill="#8fb7c5" font-size="13" font-family="monospace">80</text><text x="10" y="96" fill="#8fb7c5" font-size="13" font-family="monospace">75</text><text x="10" y="156" fill="#8fb7c5" font-size="13" font-family="monospace">70</text><text x="10" y="222" fill="#8fb7c5" font-size="13" font-family="monospace">65 BPM</text>';
  }

  const trainerGrid = document.querySelector('.trainer-grid');
  if (trainerGrid) {
    trainerGrid.classList.add('heart-only');
    trainerGrid.innerHTML = '<div><span>HEART RATE</span><strong>72 <small>bpm</small></strong></div><div><span>STATUS DATA</span><strong>DEMO <small>SIM</small></strong></div>';
  }

  const connectButton = document.createElement('button');
  connectButton.className = 'connect-button';
  connectButton.type = 'button';
  connectButton.textContent = 'Connect Smartwatch';
  connectButton.setAttribute('aria-label', 'Hubungkan smartwatch melalui Bluetooth');
  trainerHeader.insertBefore(connectButton, trainerHeader.querySelector('.trainer-status'));

  const connectMessage = document.createElement('p');
  connectMessage.className = 'connect-message';
  connectMessage.setAttribute('aria-live', 'polite');
  trainerHeader.parentElement.appendChild(connectMessage);

  const trainerMeta = document.createElement('p');
  trainerMeta.className = 'trainer-meta';
  trainerMeta.innerHTML = 'SUMBER DATA: <strong>SIMULASI PEMBELAJARAN</strong> · PEMBARUAN TERAKHIR: <strong id="trainer-updated">BELUM ADA</strong>';
  connectMessage.insertAdjacentElement('afterend', trainerMeta);
  const updateTrainerTime = () => {
    const target = document.querySelector('#trainer-updated');
    if (target) target.textContent = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
  };
  updateTrainerTime();

  let bluetoothDevice;

  const showDisconnected = (message) => {
    trainerHeader.querySelector('.trainer-status').textContent = 'BELUM TERHUBUNG';
    connectButton.textContent = 'Connect Smartwatch';
    connectMessage.textContent = message;
  };

  connectButton.addEventListener('click', async () => {
    if (bluetoothDevice?.gatt?.connected) {
      bluetoothDevice.gatt.disconnect();
      showDisconnected('Koneksi smartwatch diputuskan.');
      return;
    }

    if (!navigator.bluetooth) {
      connectMessage.textContent = 'Browser ini belum mendukung Web Bluetooth. Gunakan Google Chrome atau Microsoft Edge melalui HTTPS atau localhost.';
      return;
    }

    try {
      connectButton.textContent = 'Mencari perangkat…';
      connectMessage.textContent = 'Pilih ADVAN S2A pada jendela Bluetooth browser.';
      bluetoothDevice = await navigator.bluetooth.requestDevice({ acceptAllDevices: true, optionalServices: ['heart_rate', 'battery_service', 'device_information'] });
      bluetoothDevice.addEventListener('gattserverdisconnected', () => showDisconnected('Koneksi smartwatch terputus.'));
      const server = await bluetoothDevice.gatt.connect();
      updateTrainerTime();
      trainerHeader.querySelector('.trainer-status').textContent = `TERHUBUNG: ${bluetoothDevice.name || 'SMARTWATCH'}`;
      connectButton.textContent = 'Disconnect';
      try {
        const services = await server.getPrimaryServices();
        const serviceNames = services.map((service) => service.uuid).slice(0, 3).join(', ');
        connectMessage.textContent = serviceNames
          ? `Smartwatch terhubung. Layanan BLE terdeteksi: ${serviceNames}. Pembacaan data akan ditambahkan setelah karakteristik sensor diketahui.`
          : 'Smartwatch terhubung. Belum ada layanan BLE yang terdeteksi untuk pembacaan data.';
      } catch {
        connectMessage.textContent = 'Smartwatch terhubung. Layanan BLE belum dapat dibaca; UUID sensor masih perlu diidentifikasi.';
      }
    } catch (error) {
      showDisconnected(error.name === 'NotFoundError' ? 'Tidak ada perangkat yang dipilih.' : `Koneksi belum berhasil: ${error.message}`);
    }
  });
}

if (window.location.pathname.endsWith('asisten-ai.html')) {
  const aiChatStylesheet = document.createElement('link');
  aiChatStylesheet.rel = 'stylesheet';
  aiChatStylesheet.href = 'ai-chat.css';
  document.head.appendChild(aiChatStylesheet);
  const aiMain = document.querySelector('main');
  if (aiMain) {
    aiMain.className = 'ai-chat-page';
    aiMain.innerHTML = `<section class="ai-chat-head"><div class="ai-chat-title"><span class="ai-avatar">AI</span><div><h1>Asisten Pembelajaran</h1><p>Praktik Elektronika Medis · PTE UNY</p></div></div><span class="ai-pending">Dalam pengembangan</span></section><section class="chat-stream"><div class="chat-welcome"><h2>Apa yang ingin Anda pelajari?</h2><p>Asisten ini direncanakan membantu pembelajaran instrumentasi dan elektronika medis.</p></div><article class="chat-message user"><div class="message-bubble"><p>Bagaimana fungsi pengkondisi sinyal pada sistem instrumentasi medis?</p></div><span class="message-avatar">M</span></article><article class="chat-message"><span class="message-avatar">AI</span><div class="message-bubble"><p>Pengkondisi sinyal digunakan untuk menyesuaikan sinyal dari sensor agar dapat diproses oleh sistem berikutnya, misalnya melalui penguatan, penyaringan noise, atau penyesuaian level tegangan.</p><p>Contoh percakapan ini hanya tampilan antarmuka. Fitur AI belum diaktifkan.</p></div></article><div class="suggestion-row"><button class="suggestion" type="button">Konsep sensor PPG</button><button class="suggestion" type="button">Dasar ECG</button><button class="suggestion" type="button">Prosedur keselamatan</button></div></section><section class="chat-composer-wrap"><form class="chat-composer" id="ai-chat-form"><textarea id="ai-chat-input" rows="1" placeholder="Tulis pertanyaan tentang materi praktikum…" aria-label="Pertanyaan untuk asisten pembelajaran"></textarea><button class="chat-send" aria-label="Kirim pertanyaan" type="submit">↑</button></form><p class="chat-notice" id="ai-chat-notice">Asisten AI masih dalam tahap pengembangan dan belum memberikan jawaban otomatis.</p></section>`;
    document.querySelectorAll('.suggestion').forEach((button) => button.addEventListener('click', () => { document.querySelector('#ai-chat-input').value = button.textContent; }));
    document.querySelector('#ai-chat-form').addEventListener('submit', (event) => { event.preventDefault(); document.querySelector('#ai-chat-notice').textContent = 'Pesan belum dikirim karena layanan Asisten AI belum diimplementasikan.'; });
  }
}

if (toggle && nav) toggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

const reportForm = document.querySelector('#report-form');
const reportFile = document.querySelector('#report-file');
const selectedFile = document.querySelector('#selected-file');
const uploadStatus = document.querySelector('#upload-status');
const dropzone = document.querySelector('.upload-dropzone');
let selectedReportFile;

function showSelectedFile(file) {
  if (!file) return;
  selectedReportFile = file;
  const sizeMb = (file.size / 1024 / 1024).toFixed(2);
  selectedFile.textContent = `Berkas dipilih: ${file.name} (${sizeMb} MB)`;
  uploadStatus.textContent = '';
}

if (reportFile) reportFile.addEventListener('change', () => showSelectedFile(reportFile.files[0]));

['dragenter', 'dragover'].forEach((eventName) => {
  if (dropzone) dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.add('dragover'); });
});

['dragleave', 'drop'].forEach((eventName) => {
  if (dropzone) dropzone.addEventListener(eventName, (event) => { event.preventDefault(); dropzone.classList.remove('dragover'); });
});

if (dropzone) dropzone.addEventListener('drop', (event) => showSelectedFile(event.dataTransfer.files[0]));

if (reportForm) reportForm.addEventListener('submit', (event) => {
  event.preventDefault();
  uploadStatus.textContent = selectedReportFile
    ? 'Berkas telah disiapkan. Pengiriman ke sistem dosen akan tersedia pada tahap pengembangan berikutnya.'
    : 'Silakan pilih berkas laporan terlebih dahulu.';
});

const readinessQuiz = document.querySelector('#readiness-quiz');
if (readinessQuiz) readinessQuiz.addEventListener('submit', (event) => {
  event.preventDefault();
  const answers = new FormData(readinessQuiz);
  const score = ['safety', 'signal', 'report'].reduce((total, name) => total + (answers.get(name) === 'correct' ? 1 : 0), 0);
  document.querySelector('#quiz-result').textContent = `Hasil latihan: ${score}/3 jawaban tepat. Hasil ini hanya latihan awal dan belum disimpan.`;
});
