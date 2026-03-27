const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE = 40;
const GRAVITY = 0.6;
const JUMP = -11.5;
const SPEED = 5;

let frames = 0;
let debugMode = false;
let gameState = 'TITLE'; // TITLE, PLAYING, DEAD, WIN, LEVEL_TRANSITION
let cameraX = 0;
let deaths = 0;
let score = 0;
let total3PlusCoins = 0;
let currentLevelNum = 0;
let fallingBlocks = [];
let movingSpikes = [];
let poisonMushrooms = [];
let deathParticles = [];

const MSG_DEATH = {
    'spike': ["หนามซ่อนอยู่ ไม่เห็นเหรอ!", "หนามตำตูดทีนึง!", "กระโดดยังไงให้ลงหนาม?"],
    'fall': ["ตกหลุมสบายไหม?", "ลาก่อนนนนนนน", "โดดสั้นไปนิดนะ"],
    'ceiling': ["ระวังหัวชน!", "เพดานร่วงใส่ซะงั้น", "หนักไหมจ๊ะ?"],
    'fake_flag': ["ธงนี่มันปลอมเว้ย!", "ดีใจเก้อเลยดิงี้!", "โดนหลอกซ้ำซ้อน ช้ำใจไหม?"],
    'poison': ["เห็ดมีพิษ กินทำไม!", "หน้าตาแบบนั้นยังกล้ากิน?", "มาริโอ้กำหมัดละนะ"],
    'cloud': ["ก้อนเมฆนุ่มๆ แต่มรณะนะจ๊ะ!", "นึกว่าสีขาวจะปลอดภัยหล่ะสิ?", "เมฆพิษนี่หว่า!"],
    'default': ["โถ่เอ๊ย! แค่นี้ก็กระโดดไม่พ้น?", "ใจเย็นๆ สูดหายใจลึกๆ นะ 555", "เล่นเกมนี้ต้องใช้สมองนะ ไม่ใช้นิ้วอย่างเดียว"]
};

const bgmTracks = [
    'Pixel Pounce.mp3',
    'Pixel Pounce2.mp3',
    'Pixel Pounce3.mp3',
    'Pixel Pounce4.mp3'
];
let bgm = new Audio(bgmTracks[0]);
bgm.loop = true;
bgm.volume = 0.3;
let bgmEnabled = true;

// Level map: 1=Ground, 2=Block, 3=InvisibleBlock(troll), 4=Spikes, 5=FakeGround, 6=Flag, 7=Coin, 8=FallingCeiling(spikes), 9=FakeFlag, 10=MovingSpikes
const levels = [
    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,2,0,0,0,7,7,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,2,2,2,0,0,2,2,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,1,1,1,1,1,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,1,1,1,1,1,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,10,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,13,13,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,0,10,4,10,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,8,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,9,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
];


let gameMode = 'PLATFORMER'; // 'PLATFORMER' or 'SHOOTER'
let playerBullets = [];
let enemies = [];
let enemyBullets = [];
let shooterDistance = 0;
const SHOOTER_MAX_DIST = 5000;
let cutsceneTimer = 0;
let ship = { x: -100, y: 350, r_state: 'LOCKED' }; // For cutscene

let levelMap = [];

let player = {
    x: 50, y: 300, w: 30, h: 30,
    vx: 0, vy: 0, grounded: false
};


// ==========================================
// WORLD 2: SHOOTER MECHANICS
// ==========================================

function drawCutscene() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 400, canvas.width, 80);
    ctx.fillStyle = '#32CD32'; 
    ctx.fillRect(0, 400, canvas.width, 8);

    // Draw Spaceship
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y);
    ctx.lineTo(ship.x + 60, ship.y + 20);
    ctx.lineTo(ship.x, ship.y + 40);
    ctx.fill();
    ctx.fillStyle = '#f00';
    ctx.fillRect(ship.x - 10, ship.y + 10, 20, 20);

    // Draw Player running to ship
    if (player.x < ship.x + 10 && ship.r_state === 'LOCKED') {
        player.x += 3; // sprint
        player.y = 370;
        
        let drawX = player.x;
        ctx.fillStyle = '#fff';
        ctx.fillRect(drawX, player.y, 30, 30); // Body
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(drawX + 20, player.y + 10, 3, 0, Math.PI*2);
        ctx.arc(drawX + 26, player.y + 10, 3, 0, Math.PI*2);
        ctx.fill();
    } else {
        if (ship.r_state === 'LOCKED') {
            ship.r_state = 'FLYING';
            playSound('laser'); // takeoff sound placeholder
        }
        
        // Ship takes off
        ship.x += 4;
        ship.y -= 3;
        
        // Fire trail
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.moveTo(ship.x - 10, ship.y + 15);
        ctx.lineTo(ship.x - 40 - Math.random()*20, ship.y + 20);
        ctx.lineTo(ship.x - 10, ship.y + 25);
        ctx.fill();
    }

    cutsceneTimer++;
    if (cutsceneTimer > 200) {
        currentLevelNum++;
        resetGame(false);
    }
}

