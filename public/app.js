/**
 * BookFlix Frontend Application — JioHotstar Rail + Apple Liquid Glass Edition
 */

const state = {
  homeRows: [],
  sources: {},
  featuredItem: null,
  currentItem: null,
  currentResolved: null,
  searchItems: [],
  searchQuery: '',
  searchCategory: 'all',
  searchPage: 1,
  searchHasMore: false,
  isFetchingMore: false,
  activeSearchFilter: 'all',
  activeSearchSort: 'relevance',
  fontSize: 19,
  epubZip: null,
  epubSpinePaths: [],
  mangaChapters: [],
  currentMangaChapIndex: 0,
  audioPlaylist: [],
  currentAudioIndex: 0,
  currentAudioBookItem: null,
  audioShuffle: false,
  audioRepeat: 'off',
  audioVisualizerEnabled: true,
  sleepTimerMinutes: 0,
  sleepTimerEnd: null,
  sleepTimerId: null,
  sleepTimerPauseAtEnd: false,
  streamFormat: localStorage.getItem('bookflix_stream_format') || 'hq',
  soundProfile: localStorage.getItem('bookflix_sound_profile') || 'stereo',
  myList: JSON.parse(localStorage.getItem('bookflix_mylist') || '[]'),
  history: JSON.parse(localStorage.getItem('bookflix_history') || '[]'),
};

// Extra section query pools so infinite scrolling in Books, Manga, Comics & Audiobooks never runs out
const SECTION_QUERY_POOLS = {
  ebook: [
    'bestseller OR computer science OR novel OR history',
    'science fiction OR fantasy OR thriller OR mystery',
    'psychology OR philosophy OR economics OR business',
    'physics OR mathematics OR人工智能 OR algorithms OR engineering',
    'classic literature OR biography OR adventure OR mythology',
    'medicine OR biology OR chemistry OR astronomy',
  ],
  manga: [
    'popular',
    'action',
    'fantasy',
    'adventure',
    'romance',
    'shonen',
  ],
  comic: [
    'batman OR spider-man OR marvel OR star wars',
    'x-men OR avengers OR superman OR justice league',
    'iron man OR deadpool OR wolverine OR daredevil',
    'spawn OR walking dead OR invincible OR hellboy',
    'guardians OR flash OR green lantern OR wonder woman',
    'transformers OR teenage mutant ninja turtles OR sonic',
  ],
  audiobook: [
    'harry potter OR sherlock OR stephen king OR fantasy',
    'mystery OR thriller OR adventure OR classic',
    'science fiction OR dune OR tolkien OR asimov',
    'philosophy OR psychology OR history OR biography',
    'agatha christie OR arthur conan doyle OR jules verne',
    'horror OR lovecraft OR poe OR gothic',
  ],
};

// DOM Elements
const catalogRowsContainer = document.getElementById('catalogRowsContainer');
const searchResultsSection = document.getElementById('searchResultsSection');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const searchResultsTitle = document.getElementById('searchResultsTitle');
const searchResultsSubtitle = document.getElementById('searchResultsSubtitle');
const topMatchSpotlight = document.getElementById('topMatchSpotlight');
const myListSection = document.getElementById('myListSection');
const myListGrid = document.getElementById('myListGrid');
const myListCount = document.getElementById('myListCount');
const categoriesSection = document.getElementById('categoriesSection');
const sourcesGrid = document.getElementById('sourcesGrid');
const continueRow = document.getElementById('continueRow');
const continueScroller = document.getElementById('continueScroller');
const heroSection = document.getElementById('heroSection');

// Search & Live Suggestions Elements
const searchInput = document.getElementById('searchInput');
const searchCategory = document.getElementById('searchCategory');
const searchClearBtn = document.getElementById('searchClearBtn');
const searchDropdown = document.getElementById('searchDropdown');
const dropdownList = document.getElementById('dropdownList');
const dropdownStatusText = document.getElementById('dropdownStatusText');

// Modal Elements
const readerModal = document.getElementById('readerModal');
const modalTypeBadge = document.getElementById('modalTypeBadge');
const modalTitle = document.getElementById('modalTitle');
const modalAuthor = document.getElementById('modalAuthor');
const modalCoverImg = document.getElementById('modalCoverImg');
const modalMetaPills = document.getElementById('modalMetaPills');
const modalDescription = document.getElementById('modalDescription');
const resolverStatus = document.getElementById('resolverStatus');
const instantReadButtons = document.getElementById('instantReadButtons');
const directDownloadButtons = document.getElementById('directDownloadButtons');
const modalMirrorsList = document.getElementById('modalMirrorsList');
const modalBookmarkBtn = document.getElementById('modalBookmarkBtn');

// Reader Mode Tabs & Panes
const tabBookReader = document.getElementById('tabBookReader');
const tabPdfReader = document.getElementById('tabPdfReader');
const tabFlowReader = document.getElementById('tabFlowReader');
const tabMangaReader = document.getElementById('tabMangaReader');
const tabAudioPlayer = document.getElementById('tabAudioPlayer');

const bookReaderIframe = document.getElementById('bookReaderIframe');
const pdfReaderIframe = document.getElementById('pdfReaderIframe');
const flowContentContainer = document.getElementById('flowContentContainer');
const flowArticle = document.getElementById('flowArticle');
const epubChapterGroup = document.getElementById('epubChapterGroup');
const epubChapterSelect = document.getElementById('epubChapterSelect');

const mangaChapterSelect = document.getElementById('mangaChapterSelect');
const mangaPagesContainer = document.getElementById('mangaPagesContainer');

const audioStudioCover = document.getElementById('audioStudioCover');
const audioStudioTitle = document.getElementById('audioStudioTitle');
const audioStudioTrackName = document.getElementById('audioStudioTrackName');
const audioChapterCount = document.getElementById('audioChapterCount');
const audioChaptersList = document.getElementById('audioChaptersList');

// Persistent Audio Bar
const bottomAudioBar = document.getElementById('bottomAudioBar');
const globalAudioElement = document.getElementById('globalAudioElement');
const barAudioCover = document.getElementById('barAudioCover');
const barAudioTitle = document.getElementById('barAudioTitle');
const barAudioChapter = document.getElementById('barAudioChapter');
const barDownloadMp3Btn = document.getElementById('barDownloadMp3Btn');

let suggestDebounceTimer = null;
let heroAutoTimer = null;

// Curated Hero Suggestions (3D Book Cover Showcase + Bottom-Right Carousel)
const HERO_SUGGESTIONS = [
  {
    id: 'gb_1661',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    year: 1892,
    type: 'ebook',
    format: 'PDF • EPUB • AUDIO',
    sourceBadge: 'FEATURED CLASSIC',
    gutenbergId: 1661,
    iaId: 'adventuresofsher00doylrich',
    cover: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
    backdrop: 'https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=1600&q=80',
    rating: '4.9',
    description:
      'Step into Victorian London’s most iconic detective cases. Read the complete illustrated edition in interactive 2-page flip, Flow Reader, or listen to the unabridged audiobook.',
  },
  {
    id: 'md_d8a959f7-648e-4c8d-8f23-f1f3f8e129f3',
    title: 'One-Punch Man [Manga Stream]',
    author: 'ONE & Yusuke Murata',
    year: 2012,
    type: 'manga',
    format: 'Webtoon & Page Stream',
    sourceBadge: 'MANGA SPOTLIGHT',
    mangaId: 'd8a959f7-648e-4c8d-8f23-f1f3f8e129f3',
    cover: '/api/stream?url=' + encodeURIComponent('https://uploads.mangadex.org/covers/d8a959f7-648e-4c8d-8f23-f1f3f8e129f3/58f6532b-f538-4c5c-96f9-192920693221.jpg.512.jpg'),
    backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
    rating: '4.9',
    description:
      'Follow Saitama, a hero for fun who can defeat any foe with a single punch. Stream high-resolution chapters vertically or page-by-page inside the built-in Manga Reader.',
  },
  {
    id: 'iaa_count_of_monte_cristo_0711_librivox',
    title: 'The Count of Monte Cristo',
    author: 'Alexandre Dumas',
    year: 1844,
    type: 'audiobook',
    format: 'Unabridged MP3 Studio',
    sourceBadge: 'AUDIOBOOK PICK',
    iaId: 'count_of_monte_cristo_0711_librivox',
    cover: 'https://www.gutenberg.org/cache/epub/1184/pg1184.cover.medium.jpg',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    rating: '4.9',
    description:
      'Betrayed and imprisoned on the grim island fortress of Château d’If, Edmond Dantès escapes to execute the most intricate tale of vengeance and redemption in literary history.',
  },
  {
    id: 'gb_84',
    title: 'Frankenstein; Or, The Modern Prometheus',
    author: 'Mary Wollstonecraft Shelley',
    year: 1818,
    type: 'ebook',
    format: 'Flow EPUB • PDF',
    sourceBadge: 'SCI-FI CLASSIC',
    gutenbergId: 84,
    iaId: 'frankensteinormo00shel',
    cover: 'https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg',
    backdrop: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1600&q=80',
    rating: '4.8',
    description:
      'Victor Frankenstein’s obsession with unlocking the secret of life gives birth to a tragic, sentient creature in the foundational masterpiece of science fiction.',
  },
  {
    id: 'gb_345',
    title: 'Dracula [Collector Edition]',
    author: 'Bram Stoker',
    year: 1897,
    type: 'ebook',
    format: 'PDF • EPUB • Flip',
    sourceBadge: 'EDITOR PICK',
    gutenbergId: 345,
    iaId: 'draculabr00stok',
    cover: 'https://www.gutenberg.org/cache/epub/345/pg345.cover.medium.jpg',
    backdrop: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e66c?auto=format&fit=crop&w=1600&q=80',
    rating: '4.8',
    description:
      'From Jonathan Harker’s fateful journey into the Carpathian Mountains to the shadows of Whitby Abbey, experience the definitive Gothic vampire novel.',
  },
  {
    id: 'iaa_art_of_war_librivox',
    title: 'The Art of War [Audio + Text]',
    author: 'Sun Tzu',
    year: 'Classic',
    type: 'audiobook',
    format: 'MP3 Stream • EPUB',
    sourceBadge: 'ESSENTIAL LISTEN',
    gutenbergId: 132,
    iaId: 'art_of_war_librivox',
    cover: 'https://www.gutenberg.org/cache/epub/132/pg132.cover.medium.jpg',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
    rating: '4.9',
    description:
      'Listen to or read Sun Tzu’s timeless treatise on strategy, tactical preparation, and leadership—available for instant streaming in the Audiobook Studio.',
  },
];

state.heroSuggestions = [...HERO_SUGGESTIONS];
state.heroIndex = 0;

// ============================================================================
// 1. INITIALIZATION & HOME CATALOG
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initMultiDeviceOptimization();
  initLiquidGlassSelects();
  updateMyListCount();
  renderContinueRow();
  initHeroSuggestionsCarousel();
  loadHomeCatalog();
  setupEventListeners();
});

function getFallbackHomeRows() {
  return [
    {
      title: '🌟 Editor’s Choice & Trending Classics',
      badge: 'POPULAR VAULT',
      items: state.heroSuggestions || HERO_SUGGESTIONS,
    },
    {
      title: '📖 Masterpiece Literature & Novels',
      badge: 'FLOW READER READY',
      items: [
        {
          id: 'ol_OL262758W',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          year: 1925,
          type: 'ebook',
          format: 'Flow EPUB • PDF',
          sourceBadge: 'CLASSIC',
          cover: 'https://covers.openlibrary.org/b/id/10543660-L.jpg',
          rating: '4.7',
          description: 'A portrait of the Jazz Age and Jay Gatsby’s desperate quest for the American dream.'
        },
        {
          id: 'ol_OL27479W',
          title: 'Pride and Prejudice',
          author: 'Jane Austen',
          year: 1813,
          type: 'ebook',
          format: 'Flow EPUB • PDF',
          sourceBadge: 'POPULAR',
          cover: 'https://covers.openlibrary.org/b/id/8314144-L.jpg',
          rating: '4.8',
          description: 'A masterpiece of wit, romantic tension, and social realism in Regency England.'
        },
        {
          id: 'ol_OL21635398W',
          title: '1984',
          author: 'George Orwell',
          year: 1949,
          type: 'ebook',
          format: 'Flow EPUB • PDF',
          sourceBadge: 'DYSTOPIAN',
          cover: 'https://covers.openlibrary.org/b/id/8575786-L.jpg',
          rating: '4.9',
          description: 'The defining dystopian novel of surveillance, totalitarian control, and Big Brother.'
        },
        {
          id: 'ol_OL14925761W',
          title: 'Crime and Punishment',
          author: 'Fyodor Dostoevsky',
          year: 1866,
          type: 'ebook',
          format: 'Flow EPUB • PDF',
          sourceBadge: 'PHILOSOPHY',
          cover: 'https://covers.openlibrary.org/b/id/8775438-L.jpg',
          rating: '4.8',
          description: 'A gripping psychological drama of guilt, conscience, and redemption in Saint Petersburg.'
        }
      ]
    },
    {
      title: '🎧 Essential Unabridged Audiobooks',
      badge: 'STUDIO HQ',
      items: [
        {
          id: 'iaa_art_of_war_librivox',
          title: 'The Art of War',
          author: 'Sun Tzu',
          type: 'audiobook',
          format: 'HQ MP3 Stream',
          sourceBadge: 'LIBRIVOX HQ',
          iaId: 'art_of_war_librivox',
          cover: 'https://www.gutenberg.org/cache/epub/132/pg132.cover.medium.jpg',
          rating: '4.9',
          description: 'Sun Tzu’s masterwork on military strategy and wisdom.'
        },
        {
          id: 'iaa_adventures_sherlock_holmes_librivox',
          title: 'The Adventures of Sherlock Holmes',
          author: 'Arthur Conan Doyle',
          type: 'audiobook',
          format: 'HQ MP3 Stream',
          sourceBadge: 'LIBRIVOX HQ',
          iaId: 'adventures_sherlock_holmes_0711_librivox',
          cover: 'https://www.gutenberg.org/cache/epub/1661/pg1661.cover.medium.jpg',
          rating: '4.9',
          description: 'Iconic detective mysteries with full dramatic narration.'
        }
      ]
    }
  ];
}

