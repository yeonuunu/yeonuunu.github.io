/*
 * Name: Leeyeonwoo
 * Date: 2026-04-19
 * Section: 정보통신공학과
 *
 * 이 파일은 음악 플레이리스트 웹사이트의 상호작용 기능을 담당한다.
 * localStorage를 사용하여 좋아요, 곡 추가/삭제, 앨범 커버 변경 등의 데이터를
 * 새로고침 후에도 유지하도록 구현하였다.
 */

"use strict";

(function() {
  const MAX_SONGS = 100;
  const TOAST_DURATION = 2400;
  const INVALID_CLASS = "invalid-input";

  let songs = [
    {id: 1, title: "Shrink", artist: "HONNE", hearts: 0, coverUrl: null},
    {id: 2, title: "Hate you", artist: "Yerin Baek", hearts: 0, coverUrl: null},
    {id: 3, title: "Cowboy in L.A.", artist: "LANY", hearts: 0, coverUrl: null},
    {id: 4, title: "Mother", artist: "Charlie Puth", hearts: 0, coverUrl: null},
    {id: 5, title: "lalala that's how it goes", artist: "HONNE", hearts: 0, coverUrl: null},
    {id: 6, title: "Chasing Fire", artist: "Lauv", hearts: 0, coverUrl: null}
  ];

  let nextId = 7;
  let toastTimer = null;

  window.addEventListener("load", init);

  /**
   현재 songs 데이터를 localStorage에 저장한다.
   * @returns {void}
   */
  function saveData() {
    localStorage.setItem("songs", JSON.stringify(songs));
  }

  /**
   * localStorage에 저장된 songs 데이터를 불러온다.
   * @returns {void}
   */
  function loadData() {
    const data = localStorage.getItem("songs");

    if (data) {
      songs = JSON.parse(data);
      updateNextId();
    }
  }

  /**
   * 현재 songs 배열 기준으로 다음 id 값을 계산한다.
   * @returns {void}
   */
  function updateNextId() {
    let maxId = 0;

    for (let i = 0; i < songs.length; i++) {
      if (songs[i].id > maxId) {
        maxId = songs[i].id;
      }
    }

    nextId = maxId + 1;
  }

  /**
   * 페이지 로드 후 이벤트를 연결하고 데이터를 렌더링한다.
   * @returns {void}
   */
  function init() {
    loadData();

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
   * 정렬된 곡 데이터를 화면에 다시 출력한다.
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
   * 좋아요 수 기준으로 곡을 정렬한다.
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
   * 상위 1~3위 카드 요소를 생성한다.
   * @param {Object} song - 곡 객체
   * @param {number} rank - 순위
   * @returns {HTMLElement} 카드 요소
   */
  function makeCard(song, rank) {
    const card = gen("div");
    const number = gen("span");
    const title = gen("span");
    const artist = gen("span");

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
    card.appendChild(makeHeartButton(song));
    card.appendChild(makeDeleteButton(song.id));

    return card;
  }

  /**
   * 4위 이하 리스트 요소를 생성한다.
   * @param {Object} song - 곡 객체
   * @param {number} rank - 순위
   * @returns {HTMLElement} 리스트 요소
   */
  function makeListItem(song, rank) {
    const item = gen("div");
    const number = gen("span");
    const info = gen("div");
    const title = gen("span");
    const artist = gen("span");

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
    item.appendChild(makeHeartButton(song));
    item.appendChild(makeDeleteButton(song.id));

    return item;
  }

  /**
   * 좋아요 버튼을 만든다.
   * @param {Object} song - 곡 객체
   * @returns {HTMLButtonElement} 버튼 요소
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
   * 삭제 버튼을 만든다.
   * @param {number} songId - 곡 id
   * @returns {HTMLButtonElement} 버튼 요소
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
   * 카드용 앨범커버 영역을 생성한다.
   * @param {Object} song - 곡 객체
   * @returns {HTMLElement} 앨범커버 영역
   */
  function makeArtElement(song) {
    const art = gen("div");
    const input = gen("input");

    art.classList.add("song-card__art");

    input.type = "file";
    input.accept = "image/*";
    input.hidden = true;

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

    art.appendChild(input);

    art.addEventListener("click", function(event) {
      event.stopPropagation();
      input.click();
    });

    input.addEventListener("change", function() {
      updateCover(song, input);
    });

    return art;
  }

  /**
   * 앨범커버를 업데이트한다.
   * @param {Object} song - 곡 객체
   * @param {HTMLInputElement} input - 파일 input
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
      saveData();
      render();
      showToast('🖼 "' + song.title + '" 앨범커버 변경됨');
    };
    reader.readAsDataURL(file);
  }

  /**
   * 좋아요 수를 1 증가시킨다.
   * @param {number} songId - 곡 id
   * @returns {void}
   */
  function addHeart(songId) {
    const song = findSongById(songId);

    if (!song) {
      return;
    }

    song.hearts += 1;
    saveData();
    render();
    showToast("♥ " + song.title + " 좋아요 +1");
  }

  /**
   * 곡을 삭제한다.
   * @param {number} songId - 곡 id
   * @returns {void}
   */
  function deleteSong(songId) {
    const index = findSongIndexById(songId);

    if (index === -1) {
      return;
    }

    const deletedTitle = songs[index].title;
    songs.splice(index, 1);
    saveData();
    render();
    showToast('🗑 "' + deletedTitle + '" 삭제됨');
  }

  /**
   * 모달 입력값 검사 후 곡 추가를 처리한다.
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
   * 새 곡을 추가한다.
   * @param {string} title - 곡 제목
   * @param {string} artist - 아티스트 이름
   * @param {string|null} coverUrl - 앨범커버 이미지
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
    saveData();
    closeModal();
    render();
    showToast('✓ "' + title + '" 추가됨!');
  }

  /**
   * 제목과 아티스트 입력값이 비어 있지 않은지 검사한다.
   * @param {string} title - 제목
   * @param {string} artist - 아티스트
   * @returns {boolean} 유효 여부
   */
  function isValidSongInput(title, artist) {
    return title !== "" && artist !== "";
  }

  /**
   * 비어있는 입력칸에 에러 클래스를 붙인다.
   * @param {HTMLInputElement} titleInput - 제목 입력칸
   * @param {HTMLInputElement} artistInput - 아티스트 입력칸
   * @param {string} title - 제목 값
   * @param {string} artist - 아티스트 값
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
   * 입력칸 에러 클래스를 제거한다.
   * @param {HTMLInputElement} titleInput - 제목 입력칸
   * @param {HTMLInputElement} artistInput - 아티스트 입력칸
   * @returns {void}
   */
  function clearValidation(titleInput, artistInput) {
    titleInput.classList.remove(INVALID_CLASS);
    artistInput.classList.remove(INVALID_CLASS);
  }

  /**
   * 모달을 연다.
   * @returns {void}
   */
  function openModal() {
    id("modal").classList.add("open");
    id("input-title").focus();
  }

  /**
   * 모달을 닫고 입력값을 초기화한다.
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
   * 모달 바깥 클릭 시 닫는다.
   * @param {MouseEvent} event - 클릭 이벤트
   * @returns {void}
   */
  function handleModalOverlayClick(event) {
    if (event.target === id("modal")) {
      closeModal();
    }
  }

  /**
   * Enter 키를 누르면 곡 추가를 실행한다.
   * @param {KeyboardEvent} event - 키보드 이벤트
   * @returns {void}
   */
  function handleEnterSubmit(event) {
    if (event.key === "Enter") {
      handleAddSong();
    }
  }

  /**
   * 토스트 메시지를 표시한다.
   * @param {string} message - 출력 메시지
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
   * id로 곡 객체를 찾는다.
   * @param {number} songId - 곡 id
   * @returns {Object|null} 곡 객체 또는 null
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
   * id로 곡 인덱스를 찾는다.
   * @param {number} songId - 곡 id
   * @returns {number} 인덱스 또는 -1
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
   * 부모 요소의 모든 자식 요소를 제거한다.
   * @param {HTMLElement} parent - 부모 요소
   * @returns {void}
   */
  function clearChildren(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }

  /**
   * id로 요소를 찾는다.
   * @param {string} name - 요소 id
   * @returns {HTMLElement|null} 찾은 요소
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * 새 DOM 요소를 생성한다.
   * @param {string} tag - 태그 이름
   * @returns {HTMLElement} 생성된 요소
   */
  function gen(tag) {
    return document.createElement(tag);
  }
})();