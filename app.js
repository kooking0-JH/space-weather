/* ---------- 블로그(iframe) 삽입: 높이·보이는 범위 주고받기 (antenna-types 규약) ---------- */
(function(){
  if (window.self === window.top) return;
  var last = 0, on = false;
  function send(force){
    if (!on) return;
    var h = Math.ceil(document.body.getBoundingClientRect().height);
    if (!force && Math.abs(h - last) < 2) return;
    last = h;
    try { window.parent.postMessage({type: 'antenna-types:height', height: h}, '*'); } catch(e){}
  }
  window.addEventListener('message', function(e){
    var d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === 'antenna-types:ping'){
      var first = !on;
      if (!on){
        on = true; window.__embedOn = true; document.documentElement.classList.add('embedded');
        /* 블로그 안에서는 그림을 미리 불러와 높이가 늦게 바뀌지 않게 함 */
        Array.prototype.forEach.call(document.querySelectorAll('img[loading="lazy"]'), function(i){ i.loading = 'eager'; });
      }
      send(true);
      if (first) setTimeout(jumpHash, 200);
    } else if (d.type === 'antenna-types:viewport'){
      window.__embedView = {top: +d.top || 0, height: +d.height || 0};
      document.dispatchEvent(new Event('embedview'));
    }
  });
  if ('ResizeObserver' in window) new ResizeObserver(function(){ send(false); }).observe(document.body);
  window.addEventListener('load', function(){ send(true); });
  /* 목차 링크(#s5 등): 블로그 화면을 그 자리로 옮김 */
  function scrollToEl(el){
    var v = window.__embedView, H = v && v.height ? v.height : 800;
    var y = el.getBoundingClientRect().top + window.scrollY - 70 + H / 2;
    try { window.parent.postMessage({type: 'antenna-types:scrollto', y: y, smooth: true}, '*'); } catch(e){}
    /* 그 사이 그림이 불러와져 자리가 바뀌었으면 한 번 더 맞춤 */
    clearTimeout(scrollToEl.t);
    scrollToEl.t = setTimeout(function(){
      var y2 = el.getBoundingClientRect().top + window.scrollY - 70 + H / 2;
      if (Math.abs(y2 - y) > 20) { try { window.parent.postMessage({type: 'antenna-types:scrollto', y: y2, smooth: false}, '*'); } catch(e){} }
    }, 1200);
  }
  window.__embedScrollTo = scrollToEl;
  function jumpHash(){
    var t = location.hash && document.getElementById(location.hash.slice(1));
    if (t) scrollToEl(t);
  }
  document.addEventListener('click', function(e){
    if (!window.__embedOn) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
    e.preventDefault(); scrollToEl(t);
  });
})();

