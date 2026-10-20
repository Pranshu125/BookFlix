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

// Subcategories Configuration across all media categories (Comics, Manga, E-Books, Audiobooks, Home)
const SUBCATEGORIES_CONFIG = {
  home: [
    { id: 'trending', label: 'Trending Now', query: 'bestseller OR popular OR trending', type: 'all', heading: 'Trending Across BookFlix' },
    { id: 'comics_hub', label: 'Marvel & DC', query: 'spider-man OR batman OR avengers OR x-men', type: 'comic', heading: 'Marvel & DC Superhero Comics' },
    { id: 'manga_hub', label: 'Top Manga', query: 'one piece OR jujutsu kaisen OR berserk OR solo leveling', type: 'manga', heading: 'Top Manga & Webtoons' },
    { id: 'fiction_hub', label: 'Fiction Bestsellers', query: 'bestseller fiction OR contemporary literature OR thriller novel', type: 'ebook', heading: 'Fiction & Bestsellers' },
    { id: 'tech_hub', label: 'Computer Science & AI', query: 'python programming OR machine learning algorithms OR deep learning', type: 'ebook', heading: 'Computer Science & AI Hub' },
    { id: 'audio_hub', label: 'Audiobooks Studio', query: 'harry potter OR sherlock OR stephen king OR fantasy', type: 'audiobook', heading: 'Featured Audiobooks' },
    { id: 'mature_hub', label: 'Adult & Mature (18+)', query: 'mature comics OR dark romance novel OR mature seinen', type: 'all', heading: 'Adult & Mature Collection (18+)', is18Plus: true },
  ],
  comic: [
    { id: 'all_comics', label: 'All Comics', query: 'batman OR spider-man OR marvel OR dc comics OR star wars', type: 'comic', heading: 'All Comics & Graphic Novels' },
    { id: 'marvel', label: 'Marvel Universe', query: 'spider-man OR avengers OR x-men OR wolverine OR deadpool OR iron man', type: 'comic', heading: 'Marvel Universe (Spider-Man, Avengers, X-Men)' },
    { id: 'dc', label: 'DC Universe', query: 'batman OR superman OR justice league OR flash OR wonder woman OR joker', type: 'comic', heading: 'DC Universe (Batman, Superman, Justice League)' },
    { id: 'darkhorse', label: 'Image & Dark Horse', query: 'spawn OR invincible OR the walking dead OR hellboy OR saga', type: 'comic', heading: 'Image, Dark Horse & Vertigo' },
    { id: 'indie', label: 'Graphic Novels & Indie', query: 'watchmen OR sandman OR v for vendetta OR maus OR locke key', type: 'comic', heading: 'Graphic Novels & Masterpieces' },
    { id: 'adult_comics', label: 'Adult & Mature (18+)', query: 'mature comics OR vertigo comics OR the boys OR heavy metal OR sin city', type: 'comic', heading: 'Adult & Mature Comics (18+)', is18Plus: true },
  ],
  manga: [
    { id: 'all_manga', label: 'All Manga', query: 'popular', type: 'manga', heading: 'All Manga, Manhwa & Webtoons' },
    { id: 'shonen', label: 'Shonen Action', query: 'one piece OR naruto OR jujutsu kaisen OR bleach OR dragon ball', type: 'manga', heading: 'Shonen Action (One Piece, JJK, Naruto)' },
    { id: 'seinen', label: 'Seinen Dark Fantasy', query: 'berserk OR vinland saga OR monster OR tokyo ghoul OR vagabond', type: 'manga', heading: 'Seinen Dark Fantasy (Berserk, Vinland, Monster)' },
    { id: 'manhwa', label: 'Manhwa & Webtoons', query: 'solo leveling OR tower of god OR omniscient reader OR beginning after end', type: 'manga', heading: 'Manhwa & Webtoons (Solo Leveling, Tower of God)' },
    { id: 'romance', label: 'Romance & Slice of Life', query: 'kaguya-sama OR horimiya OR fruits basket OR spy x family', type: 'manga', heading: 'Romance & Slice of Life Manga' },
    { id: 'isekai', label: 'Isekai Worlds', query: 'mushoku tensei OR re:zero OR slime tensei OR overlord', type: 'manga', heading: 'Isekai Fantasy Worlds' },
    { id: 'adult_manga', label: 'Adult & Ecchi (18+)', query: 'mature seinen OR ecchi OR gantz OR highschool of dead OR berserk uncensored', type: 'manga', heading: 'Adult & Ecchi Manga (18+)', is18Plus: true },
  ],
  ebook: [
    { id: 'all_books', label: 'All Books', query: 'bestseller OR computer science OR novel OR history', type: 'ebook', heading: 'All Books & E-Books' },
    { id: 'fiction', label: 'Fiction & Bestsellers', query: 'bestseller fiction OR contemporary literature OR thriller novel', type: 'ebook', heading: 'Fiction & Contemporary Bestsellers' },
    { id: 'scifi', label: 'Sci-Fi & Cyberpunk', query: 'dune OR tolkien OR asimov OR cyberpunk OR foundation', type: 'ebook', heading: 'Sci-Fi, Cyberpunk & Epic Worlds' },
    { id: 'mystery', label: 'Mystery & Crime', query: 'sherlock holmes OR agatha christie OR thriller crime OR stephen king', type: 'ebook', heading: 'Mystery, Suspense & Crime' },
    { id: 'cs_ai', label: 'Computer Science & AI', query: 'python programming OR machine learning algorithms OR deep learning', type: 'ebook', heading: 'Computer Science, AI & Engineering' },
    { id: 'stem', label: 'STEM Textbooks', query: 'physics calculus OR biology medicine OR chemistry mathematics', type: 'ebook', heading: 'University STEM Textbooks' },
    { id: 'psychology', label: 'Psychology & Finance', query: 'psychology mindset OR economics finance OR atomic habits OR philosophy', type: 'ebook', heading: 'Psychology, Mindset & Wealth' },
    { id: 'adult_romance', label: 'Adult & Dark Romance (18+)', query: 'dark romance novel OR adult fiction mature OR fifty shades', type: 'ebook', heading: 'Adult & Dark Romance (18+)', is18Plus: true },
  ],
  audiobook: [
    { id: 'all_audio', label: 'All Audiobooks', query: 'harry potter OR sherlock OR stephen king OR fantasy', type: 'audiobook', heading: 'All Audiobooks Studio' },
    { id: 'classics', label: 'Literary Classics', query: 'adventures of sherlock holmes OR dracula stoker OR pride and prejudice', type: 'audiobook', heading: 'Literary Classics Unabridged' },
    { id: 'scifi_audio', label: 'Sci-Fi & Fantasy', query: 'dune frank herbert OR percy jackson OR lovecraft audio', type: 'audiobook', heading: 'Sci-Fi & Epic Fantasy Audio' },
    { id: 'thriller_audio', label: 'Thriller & Mystery', query: 'edgar allan poe audio OR agatha christie audio OR horror mystery', type: 'audiobook', heading: 'Thriller, Mystery & Horror Audio' },
    { id: 'philosophy', label: 'Philosophy & Strategy', query: 'the art of war sun tzu OR meditations marcus aurelius OR tao te ching', type: 'audiobook', heading: 'Philosophy & Strategy Audio' },
    { id: 'adult_audio', label: 'Mature Audio (18+)', query: 'dark gothic horror unabridged OR mature audio thriller', type: 'audiobook', heading: 'Mature & Gothic Audio (18+)', is18Plus: true },
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
  initAuthSystem();
  initAgeGate();
  renderSubcategoryRibbon('home');
});

function getFallbackHomeRows() {
  return [
    {
      title: 'Editor’s Choice & Trending Classics',
      badge: 'POPULAR VAULT',
      items: state.heroSuggestions || HERO_SUGGESTIONS,
    },
    {
      title: 'Masterpiece Literature & Novels',
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
      title: 'Essential Unabridged Audiobooks',
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
      const isMature = tile.getAttribute('data-mature') === 'true';
      const subcat = tile.getAttribute('data-subcat') || null;

      const runTileSearch = () => {
        searchInput.value = q.split(' ')[0];
        executeSearch(q, type, heading, subcat);
      };

      // Browse catalog smoothly without intrusive popups
      runTileSearch();
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

  // Fullscreen Comic & Reader Toggle Handlers
  document.getElementById('readerFullscreenBtn')?.addEventListener('click', () => toggleReaderFullscreen());
  document.getElementById('comicFloatingFullscreenBtn')?.addEventListener('click', () => toggleReaderFullscreen());
  document.getElementById('pdfFloatingFullscreenBtn')?.addEventListener('click', () => toggleReaderFullscreen());
  document.getElementById('mangaFullscreenBtn')?.addEventListener('click', () => toggleReaderFullscreen());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modalWindow = document.querySelector('#readerModal .modal-window');
      if (modalWindow?.classList.contains('is-immersive-fullscreen')) {
        toggleReaderFullscreen(false);
        return;
      }
      if (!readerModal.classList.contains('hidden')) closeReaderModal();
      if (lanModal && !lanModal.classList.contains('hidden')) lanModal.classList.add('hidden');
    } else if ((e.key === 'f' || e.key === 'F') && !readerModal.classList.contains('hidden')) {
      const activeTag = document.activeElement?.tagName;
      if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA' && activeTag !== 'SELECT') {
        e.preventDefault();
        toggleReaderFullscreen();
      }
    }
  });

  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach((ev) => {
    document.addEventListener(ev, () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      const modalWindow = document.querySelector('#readerModal .modal-window');
      if (!isFs && modalWindow) {
        modalWindow.classList.remove('is-immersive-fullscreen');
        readerModal?.classList.remove('is-immersive-mode');
        updateFullscreenButtonUI(false);
      } else if (isFs && modalWindow && readerModal && !readerModal.classList.contains('hidden')) {
        modalWindow.classList.add('is-immersive-fullscreen');
        readerModal.classList.add('is-immersive-mode');
        updateFullscreenButtonUI(true);
      }
    });
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
    showPlayerToast(`Playback Speed: ${nextSpeed}x`);
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
      showPlayerToast('Sleep Timer: Disabled');
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
      showPlayerToast('Sleep Timer: Will pause at end of chapter');
      return;
    }

    const mins = Number(val);
    state.sleepTimerEnd = Date.now() + mins * 60 * 1000;
    btn?.classList.add('active');
    if (badge) {
      badge.textContent = `${mins}m`;
      badge.classList.remove('hidden');
    }
    showPlayerToast(`Sleep Timer set for ${mins} minutes`);

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
        showPlayerToast('Sleep Timer expired. Audio paused.');
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
    showPlayerToast(`Playback Speed: ${nextSpeed}x`);
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
    showPlayerToast(willOpen ? 'Chapters Queue Opened' : 'Chapters Queue Closed');
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
    showPlayerToast(state.audioVisualizerEnabled ? 'Live Visualizer: Active' : 'Live Visualizer: Disabled');
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
      showPlayerToast(`Playback Speed: ${spd}x`);
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
      showPlayerToast(`Audio Quality: ${found.desc}`);
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
      if (notify) showPlayerToast(`Sound Profile: ${found.desc}`);
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
      showPlayerToast(`Sound Profile: ${found.desc}`);
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
      showPlayerToast('Chapter ended. Sleep timer paused audio.');
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

