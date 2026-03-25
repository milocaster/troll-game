const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE = 40;
const GRAVITY = 0.6;
const JUMP = -11.5;
const SPEED = 5;

let frames = 0;
let gameState = 'TITLE'; // TITLE, PLAYING, DEAD, WIN, LEVEL_TRANSITION
let cameraX = 0;
let deaths = 0;
let score = 0;
let currentLevelNum = 0;
let fallingBlocks = [];
let movingSpikes = [];
let poisonMushrooms = [];

const MSG_DEATH = {
    'spike': ["หนามซ่อนอยู่ ไม่เห็นเหรอ!", "หนามตำตูดทีนึง!", "กระโดดยังไงให้ลงหนาม?"],
    'fall': ["ตกหลุมสบายไหม?", "ลาก่อนนนนนนน", "โดดสั้นไปนิดนะ"],
    'ceiling': ["ระวังหัวชน!", "เพดานร่วงใส่ซะงั้น", "หนักไหมจ๊ะ?"],
    'fake_flag': ["ธงนี่มันปลอมเว้ย!", "ดีใจเก้อเลยดิงี้!", "โดนหลอกซ้ำซ้อน ช้ำใจไหม?"],
    'poison': ["เห็ดมีพิษ กินทำไม!", "หน้าตาแบบนั้นยังกล้ากิน?", "มาริโอ้กำหมัดละนะ"],
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
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,2,0,0,0,7,7,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,2,2,2,0,0,2,2,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,1,1,1,1,1,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,1,1,1,1,1,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],



    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,2,0,0,2,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,2,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,4,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,8,8,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,4,10,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,8,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,10,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,9,0,6,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
];

let levelMap = [];

let player = {
    x: 50, y: 300, w: 30, h: 30,
    vx: 0, vy: 0, grounded: false
};

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
    playSound('dead');
    
    let msgs = MSG_DEATH[reason] || MSG_DEATH['default'];
    let msg = msgs[Math.floor(Math.random() * msgs.length)];
    document.getElementById('troll-message').innerText = msg;
    document.getElementById('screen-death').classList.remove('hidden');
}

function win() {
    if(gameState === 'WIN' || gameState === 'LEVEL_TRANSITION') return;
    playSound('win');
    
    if (currentLevelNum < levels.length - 1) {
        gameState = 'LEVEL_TRANSITION';
        document.getElementById('screen-transition').classList.remove('hidden');
        setTimeout(() => {
            currentLevelNum++;
            resetGame(false);
            document.getElementById('screen-transition').classList.add('hidden');
            let st = document.getElementById('stage-text');
            if(st) st.innerText = currentLevelNum + 1;
        }, 3000);
    } else {
        gameState = 'WIN';
        // Give 100 3PLUS coins but don't add to run score
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
    fallingBlocks = [];
    movingSpikes = [];
    poisonMushrooms = [];
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
    
    document.getElementById('screen-title').classList.add('hidden');
    document.getElementById('screen-death').classList.add('hidden');
    document.getElementById('screen-win').classList.add('hidden');
    document.getElementById('screen-transition').classList.add('hidden');
    
    if(audioCtx.state === 'suspended') audioCtx.resume();
    let targetTrack = bgmTracks[currentLevelNum] || bgmTracks[0];
    if (bgm.src && !bgm.src.endsWith(targetTrack.replace(' ', '%20'))) {
        bgm.pause();
        bgm = new Audio(targetTrack);
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
        
        if(t === 7) { collectCoin(r, c); continue; }

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
        if(t === 11 && player.vy < 0 && p.y < player.y + player.h/2) {
            // Hit ? block from below
            player.y = (r+1)*TILE;
            player.vy = 0;
            levelMap[r][c] = 12; // Empty block
            playSound('thump');
            poisonMushrooms.push({ x: c*TILE, y: r*TILE - TILE, vx: -2, vy: -5 });
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

function drawMap() {
    ctx.fillStyle = '#6b8cff';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Sky

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
    let drawX = player.x - cameraX;
    ctx.fillStyle = '#fff';
    ctx.fillRect(drawX, player.y, player.w, player.h); // Body
    
    // Eyes looking direction
    ctx.fillStyle = '#000';
    let eyeOffsetX = player.vx < 0 ? 5 : 20;
    ctx.beginPath();
    ctx.arc(drawX + eyeOffsetX, player.y + 10, 3, 0, Math.PI*2);
    ctx.arc(drawX + eyeOffsetX + 6, player.y + 10, 3, 0, Math.PI*2);
    ctx.fill();

    if(gameState === 'DEAD') {
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(drawX + eyeOffsetX - 2, player.y + 20);
        ctx.lineTo(drawX + eyeOffsetX + 8, player.y + 20);
        ctx.stroke();
    }
}

function gameLoop() {
    if(gameState === 'PLAYING') {
        updatePhysics();
        
        // Camera smooth follow backward scroll block
        let targetCam = player.x - 200;
        if(targetCam > cameraX) cameraX = targetCam;
        if(cameraX < 0) cameraX = 0;
    }
    
    drawMap();
    drawPlayer();

    frames++;
    requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener('keydown', e => { 
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