function updateShooter() {
    let speed = 5;
    if (keys['ArrowUp'] || keys['btn-jump']) player.y -= speed;
    if (keys['ArrowDown'] || keys['KeyS']) player.y += speed;
    if (keys['ArrowLeft'] || keys['btn-left']) player.x -= speed;
    if (keys['ArrowRight'] || keys['btn-right']) player.x += speed;

    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.w) player.x = canvas.width - player.w;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - player.h) player.y = canvas.height - player.h;

    shooterDistance += 2;
    
    // Auto fire
    if (frames % 12 === 0) {
        playerBullets.push({ x: player.x + player.w, y: player.y + player.h/2 - 4, vx: 18, vy: 0 });
        // Optional: play sound if performance allows
        // playSound('pew'); 
    }

    for (let i = playerBullets.length - 1; i >= 0; i--) {
        let b = playerBullets[i];
        b.x += b.vx;
        b.y += b.vy;
        if (b.x > canvas.width || b.x < 0 || b.y < 0 || b.y > canvas.height) {
            playerBullets.splice(i, 1);
            continue;
        }
        
        // Hit enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            let e = enemies[j];
            if (b.x < e.x + e.w && b.x + 10 > e.x && b.y < e.y + e.h && b.y + 8 > e.y) {
                e.hp--;
                playerBullets.splice(i, 1);
                if (e.hp <= 0) {
                    enemies.splice(j, 1);
                    score += 50;
                    document.getElementById('hud-score').innerText = score;
                    playSound('thump');
                }
                break;
            }
        }
    }

    spawnShooterEnemies();

    // Enemy Bullets logic
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let b = enemyBullets[i];
        b.x += b.vx; b.y += b.vy;
        ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.arc(b.x, b.y, b.w, 0, Math.PI*2); ctx.fill();
        
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            enemyBullets.splice(i, 1); continue;
        }
        
        if (player.x < b.x + b.w && player.x + player.w > b.x - b.w &&
            player.y < b.y + b.h && player.y + player.h > b.y - b.h) {
            die('Alien Bullet');
        }
    }


    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.update(e);
        if (e.x < -100 || e.y > canvas.height + 100 || e.y < -100) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Enemy to player collision
        if (player.x < e.x + e.w && player.x + player.w > e.x &&
            player.y < e.y + e.h && player.y + player.h > e.y) {
            die('Alien Ship');
        }
    }

    if (shooterDistance >= SHOOTER_MAX_DIST) {
        // level clear!
        win();
    }
}


function spawnShooterEnemies() {
    let cl = currentLevelNum; // 4=W2-1, 5=W2-2, 6=W2-3, 7=W2-4
    
    // W 2-1: Sky (Coins & Lasers)
    if (cl === 4) {
        if (shooterDistance === 500) {
            for(let i=0; i<6; i++) {
                let isFake = (i === 3);
                enemies.push({
                    x: canvas.width + i*50, y: 200, w: 30, h: 30, hp: isFake ? 100 : 1, type: isFake ? 'FAKE_COIN' : 'COIN',
                    update: function(self) {
                        self.x -= 4;
                        if (self.type === 'COIN' && self.hp <= 0) {
                            score += 10; collectCoin(0,0); // generic sound/score
                            self.x = -100; // remove
                        }
                        if (self.type === 'FAKE_COIN' && self.x < canvas.width - 200) {
                            if (!self.dashed) {
                                self.dashed = true;
                                let dx = player.x - self.x; let dy = player.y - self.y;
                                let mag = Math.sqrt(dx*dx + dy*dy);
                                self.vx = (dx/mag)*12; self.vy = (dy/mag)*12;
                            }
                            self.x += self.vx; self.y += self.vy;
                        }
                    },
                    draw: function(ctx, self) {
                        if (self.type === 'COIN' || !self.dashed) {
                            ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(self.x+15, self.y+15, 15, 0, Math.PI*2); ctx.fill();
                            ctx.fillStyle = '#DAA520'; ctx.beginPath(); ctx.arc(self.x+15, self.y+15, 10, 0, Math.PI*2); ctx.fill();
                        } else {
                            ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.arc(self.x+15, self.y+15, 20, 0, Math.PI*2); ctx.fill();
                            ctx.fillStyle = '#000'; ctx.font = '20px Kanit'; ctx.fillText('💀', self.x, self.y+20);
                        }
                    }
                });
            }
        }
        if (shooterDistance === 1000) {
            for(let i=0; i<12; i++) {
                if (i === 2 || i === 3 || i === 7 || i === 8) continue; // Gap 1 & 2
                enemies.push({
                    x: canvas.width, y: i*40, w: 40, h: 40, hp: 500, type: 'WALL',
                    update: function(self) { self.x -= 3; },
                    draw: function(ctx, self) { ctx.fillStyle='#888'; ctx.fillRect(self.x, self.y, 40, 40); }
                });
            }
            // Laser trap secretly behind Gap 1 (y: 2*40)
            enemies.push({
                x: canvas.width + 60, y: 2*40, w: 40, h: 80, hp: 500, type: 'LASER_TRAP',
                update: function(self) {
                    self.x -= 3;
                    if (self.x < canvas.width - 150 && !self.fired) {
                        self.fired = true; playSound('laser');
                        enemies.push({
                            x: -2000, y: self.y + 10, w: self.x + 2000, h: 60, hp: 999, type: 'LASER',
                            update: function(s) { 
                                s.x = -2000; s.w = self.x + 2000; s.y = self.y + 10; 
                                if(self.x < -40) s.hp = 0; 
                            },
                            draw: function(ctx, s) { ctx.fillStyle='rgba(255,0,0,0.8)'; ctx.fillRect(s.x, s.y, s.w, s.h); }
                        });
                    }
                },
                draw: function(ctx, self) { ctx.fillStyle='#f00'; ctx.fillRect(self.x, self.y, 40, 80); }
            });
        }
    }

    // W 2-2: Stratosphere (PowerUp trap)
    if (cl === 5) {
        if (shooterDistance === 600 || shooterDistance === 1800) {
            enemies.push({
                x: canvas.width, y: 200, w: 40, h: 40, hp: 10, type: 'POWERUP',
                update: function(self) {
                    self.x -= 2;
                    self.y += Math.sin(frames*0.1)*5;
                    if (self.hp <= 0) { // Shot by player!
                        self.x = -100; // Die
                        playSound('megaman_death');
                        for(let i=0; i<8; i++){
                            let a = (Math.PI*2/8)*i;
                            enemyBullets.push({x: self.x+100, y: self.y, w:5, h:5, vx: Math.cos(a)*6, vy: Math.sin(a)*6});
                        }
                    }
                },
                draw: function(ctx, self) {
                    ctx.fillStyle = '#00f'; ctx.fillRect(self.x, self.y, 40, 40);
                    ctx.fillStyle = '#fff'; ctx.font = 'bold 30px Arial'; ctx.fillText('P', self.x+10, self.y+30);
                }
            });
        }
    }

    // W 2-3: Space (Backwards Shooters)
    if (cl === 6) {
        if (shooterDistance % 800 === 0 && shooterDistance > 0) {
            enemies.push({
                x: canvas.width, y: player.y, w: 50, h: 30, hp: 500, type: 'BACK_SHOOT',
                update: function(self) {
                    if (!self.stopped) {
                        self.x -= 8; // Fly past very fast
                        if (self.x < player.x - 100) {
                            self.stopped = true;
                            self.timer = 0;
                        }
                    } else {
                        self.x += 1; // Slowly creep back
                        self.timer++;
                        if (self.timer === 30) {
                            playSound('laser');
                            enemies.push({
                                x: self.x + 50, y: self.y + 5, w: 2000, h: 20, hp: 99, type: 'LASER',
                                update: function(s) { s.x = self.x + 50; s.y = self.y + 5; if(self.x > canvas.width) s.hp = 0; },
                                draw: function(ctx, s) { ctx.fillStyle='#ff0'; ctx.fillRect(s.x, s.y, s.w, s.h); }
                            });
                        }
                    }
                },
                draw: function(ctx, self) {
                    ctx.fillStyle = '#800080'; ctx.fillRect(self.x, self.y, 50, 30);
                    ctx.fillStyle = '#0ff'; ctx.fillRect(self.x+40, self.y+5, 10, 20); // Engine/Gun on the BACK
                }
            });
        }
    }

    // W 2-4: Deep Space (Crush Box)
    if (cl === 7) {
        if (shooterDistance === 1500) {
            enemies.push({
                x: canvas.width, y: 50, w: 400, h: 300, hp: 9999, type: 'CRUSH_BOX',
                update: function(self) {
                    self.x -= 2;
                    if (self.x < canvas.width/2 - 200 && !self.shrinking) {
                        self.shrinking = true;
                        self.vx = 0;
                    }
                    if (self.shrinking) {
                        self.x += 0; // stop moving horizontally
                        // Shrink height and width
                        self.w -= 2; self.h -= 2;
                        self.x += 1; self.y += 1; // center it
                    }
                },
                draw: function(ctx, self) {
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 10;
                    ctx.strokeRect(self.x, self.y, self.w, self.h);
                    // Gap
                    ctx.clearRect(self.x - 5, self.y + self.h/2 - 40, 20, 80); 
                    // Inner crush area kills
                    if (self.shrinking) {
                         ctx.fillStyle = 'rgba(255,0,0,0.3)'; ctx.fillRect(self.x, self.y, self.w, self.h);
                         if (player.x > self.x && player.x+player.w < self.x+self.w && player.y > self.y && player.y+player.h < self.y+self.h) {
                              die('Crushed in Space');
                         }
                    }
                }
            });
        }
    }

    // Default Random Spawns
    if (frames % 60 === 0 && shooterDistance % 500 > 100) {
        enemies.push({
            x: canvas.width, y: 50 + Math.random()*(canvas.height-100), w:40, h:40, hp: 5, type:'BASIC',
            update: function(self) {
                self.x -= (3 + currentLevelNum*0.5); 
                self.y += Math.sin(frames*0.05)*3;
            },
            draw: function(ctx, self) {
                ctx.fillStyle = '#0f0'; ctx.fillRect(self.x, self.y, 40, 40);
                ctx.fillStyle = '#000'; ctx.fillRect(self.x+5, self.y+10, 10, 20);
            }
        });
    }
}