async function loadHomeCatalog() {
  try {
    const res = await fetch('/api/home');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.homeRows = data.rows || [];
    state.sources = data.sources || {};

    if (state.homeRows.length === 0) {
      state.homeRows = getFallbackHomeRows();
    }
    renderCatalogRows(state.homeRows);
    renderSourcesDirectory(state.sources);
  } catch (err) {
    console.warn('Live catalog fetch notice, loading resilient catalog:', err);
    state.homeRows = getFallbackHomeRows();
    renderCatalogRows(state.homeRows);
  }
}

function initHeroSuggestionsCarousel() {
  renderHeroThumbs();
  selectHeroSuggestion(0, false);
  startHeroAutoRotate();
}

function renderHeroThumbs() {
  const strip = document.getElementById('heroThumbsStrip');
  if (!strip) return;
  strip.innerHTML = '';

  state.heroSuggestions.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `hero-thumb-btn${idx === state.heroIndex ? ' active' : ''}`;
    btn.title = `${item.title} — ${item.author}`;
    const coverImg = item.cover || item.backdrop;
    btn.innerHTML = `<img src="${escapeAttr(coverImg)}" alt="${escapeAttr(item.title)}" loading="lazy" />`;
    btn.addEventListener('click', () => {
      selectHeroSuggestion(idx, true);
      restartHeroAutoRotate();
    });
    strip.appendChild(btn);
  });
}

function selectHeroSuggestion(index, animate = true) {
  const list = state.heroSuggestions;
  if (!list || list.length === 0) return;
  const normalized = ((index % list.length) + list.length) % list.length;
  state.heroIndex = normalized;

  const contentBox = document.getElementById('heroContentBox');
  if (animate && contentBox) {
    contentBox.classList.add('switching');
    setTimeout(() => {
      setHeroSpotlight(list[normalized]);
      contentBox.classList.remove('switching');
    }, 140);
  } else {
    setHeroSpotlight(list[normalized]);
  }

  const strip = document.getElementById('heroThumbsStrip');
  if (strip) {
    Array.from(strip.children).forEach((el, idx) => {
      el.classList.toggle('active', idx === normalized);
    });
  }
}

function startHeroAutoRotate() {
  if (heroAutoTimer) clearInterval(heroAutoTimer);
  heroAutoTimer = setInterval(() => {
    selectHeroSuggestion(state.heroIndex + 1, true);
  }, 5500);
}

function restartHeroAutoRotate() {
  startHeroAutoRotate();
}

function setHeroSpotlight(item) {
  if (!item) return;
  state.featuredItem = item;

  const catPill = document.getElementById('heroCategoryPill');
  const authorBadge = document.getElementById('heroAuthorBadge');
  const formatBadge = document.getElementById('heroFormatBadge');
  const ratingBadge = document.getElementById('heroRatingBadge');
  const titleEl = document.getElementById('heroTitle');
  const descEl = document.getElementById('heroDesc');
  const readLabelEl = document.getElementById('heroReadBtnLabel');
  const saveBtnEl = document.getElementById('heroSaveBtn');
  const coverPreview = document.getElementById('heroCoverPreview');

  if (catPill) catPill.textContent = (item.sourceBadge || 'FEATURED').toUpperCase();
  if (authorBadge) authorBadge.textContent = item.author || 'Featured Edition';
  if (formatBadge) formatBadge.textContent = item.format || 'PDF • EPUB';
  if (ratingBadge) ratingBadge.textContent = `Rating ${item.rating || '4.9'}`;
  if (titleEl) titleEl.textContent = item.title;
  if (descEl) {
    descEl.textContent =
      item.description ||
      'Available for instant in-app reading and direct download with multi-format support.';
  }
  if (readLabelEl) {
    readLabelEl.textContent =
      item.type === 'audiobook'
        ? 'Listen Now'
        : item.type === 'manga' || item.type === 'comic'
        ? 'Read Issue'
        : 'Read Now';
  }
  if (saveBtnEl) {
    const saved = state.myList.some((x) => x.id === item.id);
    saveBtnEl.textContent = saved ? 'Saved in My Space' : 'Save to My Space';
  }
  if (coverPreview && (item.cover || item.backdrop)) {
    coverPreview.src = item.cover || item.backdrop;
  }

  const backdropUrl = item.backdrop || item.cover;
  if (backdropUrl) {
    document.getElementById('heroBackdrop').style.backgroundImage = `url('${backdropUrl}')`;
  }
}

function renderCatalogRows(rows) {
  catalogRowsContainer.innerHTML = '';
  for (const row of rows) {
    if (!row.items || row.items.length === 0) continue;
    const section = document.createElement('section');
    section.className = 'catalog-row';
    section.innerHTML = `
      <div class="row-header">
        <h2>${escapeHtml(row.title)}</h2>
        <span class="row-badge">${escapeHtml(row.badge || '')}</span>
      </div>
      <div class="row-scroller"></div>
    `;
    const scroller = section.querySelector('.row-scroller');
    row.items.forEach((item) => {
      scroller.appendChild(createBookCard(item));
    });
    catalogRowsContainer.appendChild(section);
  }
}

function createBookCard(item) {
  const card = document.createElement('div');
  const isAudio = item.type === 'audiobook';
  card.className = `book-card${isAudio ? ' audiobook-card' : ''}`;

  const typeLabel =
    item.type === 'manga'
      ? 'MANGA'
      : item.type === 'comic'
      ? 'COMIC'
      : isAudio
      ? 'AUDIOBOOK'
      : 'BOOK';

  const coverHtml = item.cover
    ? `<img src="${escapeAttr(item.cover)}" alt="${escapeAttr(item.title)}" class="card-cover-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
       <div class="fallback-cover" style="display:none;">
         <div class="fallback-cover-title">${escapeHtml(item.title)}</div>
         <div class="fallback-cover-author">${escapeHtml(item.author || '')}</div>
       </div>`
    : `<div class="fallback-cover">
         <div class="fallback-cover-title">${escapeHtml(item.title)}</div>
         <div class="fallback-cover-author">${escapeHtml(item.author || '')}</div>
       </div>`;

  const spotifyPlayBtnHtml = isAudio
    ? `<button type="button" class="spotify-card-play-fab" title="Play on BookFlix Audio" aria-label="Play Audiobook">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
       </button>`
    : '';

  card.innerHTML = `
    <div class="card-cover-wrap">
      ${coverHtml}
      <span class="card-source-pill">${escapeHtml(item.sourceBadge || 'Edition')}</span>
      <span class="card-type-pill">${typeLabel}</span>
      ${spotifyPlayBtnHtml}
    </div>
    <div class="card-info">
      <div class="card-title" title="${escapeAttr(item.title)}">${escapeHtml(item.title)}</div>
      <div class="card-author">${escapeHtml(item.author || 'Unknown Author')}</div>
      <div class="card-meta-row">
        <span>${escapeHtml(item.format || (isAudio ? 'MP3 AUDIO' : 'PDF / EPUB'))}</span>
        <span class="card-rating">${escapeHtml(item.rating || '4.8')}</span>
      </div>
    </div>
  `;

  const fab = card.querySelector('.spotify-card-play-fab');
  if (fab) {
    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      openItemModal(item, true);
    });
  }

  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.addEventListener('click', () => openItemModal(item, false));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openItemModal(item, false);
    }
  });
  return card;
}

// ============================================================================
// 2. JIOHOTSTAR RAIL, LIVE SUGGESTIONS & SEARCH ENGINE
// ============================================================================

