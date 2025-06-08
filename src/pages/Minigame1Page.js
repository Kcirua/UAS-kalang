// src/pages/Minigame1Page.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../style.css'; // Kita tetap mengimpor style.css utama

function Minigame1Page() {

  // Hook untuk menjalankan dan membersihkan logika JavaScript game
  useEffect(() => {
    // --- Di sini kita salin SEMUA kode dari Diskussion.js ---
    const circles = document.querySelectorAll('.circle');
    const arrows = document.querySelectorAll('.arrow');
    const shuffleBtn = document.querySelector('.shuffle');
    const checkVis = document.querySelector('.solved');
    
    let clickAllowed = true;
    let shuffleInterval = null;

    function checkTransfer(fro, tow){
        let [froLet, froStatic] = [fro[0], fro[1]];
        let [towLet, towStatic] = [tow[0], tow[1]];
        let froEle = document.querySelector(`.circle#${froLet} [data-static="${froStatic}"]`);
        let towEle = document.querySelector(`.circle#${towLet} [data-static="${towStatic}"]`);
        if (froEle && towEle && froEle.dataset.cur !== "" && towEle.dataset.cur === "") {
            towEle.dataset.cur = froEle.dataset.cur;
            froEle.dataset.cur = '';
        }
    }

    function checkSolution(){
      if (!checkVis) return;
      let check = true;
      circles.forEach(circle => {
          let contents = circle.querySelectorAll('div[data-cur]');
          contents.forEach(content => {
              if( content.dataset.cur !== "" && circle.id.toLowerCase() !== content.dataset.cur ) {
                  check = false;
              }
          });
      });
      checkVis.innerHTML = check ? "SOLVED" : "UNSOLVED";
      if (check) { 
          checkVis.classList.add('true');
      } else {
          checkVis.classList.remove('true'); 
      }
    }

    function clockwiseUpCheck(){
        setTimeout(() => {
            checkTransfer('A5', 'B0');
            checkTransfer('B4', 'C0');
            checkTransfer('C5', 'D0');
            checkTransfer('D4', 'A0');
            checkTransfer('B5', 'D5');
            checkSolution();
        }, 1000);
    }

    function handleClick(index, direction, force = false) {
        if (!clickAllowed && !force) return;
        if (!force) {
            clickAllowed = false;
            setTimeout(() => clickAllowed = true, 1000);
        }
        if (direction === 'left') {
            circles[index].dataset.pos++;
            circles[index].querySelectorAll('div').forEach(node => {
                node.dataset.static = (Number(node.dataset.static) - 1 + 6) % 6;
            });
        } else {
            circles[index].dataset.pos--;
            circles[index].querySelectorAll('div').forEach(node => {
                node.dataset.static = (Number(node.dataset.static) + 1) % 6;
            });
        }
        circles[index].style.rotate = `${ -60 * circles[index].dataset.pos }deg`;
        clockwiseUpCheck();
    }
    
    const arrowClickHandlers = [];
    arrows.forEach((arrow, i) => {
        const leftArrow = arrow.querySelector('.left');
        const rightArrow = arrow.querySelector('.right');
        
        const leftClickHandler = () => handleClick(i, 'left');
        const rightClickHandler = () => handleClick(i, 'right');
        
        leftArrow.addEventListener('click', leftClickHandler);
        rightArrow.addEventListener('click', rightClickHandler);

        // Simpan handler untuk bisa dihapus nanti
        arrowClickHandlers.push({ leftArrow, rightArrow, leftClickHandler, rightClickHandler });
    });

    function shuffle(times = 10, delay = 10) {
        let count = 0;
        // Hentikan shuffle sebelumnya jika sedang berjalan
        if (shuffleInterval) clearInterval(shuffleInterval);

        shuffleInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * arrows.length);
            const randomDir = Math.random() > 0.5 ? 'left' : 'right';
            handleClick(randomIndex, randomDir, true);
            count++;
            if (count >= times) {
                clearInterval(shuffleInterval);
            }
        }, delay);
    }

    const shuffleClickHandler = () => shuffle(800);
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', shuffleClickHandler);
    }

    // --- Selesai kode dari Diskussion.js ---

    // Fungsi cleanup: akan dijalankan saat komponen di-unmount
    return () => {
      // Hapus semua event listener yang telah kita tambahkan
      arrowClickHandlers.forEach(({ leftArrow, rightArrow, leftClickHandler, rightClickHandler }) => {
        leftArrow.removeEventListener('click', leftClickHandler);
        rightArrow.removeEventListener('click', rightClickHandler);
      });
      if(shuffleBtn) {
        shuffleBtn.removeEventListener('click', shuffleClickHandler);
      }
      
      // Hentikan interval shuffle jika masih berjalan
      if (shuffleInterval) {
        clearInterval(shuffleInterval);
      }
    };
  }, []); // Array dependensi kosong, artinya efek ini hanya berjalan sekali saat komponen mount

  return (
    <div className="container-fluid p-0">
      <div className="semua">
        <div className="text-center">
          <div className="row game-panel">
            {/* Kolom utama untuk game */}
            <div className="col-9">
              <div className="ruangmainnyaa bg-white p-4 rounded shadow" style={{ height: 'calc(100vh - 150px)' }}>
                {/* Di sini kita render JSX yang setara dengan HTML dari Diskussion.html */}
                <div className="minigame-container">
                    <div className="ui">
                        <div className="title">Diskussion</div>
                        <div className="shuffle">Shuffle</div>
                        <div className="solved true">SOLVED</div>
                        {/* SVGs di sini tidak perlu diubah */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="direction bottomup"><path d="m14.707 12.707-4 4a1 1 0 0 1-1.414-1.414L12.586 12 9.293 8.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="direction topup"><path d="m14.707 12.707-4 4a1 1 0 0 1-1.414-1.414L12.586 12 9.293 8.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="direction top"><path d="m14.707 12.707-4 4a1 1 0 0 1-1.414-1.414L12.586 12 9.293 8.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="direction right"><path d="m14.707 12.707-4 4a1 1 0 0 1-1.414-1.414L12.586 12 9.293 8.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="direction bottom"><path d="m14.707 12.707-4 4a1 1 0 0 1-1.414-1.414L12.586 12 9.293 8.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414z"/></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="direction left"><path d="m14.707 12.707-4 4a1 1 0 0 1-1.414-1.414L12.586 12 9.293 8.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414z"/></svg>
                    </div>

                    <div className="container">
                        <div className="circle" id="A" data-pos="0">
                            <div data-cur="a" data-static="2"></div><div data-cur="a" data-static="3"></div>
                            <div data-cur="a" data-static="4"></div><div data-cur=""  data-static="5"></div>
                            <div data-cur="a" data-static="0"></div><div data-cur="a" data-static="1"></div>
                        </div>
                        <div className="circle" id="B" data-pos="0">
                            <div data-cur="b" data-static="0"></div><div data-cur="b" data-static="1"></div>
                            <div data-cur="b" data-static="2"></div><div data-cur="b" data-static="3"></div>
                            <div data-cur=""  data-static="4"></div><div data-cur="b" data-static="5"></div>
                        </div>
                        <div className="circle" id="C" data-pos="0">
                            <div data-cur=""  data-static="5"></div><div data-cur="c" data-static="0"></div>
                            <div data-cur="c" data-static="1"></div><div data-cur="c" data-static="2"></div>
                            <div data-cur="c" data-static="3"></div><div data-cur="c" data-static="4"></div>
                        </div>
                        <div className="circle" id="D" data-pos="0">
                            <div data-cur="d" data-static="3"></div><div data-cur=""  data-static="4"></div>
                            <div data-cur="d" data-static="5"></div><div data-cur="d" data-static="0"></div>
                            <div data-cur="d" data-static="1"></div><div data-cur="d" data-static="2"></div>
                        </div>
                        <div className="arrow a"><div className="left"></div><div className="right"></div></div>
                        <div className="arrow b"><div className="left"></div><div className="right"></div></div>
                        <div className="arrow c"><div className="left"></div><div className="right"></div></div>
                        <div className="arrow d"><div className="left"></div><div className="right"></div></div>
                    </div>
                </div>
              </div>
            </div>
            {/* Kolom kanan untuk panel aksi */}
            <div className="col-3 align-items-start flex-column p-4 action-panel">
              <h4 className="text-white">Minigame: Diskussion</h4>
              <p className="text-white-50">Tujuan: Pindahkan semua keping berwarna ke lingkaran dengan warna yang sama.</p>
              <div className="separator my-4 bg-white" style={{ height: '2px', opacity: '0.5' }}></div>
              <Link to="/main" className="btn btn-info w-100 mt-4">
                Keluar Minigame
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Minigame1Page;