function drawShooterBackground() {
    let cl = currentLevelNum; // 4 = 2-1, 5 = 2-2, 6 = 2-3, 7 = 2-4
    if (cl === 4) {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for(let i=0; i<10; i++) {
            let cx = (i*300 - shooterDistance*2) % (canvas.width+300) + canvas.width;
            if (cx < -100) cx += canvas.width + 300;
            ctx.beginPath(); ctx.arc(cx, 100 + (i*50)%200, 40, 0, Math.PI*2); ctx.fill();
        }
    } else if (cl === 5) {
        ctx.fillStyle = '#000080';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for(let i=0; i<20; i++) {
            let cx = (i*150 - shooterDistance*3) % (canvas.width+200) + canvas.width;
            ctx.fillRect(cx, (i*43)%canvas.height, 50, 2);
        }
    } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#fff';
        for(let i=0; i<50; i++) {
            let cx = (i*80 - shooterDistance*(1 + i%3)) % (canvas.width+100) + canvas.width;
            ctx.fillRect(cx, (i*37)%canvas.height, i%3+1, i%3+1);
        }
        if (cl === 7) {
            // Moon
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(canvas.width - (shooterDistance * 0.1) + 200, 400, 300, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

function drawShooter() {
    drawShooterBackground();

    // Bullets
    ctx.fillStyle = '#0f0';
    for (let b of playerBullets) {
        ctx.fillRect(b.x, b.y, 20, 6);
    }
    
    // Player Ship (Troll in a mech!)
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + 40, player.y + 15);
    ctx.lineTo(player.x, player.y + 30);
    ctx.fill();
    // Glass dome
    ctx.fillStyle = 'rgba(0,191,255,0.5)';
    ctx.beginPath();
    ctx.arc(player.x + 15, player.y + 15, 10, 0, Math.PI*2);
    ctx.fill();
    
    // Thrust
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.moveTo(player.x - 5, player.y + 10);
    ctx.lineTo(player.x - 20 - Math.random()*15, player.y + 15);
    ctx.lineTo(player.x - 5, player.y + 20);
    ctx.fill();

    for (let e of enemies) {
        e.draw(ctx, e);
    }
    
    // Progress Bar
    ctx.fillStyle = '#333';
    ctx.fillRect(canvas.width/2 - 100, 10, 200, 10);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(canvas.width/2 - 100, 10, 200 * (shooterDistance / SHOOTER_MAX_DIST), 10);
}

// Touch & Drag Support
canvas.addEventListener('touchmove', e => {
    if (gameMode !== 'SHOOTER' || gameState !== 'PLAYING') return;
    e.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let touch = e.touches[0];
    let touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    let touchY = (touch.clientY - rect.top) * (canvas.height / rect.height);
    player.x = touchX - player.w/2;
    player.y = touchY - player.h/2;
}, {passive: false});

// ==========================================
const keys = {};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if(audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    
    if(type==='jump') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(600, now+0.1);
        gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.1);
        osc.start(now); osc.stop(now+0.1);
    } else if(type==='thump') {
        osc.type = 'square'; osc.frequency.setValueAtTime(100, now); osc.frequency.exponentialRampToValueAtTime(50, now+0.1);
        gain.gain.setValueAtTime(0.4, now); gain.gain.exponentialRampToValueAtTime(0.01, now+0.1);
        osc.start(now); osc.stop(now+0.1);
    } else if(type==='dead') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(20, now+0.5);
        gain.gain.setValueAtTime(0.5, now); gain.gain.linearRampToValueAtTime(0, now+0.5);
        osc.start(now); osc.stop(now+0.5);
    } else if(type==='win') {
        osc.type = 'square'; 
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            osc.frequency.setValueAtTime(freq, now + i*0.1);
        });
        gain.gain.setValueAtTime(0.3, now); gain.gain.linearRampToValueAtTime(0, now+0.5);
        osc.start(now); osc.stop(now+0.6);
    } else if(type==='coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.1); // E6
        gain.gain.setValueAtTime(0.2, now); gain.gain.linearRampToValueAtTime(0, now+0.3);
        osc.start(now); osc.stop(now+0.3);
    } else if (type === 'megaman_death') {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                if(!audioCtx) return;
                let osc = audioCtx.createOscillator();
                let gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'square';
                let now = audioCtx.currentTime;
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            }, i * 150);
        }
    }
}