function setupEventListeners() {
  // Search Form Submit
  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    const cat = searchCategory.value;
    searchDropdown.classList.add('hidden');
    if (q) executeSearch(q, cat);
  });

  searchCategory.addEventListener('change', () => {
    const q = searchInput.value.trim();
    if (q.length >= 2) {
      if (!searchResultsSection.classList.contains('hidden')) {
        executeSearch(q, searchCategory.value);
      } else {
        fetchLiveSuggestions(q, searchCategory.value);
      }
    }
  });

  // Live Instant Suggestions as user types
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    searchClearBtn.classList.toggle('hidden', q.length === 0);

    if (suggestDebounceTimer) clearTimeout(suggestDebounceTimer);
    if (q.length < 2) {
      searchDropdown.classList.add('hidden');
      return;
    }

    suggestDebounceTimer = setTimeout(() => {
      fetchLiveSuggestions(q, searchCategory.value);
    }, 220);
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.classList.add('hidden');
    searchDropdown.classList.add('hidden');
    searchInput.focus();
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!document.getElementById('searchWrapper').contains(e.target)) {
      searchDropdown.classList.add('hidden');
    }
  });

  // Top Segmented Switcher Control
  document.querySelectorAll('.seg-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const tab = pill.getAttribute('data-cat') || pill.getAttribute('data-quicktab') || 'home';
      document.querySelectorAll('.seg-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      document.querySelectorAll('.rail-item').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tab);
      });
      handleTabSwitch(tab);
    });
  });

  // Surprise Me (Random Spotlight / Instant Open)
  const surpriseMeBtn = document.getElementById('surpriseMeBtn');
  if (surpriseMeBtn) {
    surpriseMeBtn.addEventListener('click', () => {
      const allItems = [...state.heroSuggestions];
      state.homeRows.forEach((r) => {
        if (Array.isArray(r.items)) allItems.push(...r.items);
      });
      if (allItems.length > 0) {
        const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
        openItemModal(randomItem);
      }
    });
  }

  // Top Resume Read Button
  const topResumeBtn = document.getElementById('topResumeBtn');
  if (topResumeBtn) {
    topResumeBtn.addEventListener('click', () => {
      if (state.history.length > 0) {
        openItemModal(state.history[0]);
      } else if (state.featuredItem) {
        openItemModal(state.featuredItem);
      }
    });
  }

  // Local Network & Multi-Device QR Modal Buttons
  const lanQrBtn = document.getElementById('lanQrBtn');
  const lanModal = document.getElementById('lanModal');
  const closeLanModalBtn = document.getElementById('closeLanModalBtn');
  if (lanQrBtn && lanModal) {
    lanQrBtn.addEventListener('click', () => {
      openLanHostModal();
    });
    closeLanModalBtn?.addEventListener('click', () => {
      lanModal.classList.add('hidden');
    });
    lanModal.addEventListener('click', (e) => {
      if (e.target === lanModal) lanModal.classList.add('hidden');
    });
  }

  document.getElementById('copyLanUrlBtn')?.addEventListener('click', (e) => {
    const val = document.getElementById('lanUrlInput')?.value || '';
    if (val) {
      navigator.clipboard?.writeText(val);
      const btn = e.currentTarget;
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = orig;
      }, 1600);
    }
  });

  document.getElementById('copyLocalUrlBtn')?.addEventListener('click', (e) => {
    const val = document.getElementById('localUrlInput')?.value || '';
    if (val) {
      navigator.clipboard?.writeText(val);
      const btn = e.currentTarget;
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => {
        btn.textContent = orig;
      }, 1600);
    }
  });

  // JioHotstar Left Rail Navigation
  document.querySelectorAll('.rail-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rail-item').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.seg-pill').forEach((p) => {
        const pCat = p.getAttribute('data-cat') || p.getAttribute('data-quicktab');
        p.classList.toggle('active', pCat === tab);
      });
      handleTabSwitch(tab);
    });
  });

  // Category / Genre Tiles inside Categories Hub
  document.querySelectorAll('.genre-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const q = tile.getAttribute('data-q');
      const type = tile.getAttribute('data-type') || 'all';
      const heading = tile.getAttribute('data-heading');
      searchInput.value = q.split(' ')[0];
      executeSearch(q, type, heading);
    });
  });

  // Search Results Sort Dropdown & Load More / Infinite Scroll
  document.getElementById('searchSortSelect').addEventListener('change', (e) => {
    state.activeSearchSort = e.target.value;
    renderFilteredSearchResults();
  });

  document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
    loadMoreSearchResults();
  });

  window.addEventListener(
    'scroll',
    () => {
      if (searchResultsSection.classList.contains('hidden')) return;
      if (!state.searchHasMore || state.isFetchingMore) return;
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 700;
      if (scrolledToBottom) {
        loadMoreSearchResults();
      }
    },
    { passive: true }
  );

  document.getElementById('logoBtn').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.rail-item[data-tab="home"]').click();
  });

  document.getElementById('closeSearchBtn').addEventListener('click', () => {
    document.querySelector('.rail-item[data-tab="home"]').click();
  });

  document.getElementById('heroReadBtn').addEventListener('click', () => {
    if (state.featuredItem) openItemModal(state.featuredItem);
  });

  const heroCoverShowcase = document.getElementById('heroCoverShowcase');
  if (heroCoverShowcase) {
    heroCoverShowcase.addEventListener('click', () => {
      if (state.featuredItem) openItemModal(state.featuredItem);
    });
  }

  const heroPrevBtn = document.getElementById('heroPrevBtn');
  const heroNextBtn = document.getElementById('heroNextBtn');
  if (heroPrevBtn) {
    heroPrevBtn.addEventListener('click', () => {
      selectHeroSuggestion(state.heroIndex - 1, true);
      restartHeroAutoRotate();
    });
  }
  if (heroNextBtn) {
    heroNextBtn.addEventListener('click', () => {
      selectHeroSuggestion(state.heroIndex + 1, true);
      restartHeroAutoRotate();
    });
  }

  const heroBanner = document.getElementById('heroBanner');
  if (heroBanner) {
    heroBanner.addEventListener('mouseenter', () => {
      if (heroAutoTimer) clearInterval(heroAutoTimer);
    });
    heroBanner.addEventListener('mouseleave', () => {
      startHeroAutoRotate();
    });
  }

  document.getElementById('heroSaveBtn').addEventListener('click', () => {
    if (state.featuredItem) {
      toggleMyList(state.featuredItem);
      const saved = state.myList.some((x) => x.id === state.featuredItem.id);
      document.getElementById('heroSaveBtn').textContent = saved
        ? 'Saved in My Space'
        : 'Save to My Space';
    }
  });

  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    state.history = [];
    localStorage.setItem('bookflix_history', '[]');
    renderContinueRow();
  });

  document.getElementById('closeModalBtn').addEventListener('click', closeReaderModal);
  readerModal.addEventListener('click', (e) => {
    if (e.target === readerModal) closeReaderModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!readerModal.classList.contains('hidden')) closeReaderModal();
      if (lanModal && !lanModal.classList.contains('hidden')) lanModal.classList.add('hidden');
    }
  });

  modalBookmarkBtn.addEventListener('click', () => {
    if (!state.currentItem) return;
    toggleMyList(state.currentItem);
  });

  document.querySelectorAll('.mode-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      switchReaderMode(tab.getAttribute('data-mode'));
    });
  });

  document.querySelectorAll('[data-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-theme]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      flowContentContainer.className = `flow-content-container theme-${theme}`;
    });
  });

  document.getElementById('fontDecBtn').addEventListener('click', () => {
    state.fontSize = Math.max(14, state.fontSize - 2);
    flowArticle.style.fontSize = `${state.fontSize}px`;
    document.getElementById('fontSizeLabel').textContent = `${state.fontSize}px`;
  });

  document.getElementById('fontIncBtn').addEventListener('click', () => {
    state.fontSize = Math.min(30, state.fontSize + 2);
    flowArticle.style.fontSize = `${state.fontSize}px`;
    document.getElementById('fontSizeLabel').textContent = `${state.fontSize}px`;
  });

  epubChapterSelect.addEventListener('change', () => {
    const idx = Number(epubChapterSelect.value);
    renderEpubSpineChapter(idx);
  });

  mangaChapterSelect.addEventListener('change', () => {
    const idx = Number(mangaChapterSelect.value);
    loadMangaChapterByIndex(idx);
  });

  document.getElementById('prevChapterBtn').addEventListener('click', () => {
    if (state.currentMangaChapIndex > 0) {
      loadMangaChapterByIndex(state.currentMangaChapIndex - 1);
    }
  });

  document.getElementById('nextChapterBtn').addEventListener('click', () => {
    if (state.currentMangaChapIndex < state.mangaChapters.length - 1) {
      loadMangaChapterByIndex(state.currentMangaChapIndex + 1);
    }
  });

  document.getElementById('layoutWebtoonBtn').addEventListener('click', () => {
    document.getElementById('layoutWebtoonBtn').classList.add('active');
    document.getElementById('layoutWideBtn').classList.remove('active');
    mangaPagesContainer.classList.remove('wide-mode');
  });

  document.getElementById('layoutWideBtn').addEventListener('click', () => {
    document.getElementById('layoutWideBtn').classList.add('active');
    document.getElementById('layoutWebtoonBtn').classList.remove('active');
    mangaPagesContainer.classList.add('wide-mode');
  });

  const applyPlaybackSpeed = (speed) => {
    const numSpeed = Number(speed) || 1;
    globalAudioElement.playbackRate = numSpeed;
    document.querySelectorAll('.speed-chip').forEach((c) => {
      c.classList.toggle('active', Number(c.getAttribute('data-speed')) === numSpeed);
    });
    const speedBadge = document.getElementById('npSpeedBadge');
    if (speedBadge) speedBadge.textContent = `${numSpeed}x`;
    const speedReadout = document.getElementById('npSpeedReadout');
    if (speedReadout) speedReadout.textContent = `${numSpeed}x`;
    document.querySelectorAll('.np-pop-speed-btn').forEach((b) => {
      b.classList.toggle('active', Number(b.getAttribute('data-spd')) === numSpeed);
    });
  };

  document.querySelectorAll('.speed-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      applyPlaybackSpeed(chip.getAttribute('data-speed'));
    });
  });

  document.getElementById('npSettingsSpeedBtn')?.addEventListener('click', () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const cur = globalAudioElement.playbackRate || 1;
    const curIdx = speeds.indexOf(cur);
    const nextIdx = curIdx >= 0 ? (curIdx + 1) % speeds.length : 0;
    const nextSpeed = speeds[nextIdx];
    applyPlaybackSpeed(nextSpeed);
    showPlayerToast(`⚡ Playback Speed: ${nextSpeed}x`);
  });

  const togglePlayPause = () => {
    if (!globalAudioElement.src || state.audioPlaylist.length === 0) {
      if (state.audioPlaylist.length > 0) {
        playAudioTrack(state.currentAudioIndex || 0);
      }
      return;
    }
    if (globalAudioElement.paused) {
      globalAudioElement.play().catch(() => {});
    } else {
      globalAudioElement.pause();
    }
  };

  const playPrevTrack = () => {
    if (!state.audioPlaylist.length) return;
    if (globalAudioElement.currentTime > 4) {
      globalAudioElement.currentTime = 0;
      return;
    }
    if (state.currentAudioIndex > 0) {
      playAudioTrack(state.currentAudioIndex - 1);
    } else if (state.audioRepeat === 'all') {
      playAudioTrack(state.audioPlaylist.length - 1);
    } else {
      globalAudioElement.currentTime = 0;
    }
  };

  const playNextTrack = (fromAutoEnd = false) => {
    if (!state.audioPlaylist.length) return;
    if (fromAutoEnd && state.audioRepeat === 'one') {
      globalAudioElement.currentTime = 0;
      globalAudioElement.play().catch(() => {});
      return;
    }
    if (state.audioShuffle && state.audioPlaylist.length > 1) {
      let randIdx = state.currentAudioIndex;
      while (randIdx === state.currentAudioIndex) {
        randIdx = Math.floor(Math.random() * state.audioPlaylist.length);
      }
      playAudioTrack(randIdx);
      return;
    }
    if (state.currentAudioIndex < state.audioPlaylist.length - 1) {
      playAudioTrack(state.currentAudioIndex + 1);
    } else if (state.audioRepeat === 'all' || !fromAutoEnd) {
      playAudioTrack(0);
    } else {
      syncSpotifyPlaybackUI(false);
    }
  };

  const toggleShuffle = () => {
    state.audioShuffle = !state.audioShuffle;
    document.getElementById('barShuffleBtn')?.classList.toggle('active', state.audioShuffle);
    document.getElementById('npShuffleBtn')?.classList.toggle('active', state.audioShuffle);
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    state.audioRepeat = modes[(modes.indexOf(state.audioRepeat) + 1) % modes.length];
    const isActive = state.audioRepeat !== 'off';
    const barBtn = document.getElementById('barRepeatBtn');
    const npBtn = document.getElementById('npRepeatBtn');
    if (barBtn) {
      barBtn.classList.toggle('active', isActive);
      barBtn.title = `Repeat: ${state.audioRepeat.toUpperCase()}`;
    }
    if (npBtn) {
      npBtn.classList.toggle('active', isActive);
      npBtn.title = `Repeat: ${state.audioRepeat.toUpperCase()}`;
    }
  };

  const skipSeconds = (delta) => {
    if (!globalAudioElement.src) return;
    const dur = isFinite(globalAudioElement.duration) ? globalAudioElement.duration : Infinity;
    globalAudioElement.currentTime = Math.max(0, Math.min(dur, (globalAudioElement.currentTime || 0) + delta));
  };

  document.getElementById('spStudioPlayBtn')?.addEventListener('click', togglePlayPause);
  document.getElementById('spBarPlayPauseBtn')?.addEventListener('click', togglePlayPause);
  document.getElementById('npPlayPauseBtn')?.addEventListener('click', togglePlayPause);

  document.getElementById('spStudioRewindBtn')?.addEventListener('click', () => skipSeconds(-15));
  document.getElementById('spStudioForwardBtn')?.addEventListener('click', () => skipSeconds(15));
  document.getElementById('audioRewindBtn')?.addEventListener('click', () => skipSeconds(-15));
  document.getElementById('audioForwardBtn')?.addEventListener('click', () => skipSeconds(15));
  document.getElementById('npRewind15Btn')?.addEventListener('click', () => skipSeconds(-15));
  document.getElementById('npForward15Btn')?.addEventListener('click', () => skipSeconds(15));
  document.getElementById('npWaveSkipBtn')?.addEventListener('click', () => skipSeconds(15));

  document.getElementById('audioPrevTrackBtn')?.addEventListener('click', playPrevTrack);
  document.getElementById('npPrevBtn')?.addEventListener('click', playPrevTrack);

  document.getElementById('audioNextTrackBtn')?.addEventListener('click', () => playNextTrack(false));
  document.getElementById('npNextBtn')?.addEventListener('click', () => playNextTrack(false));

  document.getElementById('barShuffleBtn')?.addEventListener('click', toggleShuffle);
  document.getElementById('npShuffleBtn')?.addEventListener('click', toggleShuffle);

  document.getElementById('barRepeatBtn')?.addEventListener('click', toggleRepeat);
  document.getElementById('npRepeatBtn')?.addEventListener('click', toggleRepeat);

  const toggleAudioFavorite = (e) => {
    e?.stopPropagation();
    const targetItem = state.currentAudioBookItem || state.currentItem;
    if (targetItem) {
      toggleMyList(targetItem);
      syncAudioHeartButtons();
    }
  };
  document.getElementById('barHeartBtn')?.addEventListener('click', toggleAudioFavorite);
  document.getElementById('npHeartBtn')?.addEventListener('click', toggleAudioFavorite);

  const seekSlider = document.getElementById('spBarSeekSlider');
  const npSeekSlider = document.getElementById('npSeekSlider');
  const handleSeekInput = (sliderEl) => {
    if (globalAudioElement.duration && isFinite(globalAudioElement.duration)) {
      globalAudioElement.currentTime =
        (Number(sliderEl.value) / 100) * globalAudioElement.duration;
    }
  };
  seekSlider?.addEventListener('input', () => handleSeekInput(seekSlider));
  npSeekSlider?.addEventListener('input', () => handleSeekInput(npSeekSlider));

  const volSlider = document.getElementById('spBarVolumeSlider');
  const npVolSlider = document.getElementById('npVolumeSlider');
  const applyVolume = (val) => {
    const v = Math.max(0, Math.min(1, Number(val)));
    globalAudioElement.volume = v;
    if (volSlider) volSlider.value = String(v);
    if (npVolSlider) npVolSlider.value = String(v);
  };
  volSlider?.addEventListener('input', () => applyVolume(volSlider.value));
  npVolSlider?.addEventListener('input', () => applyVolume(npVolSlider.value));
  document.getElementById('npVolMinBtn')?.addEventListener('click', () => applyVolume(0));
  document.getElementById('npVolMaxBtn')?.addEventListener('click', () => applyVolume(1));

  // Open Full-Screen Translucent Liquid-Glass Now Playing Card when clicking the bottom bar or expand buttons
  document.getElementById('spBarLeftClick')?.addEventListener('click', (e) => {
    if (e.target.closest('#barHeartBtn')) return;
    openNowPlayingOverlay();
  });
  document.getElementById('barExpandNowPlayingBtn')?.addEventListener('click', () => {
    openNowPlayingOverlay();
  });
  document.getElementById('openNowPlayingCardBtn')?.addEventListener('click', () => {
    openNowPlayingOverlay();
  });
  bottomAudioBar?.addEventListener('click', (e) => {
    if (
      e.target.closest('button') ||
      e.target.closest('a') ||
      e.target.closest('input') ||
      e.target.closest('.sp-bar-progress-row') ||
      e.target.closest('.sp-bar-vol-wrap')
    ) {
      return;
    }
    openNowPlayingOverlay();
  });

  // Now Playing Overlay Minimize / Fullscreen / Drawer / Visualizer controls
  document.getElementById('npMinimizeBtn')?.addEventListener('click', closeNowPlayingOverlay);
  document.getElementById('npFullscreenToggleBtn')?.addEventListener('click', () => {
    toggleNowPlayingFullscreen(null, true);
  });
  document.querySelector('.np-top-bar')?.addEventListener('dblclick', () => {
    toggleNowPlayingFullscreen(null, true);
  });
  document.getElementById('nowPlayingOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'nowPlayingOverlay' || e.target.classList.contains('np-backdrop')) {
      closeNowPlayingOverlay();
    }
  });

  window.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('nowPlayingOverlay');
    if (!overlay || overlay.classList.contains('hidden')) return;
    if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleNowPlayingFullscreen(null, true);
    }
    if (e.key === 'Escape') {
      closeNowPlayingOverlay();
    }
  });

  let toastTimeoutId = null;
  const showPlayerToast = (msg) => {
    const toast = document.getElementById('npToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2200);
  };

  const setSleepTimer = (val) => {
    if (state.sleepTimerId) {
      clearInterval(state.sleepTimerId);
      state.sleepTimerId = null;
    }
    state.sleepTimerPauseAtEnd = false;
    state.sleepTimerMinutes = val;

    const btn = document.getElementById('npSleepTimerBtn');
    const badge = document.getElementById('npSleepTimerBadge');

    // Sync Popover sleep chips
    document.querySelectorAll('.np-pop-sleep-btn').forEach((b) => {
      const s = b.getAttribute('data-sleep');
      const isAct = String(s) === String(val) || (s === 'off' && (val === 0 || val === 'off'));
      b.classList.toggle('active', isAct);
    });

    if (val === 0 || val === 'off') {
      state.sleepTimerEnd = null;
      btn?.classList.remove('active');
      badge?.classList.add('hidden');
      showPlayerToast('⏱ Sleep Timer: Disabled');
      return;
    }

    if (val === 'chapter') {
      state.sleepTimerPauseAtEnd = true;
      state.sleepTimerEnd = null;
      btn?.classList.add('active');
      if (badge) {
        badge.textContent = 'End';
        badge.classList.remove('hidden');
      }
      showPlayerToast('⏱ Sleep Timer: Will pause at end of chapter');
      return;
    }

    const mins = Number(val);
    state.sleepTimerEnd = Date.now() + mins * 60 * 1000;
    btn?.classList.add('active');
    if (badge) {
      badge.textContent = `${mins}m`;
      badge.classList.remove('hidden');
    }
    showPlayerToast(`⏱ Sleep Timer set for ${mins} minutes`);

    const initialVolume = globalAudioElement.volume;
    state.sleepTimerId = setInterval(() => {
      const leftMs = state.sleepTimerEnd - Date.now();
      if (leftMs <= 0) {
        clearInterval(state.sleepTimerId);
        state.sleepTimerId = null;
        globalAudioElement.pause();
        globalAudioElement.volume = initialVolume;
        btn?.classList.remove('active');
        badge?.classList.add('hidden');
        showPlayerToast('💤 Sleep Timer expired. Audio paused.');
        return;
      }
      const leftMins = Math.ceil(leftMs / 60000);
      if (badge) badge.textContent = `${leftMins}m`;
      // Fade out smoothly in the last 6 seconds
      if (leftMs < 6000) {
        const factor = Math.max(0, leftMs / 6000);
        globalAudioElement.volume = initialVolume * factor;
      }
    }, 1000);
  };

  // Button 0: Playback Speed Cycler (Frosted Glass Capsule Dock)
  document.getElementById('npSpeedBtn')?.addEventListener('click', () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const cur = globalAudioElement.playbackRate || 1;
    const curIdx = speeds.indexOf(cur);
    const nextIdx = curIdx >= 0 ? (curIdx + 1) % speeds.length : 0;
    const nextSpeed = speeds[nextIdx];
    applyPlaybackSpeed(nextSpeed);
    showPlayerToast(`⚡ Playback Speed: ${nextSpeed}x`);
  });

  // Button 1: Chapters & Audio Queue Drawer Toggle
  const toggleNpChaptersDrawer = () => {
    const drawer = document.getElementById('npChaptersDrawer');
    const qBtn = document.getElementById('npQueueBtn');
    const overlay = document.getElementById('nowPlayingOverlay');
    if (!drawer) return;
    const willOpen = drawer.classList.contains('hidden');
    drawer.classList.toggle('hidden', !willOpen);
    overlay?.classList.toggle('drawer-open', willOpen);
    qBtn?.classList.toggle('active', willOpen);
    showPlayerToast(willOpen ? '✦ Chapters Queue Opened' : '✦ Chapters Queue Closed');
  };
  document.getElementById('npQueueBtn')?.addEventListener('click', toggleNpChaptersDrawer);
  document.getElementById('npMoreMenuBtn')?.addEventListener('click', toggleNpChaptersDrawer);
  document.getElementById('npCloseDrawerBtn')?.addEventListener('click', () => {
    document.getElementById('npChaptersDrawer')?.classList.add('hidden');
    document.getElementById('nowPlayingOverlay')?.classList.remove('drawer-open');
    document.getElementById('npQueueBtn')?.classList.remove('active');
  });

  // Button 2: Live Audio Visualizer / Equalizer Toggle
  document.getElementById('npVisualizerBtn')?.addEventListener('click', () => {
    state.audioVisualizerEnabled = !state.audioVisualizerEnabled;
    document.getElementById('npVisualizerBtn')?.classList.toggle('active', state.audioVisualizerEnabled);
    const vis = document.getElementById('npLiveVisualizer');
    if (vis) {
      vis.classList.toggle('hidden', !state.audioVisualizerEnabled);
      vis.classList.toggle('active', state.audioVisualizerEnabled);
    }
    showPlayerToast(state.audioVisualizerEnabled ? '✦ Live Visualizer: Active' : '✦ Live Visualizer: Disabled');
  });

  // Button 3: Sleep Timer Cycler
  document.getElementById('npSleepTimerBtn')?.addEventListener('click', () => {
    const cycle = [0, 15, 30, 45, 60, 'chapter'];
    const curIdx = cycle.indexOf(state.sleepTimerMinutes);
    const nextVal = cycle[(curIdx + 1) % cycle.length];
    setSleepTimer(nextVal);
  });

  // Button 4: Settings Popover Toggle & Controls
  const settingsPopover = document.getElementById('npSettingsPopover');
  document.getElementById('npSettingsBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const willShow = settingsPopover?.classList.contains('hidden');
    settingsPopover?.classList.toggle('hidden', !willShow);
    document.getElementById('npSettingsBtn')?.classList.toggle('active', willShow);
  });

  document.getElementById('npSettingsCloseBtn')?.addEventListener('click', () => {
    settingsPopover?.classList.add('hidden');
    document.getElementById('npSettingsBtn')?.classList.remove('active');
  });

  // Settings Popover: Speed selection chips
  document.querySelectorAll('.np-pop-speed-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const spd = Number(btn.getAttribute('data-spd')) || 1;
      applyPlaybackSpeed(spd);
      document.querySelectorAll('.np-pop-speed-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      showPlayerToast(`⚡ Playback Speed: ${spd}x`);
    });
  });

  // Settings Popover: Sleep timer chips
  document.querySelectorAll('.np-pop-sleep-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const s = btn.getAttribute('data-sleep');
      const val = s === 'chapter' ? 'chapter' : Number(s) || 0;
      setSleepTimer(val);
    });
  });

  // Settings Popover: Quality Format Cycler
  const QUALITY_MODES = [
    { id: 'hq', label: 'HQ 320kbps MP3', desc: 'HQ 320kbps (Lossless Stream)' },
    { id: 'std', label: 'Standard 192kbps', desc: 'Standard 192kbps (Balanced)' },
    { id: 'eco', label: 'Data Saver 96kbps', desc: 'Data Saver 96kbps (Fast Buffer)' },
  ];

  const applyStreamFormat = (modeId, notify = false) => {
    const found = QUALITY_MODES.find((m) => m.id === modeId) || QUALITY_MODES[0];
    state.streamFormat = found.id;
    localStorage.setItem('bookflix_stream_format', found.id);
    const label = document.getElementById('npQualityFormatLabel');
    if (label) label.textContent = found.label;
    const studioTag = document.querySelector('.sp-hq-tag');
    if (studioTag) studioTag.textContent = `${found.label} Stream`;
    if (notify) {
      showPlayerToast(`⚡ Audio Quality: ${found.desc}`);
    }
  };

  document.getElementById('npQualityFormatBtn')?.addEventListener('click', () => {
    const curIdx = QUALITY_MODES.findIndex((m) => m.id === state.streamFormat);
    const nextIdx = (curIdx + 1) % QUALITY_MODES.length;
    applyStreamFormat(QUALITY_MODES[nextIdx].id, true);
  });

  // Settings Popover: Sound Profile / Spatial EQ Cycler
  const SOUND_PROFILES = [
    { id: 'stereo', label: 'Studio Stereo', desc: 'Studio Stereo (Pure Master)' },
    { id: 'spatial', label: 'Spatial 3D Audio', desc: 'Spatial 3D Audio (Immersive Soundstage)' },
    { id: 'voice', label: 'Voice Clarity EQ', desc: 'Voice Clarity EQ (Narrator Dialogue Boost)' },
  ];

  let audioCtx = null;
  let mediaSourceNode = null;
  let bassFilter = null;
  let voiceFilter = null;
  let trebleFilter = null;

  const applySoundProfile = (profileId, notify = false) => {
    const found = SOUND_PROFILES.find((p) => p.id === profileId) || SOUND_PROFILES[0];
    state.soundProfile = found.id;
    localStorage.setItem('bookflix_sound_profile', found.id);

    const label = document.getElementById('npAudioEffectLabel');
    if (label) label.textContent = found.label;

    // In default Studio Stereo mode, do NOT hijack native audio routing with Web Audio API.
    // This ensures 100% reliable hardware audio playback across iPhones, iPads, Android & Safari.
    if (found.id === 'stereo') {
      if (bassFilter && voiceFilter && trebleFilter) {
        bassFilter.gain.value = 0;
        voiceFilter.gain.value = 0;
        trebleFilter.gain.value = 0;
      }
      if (notify) showPlayerToast(`🎧 Sound Profile: ${found.desc}`);
      return;
    }

    try {
      if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioCtxClass();
        mediaSourceNode = audioCtx.createMediaElementSource(globalAudioElement);

        bassFilter = audioCtx.createBiquadFilter();
        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 200;

        voiceFilter = audioCtx.createBiquadFilter();
        voiceFilter.type = 'peaking';
        voiceFilter.frequency.value = 2400;
        voiceFilter.Q.value = 1.2;

        trebleFilter = audioCtx.createBiquadFilter();
        trebleFilter.type = 'highshelf';
        trebleFilter.frequency.value = 6000;

        mediaSourceNode.connect(bassFilter);
        bassFilter.connect(voiceFilter);
        voiceFilter.connect(trebleFilter);
        trebleFilter.connect(audioCtx.destination);
      }

      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      if (bassFilter && voiceFilter && trebleFilter) {
        if (found.id === 'spatial') {
          bassFilter.gain.value = 4.5;
          voiceFilter.gain.value = 1.0;
          trebleFilter.gain.value = 5.0;
        } else if (found.id === 'voice') {
          bassFilter.gain.value = -3.0;
          voiceFilter.gain.value = 6.0;
          trebleFilter.gain.value = 2.0;
        } else {
          bassFilter.gain.value = 0;
          voiceFilter.gain.value = 0;
          trebleFilter.gain.value = 0;
        }
      }
    } catch {
      // Audio processing fallback if browser restricts Web Audio
    }

    if (notify) {
      showPlayerToast(`🎧 Sound Profile: ${found.desc}`);
    }
  };

  document.getElementById('npAudioEffectBtn')?.addEventListener('click', () => {
    const curIdx = SOUND_PROFILES.findIndex((p) => p.id === state.soundProfile);
    const nextIdx = (curIdx + 1) % SOUND_PROFILES.length;
    applySoundProfile(SOUND_PROFILES[nextIdx].id, true);
  });

  // Restore saved settings on startup
  applyStreamFormat(state.streamFormat || 'hq', false);
  applySoundProfile(state.soundProfile || 'stereo', false);

  // Close Settings Popover on outside click
  document.addEventListener('click', (e) => {
    if (settingsPopover && !settingsPopover.classList.contains('hidden')) {
      if (!e.target.closest('#npSettingsPopover') && !e.target.closest('#npSettingsBtn')) {
        settingsPopover.classList.add('hidden');
        document.getElementById('npSettingsBtn')?.classList.remove('active');
      }
    }
  });

  // Ensure utility capsule bar is always visible
  localStorage.removeItem('bookflix_hide_capsule');
  document.getElementById('npUtilityCapsuleWrap')?.classList.remove('hidden');

  globalAudioElement.addEventListener('play', () => syncSpotifyPlaybackUI(true));
  globalAudioElement.addEventListener('pause', () => syncSpotifyPlaybackUI(false));

  globalAudioElement.addEventListener('timeupdate', () => {
    const cur = globalAudioElement.currentTime || 0;
    const dur = globalAudioElement.duration || 0;
    const fmtCur = formatAudioTime(cur);
    const fmtDur = isFinite(dur) && dur > 0 ? formatAudioTime(dur) : '0:00';

    const curEl = document.getElementById('spBarCurrentTime');
    const durEl = document.getElementById('spBarDuration');
    const npCurEl = document.getElementById('npCurrentTime');
    const npDurEl = document.getElementById('npDuration');

    if (curEl) curEl.textContent = fmtCur;
    if (npCurEl) npCurEl.textContent = fmtCur;
    if (isFinite(dur) && dur > 0) {
      if (durEl) durEl.textContent = fmtDur;
      if (npDurEl) npDurEl.textContent = fmtDur;
      const pct = String((cur / dur) * 100);
      if (seekSlider) seekSlider.value = pct;
      if (npSeekSlider) npSeekSlider.value = pct;
    }
  });

  globalAudioElement.addEventListener('loadedmetadata', () => {
    const dur = globalAudioElement.duration || 0;
    if (isFinite(dur) && dur > 0) {
      const fmtDur = formatAudioTime(dur);
      const durEl = document.getElementById('spBarDuration');
      const npDurEl = document.getElementById('npDuration');
      if (durEl) durEl.textContent = fmtDur;
      if (npDurEl) npDurEl.textContent = fmtDur;
    }
  });

  globalAudioElement.addEventListener('ended', () => {
    if (state.sleepTimerPauseAtEnd) {
      setSleepTimer(0);
      syncSpotifyPlaybackUI(false);
      showPlayerToast('💤 Chapter ended. Sleep timer paused audio.');
      return;
    }
    playNextTrack(true);
  });

  document.getElementById('closeAudioBarBtn')?.addEventListener('click', () => {
    globalAudioElement.pause();
    bottomAudioBar.classList.add('hidden');
    closeNowPlayingOverlay();
  });
}