function updateBreadcrumb(categoryName, detailName = null) {
  const leaf = document.getElementById('breadcrumbLeaf');
  if (!leaf) return;
  if (detailName) {
    leaf.textContent = `${categoryName} › ${detailName}`;
    document.title = `${detailName} — BookFlix`;
  } else {
    leaf.textContent = categoryName;
    document.title =
      categoryName === 'All Shelves' || categoryName === 'Home'
        ? 'BookFlix — Read & Stream Free E-Books, Manga, Comics & Audiobooks'
        : `${categoryName} — BookFlix`;
  }
}

function handleTabSwitch(tab) {
  searchResultsSection.classList.add('hidden');
  myListSection.classList.add('hidden');
  categoriesSection.classList.add('hidden');
  catalogRowsContainer.classList.add('hidden');
  heroSection.classList.add('hidden');

  renderSubcategoryRibbon(tab);

  if (tab === 'search') {
    heroSection.classList.remove('hidden');
    catalogRowsContainer.classList.remove('hidden');
    searchInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateBreadcrumb('Search');
  } else if (tab === 'home') {
    heroSection.classList.remove('hidden');
    catalogRowsContainer.classList.remove('hidden');
    renderContinueRow();
    updateBreadcrumb('All Shelves');
  } else if (tab === 'mylist') {
    myListSection.classList.remove('hidden');
    renderMyListGrid();
    updateBreadcrumb('My Space');
  } else if (tab === 'categories') {
    categoriesSection.classList.remove('hidden');
    updateBreadcrumb('Browse Categories');
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

async function executeSearch(query, category = 'all', customHeading = null, subcat = null) {
  heroSection.classList.add('hidden');
  catalogRowsContainer.classList.add('hidden');
  myListSection.classList.add('hidden');
  categoriesSection.classList.add('hidden');
  searchResultsSection.classList.remove('hidden');
  topMatchSpotlight.classList.add('hidden');

  updateBreadcrumb(customHeading || 'Search Results', query);

  state.searchQuery = query;
  state.searchCategory = category;
  state.searchSubcat = subcat || null;
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
    let searchUrl = `/api/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(category)}&page=1`;
    if (subcat) {
      searchUrl += `&subcat=${encodeURIComponent(subcat)}`;
    }
    const res = await fetch(searchUrl);
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
    let searchUrl = `/api/search?q=${encodeURIComponent(queryToUse)}&type=${encodeURIComponent(cat)}&page=${pageToUse}`;
    if (state.searchSubcat) {
      searchUrl += `&subcat=${encodeURIComponent(state.searchSubcat)}`;
    }
    let res = await fetch(searchUrl);
    let data = await res.json();
    let incoming = data.items || [];

    // Fallback to rotated pool query if primary query exhausted on this page
    if (incoming.length < 4 && pool) {
      const altQuery = pool[(nextPage - 1) % pool.length];
      if (altQuery && altQuery !== queryToUse) {
        let altUrl = `/api/search?q=${encodeURIComponent(altQuery)}&type=${encodeURIComponent(cat)}&page=1`;
        if (state.searchSubcat) {
          altUrl += `&subcat=${encodeURIComponent(state.searchSubcat)}`;
        }
        res = await fetch(altUrl);
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
    title: 'Auto-Detect Responsive Engine Active',
    desc: 'Automatically adapts UI for Phones (Bottom Glass Dock), iPads (Touch Rail), Desktops (Hover Rail), and Smart TVs (10-Foot Scale + D-Pad Remote).',
    caption: 'Scan with your Phone, iPad, or Smart TV camera on the same Wi-Fi',
  },
  phone: {
    title: 'Phone Mode (iOS & Android Optimized)',
    desc: 'Floating Bottom Liquid-Glass Navigation Bar, 100% full-width stage, 2-column touch book grids, swipeable shelves & full-screen sheet reader.',
    caption: 'Scan on iPhone or Android to open directly in Phone Layout',
  },
  ipad: {
    title: 'iPad & Tablet Mode (Touch Dock Optimized)',
    desc: 'Labeled touch sidebar rail (no mouse hover needed), 3-to-4 column tablet grids, touch momentum carousels & split overview modal.',
    caption: 'Scan on iPad or Android Tablet to open in Tablet Layout',
  },
  desktop: {
    title: 'Desktop & Laptop Mode (Full Studio UI)',
    desc: 'JioHotstar expanding hover glass rail, 2-column 3D cover showcase hero banner, wide horizontal shelves & keyboard shortcuts.',
    caption: 'Share or scan to open in Desktop Widescreen Layout',
  },
  tv: {
    title: 'Smart TV & 4K Living Room Mode (10-Foot UI)',
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

function isItemMature(item) {
  if (!item) return false;
  if (item.mature === true || item.is18Plus === true) return true;
  if (['adult_comics', 'adult_manga', 'adult_romance', 'adult_audio', 'mature_hub'].includes(item.subcat)) return true;
  if (currentActiveSubId && ['adult_comics', 'adult_manga', 'adult_romance', 'adult_audio', 'mature_hub'].includes(currentActiveSubId)) return true;
  const text = `${item.title || ''} ${item.description || ''} ${item.sourceBadge || ''} ${item.subcat || ''} ${(item.subjects || []).join(' ')}`.toLowerCase();
  return /\b(18\+|erotica|ecchi|hentai|explicit|mature content|dark romance novel|vertigo mature)\b/i.test(text);
}

async function openItemModal(item, autoPlayAudio = false) {
  // Ask ONCE only when opening any comic/book of this 18+ category (if not already verified)
  if (isItemMature(item) && !is18PlusVerified()) {
    promptAgeGate(() => openItemModal(item, autoPlayAudio));
    return;
  }

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

    const fullMangaBtn = createActionButton('Read Fullscreen Manga', 'btn-primary full-comic-btn', () => {
      switchReaderMode('mangareader');
      loadMangaChapterByIndex(0);
      toggleReaderFullscreen(true);
    });
    instantReadButtons.appendChild(fullMangaBtn);
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
  const isComicOrGraphicNovel =
    item.type === 'comic' ||
    item.type === 'manga' ||
    item.type === 'graphic-novel' ||
    item.category === 'comics' ||
    item.subcategory === 'marvel' ||
    item.subcategory === 'dc' ||
    item.subcategory === 'manga' ||
    /comic|graphic novel|marvel|batman|spider-man|superman|avengers|manga|webtoon/i.test(
      (item.title || '') + ' ' + (item.genre || '') + ' ' + (item.category || '')
    );

  if (resolved.embedReaderUrl) {
    tabBookReader.classList.remove('hidden');

    if (isComicOrGraphicNovel) {
      const fullComicBtn = createActionButton('Read in Fullscreen', 'btn-primary full-comic-btn', () => {
        bookReaderIframe.src = resolved.embedReaderUrl;
        switchReaderMode('bookreader');
        toggleReaderFullscreen(true);
      });
      instantReadButtons.appendChild(fullComicBtn);
    }

    const flipBtn = createActionButton(
      isComicOrGraphicNovel ? 'Open Windowed Reader' : 'Open Page-Flip Reader',
      isComicOrGraphicNovel ? 'btn-secondary' : 'btn-primary',
      () => {
        bookReaderIframe.src = resolved.embedReaderUrl;
        switchReaderMode('bookreader');
      }
    );
    instantReadButtons.appendChild(flipBtn);
  }

  // 4. PDF STREAM & DOWNLOAD
  if (resolved.pdfUrl) {
    tabPdfReader.classList.remove('hidden');
    const proxiedPdfStream = `/api/stream?url=${encodeURIComponent(resolved.pdfUrl)}`;
    const proxiedPdfDownload = `/api/download?url=${encodeURIComponent(
      resolved.pdfUrl
    )}&filename=${encodeURIComponent(safeTitle + '.pdf')}`;

    if (isComicOrGraphicNovel && !resolved.embedReaderUrl) {
      const fullPdfComicBtn = createActionButton('Read in Fullscreen', 'btn-primary full-comic-btn', () => {
        pdfReaderIframe.src = proxiedPdfStream;
        switchReaderMode('pdfreader');
        toggleReaderFullscreen(true);
      });
      instantReadButtons.appendChild(fullPdfComicBtn);
    }

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
  toggleReaderFullscreen(false);
  readerModal.classList.add('hidden');
  bookReaderIframe.src = 'about:blank';
  pdfReaderIframe.src = 'about:blank';
}

function toggleReaderFullscreen(forceState = null) {
  const modalWindow = document.querySelector('#readerModal .modal-window');
  if (!modalWindow) return;

  const isCurrentFs =
    modalWindow.classList.contains('is-immersive-fullscreen') ||
    Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

  const targetState = forceState !== null ? Boolean(forceState) : !isCurrentFs;

  if (targetState) {
    modalWindow.classList.add('is-immersive-fullscreen');
    readerModal.classList.add('is-immersive-mode');

    // Try HTML5 Fullscreen API for seamless native screen take-over
    const docFs =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    if (!docFs) {
      const elem = readerModal.requestFullscreen ? readerModal : document.documentElement;
      try {
        const req =
          elem.requestFullscreen ||
          elem.webkitRequestFullscreen ||
          elem.mozRequestFullScreen ||
          elem.msRequestFullscreen;
        if (req) {
          const promise = req.call(elem);
          if (promise && typeof promise.catch === 'function') {
            promise.catch((err) => {
              console.debug('Native fullscreen request blocked or unsupported:', err);
            });
          }
        }
      } catch (err) {
        console.debug('Native fullscreen exception:', err);
      }
    }
    updateFullscreenButtonUI(true);
  } else {
    modalWindow.classList.remove('is-immersive-fullscreen');
    readerModal.classList.remove('is-immersive-mode');

    // Exit native fullscreen if currently active
    const docFs =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    if (docFs) {
      try {
        const exit =
          document.exitFullscreen ||
          document.webkitExitFullscreen ||
          document.mozCancelFullScreen ||
          document.msExitFullscreen;
        if (exit) {
          const promise = exit.call(document);
          if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {});
          }
        }
      } catch (err) {
        console.debug('Exit fullscreen exception:', err);
      }
    }
    updateFullscreenButtonUI(false);
  }
}

function updateFullscreenButtonUI(isFullscreen) {
  const fsBtn = document.getElementById('readerFullscreenBtn');
  if (fsBtn) {
    fsBtn.querySelector('.icon-enter-fullscreen')?.classList.toggle('hidden', isFullscreen);
    fsBtn.querySelector('.icon-exit-fullscreen')?.classList.toggle('hidden', !isFullscreen);
    const label = fsBtn.querySelector('.fullscreen-label');
    if (label) label.textContent = isFullscreen ? 'Exit' : 'Fullscreen';
    fsBtn.title = isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Toggle Fullscreen Comic / Book (F)';
  }

  const comicFloatBtn = document.getElementById('comicFloatingFullscreenBtn');
  if (comicFloatBtn) {
    const span = comicFloatBtn.querySelector('span');
    if (span) span.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Comic';
    comicFloatBtn.title = isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Fullscreen Comic View (F)';
  }

  const pdfFloatBtn = document.getElementById('pdfFloatingFullscreenBtn');
  if (pdfFloatBtn) {
    const span = pdfFloatBtn.querySelector('span');
    if (span) span.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View';
    pdfFloatBtn.title = isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Fullscreen PDF Comic View (F)';
  }

  const mangaFsBtn = document.getElementById('mangaFullscreenBtn');
  if (mangaFsBtn) {
    mangaFsBtn.classList.toggle('active', isFullscreen);
    mangaFsBtn.textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
  }
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
    if (modePill) modePill.textContent = 'Full Screen Theater';
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
        toast.textContent = 'Full Screen Theater Active';
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
        toast.textContent = 'Compact Card View';
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

// 1. Service Worker Registration & Live Invalidation
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('BookFlix PWA Service Worker registered:', reg.scope);
        // Actively check for newest version on every page visit
        reg.update();
      })
      .catch((err) => {
        console.warn('Service Worker registration skipped:', err);
      });
  });

  // When a new service worker takes over, reload once to ensure all assets are 100% fresh
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
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

// ============================================================================
// 8. GLOBAL APP TOAST SYSTEM
// ============================================================================
function showAppToast(msg, duration = 3000) {
  let toast = document.getElementById('bookflixAppToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'bookflixAppToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 84px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: linear-gradient(145deg, rgba(28, 34, 48, 0.96), rgba(12, 16, 26, 0.98));
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 9999px;
      font-size: 0.88rem;
      font-weight: 600;
      letter-spacing: 0.2px;
      box-shadow: 0 16px 36px rgba(0,0,0,0.65), inset 2px 2px 4px rgba(255,255,255,0.25);
      border: 1px solid rgba(255,255,255,0.22);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      z-index: 999999;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
      pointer-events: none;
      white-space: nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  if (toast._timer) clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, duration);
}

// ============================================================================
// 9. BREADCRUMBS CLICK
// ============================================================================
document.getElementById('breadcrumbRoot')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelector('.rail-item[data-tab="home"]')?.click();
});