function getTile(x, y) {
    let col = Math.floor(x / TILE);
    let row = Math.floor(y / TILE);
    if(row < 0 || row >= levelMap.length || col < 0 || col >= levelMap[0].length) return 0;
    return levelMap[row][col];
}

function die(reason = 'default') {
    if(gameState === 'DEAD' || gameState === 'LEVEL_TRANSITION') return;
    gameState = 'DEAD';
    deaths++;
    document.getElementById('hud-death').innerText = deaths;
    
    let msgs = MSG_DEATH[reason] || MSG_DEATH['default'];
    let msg = msgs[Math.floor(Math.random() * msgs.length)];
    document.getElementById('troll-message').innerText = msg;
    
    if (reason !== 'fall') {
        playSound('megaman_death');
        for(let i=0; i<8; i++) {
            let angle = (Math.PI * 2 / 8) * i;
            deathParticles.push({
                x: player.x + player.w/2, 
                y: player.y + player.h/2,
                vx: Math.cos(angle) * 6,
                vy: Math.sin(angle) * 6
            });
        }
        setTimeout(() => {
            document.getElementById('screen-death').classList.remove('hidden');
        }, 1500);
    } else {
        playSound('dead');
        document.getElementById('screen-death').classList.remove('hidden');
    }
}

function win() {
    if(gameState === 'WIN' || gameState === 'LEVEL_TRANSITION') return;
    playSound('win');
    
    if (currentLevelNum === 3 && gameMode === 'PLATFORMER') {
        gameState = 'CUTSCENE';
        cutsceneTimer = 0;
        ship.x = player.x + 100;
        ship.y = 350;
        bgm.pause(); // stop music
    } else if (currentLevelNum < 7) {
        gameState = 'LEVEL_TRANSITION';
        document.getElementById('screen-transition').classList.remove('hidden');
        document.getElementById('screen-transition').innerHTML = '<h1 style="color: #2196F3;">STAGE CLEARED!</h1><p style="font-size:24px; color: #FFD700; font-weight:bold;">+100 3PLUS COINS</p><p style="font-size:18px; color: #fff; margin-top:20px; animation: pulse 1s infinite;">เตรียมตัวพบกับความกวนขั้นถัดไป...</p>';
        total3PlusCoins += 100;
        document.getElementById('hud-score').innerText = score + " | 3PLUS COINS: " + total3PlusCoins;
        setTimeout(() => {
            currentLevelNum++;
            resetGame(false);
            document.getElementById('screen-transition').classList.add('hidden');
            let st = document.getElementById('stage-text');
            if(st) {
                 if (currentLevelNum >= 4) {
                     st.innerText = "2-" + (currentLevelNum - 3);
                 } else {
                     st.innerText = "1-" + (currentLevelNum + 1);
                 }
            }
        }, 3000);
    } else {
        gameState = 'WIN';
        // Final Win (Stage 2-4 cleared)
        document.getElementById('screen-win').classList.remove('hidden');
    }
}

function collectCoin(r, c) {
    levelMap[r][c] = 0; // Remove coin
    score += 10;
    document.getElementById('hud-score').innerText = score;
    playSound('coin');
}

