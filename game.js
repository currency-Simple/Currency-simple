// Speedball 3D Game - ملف شامل للعبة
class SpeedballGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.ball = null;
        this.path = null;
        this.obstacles = [];
        this.stars = [];
        this.score = 0;
        this.gameTime = 0;
        this.gameSpeed = 0.1;
        this.isGameRunning = false;
        this.playerData = null;
        
        this.init();
    }

    init() {
        this.initThreeJS();
        this.createPath();
        this.createBall();
        this.createObstacles();
        this.createStars();
        this.setupControls();
        this.animate();
        this.showGameScreen();
    }

    initThreeJS() {
        // إنشاء المشهد
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f0f23);
        
        // إنشاء الكاميرا
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        
        // إنشاء المُصيِّر
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight - 130);
        this.renderer.shadowMap.enabled = true;
        
        // الإضاءة
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    createPath() {
        // إنشاء طريق متعرج كما في الصور
        const pathGeometry = new THREE.BufferGeometry();
        const pathMaterial = new THREE.MeshPhongMaterial({
            color: 0x4CAF50,
            shininess: 100
        });
        
        // نقاط الطريق المتعرج
        const points = [];
        for (let i = 0; i < 100; i++) {
            const x = Math.sin(i * 0.3) * 3;
            const y = 0;
            const z = -i * 2;
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.8, 8, false);
        
        this.path = new THREE.Mesh(tubeGeometry, pathMaterial);
        this.path.receiveShadow = true;
        this.scene.add(this.path);
    }

    createBall() {
        // إنشاء الكرة كما في الصور
        const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
        const ballMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF5722,
            shininess: 100
        });
        
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.set(0, 0.5, 0);
        this.ball.castShadow = true;
        this.scene.add(this.ball);
    }

    createObstacles() {
        // إنشاء مثلثات (عقبات) كما في الصور
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.ConeGeometry(0.3, 0.6, 3);
            const material = new THREE.MeshPhongMaterial({ color: 0xF44336 });
            const obstacle = new THREE.Mesh(geometry, material);
            
            const x = Math.sin(i * 1.5) * 2;
            const z = -i * 10 - 5;
            obstacle.position.set(x, 0.3, z);
            obstacle.castShadow = true;
            
            this.obstacles.push(obstacle);
            this.scene.add(obstacle);
        }
    }

    createStars() {
        // إنشاء نجوم للنقاط
        for (let i = 0; i < 30; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 16, 16);
            const material = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
            const star = new THREE.Mesh(geometry, material);
            
            const x = Math.cos(i * 2) * 2.5;
            const z = -i * 6 - 3;
            star.position.set(x, 0.3, z);
            star.castShadow = true;
            
            this.stars.push(star);
            this.scene.add(star);
        }
    }

    setupControls() {
        // التحكم بالنقر
        document.addEventListener('click', (e) => {
            if (!this.isGameRunning) return;
            
            const direction = e.clientX < window.innerWidth / 2 ? -1 : 1;
            this.moveBall(direction);
        });
        
        // التحكم بالسهمين
        document.addEventListener('keydown', (e) => {
            if (!this.isGameRunning) return;
            
            if (e.key === 'ArrowLeft') this.moveBall(-1);
            if (e.key === 'ArrowRight') this.moveBall(1);
        });
    }

    moveBall(direction) {
        if (!this.ball) return;
        
        const targetX = this.ball.position.x + (direction * 1.5);
        const currentX = this.ball.position.x;
        
        // تحريك سلس للكرة
        const animateMove = () => {
            const diff = targetX - currentX;
            this.ball.position.x += diff * 0.1;
            
            if (Math.abs(diff) > 0.1) {
                requestAnimationFrame(animateMove);
            }
        };
        animateMove();
    }

    checkCollisions() {
        // التحقق من اصطدام بالمثلثات
        this.obstacles.forEach((obstacle, index) => {
            const distance = this.ball.position.distanceTo(obstacle.position);
            if (distance < 0.5) {
                this.gameOver();
            }
        });
        
        // التحقق من جمع النجوم
        this.stars.forEach((star, index) => {
            const distance = this.ball.position.distanceTo(star.position);
            if (distance < 0.4) {
                this.scene.remove(star);
                this.stars.splice(index, 1);
                this.score += 10;
                this.updateScore();
                
                // تأثير جمع نجمة
                const light = new THREE.PointLight(0xFFD700, 2, 2);
                light.position.copy(star.position);
                this.scene.add(light);
                
                setTimeout(() => this.scene.remove(light), 300);
            }
        });
    }

    updateScore() {
        document.getElementById('current-score').textContent = this.score;
    }

    updateTime() {
        if (!this.isGameRunning) return;
        
        this.gameTime += 0.016; // تقريباً 60 FPS
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        document.getElementById('time-display').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    gameOver() {
        this.isGameRunning = false;
        
        // حفظ النتيجة
        if (this.playerData) {
            this.saveScore();
        }
        
        // عرض نتيجة اللعبة
        alert(`انتهت اللعبة! \nالنتيجة: ${this.score} \nالوقت: ${Math.floor(this.gameTime)} ثانية`);
        
        // إعادة تعيين اللعبة
        setTimeout(() => {
            this.score = 0;
            this.gameTime = 0;
            this.updateScore();
            this.resetGame();
        }, 2000);
    }

    async saveScore() {
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user) return;
            
            // حفظ النتيجة في جدول scores
            const { error } = await supabase
                .from('scores')
                .insert({
                    player_id: user.id,
                    score: this.score,
                    time: Math.floor(this.gameTime),
                    level: 1
                });
            
            if (error) throw error;
            
            // تحديث أفضل نتيجة في جدول players
            const { error: updateError } = await supabase
                .from('players')
                .update({ best_score: this.score })
                .eq('id', user.id)
                .gt('best_score', this.score);
                
            console.log('✅ Score saved:', this.score);
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    resetGame() {
        // إعادة تعيين الكرة
        this.ball.position.set(0, 0.5, 0);
        
        // إعادة النجوم
        this.stars.forEach(star => this.scene.remove(star));
        this.stars = [];
        this.createStars();
        
        // إعادة العقبات
        this.obstacles.forEach(obstacle => this.scene.remove(obstacle));
        this.obstacles = [];
        this.createObstacles();
        
        // إعادة العدادات
        this.gameSpeed = 0.1;
    }

    startGame() {
        if (!this.playerData) {
            alert('يجب تسجيل الدخول أولاً!');
            this.showAuthScreen();
            return;
        }
        
        this.isGameRunning = true;
        this.score = 0;
        this.gameTime = 0;
        this.updateScore();
        this.resetGame();
        
        document.getElementById('game-screen').style.display = 'flex';
        document.getElementById('auth-screen').style.display = 'none';
        
        console.log('🎮 Game started for:', this.playerData.username);
    }

    pauseGame() {
        this.isGameRunning = false;
        document.getElementById('pause-modal').style.display = 'flex';
    }

    resumeGame() {
        this.isGameRunning = true;
        document.getElementById('pause-modal').style.display = 'none';
    }

    showGameScreen() {
        document.getElementById('game-screen').style.display = 'flex';
        document.getElementById('auth-screen').style.display = 'none';
    }

    showAuthScreen() {
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isGameRunning && this.ball && this.path) {
            // تحريك الكرة للأمام
            this.ball.position.z -= this.gameSpeed;
            this.gameSpeed += 0.0001; // زيادة السرعة تدريجياً
            
            // تحديث سرعة العرض
            document.getElementById('speed-display').textContent = 
                Math.floor(this.gameSpeed * 100);
            
            // تحريك الكاميرا مع الكرة
            this.camera.position.z = this.ball.position.z + 10;
            
            // التحقق من الاصطدامات
            this.checkCollisions();
            
            // تحديث الوقت
            this.updateTime();
        }
        
        // تدوير الكرة
        if (this.ball) {
            this.ball.rotation.x += 0.02;
            this.ball.rotation.y += 0.03;
        }
        
        // تدوير النجوم
        this.stars.forEach(star => {
            star.rotation.y += 0.05;
        });
        
        // تصيير المشهد
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    setPlayerData(data) {
        this.playerData = data;
        console.log('👤 Player data set:', data);
    }
}

// إنشاء كائن اللعبة العالمي
window.game = new SpeedballGame();