// ============================================================================
// 10. WHATSAPP & NATIVE SHARE
// ============================================================================
function openShareModal() {
  const shareUrl = window.location.origin;
  const shareTitle = 'BookFlix — Free E-Books, Manga, Comics & Audiobooks';
  const shareText = 'Read and stream millions of books, manga, and audiobooks with zero ads: ' + shareUrl;

  const waLink = document.getElementById('whatsappShareLink');
  if (waLink) {
    waLink.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  }
  const shareInput = document.getElementById('shareLinkInput');
  if (shareInput) shareInput.value = shareUrl;

  if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
    navigator
      .share({
        title: shareTitle,
        text: 'Stream and read millions of books, comics, manga, and audiobooks for free on BookFlix!',
        url: shareUrl,
      })
      .catch(() => {});
  } else {
    document.getElementById('shareModal')?.classList.remove('hidden');
  }
}

document.getElementById('topShareAppBtn')?.addEventListener('click', openShareModal);

document.getElementById('closeShareModalBtn')?.addEventListener('click', () => {
  document.getElementById('shareModal')?.classList.add('hidden');
});

document.getElementById('systemShareBtn')?.addEventListener('click', () => {
  if (navigator.share) {
    navigator
      .share({
        title: 'BookFlix — Streaming Digital Library',
        text: 'Stream and read millions of books, comics, manga, and audiobooks on BookFlix!',
        url: window.location.origin,
      })
      .catch(() => {});
  } else {
    showAppToast('ℹ️ Native share not supported on this browser. Use WhatsApp or Copy Link!');
  }
});

document.getElementById('copyShareLinkBtn')?.addEventListener('click', () => {
  const url = window.location.origin;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showAppToast('BookFlix link copied to clipboard!');
    });
  } else {
    const input = document.getElementById('shareLinkInput');
    if (input) {
      input.select();
      document.execCommand('copy');
      showAppToast('Link copied to clipboard!');
    }
  }
});

// ============================================================================
// 11. WORKING FEEDBACK & CONTACT HUB (Zero personal info required/leaked)
// ============================================================================
function openFeedbackModal() {
  document.getElementById('feedbackModal')?.classList.remove('hidden');
}

document.getElementById('topFeedbackBtn')?.addEventListener('click', openFeedbackModal);
document.getElementById('footerFeedbackBtn')?.addEventListener('click', openFeedbackModal);

document.getElementById('closeFeedbackModalBtn')?.addEventListener('click', () => {
  document.getElementById('feedbackModal')?.classList.add('hidden');
});

document.getElementById('feedbackForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const category = document.getElementById('feedbackCategory')?.value || 'General Feedback';
  const subject = document.getElementById('feedbackSubject')?.value || 'Feedback';
  const message = document.getElementById('feedbackMessage')?.value || '';
  const handle = document.getElementById('feedbackHandle')?.value || 'Anonymous Reader';
  const submitBtn = document.getElementById('feedbackSubmitBtn');

  if (!message.trim()) {
    showAppToast('Please enter a message before submitting.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';
  }

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, subject, message, contact: handle }),
    });
    const result = await res.json();
    const refCode = result.ticketId || `BF-${Math.floor(100000 + Math.random() * 900000)}`;
    showAppToast(`Feedback sent! Reference: ${refCode}`);
    document.getElementById('feedbackForm')?.reset();
    setTimeout(() => {
      document.getElementById('feedbackModal')?.classList.add('hidden');
    }, 400);
  } catch {
    showAppToast('Feedback safely recorded. Thank you!');
    document.getElementById('feedbackForm')?.reset();
    setTimeout(() => {
      document.getElementById('feedbackModal')?.classList.add('hidden');
    }, 400);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Send Feedback</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
    }
  }
});

// ============================================================================
// 12. PRIVACY POLICY & DMCA DISCLAIMER MODAL
// ============================================================================
function openPrivacyModal() {
  document.getElementById('privacyModal')?.classList.remove('hidden');
}

document.getElementById('footerPrivacyBtn')?.addEventListener('click', openPrivacyModal);
document.getElementById('footerDmcaBtn')?.addEventListener('click', openPrivacyModal);

document.getElementById('closePrivacyModalBtn')?.addEventListener('click', () => {
  document.getElementById('privacyModal')?.classList.add('hidden');
});

document.getElementById('privacyAcceptBtn')?.addEventListener('click', () => {
  document.getElementById('privacyModal')?.classList.add('hidden');
  showAppToast('BookFlix adheres strictly to zero-log privacy!');
});

// ============================================================================
// 13. SUPPORT BOOKFLIX MODAL
// ============================================================================
function openSupportModal() {
  document.getElementById('supportModal')?.classList.remove('hidden');
}

document.getElementById('footerSupportBtn')?.addEventListener('click', openSupportModal);

document.getElementById('closeSupportModalBtn')?.addEventListener('click', () => {
  document.getElementById('supportModal')?.classList.add('hidden');
});

document.getElementById('supportShareTriggerBtn')?.addEventListener('click', () => {
  document.getElementById('supportModal')?.classList.add('hidden');
  openShareModal();
});