function resetGame(resetLevel = true) {
    if (resetLevel) {
        currentLevelNum = 0;
        score = 0;
        deaths = 0;
        document.getElementById('hud-score').innerText = score;
        document.getElementById('hud-death').innerText = deaths;
        let st = document.getElementById('stage-text');
        if(st) st.innerText = "1";
    }
    gameState = 'PLAYING';
    player.x = 50;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    cameraX = 0;

    if (currentLevelNum >= 4) {
        gameMode = 'SHOOTER';
        player.x = 100;
        player.y = 200;
        shooterDistance = 0;
        playerBullets = [];
        enemies = [];
        enemyBullets = [];
    } else {
        gameMode = 'PLATFORMER';
    }

    fallingBlocks = [];
    movingSpikes = [];
    poisonMushrooms = [];
    deathParticles = [];
    
    if (gameMode === 'PLATFORMER') {
        levelMap = JSON.parse(JSON.stringify(levels[currentLevelNum]));
        // Extract moving spikes from map
        for (let r = 0; r < levelMap.length; r++) {
            for (let c = 0; c < levelMap[r].length; c++) {
                if (levelMap[r][c] === 10) {
                    movingSpikes.push({ c: c, baseX: c * TILE, baseY: r * TILE });
                    levelMap[r][c] = 0; // Remove from map physics
                }
            }
        }
    } else {
        levelMap = [];
    }

    
    document.getElementById('screen-title').classList.add('hidden');
    document.getElementById('screen-death').classList.add('hidden');
    document.getElementById('screen-win').classList.add('hidden');
    document.getElementById('screen-transition').classList.add('hidden');
    
    
    if(audioCtx.state === 'suspended') audioCtx.resume();
    
    let bgmName = 'Pixel Pounce';
    let bgmNum = currentLevelNum === 0 ? '' : (currentLevelNum + 1);
    if (currentLevelNum >= 4) {
        bgmName = 'Starlight Bullet Run';
        bgmNum = currentLevelNum === 4 ? '' : (currentLevelNum - 3);
    }
    let targetSrc = bgmName + bgmNum + '.mp3';

    let currentSrc = bgm.src ? bgm.src.split('/').pop().replace(/%20/g, ' ') : '';

    if (currentSrc !== targetSrc) {
        bgm.pause();
        bgm = new Audio(targetSrc);
        bgm.loop = true;
        bgm.volume = 0.3;
    }
    if(bgmEnabled && bgm.paused) {
        bgm.play().catch(e => console.log("BGM check", e));
    }
}

function updatePhysics() {
    // X Axis Physics
    if(keys['ArrowLeft'] || keys['btn-left']) player.vx = -SPEED;
    else if(keys['ArrowRight'] || keys['btn-right']) player.vx = SPEED;
    else player.vx = 0;
    
    player.x += player.vx;
    if(player.x < 0) player.x = 0;
    
    let pointsX = [
        {x: player.x, y: player.y + 2}, {x: player.x+player.w-1, y: player.y + 2},
        {x: player.x, y: player.y+player.h-3}, {x: player.x+player.w-1, y: player.y+player.h-3}
    ];
    for(let p of pointsX) {
        let r = Math.floor(p.y/TILE);
        let c = Math.floor(p.x/TILE);
                let t = getTile(p.x, p.y);
        
        if (t === 13) { die('cloud'); break; }

        if(t === 7) { collectCoin(r, c); continue; }
        
        // Note: 5 is fake ground (air), passes through collision check
        if(t === 1 || t === 2 || t === 11 || t === 12) { 
            if(player.vx > 0) player.x = c*TILE - player.w;
            else if(player.vx < 0) player.x = (c+1)*TILE;
            player.vx = 0;
            break;
        }
        if(t === 4) die('spike');
        if(t === 9) die('fake_flag');
        if(t === 6) win();
    }

    // Y Axis Physics
    player.vy += GRAVITY;
    player.y += player.vy;
    player.grounded = false;
    
    let pointsY = [
        {x: player.x+2, y: player.y}, {x: player.x+player.w-3, y: player.y},
        {x: player.x+2, y: player.y+player.h-1}, {x: player.x+player.w-3, y: player.y+player.h-1}
    ];

    for(let p of pointsY) {
        let r = Math.floor(p.y/TILE);
        let c = Math.floor(p.x/TILE);
                let t = getTile(p.x, p.y);
        
        if (t === 13) { die('cloud'); break; }
        
        if(t === 7) { collectCoin(r, c); continue; }

        if(t === 11 && player.vy < 0 && p.y < player.y + player.h/2) {
            // Hit ? block from below
            player.y = (r+1)*TILE;
            player.vy = 0;
            levelMap[r][c] = 12; // Empty block
            playSound('thump');
            poisonMushrooms.push({ x: c*TILE, y: r*TILE - TILE, vx: -2, vy: -5 });
            break;
        }

        if(t === 1 || t === 2 || t === 11 || t === 12) {
            if(player.vy > 0) {
                player.y = r*TILE - player.h;
                player.vy = 0;
                player.grounded = true;
            } else if(player.vy < 0) {
                player.y = (r+1)*TILE;
                player.vy = 0;
            }
            break;
        }

        if(t === 3 && player.vy < 0 && p.y < player.y + player.h/2) {
            // Hit invisible block from below!
            player.y = (r+1)*TILE;
            player.vy = 0;
            levelMap[r][c] = 2; // Solidify!
            playSound('thump');
            break;
        }
        if(t === 4) die('spike');
        if(t === 9) die('fake_flag');
        if(t === 6) win();
    }
    
    // Check ceiling traps (Tile 8) above player
    let roofCol = Math.floor((player.x + player.w/2) / TILE);
    for(let cr = 0; cr < Math.floor(player.y/TILE); cr++) {
        if(levelMap[cr] && levelMap[cr][roofCol] === 8) {
            // Trigger falling ceiling
            levelMap[cr][roofCol] = 0; // Remove from map
            fallingBlocks.push({ x: roofCol * TILE, y: cr * TILE, vy: 0 });
        }
    }

    // Update falling blocks
    for(let i = fallingBlocks.length-1; i >= 0; i--) {
        let fb = fallingBlocks[i];
        fb.vy += GRAVITY;
        fb.y += fb.vy;
        
        // Block to Player collision
        if(fb.x < player.x + player.w && fb.x + TILE > player.x &&
           fb.y < player.y + player.h && fb.y + TILE > player.y) {
            die('ceiling');
        }
        // Remove if off screen
        if(fb.y > canvas.height + 100) fallingBlocks.splice(i, 1);
    }
    
    // Mushroom physics
    for (let i = poisonMushrooms.length - 1; i >= 0; i--) {
        let shroom = poisonMushrooms[i];
        shroom.vy += GRAVITY;
        shroom.x += shroom.vx;
        shroom.y += shroom.vy;
        
        let r = Math.floor((shroom.y + TILE) / TILE);
        let c = Math.floor(shroom.x / TILE);
        let ct = getTile(shroom.x + TILE/2, shroom.y + TILE);
        if (ct === 1 || ct === 2 || ct === 12) {
             shroom.y = r * TILE - TILE;
             shroom.vy = 0;
        }

        if (player.x < shroom.x + TILE && player.x + player.w > shroom.x &&
            player.y < shroom.y + TILE && player.y + player.h > shroom.y) {
            die('poison');
        }

        if (shroom.y > canvas.height) poisonMushrooms.splice(i, 1);
    }
    
    // Check moving spikes collision
    for(let ms of movingSpikes) {
        let offsetY = Math.sin(frames * 0.03 + ms.c) * (TILE - 10);
        let sx = ms.baseX;
        let sy = ms.baseY + offsetY;
        
        // Spike collision box (rough)
        if(player.x < sx + TILE && player.x + player.w > sx &&
           player.y < sy + TILE && player.y + player.h > sy) {
            die('spike');
        }
    }

    // Jump Logic
    if((keys['ArrowUp'] || keys['Space'] || keys['btn-jump']) && player.grounded) {
        player.vy = JUMP;
        playSound('jump');
        keys['ArrowUp'] = false; // Prevent auto-bunnyhopping
        keys['Space'] = false;
        keys['btn-jump'] = false;
    }
    
    // Fall to death
    if(player.y > canvas.height + 100) die('fall');
}