async function fetchLiveSuggestions(query, category) {
  searchDropdown.classList.remove('hidden');
  dropdownStatusText.textContent = `Searching "${query}"...`;
  dropdownList.innerHTML = '';

  try {
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(category)}`
    );
    const data = await res.json();
    const topItems = (data.items || []).slice(0, 6);

    if (topItems.length === 0) {
      dropdownStatusText.textContent = 'No exact matches found';
      return;
    }

    dropdownStatusText.textContent = 'Best Matches';
    dropdownList.innerHTML = '';

    topItems.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'dropdown-item';
      const thumbSrc =
        item.cover ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=120&q=60';

      row.innerHTML = `
        <img src="${escapeAttr(thumbSrc)}" alt="" class="dropdown-thumb" onerror="this.style.visibility='hidden'" />
        <div class="dropdown-meta">
          <div class="dropdown-title">${escapeHtml(item.title)}</div>
          <div class="dropdown-sub">${escapeHtml(item.author || 'Unknown Author')} ${item.year ? '• ' + escapeHtml(String(item.year)) : ''}</div>
        </div>
        <span class="dropdown-badge">${escapeHtml(item.type || 'Book')}</span>
      `;
      row.addEventListener('click', () => {
        searchDropdown.classList.add('hidden');
        openItemModal(item);
      });
      dropdownList.appendChild(row);
    });
  } catch {
    dropdownStatusText.textContent = 'Press Enter to search';
  }
}

function handleTabSwitch(tab) {
  searchResultsSection.classList.add('hidden');
  myListSection.classList.add('hidden');
  categoriesSection.classList.add('hidden');
  catalogRowsContainer.classList.add('hidden');
  heroSection.classList.add('hidden');

  if (tab === 'search') {
    heroSection.classList.remove('hidden');
    catalogRowsContainer.classList.remove('hidden');
    searchInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (tab === 'home') {
    heroSection.classList.remove('hidden');
    catalogRowsContainer.classList.remove('hidden');
    renderContinueRow();
  } else if (tab === 'mylist') {
    myListSection.classList.remove('hidden');
    renderMyListGrid();
  } else if (tab === 'categories') {
    categoriesSection.classList.remove('hidden');
  } else if (tab === 'ebook') {
    executeSearch('bestseller OR computer science OR novel OR history', 'ebook', 'Books & Textbooks');
  } else if (tab === 'manga') {
    executeSearch('popular', 'manga', 'Manga, Manhwa & Webtoons');
  } else if (tab === 'comic') {
    executeSearch('batman OR spider-man OR marvel OR star wars', 'comic', 'Comics & Graphic Novels');
  } else if (tab === 'audiobook') {
    executeSearch('harry potter OR sherlock OR stephen king OR fantasy', 'audiobook', 'Unabridged Audiobooks');
  }
}

async function executeSearch(query, category = 'all', customHeading = null) {
  heroSection.classList.add('hidden');
  catalogRowsContainer.classList.add('hidden');
  myListSection.classList.add('hidden');
  categoriesSection.classList.add('hidden');
  searchResultsSection.classList.remove('hidden');
  topMatchSpotlight.classList.add('hidden');

  state.searchQuery = query;
  state.searchCategory = category;
  state.searchPage = 1;
  state.searchHasMore = true;
  state.isFetchingMore = false;
  state.activeSearchFilter = 'all';

  const loadMoreWrap = document.getElementById('loadMoreWrap');
  if (loadMoreWrap) loadMoreWrap.classList.add('hidden');

  searchResultsTitle.textContent = customHeading || `Results for "${query}"`;
  searchResultsSubtitle.textContent = 'Ranking exact title and author matches first...';
  searchResultsGrid.innerHTML = `
    <div class="loading-state" style="grid-column: 1 / -1;">
      <div class="spinner"></div>
      <p>Searching across all catalogs...</p>
    </div>
  `;

  try {
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(category)}&page=1`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.searchItems = data.items || [];
    state.searchHasMore = state.searchItems.length >= 6;
    renderFilteredSearchResults();
  } catch (err) {
    console.warn('Search API notice:', err);
    const qLower = query.toLowerCase();
    const fallbackList = (state.heroSuggestions || HERO_SUGGESTIONS).filter((item) =>
      item.title.toLowerCase().includes(qLower) ||
      (item.author && item.author.toLowerCase().includes(qLower)) ||
      (category !== 'all' && item.type === category)
    );
    if (fallbackList.length > 0) {
      state.searchItems = fallbackList;
      renderFilteredSearchResults();
    } else {
      searchResultsGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1 / -1;">
          <p>No titles found for "${escapeHtml(query)}". Try another query or switch categories.</p>
        </div>
      `;
    }
  }
}

async function loadMoreSearchResults() {
  if (state.isFetchingMore || !state.searchHasMore || !state.searchQuery) return;
  state.isFetchingMore = true;

  const loadMoreBtnText = document.getElementById('loadMoreBtnText');
  if (loadMoreBtnText) loadMoreBtnText.textContent = 'Loading More Titles...';

  const nextPage = state.searchPage + 1;
  const cat = state.searchCategory || 'all';
  const pool = SECTION_QUERY_POOLS[cat];

  // If browsing a section, we can fetch both next page AND rotate secondary topic pool if needed
  let queryToUse = state.searchQuery;
  let pageToUse = nextPage;
  if (pool && pool.includes(state.searchQuery) && nextPage > 3) {
    queryToUse = pool[(nextPage - 1) % pool.length];
    pageToUse = Math.max(1, Math.floor((nextPage - 1) / pool.length) + 1);
  }

  try {
    let res = await fetch(
      `/api/search?q=${encodeURIComponent(queryToUse)}&type=${encodeURIComponent(cat)}&page=${pageToUse}`
    );
    let data = await res.json();
    let incoming = data.items || [];

    // Fallback to rotated pool query if primary query exhausted on this page
    if (incoming.length < 4 && pool) {
      const altQuery = pool[(nextPage - 1) % pool.length];
      if (altQuery && altQuery !== queryToUse) {
        res = await fetch(
          `/api/search?q=${encodeURIComponent(altQuery)}&type=${encodeURIComponent(cat)}&page=1`
        );
        data = await res.json();
        incoming = data.items || [];
      }
    }

    const existingIds = new Set(state.searchItems.map((x) => x.id));
    const existingTitles = new Set(
      state.searchItems.map((x) => `${x.type}:${(x.title || '').toLowerCase().trim()}`)
    );

    const freshItems = incoming.filter((item) => {
      const tKey = `${item.type}:${(item.title || '').toLowerCase().trim()}`;
      if (existingIds.has(item.id) || existingTitles.has(tKey)) return false;
      existingIds.add(item.id);
      existingTitles.add(tKey);
      return true;
    });

    state.searchPage = nextPage;

    if (freshItems.length > 0) {
      state.searchItems.push(...freshItems);
      freshItems.forEach((item) => {
        if (state.activeSearchFilter === 'all' || item.type === state.activeSearchFilter) {
          searchResultsGrid.appendChild(createBookCard(item));
        }
      });
      searchResultsSubtitle.textContent = `${state.searchItems.length} editions loaded — scroll for more.`;
      state.searchHasMore = nextPage < 15;
    } else {
      state.searchHasMore = false;
    }
  } catch {
    // Keep button active for retry
  } finally {
    state.isFetchingMore = false;
    const loadMoreWrap = document.getElementById('loadMoreWrap');
    if (loadMoreWrap) {
      loadMoreWrap.classList.toggle('hidden', !state.searchHasMore);
    }
    if (loadMoreBtnText) {
      loadMoreBtnText.textContent = state.searchHasMore ? 'Load More Titles' : 'All Titles Loaded';
    }
  }
}

function renderFilteredSearchResults() {
  let list = [...state.searchItems];

  if (state.activeSearchFilter !== 'all') {
    list = list.filter((item) => item.type === state.activeSearchFilter);
  }

  if (state.activeSearchSort === 'title') {
    list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (state.activeSearchSort === 'rating') {
    list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  }

  searchResultsSubtitle.textContent = `${list.length} editions sorted by relevance.`;
  searchResultsGrid.innerHTML = '';

  const loadMoreWrap = document.getElementById('loadMoreWrap');
  if (loadMoreWrap) {
    loadMoreWrap.classList.toggle('hidden', !state.searchHasMore || list.length === 0);
  }

  if (list.length === 0) {
    topMatchSpotlight.classList.add('hidden');
    searchResultsGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-secondary);">No matches found in this filter.</p>`;
    return;
  }

  // Highlight #1 Top Match right at the top!
  const bestItem = list[0];
  topMatchSpotlight.classList.remove('hidden');
  const bestCover =
    bestItem.cover ||
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';

  topMatchSpotlight.innerHTML = `
    <img src="${escapeAttr(bestCover)}" alt="${escapeAttr(bestItem.title)}" class="top-match-cover" onerror="this.style.display='none'" />
    <div class="top-match-info">
      <span class="top-match-badge">Top Match • ${escapeHtml((bestItem.type || 'Book').toUpperCase())}</span>
      <div class="top-match-title">${escapeHtml(bestItem.title)}</div>
      <div class="top-match-author">${escapeHtml(bestItem.author || 'Unknown Author')} ${bestItem.year ? '• ' + escapeHtml(String(bestItem.year)) : ''}</div>
      <div class="top-match-desc">${escapeHtml((bestItem.description || '').slice(0, 220))}</div>
      <div class="hero-actions">
        <button class="btn btn-primary btn-sm" id="topMatchOpenBtn">Open Edition</button>
      </div>
    </div>
  `;
  document.getElementById('topMatchOpenBtn').addEventListener('click', () => openItemModal(bestItem));

  // Render all items in the grid as well
  list.forEach((item) => {
    searchResultsGrid.appendChild(createBookCard(item));
  });
}

