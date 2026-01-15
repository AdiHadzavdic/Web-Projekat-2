let igraX = true;
let polja = Array(9).fill('-');
let igraZavrsena = false;
let poteziX = [];
let poteziO = [];
let vrijemePocetka = null;
let timerInterval = null;
let pocetniEkran, igraEkran, pocniIgruBtn, homeBtn, novaIgraBtn;
let rezultat, rezultatText;
let trenutniIgrac;
let timer;
let poljaBtns;

pocetniEkran = document.getElementById('pocetniEkran');
igraEkran = document.getElementById('igraEkran');
pocniIgruBtn = document.getElementById('pocniIgruBtn');
homeBtn = document.getElementById('homeBtn');
novaIgraBtn = document.getElementById('novaIgraBtn');
rezultat = document.getElementById('rezultat');
rezultatText = document.getElementById('rezultatText');
trenutniIgrac = document.getElementById('trenutniIgrac');
timer = document.getElementById('timer');
poljaBtns = document.querySelectorAll('.polje');

pocniIgruBtn.addEventListener('click', function() {
    pocetniEkran.classList.remove('active');
    igraEkran.classList.add('active');
    startNewGame();
});

novaIgraBtn.addEventListener('click', startNewGame);

homeBtn.addEventListener('click', function() {
    igraEkran.classList.remove('active');
    pocetniEkran.classList.add('active');
});

poljaBtns.forEach(polje => {
    polje.addEventListener('click', function() {
        const index = parseInt(polje.dataset.index);
        odigraj(index);
    });
});

function startNewGame() {
    polja.fill('-');
    poteziX = [];
    poteziO = [];
    igraX = true;
    igraZavrsena = false;
    vrijemePocetka = Date.now();

    clearInterval(timerInterval);
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);

    poljaBtns.forEach(polje => {
        polje.textContent = '';
        polje.classList.remove('disappear', 'win', 'x', 'o');
        polje.style.removeProperty("--delay");
    });

    rezultat.classList.add('hidden');

    trenutniIgrac.textContent = `Na redu je igrač X`;
}

function odigraj(index) {
    if (polja[index] !== '-' || igraZavrsena) return;

    let potezi = igraX ? poteziX : poteziO;
    let polje = poljaBtns[index];

    polja[index] = igraX ? 'X' : 'O';
    polje.textContent = polja[index];
    polje.classList.add(igraX ? 'x' : 'o');
    potezi.push(index);

    playSound('click');

    if (potezi.length > 3) {
        let stari = potezi.shift();
        polja[stari] = '-';
        let btn = poljaBtns[stari];
        btn.classList.add('disappear');
        playSound('disappear');
        setTimeout(() => {
            btn.classList.remove('disappear');
            btn.textContent = '';
            btn.classList.remove('x', 'o');
        }, 500);
    }

    let kraj = jeLiKraj();
    if (kraj) {
        igraZavrsena = true;

        const [a, b, c] = kraj.poljaBtns;
        const pobjednickoPolje = index;
        let order = [a, b, c];

        if (pobjednickoPolje === a) {
            order.reverse();
        }

        order.forEach((poljeIndex, i) => {
            const btn = poljaBtns[poljeIndex];
            btn.style.setProperty("--delay", `${i * 0.15}s`);
            btn.classList.add("win");
        });

        playWinSound(order);
        rezultatText.textContent = `Pobjednik: ${kraj.pobjednik}`;
        rezultat.classList.remove('hidden');

        clearInterval(timerInterval);
    } else {
        igraX = !igraX;
        trenutniIgrac.textContent = `Na redu je igrač ${igraX ? 'X' : 'O'}`;
    }
}

function jeLiKraj() {
    const linije = [
        { poljaBtns: [0, 1, 2] },
        { poljaBtns: [3, 4, 5] },
        { poljaBtns: [6, 7, 8] },
        { poljaBtns: [0, 3, 6] },
        { poljaBtns: [1, 4, 7] },
        { poljaBtns: [2, 5, 8] },
        { poljaBtns: [0, 4, 8] },
        { poljaBtns: [2, 4, 6] }
    ];

    for (let linija of linije) {
        const [a, b, c] = linija.poljaBtns;
        if (polja[a] !== '-' && polja[a] === polja[b] && polja[b] === polja[c]) {
            return { pobjednik: polja[a], poljaBtns: linija.poljaBtns };
        }
    }

    return null;
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - vrijemePocetka) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

let audioContext = null;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new window.AudioContext();
    }
    return audioContext;
}

function playSound(type) {
    const ctx = initAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    let frequency;
    let duration;

    switch (type) {
        case 'click': frequency = 880; duration = 0.05; break;
        case 'disappear': frequency = 440; duration = 0.2; break;
    }

    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
}

function playWinSound(order) {
    const ctx = initAudioContext();
    if (!ctx) return;

    const freqs = [698, 784, 1047];

    order.forEach((poljeIndex, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = freqs[i];
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.8);

        oscillator.start(ctx.currentTime + i * 0.15);
        oscillator.stop(ctx.currentTime + i * 0.15 + 0.8);
    });
}