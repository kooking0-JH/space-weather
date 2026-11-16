(function(){
  'use strict';

  /* ---------- 목차: 지금 읽는 장 표시 ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  var tocIn = document.querySelector('.toc-in');
  var secs = links.map(function(a){ return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  function mark(id){
    links.forEach(function(a){
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('on', on);
      if (on && tocIn) {
        var l = a.offsetLeft - tocIn.clientWidth / 2 + a.clientWidth / 2;
        tocIn.scrollTo ? tocIn.scrollTo({left: l, behavior: 'smooth'}) : (tocIn.scrollLeft = l);
      }
    });
  }
  var current = '';
  function onScroll(){
    var y = window.scrollY + 90, id = '';
    for (var i = 0; i < secs.length; i++) { if (secs[i].offsetTop <= y) id = secs[i].id; }
    if (id !== current) { current = id; mark(id); }
    updTop();
  }
  // 맨 위로 버튼: 고장 트리가 화면에 보이면 숨김(단계 버튼을 가리지 않도록)
  var ftVisible = false, ftBox = document.getElementById('ft');
  function updTop(){
    var tt = document.getElementById('toTop');
    if (tt) tt.classList.toggle('show', window.scrollY > 700 && !ftVisible);
  }
  if (ftBox && 'IntersectionObserver' in window) {
    new IntersectionObserver(function(es){ ftVisible = es[0].isIntersecting; updTop(); }).observe(ftBox);
  }
  window.addEventListener('scroll', onScroll, {passive: true});
  onScroll();

  function goTop(e){ if (e) e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }
  var tt = document.getElementById('toTop'); if (tt) tt.addEventListener('click', goTop);
  var ttl = document.getElementById('toTopLink'); if (ttl) ttl.addEventListener('click', goTop);

  /* ---------- 그림 크게 보기 ---------- */
  var lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg'),
      lbCap = document.getElementById('lbCap'), lbScroll = lb && lb.querySelector('.lb-scroll'),
      lastFocus = null;
  function openLB(src, cap, wide){
    lastFocus = document.activeElement;
    lbImg.src = src; lbImg.alt = cap || '';
    lbCap.textContent = cap || '';
    lbScroll.classList.toggle('wide', !!wide);
    lb.hidden = false; document.body.style.overflow = 'hidden';
    document.getElementById('lbClose').focus();
  }
  function closeLB(){
    lb.hidden = true; document.body.style.overflow = ''; lbImg.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }
  if (lb) {
    document.getElementById('lbClose').addEventListener('click', closeLB);
    lb.addEventListener('click', function(e){ if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !lb.hidden) closeLB(); });
  }
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
     d:'플레어(A·B·C·M·X 등급, NOAA R 등급)가 내는 극자외선·X선이 고층 대기의 화학 조성을 바꾸고, 대기를 전리시키고, 열권을 부풀립니다. 그 결과 단파 통신이 흡수되고, 위성통신 간섭, 위치 측정 오류, 위성 궤도 추적 오류가 생깁니다. 마지막에는 수색·구조(SAR) 임무 차질, 위성–우주쓰레기 충돌, 예정에 없던 재진입, 극항로 취소로 이어집니다. 전리층 TEC 경사를 통해 GNSS 신틸레이션과 락 손실이 생기면 자율주행 차량과 항공 교통까지 영향을 받습니다.'},
    {n:15, t:'2단계 · 전파 버스트가 레이더와 GNSS를 가린다',
     d:'플레어의 전파 버스트는 대기를 거치지 않고 레이더와 GNSS 수신기에 바로 잡음으로 들어갑니다. 레이더·GNSS 간섭은 항공 교통 중단으로 이어질 수 있고, 최악의 경우 조기경보 레이더 교란을 적의 공격으로 오인하는 “우발적 핵전쟁” 위험까지 있습니다.'},
    {n:16, t:'3단계 · CME 충격파가 만든 방사선 폭풍',
     d:'CME 앞쪽 충격파가 입자를 가속해 태양 고에너지 입자 방사선 폭풍(NOAA S 등급)이 생깁니다. 극지방 입자 강하와 복사대 강화가 일어나고, 레이더·GNSS 간섭, 위치 오류, 우주인·항공 승객 피폭, 센서 오측, 위성 내부 대전, 항공 전자 장비의 단일 사건 오류가 생깁니다. 결과는 극항로 취소, 우주 유영(EVA) 중단, 우주인 활동 불능, 발사 중단, 위성 기능 상실, 자율주행 차량 기능 상실 등입니다.'},
    {n:17, t:'4단계 · CME 플라스마와 자기장이 만든 지자기 폭풍',
     d:'CME에 실린 플라스마와 자기장이 지자기 폭풍(NOAA G 등급)을 일으킵니다. 가장 많은 길이 뻗어 나가는 단계입니다. 대기 화학 변화, 열권 팽창, 극지방 입자 강하, 복사대 강화, 지자기 유도 전류, 이동성 전리층 교란과 TEC 경사가 모두 생기고, 위성 표면·내부 대전, 전력망 불안정, GNSS 신틸레이션까지 거의 모든 기술 고장으로 이어집니다. 광역 정전도 이 단계에서 나옵니다.'},
    {n:18, t:'5단계 · 아래에서 올라오는 교란 ① 이동성 전리층 교란',
     d:'이제 원인이 태양이 아니라 지구 대기입니다. 하층 대기의 중력파와 조석이 위로 올라가 이동성 전리층 교란(TID)과 전리층 불안정을 만들고, 이것이 TEC 경사를 통해 GNSS 신틸레이션과 락 손실을 일으킵니다. 결과는 수색·구조 임무 차질과 자율주행 차량 기능 상실입니다.'},
    {n:19, t:'6단계 · 아래에서 올라오는 교란 ② 전리층 불안정',
     d:'중력파와 조석이 전리층 불안정을 직접 키우는 경로입니다. 역시 TEC 경사 → GNSS 신틸레이션·락 손실 → 수색·구조 임무와 자율주행 차량으로 이어집니다. 태양이 조용한 날에도 GNSS가 흔들릴 수 있는 이유입니다.'},
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