const DEVICE_PRESET_SPECS = {
  auto: {
    title: '✨ Auto-Detect Responsive Engine Active',
    desc: 'Automatically adapts UI for Phones (Bottom Glass Dock), iPads (Touch Rail), Desktops (Hover Rail), and Smart TVs (10-Foot Scale + D-Pad Remote).',
    caption: 'Scan with your Phone, iPad, or Smart TV camera on the same Wi-Fi',
  },
  phone: {
    title: '📱 Phone Mode (iOS & Android Optimized)',
    desc: 'Floating Bottom Liquid-Glass Navigation Bar, 100% full-width stage, 2-column touch book grids, swipeable shelves & full-screen sheet reader.',
    caption: 'Scan on iPhone or Android to open directly in Phone Layout',
  },
  ipad: {
    title: '📟 iPad & Tablet Mode (Touch Dock Optimized)',
    desc: 'Labeled touch sidebar rail (no mouse hover needed), 3-to-4 column tablet grids, touch momentum carousels & split overview modal.',
    caption: 'Scan on iPad or Android Tablet to open in Tablet Layout',
  },
  desktop: {
    title: '💻 Desktop & Laptop Mode (Full Studio UI)',
    desc: 'JioHotstar expanding hover glass rail, 2-column 3D cover showcase hero banner, wide horizontal shelves & keyboard shortcuts.',
    caption: 'Share or scan to open in Desktop Widescreen Layout',
  },
  tv: {
    title: '📺 Smart TV & 4K Living Room Mode (10-Foot UI)',
    desc: 'Scaled 10-foot living room typography, oversized book cards, high-contrast glass & full TV Remote D-Pad Arrow-Key spatial navigation.',
    caption: 'Scan or open on Smart TV browser for 10-Foot Remote Mode',
  },
};

let currentLanBaseUrl = '';
let selectedLanDeviceMode = 'auto';

function applyDeviceModeToDocument(mode) {
  const valid = ['auto', 'phone', 'ipad', 'desktop', 'tv'].includes(mode) ? mode : 'auto';
  selectedLanDeviceMode = valid;
  if (valid === 'auto') {
    // Check if running on Smart TV, iPad or Tablet user-agent
    const ua = navigator.userAgent || '';
    if (/SmartTV|Tizen|Web0S|BRAVIA|AFTT|AFTM|Android TV|AppleTV|Large Screen/i.test(ua)) {
      document.documentElement.setAttribute('data-device', 'tv');
    } else if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) {
      document.documentElement.setAttribute('data-device', 'ipad');
    } else {
      document.documentElement.removeAttribute('data-device');
    }
    localStorage.removeItem('bookflix_device_mode');
  } else {
    document.documentElement.setAttribute('data-device', valid);
    localStorage.setItem('bookflix_device_mode', valid);
  }
}

function initMultiDeviceOptimization() {
  const params = new URLSearchParams(window.location.search);
  const urlDevice = params.get('device');
  const savedDevice = localStorage.getItem('bookflix_device_mode');
  if (urlDevice && ['auto', 'phone', 'ipad', 'desktop', 'tv'].includes(urlDevice)) {
    applyDeviceModeToDocument(urlDevice);
  } else if (savedDevice && ['phone', 'ipad', 'desktop', 'tv'].includes(savedDevice)) {
    applyDeviceModeToDocument(savedDevice);
  } else {
    applyDeviceModeToDocument('auto');
  }

  // Mobile top brand button -> Home
  document.getElementById('mobileLogoBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.rail-item[data-tab="home"]')?.click();
  });

  // Make genre tiles focusable for TV remote
  document.querySelectorAll('.genre-tile').forEach((tile) => {
    tile.tabIndex = 0;
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tile.click();
      }
    });
  });

  // Spatial D-Pad / Arrow-Key Navigation for Smart TVs & Keyboard
  window.addEventListener('keydown', (e) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
      return;
    }

    // Collect visible focusable elements inside active modal or main page
    let scope = document;
    const readerModalEl = document.getElementById('readerModal');
    const lanModalEl = document.getElementById('lanModal');
    if (lanModalEl && !lanModalEl.classList.contains('hidden')) {
      scope = lanModalEl;
    } else if (readerModalEl && !readerModalEl.classList.contains('hidden')) {
      scope = readerModalEl;
    }

    const candidates = Array.from(
      scope.querySelectorAll(
        'button:not([disabled]), a[href], .book-card, .genre-tile, .source-card, input:not([type="hidden"])'
      )
    ).filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
    });

    if (candidates.length === 0) return;
    if (!active || !candidates.includes(active)) {
      return; // Let normal tab or first interaction start focus
    }

    e.preventDefault();
    const curRect = active.getBoundingClientRect();
    const curCx = curRect.left + curRect.width / 2;
    const curCy = curRect.top + curRect.height / 2;

    let bestEl = null;
    let bestScore = Infinity;

    for (const el of candidates) {
      if (el === active) continue;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = cx - curCx;
      const dy = cy - curCy;

      let validDir = false;
      let primaryDist = 0;
      let orthoDist = 0;

      if (e.key === 'ArrowRight' && dx > 12) {
        validDir = true;
        primaryDist = dx;
        orthoDist = Math.abs(dy);
      } else if (e.key === 'ArrowLeft' && dx < -12) {
        validDir = true;
        primaryDist = -dx;
        orthoDist = Math.abs(dy);
      } else if (e.key === 'ArrowDown' && dy > 12) {
        validDir = true;
        primaryDist = dy;
        orthoDist = Math.abs(dx);
      } else if (e.key === 'ArrowUp' && dy < -12) {
        validDir = true;
        primaryDist = -dy;
        orthoDist = Math.abs(dx);
      }

      if (validDir) {
        const score = primaryDist + orthoDist * 2.4;
        if (score < bestScore) {
          bestScore = score;
          bestEl = el;
        }
      }
    }

    if (bestEl) {
      bestEl.focus({ preventScroll: false });
      bestEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  });
}