(function(){
  'use strict';

  /* ---------- 목차로 버튼: 목차 상자가 화면 밖으로 나가면 나타남 ---------- */
  var fab = document.getElementById('tocFab'), tocBox = document.getElementById('toc'), ftBox = document.getElementById('ft');
  var tocVisible = true, ftVisible = false;
  function updFab(){ if (fab) fab.classList.toggle('show', !tocVisible && !ftVisible && window.scrollY > 400); }
  if ('IntersectionObserver' in window) {
    if (tocBox) new IntersectionObserver(function(es){ tocVisible = es[0].isIntersecting; updFab(); }).observe(tocBox);
    if (ftBox) new IntersectionObserver(function(es){ ftVisible = es[0].isIntersecting; updFab(); }).observe(ftBox); // 고장 트리 버튼을 가리지 않도록
  }
  window.addEventListener('scroll', updFab, {passive: true});

  /* ---------- 그림 크게 보기 ---------- */
  var lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg'),
      lbCap = document.getElementById('lbCap'), lbScroll = lb && lb.querySelector('.lb-scroll'),
      lastFocus = null;
  function openLB(src, cap, wide){
    lastFocus = document.activeElement;
    lbImg.src = src; lbImg.alt = cap || '';
    lbCap.textContent = cap || '';
    lbScroll.classList.toggle('wide', !!wide);
    var v = window.__embedOn && window.__embedView;
    if (v && v.height) { lb.style.position = 'absolute'; lb.style.top = Math.max(0, v.top) + 'px'; lb.style.height = v.height + 'px'; lb.style.bottom = 'auto'; }
    else { lb.style.position = ''; lb.style.top = ''; lb.style.height = ''; lb.style.bottom = ''; }
    lb.hidden = false; if (!window.__embedOn) document.body.style.overflow = 'hidden';
    document.getElementById('lbClose').focus();
  }
  function closeLB(){
    lb.hidden = true; document.body.style.overflow = ''; lbImg.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }
  if (lb) {
    document.getElementById('lbClose').addEventListener('click', closeLB);
    lb.addEventListener('click', function(e){ if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', function(e){
      if (lb.hidden) return;
      if (e.key === 'Escape') { closeLB(); return; }
      if (e.key === 'Tab') {               // 열려 있는 동안 포커스를 창 안에 둠
        var f = [document.getElementById('lbClose'), lbScroll];
        var k = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });
  }
  document.addEventListener('embedview', function(){
    var v = window.__embedView; if (!lb || lb.hidden || !v) return;
    lb.style.top = Math.max(0, v.top) + 'px'; lb.style.height = v.height + 'px';
  });
  document.querySelectorAll('.fig .zoom').forEach(function(b){
    if (b.id === 'ftZoom') return;
    b.addEventListener('click', function(){
      var img = b.querySelector('img'), fc = b.parentNode.querySelector('figcaption');
      openLB(img.currentSrc || img.src, fc ? fc.textContent.trim() : '', false);
    });
  });

  /* ---------- 고장 트리 단계 넘기기 ---------- */
  var FT = [
    {n:14, t:'1단계 · 플레어의 빛이 대기를 바꾼다',
     d:'플레어(A·B·C·M·X 등급, NOAA R 등급)가 내는 극자외선·X선이 고층 대기의 화학 조성을 바꾸고, 대기를 전리시키고, 열권을 부풀립니다. 그 결과 단파 통신이 흡수되고, 위성통신 간섭, 위치 측정 오류, 위성 궤도 추적 오류가 생깁니다. 마지막에는 수색·구조(SAR) 임무 차질, 위성–우주쓰레기 충돌, 예정에 없던 재진입, 극항로 취소로 이어집니다. 전리층 TEC가 급하게 변하는 경계와 그곳에 자라는 작은 불규칙 구조가 GNSS 위치 오차, 신틸레이션, 락 손실을 일으키면 자율주행 차량과 항공 교통까지 영향을 받을 수 있습니다.'},
    {n:15, t:'2단계 · 전파 버스트가 레이더와 GNSS를 가린다',
     d:'아주 강한 전파 버스트는 햇빛이 비치는 쪽의 레이더와 GNSS 수신기에 태양 잡음으로 섞여 들어갑니다(예: 2006년 12월 GPS 장애, 2015년 11월 스웨덴 항공 관제 레이더 교란). 레이더·GNSS 간섭은 항공 교통 중단으로 이어질 수 있고, 도식은 최악의 경우 조기경보 레이더 교란을 공격으로 오인할 위험까지 표시합니다.'},
    {n:16, t:'3단계 · CME 충격파가 만든 방사선 폭풍',
     d:'CME 앞쪽 충격파가 입자를 가속해 태양 고에너지 입자 방사선 폭풍(NOAA S 등급)이 생깁니다. 극지방 입자 강하와 복사대 강화가 일어나고, 레이더·GNSS 간섭, 위치 오류, 우주인·항공 승객 피폭, 센서 오측, 위성 내부 대전, 항공 전자 장비의 단일 사건 오류가 생깁니다. 가능한 결과는 극항로 취소, 우주 유영(EVA) 중단, 우주인 활동 불능, 발사 중단, 위성 기능 상실, 자율주행 차량 기능 상실 등입니다.'},
    {n:17, t:'4단계 · CME 플라스마와 자기장이 만든 지자기 폭풍',
     d:'CME에 실린 플라스마와 자기장이 지자기 폭풍(NOAA G 등급)을 일으킵니다. 가장 많은 길이 뻗어 나가는 단계입니다. 대기 화학 변화, 열권 팽창, 극지방 입자 강하, 복사대 강화, 지자기 유도 전류, 이동성 전리층 교란과 TEC 경사가 모두 생기고, 위성 표면·내부 대전, 전력망 불안정, GNSS 신틸레이션까지 거의 모든 기술 고장으로 이어집니다. 광역 정전도 이 단계에서 나옵니다.'},
    {n:18, t:'5단계 · 아래에서 올라오는 교란 ① 이동성 전리층 교란',
     d:'이제 원인이 태양이 아니라 지구 대기입니다. 하층 대기의 중력파와 조석이 위로 올라가 이동성 전리층 교란(TID)과 전리층 불안정을 만들고, 이것이 TEC 경사와 작은 불규칙 구조를 거쳐 GNSS 신틸레이션과 락 손실로 이어질 수 있습니다. 가능한 결과는 수색·구조 임무 차질과 자율주행 차량 기능 상실입니다.'},
    {n:19, t:'6단계 · 아래에서 올라오는 교란 ② 전리층 불안정',
     d:'중력파와 조석이 전리층 불안정을 직접 키우는 경로입니다. 역시 TEC 경사와 불규칙 구조 → GNSS 신틸레이션·락 손실 → 수색·구조 임무와 자율주행 차량으로 이어질 수 있습니다. 태양이 조용한 날에도 GNSS가 흔들릴 수 있는 이유입니다.'},
    {n:20, t:'7단계 · 아래에서 올라오는 교란 ③ 극 소용돌이와 성층권 돌연 승온',
     d:'겨울철 극 소용돌이가 무너지며 성층권이 갑자기 뜨거워지는 성층권 돌연 승온(SSW)도 전리층까지 영향을 미칩니다. 이동성 전리층 교란과 함께 TEC 경사를 만들어 GNSS 문제로 이어집니다.'},
    {n:21, t:'8단계 · 평상시 복사의 장기 변화(우주 기후)',
     d:'폭발이 아니라 평상시의 극자외선·X선 복사가 오랜 기간에 걸쳐 변하는 것도 영향을 줍니다. 이것을 우주 기후(space climate)라고 합니다. 대기 화학과 전리 수준이 바뀌고, 점선처럼 GNSS 문제로도 이어질 수 있습니다.'},
    {n:22, t:'9단계 · 은하 우주선의 변화',
     d:'태양 주기에 따라 태양권 방패의 세기가 변하면 지구에 들어오는 은하 우주선의 양도 달라집니다(태양 극소기에 많음). 이 역시 우주 기후의 일부이며, 우주인과 항공기 승객의 피폭량을 바꿉니다.'}
  ];
  var SRC = 'T. Berger, 「What is Space Weather?」(CU Boulder SWx TREC, 2020), 슬라이드 ';
  var i = 0, imgEl = document.getElementById('ftImg');
  if (imgEl) {
    var dots = document.getElementById('ftDots');
    FT.forEach(function(s, k){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn'; b.textContent = (k + 1);
      b.setAttribute('aria-label', (k + 1) + '단계로 가기');
      b.addEventListener('click', function(){ show(k); });
      dots.appendChild(b);
      var pre = new Image(); pre.src = 'img/be-' + s.n + '.png'; // 미리 불러오기
    });
    var prev = document.getElementById('ftPrev'), next = document.getElementById('ftNext');
    function show(k){
      i = Math.max(0, Math.min(FT.length - 1, k));
      var s = FT[i];
      imgEl.src = 'img/be-' + s.n + '.png';
      imgEl.alt = '우주기상 고장 트리 ' + (i + 1) + '단계';
      document.getElementById('ftTitle').textContent = s.t;
      document.getElementById('ftDesc').textContent = s.d;
      document.getElementById('ftCount').textContent = (i + 1) + ' / ' + FT.length + ' 단계';
      document.getElementById('ftSrc').textContent = SRC + s.n;
      prev.disabled = i === 0; next.disabled = i === FT.length - 1;
      Array.prototype.forEach.call(dots.children, function(b, j){
        b.classList.toggle('on', j === i);
        b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
    }
    prev.addEventListener('click', function(){ show(i - 1); });
    next.addEventListener('click', function(){ show(i + 1); });
    document.getElementById('ftZoom').addEventListener('click', function(){
      openLB(imgEl.src, FT[i].t + ' — ' + SRC + FT[i].n, window.innerWidth < 900);
    });
    show(0);
  }
})();