function drawBackground() {
    const BG_COLORS = ['#6495ED', '#87CEEB', '#FFB6C1', '#2F4F4F'];
    ctx.fillStyle = BG_COLORS[currentLevelNum] || '#6495ED';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // BG

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for(let i=0; i<15; i++) {
        let basex = i*350 - (cameraX * 0.15) % 350;
        ctx.beginPath();
        ctx.arc(basex + 60, 80, 30, 0, Math.PI*2);
        ctx.arc(basex + 100, 80, 40, 0, Math.PI*2);
        ctx.arc(basex + 140, 80, 30, 0, Math.PI*2);
        ctx.fill();
    }

    if (currentLevelNum === 0 || currentLevelNum === 1 || currentLevelNum === 2) {
        // Stage 1 & 2 & 3: Trees in background!
        let treeAlpha = currentLevelNum === 2 ? 0.3 : 1;
        for(let i=0; i<15; i++) {
            let basex = i*250 - (cameraX * 0.25) % 250;
            // Trunk
            ctx.fillStyle = `rgba(139,69,19,${treeAlpha})`;
            ctx.fillRect(basex + 85, 300, 30, 100);
            // Leaves
            ctx.fillStyle = `rgba(34,139,34,${treeAlpha})`;
            ctx.beginPath();
            ctx.moveTo(basex, 320);
            ctx.lineTo(basex+100, 150);
            ctx.lineTo(basex+200, 320);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(basex+20, 250);
            ctx.lineTo(basex+100, 100);
            ctx.lineTo(basex+180, 250);
            ctx.fill();
        }
    }

    if (currentLevelNum === 1 || currentLevelNum === 2) {
        // Stage 2 & 3: Mountains
        let mColor = currentLevelNum === 2 ? '#B0C4DE' : '#556B2F';
        ctx.fillStyle = mColor;
        for(let i=0; i<10; i++) {
            let basex = i*300 - (cameraX * 0.4) % 300;
            ctx.beginPath();
            ctx.moveTo(basex, 400);
            ctx.lineTo(basex+150, 150 + (i%2)*50);
            ctx.lineTo(basex+300, 400);
            ctx.fill();
            // Snow caps for stage 3?
            if (currentLevelNum === 2) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(basex+100 + (i%2)*33, 233 + (i%2)*16);
                ctx.lineTo(basex+150, 150 + (i%2)*50);
                ctx.lineTo(basex+200 - (i%2)*33, 233 + (i%2)*16);
                ctx.fill();
                ctx.fillStyle = mColor; 
            }
        }
    } else if (currentLevelNum === 3) {
        // Stage 4: Hell and Volcanoes
        ctx.fillStyle = '#8B0000'; // Dark Red / Lava sky glow
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#111'; // Dark jagged mountains
        for(let i=0; i<20; i++) {
            let basex = i*150 - (cameraX * 0.4) % 150;
            ctx.beginPath();
            ctx.moveTo(basex, 480);
            ctx.lineTo(basex+75, 200 + Math.random()*50);
            ctx.lineTo(basex+150, 480);
            ctx.fill();
        }
        
        // Lava pools in bg
        ctx.fillStyle = '#FF4500';
        for(let i=0; i<15; i++) {
            let basex = i*200 - (cameraX * 0.5) % 200;
            ctx.beginPath();
            ctx.ellipse(basex+100, 380, 80, 20, 0, 0, Math.PI);
            ctx.fill();
        }
    }
}