async function openLanHostModal() {
  const lanModal = document.getElementById('lanModal');
  if (!lanModal) return;
  lanModal.classList.remove('hidden');

  const lanUrlInput = document.getElementById('lanUrlInput');
  const localUrlInput = document.getElementById('localUrlInput');
  const lanQrImg = document.getElementById('lanQrImg');
  const lanQrCaption = document.getElementById('lanQrCaption');
  const lanAdaptersList = document.getElementById('lanAdaptersList');
  const lanDevicePills = document.getElementById('lanDevicePills');
  const lanDeviceSpecBanner = document.getElementById('lanDeviceSpecBanner');
  const applyDeviceLayoutHereBtn = document.getElementById('applyDeviceLayoutHereBtn');

  const buildUrlWithDevice = (baseUrl, devMode) => {
    if (!baseUrl) return window.location.origin;
    if (!devMode || devMode === 'auto') return baseUrl;
    const sep = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}/${sep}device=${encodeURIComponent(devMode)}`.replace('//?', '/?');
  };

  const refreshQrAndSpecs = () => {
    const finalUrl = buildUrlWithDevice(currentLanBaseUrl || window.location.origin, selectedLanDeviceMode);
    if (lanUrlInput) lanUrlInput.value = finalUrl;
    if (lanQrImg) {
      lanQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&data=${encodeURIComponent(
        finalUrl
      )}`;
    }
    const spec = DEVICE_PRESET_SPECS[selectedLanDeviceMode] || DEVICE_PRESET_SPECS.auto;
    if (lanQrCaption) lanQrCaption.textContent = spec.caption;
    if (lanDeviceSpecBanner) {
      lanDeviceSpecBanner.innerHTML = `
        <strong>${escapeHtml(spec.title)}</strong>
        <span>${escapeHtml(spec.desc)}</span>
      `;
    }
    if (lanDevicePills) {
      lanDevicePills.querySelectorAll('.lan-device-pill').forEach((p) => {
        p.classList.toggle('active', p.getAttribute('data-devmode') === selectedLanDeviceMode);
      });
    }
  };

  if (lanDevicePills && !lanDevicePills.dataset.bound) {
    lanDevicePills.dataset.bound = 'true';
    lanDevicePills.querySelectorAll('.lan-device-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        selectedLanDeviceMode = pill.getAttribute('data-devmode') || 'auto';
        refreshQrAndSpecs();
      });
    });
  }

  if (applyDeviceLayoutHereBtn && !applyDeviceLayoutHereBtn.dataset.bound) {
    applyDeviceLayoutHereBtn.dataset.bound = 'true';
    applyDeviceLayoutHereBtn.addEventListener('click', () => {
      applyDeviceModeToDocument(selectedLanDeviceMode);
      const orig = applyDeviceLayoutHereBtn.textContent;
      applyDeviceLayoutHereBtn.textContent = `Applied: ${selectedLanDeviceMode.toUpperCase()} Layout!`;
      setTimeout(() => {
        applyDeviceLayoutHereBtn.textContent = orig;
      }, 1600);
    });
  }

  try {
    const res = await fetch('/api/network-info');
    const info = await res.json();
    currentLanBaseUrl = info.lanUrl || window.location.origin;
    if (localUrlInput) localUrlInput.value = info.localUrl || 'http://localhost:3000';
    refreshQrAndSpecs();

    if (lanAdaptersList) {
      lanAdaptersList.innerHTML = '';
      const adapters = info.allLanUrls || [];
      if (adapters.length === 0) {
        lanAdaptersList.innerHTML = `<span class="lan-adapter-pill active">${escapeHtml(currentLanBaseUrl)}</span>`;
      } else {
        adapters.forEach((entry, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `lan-adapter-pill${idx === 0 ? ' active' : ''}`;
          btn.textContent = `${entry.adapter}: ${entry.ip}`;
          btn.addEventListener('click', () => {
            lanAdaptersList.querySelectorAll('.lan-adapter-pill').forEach((p) => p.classList.remove('active'));
            btn.classList.add('active');
            currentLanBaseUrl = entry.url;
            refreshQrAndSpecs();
          });
          lanAdaptersList.appendChild(btn);
        });
      }
    }
  } catch {
    currentLanBaseUrl = window.location.origin;
    refreshQrAndSpecs();
  }
}

function renderSourcesDirectory(sources) {
  const allEntries = [
    ...(sources.ebooks || []).map((s) => ({ name: s, cat: 'Books & Literature', tab: 'ebook' })),
    ...(sources.manga || []).map((s) => ({ name: s, cat: 'Manga & Manhwa', tab: 'manga' })),
    ...(sources.comics || []).map((s) => ({ name: s, cat: 'Comics & Graphic Novels', tab: 'comic' })),
    ...(sources.audiobooks || []).map((s) => ({ name: s, cat: 'Audiobooks Studio', tab: 'audiobook' })),
    ...(sources.readers || []).map((s) => ({ name: s, cat: 'Built-in Reader Engine', tab: 'ebook' })),
  ];

  sourcesGrid.innerHTML = '';
  allEntries.forEach((entry) => {
    const div = document.createElement('div');
    div.className = 'source-card';
    div.innerHTML = `
      <div>
        <div class="source-name">${escapeHtml(entry.name)}</div>
        <div class="source-cat">${escapeHtml(entry.cat)}</div>
      </div>
    `;
    div.addEventListener('click', () => {
      document.querySelector(`.rail-item[data-tab="${entry.tab}"]`)?.click();
    });
    sourcesGrid.appendChild(div);
  });
}

// ============================================================================
// 3. UNIVERSAL ITEM MODAL & DEEP STREAM RESOLVER
// ============================================================================

async function openItemModal(item, autoPlayAudio = false) {
  state.currentItem = item;
  state.currentResolved = null;
  saveToHistory(item);

  readerModal.classList.remove('hidden');
  switchReaderMode('overview');

  tabBookReader.classList.add('hidden');
  tabPdfReader.classList.add('hidden');
  tabFlowReader.classList.add('hidden');
  tabMangaReader.classList.add('hidden');
  tabAudioPlayer.classList.add('hidden');

  bookReaderIframe.src = 'about:blank';
  pdfReaderIframe.src = 'about:blank';

  modalTypeBadge.textContent = (item.type || 'book').toUpperCase();
  modalTitle.textContent = item.title;
  modalAuthor.textContent = item.author || 'Digital Edition';
  modalCoverImg.src =
    item.cover ||
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
  modalDescription.textContent = item.description || '';

  modalMetaPills.innerHTML = `
    <span class="meta-pill">${escapeHtml(item.sourceBadge || 'Digital Catalog')}</span>
    <span class="meta-pill">${escapeHtml(item.format || 'PDF / EPUB')}</span>
    ${item.year ? `<span class="meta-pill">${escapeHtml(String(item.year))}</span>` : ''}
  `;

  updateModalBookmarkButton();

  // If audiobook already has preloaded tracks, show Spotify Studio immediately
  if (item.type === 'audiobook' && item.audioTracks && item.audioTracks.length > 0) {
    tabAudioPlayer.classList.remove('hidden');
    setupAudioStudio(item, item.audioTracks);
    switchReaderMode('audioplayer');
    if (autoPlayAudio) {
      playAudioTrack(0);
    }
  }

  resolverStatus.classList.remove('hidden');
  instantReadButtons.innerHTML = '';
  directDownloadButtons.innerHTML = '';
  modalMirrorsList.innerHTML = '';

  try {
    const q = new URLSearchParams({
      iaId: item.iaId || '',
      mangaId: item.mangaId || '',
      title: item.title || '',
      author: item.author || '',
      type: item.type || 'ebook',
      gutenbergId: item.gutenbergId || '',
      directPdfUrl: item.directPdfUrl || '',
    });

    const res = await fetch(`/api/resolve?${q.toString()}`);
    const resolved = await res.json();

    if (item.audioTracks && item.audioTracks.length > 0 && (!resolved.audioTracks || resolved.audioTracks.length === 0)) {
      resolved.audioTracks = item.audioTracks;
    }
    if (item.directDownloadUrl && !resolved.cbrUrl) {
      resolved.cbrUrl = item.directDownloadUrl;
    }

    state.currentResolved = resolved;
    resolverStatus.classList.add('hidden');
    populateModalActions(item, resolved, autoPlayAudio);
  } catch (err) {
    resolverStatus.innerHTML = `<span>Notice: ${escapeHtml(err.message)}</span>`;
  }
}

function populateModalActions(item, resolved, autoPlayAudio = false) {
  instantReadButtons.innerHTML = '';
  directDownloadButtons.innerHTML = '';

  const safeTitle = (item.title || 'BookFlix_Edition').replace(/[^\w.\- ()]/g, '_');

  // 1. MANGA CHAPTERS STREAMING
  if (resolved.mangaChapters && resolved.mangaChapters.length > 0) {
    tabMangaReader.classList.remove('hidden');
    state.mangaChapters = resolved.mangaChapters;
    mangaChapterSelect.innerHTML = resolved.mangaChapters
      .map(
        (c, i) =>
          `<option value="${i}">Ch. ${escapeHtml(String(c.chapter))} — ${escapeHtml(c.title)} (${c.pages}p [${c.lang}])</option>`
      )
      .join('');

    const readMangaBtn = createActionButton(
      `Read Manga (${resolved.mangaChapters.length} Chapters)`,
      'btn-primary',
      () => {
        switchReaderMode('mangareader');
        loadMangaChapterByIndex(0);
      }
    );
    instantReadButtons.appendChild(readMangaBtn);
  }

  // 2. AUDIOBOOK MULTI-CHAPTER STUDIO PLAYER
  if (resolved.audioTracks && resolved.audioTracks.length > 0) {
    tabAudioPlayer.classList.remove('hidden');
    setupAudioStudio(item, resolved.audioTracks);

    if (item.type === 'audiobook') {
      switchReaderMode('audioplayer');
      if (autoPlayAudio && globalAudioElement.paused) {
        playAudioTrack(0);
      }
    }

    const listenBtn = createActionButton(
      `Listen Now (${resolved.audioTracks.length} Tracks)`,
      'btn-primary',
      () => {
        switchReaderMode('audioplayer');
        playAudioTrack(0);
      }
    );
    instantReadButtons.appendChild(listenBtn);

    const dlAudioUrl = `/api/download?url=${encodeURIComponent(
      resolved.audioTracks[0].url
    )}&filename=${encodeURIComponent(safeTitle + '_Ch01.mp3')}`;
    directDownloadButtons.appendChild(
      createLinkButton('Download Track 01 (MP3)', dlAudioUrl, 'btn-secondary')
    );
  }

  // 3. INTERACTIVE 2-PAGE FLIP BOOK / COMIC READER
  if (resolved.embedReaderUrl) {
    tabBookReader.classList.remove('hidden');
    const flipBtn = createActionButton('Open Page-Flip Reader', 'btn-primary', () => {
      bookReaderIframe.src = resolved.embedReaderUrl;
      switchReaderMode('bookreader');
    });
    instantReadButtons.appendChild(flipBtn);
  }

  // 4. PDF STREAM & DOWNLOAD
  if (resolved.pdfUrl) {
    tabPdfReader.classList.remove('hidden');
    const proxiedPdfStream = `/api/stream?url=${encodeURIComponent(resolved.pdfUrl)}`;
    const proxiedPdfDownload = `/api/download?url=${encodeURIComponent(
      resolved.pdfUrl
    )}&filename=${encodeURIComponent(safeTitle + '.pdf')}`;

    const pdfReadBtn = createActionButton('Open PDF Viewer', 'btn-primary', () => {
      pdfReaderIframe.src = proxiedPdfStream;
      switchReaderMode('pdfreader');
    });
    instantReadButtons.appendChild(pdfReadBtn);

    directDownloadButtons.appendChild(
      createLinkButton('Download PDF', proxiedPdfDownload, 'btn-primary')
    );
  }

  // 5. FLOW REFLOWABLE EPUB & FULL-TEXT READER + DOWNLOAD
  if (resolved.epubUrl || resolved.txtUrl || resolved.htmlUrl) {
    tabFlowReader.classList.remove('hidden');
    const flowBtn = createActionButton('Open Flow Reader', 'btn-secondary', () => {
      switchReaderMode('flowreader');
      loadFlowOssReader(resolved);
    });
    instantReadButtons.appendChild(flowBtn);

    if (resolved.epubUrl) {
      const proxiedEpubDownload = `/api/download?url=${encodeURIComponent(
        resolved.epubUrl
      )}&filename=${encodeURIComponent(safeTitle + '.epub')}`;
      directDownloadButtons.appendChild(
        createLinkButton('Download EPUB', proxiedEpubDownload, 'btn-secondary')
      );
    }
    if (resolved.txtUrl) {
      const proxiedTxtDownload = `/api/download?url=${encodeURIComponent(
        resolved.txtUrl
      )}&filename=${encodeURIComponent(safeTitle + '.txt')}`;
      directDownloadButtons.appendChild(
        createLinkButton('Download Text (.TXT)', proxiedTxtDownload, 'btn-secondary')
      );
    }
  }

  // 6. COMIC CBR / CBZ DOWNLOAD
  if (resolved.cbrUrl) {
    const proxiedComicDownload = `/api/download?url=${encodeURIComponent(
      resolved.cbrUrl
    )}&filename=${encodeURIComponent(safeTitle + '.cbr')}`;
    directDownloadButtons.appendChild(
      createLinkButton('Download Comic Archive (CBR/PDF)', proxiedComicDownload, 'btn-primary')
    );
  }

  if (instantReadButtons.children.length === 0) {
    const fallbackBtn = createActionButton(
      'Find Alternate Full-Text Edition',
      'btn-primary',
      () => {
        closeReaderModal();
        executeSearch(item.title, 'all');
      }
    );
    instantReadButtons.appendChild(fallbackBtn);
  }

  if (directDownloadButtons.children.length === 0) {
    directDownloadButtons.innerHTML = `<span style="color: var(--text-secondary); font-size: 0.85rem;">Use the in-app reader above or click Find Alternate Edition.</span>`;
  }

  modalMirrorsList.innerHTML = (resolved.mirrorsChecked || [])
    .map((m) => `<span class="mirror-tag">${escapeHtml(m)}</span>`)
    .join('');
}

