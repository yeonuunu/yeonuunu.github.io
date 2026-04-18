/*
 * Name: Leeyeonwoo
 * Date: 2026-04-19
 * Section: 정보통신공학과
 *
 * 이 파일은 음악 플레이리스트 웹사이트의 상호작용 기능을 담당하는 JavaScript 파일이다.
 * 사용자의 클릭 및 키보드 입력에 반응하여 곡 추가, 곡 삭제, 좋아요 증가,
 * 앨범 커버 변경, 순위 재정렬, 토스트 메시지 표시 등의 기능을 수행한다.
 */

"use strict";

(function() {
  /** 플레이리스트에 추가할 수 있는 최대 곡 수 */
  const MAX_SONGS = 100;

  /** 토스트 메시지가 화면에 표시되는 시간(ms) */
  const TOAST_DURATION = 2400;

  /** 입력값이 비어 있을 때 붙이는 유효성 검사 클래스 이름 */
  const INVALID_CLASS = "invalid-input";

  /** 현재 플레이리스트에 표시할 곡 데이터 배열 */
  let songs = [
    {id: 1, title: "Shrink", artist: "HONNE", hearts: 0, coverUrl: null},
    {id: 2, title: "Hate you", artist: "Yerin Baek", hearts: 0, coverUrl: null},
    {id: 3, title: "Cowboy in L.A.", artist: "LANY", hearts: 0, coverUrl: null},
    {id: 4, title: "Mother", artist: "Charlie Puth", hearts: 0, coverUrl: null},
    {id: 5, title: "lalala that's how it goes", artist: "HONNE", hearts: 0, coverUrl: null},
    {id: 6, title: "Chasing Fire", artist: "Lauv", hearts: 0, coverUrl: null}
  ];

  /** 새 곡이 추가될 때 사용할 다음 id 값 */
  let nextId = 7;

  /** 토스트 타이머 id 저장용 변수 */
  let toastTimer = null;

  /** 페이지 로드가 끝나면 초기화 함수 실행 */
  window.addEventListener("load", init);

  /**
   * 페이지가 로드된 뒤 필요한 이벤트를 연결하고
   * 처음 화면을 렌더링한다.
   * @returns {void}
   */
  function init() {
    id("add-btn").addEventListener("click", openModal);
    id("modal-close").addEventListener("click", closeModal);
    id("modal-cancel").addEventListener("click", closeModal);
    id("modal-confirm").addEventListener("click", handleAddSong);

    id("modal").addEventListener("click", handleModalOverlayClick);
    id("input-title").addEventListener("keydown", handleEnterSubmit);
    id("input-artist").addEventListener("keydown", handleEnterSubmit);

    render();
  }

  /**
   * 곡 배열을 정렬한 뒤 화면에 다시 그린다.
   * 상위 3곡은 카드 형태로, 나머지는 리스트 형태로 출력한다.
   * @returns {void}
   */
  function render() {
    const sortedSongs = getSortedSongs();
    const cardArea = id("cards-row");
    const listArea = id("list-section");

    clearChildren(cardArea);
    clearChildren(listArea);

    for (let i = 0; i < sortedSongs.length; i++) {
      const song = sortedSongs[i];
      const rank = i + 1;

      if (rank <= 3) {
        cardArea.appendChild(makeCard(song, rank));
      } else {
        listArea.appendChild(makeListItem(song, rank));
      }
    }
  }

  /**
   * 좋아요 수를 기준으로 곡을 내림차순 정렬한 새 배열을 반환한다.
   * 좋아요 수가 같으면 id가 작은 곡이 먼저 오도록 한다.
   * @returns {Object[]} 정렬된 곡 배열
   */
  function getSortedSongs() {
    const sorted = songs.slice();

    sorted.sort(function(a, b) {
      if (b.hearts !== a.hearts) {
        return b.hearts - a.hearts;
      }
      return a.id - b.id;
    });

    return sorted;
  }

  /**
   * 상위 1~3위 곡을 카드 형태의 DOM 요소로 만들어 반환한다.
   * @param {Object} song - 곡 정보 객체
   * @param {number} rank - 현재 순위
   * @returns {HTMLElement} 생성된 카드 요소
   */
  function makeCard(song, rank) {
    const card = gen("div");
    const number = gen("span");
    const title = gen("span");
    const artist = gen("span");
    const heartBtn = makeHeartButton(song);
    const deleteBtn = makeDeleteButton(song.id);

    card.classList.add("song-card");

    number.classList.add("song-card__num");
    number.textContent = rank + ".";

    title.classList.add("song-card__title");
    title.textContent = song.title;

    artist.classList.add("song-card__artist");
    artist.textContent = song.artist;

    card.appendChild(number);
    card.appendChild(title);
    card.appendChild(makeArtElement(song));
    card.appendChild(artist);
    card.appendChild(heartBtn);
    card.appendChild(deleteBtn);

    return card;
  }

  /**
   * 4위 이하 곡을 리스트 아이템 형태의 DOM 요소로 만들어 반환한다.
   * @param {Object} song - 곡 정보 객체
   * @param {number} rank - 현재 순위
   * @returns {HTMLElement} 생성된 리스트 아이템 요소
   */
  function makeListItem(song, rank) {
    const item = gen("div");
    const number = gen("span");
    const info = gen("div");
    const title = gen("span");
    const artist = gen("span");
    const heartBtn = makeHeartButton(song);
    const deleteBtn = makeDeleteButton(song.id);

    item.classList.add("list-item");

    number.classList.add("list-item__num");
    number.textContent = rank + ".";

    info.classList.add("list-item__info");

    title.classList.add("list-item__title");
    title.textContent = song.title;

    artist.classList.add("list-item__artist");
    artist.textContent = song.artist;

    info.appendChild(title);
    info.appendChild(artist);

    item.appendChild(number);
    item.appendChild(info);
    item.appendChild(heartBtn);
    item.appendChild(deleteBtn);

    return item;
  }

  /**
   * 특정 곡의 좋아요 버튼을 만들어 반환한다.
   * 버튼을 누르면 해당 곡의 좋아요 수가 1 증가한다.
   * @param {Object} song - 곡 정보 객체
   * @returns {HTMLButtonElement} 생성된 좋아요 버튼
   */
  function makeHeartButton(song) {
    const button = gen("button");
    const count = gen("span");

    button.classList.add("heart-btn");
    button.type = "button";
    button.append("♥ ");
    count.textContent = song.hearts;
    button.appendChild(count);

    button.addEventListener("click", function(event) {
      event.stopPropagation();
      addHeart(song.id);
    });

    return button;
  }

  /**
   * 특정 곡을 삭제하는 버튼을 만들어 반환한다.
   * @param {number} songId - 삭제할 곡의 id
   * @returns {HTMLButtonElement} 생성된 삭제 버튼
   */
  function makeDeleteButton(songId) {
    const button = gen("button");
    button.classList.add("delete-btn");
    button.type = "button";
    button.textContent = "삭제";

    button.addEventListener("click", function(event) {
      event.stopPropagation();
      deleteSong(songId);
    });

    return button;
  }

  /**
   * 카드 안에 들어갈 앨범 커버 영역을 만든다.
   * 이미지가 있으면 이미지 요소를 넣고,
   * 없으면 안내 문구를 넣는다.
   * 클릭하면 파일 입력창이 열리도록 설정한다.
   * @param {Object} song - 곡 정보 객체
   * @returns {HTMLElement} 앨범 커버 영역 요소
   */
  function makeArtElement(song) {
    const art = gen("div");
    const fileInput = gen("input");

    art.classList.add("song-card__art");

    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.classList.add("cover-input");
    fileInput.hidden = true;

    if (song.coverUrl) {
      const image = gen("img");
      image.src = song.coverUrl;
      image.alt = "앨범커버";
      art.appendChild(image);
    } else {
      const placeholder = gen("span");
      placeholder.classList.add("song-card__art-placeholder");
      placeholder.textContent = "앨범커버";
      art.appendChild(placeholder);
    }

    art.appendChild(fileInput);

    art.addEventListener("click", function(event) {
      event.stopPropagation();
      fileInput.click();
    });

    fileInput.addEventListener("change", function() {
      updateCover(song, fileInput);
    });

    return art;
  }

  /**
   * 사용자가 선택한 이미지 파일을 읽어서
   * 해당 곡의 앨범 커버로 저장한 뒤 화면을 다시 그린다.
   * @param {Object} song - 앨범 커버를 바꿀 곡 객체
   * @param {HTMLInputElement} input - 파일 입력 요소
   * @returns {void}
   */
  function updateCover(song, input) {
    const file = input.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      song.coverUrl = event.target.result;
      render();
      showToast('🖼 "' + song.title + '" 앨범커버 변경됨');
    };
    reader.readAsDataURL(file);
  }

  /**
   * 지정한 곡의 좋아요 수를 1 증가시키고
   * 화면을 다시 그린다.
   * @param {number} songId - 좋아요를 증가시킬 곡의 id
   * @returns {void}
   */
  function addHeart(songId) {
    const song = findSongById(songId);

    if (!song) {
      return;
    }

    song.hearts += 1;
    render();
    showToast("♥ " + song.title + " 좋아요 +1");
  }

  /**
   * 지정한 곡을 배열에서 삭제하고
   * 화면을 다시 그린다.
   * @param {number} songId - 삭제할 곡의 id
   * @returns {void}
   */
  function deleteSong(songId) {
    const index = findSongIndexById(songId);

    if (index === -1) {
      return;
    }

    const deletedTitle = songs[index].title;
    songs.splice(index, 1);
    render();
    showToast('🗑 "' + deletedTitle + '" 삭제됨');
  }

  /**
   * 모달 입력값을 검사하고,
   * 새 곡을 추가하는 흐름을 처리한다.
   * 이미지 파일이 있으면 FileReader로 읽은 뒤 추가한다.
   * @returns {void}
   */
  function handleAddSong() {
    const titleInput = id("input-title");
    const artistInput = id("input-artist");
    const coverInput = id("input-cover");

    const title = titleInput.value.trim();
    const artist = artistInput.value.trim();

    clearValidation(titleInput, artistInput);

    if (songs.length >= MAX_SONGS) {
      showToast("곡은 최대 100개까지 추가할 수 있어요.");
      return;
    }

    if (!isValidSongInput(title, artist)) {
      applyValidation(titleInput, artistInput, title, artist);
      return;
    }

    const file = coverInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        addSong(title, artist, event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      addSong(title, artist, null);
    }
  }

  /**
   * 새 곡 객체를 배열에 추가하고
   * 모달을 닫은 뒤 화면을 다시 그린다.
   * @param {string} title - 곡 제목
   * @param {string} artist - 아티스트 이름
   * @param {string|null} coverUrl - 앨범 커버 이미지 URL
   * @returns {void}
   */
  function addSong(title, artist, coverUrl) {
    songs.push({
      id: nextId,
      title: title,
      artist: artist,
      hearts: 0,
      coverUrl: coverUrl
    });

    nextId += 1;
    closeModal();
    render();
    showToast('✓ "' + title + '" 추가됨!');
  }

  /**
   * 제목과 아티스트 입력값이 모두 비어 있지 않은지 검사한다.
   * @param {string} title - 사용자가 입력한 제목
   * @param {string} artist - 사용자가 입력한 아티스트
   * @returns {boolean} 두 값이 모두 비어 있지 않으면 true
   */
  function isValidSongInput(title, artist) {
    return title !== "" && artist !== "";
  }

  /**
   * 비어 있는 입력칸에 유효성 검사 클래스를 붙인다.
   * 잠시 후 해당 클래스를 제거한다.
   * @param {HTMLInputElement} titleInput - 제목 입력 요소
   * @param {HTMLInputElement} artistInput - 아티스트 입력 요소
   * @param {string} title - 제목 입력값
   * @param {string} artist - 아티스트 입력값
   * @returns {void}
   */
  function applyValidation(titleInput, artistInput, title, artist) {
    if (title === "") {
      titleInput.classList.add(INVALID_CLASS);
    }

    if (artist === "") {
      artistInput.classList.add(INVALID_CLASS);
    }

    setTimeout(function() {
      clearValidation(titleInput, artistInput);
    }, 1200);
  }

  /**
   * 입력칸에 붙어 있는 유효성 검사 클래스를 제거한다.
   * @param {HTMLInputElement} titleInput - 제목 입력 요소
   * @param {HTMLInputElement} artistInput - 아티스트 입력 요소
   * @returns {void}
   */
  function clearValidation(titleInput, artistInput) {
    titleInput.classList.remove(INVALID_CLASS);
    artistInput.classList.remove(INVALID_CLASS);
  }

  /**
   * 곡 추가 모달을 열고 제목 입력칸에 포커스를 준다.
   * @returns {void}
   */
  function openModal() {
    id("modal").classList.add("open");
    id("input-title").focus();
  }

  /**
   * 곡 추가 모달을 닫고 입력값을 초기화한다.
   * @returns {void}
   */
  function closeModal() {
    id("modal").classList.remove("open");
    id("input-title").value = "";
    id("input-artist").value = "";
    id("input-cover").value = "";
    clearValidation(id("input-title"), id("input-artist"));
  }

  /**
   * 모달 바깥쪽 배경을 클릭했을 때 모달을 닫는다.
   * @param {MouseEvent} event - 클릭 이벤트 객체
   * @returns {void}
   */
  function handleModalOverlayClick(event) {
    if (event.target === id("modal")) {
      closeModal();
    }
  }

  /**
   * 제목/아티스트 입력칸에서 Enter를 누르면 곡 추가를 실행한다.
   * @param {KeyboardEvent} event - 키보드 이벤트 객체
   * @returns {void}
   */
  function handleEnterSubmit(event) {
    if (event.key === "Enter") {
      handleAddSong();
    }
  }

  /**
   * 토스트 메시지를 화면에 잠깐 표시했다가 자동으로 숨긴다.
   * @param {string} message - 사용자에게 보여줄 메시지
   * @returns {void}
   */
  function showToast(message) {
    const toast = id("toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      toast.classList.remove("show");
    }, TOAST_DURATION);
  }

  /**
   * id 값을 이용해 곡 객체를 찾아 반환한다.
   * @param {number} songId - 찾을 곡의 id
   * @returns {Object|null} 찾은 곡 객체, 없으면 null
   */
  function findSongById(songId) {
    for (let i = 0; i < songs.length; i++) {
      if (songs[i].id === songId) {
        return songs[i];
      }
    }
    return null;
  }

  /**
   * id 값을 이용해 곡의 배열 인덱스를 찾아 반환한다.
   * @param {number} songId - 찾을 곡의 id
   * @returns {number} 찾은 인덱스, 없으면 -1
   */
  function findSongIndexById(songId) {
    for (let i = 0; i < songs.length; i++) {
      if (songs[i].id === songId) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 특정 부모 요소의 모든 자식 요소를 제거한다.
   * @param {HTMLElement} parent - 자식 요소를 비울 부모 요소
   * @returns {void}
   */
  function clearChildren(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  /**
   * id 값으로 DOM 요소 하나를 반환한다.
   * @param {string} name - 찾을 요소의 id 이름
   * @returns {HTMLElement|null} 찾은 요소
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * 전달받은 태그 이름으로 새 DOM 요소를 생성한다.
   * @param {string} tagName - 생성할 태그 이름
   * @returns {HTMLElement} 생성된 요소
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();