function drawMap() {
    drawBackground();


    let startCol = Math.floor(cameraX / TILE);
    let endCol = startCol + (canvas.width / TILE) + 2;

    for (let r = 0; r < levelMap.length; r++) {
        for (let c = startCol; c < endCol; c++) {
            if (c >= levelMap[0].length) continue;
            let val = levelMap[r][c];
            if(val === 0 || val === 3) continue; // Air or Hidden Troll block
            
            let drawX = (c * TILE) - cameraX;
            let drawY = r * TILE;

            if (val === 1 || val === 5) { // Ground (and Fake ground visual match)
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(drawX, drawY, TILE, TILE);
                ctx.fillStyle = '#32CD32'; 
                ctx.fillRect(drawX, drawY, TILE, 8);
            } else if (val === 2) { // Solid Block
                ctx.fillStyle = '#DAA520';
                ctx.fillRect(drawX, drawY, TILE, TILE);
                ctx.strokeStyle = '#000'; ctx.strokeRect(drawX, drawY, TILE, TILE);
            } else if (val === 4) { // Spikes
                ctx.fillStyle = '#eee';
                ctx.beginPath();
                ctx.moveTo(drawX + TILE/2, drawY);
                ctx.lineTo(drawX + TILE, drawY + TILE);
                ctx.lineTo(drawX, drawY + TILE);
                ctx.fill();
            } else if (val === 6 || val === 9) { // Goal Flag or Fake Flag
                ctx.fillStyle = '#ddd';
                ctx.fillRect(drawX + TILE/2, drawY, 4, TILE*3); 
                ctx.fillStyle = '#f00';
                ctx.fillRect(drawX + TILE/2 + 4, drawY, 24, 20); 
            } else if (val === 7) { // Coin
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                // Spin animation effect using frames
                let scaleX = Math.abs(Math.cos(frames * 0.1));
                ctx.ellipse(drawX + TILE/2, drawY + TILE/2, 10 * scaleX, 15, 0, 0, Math.PI*2);
                ctx.fill();
                ctx.strokeStyle = '#B8860B'; ctx.stroke();
            } else if (val === 11) { // ? Block
                ctx.fillStyle = '#DAA520';
                ctx.fillRect(drawX, drawY, TILE, TILE);
                ctx.strokeStyle = '#000'; ctx.strokeRect(drawX, drawY, TILE, TILE);
                ctx.fillStyle = '#fff';
                ctx.font = '24px Kanit';
                ctx.fillText('?', drawX + 12, drawY + 28);
            } else if (val === 12) { // Empty Block
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(drawX, drawY, TILE, TILE);
                ctx.strokeStyle = '#000'; ctx.strokeRect(drawX, drawY, TILE, TILE);
            } else if (val === 13) { // Death Cloud
                let cx = drawX + TILE/2;
                let cy = drawY + TILE/2;
                ctx.fillStyle = '#fff'; // Looks innocent!
                ctx.beginPath();
                ctx.arc(cx - 10, cy, 15, 0, Math.PI*2);
                ctx.arc(cx + 10, cy, 15, 0, Math.PI*2);
                ctx.arc(cx, cy - 10, 18, 0, Math.PI*2);
                ctx.fill();
            } else if (val === 8) { // Ceiling trap looks like regular block
                ctx.fillStyle = '#DAA520';
                ctx.fillRect(drawX, drawY, TILE, TILE);
                ctx.strokeStyle = '#000'; ctx.strokeRect(drawX, drawY, TILE, TILE);
                // Add tiny spikes warning on bottom
                ctx.fillStyle = '#eee';
                for(let s=0; s<4; s++){
                    ctx.beginPath();
                    ctx.moveTo(drawX + s*(TILE/4), drawY+TILE);
                    ctx.lineTo(drawX + s*(TILE/4) + (TILE/8), drawY+TILE+5);
                    ctx.lineTo(drawX + (s+1)*(TILE/4), drawY+TILE);
                    ctx.fill();
                }
            }
        }
    }

    // Draw falling blocks
    for(let fb of fallingBlocks) {
        let drawX = fb.x - cameraX;
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(drawX, fb.y, TILE, TILE);
        ctx.strokeStyle = '#000'; ctx.strokeRect(drawX, fb.y, TILE, TILE);
        ctx.fillStyle = '#eee';
        for(let s=0; s<4; s++){
            ctx.beginPath();
            ctx.moveTo(drawX + s*(TILE/4), fb.y+TILE);
            ctx.lineTo(drawX + s*(TILE/4) + (TILE/8), fb.y+TILE+5);
            ctx.lineTo(drawX + (s+1)*(TILE/4), fb.y+TILE);
            ctx.fill();
        }
    }

    // Draw moving spikes
    for(let ms of movingSpikes) {
        if (ms.baseX < cameraX - TILE || ms.baseX > cameraX + canvas.width) continue;
        let drawX = ms.baseX - cameraX;
        let offsetY = Math.sin(frames * 0.03 + ms.c) * (TILE - 10);
        let drawY = ms.baseY + offsetY;
        
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.moveTo(drawX + TILE/2, drawY);
        ctx.lineTo(drawX + TILE, drawY + TILE);
        ctx.lineTo(drawX, drawY + TILE);
        ctx.fill();
    }
    // Draw poison mushrooms
    for(let shroom of poisonMushrooms) {
        let drawX = shroom.x - cameraX;
        ctx.fillStyle = '#800080';
        ctx.beginPath();
        ctx.arc(drawX + TILE/2, shroom.y + TILE/2, 15, Math.PI, 0); // Hat
        ctx.fill();
        ctx.fillStyle = '#eee';
        ctx.fillRect(drawX + TILE/2 - 5, shroom.y + TILE/2, 10, 15); // Stem
        ctx.fillStyle = '#000';
        ctx.fillRect(drawX + TILE/2 - 6, shroom.y + TILE/2 - 5, 3, 3); // Eye
        ctx.fillRect(drawX + TILE/2 + 3, shroom.y + TILE/2 - 5, 3, 3); // Eye
    }
}