function switchReaderMode(mode) {
  document.querySelectorAll('.mode-tab').forEach((t) => {
    t.classList.toggle('active', t.getAttribute('data-mode') === mode);
  });

  document.getElementById('paneOverview').classList.toggle('hidden', mode !== 'overview');
  document.getElementById('paneBookReader').classList.toggle('hidden', mode !== 'bookreader');
  document.getElementById('panePdfReader').classList.toggle('hidden', mode !== 'pdfreader');
  document.getElementById('paneFlowReader').classList.toggle('hidden', mode !== 'flowreader');
  document.getElementById('paneMangaReader').classList.toggle('hidden', mode !== 'mangareader');
  document.getElementById('paneAudioPlayer').classList.toggle('hidden', mode !== 'audioplayer');

  if (mode === 'bookreader' && state.currentResolved?.embedReaderUrl && bookReaderIframe.src === 'about:blank') {
    bookReaderIframe.src = state.currentResolved.embedReaderUrl;
  }
  if (mode === 'pdfreader' && state.currentResolved?.pdfUrl && pdfReaderIframe.src === 'about:blank') {
    pdfReaderIframe.src = `/api/stream?url=${encodeURIComponent(state.currentResolved.pdfUrl)}`;
  }
  if (mode === 'flowreader' && state.currentResolved) {
    loadFlowOssReader(state.currentResolved);
  }
  if (mode === 'mangareader' && state.mangaChapters.length > 0 && mangaPagesContainer.children.length <= 1) {
    loadMangaChapterByIndex(0);
  }
}

function closeReaderModal() {
  readerModal.classList.add('hidden');
  bookReaderIframe.src = 'about:blank';
  pdfReaderIframe.src = 'about:blank';
}

// ============================================================================
// 4. FLOW CLIENT-SIDE EPUB & REFLOWABLE TEXT READER ENGINE
// ============================================================================

async function loadFlowOssReader(resolved) {
  flowArticle.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Formatting Reflowable Edition...</p></div>`;
  epubChapterGroup.style.display = 'none';

  if (resolved.htmlUrl || resolved.txtUrl) {
    try {
      const target = resolved.htmlUrl || resolved.txtUrl;
      const res = await fetch(`/api/read-text?url=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (data.content) {
        if (data.isHtml) {
          const clean = data.content
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '');
          flowArticle.innerHTML = clean;
        } else {
          flowArticle.textContent = data.content;
        }
        return;
      }
    } catch {
      // Fallback to EPUB unpacking below
    }
  }

  if (resolved.epubUrl && window.JSZip) {
    try {
      const epubStreamUrl = `/api/stream?url=${encodeURIComponent(resolved.epubUrl)}`;
      const res = await fetch(epubStreamUrl);
      const blob = await res.blob();
      const zip = await window.JSZip.loadAsync(blob);
      state.epubZip = zip;

      const htmlFiles = Object.keys(zip.files)
        .filter((name) => /\.(xhtml|html|htm)$/i.test(name) && !/toc|nav|cover/i.test(name))
        .sort();

      if (htmlFiles.length > 0) {
        state.epubSpinePaths = htmlFiles;
        epubChapterGroup.style.display = 'flex';
        epubChapterSelect.innerHTML = htmlFiles
          .map((f, i) => `<option value="${i}">Section ${i + 1} (${f.split('/').pop()})</option>`)
          .join('');
        await renderEpubSpineChapter(0);
        return;
      }
    } catch (err) {
      flowArticle.textContent = `Could not unpack EPUB in browser (${err.message}). Please use Page Flip, PDF Viewer, or Download EPUB.`;
      return;
    }
  }

  flowArticle.textContent = 'Select Page Flip or PDF Viewer above to read this edition.';
}

async function renderEpubSpineChapter(index) {
  if (!state.epubZip || !state.epubSpinePaths[index]) return;
  epubChapterSelect.value = String(index);
  const path = state.epubSpinePaths[index];
  const rawHtml = await state.epubZip.file(path).async('string');
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const inner = bodyMatch ? bodyMatch[1] : rawHtml;
  flowArticle.innerHTML = inner
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  flowContentContainer.scrollTop = 0;
}

// ============================================================================
// 5. MANGA / MANHWA VERTICAL WEBTOON READER ENGINE
// ============================================================================

async function loadMangaChapterByIndex(index) {
  const chap = state.mangaChapters[index];
  if (!chap) return;
  state.currentMangaChapIndex = index;
  mangaChapterSelect.value = String(index);

  mangaPagesContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Streaming Chapter ${escapeHtml(String(chap.chapter))} (${escapeHtml(chap.title)})...</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/manga-pages?chapterId=${encodeURIComponent(chap.id)}`);
    const data = await res.json();
    const pages = data.pages || [];
    if (pages.length === 0) {
      mangaPagesContainer.innerHTML = `<p class="manga-placeholder">No pages found for this chapter. Try selecting another chapter.</p>`;
      return;
    }

    mangaPagesContainer.innerHTML = '';
    pages.forEach((p) => {
      const img = document.createElement('img');
      img.src = p.url;
      img.alt = `Page ${p.page}`;
      img.className = 'manga-page-img';
      img.loading = 'lazy';
      mangaPagesContainer.appendChild(img);
    });
    mangaPagesContainer.scrollTop = 0;
  } catch (err) {
    mangaPagesContainer.innerHTML = `<p class="manga-placeholder">Error loading manga pages: ${escapeHtml(err.message)}</p>`;
  }
}

// ============================================================================
// 6. PERSISTENT AUDIOBOOK STUDIO PLAYER & LIQUID-GLASS NOW PLAYING OVERLAY
// ============================================================================

function setupAudioStudio(item, tracks) {
  const coverUrl =
    item.cover ||
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=500&q=80';
  const authorName = item.author || 'LibriVox Studio Narrator';

  state.currentAudioBookItem = item;
  state.audioPlaylist = tracks.map((t) => ({
    ...t,
    bookTitle: item.title,
    author: authorName,
    cover: coverUrl,
  }));

  audioStudioCover.src = coverUrl;
  audioStudioTitle.textContent = item.title;
  audioChapterCount.textContent = String(tracks.length);

  const authorEl = document.getElementById('audioStudioAuthor');
  if (authorEl) authorEl.textContent = authorName;

  const headerGlow = document.getElementById('spHeaderGlow');
  if (headerGlow) {
    headerGlow.style.backgroundImage = `linear-gradient(180deg, rgba(56, 189, 248, 0.28) 0%, rgba(99, 102, 241, 0.18) 45%, rgba(8, 12, 24, 0.96) 100%), url("${coverUrl}")`;
  }

  audioChaptersList.innerHTML = '';
  const npDrawerList = document.getElementById('npDrawerChaptersList');
  if (npDrawerList) npDrawerList.innerHTML = '';

  const safeTitle = (item.title || 'Audiobook').replace(/[^\w.\- ()]/g, '_');

  state.audioPlaylist.forEach((track, idx) => {
    const row = document.createElement('div');
    row.className = 'sp-track-row';
    row.id = `audio-track-row-${idx}`;

    const dlUrl = `/api/download?url=${encodeURIComponent(track.url)}&filename=${encodeURIComponent(
      `${safeTitle}_Track_${String(idx + 1).padStart(2, '0')}.mp3`
    )}`;

    row.innerHTML = `
      <div class="sp-col-num">
        <span class="sp-track-idx">${idx + 1}</span>
        <span class="sp-track-play-hover">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
        </span>
      </div>
      <div class="sp-track-main">
        <div class="sp-track-name">${escapeHtml(track.title)}</div>
        <div class="sp-track-sub">${escapeHtml(authorName)} • Chapter ${idx + 1}</div>
      </div>
      <div class="sp-col-format">
        <span class="sp-hq-tag">HQ MP3</span>
      </div>
      <div class="sp-col-dl">
        <a href="${dlUrl}" class="sp-row-dl-btn" download title="Download MP3 Track">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          MP3
        </a>
      </div>
    `;

    row.querySelector('.sp-row-dl-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    row.addEventListener('click', () => {
      playAudioTrack(idx);
    });

    audioChaptersList.appendChild(row);

    // Populate Now Playing Liquid-Glass Drawer list
    if (npDrawerList) {
      const dItem = document.createElement('div');
      dItem.className = 'np-drawer-item';
      dItem.id = `np-drawer-track-${idx}`;
      dItem.innerHTML = `
        <span class="np-drawer-idx">${idx + 1}</span>
        <div class="np-drawer-meta">
          <div class="np-drawer-title">${escapeHtml(track.title)}</div>
          <div class="np-drawer-sub">Chapter ${idx + 1} • HQ Audio</div>
        </div>
        <a href="${dlUrl}" class="np-drawer-dl" download title="Download Chapter MP3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </a>
      `;
      dItem.querySelector('.np-drawer-dl')?.addEventListener('click', (e) => e.stopPropagation());
      dItem.addEventListener('click', () => playAudioTrack(idx));
      npDrawerList.appendChild(dItem);
    }

  });

  const queueBadgeEl = document.getElementById('npQueueCountBadge');
  if (queueBadgeEl) queueBadgeEl.textContent = String(tracks.length);

  // Pre-populate Now Playing Card with first track metadata if nothing is playing yet
  if (state.audioPlaylist.length > 0 && !globalAudioElement.src) {
    const first = state.audioPlaylist[0];
    const npBackdropArt = document.getElementById('npBackdropArt');
    const npCoverImg = document.getElementById('npCoverImg');
    const npTrackTitle = document.getElementById('npTrackTitle');
    const npTrackSubtitle = document.getElementById('npTrackSubtitle');
    if (npBackdropArt) npBackdropArt.style.backgroundImage = `url("${first.cover}")`;
    if (npCoverImg) npCoverImg.src = first.cover;
    if (npTrackTitle) npTrackTitle.textContent = first.title;
    if (npTrackSubtitle) npTrackSubtitle.textContent = `${first.bookTitle} • ${first.author}`;
  }

  syncAudioHeartButtons();
}

function playAudioTrack(index) {
  const track = state.audioPlaylist[index];
  if (!track) return;
  state.currentAudioIndex = index;

  const proxiedStream = `/api/stream?url=${encodeURIComponent(track.url)}`;
  const proxiedDownload = `/api/download?url=${encodeURIComponent(
    track.url
  )}&filename=${encodeURIComponent(`${track.bookTitle}_${track.title}.mp3`)}`;

  // Smooth audio volume dip to eliminate harsh speaker pop/click on stream change
  const origVolume = typeof globalAudioElement.volume === 'number' ? globalAudioElement.volume : 1;
  if (!globalAudioElement.paused && globalAudioElement.currentTime > 0) {
    try {
      globalAudioElement.volume = Math.max(0, origVolume * 0.25);
    } catch (_) {}
  }

  globalAudioElement.src = proxiedStream;
  globalAudioElement
    .play()
    .then(() => {
      setTimeout(() => {
        try {
          globalAudioElement.volume = origVolume;
        } catch (_) {}
      }, 120);
    })
    .catch(() => {
      try {
        globalAudioElement.volume = origVolume;
      } catch (_) {}
    });

  // Crossfade visual metadata & artwork smoothly
  const crossfadeTargets = [
    document.getElementById('npCoverImg'),
    document.getElementById('npTrackTitle'),
    document.getElementById('npTrackSubtitle'),
    document.getElementById('barAudioCover'),
    document.getElementById('barAudioTitle'),
    document.getElementById('barAudioChapter'),
    document.querySelector('.sp-studio-cover'),
    document.querySelector('.sp-studio-title'),
    document.getElementById('audioStudioTrackName')
  ].filter(Boolean);

  crossfadeTargets.forEach((el) => el.classList.add('np-crossfading'));

  setTimeout(() => {
    audioStudioTrackName.textContent = `Now Playing: ${track.title}`;
    document.querySelectorAll('.sp-track-row').forEach((el, i) => {
      el.classList.toggle('playing', i === index);
    });
    document.querySelectorAll('.np-drawer-item').forEach((el, i) => {
      el.classList.toggle('playing', i === index);
    });

    // Update Liquid-Glass Bottom Audio Bar
    bottomAudioBar.classList.remove('hidden');
    barAudioCover.src = track.cover;
    barAudioTitle.textContent = track.bookTitle;
    barAudioChapter.textContent = `${track.title} • ${track.author || 'Audiobook'}`;
    barDownloadMp3Btn.href = proxiedDownload;

    const barAmbientGlow = document.getElementById('barAmbientGlow');
    if (barAmbientGlow) {
      barAmbientGlow.style.backgroundImage = `radial-gradient(circle at 18% 50%, rgba(56, 189, 248, 0.35), rgba(99, 102, 241, 0.25) 50%, transparent 85%), url("${track.cover}")`;
    }

    // Update Full-Screen Frosted Liquid-Glass Now Playing Card
    const npBackdropArt = document.getElementById('npBackdropArt');
    const npCoverImg = document.getElementById('npCoverImg');
    const npTrackTitle = document.getElementById('npTrackTitle');
    const npTrackSubtitle = document.getElementById('npTrackSubtitle');
    const npCurrentMp3DownloadBtn = document.getElementById('npCurrentMp3DownloadBtn');

    if (npBackdropArt) npBackdropArt.style.backgroundImage = `url("${track.cover}")`;
    if (npCoverImg) npCoverImg.src = track.cover;
    if (npTrackTitle) npTrackTitle.textContent = track.title;
    if (npTrackSubtitle) {
      npTrackSubtitle.textContent = `${track.bookTitle} • ${track.author || 'Audiobook Studio'}`;
    }
    if (npCurrentMp3DownloadBtn) {
      npCurrentMp3DownloadBtn.href = proxiedDownload;
    }

    crossfadeTargets.forEach((el) => el.classList.remove('np-crossfading'));
  }, 130);

  syncAudioHeartButtons();
  syncSpotifyPlaybackUI(true);
}

let npClosingTimeoutId = null;

function openNowPlayingOverlay() {
  const overlay = document.getElementById('nowPlayingOverlay');
  if (!overlay) return;
  if (npClosingTimeoutId) {
    clearTimeout(npClosingTimeoutId);
    npClosingTimeoutId = null;
  }
  overlay.classList.remove('closing');
  overlay.classList.remove('hidden');
  document.body.classList.add('np-overlay-open');

  // Default to Full Screen Theater mode (persisting user preference)
  const savedFs = localStorage.getItem('bookflix_np_fullscreen');
  const shouldBeFs = savedFs !== 'false';
  toggleNowPlayingFullscreen(shouldBeFs);

  syncAudioHeartButtons();
  syncSpotifyPlaybackUI(!globalAudioElement.paused && Boolean(globalAudioElement.src));
}

function closeNowPlayingOverlay() {
  const overlay = document.getElementById('nowPlayingOverlay');
  if (!overlay || overlay.classList.contains('hidden') || overlay.classList.contains('closing')) return;

  overlay.classList.add('closing');
  if (npClosingTimeoutId) clearTimeout(npClosingTimeoutId);
  npClosingTimeoutId = setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.classList.remove('closing');
    document.body.classList.remove('np-overlay-open');
    npClosingTimeoutId = null;
  }, 200);
}

function toggleNowPlayingFullscreen(forceState = null, showToast = false) {
  const overlay = document.getElementById('nowPlayingOverlay');
  if (!overlay) return;
  const isCurrentlyFs = overlay.classList.contains('fullscreen-mode');
  const targetFs = forceState !== null ? Boolean(forceState) : !isCurrentlyFs;

  overlay.classList.toggle('fullscreen-mode', targetFs);
  localStorage.setItem('bookflix_np_fullscreen', targetFs ? 'true' : 'false');

  const fsIcon = document.getElementById('npFullscreenIcon');
  const modePill = document.getElementById('npModePill');
  const toggleBtn = document.getElementById('npFullscreenToggleBtn');

  if (targetFs) {
    if (modePill) modePill.textContent = '✦ Full Screen Theater';
    if (toggleBtn) {
      toggleBtn.title = 'Switch to Compact Card (Press F)';
      toggleBtn.classList.add('active');
    }
    if (fsIcon) {
      fsIcon.innerHTML =
        '<polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line>';
    }
    if (showToast) {
      const toast = document.getElementById('npToast');
      if (toast) {
        toast.textContent = '✦ Full Screen Theater Active';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
      }
    }
  } else {
    if (modePill) modePill.textContent = 'Compact Card';
    if (toggleBtn) {
      toggleBtn.title = 'Expand to Full Screen Theater (Press F)';
      toggleBtn.classList.remove('active');
    }
    if (fsIcon) {
      fsIcon.innerHTML =
        '<polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line>';
    }
    if (showToast) {
      const toast = document.getElementById('npToast');
      if (toast) {
        toast.textContent = '✦ Compact Card View';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
      }
    }
  }
}

function syncAudioHeartButtons() {
  const targetItem = state.currentAudioBookItem || state.currentItem;
  const isSaved = targetItem ? state.myList.some((x) => x.id === targetItem.id) : false;
  document.getElementById('barHeartBtn')?.classList.toggle('active', isSaved);
  document.getElementById('npHeartBtn')?.classList.toggle('active', isSaved);
}

function syncSpotifyPlaybackUI(isPlaying) {
  const playPolygon = '<polygon points="6 3 20 12 6 21 6 3"></polygon>';
  const pauseRects =
    '<rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect>';

  const studioIcon = document.getElementById('spStudioPlayIcon');
  if (studioIcon) studioIcon.innerHTML = isPlaying ? pauseRects : playPolygon;

  const barIcon = document.getElementById('spBarPlayIcon');
  if (barIcon) barIcon.innerHTML = isPlaying ? pauseRects : playPolygon;

  const npIcon = document.getElementById('npPlayIcon');
  if (npIcon) npIcon.innerHTML = isPlaying ? pauseRects : playPolygon;

  const eq = document.getElementById('spLiveEqualizer');
  if (eq) {
    eq.classList.toggle('hidden', !isPlaying);
    eq.classList.toggle('active', isPlaying);
  }

  const npVis = document.getElementById('npLiveVisualizer');
  if (npVis) {
    const showVis = isPlaying && state.audioVisualizerEnabled;
    npVis.classList.toggle('hidden', !showVis);
    npVis.classList.toggle('active', showVis);
  }
}

function formatAudioTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const totalSec = Math.floor(seconds);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

// ============================================================================
// 7. MY SPACE & READING HISTORY (LOCALSTORAGE)
// ============================================================================

function toggleMyList(item) {
  const idx = state.myList.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    state.myList.splice(idx, 1);
  } else {
    state.myList.unshift(item);
  }
  localStorage.setItem('bookflix_mylist', JSON.stringify(state.myList.slice(0, 100)));
  updateMyListCount();
  updateModalBookmarkButton();
  syncAudioHeartButtons();
  if (!myListSection.classList.contains('hidden')) {
    renderMyListGrid();
  }
}

function updateMyListCount() {
  myListCount.textContent = String(state.myList.length);
}

function updateModalBookmarkButton() {
  if (!state.currentItem) return;
  const saved = state.myList.some((x) => x.id === state.currentItem.id);
  modalBookmarkBtn.textContent = saved ? 'Saved' : 'Save';
  modalBookmarkBtn.classList.toggle('saved', saved);
}

function renderMyListGrid() {
  myListGrid.innerHTML = '';
  if (state.myList.length === 0) {
    myListGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-secondary);">Your space is empty. Click Save on any Book, Manga, Comic, or Audiobook to keep it here.</p>`;
    return;
  }
  state.myList.forEach((item) => {
    myListGrid.appendChild(createBookCard(item));
  });
}