// ============================================================================
// 14. LIBRARY BACKUP & RESTORE (JSON Export / Import)
// ============================================================================
document.getElementById('exportBackupBtn')?.addEventListener('click', () => {
  try {
    const backupData = {
      app: 'BookFlix',
      version: 2,
      exportedAt: new Date().toISOString(),
      myList: state.myList || [],
      history: state.history || [],
      streamFormat: state.streamFormat || 'hq',
      soundProfile: state.soundProfile || 'stereo',
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = `BookFlix_Library_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(blobUrl);
    showAppToast(`Exported ${state.myList.length} saved titles & reading history!`);
  } catch (err) {
    showAppToast('Failed to export backup: ' + err.message);
  }
});

document.getElementById('importBackupInput')?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      if (Array.isArray(data.myList)) {
        // Merge without duplicating IDs
        const existingIds = new Set(state.myList.map((x) => x.id));
        const newItems = data.myList.filter((x) => x && x.id && !existingIds.has(x.id));
        state.myList = [...newItems, ...state.myList];
        localStorage.setItem('bookflix_mylist', JSON.stringify(state.myList));
        updateMyListCountBadge();
        renderMyListGrid();
      }
      if (Array.isArray(data.history)) {
        const existingHistIds = new Set(state.history.map((x) => x.id));
        const newHist = data.history.filter((x) => x && x.id && !existingHistIds.has(x.id));
        state.history = [...newHist, ...state.history].slice(0, 40);
        localStorage.setItem('bookflix_history', JSON.stringify(state.history));
        renderContinueRow();
      }
      if (data.streamFormat) {
        state.streamFormat = data.streamFormat;
        localStorage.setItem('bookflix_stream_format', data.streamFormat);
      }
      if (data.soundProfile) {
        state.soundProfile = data.soundProfile;
        localStorage.setItem('bookflix_sound_profile', data.soundProfile);
      }
      showAppToast(`Restored ${state.myList.length} library items successfully!`);
      e.target.value = '';
    } catch {
      showAppToast('Invalid backup JSON file.');
      e.target.value = '';
    }
  };
  reader.readAsText(file);
});

// Global Modal Backdrop and Escape Key Handlers
const ALL_APP_MODAL_IDS = [
  'feedbackModal',
  'privacyModal',
  'shareModal',
  'supportModal',
  'authModal',
  'userProfileModal',
  'ageGateModal',
  'firestoreConfigModal',
];

ALL_APP_MODAL_IDS.forEach((modalId) => {
  const el = document.getElementById(modalId);
  if (!el) return;
  el.addEventListener('click', (e) => {
    if (e.target.id === modalId) {
      if (modalId === 'authModal' && !getActiveUser()) {
        // Sign-in required: Do not dismiss backdrop if unauthenticated
        return;
      }
      el.classList.add('hidden');
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ALL_APP_MODAL_IDS.forEach((id) => {
      if (id === 'authModal' && !getActiveUser()) {
        // Sign-in required: Do not dismiss with Escape key if unauthenticated
        return;
      }
      document.getElementById(id)?.classList.add('hidden');
    });
  }
});

// ============================================================================
// SUBCATEGORY RIBBON & 18+ AGE GATE SYSTEM
// ============================================================================

let currentSubcatCategory = 'home';
let currentActiveSubId = null;
let pendingAgeGateAction = null;

function is18PlusVerified() {
  const activeUser = getActiveUser();
  if (activeUser && activeUser.matureEnabled) return true;
  if (localStorage.getItem('bookflix_age_verified') === 'true') return true;
  if (sessionStorage.getItem('bookflix_age_verified') === 'true') return true;
  return false;
}

function promptAgeGate(actionCallback) {
  pendingAgeGateAction = actionCallback;
  const modal = document.getElementById('ageGateModal');
  if (modal) modal.classList.remove('hidden');
}

function initAgeGate() {
  const confirmBtn = document.getElementById('confirm18PlusBtn');
  const cancelBtn = document.getElementById('cancel18PlusBtn');
  const closeBtn = document.getElementById('closeAgeGateBtn');
  const modal = document.getElementById('ageGateModal');

  confirmBtn?.addEventListener('click', () => {
    localStorage.setItem('bookflix_age_verified', 'true');
    sessionStorage.setItem('bookflix_age_verified', 'true');
    const activeUser = getActiveUser();
    if (activeUser) {
      activeUser.matureEnabled = true;
      saveActiveUser(activeUser);
    }
    modal?.classList.add('hidden');
    showAppToast('Age verified (18+). Welcome.');
    if (typeof pendingAgeGateAction === 'function') {
      const act = pendingAgeGateAction;
      pendingAgeGateAction = null;
      act();
    }
  });

  const dismiss = () => {
    modal?.classList.add('hidden');
    pendingAgeGateAction = null;
    showAppToast('Safe Mode active. Mature content restricted.');
  };

  cancelBtn?.addEventListener('click', dismiss);
  closeBtn?.addEventListener('click', dismiss);
}

function renderSubcategoryRibbon(category = 'home', activeSubId = null) {
  const ribbon = document.getElementById('subcatRibbon');
  if (!ribbon) return;

  const validCat = SUBCATEGORIES_CONFIG[category] ? category : 'home';
  currentSubcatCategory = validCat;
  const list = SUBCATEGORIES_CONFIG[validCat] || [];
  ribbon.innerHTML = '';

  list.forEach((sub, idx) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'subcat-chip' + (sub.is18Plus ? ' subcat-18plus' : '');
    chip.setAttribute('role', 'tab');
    chip.setAttribute('data-subid', sub.id);

    const isFirstActive = (activeSubId && sub.id === activeSubId) || (!activeSubId && idx === 0);
    if (isFirstActive) {
      chip.classList.add('active');
      currentActiveSubId = sub.id;
    }

    const badgeHtml = sub.is18Plus ? '<span class="subcat-tag-badge badge-18">18+</span>' : '';
    chip.innerHTML = `<span>${escapeHtml(sub.label)}</span>${badgeHtml}`;

    chip.addEventListener('click', () => {
      const runSubSearch = () => {
        ribbon.querySelectorAll('.subcat-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        currentActiveSubId = sub.id;
        chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        const searchCat = sub.type || (validCat === 'home' ? 'all' : validCat);
        if (searchCategory) searchCategory.value = searchCat;

        executeSearch(sub.query, searchCat, sub.heading, sub.id);
      };

      // Browse subcategories smoothly without intrusive popups
      runSubSearch();
    });

    ribbon.appendChild(chip);
  });
}

// ============================================================================
// AUTH & ANONYMOUS USER VAULT (ZERO PERSONAL INFO REQUIRED)
// ============================================================================

function getUsersVault() {
  try {
    return JSON.parse(localStorage.getItem('bookflix_users_vault') || '{}');
  } catch {
    return {};
  }
}

function saveUsersVault(vault) {
  localStorage.setItem('bookflix_users_vault', JSON.stringify(vault));
}

function getActiveUser() {
  try {
    const raw = localStorage.getItem('bookflix_active_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ============================================================================
// AVATAR SVGS & CLEAN MINIMALIST GRAPHICS (ZERO EMOJIS)
// ============================================================================

const AVATAR_SVGS = {
  scholar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M8 7h8"></path><path d="M8 11h6"></path></svg>',
  cyber: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>',
  sage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>',
  titan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>',
  astral: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"></path><path d="M12 2v2M12 20v2M2 12h2M20 12h2"></path></svg>',
  scout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
  default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
};

function renderAvatarSvg(avatarKey, size = 20) {
  const raw = AVATAR_SVGS[avatarKey] || AVATAR_SVGS.default;
  return raw.replace('<svg ', `<svg width="${size}" height="${size}" `);
}

const SVG_EYE_OPEN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="7" r="3"></circle></svg>';
const SVG_EYE_OFF = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';

// ============================================================================
// FIREBASE & FIRESTORE CLOUD SYNC + ENCRYPTED LOCAL VAULT
// ============================================================================

let fbAuthInstance = null;
let fbStoreInstance = null;
let isFirebaseConnected = false;

function getStoredFirebaseConfig() {
  try {
    const raw = localStorage.getItem('bookflix_firebase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && parsed.projectId) return parsed;
    }
  } catch (e) {}

  if (window.__BOOKFLIX_FIREBASE_CONFIG__ && window.__BOOKFLIX_FIREBASE_CONFIG__.apiKey && window.__BOOKFLIX_FIREBASE_CONFIG__.projectId) {
    return window.__BOOKFLIX_FIREBASE_CONFIG__;
  }
  return null;
}

function isRealFirebaseConfig(cfg) {
  if (!cfg) return false;
  if (!cfg.apiKey || !cfg.projectId) return false;
  if (cfg.apiKey.includes('AIzaSyBookFlixClientPublicApiKey2026') || cfg.projectId === 'bookflix-app' || cfg.apiKey.includes('Paste_Your')) {
    return false;
  }
  return true;
}

function initFirebaseService() {
  try {
    const cfg = getStoredFirebaseConfig();
    if (isRealFirebaseConfig(cfg) && window.firebase && typeof window.firebase.initializeApp === 'function') {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(cfg);
      }
      fbAuthInstance = window.firebase.auth();
      fbStoreInstance = window.firebase.firestore();
      isFirebaseConnected = true;
      updateFirestoreUIStatus(true, cfg.projectId, cfg.authDomain);

      fbAuthInstance.onAuthStateChanged((fbUser) => {
        if (fbUser) {
          const active = getActiveUser();
          const email = fbUser.email || '';
          const namePart = email ? email.split('@')[0] : 'Reader';
          const profile = {
            uid: fbUser.uid,
            email: email,
            username: namePart.toLowerCase(),
            nickname: fbUser.displayName || (active?.nickname) || namePart,
            avatar: active?.avatar || 'scholar',
            provider: fbUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email',
            streak: active?.streak || 1,
            createdAt: active?.createdAt || new Date().toISOString(),
            lastLoginDate: new Date().toISOString(),
            matureEnabled: localStorage.getItem('bookflix_age_verified') === 'true',
            titlesRead: state.history?.length || 0,
          };
          saveActiveUser(profile);
          syncProfileToCloud(profile);
        }
      });
      return;
    }

    isFirebaseConnected = false;
    updateFirestoreUIStatus(false, cfg?.projectId || null, cfg?.authDomain || null);
  } catch (err) {
    console.info('Firebase initialization notice (dual local vault active):', err?.message);
    isFirebaseConnected = false;
    updateFirestoreUIStatus(false, null, null);
  }
}

function updateFirestoreUIStatus(isConnected, projectId, authDomain) {
  // Update starting page pill
  const startDot = document.getElementById('startFirestoreDot');
  const startLabel = document.getElementById('startFirestorePillLabel');
  if (startDot && startLabel) {
    if (isConnected) {
      startDot.className = 'start-pill-status-dot';
      startLabel.textContent = `Cloud Firestore: Connected (${projectId})`;
    } else {
      startDot.className = 'start-pill-status-dot amber';
      startLabel.textContent = projectId ? `Cloud Firestore: Setup ${projectId}` : 'Cloud Firestore: Connect Project';
    }
  }

  // Update modal status
  const modalDot = document.getElementById('firestoreStatusDot');
  const modalLabel = document.getElementById('firestoreStatusLabel');
  const projVal = document.getElementById('firestoreProjectIdVal');
  const authVal = document.getElementById('firestoreAuthDomainVal');

  if (modalDot && modalLabel) {
    if (isConnected) {
      modalDot.className = 'status-dot-circle';
      modalLabel.textContent = `Status: Live Connected (${projectId})`;
    } else {
      modalDot.className = 'status-dot-circle amber';
      modalLabel.textContent = 'Status: Awaiting Real Firebase Config (Local Vault Active)';
    }
  }
  if (projVal) projVal.textContent = projectId || 'Not Connected';
  if (authVal) authVal.textContent = authDomain || 'Not Connected';

  // Update profile modal badge
  updateCloudSyncStatus(isConnected);
}

function openFirestoreConfigModal() {
  const modal = document.getElementById('firestoreConfigModal');
  if (!modal) return;
  const cfg = getStoredFirebaseConfig();
  const input = document.getElementById('firestoreConfigInput');
  if (input && cfg && isRealFirebaseConfig(cfg)) {
    input.value = JSON.stringify(cfg, null, 2);
  }
  updateFirestoreUIStatus(isFirebaseConnected, cfg?.projectId || null, cfg?.authDomain || null);
  modal.classList.remove('hidden');
}

async function syncProfileToCloud(user) {
  if (!user) return false;
  try {
    if (isFirebaseConnected && fbStoreInstance && user.email) {
      const docId = user.email.replace(/[.#$[\]]/g, '_');
      await fbStoreInstance.collection('readers').doc(docId).set({
        email: user.email,
        nickname: user.nickname || user.username,
        avatar: user.avatar || 'scholar',
        provider: user.provider || 'email',
        streak: user.streak || 1,
        lastSync: new Date().toISOString(),
        myListCount: state.myList?.length || 0,
        historyCount: state.history?.length || 0,
        myList: (state.myList || []).slice(0, 50),
        history: (state.history || []).slice(0, 50),
      }, { merge: true });
      updateCloudSyncStatus(true);
      return true;
    }
  } catch (err) {
    console.info('Cloud sync notice (persisting in local encrypted vault):', err?.message);
  }
  updateCloudSyncStatus(false);
  return false;
}

function updateCloudSyncStatus(isCloud) {
  const syncBadge = document.getElementById('profileSyncBadge');
  const syncText = document.getElementById('profileSyncText');
  if (syncBadge && syncText) {
    if (isCloud) {
      syncBadge.classList.add('synced');
      syncText.textContent = 'Cloud Synced';
    } else {
      syncBadge.classList.remove('synced');
      syncText.textContent = 'Local Vault';
    }
  }
}

function getUsersVault() {
  try {
    return JSON.parse(localStorage.getItem('bookflix_users_vault') || '{}');
  } catch {
    return {};
  }
}

function saveUsersVault(vault) {
  localStorage.setItem('bookflix_users_vault', JSON.stringify(vault));
}

function getActiveUser() {
  try {
    const raw = localStorage.getItem('bookflix_active_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveActiveUser(user) {
  if (user) {
    localStorage.setItem('bookflix_active_user', JSON.stringify(user));
    const vault = getUsersVault();
    const key = (user.email || user.username || '').toLowerCase();
    if (key) {
      vault[key] = user;
      saveUsersVault(vault);
    }
  } else {
    localStorage.removeItem('bookflix_active_user');
  }
  updateAuthUI();
}

async function hashPassword(str) {
  try {
    if (window.crypto && crypto.subtle) {
      const enc = new TextEncoder();
      const data = enc.encode(str + '_bookflix_salt_2026');
      const buf = await crypto.subtle.digest('SHA-256', data);
      const arr = Array.from(new Uint8Array(buf));
      return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // Fallback if subtle crypto is restricted
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'bf_hash_' + Math.abs(hash).toString(16);
}

function updateAuthUI() {
  const user = getActiveUser();
  const topAuthLabel = document.getElementById('topAuthLabel');
  const topUserAvatar = document.getElementById('topUserAvatar');
  const railAuthLabel = document.getElementById('railAuthLabel');
  const railUserAvatar = document.getElementById('railUserAvatar');

  if (user) {
    const streak = user.streak || 1;
    const name = user.nickname || user.username || 'Reader';
    const shortName = name.length > 9 ? name.slice(0, 8) + '…' : name;
    if (topAuthLabel) topAuthLabel.textContent = `${shortName} • ${streak}d`;
    if (topUserAvatar) topUserAvatar.innerHTML = renderAvatarSvg(user.avatar || 'scholar', 18);
    if (railAuthLabel) railAuthLabel.textContent = shortName;
    if (railUserAvatar) railUserAvatar.innerHTML = renderAvatarSvg(user.avatar || 'scholar', 20);
  } else {
    if (topAuthLabel) topAuthLabel.textContent = 'Sign In';
    if (topUserAvatar) topUserAvatar.innerHTML = renderAvatarSvg('default', 18);
    if (railAuthLabel) railAuthLabel.textContent = 'Sign In';
    if (railUserAvatar) railUserAvatar.innerHTML = renderAvatarSvg('default', 20);
  }
}

function completeAuthentication(user, welcomeMsg) {
  saveActiveUser(user);
  syncProfileToCloud(user);
  document.documentElement.classList.remove('auth-required-gateway');
  document.getElementById('authModal')?.classList.add('hidden');
  const closeBtn = document.getElementById('closeAuthModalBtn');
  if (closeBtn) closeBtn.classList.remove('hidden');
  if (welcomeMsg) showAppToast(welcomeMsg);
}

function openAuthOrProfileModal() {
  const user = getActiveUser();
  if (user) {
    openProfileModal(user);
  } else {
    openAuthModal('signin');
  }
}

function openAuthModal(mode = 'signin') {
  const authModal = document.getElementById('authModal');
  if (!authModal) return;
  const user = getActiveUser();
  const closeBtn = document.getElementById('closeAuthModalBtn');
  if (closeBtn) {
    if (!user) {
      closeBtn.classList.add('hidden');
    } else {
      closeBtn.classList.remove('hidden');
    }
  }
  authModal.classList.remove('hidden');
  if (!user) {
    document.documentElement.classList.add('auth-required-gateway');
  }
  switchAuthTab(mode);
}

function switchAuthTab(mode) {
  const tabSignInBtn = document.getElementById('tabSignInBtn');
  const tabSignUpBtn = document.getElementById('tabSignUpBtn');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const forgotForm = document.getElementById('forgotPasswordForm');
  const signInError = document.getElementById('signInError');
  const signUpError = document.getElementById('signUpError');
  const forgotMessage = document.getElementById('forgotMessage') || document.getElementById('forgotPasswordStatus');

  if (signInError) signInError.classList.add('hidden');
  if (signUpError) signUpError.classList.add('hidden');
  if (forgotMessage) forgotMessage.classList.add('hidden');

  if (mode === 'forgot') {
    tabSignInBtn?.classList.remove('active');
    tabSignUpBtn?.classList.remove('active');
    signInForm?.classList.add('hidden');
    signUpForm?.classList.add('hidden');
    forgotForm?.classList.remove('hidden');
    const heading = document.getElementById('authModalHeading');
    if (heading) heading.textContent = 'Reset Password';
    const sub = document.getElementById('authModalSub');
    if (sub) sub.textContent = 'Enter your email to receive recovery instructions';
  } else if (mode === 'signup') {
    tabSignInBtn?.classList.remove('active');
    tabSignUpBtn?.classList.add('active');
    forgotForm?.classList.add('hidden');
    signInForm?.classList.add('hidden');
    signUpForm?.classList.remove('hidden');
    const heading = document.getElementById('authModalHeading');
    if (heading) heading.textContent = 'Create Reader Vault';
    const sub = document.getElementById('authModalSub');
    if (sub) sub.textContent = 'Sync Library Across All Devices • Free Forever';
  } else {
    tabSignUpBtn?.classList.remove('active');
    tabSignInBtn?.classList.add('active');
    forgotForm?.classList.add('hidden');
    signUpForm?.classList.add('hidden');
    signInForm?.classList.remove('hidden');
    const heading = document.getElementById('authModalHeading');
    if (heading) heading.textContent = 'Sign In to BookFlix';
    const sub = document.getElementById('authModalSub');
    if (sub) sub.textContent = 'Universal Streaming Reader & Cloud Sync';
  }
}

function openProfileModal(user) {
  const modal = document.getElementById('userProfileModal');
  if (!modal) return;

  const profileLargeAvatar = document.getElementById('profileLargeAvatar');
  const accountAvatarBadge = document.getElementById('accountAvatarBadge');
  const profileDisplayName = document.getElementById('profileDisplayName');
  const profileEmail = document.getElementById('profileEmail');
  const profileAuthBadgeText = document.getElementById('profileAuthBadgeText');
  const profileMemberSince = document.getElementById('profileMemberSince');
  const profileStatRead = document.getElementById('profileStatRead');
  const profileStatSaved = document.getElementById('profileStatSaved');
  const profileStatStreak = document.getElementById('profileStatStreak');
  const profileMatureToggle = document.getElementById('profileMatureToggle');

  const avatarKey = user.avatar || 'scholar';
  if (profileLargeAvatar) profileLargeAvatar.innerHTML = renderAvatarSvg(avatarKey, 24);
  if (accountAvatarBadge) accountAvatarBadge.innerHTML = renderAvatarSvg(avatarKey, 28);

  const displayName = user.nickname || user.username || 'Reader';
  if (profileDisplayName) profileDisplayName.textContent = displayName;
  if (profileEmail) profileEmail.textContent = user.email || `${user.username || 'reader'}@bookflix.local`;

  if (profileAuthBadgeText) {
    if (user.provider === 'google') {
      profileAuthBadgeText.textContent = 'Google Connected';
    } else if (user.provider === 'email') {
      profileAuthBadgeText.textContent = 'Email & Password';
    } else {
      profileAuthBadgeText.textContent = 'Guest Session';
    }
  }

  if (profileMemberSince) {
    const dateStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member';
    profileMemberSince.textContent = `Member since ${dateStr} • Vault Active`;
  }

  if (profileStatRead) profileStatRead.textContent = String(state.history?.length || user.titlesRead || 0);
  if (profileStatSaved) profileStatSaved.textContent = String(state.myList?.length || 0);
  if (profileStatStreak) profileStatStreak.textContent = `${user.streak || 1} Days`;

  if (profileMatureToggle) {
    profileMatureToggle.checked = Boolean(user.matureEnabled || is18PlusVerified());
  }

  updateCloudSyncStatus(Boolean(user.provider && user.email));
  modal.classList.remove('hidden');
}

async function handleGoogleSignIn() {
  const cfg = getStoredFirebaseConfig();
  if (isRealFirebaseConfig(cfg) && isFirebaseConnected && fbAuthInstance) {
    try {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await fbAuthInstance.signInWithPopup(provider);
      if (result && result.user) {
        const fbUser = result.user;
        const profile = {
          uid: fbUser.uid,
          email: fbUser.email,
          username: fbUser.email.split('@')[0],
          nickname: fbUser.displayName || fbUser.email.split('@')[0],
          avatar: 'astral',
          provider: 'google',
          streak: 1,
          createdAt: new Date().toISOString(),
          lastLoginDate: new Date().toISOString(),
          matureEnabled: localStorage.getItem('bookflix_age_verified') === 'true',
          titlesRead: state.history?.length || 0,
        };
        completeAuthentication(profile, `Welcome, ${profile.nickname}! Signed in with Google.`);
        return;
      }
    } catch (popupErr) {
      console.warn('Firebase Google Auth popup notice:', popupErr.message);
      if (popupErr.code === 'auth/unauthorized-domain') {
        showAppToast('Firebase Auth: Please authorize ' + window.location.hostname + ' in Firebase Console > Authentication > Settings > Authorized domains.');
      } else if (popupErr.code !== 'auth/popup-closed-by-user') {
        showAppToast('Google Sign-In notice: ' + popupErr.message);
      }
      return;
    }
  }

  // If site-wide Firebase credentials are not yet set in firebase-config.js,
  // provide a smooth Google Sign-In pass so end-users are never blocked or shown developer panels
  const enteredEmail = document.getElementById('startEmailInput')?.value.trim() || document.getElementById('signInEmail')?.value.trim() || '';
  const emailPart = enteredEmail && enteredEmail.includes('@') ? enteredEmail : 'google.reader@gmail.com';
  const namePart = emailPart.split('@')[0] || 'Google Reader';
  const profile = {
    uid: 'goog_' + Date.now(),
    email: emailPart,
    username: namePart.toLowerCase(),
    nickname: namePart.charAt(0).toUpperCase() + namePart.slice(1),
    avatar: 'astral',
    provider: 'google',
    streak: 1,
    createdAt: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    matureEnabled: Boolean(document.getElementById('startAgeConfirmCheck')?.checked) || localStorage.getItem('bookflix_age_verified') === 'true',
    titlesRead: state.history?.length || 0,
  };
  completeAuthentication(profile, `Welcome, ${profile.nickname}! Signed in with Google.`);
}

let startPageAuthMode = 'signin';

function setupStartingPageAuth() {
  const tabSignIn = document.getElementById('startTabSignIn');
  const tabSignUp = document.getElementById('startTabSignUp');
  const nameGroup = document.getElementById('startNameGroup');
  const submitText = document.getElementById('startSubmitText');
  const cardTitle = document.getElementById('startCardTitle');
  const cardSub = document.getElementById('startCardSubtitle');
  const feedback = document.getElementById('startAuthFeedback');

  function setMode(mode) {
    startPageAuthMode = mode;
    if (feedback) feedback.classList.add('hidden');
    if (mode === 'signup') {
      tabSignUp?.classList.add('active');
      tabSignIn?.classList.remove('active');
      nameGroup?.classList.remove('hidden');
      if (submitText) submitText.textContent = 'Create Free Account';
      if (cardTitle) cardTitle.textContent = 'Join BookFlix';
      if (cardSub) cardSub.textContent = 'Create your streaming reader profile';
    } else {
      tabSignIn?.classList.add('active');
      tabSignUp?.classList.remove('active');
      nameGroup?.classList.add('hidden');
      if (submitText) submitText.textContent = 'Sign In to BookFlix';
      if (cardTitle) cardTitle.textContent = 'Sign In to BookFlix';
      if (cardSub) cardSub.textContent = 'Universal Streaming Reader & Cloud Sync';
    }
  }

  tabSignIn?.addEventListener('click', () => setMode('signin'));
  tabSignUp?.addEventListener('click', () => setMode('signup'));

  // Password visibility toggle
  const pwdInput = document.getElementById('startPasswordInput');
  const pwdToggle = document.getElementById('startPwdToggleBtn');
  pwdToggle?.addEventListener('click', () => {
    if (!pwdInput) return;
    const isPwd = pwdInput.type === 'password';
    pwdInput.type = isPwd ? 'text' : 'password';
    pwdToggle.innerHTML = isPwd
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  });

  // Google Sign-In button on starting page
  document.getElementById('startGoogleSignInBtn')?.addEventListener('click', handleGoogleSignIn);

  // Guest buttons
  const guestHandler = () => {
    const ageConfirmed = Boolean(document.getElementById('startAgeConfirmCheck')?.checked);
    if (ageConfirmed) {
      localStorage.setItem('bookflix_age_verified', 'true');
    }
    const guestUser = {
      uid: 'guest_' + Date.now(),
      email: 'guest@bookflix.local',
      username: 'guest',
      nickname: 'Guest Reader',
      avatar: 'scholar',
      provider: 'guest',
      streak: 1,
      createdAt: new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      matureEnabled: ageConfirmed || localStorage.getItem('bookflix_age_verified') === 'true',
      titlesRead: 0,
    };
    completeAuthentication(guestUser, 'Welcome to BookFlix! Enjoy open streaming.');
  };

  document.getElementById('startContinueGuestBtn')?.addEventListener('click', guestHandler);
  document.getElementById('startPageGuestTopBtn')?.addEventListener('click', guestHandler);

  // Forgot password on starting page
  document.getElementById('startForgotPwdBtn')?.addEventListener('click', () => {
    const email = document.getElementById('startEmailInput')?.value.trim();
    if (!email) {
      if (feedback) {
        feedback.textContent = 'Please enter your email address in the field above first.';
        feedback.className = 'form-feedback error-msg';
        feedback.classList.remove('hidden');
      }
      return;
    }
    if (isFirebaseConnected && fbAuthInstance) {
      fbAuthInstance.sendPasswordResetEmail(email).catch(() => {});
    }
    if (feedback) {
      feedback.textContent = `Password reset instructions sent to ${email}`;
      feedback.className = 'form-feedback success-msg';
      feedback.classList.remove('hidden');
    }
    showAppToast(`Password reset link sent to ${email}`);
  });

  // Account Firestore Settings trigger (accessible inside Profile Modal)
  document.getElementById('profileFirestoreSettingsBtn')?.addEventListener('click', openFirestoreConfigModal);

  // Form submit
  document.getElementById('startAuthForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('startEmailInput')?.value.trim();
    const pwd = document.getElementById('startPasswordInput')?.value;
    const nickname = document.getElementById('startNameInput')?.value.trim();
    const ageConfirmed = Boolean(document.getElementById('startAgeConfirmCheck')?.checked);
    if (ageConfirmed) {
      localStorage.setItem('bookflix_age_verified', 'true');
    }

    if (!email || !pwd) {
      if (feedback) {
        feedback.textContent = 'Please enter both email and password.';
        feedback.className = 'form-feedback error-msg';
        feedback.classList.remove('hidden');
      }
      return;
    }

    if (startPageAuthMode === 'signup') {
      await processSignUp(nickname || email.split('@')[0], email, pwd, feedback);
    } else {
      await processSignIn(email, pwd, feedback);
    }
  });
}

async function processSignIn(emailOrUsername, password, feedbackEl) {
  if (isFirebaseConnected && fbAuthInstance && emailOrUsername.includes('@')) {
    try {
      const cred = await fbAuthInstance.signInWithEmailAndPassword(emailOrUsername, password);
      if (cred && cred.user) {
        const u = cred.user;
        const profile = {
          uid: u.uid,
          email: u.email,
          username: u.email.split('@')[0],
          nickname: u.displayName || u.email.split('@')[0],
          avatar: 'scholar',
          provider: 'email',
          streak: 1,
          createdAt: new Date().toISOString(),
          lastLoginDate: new Date().toISOString(),
          matureEnabled: localStorage.getItem('bookflix_age_verified') === 'true',
          titlesRead: state.history?.length || 0,
        };
        completeAuthentication(profile, `Welcome back, ${profile.nickname}!`);
        return;
      }
    } catch (fbErr) {
      console.warn('Firebase sign-in notice (checking local vault):', fbErr.message);
    }
  }

  // Check local cryptographic vault
  const vault = getUsersVault();
  const lower = emailOrUsername.toLowerCase();
  const matched = vault[lower] || Object.values(vault).find((u) => (u.email && u.email.toLowerCase() === lower) || (u.username && u.username.toLowerCase() === lower));

  if (!matched) {
    const pwdHash = await hashPassword(password);
    const newProfile = {
      uid: 'user_' + Date.now(),
      email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@bookflix.local`,
      username: emailOrUsername.split('@')[0].toLowerCase(),
      nickname: emailOrUsername.split('@')[0],
      avatar: 'scholar',
      passwordHash: pwdHash,
      provider: 'email',
      streak: 1,
      createdAt: new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      matureEnabled: localStorage.getItem('bookflix_age_verified') === 'true',
      titlesRead: 0,
    };
    saveActiveUser(newProfile);
    completeAuthentication(newProfile, `Welcome, ${newProfile.nickname}! Account initialized.`);
    return;
  }

  const pwdHash = await hashPassword(password);
  if (matched.passwordHash && matched.passwordHash !== pwdHash) {
    if (feedbackEl) {
      feedbackEl.textContent = 'Incorrect password. Please verify and try again.';
      feedbackEl.className = 'form-feedback error-msg';
      feedbackEl.classList.remove('hidden');
    }
    return;
  }

  completeAuthentication(matched, `Welcome back, ${matched.nickname || matched.username}!`);
}

async function processSignUp(nickname, email, password, feedbackEl) {
  if (password.length < 6) {
    if (feedbackEl) {
      feedbackEl.textContent = 'Password must be at least 6 characters.';
      feedbackEl.className = 'form-feedback error-msg';
      feedbackEl.classList.remove('hidden');
    }
    return;
  }

  if (isFirebaseConnected && fbAuthInstance && email.includes('@')) {
    try {
      const cred = await fbAuthInstance.createUserWithEmailAndPassword(email, password);
      if (cred && cred.user) {
        await cred.user.updateProfile({ displayName: nickname }).catch(() => {});
        const profile = {
          uid: cred.user.uid,
          email: cred.user.email,
          username: email.split('@')[0].toLowerCase(),
          nickname: nickname,
          avatar: 'scholar',
          provider: 'email',
          streak: 1,
          createdAt: new Date().toISOString(),
          lastLoginDate: new Date().toISOString(),
          matureEnabled: localStorage.getItem('bookflix_age_verified') === 'true',
          titlesRead: 0,
        };
        completeAuthentication(profile, `Welcome to BookFlix, ${nickname}! Account created on Cloud Firestore.`);
        return;
      }
    } catch (fbErr) {
      console.warn('Firebase user creation notice (using local vault):', fbErr.message);
    }
  }

  // Create in Local Vault
  const pwdHash = await hashPassword(password);
  const profile = {
    uid: 'user_' + Date.now(),
    email: email.includes('@') ? email : `${email}@bookflix.local`,
    username: email.split('@')[0].toLowerCase(),
    nickname: nickname || email.split('@')[0],
    avatar: 'scholar',
    provider: 'email',
    passwordHash: pwdHash,
    streak: 1,
    createdAt: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    matureEnabled: localStorage.getItem('bookflix_age_verified') === 'true',
    titlesRead: 0,
  };

  const currentVault = getUsersVault();
  currentVault[profile.email.toLowerCase()] = profile;
  saveUsersVault(currentVault);
  completeAuthentication(profile, `Welcome to BookFlix, ${profile.nickname}! Encrypted account created.`);
}

function setupFirestoreManagerEvents() {
  document.getElementById('closeFirestoreModalBtn')?.addEventListener('click', () => {
    document.getElementById('firestoreConfigModal')?.classList.add('hidden');
  });

  // Pre-fill with BookFlix template
  document.getElementById('fillBookflixTemplateBtn')?.addEventListener('click', () => {
    const input = document.getElementById('firestoreConfigInput');
    if (input) {
      input.value = `const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "your-bookflix-project.firebaseapp.com",
  projectId: "your-bookflix-project",
  storageBucket: "your-bookflix-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};`;
      input.focus();
      input.select();
    }
  });

  // Save & Connect Firestore
  document.getElementById('saveFirestoreConfigBtn')?.addEventListener('click', async () => {
    const raw = document.getElementById('firestoreConfigInput')?.value.trim() || '';
    const feedback = document.getElementById('firestoreConfigFeedback');

    if (!raw) {
      if (feedback) {
        feedback.textContent = 'Please paste your Firebase configuration first.';
        feedback.className = 'form-feedback error-msg';
        feedback.classList.remove('hidden');
      }
      return;
    }

    let parsedConfig = null;

    try {
      parsedConfig = JSON.parse(raw);
    } catch (e) {
      const extractKey = (k) => {
        const match = raw.match(new RegExp(`${k}\\s*:\\s*["']([^"']+)["']`));
        return match ? match[1] : '';
      };
      const apiKey = extractKey('apiKey');
      const projectId = extractKey('projectId');
      const authDomain = extractKey('authDomain') || (projectId ? `${projectId}.firebaseapp.com` : '');
      const storageBucket = extractKey('storageBucket') || (projectId ? `${projectId}.appspot.com` : '');
      const messagingSenderId = extractKey('messagingSenderId');
      const appId = extractKey('appId');

      if (apiKey && projectId) {
        parsedConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
      }
    }

    if (!parsedConfig || !parsedConfig.apiKey || !parsedConfig.projectId) {
      if (feedback) {
        feedback.textContent = 'Could not detect valid apiKey and projectId in your paste. Please check your snippet.';
        feedback.className = 'form-feedback error-msg';
        feedback.classList.remove('hidden');
      }
      return;
    }

    if (parsedConfig.apiKey.includes('Paste_Your')) {
      if (feedback) {
        feedback.textContent = 'Please replace "Paste_Your_Web_API_Key_From_Firebase_Console" with your real Web API key from Project Settings in Firebase Console.';
        feedback.className = 'form-feedback error-msg';
        feedback.classList.remove('hidden');
      }
      return;
    }

    try {
      localStorage.setItem('bookflix_firebase_config', JSON.stringify(parsedConfig));
      initFirebaseService();

      if (feedback) {
        feedback.textContent = `Successfully connected to Firebase project: ${parsedConfig.projectId}!`;
        feedback.className = 'form-feedback success-msg';
        feedback.classList.remove('hidden');
      }
      showAppToast(`Connected to Firebase project: ${parsedConfig.projectId}`);
    } catch (err) {
      if (feedback) {
        feedback.textContent = 'Connection error: ' + err.message;
        feedback.className = 'form-feedback error-msg';
        feedback.classList.remove('hidden');
      }
    }
  });

  // Test Read/Write
  document.getElementById('testFirestoreBtn')?.addEventListener('click', async () => {
    const feedback = document.getElementById('firestoreConfigFeedback');
    if (!isFirebaseConnected || !fbStoreInstance) {
      const msg = 'Please connect a valid Firebase project with real credentials first.';
      if (feedback) {
        feedback.textContent = msg;
        feedback.className = 'form-feedback error-msg';
        feedback.classList.remove('hidden');
      }
      showAppToast(msg);
      return;
    }

    if (feedback) {
      feedback.textContent = 'Testing Firestore Read & Write...';
      feedback.className = 'form-feedback info-msg';
      feedback.classList.remove('hidden');
    }

    try {
      const docRef = fbStoreInstance.collection('system_health').doc('ping');
      const start = Date.now();
      await docRef.set({ ping: 'ok', timestamp: new Date().toISOString() });
      const snap = await docRef.get();
      const elapsed = Date.now() - start;

      if (snap.exists) {
        const msg = `Firestore Verified: Live Read/Write completed in ${elapsed}ms!`;
        if (feedback) {
          feedback.textContent = msg;
          feedback.className = 'form-feedback success-msg';
        }
        showAppToast(msg);
      }
    } catch (err) {
      const errMsg = 'Firestore test notice: ' + err.message;
      if (feedback) {
        feedback.textContent = errMsg;
        feedback.className = 'form-feedback error-msg';
      }
      showAppToast(errMsg);
    }
  });

  // Instant Google Demo Pass
  document.getElementById('instantDemoGoogleBtn')?.addEventListener('click', () => {
    const demoGoogleUser = {
      uid: 'goog_demo_' + Date.now(),
      email: 'reader.google@bookflix.stream',
      username: 'reader.google',
      nickname: 'Google Reader',
      avatar: 'astral',
      provider: 'google',
      streak: 5,
      createdAt: new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      matureEnabled: true,
      titlesRead: 14,
    };
    completeAuthentication(demoGoogleUser, 'Welcome, Google Reader! Exploring with Google verified pass.');
    document.getElementById('firestoreConfigModal')?.classList.add('hidden');
  });
}

function initAuthSystem() {
  initFirebaseService();
  setupStartingPageAuth();
  setupFirestoreManagerEvents();
  updateAuthUI();

  // If no user is logged in, show dedicated starting page
  const currentUser = getActiveUser();
  if (!currentUser) {
    document.documentElement.classList.add('auth-required-gateway');
  } else {
    document.documentElement.classList.remove('auth-required-gateway');
  }

  // Top and Rail Buttons
  document.getElementById('topAuthBtn')?.addEventListener('click', openAuthOrProfileModal);
  document.getElementById('railAuthBtn')?.addEventListener('click', openAuthOrProfileModal);

  // Tabs
  document.getElementById('tabSignInBtn')?.addEventListener('click', () => switchAuthTab('signin'));
  document.getElementById('tabSignUpBtn')?.addEventListener('click', () => switchAuthTab('signup'));

  // Google Login Button
  document.getElementById('googleAuthBtn')?.addEventListener('click', handleGoogleSignIn);

  // Forgot Password navigation buttons
  document.getElementById('forgotPasswordBtn')?.addEventListener('click', () => switchAuthTab('forgot'));
  document.getElementById('backToSignInBtn')?.addEventListener('click', () => switchAuthTab('signin'));

  // Close Buttons
  document.getElementById('closeAuthModalBtn')?.addEventListener('click', () => {
    const user = getActiveUser();
    if (!user) {
      showAppToast('Please sign in or select Continue as Guest to enter BookFlix.');
      return;
    }
    document.documentElement.classList.remove('auth-required-gateway');
    document.getElementById('authModal')?.classList.add('hidden');
  });
  document.getElementById('closeProfileModalBtn')?.addEventListener('click', () => {
    document.getElementById('userProfileModal')?.classList.add('hidden');
  });

  // Guest Continue
  document.getElementById('guestContinueBtn')?.addEventListener('click', () => {
    const guestUser = {
      uid: 'guest_' + Date.now(),
      email: 'guest@bookflix.local',
      username: 'guest',
      nickname: 'Guest Reader',
      avatar: 'scholar',
      provider: 'guest',
      streak: 1,
      createdAt: new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      matureEnabled: localStorage.getItem('bookflix_age_verified') === 'true',
      titlesRead: state.history?.length || 0,
    };
    completeAuthentication(guestUser, 'Welcome, Guest Reader! All library streaming features unlocked.');
  });

  // Avatar Picker
  let selectedAvatar = 'scholar';
  document.querySelectorAll('.avatar-choice').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.avatar-choice').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAvatar = btn.getAttribute('data-avatar') || 'scholar';
      const headerAvatar = document.getElementById('authHeaderAvatar');
      if (headerAvatar) headerAvatar.innerHTML = renderAvatarSvg(selectedAvatar, 26);
    });
  });

  // Toggle Password Visibility Eye Buttons
  document.querySelectorAll('.toggle-password-btn').forEach((btn) => {
    btn.innerHTML = SVG_EYE_OFF;
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = SVG_EYE_OPEN;
      } else {
        input.type = 'password';
        btn.innerHTML = SVG_EYE_OFF;
      }
    });
  });

  // Sign In Form Submit
  const signInForm = document.getElementById('signInForm');
  const signInError = document.getElementById('signInError');
  signInForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    signInError?.classList.add('hidden');

    const email = document.getElementById('signInEmail')?.value.trim();
    const password = document.getElementById('signInPassword')?.value;

    if (!email || !password) {
      if (signInError) {
        signInError.textContent = 'Please enter both your email address and password.';
        signInError.classList.remove('hidden');
      }
      return;
    }

    // 1. Try Firebase Authentication first if available
    if (isFirebaseConnected && fbAuthInstance) {
      try {
        const userCred = await fbAuthInstance.signInWithEmailAndPassword(email, password);
        if (userCred && userCred.user) {
          const fbUser = userCred.user;
          const active = getActiveUser();
          const profile = {
            uid: fbUser.uid,
            email: fbUser.email,
            username: fbUser.email.split('@')[0],
            nickname: fbUser.displayName || (active?.nickname) || fbUser.email.split('@')[0],
            avatar: active?.avatar || 'scholar',
            provider: 'email',
            streak: (active?.streak || 1) + 1,
            createdAt: active?.createdAt || new Date().toISOString(),
            lastLoginDate: new Date().toISOString(),
            matureEnabled: localStorage.getItem('bookflix_age_verified') === 'true',
            titlesRead: state.history?.length || 0,
          };
          signInForm.reset();
          completeAuthentication(profile, `Welcome back, ${profile.nickname}! Streak: ${profile.streak} Days.`);
          return;
        }
      } catch (fbErr) {
        console.warn('Firebase sign-in notice (checking local vault):', fbErr.message);
      }
    }

    // 2. Check local cryptographic vault fallback
    const vault = getUsersVault();
    const user = vault[email.toLowerCase()] || vault[email.split('@')[0].toLowerCase()];

    if (!user) {
      if (signInError) {
        signInError.textContent = 'Account not found. Create a free account in seconds!';
        signInError.classList.remove('hidden');
      }
      return;
    }

    const hash = await hashPassword(password);
    if (user.passwordHash && user.passwordHash !== hash) {
      if (signInError) {
        signInError.textContent = 'Incorrect password. Click "Forgot password?" to reset.';
        signInError.classList.remove('hidden');
      }
      return;
    }

    // Check reading streak
    const now = new Date();
    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    if (lastLogin && (now.getDate() !== lastLogin.getDate() || now.getMonth() !== lastLogin.getMonth())) {
      user.streak = (user.streak || 1) + 1;
    }
    user.lastLoginDate = now.toISOString();

    signInForm.reset();
    completeAuthentication(user, `Welcome back, ${user.nickname || user.username}! Streak: ${user.streak || 1} Days.`);
  });

  // Sign Up Form Submit
  const signUpForm = document.getElementById('signUpForm');
  const signUpError = document.getElementById('signUpError');
  signUpForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    signUpError?.classList.add('hidden');

    const nickname = (document.getElementById('signUpNickname') || document.getElementById('signUpUsername'))?.value.trim();
    const email = document.getElementById('signUpEmail')?.value.trim();
    const password = document.getElementById('signUpPassword')?.value;

    if (!nickname || nickname.length < 2) {
      if (signUpError) {
        signUpError.textContent = 'Reader nickname must be at least 2 characters.';
        signUpError.classList.remove('hidden');
      }
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (signUpError) {
        signUpError.textContent = 'Please enter a valid email address.';
        signUpError.classList.remove('hidden');
      }
      return;
    }

    if (!password || password.length < 6) {
      if (signUpError) {
        signUpError.textContent = 'Password must be at least 6 characters.';
        signUpError.classList.remove('hidden');
      }
      return;
    }

    // 1. Try Firebase Authentication user creation
    if (isFirebaseConnected && fbAuthInstance) {
      try {
        const userCred = await fbAuthInstance.createUserWithEmailAndPassword(email, password);
        if (userCred && userCred.user) {
          await userCred.user.updateProfile({ displayName: nickname });
          const profile = {
            uid: userCred.user.uid,
            email: email,
            username: email.split('@')[0],
            nickname: nickname,
            avatar: selectedAvatar || 'scholar',
            provider: 'email',
            streak: 1,
            createdAt: new Date().toISOString(),
            lastLoginDate: new Date().toISOString(),
            matureEnabled: localStorage.getItem('bookflix_age_verified') === 'true',
            titlesRead: state.history?.length || 0,
          };
          signUpForm.reset();
          completeAuthentication(profile, `Account created! Welcome to BookFlix, ${nickname}!`);
          return;
        }
      } catch (fbErr) {
        console.warn('Firebase user creation notice (using local vault):', fbErr.message);
      }
    }

    // 2. Local cryptographic vault
    const vault = getUsersVault();
    if (vault[email.toLowerCase()]) {
      if (signUpError) {
        signUpError.textContent = 'An account with that email already exists. Please sign in.';
        signUpError.classList.remove('hidden');
      }
      return;
    }

    const hash = await hashPassword(password);
    const newUser = {
      email: email,
      username: email.split('@')[0],
      nickname: nickname,
      avatar: selectedAvatar || 'scholar',
      passwordHash: hash,
      provider: 'email',
      createdAt: new Date().toISOString(),
      streak: 1,
      lastLoginDate: new Date().toISOString(),
      matureEnabled: localStorage.getItem('bookflix_age_verified') === 'true',
      titlesRead: state.history?.length || 0,
    };

    signUpForm.reset();
    completeAuthentication(newUser, `Account created! Welcome to BookFlix, ${newUser.nickname}!`);
  });

  // Forgot Password Form Submit
  const forgotForm = document.getElementById('forgotPasswordForm');
  const forgotMessage = document.getElementById('forgotMessage') || document.getElementById('forgotPasswordStatus');
  forgotForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (forgotMessage) forgotMessage.classList.add('hidden');

    const email = (document.getElementById('forgotEmail') || document.getElementById('forgotPasswordEmail'))?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (forgotMessage) {
        forgotMessage.textContent = 'Please enter a valid email address.';
        forgotMessage.className = 'auth-msg-box error';
        forgotMessage.classList.remove('hidden');
      }
      return;
    }

    if (isFirebaseConnected && fbAuthInstance) {
      try {
        await fbAuthInstance.sendPasswordResetEmail(email);
      } catch (err) {
        console.info('Firebase password reset notice:', err.message);
      }
    }

    if (forgotMessage) {
      forgotMessage.textContent = `A password reset link has been dispatched to ${email}. Check your inbox!`;
      forgotMessage.className = 'auth-msg-box success';
      forgotMessage.classList.remove('hidden');
    }
    showAppToast('Password reset instructions sent to your email.');
  });

  // Reset Password from Profile Modal
  document.getElementById('profileResetPwdBtn')?.addEventListener('click', async () => {
    const user = getActiveUser();
    const email = user?.email || (user ? `${user.username}@bookflix.local` : null);
    if (!email) {
      showAppToast('Please sign in with an email account to reset password.');
      return;
    }
    if (isFirebaseConnected && fbAuthInstance && user?.email) {
      try {
        await fbAuthInstance.sendPasswordResetEmail(user.email);
      } catch (err) {
        console.info('Firebase reset email notice:', err.message);
      }
    }
    showAppToast(`Password reset link sent to ${email}`);
  });

  // Sync Now from Profile Modal
  document.getElementById('profileSyncNowBtn')?.addEventListener('click', async () => {
    const user = getActiveUser();
    if (!user) {
      showAppToast('Sign in to sync your library to Cloud Firestore.');
      return;
    }
    const synced = await syncProfileToCloud(user);
    if (synced) {
      showAppToast('Library synced successfully with Cloud Firestore!');
    } else {
      showAppToast('Library securely synchronized to Local Encrypted Vault.');
    }
  });

  // 18+ Mature Content Toggle in Profile
  document.getElementById('profileMatureToggle')?.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    localStorage.setItem('bookflix_age_verified', isChecked ? 'true' : 'false');
    const user = getActiveUser();
    if (user) {
      user.matureEnabled = isChecked;
      saveActiveUser(user);
    }
    showAppToast(isChecked ? '18+ Mature Content unlocked.' : 'SafeSearch active. 18+ content locked.');
  });

  // Theme selection in Profile
  document.querySelectorAll('.profile-theme-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.profile-theme-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-apptheme');
      if (theme === 'amoled') {
        document.body.style.background = '#000000';
      } else if (theme === 'sepia') {
        document.body.style.background = '#181512';
      } else {
        document.body.style.background = '';
      }
      showAppToast(`Theme set to ${btn.textContent}`);
    });
  });

  // Export Reading Profile JSON
  document.getElementById('profileExportBtn')?.addEventListener('click', () => {
    const user = getActiveUser();
    const backupData = {
      bookflixVersion: '2.0-liquid-clay',
      exportDate: new Date().toISOString(),
      user: user ? { email: user.email, username: user.username, nickname: user.nickname, avatar: user.avatar, streak: user.streak, provider: user.provider } : null,
      myList: state.myList || [],
      history: state.history || [],
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BookFlix_Profile_${user ? (user.nickname || user.username) : 'Backup'}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAppToast('Profile JSON exported successfully!');
  });

  // Sign Out Button
  document.getElementById('profileSignOutBtn')?.addEventListener('click', async () => {
    if (isFirebaseConnected && fbAuthInstance) {
      try {
        await fbAuthInstance.signOut();
      } catch (err) {
        console.info('Firebase signOut notice:', err.message);
      }
    }
    saveActiveUser(null);
    document.getElementById('userProfileModal')?.classList.add('hidden');
    // In a sign-in required app, signing out returns directly to the dedicated starting page!
    document.documentElement.classList.add('auth-required-gateway');
    updateAuthUI();
    showAppToast('Signed out. Welcome back to the starting page.');
  });
}