function drawPlayer() {
    // Megaman Death Particles
    if (gameState === 'DEAD' && deathParticles.length > 0) {
        ctx.fillStyle = '#ff8800'; 
        for(let p of deathParticles) {
            p.x += p.vx;
            p.y += p.vy;
            ctx.beginPath();
            ctx.arc(p.x - cameraX, p.y, 6, 0, Math.PI*2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x - cameraX, p.y, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#ff8800'; 
        }
        return; // Don't draw the player body!
    }

    let drawX = player.x - cameraX;
    ctx.fillStyle = '#fff';
    ctx.fillRect(drawX, player.y, player.w, player.h); // Body
    
    // Eyes looking direction
    ctx.fillStyle = '#000';
    let eyeOffsetX = player.vx < 0 ? 4 : 18;
    let isJumping = Math.abs(player.vy) > 2.0;
    
    if (isJumping) {
        // Draw > <
        ctx.beginPath();
        ctx.moveTo(drawX + eyeOffsetX - 2, player.y + 8);
        ctx.lineTo(drawX + eyeOffsetX + 2, player.y + 10);
        ctx.lineTo(drawX + eyeOffsetX - 2, player.y + 12);
        
        ctx.moveTo(drawX + eyeOffsetX + 8, player.y + 8);
        ctx.lineTo(drawX + eyeOffsetX + 4, player.y + 10);
        ctx.lineTo(drawX + eyeOffsetX + 8, player.y + 12);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
    } else {
        // Normal 0 0
        ctx.beginPath();
        ctx.arc(drawX + eyeOffsetX, player.y + 10, 2.5, 0, Math.PI*2);
        ctx.arc(drawX + eyeOffsetX + 6, player.y + 10, 2.5, 0, Math.PI*2);
        ctx.fill();
    }

    if(gameState === 'DEAD') {
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(drawX + eyeOffsetX - 2, player.y + 20);
        ctx.lineTo(drawX + eyeOffsetX + 8, player.y + 20);
        ctx.stroke();
    }
}

let lastTime = 0;
const frameDelay = 1000 / 60;
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let dt = timestamp - lastTime;
    if (dt < frameDelay) {
        requestAnimationFrame(gameLoop);
        return;
    }
    lastTime = timestamp - (dt % frameDelay);

    if(gameState === 'PLAYING') {
        if (gameMode === 'PLATFORMER') {
            updatePhysics();
        } else {
            updateShooter();
        }
        
        // Camera smooth follow backward scroll block
        let targetCam = player.x - 200;
        if(targetCam > cameraX) cameraX = targetCam;
        if(cameraX < 0) cameraX = 0;
    }
    
    if (gameState === 'CUTSCENE') {
        drawCutscene();
    } else if (gameMode === 'PLATFORMER') {
        drawMap();
        drawPlayer();
    } else {
        drawShooter();
    }

    frames++;
    requestAnimationFrame(gameLoop);
    // Debug Overlay
    if (debugMode) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(5, 5, 180, 70);
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText("X: " + Math.floor(player.x) + " Y: " + Math.floor(player.y), 15, 25);
        ctx.fillText("COL: " + Math.floor(player.x/TILE) + " ROW: " + Math.floor(player.y/TILE), 15, 45);
        ctx.fillText("CAM: " + Math.floor(cameraX) + " G: " + gameState, 15, 65);
    }
}

// Controls
window.addEventListener('keydown', e => { 
    if(e.code === 'KeyD') debugMode = !debugMode; 
    if(e.code === 'Space') {
        e.preventDefault();
        if(document.activeElement && document.activeElement.tagName === 'BUTTON') {
             document.activeElement.blur();
        }
    }
    keys[e.code] = true; 
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function bindBtn(id, keyName) {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', e => { e.preventDefault(); keys[keyName] = true; });
    btn.addEventListener('touchend', e => { e.preventDefault(); keys[keyName] = false; });
    btn.addEventListener('mousedown', e => { e.preventDefault(); keys[keyName] = true; });
    btn.addEventListener('mouseup', e => { e.preventDefault(); keys[keyName] = false; });
    btn.addEventListener('mouseleave', e => { e.preventDefault(); keys[keyName] = false; });
}
bindBtn('btn-left', 'btn-left');
bindBtn('btn-right', 'btn-right');
bindBtn('btn-jump', 'btn-jump');

document.getElementById('btn-start').addEventListener('click', () => resetGame(true));
document.getElementById('btn-retry').addEventListener('click', () => resetGame(false));
document.getElementById('btn-menu').addEventListener('click', () => {
    document.getElementById('screen-win').classList.add('hidden');
    document.getElementById('screen-title').classList.remove('hidden');
    gameState = 'TITLE';
});

document.getElementById('btn-leaderboard').addEventListener('click', () => {
    document.getElementById('screen-title').classList.add('hidden');
    document.getElementById('screen-leaderboard').classList.remove('hidden');
});
document.getElementById('btn-leaderboard-close').addEventListener('click', () => {
    document.getElementById('screen-leaderboard').classList.add('hidden');
    document.getElementById('screen-title').classList.remove('hidden');
});

document.getElementById('btn-bgm').addEventListener('click', () => {
    bgmEnabled = !bgmEnabled;
    if (bgmEnabled) {
        document.getElementById('btn-bgm').innerText = '🔊 BGM';
        if (gameState === 'PLAYING') bgm.play();
    } else {
        document.getElementById('btn-bgm').innerText = '🔇 Mute';
        bgm.pause();
    }
});

levelMap = JSON.parse(JSON.stringify(levels[0]));
requestAnimationFrame(gameLoop);