function saveToHistory(item) {
  state.history = state.history.filter((x) => x.id !== item.id);
  state.history.unshift(item);
  state.history = state.history.slice(0, 18);
  localStorage.setItem('bookflix_history', JSON.stringify(state.history));
  renderContinueRow();
}

function renderContinueRow() {
  const resumeLabel = document.getElementById('topResumeLabel');
  if (state.history.length === 0) {
    continueRow.classList.add('hidden');
    if (resumeLabel) resumeLabel.textContent = 'Resume Read';
    return;
  }
  if (resumeLabel && state.history[0]?.title) {
    resumeLabel.textContent = `Resume: ${state.history[0].title}`;
  }
  continueRow.classList.remove('hidden');
  continueScroller.innerHTML = '';
  state.history.forEach((item) => {
    continueScroller.appendChild(createBookCard(item));
  });
}

// ============================================================================
// HELPERS
// ============================================================================

function createActionButton(label, className, onClick) {
  const btn = document.createElement('button');
  btn.className = `btn ${className}`;
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

function createLinkButton(label, href, className) {
  const a = document.createElement('a');
  a.className = `btn ${className}`;
  a.href = href;
  a.textContent = label;
  a.setAttribute('download', '');
  return a;
}

function initLiquidGlassSelects() {
  const selects = document.querySelectorAll('select.search-select, select.chapter-select');
  selects.forEach((sel) => enhanceSelectToLiquidGlass(sel));

  document.addEventListener('click', (e) => {
    document.querySelectorAll('.glass-dropdown.open').forEach((dd) => {
      if (!dd.contains(e.target)) {
        dd.classList.remove('open');
      }
    });
  });
}

function enhanceSelectToLiquidGlass(selectEl) {
  if (!selectEl || selectEl.dataset.glassEnhanced === 'true') return;
  selectEl.dataset.glassEnhanced = 'true';
  selectEl.style.display = 'none';

  const wrapper = document.createElement('div');
  wrapper.className = 'glass-dropdown';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'glass-dropdown-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');

  const labelSpan = document.createElement('span');
  labelSpan.className = 'glass-dropdown-label';

  const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevron.setAttribute('viewBox', '0 0 24 24');
  chevron.setAttribute('fill', 'none');
  chevron.setAttribute('stroke', 'currentColor');
  chevron.setAttribute('stroke-width', '2.3');
  chevron.setAttribute('stroke-linecap', 'round');
  chevron.setAttribute('stroke-linejoin', 'round');
  chevron.setAttribute('class', 'glass-dropdown-chevron');
  chevron.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';

  trigger.appendChild(labelSpan);
  trigger.appendChild(chevron);

  const menu = document.createElement('div');
  menu.className = 'glass-dropdown-menu';
  menu.setAttribute('role', 'listbox');

  wrapper.appendChild(trigger);
  wrapper.appendChild(menu);
  selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);

  const nativeValueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');

  function rebuildOptions() {
    menu.innerHTML = '';
    const options = Array.from(selectEl.options);
    const currentVal = nativeValueDescriptor ? nativeValueDescriptor.get.call(selectEl) : selectEl.value;
    const selectedOpt = options.find((o) => o.value === currentVal) || options[0];
    labelSpan.textContent = selectedOpt ? selectedOpt.textContent : 'Select';

    options.forEach((opt) => {
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      const isSelected = opt.value === (selectedOpt ? selectedOpt.value : '');
      itemBtn.className = `glass-dropdown-option${isSelected ? ' selected' : ''}`;
      itemBtn.innerHTML = `
        <span>${escapeHtml(opt.textContent)}</span>
        <svg class="glass-dropdown-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      itemBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (nativeValueDescriptor) {
          nativeValueDescriptor.set.call(selectEl, opt.value);
        } else {
          selectEl.value = opt.value;
        }
        rebuildOptions();
        wrapper.classList.remove('open');
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      });
      menu.appendChild(itemBtn);
    });
  }

  if (nativeValueDescriptor) {
    Object.defineProperty(selectEl, 'value', {
      get() {
        return nativeValueDescriptor.get.call(this);
      },
      set(newVal) {
        nativeValueDescriptor.set.call(this, newVal);
        rebuildOptions();
      },
      configurable: true,
    });
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = wrapper.classList.contains('open');
    document.querySelectorAll('.glass-dropdown.open').forEach((other) => {
      if (other !== wrapper) other.classList.remove('open');
    });
    wrapper.classList.toggle('open', !isOpen);
  });

  const observer = new MutationObserver(() => {
    rebuildOptions();
  });
  observer.observe(selectEl, { childList: true, subtree: true, attributes: true });

  rebuildOptions();
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str = '') {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

// Dynamically rasterize /logo.svg into a data:image/png favicon so Chrome/Edge bypasses any stale disk cache
(function enforceFreshAppIcon() {
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 64, 64);
        const pngDataUrl = canvas.toDataURL('image/png');
        document.querySelectorAll('link[rel*="icon"]').forEach((el) => el.remove());
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = pngDataUrl;
        document.head.appendChild(link);
      } catch {
        // Ignore canvas error
      }
    };
    img.src = '/logo.svg?v=16';
  } catch {
    // Ignore
  }
})();

// ============================================================================
// PWA SERVICE WORKER REGISTRATION & INSTALL APP CONTROLLER
// ============================================================================
let deferredInstallPrompt = null;

const isIos = (function () {
  return (
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
    !window.MSStream
  );
})();

const isStandalone = (function () {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
})();

function showInstallButtons() {
  if (isStandalone) return;
  const topBtn = document.getElementById('topInstallAppBtn');
  const railBtn = document.getElementById('railInstallAppBtn');
  if (topBtn) topBtn.classList.remove('hidden');
  if (railBtn) railBtn.classList.remove('hidden');
}

function hideInstallButtons() {
  const topBtn = document.getElementById('topInstallAppBtn');
  const railBtn = document.getElementById('railInstallAppBtn');
  if (topBtn) topBtn.classList.add('hidden');
  if (railBtn) railBtn.classList.add('hidden');
}

// 1. Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('BookFlix PWA Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('Service Worker registration skipped:', err);
      });
  });
}

// 2. Capture Android / Chrome / Edge beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallButtons();
});

// 3. Handle iOS Safari users (who do not get beforeinstallprompt)
if (isIos && !isStandalone) {
  showInstallButtons();
}

// 4. Modal and Button Click Handlers
function handleInstallAppClick() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the BookFlix PWA install prompt');
        hideInstallButtons();
      }
      deferredInstallPrompt = null;
    });
  } else if (isIos) {
    const iosModal = document.getElementById('iosInstallModal');
    if (iosModal) iosModal.classList.remove('hidden');
  } else {
    // Other browsers (or desktop without prompt yet)
    const iosModal = document.getElementById('iosInstallModal');
    if (iosModal) iosModal.classList.remove('hidden');
  }
}

document.getElementById('topInstallAppBtn')?.addEventListener('click', handleInstallAppClick);
document.getElementById('railInstallAppBtn')?.addEventListener('click', handleInstallAppClick);

document.getElementById('closeIosInstallBtn')?.addEventListener('click', () => {
  document.getElementById('iosInstallModal')?.classList.add('hidden');
});

document.getElementById('iosGotItBtn')?.addEventListener('click', () => {
  document.getElementById('iosInstallModal')?.classList.add('hidden');
});

document.getElementById('iosInstallModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'iosInstallModal') {
    e.target.classList.add('hidden');
  }
});

window.addEventListener('appinstalled', () => {
  console.log('BookFlix installed successfully as a PWA!');
  hideInstallButtons();
  deferredInstallPrompt = null;
});


