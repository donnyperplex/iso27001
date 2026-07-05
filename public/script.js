const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitBtn = form.querySelector('button');

const newChatBtn = document.getElementById('new-chat-btn');
const searchInput = document.getElementById('search-threads');
const threadsList = document.getElementById('threads-list');
const showMoreBtn = document.getElementById('show-more-threads');

// Kelola state threads dan riwayat chat dari LocalStorage
let threads = JSON.parse(localStorage.getItem('chat_threads')) || [];
let currentThreadId = localStorage.getItem('current_thread_id') || null;
let conversationHistory = [];
let displayLimit = 8; // Batasan tampilan awal daftar "Terbaru"

// Render UI sidebar di awal
renderThreads();
loadCurrentThread();

// Event: Mulai Rangkaian Pesan Baru
newChatBtn.addEventListener('click', () => {
  currentThreadId = null;
  conversationHistory = [];
  localStorage.removeItem('current_thread_id');
  chatBox.innerHTML = '';
  renderThreads();
  input.focus();
});

// Event: Pencarian Rangkaian Pesan
searchInput.addEventListener('input', () => {
  renderThreads(searchInput.value.trim());
});

// Event: Tampilkan Lebih Banyak Thread
showMoreBtn.addEventListener('click', () => {
  displayLimit += 8;
  renderThreads(searchInput.value.trim());
});

// Event: Submit Chat Form
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Inisialisasi Thread Baru jika belum aktif
  if (!currentThreadId) {
    currentThreadId = 'thread-' + Date.now();
    const newThread = {
      id: currentThreadId,
      title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : ''),
      conversation: []
    };
    threads.unshift(newThread);
    localStorage.setItem('current_thread_id', currentThreadId);
  }

  // Tampilkan pesan pengguna di UI
  appendMessage('user', userMessage);
  input.value = '';

  // Simpan ke riwayat percakapan
  conversationHistory.push({ role: 'user', text: userMessage });
  updateThreadConversation();

  // Ubah status ke loading
  setLoadingState(true);

  // Buat pesan berpikir sementara
  const thinkingWrapper = appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation: conversationHistory })
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const data = await response.json();
    
    // Hapus pesan berpikir sementara
    thinkingWrapper.remove();

    if (data.error) {
      appendMessage('bot', `ERROR: ${data.error}`);
    } else {
      // Tampilkan respons AI di UI
      appendMessage('bot', data.result);
      // Simpan respons ke riwayat
      conversationHistory.push({ role: 'model', text: data.result });
      updateThreadConversation();
    }
  } catch (error) {
    thinkingWrapper.remove();
    appendMessage('bot', `Gagal terhubung ke server. Detail: ${error.message}`);
  } finally {
    setLoadingState(false);
    renderThreads(searchInput.value.trim());
  }
});

// Helper: Tampilkan/buat elemen pesan
function appendMessage(sender, text) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message-wrapper', sender);

  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  
  if (sender === 'bot') {
    if (window.marked && typeof window.marked.parse === 'function') {
      msg.innerHTML = window.marked.parse(text);
    } else {
      msg.innerHTML = text.replace(/\n/g, '<br>');
    }
  } else {
    msg.textContent = text;
  }
  
  wrapper.appendChild(msg);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  return wrapper;
}

// Helper: Atur Status Loading
function setLoadingState(isLoading) {
  if (isLoading) {
    input.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = '...';
  } else {
    input.disabled = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send';
    input.focus();
  }
}

// Helper: Update percakapan di dalam list thread & simpan ke LocalStorage
function updateThreadConversation() {
  const thread = threads.find(t => t.id === currentThreadId);
  if (thread) {
    thread.conversation = conversationHistory;
    localStorage.setItem('chat_threads', JSON.stringify(threads));
  }
}

// Helper: Render daftar rangkaian pesan di Sidebar
function renderThreads(filterText = '') {
  threadsList.innerHTML = '';
  
  let filtered = threads;
  if (filterText) {
    filtered = threads.filter(t => t.title.toLowerCase().includes(filterText.toLowerCase()));
  }

  const visibleThreads = filtered.slice(0, displayLimit);
  
  visibleThreads.forEach(t => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.classList.add('thread-item');
    if (t.id === currentThreadId) {
      button.classList.add('active');
    }
    button.textContent = t.title;
    button.title = t.title;
    
    button.addEventListener('click', () => {
      currentThreadId = t.id;
      localStorage.setItem('current_thread_id', currentThreadId);
      loadCurrentThread();
      renderThreads(filterText);
    });
    
    li.appendChild(button);
    threadsList.appendChild(li);
  });

  // Tampilkan/sembunyikan tombol "Tampilkan lebih banyak"
  if (filtered.length > displayLimit) {
    showMoreBtn.style.display = 'block';
  } else {
    showMoreBtn.style.display = 'none';
  }
}

// Helper: Memuat percakapan thread aktif ke Chat Box
function loadCurrentThread() {
  chatBox.innerHTML = '';
  if (!currentThreadId) {
    conversationHistory = [];
    return;
  }

  const thread = threads.find(t => t.id === currentThreadId);
  if (thread) {
    conversationHistory = thread.conversation;
    conversationHistory.forEach(msg => {
      // Petakan role API ke sender UI
      const sender = msg.role === 'user' ? 'user' : 'bot';
      appendMessage(sender, msg.text);
    });
  } else {
    conversationHistory = [];
    currentThreadId = null;
    localStorage.removeItem('current_thread_id');
  }
}
